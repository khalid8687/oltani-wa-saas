import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { BotEngine } from './botEngine.js';
import { QuotaManager } from './quotaManager.js';
import { db } from '../config/firebase.js';

const SESSIONS_DIR = path.resolve('./sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

class BaileysSessionManager {
  constructor() {
    this.sessions = new Map(); // instanceId -> { socket, status, qrCode, ioSocket }
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async startInstance(instanceId, instanceConfig = {}) {
    if (this.sessions.has(instanceId)) {
      const existing = this.sessions.get(instanceId);
      if (existing.status === 'connected') {
        console.log(`Instance ${instanceId} is already connected.`);
        return { status: 'connected' };
      }
    }

    const sessionPath = path.join(SESSIONS_DIR, instanceId);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const logger = pino({ level: 'silent' });

    const socket = makeWASocket({
      version,
      logger,
      auth: state,
      printQRInTerminal: false
    });

    const sessionObj = {
      socket,
      status: 'connecting',
      qrCode: null,
      config: instanceConfig
    };

    this.sessions.set(instanceId, sessionObj);

    // 1. Connection Update Listener
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr);
          sessionObj.qrCode = qrDataUrl;
          sessionObj.status = 'qr_ready';

          // Broadcast QR code update via Socket.io
          if (this.io) {
            this.io.to(instanceId).emit('qr_code', { instanceId, qr: qrDataUrl });
            this.io.to(instanceId).emit('status_change', { instanceId, status: 'qr_ready' });
          }

          this.updateInstanceDoc(instanceId, { status: 'qr_ready', qrCode: qrDataUrl });
        } catch (err) {
          console.error(`Error generating QR for ${instanceId}:`, err.message);
        }
      }

      if (connection === 'open') {
        console.log(`✅ WhatsApp Connected for Instance: ${instanceId}`);
        sessionObj.status = 'connected';
        sessionObj.qrCode = null;
        const phone = socket.user?.id ? socket.user.id.split(':')[0] : '';

        if (this.io) {
          this.io.to(instanceId).emit('status_change', { instanceId, status: 'connected', phone });
        }

        this.updateInstanceDoc(instanceId, { status: 'connected', phone, qrCode: null });
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(`Disconnected ${instanceId}. Reason code: ${reason}`);

        sessionObj.status = 'disconnected';

        if (reason === DisconnectReason.loggedOut) {
          console.log(`Instance ${instanceId} logged out by user. Cleaning session files...`);
          this.deleteSessionFiles(instanceId);
          this.sessions.delete(instanceId);
          this.updateInstanceDoc(instanceId, { status: 'disconnected', phone: '' });

          if (this.io) {
            this.io.to(instanceId).emit('status_change', { instanceId, status: 'logged_out' });
          }
        } else {
          // Attempt automatic reconnect
          console.log(`Attempting reconnect for instance ${instanceId}...`);
          setTimeout(() => this.startInstance(instanceId, instanceConfig), 3000);
        }
      }
    });

    // 2. Credentials Save Listener
    socket.ev.on('creds.update', saveCreds);

    // 3. Incoming Messages Listener
    socket.ev.on('messages.upsert', async (m) => {
      try {
        if (m.type !== 'notify') return;

        for (const msg of m.messages) {
          // Ignore status broadcasts, self messages, or group chats if needed
          if (msg.key.fromMe) continue;

          const remoteJid = msg.key.remoteJid;
          if (remoteJid.endsWith('@g.us')) continue; // Skip group messages for SaaS bots

          const textMessage =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption;

          if (!textMessage) continue;

          console.log(`📩 Incoming message on [${instanceId}] from ${remoteJid}: "${textMessage}"`);

          // Fetch latest instance configuration from DB or memory
          const config = await this.getInstanceConfig(instanceId);
          const userId = config.userId;
          const userPlan = config.userPlan || 'free';

          // Check message quotas
          const canSend = await QuotaManager.canSendMessage(userId, userPlan);
          if (!canSend) {
            console.warn(`⚠️ Daily quota exceeded for user ${userId} on plan ${userPlan}`);
            await socket.sendMessage(remoteJid, {
              text: '⚠️ تم الوصول للحد الأقصى للرسائل اليومية المتاحة لخطة اشتراكك. يمكنك ترقية حسابك للحصول على رسائل أكثر.'
            });
            continue;
          }

          // Process bot response
          const botReply = await BotEngine.processMessage(config, textMessage);

          if (botReply) {
            await socket.sendMessage(remoteJid, { text: botReply });
            await QuotaManager.incrementMessageCount(userId);
            console.log(`📤 Bot Replied on [${instanceId}]: "${botReply.substring(0, 50)}..."`);
          }
        }
      } catch (err) {
        console.error(`Error processing message on instance ${instanceId}:`, err.message);
      }
    });

    return sessionObj;
  }

  async stopInstance(instanceId) {
    if (this.sessions.has(instanceId)) {
      const session = this.sessions.get(instanceId);
      try {
        await session.socket.logout();
      } catch (e) {
        try {
          session.socket.end(new Error('Manual stop'));
        } catch (_) {}
      }
      this.deleteSessionFiles(instanceId);
      this.sessions.delete(instanceId);
      this.updateInstanceDoc(instanceId, { status: 'disconnected', phone: '' });
      return true;
    }
    return false;
  }

  deleteSessionFiles(instanceId) {
    const sessionPath = path.join(SESSIONS_DIR, instanceId);
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }
  }

  getStatus(instanceId) {
    if (this.sessions.has(instanceId)) {
      const session = this.sessions.get(instanceId);
      return {
        status: session.status,
        qrCode: session.qrCode
      };
    }
    return { status: 'disconnected', qrCode: null };
  }

  async getInstanceConfig(instanceId) {
    if (this.sessions.has(instanceId) && this.sessions.get(instanceId).config?.userId) {
      return this.sessions.get(instanceId).config;
    }
    if (db) {
      try {
        const doc = await db.collection('instances').doc(instanceId).get();
        if (doc.exists) {
          const instData = doc.data();
          // Fetch user plan
          if (instData.userId) {
            const userDoc = await db.collection('users').doc(instData.userId).get();
            if (userDoc.exists) {
              instData.userPlan = userDoc.data().plan || 'free';
            }
          }
          return instData;
        }
      } catch (e) {
        console.error('Error reading instance config from Firestore:', e.message);
      }
    }
    return {};
  }

  async updateInstanceDoc(instanceId, updates) {
    if (db) {
      try {
        await db.collection('instances').doc(instanceId).set(updates, { merge: true });
      } catch (e) {
        console.error('Error updating instance document:', e.message);
      }
    }
  }
}

export const baileysManager = new BaileysSessionManager();
