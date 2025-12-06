// src/api/api.js
import axios from 'axios';

// Base URL: use Vite env variable if set, otherwise default to local backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper functions for token management
const getToken = () => localStorage.getItem('token');
const clearToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser'); // ✅ also clear user for consistency
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      // Network or CORS error
      alert('Network error: Unable to reach the server.');
      return Promise.reject(error);
    }

    switch (response.status) {
      case 401:
        // Unauthorized → clear token and redirect to login
        clearToken();
        window.location.href = '/login';
        break;

      case 403:
        // Forbidden → user lacks permission
        alert('Access denied: You do not have permission to perform this action.');
        break;

      case 404:
        // Not found → resource missing
        alert('Requested resource was not found.');
        break;

      case 500:
        // Internal server error → backend issue
        alert('Server error: Please try again later.');
        break;

      default:
        // Other errors
        alert(response.data?.error || 'An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default api;
