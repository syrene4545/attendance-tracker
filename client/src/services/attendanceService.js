// ==================== Frontend API Service ====================
// File: client/src/services/attendanceService.js

import api from './api';

export const attendanceService = {
  // Record attendance
  recordAttendance: async (type, location) => {
    const response = await api.post('/attendance', { type, location });
    return response.data;
  },

  // Get attendance logs
  getAttendanceLogs: async (filters = {}) => {
    const response = await api.get('/attendance', { params: filters });
    return response.data.logs;
  },

  // Update attendance log
  updateAttendanceLog: async (id, updates) => {
    const response = await api.put(`/attendance/${id}`, updates);
    return response.data.log;
  },

  // Delete attendance log
  deleteAttendanceLog: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (startDate, endDate) => {
    const response = await api.get('/analytics', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Export to CSV
  exportToCSV: async (startDate, endDate) => {
    const response = await api.get('/export/csv', {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};