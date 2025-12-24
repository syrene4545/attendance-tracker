import React, { useState } from 'react';
import { 
  Heart,
  Smile,
  MessageCircle,
  ThumbsUp,
  PhoneCall,
  AlertCircle,
  Gift,
  Star,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

const CustomerServiceSOPView = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Service Excellence', icon: Heart },
    { id: 'standards', label: 'Service Standards', icon: Star },
    { id: 'communication', label: 'Communication Skills', icon: MessageCircle },
    { id: 'greeting', label: 'Greeting Customers', icon: Smile },
    { id: 'complaints', label: 'Handling Complaints', icon: AlertCircle },
    { id: 'difficult', label: 'Difficult Customers', icon: Users },
    { id: 'telephone', label: 'Telephone Etiquette', icon: PhoneCall },
    { id: 'loyalty', label: 'Loyalty & Retention', icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg shadow-lg p-8 text-white">
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
          <h1 className="text-4xl font-bold mb-2">💎 Customer Service Excellence SOP</h1>
          <p className="text-xl text-pink-100 mb-6">Delivering Exceptional Experiences Every Time</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">5★</div>
              <div className="text-sm text-pink-100">Service Target</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-pink-100">Customer Focus</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">&lt;24h</div>
              <div className="text-sm text-pink-100">Complaint Response</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">Every</div>
              <div className="text-sm text-pink-100">Customer Matters</div>
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
                      ? 'bg-pink-100 text-pink-700'
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
            {activeSection === 'standards' && <StandardsSection />}
            {activeSection === 'communication' && <CommunicationSection />}
            {activeSection === 'greeting' && <GreetingSection />}
            {activeSection === 'complaints' && <ComplaintsSection />}
            {activeSection === 'difficult' && <DifficultSection />}
            {activeSection === 'telephone' && <TelephoneSection />}
            {activeSection === 'loyalty' && <LoyaltySection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const OverviewSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Customer Service Excellence</h2>
    
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-pink-900 mb-3">Our Service Philosophy</h3>
      <p className="text-lg text-gray-800 mb-4">
        At Lera Health, <strong>exceptional customer service is not optional - it's who we are.</strong> 
        Every customer interaction is an opportunity to build trust, loyalty, and our reputation.
      </p>
      <p className="text-lg text-gray-800">
        We don't just sell products; we provide care, advice, and peace of mind. Our customers come 
        to us during some of their most vulnerable moments - when they're sick, worried, or in pain. 
        How we treat them matters profoundly.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Customer Service Matters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Business Impact</h4>
              <p className="text-sm text-gray-700">
                Happy customers return, refer others, spend more, and forgive mistakes. 
                Poor service drives customers to competitors permanently.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-900 mb-1">Healthcare Responsibility</h4>
              <p className="text-sm text-gray-700">
                We're healthcare providers. Our advice and care directly impact people's health 
                and wellbeing. This is a privilege and responsibility.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-purple-900 mb-1">Reputation Building</h4>
              <p className="text-sm text-gray-700">
                Word-of-mouth is our best marketing. One excellent experience creates loyal 
                customers who tell everyone. One bad experience goes viral.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Smile className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-orange-900 mb-1">Job Satisfaction</h4>
              <p className="text-sm text-gray-700">
                Making customers happy is rewarding. Great service creates positive work 
                environment and personal fulfillment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">The Service Excellence Mindset</h3>
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Every customer is important</strong> - Whether spending R10 or R1,000, treat everyone with equal respect and care
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>We own the experience</strong> - From the moment they enter until they leave, their experience is your responsibility
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Problems are opportunities</strong> - How we handle complaints and issues defines our service excellence
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Empathy first, always</strong> - Walk in their shoes. They may be sick, scared, or struggling financially
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Go the extra mile</strong> - Do more than expected. Small gestures create lasting impressions
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Represent the brand</strong> - You ARE Lera Health to that customer. Your behavior reflects on everyone
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Customer Service Statistics</h3>
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          Research shows the power of service excellence:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-3xl font-bold text-blue-600 mb-1">68%</p>
            <p className="text-sm text-gray-700">of customers leave due to perceived indifference (staff don't care)</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-3xl font-bold text-green-600 mb-1">70%</p>
            <p className="text-sm text-gray-700">will do business again if complaint resolved in their favor</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-3xl font-bold text-purple-600 mb-1">5x</p>
            <p className="text-sm text-gray-700">more expensive to attract new customer than retain existing</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-3xl font-bold text-orange-600 mb-1">96%</p>
            <p className="text-sm text-gray-700">of unhappy customers don't complain - they just leave</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-pink-100 border-2 border-pink-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-pink-900 mb-3">The Golden Rule</h3>
      <p className="text-lg text-gray-800">
        <strong>"Treat every customer the way you'd want your grandmother treated when she's sick and vulnerable."</strong>
      </p>
      <p className="text-gray-800 mt-3">
        If you wouldn't accept that level of service for your loved ones, don't provide it to our customers.
      </p>
    </div>
  </div>
);

const StandardsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Service Standards</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">⭐ Our Service Promise</h3>
      <p className="text-gray-800">
        We commit to delivering <strong>5-star service</strong> to every customer, every time. 
        These are non-negotiable standards that every team member must uphold.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">The 10 Service Commandments</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white border-l-4 border-green-500 p-4">
            <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Greet Every Customer Within 10 Seconds</p>
              <p className="text-sm text-gray-700">
                Acknowledge every person who enters. Eye contact, smile, "Hello! Welcome to Lera Health." 
                Even if busy, a quick wave shows you've seen them.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-blue-500 p-4">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Smile - It's Contagious</p>
              <p className="text-sm text-gray-700">
                Genuine, warm smile with every interaction. Smiles reduce tension, build trust, 
                and make customers feel welcome. Even on tough days, smile.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-purple-500 p-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Use Their Name</p>
              <p className="text-sm text-gray-700">
                If you know their name (loyalty card, prescription), use it. "Good morning, Mrs. Nkosi!" 
                Personal recognition makes customers feel valued.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-orange-500 p-4">
            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Listen Actively</p>
              <p className="text-sm text-gray-700">
                Give full attention. Don't interrupt. Ask clarifying questions. Repeat back to confirm 
                understanding. "So you need something for a dry cough that won't make you drowsy?"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 p-4">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Provide Expert Advice</p>
              <p className="text-sm text-gray-700">
                Share knowledge generously. Explain options, usage instructions, side effects. 
                If unsure, ask pharmacist. Never guess when it comes to health.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-pink-500 p-4">
            <div className="bg-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              6
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Be Patient & Empathetic</p>
              <p className="text-sm text-gray-700">
                Some customers are elderly, ill, anxious, or dealing with language barriers. Never rush. 
                Never show frustration. Compassion is part of healthcare.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-indigo-500 p-4">
            <div className="bg-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              7
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Go The Extra Mile</p>
              <p className="text-sm text-gray-700">
                Walk customer to product location. Carry heavy items to car. Call to check on medication 
                arrival. Small extras create raving fans.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-teal-500 p-4">
            <div className="bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              8
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Handle Problems Gracefully</p>
              <p className="text-sm text-gray-700">
                Stay calm. Apologize sincerely. Fix it quickly. Follow up. Turn complaints into opportunities 
                to demonstrate our commitment to service.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-yellow-500 p-4">
            <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              9
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Maintain Professional Appearance</p>
              <p className="text-sm text-gray-700">
                Clean uniform, name badge visible, neat hair, good hygiene. First impressions matter. 
                Professional appearance builds confidence in our expertise.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-gray-500 p-4">
            <div className="bg-gray-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              10
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Thank Every Customer</p>
              <p className="text-sm text-gray-700">
                "Thank you for choosing Lera Health. Feel better soon!" End every interaction positively. 
                Gratitude shows we value their business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Service Speed Standards</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          Speed matters, but never at the expense of quality or safety:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-purple-600" />
              <h4 className="font-semibold text-gray-900">Till Service</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Target:</strong> 3-5 minutes per customer</li>
              <li>• No long queues - open second till if &gt;3 waiting</li>
              <li>• Acknowledge waiting customers: "I'll be with you shortly"</li>
              <li>• Apologize if delays: "Thank you for your patience"</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Prescription Dispensing</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Target:</strong> 10-15 minutes (simple prescriptions)</li>
              <li>• Give realistic time estimate</li>
              <li>• Call when ready (don't make them ask)</li>
              <li>• Counsel thoroughly - never rush this</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-green-600" />
              <h4 className="font-semibold text-gray-900">Phone Inquiries</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Target:</strong> Answer within 3 rings</li>
              <li>• No customer on hold &gt;2 minutes</li>
              <li>• Return calls within 4 hours</li>
              <li>• Take clear, complete messages</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
              <h4 className="font-semibold text-gray-900">Complaint Resolution</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Target:</strong> Resolve immediately if possible</li>
              <li>• Otherwise: Follow up within 24 hours</li>
              <li>• Full resolution within 3 business days</li>
              <li>• Keep customer updated on progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional Appearance Standards</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-green-900 mb-3">✅ Required:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Clean, pressed company uniform</li>
              <li>• Name badge visible at all times</li>
              <li>• Closed-toe, clean shoes</li>
              <li>• Hair neat, tied back if long</li>
              <li>• Minimal, professional jewelry</li>
              <li>• Fresh breath (no strong food smells)</li>
              <li>• Daily shower, deodorant</li>
              <li>• Clean, short nails</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-red-900 mb-3">❌ Not Allowed:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Dirty, wrinkled, or stained uniform</li>
              <li>• Wearing name badge of colleague</li>
              <li>• Sandals, flip-flops, or open-toe shoes</li>
              <li>• Unkempt or messy hair</li>
              <li>• Excessive jewelry or piercings</li>
              <li>• Strong perfume/cologne</li>
              <li>• Body odor</li>
              <li>• Long, painted, or artificial nails (dispensary staff)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Personal Conduct Standards</h3>
      <div className="space-y-2 text-gray-700">
        <p><strong>Absolutely NO:</strong></p>
        <ul className="space-y-1 ml-6">
          <li>• Personal phone use on shop floor (except emergencies)</li>
          <li>• Eating or drinking in customer view</li>
          <li>• Chewing gum while serving customers</li>
          <li>• Personal conversations while customers wait</li>
          <li>• Gossiping about customers or colleagues</li>
          <li>• Sitting while customers are in store (unless medical need)</li>
          <li>• Bad language or inappropriate jokes</li>
          <li>• Discussing personal problems with customers</li>
        </ul>
      </div>
    </div>
  </div>
);

const CommunicationSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Communication Skills</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">💬 Communication is the Heart of Service</h3>
      <p className="text-gray-800">
        How you communicate matters as much as what you communicate. Words, tone, body language all 
        contribute to the customer experience. Master these skills to become a service superstar.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Verbal Communication</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-3">✅ Positive Language</h4>
            <div className="space-y-2 text-sm">
              <div className="border-l-4 border-green-500 pl-3 py-1">
                <p className="text-gray-900">"I can help you with that"</p>
                <p className="text-xs text-gray-600">vs. "That's not my department"</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3 py-1">
                <p className="text-gray-900">"That'll be available tomorrow"</p>
                <p className="text-xs text-gray-600">vs. "We don't have it"</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3 py-1">
                <p className="text-gray-900">"Let me find out for you"</p>
                <p className="text-xs text-gray-600">vs. "I don't know"</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3 py-1">
                <p className="text-gray-900">"I'll take care of that right away"</p>
                <p className="text-xs text-gray-600">vs. "You'll have to wait"</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">Clear & Simple Language</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>Avoid jargon:</strong> Say "pain reliever" not "analgesic"</li>
              <li>• <strong>Short sentences:</strong> One idea at a time</li>
              <li>• <strong>Check understanding:</strong> "Does that make sense?"</li>
              <li>• <strong>Use examples:</strong> "Take it like you would a vitamin"</li>
              <li>• <strong>Repeat important info:</strong> "Remember, twice daily with food"</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">Tone of Voice</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Warm & friendly:</strong> Not robotic or cold</li>
              <li>• <strong>Calm & patient:</strong> Especially with elderly/anxious</li>
              <li>• <strong>Enthusiastic:</strong> Show you care and want to help</li>
              <li>• <strong>Professional:</strong> Not overly casual or familiar</li>
              <li>• <strong>Respectful:</strong> No condescension or impatience</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-orange-900 mb-3">Volume & Pace</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Moderate volume:</strong> Clear but not shouting</li>
              <li>• <strong>Slow down:</strong> Especially with elderly or anxious customers</li>
              <li>• <strong>Enunciate:</strong> Don't mumble</li>
              <li>• <strong>Pause:</strong> Allow time for questions</li>
              <li>• <strong>Match customer:</strong> Adapt to their pace</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Non-Verbal Communication</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          <strong>55% of communication is body language.</strong> What you don't say speaks volumes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Eye Contact</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Make eye contact when greeting</li>
              <li>✓ Maintain during conversation</li>
              <li>✓ Shows you're listening and engaged</li>
              <li>✗ Don't stare - natural breaks</li>
              <li>✗ Don't look away while customer talking</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Facial Expressions</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Genuine smile (eyes crinkle)</li>
              <li>✓ Friendly, open expression</li>
              <li>✓ Show empathy/concern when appropriate</li>
              <li>✗ Blank/bored expression</li>
              <li>✗ Frowning or looking annoyed</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Body Language</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Stand up straight, shoulders back</li>
              <li>✓ Face customer directly</li>
              <li>✓ Lean in slightly (shows interest)</li>
              <li>✓ Open posture (arms uncrossed)</li>
              <li>✗ Slouching or leaning on counter</li>
              <li>✗ Arms crossed (defensive)</li>
              <li>✗ Turning away while customer talks</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Gestures</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Natural hand movements</li>
              <li>✓ Point to direct (politely)</li>
              <li>✓ Nod to show understanding</li>
              <li>✗ Excessive/wild gestures</li>
              <li>✗ Finger-pointing (aggressive)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Personal Space</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Maintain comfortable distance (arm's length)</li>
              <li>✓ Respect cultural differences</li>
              <li>✓ Don't crowd or hover</li>
              <li>✗ Getting too close (invasive)</li>
              <li>✗ Too far (seems disinterested)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Physical Contact</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Hand items gently</li>
              <li>✓ Assist elderly if needed (offer arm)</li>
              <li>✓ Always ask before helping physically</li>
              <li>✗ Unnecessary touching</li>
              <li>✗ Grabbing/pulling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Active Listening</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          <strong>Listening is the most important communication skill.</strong> Most service failures 
          happen because we don't truly listen.
        </p>

        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-orange-900 mb-3">The LISTEN Technique:</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>L - Look</strong> at the speaker (eye contact, face them)</p>
            <p><strong>I - Inquire</strong> with open questions ("Tell me more about...")</p>
            <p><strong>S - Stay</strong> on topic (don't interrupt or change subject)</p>
            <p><strong>T - Test</strong> understanding ("So you're saying...")</p>
            <p><strong>E - Evaluate</strong> the message (consider their perspective)</p>
            <p><strong>N - Neutralize</strong> your feelings (don't take personally, stay objective)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-100 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">✅ Active Listening DO's:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Give full attention (no distractions)</li>
              <li>• Let them finish speaking</li>
              <li>• Nod and make acknowledgment sounds ("mm-hmm")</li>
              <li>• Ask clarifying questions</li>
              <li>• Repeat back key points</li>
              <li>• Show empathy: "That must be frustrating"</li>
            </ul>
          </div>

          <div className="bg-red-100 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">❌ Poor Listening DON'Ts:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Interrupting mid-sentence</li>
              <li>• Looking at phone/computer</li>
              <li>• Thinking about your response</li>
              <li>• Finishing their sentences</li>
              <li>• Dismissing concerns</li>
              <li>• Changing subject before they're done</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Communication Barriers to Avoid</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Language Barriers:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Speak clearly and slowly</li>
            <li>• Use simple words</li>
            <li>• Show (demonstrate) don't just tell</li>
            <li>• Get colleague who speaks their language</li>
            <li>• Be patient, don't show frustration</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Cultural Sensitivity:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Respect cultural norms around eye contact</li>
            <li>• Be aware of personal space differences</li>
            <li>• Accommodate religious requirements</li>
            <li>• Don't make assumptions</li>
            <li>• Ask politely if unsure</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Hearing/Vision Impairment:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Face them directly when speaking</li>
            <li>• Speak clearly (not louder, clearer)</li>
            <li>• Write down key information</li>
            <li>• Offer to read labels/instructions</li>
            <li>• Be patient with responses</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Cognitive/Mental Health:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Extra patience and kindness</li>
            <li>• Simple, one-step instructions</li>
            <li>• Repeat information without annoyance</li>
            <li>• Offer to call family/caregiver</li>
            <li>• Never mock or dismiss</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const GreetingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Greeting Customers</h2>
    
    <div className="bg-pink-100 border-2 border-pink-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-pink-900 mb-3">👋 First Impressions Last Forever</h3>
      <p className="text-gray-800 mb-3">
        You have <strong>7 seconds</strong> to make a first impression. The greeting sets the tone 
        for the entire customer experience. Get it right every time.
      </p>
      <p className="text-gray-800">
        <strong>Rule:</strong> Greet EVERY customer within 10 seconds of them entering. Even if busy 
        with another customer, acknowledge with eye contact and "I'll be with you in just a moment!"
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">The Perfect Greeting Formula</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-3">Step 1: Visual Acknowledgment (Immediate)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Eye contact:</strong> Look at customer as they enter</li>
              <li>• <strong>Smile:</strong> Genuine, warm smile</li>
              <li>• <strong>Stop what you're doing:</strong> Turn to face them</li>
              <li>• Even if serving someone else: Quick glance and smile shows you've seen them</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">Step 2: Verbal Greeting (Within 10 seconds)</h4>
            <div className="space-y-2 text-sm">
              <div className="border-l-4 border-blue-500 pl-3 py-2">
                <p className="font-semibold text-gray-900">Morning (Before 12:00):</p>
                <p className="text-gray-700">"Good morning! Welcome to Lera Health."</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3 py-2">
                <p className="font-semibold text-gray-900">Afternoon (12:00-17:00):</p>
                <p className="text-gray-700">"Good afternoon! How can I help you today?"</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3 py-2">
                <p className="font-semibold text-gray-900">Evening (After 17:00):</p>
                <p className="text-gray-700">"Good evening! Welcome!"</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3 py-2 bg-green-50">
                <p className="font-semibold text-gray-900">Regular Customer (you know their name):</p>
                <p className="text-gray-700">"Hello Mrs. Nkosi! Good to see you again!"</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">Step 3: Offer Assistance</h4>
            <p className="text-sm text-gray-700 mb-2">After greeting, let them know you're available:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• "How can I help you today?"</li>
              <li>• "Are you looking for anything specific?"</li>
              <li>• "Feel free to browse. Let me know if you need anything."</li>
              <li>• "I'm here if you have any questions."</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Greeting Scenarios</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Scenario 1: You're Busy with Another Customer</h4>
            <p className="text-sm text-gray-700 mb-2"><strong>Do this:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>1. Make eye contact with new customer</li>
              <li>2. Smile and hold up one finger (universal "one moment" sign)</li>
              <li>3. Say to them: "I'll be right with you!" or "Give me just one moment"</li>
              <li>4. Finish with current customer quickly but don't rush</li>
              <li>5. Thank first customer, then turn to waiting customer: "Thank you for waiting! How can I help?"</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Scenario 2: Multiple Customers Enter at Once</h4>
            <p className="text-sm text-gray-700 mb-2"><strong>Do this:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>1. Greet all: "Good morning everyone! Welcome!"</li>
              <li>2. Ask who was first: "Who arrived first?" or go in order you saw them</li>
              <li>3. To others: "I'll be with you shortly" or call colleague: "Thandi, can you help this customer?"</li>
              <li>4. Serve systematically, don't let anyone feel forgotten</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Scenario 3: Customer on Phone</h4>
            <p className="text-sm text-gray-700 mb-2"><strong>Do this:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>1. Still acknowledge with eye contact and smile</li>
              <li>2. Wave or nod in greeting</li>
              <li>3. Give them space to finish call</li>
              <li>4. When they hang up: "Welcome! How can I help you?"</li>
              <li>5. DON'T interrupt their call or hover impatiently</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2">Scenario 4: Customer Looks Lost/Confused</h4>
            <p className="text-sm text-gray-700 mb-2"><strong>Do this:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>1. Approach proactively: "Hello! Can I help you find something?"</li>
              <li>2. Don't wait for them to ask - offer assistance</li>
              <li>3. Walk them to the product location</li>
              <li>4. Ask if they need anything else</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">Scenario 5: Customer Looks Unwell/Distressed</h4>
            <p className="text-sm text-gray-700 mb-2"><strong>Do this:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>1. Immediate attention: "Are you alright? Do you need to sit down?"</li>
              <li>2. Offer chair/water</li>
              <li>3. Ask: "What can I help you with today?"</li>
              <li>4. Extra empathy: "I can see you're not feeling well. Let's get you sorted quickly."</li>
              <li>5. If very ill: Offer to call someone, ambulance if serious</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Greeting DON'Ts</h3>
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <div className="space-y-2 text-gray-800">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>DON'T ignore customers</strong> - Even if busy, acknowledge them</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>DON'T continue personal conversations</strong> - Customer takes priority over colleague chat</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>DON'T greet without looking up</strong> - Eye contact is essential</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>DON'T use generic "Can I help?"</strong> while looking disinterested - Be genuine</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>DON'T greet from across the store</strong> - Approach them</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>DON'T use slang or overly casual greetings</strong> - Stay professional</span>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">The Power of Names</h3>
      <p className="text-gray-700 mb-3">
        Dale Carnegie said: <em>"A person's name is to that person, the sweetest sound in any language."</em>
      </p>
      <div className="bg-white rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">When You Know Their Name:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Use it in greeting: "Hello Mrs. Dlamini!"</li>
          <li>• Use it during conversation: "Mrs. Dlamini, let me show you..."</li>
          <li>• Use it at checkout: "Is there anything else today, Mrs. Dlamini?"</li>
          <li>• Use it when saying goodbye: "Feel better soon, Mrs. Dlamini!"</li>
        </ul>
        <h4 className="font-semibold text-gray-900 mb-2 mt-4">How to Learn Names:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Loyalty card shows name</li>
          <li>• Prescription has patient name</li>
          <li>• Ask: "May I have your name for our records?"</li>
          <li>• Remember regulars - make mental note</li>
          <li>• Write name down after they leave (helps memory)</li>
        </ul>
      </div>
    </div>
  </div>
);

const ComplaintsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Handling Complaints</h2>
    
    <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-orange-900 mb-3">🎯 Complaints are Opportunities</h3>
      <p className="text-gray-800 mb-3">
        <strong>A complaint is a gift.</strong> It's a customer giving you a chance to fix a problem 
        before they leave forever. 96% of unhappy customers don't complain - they just never come back.
      </p>
      <p className="text-gray-800">
        When someone complains, they're saying: <em>"I care enough about your business to tell you what's wrong."</em> 
        Handle it well, and you'll earn a loyal customer for life.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">The LEARN Method for Handling Complaints</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white border-l-4 border-blue-500 p-4">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              L
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">LISTEN Actively & Empathetically</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Give complete, undivided attention</li>
                <li>• Let them vent without interrupting</li>
                <li>• Show you're listening (nod, eye contact, "I understand")</li>
                <li>• Don't get defensive or make excuses</li>
                <li>• Take notes if complex</li>
                <li><strong>Example:</strong> "I hear you. Tell me exactly what happened..."</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-green-500 p-4">
            <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              E
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">EMPATHIZE & Apologize</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Acknowledge their feelings</li>
                <li>• Apologize sincerely (even if not your fault)</li>
                <li>• Show you understand their frustration</li>
                <li>• Don't blame customer, colleague, or company</li>
                <li><strong>Examples:</strong></li>
                <li>- "I'm so sorry this happened. I can understand why you're upset."</li>
                <li>- "That must have been really frustrating for you."</li>
                <li>- "I apologize for the inconvenience this has caused."</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-purple-500 p-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              A
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">ASK Questions & Clarify</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ask clarifying questions to understand fully</li>
                <li>• Repeat back the issue to confirm</li>
                <li>• Ensure you have all the facts</li>
                <li><strong>Examples:</strong></li>
                <li>- "Let me make sure I understand. You purchased this cream last week, and it caused a rash?"</li>
                <li>- "Just to clarify, the prescription wasn't ready when we said it would be?"</li>
                <li>- "What would make this right for you?"</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-orange-500 p-4">
            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              R
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">RESOLVE Quickly & Fairly</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Offer a solution immediately if possible</li>
                <li>• If you can't resolve: Get manager</li>
                <li>• Fix the problem, don't just compensate</li>
                <li>• Be fair but generous when appropriate</li>
                <li><strong>Examples:</strong></li>
                <li>- "I can refund that for you right now."</li>
                <li>- "Let me get our pharmacist to recommend an alternative."</li>
                <li>- "I'll call you as soon as it arrives this afternoon."</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 p-4">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              N
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">NOTIFY & Follow Up</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Inform manager of complaint</li>
                <li>• Document the complaint and resolution</li>
                <li>• Follow up to ensure satisfaction</li>
                <li>• Thank them for bringing it to your attention</li>
                <li><strong>Examples:</strong></li>
                <li>- "Thank you for letting us know. We'll make sure this doesn't happen again."</li>
                <li>- "I'll call you tomorrow to make sure everything is working well."</li>
                <li>- "Please don't hesitate to contact us if you have any other concerns."</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Common Complaints & Solutions</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">1. "This product didn't work"</h4>
            <div className="text-sm text-gray-700">
              <p className="mb-2"><strong>Response:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• "I'm sorry it didn't work for you. Let's find something that will."</li>
                <li>• Ask questions about usage, symptoms</li>
                <li>• Consult pharmacist for alternative</li>
                <li>• Offer refund/exchange</li>
                <li>• Follow up: "Please let me know if this one works better"</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">2. "I was overcharged"</h4>
            <div className="text-sm text-gray-700">
              <p className="mb-2"><strong>Response:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• "Let me check that for you right away."</li>
                <li>• Review receipt and pricing</li>
                <li>• If error: "You're absolutely right. I apologize. Let me refund the difference."</li>
                <li>• If correct: Explain pricing politely, show shelf price</li>
                <li>• If dispute continues: Get manager</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">3. "Your staff was rude"</h4>
            <div className="text-sm text-gray-700">
              <p className="mb-2"><strong>Response:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• "I'm so sorry you had that experience. That's not acceptable."</li>
                <li>• Don't defend the staff member or make excuses</li>
                <li>• Ask what happened (get details for manager)</li>
                <li>• "I'll make sure this is addressed. Thank you for telling us."</li>
                <li>• Get manager immediately</li>
                <li>• Manager follows up with customer and staff member</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">4. "This took too long"</h4>
            <div className="text-sm text-gray-700">
              <p className="mb-2"><strong>Response:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• "I apologize for the wait. I know your time is valuable."</li>
                <li>• Explain reason briefly (if legitimate): "We had an unexpected rush"</li>
                <li>• Don't over-explain or make excuses</li>
                <li>• Serve them quickly and efficiently now</li>
                <li>• Consider small gesture: "I've added a 10% discount for the inconvenience"</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">5. "You don't have what I need"</h4>
            <div className="text-sm text-gray-700">
              <p className="mb-2"><strong>Response:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• "I'm sorry we're out of stock. Let me see when we'll have it."</li>
                <li>• Check system for expected delivery</li>
                <li>• Offer alternative: "We have a similar product that works well"</li>
                <li>• Offer to call when it arrives</li>
                <li>• If urgent: "I can call our other branches to find it for you"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">What NOT to Do</h3>
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <div className="space-y-2 text-gray-800">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>Get defensive or argumentative</strong> - "Well, you should have..." / "That's not our policy"</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>Blame others</strong> - "It's not my fault" / "Talk to my manager" / "The supplier sent us bad stock"</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>Minimize their concern</strong> - "It's not that big a deal" / "Other customers don't complain"</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>Make promises you can't keep</strong> - "This will never happen again" (unless you're sure)</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>Take it personally</strong> - They're upset with the situation, not you personally</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>Show annoyance or roll eyes</strong> - Body language speaks louder than words</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span><strong>Hide from manager</strong> - Escalate when necessary, don't struggle alone</span>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">When to Escalate to Manager</h3>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <p className="text-gray-700 mb-3">
          Call manager when:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li>• Customer is very angry or shouting</li>
          <li>• Customer demands to speak to manager</li>
          <li>• Solution requires manager authorization (large refunds, policy exceptions)</li>
          <li>• You don't know how to resolve</li>
          <li>• Customer threatens legal action</li>
          <li>• Complaint involves another staff member</li>
          <li>• You feel unsafe or threatened</li>
        </ul>

        <div className="bg-white rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-yellow-900 mb-2">How to Escalate Professionally:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• "I want to make sure this is handled properly. Let me get our manager for you."</li>
            <li>• Brief manager privately on the situation before they speak to customer</li>
            <li>• Stay present unless manager dismisses you</li>
            <li>• Support manager's decision</li>
            <li>• Learn from how manager handles it</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-900 mb-3">The Service Recovery Paradox</h3>
      <p className="text-gray-700 mb-3">
        Research shows: <strong>Customers whose complaints are handled exceptionally well become MORE loyal 
        than customers who never had a problem.</strong>
      </p>
      <p className="text-gray-700">
        A well-handled complaint proves you care, can be trusted, and will make things right. This builds 
        deeper loyalty than a perfect but impersonal transaction.
      </p>
    </div>
  </div>
);

// Create files for remaining sections: DifficultSection, TelephoneSection, LoyaltySection
// Due to length, I'll provide these in the next response

const DifficultSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Handling Difficult Customers</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">😤 Stay Calm, Stay Professional</h3>
      <p className="text-gray-800">
        Difficult customers are a reality in retail. They may be angry, rude, demanding, or unreasonable. 
        Remember: <strong>Their behavior is not about you personally.</strong> Stay professional, empathetic, 
        and follow procedures.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Types of Difficult Customers</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-2">1. The Angry Customer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Characteristics:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Raised voice, shouting</li>
                  <li>• Aggressive body language</li>
                  <li>• May use profanity</li>
                  <li>• Emotionally charged</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">How to Handle:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Stay calm, don't match their energy</li>
                  <li>• Lower your voice (they'll usually lower theirs)</li>
                  <li>• Let them vent without interrupting</li>
                  <li>• Apologize and show empathy</li>
                  <li>• Focus on solution</li>
                  <li>• If shouting continues: "I want to help, but I need you to speak calmly"</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-orange-900 mb-2">2. The Entitled/Demanding Customer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Characteristics:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Expects special treatment</li>
                  <li>• "Do you know who I am?"</li>
                  <li>• Wants rules bent for them</li>
                  <li>• Impatient, demanding</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">How to Handle:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Treat with respect but stand firm on policies</li>
                  <li>• Explain reasons for policies calmly</li>
                  <li>• Offer alternatives within policy</li>
                  <li>• Don't take demands personally</li>
                  <li>• Escalate to manager if they insist</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-yellow-900 mb-2">3. The Indecisive Customer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Characteristics:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Can't make decisions</li>
                  <li>• Asks many questions</li>
                  <li>• Compares everything</li>
                  <li>• Takes long time</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">How to Handle:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Be patient, don't rush</li>
                  <li>• Ask questions to narrow options</li>
                  <li>• Provide expert recommendations</li>
                  <li>• "Based on what you've told me, I'd suggest..."</li>
                  <li>• Help them decide with confidence</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-2">4. The Know-It-All Customer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Characteristics:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Thinks they know more than you</li>
                  <li>• Challenges your expertise</li>
                  <li>• "I googled it..."</li>
                  <li>• Argues with advice</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">How to Handle:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Don't argue or get defensive</li>
                  <li>• Acknowledge their research: "I see you've done your homework"</li>
                  <li>• Gently provide accurate information</li>
                  <li>• Refer to pharmacist if medical advice</li>
                  <li>• Let them make their choice</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">5. The Chronic Complainer</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Characteristics:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Nothing is ever right</li>
                  <li>• Always finds fault</li>
                  <li>• Negative about everything</li>
                  <li>• May be seeking attention/discount</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">How to Handle:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Listen patiently</li>
                  <li>• Empathize but don't overcompensate</li>
                  <li>• Focus on facts, not feelings</li>
                  <li>• Set boundaries: "I've addressed that concern. What else can I help with?"</li>
                  <li>• Document patterns (for manager)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-2">6. The Scammer/Fraud Attempt</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Characteristics:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Suspicious refund requests</li>
                  <li>• Fake receipts</li>
                  <li>• Aggressive when questioned</li>
                  <li>• Tries to confuse/distract</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">How to Handle:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Follow refund procedures exactly</li>
                  <li>• Verify receipts carefully</li>
                  <li>• Don't be intimidated</li>
                  <li>• Get manager immediately</li>
                  <li>• Document everything</li>
                  <li>• Don't accuse but don't give in</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">De-Escalation Techniques</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">1. Stay Calm & Breathe</h4>
            <p className="text-sm text-gray-700">
              Take deep breaths. Don't let their emotions trigger yours. Calm is contagious - 
              if you stay calm, they'll usually calm down too.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">2. Lower Your Voice</h4>
            <p className="text-sm text-gray-700">
              Speak softly and slowly. This forces them to quiet down to hear you. Never match 
              their volume or energy level.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">3. Show Empathy</h4>
            <p className="text-sm text-gray-700">
              "I can see you're really upset" / "I understand this is frustrating" - Acknowledging 
              their feelings often defuses anger.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-2">4. Apologize (Even if Not Your Fault)</h4>
            <p className="text-sm text-gray-700">
              "I apologize for this situation" doesn't admit fault but shows you care. Most people 
              just want to be heard and acknowledged.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">5. Find Common Ground</h4>
            <p className="text-sm text-gray-700">
              "We both want the same thing - to get this resolved for you" - Frame it as you 
              working together, not against each other.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-indigo-900 mb-2">6. Give Them Control</h4>
            <p className="text-sm text-gray-700">
              "What would you like me to do?" / "How can I make this right?" - People calm down 
              when they feel they have some control.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">When to Call for Help</h3>
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <p className="text-gray-800 mb-3">
          <strong>Immediately get manager or security if:</strong>
        </p>
        <ul className="space-y-2 text-gray-800">
          <li>• Customer is physically threatening (raised fist, invading space)</li>
          <li>• Customer is verbally abusive (swearing, insults, threats)</li>
          <li>• Customer appears intoxicated or on drugs</li>
          <li>• Customer refuses to leave when asked</li>
          <li>• Situation is escalating despite your best efforts</li>
          <li>• You feel unsafe or intimidated</li>
          <li>• Customer demands to speak to manager</li>
          <li>• Other customers are becoming uncomfortable</li>
        </ul>

        <div className="bg-white rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-red-900 mb-2">Emergency Protocols:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Code word:</strong> Use pre-arranged signal to alert colleagues (e.g., "Can someone help me find the blue folder?")</li>
            <li>• <strong>Panic button:</strong> Know where it is and when to use it</li>
            <li>• <strong>Distance:</strong> Keep counter/barrier between you and aggressive customer</li>
            <li>• <strong>Escape route:</strong> Always know where exits are</li>
            <li>• <strong>Don't be a hero:</strong> Your safety matters more than any transaction</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">After a Difficult Interaction</h3>
      <div className="space-y-2 text-gray-700">
        <p><strong>Take care of yourself:</strong></p>
        <ul className="space-y-1 ml-6">
          <li>• Take a short break if possible (walk outside, drink water)</li>
          <li>• Debrief with manager or colleague</li>
          <li>• Don't internalize the negativity</li>
          <li>• Document the interaction</li>
          <li>• Learn from it - what worked, what didn't?</li>
          <li>• Don't dwell on it - move forward positively</li>
        </ul>
        <p className="mt-3 text-yellow-800 font-semibold">
          Remember: One difficult customer doesn't define your day. Focus on the 99% who are lovely!
        </p>
      </div>
    </div>
  </div>
);

const TelephoneSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Telephone Etiquette</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">📞 The Phone is Your Storefront</h3>
      <p className="text-gray-800">
        For many customers, a phone call is their first interaction with us. You can't rely on 
        smiles or body language - your voice, tone, and words are all you have. Make them count.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Answering the Phone</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
          <p className="font-semibold text-orange-900 mb-2">⏱️ Answer Within 3 Rings</p>
          <p className="text-sm text-orange-800">
            Research shows customers start to feel ignored after 3 rings. Make answering the phone 
            a priority - even if you're with a customer, acknowledge the call.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Standard Greeting Formula:</h4>
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                "Good [morning/afternoon], Lera Health Polokwane, [Your Name] speaking. How may I help you?"
              </p>
              <p className="text-sm text-gray-700 mt-3">Breaking it down:</p>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                <li>• <strong>Greeting:</strong> Good morning/afternoon (appropriate to time)</li>
                <li>• <strong>Business name:</strong> Lera Health Polokwane</li>
                <li>• <strong>Your name:</strong> Personalizes the call</li>
                <li>• <strong>Offer help:</strong> Shows you're ready to assist</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Voice & Tone on the Phone:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Smile while talking</strong> - It comes through in your voice</li>
              <li>• <strong>Speak clearly:</strong> Enunciate, don't mumble</li>
              <li>• <strong>Moderate pace:</strong> Not too fast, not too slow</li>
              <li>• <strong>Enthusiastic:</strong> Show energy and willingness to help</li>
              <li>• <strong>Professional volume:</strong> Not too loud or too quiet</li>
              <li>• <strong>Eliminate background noise:</strong> No eating, chewing, typing loudly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Handling Different Types of Calls</h3>
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">1. General Inquiries</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Listen to full question before answering</li>
                <li>• Provide accurate, complete information</li>
                <li>• If unsure: "Let me check that for you" (put on brief hold)</li>
                <li>• Offer additional help: "Is there anything else I can assist with?"</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">2. Prescription Inquiries</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Get patient name and date of birth (verify identity)</li>
                <li>• Check system for prescription status</li>
                <li>• Give realistic time estimate</li>
                <li>• If ready: "It's ready for collection. We're open until..."</li>
                <li>• If not ready: "It'll be ready by [time]. We'll call you."</li>
                <li>• Medical questions: Transfer to pharmacist</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">3. Stock Inquiries</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ask for product name (get exact spelling)</li>
                <li>• Check system</li>
                <li>• If in stock: "Yes, we have that. Would you like me to put one aside?"</li>
                <li>• If out of stock: "We're out currently. Expected [date]. May I have your number to call when it arrives?"</li>
                <li>• Offer alternatives if appropriate</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">4. Complaints</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Listen without interrupting</li>
                <li>• Take detailed notes</li>
                <li>• Empathize and apologize</li>
                <li>• Get contact details</li>
                <li>• Explain next steps: "I'll pass this to our manager who will call you back within 24 hours"</li>
                <li>• Follow through - ensure callback happens</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">5. Sales/Marketing Calls</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Polite but firm: "I'm sorry, we don't accept unsolicited sales calls"</li>
                <li>• Direct to email: "Please send information to [email]"</li>
                <li>• Don't engage in lengthy conversations</li>
                <li>• Don't provide personal staff information</li>
                <li>• If persistent: "I need to go. Goodbye" and hang up</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">6. Wrong Number</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Be polite: "I'm sorry, you have the wrong number"</li>
                <li>• Help if you can: "That sounds like you need [correct business]. Their number is..."</li>
                <li>• Don't be rude even if they're persistent</li>
                </ul>
            </div>
            </div>
        </div>
        </div>

        <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Transferring Calls</h3>
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
            <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">Before Transferring:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Explain why you're transferring: "Let me transfer you to our pharmacist who can answer that"</li>
                <li>• Ask permission: "Is it okay if I transfer you?"</li>
                <li>• Get their name and number in case of disconnection</li>
                <li>• Tell them who they're being transferred to</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">During Transfer:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Warm transfer (preferred):</strong> Brief recipient on caller's issue before connecting</li>
                <li>• "Hi Sarah, I have Mrs. Nkosi on the line asking about side effects of..." (then connect)</li>
                <li>• <strong>Cold transfer:</strong> Only if urgently busy - but tell caller: "I'm transferring you now to..."</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">If Person Unavailable:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• "I'm sorry, [person] is with a customer. May I take a message?"</li>
                <li>• Get complete message: Name, number, reason for call, best time to call back</li>
                <li>• Read back to confirm accuracy</li>
                <li>• "I'll make sure [person] gets this message"</li>
                <li>• Actually deliver the message!</li>
                </ul>
            </div>
            </div>
        </div>
        </div>

        <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Putting Callers on Hold</h3>
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 mb-4">
            <p className="font-semibold text-red-900 mb-2">⚠️ Hold Time Rules</p>
            <ul className="text-sm text-red-800 space-y-1">
                <li>• <strong>Maximum hold time: 2 minutes</strong></li>
                <li>• <strong>Never put someone on hold without asking permission</strong></li>
                <li>• <strong>Check back every 30-45 seconds</strong></li>
                <li>• <strong>If taking longer: Offer to call back</strong></li>
            </ul>
            </div>

            <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">How to Put Someone on Hold:</h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-4">
                <li>Explain why: "I need to check our system for that"</li>
                <li>Ask permission: "May I place you on hold for a moment?"</li>
                <li>Wait for their response</li>
                <li>Press hold button</li>
                <li>Do what you need to do quickly</li>
                <li>Return: "Thank you for holding. I found that..."</li>
                </ol>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">If Hold Takes Longer Than Expected:</h4>
                <p className="text-sm text-gray-700 mb-2">Return to caller every 30-45 seconds:</p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• "Thank you for waiting. I'm still checking on that for you. It'll just be another moment."</li>
                <li>• "I appreciate your patience. This is taking longer than expected. Would you like to continue holding or may I call you back?"</li>
                </ul>
            </div>
            </div>
        </div>
        </div>

        <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ending the Call</h3>
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <div className="space-y-2">
            <p className="text-gray-700"><strong>Always end positively and professionally:</strong></p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Summarize what was discussed/agreed</li>
                <li>• Ask: "Is there anything else I can help you with today?"</li>
                <li>• Thank them: "Thank you for calling Lera Health"</li>
                <li>• Friendly close: "Have a great day!" / "Feel better soon!"</li>
                <li>• Let caller hang up first (shows respect)</li>
                <li>• Place handset down gently (don't slam)</li>
            </ul>
            </div>
        </div>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-red-900 mb-3">❌ Telephone DON'Ts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
            <ul className="text-sm text-gray-700 space-y-1">
                <li>✗ Eating, drinking, chewing gum while on call</li>
                <li>✗ Using speakerphone (unless private conversation)</li>
                <li>✗ Having side conversations with colleagues</li>
                <li>✗ Typing loudly or shuffling papers</li>
                <li>✗ Putting caller on hold to answer another call (unless emergency)</li>
            </ul>
            </div>
            <div>
            <ul className="text-sm text-gray-700 space-y-1">
                <li>✗ Using slang or unprofessional language</li>
                <li>✗ Rushing the caller</li>
                <li>✗ Giving medical advice (unless pharmacist)</li>
                <li>✗ Discussing other customers</li>
                <li>✗ Hanging up on angry callers</li>
            </ul>
            </div>
        </div>
    </div>

  </div>
);

const LoyaltySection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Customer Loyalty & Retention</h2>
      <div className="bg-pink-100 border-2 border-pink-400 rounded-lg p-6">
        <h3 className="text-xl font-bold text-pink-900 mb-3">💖 Building Lifelong Relationships</h3>
        <p className="text-gray-800 mb-3">
            Acquiring a new customer costs <strong>5 times more</strong> than retaining an existing one. 
            Loyal customers are the foundation of sustainable business success.
        </p>
        <p className="text-gray-800">
            <strong>Our goal:</strong> Turn every first-time customer into a loyal, lifelong customer who 
            chooses us over competitors and recommends us to friends and family.
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Customers Stay Loyal</h3>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">1. Consistent Quality</h4>
                <p className="text-sm text-gray-700">
                They know what to expect. Products are always genuine, properly stored, not expired. 
                Service is reliably excellent.
                </p>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">2. Personal Recognition</h4>
                <p className="text-sm text-gray-700">
                We remember them. Use their name. Know their preferences. "Mrs. Nkosi! Your usual allergy medication?"
                </p>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">3. Trust & Expertise</h4>
                <p className="text-sm text-gray-700">
                They trust our advice. Our pharmacist knows their medication history. We care about their health, not just sales.
                </p>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">4. Convenience</h4>
                <p className="text-sm text-gray-700">
                Easy location. Good hours. Fast service. No hassles. We make their life easier.
                </p>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">5. Emotional Connection</h4>
                <p className="text-sm text-gray-700">
                We make them feel valued, cared for, important. Genuine warmth and empathy create bonds beyond transactions.
                </p>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">6. Problem Resolution</h4>
                <p className="text-sm text-gray-700">
                When things go wrong (they will), we fix them quickly and fairly. This builds deeper loyalty than perfection.
                </p>
            </div>
            </div>
        </div>
        </div>

        <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Building Customer Loyalty</h3>
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">1. Remember Your Regular Customers</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Learn their names and use them</li>
                <li>• Remember their preferences, conditions, medications</li>
                <li>• Note personal details: "How's your daughter doing at university?"</li>
                <li>• Greet them warmly: "Great to see you again, Mr. Botha!"</li>
                <li>• Make them feel like VIPs</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">2. Go Above & Beyond</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Call when special orders arrive</li>
                <li>• Remind about prescription renewals</li>
                <li>• Help carry items to car</li>
                <li>• Offer delivery for elderly/unwell customers</li>
                <li>• Source hard-to-find items</li>
                <li>• Small extras create big loyalty</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">3. Provide Expert Advice</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Take time to explain medications</li>
                <li>• Share health tips and advice</li>
                <li>• Recommend best options for their needs</li>
                <li>• Be honest even if it means lower sale</li>
                <li>• Build trust through expertise</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-3">4. Show Appreciation</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Thank them sincerely every visit</li>
                <li>• "We really appreciate your business"</li>
                <li>• Small gestures on special occasions (birthday discounts)</li>
                <li>• Thank-you notes for large purchases</li>
                <li>• Make them feel valued</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3">5. Consistency is Key</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Same high service every visit</li>
                <li>• All staff treat them well (not just one person)</li>
                <li>• Maintain standards always</li>
                <li>• Reliability builds trust</li>
                </ul>
            </div>
            </div>
        </div>
        </div>

        <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Loyalty Program Management</h3>
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
            <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">Our Loyalty Card Program:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>How it works:</strong> Customers earn points on purchases, redeem for discounts/products</li>
                <li>• <strong>Your role:</strong>
                    <ul className="ml-6 mt-1 space-y-0.5">
                    <li>- Offer card to every new customer</li>
                    <li>- Ask for card with every transaction</li>
                    <li>- Explain benefits enthusiastically</li>
                    <li>- Process points correctly</li>
                    <li>- Inform of points balance: "You have 850 points!"</li>
                    </ul>
                </li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Enrolling New Members:</h4>
                <div className="text-sm text-gray-700">
                <p className="mb-2"><strong>Script:</strong></p>
                <p className="italic mb-2">
                    "Do you have our loyalty card? It's free to join and you earn points on every purchase 
                    which you can use for discounts. Would you like one?"
                </p>
                <ul className="space-y-1 mt-2">
                    <li>• Get customer details (name, phone, email)</li>
                    <li>• Issue card</li>
                    <li>• Explain: "You'll earn X points per R100 spent"</li>
                    <li>• Apply to this purchase: "You've just earned 45 points!"</li>
                </ul>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Maximizing Program Value:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Inform about special loyalty promotions</li>
                <li>• "This week loyalty members get double points on vitamins!"</li>
                <li>• Remind about expiring points</li>
                <li>• Encourage redemption: "You have enough points for R50 off today"</li>
                <li>• Create excitement around the program</li>
                </ul>
            </div>
            </div>
        </div>
        </div>

        <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Winning Back Lost Customers</h3>
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
            When a regular customer stops coming, it's often due to one bad experience. Win them back:
            </p>
            <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">If You Notice Their Absence:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Call them: "Hi Mrs. Dlamini, we haven't seen you in a while. Is everything okay?"</li>
                <li>• Listen to their concern</li>
                <li>• Apologize sincerely if we failed them</li>
                <li>• Invite them back: "We'd love to have you back. Come see us?"</li>
                <li>• Consider goodwill gesture (discount on next visit)</li>
                </ul>
            </div>

            <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">When They Return:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                <li>• Welcome them warmly: "So good to see you again!"</li>
                <li>• Don't mention their absence negatively</li>
                <li>• Provide exceptional service</li>
                <li>• Show you value them</li>
                <li>• Follow up after visit</li>
                </ul>
            </div>
            </div>
        </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-900 mb-3">Customer Lifetime Value</h3>
        <p className="text-gray-700 mb-3">
            <strong>Think long-term:</strong> A customer spending R200/month for 10 years = R24,000. 
            Plus referrals they bring. Every loyal customer is worth thousands.
        </p>
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Example Calculation:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Average monthly spend: R300</li>
            <li>• Customer lifetime: 5 years (conservative)</li>
            <li>• Direct value: R300 × 12 × 5 = R18,000</li>
            <li>• Referrals: 3 friends (average) = 3 × R18,000 = R54,000</li>
            <li><strong className="text-green-700">• Total potential value: R72,000</strong></li>
            </ul>
            <p className="text-sm text-yellow-800 font-semibold mt-3">
            This is why every customer interaction matters. You're not serving a R50 transaction - 
            you're serving a R72,000 relationship!
            </p>
        </div>
        </div>

        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-green-900 mb-3">The Loyalty Mindset</h3>
        <p className="text-gray-700 mb-3">
            <strong>Every interaction is an investment in loyalty.</strong> Ask yourself:
        </p>
        <ul className="space-y-2 text-gray-700">
            <li>• Am I making this customer feel valued and special?</li>
            <li>• Am I giving them a reason to come back?</li>
            <li>• Would they recommend us to their friends?</li>
            <li>• Am I building a relationship or just processing a transaction?</li>
        </ul>
        <p className="text-green-800 font-semibold mt-4">
            Remember: People forget what you said, forget what you did, but never forget how you made them feel.
        </p>
      </div>
  </div>
);
export default CustomerServiceSOPView;