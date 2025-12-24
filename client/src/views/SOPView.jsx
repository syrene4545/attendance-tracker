import React, { useState } from 'react';
import { FileText, ExternalLink, Download, BookOpen, Shield, Banknote, Coins, DollarSign, Package, Heart } from 'lucide-react';
import PoliciesView from './PoliciesView';
import SalesSOPView from './SalesSOPView';
import EmployeeHandbookView from './EmployeeHandbookView';
import SafetyProceduresView from './SafetyProceduresView';
import CashHandlingSOPView from './CashHandlingSOPView';
import SecuritySOPView from './SecuritySOPView';
import InventorySOPView from './InventorySOPView';
import CustomerServiceSOPView from './CustomerServiceSOPView';

const SOPView = ({ onNavigate }) => {
  const [activeView, setActiveView] = useState('list'); // 'list', 'policies', 'sales-sop'

  // Show nested views
  if (activeView === 'policies') {
    return <PoliciesView onBack={() => setActiveView('list')} />;
  }

  if (activeView === 'sales-sop') {
    return <SalesSOPView onBack={() => setActiveView('list')} />;
  }

  if (activeView === 'handbook') {
    return <EmployeeHandbookView onBack={() => setActiveView('list')} />;
  }

  if (activeView === 'safety') {
    return <SafetyProceduresView onBack={() => setActiveView('list')} />;
  }

  if (activeView === 'cash-handling') {
    return <CashHandlingSOPView onBack={() => setActiveView('list')} />;
  }

  if (activeView === 'security') {
    return <SecuritySOPView onBack={() => setActiveView('list')} />;
  }

  if (activeView === 'inventory') {
    return <InventorySOPView onBack={() => setActiveView('list')} />;
  }

  if (activeView === 'customer-service') {
    return <CustomerServiceSOPView onBack={() => setActiveView('list')} />;
  }

  // Main SOP list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Standard Operating Procedures</h1>
        <p className="text-gray-600 mt-1">Company policies, guidelines, and best practices</p>
      </div>

      {/* SOP Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sales SOP */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Sales SOP</h2>
                <p className="text-purple-100">Excellence Through Engagement</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 text-purple-100">
              <p>📈 30% Sales Increase Goal</p>
              <p>🛒 Basket Building Strategies</p>
              <p>🏆 Team Rewards & Recognition</p>
              <p>📋 Daily Operating Procedures</p>
            </div>

            <button
              onClick={() => setActiveView('sales-sop')}
              className="w-full flex items-center justify-center gap-2 bg-white text-purple-600 px-4 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              View Sales SOP
            </button>
          </div>
        </div>

        {/* Attendance Policies */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Attendance Policies</h2>
                <p className="text-blue-100">Rules & Regulations</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 text-blue-100">
              <p>⏰ Working Hours & Schedules</p>
              <p>🏖️ Leave Policies & Entitlements</p>
              <p>📱 Attendance Recording Rules</p>
              <p>⚖️ Disciplinary Procedures</p>
            </div>

            <button
              onClick={() => setActiveView('policies')}
              className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <FileText className="w-5 h-5" />
              View Policies
            </button>
          </div>
        </div>

        {/* Employee Handbook - NOW ACTIVE */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Employee Handbook</h2>
                <p className="text-green-100">Your Complete Guide</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 text-green-100">
              <p>📖 Company Culture & Values</p>
              <p>🤝 Code of Conduct</p>
              <p>💼 Benefits & Compensation</p>
              <p>📞 Important Contacts</p>
            </div>

            <button
              onClick={() => setActiveView('handbook')}
              className="w-full flex items-center justify-center gap-2 bg-white text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              View Handbook
            </button>
          </div>
        </div>

        
        {/* Safety Procedures - NOW ACTIVE */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Safety Procedures</h2>
                  <p className="text-orange-100">Emergency Protocols & Safety</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6 text-orange-100">
                <p>🚨 Emergency Protocols</p>
                <p>🔥 Fire Safety Procedures</p>
                <p>🏥 First Aid Guidelines</p>
                <p>⚠️ Incident Reporting</p>
              </div>

              <button
                onClick={() => setActiveView('safety')}
                className="w-full flex items-center justify-center gap-2 bg-white text-orange-600 px-4 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                <Shield className="w-5 h-5" />
                View Safety Procedures
              </button>
            </div>
          </div>
        

               {/* Cash Handling SOP - NEW */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cash Handling SOP</h2>
                <p className="text-green-100">Financial Procedures & Security</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 text-green-100">
              <p>💰 Till Opening & Closing</p>
              <p>💳 Payment Processing</p>
              <p>🔒 Fraud Prevention</p>
              <p>🏦 Banking Procedures</p>
            </div>

            <button
              onClick={() => setActiveView('cash-handling')}
              className="w-full flex items-center justify-center gap-2 bg-white text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              View Cash Handling SOP
            </button>
          </div>
        </div>

        {/* Security & Loss Prevention SOP - NEW */}
        <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Security & Loss Prevention</h2>
                <p className="text-red-100">Protecting Assets & Safety</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 text-red-100">
              <p>🔐 Opening & Closing Security</p>
              <p>📹 CCTV & Surveillance</p>
              <p>👁️ Shoplifting Prevention</p>
              <p>🚨 Robbery Response</p>
            </div>

            <button
              onClick={() => setActiveView('security')}
              className="w-full flex items-center justify-center gap-2 bg-white text-red-600 px-4 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
            >
              <Shield className="w-5 h-5" />
              View Security SOP
            </button>
          </div>
        </div>

        {/* Inventory Management SOP - NEW */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <p className="text-indigo-100">Stock Control & Optimization</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 text-indigo-100">
              <p>📦 Receiving & Storage</p>
              <p>🔄 FIFO Stock Rotation</p>
              <p>📊 Stock Counting</p>
              <p>📅 Expiry Management</p>
            </div>

            <button
              onClick={() => setActiveView('inventory')}
              className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              <Package className="w-5 h-5" />
              View Inventory SOP
            </button>
          </div>
        </div>

        {/* Customer Service Excellence SOP - NEW */}
        <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Customer Service Excellence</h2>
                <p className="text-pink-100">Delivering 5-Star Experiences</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 text-pink-100">
              <p>⭐ Service Standards</p>
              <p>💬 Communication Skills</p>
              <p>😊 Greeting Customers</p>
              <p>🎯 Handling Complaints</p>
            </div>

            <button
              onClick={() => setActiveView('customer-service')}
              className="w-full flex items-center justify-center gap-2 bg-white text-pink-600 px-4 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
            >
              <Heart className="w-5 h-5" />
              View Customer Service SOP
            </button>
          </div>
        </div>

      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Reference</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📋 Daily Checklist</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Sign in on arrival</li>
              <li>• Morning team huddle</li>
              <li>• Update sales board</li>
              <li>• Evening huddle</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">⏰ Important Times</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Work: 08:00 - 17:00</li>
              <li>• Lunch: 1 hour</li>
              <li>• Tea: 2 × 15 min</li>
              <li>• Huddles: 15 min each</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📞 Support</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• HR: hr@lerahealth.com</li>
              <li>• IT: support@lerahealth.com</li>
              <li>• Emergency: +27 72 640 8996</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Acknowledgment Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Employee Acknowledgment</p>
            <p>
              All employees are required to read and understand company SOPs. 
              By using this system, you acknowledge that you have read and agree 
              to comply with all policies and procedures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOPView;