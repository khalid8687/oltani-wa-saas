import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut, onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAuNGDdUTf-RokZYXPBgIWHHlJ0a-ez_Lw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wazup-5f7a6.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wazup-5f7a6',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wazup-5f7a6.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MSG_SENDER_ID || '331207275494',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:331207275494:web:58188137b07797ddaf1c27'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signOut, onAuthStateChanged,
  doc, getDoc, setDoc, getIdToken
};
