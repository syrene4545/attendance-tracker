import React, { useState, useEffect } from 'react';
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
import CompanyRegistration from './views/CompanyRegistration';
import DashboardView from './views/DashboardView';
import AttendanceView from './views/AttendanceView';
import EmployeesView from './views/EmployeesView';
import AnalyticsView from './views/AnalyticsView';
import RecordsView from './views/RecordsView';
import PayrollView from './views/PayrollView';
import PayslipView from './views/PayslipView';
import EmployeeForm from './views/EmployeeForm';
import MyProfile from './views/MyProfile';
import MyPayslips from './views/MyPayslips';
import LeaveManagement from './views/LeaveManagement';
import SOPView from './views/SOPView';
import RequestsView from './views/RequestsView';
import CompanySettingsView from './views/CompanySettingsView';

// Assessment Views
import AssessmentsView from './views/AssessmentsView';
import TakeAssessmentView from './views/TakeAssessmentView';
import AssessmentResultsView from './views/AssessmentResultsView';
import LeaderboardView from './views/LeaderboardView';
import ManagerAssessmentAnalyticsView from './views/ManagerAssessmentAnalyticsView';
import ManageAssessmentsView from './views/ManageAssessmentsView';
import LeaveBalanceManagementView from './views/LeaveBalanceManagementView';


import AssessmentFormView from './views/AssessmentFormView';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import LoginForm from './components/LoginForm';

// ==================== MAIN APP SHELL ====================

const AttendanceApp = () => {
  const { currentUser, company, loading } = useAuth(); // ✅ Get company from context
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // ✅ Update document title when company loads
  useEffect(() => {
    if (company?.name) {
      document.title = `${company.name} - Attendance Tracker`;
    } else {
      document.title = 'Attendance Tracker';
    }
  }, [company]);

// const AttendanceApp = () => {
//   const { currentUser, loading } = useAuth();
//   const [currentView, setCurrentView] = useState('dashboard');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [viewData, setViewData] = useState(null);

  // Helper function to change view with data
  const changeView = (view, data = null) => {
    setCurrentView(view);
    setViewData(data);
  };

  // Reset to dashboard when user logs in
  useEffect(() => {
    if (currentUser) {
      setCurrentView('dashboard');
    }
  }, [currentUser]);

  // Loading state
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

  // ✅ Not logged in - show login or registration
  if (!currentUser) {
    // Show company registration
    if (currentView === 'register-company') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <CompanyRegistration onBackToLogin={() => setCurrentView('login')} />
        </div>
      );
    }

    // Show login (default)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoginForm />
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have a company account?{' '}
            <button
              onClick={() => setCurrentView('register-company')}
              className="text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Create your company account
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ✅ Logged in - show main app
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
          {/* Main Views */}
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'attendance' && <AttendanceView />}
          {currentView === 'employees' && <EmployeesView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'records' && <RecordsView />}
          {currentView === 'requests' && <RequestsView />}
          {currentView === 'payroll' && <PayrollView />}
          {currentView === 'payslip' && <PayslipView />}
          {currentView === 'employeeFormNew' && <EmployeeForm mode="new" />}
          {currentView === 'employeeFormEdit' && <EmployeeForm mode="edit" />}
          {currentView === 'my-profile' && <MyProfile />}
          {currentView === 'my-payslips' && <MyPayslips />}
          {currentView === 'leave' && <LeaveManagement />}
          {currentView === 'sop' && <SOPView />}
          
          {/* Assessment Views */}
          {currentView === 'assessments' && <AssessmentsView onViewChange={changeView} />}
          {currentView === 'take-assessment' && <TakeAssessmentView assessmentId={viewData} onViewChange={changeView} />}
          {currentView === 'assessment-results' && <AssessmentResultsView attemptId={viewData} onViewChange={changeView} />}
          {currentView === 'leaderboard' && <LeaderboardView onViewChange={changeView} />}
          {currentView === 'assessment-analytics' && <ManagerAssessmentAnalyticsView onViewChange={changeView} />}
          {/* {currentView === 'manage-assessments' && <ManageAssessmentsView onViewChange={changeView} />} */}
          {currentView === 'leave-balances' && <LeaveBalanceManagementView onViewChange={changeView} />}
          {currentView === 'company-settings' && <CompanySettingsView />}
          {currentView === 'manage-assessments' && <ManageAssessmentsView onViewChange={setCurrentView} />}
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