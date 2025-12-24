import React, { useState } from 'react';
import { 
  Heart,
  Users,
  Shield,
  DollarSign,
  Briefcase,
  Phone,
  Award,
  Coffee,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Gift,
  Umbrella,
  TrendingUp
} from 'lucide-react';

const EmployeeHandbookView = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('welcome');

  const sections = [
    { id: 'welcome', label: 'Welcome', icon: Heart },
    { id: 'culture', label: 'Our Culture & Values', icon: Users },
    { id: 'code-of-conduct', label: 'Code of Conduct', icon: Shield },
    { id: 'benefits', label: 'Benefits & Perks', icon: Gift },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'development', label: 'Career Development', icon: TrendingUp },
    { id: 'workplace', label: 'Workplace Policies', icon: Briefcase },
    { id: 'contacts', label: 'Important Contacts', icon: Phone },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 text-white">
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
          <h1 className="text-4xl font-bold mb-2">📖 Employee Handbook</h1>
          <p className="text-xl text-green-100 mb-6">Welcome to the Lera Health Family</p>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-lg">
              This handbook contains important information about your employment with Lera Health. 
              Please read it carefully and keep it for future reference.
            </p>
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
                      ? 'bg-green-100 text-green-700'
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
            {activeSection === 'welcome' && <WelcomeSection />}
            {activeSection === 'culture' && <CultureSection />}
            {activeSection === 'code-of-conduct' && <CodeOfConductSection />}
            {activeSection === 'benefits' && <BenefitsSection />}
            {activeSection === 'compensation' && <CompensationSection />}
            {activeSection === 'development' && <DevelopmentSection />}
            {activeSection === 'workplace' && <WorkplaceSection />}
            {activeSection === 'contacts' && <ContactsSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const WelcomeSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Welcome to Lera Health! 🎉</h2>
    
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
      <p className="text-lg text-gray-800 mb-4">
        Congratulations on joining the Lera Health family! We are thrilled to have you as part of our team. 
        At Lera Health, we are committed to improving the health and wellness of our communities, and you play 
        a vital role in achieving this mission.
      </p>
      <p className="text-lg text-gray-800">
        This handbook is designed to help you understand our company, your role, and the resources available 
        to support your success and growth with us.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <p className="text-xl text-blue-900 font-semibold italic mb-3">
          "To provide accessible, affordable, and quality healthcare products and services to communities 
          throughout South Africa."
        </p>
        <p className="text-gray-700">
          Every day, we work to make healthcare more accessible and to improve the lives of the people we serve.
        </p>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
      <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
        <p className="text-xl text-purple-900 font-semibold italic mb-3">
          "To be the most trusted community healthcare provider in South Africa."
        </p>
        <p className="text-gray-700">
          We envision a future where every person has access to the healthcare they need to live healthy, 
          fulfilling lives.
        </p>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">What Makes Us Special</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-green-200 rounded-lg p-4">
          <div className="text-3xl mb-2">🤝</div>
          <h4 className="font-bold text-gray-900 mb-2">Community-Focused</h4>
          <p className="text-gray-700 text-sm">We're not just a pharmacy; we're part of the community we serve.</p>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
          <div className="text-3xl mb-2">💡</div>
          <h4 className="font-bold text-gray-900 mb-2">Expert Knowledge</h4>
          <p className="text-gray-700 text-sm">Our team provides trusted health advice and personalized care.</p>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
          <div className="text-3xl mb-2">❤️</div>
          <h4 className="font-bold text-gray-900 mb-2">Compassionate Care</h4>
          <p className="text-gray-700 text-sm">We treat every customer with respect, dignity, and kindness.</p>
        </div>

        <div className="bg-white border-2 border-orange-200 rounded-lg p-4">
          <div className="text-3xl mb-2">🌟</div>
          <h4 className="font-bold text-gray-900 mb-2">Excellence</h4>
          <p className="text-gray-700 text-sm">We continuously strive to improve and deliver the best service.</p>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Your First 90 Days</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Days 1-30:</strong> Learn our systems, products, and procedures. Get to know your team.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Days 31-60:</strong> Build confidence in customer interactions. Start working independently.
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Days 61-90:</strong> Take ownership of your role. Set performance goals with your manager.
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CultureSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Our Culture & Core Values</h2>
    
    <p className="text-lg text-gray-700">
      Our culture is built on five core values that guide everything we do. These values define who we are 
      and how we work together to serve our customers and communities.
    </p>

    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
            1
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Integrity</h3>
            <p className="text-gray-700 mb-3">
              We do what's right, even when no one is watching. We are honest, ethical, and transparent 
              in all our dealings.
            </p>
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>In Practice:</strong> Always be truthful with customers about products. Never make 
                promises we can't keep. Admit mistakes and fix them promptly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
            2
          </div>
          <div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Customer First</h3>
            <p className="text-gray-700 mb-3">
              Our customers are at the heart of everything we do. We go above and beyond to meet their 
              needs and exceed their expectations.
            </p>
            <div className="bg-green-100 rounded-lg p-3">
              <p className="text-sm text-green-900">
                <strong>In Practice:</strong> Greet every customer warmly. Listen to their concerns. 
                Provide personalized recommendations. Follow up when needed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
            3
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">Teamwork</h3>
            <p className="text-gray-700 mb-3">
              We succeed together. We support each other, share knowledge, and collaborate to achieve 
              our common goals.
            </p>
            <div className="bg-purple-100 rounded-lg p-3">
              <p className="text-sm text-purple-900">
                <strong>In Practice:</strong> Help colleagues during busy times. Share tips and best practices. 
                Celebrate team achievements. Communicate openly and respectfully.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
            4
          </div>
          <div>
            <h3 className="text-xl font-bold text-orange-900 mb-2">Excellence</h3>
            <p className="text-gray-700 mb-3">
              We strive for excellence in everything we do. We continuously learn, improve, and raise 
              the bar for ourselves and our industry.
            </p>
            <div className="bg-orange-100 rounded-lg p-3">
              <p className="text-sm text-orange-900">
                <strong>In Practice:</strong> Stay current with product knowledge. Seek feedback and act on it. 
                Look for ways to improve processes. Take pride in your work.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
            5
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Community Impact</h3>
            <p className="text-gray-700 mb-3">
              We are committed to making a positive difference in the communities we serve. We give back 
              and contribute to the wellbeing of society.
            </p>
            <div className="bg-red-100 rounded-lg p-3">
              <p className="text-sm text-red-900">
                <strong>In Practice:</strong> Participate in community health initiatives. Support local causes. 
                Educate customers about health and wellness. Be a positive presence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-3 text-center">Our Promise to You</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <CheckCircle className="w-8 h-8 mb-2" />
          <p className="font-semibold">Respect & Dignity</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <CheckCircle className="w-8 h-8 mb-2" />
          <p className="font-semibold">Growth Opportunities</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <CheckCircle className="w-8 h-8 mb-2" />
          <p className="font-semibold">Fair Compensation</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <CheckCircle className="w-8 h-8 mb-2" />
          <p className="font-semibold">Safe Workplace</p>
        </div>
      </div>
    </div>
  </div>
);

const CodeOfConductSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Code of Conduct</h2>
    
    <p className="text-lg text-gray-700">
      Our Code of Conduct outlines the standards of behavior expected from all Lera Health employees. 
      These guidelines ensure a professional, respectful, and productive work environment.
    </p>

    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-900 mb-4">✅ Expected Behaviors</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Professional Appearance:</strong> Dress appropriately, wear name badge, maintain good hygiene
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Punctuality:</strong> Arrive on time, ready to work. Notify supervisor if running late
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Respect:</strong> Treat everyone with courtesy, regardless of position or background
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Communication:</strong> Speak professionally, avoid gossip, address conflicts constructively
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Accountability:</strong> Take responsibility for your actions, admit mistakes, seek solutions
          </div>
        </div>
      </div>
    </div>

    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-4">❌ Prohibited Behaviors</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Harassment:</strong> Any form of harassment, discrimination, or bullying is strictly prohibited
          </div>
        </div>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Substance Abuse:</strong> Being under the influence of alcohol or drugs at work
          </div>
        </div>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Theft:</strong> Stealing company property, customer belongings, or colleagues' items
          </div>
        </div>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Confidentiality Breach:</strong> Sharing customer information or company secrets
          </div>
        </div>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Insubordination:</strong> Refusing to follow lawful and reasonable instructions
          </div>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">Conflict of Interest</h3>
      <p className="text-gray-700 mb-3">
        Employees must avoid situations where personal interests conflict with company interests.
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>• Don't work for competitors while employed</li>
        <li>• Disclose any financial interest in suppliers or competitors</li>
        <li>• Don't accept gifts or favors that could influence decisions</li>
        <li>• Report any potential conflicts to your manager</li>
      </ul>
    </div>

    <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">Confidentiality & Data Protection</h3>
      <p className="text-gray-700 mb-3">
        Protecting customer and company information is critical:
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>• Never share customer medical information</li>
        <li>• Keep customer personal details confidential</li>
        <li>• Don't discuss customer cases outside of work</li>
        <li>• Secure all documents and computer systems</li>
        <li>• Report any data breaches immediately</li>
      </ul>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Social Media Policy</h3>
      <p className="text-gray-700 mb-3">
        Use social media responsibly:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-green-900 mb-2">✅ Do:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Share positive company news</li>
            <li>• Represent us professionally</li>
            <li>• Respect copyright and privacy</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-red-900 mb-2">❌ Don't:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Share confidential information</li>
            <li>• Post negative comments about company</li>
            <li>• Identify customers or colleagues</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const BenefitsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Benefits & Perks</h2>
    
    <p className="text-lg text-gray-700">
      We believe in taking care of our employees. Here are the benefits and perks available to you:
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="text-4xl mb-3">🏥</div>
        <h3 className="text-xl font-bold text-blue-900 mb-3">Health Benefits</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Medical aid contribution (after probation)</li>
          <li>• Employee discounts on products (15%)</li>
          <li>• Annual health screening</li>
          <li>• Flu vaccinations</li>
          <li>• Wellness programs</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
        <div className="text-4xl mb-3">🏖️</div>
        <h3 className="text-xl font-bold text-green-900 mb-3">Time Off</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• 21 days annual leave</li>
          <li>• 30 days sick leave (3-year cycle)</li>
          <li>• Maternity leave: 4 months</li>
          <li>• Paternity leave: 10 days</li>
          <li>• Family responsibility leave: 3 days</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="text-4xl mb-3">📚</div>
        <h3 className="text-xl font-bold text-purple-900 mb-3">Learning & Development</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Comprehensive onboarding program</li>
          <li>• Monthly product training</li>
          <li>• Leadership development opportunities</li>
          <li>• Study leave (5 days/year)</li>
          <li>• Professional certification support</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="text-4xl mb-3">🎁</div>
        <h3 className="text-xl font-bold text-orange-900 mb-3">Additional Perks</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Performance bonuses</li>
          <li>• Long service awards</li>
          <li>• Employee of the month recognition</li>
          <li>• Birthday leave day</li>
          <li>• Team building events</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-lg p-6">
        <div className="text-4xl mb-3">🚗</div>
        <h3 className="text-xl font-bold text-red-900 mb-3">Financial Benefits</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Competitive salary</li>
          <li>• Transport allowance (eligible staff)</li>
          <li>• Overtime pay (1.5x - 2x)</li>
          <li>• Provident fund (after 6 months)</li>
          <li>• Annual salary reviews</li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300 rounded-lg p-6">
        <div className="text-4xl mb-3">🤝</div>
        <h3 className="text-xl font-bold text-indigo-900 mb-3">Work-Life Balance</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Flexible working hours (core hours)</li>
          <li>• No weekend work for most roles</li>
          <li>• Paid public holidays (12/year)</li>
          <li>• Work-from-home options (select roles)</li>
          <li>• Family-friendly policies</li>
        </ul>
      </div>
    </div>

    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-3 text-center">Employee Assistance Program (EAP)</h3>
      <p className="text-center text-lg mb-4">
        Free, confidential counseling and support services for you and your immediate family
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">💬</div>
          <p className="font-semibold">Mental Health Support</p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">💰</div>
          <p className="font-semibold">Financial Counseling</p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">⚖️</div>
          <p className="font-semibold">Legal Advice</p>
        </div>
      </div>
      <p className="text-center mt-4 text-sm">
        📞 24/7 Helpline: 0800 123 4567
      </p>
    </div>
  </div>
);

const CompensationSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Compensation & Payroll</h2>
    
    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">Salary Structure</h3>
      <p className="text-gray-700 mb-4">
        Lera Health offers competitive compensation based on role, experience, and performance. 
        Salaries are reviewed annually and adjusted based on:
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>• Individual performance</li>
        <li>• Company performance</li>
        <li>• Market rates</li>
        <li>• Cost of living adjustments</li>
      </ul>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-900 mb-3">Payroll Schedule</h3>
        <div className="space-y-3">
          <div>
            <p className="font-semibold text-gray-900">Pay Date:</p>
            <p className="text-gray-700">Last working day of each month</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Payment Method:</p>
            <p className="text-gray-700">Direct deposit to your bank account</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Payslip Access:</p>
            <p className="text-gray-700">Available online via employee portal</p>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple-900 mb-3">Deductions</h3>
        <p className="text-gray-700 mb-3">Standard deductions include:</p>
        <ul className="space-y-1 text-gray-700">
          <li>• PAYE (Pay As You Earn tax)</li>
          <li>• UIF (Unemployment Insurance Fund)</li>
          <li>• Provident fund contribution (optional)</li>
          <li>• Medical aid contribution (if applicable)</li>
        </ul>
      </div>
    </div>

    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Performance Bonuses</h3>
      <p className="text-gray-700 mb-4">
        Lera Health rewards exceptional performance through various bonus programs:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4">
          <div className="text-2xl mb-2">📈</div>
          <p className="font-semibold text-gray-900 mb-1">Monthly Sales Bonus</p>
          <p className="text-sm text-gray-700">Top performers earn up to R500</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="text-2xl mb-2">🏆</div>
          <p className="font-semibold text-gray-900 mb-1">Quarterly Excellence</p>
          <p className="text-sm text-gray-700">Awards up to R1,000</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="text-2xl mb-2">🎯</div>
          <p className="font-semibold text-gray-900 mb-1">Annual Performance</p>
          <p className="text-sm text-gray-700">Based on individual & company goals</p>
        </div>
      </div>
    </div>

    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-orange-900 mb-3">Overtime Pay</h3>
      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between items-center py-2 border-b border-orange-200">
          <span>Weekday overtime (beyond 40 hours):</span>
          <span className="font-bold">1.5× normal rate</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-orange-200">
          <span>Sunday work:</span>
          <span className="font-bold">2× normal rate</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span>Public holiday work:</span>
          <span className="font-bold">2× normal rate</span>
        </div>
      </div>
      <p className="text-sm text-orange-800 mt-3">
        ⚠️ All overtime must be pre-approved by your manager
      </p>
    </div>
  </div>
);

const DevelopmentSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Career Development</h2>
    
    <p className="text-lg text-gray-700">
      At Lera Health, we invest in your growth and success. We provide opportunities for learning, 
      development, and advancement throughout your career.
    </p>

    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-4 text-center">Your Career Path</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">1️⃣</div>
          <p className="font-bold mb-1">Entry Level</p>
          <p className="text-sm">Sales Assistant<br/>Pharmacist Assistant</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">2️⃣</div>
          <p className="font-bold mb-1">Specialist</p>
          <p className="text-sm">Department Specialist<br/>Senior Assistant</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">3️⃣</div>
          <p className="font-bold mb-1">Supervisor</p>
          <p className="text-sm">Team Leader<br/>Shift Supervisor</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">4️⃣</div>
          <p className="font-bold mb-1">Management</p>
          <p className="text-sm">Store Manager<br/>Regional Manager</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-3">📚 Training Programs</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• New employee orientation (2 weeks)</li>
          <li>• Monthly product knowledge sessions</li>
          <li>• Customer service excellence training</li>
          <li>• Sales techniques workshops</li>
          <li>• Leadership development program</li>
          <li>• Safety and compliance training</li>
        </ul>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-900 mb-3">🎓 Educational Support</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Study leave (5 days/year)</li>
          <li>• Certification sponsorship</li>
          <li>• Online learning platform access</li>
          <li>• Industry conference attendance</li>
          <li>• Professional development budget</li>
          <li>• Mentorship program</li>
        </ul>
      </div>
    </div>

    <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">Performance Reviews</h3>
      <p className="text-gray-700 mb-4">
        Regular feedback helps you grow and succeed:
      </p>
      <div className="space-y-3">
        <div className="bg-white rounded-lg p-4">
          <p className="font-semibold text-gray-900">30-Day Check-in</p>
          <p className="text-sm text-gray-700">Review onboarding progress, address questions</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="font-semibold text-gray-900">90-Day Review</p>
          <p className="text-sm text-gray-700">Evaluate fit, set goals, confirm continuation</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="font-semibold text-gray-900">Annual Performance Review</p>
          <p className="text-sm text-gray-700">Comprehensive evaluation, salary review, career planning</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="font-semibold text-gray-900">Ongoing Feedback</p>
          <p className="text-sm text-gray-700">Regular check-ins with manager, real-time coaching</p>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Internal Promotion Policy</h3>
      <p className="text-gray-700 mb-4">
        We believe in promoting from within. When positions open:
      </p>
      <div className="space-y-2 text-gray-700">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span>Internal candidates are considered first</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span>Job postings shared internally before external advertising</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span>Performance and potential weighted heavily</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span>Career development discussions in annual reviews</span>
        </div>
      </div>
    </div>
  </div>
);

const WorkplaceSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Workplace Policies</h2>
    
    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">Dress Code</h3>
      <p className="text-gray-700 mb-3">
        Professional appearance is important in our industry. All employees must:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-green-900 mb-2">✅ Required:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Company uniform or approved attire</li>
            <li>• Name badge (visible at all times)</li>
            <li>• Closed-toe shoes</li>
            <li>• Clean, neat appearance</li>
            <li>• Minimal jewelry (safety)</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-red-900 mb-2">❌ Not Allowed:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Torn or dirty clothing</li>
            <li>• Offensive graphics or slogans</li>
            <li>• Excessive perfume/cologne</li>
            <li>• Open-toe sandals</li>
            <li>• Visible extreme body modifications</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-900 mb-3">Health & Safety</h3>
      <p className="text-gray-700 mb-4">
        Your safety is our priority. Key safety policies:
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>• Report all injuries or hazards immediately</li>
        <li>• Use proper lifting techniques</li>
        <li>• Keep work areas clean and organized</li>
        <li>• Follow emergency procedures</li>
        <li>• Attend required safety training</li>
        <li>• Use personal protective equipment when required</li>
      </ul>
    </div>

    <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">Technology Use</h3>
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-gray-900 mb-2">Personal Devices:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Use only during breaks in designated areas</li>
            <li>• Emergency calls: notify supervisor</li>
            <li>• No personal calls on sales floor</li>
            <li>• Photography of premises requires approval</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-2">Company Equipment:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• For business use only</li>
            <li>• Report technical issues immediately</li>
            <li>• Don't share passwords</li>
            <li>• Follow data security protocols</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
      <h3 className="text-xl font-bold text-orange-900 mb-3">Workplace Relationships</h3>
      <p className="text-gray-700 mb-3">
        We value professionalism and respect:
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>• Romantic relationships between supervisors and direct reports are prohibited</li>
        <li>• Disclose workplace relationships to HR</li>
        <li>• Keep personal relationships separate from work duties</li>
        <li>• Maintain professional conduct at all times</li>
      </ul>
    </div>

    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">Zero Tolerance Policies</h3>
      <p className="text-gray-700 mb-4">
        Lera Health has zero tolerance for:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-red-900 mb-2">Immediate Dismissal:</p>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Theft or fraud</li>
            <li>• Violence or threats</li>
            <li>• Intoxication at work</li>
            <li>• Sexual harassment</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-red-900 mb-2">Serious Violations:</p>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Discrimination</li>
            <li>• Confidentiality breaches</li>
            <li>• Falsifying records</li>
            <li>• Gross insubordination</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const ContactsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Important Contacts</h2>
    
    <p className="text-lg text-gray-700">
      Keep these contacts handy for quick access when you need support.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-500 text-white rounded-full p-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">Human Resources</h3>
        </div>
        <div className="space-y-2 text-gray-700">
          <p><strong>Email:</strong> lerahealthplk@gmail.com</p>
          <p><strong>Phone:</strong> +27 72 640 8996</p>
          <p><strong>Hours:</strong> Mon-Fri, 08:00-17:00</p>
          <p className="text-sm mt-3">
            For: Employment queries, benefits, policies, conflicts
          </p>
        </div>
      </div>

      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-500 text-white rounded-full p-3">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-green-900">IT Support</h3>
        </div>
        <div className="space-y-2 text-gray-700">
          <p><strong>Email:</strong> lerahealthplk@gmail.com</p>
          <p><strong>Phone:</strong> +27 72 640 8996</p>
          <p><strong>Hours:</strong> Mon-Sat, 08:00-17:00</p>
          <p className="text-sm mt-3">
            For: System issues, password resets, technical problems
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-500 text-white rounded-full p-3">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-purple-900">Payroll</h3>
        </div>
        <div className="space-y-2 text-gray-700">
          <p><strong>Email:</strong> lerahealthplk@gmail.com</p>
          <p><strong>Phone:</strong> +27 72 640 8996</p>
          <p><strong>Hours:</strong> Mon-Fri, 08:00-17:00</p>
          <p className="text-sm mt-3">
            For: Salary queries, tax certificates, payslip issues
          </p>
        </div>
      </div>

      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-500 text-white rounded-full p-3">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-orange-900">Your Manager</h3>
        </div>
        <div className="space-y-2 text-gray-700">
          <p><strong>Name:</strong> [Solly]</p>
          <p><strong>Phone:</strong> [072 394 4922]</p>
          <p><strong>Email:</strong> [lerahealthplk@gmail.com]</p>
          <p className="text-sm mt-3">
            For: Daily questions, leave requests, performance discussions
          </p>
        </div>
      </div>
    </div>

    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
        <AlertCircle className="w-6 h-6" />
        Emergency Contacts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4">
          <p className="font-bold text-gray-900 mb-1">🚨 Emergency Services</p>
          <p className="text-2xl font-bold text-red-600">10177 / 112</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="font-bold text-gray-900 mb-1">🏥 Store Emergency</p>
          <p className="text-2xl font-bold text-red-600">0726408996</p>
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="font-bold text-gray-900 mb-1">💬 EAP Helpline</p>
          <p className="text-2xl font-bold text-red-600">0800 123 4567</p>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-3 text-center">Company Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="font-semibold mb-2">Head Office</p>
          <p className="text-sm">
            18 Jorissen Street<br/>
            Polokwane, 0699<br/>
            Limpopo, South Africa
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="font-semibold mb-2">Main Office</p>
          <p className="text-sm">
            Phone: +27 15 297 0088<br/>
            Email: citymedpharmacy@gmail.com<br/>
            Web: www.citymed.com
          </p>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Reporting Concerns</h3>
      <p className="text-gray-700 mb-4">
        If you witness or experience any violations of company policy, illegal activity, or have concerns about 
        workplace safety or ethics, you can report anonymously:
      </p>
      <div className="bg-white rounded-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">Anonymous Ethics Hotline</p>
        <p className="text-gray-700">📞 Phone: 0800 ETHICS (0800 384427)</p>
        <p className="text-gray-700">📧 Email: lerahealthplk@gmail.com</p>
        <p className="text-sm text-gray-600 mt-2">
          All reports are treated confidentially. No retaliation will be tolerated.
        </p>
      </div>
    </div>
  </div>
);

export default EmployeeHandbookView;