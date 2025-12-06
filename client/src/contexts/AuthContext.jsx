import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { hasPermission } from '../utils/permissions';

const AuthContext = createContext(null); // ✅ now default export at bottom

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('token'); // ✅ aligned with axios interceptor
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      // console.log('📥 LOGIN RESPONSE:', res.data); // ✅ ADD THIS
      // console.log('🔑 TOKEN RECEIVED:', token); // ✅ ADD THIS
      // console.log('👤 USER RECEIVED:', user); // ✅ ADD THIS

      setCurrentUser(user);
      setToken(token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token); // ✅ aligned

      // console.log('💾 TOKEN STORED:', localStorage.getItem('token')); // ✅ ADD THIS

      return { success: true, user };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.response?.data?.error || 'Invalid credentials' };
    }
  };

  const register = async (email, password, name, role, department) => {
    try {
      const res = await api.post(
        '/auth/register',
        { email, password, name, role, department },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: err.response?.data?.error || 'Failed to register user' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token'); // ✅ aligned
  };

  const checkPermission = (permission) => {
    return currentUser ? hasPermission(currentUser.role, permission) : false;
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, token, login, register, logout, checkPermission, loading }}
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

export default AuthContext; // ✅ added default export
