// File: client/src/services/authService.js

import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return user;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data.user;
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }
};