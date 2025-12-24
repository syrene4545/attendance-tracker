import React, { useState } from 'react';
import { 
  Shield,
  Lock,
  Camera,
  AlertTriangle,
  Eye,
  Key,
  Users,
  PhoneCall,
  FileText,
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Bell,
  UserX,
  Zap
} from 'lucide-react';

const SecuritySOPView = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Security Overview', icon: Shield },
    { id: 'opening-closing', label: 'Opening & Closing', icon: Key },
    { id: 'access-control', label: 'Access Control', icon: Lock },
    { id: 'surveillance', label: 'CCTV & Monitoring', icon: Camera },
    { id: 'shoplifting', label: 'Shoplifting Prevention', icon: Eye },
    // { id: 'internal-theft', label: 'Internal Theft', icon: UserX },
    { id: 'robbery', label: 'Robbery Response', icon: AlertTriangle },
    { id: 'incidents', label: 'Incident Response', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-lg p-8 text-white">
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
          <h1 className="text-4xl font-bold mb-2">🔐 Security & Loss Prevention SOP</h1>
          <p className="text-xl text-red-100 mb-6">Protecting Our Assets, Staff & Customers</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-red-100">CCTV Monitoring</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">3</div>
              <div className="text-sm text-red-100">Security Layers</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-red-100">Tolerance for Theft</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-red-100">Compliance Required</div>
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
                      ? 'bg-red-100 text-red-700'
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
            {activeSection === 'opening-closing' && <OpeningClosingSection />}
            {activeSection === 'access-control' && <AccessControlSection />}
            {activeSection === 'surveillance' && <SurveillanceSection />}
            {activeSection === 'shoplifting' && <ShopliftingSection />}
            {/* {activeSection === 'internal-theft' && <InternalTheftSection />} */}
            {activeSection === 'robbery' && <RobberySection />}
            {activeSection === 'incidents' && <IncidentsSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const OverviewSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Security Overview</h2>
    
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">Our Security Mission</h3>
      <p className="text-lg text-gray-800 mb-4">
        Security at Lera Health is everyone's responsibility. We are committed to creating a safe 
        environment for our staff, customers, and protecting company assets from theft, fraud, and 
        unauthorized access.
      </p>
      <p className="text-lg text-gray-800">
        This SOP outlines security protocols, loss prevention measures, and incident response procedures 
        that all employees must follow.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Three Pillars of Security</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Physical Security</h4>
              <p className="text-sm text-gray-700">
                Locks, alarms, CCTV, access control, security guards - physical barriers to 
                prevent unauthorized access and deter crime.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Users className="w-8 h-8 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-purple-900 mb-1">Procedural Security</h4>
              <p className="text-sm text-gray-700">
                Policies, procedures, training - ensuring everyone knows what to do, when to do it, 
                and how to respond to security threats.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-900 mb-1">Awareness & Vigilance</h4>
              <p className="text-sm text-gray-700">
                Staff awareness, customer monitoring, suspicious activity reporting - people are 
                our best defense against security threats.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Security Responsibilities</h3>
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Stay Alert:</strong> Be aware of your surroundings, customers, and colleagues at all times
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Follow Procedures:</strong> Never bypass security measures "just this once" - every breach is an opportunity for crime
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Report Immediately:</strong> Any security concerns, suspicious behavior, or incidents must be reported right away
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Secure Assets:</strong> Protect cash, stock, keys, and confidential information at all times
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Challenge Appropriately:</strong> Politely question unfamiliar people in restricted areas
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Never Compromise:</strong> Don't share access codes, prop doors open, or ignore security breaches
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Main Security Threats</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h4 className="font-bold text-red-900 mb-3">External Threats</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Shoplifting (customer theft)</li>
            <li>• Armed robbery</li>
            <li>• Burglary (after hours break-in)</li>
            <li>• Vandalism</li>
            <li>• Fraud (counterfeit money, card fraud)</li>
            <li>• Organized retail crime</li>
          </ul>
        </div>

        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
          <h4 className="font-bold text-orange-900 mb-3">Internal Threats</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Employee theft</li>
            <li>• Till fraud</li>
            <li>• Stock shrinkage</li>
            <li>• Unauthorized discounts</li>
            <li>• Data breaches</li>
            <li>• Collusion with external criminals</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6" />
        Golden Rule of Security
      </h3>
      <p className="text-gray-800 text-lg mb-3">
        <strong>Personal safety ALWAYS comes first.</strong>
      </p>
      <p className="text-gray-800">
        No amount of money or stock is worth your life or safety. In any threatening situation:
      </p>
      <ul className="space-y-2 text-gray-800 mt-3">
        <li>• <strong>Cooperate fully</strong> with robbers - give them what they want</li>
        <li>• <strong>Never be a hero</strong> - don't try to stop or chase criminals</li>
        <li>• <strong>Protect lives</strong> - your safety and customer safety is paramount</li>
        <li>• <strong>Property is replaceable</strong> - you are not</li>
      </ul>
    </div>
  </div>
);

const OpeningClosingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Opening & Closing Procedures</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">🔑 Key Holder Responsibilities</h3>
      <p className="text-gray-800">
        Only <strong>authorized key holders</strong> (Manager, Assistant Manager, designated senior staff) 
        can open and close the store. If you are a key holder, these are your critical security duties.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Morning Opening Procedure</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white border-l-4 border-green-500 p-4">
            <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Arrival (30 minutes before opening)</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Arrive with another staff member (never alone)</li>
                <li>• Park in well-lit area close to entrance</li>
                <li>• Be alert - check for suspicious activity/people nearby</li>
                <li>• Have phone ready to call security/police if needed</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-blue-500 p-4">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">External Check</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Walk around building perimeter (both of you)</li>
                <li>• Check for signs of forced entry, broken windows, damage</li>
                <li>• Look for suspicious items near doors/windows</li>
                <li>• Check roller doors, locks are secure and undamaged</li>
                <li>• If anything suspicious: DO NOT ENTER - call police and security</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-purple-500 p-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Disarm Alarm</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Unlock main door</li>
                <li>• Enter quickly but calmly</li>
                <li>• Go directly to alarm panel</li>
                <li>• Enter alarm code within time limit (usually 60 seconds)</li>
                <li>• Verify alarm is fully disarmed (green light/beep)</li>
                <li>• If alarm continues: Follow duress protocol (see below)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-orange-500 p-4">
            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Internal Inspection</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Walk through entire store together</li>
                <li>• Turn on all lights as you go</li>
                <li>• Check every room, bathroom, storeroom, dispensary</li>
                <li>• Look for signs of theft, damage, or hiding intruders</li>
                <li>• Check safe is secure and undamaged</li>
                <li>• Verify no windows/doors left open overnight</li>
                <li>• If anything amiss: Call manager and security immediately</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 p-4">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Systems Check & Open</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Check CCTV system is recording properly</li>
                <li>• Boot up POS systems and verify working</li>
                <li>• Test panic buttons (inform security company first)</li>
                <li>• Complete opening checklist form</li>
                <li>• Unlock customer entrance doors</li>
                <li>• Display "OPEN" sign</li>
                <li>• Ready to serve customers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Evening Closing Procedure</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white border-l-4 border-purple-500 p-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Closing Time (17:00 weekdays, 15:00 Saturdays)</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Lock entrance doors promptly at closing time</li>
                <li>• Change sign to "CLOSED"</li>
                <li>• Allow customers inside to complete purchases</li>
                <li>• Politely ask loitering customers to finalize and leave</li>
                <li>• Do NOT allow new customers in after closing time</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-blue-500 p-4">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Secure Cash & Stock</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Complete all till closures (see Cash Handling SOP)</li>
                <li>• Place cash in safe</li>
                <li>• Lock dispensary (medications secured)</li>
                <li>• Lock expensive items in secure cabinets</li>
                <li>• Ensure no stock left unattended on counters</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-green-500 p-4">
            <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Final Security Check</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Check all windows are closed and locked</li>
                <li>• Ensure all internal doors are locked (storerooms, offices)</li>
                <li>• Check bathrooms - ensure no one hiding</li>
                <li>• Verify all staff have left building (check sign-out register)</li>
                <li>• Turn off unnecessary lights (leave security lights on)</li>
                <li>• Check nothing of value left visible from outside</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-orange-500 p-4">
            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Arm Alarm & Exit</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Activate alarm system (full perimeter mode)</li>
                <li>• Verify alarm is setting correctly (beeping countdown)</li>
                <li>• Exit quickly before alarm arms (usually 60 seconds)</li>
                <li>• Lock main door from outside</li>
                <li>• Test door is properly locked (pull firmly)</li>
                <li>• Check roller shutters (if applicable) - lock securely</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 p-4">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Safe Departure</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Leave together - never alone</li>
                <li>• Stay alert for suspicious people/vehicles</li>
                <li>• If anything suspicious: Return inside and call security/police</li>
                <li>• Get into car quickly, lock doors immediately</li>
                <li>• Drive directly out of parking area</li>
                <li>• If carrying banking: Follow armed escort procedure</li>
                <li>• Call security company to confirm building secured</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ Duress Protocol</h3>
      <p className="text-gray-800 mb-3">
        If forced to disarm alarm or open store under threat (gun to head, hostage situation):
      </p>
      <div className="bg-white rounded-lg p-4">
        <ol className="list-decimal list-inside space-y-2 text-gray-800 ml-4">
          <li><strong>Use duress code</strong> - Special alarm code that looks normal but triggers silent alarm to police/security</li>
          <li><strong>Act normally</strong> - Don't let criminals know alarm was triggered</li>
          <li><strong>Cooperate fully</strong> - Give them what they want</li>
          <li><strong>Observe details</strong> - Mental note of appearance, weapons, vehicles (for later police report)</li>
          <li><strong>Wait for help</strong> - Police/security en route</li>
        </ol>
        <p className="text-sm text-red-800 mt-4 font-semibold">
          Your duress code is: [Manager provides this confidentially to key holders]
        </p>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Key Management</h3>
      <div className="space-y-2 text-gray-700">
        <p><strong>Authorized Key Holders:</strong> Only designated staff hold keys</p>
        <p><strong>Key Security:</strong></p>
        <ul className="space-y-1 ml-6">
          <li>• Keep keys on your person at all times (never leave in car, on desk, etc.)</li>
          <li>• Never share keys or lend to anyone</li>
          <li>• Don't label keys with store name/address</li>
          <li>• Report lost keys immediately</li>
          <li>• Lost key = immediate lock change at your cost</li>
        </ul>
        <p className="mt-3"><strong>Key Sign-Out:</strong></p>
        <ul className="space-y-1 ml-6">
          <li>• Sign key register when collecting/returning keys</li>
          <li>• Return keys to manager at end of shift if not taking home</li>
          <li>• Keys taken home must be secured at your residence</li>
        </ul>
      </div>
    </div>
  </div>
);

const AccessControlSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Access Control</h2>
    
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Staff-Only Areas</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          Certain areas are restricted to staff only. Customers must NEVER be allowed in these areas:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3">🚫 Restricted Areas:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Behind dispensary counter</li>
              <li>• Staff room/kitchen</li>
              <li>• Storerooms</li>
              <li>• Manager's office</li>
              <li>• Safe room</li>
              <li>• Receiving area</li>
              <li>• Staff bathrooms</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">✅ If Customer Enters Restricted Area:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Politely but firmly redirect: "I'm sorry, this area is staff only"</li>
              <li>• Escort them back to customer area</li>
              <li>• If they refuse: Call manager immediately</li>
              <li>• If suspicious behavior: Alert all staff, watch carefully</li>
              <li>• Never leave them unattended in restricted areas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Visitor Management</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Expected Visitors (Suppliers, Contractors, etc.)</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li>Request ID and verify identity</li>
              <li>Check if they're on expected visitor list</li>
              <li>Sign visitor register (name, company, purpose, time in/out)</li>
              <li>Issue visitor badge (if available)</li>
              <li>Escort to appropriate area - never leave unattended</li>
              <li>Manager approves access to secure areas</li>
              <li>Sign out when leaving, collect visitor badge</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Unexpected Visitors</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>Sales reps:</strong> Polite but firm - "Please call to make appointment"</li>
              <li>• <strong>Unknown contractors:</strong> Verify with manager before allowing access</li>
              <li>• <strong>Inspectors/officials:</strong> Request ID, call manager immediately, do not allow access without manager approval</li>
              <li>• <strong>Police:</strong> Request badge number, call station to verify, comply with lawful requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">After-Hours Access</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 mb-4">
          <p className="font-semibold text-red-900 mb-2">⚠️ Critical Rule:</p>
          <p className="text-sm text-red-800">
            <strong>NEVER work alone after hours.</strong> Always have at least 2 staff members present 
            for security and safety.
          </p>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">After-Hours Work Protocol:</h4>
        <ul className="space-y-2 text-gray-700">
          <li>• <strong>Manager approval required</strong> for all after-hours work</li>
          <li>• Minimum 2 people present at all times</li>
          <li>• Inform security company of after-hours presence</li>
          <li>• Keep entrance door locked while working</li>
          <li>• Verify identity before opening door to anyone</li>
          <li>• Have panic button accessible</li>
          <li>• Phone charged and nearby</li>
          <li>• Park under lights near entrance</li>
          <li>• When leaving: Full closing procedure (alarm, lock-up, secure)</li>
        </ul>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Personal Belongings Security</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-purple-900 mb-3">✅ Protect Your Belongings:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use provided lockers in staff room</li>
              <li>• Bring your own lock</li>
              <li>• Don't bring valuables to work</li>
              <li>• Keep phone locked and out of sight</li>
              <li>• Never leave bag/wallet unattended</li>
              <li>• Lock car in parking lot</li>
              <li>• Don't display valuables in car</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-red-900 mb-3">❌ Company Not Liable:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Company is NOT responsible for staff personal items</li>
              <li>• Lost/stolen personal belongings - your risk</li>
              <li>• No cash compensation for theft of personal items</li>
              <li>• Keep valuables at home</li>
              <li>• Use lockers for what you must bring</li>
              <li>• Report theft to police yourself</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SurveillanceSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">CCTV & Surveillance Systems</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">📹 Our CCTV System</h3>
      <p className="text-gray-800">
        Lera Health operates a comprehensive CCTV system recording <strong>24/7 in all areas</strong> 
        of the store. Cameras monitor customer areas, cash points, stock areas, and entrances/exits. 
        Footage is stored for 30 days and is used for security, loss prevention, and incident investigation.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">CCTV Coverage Areas</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">📹 Camera Locations:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Main entrance/exit</li>
              <li>• All till points</li>
              <li>• Aisles and shopping areas</li>
              <li>• Dispensary counter</li>
              <li>• Storeroom entrance</li>
              <li>• Receiving area</li>
              <li>• Safe area</li>
              <li>• Parking lot (if applicable)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">✅ CCTV Benefits:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Deters shoplifting and internal theft</li>
              <li>• Provides evidence for prosecutions</li>
              <li>• Resolves customer disputes</li>
              <li>• Monitors staff safety</li>
              <li>• Identifies security breaches</li>
              <li>• Investigates incidents/accidents</li>
              <li>• Reviews staff performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">CCTV Monitoring Responsibilities</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Manager/Supervisor Duties:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Check CCTV system is recording daily (check indicator lights)</li>
              <li>• Review footage when suspicious activity reported</li>
              <li>• Investigate discrepancies using CCTV evidence</li>
              <li>• Provide footage to police when requested</li>
              <li>• Ensure hard drive has sufficient space</li>
              <li>• Report technical issues to IT/security provider immediately</li>
              <li>• Conduct periodic spot-checks of live feeds</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">All Staff Responsibilities:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Be aware you're being recorded - maintain professional behavior</li>
              <li>• Report if cameras appear damaged or not working</li>
              <li>• Don't obstruct camera views</li>
              <li>• Don't tamper with cameras or cabling</li>
              <li>• Understand footage may be reviewed for investigations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Reviewing CCTV Footage</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 mb-4">
          <p className="font-semibold text-yellow-900 mb-2">🔒 Access Control:</p>
          <p className="text-sm text-gray-700">
            Only <strong>authorized personnel</strong> (Manager, Loss Prevention, HR, Police) can access 
            CCTV footage. General staff cannot request or view footage unless part of authorized investigation.
          </p>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">When Footage is Reviewed:</h4>
        <ul className="space-y-2 text-gray-700">
          <li>• Suspected shoplifting incidents</li>
          <li>• Till discrepancies/suspected theft</li>
          <li>• Customer complaints</li>
          <li>• Accidents/injuries</li>
          <li>• Missing stock investigations</li>
          <li>• Performance reviews (customer service quality)</li>
          <li>• Police investigations</li>
          <li>• Insurance claims</li>
        </ul>

        <div className="bg-blue-100 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-blue-900 mb-2">POPIA Compliance:</h4>
          <p className="text-sm text-gray-700">
            CCTV usage complies with Protection of Personal Information Act (POPIA). Signage notifies 
            customers and staff of surveillance. Footage is stored securely, accessed only when necessary, 
            and retained for 30 days unless needed for investigation.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ CCTV System Failure</h3>
      <p className="text-gray-800 mb-3">
        If CCTV system goes down or cameras stop recording:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-gray-800 ml-4">
        <li><strong>Report immediately</strong> to manager</li>
        <li><strong>Call IT/security provider</strong> for urgent repair</li>
        <li><strong>Increase vigilance</strong> - without cameras, staff must watch more carefully</li>
        <li><strong>Manager considers</strong> closing store if extended outage during high-risk times</li>
        <li><strong>Log downtime</strong> - record when system failed and when restored</li>
      </ol>
      <p className="text-sm text-red-800 mt-4">
        <strong>Never</strong> operate for extended periods without working CCTV - this significantly 
        increases theft risk.
      </p>
    </div>
  </div>
);

const ShopliftingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Shoplifting Prevention</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">📊 The Reality of Shoplifting</h3>
      <p className="text-gray-800 mb-3">
        Shoplifting costs retail businesses billions annually. <strong>Prevention is better than prosecution.</strong> 
        Most shoplifters are opportunistic - if they see they're being watched, they won't steal.
      </p>
      <div className="bg-white rounded-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">Common Items Targeted:</p>
        <ul className="text-sm text-gray-700 grid grid-cols-2 gap-2">
          <li>• Small, high-value medications</li>
          <li>• Cosmetics and perfumes</li>
          <li>• Vitamins and supplements</li>
          <li>• Baby formula</li>
          <li>• Razor blades</li>
          <li>• Energy drinks</li>
          <li>• Batteries</li>
          <li>• Pain medication</li>
        </ul>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Shoplifting Prevention Strategies</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-3">1. Customer Service as Deterrent</h4>
            <p className="text-sm text-gray-700 mb-2">
              <strong>The #1 shoplifting deterrent is engaged staff.</strong>
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Greet EVERY customer who enters: "Hello! Let me know if you need help!"</li>
              <li>• Make eye contact - let them know they've been seen</li>
              <li>• Offer assistance frequently: "Finding everything okay?"</li>
              <li>• Stay visible on the shop floor, not behind counter</li>
              <li>• Shoplifters avoid stores with attentive staff</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">2. Floor Positioning & Visibility</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Position yourself where you can see entrance and aisles</li>
              <li>• Move around store regularly - don't stay static</li>
              <li>• Keep high-value items in your line of sight</li>
              <li>• Use mirrors to see blind spots</li>
              <li>• Never leave shop floor unmanned</li>
              <li>• Two staff? Cover different areas</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">3. Store Layout & Security Measures</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Keep high-value items near till or in locked cabinets</li>
              <li>• Ensure good lighting in all areas (no dark corners)</li>
              <li>• Keep aisles clear and unobstructed</li>
              <li>• Use security tags on expensive items</li>
              <li>• Display CCTV signs prominently</li>
              <li>• Limit quantities displayed on floor for high-theft items</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-orange-900 mb-3">4. Watch for Suspicious Behavior</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Groups of teenagers acting suspiciously</li>
              <li>• Person wearing bulky/loose clothing (hiding space)</li>
              <li>• Large bags, backpacks brought into store</li>
              <li>• Person looking around nervously, watching staff</li>
              <li>• Handling many items but buying nothing</li>
              <li>• Visiting same aisle repeatedly</li>
              <li>• Concealing movements with coat/bag</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">If You Suspect Shoplifting</h3>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
          <p className="font-semibold text-orange-900 mb-2">⚠️ CRITICAL RULE:</p>
          <p className="text-sm text-orange-800">
            <strong>DO NOT physically confront, accuse, or touch suspected shoplifters.</strong> 
            This creates liability and danger. Follow the approved procedure below.
          </p>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">Approved Response Procedure:</h4>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">Step 1: Increase Presence</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Move closer to the person</li>
              <li>• Make your presence obvious</li>
              <li>• Offer assistance: "Can I help you find something?"</li>
              <li>• Stay friendly but engaged</li>
              <li>• Often, this alone will deter them</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">Step 2: Alert Colleague (Discreetly)</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use code phrase: "Can you help me in aisle 3?" (or designated code)</li>
              <li>• Second staff member comes to assist with "customer service"</li>
              <li>• Two staff present deters most shoplifters</li>
              <li>• Both keep person in sight</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">Step 3: Call Manager/Security</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• If person proceeds to conceal items, discreetly call manager</li>
              <li>• Provide description and location</li>
              <li>• Manager makes decision on next steps</li>
              <li>• If person heads for exit, manager/security may intervene</li>
            </ul>
          </div>
        </div>

        <div className="bg-red-100 rounded-lg p-4 mt-4">
          <h4 className="font-bold text-red-900 mb-2">❌ NEVER DO:</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Physically stop or grab suspected shoplifter</li>
            <li>• Block exits or physically restrain</li>
            <li>• Chase them outside the store</li>
            <li>• Accuse directly: "I saw you steal that!"</li>
            <li>• Search their bags/person</li>
            <li>• Make a scene or shout accusations</li>
          </ul>
          <p className="text-sm text-red-800 mt-3">
            <strong>Why?</strong> Risk of violence, false accusation lawsuits, assault charges against you/company.
          </p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">After a Shoplifting Incident</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
          <li><strong>Ensure safety first</strong> - Make sure no one was hurt</li>
          <li><strong>Note details immediately:</strong>
            <ul className="ml-6 mt-2 space-y-1 text-sm">
              <li>• Physical description (height, build, clothing, distinguishing features)</li>
              <li>• Time and date</li>
              <li>• What was stolen (brand, quantity, value)</li>
              <li>• Direction they fled</li>
              <li>• Vehicle description/license plate if applicable</li>
              <li>• Any accomplices</li>
            </ul>
          </li>
          <li><strong>Review CCTV footage</strong> - Manager pulls relevant footage immediately</li>
          <li><strong>Complete incident report</strong> - Full written report to manager and HR</li>
          <li><strong>Police report</strong> - Manager decides if police should be called (usually yes for high-value theft)</li>
          <li><strong>Inventory check</strong> - Document stolen items for insurance claim</li>
          <li><strong>Learn from it</strong> - What could prevent future incidents?</li>
        </ol>
      </div>
    </div>

    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">Organized Retail Crime (ORC)</h3>
      <p className="text-gray-700 mb-3">
        Professional theft rings targeting retailers for resale:
      </p>
      <div className="bg-white rounded-lg p-4 mb-3">
        <h4 className="font-semibold text-gray-900 mb-2">Warning Signs of ORC:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Multiple people working together</li>
          <li>• Targeting same high-value items repeatedly</li>
          <li>• Taking large quantities</li>
          <li>• Hitting store multiple times in short period</li>
          <li>• Professional, coordinated approach (distraction tactics)</li>
          <li>• Arriving/leaving in same vehicle</li>
        </ul>
      </div>
      <p className="text-sm text-purple-800">
        <strong>If suspected ORC:</strong> Call manager and police immediately. These are dangerous, 
        professional criminals - DO NOT confront.
      </p>
    </div>
  </div>
);

// const InternalTheftSection = () => (
//   <div className="space-y-6">
//     <h2 className="text-3xl font-bold text-gray-900">Internal Theft Prevention</h2>
    
//     <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
//       <h3 className="text-xl font-bold text-red-900 mb-3">💔 The Hard Truth About Internal Theft</h3>
//       <p className="text-gray-800 mb-3">
//         Studies show that <strong>internal theft (employee theft) accounts for 30-40% of retail losses</strong> 
//         - more than shoplifting. Most employee theft is by trusted, long-term employees, not new hires.
//       </p>
//       <p className="text-gray-800">
//         Every item stolen by an employee is a betrayal of trust and a threat to everyone's jobs. 
//         <strong> Zero tolerance policy - theft = immediate dismissal + prosecution.</strong>
//       </p>
//     </div>

//     <div>
//       <h3 className="text-2xl font-bold text-gray-900 mb-4">Common Types of Employee Theft</h3>
//       <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="bg-white rounded-lg p-4">
//             <h4 className="font-bold text-orange-900 mb-3">Cash Theft:</h4>
//             <ul className="text-sm text-gray-700 space-y-1">
//               <li>• Taking cash from till</li>
//               <li>• Under-ringing sales (lower price, pocketing difference)</li>
//               <li>• Voiding transactions after customer leaves</li>
//               <li>• Giving unauthorized discounts to friends</li>
//               <li>• Processing fake refunds</li>
//               <li>• Not recording cash sales</li>
//             </ul>
//           </div>

//           <div className="bg-white rounded-lg p-4">
//             <h4 className="font-bold text-red-900 mb-3">Stock Theft:</h4>
//             <ul className="text-sm text-gray-700 space-y-1">
//               <li>• Taking merchandise home</li>
//               <li>• Giving products to friends/family</li>
//               <li>• False deliveries (recording items delivered but keeping them)</li>
//               <li>• Disposal fraud (marking as expired/damaged but taking)</li>
//               <li>• Storeroom theft (taking from stock)</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>

//     <div>
//       <h3 className="text-2xl font-bold text-gray-900 mb-4">Prevention Measures</h3>
//       <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
//         <div className="space-y-4">
//           <div className="bg-white rounded-lg p-4">
//             <h4 className="font-bold text-green-900 mb-3">1. Accountability Systems</h4>
//             <ul className="text-sm text-gray-700 space-y-1">
//               <li>• Individual till responsibility - one person per till</li>
//               <li>• Daily till balancing - no one goes home until balanced</li>
//               <li>• All refunds require manager authorization</li>
//               <li>• Void transactions logged and reviewed</li>
//               <li>• Employee purchases require second staff member witness</li>
//               <li>• Regular stock audits and cycle counts</li>
//             </ul>
//           </div>

//           <div className="bg-white rounded-lg p-4">
//             <h4 className="font-bold text-blue-900 mb-3">2. Separation of Duties</h4>
//             <ul className="text-sm text-gray-700 space-y-1">
//               <li>• Person ordering stock ≠ person receiving stock</li>
//               <li>• Person processing refunds ≠ person approving refunds</li>
//               <li>• Cashier cannot process their own transactions</li>
//               <li>• Manager reviews all unusual transactions</li>
//             </ul>
//           </div>

//           <div className="bg-white rounded-lg p-4">
//             <h4 className="font-bold text-purple-900 mb-3">3. Surveillance & Monitoring</h4>
//             <ul className="text-sm text-gray-700 space-y-1">
//               <li>• CCTV monitors staff areas (tills, storeroom, dispensary)</li>
//               <li>• Random CCTV reviews by management</li>
//               <li>• Bag checks (random searches when leaving)</li>
//               <li>• POS system logs all transactions with staff ID</li>
//               <li>• Exception reports (voids, refunds, discounts reviewed daily)</li>
//             </ul>
//           </div>

//           <div className="bg-white rounded-lg p-4">
//             <h4 className="font-bold text-orange-900 mb-3">4. Culture & Environment</h4>
//             <ul className="text-sm text-gray-700 space-y-1">
//               <li>• Clear policies - everyone knows theft = dismissal</li>
//               <li>• Fair wages and treatment (reduces motivation to steal)</li>
//               <li>• Anonymous reporting hotline for suspected theft</li>
//               <li>• Recognition and rewards for honest employees</li>
//               <li>• Regular security training and reminders</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>

//     <div>
//       <h3 className="text-2xl font-bold text-gray-900 mb-4">Red Flags - Suspicious Employee Behavior</h3>
//       <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
//         <p className="text-gray-700 mb-4">
//           Watch for these warning signs (alone they may be innocent, but multiple signs warrant investigation):
//         </p>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="bg-white rounded-lg p-4">
//             <h4 className="font-semibold text-yellow-900 mb-3">Behavioral Red Flags:</h4>
//             <ul className="text-sm text-gray-700 space-y-1">
//               <li>⚠️ Sudden lifestyle change (expensive items on low salary)</li>
//               <li>⚠️ Working unusual hours alone</li>
//               <li>⚠️ Defensive when questioned about transactions</li>
//               <li>⚠️ Frequent unexplained till shortages</li>
//               <li>⚠️ Excessive void transactions</li>
//               <li>⚠️ Always volunteering for deliveries/stockroom duty</li>
//               <li>⚠️ Reluctant to take vacation (fear of discovery)</li>
//             </ul>
//           </div>

//           <div className="bg-white rounded-lg p-4">
//             <h4 className="font-semibold text-red-900 mb-3">Operational Red Flags:</h4>
//             <ul className="text-sm text-gray-700 space-y-1">
//               <li>⚠️ Same customer returns frequently to specific staff member</li>
//               <li>⚠️ Staff member brings large bags/backpacks</li>
//               <li>⚠️ Taking items to "test" and not returning them</li>
//               <li>⚠️ Frequent stock discrepancies in their area</li>
//               <li>⚠️ Unusual refund patterns</li>
//               <li>⚠️ Resisting supervision or monitoring</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>

//     <div>
//       <h3 className="text-2xl font-bold text-gray-900 mb-4">If You Suspect Employee Theft</h3>
//       <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
//         <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 mb-4">
//           <p className="font-semibold text-red-900 mb-2">⚠️ DO NOT Confront the Employee Yourself</p>
//           <p className="text-sm text-red-800">
//             Employee theft investigations must be handled by management/HR to avoid false accusations, 
//             conflicts, and legal issues.
//           </p>
//         </div>

//         <h4 className="font-semibold text-gray-900 mb-3">Proper Reporting Procedure:</h4>
//         <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
//           <li><strong>Document what you observed:</strong>
//             <ul className="ml-6 mt-2 space-y-1 text-sm">
//               <li>• Specific dates, times, locations</li>
//               <li>• Exactly what you saw (not assumptions)</li>
//               <li>• Any witnesses</li>
//               <li>• Keep notes confidential</li>
//             </ul>
//           </li>
//           <li><strong>Report to manager privately:</strong>
//             <ul className="ml-6 mt-2 space-y-1 text-sm">
//               <li>• Request private meeting</li>
//               <li>• Present facts, not opinions</li>
//               <li>• Provide documentation</li>
//               <li>• Answer questions honestly</li>
//             </ul>
//           </li>
//           <li><strong>Maintain confidentiality:</strong>
//             <ul className="ml-6 mt-2 space-y-1 text-sm">
//               <li>• Don't discuss with other staff</li>
//               <li>• Don't accuse suspected employee</li>
//               <li>• Don't gossip about investigation</li>
//               <li>• Let management handle it</li>
//             </ul>
//           </li>
//           <li><strong>Continue normal behavior:</strong>
//             <ul className="ml-6 mt-2 space-y-1 text-sm">
//               <li>• Don't change how you interact with suspect</li>
//               <li>• Don't alert them to investigation</li>
//               <li>• Follow all normal procedures</li>
//               <li>• Let investigators do their job</li>
//             </ul>
//           </li>
//         </ol>

//         <div className="bg-blue-100 rounded-lg p-4 mt-4">
//           <h4 className="font-semibold text-blue-900 mb-2">Whistleblower Protection:</h4>
//           <p className="text-sm text-gray-700">
//             Employees who report suspected theft in good faith are protected from retaliation. 
//             Anonymous reporting available via: [Ethics Hotline: 0800-ETHICS or ethics@lerahealth.com]
//           </p>
//         </div>
//       </div>
//     </div>

//     <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
//       <h3 className="text-xl font-bold text-red-900 mb-3">Consequences of Employee Theft</h3>
//       <div className="space-y-2 text-gray-800">
//         <p><strong>If caught stealing:</strong></p>
//         <ol className="list-decimal list-inside space-y-2 ml-4">
//           <li><strong>Immediate suspension</strong> pending investigation</li>
//           <li><strong>Disciplinary hearing</strong> - right to representation</li>
//           <li><strong>If guilty: Instant dismissal</strong> for gross misconduct</li>
//           <li><strong>Criminal charges</strong> - theft case opened with police</li>
//           <li><strong>Civil recovery</strong> - company sues for value stolen + damages</li>
//           <li><strong>Criminal record</strong> - affects future employment</li>
//           <li><strong>Industry blacklist</strong> - reference checks will reveal theft</li>
//         </ol>
//         <p className="mt-4 font-semibold text-red-900">
//           ⚠️ No second chances. No amount is "too small" to prosecute. Employee theft is a crime, not a mistake.
//         </p>
//       </div>
//     </div>
//   </div>
// );

const RobberySection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Armed Robbery Response</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
        <AlertTriangle className="w-7 h-7" />
        GOLDEN RULE: YOUR LIFE IS MORE VALUABLE THAN ANY AMOUNT OF MONEY
      </h3>
      <p className="text-gray-800 text-lg mb-3">
        In an armed robbery situation, <strong>cooperate fully</strong> with the robbers. Give them 
        what they want. Do not resist, argue, or try to be a hero. Your goal is to survive unharmed.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">During a Robbery</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-bold text-green-900 mb-3">✅ DO THIS:</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Stay calm</strong> - Robbers are nervous; don't escalate the situation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Cooperate fully</strong> - Do exactly what they say, immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Move slowly</strong> - Announce actions: "I'm reaching for the till key now"</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Keep hands visible</strong> - Don't make sudden movements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Protect customers</strong> - Tell them to comply, stay calm</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Observe details</strong> - Mental note of appearance, weapons, voices (but don't stare)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Press panic button</strong> - If safe to do so without them noticing</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-900 mb-3">❌ DON'T DO THIS:</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>NEVER resist or fight back</strong> - You will lose, and may get killed</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>NEVER chase robbers</strong> - Even after they leave</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>NEVER argue or negotiate</strong> - Just comply</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>Don't stare at faces</strong> - Brief glances only (don't make them feel threatened)</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>Don't make promises</strong> - "I won't tell police" - just stay quiet</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span><strong>Don't touch weapons</strong> - Even if they put gun down</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Immediately After Robbery</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
          <li><strong>Ensure everyone is safe</strong>
            <ul className="ml-6 mt-2 space-y-1 text-sm">
              <li>• Check if anyone injured - call ambulance if needed</li>
              <li>• Calm distressed customers/staff</li>
              <li>• Don't let anyone leave (witnesses needed)</li>
            </ul>
          </li>
          <li><strong>Call police immediately</strong> (10111)
            <ul className="ml-6 mt-2 space-y-1 text-sm">
              <li>• State: "Armed robbery at Lera Health [address]"</li>
              <li>• Number of robbers, weapons, direction they fled</li>
              <li>• Vehicle description if applicable</li>
              <li>• Stay on line with dispatcher</li>
            </ul>
          </li>
          <li><strong>Call security company</strong>
            <ul className="ml-6 mt-2 space-y-1 text-sm">
              <li>• Report incident</li>
              <li>• Request armed response</li>
              <li>• They may already be en route (panic button)</li>
            </ul>
          </li>
          <li><strong>Secure the scene</strong>
            <ul className="ml-6 mt-2 space-y-1 text-sm">
              <li>• Lock doors (no customers in/out until police arrive)</li>
              <li>• Don't touch anything robbers touched</li>
              <li>• Preserve evidence</li>
              <li>• Turn CCTV to playback to preserve footage</li>
            </ul>
          </li>
          <li><strong>Note details IMMEDIATELY</strong>
            <ul className="ml-6 mt-2 space-y-1 text-sm">
              <li>• Write down everything while fresh in mind</li>
              <li>• Physical descriptions (height, build, clothing, race, accent)</li>
              <li>• Weapons (type, how many)</li>
              <li>• Words spoken (exact phrases if possible)</li>
              <li>• Direction fled, vehicle details</li>
              <li>• Time (start and end of incident)</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Police Arrival & Investigation</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">When Police Arrive:</h4>
        <ul className="space-y-2 text-gray-700">
          <li>• Follow all police instructions</li>
          <li>• Provide your written notes</li>
          <li>• Give detailed statement (one witness at a time)</li>
          <li>• Don't discuss details with other witnesses before statements (contaminates evidence)</li>
          <li>• Show police CCTV footage</li>
          <li>• Provide till reconciliation to show amount stolen</li>
          <li>• Give contact details for follow-up</li>
          <li>• Request case number and investigating officer details</li>
        </ul>

        <div className="bg-blue-100 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-blue-900 mb-2">Manager/Owner Responsibilities:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Notify head office/owner immediately</li>
            <li>• Contact insurance company (within 24 hours usually required)</li>
            <li>• Arrange trauma counseling for affected staff</li>
            <li>• Complete incident report</li>
            <li>• Decide if store closes for rest of day</li>
            <li>• Review security measures - what can be improved?</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">After-Effects & Support</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          Experiencing a robbery is traumatic. It's normal to feel scared, angry, anxious, or have trouble sleeping.
        </p>
        
        <h4 className="font-semibold text-purple-900 mb-3">Support Available:</h4>
        <ul className="space-y-2 text-gray-700">
          <li>• <strong>Immediate:</strong> On-site trauma counselor (if available)</li>
          <li>• <strong>Short-term:</strong> Time off work if needed</li>
          <li>• <strong>Ongoing:</strong> Professional counseling (covered by company/insurance)</li>
          <li>• <strong>EAP:</strong> Employee Assistance Program 24/7 hotline</li>
          <li>• <strong>Peer support:</strong> Talk to colleagues who've experienced it</li>
        </ul>

        <div className="bg-yellow-100 rounded-lg p-4 mt-4">
          <p className="font-semibold text-yellow-900 mb-2">Seek help if you experience:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Recurring nightmares or flashbacks</li>
            <li>• Severe anxiety or panic attacks</li>
            <li>• Unable to return to work</li>
            <li>• Depression or withdrawal</li>
            <li>• Physical symptoms (headaches, stomach issues)</li>
          </ul>
          <p className="text-sm text-yellow-800 mt-2">
            These are normal reactions, but professional help can speed recovery. Don't suffer in silence.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">Robbery Prevention Measures</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Store Design:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Clear visibility from outside (windows not obscured)</li>
            <li>• Good lighting inside and outside</li>
            <li>• CCTV signs prominently displayed</li>
            <li>• Security guard presence (if budget allows)</li>
            <li>• Safe visible from counter (shows limited cash access)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Cash Management:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Regular cash drops (keep minimal cash in tills)</li>
            <li>• Signs: "Limited cash on hand", "Time-lock safe"</li>
            <li>• Don't count large amounts of cash in view</li>
            <li>• Vary banking times and routes</li>
            <li>• Armed escort for large banking amounts</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const IncidentsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Security Incident Response</h2>
    
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Types of Security Incidents</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Major Incidents:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Armed robbery</li>
              <li>• Burglary/break-in</li>
              <li>• Assault (staff or customer)</li>
              <li>• Bomb threat</li>
              <li>• Hostage situation</li>
              <li>• Active shooter</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Minor Incidents:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Shoplifting (attempted/successful)</li>
              <li>• Verbal altercation</li>
              <li>• Trespassing</li>
              <li>• Vandalism</li>
              <li>• Suspicious person/activity</li>
              <li>• Lost/found items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Incident Reporting Procedure</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          <strong>ALL security incidents must be reported,</strong> no matter how minor. Unreported incidents 
          can't be prevented in future.
        </p>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Immediate Reporting (During/Right After):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li><strong>Major incidents:</strong> Call police (10111) and security company immediately</li>
              <li><strong>Minor incidents:</strong> Inform manager on duty right away</li>
              <li><strong>Ensure safety:</strong> Check for injuries, secure area</li>
              <li><strong>Preserve evidence:</strong> Don't touch/clean anything</li>
              <li><strong>Note details:</strong> Write down everything while fresh</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Formal Reporting (Within 24 Hours):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li><strong>Complete incident report form</strong> - Available from manager or in office</li>
              <li><strong>Include:</strong>
                <ul className="ml-6 mt-1 space-y-0.5">
                  <li>- Date, time, location of incident</li>
                  <li>- People involved (names, descriptions)</li>
                  <li>- Witnesses (names and contact info)</li>
                  <li>- Detailed description of what happened</li>
                  <li>- Actions taken</li>
                  <li>- Injuries or damages</li>
                  <li>- Police case number (if applicable)</li>
                  <li>- CCTV footage reference</li>
                </ul>
              </li>
              <li><strong>Sign and submit</strong> to manager</li>
              <li><strong>Copy to HR</strong> (manager forwards)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Contact Numbers</h3>
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3">External Emergency Services:</h4>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center justify-between py-2 border-b">
                <span className="font-semibold">Police:</span>
                <span className="text-red-600 font-bold text-lg">10111</span>
              </p>
              <p className="flex items-center justify-between py-2 border-b">
                <span className="font-semibold">Ambulance:</span>
                <span className="text-red-600 font-bold text-lg">10177</span>
              </p>
              <p className="flex items-center justify-between py-2 border-b">
                <span className="font-semibold">Fire:</span>
                <span className="text-red-600 font-bold text-lg">10177</span>
              </p>
              <p className="flex items-center justify-between py-2">
                <span className="font-semibold">General Emergency:</span>
                <span className="text-red-600 font-bold text-lg">112</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Company Security:</h4>
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center justify-between py-2 border-b">
                <span className="font-semibold">Armed Response:</span>
                <span className="text-blue-600 font-bold text-lg">082 123 4567</span>
              </p>
              <p className="flex items-center justify-between py-2 border-b">
                <span className="font-semibold">Store Manager:</span>
                <span className="text-blue-600 font-bold text-lg">072 640 8996</span>
              </p>
              <p className="flex items-center justify-between py-2 border-b">
                <span className="font-semibold">Area Manager:</span>
                <span className="text-blue-600 font-bold text-lg">083 XXX XXXX</span>
              </p>
              <p className="flex items-center justify-between py-2">
                <span className="font-semibold">Head Office Security:</span>
                <span className="text-blue-600 font-bold text-lg">015 XXX XXXX</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4 mt-4">
          <p className="font-semibold text-yellow-900 mb-2">📌 Keep These Numbers Handy:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Posted near every phone</li>
            <li>• Saved in your mobile phone</li>
            <li>• On your employee ID card</li>
            <li>• In your wallet for quick access</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Panic Button Locations & Use</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-3">Panic Button Locations:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Under each till counter</li>
              <li>• Behind dispensary counter</li>
              <li>• Manager's office desk</li>
              <li>• Staff room</li>
            </ul>
            <p className="text-xs text-orange-800 mt-3">
              On your first day, manager will show you all panic button locations. Test buttons monthly.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3">When to Press Panic Button:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Armed robbery in progress</li>
              <li>• Violent customer/intruder</li>
              <li>• Any life-threatening situation</li>
              <li>• Medical emergency (if phone unavailable)</li>
            </ul>
            <p className="text-xs text-red-800 mt-3">
              ⚠️ <strong>False alarms:</strong> If pressed accidentally, call security company immediately 
              to cancel response. Repeated false alarms may result in fines.
            </p>
          </div>
        </div>

        <div className="bg-red-100 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-red-900 mb-2">How Panic Button Works:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>1. Press button (usually needs 2-3 second hold to avoid accidental activation)</li>
            <li>2. Silent alarm sent to security company</li>
            <li>3. Armed response dispatched immediately</li>
            <li>4. Police automatically notified</li>
            <li>5. Do NOT announce you pressed it - robbers shouldn't know help is coming</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">Post-Incident Review</h3>
      <p className="text-gray-700 mb-4">
        After any security incident, management conducts a review to learn and improve:
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>• <strong>What happened:</strong> Timeline and facts</li>
        <li>• <strong>Why it happened:</strong> Root cause analysis</li>
        <li>• <strong>Response evaluation:</strong> What worked, what didn't</li>
        <li>• <strong>Lessons learned:</strong> What can we do better?</li>
        <li>• <strong>Action plan:</strong> Security improvements, training updates</li>
        <li>• <strong>Follow-up:</strong> Implement changes, monitor effectiveness</li>
      </ul>

      <div className="bg-white rounded-lg p-4 mt-4">
        <p className="font-semibold text-purple-900 mb-2">Staff Involvement:</p>
        <p className="text-sm text-gray-700">
          All staff involved in incidents are encouraged to participate in review meetings. Your 
          input helps improve security for everyone. No blame, just learning.
        </p>
      </div>
    </div>
  </div>
);

export default SecuritySOPView;