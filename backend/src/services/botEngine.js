import { gemini } from '../config/gemini.js';
import { logger } from '../utils/logger.js';

const DEFAULT_FALLBACK = 'أهلاً بك! تم استلام رسالتك وسنعاود التواصل في أقرب وقت.';

/**
 * BotEngine — converts incoming WhatsApp messages into bot replies.
 * 3 modes: `fixed` | `qa` | `ai`.
 */
export const BotEngine = {
  async process(instance, incoming) {
    if (typeof incoming !== 'string' || !incoming.trim()) return null;
    const mode = (instance.mode || 'fixed').toLowerCase();

    if (mode === 'fixed') return this.fixed(instance);
    if (mode === 'qa')    return await this.qa(instance, incoming);
    if (mode === 'ai' || mode === 'smart') return await this.ai(instance, incoming);
    return this.fixed(instance);
  },

  fixed(instance) {
    return instance.fixedMessage?.trim() || DEFAULT_FALLBACK;
  },

  async qa(instance, incoming) {
    const pairs = Array.isArray(instance.qaPairs) ? instance.qaPairs.filter(p => p.question && p.answer) : [];
    if (pairs.length === 0) {
      return instance.fixedMessage?.trim() || DEFAULT_FALLBACK;
    }

    const list = pairs
      .map((p, i) => `[${i}] سؤال: "${p.question}" ← إجابة: "${p.answer}"`)
      .join('\n');

    const system = `أنت مطابق أسئلة ذكي.
قائمة الأسئلة والإجابات لدينا:
${list}

المهمة:
1. حلل سؤال العميل.
2. اختر أقرب إجابة من القائمة عند التشابه في المعنى.
3. أعد نص الإجابة فقط بدون أي شرح أو مقدمات.
4. إن لم يوجد أي تشابه، أعد فقط: NO_MATCH`;

    try {
      const reply = await gemini.generate(system, incoming, { temperature: 0.2, maxTokens: 512 });
      const clean = (reply || '').trim();
      return clean === 'NO_MATCH' ? (instance.fixedMessage?.trim() || DEFAULT_FALLBACK) : clean;
    } catch (err) {
      logger.error({ msg: err.message }, 'QA mode failed.');
      return instance.fixedMessage?.trim() || DEFAULT_FALLBACK;
    }
  },

  async ai(instance, incoming) {
    const persona = instance.persona?.trim()
      || 'ممثل خدمة عملاء محترف، مؤدب ومتعاون، يتحدث العربية بسلاسة.';
    const instructions = instance.instructions?.trim()
      || 'شركة تقدم أفضل الحلول والخدمات الرقمية.';
    const services = instance.services?.trim()
      || 'استشارات وحلول متكاملة.';
    const route = (instance.routePhone || '').trim();

    const system = `أنت بوت خدمة عملاء ذكي للرد عبر واتساب.

[1] الشخصية:
${persona}

[2] تعليمات الشركة:
${instructions}

[3] الخدمات والأسعار:
${services}
${route ? `\n[4] عند طلب الشراء أو التحدث لموظف بشري، وجّه العميل للرقم: ${route}` : ''}

قواعد:
- ردود قصيرة، مفيدة، تناسب الواتساب.
- لا تختلق معلومات خارج ما سبق.
- ردّ بلهجة العميل (عربي/إنجليزي).`;

    try {
      return await gemini.generate(system, incoming, { temperature: 0.7, maxTokens: 1024 });
    } catch (err) {
      logger.error({ msg: err.message }, 'AI mode failed.');
      return 'عذراً، تعذّر توليد الرد الآن. حاول مرة أخرى بعد قليل.';
    }
  }
};

export default BotEngine;
