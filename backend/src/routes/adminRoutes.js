import express from 'express';
import { geminiBalancer } from '../config/gemini.js';
import { db } from '../config/firebase.js';

const router = express.Router();

const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'khattab8687@gmail.com';

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  const adminEmail = req.headers['x-admin-email'];
  if (adminEmail === SUPER_ADMIN_EMAIL) {
    return next();
  }

  if (db && adminEmail) {
    const snapshot = await db.collection('users').where('email', '==', adminEmail).get();
    if (!snapshot.empty) {
      const user = snapshot.docs[0].data();
      if (user.role === 'admin') {
        return next();
      }
    }
  }

  return res.status(403).json({ success: false, error: 'Unauthorized: Admin privileges required.' });
};

router.use(verifyAdmin);

// 1. User Management: Get all users
router.get('/users', async (req, res) => {
  try {
    if (!db) return res.json({ success: true, users: [] });

    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({ uid: doc.id, ...doc.data() });
    });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. User Management: Update Plan / Role / Status
router.post('/users/update', async (req, res) => {
  try {
    const { uid, plan, role, isBlocked } = req.body;
    if (!uid) return res.status(400).json({ success: false, error: 'User UID required' });

    if (db) {
      await db.collection('users').doc(uid).set(
        {
          plan: plan || 'free',
          role: role || 'user',
          isBlocked: !!isBlocked,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }

    res.json({ success: true, message: 'User settings updated.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Gemini Load Balancer & Key Usage Stats
router.get('/gemini/stats', (req, res) => {
  try {
    const stats = geminiBalancer.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Update Gemini API Keys & Model Config
router.post('/gemini/config', async (req, res) => {
  try {
    const { keys, modelName } = req.body;

    if (keys && Array.isArray(keys)) {
      geminiBalancer.updateKeys(keys);
    }
    if (modelName) {
      geminiBalancer.setModel(modelName);
    }

    if (db) {
      await db.collection('settings').doc('gemini').set(
        {
          keys: keys || [],
          modelName: modelName || 'gemini-1.5-flash',
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }

    res.json({ success: true, message: 'Gemini Load Balancer updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Admin Garden: List Dedicated Internal Instances
router.get('/admin-garden', async (req, res) => {
  try {
    if (!db) return res.json({ success: true, instances: [] });

    const snapshot = await db.collection('instances').where('isAdminGarden', '==', true).get();
    const instances = [];
    snapshot.forEach(doc => {
      instances.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, instances });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
