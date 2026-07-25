import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuNGDdUTf-RokZYXPBgIWHHlJ0a-ez_Lw",
  authDomain: "wazup-5f7a6.firebaseapp.com",
  projectId: "wazup-5f7a6",
  storageBucket: "wazup-5f7a6.firebasestorage.app",
  messagingSenderId: "331207275494",
  appId: "1:331207275494:web:58188137b07797ddaf1c27",
  measurementId: "G-CJ3HVD4FC2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export { signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc };
