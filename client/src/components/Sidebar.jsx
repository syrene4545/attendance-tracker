// import { Home, Calendar, Users, User, BarChart3, Activity, DollarSign } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { FileText } from 'lucide-react';



// const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
//   const { checkPermission } = useAuth();

//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: Home, permission: 'view_own' },
//     { id: 'attendance', label: 'Attendance', icon: Calendar, permission: 'view_own' },
//     { id: 'employees', label: 'Employees', icon: Users, permission: 'view_all' },
//     { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'view_analytics' },
//     { id: 'records', label: 'Records', icon: Activity, permission: 'view_all' },
//     { id: 'requests', label: 'Requests', icon: FileText, permission: 'manage_users' }, // ✅ new item
//     { id: 'payroll', label: 'Payroll', icon: DollarSign, permission: 'view_payroll' }, // ✅ new
//     { id: 'my-profile', label: 'My Profile', icon: User, permission: 'view_own' }, // ✅ new
//     { id: 'my-payslips', label: 'My Payslips', icon: FileText, permission: 'view_own' }, // ✅ new
//     { id: 'leave', label: 'Leave Management', icon: Calendar, permission: 'view_own' }, // ✅ new
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
//         <nav className="p-4 space-y-2 mt-20 lg:mt-4">
//           {menuItems.map((item) => {
//             if (!checkPermission(item.permission)) return null;
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

import { 
  Home, 
  Calendar, 
  Users, 
  User, 
  BarChart3, 
  Activity, 
  DollarSign,
  FileText,
  Umbrella  // ✅ Use different icon for Leave
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
  const { checkPermission, currentUser } = useAuth(); // ✅ Add currentUser

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, permission: 'view_own' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, permission: 'view_own' },
    { id: 'leave', label: 'Leave Management', icon: Umbrella }, // ✅ Remove permission
    { id: 'my-profile', label: 'My Profile', icon: User, permission: 'view_own' },
    { id: 'my-payslips', label: 'My Payslips', icon: FileText, permission: 'view_own' },
    { id: 'employees', label: 'Employees', icon: Users, permission: 'view_all' },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, permission: 'view_payroll' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'view_analytics' },
    { id: 'records', label: 'Records', icon: Activity, permission: 'view_all' },
    { id: 'requests', label: 'Requests', icon: FileText, permission: 'manage_users' },
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
          fixed lg:sticky top-0 left-0 h-screen bg-white shadow-lg z-50 w-64 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <nav className="p-4 space-y-2 mt-20 lg:mt-4">
          {menuItems.map((item) => {
            // ✅ Show item if no permission required OR user has permission
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
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;