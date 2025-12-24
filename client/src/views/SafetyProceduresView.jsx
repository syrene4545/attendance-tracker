import React, { useState } from 'react';
import { 
  Shield,
  AlertTriangle,
  Flame,
  Heart,
  Phone,
  FileText,
  MapPin,
  Zap,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Activity,
  Eye,
  Droplet,
  Wind
} from 'lucide-react';

const SafetyProceduresView = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Safety Overview', icon: Shield },
    { id: 'emergency', label: 'Emergency Protocols', icon: AlertTriangle },
    { id: 'fire', label: 'Fire Safety', icon: Flame },
    { id: 'first-aid', label: 'First Aid', icon: Heart },
    { id: 'hazards', label: 'Hazard Management', icon: Zap },
    { id: 'evacuation', label: 'Evacuation Procedures', icon: MapPin },
    { id: 'incident', label: 'Incident Reporting', icon: FileText },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
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
          <h1 className="text-4xl font-bold mb-2">🚨 Safety Procedures</h1>
          <p className="text-xl text-red-100 mb-6">Protecting People, Preventing Incidents</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <div className="text-sm">Prevention First</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm">Quick Response</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm">Everyone's Responsibility</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm">Zero Incidents Goal</div>
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
            {activeSection === 'emergency' && <EmergencySection />}
            {activeSection === 'fire' && <FireSection />}
            {activeSection === 'first-aid' && <FirstAidSection />}
            {activeSection === 'hazards' && <HazardsSection />}
            {activeSection === 'evacuation' && <EvacuationSection />}
            {activeSection === 'incident' && <IncidentSection />}
            {activeSection === 'contacts' && <ContactsSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const OverviewSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Safety Overview</h2>
    
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">Our Commitment to Safety</h3>
      <p className="text-lg text-gray-800 mb-4">
        At Lera Health, safety is our top priority. We are committed to providing a safe and healthy 
        work environment for all employees, customers, and visitors. Every person has the right to 
        go home safe every day.
      </p>
      <p className="text-lg text-gray-800">
        This document outlines critical safety procedures and protocols. All employees must read, 
        understand, and follow these procedures at all times.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Core Safety Principles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Prevention First</h4>
              <p className="text-sm text-gray-700">
                Identify and eliminate hazards before incidents occur. Regular inspections and 
                maintenance are key.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-900 mb-1">Everyone's Responsibility</h4>
              <p className="text-sm text-gray-700">
                Safety is not just management's job. Every employee plays a vital role in 
                maintaining a safe workplace.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-yellow-900 mb-1">Report Immediately</h4>
              <p className="text-sm text-gray-700">
                Never ignore safety concerns. Report hazards, near-misses, and incidents 
                without delay.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-purple-900 mb-1">Continuous Improvement</h4>
              <p className="text-sm text-gray-700">
                Learn from incidents and near-misses. Update procedures and training based 
                on lessons learned.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Safety Responsibilities</h3>
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Follow all safety procedures</strong> and use equipment as trained
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Wear required PPE</strong> (Personal Protective Equipment) when specified
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Report hazards</strong> and unsafe conditions to your supervisor immediately
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Attend safety training</strong> and participate actively
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Keep work areas clean</strong> and organized to prevent accidents
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Never take shortcuts</strong> that compromise safety
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Ask questions</strong> if you're unsure about safe procedures
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
        <XCircle className="w-6 h-6" />
        Right to Refuse Unsafe Work
      </h3>
      <p className="text-gray-800 mb-3">
        <strong>You have the legal right to refuse work that you believe is unsafe.</strong> 
        If you believe a task or situation poses immediate danger:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-gray-800 ml-4">
        <li>Stop work immediately</li>
        <li>Notify your supervisor</li>
        <li>Explain your safety concerns</li>
        <li>Work together to resolve the issue</li>
        <li>Resume only when it's safe</li>
      </ol>
      <p className="text-sm text-red-800 mt-4 font-semibold">
        ⚠️ You will never be disciplined for refusing unsafe work in good faith.
      </p>
    </div>
  </div>
);

const EmergencySection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Emergency Protocols</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-red-900 mb-4 text-center">EMERGENCY NUMBERS</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 text-center">
          <Phone className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="font-bold text-gray-900">Emergency Services</p>
          <p className="text-3xl font-bold text-red-600">10177</p>
          <p className="text-sm text-gray-600">or dial 112</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <Phone className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="font-bold text-gray-900">Store Emergency</p>
          <p className="text-3xl font-bold text-orange-600">072 640 8996</p>
          <p className="text-sm text-gray-600">Manager on duty</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="font-bold text-gray-900">Security</p>
          <p className="text-3xl font-bold text-blue-600">082 123 4567</p>
          <p className="text-sm text-gray-600">Armed response</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Types of Emergencies</h3>
      <div className="space-y-4">
        {/* Medical Emergency */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <h4 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Medical Emergency
          </h4>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Immediate Actions:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4">
                <li>Ensure scene is safe before approaching</li>
                <li>Call emergency services (10177/112) immediately</li>
                <li>Notify store manager</li>
                <li>Provide first aid if trained (see First Aid section)</li>
                <li>Do NOT move injured person unless in immediate danger</li>
                <li>Stay with person until help arrives</li>
                <li>Document incident afterwards</li>
              </ol>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <p className="text-sm text-red-900">
                <strong>Critical:</strong> For cardiac arrest, choking, severe bleeding, or 
                unconsciousness - call 10177 FIRST, then start first aid.
              </p>
            </div>
          </div>
        </div>

        {/* Armed Robbery */}
        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
          <h4 className="text-xl font-bold text-orange-900 mb-3 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Armed Robbery / Threat
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-green-900 mb-2">✅ DO:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Stay calm and compliant</li>
                <li>• Follow all instructions</li>
                <li>• Observe details (height, clothing, weapons)</li>
                <li>• Press panic button if safe to do so</li>
                <li>• Protect lives, not property</li>
                <li>• Call police after robbers leave</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-900 mb-2">❌ DON'T:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Argue or resist</li>
                <li>• Make sudden movements</li>
                <li>• Stare directly at robbers</li>
                <li>• Chase or follow robbers</li>
                <li>• Touch anything after they leave</li>
                <li>• Allow customers to leave (witnesses)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bomb Threat */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
          <h4 className="text-xl font-bold text-yellow-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Bomb Threat
          </h4>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-900 mb-2">If threat received by phone:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4">
                <li>Stay calm, keep caller talking</li>
                <li>Note exact wording of threat</li>
                <li>Ask: Where is bomb? When will it explode? What does it look like?</li>
                <li>Listen for background noises, accent, caller's voice</li>
                <li>Notify manager immediately after call</li>
                <li>Call 10177</li>
                <li>Evacuate if instructed</li>
              </ol>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <p className="text-sm text-yellow-900">
                <strong>Remember:</strong> Do NOT use cell phones or radios - they can trigger 
                explosive devices. Use landline only.
              </p>
            </div>
          </div>
        </div>

        {/* Suspicious Package */}
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
          <h4 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Suspicious Package/Person
          </h4>
          <div>
            <p className="font-semibold text-gray-900 mb-2">Warning signs of suspicious package:</p>
            <ul className="space-y-1 text-gray-700 mb-3">
              <li>• No return address or strange return address</li>
              <li>• Excessive postage or incorrect postage</li>
              <li>• Ticking sounds, unusual odors</li>
              <li>• Oily stains, discoloration, crystallization</li>
              <li>• Protruding wires or foil</li>
              <li>• Excessive weight or uneven weight distribution</li>
            </ul>
            <p className="font-semibold text-red-900">If suspicious package found:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4 mt-2">
              <li>DO NOT TOUCH OR MOVE IT</li>
              <li>Clear the area (at least 100m radius)</li>
              <li>Call 10177 immediately</li>
              <li>Notify manager</li>
              <li>Evacuate if instructed</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">Emergency Communication</h3>
      <div className="space-y-2 text-gray-700">
        <p><strong>When calling emergency services, provide:</strong></p>
        <ul className="space-y-1 ml-6">
          <li>• Your name and callback number</li>
          <li>• Exact location: Lera Health, [full address]</li>
          <li>• Nature of emergency</li>
          <li>• Number of people involved/injured</li>
          <li>• Any hazards or special circumstances</li>
          <li>• Stay on the line until instructed to hang up</li>
        </ul>
      </div>
    </div>
  </div>
);

const FireSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Fire Safety Procedures</h2>
    
    <div className="bg-gradient-to-r from-red-400 to-orange-400 text-white rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-3 text-center">🔥 IN CASE OF FIRE 🔥</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
          <div className="text-4xl mb-2">1</div>
          <p className="font-bold">RAISE ALARM</p>
          <p className="text-sm">Shout "FIRE!"</p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
          <div className="text-4xl mb-2">2</div>
          <p className="font-bold">CALL 10177</p>
          <p className="text-sm">Fire Department</p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
          <div className="text-4xl mb-2">3</div>
          <p className="font-bold">EVACUATE</p>
          <p className="text-sm">Use nearest exit</p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
          <div className="text-4xl mb-2">4</div>
          <p className="font-bold">ASSEMBLY</p>
          <p className="text-sm">Meet at assembly point</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Fire Prevention</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Fire Prevention DO's
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ Keep fire exits clear at all times</li>
            <li>✅ Store flammable materials properly</li>
            <li>✅ Report electrical faults immediately</li>
            <li>✅ Keep work areas clean and tidy</li>
            <li>✅ Know location of fire extinguishers</li>
            <li>✅ Attend fire drills seriously</li>
            <li>✅ Turn off electrical equipment when not in use</li>
          </ul>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Fire Prevention DON'Ts
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>❌ Block fire exits or fire equipment</li>
            <li>❌ Overload electrical sockets</li>
            <li>❌ Use damaged electrical equipment</li>
            <li>❌ Smoke in unauthorized areas</li>
            <li>❌ Store cardboard near heat sources</li>
            <li>❌ Ignore fire alarm tests</li>
            <li>❌ Wedge fire doors open</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Using a Fire Extinguisher: PASS Method</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <p className="text-orange-900 mb-4 font-semibold">
          ⚠️ Only fight fires if: (1) Fire alarm has been raised, (2) Fire brigade has been called, 
          (3) Fire is small and contained, (4) You have a safe escape route
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-600 mb-2">P</div>
            <p className="font-bold text-gray-900 mb-1">PULL</p>
            <p className="text-sm text-gray-700">Pull the pin to break the seal</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-600 mb-2">A</div>
            <p className="font-bold text-gray-900 mb-1">AIM</p>
            <p className="text-sm text-gray-700">Aim low at the base of the fire</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-600 mb-2">S</div>
            <p className="font-bold text-gray-900 mb-1">SQUEEZE</p>
            <p className="text-sm text-gray-700">Squeeze the handle to discharge</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-600 mb-2">S</div>
            <p className="font-bold text-gray-900 mb-1">SWEEP</p>
            <p className="text-sm text-gray-700">Sweep side to side at base</p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Types of Fire Extinguishers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">💧 Water (Red)</h4>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Use on:</strong> Paper, wood, textiles (Class A fires)
          </p>
          <p className="text-sm text-red-700">
            <strong>DO NOT use on:</strong> Electrical or oil fires
          </p>
        </div>

        <div className="bg-gray-50 border-l-4 border-gray-500 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-2">☁️ CO2 (Black)</h4>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Use on:</strong> Electrical equipment, flammable liquids
          </p>
          <p className="text-sm text-green-700">
            <strong>Safe for:</strong> Computer equipment
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <h4 className="font-bold text-yellow-900 mb-2">🌫️ Foam (Cream)</h4>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Use on:</strong> Flammable liquids, Class A fires
          </p>
          <p className="text-sm text-red-700">
            <strong>DO NOT use on:</strong> Electrical fires
          </p>
        </div>

        <div className="bg-pink-50 border-l-4 border-pink-500 rounded-lg p-4">
          <h4 className="font-bold text-pink-900 mb-2">🧯 Powder (Blue)</h4>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Use on:</strong> Most fire types (multi-purpose)
          </p>
          <p className="text-sm text-yellow-700">
            <strong>Caution:</strong> Reduces visibility
          </p>
        </div>
      </div>
    </div>

    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">Fire Safety Equipment Locations</h3>
      <div className="space-y-2 text-gray-700">
        <p>• <strong>Fire Extinguishers:</strong> Behind dispensary counter, storage room entrance, staff room</p>
        <p>• <strong>Fire Blanket:</strong> Staff kitchen area</p>
        <p>• <strong>Fire Alarm:</strong> Main entrance, back corridor, staff room</p>
        <p>• <strong>Emergency Exits:</strong> Front entrance, back door (always keep clear)</p>
        <p>• <strong>Assembly Point:</strong> Parking lot, far corner away from building</p>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Fire Drills</h3>
      <p className="text-gray-700 mb-3">
        Fire drills are conducted quarterly to ensure everyone knows evacuation procedures.
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>• Treat every drill as a real emergency</li>
        <li>• Follow evacuation procedures exactly</li>
        <li>• Report to assembly point</li>
        <li>• Wait for all-clear from fire marshal</li>
        <li>• Attendance is mandatory</li>
      </ul>
    </div>
  </div>
);

const FirstAidSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">First Aid Procedures</h2>
    
    <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-900 mb-3">First Aid Kit Locations</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 text-center">
          <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-bold">Main Kit</p>
          <p className="text-sm text-gray-700">Behind dispensary counter</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-bold">Secondary Kit</p>
          <p className="text-sm text-gray-700">Staff room wall</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-bold">Vehicle Kit</p>
          <p className="text-sm text-gray-700">Delivery vehicle</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Primary Survey: DR ABC</h3>
      <div className="space-y-3">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="font-bold text-red-900 mb-2">D - DANGER</p>
          <p className="text-sm text-gray-700">Check for danger to yourself, bystanders, and casualty</p>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <p className="font-bold text-orange-900 mb-2">R - RESPONSE</p>
          <p className="text-sm text-gray-700">Check if person is conscious: "Are you okay?" Tap shoulders gently</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <p className="font-bold text-yellow-900 mb-2">A - AIRWAY</p>
          <p className="text-sm text-gray-700">Open airway: Tilt head back, lift chin. Check for obstructions</p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <p className="font-bold text-blue-900 mb-2">B - BREATHING</p>
          <p className="text-sm text-gray-700">Look, listen, feel for breathing for up to 10 seconds</p>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
          <p className="font-bold text-purple-900 mb-2">C - CIRCULATION</p>
          <p className="text-sm text-gray-700">Check for pulse. Look for severe bleeding</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Common Emergencies</h3>
      <div className="space-y-4">
        {/* Severe Bleeding */}
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <Droplet className="w-5 h-5" />
            Severe Bleeding
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
            <li>Put on gloves if available</li>
            <li>Apply direct pressure with clean cloth</li>
            <li>Elevate injured limb above heart (if possible)</li>
            <li>If bleeding continues, apply pressure to pressure point</li>
            <li>Do NOT remove cloth if blood soaks through - add more on top</li>
            <li>Call 10177 for severe bleeding</li>
            <li>Treat for shock - keep person warm, lying down</li>
          </ol>
        </div>

        {/* Choking */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Wind className="w-5 h-5" />
            Choking (Conscious Adult)
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Signs:</strong> Cannot speak, coughing weakly, clutching throat, turning blue</p>
            <p><strong>Action:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Encourage coughing if person can</li>
              <li>If not working: 5 back blows between shoulder blades</li>
              <li>If still choking: 5 abdominal thrusts (Heimlich maneuver)</li>
              <li>Alternate between back blows and abdominal thrusts</li>
              <li>Call 10177 if object not dislodged after 3 cycles</li>
              <li>Continue until object comes out or person becomes unconscious</li>
            </ol>
          </div>
        </div>

        {/* Burns */}
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
          <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Burns & Scalds
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
            <li>Remove person from heat source</li>
            <li>Cool burn with running water for 20 minutes minimum</li>
            <li>Remove jewelry/tight clothing before swelling starts</li>
            <li>Cover with cling film or clean cloth (do not wrap tightly)</li>
            <li>Do NOT apply ice, creams, or ointments</li>
            <li>Do NOT break blisters</li>
            <li>Call 10177 for: burns larger than palm, chemical burns, electrical burns, burns to face/hands/feet/genitals</li>
          </ol>
        </div>

        {/* Seizures */}
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
          <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Seizures
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-green-900 mb-2">✅ DO:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Protect from injury</li>
                <li>• Cushion head</li>
                <li>• Time the seizure</li>
                <li>• Turn on side after seizure stops</li>
                <li>• Stay with person</li>
                <li>• Reassure person as they recover</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-900 mb-2">❌ DON'T:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Restrain the person</li>
                <li>• Put anything in mouth</li>
                <li>• Give food/drink until fully conscious</li>
                <li>• Leave person alone</li>
              </ul>
            </div>
          </div>

          <p className="text-sm text-red-700 mt-3">
            <strong>Call 10177 if:</strong> Seizure lasts &gt;5 minutes, person has multiple seizures,
            person is injured, or this is their first seizure.
          </p>

          {/* <p className="text-sm text-red-700 mt-3">
            <strong>Call 10177 if:</strong> Seizure lasts >5 minutes, person has multiple seizures, 
            person is injured, or this is their first seizure.
          </p> */}
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Designated First Aiders</h3>
      <p className="text-gray-700 mb-3">
        The following staff members are trained first aiders:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3">
          <p className="font-semibold text-gray-900">[Irene] - Pharmacist</p>
          <p className="text-sm text-gray-700">Certified: First Aid Level 2</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="font-semibold text-gray-900">[Solly] - Store Manager</p>
          <p className="text-sm text-gray-700">Certified: First Aid Level 1</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3">
        First aid certificates are displayed near first aid kits. Training is renewed annually.
      </p>
    </div>
  </div>
);

const HazardsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Hazard Management</h2>
    
    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-orange-900 mb-3">Common Workplace Hazards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Physical Hazards:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Slips, trips, and falls</li>
            <li>• Manual handling injuries</li>
            <li>• Electrical hazards</li>
            <li>• Sharp objects</li>
            <li>• Poor lighting</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Chemical Hazards:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Cleaning chemicals</li>
            <li>• Medication spills</li>
            <li>• Cytotoxic medications</li>
            <li>• Aerosols</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Manual Handling (Lifting)</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 mb-3">SAFE LIFTING: TILE Method</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-blue-900 mb-2">T - THINK</p>
            <p className="text-sm text-gray-700">Plan the lift. Where are you going? Do you need help?</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-blue-900 mb-2">I - INSPECT</p>
            <p className="text-sm text-gray-700">Check the load. Is it too heavy? Any sharp edges?</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-blue-900 mb-2">L - LIFT</p>
            <p className="text-sm text-gray-700">Use proper technique. Bend knees, straight back.</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-blue-900 mb-2">E - EVALUATE</p>
            <p className="text-sm text-gray-700">Can you handle it? If not, get help or use equipment.</p>
          </div>
        </div>
        <div className="mt-4 bg-blue-100 rounded-lg p-4">
          <p className="font-semibold text-blue-900 mb-2">Proper Lifting Technique:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
            <li>Stand close to load</li>
            <li>Feet shoulder-width apart</li>
            <li>Bend knees, keep back straight</li>
            <li>Get firm grip</li>
            <li>Lift with legs, not back</li>
            <li>Keep load close to body</li>
            <li>Don't twist - move feet to turn</li>
            <li>Lower using same technique</li>
          </ol>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Chemical Safety</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">Before Using Chemicals:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Read Safety Data Sheet (SDS)</li>
              <li>✅ Check label for hazard symbols</li>
              <li>✅ Wear required PPE</li>
              <li>✅ Ensure adequate ventilation</li>
              <li>✅ Have spill kit nearby</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">Chemical Storage:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Store in original containers</li>
              <li>✅ Keep labels intact and legible</li>
              <li>✅ Store incompatible chemicals separately</li>
              <li>✅ Keep away from heat/ignition sources</li>
              <li>✅ Lock hazardous chemicals</li>
            </ul>
          </div>
        </div>
        <div className="bg-red-100 rounded-lg p-4">
          <h4 className="font-bold text-red-900 mb-2">Chemical Spill Procedure:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-red-800 ml-4">
            <li>Alert others in area</li>
            <li>Evacuate area if large spill or toxic</li>
            <li>Put on PPE (gloves, goggles, mask if needed)</li>
            <li>Contain spill if safe to do so</li>
            <li>Use spill kit to clean up</li>
            <li>Dispose of waste properly</li>
            <li>Report to supervisor</li>
            <li>Complete incident report</li>
          </ol>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Electrical Safety</h3>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-900 mb-2">✅ Safe Practices:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Inspect cords before use</li>
              <li>• Keep electrical items away from water</li>
              <li>• Don't overload sockets</li>
              <li>• Switch off before unplugging</li>
              <li>• Report damaged equipment</li>
              <li>• Use approved extension cords only</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-900 mb-2">❌ Never:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use damaged electrical items</li>
              <li>• Touch with wet hands</li>
              <li>• Attempt repairs yourself</li>
              <li>• Run cords under rugs</li>
              <li>• Remove ground pins from plugs</li>
              <li>• Use appliances near flammables</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 bg-red-100 rounded-lg p-4">
          <p className="font-bold text-red-900 mb-2">Electrical Emergency:</p>
          <p className="text-sm text-red-800 mb-2">
            If someone receives an electric shock:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-red-800 ml-4">
            <li>DO NOT touch the person</li>
            <li>Switch off power at source if safe</li>
            <li>If cannot switch off, use non-conductive object to separate person from source</li>
            <li>Call 10177 immediately</li>
            <li>Check breathing and circulation</li>
            <li>Begin CPR if needed and trained</li>
          </ol>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Slip, Trip, and Fall Prevention</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-green-900 mb-2">Prevention Measures:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Clean up spills immediately</li>
              <li>• Use "Wet Floor" signs</li>
              <li>• Keep walkways clear of obstacles</li>
              <li>• Ensure adequate lighting</li>
              <li>• Repair damaged flooring promptly</li>
              <li>• Wear appropriate footwear</li>
              <li>• Use handrails on stairs</li>
              <li>• Don't run in the workplace</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">If You Fall:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
              <li>Stay still for a moment - assess if you're injured</li>
              <li>Call for help if needed</li>
              <li>Get up slowly if uninjured</li>
              <li>Report the incident immediately</li>
              <li>Seek medical attention even for minor injuries</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EvacuationSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Evacuation Procedures</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-red-900 mb-4 text-center">EVACUATION PROCEDURE</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">1</div>
          <p className="font-bold text-sm">ALARM</p>
          <p className="text-xs text-gray-700">Sound the alarm</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">2</div>
          <p className="font-bold text-sm">ALERT</p>
          <p className="text-xs text-gray-700">Alert others nearby</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">3</div>
          <p className="font-bold text-sm">EVACUATE</p>
          <p className="text-xs text-gray-700">Leave immediately</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
          <p className="font-bold text-sm">ASSIST</p>
          <p className="text-xs text-gray-700">Help those who need it</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">5</div>
          <p className="font-bold text-sm">ASSEMBLY</p>
          <p className="text-xs text-gray-700">Go to meeting point</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">During Evacuation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            DO
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ Stay calm</li>
            <li>✅ Walk, don't run</li>
            <li>✅ Use nearest safe exit</li>
            <li>✅ Close doors behind you</li>
            <li>✅ Help those who need assistance</li>
            <li>✅ Follow fire warden instructions</li>
            <li>✅ Go directly to assembly point</li>
            <li>✅ Report to fire warden for roll call</li>
            <li>✅ Wait for all-clear</li>
          </ul>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            DON'T
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>❌ Use elevators/lifts</li>
            <li>❌ Return for personal belongings</li>
            <li>❌ Stop to make phone calls</li>
            <li>❌ Panic or run</li>
            <li>❌ Block exits</li>
            <li>❌ Re-enter building without permission</li>
            <li>❌ Leave assembly area</li>
            <li>❌ Ignore fire warden instructions</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Assembly Point</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="flex items-start gap-4 mb-4">
          <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-blue-900 text-lg mb-2">
              Primary Assembly Point: Parking Lot (Far Corner)
            </p>
            <p className="text-gray-700 mb-2">
              Located at the far end of the parking lot, away from the building entrance.
              Look for the green "Assembly Point" sign.
            </p>
            <p className="font-semibold text-blue-900 mb-1">At the Assembly Point:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Report to your department fire warden</li>
              <li>• Remain until roll call is complete</li>
              <li>• Report any missing persons immediately</li>
              <li>• Stay together as a team</li>
              <li>• Do not leave without permission</li>
            </ul>
          </div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4">
          <p className="font-semibold text-yellow-900 mb-2">
            Alternative Assembly Point (if primary blocked):
          </p>
          <p className="text-sm text-gray-700">
            Across the street at [specific location]. Fire warden will direct you if needed.
          </p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Fire Wardens & Responsibilities</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-purple-900 mb-2">Chief Fire Warden:</p>
            <p className="text-gray-900">[Name] - Store Manager</p>
            <p className="text-sm text-gray-700 mt-2">
              Overall coordination, liaison with emergency services
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-purple-900 mb-2">Deputy Fire Warden:</p>
            <p className="text-gray-900">[Name] - Assistant Manager</p>
            <p className="text-sm text-gray-700 mt-2">
              Support chief, conduct roll call
            </p>
          </div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4">
          <p className="font-semibold text-purple-900 mb-2">Fire Warden Responsibilities:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Ensure alarm is raised</li>
            <li>• Guide evacuation</li>
            <li>• Check all areas (offices, bathrooms, storage)</li>
            <li>• Assist persons with disabilities</li>
            <li>• Conduct roll call at assembly point</li>
            <li>• Report to emergency services</li>
            <li>• Authorize re-entry only when cleared</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Evacuation Routes</h3>
      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
        <p className="font-semibold text-gray-900 mb-3">
          Evacuation route maps are posted:
        </p>
        <ul className="text-gray-700 space-y-2 mb-4">
          <li>• Near all exit doors</li>
          <li>• In staff room</li>
          <li>• Behind dispensary counter</li>
          <li>• Near fire extinguishers</li>
        </ul>
        <div className="bg-yellow-100 rounded-lg p-4">
          <p className="font-semibold text-yellow-900 mb-2">Know Your Exits:</p>
          <p className="text-sm text-gray-700">
            On your first day, walk the evacuation routes from your work area to all emergency 
            exits. Know at least 2 routes from every location you work.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-orange-900 mb-3">Special Considerations</h3>
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-gray-900 mb-1">Persons with Disabilities:</p>
          <p className="text-sm text-gray-700">
            If you require assistance during evacuation, inform your manager and fire warden. 
            A buddy system will be arranged. Never use elevators during evacuation.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">After Hours:</p>
          <p className="text-sm text-gray-700">
            If working after hours or weekends, ensure at least one fire warden is present. 
            Know alternative exits and assembly points.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-1">Customers:</p>
          <p className="text-sm text-gray-700">
            Guide customers calmly to exits. Don't let them stop for belongings. Ensure they 
            proceed to assembly area.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const IncidentSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Incident Reporting</h2>
    
    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">Why Report Incidents?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4">
          <div className="text-3xl mb-2">🛡️</div>
          <p className="font-bold text-gray-900 mb-1">Prevention</p>
          <p className="text-sm text-gray-700">Learn from incidents to prevent future occurrences</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="text-3xl mb-2">⚖️</div>
          <p className="font-bold text-gray-900 mb-1">Legal</p>
          <p className="text-sm text-gray-700">Meet legal and insurance requirements</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="text-3xl mb-2">📊</div>
          <p className="font-bold text-gray-900 mb-1">Analysis</p>
          <p className="text-sm text-gray-700">Identify trends and hazard patterns</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">What to Report</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h4 className="font-bold text-red-900 mb-3">Incidents (Must Report)</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Injuries (no matter how minor)</li>
            <li>• Accidents causing property damage</li>
            <li>• Occupational illnesses</li>
            <li>• Dangerous occurrences</li>
            <li>• Security incidents</li>
            <li>• Customer injuries on premises</li>
            <li>• Medication errors</li>
            <li>• Theft or robbery</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <h4 className="font-bold text-yellow-900 mb-3">Near Misses (Should Report)</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Situations that could have caused injury</li>
            <li>• Safety hazards observed</li>
            <li>• Equipment malfunctions</li>
            <li>• Unsafe acts or conditions</li>
            <li>• Close calls with customers</li>
            <li>• Potential security breaches</li>
          </ul>
          <p className="text-xs text-yellow-800 mt-2">
            Near-miss reporting helps prevent actual incidents!
          </p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Incident Reporting Process</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Immediate Response</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ensure scene is safe</li>
                <li>• Provide first aid if needed</li>
                <li>• Call emergency services if required</li>
                <li>• Notify supervisor immediately</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Preserve Evidence</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Don't move anything unless necessary for safety</li>
                <li>• Take photos if safe to do so</li>
                <li>• Collect names of witnesses</li>
                <li>• Note time, date, and conditions</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Complete Incident Report</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Fill out report within 24 hours</li>
                <li>• Include all relevant details</li>
                <li>• Be factual, not opinion-based</li>
                <li>• Submit to supervisor and HR</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Investigation & Follow-up</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Management investigates incident</li>
                <li>• Root cause analysis conducted</li>
                <li>• Corrective actions implemented</li>
                <li>• Communicate lessons learned</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Incident Report Form</h3>
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          Incident report forms are available:
        </p>
        <ul className="text-gray-700 space-y-2 mb-4">
          <li>• In the staff room (printed forms)</li>
          <li>• On the employee portal (digital forms)</li>
          <li>• From your supervisor or HR</li>
        </ul>
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-2">Information to Include:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <ul className="space-y-1">
                <li>✓ Date, time, location</li>
                <li>✓ People involved</li>
                <li>✓ Type of incident</li>
                <li>✓ What happened (detailed description)</li>
                <li>✓ Contributing factors</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-1">
                <li>✓ Injuries sustained</li>
                <li>✓ First aid provided</li>
                <li>✓ Witnesses</li>
                <li>✓ Property damage</li>
                <li>✓ Immediate actions taken</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">No Blame Culture</h3>
      <p className="text-gray-700 mb-3">
        Lera Health operates a "no-blame" incident reporting culture. The purpose of incident 
        reporting is to learn and improve, not to punish.
      </p>
      <div className="bg-white rounded-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">This means:</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ You will not be disciplined for honest reporting</li>
          <li>✓ Focus is on system improvements, not individual blame</li>
          <li>✓ We encourage reporting of near-misses and concerns</li>
          <li>✓ Your input helps make the workplace safer for everyone</li>
        </ul>
      </div>
      <p className="text-sm text-purple-800 mt-3">
        <strong>Note:</strong> This does not apply to incidents resulting from intentional 
        misconduct, gross negligence, or violation of safety procedures.
      </p>
    </div>

    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-orange-900 mb-3">Reporting Timelines</h3>
      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between items-center py-2 border-b border-orange-200">
          <span><strong>Serious injury/fatality:</strong></span>
          <span className="font-bold text-red-600">Immediately</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-orange-200">
          <span><strong>Medical treatment required:</strong></span>
          <span className="font-bold text-orange-600">Within 1 hour</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-orange-200">
          <span><strong>Minor injury/property damage:</strong></span>
          <span className="font-bold text-yellow-600">Within 24 hours</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span><strong>Near miss:</strong></span>
          <span className="font-bold text-green-600">Within 48 hours</span>
        </div>
      </div>
    </div>
  </div>
);

const ContactsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Emergency Contacts</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-red-900 mb-4 text-center">🚨 EMERGENCY SERVICES 🚨</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 text-center">
          <Phone className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 mb-1">General Emergency</p>
          <p className="text-4xl font-bold text-red-600 mb-2">10177</p>
          <p className="text-sm text-gray-600">or mobile 112</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center">
          <Phone className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 mb-1">Police</p>
          <p className="text-4xl font-bold text-blue-600 mb-2">10111</p>
          <p className="text-sm text-gray-600">Crime emergencies</p>
        </div>
        <div className="bg-white rounded-lg p-6 text-center">
          <Phone className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 mb-1">Ambulance</p>
          <p className="text-4xl font-bold text-green-600 mb-2">10177</p>
          <p className="text-sm text-gray-600">Medical emergencies</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Store Emergency Contacts</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Store Manager</p>
            <p className="text-gray-700">[Solly]</p>
            <p className="text-blue-600 font-semibold">072 640 8996</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Assistant Manager</p>
            <p className="text-gray-700">[Name]</p>
            <p className="text-blue-600 font-semibold">072 394 4922</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Pharmacist on Duty</p>
            <p className="text-gray-700">Check staff board</p>
            <p className="text-blue-600 font-semibold">Store main: 015 297 0088</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-900 mb-4">Company Contacts</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">HR Department</p>
            <p className="text-green-600 font-semibold">lerahealthplk@gmail.com</p>
            <p className="text-gray-700">015 123 4567</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Health & Safety Officer</p>
            <p className="text-green-600 font-semibold">lerahealthplk@gmail.com</p>
            <p className="text-gray-700">015 789 0123</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Security Company</p>
            <p className="text-gray-700">[Security Company]</p>
            <p className="text-green-600 font-semibold">082 123 4567</p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple-900 mb-4">Utility Services</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Electricity (Eskom)</p>
            <p className="text-purple-600 font-semibold">0860 037 566</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Water (Municipal)</p>
            <p className="text-purple-600 font-semibold">015 </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Building Maintenance</p>
            <p className="text-purple-600 font-semibold">082 </p>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-orange-900 mb-4">Medical Services</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Nearest Hospital</p>
            <p className="text-gray-700">Polokwane Provincial Hospital</p>
            <p className="text-orange-600 font-semibold">015 287 5000</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">Poison Information</p>
            <p className="text-orange-600 font-semibold">0861 555 777</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900">EAP Helpline</p>
            <p className="text-gray-700">24/7 Support</p>
            <p className="text-orange-600 font-semibold">0800 123 4567</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Emergency Contact Information Card</h3>
      <p className="text-gray-700 mb-4">
        A wallet-sized emergency contact card is available from HR. This card includes:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
        <ul className="space-y-1">
          <li>✓ Emergency services numbers</li>
          <li>✓ Store manager contact</li>
          <li>✓ HR emergency line</li>
          <li>✓ Nearest hospital</li>
        </ul>
        <ul className="space-y-1">
          <li>✓ Security company</li>
          <li>✓ Poison information</li>
          <li>✓ Your emergency contact</li>
          <li>✓ Medical aid details</li>
        </ul>
      </div>
      <p className="text-sm text-yellow-800 mt-3">
        📋 Collect your card from HR and keep it with you at all times.
      </p>
    </div>

    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-3">Your Personal Emergency Contacts</h3>
      <p className="text-gray-700 mb-4">
        Please ensure HR has your up-to-date emergency contact information:
      </p>
      <div className="bg-white rounded-lg p-4">
        <div className="space-y-3 text-gray-700">
          <div>
            <p className="font-semibold">Primary Contact:</p>
            <p className="text-sm">Name: __________________ Relationship: __________________</p>
            <p className="text-sm">Phone: __________________</p>
          </div>
          <div>
            <p className="font-semibold">Secondary Contact:</p>
            <p className="text-sm">Name: __________________ Relationship: __________________</p>
            <p className="text-sm">Phone: __________________</p>
          </div>
          <div>
            <p className="font-semibold">Medical Aid:</p>
            <p className="text-sm">Scheme: __________________ Member No: __________________</p>
          </div>
          <div>
            <p className="font-semibold">Allergies/Medical Conditions:</p>
            <p className="text-sm">__________________________________________________</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-red-700 mt-3">
        ⚠️ Update this information with HR immediately if it changes!
      </p>
    </div>
  </div>
);

export default SafetyProceduresView;