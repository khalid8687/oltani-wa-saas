import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLang } from '../contexts/LanguageContext.jsx';
import { instanceApi } from '../services/api.js';
import QRCodeModal from '../components/QRCodeModal.jsx';
import { classnames } from '../lib/utils.js';
import {
  MessageSquare, BookOpen, Sparkles, Plus, Trash2, Save, PhoneForwarded, AlertCircle
} from 'lucide-react';

const MODES = [
  { id: 'fixed', icon: MessageSquare },
  { id: 'qa',    icon: BookOpen },
  { id: 'ai',    icon: Sparkles }
];

export default function Wizard({ instance, onNavigate }) {
  const { user, isAdmin } = useAuth();
  const { t } = useLang();

  const [form, setForm] = useState({
    name: '',
    mode: 'ai',
    fixedMessage: 'أهلاً بك! تم استلام رسالتك وسنعاود التواصل في أقرب وقت.',
    qaPairs: [{ question: '', answer: '' }],
    persona: 'ممثل خدمة عملاء محترف ومؤدب. لغة سلسة صديقة.',
    instructions: '',
    services: '',
    routePhone: '',
    isAdminGarden: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [qr, setQr] = useState(null);

  useEffect(() => {
    if (instance) {
      setForm({
        name: instance.name || '',
        mode: instance.mode || 'ai',
        fixedMessage: instance.fixedMessage || '',
        qaPairs: instance.qaPairs?.length ? instance.qaPairs : [{ question: '', answer: '' }],
        persona: instance.persona || '',
        instructions: instance.instructions || '',
        services: instance.services || '',
        routePhone: instance.routePhone || '',
        isAdminGarden: isAdmin ? !!instance.isAdminGarden : false
      });
    }
  }, [instance, isAdmin]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addQa = () => set('qaPairs', [...form.qaPairs, { question: '', answer: '' }]);
  const updateQa = (i, k, v) => {
    const next = [...form.qaPairs];
    next[i][k] = v;
    set('qaPairs', next);
  };
  const removeQa = (i) => set('qaPairs', form.qaPairs.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Basic validation + limits
    if (form.name.length > 80) { setError('Name too long (max 80).'); setSaving(false); return; }
    if (form.fixedMessage.length > 2000) { setError('Fixed message too long (max 2000).'); setSaving(false); return; }
    if (form.persona.length > 4000 || form.instructions.length > 8000 || form.services.length > 8000) {
      setError('Field too long.'); setSaving(false); return;
    }
    if (form.qaPairs.length > 100) { setError('Too many QA pairs (max 100).'); setSaving(false); return; }
    if (form.routePhone && !/^\d{6,20}$/.test(form.routePhone.replace(/[\s+-]/g, ''))) {
      setError('Invalid route phone.'); setSaving(false); return;
    }

    try {
      const payload = {
        ...form,
        id: instance?.id,
        userId: user?.uid,
        qaPairs: form.qaPairs.filter(p => p.question && p.answer)
      };
      const res = await instanceApi.save(payload);
      if (res.success) {
        await instanceApi.start(res.instanceId);
        setQr(res.instanceId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = () => 'bg-subtle border rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition';

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {instance ? t('edit') : t('create')}
        </h1>
        <p className="text-sm text-muted">{t('wizardModeLabel')}</p>
      </header>

      <form onSubmit={submit} className="surface p-6 space-y-6">
        {error && (
          <div className="flex items-start gap-2 p-3 border border-err/30 bg-err/5 rounded-md text-sm text-err">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="label">{t('wizardNameLabel')}</label>
          <input
            className={field()}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="OLTANI Sales Bot"
            required
          />
        </div>

        {/* Mode picker */}
        <div>
          <label className="label">{t('wizardModeLabel')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MODES.map(({ id, icon: Icon }) => {
              const active = form.mode === id;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => set('mode', id)}
                  className={classnames(
                    'p-3 rounded-lg border text-start transition-all',
                    active ? 'border-accent bg-accent/5' : 'border-border bg-subtle hover:bg-elevated'
                  )}
                >
                  <Icon size={18} className={active ? 'text-accent' : 'text-muted'} />
                  <div className="text-sm font-medium mt-2">{t(`mode${id.charAt(0).toUpperCase() + id.slice(1)}`)}</div>
                  <div className="text-xs text-muted mt-0.5">{t(`mode${id.charAt(0).toUpperCase() + id.slice(1)}Desc`)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fixed mode */}
        {form.mode === 'fixed' && (
          <div>
            <label className="label">{t('wizardFixedLabel')}</label>
            <textarea
              rows={4}
              className={field()}
              value={form.fixedMessage}
              onChange={(e) => set('fixedMessage', e.target.value)}
            />
          </div>
        )}

        {/* QA mode */}
        {form.mode === 'qa' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label !mb-0">{t('wizardQaLabel')}</label>
              <button type="button" onClick={addQa} className="btn-ghost text-xs px-2 py-1">
                <Plus size={12} /> {t('addQa')}
              </button>
            </div>
            {form.qaPairs.map((pair, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  className={field()}
                  placeholder={t('question')}
                  value={pair.question}
                  onChange={(e) => updateQa(i, 'question', e.target.value)}
                />
                <input
                  className={field()}
                  placeholder={t('answer')}
                  value={pair.answer}
                  onChange={(e) => updateQa(i, 'answer', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeQa(i)}
                  className="btn-danger p-2"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI mode */}
        {form.mode === 'ai' && (
          <div className="space-y-4">
            <div>
              <label className="label">1. {t('personaLabel')}</label>
              <textarea rows={3} className={field()} value={form.persona}
                onChange={(e) => set('persona', e.target.value)} />
            </div>
            <div>
              <label className="label">2. {t('instructionsLabel')}</label>
              <textarea rows={3} className={field()} value={form.instructions}
                onChange={(e) => set('instructions', e.target.value)} />
            </div>
            <div>
              <label className="label">3. {t('servicesLabel')}</label>
              <textarea rows={3} className={field()} value={form.services}
                onChange={(e) => set('services', e.target.value)} />
            </div>
            <div>
              <label className="label">4. {t('routePhoneLabel')}</label>
              <div className="relative">
                <input
                  className={field() + ' ps-9'}
                  value={form.routePhone}
                  onChange={(e) => set('routePhone', e.target.value)}
                  dir="ltr"
                  placeholder="201000000000"
                />
                <PhoneForwarded size={15} className="absolute top-1/2 -translate-y-1/2 start-3 text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4 border-t">
          <button type="button" onClick={() => onNavigate('dashboard')} className="btn-secondary">
            {t('cancel')}
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={16} />
            {saving ? t('loading') : t('saveAndStart')}
          </button>
        </div>
      </form>

      {qr && (
        <QRCodeModal
          instanceId={qr}
          onClose={() => { setQr(null); onNavigate('dashboard'); }}
          onConnected={() => { setQr(null); onNavigate('dashboard'); }}
        />
      )}
    </div>
  );
}
