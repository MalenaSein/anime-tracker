import React, { useState } from 'react';

const ForgotPassword = ({ onBack }) => {
  // step 1: ingresar email
  // step 2a: ingresar PIN → cambiar contraseña
  // step 2b: usuario sin PIN → crear PIN con usuario+email
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasPin, setHasPin] = useState(true); // si el usuario tiene PIN configurado
  const [newPin, setNewPin] = useState('');   // para usuarios sin PIN que van a crearlo
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const _rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const API_URL = _rawUrl.endsWith('/api') ? _rawUrl : _rawUrl + '/api';

  // ============================================
  // PASO 1: verificar si el email existe y tiene PIN
  // ============================================
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/check-recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al verificar email');

      if (!data.exists) {
        setError('No existe una cuenta con ese email');
        return;
      }

      setHasPin(data.hasPin);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PASO 2A: cambiar contraseña con PIN
  // ============================================
  const handleResetWithPin = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (!/^\d{4}$/.test(pin)) { setError('El PIN debe ser 4 dígitos'); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al cambiar contraseña');
      alert('¡Contraseña cambiada exitosamente! Ya podés iniciar sesión.');
      onBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PASO 2B: usuarios sin PIN → crear PIN con usuario+email
  // ============================================
  const handleSetupPin = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{4}$/.test(newPin)) { setError('El PIN debe ser exactamente 4 dígitos'); return; }
    if (newPin !== confirmNewPin) { setError('Los PINs no coinciden'); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/setup-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, pin: newPin })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al configurar PIN');
      // PIN creado → ahora puede usarlo para recuperar
      setHasPin(true);
      setPin('');
      setStep(2);
      alert('✅ PIN configurado. Ahora ingresá tu nuevo PIN para cambiar la contraseña.');
    } catch (err) {
      setError(err.message);
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
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' },
    label: { fontSize: '0.875rem', fontWeight: '600', color: '#e5e7eb' },
    input: {
      width: '100%', border: '1px solid #374151', borderRadius: '0.5rem',
      padding: '0.75rem 1rem', fontSize: '1rem', background: '#111827',
      color: '#f9fafb', boxSizing: 'border-box', transition: 'border-color 0.2s'
    },
    pinInput: {
      width: '100%', border: '1px solid #374151', borderRadius: '0.5rem',
      padding: '0.75rem 1rem', fontSize: '2rem', background: '#111827',
      color: '#f9fafb', boxSizing: 'border-box', letterSpacing: '0.75rem',
      textAlign: 'center', transition: 'border-color 0.2s'
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
    warningBox: {
      background: '#1c1917', border: '1px solid #92400e',
      borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem'
    },
    warningTitle: { color: '#fbbf24', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.95rem' },
    warningText: { color: '#d4a574', fontSize: '0.875rem', lineHeight: '1.6' },
    small: { display: 'block', color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Recuperar Contraseña</h1>

        {/* ── PASO 1: Email ── */}
        {step === 1 && (
          <>
            <p style={styles.subtitle}>Ingresá tu email para continuar</p>
            <form onSubmit={handleCheckEmail}>
              {error && <div style={styles.error}>{error}</div>}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input} placeholder="tu@email.com" required
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
              <button type="button" onClick={onBack} style={styles.backButton}>
                ← Volver al login
              </button>
            </form>
          </>
        )}

        {/* ── PASO 2A: tiene PIN → cambiar contraseña ── */}
        {step === 2 && hasPin && (
          <>
            <p style={styles.subtitle}>Ingresá tu PIN de recuperación y tu nueva contraseña</p>
            <form onSubmit={handleResetWithPin}>
              {error && <div style={styles.error}>{error}</div>}
              <div style={styles.inputGroup}>
                <label style={styles.label}>🔐 PIN de recuperación (4 dígitos)</label>
                <input
                  type="text" inputMode="numeric" maxLength={4} value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  style={styles.pinInput} placeholder="••••" required
                  onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nueva contraseña</label>
                <input
                  type="password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input} placeholder="Mínimo 6 caracteres" required
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmar contraseña</label>
                <input
                  type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input} placeholder="Repetir contraseña" required
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(''); }} style={styles.backButton}>
                ← Volver
              </button>
            </form>
          </>
        )}

        {/* ── PASO 2B: no tiene PIN → crear PIN verificando usuario+email ── */}
        {step === 2 && !hasPin && (
          <>
            <div style={styles.warningBox}>
              <p style={styles.warningTitle}>⚠️ Tu cuenta no tiene PIN configurado</p>
              <p style={styles.warningText}>
                Para confirmar que sos vos, ingresá tu <strong>nombre de usuario exacto</strong>.
                Podés crear tu PIN ahora — solo se hace <strong>una sola vez</strong>.
              </p>
            </div>
            <form onSubmit={handleSetupPin}>
              {error && <div style={styles.error}>{error}</div>}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre de usuario</label>
                <input
                  type="text" value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input} placeholder="Tu usuario exacto" required
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
                <small style={styles.small}>Debe coincidir exactamente con el usuario registrado</small>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>🔐 Crear PIN (4 dígitos)</label>
                <input
                  type="text" inputMode="numeric" maxLength={4} value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  style={styles.pinInput} placeholder="••••" required
                  onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmar PIN</label>
                <input
                  type="text" inputMode="numeric" maxLength={4} value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  style={styles.pinInput} placeholder="••••" required
                  onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
                <small style={styles.small}>¡Guardá este PIN! Lo necesitarás para futuras recuperaciones</small>
              </div>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Configurando...' : 'Crear PIN y continuar'}
              </button>
              <button type="button" onClick={() => { setStep(1); setError(''); }} style={styles.backButton}>
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