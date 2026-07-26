import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDb } from './firebase.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * GeminiLoadBalancer
 * - Round-robins across N API keys.
 * - On failure, marks the key "cooling" and tries the next.
 * - Hot-reloadable: admin can push new keys/model via setKeys/setModel.
 * - Persists config to Firestore `settings/gemini` and hydrates at boot.
 */
class GeminiLoadBalancer {
  constructor() {
    this.keys = [];
    this.cursor = 0;
    this.model = env.geminiModel;
    this.stats = new Map(); // index -> { key, masked, count, errors, coolingUntil }
    this.activeModel = this.model;
  }

  mask(key) {
    if (!key || key.length < 10) return '****';
    return `${key.slice(0, 6)}…${key.slice(-4)}`;
  }

  setKeys(keys) {
    const clean = (keys || []).map((k) => String(k).trim()).filter(Boolean);
    const newStats = new Map();
    clean.forEach((key, idx) => {
      const prev = this.stats.get(this.keys.indexOf(key));
      newStats.set(idx, {
        key,
        masked: this.mask(key),
        count: prev?.count || 0,
        errors: prev?.errors || 0,
        coolingUntil: 0
      });
    });
    this.keys = clean;
    this.stats = newStats;
    if (this.cursor >= clean.length) this.cursor = 0;
    logger.info(`🔑 Gemini pool updated: ${clean.length} key(s) loaded.`);
  }

  setModel(model) {
    if (model && model !== this.model) {
      this.model = model;
      this.activeModel = model;
      logger.info(`🧠 Gemini model set to ${model}`);
    }
  }

  nextIndex() {
    if (this.keys.length === 0) return -1;
    const now = Date.now();
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.cursor + i) % this.keys.length;
      const s = this.stats.get(idx);
      if (s && s.coolingUntil <= now) {
        this.cursor = (idx + 1) % this.keys.length;
        return idx;
      }
    }
    return -1;
  }

  async generate(systemInstruction, userPrompt, { temperature = 0.7, maxTokens = 1024 } = {}) {
    if (this.keys.length === 0) {
      throw new Error('No Gemini API keys configured.');
    }

    const tried = new Set();
    let lastError = null;

    for (let attempt = 0; attempt < this.keys.length; attempt++) {
      const idx = this.nextIndex();
      if (idx === -1 || tried.has(idx)) break;
      tried.add(idx);

      const entry = this.stats.get(idx);
      const genAI = new GoogleGenerativeAI(entry.key);

      try {
        const model = genAI.getGenerativeModel({
          model: this.activeModel,
          systemInstruction: systemInstruction || undefined,
          generationConfig: { temperature, maxOutputTokens: maxTokens }
        });
        const result = await model.generateContent(userPrompt);
        const text = result.response.text();

        entry.count += 1;
        entry.coolingUntil = 0;
        return text;
      } catch (err) {
        entry.errors += 1;
        lastError = err;
        const msg = String(err.message || '');
        const isQuota = /quota|rate|429|RESOURCE_EXHAUSTED/i.test(msg);
        const isAuth = /API_KEY_INVALID|invalid api key|403/i.test(msg);
        const cooldownMs = isQuota ? 60_000 : isAuth ? 300_000 : 5_000;
        entry.coolingUntil = Date.now() + cooldownMs;
        logger.warn({ idx, masked: entry.masked, msg }, 'Gemini key failed, marking cooling.');
      }
    }

    throw new Error(`All Gemini keys failed. Last error: ${lastError?.message || 'unknown'}`);
  }

  getStats() {
    return {
      totalKeys: this.keys.length,
      activeModel: this.activeModel,
      cursor: this.cursor,
      keys: Array.from(this.stats.entries()).map(([idx, s]) => ({
        index: idx,
        masked: s.masked,
        count: s.count,
        errors: s.errors,
        cooling: s.coolingUntil > Date.now()
      }))
    };
  }

  async persist() {
    const db = getDb();
    if (!db) return;
    try {
      await db.collection('settings').doc('gemini').set({
        keys: this.keys,
        modelName: this.activeModel,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      logger.error({ msg: e.message }, 'Failed to persist Gemini settings.');
    }
  }

  async hydrate() {
    const db = getDb();
    if (!db) return;
    try {
      const snap = await db.collection('settings').doc('gemini').get();
      if (snap.exists) {
        const data = snap.data();
        if (Array.isArray(data.keys) && data.keys.length) {
          this.setKeys(data.keys);
          logger.info(`🔄 Hydrated ${data.keys.length} Gemini keys from Firestore.`);
        }
        if (data.modelName) this.setModel(data.modelName);
      }
    } catch (e) {
      logger.warn({ msg: e.message }, 'Gemini hydrate skipped.');
    }
  }
}

export const gemini = new GeminiLoadBalancer();

// Seed from env at boot (admin can override later; persist() will save updates).
gemini.setKeys(env.geminiKeys);
gemini.hydrate();
