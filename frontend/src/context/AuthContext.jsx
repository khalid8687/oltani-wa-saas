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
            // Create user record in Firestore for new user
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

        const authenticatedProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'مستخدم أولتاني',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          plan: userPlan,
          role: userRole
        };

        setUser(authenticatedProfile);
        localStorage.setItem('oltani_user', JSON.stringify(authenticatedProfile));
      } else {
        // No authenticated user present -> Guest mode (null)
        setUser(null);
        localStorage.removeItem('oltani_user');
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
      // Fallback popup if browser blocks Firebase domain popup
      alert('تعذر فتح نافذة Google Auth. يرجى التأكد من السماح بالـ Popups في متصفحك.');
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (_) {}
    setUser(null);
    localStorage.removeItem('oltani_user');
  };

  // Strictly check if user is authenticated AND has admin role/email
  const isAdmin = user ? (user.email === SUPER_ADMIN_EMAIL || user.role === 'admin') : false;

  return (
    <AuthContext.Provider value={{ user, setUser, loginWithGoogle, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
