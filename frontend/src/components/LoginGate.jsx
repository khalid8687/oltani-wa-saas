import React from 'react';
import { useLang } from '../contexts/LanguageContext.jsx';
import { LogIn } from 'lucide-react';

export default function LoginGate({ onLogin }) {
  const { t } = useLang();
  return (
    <div className="surface max-w-md mx-auto p-10 text-center">
      <div className="inline-flex p-3 rounded-full bg-accent/10 text-accent mb-4">
        <LogIn size={26} />
      </div>
      <h2 className="text-xl font-bold mb-1.5">{t('errAuth')}</h2>
      <p className="text-muted text-sm mb-6">{t('heroSubtitle')}</p>
      <button onClick={onLogin} className="btn-primary w-full">
        <LogIn size={16} />
        {t('loginGoogle')}
      </button>
    </div>
  );
}
