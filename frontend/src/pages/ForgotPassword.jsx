import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Error al enviar el email. Intentá nuevamente.');
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
    subtitle: {
      color: '#9ca3af', fontSize: '0.95rem',
      textAlign: 'center', marginBottom: '2rem', lineHeight: '1.5'
    },
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
      fontSize: '1rem', marginBottom: '0.75rem', transition: 'background-color 0.2s'
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
    successBox: {
      background: '#064e3b', border: '1px solid #065f46',
      borderRadius: '0.75rem', padding: '1.5rem',
      textAlign: 'center', marginBottom: '1.5rem'
    },
    successIcon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
    successTitle: { color: '#6ee7b7', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' },
    successText: { color: '#a7f3d0', fontSize: '0.875rem', lineHeight: '1.6' },
    hint: {
      color: '#6b7280', fontSize: '0.8rem',
      textAlign: 'center', marginTop: '1rem', lineHeight: '1.5'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Recuperar Contraseña</h1>

        {!sent ? (
          <>
            <p style={styles.subtitle}>
              Ingresá tu email y te mandamos un link para restablecer tu contraseña.
            </p>

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

              <button
                type="submit"
                disabled={loading}
                style={styles.button}
                onMouseOver={(e) => { if (!loading) e.target.style.background = '#7c3aed'; }}
                onMouseOut={(e) => { if (!loading) e.target.style.background = '#9333ea'; }}
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>

              <button type="button" onClick={onBack} style={styles.backButton}>
                ← Volver al login
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={styles.successBox}>
              <div style={styles.successIcon}>📧</div>
              <p style={styles.successTitle}>¡Email enviado!</p>
              <p style={styles.successText}>
                Revisá tu bandeja de entrada en <strong>{email}</strong> y seguí el link para crear una nueva contraseña.
              </p>
            </div>

            <button type="button" onClick={onBack} style={styles.backButton}>
              ← Volver al login
            </button>

            <p style={styles.hint}>
              ¿No llegó el email? Revisá la carpeta de spam o{' '}
              <button
                onClick={() => setSent(false)}
                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                intentá nuevamente
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;