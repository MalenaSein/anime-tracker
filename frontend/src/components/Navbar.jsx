import React, { useState } from 'react';
import { User, LogOut, Filter, TrendingUp, Award, Star, BarChart3 } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid #374151'
    },
    leftSection: {
      flex: 1
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#f9fafb',
      marginBottom: '0.5rem',
      letterSpacing: '-0.025em'
    },
    subtitle: {
      color: '#9ca3af',
      fontSize: '0.95rem'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    userCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: '#1f2937',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      border: '1px solid #374151'
    },
    username: {
      fontWeight: '500',
      color: '#e5e7eb',
      fontSize: '0.9rem'
    },
    logoutButton: {
      background: '#dc2626',
      color: 'white',
      padding: '0.625rem 1.25rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '500',
      fontSize: '0.9rem',
      transition: 'all 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSection}>
        <h1 style={styles.title}>Anime Tracker</h1>
        <p style={styles.subtitle}>Gestiona tu colección de anime</p>
      </div>
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
    </div>
  );
};

export default Navbar;