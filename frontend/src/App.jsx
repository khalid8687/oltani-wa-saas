import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Wizard from './pages/Wizard';
import AdminPanel from './pages/AdminPanel';
import AdminGarden from './pages/AdminGarden';

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
            <Dashboard onNavigate={navigateTo} onEditInstance={handleEditInstance} />
          )}
          {currentPage === 'wizard' && (
            <Wizard instanceToEdit={editingInstance} onNavigate={navigateTo} />
          )}
          {currentPage === 'admin' && <AdminPanel />}
          {currentPage === 'admin-garden' && (
            <AdminGarden onEditInstance={handleEditInstance} onNavigate={navigateTo} />
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
