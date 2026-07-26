import React from 'react';
import Logo from './Logo.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useLang } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Sun, Moon, Globe, LogIn, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar({ navigate }) {
  const { theme, toggle } = useTheme();
  const { lang, toggle: toggleLang, t } = useLang();
  const { user, loginWithGoogle, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-base/80 backdrop-blur-xl border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <button onClick={() => navigate('home')} className="flex items-center" aria-label="OLTANI home">
          <Logo size={26} />
        </button>

        <div className="flex items-center gap-1.5">
          <button onClick={toggleLang} className="btn-ghost h-9 px-2.5" aria-label="Language">
            <Globe size={16} />
            <span className="text-xs font-medium">{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>

          <button onClick={toggle} className="btn-ghost h-9 w-9 p-0" aria-label="Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div className="hidden sm:flex items-center gap-2 px-2 h-9 rounded-lg bg-subtle border">
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                <span className="text-xs font-medium text-fg max-w-[120px] truncate">{user.displayName || user.email}</span>
                {isAdmin && <ShieldCheck size={14} className="text-accent" />}
              </div>
              <button onClick={logout} className="btn-ghost h-9 w-9 p-0 text-muted hover:text-err" aria-label="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="btn-primary h-9 px-3">
              <LogIn size={14} />
              <span className="text-xs">{t('loginGoogle')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
