import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { instanceApi } from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import { Bot, Play, Square, QrCode, Trash2, Edit3, Plus, MessageSquare, Smartphone } from 'lucide-react';

export default function Dashboard({ onNavigate, onEditInstance }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQrModal, setActiveQrModal] = useState(null); // instance ID

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
    loadInstances();
  }, [user]);

  const handleStart = async (inst) => {
    try {
      const res = await instanceApi.startInstance(inst.id, inst);
      if (res.data.success) {
        setActiveQrModal(inst.id);
        loadInstances();
      }
    } catch (err) {
      alert('Error starting instance: ' + err.message);
    }
  };

  const handleStop = async (id) => {
    try {
      await instanceApi.stopInstance(id);
      loadInstances();
    } catch (err) {
      alert('Error stopping instance: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت تأكد من إزالة هذا الـ Instance؟')) {
      try {
        await instanceApi.deleteInstance(id);
        loadInstances();
      } catch (err) {
        alert('Error deleting instance: ' + err.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header & Plan Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>لوحة التحكم بالبوتات</h1>
          <p style={{ color: 'var(--text-secondary)' }}>إدارة أجهزة ووكلاء الواتساب ومتابعة الاستهلاك اليومي</p>
        </div>

        <button 
          onClick={() => onNavigate('wizard')} 
          className="btn-primary"
        >
          <Plus size={18} />
          <span>إنشاء بوت جديد</span>
        </button>
      </div>

      {/* Usage Quota Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 600 }}>استهلاك الرسائل اليومية</span>
            <span className={`badge badge-plan-${userPlan}`}>
              {userPlan.toUpperCase()} PLAN
            </span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            {currentMsgCount} / {maxMessages} رسالة
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${usagePercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-blue) 100%)',
            borderRadius: '5px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Instances Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          جاري تحميل بيانات الـ Instances...
        </div>
      ) : instances.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Bot size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>لا يوجد بوتات نشطة حالياً</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>قم بإنشاء وكيل الواتساب الأول الخاص بك لربطه مع هاتفك والرد على العملاء</p>
          <button onClick={() => onNavigate('wizard')} className="btn-primary">
            <Plus size={18} />
            <span>إنشاء أول بوت الآن</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {instances.map((inst) => (
            <div key={inst.id} className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{inst.name || 'WhatsApp Agent'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <Smartphone size={14} />
                      <span>{inst.phone || 'غير مرتبطة برقم'}</span>
                    </div>
                  </div>

                  <span className={`badge ${inst.status === 'connected' ? 'badge-connected' : inst.status === 'qr_ready' ? 'badge-qr' : 'badge-disconnected'}`}>
                    {inst.status === 'connected' ? 'متصل' : inst.status === 'qr_ready' ? 'بانتظار الـ QR' : 'غير متصل'}
                  </span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', border: 'var(--glass-border)' }}>
                  <strong>نمط الرد: </strong>
                  {inst.mode === 'fixed' ? 'الرد الثابت' : inst.mode === 'qa' ? 'الرد بالتعليم (FAQ)' : 'الرد الآلي الذكي (AI)'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                {inst.status !== 'connected' ? (
                  <button onClick={() => handleStart(inst)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }}>
                    <QrCode size={14} />
                    <span>ربط الـ QR</span>
                  </button>
                ) : (
                  <button onClick={() => handleStop(inst.id)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1, color: 'var(--accent-red)' }}>
                    <Square size={14} />
                    <span>إيقاف</span>
                  </button>
                )}

                <button onClick={() => { onEditInstance(inst); onNavigate('wizard'); }} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <Edit3 size={14} />
                </button>

                <button onClick={() => handleDelete(inst.id)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--accent-red)' }}>
                  <Trash2 size={14} />
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
