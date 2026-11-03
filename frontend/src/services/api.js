import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: (refresh_token) => api.post('/api/auth/logout', { refresh_token }),
  me: () => api.get('/api/auth/me'),
};

// Users
export const usersAPI = {
  list: (params) => api.get('/api/users', { params }),
  get: (id) => api.get(`/api/users/${id}`),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

// Vehicles
export const vehiclesAPI = {
  create: (data) => api.post('/api/vehicles', data),
  list: (params) => api.get('/api/vehicles', { params }),
  get: (id) => api.get(`/api/vehicles/${id}`),
  search: (reg) => api.get(`/api/vehicles/search/${reg}`),
  update: (id, data) => api.put(`/api/vehicles/${id}`, data),
};

// Violations
export const violationsAPI = {
  list: (params) => api.get('/api/violations', { params }),
  create: (data) => api.post('/api/violations', data),
  update: (id, data) => api.put(`/api/violations/${id}`, data),
  delete: (id) => api.delete(`/api/violations/${id}`),
};

// Challans
export const challansAPI = {
  create: (formData) => api.post('/api/challans', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: (params) => api.get('/api/challans', { params }),
  get: (id) => api.get(`/api/challans/${id}`),
  myChallans: (params) => api.get('/api/challans/my-challans', { params }),
  byVehicle: (reg) => api.get(`/api/challans/vehicle/${reg}`),
  pdf: (id) => api.get(`/api/challans/${id}/pdf`, { responseType: 'blob' }),
};

// Payments
export const paymentsAPI = {
  createOrder: (data) => api.post('/api/payments/create-order', data),
  verify: (data) => api.post('/api/payments/verify', data),
  history: () => api.get('/api/payments/history'),
};

// Dashboard
export const dashboardAPI = {
  admin: () => api.get('/api/dashboard/admin'),
  police: () => api.get('/api/dashboard/police'),
  citizen: () => api.get('/api/dashboard/citizen'),
};

export default api;
