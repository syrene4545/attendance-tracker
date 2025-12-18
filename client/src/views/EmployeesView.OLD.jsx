// client/src/views/EmployeeView.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  DollarSign,
  UserCheck,
  UserX,
  Download,
  X,
  Building2,
  Award
} from 'lucide-react';

const EmployeeView = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    position: '',
    status: '',
    employmentType: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load employees
      const empRes = await api.get('/employee-profiles', {
        params: {
          search: searchTerm || undefined,
          department: filters.department || undefined,
          position: filters.position || undefined,
          status: filters.status || undefined
        }
      });
      setEmployees(empRes.data.employees || []);
      
      // Load departments
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data.departments || []);
      
      // Load positions
      const posRes = await api.get('/job-positions');
      setPositions(posRes.data.positions || []);
      
      // Load stats
      const statsRes = await api.get('/employee-profiles/stats/overview');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadData();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      position: '',
      status: '',
      employmentType: ''
    });
    loadData();
  };

  const viewEmployee = async (employeeId) => {
    try {
      const res = await api.get(`/employee-profiles/${employeeId}`);
      setSelectedEmployee(res.data.employee);
      setShowEmployeeModal(true);
    } catch (error) {
      console.error('Failed to load employee details:', error);
      alert('Failed to load employee details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      'on-leave': 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      terminated: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getEmploymentTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-purple-100 text-purple-800',
      contract: 'bg-orange-100 text-orange-800',
      intern: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const calculateTenure = (hireDate) => {
    if (!hireDate) return 'N/A';
    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months < 0) {
      return `${years - 1} year${years - 1 !== 1 ? 's' : ''} ${12 + months} month${12 + months !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-600 mt-1">Manage your organization's workforce</p>
        </div>
        <button
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalEmployees || 0}
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
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.byStatus?.active || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats.byStatus?.['on-leave'] || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {departments.length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or employee number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={filters.position}
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Positions</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  value={filters.employmentType}
                  onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <div
            key={employee.userId}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => viewEmployee(employee.userId)}
          >
            <div className="p-6">
              {/* Employee Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">
                      {employee.name?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-500">{employee.employeeNumber}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(employee.employmentStatus)}`}>
                  {employee.employmentStatus}
                </span>
              </div>

              {/* Employee Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="truncate">{employee.jobTitle || 'No position'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span className="truncate">{employee.departmentName || 'No department'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                
                {employee.mobileNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{employee.mobileNumber}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(employee.hireDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mt-4">
                {employee.employmentType && (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getEmploymentTypeColor(employee.employmentType)}`}>
                    {employee.employmentType}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 px-6 py-3 flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  viewEmployee(employee.userId);
                }}
                className="text-indigo-600 hover:text-indigo-700 p-2"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-gray-600 hover:text-gray-700 p-2"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {employees.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Employee Detail Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {selectedEmployee.name?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                  <p className="text-gray-600">{selectedEmployee.jobTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Employee Number</label>
                    <p className="font-medium text-gray-900">{selectedEmployee.employeeNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium text-gray-900">{selectedEmployee.email}</p>
                  </div>
                  {selectedEmployee.mobileNumber && (
                    <div>
                      <label className="text-sm text-gray-600">Mobile</label>
                      <p className="font-medium text-gray-900">{selectedEmployee.mobileNumber}</p>
                    </div>
                  )}
                  {selectedEmployee.dateOfBirth && (
                    <div>
                      <label className="text-sm text-gray-600">Date of Birth</label>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedEmployee.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedEmployee.gender && (
                    <div>
                      <label className="text-sm text-gray-600">Gender</label>
                      <p className="font-medium text-gray-900">{selectedEmployee.gender}</p>
                    </div>
                  )}
                  {selectedEmployee.nationality && (
                    <div>
                      <label className="text-sm text-gray-600">Nationality</label>
                      <p className="font-medium text-gray-900">{selectedEmployee.nationality}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Employment Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Employment Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Department</label>
                    <p className="font-medium text-gray-900">{selectedEmployee.departmentName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Position</label>
                    <p className="font-medium text-gray-900">{selectedEmployee.jobTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Employment Type</label>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getEmploymentTypeColor(selectedEmployee.employmentType)}`}>
                      {selectedEmployee.employmentType}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedEmployee.employmentStatus)}`}>
                      {selectedEmployee.employmentStatus}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Hire Date</label>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedEmployee.hireDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Tenure</label>
                    <p className="font-medium text-gray-900">
                      {calculateTenure(selectedEmployee.hireDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Compensation */}
              {selectedEmployee.currentSalary && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Compensation
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Base Salary</label>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(selectedEmployee.currentSalary)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Payment Frequency</label>
                      <p className="font-medium text-gray-900">
                        {selectedEmployee.paymentFrequency || 'Monthly'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leave Balance */}
              {selectedEmployee.leaveBalance && selectedEmployee.leaveBalance.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Leave Balance
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedEmployee.leaveBalance.map(balance => (
                      <div key={balance.leaveType} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 capitalize">{balance.leaveType}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {balance.remainingDays}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          of {balance.totalDays} days
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(selectedEmployee.streetAddress || selectedEmployee.emergencyContactName) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEmployee.streetAddress && (
                      <div className="col-span-2">
                        <label className="text-sm text-gray-600">Address</label>
                        <p className="font-medium text-gray-900">
                          {selectedEmployee.streetAddress}
                          {selectedEmployee.city && `, ${selectedEmployee.city}`}
                          {selectedEmployee.postalCode && ` ${selectedEmployee.postalCode}`}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.emergencyContactName && (
                      <>
                        <div>
                          <label className="text-sm text-gray-600">Emergency Contact</label>
                          <p className="font-medium text-gray-900">{selectedEmployee.emergencyContactName}</p>
                        </div>
                        {selectedEmployee.emergencyContactPhone && (
                          <div>
                            <label className="text-sm text-gray-600">Emergency Phone</label>
                            <p className="font-medium text-gray-900">{selectedEmployee.emergencyContactPhone}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Edit className="w-4 h-4" />
                Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeView;