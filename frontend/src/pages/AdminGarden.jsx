import React, { useEffect, useState, useCallback } from 'react';
import { useLang } from '../contexts/LanguageContext.jsx';
import { adminApi, instanceApi } from '../services/api.js';
import QRCodeModal from '../components/QRCodeModal.jsx';
import { statusMeta } from '../lib/utils.js';
import { Flower2, Plus, QrCode, Square, Pencil, Trash2, Smartphone, Bot } from 'lucide-react';

export default function AdminGarden({ onNavigate, onEdit }) {
  const { t } = useLang();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQr, setActiveQr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.garden();
      setInstances(res.instances || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createGardenBot = () => {
    onEdit({
      name: 'OLTANI Support & Booking',
      mode: 'ai',
      isAdminGarden: true,
      persona: 'You are OLTANI support, booking agent. Reply in user language.',
      instructions: 'Website: https://oltani.com. We offer WhatsApp automation, AI bots, and SaaS.',
      services: 'Plans: Free / Pro $10 / Ultra $20.',
      routePhone: '201002194451'
    });
    onNavigate('wizard');
  };

  const start = async (inst) => {
    try { await instanceApi.start(inst.id); setActiveQr(inst.id); load(); }
    catch (err) { setError(err.message); }
  };

  const stop = async (id) => {
    try { await instanceApi.stop(id); load(); }
    catch (err) { setError(err.message); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await instanceApi.remove(id); load(); }
    catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Flower2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('gardenTitle')}</h1>
            <p className="text-sm text-muted">{t('gardenSubtitle')}</p>
          </div>
        </div>
        <button onClick={createGardenBot} className="btn-primary">
          <Plus size={16} /> {t('newGardenBot')}
        </button>
      </header>

      {error && (
        <div className="surface border-err/30 bg-err/5 p-3 text-sm text-err">{error}</div>
      )}

      {loading ? (
        <div className="surface p-12 text-center text-muted animate-pulse-soft">{t('loading')}</div>
      ) : instances.length === 0 ? (
        <div className="surface p-12 text-center">
          <Bot size={36} className="text-purple-400 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">{t('noInstances')}</h3>
          <p className="text-muted text-sm mb-4">{t('gardenSubtitle')}</p>
          <button onClick={createGardenBot} className="btn-primary">
            <Plus size={16} /> {t('newGardenBot')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map(inst => {
            const st = statusMeta(inst.status);
            return (
              <div key={inst.id} className="surface surface-hover p-4 flex flex-col border-purple-500/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-purple-400">{inst.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted mt-0.5">
                      <Smartphone size={11} />
                      <span dir="ltr">{inst.phone || '—'}</span>
                    </div>
                  </div>
                  <span className={st.cls}>{t(st.key)}</span>
                </div>

                <div className="bg-subtle border rounded-md px-2.5 py-1.5 text-xs mb-4 line-clamp-2">
                  {inst.persona || '—'}
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
                  <button onClick={() => { onEdit(inst); onNavigate('wizard'); }}
                    className="btn-secondary px-2.5 py-1.5" aria-label={t('edit')}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(inst.id)}
                    className="btn-danger px-2.5 py-1.5" aria-label={t('delete')}>
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
