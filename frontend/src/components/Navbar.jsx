import React, { useState } from 'react';
import { User, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid #374151',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    leftSection: {
      flex: '1',
      minWidth: '200px'
    },
    title: {
      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
      fontWeight: '700',
      color: '#f9fafb',
      marginBottom: '0.5rem',
      letterSpacing: '-0.025em'
    },
    subtitle: {
      color: '#9ca3af',
      fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
      display: 'none',
      '@media (min-width: 640px)': {
        display: 'block'
      }
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    rightSectionDesktop: {
      display: 'none',
      '@media (min-width: 640px)': {
        display: 'flex'
      }
    },
    userCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: '#1f2937',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #374151'
    },
    username: {
      fontWeight: '500',
      color: '#e5e7eb',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '150px'
    },
    logoutButton: {
      background: '#dc2626',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '500',
      fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    },
    mobileMenuButton: {
      background: '#374151',
      color: '#e5e7eb',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    mobileMenu: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '80%',
      maxWidth: '300px',
      background: '#1f2937',
      boxShadow: '-4px 0 8px rgba(0,0,0,0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      gap: '1rem',
      transform: showMobileMenu ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease'
    },
    mobileOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 999,
      display: showMobileMenu ? 'block' : 'none'
    },
    mobileMenuHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '1rem',
      borderBottom: '1px solid #374151'
    },
    mobileUserInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '1rem 0'
    },
    mobileUsername: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#f9fafb'
    },
    mobileLogoutButton: {
      width: '100%',
      background: '#dc2626',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: '500',
      fontSize: '0.95rem',
      transition: 'all 0.2s',
      marginTop: 'auto'
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.leftSection}>
          <h1 style={styles.title}> Anime Tracker</h1>
          {window.innerWidth >= 640 && (
            <p style={styles.subtitle}>Gestiona tu colección de anime</p>
          )}
        </div>
        
        {/* Desktop Menu */}
        {window.innerWidth >= 640 ? (
          <div style={styles.rightSection}>
            <div style={styles.userCard}>
              <User size={18} style={{ color: '#6366f1' }} />
              <span style={styles.username}>{user.username}</span>
            </div>
            <button
              onClick={onLogout}
              style={styles.logoutButton}
              onMouseOver={(e) => e.target.style.background = '#b91c1c'}
              onMouseOut={(e) => e.target.style.background = '#dc2626'}
            >
              <LogOut size={18} /> Salir
            </button>
          </div>
        ) : (
          /* Mobile Menu Button */
          <button
            onClick={() => setShowMobileMenu(true)}
            style={styles.mobileMenuButton}
            onMouseOver={(e) => e.target.style.background = '#4b5563'}
            onMouseOut={(e) => e.target.style.background = '#374151'}
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        style={styles.mobileOverlay}
        onClick={() => setShowMobileMenu(false)}
      />

      {/* Mobile Menu */}
      <div style={styles.mobileMenu}>
        <div style={styles.mobileMenuHeader}>
          <h2 style={{ color: '#f9fafb', fontSize: '1.2rem', margin: 0 }}>Menú</h2>
          <button
            onClick={() => setShowMobileMenu(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={styles.mobileUserInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: '#6366f1' }} />
            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Usuario</span>
          </div>
          <div style={styles.mobileUsername}>{user.username}</div>
        </div>

        <button
          onClick={() => {
            setShowMobileMenu(false);
            onLogout();
          }}
          style={styles.mobileLogoutButton}
          onMouseOver={(e) => e.target.style.background = '#b91c1c'}
          onMouseOut={(e) => e.target.style.background = '#dc2626'}
        >
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </div>
    </>
  );
};

export default Navbar;