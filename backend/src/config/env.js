import dotenv from 'dotenv';
dotenv.config();

const required = ['FIREBASE_SERVICE_ACCOUNT', 'GEMINI_API_KEYS', 'SUPER_ADMIN_EMAIL'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length && process.env.NODE_ENV !== 'test') {
  console.warn(`⚠️  Missing env vars: ${missing.join(', ')}`);
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientOrigin: process.env.CLIENT_ORIGIN || '*',

  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || '',
  geminiKeys: (process.env.GEMINI_API_KEYS || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean),
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  superAdminEmail: (process.env.SUPER_ADMIN_EMAIL || '').toLowerCase()
};

export const PLAN_LIMITS = {
  free:  { instances: 1,   dailyMessages: 50,   price: 0,  label: 'Free'  },
  pro:   { instances: 3,   dailyMessages: 300,  price: 10, label: 'Pro'   },
  ultra: { instances: Infinity, dailyMessages: 1000, price: 20, label: 'Ultra' }
};

export const TRIAL_DAYS = 7;
