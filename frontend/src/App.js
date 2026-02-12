import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword'; // ✨ NUEVO

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState('login'); // 'login' | 'register' | 'forgot'

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleRegister = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setScreen('login');
  };

  // ✨ NUEVO: cuando el usuario cambia su username desde el perfil
  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (!isAuthenticated) {
    if (screen === 'register') {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setScreen('login')}
        />
      );
    }
    if (screen === 'forgot') {
      return (
        <ForgotPassword onBack={() => setScreen('login')} />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
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