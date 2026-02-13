import React, { useState } from 'react';
import { User, LogOut, Menu, X, Settings } from 'lucide-react';
import ProfileModal from './ProfileModal';
import NotificationButton from './NotificationButton';
const Navbar = ({ user, onLogout, onUserUpdated }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const styles = {
    container: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #374151',
      flexWrap: 'wrap', gap: '1rem'
    },
    leftSection: { flex: '1', minWidth: '200px' },
    title: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700', color: '#f9fafb',
      marginBottom: '0.5rem', letterSpacing: '-0.025em'
    },
    subtitle: { color: '#9ca3af', fontSize: 'clamp(0.8rem, 2vw, 0.95rem)' },
    rightSection: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    userCard: {
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      background: '#1f2937', padding: '0.5rem 1rem',
      borderRadius: '0.5rem', border: '1px solid #374151'
    },
    username: {
      fontWeight: '500', color: '#e5e7eb',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', whiteSpace: 'nowrap',
      overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px'
    },
    profileButton: {
      background: '#374151', color: '#e5e7eb', padding: '0.5rem 0.875rem',
      borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      fontWeight: '500', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      transition: 'all 0.2s', whiteSpace: 'nowrap'
    },
    logoutButton: {
      background: '#dc2626', color: 'white', padding: '0.5rem 1rem',
      borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      fontWeight: '500', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      transition: 'all 0.2s', whiteSpace: 'nowrap'
    },
    mobileMenuButton: {
      background: '#374151', color: '#e5e7eb', padding: '0.5rem',
      borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    mobileMenu: {
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '80%', maxWidth: '300px',
      background: '#1f2937', boxShadow: '-4px 0 8px rgba(0,0,0,0.3)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      padding: '1.5rem', gap: '1rem',
      transform: showMobileMenu ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease'
    },
    mobileOverlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 999, display: showMobileMenu ? 'block' : 'none'
    }
  };

  const handleAccountDeleted = () => {
    setShowProfile(false);
    onLogout();
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.leftSection}>
          <h1 style={styles.title}>Anime Tracker</h1>
          {window.innerWidth >= 640 && (
            <p style={styles.subtitle}>Gestioná tu colección de anime</p>
          )}
        </div>

        {/* Desktop */}
        {window.innerWidth >= 640 ? (
          <div style={styles.rightSection}>
            <div style={styles.userCard}>
              <User size={18} style={{ color: '#6366f1' }} />
              <span style={styles.username}>{user.username}</span>
            </div>
            <NotificationButton isMobile={false} />
            <button
              onClick={() => setShowProfile(true)}
              style={styles.profileButton}
              onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
              onMouseOut={(e) => e.currentTarget.style.background = '#374151'}
            >
              <Settings size={16} /> Perfil
            </button>
            <button
              onClick={onLogout}
              style={styles.logoutButton}
              onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
              onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
            >
              <LogOut size={18} /> Salir
            </button>
          </div>
        ) : (
          <button onClick={() => setShowMobileMenu(true)} style={styles.mobileMenuButton}>
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* Mobile overlay */}
      <div style={styles.mobileOverlay} onClick={() => setShowMobileMenu(false)} />

      {/* Mobile menu */}
      <div style={styles.mobileMenu}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #374151' }}>
          <h2 style={{ color: '#f9fafb', fontSize: '1.2rem', margin: 0 }}>Menú</h2>
          <button onClick={() => setShowMobileMenu(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: '#6366f1' }} />
            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Usuario</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#f9fafb' }}>{user.username}</div>
        </div>

        <button
          onClick={() => { setShowMobileMenu(false); setShowProfile(true); }}
          style={{ width: '100%', background: '#374151', color: '#e5e7eb', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.95rem' }}
        >
          <Settings size={18} /> Editar Perfil
        </button>

        <div style={{ width: '100%' }}>
          <NotificationButton isMobile={false} />
        </div>

        <button
          onClick={() => { setShowMobileMenu(false); onLogout(); }}
          style={{ width: '100%', background: '#dc2626', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.95rem', marginTop: 'auto' }}
        >
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </div>

      {/* Modal de perfil */}
      <ProfileModal
        show={showProfile}
        user={user}
        onClose={() => setShowProfile(false)}
        onUsernameChanged={(updatedUser) => {
          if (onUserUpdated) onUserUpdated(updatedUser);
        }}
        onAccountDeleted={handleAccountDeleted}
      />
    </>
  );
};

export default Navbar;