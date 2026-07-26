import React from 'react';
import { useLang } from '../contexts/LanguageContext.jsx';
import Logo from './Logo.jsx';
import { whatsappUrl } from '../lib/utils.js';

export default function Footer({ navigate }) {
  const { t, lang } = useLang();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <div className="flex items-center gap-2">
          <Logo size={20} withText={false} />
          <span>© {year} OLTANI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('home')} className="hover:text-fg transition">{t('home')}</button>
          <a
            href={whatsappUrl(lang === 'ar' ? 'مرحباً OLTANI، أود الاستفسار عن الباقات' : 'Hi OLTANI, I want to ask about plans')}
            target="_blank"
            rel="noreferrer"
            className="hover:text-fg transition"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
