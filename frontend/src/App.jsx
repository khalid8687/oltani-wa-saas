import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { LanguageProvider, useLang } from './contexts/LanguageContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Wizard from './pages/Wizard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import AdminGarden from './pages/AdminGarden.jsx';
import LoginGate from './components/LoginGate.jsx';
import { ShieldAlert } from 'lucide-react';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loginWithGoogle, isAdmin, loading } = useAuth();
  const { t } = useLang();

  if (loading) {
    return (
      <div className="surface p-12 text-center text-muted animate-pulse-soft">
        {t('loading')}
      </div>
    );
  }
  if (!user) return <LoginGate onLogin={loginWithGoogle} />;
  if (adminOnly && !isAdmin) {
    return (
      <div className="surface p-12 max-w-lg mx-auto text-center border-err/30">
        <div className="inline-flex p-3 rounded-full bg-err/10 text-err mb-4">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-bold mb-1">{t('errAdmin')}</h2>
      </div>
    );
  }
  return children;
}

function Shell() {
  const [page, setPage] = useState('home');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    // PWA shortcut query string
    const params = new URLSearchParams(window.location.search);
    const p = params.get('page');
    if (p && ['home', 'dashboard', 'wizard', 'admin', 'admin-garden'].includes(p)) {
      setPage(p);
    }
  }, []);

  const navigate = useCallback((p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const editInstance = useCallback((inst) => setEditing(inst), []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar navigate={navigate} />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex gap-6">
        {page !== 'home' && <Sidebar current={page} navigate={navigate} />}
        <main className="flex-1 min-w-0 animate-fade-in" key={page}>
          {page === 'home' && <LandingPage onNavigate={navigate} />}
          {page === 'dashboard' && (
            <ProtectedRoute>
              <Dashboard onNavigate={navigate} onEdit={editInstance} />
            </ProtectedRoute>
          )}
          {page === 'wizard' && (
            <ProtectedRoute>
              <Wizard instance={editing} onNavigate={navigate} />
            </ProtectedRoute>
          )}
          {page === 'admin' && (
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          )}
          {page === 'admin-garden' && (
            <ProtectedRoute adminOnly>
              <AdminGarden onNavigate={navigate} onEdit={editInstance} />
            </ProtectedRoute>
          )}
        </main>
      </div>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
