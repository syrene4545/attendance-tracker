import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { useEmployees } from '../contexts/EmployeeContext';
import { getEventLabel, getEventIcon, getEventColor } from '../utils/eventUtils';
import { Calendar, Filter, Download, Edit2, Check, X, MapPin } from 'lucide-react';
import api from '../api/api';

const AttendanceView = () => {
  const { currentUser, checkPermission } = useAuth();
  const { attendanceLogs, updateLog } = useAttendance();
  const { employees } = useEmployees();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [editingLog, setEditingLog] = useState(null);

  // 🔍 DEBUG: Check permissions
//   useEffect(() => {
//     console.log('=== ATTENDANCE VIEW DEBUG ===');
//     console.log('Current User:', currentUser);
//     console.log('User Role:', currentUser?.role);
//     console.log('Can view_all?', checkPermission('view_all'));
//     console.log('Can export_data?', checkPermission('export_data'));
//     console.log('checkPermission function:', typeof checkPermission);
//     console.log('============================');
//   }, [currentUser, checkPermission]);

  const filterLogs = () => {
    return attendanceLogs.filter(log => {
      const logDate = log.timestamp ? log.timestamp.split('T')[0] : '';
      const dateMatch = !selectedDate || logDate === selectedDate;
      const employeeMatch = selectedEmployee === 'all' || log.userId === parseInt(selectedEmployee);
      const roleMatch = checkPermission('view_all') || log.userId === currentUser?.id;
      return dateMatch && employeeMatch && roleMatch;
    });
  };

  // ✅ Fix CSV Export
  const exportToCSV = async () => {
    // console.log('🔵 Export CSV button clicked');
    try {
      const response = await api.get('/export/csv', {
        params: { 
          startDate: selectedDate, 
          endDate: selectedDate 
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    //   console.log('✅ CSV exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // ✅ Fix Edit Log
  const saveEdit = async () => {
    if (!editingLog) return;
    
    try {
      await updateLog(editingLog.id, {
        type: editingLog.type,
        timestamp: editingLog.timestamp
      });
      setEditingLog(null);
    //   console.log('✅ Attendance updated successfully');
    } catch (error) {
      console.error('❌ Update failed:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  const filtered = filterLogs();

  // 🔍 DEBUG: Log render decision
  const canExport = checkPermission('export_data');
//   console.log('🔵 Render check - Can export?', canExport);

  return (
    <div className="p-6 space-y-6">
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
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
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

              {/* 🔍 DEBUG VERSION - Shows button state */}
              <div className="self-end">
                {canExport ? (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-red-200 text-red-800 rounded-lg text-sm">
                    🔒 No Export Permission
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
          Attendance Logs ({filtered.length})
        </h2>
        
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={checkPermission('view_all') ? 7 : 6} className="text-center py-8 text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{log.timestamp?.split('T')[0]}</td>
                    {checkPermission('view_all') && (
                      <td className="py-3 px-4">{log.userName}</td>
                    )}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getEventColor(log.type)}`}>
                        {getEventIcon(log.type)}
                        <span>{getEventLabel(log.type)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(log.timestamp).toLocaleTimeString()}</td>
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

      {/* ✅ Edit Modal */}
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
                  value={editingLog.timestamp?.slice(0, 16)}
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

export default AttendanceView;