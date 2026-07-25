import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { instanceApi } from '../services/api';
import QRCodeModal from '../components/QRCodeModal';
import { Bot, MessageSquare, BookOpen, Sparkles, Plus, Trash2, Save, PhoneForwarded, CheckCircle2 } from 'lucide-react';

export default function Wizard({ instanceToEdit, onNavigate }) {
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [mode, setMode] = useState('ai'); // 'fixed' | 'qa' | 'ai'
  const [fixedMessage, setFixedMessage] = useState('أهلاً بك! تم استلام رسالتك وسنرد عليك في أقرب وقت.');
  const [qaPairs, setQaPairs] = useState([{ question: 'ما هي مواعيد العمل؟', answer: 'نعمل يومياً من 9 صباحاً حتى 10 مساءً' }]);
  
  // 4 Core AI Parameters
  const [persona, setPersona] = useState('أنت ممثل خدمة عملاء محترف ومؤدب ومساعد وتتحدث بأسلوب راقي وسلس.');
  const [instructions, setInstructions] = useState('شركة أولتاني للحلول الرقمية والبرمجية. العنوان: القاهرة، مصر.');
  const [services, setServices] = useState('خدمات تصميم المواقع والتطبيقات، وأتمتة الواتساب. أسعار الباقات تبدأ من $10/شهر.');
  const [routePhone, setRoutePhone] = useState('201002194451');

  const [saving, setSaving] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [createdInstanceId, setCreatedInstanceId] = useState(null);

  useEffect(() => {
    if (instanceToEdit) {
      setName(instanceToEdit.name || '');
      setMode(instanceToEdit.mode || 'ai');
      setFixedMessage(instanceToEdit.fixedMessage || '');
      if (instanceToEdit.qaPairs) setQaPairs(instanceToEdit.qaPairs);
      setPersona(instanceToEdit.persona || '');
      setInstructions(instanceToEdit.instructions || '');
      setServices(instanceToEdit.services || '');
      setRoutePhone(instanceToEdit.routePhone || '');
    }
  }, [instanceToEdit]);

  const handleAddQa = () => {
    setQaPairs([...qaPairs, { question: '', answer: '' }]);
  };

  const handleUpdateQa = (index, field, value) => {
    const updated = [...qaPairs];
    updated[index][field] = value;
    setQaPairs(updated);
  };

  const handleRemoveQa = (index) => {
    setQaPairs(qaPairs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        id: instanceToEdit?.id || undefined,
        userId: user?.uid || 'user_khalid_001',
        name: name || 'بوت الواتساب الذكي',
        mode,
        fixedMessage,
        qaPairs,
        persona,
        instructions,
        services,
        routePhone
      };

      const res = await instanceApi.saveInstance(data);
      if (res.data.success) {
        const instId = res.data.instanceId;
        setCreatedInstanceId(instId);

        // Auto start session to generate QR
        await instanceApi.startInstance(instId, data);
        setShowQrModal(true);
      }
    } catch (err) {
      alert('خطأ أثناء حفظ البيانات: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          {instanceToEdit ? 'تعديل بيانات البوت' : 'معالج إنشاء بوت الواتساب (Instance Wizard)'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>اختر طريقة الرد وقم بضبط إعدادات الذكاء الاصطناعي للبوت</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* Name Input */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>اسم البوت / الجهاز</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: بوت مبيعات شركة أولتاني"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: 'var(--glass-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--text-primary)',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Mode Selector (3 Cards) */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '1rem' }}>اختر نوع وكيفية رد البوت</label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            
            {/* Mode 1: Fixed */}
            <div 
              onClick={() => setMode('fixed')}
              className="glass-panel" 
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                border: mode === 'fixed' ? '2px solid var(--accent-cyan)' : 'var(--glass-border)',
                background: mode === 'fixed' ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-card)'
              }}
            >
              <MessageSquare size={24} color={mode === 'fixed' ? 'var(--accent-cyan)' : 'var(--text-muted)'} style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>1. الرد الثابت</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>إرسال نص محدد مسبقاً لكل من يتواصل مع الرقم.</p>
            </div>

            {/* Mode 2: QA Match */}
            <div 
              onClick={() => setMode('qa')}
              className="glass-panel" 
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                border: mode === 'qa' ? '2px solid var(--accent-cyan)' : 'var(--glass-border)',
                background: mode === 'qa' ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-card)'
              }}
            >
              <BookOpen size={24} color={mode === 'qa' ? 'var(--accent-cyan)' : 'var(--text-muted)'} style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>2. الرد بالتعليم (FAQ)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>جدول أسئلة وإجابات ومطابقة الذكاء الاصطناعي للسؤال المناسب.</p>
            </div>

            {/* Mode 3: Smart AI */}
            <div 
              onClick={() => setMode('ai')}
              className="glass-panel" 
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                border: mode === 'ai' ? '2px solid var(--accent-cyan)' : 'var(--glass-border)',
                background: mode === 'ai' ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-card)'
              }}
            >
              <Sparkles size={24} color={mode === 'ai' ? 'var(--accent-cyan)' : 'var(--text-muted)'} style={{ marginBottom: '0.5rem' }} />
              <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>3. الرد الآلي الذكي (AI)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>بوت تفاعلي كامل مخصص بشخصية وتعليمات وخدمات شركتك.</p>
            </div>

          </div>
        </div>

        {/* Dynamic Fields for Mode 1: Fixed */}
        {mode === 'fixed' && (
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>نص الرسالة الثابتة للرد</label>
            <textarea
              rows={4}
              value={fixedMessage}
              onChange={(e) => setFixedMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: 'var(--glass-border)',
                background: 'rgba(0,0,0,0.2)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem'
              }}
            />
          </div>
        )}

        {/* Dynamic Fields for Mode 2: QA Match */}
        {mode === 'qa' && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 600 }}>جدول الأسئلة والإجابات المخصصة</label>
              <button type="button" onClick={handleAddQa} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <Plus size={14} /> إضافة سؤال وجواب
              </button>
            </div>

            {qaPairs.map((pair, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="السؤال المحتمل"
                  value={pair.question}
                  onChange={(e) => handleUpdateQa(index, 'question', e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
                <input
                  type="text"
                  placeholder="الإجابة المسجلة"
                  value={pair.answer}
                  onChange={(e) => handleUpdateQa(index, 'answer', e.target.value)}
                  style={{ flex: 1.5, padding: '0.75rem', borderRadius: '10px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
                <button type="button" onClick={() => handleRemoveQa(index)} className="btn-secondary" style={{ padding: '0.75rem', color: 'var(--accent-red)' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Fields for Mode 3: Smart AI Agent (4 Core Parameters) */}
        {mode === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* 1. Persona */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                1. شخصية البوت ونبرة الكلام (Persona)
              </label>
              <textarea
                rows={3}
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="تحديد الشخصية، اللهجة، وأسلوب التحدث مع العملاء"
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
              />
            </div>

            {/* 2. Instructions */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                2. معلومات وبيانات الشركة (Instructions)
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="بيانات الشركة، العناوين، أرقام التليفونات، السياسات العامة"
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
              />
            </div>

            {/* 3. Services */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                3. السلع والخدمات والأسعار (Services)
              </label>
              <textarea
                rows={3}
                value={services}
                onChange={(e) => setServices(e.target.value)}
                placeholder="قائمة المنتجات والخدمات وأسعارها والتفاصيل والعروض المتاحة"
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
              />
            </div>

            {/* 4. Route Phone */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}>
                4. رقم تحويل طلبات الشراء/التأكيد (Route Phone)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={routePhone}
                  onChange={(e) => setRoutePhone(e.target.value)}
                  placeholder="رقم الهاتف الذي سيتحول عليه العميل عند طلب الشراء"
                  style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 2.5rem', borderRadius: '12px', border: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
                />
                <PhoneForwarded size={18} color="var(--accent-cyan)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

          </div>
        )}

        {/* Submit Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" onClick={() => onNavigate('dashboard')} className="btn-secondary">
            إلغاء
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={18} />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ وإنشاء رمز الـ QR'}</span>
          </button>
        </div>

      </form>

      {/* QR Code Popup */}
      {showQrModal && createdInstanceId && (
        <QRCodeModal
          instanceId={createdInstanceId}
          onClose={() => {
            setShowQrModal(false);
            onNavigate('dashboard');
          }}
          onConnected={() => {
            setShowQrModal(false);
            onNavigate('dashboard');
          }}
        />
      )}

    </div>
  );
}
