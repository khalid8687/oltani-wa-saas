import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ar: {
    brandName: 'أولتاني',
    tagline: 'منصة إدارة وكلاء الواتساب المتعددة بالذكاء الاصطناعي',
    home: 'الرئيسية',
    dashboard: 'لوحة التحكم',
    createInstance: 'إنشاء وكيل واتساب',
    adminPanel: 'لوحة الآدمن',
    adminGarden: 'حديقة الآدمن',
    login: 'تسجيل الدخول مع Google',
    logout: 'تسجيل الخروج',
    instances: 'البوتات النشطة',
    freePlan: 'خطة مجانية',
    proPlan: 'خطة Pro',
    ultraPlan: 'خطة Ultra',
    upgradePlan: 'ترقية الحساب',
    scanQR: 'مسح رمز QR',
    status: 'الحالة',
    actions: 'الإجراءات',
    fixedReply: 'رد ثابت',
    qaReply: 'رد تعليمي (أسئلة وأجوبة)',
    aiReply: 'رد ذكي بالذكاء الاصطناعي',
    persona: 'شخصية البوت (Persona)',
    instructions: 'تعليمات الشركة (Instructions)',
    services: 'المنتجات والخدمات (Services)',
    routePhone: 'رقم تحويل الشراء (Route Phone)',
    save: 'حفظ التغييرات',
    startAgent: 'تشغيل البوت',
    stopAgent: 'إيقاف البوت',
    delete: 'حذف',
    trialBanner: 'احصل على تجربة مجانية لمدة أسبوع على النسخة Pro!',
    contactWhatsApp: 'تواصل عبر الواتساب للاشتراك',
    dailyQuota: 'الرسائل اليومية',
    usersManager: 'إدارة المستخدمين والاشتراكات',
    geminiBalancer: 'مراقب مفاتيح Gemini (10 Keys)',
    activeModel: 'الموديل النشط',
    pricingTitle: 'خطط الاشتراك والأسعار'
  },
  en: {
    brandName: 'OLTANI',
    tagline: 'Multi-Instance AI WhatsApp Automation Platform',
    home: 'Home',
    dashboard: 'Dashboard',
    createInstance: 'Create WhatsApp Agent',
    adminPanel: 'Admin Panel',
    adminGarden: 'Admin Garden',
    login: 'Login with Google',
    logout: 'Logout',
    instances: 'Active Agents',
    freePlan: 'Free Plan',
    proPlan: 'Pro Plan',
    ultraPlan: 'Ultra Plan',
    upgradePlan: 'Upgrade Plan',
    scanQR: 'Scan QR Code',
    status: 'Status',
    actions: 'Actions',
    fixedReply: 'Fixed Reply',
    qaReply: 'Predefined QA Match',
    aiReply: 'Smart AI Agent',
    persona: 'Bot Persona',
    instructions: 'Company Instructions',
    services: 'Services & Pricing',
    routePhone: 'Route Phone Number',
    save: 'Save Changes',
    startAgent: 'Start Agent',
    stopAgent: 'Stop Agent',
    delete: 'Delete',
    trialBanner: 'Get a 1-Week FREE Trial on Pro Plan!',
    contactWhatsApp: 'Contact via WhatsApp to Subscribe',
    dailyQuota: 'Daily Messages Quota',
    usersManager: 'Users & Subscriptions Manager',
    geminiBalancer: 'Gemini Load Balancer (10 Keys)',
    activeModel: 'Active Model',
    pricingTitle: 'Subscription Plans & Pricing'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('oltani_lang') || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('oltani_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
