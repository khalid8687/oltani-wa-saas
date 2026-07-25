import { geminiBalancer } from '../config/gemini.js';

export class BotEngine {
  /**
   * Process incoming text message based on instance configuration
   * @param {Object} instance - Instance details (mode, fixedMessage, qaPairs, persona, instructions, services, routePhone)
   * @param {string} incomingMessage - Text message received from WhatsApp user
   * @returns {Promise<string|null>} Response text to send back (or null if no reply)
   */
  static async processMessage(instance, incomingMessage) {
    if (!incomingMessage || typeof incomingMessage !== 'string') {
      return null;
    }

    const mode = instance.mode || 'fixed';

    switch (mode) {
      case 'fixed':
        return this.handleFixedResponse(instance);

      case 'qa':
        return await this.handleQAResponse(instance, incomingMessage);

      case 'ai':
      case 'smart':
        return await this.handleSmartAIResponse(instance, incomingMessage);

      default:
        return this.handleFixedResponse(instance);
    }
  }

  // 1. Fixed Message Mode
  static handleFixedResponse(instance) {
    return instance.fixedMessage || 'أهلاً بك! تم استلام رسالتك وسنرد عليك في أقرب وقت.';
  }

  // 2. Predefined QA Matching Mode
  static async handleQAResponse(instance, incomingMessage) {
    const qaPairs = instance.qaPairs || [];

    if (qaPairs.length === 0) {
      return instance.fixedMessage || 'أهلاً بك! يسعدنا تواصلك معنا.';
    }

    // Build prompt for Gemini to select the best matching question index
    const qaListFormatted = qaPairs
      .map((item, idx) => `[ID ${idx}] السؤال: "${item.question}" -> الإجابة: "${item.answer}"`)
      .join('\n');

    const systemInstruction = `
أنت مساعد ذكي مهمتك مراجعة أسئلة العميل ومطابقتها بأقرب سؤال من قائمة الأسئلة والأجوبة المسجلة لدينا.
قائمة الأسئلة والأجوبة:
${qaListFormatted}

تعليمات مهمة:
1. قم بتحليل سؤال العميل المعطى.
2. اختر الإجابة المطابقة من القائمة أعلاه إذا كان هناك تشابه في المعنى.
3. قم بإرجاع نص الإجابة فقط بدون أي مقدمات أو شرح إضافي.
4. إذا لم تجد أي سؤال مشابه إطلاقاً في القائمة، اعد فقط العبارة: "NO_MATCH".
`;

    try {
      const response = await geminiBalancer.generateResponse(systemInstruction, incomingMessage);

      if (response && response.trim() !== 'NO_MATCH') {
        return response.trim();
      } else {
        // Fallback to fixed message if no QA match
        return instance.fixedMessage || 'شكراً لتواصلك معنا. سنرد على استفسارك في أقرب وقت.';
      }
    } catch (error) {
      console.error('Error in QA Matching:', error.message);
      return instance.fixedMessage || 'شكراً لتواصلك معنا.';
    }
  }

  // 3. Smart AI Agent Mode
  static async handleSmartAIResponse(instance, incomingMessage) {
    const persona = instance.persona || 'أنت ممثل خدمة عملاء محترف ومؤدب ومتعاون وتتحدث بلغة عربية سلسة.';
    const instructions = instance.instructions || 'شركة تقدم أفضل الخدمات والحلول البرمجية والتسويقية.';
    const services = instance.services || 'الخدمات المتوفرة: استشارات برمجية، حلول واتساب، تصميم موقع.';
    const routePhone = instance.routePhone || '';

    const systemInstruction = `
أنت بوت خدمة عملاء ذكي مخصص للرد على عملاء الشركة عبر الواتساب.

1. شخصيتك وطريقتك (Persona):
${persona}

2. معلومات وتعليمات الشركة (Instructions):
${instructions}

3. السلع والخدمات والأسعار والعروض (Services):
${services}

${routePhone ? `4. في حالة طلب العميل الشراء مباشرة أو طلب التحدث مع موظف مبيعات/دعم بشري:
قم بتزويده بالرقم التالي للتواصل المباشر: ${routePhone}` : ''}

تعليمات التنسيق:
- أجب بطريقة مختصرة، عصرية، ومفيدة ومناسبة لرسائل الواتساب.
- لا تبتدع معلومات غير موجودة في التعليمات والخدمات المذكورة أعلاه.
`;

    try {
      const reply = await geminiBalancer.generateResponse(systemInstruction, incomingMessage);
      return reply;
    } catch (error) {
      console.error('Error in Smart AI Response:', error.message);
      return 'عذراً، حدث خطأ مؤقت في الخدمة. يرجى المحاولة لاحقاً.';
    }
  }
}
