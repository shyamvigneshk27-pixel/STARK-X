import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: inject Bearer token ─────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 / token refresh ─────────────────────
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          if (data.success) {
            localStorage.setItem('token', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            original.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return API(original);
          }
        } catch {
          // refresh failed — force logout
        }
      }
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (payload) => API.post('/auth/register', payload),
  login: (payload) => API.post('/auth/login', payload),
  refresh: (refreshToken) => API.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => API.post('/auth/reset-password', { token, newPassword }),
};

// ─── Users ────────────────────────────────────────────────────────────────
export const usersAPI = {
  getMe: () => API.get('/users/me'),
  updateMe: (payload) => API.patch('/users/me', payload),
  updateAvatar: (avatarUrl) => API.patch('/users/me/avatar', { avatarUrl }),
};

// ─── Trips ────────────────────────────────────────────────────────────────
export const tripsAPI = {
  getAll: (params) => API.get('/trips', { params }),
  getById: (id) => API.get(`/trips/${id}`),
  create: (payload) => API.post('/trips', payload),
  update: (id, payload) => API.put(`/trips/${id}`, payload),
  delete: (id) => API.delete(`/trips/${id}`),
  addStop: (tripId, payload) => API.post(`/trips/${tripId}/stops`, payload),
  removeStop: (tripId, stopId) => API.delete(`/trips/${tripId}/stops/${stopId}`),
  addSection: (tripId, payload) => API.post(`/trips/${tripId}/sections`, payload),
  updateSection: (tripId, sectionId, payload) => API.patch(`/trips/${tripId}/sections/${sectionId}`, payload),
  deleteSection: (tripId, sectionId) => API.delete(`/trips/${tripId}/sections/${sectionId}`),
  addActivity: (tripId, payload) => API.post(`/trips/${tripId}/activities`, payload),
  share: (tripId) => API.post(`/trips/${tripId}/share`),
};

// ─── Cities ───────────────────────────────────────────────────────────────
export const citiesAPI = {
  search: (q, limit = 10) => API.get('/cities/search', { params: { q, limit } }),
  popular: () => API.get('/cities/popular'),
  regions: () => API.get('/cities/regions'),
};

// ─── Activities ───────────────────────────────────────────────────────────
export const activitiesAPI = {
  search: (params) => API.get('/activities/search', { params }),
  suggestions: (tripType, budget) => API.get('/activities/suggestions', { params: { tripType, budget } }),
};

// ─── Budgets ──────────────────────────────────────────────────────────────
export const budgetsAPI = {
  get: (tripId) => API.get(`/budgets/${tripId}`),
  update: (tripId, payload) => API.put(`/budgets/${tripId}`, payload),
  addExpense: (tripId, payload) => API.post(`/budgets/${tripId}/expenses`, payload),
  deleteExpense: (tripId, expenseId) => API.delete(`/budgets/${tripId}/expenses/${expenseId}`),
  analytics: (tripId) => API.get(`/budgets/${tripId}/analytics`),
};

// ─── Checklists ───────────────────────────────────────────────────────────
export const checklistsAPI = {
  get: (tripId) => API.get(`/checklists/${tripId}`),
  addItem: (tripId, payload) => API.post(`/checklists/${tripId}/items`, payload),
  updateItem: (tripId, itemId, payload) => API.patch(`/checklists/${tripId}/items/${itemId}`, payload),
  deleteItem: (tripId, itemId) => API.delete(`/checklists/${tripId}/items/${itemId}`),
  reset: (tripId) => API.post(`/checklists/${tripId}/reset`),
  sync: (tripId, items) => API.post(`/checklists/${tripId}/sync`, { items }),
};

// ─── Notes ────────────────────────────────────────────────────────────────
export const notesAPI = {
  get: (tripId) => API.get(`/notes/${tripId}`),
  create: (tripId, payload) => API.post(`/notes/${tripId}`, payload),
  update: (tripId, noteId, payload) => API.patch(`/notes/${tripId}/${noteId}`, payload),
  delete: (tripId, noteId) => API.delete(`/notes/${tripId}/${noteId}`),
};

// ─── Invoices ─────────────────────────────────────────────────────────────
export const invoicesAPI = {
  get: (tripId) => API.get(`/invoices/${tripId}`),
  generate: (tripId) => API.post(`/invoices/${tripId}/generate`),
};

// ─── Currency ─────────────────────────────────────────────────────────────
export const currencyAPI = {
  rates: (base = 'USD') => API.get('/currency/rates', { params: { base } }),
};

// ─── Community ────────────────────────────────────────────────────────────
export const communityAPI = {
  feed: (params) => API.get('/community', { params }),
};

// ─── Weather ──────────────────────────────────────────────────────────────
export const weatherAPI = {
  get: (lat, lng) => API.get('/weather', { params: { lat, lng } }),
};

export default API;
