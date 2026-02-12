import React, { useState } from 'react';
import { authAPI } from '../services/api';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
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
    title: {
      fontSize: '1.75rem', fontWeight: '700', color: '#f9fafb',
      marginBottom: '0.5rem', textAlign: 'center'
    },
    subtitle: { color: '#9ca3af', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' },
    label: { fontSize: '0.875rem', fontWeight: '600', color: '#e5e7eb' },
    input: {
      width: '100%', border: '1px solid #374151', borderRadius: '0.5rem',
      padding: '0.75rem 1rem', fontSize: '1rem', background: '#111827',
      color: '#f9fafb', boxSizing: 'border-box', transition: 'border-color 0.2s'
    },
    button: {
      width: '100%', backgroundColor: loading ? '#4b5563' : '#9333ea',
      color: 'white', padding: '0.875rem', borderRadius: '0.5rem',
      fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: '1rem', marginBottom: '1rem'
    },
    backButton: {
      width: '100%', backgroundColor: 'transparent', color: '#a78bfa',
      padding: '0.75rem', borderRadius: '0.5rem', fontWeight: '500',
      border: '1px solid #4c1d95', cursor: 'pointer', fontSize: '0.95rem'
    },
    error: {
      backgroundColor: '#7f1d1d', border: '1px solid #991b1b',
      color: '#fca5a5', padding: '0.75rem 1rem',
      borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem'
    },
    success: {
      backgroundColor: '#064e3b', border: '1px solid #065f46',
      color: '#6ee7b7', padding: '1.25rem 1rem',
      borderRadius: '0.5rem', fontSize: '0.9rem', textAlign: 'center',
      lineHeight: '1.6', marginBottom: '1.5rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Recuperar Contraseña</h1>
        <p style={styles.subtitle}>
          Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña
        </p>

        {sent ? (
          <>
            <div style={styles.success}>
              ✅ Si el email existe en nuestra base de datos, recibirás las instrucciones para restablecer tu contraseña en los próximos minutos.<br /><br />
              <strong>Revisá también tu carpeta de spam.</strong>
            </div>
            <button onClick={onBack} style={styles.backButton}>
              ← Volver al inicio de sesión
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="tu@email.com"
                required
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#374151'}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>

            <button type="button" onClick={onBack} style={styles.backButton}>
              ← Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;