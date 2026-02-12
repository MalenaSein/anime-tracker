import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✨ NUEVO

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(formData);
      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    },
    card: {
      background: '#1f2937',
      borderRadius: '1rem',
      border: '1px solid #374151',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '28rem'
    },
    header: { textAlign: 'center', marginBottom: '2rem' },
    title: {
      fontSize: '2.5rem', fontWeight: '700', color: '#f9fafb',
      marginBottom: '0.5rem', letterSpacing: '-0.025em'
    },
    subtitle: { color: '#9ca3af', fontSize: '0.95rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    error: {
      backgroundColor: '#7f1d1d', border: '1px solid #991b1b',
      color: '#fca5a5', padding: '0.75rem 1rem',
      borderRadius: '0.5rem', fontSize: '0.875rem'
    },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#e5e7eb' },
    inputWrapper: { position: 'relative' },
    input: {
      width: '100%', border: '1px solid #374151', borderRadius: '0.5rem',
      padding: '0.75rem 1rem', fontSize: '1rem', transition: 'border-color 0.2s',
      boxSizing: 'border-box', background: '#111827', color: '#f9fafb'
    },
    inputWithIcon: {
      width: '100%', border: '1px solid #374151', borderRadius: '0.5rem',
      padding: '0.75rem 3rem 0.75rem 1rem', fontSize: '1rem',
      transition: 'border-color 0.2s', boxSizing: 'border-box',
      background: '#111827', color: '#f9fafb'
    },
    eyeButton: {
      position: 'absolute', right: '0.75rem', top: '50%',
      transform: 'translateY(-50%)', background: 'none', border: 'none',
      cursor: 'pointer', color: '#6b7280', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '0.25rem'
    },
    button: {
      width: '100%', backgroundColor: loading ? '#4b5563' : '#9333ea',
      color: 'white', padding: '0.875rem', borderRadius: '0.5rem',
      fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '1rem', transition: 'background-color 0.2s', marginTop: '0.5rem'
    },
    forgotLink: {
      textAlign: 'right', marginTop: '-0.5rem'
    },
    footer: { marginTop: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' },
    link: {
      color: '#a78bfa', fontWeight: '600', background: 'none',
      border: 'none', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Anime Tracker</h1>
          <p style={styles.subtitle}>Iniciá sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              placeholder="tu@email.com"
              required
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>

          {/* ✨ Campo contraseña con mostrar/ocultar */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={styles.inputWithIcon}
                placeholder="••••••••"
                required
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ✨ Link recuperar contraseña */}
          <div style={styles.forgotLink}>
            <button
              type="button"
              onClick={onForgotPassword}
              style={{ ...styles.link, fontSize: '0.85rem' }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
            onMouseOver={(e) => { if (!loading) e.target.style.background = '#7c3aed'; }}
            onMouseOut={(e) => { if (!loading) e.target.style.background = '#9333ea'; }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            ¿No tenés cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              style={styles.link}
              onMouseOver={(e) => e.target.style.color = '#c4b5fd'}
              onMouseOut={(e) => e.target.style.color = '#a78bfa'}
            >
              Registrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;