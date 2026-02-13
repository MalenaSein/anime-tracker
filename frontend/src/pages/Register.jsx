import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '', recovery_pin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!/^\d{4}$/.test(formData.recovery_pin)) {
      setError('El PIN de recuperación debe ser exactamente 4 dígitos numéricos');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      const data = await authAPI.register(dataToSend);
      if (data.error) {
        setError(data.error);
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onRegister(data.user);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
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
      color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem'
    },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#e5e7eb' },
    input: {
      width: '100%', border: '1px solid #374151', borderRadius: '0.5rem',
      padding: '0.75rem 1rem', fontSize: '1rem', transition: 'border-color 0.2s',
      boxSizing: 'border-box', background: '#111827', color: '#f9fafb'
    },
    inputWrapper: { position: 'relative' },
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
    pinBox: {
      background: '#111827', border: '1px solid #4c1d95',
      borderRadius: '0.75rem', padding: '1rem', marginTop: '0.25rem'
    },
    pinHint: { color: '#a78bfa', fontSize: '0.8rem', marginTop: '0.5rem', lineHeight: 1.5 },
    button: {
      width: '100%', backgroundColor: loading ? '#4b5563' : '#9333ea',
      color: 'white', padding: '0.875rem', borderRadius: '0.5rem',
      fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '1rem', transition: 'background-color 0.2s', marginTop: '0.5rem'
    },
    footer: { marginTop: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' },
    link: {
      color: '#a78bfa', fontWeight: '600', background: 'none',
      border: 'none', cursor: 'pointer', textDecoration: 'none', transition: 'color 0.2s'
    }
  };

  const passwordField = (field, value, show, toggleShow, placeholder) => (
    <div style={styles.inputWrapper}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        style={styles.inputWithIcon}
        placeholder={placeholder}
        required
        onFocus={(e) => e.target.style.borderColor = '#6366f1'}
        onBlur={(e) => e.target.style.borderColor = '#374151'}
      />
      <button type="button" onClick={toggleShow} style={styles.eyeButton} tabIndex={-1}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Anime Tracker</h1>
          <p style={styles.subtitle}>Creá tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre de usuario</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              style={styles.input}
              placeholder="otaku123"
              required
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>

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
            {passwordField('password', formData.password, showPassword,
              () => setShowPassword(!showPassword), '••••••••')}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmar Contraseña</label>
            {passwordField('confirmPassword', formData.confirmPassword, showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword), '••••••••')}
          </div>

          {/* PIN de recuperación */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>🔐 PIN de recuperación (4 dígitos)</label>
            <div style={styles.pinBox}>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                value={formData.recovery_pin}
                onChange={(e) => setFormData({ ...formData, recovery_pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                style={{ ...styles.input, letterSpacing: '0.5rem', fontSize: '1.5rem', textAlign: 'center' }}
                placeholder="0000"
                required
                onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
              <p style={styles.pinHint}>
                🔒 Usarás este PIN para recuperar tu contraseña si la olvidás.<br />
                <strong style={{ color: '#f9fafb' }}>¡Guardalo en un lugar seguro!</strong> No se puede recuperar.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
            onMouseOver={(e) => { if (!loading) e.target.style.background = '#7c3aed'; }}
            onMouseOut={(e) => { if (!loading) e.target.style.background = '#9333ea'; }}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            ¿Ya tenés cuenta?{' '}
            <button
              onClick={onSwitchToLogin}
              style={styles.link}
              onMouseOver={(e) => e.target.style.color = '#c4b5fd'}
              onMouseOut={(e) => e.target.style.color = '#a78bfa'}
            >
              Iniciá sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;