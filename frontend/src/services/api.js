import { auth } from '../config/firebase';

// La URL de producción incluye /api (ver .github/workflows/deploy.yml)
export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api')
  .replace(/\/+$/, '');

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const getToken = async (forceRefresh = false) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken(forceRefresh);
    localStorage.setItem('token', token);
    return token;
  }

  return localStorage.getItem('token');
};

const notifyExpired = () => {
  window.dispatchEvent(new Event('auth:expired'));
};

export const apiFetch = async (path, options = {}, retried = false) => {
  let token = null;

  try {
    token = await getToken(false);
  } catch (error) {
    token = localStorage.getItem('token');
  }

  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    if (!retried) {
      const freshToken = await getToken(true).catch(() => null);
      if (freshToken) {
        return apiFetch(path, options, true);
      }
    }
    notifyExpired();
  }

  return response;
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Error ${response.status}`);
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
};

const jsonRequest = async (path, options = {}) => {
  const response = await apiFetch(path, options);
  return parseResponse(response);
};

// ============================================
// API DE AUTENTICACIÓN
// ============================================
export const authAPI = {
  register: (userData) => jsonRequest('/auth/register', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(userData)
  }),

  login: (credentials) => jsonRequest('/auth/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(credentials)
  }),

  me: () => jsonRequest('/auth/me'),

  changeUsername: (newUsername) => jsonRequest('/auth/username', {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ newUsername })
  }),

  deleteAccount: (password) => jsonRequest('/auth/account', {
    method: 'DELETE',
    headers: JSON_HEADERS,
    body: JSON.stringify({ password })
  })
};

// ============================================
// API DE ANIMES
// ============================================
export const animeAPI = {
  getAll: () => jsonRequest('/animes'),

  create: (animeData) => jsonRequest('/animes', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(animeData)
  }),

  importMany: (animes) => jsonRequest('/animes/import', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ animes })
  }),

  update: (id, animeData) => jsonRequest(`/animes/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(animeData)
  }),

  delete: (id) => jsonRequest(`/animes/${id}`, {
    method: 'DELETE'
  })
};

// ============================================
// API DE SCHEDULES
// ============================================
export const scheduleAPI = {
  getAll: () => jsonRequest('/schedules'),

  create: (scheduleData) => jsonRequest('/schedules', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(scheduleData)
  }),

  update: (id, data) => jsonRequest(`/schedules/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(data)
  }),

  delete: (id) => jsonRequest(`/schedules/${id}`, {
    method: 'DELETE'
  })
};