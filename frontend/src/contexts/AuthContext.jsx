import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth, googleProvider, db,
  signInWithPopup, signOut, onAuthStateChanged,
  doc, getDoc, setDoc
} from '../services/firebase.js';
import { authApi } from '../services/api.js';
import { logger } from '../lib/logger.js';

const SUPER_ADMIN_EMAIL = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'khalidkhattab8687@gmail.com').toLowerCase();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = useCallback(async (firebaseUser) => {
    try {
      // Backend /auth/sync ensures user doc + claims and returns the canonical profile.
      const res = await authApi.sync();
      if (res?.success && res.user) {
        return res.user;
      }
    } catch (err) {
      logger.warn('Auth sync failed, falling back to local doc:', err.message);
    }

    // Fallback: read Firestore directly
    try {
      const ref = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(ref);
      const isSuper = String(firebaseUser.email || '').toLowerCase() === SUPER_ADMIN_EMAIL;
      const data = snap.exists() ? snap.data() : {};
      const profile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || data.displayName || '',
        photoURL: firebaseUser.photoURL || data.photoURL || '',
        plan: data.plan || 'free',
        role: data.role || (isSuper ? 'admin' : 'user'),
        dailyMsgCount: data.dailyMsgCount || 0,
        lastResetDate: data.lastResetDate,
        trialStartedAt: data.trialStartedAt,
        isBlocked: data.isBlocked || false
      };
      if (!snap.exists()) {
        await setDoc(ref, {
          ...profile,
          trialStartedAt: profile.trialStartedAt || new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
      return profile;
    } catch (err) {
      logger.warn('Local profile fallback failed:', err.message);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        plan: 'free',
        role: String(firebaseUser.email || '').toLowerCase() === SUPER_ADMIN_EMAIL ? 'admin' : 'user'
      };
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await syncProfile(fbUser);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [syncProfile]);

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true); // suppress LoginGate flash during sync
      const res = await signInWithPopup(auth, googleProvider);
      // syncProfile will run via onAuthStateChanged; ensure loading stays true until then
      await syncProfile(res.user);
      return res.user;
    } catch (err) {
      setLoading(false);
      logger.error('Google sign-in failed:', err.message);
      throw err;
    }
  }, [syncProfile]);

  const logout = useCallback(async () => {
    try { await signOut(auth); } catch (err) { console.warn('[logout]', err.message); }
    setUser(null);
  }, []);

  const isAdmin = !!(user && (user.role === 'admin' || String(user.email).toLowerCase() === SUPER_ADMIN_EMAIL));

  const value = { user, setUser, loading, loginWithGoogle, logout, isAdmin };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export { SUPER_ADMIN_EMAIL };
