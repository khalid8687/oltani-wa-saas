import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, Shield, Flower2, Home } from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'wizard', label: t('createInstance'), icon: PlusCircle }
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: t('adminPanel'), icon: Shield });
    navItems.push({ id: 'admin-garden', label: t('adminGarden'), icon: Flower2 });
  }

  return (
    <aside className="glass-panel" style={{ width: '260px', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 'calc(100vh - 80px)' }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              textAlign: 'start',
              background: isActive ? 'linear-gradient(135deg, rgba(0,242,254,0.15) 0%, rgba(79,172,254,0.15) 100%)' : 'transparent',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent'
            }}
          >
            <Icon size={20} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
