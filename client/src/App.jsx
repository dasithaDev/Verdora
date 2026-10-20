import React, { useState, useEffect } from 'react';
import VerdoraCafe from './components/VerdoraCafe';
import MenuPage from './components/MenuPage';
import AdminDashboard from './components/AdminDashboard';
import ProfilePage from './components/ProfilePage';
import { getMe as apiGetMe } from './services/authService';
import './components/MenuPage.css';

const VIEW_MODES = {
  CAFE_HOME: 'cafe_home',
  DATABASE_CATALOG: 'database_catalog',
  ADMIN_DASHBOARD: 'admin_dashboard',
  PROFILE: 'profile',
};

export default function App() {
  const getInitialView = () => {
    if (window.location.hash === '#admin') return VIEW_MODES.ADMIN_DASHBOARD;
    if (window.location.hash === '#catalog') return VIEW_MODES.DATABASE_CATALOG;
    if (window.location.hash === '#profile') return VIEW_MODES.PROFILE;
    return VIEW_MODES.CAFE_HOME;
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [currentUser, setCurrentUser] = useState(null);

  // Sync current user on mount
  useEffect(() => {
    apiGetMe()
      .then((res) => {
        const u = res?.data?.user || res?.data;
        if (u) {
          setCurrentUser(u);
        }
      })
      .catch(() => {
        setCurrentUser(null);
      });

    const handleHash = () => {
      if (window.location.hash === '#admin') setCurrentView(VIEW_MODES.ADMIN_DASHBOARD);
      else if (window.location.hash === '#catalog') setCurrentView(VIEW_MODES.DATABASE_CATALOG);
      else if (window.location.hash === '#profile') setCurrentView(VIEW_MODES.PROFILE);
      else if (!window.location.hash) setCurrentView(VIEW_MODES.CAFE_HOME);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (view, hash = '') => {
    window.location.hash = hash;
    setCurrentView(view);
  };

  return (
    <div className="app-root">
      {currentView === VIEW_MODES.CAFE_HOME && (
        <VerdoraCafe
          currentUser={currentUser}
          onSwitchToCatalog={() => navigateTo(VIEW_MODES.DATABASE_CATALOG, 'catalog')}
          onSwitchToAdmin={() => navigateTo(VIEW_MODES.ADMIN_DASHBOARD, 'admin')}
          onSwitchToProfile={() => navigateTo(VIEW_MODES.PROFILE, 'profile')}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}

      {currentView === VIEW_MODES.ADMIN_DASHBOARD && (
        <AdminDashboard
          onBackToCafe={() => navigateTo(VIEW_MODES.CAFE_HOME, '')}
          onSwitchToProfile={() => navigateTo(VIEW_MODES.PROFILE, 'profile')}
          currentUser={currentUser}
        />
      )}

      {currentView === VIEW_MODES.PROFILE && (
        <ProfilePage
          currentUser={currentUser}
          onBackToCafe={() => navigateTo(VIEW_MODES.CAFE_HOME, '')}
          onSwitchToAdmin={() => navigateTo(VIEW_MODES.ADMIN_DASHBOARD, 'admin')}
          onUserUpdate={(updated) => setCurrentUser(updated)}
          onSignOut={() => {
            setCurrentUser(null);
            navigateTo(VIEW_MODES.CAFE_HOME, '');
          }}
        />
      )}

      {currentView === VIEW_MODES.DATABASE_CATALOG && (
        <div style={{ minHeight: '100vh', background: '#0c120e' }}>
          {/* Back Bar — styled to match VerdoraCafe navbar */}
          <div style={{
            background: 'rgba(10, 15, 11, 0.94)',
            borderBottom: '1px solid rgba(207, 161, 105, 0.18)',
            padding: '12px 0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
          }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => navigateTo(VIEW_MODES.CAFE_HOME, '')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(207, 161, 105, 0.08)',
                  border: '1px solid rgba(207, 161, 105, 0.4)',
                  color: '#cfa169',
                  padding: '8px 20px',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#cfa169';
                  e.currentTarget.style.color = '#0c120e';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(207, 161, 105, 0.08)';
                  e.currentTarget.style.color = '#cfa169';
                }}
              >
                ← Cafe Home
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
                <span style={{ color: '#e5cfb8', fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.04em', fontFamily: "'Outfit', sans-serif" }}>
                  Live Database Catalog
                </span>
              </div>
            </div>
          </div>

          {/* Catalog Component */}
          <div className="container" style={{ padding: '36px 24px' }}>
            <MenuPage />
          </div>
        </div>
      )}
    </div>
  );
}
