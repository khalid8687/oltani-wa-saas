import React from 'react';
import { useLang } from '../contexts/LanguageContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Home, LayoutDashboard, PlusCircle, Shield, Flower2 } from 'lucide-react';
import { classnames } from '../lib/utils.js';

export default function Sidebar({ current, navigate }) {
  const { t } = useLang();
  const { isAdmin } = useAuth();

  const items = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'wizard', label: t('create'), icon: PlusCircle }
  ];

  if (isAdmin) {
    items.push({ id: 'admin', label: t('admin'), icon: Shield });
    items.push({ id: 'admin-garden', label: t('garden'), icon: Flower2 });
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-20 self-start gap-1">
      {items.map(({ id, label, icon: Icon }) => {
        const active = current === id;
        return (
          <button
            key={id}
            onClick={() => navigate(id)}
            className={classnames(
              'group flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent',
              active
                ? 'bg-subtle text-fg border-border'
                : 'text-muted hover:text-fg hover:bg-subtle/50'
            )}
          >
            <Icon size={16} className={active ? 'text-accent' : 'text-muted group-hover:text-fg'} />
            <span>{label}</span>
          </button>
        );
      })}
    </aside>
  );
}
