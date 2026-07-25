import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Globe, LogIn, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar({ onNavigate, currentPage }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, loginWithGoogle, logout, isAdmin } = useAuth();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(0, 242, 254, 0.4)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>OLTANI</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>WhatsApp AI SaaS</span>
          </div>
        </div>

        {/* Quick Nav Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage} 
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          >
            <Globe size={16} />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          >
            {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#0284c7" />}
          </button>

          {/* Auth Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: 'var(--glass-border)' }}>
                <img src={user.photoURL} alt={user.displayName} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.displayName}</span>
                {isAdmin && <ShieldCheck size={16} color="#00f2fe" title="Admin" />}
              </div>
              <button onClick={logout} className="btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
              <LogIn size={16} />
              <span>{t('login')}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
