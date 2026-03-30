import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onLogin({
          id: result.user.uid,
          username: result.user.displayName || result.user.email.split('@')[0],
          email: result.user.email
        });
      } else {
        setError(result.error);
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoadingGoogle(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        onLogin({
          id: result.user.uid,
          username: result.user.displayName || result.user.email.split('@')[0],
          email: result.user.email,
          photoURL: result.user.photoURL
        });
      } else if (!result.cancelled) {
        setError(result.error);
      }
    } catch {
      setError('Error al iniciar sesión con Google');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    },
    card: {
      background: '#1f2937', borderRadius: '1rem', border: '1px solid #374151',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
      padding: '2.5rem', width: '100%', maxWidth: '28rem'
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
    forgotLink: { textAlign: 'right', marginTop: '-0.5rem' },
    button: {
      width: '100%', backgroundColor: loading ? '#4b5563' : '#9333ea',
      color: 'white', padding: '0.875rem', borderRadius: '0.5rem',
      fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '1rem', transition: 'background-color 0.2s', marginTop: '0.5rem'
    },
    divider: {
      display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0'
    },
    dividerLine: { flex: 1, height: '1px', background: '#374151' },
    dividerText: { color: '#6b7280', fontSize: '0.8rem', whiteSpace: 'nowrap' },
    googleButton: {
      width: '100%', backgroundColor: loadingGoogle ? '#4b5563' : '#ffffff',
      color: '#1f2937', padding: '0.875rem', borderRadius: '0.5rem',
      fontWeight: '600', border: '1px solid #374151',
      cursor: loadingGoogle ? 'not-allowed' : 'pointer',
      fontSize: '1rem', transition: 'background-color 0.2s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem'
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={styles.input}
              placeholder="tu@email.com"
              required
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>o continuá con</span>
          <div style={styles.dividerLine} />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loadingGoogle}
          style={styles.googleButton}
          onMouseOver={(e) => { if (!loadingGoogle) e.target.style.background = '#f3f4f6'; }}
          onMouseOut={(e) => { if (!loadingGoogle) e.target.style.background = '#ffffff'; }}
        >
          {/* Ícono de Google en SVG */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loadingGoogle ? 'Conectando...' : 'Continuar con Google'}
        </button>

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