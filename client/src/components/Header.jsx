// import { Clock, LogOut, Menu } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';

// const Header = ({ onMenuClick }) => {
//   const { currentUser, logout } = useAuth();

//   return (
//     <header className="bg-white shadow-md sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
//               <Menu className="w-6 h-6" />
//             </button>
//             <Clock className="w-8 h-8 text-indigo-600" />
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
//               <p className="text-sm text-gray-600">
//                 {currentUser?.name} • {currentUser?.role}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={logout}
//             className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//           >
//             <LogOut className="w-4 h-4" />
//             <span className="hidden sm:inline">Logout</span>
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

// client/src/components/Header.jsx

import React from 'react';
import { LogOut, Menu, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { currentUser, company, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu button and Company name */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-3">
              {/* Company Logo (if available) */}
              {company?.branding?.logoUrl ? (
                <img 
                  src={company.branding.logoUrl} 
                  alt={company.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
              )}
              
              {/* Company Name */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {company?.name || 'Loading...'}
                </h1>
                {company?.subscription?.plan && (
                  <p className="text-xs text-gray-500">
                    {company.subscription.plan.charAt(0).toUpperCase() + company.subscription.plan.slice(1)} Plan
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center gap-4">
            {/* User info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {currentUser?.role}
              </p>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;