import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { useEmployees } from '../contexts/EmployeeContext';
import { getEventLabel, getEventIcon, getEventColor } from '../utils/eventUtils';
import { formatDate, formatTime, toDateTimeLocal, getCurrentDate } from '../utils/timezone';
import { Activity, MapPin, Filter, Download, Edit2, Calendar, X } from 'lucide-react';
import api from '../api/api';

const RecordsView = () => {
  const { currentUser, checkPermission } = useAuth();
  const { attendanceLogs, updateLog } = useAttendance();
  const { employees } = useEmployees();
  const [selectedDate, setSelectedDate] = useState(''); // ✅ Empty = show all dates by default
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLog, setEditingLog] = useState(null);

  // Add debug logging on mount
  useEffect(() => {
    console.log('🔍 RecordsView Debug:', {
      totalLogs: attendanceLogs.length,
      canViewAll: checkPermission('view_all'),
      canEditAll: checkPermission('edit_all'),
      canExport: checkPermission('export_data'),
      currentUser: currentUser?.role
    });
  }, [attendanceLogs, currentUser]);

  // Filter logs
  const filterLogs = () => {
    const filtered = attendanceLogs.filter(log => {
      const logDate = log.timestamp ? formatDate(log.timestamp) : '';
      const dateMatch = !selectedDate || logDate === selectedDate; // ✅ Empty date = show all
      const employeeMatch = selectedEmployee === 'all' || log.userId === parseInt(selectedEmployee);
      const searchMatch = !searchTerm || log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = checkPermission('view_all') || log.userId === currentUser?.id;
      return dateMatch && employeeMatch && searchMatch && roleMatch;
    });
    
    console.log('✅ Filtered logs:', filtered.length, 'of', attendanceLogs.length);
    return filtered;
  };

  // CSV Export
  const exportToCSV = async () => {
    console.log('🔵 Export CSV button clicked');
    try {
      // If no date selected, use current date for filename
      const exportDate = selectedDate || getCurrentDate();
      
      const response = await api.get('/export/csv', {
        params: { 
          startDate: selectedDate || undefined, 
          endDate: selectedDate || undefined
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${exportDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ CSV exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // Edit Log
  const saveEdit = async () => {
    if (!editingLog) return;
    
    try {
      await updateLog(editingLog.id, {
        type: editingLog.type,
        timestamp: editingLog.timestamp
      });
      setEditingLog(null);
      console.log('✅ Attendance updated successfully');
    } catch (error) {
      console.error('❌ Update failed:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  const filteredLogs = filterLogs();
  const canExport = checkPermission('export_data');

  return (
    <div className="p-6 space-y-6">
      {/* Filters & Export Section */}
      {checkPermission('view_all') && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Filters & Reports</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="All dates"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate('')}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                      title="Clear date filter"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {canExport && (
                <div className="self-end">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="w-8 h-8 mr-2 text-indigo-600" />
            All Records ({filteredLogs.length})
          </h2>
          <input
            type="text"
            placeholder="Search by employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                {checkPermission('view_all') && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Employee</th>
                )}
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Event</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                {checkPermission('edit_all') && (
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={checkPermission('view_all') ? 7 : 6} className="text-center py-8 text-gray-500">
                    {attendanceLogs.length === 0 
                      ? 'No attendance records in the system'
                      : 'No records match your filters'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{formatDate(log.timestamp)}</td>
                    {checkPermission('view_all') && (
                      <td className="py-3 px-4">{log.userName}</td>
                    )}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getEventColor(log.type)}`}>
                        {getEventIcon(log.type)}
                        <span>{getEventLabel(log.type)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatTime(log.timestamp)}</td>
                    <td className="py-3 px-4">
                      {log.location ? (
                        <div className="flex items-center space-x-1 text-sm">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Verified</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {log.edited ? (
                        <span className="text-xs text-orange-600 font-medium">Edited</span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">Original</span>
                      )}
                    </td>
                    {checkPermission('edit_all') && (
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setEditingLog(log)} 
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Attendance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  value={editingLog.type}
                  onChange={(e) => setEditingLog({...editingLog, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="sign-in">Morning Sign-In</option>
                  <option value="lunch-out">Lunch Sign-Out</option>
                  <option value="lunch-in">Lunch Return</option>
                  <option value="sign-out">End-of-Day Sign-Out</option>
                  <option value="break-start">Break Start</option>
                  <option value="break-end">Break End</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(editingLog.timestamp)}
                  onChange={(e) => setEditingLog({...editingLog, timestamp: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={saveEdit}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingLog(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsView;