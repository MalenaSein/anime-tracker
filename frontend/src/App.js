import React, { useState, useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { authAPI } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [screen, setScreen] = useState('login');

  useEffect(() => {
    // onIdTokenChanged se dispara al iniciar sesión, al cerrarla Y cuando
    // Firebase renueva el token en background. Así el localStorage siempre
    // tiene un token vigente antes de cualquier fetch.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const freshToken = await firebaseUser.getIdToken();
          localStorage.setItem('token', freshToken);

          let user = {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            authMethod: 'firebase'
          };

          // El username canónico vive en MySQL; Firebase puede tener un
          // displayName viejo si el usuario lo cambió desde el perfil.
          try {
            const me = await authAPI.me();
            if (me?.username) {
              user = { ...user, username: me.username, dbId: me.id };
            }
          } catch (profileError) {
            console.error('No se pudo obtener el perfil del backend:', profileError.message);
          }

          localStorage.setItem('user', JSON.stringify(user));
          setCurrentUser(user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error verificando la sesión:', error);
        if (!firebaseUser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleExpired = async () => {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      setScreen('login');
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const handleLogout = async () => {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    setScreen('login');
  };

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!authReady) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#6366f1' }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (screen === 'register') {
      return (
        <Register
          onRegister={(user) => setCurrentUser(user)}
          onSwitchToLogin={() => setScreen('login')}
        />
      );
    }
    if (screen === 'forgot') {
      return <ForgotPassword onBack={() => setScreen('login')} />;
    }
    return (
      <Login
        onLogin={(user) => setCurrentUser(user)}
        onSwitchToRegister={() => setScreen('register')}
        onForgotPassword={() => setScreen('forgot')}
      />
    );
  }

  return (
    <Dashboard
      user={currentUser}
      onLogout={handleLogout}
      onUserUpdated={handleUserUpdated}
    />
  );
};

export default App;