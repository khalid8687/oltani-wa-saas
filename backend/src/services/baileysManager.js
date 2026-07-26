import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { getDb } from '../config/firebase.js';
import { logger } from '../utils/logger.js';
import { BotEngine } from './botEngine.js';
import { QuotaManager, resolveEffectivePlan } from './quotaManager.js';

const SESSIONS_DIR = path.resolve('./sessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const MAX_RECONNECT_BACKOFF_MS = 60_000;

class BaileysManager {
  constructor() {
    this.sessions = new Map(); // instanceId -> session object
    this.io = null;
  }

  setSocketIO(io) { this.io = io; }

  /** Persist instance updates to Firestore and broadcast via socket.io */
  async _patch(instanceId, patch) {
    if (this.io) this.io.to(`inst:${instanceId}`).emit('instance:patch', { instanceId, ...patch });
    const db = getDb();
    if (!db) return;
    try {
      await db.collection('instances').doc(instanceId).set(patch, { merge: true });
    } catch (e) {
      logger.warn({ msg: e.message }, 'Firestore patch failed.');
    }
  }

  async _loadConfig(instanceId) {
    const cached = this.sessions.get(instanceId);
    if (cached?.config?.userId && cached?.config?._hydrated) return cached.config;

    const db = getDb();
    if (!db) return cached?.config || {};
    const snap = await db.collection('instances').doc(instanceId).get();
    if (!snap.exists) return cached?.config || {};
    const data = snap.data();
    if (data.userId) {
      const usnap = await db.collection('users').doc(data.userId).get();
      if (usnap.exists) data.user = usnap.data();
    }
    // Cache hydrated config so subsequent messages don't re-fetch.
    if (cached) {
      cached.config = { ...data, _hydrated: true };
    }
    return data;
  }

  async startInstance(instanceId, config = {}) {
    const existing = this.sessions.get(instanceId);
    if (existing?.status === 'connected') return existing;

    const sessionPath = path.join(SESSIONS_DIR, instanceId);
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      auth: state,
      printQRInTerminal: false,
      browser: ['OLTANI', 'Chrome', '1.0.0'],
      defaultQueryTimeoutMs: 60_000
    });

    const session = {
      socket,
      status: 'connecting',
      qr: null,
      phone: '',
      config,
      reconnectAttempts: 0,
      closed: false
    };
    this.sessions.set(instanceId, session);

    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const dataUrl = await QRCode.toDataURL(qr);
          session.qr = dataUrl;
          session.status = 'qr_ready';
          await this._patch(instanceId, { status: 'qr_ready', qrCode: dataUrl, updatedAt: new Date().toISOString() });
        } catch (e) {
          logger.error({ msg: e.message }, 'QR generation failed.');
        }
      }

      if (connection === 'open') {
        session.status = 'connected';
        session.qr = null;
        session.reconnectAttempts = 0;
        session.phone = socket.user?.id?.split(':')[0] || '';
        await this._patch(instanceId, {
          status: 'connected',
          qrCode: null,
          phone: session.phone,
          updatedAt: new Date().toISOString()
        });
        logger.info({ instanceId, phone: session.phone }, 'WhatsApp connected.');
      }

      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode;
        session.status = 'disconnected';
        if (code === DisconnectReason.loggedOut) {
          await this._destroy(instanceId);
          await this._patch(instanceId, { status: 'logged_out', phone: '', qrCode: null });
        } else if (!session.closed) {
          // Exponential backoff
          const attempts = session.reconnectAttempts + 1;
          session.reconnectAttempts = attempts;
          const delay = Math.min(1000 * 2 ** attempts, MAX_RECONNECT_BACKOFF_MS);
          logger.warn({ instanceId, code, attempts, delay }, 'Reconnecting after close.');
          setTimeout(() => {
            if (!session.closed) this.startInstance(instanceId, session.config);
          }, delay);
        }
      }
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('messages.upsert', async (evt) => {
      if (evt.type !== 'notify') return;
      for (const msg of evt.messages) {
        try {
          if (msg.key?.fromMe) continue;
          const jid = msg.key?.remoteJid || '';
          // Skip group, broadcast, newsletter, status, and announcement jids.
          if (
            jid.endsWith('@g.us') ||
            jid.endsWith('@newsletter') ||
            jid === 'status@broadcast' ||
            jid.endsWith('@broadcast')
          ) continue;

          const text =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            '';
          if (!text) continue;

          const instanceCfg = await this._loadConfig(instanceId);
          const user = instanceCfg.user || {};
          const effectivePlan = resolveEffectivePlan(user);
          const uid = instanceCfg.userId;

          if (uid) {
            const ok = await QuotaManager.canSendMessage(uid, effectivePlan);
            if (!ok.allowed) {
              await socket.sendMessage(jid, {
                text: '⚠️ تم الوصول للحد الأقصى اليومي لرسائل البوت. يمكنك ترقية الباقة لمتابعة المحادثة.'
              });
              continue;
            }
          }

          const reply = await BotEngine.process(instanceCfg, text);
          if (!reply) continue;
          await socket.sendMessage(jid, { text: reply });
          if (uid) await QuotaManager.incrementMessages(uid);

          logger.info({ instanceId, from: jid, q: text.slice(0, 40) }, 'Replied.');
        } catch (e) {
          logger.error({ msg: e.message }, 'Message handling error.');
        }
      }
    });

    return session;
  }

  async _destroy(instanceId) {
    const session = this.sessions.get(instanceId);
    if (session) {
      session.closed = true;
      try { await session.socket.logout(); } catch (_) {}
    }
    const p = path.join(SESSIONS_DIR, instanceId);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
    this.sessions.delete(instanceId);
  }

  async stopInstance(instanceId) {
    await this._destroy(instanceId);
    await this._patch(instanceId, { status: 'disconnected', phone: '', qrCode: null });
  }

  getStatus(instanceId) {
    const s = this.sessions.get(instanceId);
    if (!s) return { status: 'disconnected', qrCode: null };
    return { status: s.status, qrCode: s.qr };
  }
}

export const baileys = new BaileysManager();
export default baileys;
