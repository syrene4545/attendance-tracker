// client/src/views/PayslipView.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // ✅ Add this import
import api from '../api/api';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  Building2,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle
} from 'lucide-react';

const PayslipView = ({ runId, userId, onClose }) => {
  const { currentUser } = useAuth();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use provided userId or fall back to currentUser
  const effectiveUserId = userId || currentUser?.id;

  useEffect(() => {
    if (runId && effectiveUserId) {
      loadPayslip();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, effectiveUserId]);

  const loadPayslip = async () => {
    if (!effectiveUserId) {
      console.error('❌ No user ID available');
      return;
    }

    try {
      setLoading(true);
      console.log('📄 Loading payslip:', effectiveUserId, runId);
      const res = await api.get(`/payroll/payslips/${effectiveUserId}/${runId}`);
      setPayslip(res.data.payslip);
      console.log('✅ Payslip loaded');
    } catch (error) {
      console.error('❌ Failed to load payslip:', error);
      alert('Failed to load payslip');
    } finally {
      setLoading(false);
    }
  };

  // const handlePrint = () => {
  //   window.print();
  // };

  // const handleDownload = () => {
  //   // Trigger the browser's print dialog
  //   // User can then choose "Save as PDF"
  //   window.print();
  // };

  const handlePrint = () => {
    openPrintWindow();
  };

  const handleDownload = () => {
    openPrintWindow();
  };

  const openPrintWindow = () => {
    // Create a new window with just the payslip
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
        <title>Payslip - ${payslip.period.monthName} ${payslip.period.year}</title>
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
              <p>${payslip.period.monthName} ${payslip.period.year}</p>
              <p style="font-size: 12px; margin-top: 5px;">Processed: ${new Date(payslip.period.processedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <!-- Employee & Payment Details -->
          <div class="details-grid">
            <div class="detail-section">
              <h3>Employee Information</h3>
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${payslip.employee.name}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Employee No:</span>
                <span class="detail-value">${payslip.employee.employeeNumber}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${payslip.employee.department}</span>
              </div>
            </div>

            <div class="detail-section">
              <h3>Payment Details</h3>
              <div class="detail-item">
                <span class="detail-label">Period:</span>
                <span class="detail-value">${payslip.period.monthName} ${payslip.period.year}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${payslip.payment.paymentDate ? new Date(payslip.payment.paymentDate).toLocaleDateString() : 'Pending'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: ${payslip.payment.paymentStatus === 'paid' ? '#059669' : '#D97706'}">${payslip.payment.paymentStatus.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <!-- Earnings & Deductions -->
          <div class="earnings-deductions">
            <div class="earnings-box">
              <div class="box-title">Earnings</div>
              <div class="line-item">
                <span class="line-item-label">Basic Salary</span>
                <span class="line-item-value">${formatCurrency(payslip.earnings.baseSalary)}</span>
              </div>
              ${parseFloat(payslip.earnings.allowances) > 0 ? `
              <div class="line-item">
                <span class="line-item-label">Allowances</span>
                <span class="line-item-value">${formatCurrency(payslip.earnings.allowances)}</span>
              </div>
              ` : ''}
              <div class="line-item total-line">
                <span class="line-item-label">Gross Pay</span>
                <span class="line-item-value">${formatCurrency(payslip.earnings.grossPay)}</span>
              </div>
            </div>

            <div class="deductions-box">
              <div class="box-title">Deductions</div>
              <div class="line-item">
                <span class="line-item-label">PAYE (Tax)</span>
                <span class="line-item-value">${formatCurrency(payslip.deductions.paye)}</span>
              </div>
              <div class="line-item">
                <span class="line-item-label">UIF</span>
                <span class="line-item-value">${formatCurrency(payslip.deductions.uif)}</span>
              </div>
              ${parseFloat(payslip.deductions.otherDeductions) > 0 ? `
              <div class="line-item">
                <span class="line-item-label">Other Deductions</span>
                <span class="line-item-value">${formatCurrency(payslip.deductions.otherDeductions)}</span>
              </div>
              ` : ''}
              <div class="line-item total-line">
                <span class="line-item-label">Total Deductions</span>
                <span class="line-item-value">${formatCurrency(payslip.deductions.totalDeductions)}</span>
              </div>
            </div>
          </div>

          <!-- Net Pay -->
          <div class="net-pay">
            <span class="net-pay-label">NET PAY</span>
            <span class="net-pay-amount">${formatCurrency(payslip.payment.netPay)}</span>
          </div>

          <!-- Summary Table -->
          <table class="summary-table">
            <tr>
              <td class="label">Gross Pay</td>
              <td class="value">${formatCurrency(payslip.earnings.grossPay)}</td>
            </tr>
            <tr>
              <td class="label">Total Deductions</td>
              <td class="value" style="color: #DC2626">- ${formatCurrency(payslip.deductions.totalDeductions)}</td>
            </tr>
            <tr class="final-row">
              <td class="label">NET PAY</td>
              <td class="value">${formatCurrency(payslip.payment.netPay)}</td>
            </tr>
          </table>

          ${payslip.payment.paymentReference ? `
          <div class="payment-ref">
            Payment Reference: <span style="font-family: monospace; font-weight: 600; color: #111827">${payslip.payment.paymentReference}</span>
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
    
    // Wait for content to load, then focus
    printWindow.onload = () => {
      printWindow.focus();
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading payslip...</div>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Payslip not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Action Buttons - Hide on print */}

        {/* Action Buttons - Hide in modal, show when standalone */}
        {!onClose && (
          <div className="flex items-center justify-between mb-6 print:hidden">
            <div className="flex gap-3 ml-auto">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Print / Save as PDF
              </button>

              {/* <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button> */}
            </div>
          </div>
        )}

        {/* In modal mode, add inline print/download buttons */}
        {onClose && (
          <div className="flex justify-end gap-3 mb-4 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        )}

        {/* <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            // onClick={() => navigate(-1)}
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div> */}

        {/* Payslip Container */}
        <div className={`bg-white rounded-lg shadow-lg print:shadow-none ${onClose ? 'p-6' : 'p-8'}`}>
        
          
          {/* Header */}
          <div className="border-b-2 border-gray-200 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-8 h-8 text-indigo-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Lera Health</h1>
                </div>
                <p className="text-sm text-gray-600">67C Landross Mare Street</p>
                <p className="text-sm text-gray-600">Polokwane, 0700</p>
                <p className="text-sm text-gray-600">Tel: +27 72 640 8996</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-indigo-600 mb-2">PAYSLIP</h2>
                <p className="text-sm text-gray-600">
                  {payslip.period.monthName} {payslip.period.year}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Processed: {new Date(payslip.period.processedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">Employee Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{payslip.employee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employee No:</span>
                  <span className="text-sm font-medium text-gray-900">{payslip.employee.employeeNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Department:</span>
                  <span className="text-sm font-medium text-gray-900">{payslip.employee.department}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Period:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {payslip.period.monthName} {payslip.period.year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {payslip.payment.paymentDate 
                      ? new Date(payslip.payment.paymentDate).toLocaleDateString()
                      : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    payslip.payment.paymentStatus === 'paid' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {payslip.payment.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Earnings */}
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-green-900 mb-3 uppercase flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Earnings
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Basic Salary</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(payslip.earnings.baseSalary)}
                    </span>
                  </div>
                  {parseFloat(payslip.earnings.allowances) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Allowances</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payslip.earnings.allowances)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-green-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-900">Gross Pay</span>
                      <span className="text-sm font-bold text-green-700">
                        {formatCurrency(payslip.earnings.grossPay)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-red-900 mb-3 uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Deductions
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">PAYE (Tax)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(payslip.deductions.paye)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">UIF</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(payslip.deductions.uif)}
                    </span>
                  </div>
                  {parseFloat(payslip.deductions.otherDeductions) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Other Deductions</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payslip.deductions.otherDeductions)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-red-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-900">Total Deductions</span>
                      <span className="text-sm font-bold text-red-700">
                        {formatCurrency(payslip.deductions.totalDeductions)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay - Highlighted */}
          <div className="bg-indigo-600 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-white" />
                <div>
                  <p className="text-white text-sm font-medium">Net Pay</p>
                  <p className="text-indigo-200 text-xs">Amount to be paid</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(payslip.payment.netPay)}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="border-t-2 border-gray-200 pt-6">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-700">Gross Pay</td>
                  <td className="py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(payslip.earnings.grossPay)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-700">Total Deductions</td>
                  <td className="py-3 text-sm text-right font-medium text-red-600">
                    - {formatCurrency(payslip.deductions.totalDeductions)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-4 text-base font-bold text-gray-900">NET PAY</td>
                  <td className="py-4 text-base text-right font-bold text-indigo-600">
                    {formatCurrency(payslip.payment.netPay)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Reference */}
          {payslip.payment.paymentReference && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">
                Payment Reference: <span className="font-mono font-medium text-gray-900">
                  {payslip.payment.paymentReference}
                </span>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              This is a private and confidential document.
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              For queries, please contact HR at lerahealthplk.com or +27 72 640 8996
            </p>
          </div>
        </div>

        {/* Print-only Footer */}
        <div className="hidden print:block text-center text-xs text-gray-500 mt-4">
          <p>Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Print Styles */}

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Reset everything for print */
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          
          /* Hide non-printable elements */
          .print\\:hidden {
            display: none !important;
          }
          
          /* Show print-only elements */
          .print\\:block {
            display: block !important;
          }
          
          /* Remove shadows and borders */
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          /* Ensure proper page breaks */
          .payslip-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Remove modal styling for print */
          .fixed, .absolute {
            position: static !important;
          }
          
          /* Full width for print */
          .max-w-4xl, .max-w-6xl {
            max-width: 100% !important;
          }
          
          /* Remove padding that creates white space */
          .py-8, .p-4, .px-4 {
            padding: 0 !important;
          }
          
          /* Ensure colors print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Page setup */
          @page {
            size: A4;
            margin: 1cm;
          }
          
          /* Avoid breaking inside important sections */
          .bg-green-50, .bg-red-50, .bg-indigo-600 {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style> */}
    </div>
  );
};

export default PayslipView;