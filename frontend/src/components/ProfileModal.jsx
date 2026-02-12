import React, { useState } from 'react';
import { User, Trash2, Edit2, Eye, EyeOff, X } from 'lucide-react';
import { authAPI } from '../services/api';

const ProfileModal = ({ show, user, onClose, onUsernameChanged, onAccountDeleted }) => {
  const [view, setView] = useState('menu'); // 'menu' | 'username' | 'delete'
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!show) return null;

  const reset = () => {
    setView('menu');
    setNewUsername('');
    setPassword('');
    setShowPassword(false);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.changeUsername(newUsername);
      if (data.error) {
        setError(data.error);
      } else {
        // Actualizar token y usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('¡Nombre de usuario actualizado!');
        onUsernameChanged(data.user);
        setTimeout(() => { reset(); onClose(); }, 1500);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.deleteAccount(password);
      if (data.error) {
        setError(data.error);
      } else {
        onAccountDeleted();
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem'
  };
  const modalStyle = {
    background: '#1f2937', borderRadius: '1rem', border: '1px solid #374151',
    padding: '2rem', width: '100%', maxWidth: '24rem',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
  };
  const headerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '1.5rem'
  };
  const titleStyle = { color: '#f9fafb', fontWeight: '700', fontSize: '1.25rem' };
  const closeBtn = {
    background: 'none', border: 'none', color: '#9ca3af',
    cursor: 'pointer', padding: '0.25rem', display: 'flex'
  };
  const inputGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' };
  const label = { fontSize: '0.875rem', fontWeight: '600', color: '#e5e7eb' };
  const input = {
    width: '100%', border: '1px solid #374151', borderRadius: '0.5rem',
    padding: '0.75rem 1rem', fontSize: '1rem', background: '#111827',
    color: '#f9fafb', boxSizing: 'border-box'
  };
  const inputWithIcon = { ...input, paddingRight: '3rem' };
  const eyeBtn = {
    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280',
    display: 'flex', alignItems: 'center'
  };
  const primaryBtn = {
    width: '100%', backgroundColor: loading ? '#4b5563' : '#9333ea',
    color: 'white', padding: '0.75rem', borderRadius: '0.5rem',
    fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.95rem', marginBottom: '0.75rem'
  };
  const dangerBtn = {
    width: '100%', backgroundColor: loading ? '#4b5563' : '#dc2626',
    color: 'white', padding: '0.75rem', borderRadius: '0.5rem',
    fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.95rem', marginBottom: '0.75rem'
  };
  const ghostBtn = {
    width: '100%', backgroundColor: 'transparent', color: '#9ca3af',
    padding: '0.625rem', borderRadius: '0.5rem', fontWeight: '500',
    border: '1px solid #374151', cursor: 'pointer', fontSize: '0.875rem'
  };
  const menuBtnStyle = (danger = false) => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '1rem', background: '#111827', border: '1px solid #374151',
    borderRadius: '0.75rem', cursor: 'pointer', color: danger ? '#ef4444' : '#e5e7eb',
    fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.75rem',
    transition: 'all 0.2s', textAlign: 'left'
  });
  const errorBox = {
    backgroundColor: '#7f1d1d', border: '1px solid #991b1b',
    color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem',
    fontSize: '0.875rem', marginBottom: '1rem'
  };
  const successBox = {
    backgroundColor: '#064e3b', border: '1px solid #065f46',
    color: '#6ee7b7', padding: '0.75rem', borderRadius: '0.5rem',
    fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center'
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>

        {/* MENÚ PRINCIPAL */}
        {view === 'menu' && (
          <>
            <div style={headerStyle}>
              <div>
                <div style={titleStyle}>Mi Perfil</div>
                <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  @{user.username}
                </div>
              </div>
              <button onClick={handleClose} style={closeBtn}><X size={20} /></button>
            </div>

            <button style={menuBtnStyle()} onClick={() => { setView('username'); setError(''); }}>
              <Edit2 size={18} style={{ color: '#6366f1' }} />
              <div>
                <div>Cambiar nombre de usuario</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Actual: @{user.username}</div>
              </div>
            </button>

            <button style={menuBtnStyle(true)} onClick={() => { setView('delete'); setError(''); }}>
              <Trash2 size={18} />
              <div>
                <div>Eliminar cuenta</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Esta acción no se puede deshacer</div>
              </div>
            </button>
          </>
        )}

        {/* CAMBIAR USERNAME */}
        {view === 'username' && (
          <>
            <div style={headerStyle}>
              <div style={titleStyle}>Cambiar Usuario</div>
              <button onClick={() => { setView('menu'); setError(''); setSuccess(''); }} style={closeBtn}>
                <X size={20} />
              </button>
            </div>

            {error && <div style={errorBox}>{error}</div>}
            {success && <div style={successBox}>{success}</div>}

            <form onSubmit={handleChangeUsername}>
              <div style={inputGroup}>
                <label style={label}>Nuevo nombre de usuario</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={input}
                  placeholder={user.username}
                  required
                  minLength={3}
                  autoFocus
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#374151'}
                />
              </div>

              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? 'Guardando...' : 'Guardar cambio'}
              </button>
              <button type="button" onClick={() => { setView('menu'); setError(''); }} style={ghostBtn}>
                Cancelar
              </button>
            </form>
          </>
        )}

        {/* ELIMINAR CUENTA */}
        {view === 'delete' && (
          <>
            <div style={headerStyle}>
              <div style={{ ...titleStyle, color: '#ef4444' }}>Eliminar Cuenta</div>
              <button onClick={() => { setView('menu'); setError(''); }} style={closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '0.5rem',
              padding: '0.75rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              ⚠️ <strong>Atención:</strong> Esta acción eliminará permanentemente tu cuenta y todos tus animes. No se puede deshacer.
            </div>

            {error && <div style={errorBox}>{error}</div>}

            <form onSubmit={handleDeleteAccount}>
              <div style={inputGroup}>
                <label style={label}>Ingresá tu contraseña para confirmar</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputWithIcon}
                    placeholder="••••••••"
                    required
                    autoFocus
                    onFocus={(e) => e.target.style.borderColor = '#dc2626'}
                    onBlur={(e) => e.target.style.borderColor = '#374151'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtn} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={dangerBtn}>
                {loading ? 'Eliminando...' : '🗑️ Sí, eliminar mi cuenta'}
              </button>
              <button type="button" onClick={() => { setView('menu'); setError(''); setPassword(''); }} style={ghostBtn}>
                Cancelar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;