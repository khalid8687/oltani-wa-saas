import React from 'react';
import OltaniLogo from './OltaniLogo';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Globe, LogIn, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ onNavigate, currentPage }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, loginWithGoogle, logout, isAdmin } = useAuth();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.85rem 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Official OLTANI Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          style={{ cursor: 'pointer' }}
        >
          <OltaniLogo size="medium" showTagline={true} />
        </div>

        {/* Quick Nav Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            <Globe size={16} />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#3b82f6" />}
          </button>

          {/* Real Firebase Google Auth Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: 'var(--glass-border)' }}>
                <img src={user.photoURL} alt={user.displayName} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.displayName}</span>
                {isAdmin && <ShieldCheck size={16} color="var(--brand-orange)" title="Admin" />}
              </div>
              <button onClick={logout} className="btn-secondary" style={{ padding: '0.5rem 0.75rem', borderRadius: '10px', color: 'var(--brand-red)' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="btn-primary" style={{ padding: '0.55rem 1.3rem', fontSize: '0.85rem', borderRadius: '10px' }}>
              <LogIn size={16} />
              <span>{t('login')}</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
