import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Calendar,
  Users,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Edit2
} from 'lucide-react';

const LeaveBalanceManagementView = ({ onViewChange }) => {
  const [users, setUsers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

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
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => onViewChange('leave')}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leave Management
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Leave Balance Management</h1>
        <p className="mt-2 text-gray-600">
          Initialize and manage employee leave balances for each year
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              About Leave Balance Initialization
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              Initialize leave balances for all employees at the start of each year. Standard South African leave allocations:
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li><strong>Annual Leave:</strong> 21 days per year</li>
              <li><strong>Sick Leave:</strong> 30 days (accumulated over 3 years)</li>
              <li><strong>Unpaid Leave:</strong> 0 days (no limit, but unpaid)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Year Selection & Bulk Action */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
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

            <div className="flex items-center gap-3 pt-6">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                Initializing for: <strong>{selectedYear}</strong>
              </span>
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
                Initialize All Employees
              </>
            )}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Employees ({users.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No employees found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
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

      {/* Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total Employees: <span className="font-semibold text-gray-900">{users.length}</span>
          </span>
          <span className="text-gray-600">
            Year: <span className="font-semibold text-indigo-600">{selectedYear}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceManagementView;