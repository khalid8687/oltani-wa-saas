import { Router } from 'express';
import RateLimit from 'express-rate-limit';
import { getAuth } from '../config/firebase.js';
import { getDb } from '../config/firebase.js';
import { TRIAL_DAYS, env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const loginLimiter = RateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests.' }
});

/**
 * POST /auth/sync
 * Called right after Firebase login on the client.
 * Ensures the user doc + claims exist. Also seeds super-admin role.
 */
router.post('/sync', loginLimiter, requireAuth, async (req, res) => {
  const db = getDb();
  const auth = getAuth();
  const { uid, email } = req.user;

  try {
    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    const existing = snap.exists ? snap.data() : {};

    // Seed super-admin on first login
    let role = existing.role || req.user.role || 'user';
    const isSuper = String(email).toLowerCase() === env.superAdminEmail;
    if (isSuper) role = 'admin';

    const data = {
      uid,
      email: email || existing.email || '',
      displayName: req.user.name || existing.displayName || '',
      photoURL: req.user.picture || existing.photoURL || '',
      plan: existing.plan || 'free',
      role,
      dailyMsgCount: existing.dailyMsgCount || 0,
      lastResetDate: existing.lastResetDate || new Date().toISOString().slice(0, 10),
      trialStartedAt: existing.trialStartedAt || new Date().toISOString(),
      isBlocked: existing.isBlocked || false,
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await ref.set(data, { merge: true });

    // Sync custom claims so middleware can read plan/role from the token directly
    await auth.setCustomUserClaims(uid, { role: data.role, plan: data.plan });

    const trialDaysLeft = Math.max(
      0,
      TRIAL_DAYS - Math.floor((Date.now() - new Date(data.trialStartedAt).getTime()) / 86_400_000)
    );

    return res.json({
      success: true,
      user: {
        uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        plan: data.plan,
        role: data.role,
        dailyMsgCount: data.dailyMsgCount,
        lastResetDate: data.lastResetDate,
        trialStartedAt: data.trialStartedAt,
        trialDaysLeft,
        isBlocked: data.isBlocked
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
