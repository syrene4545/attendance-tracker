import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  Calendar, 
  Shield, 
  Wallet,
  AlertTriangle,
  Users,
  Download,
  ArrowLeft
} from 'lucide-react';

const PoliciesView = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'working-hours', label: 'Working Hours', icon: Clock },
    { id: 'attendance', label: 'Attendance Recording', icon: Calendar },
    { id: 'leave', label: 'Leave Policies', icon: Users },
    { id: 'absence', label: 'Absence Management', icon: AlertTriangle },
    { id: 'overtime', label: 'Overtime & Compensation', icon: Wallet },
    { id: 'disciplinary', label: 'Disciplinary Actions', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Colorful Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to SOPs
            </button>
          )}
        </div>
        
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">📋 Attendance Policies & Rules</h1>
          <p className="text-xl text-blue-100 mb-6">Your Complete Guide to Workplace Attendance</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">21</div>
              <div className="text-sm text-blue-100">Annual Leave Days</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">30</div>
              <div className="text-sm text-blue-100">Sick Days (3yr cycle)</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">40</div>
              <div className="text-sm text-blue-100">Hours per Week</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">15</div>
              <div className="text-sm text-blue-100">Min Grace Period</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 space-y-2 sticky top-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow p-8">
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'working-hours' && <WorkingHoursSection />}
            {activeSection === 'attendance' && <AttendanceSection />}
            {activeSection === 'leave' && <LeavePoliciesSection />}
            {activeSection === 'absence' && <AbsenceSection />}
            {activeSection === 'overtime' && <OvertimeSection />}
            {activeSection === 'disciplinary' && <DisciplinarySection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const OverviewSection = () => (
  <div className="prose max-w-none">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Overview</h2>
    <p className="text-gray-700 mb-4">
      This document outlines the attendance policies and rules for all employees at Lera Health.
      All employees are expected to read and comply with these policies.
    </p>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-2">Quick Reference</h3>
      <ul className="space-y-2 text-sm text-blue-800">
        <li>
          • Standard working hours:
          <ul className="ml-6 list-disc">
            <li>08:00 - 17:00 (Monday-Friday)</li>
            <li>08:00 - 15:00 (Saturday)</li>
            <li>Sunday (Closed)</li>
          </ul>
        </li>
        <li>• Annual leave: 21 days per year</li>
        <li>• Sick leave: 30 days per 3-year cycle</li>
        <li>• Grace period for tardiness: 15 minutes</li>
        <li>• Leave request notice: 14 days minimum</li>
      </ul>
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Compliance</h3>
    <p className="text-gray-700 mb-4">
      This policy complies with South African labor law:
    </p>
    <ul className="list-disc list-inside text-gray-700 space-y-1 mb-6">
      <li>Basic Conditions of Employment Act (BCEA), 1997</li>
      <li>Labour Relations Act (LRA), 1995</li>
      <li>Employment Equity Act (EEA), 1998</li>
      <li>Occupational Health and Safety Act (OHSA), 1993</li>
    </ul>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-yellow-900 mb-1">Important</h4>
          <p className="text-sm text-yellow-800">
            All employees must acknowledge that they have read and understood these policies.
            Violations may result in disciplinary action.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const WorkingHoursSection = () => (
  <div className="prose max-w-none">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Working Hours</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Standard Hours</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Full-time:</strong> 45 hours/week</li>
          <li>• <strong>Daily:</strong> 8 hours/day</li>
          <li>• <strong>Schedule:</strong> Mon-Sat, 08:00-17:00</li>
          <li>• <strong>Lunch:</strong> 1 hour</li>
        </ul>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h3 className="font-semibold text-indigo-900 mb-3">Flexible Working</h3>
        <ul className="space-y-2 text-sm text-indigo-800">
          <li>• <strong>Core hours:</strong> </li>
          <li>• <strong>Flex start:</strong> </li>
          <li>• <strong>Flex end:</strong> </li>
        </ul>
      </div>
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-3">Break Policy</h3>
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <ul className="space-y-2 text-gray-700">
        <li>• <strong>Lunch break:</strong> 1 hour</li>
        <li>• <strong>Tea breaks:</strong> 0 × 15 minutes</li>
        <li>• <strong>Total break time:</strong> 1 hours per day</li>
      </ul>
    </div>
  </div>
);

const AttendanceSection = () => (
  <div className="prose max-w-none">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance Recording</h2>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Sign In/Out Requirements</h3>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <p className="text-gray-700 mb-2">Employees must sign in:</p>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>At start of workday</li>
        <li>After lunch break</li>
        <li>Before leaving for the day</li>
      </ul>
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recording Methods</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
        <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-indigo-600" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">Mobile App</h4>
        <p className="text-sm text-gray-600">With location verification</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
        <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">Web Portal</h4>
        <p className="text-sm text-gray-600">Browser-based access</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
        <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-6 h-6 text-purple-600" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">Biometric</h4>
        <p className="text-sm text-gray-600">If available</p>
      </div>
    </div>

    <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Requirements</h3>
    <ul className="list-disc list-inside text-gray-700 space-y-2">
      <li>Must be at workplace</li>
      <li>Remote workers: Must enable location services</li>
      <li>Off-site work: Requires manager approval</li>
    </ul>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h4 className="font-semibold text-yellow-900 mb-2">Missed Sign-In/Out</h4>
      <ul className="text-sm text-yellow-800 space-y-1">
        <li>• Grace period: 15 minutes</li>
        <li>• Late arrival: Sign in immediately + notify manager</li>
        <li>• Forgotten sign-out: Report to manager next day</li>
        <li>• Repeated violations: Subject to disciplinary action</li>
      </ul>
    </div>
  </div>
);

const LeavePoliciesSection = () => (
  <div className="prose max-w-none">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Leave Policies</h2>
    
    <div className="space-y-6">
      {/* Annual Leave */}
      <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Annual Leave (Vacation)</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Entitlement:</p>
            <p>21 working days per year</p>
          </div>
          <div>
            <p className="font-medium">Accrual:</p>
            <p>1.75 days/month</p>
          </div>
          <div>
            <p className="font-medium">Carry forward:</p>
            <p>Maximum 5 days to next year</p>
          </div>
          <div>
            <p className="font-medium">Notice period:</p>
            <p>Minimum 14 days advance</p>
          </div>
        </div>
      </div>

      {/* Sick Leave */}
      <div className="border-l-4 border-red-500 bg-red-50 p-4">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Sick Leave</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-red-800">
          <div>
            <p className="font-medium">Entitlement:</p>
            <p>30 days per 3-year cycle</p>
          </div>
          <div>
            <p className="font-medium">Medical certificate:</p>
            <p>Required for &gt;2 consecutive days</p>
          </div>
          <div>
            <p className="font-medium">Notification:</p>
            <p>Within 2 hours of shift start</p>
          </div>
          <div>
            <p className="font-medium">Monitoring:</p>
            <p>Pattern monitoring by manager</p>
          </div>
        </div>
      </div>

      {/* Other Leave Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Maternity Leave</h4>
          <p className="text-sm text-purple-800">4 consecutive months (120 days)</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Paternity Leave</h4>
          <p className="text-sm text-green-800">10 consecutive days (fully paid)</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">Study Leave</h4>
          <p className="text-sm text-orange-800">Up to 5 days per year (work-related)</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Unpaid Leave</h4>
          <p className="text-sm text-gray-800">After exhausting paid leave</p>
        </div>
      </div>
    </div>
  </div>
);

const AbsenceSection = () => (
  <div className="prose max-w-none">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Absence Management</h2>
    
    <div className="space-y-6">
      {/* Unauthorized Absence */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 mb-3">Unauthorized Absence</h3>
        <p className="text-sm text-red-800 mb-3">
          Absence without prior approval or valid reason
        </p>
        <div className="space-y-2 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <span className="font-medium">1st offense:</span>
            <span>Written warning</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">2nd offense:</span>
            <span>Final written warning + unpaid leave</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium">3rd offense:</span>
            <span>Dismissal</span>
          </div>
        </div>
      </div>

      {/* Tardiness Policy */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-3">Tardiness Policy</h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• <strong>Grace period:</strong> 15 minutes</li>
          <li>• <strong>Late 15-30 min:</strong> 3x/month = verbal warning, 5x/month = written warning</li>
          <li>• <strong>Late &gt;30 min:</strong> Treated as partial absence</li>
        </ul>
      </div>

      {/* No Call, No Show */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900 mb-3">No Call, No Show</h3>
        <div className="text-sm text-orange-800 space-y-2">
          <p><strong>Day 1:</strong> Attempted contact (call, SMS, email)</p>
          <p><strong>Day 2:</strong> Emergency contact notification</p>
          <p><strong>Day 3:</strong> Considered job abandonment</p>
          <p className="font-medium mt-3">Consequence: Immediate dismissal (after investigation)</p>
        </div>
      </div>
    </div>
  </div>
);

const OvertimeSection = () => (
  <div className="prose max-w-none">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Overtime & Compensation</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3">Overtime Rules</h3>
        <ul className="text-sm text-green-800 space-y-2">
          <li>• <strong>Definition:</strong> Hours beyond 45/week or 8/day</li>
          <li>• <strong>Maximum:</strong> 10 hours/week</li>
          <li>• <strong>Weekday rate:</strong> 1.5× normal pay</li>
          <li>• <strong>Sunday rate:</strong> 2× normal pay</li>
          <li>• <strong>Holiday rate:</strong> 2× normal pay</li>
        </ul>
        <p className="text-xs text-green-700 mt-3">
          ⚠️ Must be pre-approved by manager
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Time Off in Lieu (TOIL)</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>Option:</strong> Instead of overtime pay</li>
          <li>• <strong>Accrual:</strong> 1.5 hours TOIL per 1 hour OT</li>
          <li>• <strong>Expiry:</strong> Must use within 3 months</li>
          <li>• <strong>Booking:</strong> Same as annual leave</li>
        </ul>
      </div>
    </div>

    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
      <h3 className="font-semibold text-indigo-900 mb-2">Public Holiday Work</h3>
      <p className="text-sm text-indigo-800">
        Working on a public holiday entitles you to <strong>double pay</strong> OR 
        a <strong>day off in lieu + normal pay</strong> (by mutual agreement)
      </p>
    </div>
  </div>
);

const DisciplinarySection = () => (
  <div className="prose max-w-none">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Disciplinary Actions</h2>
    
    <div className="space-y-4 mb-6">
      <div className="flex items-start gap-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="bg-yellow-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
          <span className="text-yellow-700 font-bold">1</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Verbal Warning</h4>
          <p className="text-sm text-gray-600">Documented but not formal • Valid for 3 months</p>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-orange-50 border-l-4 border-orange-500 p-4">
        <div className="bg-orange-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
          <span className="text-orange-700 font-bold">2</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">First Written Warning</h4>
          <p className="text-sm text-gray-600">Formal documentation • Valid for 6 months</p>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-red-50 border-l-4 border-red-500 p-4">
        <div className="bg-red-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
          <span className="text-red-700 font-bold">3</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Final Written Warning</h4>
          <p className="text-sm text-gray-600">Last chance before dismissal • Valid for 12 months</p>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-gray-50 border-l-4 border-gray-500 p-4">
        <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-700 font-bold">4</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Dismissal</h4>
          <p className="text-sm text-gray-600">With cause • Right to appeal</p>
        </div>
      </div>
    </div>

    <div className="bg-red-100 border border-red-300 rounded-lg p-4">
      <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        Grounds for Immediate Dismissal
      </h3>
      <ul className="text-sm text-red-800 space-y-1">
        <li>• Time fraud (buddy punching, false sign-ins)</li>
        <li>• Falsifying attendance records</li>
        <li>• Unauthorized absence &gt;3 consecutive days</li>
        <li>• Intoxication at work</li>
        <li>• Violence or harassment</li>
        <li>• Theft or dishonesty</li>
      </ul>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <h3 className="font-semibold text-blue-900 mb-2">Appeals Process</h3>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Right to appeal within 7 days</li>
        <li>• HR review + management hearing</li>
        <li>• Final decision within 14 days</li>
      </ul>
    </div>
  </div>
);

export default PoliciesView;