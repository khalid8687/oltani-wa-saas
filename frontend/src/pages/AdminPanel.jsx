import React, { useEffect, useState, useCallback } from 'react';
import { useLang } from '../contexts/LanguageContext.jsx';
import { adminApi } from '../services/api.js';
import { classnames } from '../lib/utils.js';
import { Shield, Users, Cpu, Activity, RefreshCw, Save, AlertCircle, Lock } from 'lucide-react';

export default function AdminPanel() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [gemini, setGemini] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keysInput, setKeysInput] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [savingGemini, setSavingGemini] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, u, g] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        adminApi.geminiStats()
      ]);
      setStats(s.stats);
      setUsers(s.users ?? u.users ?? []);
      setGemini(g.stats);
      if (g.stats?.activeModel) setModel(g.stats.activeModel);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updatePlan = async (uid, plan) => {
    try { await adminApi.updateUser({ uid, plan }); load(); }
    catch (err) { setError(err.message); }
  };

  const updateRole = async (uid, role) => {
    try { await adminApi.updateUser({ uid, role }); load(); }
    catch (err) { setError(err.message); }
  };

  const block = async (uid) => {
    if (!window.confirm('Block this user?')) return;
    try { await adminApi.blockUser(uid); load(); }
    catch (err) { setError(err.message); }
  };

  const saveGemini = async (e) => {
    e.preventDefault();
    setSavingGemini(true);
    try {
      const keys = keysInput.split('\n').map(k => k.trim()).filter(Boolean);
      const res = await adminApi.geminiConfig({ keys: keys.length ? keys : undefined, modelName: model });
      setGemini(res.stats);
      setKeysInput('');
    } catch (err) { setError(err.message); }
    finally { setSavingGemini(false); }
  };

  if (loading) return <div className="surface p-12 text-center text-muted animate-pulse-soft">{t('loading')}</div>;

  const stat = (label, value, Icon) => (
    <div className="surface p-4">
      <div className="flex items-center gap-2 text-muted text-xs mb-2">
        <Icon size={14} /> <span>{label}</span>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="inline-flex p-2.5 rounded-lg bg-accent/10 text-accent">
          <Shield size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('adminTitle')}</h1>
          <p className="text-sm text-muted">{t('adminSubtitle')}</p>
        </div>
      </header>

      {error && (
        <div className="surface border-err/30 bg-err/5 p-3 flex items-start gap-2 text-sm text-err">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ms-auto text-err/70 hover:text-err text-xs">×</button>
        </div>
      )}

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stat(t('totalUsers'), stats?.totalUsers ?? 0, Users)}
        {stat(t('totalInstances'), stats?.totalInstances ?? 0, Activity)}
        {stat('Free', stats?.planCounts?.free ?? 0, Users)}
        {stat('Pro / Ultra', (stats?.planCounts?.pro ?? 0) + (stats?.planCounts?.ultra ?? 0), Users)}
      </div>

      {/* Users table */}
      <div className="surface">
        <div className="p-4 border-b flex items-center gap-2">
          <Users size={16} className="text-muted" />
          <h2 className="font-semibold text-sm">{t('users')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted border-b">
                <th className="text-start p-3 font-medium">{t('home')}</th>
                <th className="text-start p-3 font-medium">Email</th>
                <th className="text-start p-3 font-medium">{t('plan')}</th>
                <th className="text-start p-3 font-medium">{t('role')}</th>
                <th className="text-start p-3 font-medium">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.uid} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={u.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                      <span className="font-medium">{u.displayName || u.email}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.plan || 'free'}
                      onChange={(e) => updatePlan(u.uid, e.target.value)}
                      className={classnames(
                        'text-xs px-2 py-1 rounded-md border bg-subtle',
                        u.plan === 'pro' ? 'text-accent border-accent/30 bg-accent/5' :
                        u.plan === 'ultra' ? 'text-purple-400 border-purple-500/30 bg-purple-500/5' :
                        'text-muted'
                      )}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="ultra">Ultra</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role || 'user'}
                      onChange={(e) => updateRole(u.uid, e.target.value)}
                      className="text-xs px-2 py-1 rounded-md border bg-subtle"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => block(u.uid)}
                      className="btn-ghost text-xs px-2 py-1 text-err hover:bg-err/10"
                      title="Block"
                    >
                      <Lock size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted text-sm">No users yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gemini balancer */}
      <div className="surface">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-muted" />
            <h2 className="font-semibold text-sm">{t('geminiPool')}</h2>
          </div>
          <button onClick={load} className="btn-ghost text-xs px-2 py-1">
            <RefreshCw size={12} /> {t('refresh')}
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 border-b">
          <div>
            <div className="text-xs text-muted mb-1">{t('geminiKeys')}</div>
            <div className="text-xl font-bold text-accent">{gemini?.totalKeys ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">{t('geminiModel')}</div>
            <div className="text-sm font-mono font-semibold">{gemini?.activeModel ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1">{t('cursor')}</div>
            <div className="text-xl font-bold text-purple-400">#{(gemini?.cursor ?? 0) + 1}</div>
          </div>
        </div>

        {gemini?.keys?.length > 0 && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border-b">
            {gemini.keys.map(k => (
              <div key={k.index} className="flex items-center justify-between px-3 py-2 rounded-md bg-subtle border text-xs">
                <div>
                  <div className="font-mono">{k.masked}</div>
                  <div className="text-muted mt-0.5">errors: {k.errors}{k.cooling ? ' · cooling' : ''}</div>
                </div>
                <div className="font-bold text-accent">{k.count}</div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={saveGemini} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">{t('geminiModel')}</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-subtle border rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-accent"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro</option>
              <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
            </select>
          </div>
          <div>
            <label className="label">Keys (one per line)</label>
            <textarea
              rows={3}
              value={keysInput}
              onChange={(e) => setKeysInput(e.target.value)}
              className="bg-subtle border rounded-lg px-3 py-2 text-xs w-full outline-none focus:border-accent font-mono"
              placeholder="AIzaSy...&#10;AIzaSy..."
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={savingGemini} className="btn-primary">
              <Save size={14} /> {t('saveGemini')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
