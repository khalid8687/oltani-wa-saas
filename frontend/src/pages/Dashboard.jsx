import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { instanceApi } from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import { Bot, Play, Square, QrCode, Trash2, Edit3, Plus, MessageSquare, Smartphone, Activity, Sparkles } from 'lucide-react';

export default function Dashboard({ onNavigate, onEditInstance }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQrModal, setActiveQrModal] = useState(null);

  const userPlan = user?.plan || 'free';
  const planLimits = { free: 50, pro: 300, ultra: 1000 };
  const maxMessages = planLimits[userPlan] || 50;
  const currentMsgCount = user?.dailyMsgCount || 0;
  const usagePercent = Math.min(100, Math.round((currentMsgCount / maxMessages) * 100));

  const loadInstances = async () => {
    try {
      setLoading(true);
      const res = await instanceApi.getUserInstances(user?.uid || 'user_khalid_001');
      if (res.data.success) {
        setInstances(res.data.instances);
      }
    } catch (err) {
      console.error('Failed to load instances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadInstances();
    }
  }, [user]);

  const handleStart = async (inst) => {
    try {
      const res = await instanceApi.startInstance(inst.id, inst);
      if (res.data.success) {
        setActiveQrModal(inst.id);
        loadInstances();
      }
    } catch (err) {
      alert('خطأ أثناء تشغيل الجلسة: ' + err.message);
    }
  };

  const handleStop = async (id) => {
    try {
      await instanceApi.stopInstance(id);
      loadInstances();
    } catch (err) {
      alert('خطأ أثناء إيقاف الجلسة: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت تأكد من إزالة هذا البوت؟')) {
      try {
        await instanceApi.deleteInstance(id);
        loadInstances();
      } catch (err) {
        alert('خطأ أثناء إزالة البوت: ' + err.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>لوحة التحكم بالوكلاء (Dashboard)</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>إدارة ومتابعة وكلاء الواتساب والاستهلاك اليومي المباشر</p>
        </div>

        <button 
          onClick={() => onNavigate('wizard')} 
          className="btn-primary"
          style={{ padding: '0.85rem 1.5rem', borderRadius: '14px' }}
        >
          <Plus size={18} />
          <span>إنشاء بوت جديد</span>
        </button>
      </div>

      {/* Real Daily Quota Progress Card */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--brand-orange)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity size={20} color="var(--brand-orange)" />
            <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>معدل الاستهلاك اليومي للرسائل</span>
            <span className={`badge badge-plan-${userPlan}`}>
              باقة {userPlan.toUpperCase()}
            </span>
          </div>

          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-orange)' }}>
            {currentMsgCount} / {maxMessages} رسالة
          </span>
        </div>

        {/* Dynamic Glowing Progress Bar */}
        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${usagePercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--brand-orange) 0%, #f59e0b 100%)',
            borderRadius: '6px',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 0 12px rgba(255, 85, 0, 0.6)'
          }} />
        </div>
      </div>

      {/* Instances Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          جاري تحميل بيانات البوتات...
        </div>
      ) : instances.length === 0 ? (
        <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255, 85, 0, 0.1)', borderRadius: '50%', display: 'inline-flex', color: 'var(--brand-orange)', marginBottom: '1.25rem' }}>
            <Bot size={44} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>لا يوجد بوتات نشطة حالياً</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            قم بإنشاء وتكوين أول وكيل واتساب خاص بك لربطه مع هاتفك والرد الآلي الذكي على العملاء
          </p>
          <button onClick={() => onNavigate('wizard')} className="btn-primary" style={{ padding: '1rem 2rem' }}>
            <Plus size={20} />
            <span>إنشاء أول بوت الآن</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.75rem' }}>
          {instances.map((inst) => (
            <div key={inst.id} className="glass-panel glass-panel-hover" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{inst.name || 'WhatsApp Agent'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <Smartphone size={14} color="var(--brand-cyan)" />
                      <span>{inst.phone || 'غير مرتبط برقم'}</span>
                    </div>
                  </div>

                  <span className={`badge ${inst.status === 'connected' ? 'badge-connected' : inst.status === 'qr_ready' ? 'badge-qr' : 'badge-disconnected'}`}>
                    {inst.status === 'connected' ? 'متصل' : inst.status === 'qr_ready' ? 'بانتظار الـ QR' : 'غير متصل'}
                  </span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.88rem', marginBottom: '1.5rem', border: 'var(--glass-border)' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>نمط الرد: </strong>
                  <span style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>
                    {inst.mode === 'fixed' ? 'الرد الثابت' : inst.mode === 'qa' ? 'الرد بالتعليم (FAQ)' : 'الرد الآلي الذكي (AI)'}
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                {inst.status !== 'connected' ? (
                  <button onClick={() => handleStart(inst)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', flex: 1, borderRadius: '10px' }}>
                    <QrCode size={16} />
                    <span>ربط الـ QR</span>
                  </button>
                ) : (
                  <button onClick={() => handleStop(inst.id)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', flex: 1, color: 'var(--brand-red)', borderRadius: '10px' }}>
                    <Square size={16} />
                    <span>إيقاف</span>
                  </button>
                )}

                <button onClick={() => { onEditInstance(inst); onNavigate('wizard'); }} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', borderRadius: '10px' }}>
                  <Edit3 size={16} />
                </button>

                <button onClick={() => handleDelete(inst.id)} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', color: 'var(--brand-red)', borderRadius: '10px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal Popup */}
      {activeQrModal && (
        <QRCodeModal
          instanceId={activeQrModal}
          onClose={() => setActiveQrModal(null)}
          onConnected={() => {
            loadInstances();
            setActiveQrModal(null);
          }}
        />
      )}

    </div>
  );
}
