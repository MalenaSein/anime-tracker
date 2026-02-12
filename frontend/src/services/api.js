const API_URL = process.env.REACT_APP_API_URL || 'https://anime-tracker-yape.onrender.com';

const getToken = () => localStorage.getItem('token');

// ============================================
// API DE AUTENTICACIÓN
// ============================================
export const authAPI = {
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  login: async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  // ✨ NUEVO - Cambiar nombre de usuario
  changeUsername: async (newUsername) => {
    const res = await fetch(`${API_URL}/auth/username`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ newUsername })
    });
    return res.json();
  },

  // ✨ NUEVO - Eliminar cuenta
  deleteAccount: async (password) => {
    const res = await fetch(`${API_URL}/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ password })
    });
    return res.json();
  },

  // ✨ NUEVO - Solicitar recuperación de contraseña
  forgotPassword: async (email) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  // ✨ NUEVO - Resetear contraseña con token
  resetPassword: async (token, newPassword) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return res.json();
  }
};

// ============================================
// API DE ANIMES
// ============================================
export const animeAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/animes`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  },

  create: async (animeData) => {
    const res = await fetch(`${API_URL}/animes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(animeData)
    });
    return res.json();
  },

  // FIX: ahora siempre envía 'tipo' en el update
  update: async (id, animeData) => {
    const res = await fetch(`${API_URL}/animes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(animeData)
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/animes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  }
};

// ============================================
// API DE SCHEDULES
// ============================================
export const scheduleAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/schedules`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  },

  create: async (scheduleData) => {
    const res = await fetch(`${API_URL}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(scheduleData)
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_URL}/schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/schedules/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return res.json();
  }
};