// client/src/views/LeaveManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import { 
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
  XCircle
} from 'lucide-react';

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
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Leave Calendar View</p>
              <p className="text-sm text-gray-400 mt-2">
                Calendar visualization coming soon
              </p>
            </div>
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