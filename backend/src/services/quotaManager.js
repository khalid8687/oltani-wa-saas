import { PLAN_LIMITS, TRIAL_DAYS } from '../config/env.js';
import { getDb } from '../config/firebase.js';
import { logger } from '../utils/logger.js';

// Firestore server-side increment helper.
let _FieldValue = null;
async function getFieldValue() {
  if (!_FieldValue) {
    const { firestore } = await import('firebase-admin');
    _FieldValue = firestore.FieldValue;
  }
  return _FieldValue;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(iso) {
  if (!iso) return Infinity;
  const ms = Date.now() - new Date(iso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

/**
 * Resolve the user's *effective* plan, accounting for free trial.
 * If trial active → 'pro'. Otherwise → stored plan.
 */
export function resolveEffectivePlan(user) {
  const base = user?.plan || 'free';
  if (base === 'pro' || base === 'ultra') return base;

  const trialStartedAt = user?.trialStartedAt;
  if (trialStartedAt && daysSince(trialStartedAt) <= TRIAL_DAYS) {
    return 'pro';
  }
  return 'free';
}

export function planLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export const QuotaManager = {
  async ensureDailyReset(userRef, data) {
    const today = todayStr();
    if (data.lastResetDate !== today) {
      const reset = { dailyMsgCount: 0, lastResetDate: today };
      await userRef.set(reset, { merge: true });
      Object.assign(data, reset);
    }
  },

  async canSendMessage(uid, effectivePlan) {
    const db = getDb();
    if (!db || !uid) return { allowed: false, used: 0, limit: 0, reason: 'no_uid' };

    const ref = db.collection('users').doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return { allowed: false, used: 0, limit: 0, reason: 'no_user_doc' };

    const data = snap.data();
    if (data.isBlocked) return { allowed: false, used: 0, limit: 0, reason: 'blocked' };
    await this.ensureDailyReset(ref, data);
    const limit = planLimits(effectivePlan).dailyMessages;
    const used = data.dailyMsgCount || 0;
    return { allowed: used < limit, used, limit };
  },

  async incrementMessages(uid) {
    const db = getDb();
    if (!db) return;
    const ref = db.collection('users').doc(uid);
    try {
      const FV = await getFieldValue();
      await ref.set({
        dailyMsgCount: FV.increment(1),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      logger.warn({ msg: e.message }, 'incrementMessages failed.');
    }
  },

  async countInstances(uid) {
    const db = getDb();
    if (!db) return 0;
    const snap = await db.collection('instances')
      .where('userId', '==', uid)
      .where('isAdminGarden', '==', false)
      .get();
    return snap.size;
  },

  async canCreateInstance(uid, effectivePlan) {
    const count = await this.countInstances(uid);
    const limit = planLimits(effectivePlan).instances;
    return { allowed: count < limit, used: count, limit };
  }
};

export default QuotaManager;
