// import React from 'react';
// import { 
//   Home, 
//   Calendar, 
//   Users, 
//   User, 
//   BarChart3, 
//   Activity, 
//   Banknote,
//   Wallet,
//   FileText,
//   BookOpen,
//   ClipboardList,
//   Umbrella,
//   Award,
//   Trophy,
//   Target,
//   Building2,
//   Clock,

// } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';

// const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
//   const { checkPermission, company, currentUser } = useAuth();

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: Home, permission: 'view_own' },
//     { id: 'attendance', label: 'Attendance', icon: Calendar, permission: 'view_own' },
//     { id: 'leave', label: 'Leave Management', icon: Umbrella },
//     { id: 'my-profile', label: 'My Profile', icon: User, permission: 'view_own' },
//     { id: 'my-payslips', label: 'My Payslips', icon: Banknote, permission: 'view_own' },
//     { id: 'employees', label: 'Employees', icon: Users, permission: 'view_all' },
//     { id: 'payroll', label: 'Payroll', icon: Wallet, permission: 'view_payroll' },
//     { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'view_analytics' },
//     { id: 'records', label: 'Records', icon: Activity, permission: 'view_all' },
//     { id: 'requests', label: 'Requests', icon: FileText, permission: 'manage_users' },
//     // { id: 'policies', label: 'Policies', icon: ClipboardList },
//     { id: 'sop', label: 'SOPs & Policies', icon: BookOpen },
//     // ✅ Assessment menu items
//     { id: 'assessments', label: 'Assessments', icon: Award },
//     { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
//      // ✅ Manager/Admin only analytics
//     { id: 'assessment-analytics', label: 'Assessment Analytics', icon: BarChart3, permission: 'view_analytics' },
//     { id: 'manage-assessments', label: 'Manage Assessments', icon: Target, permission: 'manage_users' },
//   ];

//   return (
//     <>
//       {isOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={onClose}
//         />
//       )}
//       <aside
//         className={`
//           fixed lg:sticky top-0 left-0 h-screen bg-white shadow-lg z-50 w-64 transition-transform duration-300
//           ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
//         `}
//       >
//         {/* Company info section */}
//         <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-indigo-600">
//           <div className="flex items-center gap-3">
//             {company?.branding?.logoUrl ? (
//               <img 
//                 src={company.branding.logoUrl} 
//                 alt={company.name}
//                 className="h-12 w-12 rounded-lg bg-white p-1"
//               />
//             ) : (
//               <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center">
//                 <Building2 className="w-6 h-6 text-indigo-600" />
//               </div>
//             )}
            
//             <div className="flex-1 min-w-0">
//               <h2 className="text-white font-semibold truncate">
//                 {company?.name || 'Company'}
//               </h2>
//               <p className="text-indigo-100 text-xs truncate">
//                 {company?.stats?.employeeCount || 0} employees
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <nav className="p-4 space-y-2 mt-20 lg:mt-4">
//           {menuItems.map((item) => {
//             if (item.permission && !checkPermission(item.permission)) return null;
            
//             const Icon = item.icon;
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => {
//                   onViewChange(item.id);
//                   onClose();
//                 }}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
//                   currentView === item.id
//                     ? 'bg-indigo-100 text-indigo-700'
//                     : 'text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 <Icon className="w-5 h-5" />
//                 <span className="font-medium">{item.label}</span>
//               </button>
//             );
//           })}
//         </nav>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;

import React from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  User, 
  BarChart3, 
  Activity, 
  Banknote,
  Wallet,
  FileText,
  BookOpen,
  ClipboardList,
  Umbrella,
  Award,
  Trophy,
  Target,
  Building2,
  Clock,
  Settings, // ✅ Add Settings icon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
  const { checkPermission, company, currentUser } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, permission: 'view_own' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, permission: 'view_own' },
    { id: 'leave', label: 'Leave Management', icon: Umbrella },
    { id: 'my-profile', label: 'My Profile', icon: User, permission: 'view_own' },
    { id: 'my-payslips', label: 'My Payslips', icon: Banknote, permission: 'view_own' },
    { id: 'employees', label: 'Employees', icon: Users, permission: 'view_all' },
    { id: 'payroll', label: 'Payroll', icon: Wallet, permission: 'view_payroll' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'view_analytics' },
    { id: 'records', label: 'Records', icon: Activity, permission: 'view_all' },
    { id: 'requests', label: 'Requests', icon: FileText, permission: 'manage_users' },
    { id: 'sop', label: 'SOPs & Policies', icon: BookOpen },
    // ✅ Assessment menu items
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    // ✅ Manager/Admin only analytics
    { id: 'assessment-analytics', label: 'Assessment Analytics', icon: BarChart3, permission: 'view_analytics' },
    { id: 'manage-assessments', label: 'Manage Assessments', icon: Target, permission: 'manage_users' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white shadow-lg z-50 w-64 transition-transform duration-300 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Company info section */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-indigo-600">
          <div className="flex items-center gap-3">
            {company?.branding?.logoUrl ? (
              <img 
                src={company.branding.logoUrl} 
                alt={company.name}
                className="h-12 w-12 rounded-lg bg-white p-1 object-contain"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-semibold truncate">
                {company?.name || 'Company'}
              </h2>
              <p className="text-indigo-100 text-xs truncate">
                {company?.stats?.employeeCount || 0} employees
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="p-4 space-y-2 mt-20 lg:mt-4">
          {menuItems.map((item) => {
            if (item.permission && !checkPermission(item.permission)) return null;
            
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          {/* ✅ Company Settings - Admin Only */}
          {currentUser?.role === 'admin' && (
            <>
              {/* Divider */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Administration
                </p>
              </div>
              
              <button
                onClick={() => {
                  onViewChange('company-settings');
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'company-settings'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Company Settings</span>
              </button>
            </>
          )}
        </nav>
        
        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {currentUser?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
