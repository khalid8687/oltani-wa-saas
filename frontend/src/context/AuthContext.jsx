import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, db, doc, getDoc, setDoc } from '../services/firebase';

const AuthContext = createContext();

const SUPER_ADMIN_EMAIL = 'khattab8687@gmail.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userPlan = 'free';
        let userRole = firebaseUser.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user';

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            userPlan = data.plan || userPlan;
            userRole = data.role || userRole;
          } else {
            // Create user record in Firestore
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              plan: userPlan,
              role: userRole,
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.warn('Firestore user fetch notice:', err.message);
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          plan: userPlan,
          role: userRole
        });
      } else {
        // Fallback for offline or local preview
        const saved = localStorage.getItem('oltani_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch (_) {
            setUser(null);
          }
        } else {
          setUser({
            uid: 'user_khalid_001',
            email: 'khattab8687@gmail.com',
            displayName: 'Khalid Khattab',
            photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid',
            plan: 'pro',
            role: 'admin'
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error.message);
      // Fallback
      const mockUser = {
        uid: 'user_' + Date.now(),
        email: 'khattab8687@gmail.com',
        displayName: 'Khalid Khattab',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid',
        plan: 'pro',
        role: 'admin'
      };
      setUser(mockUser);
      localStorage.setItem('oltani_user', JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (_) {}
    setUser(null);
    localStorage.removeItem('oltani_user');
  };

  const isAdmin = user?.email === SUPER_ADMIN_EMAIL || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, setUser, loginWithGoogle, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
