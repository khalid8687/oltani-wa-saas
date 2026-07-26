import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../lib/i18n.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'ar';
    return localStorage.getItem('oltani_lang') || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('oltani_lang', lang);
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggle = useCallback(() => {
    setLang(prev => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const t = useCallback(
    (key, vars) => {
      const dict = translations[lang] || translations.en;
      let str = dict[key] ?? translations.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        }
      }
      return str;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
