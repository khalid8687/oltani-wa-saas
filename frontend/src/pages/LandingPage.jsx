import React from 'react';
import OltaniLogo from '../components/OltaniLogo';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Bot, Zap, Shield, Check, MessageCircle, Gift, Cpu, ArrowLeft, Network, Smartphone } from 'lucide-react';

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
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('مرحباً شركة أولتاني OLTANI، أود الاستفسار عن تجربة وترقية وكلاء الواتساب الذكية')}`;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      
      {/* 1-Week Free Trial Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 85, 0, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
        border: '1px solid rgba(255, 85, 0, 0.4)',
        borderRadius: '20px',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '3rem',
        gap: '1.5rem',
        flexWrap: 'wrap',
        boxShadow: '0 8px 32px rgba(255, 85, 0, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.65rem', background: 'rgba(255, 85, 0, 0.2)', borderRadius: '14px', color: 'var(--brand-orange)' }}>
            <Gift size={28} />
          </div>
          <div>
            <h4 style={{ fontWeight: 800, color: 'var(--brand-orange)', fontSize: '1.1rem' }}>احصل على تجربة مجانية لمدة 7 أيام تجربة كاملة!</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              جرب باقة المحترفين Pro بدون أي تكاليف لاختبار قوة الرد بالذكاء الاصطناعي على أرقام عملائك
            </p>
          </div>
        </div>

        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noreferrer"
          className="btn-primary" 
          style={{ textDecoration: 'none', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
        >
          <MessageCircle size={18} />
          <span>تواصل لطلب التجربة المجانية</span>
        </a>
      </div>

      {/* World-Class Hero Showcase Section */}
      <div style={{ textAlign: 'center', padding: '4rem 1rem 3rem', position: 'relative' }}>
        
        {/* Glow Tagline Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1.25rem', borderRadius: '9999px', background: 'rgba(0, 210, 255, 0.08)', border: '1px solid rgba(0, 210, 255, 0.3)', color: 'var(--brand-cyan)', fontSize: '0.88rem', fontWeight: 700, marginBottom: '2rem' }}>
          <Sparkles size={16} />
          <span>منصة أولتاني OLTANI لأتمتة الواتساب المتعددة بالذكاء الاصطناعي</span>
        </div>

        <h1 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          شريكك الرقمي المتكامل لـ <span className="gradient-text-oltani">أتمتة الواتساب والذكاء الاصطناعي</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '820px', margin: '0 auto 3rem', lineHeight: 1.75 }}>
          ربط أرقام الواتساب للشركات والمستخدمين بنظام Multi-Instance المتطور، مدعوماً بـ <strong>10 مفاتيح Gemini API</strong> متزامنة للتفاعل التلقائي والرد على العملاء بدقة وإدارة المبيعات والحجوزات.
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <button onClick={handleStart} className="btn-primary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.05rem', borderRadius: '16px' }}>
            <Zap size={22} />
            <span>البدء وإصدار أول بوت مجاناً</span>
          </button>

          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '1.1rem 2.2rem', fontSize: '1.05rem', textDecoration: 'none', borderRadius: '16px' }}>
            <MessageCircle size={22} color="var(--brand-green)" />
            <span>الدعم الفني والاشتراكات المباشرة</span>
          </a>
        </div>

        {/* Feature Cards Showcase Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', textAlign: 'start' }}>
          
          <div className="glass-panel glass-panel-hover" style={{ padding: '1.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 85, 0, 0.1)', borderRadius: '14px', width: 'fit-content', color: 'var(--brand-orange)', marginBottom: '1.25rem' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>موازن الأحمال (10 Gemini APIs)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              تدوير تلقائي ذكي بين 10 مفاتيح Gemini API لضمان الرد اللحظي دون أي توقف أو تجاوز للحد الأقصى.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover" style={{ padding: '1.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '14px', width: 'fit-content', color: 'var(--brand-cyan)', marginBottom: '1.25rem' }}>
              <Network size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>3 أنماط رد للبوت (Agents)</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              الرد الثابت، الرد التعليمي بالأسئلة والأجوبة FAQ، أو الرد الذكي المخصص بشخصية شركتك والخدمات.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover" style={{ padding: '1.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px', width: 'fit-content', color: 'var(--brand-green)', marginBottom: '1.25rem' }}>
              <Smartphone size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>تطبيق PWA مستقل وسريع</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              تثبيت المنصة مباشرة كـ App على أجهزة iPhone و Android مع أيقونة واضحة وتنبيهات فورية.
            </p>
          </div>

        </div>
      </div>

      {/* World-Class Pricing Cards Section */}
      <div style={{ padding: '3rem 0 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>خطط الاشتراكات المناسبة لأعمالك</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>اختر الباقة المناسبة لحجم اتصالاتك وتواصل معنا للترقية الفورية</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Free Plan */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>الخطة المجانية (Free)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>لتجربة الخدمة والربط المباشر</span>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1.5rem 0', color: 'var(--text-primary)' }}>
              $0 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ مجاناً مدى الحياة</span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '1.5rem 0', flex: 1, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="var(--brand-green)" /> وكيل واتساب واحد (1 Instance)</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="var(--brand-green)" /> دعم نمط الرد الثابت ونمط الرد التعليمي</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="var(--brand-green)" /> الرد بالذكاء الاصطناعي حتى <strong>50 رسالة يومياً</strong></li>
            </ul>

            <button onClick={handleStart} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderRadius: '12px' }}>
              البدء الآن بالمجان
            </button>
          </div>

          {/* Pro Plan (Featured) */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', border: '2px solid var(--brand-orange)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brand-orange)', color: '#ffffff', padding: '0.25rem 1.25rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em' }}>
              الخطة الأكثر طلباً 🔥
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>خطة المحترفين (Pro)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--brand-orange)', fontWeight: 600 }}>شاملة تجربة مجانية لمدة 7 أيام!</span>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1.5rem 0', color: 'var(--brand-orange)' }}>
              $10 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ شهرياً</span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '1.5rem 0', flex: 1, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="var(--brand-orange)" /> حتى 3 وكلاء واتساب نشطين</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="var(--brand-orange)" /> تجربة مجانية كاملة لمدة أسبوع</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="var(--brand-orange)" /> الرد الآلي الذكي حتى <strong>300 رسالة يومياً</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="var(--brand-orange)" /> تخصيص الـ Persona و Route Phone للتحويل</li>
            </ul>

            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', borderRadius: '12px' }}>
              تواصل لطلب باقة Pro
            </a>
          </div>

          {/* Ultra Plan */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>خطة التميّز (Ultra)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>للشركات والمؤسسات ذات الأثر الكثيف</span>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, margin: '1.5rem 0', color: '#c084fc' }}>
              $20 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ شهرياً</span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '1.5rem 0', flex: 1, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="#c084fc" /> وكلاء واتساب غير محدودين</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="#c084fc" /> الرد الآلي الذكي حتى <strong>1000 رسالة يومياً</strong></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Check size={18} color="#c084fc" /> أولوية الدعم والاستشارات المباشرة</li>
            </ul>

            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', borderRadius: '12px' }}>
              تواصل لطلب باقة Ultra
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
