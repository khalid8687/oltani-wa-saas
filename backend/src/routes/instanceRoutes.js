import express from 'express';
import { baileysManager } from '../services/baileysManager.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// GET all instances for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!db) {
      return res.json({ success: true, instances: [] });
    }

    const snapshot = await db.collection('instances').where('userId', '==', userId).get();
    const instances = [];
    snapshot.forEach(doc => {
      instances.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, instances });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single instance status and info
router.get('/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const sessionInfo = baileysManager.getStatus(instanceId);

    let dbData = {};
    if (db) {
      const doc = await db.collection('instances').doc(instanceId).get();
      if (doc.exists) {
        dbData = doc.data();
      }
    }

    res.json({
      success: true,
      instance: {
        id: instanceId,
        ...dbData,
        status: sessionInfo.status || dbData.status || 'disconnected',
        qrCode: sessionInfo.qrCode || dbData.qrCode || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Create or Update Instance
router.post('/save', async (req, res) => {
  try {
    const {
      id,
      userId,
      name,
      mode,
      fixedMessage,
      qaPairs,
      persona,
      instructions,
      services,
      routePhone,
      isAdminGarden
    } = req.body;

    const instanceId = id || 'inst_' + Date.now();

    const instanceData = {
      id: instanceId,
      userId: userId || 'anonymous',
      name: name || 'WhatsApp Agent',
      mode: mode || 'fixed',
      fixedMessage: fixedMessage || '',
      qaPairs: qaPairs || [],
      persona: persona || '',
      instructions: instructions || '',
      services: services || '',
      routePhone: routePhone || '',
      isAdminGarden: !!isAdminGarden,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      await db.collection('instances').doc(instanceId).set(instanceData, { merge: true });
    }

    res.json({ success: true, instanceId, instance: instanceData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Start Baileys Session & Generate QR
router.post('/:instanceId/start', async (req, res) => {
  try {
    const { instanceId } = req.params;
    let instanceConfig = req.body || {};

    if (db) {
      const doc = await db.collection('instances').doc(instanceId).get();
      if (doc.exists) {
        instanceConfig = { ...doc.data(), ...instanceConfig };
      }
    }

    const session = await baileysManager.startInstance(instanceId, instanceConfig);
    res.json({ success: true, status: session.status, qrCode: session.qrCode });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST Disconnect / Logout Instance
router.post('/:instanceId/stop', async (req, res) => {
  try {
    const { instanceId } = req.params;
    await baileysManager.stopInstance(instanceId);
    res.json({ success: true, message: 'Instance disconnected successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE Instance
router.delete('/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params;
    await baileysManager.stopInstance(instanceId);

    if (db) {
      await db.collection('instances').doc(instanceId).delete();
    }

    res.json({ success: true, message: 'Instance deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
