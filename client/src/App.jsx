import React, { useState, useEffect } from 'react'; // ✅ Add useEffect here
import { 
  Clock, LogOut, LogIn, Coffee, Home, Bell, MapPin, Download, 
  Filter, Edit2, Check, X, Menu, Users, BarChart3, Calendar,
  Settings, UserPlus, TrendingUp, Activity, AlertCircle
} from 'lucide-react';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { AttendanceProvider } from './contexts/AttendanceProvider';
import { UserProvider } from './contexts/UserContext';

// Views
import DashboardView from './views/DashboardView';
import AttendanceView from './views/AttendanceView';
import EmployeesView from './views/EmployeesView';
import AnalyticsView from './views/AnalyticsView';
import RecordsView from './views/RecordsView';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import LoginForm from './components/LoginForm';

// ==================== MAIN APP SHELL ====================
const AttendanceApp = () => {
  const { currentUser, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Reset to dashboard when user logs in
  useEffect(() => {
    if (currentUser) {
      setCurrentView('dashboard');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Notifications />
      <div className="flex">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-h-screen">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'attendance' && <AttendanceView />}
          {currentView === 'employees' && <EmployeesView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'records' && <RecordsView />}
        </main>
      </div>
    </div>
  );
};

// ==================== ROOT WITH PROVIDERS ====================
const App = () => {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <AttendanceProvider>
          <UserProvider>
            <AttendanceApp />
          </UserProvider>
        </AttendanceProvider>
      </EmployeeProvider>
    </AuthProvider>
  );
};

export default App;