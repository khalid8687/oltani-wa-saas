import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, instanceApi } from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import { Flower2, Plus, QrCode, Square, Trash2, Edit3, Bot, Smartphone, HelpCircle } from 'lucide-react';

export default function AdminGarden({ onEditInstance, onNavigate }) {
  const { user } = useAuth();
  const adminEmail = user?.email || 'khattab8687@gmail.com';

  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQrModal, setActiveQrModal] = useState(null);

  const loadAdminGarden = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAdminGarden(adminEmail);
      if (res.data.success) {
        setInstances(res.data.instances);
      }
    } catch (err) {
      console.error('Failed to load Admin Garden instances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminGarden();
  }, [user]);

  const handleCreateGardenBot = () => {
    onEditInstance({
      name: 'بوت دعم وتحجز موقع OLTANI',
      mode: 'ai',
      isAdminGarden: true,
      persona: 'أنت ممثل الدعم الفني والحجوزات المباشر لموقع وحلول شركة OLTANI.',
      instructions: 'موقعنا الإلكتروني https://oltani.com. نقدم خدمات الدعم الفني والاستشارات والحجز المباشر.',
      services: 'حجز مواعيد الاستشارات البرمجية، دعم الباقات، والاستفسارات العامة.',
      routePhone: '201002194451'
    });
    onNavigate('wizard');
  };

  const handleStart = async (inst) => {
    try {
      const res = await instanceApi.startInstance(inst.id, inst);
      if (res.data.success) {
        setActiveQrModal(inst.id);
        loadAdminGarden();
      }
    } catch (err) {
      alert('Error starting instance: ' + err.message);
    }
  };

  const handleStop = async (id) => {
    try {
      await instanceApi.stopInstance(id);
      loadAdminGarden();
    } catch (err) {
      alert('Error stopping instance: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت تأكد من حذف بوت حديقة الآدمن؟')) {
      try {
        await instanceApi.deleteInstance(id);
        loadAdminGarden();
      } catch (err) {
        alert('Error deleting instance: ' + err.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--accent-green)' }}>
            <Flower2 size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>حديقة الآدمن (Admin Garden)</h1>
            <p style={{ color: 'var(--text-secondary)' }}>إدارة بوتات الواتساب الخاصة بالموقع المباشر والدعم الفني والحجوزات (بعيداً عن الـ SaaS)</p>
          </div>
        </div>

        <button onClick={handleCreateGardenBot} className="btn-primary">
          <Plus size={18} />
          <span>إضافة بوت حديقة جديد</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--accent-green)' }}>
        <HelpCircle size={24} color="var(--accent-green)" />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          هذه الصفحة مخصصة لإنشاء بوتات واتساب داخلية لـ <strong>OLTANI</strong> للرد على استفسارات الزوار وحجز الخدمات مباشرة من الموقع العام، ولا تؤثر على حصص الـ SaaS للمستخدمين.
        </div>
      </div>

      {/* Instances Grid */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          جاري تحميل بوتات حديقة الآدمن...
        </div>
      ) : instances.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Bot size={48} color="var(--accent-green)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>لا يوجد بوتات حديقة مضافة حالياً</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>أضف بوت الدعم الفني والحجوزات الخاص بشركتك للارتباط برقم الدعم المباشر</p>
          <button onClick={handleCreateGardenBot} className="btn-primary">
            <Plus size={18} />
            <span>إضافة بوت الدعم والحجز</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {instances.map((inst) => (
            <div key={inst.id} className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-green)' }}>{inst.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <Smartphone size={14} />
                      <span>{inst.phone || 'غير مرتبط برقم'}</span>
                    </div>
                  </div>

                  <span className={`badge ${inst.status === 'connected' ? 'badge-connected' : 'badge-disconnected'}`}>
                    {inst.status === 'connected' ? 'متصل' : 'غير متصل'}
                  </span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', border: 'var(--glass-border)' }}>
                  <strong>هدف البوت: </strong> {inst.persona || 'دعم وحجز لموقع OLTANI'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                {inst.status !== 'connected' ? (
                  <button onClick={() => handleStart(inst)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
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

      {/* QR Code Popup */}
      {activeQrModal && (
        <QRCodeModal
          instanceId={activeQrModal}
          onClose={() => setActiveQrModal(null)}
          onConnected={() => {
            loadAdminGarden();
            setActiveQrModal(null);
          }}
        />
      )}

    </div>
  );
}
