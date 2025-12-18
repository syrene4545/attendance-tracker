import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../contexts/AttendanceContext';
import { getEventLabel, getEventIcon, getEventColor } from '../utils/eventUtils';
import { getCurrentDate, formatTime, getTimezoneOffset } from '../utils/timezone';
import { Home, Calendar, TrendingUp, Clock, Check } from 'lucide-react';
import api from '../api/api';

const DashboardView = () => {
  const { currentUser, token } = useAuth();
  const { recordEvent, attendanceLogs } = useAttendance();
  const [todayLogs, setTodayLogs] = useState([]);
  const [stats, setStats] = useState({ daysThisWeek: 0, onTimeRate: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch weekly + monthly summary stats from backend
  useEffect(() => {
    const fetchSummaries = async () => {
      if (!token) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [weekRes, monthRes] = await Promise.all([
          api.get('/attendance/summary'),
          api.get('/attendance/summary/month'),
        ]);

        setStats({
          daysThisWeek: weekRes.data.daysThisWeek || 0,
          onTimeRate: weekRes.data.onTimeRate || 0,
          totalHours: monthRes.data.totalHours || 0
        });
      } catch (err) {
        console.error('❌ Failed to fetch summaries:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchSummaries();
    }
  }, [token]);

  // Track today's logs for the current user
  useEffect(() => {
    const today = getCurrentDate();
    const logs = attendanceLogs.filter((l) => {
      const logDate = l.timestamp ? l.timestamp.split('T')[0] : '';
      return logDate === today && l.userId === currentUser?.id;
    });
    setTodayLogs(logs);
  }, [attendanceLogs, currentUser]);

  const hasRecorded = (type) => todayLogs.some((l) => l.type === type);

  const handleRecord = async (type) => {
    setRecording(type);
    try {
      await recordEvent(type);
    } finally {
      setRecording(null);
    }
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Format current time for display
  const displayTime = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Harare',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(currentTime);

  const displayDate = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Harare',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentTime);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome card with timezone display */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {currentUser?.name}!
            </h2>
            <p className="text-gray-600">Track your attendance for today</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600 font-mono">
              {displayTime}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {displayDate}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {getTimezoneOffset()}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance buttons */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Home className="w-6 h-6 mr-2 text-indigo-600" />
          Today's Attendance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['sign-in', 'lunch-out', 'lunch-in', 'sign-out'].map((type) => {
            const recordedLog = todayLogs.find(l => l.type === type);
            const isRecording = recording === type;
            
            return (
              <button
                key={type}
                onClick={() => handleRecord(type)}
                disabled={hasRecorded(type) || isRecording}
                className={`p-6 rounded-xl border-2 transition-all ${
                  hasRecorded(type)
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                    : isRecording
                    ? 'bg-indigo-50 border-indigo-300 opacity-70'
                    : 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto ${getEventColor(type)}`}
                >
                  {getEventIcon(type)}
                </div>
                <h4 className="font-semibold text-gray-900 text-center">
                  {getEventLabel(type)}
                </h4>
                {hasRecorded(type) && recordedLog && (
                  <div className="mt-2 text-center">
                    <div className="flex items-center justify-center text-green-600 text-sm">
                      <Check className="w-4 h-4 mr-1" />
                      Recorded
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(recordedLog.timestamp)}
                    </div>
                  </div>
                )}
                {isRecording && (
                  <div className="mt-2 text-center">
                    <div className="text-indigo-600 text-sm">
                      Recording...
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Activity Summary */}
      {todayLogs.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Today's Activity</h4>
          <div className="space-y-2">
            {todayLogs.map((log, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{getEventLabel(log.type)}</span>
                <span className="text-gray-500">{formatTime(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              {loading ? (
                <p className="text-2xl font-bold text-gray-400">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{stats.daysThisWeek} Days</p>
              )}
            </div>
            <Calendar className="w-10 h-10 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Time</p>
              {loading ? (
                <p className="text-2xl font-bold text-gray-400">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <p className="text-2xl font-bold text-green-600">{stats.onTimeRate}%</p>
              )}
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              {loading ? (
                <p className="text-2xl font-bold text-gray-400">Loading...</p>
              ) : error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {formatHours(stats.totalHours)}
                </p>
              )}
            </div>
            <Clock className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;