import { Home, Calendar, Users, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentView, onViewChange, isOpen, onClose }) => {
  const { checkPermission } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, permission: 'view_own' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, permission: 'view_own' },
    { id: 'employees', label: 'Employees', icon: Users, permission: 'view_all' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'view_analytics' },
    { id: 'records', label: 'Records', icon: Activity, permission: 'view_all' },
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
            if (!checkPermission(item.permission)) return null;
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
