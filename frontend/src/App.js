import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false); // esperar a Firebase antes de renderizar
  const [screen, setScreen] = useState('login');

  useEffect(() => {
    // onAuthStateChanged es la fuente de verdad para autenticación.
    // Se dispara al montar, al login, al logout, y cuando Firebase
    // renueva el token en background (cada hora). De esta forma el
    // localStorage siempre tiene un token válido antes de cualquier fetch.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Forzar refresh del token — esto garantiza que no mandamos
        // un token expirado aunque el usuario lleve horas sin interactuar
        const freshToken = await firebaseUser.getIdToken(true);
        localStorage.setItem('token', freshToken);

        const user = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        };
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
      } else {
        // No hay sesión activa
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
      // Firebase terminó de verificar — ya podemos renderizar
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    // onAuthStateChanged se encarga del resto (limpiar localStorage y estado)
    setScreen('login');
  };

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Mientras Firebase verifica la sesión, mostrar loading
  // Esto evita el flash de la pantalla de login al refrescar la página
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