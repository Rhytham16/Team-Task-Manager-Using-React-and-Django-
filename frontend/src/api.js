import axios from 'axios';

// Change this if your backend runs on a different port
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

// Log the API URL to help debug
console.log("API Base URL:", API_URL);

// This interceptor adds the token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to catch HTML responses
api.interceptors.response.use(
  (response) => {
    // If the response is a string starting with <!doctype, it's HTML fallback
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<!doctype')) {
      console.error("Detected HTML response instead of JSON. The request likely hit the frontend server instead of the backend.");
      return Promise.reject({
        response: {
          status: 404,
          data: { detail: "Backend not found. Received HTML instead of JSON. Ensure Django is running on port 8000." }
        }
      });
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
