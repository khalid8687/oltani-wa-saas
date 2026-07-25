import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let db;
let auth;

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT.startsWith('{')) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
      serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT, 'utf8'));
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized with Service Account.');
  } else {
    // Initialize default application credentials or fallback
    admin.initializeApp();
    console.log('Firebase Admin initialized with default credentials.');
  }

  db = admin.firestore();
  auth = admin.auth();
} catch (error) {
  console.warn('Firebase initialization notice:', error.message);
  // Fallback in-memory / local mock adapter if Firebase Admin is not yet configured with credentials
  console.log('Using Firestore fallback mode for local testing.');
}

export { admin, db, auth };
