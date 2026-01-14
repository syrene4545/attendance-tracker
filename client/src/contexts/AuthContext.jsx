
// import { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import api from '../api/api';
// import { hasPermission } from '../utils/permissions';

// const AuthContext = createContext(null);

// // Extract subdomain
// const getSubdomain = () => {
//   const hostname = window.location.hostname;
//   const parts = hostname.split('.');
  
//   // localhost or IP address
//   if (hostname.includes('localhost') || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
//     return localStorage.getItem('dev_subdomain') || 'default';
//   }
  
//   // Return first part as subdomain
//   return parts[0];
// };

// // ✅ Add interceptor to attach company headers to all API requests
// // axios.interceptors.request.use((config) => {
// //   const subdomain = getSubdomain();
// //   config.headers['X-Company-Subdomain'] = subdomain;
  
// //   // For development - attach company ID from localStorage
// //   if (window.location.hostname.includes('localhost')) {
// //     const companyId = localStorage.getItem('dev_company_id') || '2';
// //     config.headers['X-Company-Id'] = companyId;
// //     console.log('🔧 DEV MODE: Attaching company_id:', companyId);
// //   }
  
// //   return config;
// // });

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [company, setCompany] = useState(null); // ✅ Add company state
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ✅ Fetch company details
//   const fetchCompanyDetails = async (companyId) => {
//     try {
//       console.log('🏢 Fetching company details for company_id:', companyId);
//       const response = await api.get('/companies/me');
//       console.log('✅ Company details loaded:', response.data);
//       setCompany(response.data);
      
//       // Store company in localStorage for persistence
//       localStorage.setItem('company', JSON.stringify(response.data));
//     } catch (error) {
//       console.error('❌ Error fetching company details:', error);
//     }
//   };

//   useEffect(() => {
//     const savedUser = localStorage.getItem('currentUser');
//     const savedToken = localStorage.getItem('token');
//     const savedCompany = localStorage.getItem('company');
    
//     if (savedUser && savedToken) {
//       const user = JSON.parse(savedUser);
//       setCurrentUser(user);
//       setToken(savedToken);
      
//       // ✅ Load saved company or fetch fresh
//       if (savedCompany) {
//         setCompany(JSON.parse(savedCompany));
//       }
      
//       // ✅ Fetch fresh company details
//       if (user.companyId) {
//         localStorage.setItem('dev_company_id', user.companyId.toString());
//         fetchCompanyDetails(user.companyId);
//       }
//     }
//     setLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     try {
//       const res = await api.post('/auth/login', { email, password });
//       const { token, user } = res.data;

//       console.log('📥 LOGIN RESPONSE:', res.data);
//       console.log('🔑 TOKEN RECEIVED:', token);
//       console.log('👤 USER RECEIVED:', user);
//       console.log('🏢 COMPANY ID:', user.companyId);

//       setCurrentUser(user);
//       setToken(token);
//       localStorage.setItem('currentUser', JSON.stringify(user));
//       localStorage.setItem('token', token);
      
//       // ✅ Store company_id and fetch company details
//       if (user.companyId) {
//         localStorage.setItem('dev_company_id', user.companyId.toString());
//         console.log('💾 COMPANY ID STORED:', user.companyId);
//         await fetchCompanyDetails(user.companyId);
//       }

//       return { success: true, user };
//     } catch (err) {
//       console.error('Login error:', err);
//       return { 
//         success: false, 
//         error: err.response?.data?.error || 'Invalid credentials' 
//       };
//     }
//   };

//   const register = async (email, password, name, role, department) => {
//     try {
//       const res = await api.post(
//         '/auth/register',
//         { email, password, name, role, department },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       return { success: true, user: res.data.user };
//     } catch (err) {
//       console.error('Register error:', err);
//       return { 
//         success: false, 
//         error: err.response?.data?.error || 'Failed to register user' 
//       };
//     }
//   };

//   const logout = () => {
//     setCurrentUser(null);
//     setCompany(null); // ✅ Clear company state
//     setToken(null);
//     localStorage.removeItem('currentUser');
//     localStorage.removeItem('token');
//     localStorage.removeItem('company'); // ✅ Clear company data
//   };

//   const checkPermission = (permission) => {
//     return currentUser ? hasPermission(currentUser.role, permission) : false;
//   };

//   // ✅ Add method to verify token and refresh user info
//   const verifyToken = async () => {
//     try {
//       const res = await api.get('/auth/verify', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       const user = res.data.user;
//       setCurrentUser(user);
//       localStorage.setItem('currentUser', JSON.stringify(user));
      
//       if (user.companyId) {
//         localStorage.setItem('dev_company_id', user.companyId.toString());
//         await fetchCompanyDetails(user.companyId);
//       }
      
//       return { success: true, user };
//     } catch (err) {
//       console.error('Token verification failed:', err);
//       logout();
//       return { success: false };
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{ 
//         currentUser, 
//         company, // ✅ Expose company
//         token, 
//         login, 
//         register, 
//         logout, 
//         checkPermission, 
//         loading,
//         verifyToken,
//         refreshCompany: fetchCompanyDetails // ✅ Allow manual refresh
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };

// export default AuthContext;

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { hasPermission } from '../utils/permissions';

const AuthContext = createContext(null);

// Extract subdomain
const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // localhost or IP address
  if (hostname.includes('localhost') || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return localStorage.getItem('dev_subdomain') || 'default';
  }
  
  // Return first part as subdomain
  return parts[0];
};

// ❌ REMOVED: Duplicate axios interceptor (handled in api.js)
// This was causing race conditions and unpredictable behavior

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch company details
  const fetchCompanyDetails = async (companyId) => {
    try {
      console.log('🏢 Fetching company details for company_id:', companyId);
      const response = await api.get('companies/me'); // ✅ No leading slash
      console.log('✅ Company details loaded:', response.data);
      setCompany(response.data);
      
      // Store company in localStorage for persistence
      localStorage.setItem('company', JSON.stringify(response.data));
    } catch (error) {
      console.error('❌ Error fetching company details:', error);
      // Don't throw - just log. Company fetch failure shouldn't break login
    }
  };

  // ✅ Load saved auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('token');
    const savedCompany = localStorage.getItem('company');
    
    if (savedUser && savedToken) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setToken(savedToken);
      
      // Load saved company
      if (savedCompany) {
        setCompany(JSON.parse(savedCompany));
      }
      
      // Store company_id for dev mode
      if (user.companyId) {
        localStorage.setItem('dev_company_id', user.companyId.toString());
      }
    }
    setLoading(false);
  }, []);

  // ✅ FIX: Fetch company details when token is ready
  useEffect(() => {
    if (token && currentUser?.companyId && !company) {
      console.log('🔄 Token ready, fetching company details...');
      fetchCompanyDetails(currentUser.companyId);
    }
  }, [token, currentUser?.companyId]); // ✅ Only runs when token changes

  const login = async (email, password) => {
    try {
      const res = await api.post('auth/login', { email, password }); // ✅ No leading slash
      const { token, user } = res.data;

      console.log('📥 LOGIN RESPONSE:', res.data);
      console.log('🔑 TOKEN RECEIVED:', token);
      console.log('👤 USER RECEIVED:', user);
      console.log('🏢 COMPANY ID:', user.companyId);

      setCurrentUser(user);
      setToken(token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // ✅ Store company_id for dev mode
      if (user.companyId) {
        localStorage.setItem('dev_company_id', user.companyId.toString());
        console.log('💾 COMPANY ID STORED:', user.companyId);
      }

      // ✅ Company fetch will be triggered by useEffect above

      return { success: true, user };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Invalid credentials' 
      };
    }
  };

  const register = async (email, password, name, role, department) => {
    try {
      const res = await api.post(
        'auth/register', // ✅ No leading slash
        { email, password, name, role, department }
      );
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error('Register error:', err);
      return { 
        success: false, 
        error: err.response?.data?.error || 'Failed to register user' 
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCompany(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('company');
    localStorage.removeItem('dev_company_id'); // ✅ Clean up dev mode
  };

  const checkPermission = (permission) => {
    return currentUser ? hasPermission(currentUser.role, permission) : false;
  };

  // ✅ Verify token and refresh user info
  const verifyToken = async () => {
    try {
      const res = await api.get('auth/verify'); // ✅ No leading slash
      
      const user = res.data.user;
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      if (user.companyId) {
        localStorage.setItem('dev_company_id', user.companyId.toString());
        // Company fetch will be triggered by useEffect
      }
      
      return { success: true, user };
    } catch (err) {
      console.error('Token verification failed:', err);
      logout();
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        currentUser, 
        company,
        token, 
        login, 
        register, 
        logout, 
        checkPermission, 
        loading,
        verifyToken,
        refreshCompany: fetchCompanyDetails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;