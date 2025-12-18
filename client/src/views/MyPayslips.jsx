// client/src/views/MyPayslips.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import PayslipView from './PayslipView'; // ✅ Add this import
import { 
  FileText, 
  Download, 
  Calendar, 
  Wallet,
  TrendingUp,
  Eye,
  X,
  Receipt,
  Printer
} from 'lucide-react';

const MyPayslips = () => {
  const { currentUser } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadPayslips();
  }, [yearFilter]);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading payslips for user:', currentUser.id);
      
      const res = await api.get(`/payroll/payslips/${currentUser.id}`);
      
      console.log('✅ Payslips response:', res.data);
      console.log('✅ First payslip:', res.data.payslips[0]); // ✅ Check structure
      
      // Filter by year - use the year field directly!
      const filtered = res.data.payslips.filter(p => p.year === yearFilter);
      
      console.log('📋 Filtered payslips for year', yearFilter, ':', filtered);
      
      setPayslips(filtered);
      
      // Calculate stats for the year
      if (filtered.length > 0) {
        const totalGross = filtered.reduce((sum, p) => sum + parseFloat(p.grossPay || 0), 0);
        const totalNet = filtered.reduce((sum, p) => sum + parseFloat(p.netPay || 0), 0);
        const totalDeductions = filtered.reduce((sum, p) => sum + parseFloat(p.totalDeductions || 0), 0);
        
        setStats({
          totalGross,
          totalNet,
          totalDeductions,
          payslipsCount: filtered.length
        });
        
        console.log('📊 Stats calculated:', { totalGross, totalNet, totalDeductions });
      } else {
        setStats(null);
        console.log('⚠️ No payslips found for year', yearFilter);
      }
    } catch (error) {
      console.error('❌ Failed to load payslips:', error);
      console.error('❌ Error details:', error.response?.data);
      alert('Failed to load your payslips');
    } finally {
      setLoading(false);
    }
  };

  const viewPayslip = (runId) => {
    console.log('👁️ Viewing payslip - runId:', runId, 'userId:', currentUser.id);
    setSelectedPayslip({ runId, userId: currentUser.id });
    setShowPayslipModal(true);
  };

  const downloadPayslip = (payslip) => {
    // Open the payslip in modal, then trigger print
    setSelectedPayslip({ runId: payslip.payrollRunId, userId: currentUser.id });
    setShowPayslipModal(true);
    
    // Wait for modal to render, then print
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const printPayslip = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'R 0.00';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || month;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const availableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your payslips...</div>
      </div>
    );
  }

  const openPayslipPrintWindow = (payslipData) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print payslips');
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payslip - ${payslipData.period.monthName} ${payslipData.period.year}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            padding: 40px;
            color: #111827;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .company-info h1 {
            color: #4F46E5;
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .company-info p {
            color: #6B7280;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .payslip-title {
            text-align: right;
          }
          
          .payslip-title h2 {
            color: #4F46E5;
            font-size: 24px;
            margin-bottom: 5px;
          }
          
          .payslip-title p {
            color: #6B7280;
            font-size: 14px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .detail-section h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #6B7280;
            margin-bottom: 15px;
            font-weight: 600;
          }
          
          .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #F3F4F6;
          }
          
          .detail-label {
            color: #6B7280;
            font-size: 14px;
          }
          
          .detail-value {
            color: #111827;
            font-weight: 500;
            font-size: 14px;
          }
          
          .earnings-deductions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .earnings-box {
            background: #F0FDF4;
            border: 2px solid #BBF7D0;
            border-radius: 8px;
            padding: 20px;
          }
          
          .deductions-box {
            background: #FEF2F2;
            border: 2px solid #FECACA;
            border-radius: 8px;
            padding: 20px;
          }
          
          .box-title {
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 15px;
          }
          
          .earnings-box .box-title {
            color: #15803D;
          }
          
          .deductions-box .box-title {
            color: #DC2626;
          }
          
          .line-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          
          .line-item-label {
            color: #374151;
            font-size: 14px;
          }
          
          .line-item-value {
            font-weight: 500;
            font-size: 14px;
          }
          
          .total-line {
            border-top: 2px solid #E5E7EB;
            padding-top: 10px;
            margin-top: 10px;
            font-weight: 600;
          }
          
          .earnings-box .total-line .line-item-value {
            color: #15803D;
          }
          
          .deductions-box .total-line .line-item-value {
            color: #DC2626;
          }
          
          .net-pay {
            background: #4F46E5;
            color: white;
            padding: 25px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .net-pay-label {
            font-size: 18px;
            font-weight: 600;
          }
          
          .net-pay-amount {
            font-size: 32px;
            font-weight: 700;
          }
          
          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .summary-table td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
          }
          
          .summary-table .label {
            font-weight: 500;
            color: #374151;
          }
          
          .summary-table .value {
            text-align: right;
            font-weight: 600;
          }
          
          .summary-table .final-row {
            background: #F9FAFB;
            font-size: 16px;
          }
          
          .summary-table .final-row .value {
            color: #4F46E5;
          }
          
          .payment-ref {
            background: #F9FAFB;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 12px;
            color: #6B7280;
          }
          
          .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #E5E7EB;
            color: #9CA3AF;
            font-size: 12px;
          }
          
          .actions {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
          }
          
          .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            text-decoration: none;
          }
          
          .btn-primary {
            background: #4F46E5;
            color: white;
          }
          
          .btn-secondary {
            background: #6B7280;
            color: white;
          }
          
          .btn:hover {
            opacity: 0.9;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .actions {
              display: none;
            }
            
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="company-info">
              <h1>Lera Health</h1>
              <p>67C Landross Mare Street</p>
              <p>Polokwane, 0700</p>
              <p>Tel: +27 72 640 8996</p>
            </div>
            <div class="payslip-title">
              <h2>PAYSLIP</h2>
              <p>${payslipData.period.monthName} ${payslipData.period.year}</p>
              <p style="font-size: 12px; margin-top: 5px;">Processed: ${new Date(payslipData.period.processedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <!-- Employee & Payment Details -->
          <div class="details-grid">
            <div class="detail-section">
              <h3>Employee Information</h3>
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${payslipData.employee.name}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Employee No:</span>
                <span class="detail-value">${payslipData.employee.employeeNumber}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${payslipData.employee.department}</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>Payment Details</h3>
              <div class="detail-item">
                <span class="detail-label">Period:</span>
                <span class="detail-value">${payslipData.period.monthName} ${payslipData.period.year}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${payslipData.payment.paymentDate ? new Date(payslipData.payment.paymentDate).toLocaleDateString() : 'Pending'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: ${payslipData.payment.paymentStatus === 'paid' ? '#059669' : '#D97706'}">${payslipData.payment.paymentStatus.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <!-- Earnings & Deductions -->
          <div class="earnings-deductions">
            <div class="earnings-box">
              <div class="box-title">Earnings</div>
              <div class="line-item">
                <span class="line-item-label">Basic Salary</span>
                <span class="line-item-value">${formatCurrency(payslipData.earnings.baseSalary)}</span>
              </div>
              ${parseFloat(payslipData.earnings.allowances) > 0 ? `
              <div class="line-item">
                <span class="line-item-label">Allowances</span>
                <span class="line-item-value">${formatCurrency(payslipData.earnings.allowances)}</span>
              </div>
              ` : ''}
              <div class="line-item total-line">
                <span class="line-item-label">Gross Pay</span>
                <span class="line-item-value">${formatCurrency(payslipData.earnings.grossPay)}</span>
              </div>
            </div>

            <div class="deductions-box">
              <div class="box-title">Deductions</div>
              <div class="line-item">
                <span class="line-item-label">PAYE (Tax)</span>
                <span class="line-item-value">${formatCurrency(payslipData.deductions.paye)}</span>
              </div>
              <div class="line-item">
                <span class="line-item-label">UIF</span>
                <span class="line-item-value">${formatCurrency(payslipData.deductions.uif)}</span>
              </div>
              ${parseFloat(payslipData.deductions.otherDeductions) > 0 ? `
              <div class="line-item">
                <span class="line-item-label">Other Deductions</span>
                <span class="line-item-value">${formatCurrency(payslipData.deductions.otherDeductions)}</span>
              </div>
              ` : ''}
              <div class="line-item total-line">
                <span class="line-item-label">Total Deductions</span>
                <span class="line-item-value">${formatCurrency(payslipData.deductions.totalDeductions)}</span>
              </div>
            </div>
          </div>

          <!-- Net Pay -->
          <div class="net-pay">
            <span class="net-pay-label">NET PAY</span>
            <span class="net-pay-amount">${formatCurrency(payslipData.payment.netPay)}</span>
          </div>

          <!-- Summary Table -->
          <table class="summary-table">
            <tr>
              <td class="label">Gross Pay</td>
              <td class="value">${formatCurrency(payslipData.earnings.grossPay)}</td>
            </tr>
            <tr>
              <td class="label">Total Deductions</td>
              <td class="value" style="color: #DC2626">- ${formatCurrency(payslipData.deductions.totalDeductions)}</td>
            </tr>
            <tr class="final-row">
              <td class="label">NET PAY</td>
              <td class="value">${formatCurrency(payslipData.payment.netPay)}</td>
            </tr>
          </table>

          ${payslipData.payment.paymentReference ? `
          <div class="payment-ref">
            Payment Reference: <span style="font-family: monospace; font-weight: 600; color: #111827">${payslipData.payment.paymentReference}</span>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <p>This is a computer-generated document. No signature is required.</p>
            <p style="margin-top: 5px;">For queries, please contact HR at hr@lerahealth.com or +27 72 640 8996</p>
            <p style="margin-top: 10px;">Generated on ${new Date().toLocaleString()}</p>
          </div>

          <!-- Action Buttons (hidden when printing) -->
          <div class="actions">
            <button onclick="window.print()" class="btn btn-primary">Print / Save as PDF</button>
            <button onclick="window.close()" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Payslips</h1>
          <p className="text-gray-600 mt-1">View and download your payslips</p>
        </div>
        
        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Year
          </label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {availableYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payslips</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.payslipsCount}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Gross</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalGross)}
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
                <p className="text-sm text-gray-600">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(stats.totalDeductions)}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Wallet className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Net Pay</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {formatCurrency(stats.totalNet)}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Receipt className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslips List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Payslips for {yearFilter}
          </h2>
        </div>

        {payslips.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payslips found</h3>
            <p className="text-gray-600">No payslips available for {yearFilter}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payslips.map((payslip) => (
              <div
                key={payslip.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getMonthName(payslip.month)} {payslip.year}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Payment Period: {getMonthName(payslip.month)} 1 - {getMonthName(payslip.month)} 31, {payslip.year}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Net Pay</p>
                      <p className="text-xl font-bold text-indigo-600">
                        {formatCurrency(payslip.netPay)}
                      </p>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <span className={`px-3 py-1 text-xs font-medium rounded ${getPaymentStatusColor(payslip.paymentStatus)}`}>
                        {payslip.paymentStatus?.toUpperCase() || 'PENDING'}
                      </span>
                      {payslip.paymentDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(payslip.paymentDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => viewPayslip(payslip.payrollRunId)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => {
                          // Load the payslip data first, then open print window
                          api.get(`/payroll/payslips/${currentUser.id}/${payslip.payrollRunId}`)
                            .then(res => {
                              const fullPayslip = res.data.payslip;
                              openPayslipPrintWindow(fullPayslip);
                            })
                            .catch(err => {
                              console.error('Failed to load payslip:', err);
                              alert('Failed to load payslip for printing');
                            });
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download/Print"
                      >
                        <Download className="w-5 h-5" />
                      </button>

                      {/* <button
                        onClick={() => {
                          // Set the payslip in state, show modal, then trigger print
                          setSelectedPayslip({ runId: payslip.payrollRunId, userId: currentUser.id });
                          setShowPayslipModal(true);
                          setTimeout(() => window.print(), 500);
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download/Print"
                      >
                        <Download className="w-5 h-5" />
                      </button> */}

                      {/* <button
                        onClick={() => downloadPayslip(payslip)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download/Print"
                      >
                        <Download className="w-5 h-5" />
                      </button> */}
                    </div>
                  </div>
                </div>

                {/* Quick Summary */}
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Gross Pay</p>
                    <p className="font-medium text-gray-900">{formatCurrency(payslip.grossPay)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">PAYE</p>
                    <p className="font-medium text-gray-900">{formatCurrency(payslip.paye)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">UIF</p>
                    <p className="font-medium text-gray-900">{formatCurrency(payslip.uif)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Deductions</p>
                    <p className="font-medium text-gray-900">{formatCurrency(payslip.totalDeductions)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payslip Detail Modal */}

      {/* Payslip Detail Modal - Uses PayslipView Component */}
      {showPayslipModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header - Fixed */}
                <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Payslip - {getMonthName(
                      payslips.find(p => p.payrollRunId === selectedPayslip.runId)?.month
                    )} {payslips.find(p => p.payrollRunId === selectedPayslip.runId)?.year}
                  </h2>
                  <button
                    onClick={() => setShowPayslipModal(false)}
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
                    onClose={() => setShowPayslipModal(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayslips;