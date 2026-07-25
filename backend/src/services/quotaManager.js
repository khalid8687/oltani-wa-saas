import { db } from '../config/firebase.js';

export const PLAN_LIMITS = {
  free: 50,
  pro: 300,
  ultra: 1000
};

export class QuotaManager {
  static getLimitForPlan(plan = 'free') {
    return PLAN_LIMITS[plan.toLowerCase()] || PLAN_LIMITS.free;
  }

  static getTodayString() {
    return new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  }

  static async canSendMessage(userId, plan = 'free') {
    if (!userId || !db) return true; // Fallback if no user tracking or local testing

    const today = this.getTodayString();
    const limit = this.getLimitForPlan(plan);

    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();

      if (!doc.exists) {
        return true; // Default allow for new user initialized
      }

      const data = doc.data();
      const lastResetDate = data.lastResetDate || '';
      let dailyMsgCount = data.dailyMsgCount || 0;

      // Reset count if it's a new day
      if (lastResetDate !== today) {
        dailyMsgCount = 0;
        await userRef.set({ dailyMsgCount: 0, lastResetDate: today }, { merge: true });
      }

      return dailyMsgCount < limit;
    } catch (error) {
      console.error('Error checking quota:', error.message);
      return true; // Allow gracefully on DB error
    }
  }

  static async incrementMessageCount(userId) {
    if (!userId || !db) return;

    const today = this.getTodayString();

    try {
      const userRef = db.collection('users').doc(userId);
      const doc = await userRef.get();

      if (doc.exists) {
        const data = doc.data();
        const lastResetDate = data.lastResetDate || '';
        let dailyMsgCount = data.dailyMsgCount || 0;

        if (lastResetDate !== today) {
          dailyMsgCount = 1;
        } else {
          dailyMsgCount += 1;
        }

        await userRef.set({ dailyMsgCount, lastResetDate: today }, { merge: true });
      }
    } catch (error) {
      console.error('Error incrementing message count:', error.message);
    }
  }
}
