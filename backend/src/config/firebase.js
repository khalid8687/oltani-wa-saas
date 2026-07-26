import admin from 'firebase-admin';
import fs from 'fs';
import { env } from './env.js';

let app = null;
let dbRef = null;
let authRef = null;
let initialized = false;
let initError = null;

function resolveServiceAccount() {
  const raw = env.firebaseServiceAccount;
  if (!raw) return null;
  if (raw.trim().startsWith('{')) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('❌ FIREBASE_SERVICE_ACCOUNT is not valid JSON:', e.message);
      return null;
    }
  }
  if (fs.existsSync(raw)) {
    try {
      return JSON.parse(fs.readFileSync(raw, 'utf8'));
    } catch (e) {
      console.error(`❌ Cannot read service account file ${raw}:`, e.message);
      return null;
    }
  }
  return null;
}

export function initFirebase() {
  if (initialized) return app;
  initialized = true;

  try {
    const serviceAccount = resolveServiceAccount();
    if (serviceAccount) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('✅ Firebase Admin initialized from service account.');
    } else if (admin.apps.length) {
      app = admin.app();
    } else {
      app = admin.initializeApp({ projectId: 'wazup-5f7a6' });
      console.warn('⚠️  Firebase Admin initialized WITHOUT credentials — Firestore writes will fail.');
    }
    dbRef = admin.firestore();
    authRef = admin.auth();
  } catch (err) {
    initError = err;
    console.error('❌ Firebase init failed:', err.message);
  }
  return app;
}

export function getDb() {
  if (!initialized) initFirebase();
  return dbRef;
}

export function getAuth() {
  if (!initialized) initFirebase();
  return authRef;
}

export function getFirebaseInitError() {
  return initError;
}

initFirebase();
