// client/src/views/LeaveManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import { 
  Calendar,
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  X, 
  Clock,
  Filter,
  Download,
  Eye,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// ✅ Add this BEFORE the main LeaveManagement component
const BalanceManagementContent = () => {
  const [users, setUsers] = useState([]); // ✅ Initialize as empty array
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [initializing, setInitializing] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      
      console.log('Users response:', response.data);
      
      // ✅ Extract users array from object
      let usersData = [];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try common property names
        usersData = response.data.users || 
                    response.data.data || 
                    response.data.employees || 
                    Object.values(response.data).find(val => Array.isArray(val)) || 
                    [];
      }
      
      console.log('Extracted users:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // const fetchUsers = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await api.get('/users');
      
  //     console.log('Users response:', response.data); // ✅ Debug log
      
  //     // ✅ Handle different response formats
  //     const usersData = Array.isArray(response.data) 
  //       ? response.data 
  //       : response.data?.users || [];
      
  //     setUsers(usersData);
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //     setUsers([]); // ✅ Set empty array on error
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const initializeAllBalances = async () => {
    if (!window.confirm(`Initialize leave balances for all ${users.length} employees for year ${selectedYear}?`)) {
      return;
    }

    setInitializing(true);
    setMessage(null);

    try {
      let successful = 0;
      let skipped = 0;
      let failed = 0;

      for (const user of users) {
        try {
          await api.post(`/leave/balances/initialize/${user.id}`, {
            year: selectedYear
          });
          successful++;
        } catch (error) {
          if (error.response?.status === 400 && error.response?.data?.error?.includes('already initialized')) {
            skipped++;
          } else {
            failed++;
            console.error(`Failed for user ${user.name}:`, error);
          }
        }
      }

      setMessage({
        type: 'success',
        text: `Initialization complete! ✅ ${successful} created, ⏭️ ${skipped} skipped, ❌ ${failed} failed`
      });

    } catch (error) {
      console.error('Error initializing balances:', error);
      setMessage({ type: 'error', text: 'Failed to initialize balances' });
    } finally {
      setInitializing(false);
    }
  };

  const initializeSingleUser = async (userId, userName) => {
    if (!window.confirm(`Initialize leave balances for ${userName} for year ${selectedYear}?`)) {
      return;
    }

    try {
      await api.post(`/leave/balances/initialize/${userId}`, {
        year: selectedYear
      });

      setMessage({
        type: 'success',
        text: `Leave balances initialized for ${userName}`
      });
    } catch (error) {
      console.error('Error initializing balance:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to initialize balance'
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            )}
            <p
              className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              About Leave Balance Initialization
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              Initialize leave balances for all employees at the start of each year. Standard allocations:
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li><strong>Annual Leave:</strong> 21 days per year</li>
              <li><strong>Sick Leave:</strong> 30 days</li>
              <li><strong>Unpaid Leave:</strong> 0 days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Year Selection & Bulk Action */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={initializeAllBalances}
            disabled={initializing || loading}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {initializing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Initialize All for {selectedYear}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Employees ({users.length})
        </h3>
        
        {/* ✅ Add loading state */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No employees found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {user.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => initializeSingleUser(user.id, user.name)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Initialize {selectedYear}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SickLeaveCycleReport = () => {
  const [cycleData, setCycleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCycleData();
  }, []);

  const fetchCycleData = async () => {
    try {
      const response = await api.get('/leave/reports/sick-leave-cycle');
      setCycleData(response.data.report || []);
    } catch (error) {
      console.error('Error fetching cycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600">
        <h2 className="text-xl font-bold text-white">
          Sick Leave 3-Year Cycle Report
        </h2>
        <p className="text-sm text-white opacity-90">
          {new Date().getFullYear() - 2} - {new Date().getFullYear()}
        </p>
      </div>
      
      {loading ? (
        <div className="p-12 text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Allowance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Used in Cycle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cycleData.map((emp) => (
                <tr key={emp.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    30 days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.usedInCycle} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {30 - emp.usedInCycle} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      emp.usedInCycle >= 30 
                        ? 'bg-red-100 text-red-800'
                        : emp.usedInCycle >= 20
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {emp.usedInCycle >= 30 ? 'Exhausted' : 'Available'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ✅ Add this BEFORE the main LeaveManagement component
const LeaveCalendarContent = () => {
  const [leaveCalendar, setLeaveCalendar] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
    fetchDepartments();
  }, [currentMonth, selectedDepartment]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // Get first and last day of current month
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const params = {
        start_date: firstDay.toISOString().split('T')[0],
        end_date: lastDay.toISOString().split('T')[0]
      };
      
      if (selectedDepartment !== 'all') {
        params.department_id = selectedDepartment;
      }
      
      const response = await api.get('/leave/calendar', { params });
      setLeaveCalendar(response.data.calendar || []);
    } catch (error) {
      console.error('Error fetching calendar:', error);
      setLeaveCalendar([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      const depts = Array.isArray(response.data) 
        ? response.data 
        : response.data?.departments || [];
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getLeaveForDay = (day) => {
    const dateStr = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    ).toISOString().split('T')[0];
    
    return leaveCalendar.filter(leave => {
      const startDate = leave.startDate.split('T')[0];
      const endDate = leave.endDate.split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      annual: 'bg-blue-500',
      sick: 'bg-red-500',
      unpaid: 'bg-gray-500',
      maternity: 'bg-pink-500',
      paternity: 'bg-purple-500',
      study: 'bg-green-500'
    };
    return colors[type] || 'bg-indigo-500';
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
            {monthYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
          >
            Today
          </button>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Department:
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Leave Types:</span>
        {[
          { type: 'annual', label: 'Annual' },
          { type: 'sick', label: 'Sick' },
          { type: 'maternity', label: 'Maternity' },
          { type: 'paternity', label: 'Paternity' },
          { type: 'study', label: 'Study' },
          { type: 'unpaid', label: 'Unpaid' }
        ].map(({ type, label }) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${getLeaveTypeColor(type)}`}></div>
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Week days header */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-semibold text-gray-700"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="min-h-[120px] bg-gray-50 border-b border-r border-gray-200"
              />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const leavesForDay = getLeaveForDay(day);
              const today = isToday(day);

              return (
                <div
                  key={day}
                  className={`min-h-[120px] border-b border-r border-gray-200 p-2 ${
                    today ? 'bg-indigo-50' : 'bg-white'
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      today
                        ? 'bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                        : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </div>

                  <div className="space-y-1">
                    {leavesForDay.slice(0, 3).map((leave, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded text-white truncate ${getLeaveTypeColor(leave.leaveType)}`}
                        title={`${leave.employeeName} - ${leave.leaveType} leave`}
                      >
                        {leave.employeeName}
                      </div>
                    ))}
                    {leavesForDay.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{leavesForDay.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leave Days</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveCalendar.reduce((sum, leave) => {
                  const start = new Date(leave.startDate);
                  const end = new Date(leave.endDate);
                  const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                  const lastOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                  
                  const overlapStart = start > firstOfMonth ? start : firstOfMonth;
                  const overlapEnd = end < lastOfMonth ? end : lastOfMonth;
                  
                  if (overlapStart <= overlapEnd) {
                    return sum + Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
                  }
                  return sum;
                }, 0)}
              </p>
            </div>
            <CalendarIcon className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employees on Leave</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(leaveCalendar.map(l => l.userId)).size}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {leaveCalendar.length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

  

const LeaveManagement = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('my-leave');
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all',
    dateRange: 'all'
  });

  const isAdmin = ['admin', 'hr'].includes(currentUser.role);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
        setLoading(true);
        
        // Load leave balance - ✅ Fixed endpoint
        const balanceRes = await api.get(`/leave/balances/${currentUser.id}`);
        setLeaveBalance(balanceRes.data.balances); // ✅ Changed from .balance to .balances
        
        // Load my leave requests - ✅ Use query params
        const requestsRes = await api.get(`/leave/requests`, {
        params: { user_id: currentUser.id }
        });
        setLeaveRequests(requestsRes.data.requests || []);
        
        // Load leave types
        const typesRes = await api.get('/leave/types');
        setLeaveTypes(typesRes.data.types || []);
        
        // Load pending approvals if admin/hr
        if (isAdmin) {
        const approvalsRes = await api.get('/leave/requests', {
            params: { status: 'pending' }
        });
        setPendingApprovals(approvalsRes.data.requests || []);
        
        // Load stats - ✅ Need to create this endpoint
        try {

            // Load stats
            const statsRes = await api.get('/leave/stats/overview');
            setStats(statsRes.data);

            // const statsRes = await api.get(`/leave/stats/${currentUser.id}`);
            // setStats(statsRes.data);
        } catch (err) {
            console.log('Stats not available:', err);
        }
        }
    } catch (error) {
        console.error('Failed to load leave data:', error);
    } finally {
        setLoading(false);
    }
    };



//   const loadData = async () => {
//     try {
//       setLoading(true);
      
//       // Load leave balance
//       const balanceRes = await api.get(`/leave/balance/${currentUser.id}`);
//       setLeaveBalance(balanceRes.data.balance);
      
//       // Load my leave requests
//       const requestsRes = await api.get(`/leave/requests/${currentUser.id}`);
//       setLeaveRequests(requestsRes.data.requests || []);
      
//       // Load leave types
//       const typesRes = await api.get('/leave/types');
//       setLeaveTypes(typesRes.data.types || []);
      
//       // Load pending approvals if admin/hr
//       if (isAdmin) {
//         const approvalsRes = await api.get('/leave/approvals/pending');
//         setPendingApprovals(approvalsRes.data.requests || []);
        
//         // Load stats
//         const statsRes = await api.get('/leave/stats');
//         setStats(statsRes.data);
//       }
//     } catch (error) {
//       console.error('Failed to load leave data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({ ...prev, [name]: value }));
  };

  const calculateDays = () => {
    if (!requestForm.startDate || !requestForm.endDate) return 0;
    
    const start = new Date(requestForm.startDate);
    const end = new Date(requestForm.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Exclude weekends
    let businessDays = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        businessDays++;
      }
    }
    
    return businessDays;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    const days = calculateDays();
    if (days <= 0) {
      alert('Please select valid dates');
      return;
    }
    
    // Check balance
    const leaveTypeBalance = leaveBalance?.find(b => b.leaveType === requestForm.leaveType);
    if (leaveTypeBalance && days > leaveTypeBalance.remainingDays) {
      alert(`Insufficient leave balance. You have ${leaveTypeBalance.remainingDays} days remaining.`);
      return;
    }
    
    try {
      setSubmitting(true);
      
      await api.post('/leave/requests', {
        leaveType: requestForm.leaveType,
        startDate: requestForm.startDate,
        endDate: requestForm.endDate,
        numberOfDays: days,
        reason: requestForm.reason,
        emergencyContact: requestForm.emergencyContact,
        emergencyPhone: requestForm.emergencyPhone
      });
      
      alert('Leave request submitted successfully!');
      setShowRequestModal(false);
      setRequestForm({
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
        emergencyContact: '',
        emergencyPhone: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to submit leave request:', error);
      alert(error.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReject = async (requestId, action, reason) => {
    if (!window.confirm(`Are you sure you want to ${action} this leave request?`)) {
        return;
    }
    
    try {
        if (action === 'approve') {
        await api.post(`/leave/requests/${requestId}/approve`);
        } else {
        await api.post(`/leave/requests/${requestId}/reject`, {
            rejectionReason: reason
        });
        }
        alert(`Leave request ${action}d successfully!`);
        loadData();
    } catch (error) {
        console.error(`Failed to ${action} leave request:`, error);
        alert(error.response?.data?.error || `Failed to ${action} leave request`);
    }
  };

//   const handleApproveReject = async (requestId, action) => {
//     if (!window.confirm(`Are you sure you want to ${action} this leave request?`)) {
//       return;
//     }
    
//     try {
//       await api.put(`/leave/requests/${requestId}/${action}`);
//       alert(`Leave request ${action}ed successfully!`);
//       loadData();
//     } catch (error) {
//       console.error(`Failed to ${action} leave request:`, error);
//       alert(`Failed to ${action} leave request`);
//     }
//   };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
        return;
    }
    
    try {
        await api.post(`/leave/requests/${requestId}/cancel`);
        alert('Leave request cancelled successfully!');
        loadData();
    } catch (error) {
        console.error('Failed to cancel leave request:', error);
        alert(error.response?.data?.error || 'Failed to cancel leave request');
    }
  };

//   const handleCancelRequest = async (requestId) => {
//     if (!window.confirm('Are you sure you want to cancel this leave request?')) {
//       return;
//     }
    
//     try {
//       await api.delete(`/leave/requests/${requestId}`);
//       alert('Leave request cancelled successfully!');
//       loadData();
//     } catch (error) {
//       console.error('Failed to cancel leave request:', error);
//       alert('Failed to cancel leave request');
//     }
//   };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      cancelled: <X className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800',
      sick: 'bg-red-100 text-red-800',
      unpaid: 'bg-gray-100 text-gray-800',
      maternity: 'bg-pink-100 text-pink-800',
      study: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredRequests = leaveRequests.filter(req => {
    if (filters.status !== 'all' && req.status !== filters.status) return false;
    if (filters.leaveType !== 'all' && req.leaveType !== filters.leaveType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading leave data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Request and manage employee leave</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Request Leave
        </button>
      </div>

      {/* Stats Cards */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats.pendingCount || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Leave Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.onLeaveToday || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.thisMonthCount || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total This Year</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.yearTotalDays || 0} days
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Balance */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Your Leave Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaveBalance && leaveBalance.map(balance => (
            <div key={balance.leaveType} className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-90 capitalize">{balance.leaveType} Leave</p>
              <p className="text-3xl font-bold mt-2">{balance.remainingDays}</p>
              <p className="text-sm opacity-75 mt-1">
                of {balance.totalDays} days remaining
              </p>
              <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${(balance.remainingDays / balance.totalDays) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('my-leave')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'my-leave'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My Leave Requests
              </div>
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'approvals'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Pending Approvals
                    {pendingApprovals.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {pendingApprovals.length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'calendar'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Leave Calendar
                  </div>
                </button>

                {/* ✅ Add Balance Management Tab Button HERE */}
                <button
                  onClick={() => setActiveTab('balances')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'balances'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Balance Management
                  </div>
                </button>

              </>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* My Leave Requests Tab */}
          {activeTab === 'my-leave' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex-1">
                  <select
                    value={filters.leaveType}
                    onChange={(e) => setFilters(prev => ({ ...prev, leaveType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Types</option>
                    {leaveTypes.map(type => (
                      <option key={type.type} value={type.type} className="capitalize">
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Leave Requests List */}
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No leave requests found</p>
                  <p className="text-sm text-gray-400 mt-2">Click "Request Leave" to submit a new request</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map(request => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded capitalize ${getLeaveTypeColor(request.leaveType)}`}>
                              {request.leaveType}
                            </span>
                            <span className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Start Date</p>
                              <p className="font-medium text-gray-900">{formatDate(request.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">End Date</p>
                              <p className="font-medium text-gray-900">{formatDate(request.endDate)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Duration</p>
                              <p className="font-medium text-gray-900">{request.numberOfDays} days</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Submitted</p>
                              <p className="font-medium text-gray-900">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          {request.reason && (
                            <div className="mt-3 text-sm">
                              <p className="text-gray-600">Reason:</p>
                              <p className="text-gray-900">{request.reason}</p>
                            </div>
                          )}
                          {request.rejectionReason && (
                            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                              <p className="text-red-800 font-medium">Rejection Reason:</p>
                              <p className="text-red-700">{request.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              className="text-red-600 hover:text-red-700 p-2"
                              title="Cancel Request"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'approvals' && isAdmin && (
            <div className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map(request => (
                    <div
                      key={request.id}
                      className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-lg font-semibold text-gray-900">
                              {request.employeeName}
                            </span>
                            <span className={`px-3 py-1 text-xs font-medium rounded capitalize ${getLeaveTypeColor(request.leaveType)}`}>
                              {request.leaveType}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Employee Number</p>
                              <p className="font-medium text-gray-900">{request.employeeNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Department</p>
                              <p className="font-medium text-gray-900">{request.department}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Period</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Duration</p>
                              <p className="font-medium text-gray-900">{request.numberOfDays} days</p>
                            </div>
                          </div>
                          {request.reason && (
                            <div className="mt-3 text-sm">
                              <p className="text-gray-600">Reason:</p>
                              <p className="text-gray-900">{request.reason}</p>
                            </div>
                          )}
                          {request.emergencyContact && (
                            <div className="mt-3 text-sm">
                              <p className="text-gray-600">Emergency Contact:</p>
                              <p className="text-gray-900">
                                {request.emergencyContact} - {request.emergencyPhone}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Approval Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveReject(request.id, 'approve')}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection:');
                              if (reason) {
                                handleApproveReject(request.id, 'reject', reason);
                              }
                            }}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Leave Calendar Tab */}

          {activeTab === 'calendar' && isAdmin && (
            <LeaveCalendarContent />
          )}

          {/* {activeTab === 'calendar' && isAdmin && (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Leave Calendar View</p>
              <p className="text-sm text-gray-400 mt-2">
                Calendar visualization coming soon
              </p>
            </div>
          )} */}

          {/* ✅ Balance Management Tab Content - ADD THIS */}
          {activeTab === 'balances' && isAdmin && (
            <BalanceManagementContent />
          )}

        </div>
      </div>

      

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Request Leave</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="leaveType"
                    value={requestForm.leaveType}
                    onChange={handleRequestChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {leaveTypes.map(type => (
                      <option key={type.type} value={type.type}>
                        {type.name} ({leaveBalance?.find(b => b.leaveType === type.type)?.remainingDays || 0} days available)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={requestForm.startDate}
                      onChange={handleRequestChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={requestForm.endDate}
                      onChange={handleRequestChange}
                      min={requestForm.startDate || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {requestForm.startDate && requestForm.endDate && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm text-indigo-900">
                      <strong>Duration:</strong> {calculateDays()} business days
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={requestForm.reason}
                    onChange={handleRequestChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Please provide a reason for your leave request..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={requestForm.emergencyContact}
                      onChange={handleRequestChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Contact person"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={requestForm.emergencyPhone}
                      onChange={handleRequestChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="+27 82 123 4567"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Leave requests must be submitted at least 7 days in advance</li>
                        <li>Emergency leave may be submitted with shorter notice</li>
                        <li>Your request will be reviewed by HR/Management</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;