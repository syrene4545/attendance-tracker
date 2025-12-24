import React, { useState } from 'react';
import { 
  TrendingUp,
  ShoppingCart,
  Users,
  Award,
  Target,
  BookOpen,
  DollarSign,
  Calendar,
  Clock,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Star,
  Zap
} from 'lucide-react';

const SalesSOPView = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Quick Start', icon: Zap },
    { id: 'golden-rules', label: 'Golden Rules', icon: Star },
    { id: 'upselling', label: 'Basket Building', icon: ShoppingCart },
    { id: 'departments', label: 'Department Protocols', icon: Users },
    { id: 'rewards', label: 'Rewards & Incentives', icon: Award },
    { id: 'targets', label: 'Sales Targets', icon: Target },
    { id: 'training', label: 'Training', icon: BookOpen },
    { id: 'daily-routine', label: 'Daily Routine', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
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
          <h1 className="text-4xl font-bold mb-2">🏥 Lera Health Sales SOP</h1>
          <p className="text-xl text-purple-100 mb-6">Excellence Through Engagement</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">30%</div>
              <div className="text-sm text-purple-100">Sales Increase</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">40%</div>
              <div className="text-sm text-purple-100">Basket Growth</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">40%</div>
              <div className="text-sm text-purple-100">Conversion Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-purple-100">Team Success</div>
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
                      ? 'bg-purple-100 text-purple-700'
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
            {activeSection === 'overview' && <QuickStartSection />}
            {activeSection === 'golden-rules' && <GoldenRulesSection />}
            {activeSection === 'upselling' && <UpsellingSection />}
            {activeSection === 'departments' && <DepartmentsSection />}
            {activeSection === 'rewards' && <RewardsSection />}
            {activeSection === 'targets' && <TargetsSection />}
            {activeSection === 'training' && <TrainingSection />}
            {activeSection === 'daily-routine' && <DailyRoutineSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const QuickStartSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">🚀 Quick Start: 3 Simple Steps</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
        <div className="text-4xl mb-4">1️⃣</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">UNDERSTAND</h3>
        <p className="text-gray-700">Read this SOP and understand the core principles. Focus on the 5 essentials first.</p>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="text-4xl mb-4">2️⃣</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">TRAIN</h3>
        <p className="text-gray-700">Get used to these changes. Use reference card. You will be rewarded.</p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6">
        <div className="text-4xl mb-4">3️⃣</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">START TODAY</h3>
        <p className="text-gray-700">Begin daily huddles. Do sales tracking. Use Golden Rules immediately!</p>
      </div>
    </div>

    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-6 text-white">
      <h3 className="text-2xl font-bold mb-4">⚡ Start with Just These 5 Things:</h3>
      <div className="space-y-3 text-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Daily Huddles</strong> - 15 minutes morning & evening
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Golden Rules</strong> - 10-second, 3-meter, 3-item
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Magic Questions</strong> - 5 upselling phrases
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Sales Board/Tracking</strong> - Update/Track every 2 hours
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Weekly Winner</strong> - R150 prize every Friday
          </div>
        </div>
      </div>
      <p className="mt-6 text-xl font-semibold text-center">Master these 5 things first, then add more later!</p>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">💙 The Lera Way</h3>
      <p className="text-blue-800 text-lg italic mb-3">
        "We don't just sell products; we solve problems and improve lives"
      </p>
      <p className="text-blue-700">
        Every team member must understand: We are health and wellness consultants, not just cashiers. 
        Every product has a purpose and benefit to communicate. Customer satisfaction leads to repeat business.
      </p>
    </div>
  </div>
);

const GoldenRulesSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">⏱️ The Golden Rules</h2>
    
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-l-4 border-yellow-500 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            10
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">The 10-Second Rule</h3>
            <p className="text-gray-700 text-lg mb-3">
              Every customer MUST be greeted within <strong>5 SECONDS</strong> of entering the store.
            </p>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-gray-800 font-semibold">
                👁️ Make Eye Contact → 😊 Smile Genuinely → 👋 Greet Warmly
              </p>
              <p className="text-purple-600 font-bold mt-2 text-lg">
                "Dumelang! Welcome to Lera Health!"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            3m
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">The 3-Meter Rule</h3>
            <p className="text-gray-700 text-lg mb-3">
              Acknowledge any customer within <strong>3 METERS</strong> of you.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-800 font-semibold">
                🚶 Customer Approaches → 👀 Look Up → 🙋 Acknowledge → 💬 Offer Help
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-500 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            3
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">The 3-Item Minimum</h3>
            <p className="text-gray-700 text-lg mb-3">
              Aim for EVERY customer to buy at least <strong>3 ITEMS</strong>.
            </p>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-gray-800 font-semibold">
                Primary Product → Complementary Item → Additional Suggestion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">✅ DO THIS vs ❌ NEVER DO THIS</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <h4 className="text-lg font-bold text-green-900 mb-3">✅ DO THIS</h4>
          <ul className="space-y-2 text-green-800">
            <li>✨ Greet with enthusiasm</li>
            <li>👂 Listen actively</li>
            <li>🤔 Ask questions</li>
            <li>💡 Provide solutions</li>
            <li>🎁 Suggest bundles</li>
            <li>🙏 Thank every customer</li>
            <li>😊 Smile genuinely</li>
            <li>📱 Be present</li>
          </ul>
        </div>

        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <h4 className="text-lg font-bold text-red-900 mb-3">❌ NEVER DO THIS</h4>
          <ul className="space-y-2 text-red-800">
            <li>😐 Ignore customers</li>
            <li>📱 Use phone on floor</li>
            <li>🙄 Show frustration</li>
            <li>⏰ Rush customers</li>
            <li>🤷 Say "I don't know"</li>
            <li>💬 Chat with colleagues</li>
            <li>😴 Look disengaged</li>
            <li>🚫 Refuse to help</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const UpsellingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">🛒 Basket Building Mastery</h2>
    <p className="text-xl text-gray-600 italic">"Every Transaction is a Triple Opportunity"</p>
    
    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-4">🎯 The Upselling Formula</h3>
      <p className="text-xl text-center font-semibold">
        PRIMARY PRODUCT + COMPLEMENTARY ITEM + BONUS SUGGESTION = 💰 BIGGER BASKET
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🔑 The 5 Magic Questions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="text-3xl mb-2">1️⃣</div>
          <p className="text-lg font-semibold text-gray-900">
            "What else are you looking for today?"
          </p>
        </div>

        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="text-3xl mb-2">2️⃣</div>
          <p className="text-lg font-semibold text-gray-900">
            "Have you tried our [complementary product]?"
          </p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="text-3xl mb-2">3️⃣</div>
          <p className="text-lg font-semibold text-gray-900">
            "Did you know we have a special on..."
          </p>
        </div>

        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
          <div className="text-3xl mb-2">4️⃣</div>
          <p className="text-lg font-semibold text-gray-900">
            "Many customers pair this with..."
          </p>
        </div>

        <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-4 md:col-span-2">
          <div className="text-3xl mb-2">5️⃣</div>
          <p className="text-lg font-semibold text-gray-900">
            "Would you like to save money with our bundle deal?"
          </p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">📦 Pre-Packaged Bundle Specials</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="border-3 border-orange-400 bg-orange-50 rounded-lg p-6">
          <h4 className="text-xl font-bold text-orange-900 mb-2">🤧 FLU FIGHTER KIT</h4>
          <div className="text-center text-5xl my-4">💊🍊☕</div>
          <ul className="space-y-1 text-gray-700 mb-4">
            <li>✅ Corenza C</li>
            <li>✅ Vitamin C tablets</li>
            <li>✅ Throat lozenges</li>
            <li>✅ Immune tea</li>
            <li>✅ Tissues</li>
          </ul>
          <div className="bg-red-500 text-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">R180</p>
            <p className="text-sm line-through">R205</p>
            <p className="font-semibold">💰 SAVE R25!</p>
          </div>
        </div>

        <div className="border-3 border-pink-400 bg-pink-50 rounded-lg p-6">
          <h4 className="text-xl font-bold text-pink-900 mb-2">👶 NEW MOM ESSENTIALS</h4>
          <div className="text-center text-5xl my-4">🍼👶💕</div>
          <ul className="space-y-1 text-gray-700 mb-4">
            <li>✅ Baby lotion</li>
            <li>✅ Baby powder</li>
            <li>✅ Baby pain drops</li>
            <li>✅ Baby wipes</li>
            <li>✅ Panado Paediatric</li>
          </ul>
          <div className="bg-pink-500 text-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">R250</p>
            <p className="text-sm line-through">R285</p>
            <p className="font-semibold">💰 SAVE R35!</p>
          </div>
        </div>

        <div className="border-3 border-blue-400 bg-blue-50 rounded-lg p-6">
          <h4 className="text-xl font-bold text-blue-900 mb-2">🧖 WELLNESS WEEKEND</h4>
          <div className="text-center text-5xl my-4">🛁☕🕯️</div>
          <ul className="space-y-1 text-gray-700 mb-4">
            <li>✅ Herbal tea</li>
            <li>✅ Bath salts</li>
            <li>✅ Aqueous cream</li>
            <li>✅ Relaxation candle</li>
          </ul>
          <div className="bg-blue-500 text-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">R150</p>
            <p className="text-sm line-through">R170</p>
            <p className="font-semibold">💰 SAVE R20!</p>
          </div>
        </div>

        <div className="border-3 border-green-400 bg-green-50 rounded-lg p-6">
          <h4 className="text-xl font-bold text-green-900 mb-2">⚡ QUICK ENERGY PACK</h4>
          <div className="text-center text-5xl my-4">⚡🍫🥤</div>
          <ul className="space-y-1 text-gray-700 mb-4">
            <li>✅ Energy drink</li>
            <li>✅ Chocolate bar</li>
            <li>✅ Glucose sweets</li>
          </ul>
          <div className="bg-green-500 text-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">R45</p>
            <p className="text-sm line-through">R53</p>
            <p className="font-semibold">💰 SAVE R8!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DepartmentsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">🏪 Department Sales Protocols</h2>
    <p className="text-xl text-gray-600 italic">"Every Department is a Profit Center"</p>
    
    <div className="space-y-6">
      {/* Personal Care */}
      <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-purple-900 mb-3">💄 Personal Care & Cosmetics</h3>
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-lg font-semibold text-gray-900">🎯 The Beauty Consultant Approach</p>
          <p className="text-purple-600 font-bold">Daily Target per Staff: R800</p>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Upselling Examples:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-purple-600">→</span>
              <div>
                <strong>If buying body lotion:</strong> Suggest matching perfume
                <p className="text-gray-600 italic">"This perfume complements your lotion perfectly!"</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600">→</span>
              <div>
                <strong>If buying baby lotion:</strong> Suggest baby powder + wipes
                <p className="text-gray-600 italic">"Complete your baby care - save R15 on the combo!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTC Adult */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-blue-900 mb-3">💊 OTC Adult Medications</h3>
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-lg font-semibold text-gray-900">🎯 The CARE Method</p>
          <p className="text-blue-600 font-bold">Daily Target per Staff: R1,200 (Highest margin!)</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <div className="font-bold text-blue-900">C</div>
            <div className="text-sm text-blue-800">Consult</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <div className="font-bold text-blue-900">A</div>
            <div className="text-sm text-blue-800">Assess</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <div className="font-bold text-blue-900">R</div>
            <div className="text-sm text-blue-800">Recommend</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <div className="font-bold text-blue-900">E</div>
            <div className="text-sm text-blue-800">Educate</div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-green-900 mb-2">5 Mandatory Questions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
            <li>"What symptoms are you experiencing?"</li>
            <li>"How long have you had these symptoms?"</li>
            <li>"Are you taking any other medications?"</li>
            <li>"Do you have any allergies or medical conditions?"</li>
            <li>"Is this for an adult or child? What's the age/weight?"</li>
          </ol>
        </div>
      </div>

      {/* Food & Beverages */}
      <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-orange-900 mb-3">🥤 Food & Beverages</h3>
        <div className="bg-white rounded-lg p-4 mb-4">
          <p className="text-lg font-semibold text-gray-900">🎯 The Impulse Maximizer</p>
          <p className="text-orange-600 font-bold">Daily Target per Staff: R700</p>
        </div>
        
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">Trigger Phrases:</h4>
          <ul className="space-y-2 text-yellow-800">
            <li>💬 "Ice cold and perfect for this heat!"</li>
            <li>💬 "Just delivered fresh this morning!"</li>
            <li>💬 "Everyone's buying these today!"</li>
            <li>💬 "Great energy boost for your afternoon!"</li>
            <li>💬 "Perfect combo for lunch!"</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const RewardsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">🏆 Team Motivation & Rewards</h2>
    <p className="text-xl text-gray-600 italic">"Winners are Made Through Recognition & Rewards"</p>
    
    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-8 text-center">
      <div className="text-6xl mb-4">👑</div>
      <h3 className="text-3xl font-bold mb-2">MONTHLY SALES CHAMPION</h3>
      <p className="text-xl mb-4">Highest Total Sales for the Month</p>
      <div className="text-5xl font-bold my-6">💰 R500 CASH BONUS</div>
      <div className="space-y-2 text-lg">
        <p>✨ Certificate of Excellence</p>
        <p>🅿️ "Employee of the Month"</p>
        <p>📸 Photo Wall of Fame</p>
        <p>📱 Social Media Recognition</p>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🎖️ Top 3 Monthly Performers</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg p-6 text-center">
          <div className="text-5xl mb-2">🥇</div>
          <h4 className="text-xl font-bold mb-3">1ST PLACE</h4>
          <div className="space-y-2">
            <p className="font-bold">💰 R1000 CASH</p>
            <p className="font-bold">📅 1 Extra Leave Days</p>
            <p className="font-bold">🏆 Trophy</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg p-6 text-center">
          <div className="text-5xl mb-2">🥈</div>
          <h4 className="text-xl font-bold mb-3">2ND PLACE</h4>
          <div className="space-y-2">
            <p className="font-bold">💰 R500 CASH</p>
            <p className="font-bold">📅 Product Hamper</p>
            <p className="font-bold">🏆 Certificate</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-lg p-6 text-center">
          <div className="text-5xl mb-2">🥉</div>
          <h4 className="text-xl font-bold mb-3">3RD PLACE</h4>
          <div className="space-y-2">
            <p className="font-bold">💰 R200 CASH</p>
            <p className="font-bold">🎁 Voucher</p>
            <p className="font-bold">🏆 Certificate</p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 Weekly Mini-Challenges (R150 Prize Each)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
          <div className="text-3xl mb-2">🛒</div>
          <h4 className="font-bold text-lg text-gray-900 mb-1">WEEK 1: Basket Builder</h4>
          <p className="text-gray-700 mb-2">Highest average items per transaction</p>
          <p className="text-orange-600 font-bold">🎁 R150 Grocery Voucher</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <div className="text-3xl mb-2">📦</div>
          <h4 className="font-bold text-lg text-gray-900 mb-1">WEEK 2: Bundle Boss</h4>
          <p className="text-gray-700 mb-2">Most pre-made bundles sold</p>
          <p className="text-blue-600 font-bold">🎁 R150 Airtime Voucher</p>
        </div>

        <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-4">
          <div className="text-3xl mb-2">🧲</div>
          <h4 className="font-bold text-lg text-gray-900 mb-1">WEEK 3: Customer Magnet</h4>
          <p className="text-gray-700 mb-2">Most getting customers into the shop</p>
          <p className="text-pink-600 font-bold">🎁 R150 cash</p>
        </div>

        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="text-3xl mb-2">📈</div>
          <h4 className="font-bold text-lg text-gray-900 mb-1">WEEK 4: Upsell Champion</h4>
          <p className="text-gray-700 mb-2">Highest upsell success rate</p>
          <p className="text-green-600 font-bold">🎁 R150 Cash + Voucher</p>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border border-green-300 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-green-900 mb-4 text-center">🌟 Daily Team Challenge</h3>
      <div className="text-center">
        <p className="text-3xl font-bold text-green-900 mb-4">🎯 DAILY TARGET: R15,000</p>
        <div className="space-y-2 text-lg text-green-800">
          <p><strong>Target Achieved:</strong> ☕ Tea/Coffee + 🍩 Vetkoek for team next morning!</p>
          <p><strong>Stretch Target (R18,000):</strong> 🎊 Afternoon Snack Party</p>
        </div>
      </div>
    </div>
  </div>
);

const TargetsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">📊 Sales Targets & Accountability</h2>
    <p className="text-xl text-gray-600 italic">"What Gets Measured Gets Managed"</p>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6 text-center">
      <h3 className="text-3xl font-bold text-red-900">🏢 STORE-WIDE MONTHLY TARGET</h3>
      <div className="text-6xl font-bold text-red-600 my-4">R350,000</div>
    </div>

    <div className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-lg p-8 text-center">
      <div className="text-5xl mb-4">🎯</div>
      <h3 className="text-3xl font-bold mb-2">MONTHLY TARGET PER STAFF</h3>
      <div className="text-7xl font-bold my-6">R175,000</div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
          <div className="font-bold text-2xl">R7,300</div>
          <div className="text-sm">Daily Target</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
          <div className="font-bold text-2xl">R43,750</div>
          <div className="text-sm">Weekly Target</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-lg p-4">
          <div className="font-bold text-2xl">R912</div>
          <div className="text-sm">Hourly Average</div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">⚖️ Accountability Framework</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-lg p-6">
          <div className="text-4xl mb-2">⭐</div>
          <h4 className="text-xl font-bold mb-2">EXCEEDS (110%+)</h4>
          <ul className="space-y-1 text-sm">
            <li>✅ Public recognition</li>
            <li>💰 Bonus eligible</li>
            <li>📅 Preferred shifts</li>
            <li>🚀 Promotion track</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-lg p-6">
          <div className="text-4xl mb-2">✅</div>
          <h4 className="text-xl font-bold mb-2">MEETS (90-109%)</h4>
          <ul className="space-y-1 text-sm">
            <li>👍 Positive feedback</li>
            <li>📚 Continued development</li>
            <li>💰 Standard incentives</li>
            <li>😊 Good standing</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg p-6">
          <div className="text-4xl mb-2">⚠️</div>
          <h4 className="text-xl font-bold mb-2">BELOW (75-89%)</h4>
          <ul className="space-y-1 text-sm">
            <li>💬 Coaching needed</li>
            <li>📋 Action plan</li>
            <li>🤝 Mentorship</li>
            <li>⏰ 4-week improvement</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-lg p-6">
          <div className="text-4xl mb-2">🚨</div>
          <h4 className="text-xl font-bold mb-2">CRITICAL (Below 75%)</h4>
          <ul className="space-y-1 text-sm">
            <li>📝 Written PIP</li>
            <li>📅 Daily monitoring</li>
            <li>⏰ 30-day timeline</li>
            <li>⚠️ Consequences outlined</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const TrainingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">🎓 Training & Development</h2>
    <p className="text-xl text-gray-600 italic">"Invest in Your Team, They'll Invest in Your Business"</p>
    
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-4 text-center">📚 New Employee Onboarding (2 Weeks)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <h4 className="text-xl font-bold mb-3">WEEK 1: FOUNDATION</h4>
          <ul className="space-y-2 text-sm">
            <li>📅 Day 1-2: Store orientation, meet team</li>
            <li>📦 Day 3-4: Product knowledge basics</li>
            <li>💼 Day 5: Sales skills & POS training</li>
          </ul>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <h4 className="text-xl font-bold mb-3">WEEK 2: PRACTICE</h4>
          <ul className="space-y-2 text-sm">
            <li>👥 Day 6-7: Shadow top performers</li>
            <li>🎯 Day 8-9: Supervised practice</li>
            <li>✅ Day 10: Assessment & goal setting</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
      <div className="text-5xl mb-3">🎓</div>
      <h4 className="text-xl font-bold text-green-900">GRADUATION</h4>
      <p className="text-green-800 mt-2">
        Mentor Assignment + Welcome Gift + Team Celebration!
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🏅 Department Specialist Certification</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
          <h4 className="font-bold text-lg text-orange-900 mb-3">📋 Requirements</h4>
          <ul className="space-y-2 text-gray-700">
            <li>✅ 90%+ on department test</li>
            <li>✅ Demonstrated sales success</li>
            <li>✅ Customer service excellence</li>
            <li>✅ Peer recommendation</li>
          </ul>
        </div>

        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <h4 className="font-bold text-lg text-green-900 mb-3">🎁 Benefits</h4>
          <ul className="space-y-2 text-gray-700">
            <li>🏷️ "Certified Specialist" badge</li>
            <li>💰 R200/month allowance</li>
            <li>📞 Primary contact for questions</li>
            <li>🎓 Train others</li>
            <li>📄 Resume enhancement</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const DailyRoutineSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">📱 Daily Routine</h2>
    
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🌅 Morning Routine (Every Single Day)</h3>
      <div className="space-y-3">
        <div className="bg-gray-100 border-l-4 border-gray-500 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-2">8:00 AM - Staff Arrives</h4>
          <ul className="space-y-1 text-gray-700">
            <li>• Come 30-45 minutes early</li>
            <li>• Check yesterday's results on board</li>
            <li>• Complete opening checklist</li>
          </ul>
        </div>

        <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4">
          <h4 className="font-bold text-green-900 mb-2">7:30 AM - TEAM HUDDLE (15 minutes) - NON-NEGOTIABLE!</h4>
          <ol className="list-decimal list-inside space-y-1 text-green-800 ml-4">
            <li>Review yesterday's results - celebrate wins! (3 min)</li>
            <li>Today's target: R15,000 (1 min)</li>
            <li>Today's special promotion (1 min)</li>
            <li>Today's focus: "Get 3+ items per basket!" (2 min)</li>
            <li>Quick practice: Role-play one sales scenario (5 min)</li>
            <li>Team chant: "LET'S MAKE IT HAPPEN!" (1 min)</li>
            <li>Everyone writes personal goal on board (2 min)</li>
          </ol>
        </div>

        <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">8:00 AM - OPEN DOORS</h4>
          <p className="text-blue-800">Everyone ready with big smiles! First customer gets special attention.</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">☀️ During The Day</h3>
      <div className="space-y-3">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4">
          <h4 className="font-bold text-yellow-900 mb-2">Every 2 Hours:</h4>
          <ul className="space-y-1 text-yellow-800">
            <li>• Update on sales' current total</li>
            <li>• Quick check-in: "How are we doing? Need help?"</li>
            <li>• Adjust energy if behind target</li>
          </ul>
        </div>

        <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4">
          <h4 className="font-bold text-red-900 mb-2">🔥 Peak Hours (12-2pm, 4-5pm):</h4>
          <ul className="space-y-1 text-red-800">
            <li>🔥 All hands on deck</li>
            <li>💪 Maximum customer engagement</li>
            <li>🛒 Focus on upselling</li>
            <li>🤝 Team supports each other</li>
          </ul>
        </div>

        <div className="bg-purple-100 border-l-4 border-purple-500 rounded-lg p-4">
          <h4 className="font-bold text-purple-900 mb-2">Manager Walks Floor (Every Hour):</h4>
          <ul className="space-y-1 text-purple-800">
            <li>• Observe customer interactions</li>
            <li>• Praise good behaviors immediately</li>
            <li>• Coach gently: "Try suggesting the bundle next time"</li>
            <li>• Help with difficult customers</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🌆 Evening Routine (Every Single Day)</h3>
      <div className="space-y-3">
        <div className="bg-gray-100 border-l-4 border-gray-500 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-2">5:00 PM - Closing Time</h4>
          <ul className="space-y-1 text-gray-700">
            <li>• Calculate final sales total</li>
            <li>• Complete closing duties</li>
          </ul>
        </div>

        <div className="bg-green-100 border-l-4 border-green-500 rounded-lg p-4">
          <h4 className="font-bold text-green-900 mb-2">5:15 PM - TEAM HUDDLE (15 minutes) - NON-NEGOTIABLE!</h4>
          <ol className="list-decimal list-inside space-y-1 text-green-800 ml-4">
            <li>Announce results: "We made R______!" (1 min)</li>
            <li>Hit target? YES = Celebrate! NO = Analyze why (3 min)</li>
            <li>Recognize today's top performer (2 min)</li>
            <li>Share one great customer story (3 min)</li>
            <li>What worked well today? (2 min)</li>
            <li>What can improve tomorrow? (2 min)</li>
            <li>Preview tomorrow's goal (1 min)</li>
            <li>High-five and go home! (1 min)</li>
          </ol>
        </div>

        <div className="bg-indigo-100 border-l-4 border-indigo-500 rounded-lg p-4">
          <h4 className="font-bold text-indigo-900 mb-2">Manager:</h4>
          <ul className="space-y-1 text-indigo-800">
            <li>• Complete daily report (5 minutes)</li>
            <li>• Post results on board for tomorrow</li>
            <li>• If target met: Take team photo for recognition wall!</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 text-center">
      <div className="text-5xl mb-4">💪</div>
      <h3 className="text-2xl font-bold mb-3">LET'S MAKE IT HAPPEN!</h3>
      <p className="text-lg">
        Consistency is key. Follow this routine every single day,<br />
        and watch your sales soar! 🚀
      </p>
    </div>
  </div>
);

export default SalesSOPView;