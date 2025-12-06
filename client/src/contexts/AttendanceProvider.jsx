import { useState, useEffect } from 'react';
import { AttendanceContext } from './AttendanceContext';
import { useAuth } from './AuthContext'; // bring in JWT token

export const AttendanceProvider = ({ children }) => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { token } = useAuth();

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

  // Load logs from backend
  const loadAttendanceLogs = async () => {
    try {
      const res = await fetch('/api/attendance', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch attendance logs');
      }
      const data = await res.json();
      const sorted = (data.logs || []).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setAttendanceLogs(sorted);
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
      addNotification('Failed to load attendance logs', 'error');
    }
  };

  useEffect(() => {
    if (token) loadAttendanceLogs();
  }, [token]);

  // Record a new attendance event
  const recordEvent = async ( type) => {
    let location = null;
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        };
      } catch {
        // console.log('Location not available');
      }
    }

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type, location }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to record event');
      }
      await loadAttendanceLogs();
      addNotification(`${type} recorded successfully`, 'success');
    } catch (err) {
      console.error('Failed to record event:', err);
      addNotification('Failed to record event', 'error');
    }
  };

  // Update an existing log
  const updateLog = async (logId, updates) => {
    try {
      const res = await fetch(`/api/attendance/${logId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update log');
      }
      await loadAttendanceLogs();
      addNotification('Log updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update log:', err);
      addNotification('Failed to update log', 'error');
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        attendanceLogs,
        recordEvent,
        updateLog,
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};
