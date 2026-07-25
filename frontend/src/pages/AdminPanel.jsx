import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';
import { Shield, Key, Users, Cpu, RefreshCw, Save, CheckCircle, AlertTriangle, UserCheck, Lock } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const adminEmail = user?.email || 'khattab8687@gmail.com';

  const [users, setUsers] = useState([]);
  const [geminiStats, setGeminiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gemini Configuration Form State
  const [apiKeysInput, setApiKeysInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [savingConfig, setSavingConfig] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, geminiRes] = await Promise.all([
        adminApi.getUsers(adminEmail),
        adminApi.getGeminiStats(adminEmail)
      ]);

      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
      if (geminiRes.data.success) {
        setGeminiStats(geminiRes.data.stats);
        if (geminiRes.data.stats.currentModel) {
          setSelectedModel(geminiRes.data.stats.currentModel);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const handleUpdateUserPlan = async (uid, newPlan) => {
    try {
      await adminApi.updateUser({ uid, plan: newPlan }, adminEmail);
      loadAdminData();
    } catch (err) {
      alert('Error updating user plan: ' + err.message);
    }
  };

  const handleUpdateUserRole = async (uid, newRole) => {
    try {
      await adminApi.updateUser({ uid, role: newRole }, adminEmail);
      loadAdminData();
    } catch (err) {
      alert('Error updating user role: ' + err.message);
    }
  };

  const handleSaveGeminiConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);

    try {
      const keysArray = apiKeysInput
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const res = await adminApi.updateGeminiConfig({
        keys: keysArray.length > 0 ? keysArray : undefined,
        modelName: selectedModel
      }, adminEmail);

      if (res.data.success) {
        alert('تم تحديث إعدادات مفاتيح Gemini والموديل بنجاح!');
        loadAdminData();
      }
    } catch (err) {
      alert('Error updating Gemini config: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '12px', color: 'var(--accent-cyan)' }}>
          <Shield size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>لوحة الإدارة العليا (Superadmin Panel)</h1>
          <p style={{ color: 'var(--text-secondary)' }}>إدارة المستخدمين والاشتراكات ومتابعة موازِن أحمال الـ 10 Gemini API Keys</p>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          جاري تحميل بيانات اللوحة...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Users & Subscriptions Manager */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Users size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>إدارة المستخدمين والاشتراكات</h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'start' }}>المستخدم</th>
                    <th style={{ padding: '0.75rem', textAlign: 'start' }}>البريد الإلكتروني</th>
                    <th style={{ padding: '0.75rem', textAlign: 'start' }}>الخطة الحالية</th>
                    <th style={{ padding: '0.75rem', textAlign: 'start' }}>الصلاحية</th>
                    <th style={{ padding: '0.75rem', textAlign: 'start' }}>تعديل الخطة</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        لا يوجد مستخدمين مسجلين حالياً سوى حسابك.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.uid} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img src={u.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.uid} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                          <span style={{ fontWeight: 600 }}>{u.displayName || 'مستخدم أولتاني'}</span>
                        </td>
                        <td style={{ padding: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '0.85rem' }}>
                          <span className={`badge badge-plan-${u.plan || 'free'}`}>
                            {(u.plan || 'free').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          <span style={{ color: u.role === 'admin' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
                            {u.role === 'admin' ? 'آدمن Admin' : 'مستخدم User'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          <select
                            value={u.plan || 'free'}
                            onChange={(e) => handleUpdateUserPlan(u.uid, e.target.value)}
                            style={{
                              padding: '0.4rem 0.6rem',
                              borderRadius: '8px',
                              border: 'var(--glass-border)',
                              background: 'rgba(0,0,0,0.3)',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                          >
                            <option value="free">Free ($0)</option>
                            <option value="pro">Pro ($10)</option>
                            <option value="ultra">Ultra ($20)</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Gemini 10-Key Load Balancer Stats & Settings */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>مراقب أحمال Gemini (10 API Keys Pool)</h2>
              </div>
              <button onClick={loadAdminData} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <RefreshCw size={14} /> تحديث الإحصائيات
              </button>
            </div>

            {/* Current Stats Overview */}
            {geminiStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: 'var(--glass-border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>المفاتيح المحمّلة في الموازن</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                    {geminiStats.totalKeys} مفتاح
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: 'var(--glass-border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الموديل المعتمد حالياً</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '0.2rem' }}>
                    {geminiStats.currentModel}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: 'var(--glass-border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>مؤشر التدوير النشط (Index)</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
                    Key #{geminiStats.currentIndex + 1}
                  </div>
                </div>
              </div>
            )}

            {/* Keys Usage List */}
            {geminiStats?.stats && geminiStats.stats.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>استهلاك المفاتيح الفردية:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {geminiStats.stats.map((st, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '10px', border: 'var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Key #{idx + 1}: {st.keyMasked}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>أخطاء: {st.errors}</div>
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {st.count} req
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Keys & Model Config Form */}
            <form onSubmit={handleSaveGeminiConfig} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>إعدادات وتأمين الـ API Keys والموديل</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>اختيار موديل جوجل Gemini</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
                  >
                    <option value="gemini-1.5-flash">gemini-1.5-flash (سريع وموصى به)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (للمهام المعقدة)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (الجيل الجديد)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>مفاتيح Gemini API الجديدة (مفتاح في كل سطر)</label>
                  <textarea
                    rows={4}
                    value={apiKeysInput}
                    onChange={(e) => setApiKeysInput(e.target.value)}
                    placeholder="ضع مفتاح في كل سطر لإضافتها لموازن الأحمال..."
                    style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={savingConfig} className="btn-primary">
                  <Save size={18} />
                  <span>{savingConfig ? 'جاري الحفظ...' : 'تطبيق تحديثات الـ API Keys والموديل'}</span>
                </button>
              </div>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}
