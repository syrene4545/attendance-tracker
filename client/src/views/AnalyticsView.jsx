import { useAttendance } from '../contexts/AttendanceContext';
import { useEmployees } from '../contexts/EmployeeContext';
import { getEventLabel, getEventColor } from '../utils/eventUtils';
import { BarChart3, Activity, TrendingUp, AlertCircle, Users } from 'lucide-react';

const AnalyticsView = () => {
  const { attendanceLogs } = useAttendance();
  const { employees } = useEmployees();

  const getAnalytics = () => {
    const today = new Date();
    const thisMonth = attendanceLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
    });

    const lateCheckins = thisMonth.filter(log => {
      if (log.type !== 'sign-in') return false;
      const time = new Date(log.timestamp);
      return time.getHours() > 9 || (time.getHours() === 9 && time.getMinutes() > 15);
    });

    const onTimePercentage = thisMonth.length > 0 
      ? ((thisMonth.length - lateCheckins.length) / thisMonth.length * 100).toFixed(1)
      : 0;

    const roleBreakdown = employees.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
      return acc;
    }, {});

    return { thisMonth, lateCheckins, onTimePercentage, roleBreakdown };
  };

  const analytics = getAnalytics();

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-8 h-8 mr-2 text-indigo-600" />
          Analytics Dashboard
        </h2>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Events</p>
                <p className="text-3xl font-bold text-blue-900">{analytics.thisMonth.length}</p>
                <p className="text-xs text-blue-600 mt-1">This month</p>
              </div>
              <Activity className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">On Time Rate</p>
                <p className="text-3xl font-bold text-green-900">{analytics.onTimePercentage}%</p>
                <p className="text-xs text-green-600 mt-1">Punctuality score</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Late Check-ins</p>
                <p className="text-3xl font-bold text-orange-900">{analytics.lateCheckins.length}</p>
                <p className="text-xs text-orange-600 mt-1">After 9:15 AM</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-600 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Total Staff</p>
                <p className="text-3xl font-bold text-purple-900">{employees.length}</p>
                <p className="text-xs text-purple-600 mt-1">Active employees</p>
              </div>
              <Users className="w-12 h-12 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Role Distribution + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics.roleBreakdown).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-gray-700 capitalize">{role}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${(count / employees.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {attendanceLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{log.userName}</span>
                  <span className={`px-2 py-1 rounded text-xs ${getEventColor(log.type)}`}>
                    {getEventLabel(log.type)}
                  </span>
                  <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
