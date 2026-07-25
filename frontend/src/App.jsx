import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Wizard from './pages/Wizard';
import AdminPanel from './pages/AdminPanel';
import AdminGarden from './pages/AdminGarden';
import { LogIn, ShieldAlert } from 'lucide-react';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loginWithGoogle, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        جاري التحقق من هوية الحساب...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '540px', margin: '3rem auto' }}>
        <div style={{ padding: '1rem', background: 'rgba(255, 85, 0, 0.1)', borderRadius: '50%', display: 'inline-flex', color: 'var(--brand-orange)', marginBottom: '1.25rem' }}>
          <LogIn size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>يتطلب تسجيل الدخول</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          يرجى تسجيل الدخول بحساب Google للوصول إلى لوحة التحكم وإنشاء وكلاء الواتساب
        </p>
        <button onClick={loginWithGoogle} className="btn-primary" style={{ padding: '0.9rem 2rem' }}>
          <LogIn size={18} />
          <span>تسجيل الدخول مع Google</span>
        </button>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '540px', margin: '3rem auto', border: '1px solid var(--brand-red)' }}>
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'inline-flex', color: 'var(--brand-red)', marginBottom: '1.25rem' }}>
          <ShieldAlert size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>غير مصرح بالدخول</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          هذه الصفحة مخصصة فقط لمدير النظام (Superadmin: khattab8687@gmail.com)
        </p>
      </div>
    );
  }

  return children;
}

function MainLayout() {
  const [currentPage, setCurrentPage] = useState('home');
  const [editingInstance, setEditingInstance] = useState(null);

  // Register PWA service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('PWA ServiceWorker registered with scope:', reg.scope),
        (err) => console.log('PWA ServiceWorker registration failed:', err)
      );
    }
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditInstance = (inst) => {
    setEditingInstance(inst);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onNavigate={navigateTo} currentPage={currentPage} />

      <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '1.5rem 1rem', gap: '1.5rem' }}>
        {currentPage !== 'home' && (
          <Sidebar currentPage={currentPage} onNavigate={navigateTo} />
        )}

        <main style={{ flex: 1, minWidth: 0 }}>
          {currentPage === 'home' && <LandingPage onNavigate={navigateTo} />}
          {currentPage === 'dashboard' && (
            <ProtectedRoute>
              <Dashboard onNavigate={navigateTo} onEditInstance={handleEditInstance} />
            </ProtectedRoute>
          )}
          {currentPage === 'wizard' && (
            <ProtectedRoute>
              <Wizard instanceToEdit={editingInstance} onNavigate={navigateTo} />
            </ProtectedRoute>
          )}
          {currentPage === 'admin' && (
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
            </ProtectedRoute>
          )}
          {currentPage === 'admin-garden' && (
            <ProtectedRoute adminOnly={true}>
              <AdminGarden onEditInstance={handleEditInstance} onNavigate={navigateTo} />
            </ProtectedRoute>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
