// ============================================
// src/hooks/useAuth.js (FRONTEND)
// Acciones de autenticación con Firebase.
// El estado de sesión global lo maneja App.js con onIdTokenChanged.
// ============================================

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export const useAuth = () => {
  const [error, setError] = useState(null);

  const getFreshToken = async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken(true);
    localStorage.setItem('token', token);
    return token;
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      localStorage.setItem('token', token);
      return { success: true, user: result.user };
    } catch (err) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (email, password, username) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: username });

      const token = await result.user.getIdToken();
      localStorage.setItem('token', token);

      return { success: true, user: result.user };
    } catch (err) {
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      localStorage.setItem('token', token);
      return { success: true, user: result.user };
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, cancelled: true };
      }
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err) {
      const message = getFirebaseErrorMessage(err.code);
      return { success: false, error: message };
    }
  };

  return {
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    getFreshToken
  };
};

function getFirebaseErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'No existe una cuenta con ese email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'El email no es válido',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Intentá más tarde',
    'auth/network-request-failed': 'Error de conexión. Verificá tu internet',
    'auth/invalid-credential': 'Email o contraseña incorrectos',
    'auth/popup-blocked': 'El popup fue bloqueado. Permitilo en tu navegador',
    'auth/account-exists-with-different-credential':
      'Ya existe una cuenta con ese email usando otro método de login'
  };
  return messages[code] || 'Ocurrió un error. Intentá nuevamente';
}

export default useAuth;