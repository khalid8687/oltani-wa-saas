import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Bot, Zap, MessageSquare, Shield, Check, MessageCircle, Gift } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const { t } = useLanguage();
  const { loginWithGoogle, user } = useAuth();

  const handleStart = () => {
    if (user) {
      onNavigate('dashboard');
    } else {
      loginWithGoogle();
      onNavigate('dashboard');
    }
  };

  const whatsappNumber = '201002194451';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن الاشتراك والترقية في منصة أولتاني لوكلاء الواتساب')}`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* 1-Week Free Trial Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Gift size={28} color="#f59e0b" />
          <div>
            <h4 style={{ fontWeight: 700, color: '#f59e0b', fontSize: '1.05rem' }}>عرض تجريبي خاص!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              احصل على تجربة مجانية لمدة 7 أيام للنسخة الـ Pro لاختبار جميع إمكانيات الذكاء الاصطناعي على رقمك!
            </p>
          </div>
        </div>
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noreferrer"
          className="btn-primary" 
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', textDecoration: 'none' }}
        >
          <MessageCircle size={18} />
          <span>طلب التجربة المجانية</span>
        </a>
      </div>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '3rem 1rem', marginBottom: '4rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <Sparkles size={16} />
          <span>الجيل الجديد من وكلاء الواتساب بالذكاء الاصطناعي</span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem' }}>
          أدر حسابات واتساب شركتك بـ <span className="gradient-text">الذكاء الاصطناعي الذكي</span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          منصة أولتاني OLTANI تمنحك إمكانية ربط أرقام واتساب متعددة (Multi-Instance) عبر Baileys، والرد الآلي الذكي على عملائك باستخدام محرك Gemini المتطور.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleStart} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
            <Zap size={20} />
            <span>ابدأ مجاناً الآن</span>
          </button>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem', textDecoration: 'none' }}>
            <MessageCircle size={20} color="#10b981" />
            <span>تواصل مع الدعم والمبيعات</span>
          </a>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>خطط الاشتراك والأسعار</h2>
          <p style={{ color: 'var(--text-secondary)' }}>اختر الخطة المناسبة لحجم أعمالك مع إمكانية الترقية في أي وقت</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Free Plan */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>الخطة المجانية (Free)</h3>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '1rem 0' }}>
              $0 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ مجاناً مدى الحياة</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.5rem 0', flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#10b981" /> وكيل واتساب واحد (1 Instance)</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#10b981" /> دعم الرد الثابت والرد بالتعليم</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#10b981" /> الرد الذكي محدود بـ <strong>50 رسالة يومياً</strong></li>
            </ul>
            <button onClick={handleStart} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              البدء بالخطة المجانية
            </button>
          </div>

          {/* Pro Plan */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: '2px solid var(--accent-cyan)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-cyan)', color: '#000', padding: '0.2rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
              الأكثر شعبية 🔥
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>خطة المحترفين (Pro)</h3>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '1rem 0', color: 'var(--accent-cyan)' }}>
              $10 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ شهرياً</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.5rem 0', flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#00f2fe" /> حتى 3 وكلاء واتساب</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#00f2fe" /> تجربة مجانية لمدة أسبوع</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#00f2fe" /> الرد الذكي حتى <strong>300 رسالة يومياً</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#00f2fe" /> تخصيص الـ Persona والـ Route Phone</li>
            </ul>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
              اشترك الآن عبر الواتساب
            </a>
          </div>

          {/* Ultra Plan */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>خطة التميّز (Ultra)</h3>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '1rem 0', color: '#c084fc' }}>
              $20 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ شهرياً</span>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.5rem 0', flex: 1, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#c084fc" /> وكلاء واتساب غير محدودين</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#c084fc" /> الرد الذكي حتى <strong>1000 رسالة يومياً</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#c084fc" /> أولوية الاستجابة والدعم الفني المباشر</li>
            </ul>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
              اشترك في Ultra
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
