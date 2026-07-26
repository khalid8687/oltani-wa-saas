import { Router } from 'express';
import { getDb, getAuth } from '../config/firebase.js';
import { gemini } from '../config/gemini.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { PLAN_LIMITS, TRIAL_DAYS } from '../config/env.js';

const router = Router();
router.use(requireAuth, requireAdmin);

/** GET /admin/users */
router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, users: [] });
    const snap = await db.collection('users').orderBy('createdAt', 'desc').get();
    const users = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** POST /admin/users/update  — set plan/role/blocked + sync claims */
router.post('/users/update', async (req, res) => {
  try {
    const db = getDb();
    const auth = getAuth();
    const { uid, plan, role, isBlocked } = req.body || {};
    if (!uid) return res.status(400).json({ success: false, error: 'uid required.' });

    const patch = { updatedAt: new Date().toISOString() };
    if (plan && PLAN_LIMITS[plan]) patch.plan = plan;
    if (role === 'admin' || role === 'user') patch.role = role;
    if (typeof isBlocked === 'boolean') patch.isBlocked = isBlocked;

    await db.collection('users').doc(uid).set(patch, { merge: true });

    const final = await db.collection('users').doc(uid).get();
    const data = final.data();
    try {
      await auth.setCustomUserClaims(uid, { role: data.role || 'user', plan: data.plan || 'free' });
    } catch (_) {}

    return res.json({ success: true, user: { uid, ...data } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** DELETE /admin/users/:uid — block + disable Firebase Auth (revokes active tokens). */
router.delete('/users/:uid', async (req, res) => {
  try {
    const db = getDb();
    const auth = getAuth();
    const { uid } = req.params;
    await db.collection('users').doc(uid).set(
      { isBlocked: true, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    try {
      await auth.updateUser(uid, { disabled: true });
      await auth.revokeRefreshTokens(uid);
    } catch (e) { /* user may not exist in Auth yet */ }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /admin/gemini/stats */
router.get('/gemini/stats', (req, res) => {
  res.json({ success: true, stats: gemini.getStats() });
});

/** POST /admin/gemini/config — live-update keys + model, persist to Firestore */
router.post('/gemini/config', async (req, res) => {
  try {
    const { keys, modelName } = req.body || {};
    if (Array.isArray(keys)) gemini.setKeys(keys);
    if (modelName) gemini.setModel(modelName);
    await gemini.persist();
    return res.json({ success: true, stats: gemini.getStats() });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /admin/garden — list admin-garden instances */
router.get('/garden', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, instances: [] });
    const snap = await db.collection('instances').where('isAdminGarden', '==', true).get();
    const instances = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json({ success: true, instances });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /admin/stats — overview metrics */
router.get('/stats', async (req, res) => {
  try {
    const db = getDb();
    if (!db) return res.json({ success: true, stats: {} });
    const [usersSnap, instSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('instances').where('isAdminGarden', '==', false).get()
    ]);
    const planCounts = { free: 0, pro: 0, ultra: 0 };
    usersSnap.forEach(d => {
      const p = d.data().plan || 'free';
      planCounts[p] = (planCounts[p] || 0) + 1;
    });
    return res.json({
      success: true,
      stats: {
        totalUsers: usersSnap.size,
        totalInstances: instSnap.size,
        planCounts,
        gemini: gemini.getStats()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export { TRIAL_DAYS };
export default router;
