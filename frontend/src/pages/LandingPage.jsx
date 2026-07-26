import React from 'react';
import { useLang } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { whatsappUrl, PLAN_META, TRIAL_DAYS } from '../lib/utils.js';
import {
  Sparkles, Cpu, Network, Smartphone, ShieldCheck,
  ArrowRight, Check, MessageCircle, Bot
} from 'lucide-react';

const FEATURES = [
  { icon: Cpu,        key: 'feat1' },
  { icon: Network,    key: 'feat2' },
  { icon: Smartphone, key: 'feat3' },
  { icon: ShieldCheck,key: 'feat4' }
];

export default function LandingPage({ onNavigate }) {
  const { t, lang } = useLang();
  const { user, loginWithGoogle } = useAuth();

  const start = () => {
    if (user) onNavigate('dashboard');
    else loginWithGoogle().then(() => onNavigate('dashboard')).catch(() => {});
  };

  const wa = whatsappUrl(lang === 'ar' ? 'مرحباً OLTANI، أود تجربة Pro المجانية' : 'Hi OLTANI, I want the Pro trial');

  return (
    <div className="space-y-20">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="pt-12 md:pt-20 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-subtle/60 text-xs font-medium text-muted mb-6 animate-fade-in">
          <Sparkles size={13} className="text-accent" />
          <span>{t('heroTrialNote')}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
          {(() => {
            const parts = t('heroTitle').split(/[[\]]/); // [before, accent, after]
            if (parts.length === 3) {
              return (
                <>
                  {parts[0]}<span className="text-accent">{parts[1]}</span>{parts[2]}
                </>
              );
            }
            return t('heroTitle');
          })()}
        </h1>

        <p className="text-base md:text-lg text-muted leading-relaxed mb-8 max-w-2xl mx-auto">
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={start} className="btn-primary px-6 py-3 w-full sm:w-auto">
            {t('heroCta')}
            <ArrowRight size={16} className="flip-x" />
          </button>
          <a href={wa} target="_blank" rel="noreferrer" className="btn-secondary px-6 py-3 w-full sm:w-auto">
            <MessageCircle size={16} className="text-ok" />
            {t('contactSales')}
          </a>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map(({ icon: Icon, key }) => (
          <div key={key} className="surface surface-hover p-5">
            <div className="inline-flex p-2 rounded-lg bg-subtle text-accent mb-3">
              <Icon size={18} />
            </div>
            <h3 className="font-semibold mb-1">{t(`${key}Title`)}</h3>
            <p className="text-sm text-muted leading-relaxed">{t(`${key}Body`)}</p>
          </div>
        ))}
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('planFree')} · {t('planPro')} · {t('planUltra')}</h2>
          <p className="text-muted mt-2 text-sm">{TRIAL_DAYS} {t('heroTrialNote')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {Object.entries(PLAN_META).map(([key, plan]) => {
            const featured = key === 'pro';
            return (
              <div
                key={key}
                className={`surface p-6 flex flex-col ${featured ? 'border-accent/40 shadow-glow' : ''}`}
              >
                {featured && (
                  <div className="self-start badge-plan-pro mb-3">
                    <Sparkles size={11} /> {t('trialCta')}
                  </div>
                )}
                <h3 className="font-semibold text-lg">{t(`plan${key.charAt(0).toUpperCase() + key.slice(1)}`)}</h3>
                <p className="text-xs text-muted mb-4">{t(`${key}Desc`)}</p>

                <div className="mb-5">
                  <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                  <span className="text-sm text-muted">{t('perMonth')}</span>
                </div>

                <ul className="space-y-2.5 text-sm mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-ok mt-0.5 shrink-0" />
                    <span>
                      {plan.instances === Infinity ? '∞' : plan.instances} {t('instancesUsed').toLowerCase()}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-ok mt-0.5 shrink-0" />
                    <span>{plan.daily} {t('daily').toLowerCase()} AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="text-ok mt-0.5 shrink-0" />
                    <span>{t('modeAi')}</span>
                  </li>
                </ul>

                {plan.price === 0 ? (
                  <button onClick={start} className="btn-secondary w-full">{t('choose')}</button>
                ) : (
                  <a href={wa} target="_blank" rel="noreferrer"
                     className={featured ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                    {t('upgrade')}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="surface p-8 md:p-12 text-center">
        <div className="inline-flex p-3 rounded-full bg-accent/10 text-accent mb-4">
          <Bot size={28} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('heroCta')}</h2>
        <p className="text-muted mb-6 max-w-md mx-auto text-sm">{t('heroSubtitle')}</p>
        <button onClick={start} className="btn-primary px-6 py-3">{t('heroCta')}</button>
      </section>
    </div>
  );
}
