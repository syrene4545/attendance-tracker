// client/src/views/PayrollView.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  Wallet, 
  Calendar, 
  Users, 
  TrendingUp, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Play,
  Eye,
  Search,
  X  
} from 'lucide-react';
import PayslipView from './PayslipView';

const PayrollView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [runDetails, setRunDetails] = useState(null);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  const [summary, setSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showPayslipView, setShowPayslipView] = useState(false);
  
  // Processing modal state
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processMonth, setProcessMonth] = useState(new Date().getMonth() + 1);
  const [processYear, setProcessYear] = useState(new Date().getFullYear());
  const [processDepartment, setProcessDepartment] = useState('');
  const [processNotes, setProcessNotes] = useState('');
  
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadData();
    loadDepartments();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      
      // Load payroll runs
      const runsRes = await api.get('/payroll/runs', {
        params: { year: currentYear }
      });
      setPayrollRuns(runsRes.data.runs || []);
      
      // Load summary
      const summaryRes = await api.get('/payroll/reports/summary', {
        params: { year: currentYear }
      });
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to load payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.departments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadRunDetails = async (runId) => {
    try {
      const res = await api.get(`/payroll/runs/${runId}`);
      setRunDetails(res.data);
      setSelectedRun(runId);
    } catch (error) {
      console.error('Failed to load run details:', error);
      alert('Failed to load payroll run details');
    }
  };

  const handleProcessPayroll = async () => {
    if (!window.confirm(`Process payroll for ${getMonthName(processMonth)} ${processYear}?`)) {
      return;
    }

    try {
      setProcessingPayroll(true);
      
      const payload = {
        month: parseInt(processMonth),
        year: parseInt(processYear),
        notes: processNotes
      };
      
      if (processDepartment) {
        payload.departmentId = parseInt(processDepartment);
      }
      
      await api.post('/payroll/runs/process', payload);
      
      alert('Payroll processed successfully!');
      setShowProcessModal(false);
      setProcessNotes('');
      setProcessDepartment('');
      loadData();
    } catch (error) {
      console.error('Process payroll error:', error);
      alert(error.response?.data?.error || 'Failed to process payroll');
    } finally {
      setProcessingPayroll(false);
    }
  };

  const updatePaymentStatus = async (itemId, status) => {
    try {
      await api.put(`/payroll/items/${itemId}/payment`, {
        paymentStatus: status,
        paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
        paymentReference: status === 'paid' ? `PAY-${Date.now()}` : null
      });
      
      alert('Payment status updated');
      loadRunDetails(selectedRun);
    } catch (error) {
      console.error('Update payment status error:', error);
      alert('Failed to update payment status');
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      processed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const filteredItems = runDetails?.items?.filter(item =>
    item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading payroll data...</div>
      </div>
    );
  }

  const viewPayslip = (runId, userId) => {
    console.log('📄 Opening payslip for user:', userId, 'run:', runId);
    setSelectedPayslip({ runId, userId });
    setShowPayslipView(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Process and manage employee payroll</p>
        </div>
        <button
          onClick={() => setShowProcessModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Play className="w-5 h-5" />
          Process Payroll
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gross Pay</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.yearTotals?.totalGrossPay || 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.yearTotals?.totalDeductions || 0)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Net Pay</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(summary.yearTotals?.totalNetPay || 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payroll Runs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {payrollRuns.length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Payroll Runs
              </div>
            </button>
            {selectedRun && (
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Run Details
                </div>
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Payroll Runs</h2>
              
              {payrollRuns.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payroll runs yet</p>
                  <p className="text-sm text-gray-400 mt-2">Click "Process Payroll" to create your first run</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payrollRuns.map(run => (
                    <div
                      key={run.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors cursor-pointer"
                      onClick={() => {
                        loadRunDetails(run.id);
                        setActiveTab('details');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-gray-900">
                              {getMonthName(run.month)} {run.year}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(run.status)}`}>
                              {run.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {run.totalEmployees} employees
                            </div>
                            <div className="flex items-center gap-1">
                              <Wallet className="w-4 h-4" />
                              {formatCurrency(run.totalNetPay)} net
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(run.processedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Eye className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && runDetails && (
            <div className="space-y-6">
              {/* Run Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {getMonthName(runDetails.run.month)} {runDetails.run.year} Payroll
                  </h2>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(runDetails.run.status)}`}>
                    {runDetails.run.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Employees</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {runDetails.run.total_employees}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gross Pay</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(runDetails.run.total_gross_pay)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deductions</p>
                    <p className="text-xl font-bold text-red-600 mt-1">
                      {formatCurrency(runDetails.run.total_deductions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Pay</p>
                    <p className="text-xl font-bold text-green-600 mt-1">
                      {formatCurrency(runDetails.run.total_net_pay)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or employee number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Employee List */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{item.employeeName}</div>
                            <div className="text-sm text-gray-500">{item.employeeNumber}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.department}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(item.grossPay)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {formatCurrency(item.totalDeductions)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          {formatCurrency(item.netPay)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(item.paymentStatus)}`}>
                            {item.paymentStatus}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                            {item.paymentStatus === 'pending' && (
                            <button
                                onClick={() => updatePaymentStatus(item.id, 'paid')}
                                className="text-green-600 hover:text-green-700"
                                title="Mark as Paid"
                            >
                                <CheckCircle className="w-5 h-5" />
                            </button>
                            )}
                            <button
                            onClick={() => viewPayslip(runDetails.run.id, item.userId)}
                            // onClick={() => viewPayslip(item.userId, runDetails.run.id)}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="View Payslip"
                            >
                            <FileText className="w-5 h-5" />
                            </button>
                        </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No employees found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Process Payroll Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Process Payroll</h3>
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <select
                      value={processMonth}
                      onChange={(e) => setProcessMonth(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      value={processYear}
                      onChange={(e) => setProcessYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department (Optional)
                  </label>
                  <select
                    value={processDepartment}
                    onChange={(e) => setProcessDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={processNotes}
                    onChange={(e) => setProcessNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Optional notes about this payroll run..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>This will process payroll for all active employees</li>
                        <li>PAYE and UIF will be calculated automatically</li>
                        <li>This action cannot be undone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProcessModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessPayroll}
                  disabled={processingPayroll}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processingPayroll ? 'Processing...' : 'Process Payroll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {/* Payslip View Modal */}
      {showPayslipView && selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header - Fixed */}
                <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Payslip</h2>
                  <button
                    onClick={() => setShowPayslipView(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <PayslipView
                    runId={selectedPayslip.runId}
                    userId={selectedPayslip.userId}
                    onClose={() => setShowPayslipView(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* {showPayslipView && selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <PayslipView
              runId={selectedPayslip.runId}
              userId={selectedPayslip.userId}
              onClose={() => setShowPayslipView(false)}
            />
          </div>
        </div>
      )} */}

    </div>

  );
};

export default PayrollView;