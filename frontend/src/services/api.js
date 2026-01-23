const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

// API de autenticación
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
  }
};

// API de animes
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