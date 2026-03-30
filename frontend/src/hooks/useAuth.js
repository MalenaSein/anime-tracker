// ============================================
// src/hooks/useAuth.js  (FRONTEND)
// Hook que reemplaza el sistema de login/registro con Firebase
// Compatible con el modo dual del backend durante la transición
// ============================================

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // Escuchar cambios de sesión
  // ============================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Obtener el ID Token para mandarlo al backend
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email
        }));
        setUser({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // El token de Firebase expira cada hora
  // Este helper lo renueva automáticamente
  // ============================================
  const getFreshToken = async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken(true); // true = forzar refresh
    localStorage.setItem('token', token);
    return token;
  };

  // ============================================
  // LOGIN con email y password
  // ============================================
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

  // ============================================
  // REGISTRO con email y password
  // ============================================
  const register = async (email, password, username) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Guardar el displayName (username)
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

  // ============================================
  // LOGIN con Google
  // ============================================
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      localStorage.setItem('token', token);
      return { success: true, user: result.user };
    } catch (err) {
      // El usuario cerró el popup — no es un error real
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, cancelled: true };
      }
      const message = getFirebaseErrorMessage(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ============================================
  // RECUPERAR CONTRASEÑA
  // Firebase manda el email automáticamente — no necesitás PIN
  // ============================================
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
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    getFreshToken
  };
};

// ============================================
// Mensajes de error en español
// ============================================
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