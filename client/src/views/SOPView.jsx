// import React, { useState } from 'react';
// import { FileText, ExternalLink, Download, BookOpen, Shield, Banknote, Coins, DollarSign, Package, Heart } from 'lucide-react';
// import PoliciesView from './PoliciesView';
// import SalesSOPView from './SalesSOPView';
// import EmployeeHandbookView from './EmployeeHandbookView';
// import SafetyProceduresView from './SafetyProceduresView';
// import CashHandlingSOPView from './CashHandlingSOPView';
// import SecuritySOPView from './SecuritySOPView';
// import InventorySOPView from './InventorySOPView';
// import CustomerServiceSOPView from './CustomerServiceSOPView';

// const SOPView = ({ onNavigate }) => {
//   const [activeView, setActiveView] = useState('list'); // 'list', 'policies', 'sales-sop'

//   // Show nested views
//   if (activeView === 'policies') {
//     return <PoliciesView onBack={() => setActiveView('list')} />;
//   }

//   if (activeView === 'sales-sop') {
//     return <SalesSOPView onBack={() => setActiveView('list')} />;
//   }

//   if (activeView === 'handbook') {
//     return <EmployeeHandbookView onBack={() => setActiveView('list')} />;
//   }

//   if (activeView === 'safety') {
//     return <SafetyProceduresView onBack={() => setActiveView('list')} />;
//   }

//   if (activeView === 'cash-handling') {
//     return <CashHandlingSOPView onBack={() => setActiveView('list')} />;
//   }

//   if (activeView === 'security') {
//     return <SecuritySOPView onBack={() => setActiveView('list')} />;
//   }

//   if (activeView === 'inventory') {
//     return <InventorySOPView onBack={() => setActiveView('list')} />;
//   }

//   if (activeView === 'customer-service') {
//     return <CustomerServiceSOPView onBack={() => setActiveView('list')} />;
//   }

//   // Main SOP list view
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Standard Operating Procedures</h1>
//         <p className="text-gray-600 mt-1">Company policies, guidelines, and best practices</p>
//       </div>

//       {/* SOP Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
//         {/* Sales SOP */}
//         <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg overflow-hidden">
//           <div className="p-6 text-white">
//             <div className="flex items-center gap-4 mb-4">
//               <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
//                 <BookOpen className="w-8 h-8" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Sales SOP</h2>
//                 <p className="text-purple-100">Excellence Through Engagement</p>
//               </div>
//             </div>
            
//             <div className="space-y-2 mb-6 text-purple-100">
//               <p>📈 30% Sales Increase Goal</p>
//               <p>🛒 Basket Building Strategies</p>
//               <p>🏆 Team Rewards & Recognition</p>
//               <p>📋 Daily Operating Procedures</p>
//             </div>

//             <button
//               onClick={() => setActiveView('sales-sop')}
//               className="w-full flex items-center justify-center gap-2 bg-white text-purple-600 px-4 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
//             >
//               <BookOpen className="w-5 h-5" />
//               View Sales SOP
//             </button>
//           </div>
//         </div>

//         {/* Attendance Policies */}
//         <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg overflow-hidden">
//           <div className="p-6 text-white">
//             <div className="flex items-center gap-4 mb-4">
//               <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
//                 <FileText className="w-8 h-8" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Attendance Policies</h2>
//                 <p className="text-blue-100">Rules & Regulations</p>
//               </div>
//             </div>
            
//             <div className="space-y-2 mb-6 text-blue-100">
//               <p>⏰ Working Hours & Schedules</p>
//               <p>🏖️ Leave Policies & Entitlements</p>
//               <p>📱 Attendance Recording Rules</p>
//               <p>⚖️ Disciplinary Procedures</p>
//             </div>

//             <button
//               onClick={() => setActiveView('policies')}
//               className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
//             >
//               <FileText className="w-5 h-5" />
//               View Policies
//             </button>
//           </div>
//         </div>

//         {/* Employee Handbook - NOW ACTIVE */}
//         <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg overflow-hidden">
//           <div className="p-6 text-white">
//             <div className="flex items-center gap-4 mb-4">
//               <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
//                 <FileText className="w-8 h-8" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Employee Handbook</h2>
//                 <p className="text-green-100">Your Complete Guide</p>
//               </div>
//             </div>
            
//             <div className="space-y-2 mb-6 text-green-100">
//               <p>📖 Company Culture & Values</p>
//               <p>🤝 Code of Conduct</p>
//               <p>💼 Benefits & Compensation</p>
//               <p>📞 Important Contacts</p>
//             </div>

//             <button
//               onClick={() => setActiveView('handbook')}
//               className="w-full flex items-center justify-center gap-2 bg-white text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
//             >
//               <BookOpen className="w-5 h-5" />
//               View Handbook
//             </button>
//           </div>
//         </div>

        
//         {/* Safety Procedures - NOW ACTIVE */}
//           <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg overflow-hidden">
//             <div className="p-6 text-white">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
//                   <FileText className="w-8 h-8" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold">Safety Procedures</h2>
//                   <p className="text-orange-100">Emergency Protocols & Safety</p>
//                 </div>
//               </div>
              
//               <div className="space-y-2 mb-6 text-orange-100">
//                 <p>🚨 Emergency Protocols</p>
//                 <p>🔥 Fire Safety Procedures</p>
//                 <p>🏥 First Aid Guidelines</p>
//                 <p>⚠️ Incident Reporting</p>
//               </div>

//               <button
//                 onClick={() => setActiveView('safety')}
//                 className="w-full flex items-center justify-center gap-2 bg-white text-orange-600 px-4 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
//               >
//                 <Shield className="w-5 h-5" />
//                 View Safety Procedures
//               </button>
//             </div>
//           </div>
        

//                {/* Cash Handling SOP - NEW */}
//         <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg overflow-hidden">
//           <div className="p-6 text-white">
//             <div className="flex items-center gap-4 mb-4">
//               <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
//                 <DollarSign className="w-8 h-8" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Cash Handling SOP</h2>
//                 <p className="text-green-100">Financial Procedures & Security</p>
//               </div>
//             </div>
            
//             <div className="space-y-2 mb-6 text-green-100">
//               <p>💰 Till Opening & Closing</p>
//               <p>💳 Payment Processing</p>
//               <p>🔒 Fraud Prevention</p>
//               <p>🏦 Banking Procedures</p>
//             </div>

//             <button
//               onClick={() => setActiveView('cash-handling')}
//               className="w-full flex items-center justify-center gap-2 bg-white text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
//             >
//               <DollarSign className="w-5 h-5" />
//               View Cash Handling SOP
//             </button>
//           </div>
//         </div>

//         {/* Security & Loss Prevention SOP - NEW */}
//         <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg overflow-hidden">
//           <div className="p-6 text-white">
//             <div className="flex items-center gap-4 mb-4">
//               <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
//                 <Shield className="w-8 h-8" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Security & Loss Prevention</h2>
//                 <p className="text-red-100">Protecting Assets & Safety</p>
//               </div>
//             </div>
            
//             <div className="space-y-2 mb-6 text-red-100">
//               <p>🔐 Opening & Closing Security</p>
//               <p>📹 CCTV & Surveillance</p>
//               <p>👁️ Shoplifting Prevention</p>
//               <p>🚨 Robbery Response</p>
//             </div>

//             <button
//               onClick={() => setActiveView('security')}
//               className="w-full flex items-center justify-center gap-2 bg-white text-red-600 px-4 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
//             >
//               <Shield className="w-5 h-5" />
//               View Security SOP
//             </button>
//           </div>
//         </div>

//         {/* Inventory Management SOP - NEW */}
//         <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg overflow-hidden">
//           <div className="p-6 text-white">
//             <div className="flex items-center gap-4 mb-4">
//               <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
//                 <Package className="w-8 h-8" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Inventory Management</h2>
//                 <p className="text-indigo-100">Stock Control & Optimization</p>
//               </div>
//             </div>
            
//             <div className="space-y-2 mb-6 text-indigo-100">
//               <p>📦 Receiving & Storage</p>
//               <p>🔄 FIFO Stock Rotation</p>
//               <p>📊 Stock Counting</p>
//               <p>📅 Expiry Management</p>
//             </div>

//             <button
//               onClick={() => setActiveView('inventory')}
//               className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
//             >
//               <Package className="w-5 h-5" />
//               View Inventory SOP
//             </button>
//           </div>
//         </div>

//         {/* Customer Service Excellence SOP - NEW */}
//         <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg shadow-lg overflow-hidden">
//           <div className="p-6 text-white">
//             <div className="flex items-center gap-4 mb-4">
//               <div className="bg-white/20 p-4 rounded-lg backdrop-blur">
//                 <Heart className="w-8 h-8" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">Customer Service Excellence</h2>
//                 <p className="text-pink-100">Delivering 5-Star Experiences</p>
//               </div>
//             </div>
            
//             <div className="space-y-2 mb-6 text-pink-100">
//               <p>⭐ Service Standards</p>
//               <p>💬 Communication Skills</p>
//               <p>😊 Greeting Customers</p>
//               <p>🎯 Handling Complaints</p>
//             </div>

//             <button
//               onClick={() => setActiveView('customer-service')}
//               className="w-full flex items-center justify-center gap-2 bg-white text-pink-600 px-4 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
//             >
//               <Heart className="w-5 h-5" />
//               View Customer Service SOP
//             </button>
//           </div>
//         </div>

//       </div>

//       {/* Quick Links */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Reference</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="border border-gray-200 rounded-lg p-4">
//             <h3 className="font-semibold text-gray-900 mb-2">📋 Daily Checklist</h3>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Sign in on arrival</li>
//               <li>• Morning team huddle</li>
//               <li>• Update sales board</li>
//               <li>• Evening huddle</li>
//             </ul>
//           </div>

//           <div className="border border-gray-200 rounded-lg p-4">
//             <h3 className="font-semibold text-gray-900 mb-2">⏰ Important Times</h3>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Work: 08:00 - 17:00</li>
//               <li>• Lunch: 1 hour</li>
//               <li>• Tea: 2 × 15 min</li>
//               <li>• Huddles: 15 min each</li>
//             </ul>
//           </div>

//           <div className="border border-gray-200 rounded-lg p-4">
//             <h3 className="font-semibold text-gray-900 mb-2">📞 Support</h3>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• HR: hr@lerahealth.com</li>
//               <li>• IT: support@lerahealth.com</li>
//               <li>• Emergency: +27 72 640 8996</li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Acknowledgment Notice */}
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//         <div className="flex items-start gap-3">
//           <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
//           <div className="text-sm text-yellow-800">
//             <p className="font-semibold mb-1">Employee Acknowledgment</p>
//             <p>
//               All employees are required to read and understand company SOPs. 
//               By using this system, you acknowledge that you have read and agree 
//               to comply with all policies and procedures.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SOPView;

// client/src/views/SOPView.jsx

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  BookOpen,
  Shield,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import SOPDetailView from './SOPDetailView';
import SOPFormView from './SOPFormView';

const SOPView = () => {
  const { currentUser, checkPermission } = useAuth();
  const [activeView, setActiveView] = useState('list'); // 'list', 'detail', 'form'
  const [sops, setSOPs] = useState([]);
  const [pendingAcknowledgments, setPendingAcknowledgments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSOP, setSelectedSOP] = useState(null);
  const [stats, setStats] = useState({});

  const isAdmin = checkPermission('manage_users');

  // Load SOPs
  useEffect(() => {
    fetchSOPs();
    fetchPendingAcknowledgments();
    if (isAdmin) {
      fetchStats();
    }
  }, [filterCategory, filterStatus]);

  const fetchSOPs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await api.get(`/sops?${params}`);
      setSOPs(response.data.sops);
    } catch (error) {
      console.error('Error fetching SOPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAcknowledgments = async () => {
    try {
      const response = await api.get('/sops/acknowledgments/pending');
      setPendingAcknowledgments(response.data.pending);
    } catch (error) {
      console.error('Error fetching pending acknowledgments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/sops/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewSOP = (sop) => {
    setSelectedSOP(sop);
    setActiveView('detail');
  };

  const handleCreateSOP = () => {
    setSelectedSOP(null);
    setActiveView('form');
  };

  const handleEditSOP = (sop) => {
    setSelectedSOP(sop);
    setActiveView('form');
  };

  const handleDeleteSOP = async (sopId) => {
    if (!window.confirm('Are you sure you want to delete this SOP?')) return;

    try {
      await api.delete(`/sops/${sopId}`);
      fetchSOPs();
      alert('SOP deleted successfully');
    } catch (error) {
      console.error('Error deleting SOP:', error);
      alert('Failed to delete SOP');
    }
  };

  const handlePublishSOP = async (sopId) => {
    if (!window.confirm('Publish this SOP to all employees?')) return;

    try {
      await api.post(`/sops/${sopId}/publish`);
      fetchSOPs();
      alert('SOP published successfully');
    } catch (error) {
      console.error('Error publishing SOP:', error);
      alert('Failed to publish SOP');
    }
  };

  const handleBack = () => {
    setActiveView('list');
    setSelectedSOP(null);
    fetchSOPs();
    fetchPendingAcknowledgments();
  };

  // Show detail view
  if (activeView === 'detail') {
    return (
      <SOPDetailView 
        sop={selectedSOP} 
        onBack={handleBack}
        onEdit={handleEditSOP}
        onDelete={handleDeleteSOP}
        isAdmin={isAdmin}
      />
    );
  }

  // Show form view
  if (activeView === 'form') {
    return (
      <SOPFormView 
        sop={selectedSOP} 
        onBack={handleBack}
      />
    );
  }

  // Filter SOPs by search term
  const filteredSOPs = sops.filter(sop => 
    sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category) => {
    const icons = {
      policy: FileText,
      procedure: BookOpen,
      guideline: AlertCircle,
      form: FileText,
    };
    return icons[category] || FileText;
  };

  const getCategoryColor = (category) => {
    const colors = {
      policy: 'from-blue-500 to-cyan-600',
      procedure: 'from-purple-500 to-indigo-600',
      guideline: 'from-green-500 to-emerald-600',
      form: 'from-orange-500 to-red-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      archived: { color: 'bg-red-100 text-red-800', icon: Archive },
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SOPs & Policies</h1>
            <p className="text-gray-600 mt-1">Company standard operating procedures and policies</p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateSOP}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create SOP
            </button>
          )}
        </div>

        {/* Pending Acknowledgments Alert */}
        {pendingAcknowledgments.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Pending Acknowledgments
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  You have {pendingAcknowledgments.length} SOP(s) requiring your acknowledgment.
                </p>
                <div className="space-y-2">
                  {pendingAcknowledgments.map((ack) => (
                    <button
                      key={ack.acknowledgmentId}
                      onClick={() => {
                        const sop = sops.find(s => s.id === ack.sopId);
                        if (sop) handleViewSOP(sop);
                      }}
                      className="text-sm text-yellow-900 underline hover:text-yellow-800"
                    >
                      → {ack.title} ({ack.category})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats (Admin only) */}
        {isAdmin && stats.sops && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active SOPs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.sops.activeCount || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.sops.draftCount || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total SOPs</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.sops.totalCount || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Acknowledgments</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.acknowledgments?.completedAcknowledgments || 0}/
                    {stats.acknowledgments?.totalAcknowledgments || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SOPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="policy">Policies</option>
                <option value="procedure">Procedures</option>
                <option value="guideline">Guidelines</option>
                <option value="form">Forms</option>
              </select>
            </div>

            {/* Status Filter */}
            {isAdmin && (
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* SOPs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading SOPs...</p>
          </div>
        ) : filteredSOPs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No SOPs found' : 'No SOPs yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search or filters'
                : isAdmin 
                  ? 'Create your first SOP to get started'
                  : 'Your company hasn\'t created any SOPs yet'}
            </p>
            {isAdmin && !searchTerm && (
              <button
                onClick={handleCreateSOP}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First SOP
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSOPs.map((sop) => {
              const Icon = getCategoryIcon(sop.category);
              const statusBadge = getStatusBadge(sop.status);
              const StatusIcon = statusBadge.icon;
              const hasPendingAck = pendingAcknowledgments.some(ack => ack.sopId === sop.id);

              return (
                <div
                  key={sop.id}
                  className={`bg-gradient-to-br ${getCategoryColor(sop.category)} rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer`}
                  onClick={() => handleViewSOP(sop)}
                >
                  <div className="p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-white/20 p-3 rounded-lg backdrop-blur">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {sop.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{sop.title}</h3>
                    
                    {sop.description && (
                      <p className="text-white/80 text-sm mb-4 line-clamp-2">
                        {sop.description}
                      </p>
                    )}

                    <div className="space-y-2 text-white/90 text-sm mb-4">
                      <p className="capitalize">📁 {sop.category}</p>
                      <p>📄 Version {sop.version}</p>
                      {sop.effectiveDate && (
                        <p>📅 Effective: {new Date(sop.effectiveDate).toLocaleDateString()}</p>
                      )}
                      {isAdmin && (
                        <p>✅ {sop.acknowledgedCount || 0}/{sop.acknowledgmentCount || 0} acknowledged</p>
                      )}
                    </div>

                    {hasPendingAck && (
                      <div className="mb-4 px-3 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Acknowledgment Required
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSOP(sop);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSOP(sop);
                            }}
                            className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {sop.status === 'draft' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePublishSOP(sop.id);
                              }}
                              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg transition-colors"
                              title="Publish SOP"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSOP(sop.id);
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Reference (Company-wide info) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Need Help?</h3>
              <p className="text-sm text-gray-600">
                Contact your manager or HR department for assistance with any SOP-related questions.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">✅ Acknowledgments</h3>
              <p className="text-sm text-gray-600">
                All active SOPs require acknowledgment. Please review and acknowledge all assigned documents.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Updates</h3>
              <p className="text-sm text-gray-600">
                SOPs are regularly reviewed and updated. Check back often for the latest versions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOPView;