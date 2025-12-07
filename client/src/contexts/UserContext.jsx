import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/api'; // ✅ Import centralized api

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { token, currentUser } = useAuth();

  // Notifications
  const addNotification = (message, type = 'info') => {
    const notif = { id: Date.now(), message, type };
    setNotifications((prev) => [...prev, notif]);
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      }, 3000);
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Load all users (Admin/HR only)
  const loadUsers = async () => {
    if (!token) return;
    
    // Check permission before making request
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'hr') {
      console.log('User does not have view_all permission');
      return;
    }
    
    try {
      const res = await api.get('/users'); // ✅ Using api instance
      const data = res.data;
      setUsers(data.users || []);
    } catch (err) {
      console.error('Load users error:', err);
      // Don't show error notification for permission errors
      if (!err.message.includes('permission')) {
        addNotification('Failed to load users', 'error');
      }
    }
  };

  useEffect(() => {
    if (token && currentUser) {
      // Only load for admin/hr
      if (currentUser.role === 'admin' || currentUser.role === 'hr') {
        loadUsers();
      }
    }
  }, [token, currentUser]);

  // Get single user by ID
  const getUserById = async (id) => {
    if (!token) return null;
    
    try {
      const res = await api.get(`/users/${id}`); // ✅ Using api instance
      return res.data.user;
    } catch (err) {
      console.error('Get user error:', err);
      addNotification('Failed to fetch user', 'error');
      return null;
    }
  };

  // Update user (Admin/HR only)
  const updateUser = async (id, updates) => {
    if (!token) return null;
    
    try {
      const res = await api.put(`/users/${id}`, updates); // ✅ Using api instance
      await loadUsers();
      addNotification('User updated successfully', 'success');
      return res.data.user;
    } catch (err) {
      console.error('Update user error:', err);
      addNotification('Failed to update user', 'error');
      return null;
    }
  };

  // Delete user (Admin only)
  const deleteUser = async (id) => {
    if (!token) return;
    
    try {
      await api.delete(`/users/${id}`); // ✅ Using api instance
      await loadUsers();
      addNotification('User deleted successfully', 'success');
    } catch (err) {
      console.error('Delete user error:', err);
      addNotification('Failed to delete user', 'error');
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        loadUsers,
        getUserById,
        updateUser,
        deleteUser,
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook
export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUsers must be used within UserProvider');
  return context;
};