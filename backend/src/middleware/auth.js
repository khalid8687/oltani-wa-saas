import { getAuth, getDb } from '../config/firebase.js';
import { logger } from '../utils/logger.js';

/**
 * Auth middleware.
 * Expects:  Authorization: Bearer <Firebase ID Token>
 * Decodes the token, then loads (or lazily creates) the user doc.
 * Attaches `req.user = { uid, email, ...claims, ...dbData }`.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Missing auth token.' });
    }

    const auth = getAuth();
    if (!auth) {
      return res.status(500).json({ success: false, error: 'Auth service unavailable.' });
    }

    const decoded = await auth.verifyIdToken(token);

    const db = getDb();
    let dbData = {};
    if (db) {
      const ref = db.collection('users').doc(decoded.uid);
      const snap = await ref.get();
      if (snap.exists) {
        dbData = snap.data() || {};
      } else {
        // First-time login: create a stub user doc.
        dbData = {
          uid: decoded.uid,
          email: decoded.email || '',
          displayName: decoded.name || '',
          photoURL: decoded.picture || '',
          plan: (decoded.plan) || 'free',
          role: (decoded.role) || 'user',
          dailyMsgCount: 0,
          lastResetDate: new Date().toISOString().slice(0, 10),
          trialStartedAt: new Date().toISOString(),
          isBlocked: false,
          createdAt: new Date().toISOString()
        };
        await ref.set(dbData);
      }
    }

    if (dbData.isBlocked) {
      return res.status(403).json({ success: false, error: 'Account blocked.' });
    }

    req.user = {
      uid: decoded.uid,
      email: dbData.email || decoded.email || '',
      name: dbData.displayName || decoded.name || '',
      picture: dbData.photoURL || decoded.picture || '',
      // Prefer Firestore (fresh) over Custom Claims (may lag up to 1h after admin change).
      plan: dbData.plan || decoded.plan || 'free',
      role: dbData.role || decoded.role || 'user',
      dailyMsgCount: dbData.dailyMsgCount || 0,
      lastResetDate: dbData.lastResetDate || '',
      trialStartedAt: dbData.trialStartedAt || ''
    };

    next();
  } catch (err) {
    logger.warn({ msg: err.message }, 'Auth rejected.');
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

/** Requires `role === 'admin'` in Custom Claims or user doc. */
export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, error: 'Admin privileges required.' });
}
