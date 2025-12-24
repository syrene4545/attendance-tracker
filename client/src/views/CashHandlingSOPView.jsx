import React, { useState } from 'react';
import { 
  DollarSign,
  CreditCard,
  Lock,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  ArrowLeft,
  Receipt,
  Banknote,
  Calculator,
  FileText
} from 'lucide-react';

const CashHandlingSOPView = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'till-opening', label: 'Till Opening', icon: Clock },
    { id: 'transactions', label: 'Processing Transactions', icon: CreditCard },
    { id: 'cash-management', label: 'Cash Management', icon: Banknote },
    { id: 'till-closing', label: 'Till Closing', icon: Calculator },
    { id: 'refunds', label: 'Refunds & Exchanges', icon: Receipt },
    { id: 'fraud-prevention', label: 'Fraud Prevention', icon: Shield },
    { id: 'banking', label: 'Banking Procedures', icon: TrendingUp },
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
          <h1 className="text-4xl font-bold mb-2">💰 Cash Handling & Financial SOP</h1>
          <p className="text-xl text-green-100 mb-6">Protecting Company Assets Through Proper Procedures</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">R1,000</div>
              <div className="text-sm text-green-100">Standard Float</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">1x</div>
              <div className="text-sm text-green-100">Daily Till Counts</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">R20,000</div>
              <div className="text-sm text-green-100">Max Cash Limit</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-green-100">Accuracy Required</div>
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
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'till-opening' && <TillOpeningSection />}
            {activeSection === 'transactions' && <TransactionsSection />}
            {activeSection === 'cash-management' && <CashManagementSection />}
            {activeSection === 'till-closing' && <TillClosingSection />}
            {activeSection === 'refunds' && <RefundsSection />}
            {activeSection === 'fraud-prevention' && <FraudPreventionSection />}
            {activeSection === 'banking' && <BankingSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const OverviewSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Cash Handling Overview</h2>
    
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-900 mb-3">Our Commitment</h3>
      <p className="text-lg text-gray-800 mb-4">
        Proper cash handling is critical to our business success. Every employee who handles money 
        must follow these procedures to protect company assets, prevent losses, and maintain customer trust.
      </p>
      <p className="text-lg text-gray-800">
        This SOP covers all aspects of cash handling from opening to closing, including payments, 
        refunds, banking, and fraud prevention.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Core Principles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Security First</h4>
              <p className="text-sm text-gray-700">
                All cash and payment instruments must be kept secure at all times. Never leave 
                tills unattended or unlocked.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calculator className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-purple-900 mb-1">Accuracy is Essential</h4>
              <p className="text-sm text-gray-700">
                Count all money carefully. Double-check calculations. Errors cost the company 
                money and damage customer relationships.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-orange-900 mb-1">Document Everything</h4>
              <p className="text-sm text-gray-700">
                Keep accurate records of all transactions, till counts, and banking. Good 
                documentation protects both you and the company.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900 mb-1">Report Immediately</h4>
              <p className="text-sm text-gray-700">
                Report discrepancies, suspected fraud, or any concerns to your manager 
                immediately. Never try to cover up errors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Responsibilities</h3>
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Personal Accountability:</strong> You are responsible for your assigned till and all transactions processed on it
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Secure Your Till:</strong> Never share your till access with other employees
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Count Carefully:</strong> Count all money received from and given to customers in their presence
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Follow Procedures:</strong> Never deviate from established procedures, even to "help" customers
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Stay Vigilant:</strong> Be aware of common fraud schemes and suspicious behavior
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Ask for Help:</strong> If unsure about any transaction or procedure, ask your manager
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center gap-2">
        <XCircle className="w-6 h-6" />
        Zero Tolerance
      </h3>
      <p className="text-gray-800 mb-3">
        The following actions will result in <strong>immediate dismissal</strong>:
      </p>
      <ul className="space-y-2 text-gray-800">
        <li>• Theft of cash or property (any amount)</li>
        <li>• Intentional till manipulation or fraud</li>
        <li>• Sharing till access codes or passwords</li>
        <li>• Processing fraudulent transactions</li>
        <li>• Accepting bribes or kickbacks</li>
        <li>• Falsifying financial records</li>
        <li>• Unauthorized removal of cash from premises</li>
      </ul>
    </div>
  </div>
);

const TillOpeningSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Till Opening Procedure</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">⏰ When to Open</h3>
      <p className="text-gray-800">
        Tills must be opened <strong>15 minutes before store opening</strong> to ensure all systems 
        are ready for customers. Only the assigned cashier opens their own till.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Opening Steps</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            1
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Collect Your Float</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Sign for your float from the manager/supervisor</li>
              <li>• Standard float: <strong>R1,000</strong></li>
              <li>• Count the float in presence of manager</li>
              <li>• Verify denomination breakdown matches float sheet</li>
              <li>• Sign float collection register</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-blue-50 border-l-4 border-blue-500 p-4">
          <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            2
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Set Up Your Till</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Log into POS system with your unique credentials</li>
              <li>• Place float in till drawer in correct compartments</li>
              <li>• Ensure all notes face the same direction</li>
              <li>• Check you have sufficient coins and notes</li>
              <li>• Check card machine is working (test transaction)</li>
              <li>• Ensure receipt paper is loaded</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-purple-50 border-l-4 border-purple-500 p-4">
          <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            3
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Record Opening Balance</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Enter opening float amount in POS system</li>
              <li>• Complete opening balance form</li>
              <li>• Note date, time, and your name</li>
              <li>• Keep copy for your records</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-orange-50 border-l-4 border-orange-500 p-4">
          <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            4
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Security Checks</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Check till lock is functioning</li>
              <li>• Test your cashier code</li>
              <li>• Ensure no one else has access to your login</li>
              <li>• Be ready for counterfeit detection</li>
              <li>• Note location of panic button</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            5
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Final Readiness Check</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Inform manager till is ready</li>
              <li>• Clear workspace of personal items</li>
              <li>• Have bags, shopping bags, and wrapping ready</li>
              <li>• Make sure till roll is enough for the day</li>
              <li>• Ready to serve first customer at opening time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Float Denomination Breakdown</h3>
      <div className="bg-white rounded-lg p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">Denomination</th>
              <th className="text-center py-2">Quantity</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2">R200 notes</td>
              <td className="text-center">0</td>
              <td className="text-right">R0.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">R100 notes</td>
              <td className="text-center">0</td>
              <td className="text-right">R0.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">R50 notes</td>
              <td className="text-center">4</td>
              <td className="text-right">R200.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">R20 notes</td>
              <td className="text-center">15</td>
              <td className="text-right">R300.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">R10 notes</td>
              <td className="text-center">20</td>
              <td className="text-right">R200.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">R5 coins</td>
              <td className="text-center">20</td>
              <td className="text-right">R100.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">R2 coins</td>
              <td className="text-center">25</td>
              <td className="text-right">R50.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">R1 coins</td>
              <td className="text-center">50</td>
              <td className="text-right">R50.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">50c coins</td>
              <td className="text-center">50</td>
              <td className="text-right">R25.00</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2">20c, 10c, 5c coins</td>
              <td className="text-center">Mixed</td>
              <td className="text-right">R75.00</td>
            </tr>
            <tr className="font-bold bg-green-50">
              <td className="py-2">TOTAL FLOAT</td>
              <td className="text-center"></td>
              <td className="text-right">R1,000.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-red-100 border border-red-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ Float Discrepancy Protocol</h3>
      <p className="text-gray-800 mb-3">
        If your float count does NOT match the signed amount:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-gray-800 ml-4">
        <li>STOP - Do not proceed</li>
        <li>Recount carefully in presence of manager</li>
        <li>If still discrepancy, report to manager immediately</li>
        <li>Complete discrepancy report form</li>
        <li>Both you and manager must sign acknowledgment</li>
        <li>Adjusted amount becomes your opening balance</li>
        <li>DO NOT accept responsibility for shortages not in your control</li>
      </ol>
    </div>
  </div>
);

const TransactionsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Processing Transactions</h2>
    
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Cash Transactions</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h4 className="font-bold text-green-900 mb-3">Step-by-Step Process</h4>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">1. Scan/Enter Items</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Scan each item accurately</li>
              <li>• For manual entry, verify product code twice</li>
              <li>• Check prices appear correctly on screen</li>
              <li>• Verify customer can see prices on customer display</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">2. Announce Total</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Clearly state the total amount: "That's R285.50 please"</li>
              <li>• Give customer time to prepare payment</li>
              <li>• Ensure customer can see the screen total</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">3. Receive Cash</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Take cash from customer</li>
              <li>• <strong>CRITICAL:</strong> Place cash on top of till (not inside) until change given</li>
              <li>• Count cash received OUT LOUD: "Out of R300"</li>
              <li>• Enter amount tendered in POS</li>
              <li>• Check for counterfeit notes (R100, R200 especially)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">4. Give Change</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Count change OUT LOUD back to customer</li>
              <li>• Start from purchase amount and count up to amount given</li>
              <li>• Example: "R285.50... R290 (R5 coin), R300 (R10 note)"</li>
              <li>• Place change in customer's hand</li>
              <li>• <strong>ONLY NOW</strong> place customer's original notes in till</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">5. Complete Transaction</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Offer receipt: "Here is your receipt!"</li>
              <li>• Pack items or provide bag</li>
              <li>• Thank customer: "Thank you, have a great day!"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Card Transactions</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-blue-900 mb-3">✅ Card Payment Process</h4>
            <ol className="text-sm text-gray-700 space-y-2">
              <li>1. Announce total amount to customer</li>
              <li>2. Select "Card" payment method in POS</li>
              <li>3. Enter amount on card machine</li>
              <li>4. Verify amount matches POS total</li>
              <li>5. Ask customer to insert/tap/swipe card</li>
              <li>6. Customer enters PIN (don't watch!)</li>
              <li>7. Wait for "APPROVED" message</li>
              <li>8. Tear off customer copy of slip</li>
              <li>9. Give slip to customer with receipt</li>
              <li>10. Keep merchant copy for reconciliation</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-red-900 mb-3">❌ Card Declined - What to Do</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Stay calm and professional</li>
              <li>• Discreetly inform customer: "It seems the card didn't go through"</li>
              <li>• Suggest trying again</li>
              <li>• Offer alternative: "Would you like to try another card?"</li>
              <li>• <strong>NEVER</strong> announce loudly or embarrass customer</li>
              <li>• If still declined, ask for alternative payment method</li>
              <li>• Call manager if customer becomes difficult</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4 mt-4">
          <p className="font-semibold text-yellow-900 mb-2">⚠️ Split Payments</p>
          <p className="text-sm text-gray-700">
            Customers can pay partially with card and partially with cash:
          </p>
          <ul className="text-sm text-gray-700 space-y-1 mt-2 ml-4">
            <li>1. Ask how much on card: "How much would you like to pay by card?"</li>
            <li>2. Process card payment first</li>
            <li>3. Note balance due</li>
            <li>4. Process cash payment for remaining amount</li>
            <li>5. Keep both slips/receipts together</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">EFT/Bank Transfer Payments</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
          <p className="font-semibold text-orange-900 mb-2">⚠️ EFT Payment Rules</p>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Only for amounts <strong>R1,000 and above</strong></li>
            <li>• Requires manager approval</li>
            <li>• Customer must transfer BEFORE leaving with goods</li>
            <li>• Verify payment received in bank account before releasing items</li>
          </ul>
        </div>

        <h4 className="font-bold text-purple-900 mb-3">EFT Process:</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Complete sale in POS, select "EFT" payment method</li>
          <li>Call manager for approval</li>
          <li>Provide customer with banking details (printed slip from manager)</li>
          <li>Customer makes transfer using phone/app</li>
          <li>Customer shows proof of payment (screenshot/SMS)</li>
          <li><strong>WAIT for manager to confirm payment received in bank account</strong></li>
          <li>Only release goods after manager confirmation</li>
          <li>Staple proof of payment to receipt copy</li>
        </ol>

        <div className="bg-red-100 rounded-lg p-4 mt-4">
          <p className="font-bold text-red-900 mb-2">🚫 NEVER:</p>
          <ul className="text-sm text-red-800 space-y-1 ml-4">
            <li>• Accept screenshot as final proof - must be verified in actual bank account</li>
            <li>• Release high-value goods without manager confirmation</li>
            <li>• Process EFT payments below R1,000 (use cash/card instead)</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Vouchers & Gift Cards</h3>
      <div className="bg-pink-50 border-2 border-pink-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">Company Gift Vouchers:</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Check voucher is not expired</li>
              <li>• Verify voucher number in system</li>
              <li>• Check signature on back matches ID (if required)</li>
              <li>• Process as payment - balance can be used for future purchases</li>
              <li>• No cash refund on unused balance</li>
              <li>• Stamp or mark voucher as "REDEEMED"</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">Third-Party Vouchers (e.g., Discovery, medical aid):</p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Verify we accept this voucher type</li>
              <li>• Check voucher restrictions (certain products only)</li>
              <li>• Call manager for approval if unsure</li>
              <li>• Process according to voucher provider instructions</li>
              <li>• Keep voucher for banking/reconciliation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CashManagementSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Cash Management During Shift</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">🔒 Till Security - CRITICAL RULES</h3>
      <div className="space-y-2 text-gray-800">
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>NEVER</strong> leave your till unattended and unlocked</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>NEVER</strong> allow another person to use your till</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>NEVER</strong> share your login credentials</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>NEVER</strong> leave cash visible on counter</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span><strong>ALWAYS</strong> lock drawer when stepping away (even for 30 seconds)</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <span><strong>ALWAYS</strong> log out of POS when leaving till area</span>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Cash Drops</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
          <p className="font-semibold text-orange-900 mb-2">When to Make a Cash Drop:</p>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• When till exceeds <strong>R20,000 total cash</strong></li>
            <li>• Every 4 hours during busy periods</li>
            <li>• When you have excess large denomination notes (R200, R100)</li>
            <li>• Before leaving for breaks</li>
            <li>• When manager instructs you to</li>
          </ul>
        </div>

        <h4 className="font-bold text-green-900 mb-3">Cash Drop Procedure:</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Count the cash to be dropped (typically R2,000-R3,000)</li>
          <li>Complete cash drop envelope:
            <ul className="ml-6 mt-1 space-y-1 text-sm">
              <li>• Date and time</li>
              <li>• Your name and till number</li>
              <li>• Amount being dropped</li>
              <li>• Breakdown by denomination</li>
            </ul>
          </li>
          <li>Seal cash in tamper-evident envelope</li>
          <li>Record drop in POS system</li>
          <li>Call manager to collect envelope</li>
          <li>Manager verifies amount in your presence (quick count)</li>
          <li>Both sign cash drop register</li>
          <li>Manager places in safe immediately</li>
          <li>Keep your copy of drop slip</li>
        </ol>

        <div className="bg-blue-100 rounded-lg p-4 mt-4">
          <p className="font-semibold text-blue-900 mb-2">💡 Why Cash Drops Matter:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Reduces risk of robbery (less cash visible)</li>
            <li>• Prevents drawer from being too full</li>
            <li>• Makes end-of-day balancing faster</li>
            <li>• Provides paper trail for accountability</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Change Requests</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          If you run low on change during your shift:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Check your till - you may have change in wrong compartments</li>
          <li>Ask manager for change</li>
          <li>Manager provides change from main float</li>
          <li>Exchange must be "like for like" value (R100 note for 5×R20 notes)</li>
          <li>Both count and verify exchange</li>
          <li>Sign change request register</li>
        </ol>

        <div className="bg-yellow-100 rounded-lg p-4 mt-4">
          <p className="font-semibold text-yellow-900 mb-2">⚠️ Common Change Issues:</p>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Running out of coins:</strong> Encourage exact change from customers</li>
            <li>• <strong>Too many coins:</strong> Make a cash drop of excess coins</li>
            <li>• <strong>No small notes:</strong> Request change from manager early (don't wait until completely out)</li>
          </ul>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Mid-Shift Till Count</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          A quick till count should be done at midday (around 13:00) to catch errors early:
        </p>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">Quick Count Process:</p>
            <ol className="text-sm text-gray-700 space-y-1 ml-4">
              <li>1. During quiet moment, press "Till Count" in POS</li>
              <li>2. System shows expected cash (float + cash sales - drops)</li>
              <li>3. Count actual cash in drawer</li>
              <li>4. Compare actual vs. expected</li>
              <li>5. If balanced: Continue working</li>
              <li>6. If variance: Recount carefully</li>
              <li>7. If still variance: Report to manager immediately</li>
            </ol>
          </div>

          <div className="bg-green-100 rounded-lg p-4">
            <p className="font-semibold text-green-900 mb-2">✅ Benefits of Mid-Shift Count:</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Catches errors while you can still remember transactions</li>
              <li>• Easier to correct mistakes during the day</li>
              <li>• Less stress at end of shift</li>
              <li>• Identifies systematic errors (e.g., wrong button pressed)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Break Procedures</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <h4 className="font-bold text-orange-900 mb-3">Before Taking a Break:</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Inform manager you're going on break</li>
          <li>Complete current transaction</li>
          <li>Put up "Till Closed" sign</li>
          <li>Lock till drawer</li>
          <li>Log out of POS system</li>
          <li>Take till key to the manager (don't leave at till)</li>
        </ol>

        <h4 className="font-bold text-orange-900 mb-3 mt-4">Returning from Break:</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Log back into POS</li>
          <li>Unlock till</li>
          <li>Quick visual check of cash (verify nothing missing)</li>
          <li>Remove "Till Closed" sign</li>
          <li>Resume serving customers</li>
        </ol>

        <div className="bg-red-100 rounded-lg p-4 mt-4">
          <p className="font-bold text-red-900 mb-2">🚫 NEVER:</p>
          <ul className="text-sm text-red-800 space-y-1 ml-4">
            <li>• Leave till unlocked during breaks</li>
            <li>• Allow someone else to use your till while on break</li>
            <li>• Leave key at the till</li>
            <li>• Take extended breaks without manager approval</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const TillClosingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Till Closing Procedure</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">⏰ Closing Time</h3>
      <p className="text-gray-800">
        Begin till closing procedure <strong>immediately after last customer</strong> (after 17:00 weekdays, 
        15:00 Saturdays). Budget at least 30-45 minutes for proper closing.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Step-by-Step Closing</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-4 bg-purple-50 border-l-4 border-purple-500 p-4">
          <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            1
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Close Till in POS</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Complete any pending transactions</li>
              <li>• Select "End of Day" or "Close Till" in POS</li>
              <li>• System generates expected cash amount</li>
              <li>• Print Z-Report (daily sales summary)</li>
              <li>• Print till closure report</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            2
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Count Your Cash</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Remove all cash from drawer</li>
              <li>• Count each denomination separately</li>
              <li>• Use denomination counting sheet</li>
              <li>• Count twice to ensure accuracy</li>
              <li>• Start with highest denominations (R200, R100, R50...)</li>
              <li>• Bundle notes in sets of 10 or 20</li>
              <li>• Roll coins if large quantities</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-blue-50 border-l-4 border-blue-500 p-4">
          <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            3
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Reconcile Cash</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Calculate: Opening Float + Cash Sales - Cash Drops = Expected Cash</li>
              <li>• Compare actual counted cash with expected cash</li>
              <li>• Check variance: Actual - Expected = Over/Under</li>
              <li>• Acceptable variance: ±R5</li>
              <li>• If variance &gt; R5: Recount before reporting</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-orange-50 border-l-4 border-orange-500 p-4">
          <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            4
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Count Card Transactions</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Collect all card machine slips (merchant copies)</li>
              <li>• Count number of card transactions</li>
              <li>• Add up total value of card sales</li>
              <li>• Compare with POS card sales total</li>
              <li>• Investigate any discrepancies</li>
              <li>• Attach slips to reconciliation report</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            5
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Complete Reconciliation Form</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Fill in all sections of till reconciliation form</li>
              <li>• Include: Date, cashier name, till number, times</li>
              <li>• Opening float amount</li>
              <li>• Cash sales from Z-report</li>
              <li>• Cash drops total</li>
              <li>• Expected vs. actual cash</li>
              <li>• Variance (if any) and explanation</li>
              <li>• Card sales total</li>
              <li>• Sign and date the form</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            6
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Manager Verification</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Call manager to verify your closing</li>
              <li>• Manager spot-checks cash count</li>
              <li>• Manager reviews reconciliation form</li>
              <li>• Discuss any variances</li>
              <li>• Manager signs approval</li>
              <li>• Address any concerns or errors</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-indigo-50 border-l-4 border-indigo-500 p-4">
          <div className="bg-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            7
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Banking Preparation</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Remove tomorrow's float (R1,000)</li>
              <li>• Place in designated float bag/envelope</li>
              <li>• Label with your name for tomorrow</li>
              <li>• Remaining cash goes in banking bag</li>
              <li>• Seal banking bag with tamper-evident seal</li>
              <li>• Complete banking deposit slip</li>
              <li>• Manager takes banking bag</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-4 bg-teal-50 border-l-4 border-teal-500 p-4">
          <div className="bg-teal-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
            8
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2">Final Clean-Up</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Remove all cash from till drawer</li>
              <li>• Clean and organize till area</li>
              <li>• Check receipt paper for tomorrow</li>
              <li>• File all paperwork in correct folders</li>
              <li>• Log out of POS system</li>
              <li>• Lock till drawer</li>
              <li>• Return till key to manager</li>
              <li>• You're done! ✓</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Handling Variances</h3>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-green-900 mb-3">✅ Cash Over (Surplus)</h4>
            <p className="text-sm text-gray-700 mb-2">You have MORE cash than expected:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Recount carefully</li>
              <li>• Check if you gave wrong change to customer</li>
              <li>• Check for duplicate entries in POS</li>
              <li>• Report to manager</li>
              <li>• Surplus goes to company</li>
              <li>• Complete variance report</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-red-900 mb-3">❌ Cash Under (Shortage)</h4>
            <p className="text-sm text-gray-700 mb-2">You have LESS cash than expected:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Recount very carefully</li>
              <li>• Check all pockets/compartments</li>
              <li>• Review transactions for errors</li>
              <li>• Check if cash drop was recorded</li>
              <li>• Report to manager</li>
              <li>• Complete variance report with explanation</li>
            </ul>
          </div>
        </div>

        <div className="bg-red-100 rounded-lg p-4 mt-4">
          <h4 className="font-bold text-red-900 mb-3">Variance Consequences</h4>
          <div className="text-sm text-gray-800 space-y-2">
            <p><strong>Small variance (±R5):</strong> Acceptable, note in report</p>
            <p><strong>Medium variance (R5-R50):</strong> Verbal warning, retraining required</p>
            <p><strong>Large variance (&gt;R50):</strong> Written warning, investigation</p>
            <p><strong>Repeated variances:</strong> Progressive discipline, possible dismissal</p>
            <p><strong>Suspected theft:</strong> Immediate suspension, investigation, prosecution</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-900 mb-3">💡 Tips for Accurate Closing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ul className="text-sm text-gray-700 space-y-2">
          <li>✓ Count in a quiet, well-lit area</li>
          <li>✓ Remove distractions</li>
          <li>✓ Count twice, write once</li>
          <li>✓ Use a calculator</li>
          <li>✓ Sort and bundle notes neatly</li>
        </ul>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>✓ Keep different denominations separate</li>
          <li>✓ Count with a colleague watching</li>
          <li>✓ Take your time - accuracy over speed</li>
          <li>✓ If tired, take a short break then count fresh</li>
          <li>✓ Ask for help if struggling</li>
        </ul>
      </div>
    </div>
  </div>
);

const RefundsSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Refunds & Exchanges</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ Refund Authority</h3>
      <p className="text-gray-800 mb-3">
        <strong>ALL refunds require manager approval.</strong> Never process a refund without calling 
        your manager first, regardless of the amount.
      </p>
      <div className="bg-white rounded-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">Why manager approval is required:</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Protects you from fraud attempts</li>
          <li>• Ensures company policy is followed</li>
          <li>• Provides proper documentation</li>
          <li>• Prevents mistakes and manipulation</li>
        </ul>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Refund Policy</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h4 className="font-bold text-blue-900 mb-3">When We Give Refunds:</h4>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">✅ Valid Reasons for Refund:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Product defective or damaged</li>
              <li>• Wrong item given to customer (our error)</li>
              <li>• Double-charged transaction</li>
              <li>• Incorrect price charged (system error)</li>
              <li>• Product expired when sold</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">❌ When We DON'T Give Refunds:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Customer changed their mind (offer exchange instead)</li>
              <li>• No receipt and cannot verify purchase</li>
              <li>• Item opened/used (medicines, cosmetics - health regulations)</li>
              <li>• Item purchased more than 30 days ago</li>
              <li>• Sale items (as per signage)</li>
              <li>• Items on special promotion (unless defective)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Refund Process</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <ol className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900 mb-2">1. Verify Eligibility</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Ask for original receipt (essential)</li>
              <li>• Check purchase date (must be within 30 days)</li>
              <li>• Inspect item (unopened, unused, with tags)</li>
              <li>• Verify item matches receipt</li>
              <li>• Confirm reason for refund is valid</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900 mb-2">2. Call Manager for Approval</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Explain situation to manager</li>
              <li>• Show receipt and item</li>
              <li>• Wait for manager's decision</li>
              <li>• If approved, proceed to next step</li>
              <li>• If declined, politely explain to customer</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900 mb-2">3. Process Refund in POS</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Select "Refund" function in POS</li>
              <li>• Scan item or enter product code</li>
              <li>• Enter refund amount</li>
              <li>• Select refund method (cash/card/voucher)</li>
              <li>• Manager enters authorization code</li>
              <li>• Print refund slip</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900 mb-2">4. Complete Refund Documentation</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Complete refund form (manual form)</li>
              <li>• Customer signs refund form</li>
              <li>• Attach original receipt to refund form</li>
              <li>• Manager signs authorization</li>
              <li>• Give customer their refund slip copy</li>
              <li>• File paperwork correctly</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-bold text-gray-900 mb-2">5. Issue Refund</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Cash refund:</strong> Count cash carefully, give to customer</li>
              <li>• <strong>Card refund:</strong> Reverse transaction on same card (customer must have card)</li>
              <li>• <strong>Store credit:</strong> Issue voucher if customer prefers</li>
              <li>• Thank customer politely</li>
            </ul>
          </div>
        </ol>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Exchanges</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          Exchanges are generally easier than refunds and don't require manager approval for same-value swaps:
        </p>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">Same Value Exchange (No approval needed):</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Customer wants different color/size of same item</li>
              <li>• Must have receipt</li>
              <li>• Item must be unopened/unused</li>
              <li>• Within 30 days of purchase</li>
              <li>• Simply exchange items, update receipt</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">Different Value Exchange (Requires approval):</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Customer exchanges for more expensive item → pay difference</li>
              <li>• Customer exchanges for cheaper item → refund difference (needs approval)</li>
              <li>• Call manager for approval</li>
              <li>• Process as partial refund + new sale</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-orange-900 mb-3">🚫 Common Refund Scams - Be Alert!</h3>
      <div className="space-y-3">
        <div className="bg-white rounded-lg p-4">
          <p className="font-semibold text-red-900 mb-2">Receipt Fraud:</p>
          <p className="text-sm text-gray-700">
            Customer presents receipt from another store or old receipt. 
            <strong> Always verify receipt is from our store and matches item.</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <p className="font-semibold text-red-900 mb-2">Shoplifting Return:</p>
          <p className="text-sm text-gray-700">
            Customer steals item, then "returns" it for refund. 
            <strong> Always require original receipt. No receipt = no refund.</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <p className="font-semibold text-red-900 mb-2">Double Refund:</p>
          <p className="text-sm text-gray-700">
            Customer gets refund, then tries again at different till/time. 
            <strong> Stamp receipts as "REFUNDED" after processing.</strong>
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <p className="font-semibold text-red-900 mb-2">Fake Receipt:</p>
          <p className="text-sm text-gray-700">
            Customer presents forged/altered receipt. 
            <strong> Check receipt looks genuine - call manager if suspicious.</strong>
          </p>
        </div>
      </div>
    </div>
  </div>
);

const FraudPreventionSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Fraud Prevention</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">🛡️ Your Role in Loss Prevention</h3>
      <p className="text-gray-800 mb-3">
        Fraud and theft cost our business thousands of rands annually. As a cashier, you are the 
        <strong> first line of defense</strong> against financial crime. Stay alert and follow procedures.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Counterfeit Money Detection</h3>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
          <p className="font-semibold text-orange-900 mb-2">High-Risk Notes:</p>
          <p className="text-sm text-orange-800">
            R200 and R100 notes are most commonly counterfeited. 
            <strong> Check EVERY large note carefully.</strong>
          </p>
        </div>

        <h4 className="font-bold text-yellow-900 mb-3">How to Detect Fake Notes:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">✅ FEEL:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Genuine notes have rough texture (not smooth paper)</li>
              <li>• Raised print areas (you can feel the ink)</li>
              <li>• Crisp feel, not floppy</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">✅ LOOK:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Watermark (Big 5 animals) visible when held to light</li>
              <li>• Security thread running through note</li>
              <li>• Color-shifting ink (changes color when tilted)</li>
              <li>• Sharp, clear printing (not blurry)</li>
              <li>• Matching serial numbers on both sides</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">✅ TILT:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Color changes when you tilt note</li>
              <li>• Hologram shows different images</li>
              <li>• Metallic strip visible</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">✅ CHECK:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use counterfeit detection pen</li>
              <li>• UV light (if available)</li>
              <li>• Compare with known genuine note</li>
            </ul>
          </div>
        </div>

        <div className="bg-red-100 rounded-lg p-4 mt-4">
          <h4 className="font-bold text-red-900 mb-3">If You Suspect a Counterfeit Note:</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-800 ml-4">
            <li><strong>Stay calm</strong> - don't alarm the customer</li>
            <li><strong>Politely hold onto the note</strong> - "Let me just check this quickly"</li>
            <li><strong>Use counterfeit pen</strong> - check in customer's presence</li>
            <li><strong>Call manager discreetly</strong> - use code phrase "Manager to till 1 please"</li>
            <li><strong>Let manager handle</strong> - manager will verify and deal with customer</li>
            <li><strong>Never accuse customer</strong> - they may have received it innocently</li>
            <li><strong>If confirmed fake:</strong> Manager retains note, provides receipt, reports to police</li>
          </ol>
          <p className="text-sm text-red-800 mt-3">
            <strong>⚠️ NEVER accept a note you're suspicious about just to avoid confrontation!</strong>
          </p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Card Fraud Prevention</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Red Flags - Suspicious Card Transactions:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>⚠️ Customer tries multiple cards that decline</li>
              <li>⚠️ Card has no name or different name than ID</li>
              <li>⚠️ Customer seems nervous or in a hurry</li>
              <li>⚠️ Card looks damaged or tampered with</li>
              <li>⚠️ Signature on card doesn't match signature on slip</li>
              <li>⚠️ Customer buying unusual quantities of high-value items</li>
              <li>⚠️ Customer doesn't know their PIN (keeps trying different numbers)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">What to Do:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✓ For high-value purchases (R1,000+): Ask for ID</li>
              <li>✓ Compare ID name with card name</li>
              <li>✓ Check signature on card matches ID signature</li>
              <li>✓ If suspicious, call manager</li>
              <li>✓ Manager may call bank to verify card</li>
              <li>✓ Never hand card back if suspected stolen - retain for manager</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4 mt-4">
          <p className="font-semibold text-yellow-900 mb-2">Card-Not-Present Fraud:</p>
          <p className="text-sm text-gray-700">
            We do NOT accept phone/online card payments in-store. Customer must be physically 
            present with card. Exception: Pre-approved EFT transfers only.
          </p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Common Cash Scams</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
            <p className="font-bold text-red-900 mb-2">1. The Quick Change Artist</p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Scam:</strong> Customer keeps changing their mind about payment, asking for different 
              change combinations to confuse you. While you're confused, they shortchange you.
            </p>
            <p className="text-sm text-green-700">
              <strong>Prevention:</strong> If customer keeps changing, stop. Put all money down. 
              Start fresh. Never let customer rush you. It's OK to say "Let me start over".
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
            <p className="font-bold text-orange-900 mb-2">2. The Short-Changer</p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Scam:</strong> Customer claims you gave them wrong change after they've walked away 
              from till. "You gave me R50 change but I gave you R100!"
            </p>
            <p className="text-sm text-green-700">
              <strong>Prevention:</strong> ALWAYS place customer's money on top of till until change is 
              given. Count change OUT LOUD. Only put customer's money in drawer after they accept change.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
            <p className="font-bold text-yellow-900 mb-2">3. The Distraction</p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Scam:</strong> One person distracts you (asks questions, drops something) while 
              accomplice steals from open till or switches notes.
            </p>
            <p className="text-sm text-green-700">
              <strong>Prevention:</strong> Never leave till open and unattended. Complete one transaction 
              before helping with questions. Close drawer between customers. Be aware of your surroundings.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <p className="font-bold text-purple-900 mb-2">4. The Note Switch</p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Scam:</strong> Customer hands you R100 note. While you count change, they swap it 
              for a R50 note and claim they gave you R100.
            </p>
            <p className="text-sm text-green-700">
              <strong>Prevention:</strong> Place money on top of till (not in hand or on counter). 
              Don't give back customer's money until transaction complete. If customer takes money back, 
              void transaction and start over.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-pink-500">
            <p className="font-bold text-pink-900 mb-2">5. The Fake Receipt Refund</p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Scam:</strong> Customer brings fake/altered receipt and item they didn't purchase 
              from us (stolen, bought elsewhere, or found outside).
            </p>
            <p className="text-sm text-green-700">
              <strong>Prevention:</strong> Check receipt is genuine (our format, matches date/time). 
              Verify item matches receipt description. Check item price is current. When in doubt, call manager. 
              ALL refunds need manager approval anyway.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Internal Fraud Prevention</h3>
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <p className="text-gray-800 mb-4">
          Unfortunately, some losses come from employee theft. Protect yourself and the company:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-red-900 mb-3">🚫 Never Do These:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Void transactions without manager approval</li>
              <li>• Give discounts without authorization</li>
              <li>• Process transactions for yourself</li>
              <li>• Let friends/family use your till</li>
              <li>• Take cash from till before end of day</li>
              <li>• Share your login credentials</li>
              <li>• Accept payments "off the books"</li>
              <li>• Manipulate receipts or reports</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-green-900 mb-3">✅ Always Do These:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Ring up EVERY transaction</li>
              <li>• Give customer their receipt</li>
              <li>• Report if you see colleague stealing</li>
              <li>• Follow proper refund procedures</li>
              <li>• Keep personal items away from till</li>
              <li>• Lock till when leaving area</li>
              <li>• Report suspicious colleague behavior</li>
              <li>• Maintain integrity at all times</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mt-4">
          <p className="font-semibold text-gray-900 mb-2">Remember:</p>
          <p className="text-sm text-gray-700">
            You are personally accountable for your till. Even small acts of dishonesty 
            (helping friend avoid paying, taking R5 from drawer) constitute theft and will 
            result in <strong>immediate dismissal and criminal prosecution</strong>.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const BankingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Banking Procedures</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">💼 Who Handles Banking</h3>
      <p className="text-gray-800">
        Banking is typically handled by the <strong>Store Manager or designated senior staff</strong>. 
        As a cashier, you prepare banking bags as part of till closing, but you don't usually take 
        deposits to the bank yourself.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Preparing Banking Bags</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          As part of till closing, you prepare your cash for banking:
        </p>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">1. Separate Float from Banking</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Count out R1,000 for tomorrow's float</li>
              <li>• Place in designated float bag/envelope</li>
              <li>• Label with your name and tomorrow's date</li>
              <li>• Give to manager to secure in safe</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">2. Prepare Remaining Cash for Banking</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• All remaining cash goes in banking bag</li>
              <li>• Sort by denomination (notes separate from coins)</li>
              <li>• Count and bundle:
                <ul className="ml-6 mt-1 space-y-0.5">
                  <li>- Notes: Bundle in 10s or 20s with elastic bands</li>
                  <li>- Coins: Use coin bags if large amounts, or leave loose</li>
                </ul>
              </li>
              <li>• All notes should face same direction</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">3. Complete Banking Documentation</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Fill in bank deposit slip with:
                <ul className="ml-6 mt-1 space-y-0.5">
                  <li>- Date</li>
                  <li>- Store name and account number</li>
                  <li>- Cash breakdown by denomination</li>
                  <li>- Total cash amount</li>
                  <li>- Your signature</li>
                </ul>
              </li>
              <li>• Place deposit slip in banking bag</li>
              <li>• Complete banking bag label (date, amount, preparer name)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-2">4. Seal and Hand Over</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Place all cash and documents in tamper-evident banking bag</li>
              <li>• Seal bag completely (cannot be opened without breaking seal)</li>
              <li>• Record seal number on banking register</li>
              <li>• Hand to manager and get signature for receipt</li>
              <li>• Manager places in safe until banking run</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Banking Bag Contents Checklist</h3>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <p className="text-gray-700 mb-3">Before sealing banking bag, ensure it contains:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3">
            <p className="font-semibold text-gray-900 mb-2">Documents:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>☐ Completed bank deposit slip</li>
              <li>☐ Copy of Z-report</li>
              <li>☐ Till reconciliation form</li>
              <li>☐ List of cash drops (if any)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-3">
            <p className="font-semibold text-gray-900 mb-2">Cash:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>☐ All notes bundled and labeled</li>
              <li>☐ Coins bagged or counted</li>
              <li>☐ Total matches banking slip</li>
              <li>☐ No float cash included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Bank Deposit Slip Example</h3>
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="bg-gray-100 rounded-lg p-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-300">
                <td className="py-2"><strong>Date:</strong></td>
                <td className="py-2">21/12/2025</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2"><strong>Account Name:</strong></td>
                <td className="py-2">Lera Health</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2"><strong>Account Number:</strong></td>
                <td className="py-2">9364671431</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-2"><strong>Bank Name:</strong></td>
                <td className="py-2">ABSA</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4">
            <p className="font-semibold mb-2">Cash Breakdown:</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-400">
                  <th className="text-left py-1">Denomination</th>
                  <th className="text-center py-1">Quantity</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="py-1">R200 notes</td>
                  <td className="text-center">15</td>
                  <td className="text-right">R3,000.00</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1">R100 notes</td>
                  <td className="text-center">28</td>
                  <td className="text-right">R2,800.00</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1">R50 notes</td>
                  <td className="text-center">35</td>
                  <td className="text-right">R1,750.00</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1">R20 notes</td>
                  <td className="text-center">42</td>
                  <td className="text-right">R840.00</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1">R10 notes</td>
                  <td className="text-center">38</td>
                  <td className="text-right">R380.00</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-1">Coins (all)</td>
                  <td className="text-center">-</td>
                  <td className="text-right">R450.00</td>
                </tr>
                <tr className="font-bold bg-green-100">
                  <td className="py-2">TOTAL CASH DEPOSIT</td>
                  <td className="text-center"></td>
                  <td className="text-right">R9,220.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-gray-400">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Prepared by:</strong> ________________</p>
                <p className="text-xs text-gray-600 mt-1">(Cashier signature)</p>
              </div>
              <div>
                <p><strong>Verified by:</strong> ________________</p>
                <p className="text-xs text-gray-600 mt-1">(Manager signature)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ Banking Security Rules</h3>
      <div className="space-y-2 text-gray-800">
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Seal integrity:</strong> Banking bag seal must be intact. If broken, report immediately.</span>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Confidentiality:</strong> Never discuss banking amounts in public or with unauthorized persons</span>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Vary routine:</strong> Manager varies banking times and routes for security</span>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Security escort:</strong> Never go to bank alone with large amounts (use security/police escort if needed)</span>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Immediate deposit:</strong> Cash must be banked within 24 hours of collection</span>
        </div>
      </div>
    </div>

    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">Card Sales Reconciliation</h3>
      <p className="text-gray-700 mb-3">
        Card sales don't go in the banking bag (money is electronic). Instead:
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>• Collect all card machine merchant slips</li>
        <li>• Add up total value</li>
        <li>• Compare with POS card sales total</li>
        <li>• Must match exactly</li>
        <li>• Attach slips to reconciliation paperwork</li>
        <li>• Manager files for bank statement verification</li>
        <li>• Card funds appear in bank account within 1-3 business days</li>
      </ul>
    </div>
  </div>
);

export default CashHandlingSOPView;