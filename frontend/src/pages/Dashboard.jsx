import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLang } from '../contexts/LanguageContext.jsx';
import { instanceApi } from '../services/api.js';
import QRCodeModal from '../components/QRCodeModal.jsx';
import { effectivePlan, PLAN_META, statusMeta, modeMeta } from '../lib/utils.js';
import {
  Plus, QrCode, Square, Pencil, Trash2, Bot, Activity, Smartphone, AlertCircle
} from 'lucide-react';

export default function Dashboard({ onNavigate, onEdit }) {
  const { user, setUser } = useAuth();
  const { t } = useLang();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQr, setActiveQr] = useState(null);

  const plan = effectivePlan(user);
  const meta = PLAN_META[plan];
  const used = user?.dailyMsgCount || 0;
  const pct = Math.min(100, Math.round((used / meta.daily) * 100));

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await instanceApi.list();
      if (res.success) {
        setInstances(res.instances || []);
        if (res.plan) {
          // Keep the *stored* plan in user state; effectivePlan() recomputes trial.
          setUser(u => ({ ...u, plan: res.plan.stored || u?.plan || 'free' }));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => { load(); }, [load]);

  const start = async (inst) => {
    try {
      await instanceApi.start(inst.id);
      setActiveQr(inst.id);
      load();
    } catch (err) { setError(err.message); }
  };

  const stop = async (id) => {
    try { await instanceApi.stop(id); load(); }
    catch (err) { setError(err.message); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this agent?')) return;
    try { await instanceApi.remove(id); load(); }
    catch (err) { setError(err.message); }
  };

  const planOk = instances.length < meta.instances;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('instancesTitle')}</h1>
          <p className="text-sm text-muted">{t('instancesSubtitle')}</p>
        </div>
        <button
          onClick={() => {
            if (!planOk) { setError(t('errPlanLimit')); return; }
            onEdit(null);
            onNavigate('wizard');
          }}
          className="btn-primary"
        >
          <Plus size={16} /> {t('newInstance')}
        </button>
      </div>

      {error && (
        <div className="surface border-err/30 bg-err/5 p-3 flex items-start gap-2 text-sm">
          <AlertCircle size={16} className="text-err mt-0.5 shrink-0" />
          <span className="text-err">{error}</span>
          <button onClick={() => setError(null)} className="ms-auto text-err/70 hover:text-err text-xs">×</button>
        </div>
      )}

      {/* Usage panel */}
      <div className="surface p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-accent" />
            <span className="font-semibold text-sm">{t('quotaLabel')}</span>
            <span className={`badge-plan-${plan}`}>{meta.label}</span>
          </div>
          <span className="text-sm font-semibold text-muted">
            {used} / {meta.daily}
          </span>
        </div>
        <div className="h-2 rounded-full bg-subtle overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted">
          {t('instancesUsed')}: {instances.length} / {meta.instances === Infinity ? '∞' : meta.instances}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="surface p-12 text-center text-muted animate-pulse-soft">{t('loading')}</div>
      ) : instances.length === 0 ? (
        <div className="surface p-12 text-center">
          <div className="inline-flex p-3 rounded-full bg-subtle text-accent mb-4">
            <Bot size={32} />
          </div>
          <h3 className="font-semibold text-lg mb-1">{t('noInstances')}</h3>
          <p className="text-muted text-sm mb-5 max-w-md mx-auto">{t('noInstancesBody')}</p>
          <button onClick={() => { onEdit(null); onNavigate('wizard'); }} className="btn-primary">
            <Plus size={16} /> {t('newInstance')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map(inst => {
            const st = statusMeta(inst.status);
            const md = modeMeta(inst.mode);
            return (
              <div key={inst.id} className="surface surface-hover p-4 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{inst.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                      <Smartphone size={11} />
                      <span dir="ltr">{inst.phone || '—'}</span>
                    </div>
                  </div>
                  <span className={st.cls}>{t(st.key)}</span>
                </div>

                <div className="bg-subtle border rounded-md px-2.5 py-1.5 text-xs mb-4">
                  <span className="text-muted">{t('status')}: </span>
                  <span className="text-accent font-medium">{t(md.key)}</span>
                </div>

                <div className="mt-auto flex gap-1.5 pt-3 border-t">
                  {inst.status !== 'connected' ? (
                    <button onClick={() => start(inst)} className="btn-primary flex-1 text-xs px-3 py-1.5">
                      <QrCode size={14} /> {t('connect')}
                    </button>
                  ) : (
                    <button onClick={() => stop(inst.id)} className="btn-danger flex-1 text-xs px-3 py-1.5">
                      <Square size={14} /> {t('stop')}
                    </button>
                  )}
                  <button
                    onClick={() => { onEdit(inst); onNavigate('wizard'); }}
                    className="btn-secondary px-2.5 py-1.5"
                    aria-label={t('edit')}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(inst.id)}
                    className="btn-danger px-2.5 py-1.5"
                    aria-label={t('delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeQr && (
        <QRCodeModal
          instanceId={activeQr}
          onClose={() => setActiveQr(null)}
          onConnected={() => { load(); setActiveQr(null); }}
        />
      )}
    </div>
  );
}
