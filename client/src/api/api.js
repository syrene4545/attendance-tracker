// // src/api/api.js
// import axios from 'axios';

// // Base URL: use Vite env variable if set, otherwise default to local backend
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// // Helper functions for token management
// const getToken = () => localStorage.getItem('token');
// const clearToken = () => {
//   localStorage.removeItem('token');
//   localStorage.removeItem('currentUser');
// };

// // ✅ Helper to get subdomain
// const getSubdomain = () => {
//   const hostname = window.location.hostname;
//   const parts = hostname.split('.');
  
//   // localhost or IP address
//   if (hostname.includes('localhost') || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
//     return localStorage.getItem('dev_subdomain') || 'default';
//   }
  
//   // Return first part as subdomain (e.g., 'acme' from 'acme.yourapp.com')
//   return parts[0];
// };

// // Create axios instance
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor: attach JWT token and company headers
// api.interceptors.request.use(
//   (config) => {
//     // ✅ Attach JWT token
//     const token = getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     // ✅ Attach company subdomain (for production routing)
//     const subdomain = getSubdomain();
//     config.headers['X-Company-Subdomain'] = subdomain;
    
//     // ✅ For development: attach company_id from localStorage
//     if (window.location.hostname.includes('localhost')) {
//       const companyId = localStorage.getItem('dev_company_id') || '2';
//       config.headers['X-Company-Id'] = companyId;
      
//       // Only log once per session to avoid console spam
//       if (!window.__companyIdLogged) {
//         console.log('🔧 DEV MODE: Using company_id:', companyId);
//         window.__companyIdLogged = true;
//       }
//     }
    
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor: handle errors globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const { response } = error;

//     if (!response) {
//       // Network or CORS error
//       console.error('❌ Network error:', error);
//       alert('Network error: Unable to reach the server.');
//       return Promise.reject(error);
//     }

//     switch (response.status) {
//       case 401:
//         // Unauthorized → clear token and redirect to login
//         console.warn('⚠️ 401 Unauthorized - clearing session');
//         clearToken();
//         window.location.href = '/login';
//         break;

//       case 403:
//         // Forbidden → user lacks permission or company mismatch
//         const errorMsg = response.data?.error || 'Access denied: You do not have permission to perform this action.';
//         console.error('🚫 403 Forbidden:', errorMsg);
//         alert(errorMsg);
//         break;

//       case 404:
//         // Not found → resource missing
//         console.warn('🔍 404 Not Found:', response.config.url);
//         alert('Requested resource was not found.');
//         break;

//       case 500:
//         // Internal server error → backend issue
//         console.error('💥 500 Server Error:', response.data);
//         alert('Server error: Please try again later.');
//         break;

//       default:
//         // Other errors
//         const defaultMsg = response.data?.error || 'An unexpected error occurred.';
//         console.error(`❌ Error ${response.status}:`, defaultMsg);
//         alert(defaultMsg);
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

// src/api/api.js
import axios from 'axios';

// Base URL: use Vite env variable if set, otherwise default to local backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper functions for token management
const getToken = () => localStorage.getItem('token');
const clearToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('company');
};

// ✅ Helper to get subdomain
const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // localhost or IP address
  if (hostname.includes('localhost') || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return localStorage.getItem('dev_subdomain') || 'default';
  }
  
  // Return first part as subdomain (e.g., 'acme' from 'acme.yourapp.com')
  return parts[0];
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token and company headers
api.interceptors.request.use(
  (config) => {
    // ✅ Attach JWT token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Attach company subdomain (for production routing)
    const subdomain = getSubdomain();
    config.headers['X-Company-Subdomain'] = subdomain;
    
    // ✅ For development: attach company_id from localStorage
    if (window.location.hostname.includes('localhost')) {
      const companyId = localStorage.getItem('dev_company_id') || '2';
      config.headers['X-Company-Id'] = companyId;
      
      // Only log once per session to avoid console spam
      if (!window.__companyIdLogged) {
        console.log('🔧 DEV MODE: Using company_id:', companyId);
        window.__companyIdLogged = true;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors globally (SOFTENED 401 handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      // Network or CORS error
      console.error('❌ Network error:', error);
      // Don't use alert - just log for now
      console.error('Unable to reach the server. Please check your connection.');
      return Promise.reject(error);
    }

    const url = response.config?.url || '';

    switch (response.status) {
      case 401: {
        // ✅ FIX: SOFTEN 401 HANDLING - Only logout for auth endpoints
        if (url.includes('/auth/verify') || url.includes('/auth/login') || url.includes('/auth/logout')) {
          console.warn('⚠️ Auth expired, logging out');
          clearToken();
          window.location.href = '/login';
        } else {
          // Other 401s - log but don't logout
          console.warn('⚠️ 401 Unauthorized from:', url);
          console.warn('This may be due to missing permissions or tenant mismatch');
        }
        break;
      }

      case 403: {
        // Forbidden → user lacks permission or company mismatch
        const errorMsg = response.data?.error || 'Access denied: You do not have permission to perform this action.';
        console.error('🚫 403 Forbidden:', errorMsg, 'URL:', url);
        // Don't use alert - log only
        break;
      }

      case 404: {
        // Not found → resource missing
        console.warn('🔍 404 Not Found:', url);
        // Don't use alert - log only
        break;
      }

      case 500: {
        // Internal server error → backend issue
        console.error('💥 500 Server Error:', response.data, 'URL:', url);
        // Don't use alert - log only
        break;
      }

      default: {
        // Other errors
        const defaultMsg = response.data?.error || 'An unexpected error occurred.';
        console.error(`❌ Error ${response.status}:`, defaultMsg, 'URL:', url);
        // Don't use alert - log only
      }
    }

    return Promise.reject(error);
  }
);

export default api;