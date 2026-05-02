import axios from 'axios';

// Change this if your backend runs on a different port
const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

// This interceptor adds the token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
