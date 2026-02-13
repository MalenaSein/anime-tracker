import React, { useState } from 'react';

const ForgotPassword = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: pedir email, 2: ingresar código
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  // ============================================
  // PASO 1: GENERAR CÓDIGO
  // ============================================
  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar código');
      }

      if (data.codeGenerated) {
        setGeneratedCode(data.resetCode);
        setUsername(data.username);
        setStep(2);
      } else {
        setError('Email no encontrado');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PASO 2: CAMBIAR CONTRASEÑA CON CÓDIGO
  // ============================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          code: resetCode, 
          newPassword 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar contraseña');
      }

      alert('¡Contraseña cambiada exitosamente!');
      onBack();

    } catch (error) {
      setError(error.message);
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
      padding: '2.5rem', width: '100%', maxWidth: '32rem'
    },
    title: {
      fontSize: '1.75rem', fontWeight: '700', color: '#f9fafb',
      marginBottom: '0.5rem', textAlign: 'center'
    },
    subtitle: { color: '#9ca3af', fontSize: '0.95rem', textAlign: 'center', marginBottom: '2rem' },
    codeDisplay: {
      background: '#111827', padding: '1.5rem', borderRadius: '0.75rem',
      marginBottom: '1.5rem', border: '2px solid #6366f1'
    },
    codeBox: {
      display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'
    },
    code: {
      fontSize: '2rem', fontWeight: 'bold', color: '#6366f1',
      letterSpacing: '0.25rem', fontFamily: 'monospace', flex: 1
    },
    copyButton: {
      padding: '0.5rem 1rem', background: '#6366f1', color: 'white',
      border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
      fontSize: '0.875rem', fontWeight: '500'
    },
    infoText: {
      color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.5'
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
      fontSize: '1rem', marginBottom: '0.75rem'
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
    small: {
      display: 'block', color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Recuperar Contraseña</h1>

        {step === 1 && (
          <>
            <p style={styles.subtitle}>
              Ingresá tu email para generar un código de recuperación
            </p>

            <form onSubmit={handleGenerateCode}>
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
                {loading ? 'Generando...' : 'Generar código'}
              </button>

              <button type="button" onClick={onBack} style={styles.backButton}>
                ← Volver al login
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p style={styles.subtitle}>
              Tu código de recuperación:
            </p>

            <div style={styles.codeDisplay}>
              <div style={styles.codeBox}>
                <span style={styles.code}>{generatedCode}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    alert('Código copiado');
                  }}
                  style={styles.copyButton}
                >
                  📋 Copiar
                </button>
              </div>
              <p style={styles.infoText}>
                Usuario: <strong style={{color: '#f9fafb'}}>{username}</strong><br/>
                Válido por: <strong style={{color: '#f9fafb'}}>1 hora</strong><br/>
                ⚠️ Guarda este código en un lugar seguro
              </p>
            </div>

            <form onSubmit={handleResetPassword}>
              {error && <div style={styles.error}>{error}</div>}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Código de recuperación</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  style={styles.input}
                  placeholder="123456"
                  maxLength={6}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
                <small style={styles.small}>Ingresa el código de 6 dígitos de arriba</small>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  placeholder="Repetir contraseña"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>

              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>

              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={styles.backButton}
              >
                ← Volver
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;