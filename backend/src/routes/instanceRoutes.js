import { Router } from 'express';
import RateLimit from 'express-rate-limit';
import { getDb } from '../config/firebase.js';
import { baileys } from '../services/baileysManager.js';
import { requireAuth } from '../middleware/auth.js';
import { QuotaManager, resolveEffectivePlan, planLimits } from '../services/quotaManager.js';

const router = Router();
router.use(requireAuth);

// Limit instance lifecycle ops (start/stop) to prevent abuse.
const lifecycleLimiter = RateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many lifecycle ops. Slow down.' }
});

/** GET /instances/me  — list the caller's instances */
router.get('/me', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, instances: [] });

    const snap = await db.collection('instances')
      .where('userId', '==', req.user.uid)
      .where('isAdminGarden', '==', false)
      .get();

    const instances = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const storedPlan = req.user.plan || 'free';
    const effective = resolveEffectivePlan(req.user);
    const { used, limit } = await QuotaManager.canCreateInstance(req.user.uid, effective);

    return res.json({
      success: true,
      instances,
      plan: {
        stored: storedPlan,
        effective,
        instancesUsed: used,
        instancesLimit: limit,
        ...planLimits(effective)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** POST /instances/save  — create or update */
router.post('/save', async (req, res) => {
  try {
    const db = getDb();
    const {
      id,
      name,
      mode,
      fixedMessage = '',
      qaPairs = [],
      persona = '',
      instructions = '',
      services = '',
      routePhone = '',
      isAdminGarden = false
    } = req.body || {};

    if (!name || !mode) {
      return res.status(400).json({ success: false, error: 'name and mode are required.' });
    }
    if (typeof name !== 'string' || name.length > 80) {
      return res.status(400).json({ success: false, error: 'Invalid name (max 80 chars).' });
    }
    if (!['fixed', 'qa', 'ai', 'smart'].includes(mode)) {
      return res.status(400).json({ success: false, error: 'Invalid mode.' });
    }
    if (typeof fixedMessage === 'string' && fixedMessage.length > 2000) {
      return res.status(400).json({ success: false, error: 'fixedMessage too long.' });
    }
    if (Array.isArray(qaPairs) && qaPairs.length > 100) {
      return res.status(400).json({ success: false, error: 'Too many QA pairs.' });
    }
    if (['string', 'undefined'].includes(typeof persona) && typeof persona === 'string' && persona.length > 4000) {
      return res.status(400).json({ success: false, error: 'persona too long.' });
    }
    if (typeof instructions === 'string' && instructions.length > 8000) {
      return res.status(400).json({ success: false, error: 'instructions too long.' });
    }
    if (typeof services === 'string' && services.length > 8000) {
      return res.status(400).json({ success: false, error: 'services too long.' });
    }

    const instanceId = id || `inst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    // Only admins can flag instances as admin-garden.
    const allowedGarden = req.user.role === 'admin';
    const finalIsAdminGarden = allowedGarden && !!isAdminGarden;

    let existing = null;
    if (id) {
      const snap = await db.collection('instances').doc(id).get();
      if (snap.exists) existing = snap.data();
    }

    // Ownership check
    if (existing && existing.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not your instance.' });
    }

    // Plan enforcement (only on create, only for non-admin-garden, not for admins override)
    if (!existing && !finalIsAdminGarden) {
      const effectivePlan = resolveEffectivePlan(req.user);
      const check = await QuotaManager.canCreateInstance(req.user.uid, effectivePlan);
      if (!check.allowed) {
        return res.status(402).json({
          success: false,
          error: `Plan limit reached (${check.used}/${check.limit} instances). Upgrade to create more.`,
          code: 'PLAN_LIMIT'
        });
      }
    }

    const payload = {
      id: instanceId,
      userId: existing?.userId || req.user.uid,
      name,
      mode,
      fixedMessage,
      qaPairs,
      persona,
      instructions,
      services,
      routePhone,
      isAdminGarden: finalIsAdminGarden,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };

    await db.collection('instances').doc(instanceId).set(payload, { merge: true });
    return res.json({ success: true, instanceId, instance: payload });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** POST /instances/:id/start  — start Baileys session + emit QR */
router.post('/:id/start', lifecycleLimiter, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const snap = await db.collection('instances').doc(id).get();
    if (!snap.exists) return res.status(404).json({ success: false, error: 'Not found.' });

    const data = snap.data();
    if (data.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not your instance.' });
    }

    const session = await baileys.startInstance(id, data);
    return res.json({ success: true, status: session.status, qrCode: session.qr });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** POST /instances/:id/stop  — disconnect and wipe session */
router.post('/:id/stop', lifecycleLimiter, async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const snap = await db.collection('instances').doc(id).get();
    if (snap.exists) {
      const data = snap.data();
      if (data.userId !== req.user.uid && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Not your instance.' });
      }
    }
    await baileys.stopInstance(id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** DELETE /instances/:id */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const snap = await db.collection('instances').doc(id).get();
    if (!snap.exists) return res.json({ success: true });

    const data = snap.data();
    if (data.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not your instance.' });
    }

    await baileys.stopInstance(id);
    await db.collection('instances').doc(id).delete();
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
