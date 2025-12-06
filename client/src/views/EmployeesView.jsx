import { useEffect, useState } from 'react';
import api from '../api/api';
import { ROLES } from '../utils/permissions';
import { Users, UserPlus } from 'lucide-react';

const EmployeesView = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.ASSISTANT,
    department: ''
  });

  // ================================
  // 🚀 FETCH EMPLOYEES FROM BACKEND
  // ================================
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users'); // <--- JWT auto-attached
      setEmployees(res.data.users || res.data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ================================
  // 🚀 ADD EMPLOYEE (ADMIN ONLY)
  // ================================
  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      alert('Name, email, and password are required.');
      return;
    }

    try {
      await api.post('/auth/register', newEmployee);
      setShowAddModal(false);
      setNewEmployee({
        name: '',
        email: '',
        password: '',
        role: ROLES.ASSISTANT,
        department: ''
      });

      // Reload employees
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add employee.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Employees list */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-2 text-indigo-600" />
            Employees ({employees.length})
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <p className="text-gray-600">Loading employees…</p>
        ) : employees.length === 0 ? (
          <p className="text-gray-500">No employees found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => (
              <div
                key={emp.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                    <p className="text-sm text-gray-600">{emp.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      emp.role === ROLES.ADMIN
                        ? 'bg-purple-100 text-purple-700'
                        : emp.role === ROLES.HR
                        ? 'bg-blue-100 text-blue-700'
                        : emp.role === ROLES.PHARMACIST
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {emp.role}
                  </span>
                </div>

                {emp.department && (
                  <p className="text-sm text-gray-500">
                    Department: {emp.department}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add New Employee
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <input
                type="text"
                value={newEmployee.name}
                onChange={e =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                placeholder="Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              {/* Email */}
              <input
                type="email"
                value={newEmployee.email}
                onChange={e =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              {/* Password */}
              <input
                type="password"
                value={newEmployee.password}
                onChange={e =>
                  setNewEmployee({ ...newEmployee, password: e.target.value })
                }
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              {/* Role */}
              <select
                value={newEmployee.role}
                onChange={e =>
                  setNewEmployee({ ...newEmployee, role: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value={ROLES.ASSISTANT}>Assistant</option>
                <option value={ROLES.PHARMACIST}>Pharmacist</option>
                <option value={ROLES.HR}>HR</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>

              {/* Department */}
              <input
                type="text"
                value={newEmployee.department}
                onChange={e =>
                  setNewEmployee({ ...newEmployee, department: e.target.value })
                }
                placeholder="Department"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddEmployee}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                Add Employee
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
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

export default EmployeesView;
