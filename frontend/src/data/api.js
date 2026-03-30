import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const isAuthRoute = err.config?.url?.includes('/auth/');
      const isSearchRoute = err.config?.url?.includes('/search');
      const onLoginPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthRoute && !isSearchRoute && !onLoginPage) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
