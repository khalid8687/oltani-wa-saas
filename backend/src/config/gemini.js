import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiLoadBalancer {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.currentModel = process.env.DEFAULT_GEMINI_MODEL || 'gemini-1.5-flash';
    this.usageStats = {};

    this.initKeys();
  }

  initKeys(newKeys = null) {
    if (newKeys && Array.isArray(newKeys) && newKeys.length > 0) {
      this.keys = newKeys.filter(k => k && k.trim().length > 0);
    } else if (process.env.GEMINI_API_KEYS) {
      this.keys = process.env.GEMINI_API_KEYS.split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
    }

    if (this.keys.length === 0) {
      console.warn('⚠️ Warning: No Gemini API keys provided in environment or database.');
    } else {
      console.log(`✅ Loaded ${this.keys.length} Gemini API key(s) into load balancer.`);
    }

    // Initialize stats
    this.keys.forEach((key, idx) => {
      if (!this.usageStats[idx]) {
        this.usageStats[idx] = { keyMasked: this.maskKey(key), count: 0, errors: 0, lastUsed: null };
      }
    });
  }

  maskKey(key) {
    if (!key || key.length < 8) return '****';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  }

  updateKeys(keys) {
    this.initKeys(keys);
  }

  setModel(modelName) {
    if (modelName) {
      this.currentModel = modelName;
      console.log(`🔄 Gemini Model updated to: ${modelName}`);
    }
  }

  getNextKey() {
    if (this.keys.length === 0) {
      throw new Error('No Gemini API keys available in pool.');
    }
    const index = this.currentIndex;
    const key = this.keys[index];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return { key, index };
  }

  async generateResponse(systemInstruction, userPrompt) {
    if (this.keys.length === 0) {
      return '⚠️ (System Error: No Gemini API Key configured in Admin settings)';
    }

    let attempts = 0;
    const maxAttempts = this.keys.length;

    while (attempts < maxAttempts) {
      const { key, index } = this.getNextKey();
      attempts++;

      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({
          model: this.currentModel,
          systemInstruction: systemInstruction || undefined
        });

        const result = await model.generateContent(userPrompt);
        const responseText = result.response.text();

        // Update Stats
        this.usageStats[index].count++;
        this.usageStats[index].lastUsed = new Date().toISOString();

        return responseText;
      } catch (error) {
        console.error(`❌ Gemini API Key Index [${index}] failed:`, error.message);
        if (this.usageStats[index]) {
          this.usageStats[index].errors++;
        }

        // If quota or auth error, continue loop to try next key
        if (attempts >= maxAttempts) {
          throw new Error(`All ${maxAttempts} Gemini API keys failed. Last error: ${error.message}`);
        }
      }
    }
  }

  getStats() {
    return {
      totalKeys: this.keys.length,
      currentModel: this.currentModel,
      currentIndex: this.currentIndex,
      stats: Object.values(this.usageStats)
    };
  }
}

export const geminiBalancer = new GeminiLoadBalancer();
