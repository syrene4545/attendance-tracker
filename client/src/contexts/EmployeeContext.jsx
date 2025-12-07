import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/api'; // ✅ Import centralized api

export const EmployeeContext = createContext(null);

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
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

  // Load employees from backend
  const loadEmployees = async () => {
    if (!token) return;
    
    // Check permission before making request
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'hr') {
      console.log('User does not have view_all permission');
      return;
    }
    
    try {
      const res = await api.get('/employees'); // ✅ Using api instance
      const data = res.data;
      const sorted = (data.employees || data).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setEmployees(sorted);
    } catch (err) {
      console.error('Failed to load employees:', err);
      // Don't show error notification for permission errors
      if (!err.message.includes('permission') && !err.message.includes('Insufficient')) {
        addNotification('Failed to load employees', 'error');
      }
    }
  };

  useEffect(() => {
    if (token && currentUser) {
      // Only load for admin/hr
      if (currentUser.role === 'admin' || currentUser.role === 'hr') {
        loadEmployees();
      }
    }
  }, [token, currentUser]);

  // Add new employee
  const addEmployee = async (employee) => {
    try {
      await api.post('/employees', employee); // ✅ Using api instance
      await loadEmployees();
      addNotification('Employee added successfully', 'success');
    } catch (err) {
      console.error('Failed to add employee:', err);
      addNotification('Failed to add employee', 'error');
    }
  };

  // Update existing employee
  const updateEmployee = async (id, updates) => {
    try {
      await api.put(`/employees/${id}`, updates); // ✅ Using api instance
      await loadEmployees();
      addNotification('Employee updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update employee:', err);
      addNotification('Failed to update employee', 'error');
    }
  };

  // Delete employee (Admin only)
  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/employees/${id}`); // ✅ Using api instance
      await loadEmployees();
      addNotification('Employee deleted successfully', 'success');
    } catch (err) {
      console.error('Failed to delete employee:', err);
      addNotification('Failed to delete employee', 'error');
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loadEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error('useEmployees must be used within EmployeeProvider');
  return context;
};