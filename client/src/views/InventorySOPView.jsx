import React, { useState } from 'react';
import { 
  Package,
  TrendingUp,
  ClipboardCheck,
  Truck,
  RotateCcw,
  AlertTriangle,
  Calendar,
  BarChart3,
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Search,
  Archive,
  ShoppingCart
} from 'lucide-react';

const InventorySOPView = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Inventory Overview', icon: Package },
    { id: 'receiving', label: 'Receiving Stock', icon: Truck },
    { id: 'storage', label: 'Storage & Organization', icon: Archive },
    { id: 'stock-rotation', label: 'Stock Rotation', icon: RotateCcw },
    { id: 'counting', label: 'Stock Counting', icon: ClipboardCheck },
    { id: 'ordering', label: 'Ordering Procedures', icon: ShoppingCart },
    { id: 'expiry', label: 'Expiry Management', icon: Calendar },
    { id: 'shrinkage', label: 'Shrinkage Control', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
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
          <h1 className="text-4xl font-bold mb-2">📦 Inventory Management SOP</h1>
          <p className="text-xl text-indigo-100 mb-6">Optimizing Stock Control & Minimizing Losses</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-indigo-100">Accuracy Target</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">FIFO</div>
              <div className="text-sm text-indigo-100">Rotation Method</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">&lt;2%</div>
              <div className="text-sm text-indigo-100">Shrinkage Goal</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">Daily</div>
              <div className="text-sm text-indigo-100">Stock Checks</div>
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
                      ? 'bg-indigo-100 text-indigo-700'
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
            {activeSection === 'receiving' && <ReceivingSection />}
            {activeSection === 'storage' && <StorageSection />}
            {activeSection === 'stock-rotation' && <StockRotationSection />}
            {activeSection === 'counting' && <CountingSection />}
            {activeSection === 'ordering' && <OrderingSection />}
            {activeSection === 'expiry' && <ExpirySection />}
            {activeSection === 'shrinkage' && <ShrinkageSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SECTION COMPONENTS ====================

const OverviewSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Inventory Management Overview</h2>
    
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-indigo-900 mb-3">Why Inventory Management Matters</h3>
      <p className="text-lg text-gray-800 mb-4">
        Effective inventory management is the backbone of retail success. Proper stock control ensures:
      </p>
      <ul className="space-y-2 text-gray-800">
        <li>✓ Products are always available when customers need them</li>
        <li>✓ Capital isn't tied up in excess stock</li>
        <li>✓ Products are sold before they expire</li>
        <li>✓ Shrinkage and losses are minimized</li>
        <li>✓ Accurate financial reporting and profitability</li>
      </ul>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Inventory Principles</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">FIFO - First In, First Out</h4>
              <p className="text-sm text-gray-700">
                Always sell oldest stock first. New stock goes to the back, old stock pulled forward. 
                Critical for items with expiry dates.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-900 mb-1">Accuracy is Everything</h4>
              <p className="text-sm text-gray-700">
                System stock must match physical stock. Inaccurate records lead to stockouts, 
                over-ordering, and financial losses.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-purple-900 mb-1">Right Stock, Right Time</h4>
              <p className="text-sm text-gray-700">
                Balance between having enough stock to meet demand and avoiding excess that ties 
                up cash and risks expiry.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-orange-900 mb-1">Prevent Losses</h4>
              <p className="text-sm text-gray-700">
                Shrinkage from theft, damage, expiry, and errors costs thousands annually. 
                Every item matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Inventory Responsibilities</h3>
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Accuracy:</strong> Ensure every item scanned, counted, and recorded correctly
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Organization:</strong> Keep stock areas tidy, labeled, and systematically arranged
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Rotation:</strong> Always practice FIFO - move old stock forward, new to back
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Vigilance:</strong> Check expiry dates daily, report damaged items immediately
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Reporting:</strong> Notify manager of low stock, fast movers, or discrepancies
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Security:</strong> Prevent theft and damage - handle stock with care
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Inventory Metrics</h3>
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          We track these key performance indicators (KPIs) to measure inventory health:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Stock Accuracy Rate</h4>
            <p className="text-2xl font-bold text-indigo-600 mb-1">Target: 98%</p>
            <p className="text-sm text-gray-600">Physical stock matches system records</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Shrinkage Rate</h4>
            <p className="text-2xl font-bold text-red-600 mb-1">Target: &lt;2%</p>
            <p className="text-sm text-gray-600">Lost/stolen/damaged stock as % of sales</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Stock Turnover</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">Target: 6-8x/year</p>
            <p className="text-sm text-gray-600">How many times inventory is sold annually</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Expiry Write-offs</h4>
            <p className="text-2xl font-bold text-orange-600 mb-1">Target: &lt;0.5%</p>
            <p className="text-sm text-gray-600">Stock written off due to expiry</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Cost of Poor Inventory Management</h3>
      <p className="text-gray-800 mb-3">
        Poor inventory practices directly impact profitability:
      </p>
      <ul className="space-y-2 text-gray-800">
        <li>• <strong>Stockouts:</strong> Lost sales when popular items unavailable (customers shop elsewhere)</li>
        <li>• <strong>Overstocking:</strong> Cash tied up in slow-moving stock, increased expiry risk</li>
        <li>• <strong>Expired Stock:</strong> Total loss - can't sell, can't return (typically R50,000+ annually if not managed)</li>
        <li>• <strong>Shrinkage:</strong> Theft, damage, errors reduce profit margins</li>
        <li>• <strong>Inaccurate Records:</strong> Wrong ordering decisions, customer dissatisfaction</li>
      </ul>
    </div>
  </div>
);

const ReceivingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Receiving Stock</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">📦 Receiving is Critical</h3>
      <p className="text-gray-800">
        Proper receiving procedures prevent discrepancies, ensure quality, and maintain accurate 
        inventory records. <strong>Never rush the receiving process</strong> - errors at this stage 
        cascade through the entire system.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Delivery Arrival Procedure</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white border-l-4 border-green-500 p-4">
            <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Verify Delivery</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Check delivery note/invoice matches your order</li>
                <li>• Verify supplier name and date</li>
                <li>• Note PO (Purchase Order) number</li>
                <li>• Confirm delivery is expected (not unsolicited)</li>
                <li>• If unexpected delivery: Call manager before accepting</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-blue-500 p-4">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Inspect Packaging</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Check boxes/cartons for damage (crushed, wet, torn)</li>
                <li>• Look for signs of tampering or opened seals</li>
                <li>• Check temperature-sensitive items (cold chain intact?)</li>
                <li>• Note any visible damage on delivery note BEFORE signing</li>
                <li>• Take photos of damaged packaging</li>
                <li>• If severely damaged: Refuse delivery, return to sender</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-purple-500 p-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Count Items</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Count EVERY item - don't trust delivery note quantities</li>
                <li>• Open boxes and count individual units (not just cartons)</li>
                <li>• For large deliveries: Two staff count together</li>
                <li>• Count methodically - check off items as you go</li>
                <li>• Separate counted from uncounted stock</li>
                <li>• Note discrepancies immediately</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-orange-500 p-4">
            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Check Quality</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Inspect products for damage (broken, leaking, crushed)</li>
                <li>• <strong>Check expiry dates:</strong> Verify minimum 6 months shelf life (unless agreed otherwise)</li>
                <li>• Check batch numbers are legible</li>
                <li>• Verify product codes match what was ordered</li>
                <li>• Look for counterfeit indicators (if applicable)</li>
                <li>• Reject items with short expiry or damage</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-red-500 p-4">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Document Receipt</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Complete goods received note (GRN)</li>
                <li>• Note actual quantities received (if different from invoice)</li>
                <li>• Document any rejections or damages</li>
                <li>• Get driver signature on discrepancy notes</li>
                <li>• Sign delivery note only after full inspection</li>
                <li>• Write "Received in good order" or "Received with discrepancies - see GRN"</li>
                <li>• Keep all documentation (invoice, delivery note, GRN)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border-l-4 border-indigo-500 p-4">
            <div className="bg-indigo-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              6
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Capture in System</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Enter receipt into inventory system immediately</li>
                <li>• Scan barcodes or enter product codes</li>
                <li>• Input actual quantities received</li>
                <li>• Verify system stock levels updated correctly</li>
                <li>• Attach scanned invoice to system record</li>
                <li>• Flag discrepancies for manager review</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Handling Discrepancies</h3>
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-3">Shortages (Received less than invoiced)</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside ml-4">
              <li>Double-check your count</li>
              <li>Note shortage on delivery note AND GRN</li>
              <li>Driver must sign acknowledgment</li>
              <li>Take photo of shortage</li>
              <li>Manager contacts supplier immediately</li>
              <li>Supplier issues credit note or sends missing items</li>
              <li>Don't pay for items not received</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">Overages (Received more than invoiced)</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside ml-4">
              <li>Note overage on delivery note AND GRN</li>
              <li>Driver must sign acknowledgment</li>
              <li>Set aside excess items (don't integrate into stock yet)</li>
              <li>Manager contacts supplier</li>
              <li>Options: Return excess, get invoice for additional items, or keep as bonus</li>
              <li>Only capture in system after resolution</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-orange-900 mb-3">Damaged Items</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside ml-4">
              <li>Photograph damage clearly</li>
              <li>Note on delivery note: "Item X damaged - rejected"</li>
              <li>Driver signs acknowledgment</li>
              <li>Set aside damaged items (quarantine area)</li>
              <li>Manager arranges return/credit</li>
              <li>Don't capture damaged items in system</li>
              <li>Return to supplier ASAP</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">Wrong Items (Not what was ordered)</h4>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside ml-4">
              <li>Note on delivery note: "Wrong item received"</li>
              <li>Driver signs acknowledgment</li>
              <li>Set aside wrong items</li>
              <li>Manager contacts supplier</li>
              <li>Arrange return and correct item delivery</li>
              <li>Don't stock wrong items</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Special Handling Requirements</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">🧊 Cold Chain Products</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Check temperature immediately upon arrival</li>
              <li>• Vaccines, insulin, biologics must be 2-8°C</li>
              <li>• If temperature out of range: Reject entire shipment</li>
              <li>• Store in fridge immediately - don't leave out</li>
              <li>• Log temperature on cold chain monitoring sheet</li>
              <li>• Never accept thawed/refrozen items</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3">💊 Controlled Substances (Schedule 5-6)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Pharmacist must be present</strong> to receive</li>
              <li>• Check invoice against physical stock very carefully</li>
              <li>• Record in controlled substances register immediately</li>
              <li>• Store in locked safe/cabinet</li>
              <li>• Both pharmacist and deliverer sign register</li>
              <li>• Report any discrepancies to SAHPRA immediately</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-3">💰 High-Value Items</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Count twice (two staff members independently)</li>
              <li>• Store in secure area immediately</li>
              <li>• Manager verifies receipt</li>
              <li>• Extra care with documentation</li>
              <li>• Examples: Expensive cosmetics, supplements, medical devices</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">📦 Bulk Deliveries</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Plan ahead - ensure adequate storage space</li>
              <li>• Two staff members receive together</li>
              <li>• Count systematically (mark counted boxes)</li>
              <li>• May take 1-2 hours - schedule accordingly</li>
              <li>• Use pallet count × items per pallet method</li>
              <li>• Spot-check random boxes for accuracy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">❌ Common Receiving Mistakes to Avoid</h3>
      <div className="space-y-2 text-gray-800">
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Signing before counting</strong> - You accept responsibility for items once signed</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Trusting delivery note quantities</strong> - Always count yourself</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Not checking expiry dates</strong> - Short-dated stock is supplier's problem, not yours</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Accepting damaged goods</strong> - "We'll deal with it later" never works</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Delaying system capture</strong> - Enter receipts same day, while fresh in mind</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span><strong>Rushing the process</strong> - Speed leads to errors, errors cost money</span>
        </div>
      </div>
    </div>
  </div>
);

const StorageSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Storage & Organization</h2>
    
    <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-900 mb-3">🏢 Organized Storage = Efficient Operations</h3>
      <p className="text-gray-800">
        Proper storage protects stock quality, enables FIFO rotation, speeds up picking, and 
        minimizes losses. A messy stockroom costs time and money every single day.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Storage Zones</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">📍 Shop Floor (Front of House)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Purpose:</strong> Display stock for customer purchase</li>
              <li>• <strong>Quantity:</strong> 1-2 weeks' worth of stock</li>
              <li>• <strong>Layout:</strong> Organized by category, easy to find</li>
              <li>• <strong>Replenishment:</strong> Daily, preferably during quiet times</li>
              <li>• <strong>Security:</strong> High-theft items in locked cabinets or behind counter</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-3">📦 Bulk Storage (Storeroom)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Purpose:</strong> Overflow stock, backup inventory</li>
              <li>• <strong>Quantity:</strong> 2-4 weeks' additional stock</li>
              <li>• <strong>Layout:</strong> Systematic, labeled shelves</li>
              <li>• <strong>Organization:</strong> Fast movers near door, slow movers at back</li>
              <li>• <strong>Access:</strong> Staff only, locked when unattended</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">🧊 Cold Storage (Refrigerator)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Purpose:</strong> Temperature-sensitive items (2-8°C)</li>
              <li>• <strong>Items:</strong> Vaccines, insulin, biologics, some eye drops</li>
              <li>• <strong>Monitoring:</strong> Temperature checked 2x daily (morning/evening)</li>
              <li>• <strong>Organization:</strong> Clear labeling, FIFO arrangement</li>
              <li>• <strong>Backup:</strong> Alarm system for temperature excursions</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-3">🔒 Secure Storage (Locked Cabinet/Safe)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Purpose:</strong> Controlled substances, high-value items</li>
              <li>• <strong>Items:</strong> Schedule 5-6 medications, expensive supplements</li>
              <li>• <strong>Access:</strong> Pharmacist/manager only</li>
              <li>• <strong>Recording:</strong> Register for all additions/removals</li>
              <li>• <strong>Audit:</strong> Weekly stock checks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Organization Principles</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">1. Categorization</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Group similar items together (all painkillers in one area, all vitamins in another)</li>
              <li>• Alphabetical within categories (makes finding items faster)</li>
              <li>• Clear category labels on shelves</li>
              <li>• Separate shop floor categories from storeroom organization (if needed)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">2. Accessibility</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Fast movers:</strong> Eye level, near front, easy to reach</li>
              <li>• <strong>Slow movers:</strong> Higher shelves or back areas</li>
              <li>• <strong>Heavy items:</strong> Lower shelves (safety + ease)</li>
              <li>• <strong>Small items:</strong> Bins or baskets (prevents loss)</li>
              <li>• <strong>Bulky items:</strong> Floor space or bottom shelves</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">3. Labeling</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Every shelf/section clearly labeled</li>
              <li>• Include product name and code</li>
              <li>• Labels face forward, easy to read</li>
              <li>• Update labels when stock locations change</li>
              <li>• Use color coding for different categories (optional)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-3">4. Cleanliness</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Shelves dusted daily</li>
              <li>• Floors swept daily, mopped daily</li>
              <li>• No clutter, boxes, or rubbish on floors</li>
              <li>• Spills cleaned immediately</li>
              <li>• Damaged packaging removed and products repacked</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Storage Best Practices</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-green-900 mb-3">✅ DO:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Store products off the floor (use pallets/shelves)</li>
              <li>• Rotate stock using FIFO method</li>
              <li>• Face labels forward for easy reading</li>
              <li>• Group similar expiry dates together</li>
              <li>• Keep storage areas well-lit</li>
              <li>• Maintain proper aisle width (safe movement)</li>
              <li>• Store hazardous items separately</li>
              <li>• Keep fire exits clear at all times</li>
              <li>• Use appropriate shelving (no overloading)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-red-900 mb-3">❌ DON'T:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Store stock directly on floor (pest/moisture risk)</li>
              <li>• Block fire exits or equipment</li>
              <li>• Overload shelves (collapse risk)</li>
              <li>• Mix different products in same location</li>
              <li>• Store items near heat sources</li>
              <li>• Leave damaged packaging unaddressed</li>
              <li>• Store food/drink with medications</li>
              <li>• Use storeroom as eating area</li>
              <li>• Allow personal items in storage areas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Special Storage Requirements</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">🌡️ Temperature-Sensitive Products:</h4>
            <p className="text-sm text-gray-700 mb-2">Store below 25°C or as per label:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Keep away from windows/direct sunlight</li>
              <li>• Air conditioning must be functional</li>
              <li>• Monitor room temperature daily</li>
              <li>• Refrigerated items: 2-8°C (check 2x daily)</li>
              <li>• Never freeze items unless specified</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Light-Sensitive Products:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Store in original amber/opaque containers</li>
              <li>• Keep away from direct light</li>
              <li>• Some vitamins, eye drops particularly sensitive</li>
              <li>• Follow label instructions</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">⚠️ Hazardous Materials:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Separate storage area (if possible)</li>
              <li>• Clear hazard labeling</li>
              <li>• Appropriate ventilation</li>
              <li>• Spill kit nearby</li>
              <li>• Staff trained in handling</li>
              <li>• Examples: Alcohol, peroxide, cleaning chemicals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Stockroom Safety</h3>
      <div className="space-y-2 text-gray-700">
        <p><strong>Personal Safety Equipment:</strong></p>
        <ul className="space-y-1 ml-6">
          <li>• Use step stool/ladder for high shelves (don't climb shelves!)</li>
          <li>• Wear closed-toe shoes (no sandals in stockroom)</li>
          <li>• Lift with legs, not back (bend knees)</li>
          <li>• Get help with heavy items (don't hero-lift)</li>
          <li>• Use trolley for moving multiple items</li>
        </ul>
        <p className="mt-3"><strong>Fire Safety:</strong></p>
        <ul className="space-y-1 ml-6">
          <li>• Know location of fire extinguisher</li>
          <li>• Keep fire exits clear and accessible</li>
          <li>• No smoking in storage areas</li>
          <li>• No space heaters or open flames</li>
          <li>• Report electrical faults immediately</li>
        </ul>
      </div>
    </div>
  </div>
);

const StockRotationSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Stock Rotation - FIFO Method</h2>
    
    <div className="bg-indigo-100 border-2 border-indigo-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-indigo-900 mb-3">🔄 FIFO: First In, First Out</h3>
      <p className="text-gray-800 text-lg mb-3">
        <strong>FIFO is the golden rule of inventory management.</strong> Always sell the oldest 
        stock first to minimize expiry write-offs.
      </p>
      <p className="text-gray-800">
        Simple principle: <strong>New stock goes to the back, old stock pulled to the front.</strong> 
        This ensures products with earliest expiry dates are sold first.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">How to Practice FIFO</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-3">When Receiving New Stock:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li><strong>Check expiry date</strong> on new stock</li>
              <li><strong>Check expiry date</strong> on existing stock</li>
              <li><strong>Compare dates</strong> - new should have later expiry than existing</li>
              <li><strong>If new stock expires SOONER than existing:</strong>
                <ul className="ml-6 mt-1 space-y-0.5">
                  <li>- This is a problem! Contact supplier</li>
                  <li>- Don't accept short-dated stock</li>
                  <li>- If already accepted, inform manager immediately</li>
                </ul>
              </li>
              <li><strong>Place new stock behind existing stock</strong></li>
              <li><strong>Pull old stock forward</strong> to front of shelf</li>
              <li><strong>Double-check</strong> arrangement (oldest at front)</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">When Picking for Sale/Dispensing:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>ALWAYS take from the front</strong> of the shelf</li>
              <li>• Never reach to the back for "fresher" stock</li>
              <li>• If customer asks for item with longer expiry: Explain FIFO policy, offer to exchange if they buy one</li>
              <li>• Check expiry date before selling (must have reasonable shelf life remaining)</li>
              <li>• If front item is short-dated but back item has good date: Flag to manager for review</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">During Replenishment (Moving Stock from Storeroom to Shop Floor):</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li>Check what's already on shelf (note expiry dates)</li>
              <li>Bring stock from storeroom</li>
              <li>Compare expiry dates</li>
              <li>If bringing older stock than what's on shelf: Put in front</li>
              <li>If bringing newer stock: Put behind existing</li>
              <li>Result: Oldest stock always at front</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">FEFO for Short-Dated Items</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-900 mb-2">FEFO = First Expired, First Out</h4>
          <p className="text-sm text-gray-700">
            For items with imminent expiry (less than 3 months), use <strong>FEFO</strong> instead 
            of FIFO. This means checking actual expiry dates, not just assuming first-in = first-out.
          </p>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">When to Use FEFO:</h4>
        <ul className="space-y-2 text-gray-700">
          <li>• When multiple batches with different expiries exist</li>
          <li>• During short-dated stock promotions</li>
          <li>• For slow-moving items approaching expiry</li>
          <li>• When supplier sends mixed batches</li>
        </ul>

        <div className="bg-white rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-gray-900 mb-2">FEFO Procedure:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
            <li>Check expiry date of each item/batch</li>
            <li>Arrange by expiry date (earliest first)</li>
            <li>Label shelves with batch numbers and expiry dates</li>
            <li>Sell/dispense earliest expiry first (regardless of when received)</li>
            <li>Update arrangement as stock is sold</li>
          </ol>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">FIFO Visual Guide</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-green-400">
            <h4 className="font-bold text-green-900 mb-3 text-center">✅ CORRECT FIFO</h4>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-green-200 p-2 rounded">
                  <span className="text-sm font-semibold">FRONT (Customer Side)</span>
                  <span className="text-xs bg-red-200 px-2 py-1 rounded">Exp: 03/2025</span>
                </div>
                <div className="flex items-center justify-between bg-green-100 p-2 rounded">
                  <span className="text-sm">Middle</span>
                  <span className="text-xs bg-orange-200 px-2 py-1 rounded">Exp: 06/2025</span>
                </div>
                <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                  <span className="text-sm">Back</span>
                  <span className="text-xs bg-green-200 px-2 py-1 rounded">Exp: 09/2025</span>
                </div>
              </div>
              <p className="text-xs text-green-800 mt-3 text-center">
                Oldest at front → Newest at back
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-red-400">
            <h4 className="font-bold text-red-900 mb-3 text-center">❌ INCORRECT (Mixed)</h4>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-red-200 p-2 rounded">
                  <span className="text-sm font-semibold">FRONT (Customer Side)</span>
                  <span className="text-xs bg-green-200 px-2 py-1 rounded">Exp: 09/2025</span>
                </div>
                <div className="flex items-center justify-between bg-red-100 p-2 rounded">
                  <span className="text-sm">Middle</span>
                  <span className="text-xs bg-red-200 px-2 py-1 rounded">Exp: 03/2025</span>
                </div>
                <div className="flex items-center justify-between bg-red-50 p-2 rounded">
                  <span className="text-sm">Back</span>
                  <span className="text-xs bg-orange-200 px-2 py-1 rounded">Exp: 06/2025</span>
                </div>
              </div>
              <p className="text-xs text-red-800 mt-3 text-center">
                Random order = Expired stock at back!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Common FIFO Mistakes</h3>
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Just putting new stock on top of old</p>
              <p className="text-sm text-gray-700">This creates random order. Must physically move old stock forward.</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Taking from back because it's "easier"</p>
              <p className="text-sm text-gray-700">Defeats entire purpose of FIFO. Front items will expire.</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Not checking expiry dates when receiving</p>
              <p className="text-sm text-gray-700">If supplier sends short-dated stock, you won't know until it's too late.</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Letting customers pick from back</p>
              <p className="text-sm text-gray-700">If customer wants newer stock, they take from front of display and we rotate behind scenes.</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Inconsistent FIFO (only sometimes)</p>
              <p className="text-sm text-gray-700">FIFO must be practiced EVERY time stock is received or moved. No exceptions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-900 mb-3">FIFO Benefits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-purple-900 mb-2">For the Business:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Minimizes expiry write-offs (saves thousands annually)</li>
            <li>✓ Reduces waste and environmental impact</li>
            <li>✓ Better cash flow (stock turns faster)</li>
            <li>✓ Accurate inventory valuation</li>
            <li>✓ Compliance with regulations</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-purple-900 mb-2">For Customers:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Receive products with maximum shelf life</li>
            <li>✓ Better product quality (fresher stock)</li>
            <li>✓ Trust in store's quality management</li>
            <li>✓ Safer products (especially medicines)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const CountingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Stock Counting Procedures</h2>
    
    <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-blue-900 mb-3">📊 Why We Count Stock</h3>
      <p className="text-gray-800 mb-3">
        Regular stock counting ensures our system records match physical reality. This enables:
      </p>
      <ul className="space-y-1 text-gray-800">
        <li>✓ Accurate financial reporting</li>
        <li>✓ Correct reordering decisions</li>
        <li>✓ Early detection of theft or losses</li>
        <li>✓ Identification of system errors</li>
        <li>✓ Better inventory management overall</li>
      </ul>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Types of Stock Counts</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-3">1. Perpetual Counting (Daily Spot Checks)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">What:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Count a small selection of items every day (10-20 products)
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-2">When:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Daily, during quiet periods
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-2">Who:</p>
                <p className="text-sm text-gray-700">
                  Any staff member (rotating responsibility)
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Purpose:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Catch discrepancies early</li>
                  <li>• Maintain ongoing accuracy</li>
                  <li>• Identify problem items/areas</li>
                  <li>• Less disruptive than full count</li>
                </ul>
                <p className="text-sm font-semibold text-gray-900 mb-2 mt-3">Priority items:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Fast movers</li>
                  <li>• High-value items</li>
                  <li>• High-theft items</li>
                  <li>• Recent discrepancies</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">2. Cycle Counting (Monthly Category Counts)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">What:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Count entire product category each month (e.g., all vitamins in January, all painkillers in February)
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-2">When:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Monthly, scheduled per category
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-2">Who:</p>
                <p className="text-sm text-gray-700">
                  Manager + assigned staff member
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Purpose:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Thorough accuracy within category</li>
                  <li>• Systematic coverage of all stock</li>
                  <li>• Every item counted at least annually</li>
                  <li>• Manageable workload</li>
                </ul>
                <p className="text-sm font-semibold text-gray-900 mb-2 mt-3">Typical schedule:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Month 1: Vitamins & Supplements</li>
                  <li>• Month 2: OTC Medicines</li>
                  <li>• Month 3: Personal Care</li>
                  <li>• Month 4: Baby Care, etc.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">3. Full Stock Take (Annual)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">What:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Count EVERY item in store - complete inventory
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-2">When:</p>
                <p className="text-sm text-gray-700 mb-3">
                  Annually, typically financial year-end (February)
                </p>
                <p className="text-sm font-semibold text-gray-900 mb-2">Who:</p>
                <p className="text-sm text-gray-700">
                  All staff + external auditors (if applicable)
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">Purpose:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Legal/audit requirement</li>
                  <li>• Accurate financial reporting</li>
                  <li>• Calculate annual shrinkage</li>
                  <li>• Reset system records</li>
                  <li>• Identify slow-moving stock</li>
                </ul>
                <p className="text-sm font-semibold text-gray-900 mb-2 mt-3">Requirements:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Store closed during count</li>
                  <li>• Takes 1-2 full days</li>
                  <li>• All staff involved</li>
                  <li>• Independent verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Stock Counting Procedure</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">Preparation:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Ensure stock is tidy and organized (makes counting easier)</li>
              <li>• Have count sheets ready (printed from system or manual)</li>
              <li>• Clipboards, pens, calculators ready</li>
              <li>• Assign counting teams (pairs work best)</li>
              <li>• Brief all staff on procedure</li>
              <li>• Freeze system (no transactions during count)</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">During Count:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li><strong>Systematic approach:</strong> Count methodically, left-to-right, top-to-bottom</li>
              <li><strong>Count physically:</strong> Touch each item as you count</li>
              <li><strong>Out loud:</strong> Count aloud to partner (helps accuracy)</li>
              <li><strong>Record immediately:</strong> Write down count right away (don't trust memory)</li>
              <li><strong>Check packaging:</strong> Count units, not boxes (verify quantities in boxes)</li>
              <li><strong>Note batch/expiry:</strong> Record if multiple batches</li>
              <li><strong>Mark counted areas:</strong> Use stickers or tape to show area counted</li>
              <li><strong>Double-check unclear items:</strong> Recount if unsure</li>
              <li><strong>Ask for help:</strong> If unsure about product identification</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">After Count:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Submit count sheets to manager</li>
              <li>• Manager enters counts into system</li>
              <li>• System generates variance report</li>
              <li>• Investigate large discrepancies (recount if necessary)</li>
              <li>• Adjust system quantities to match physical count</li>
              <li>• Document reasons for variances</li>
              <li>• Identify and address root causes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Counting Best Practices</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-bold text-green-900 mb-3">✅ DO:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Count in pairs (one counts, one records)</li>
              <li>• Take your time - accuracy over speed</li>
              <li>• Recount if numbers seem wrong</li>
              <li>• Count during quiet periods</li>
              <li>• Use systematic approach (section by section)</li>
              <li>• Write clearly and legibly</li>
              <li>• Note any damaged/expired stock separately</li>
              <li>• Report discrepancies honestly</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-red-900 mb-3">❌ DON'T:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Rush the count</li>
              <li>• Estimate or guess quantities</li>
              <li>• Count while tired or distracted</li>
              <li>• Adjust counts to match system</li>
              <li>• Skip items because "they look right"</li>
              <li>• Count during busy periods</li>
              <li>• Work alone on important counts</li>
              <li>• Hide or cover up discrepancies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Handling Variances</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
          Variances (differences between physical count and system) are common. The key is understanding 
          <strong> why</strong> they occurred:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Common Causes of Variances:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Receiving errors (wrong quantity entered)</li>
              <li>• Scanning errors at till</li>
              <li>• Theft (shoplifting or internal)</li>
              <li>• Damage/breakage not recorded</li>
              <li>• Expiry write-offs not captured</li>
              <li>• Stock in multiple locations (not all counted)</li>
              <li>• Counting errors</li>
              <li>• Returns not processed correctly</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Investigation Process:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
              <li>Identify items with significant variances</li>
              <li>Recount to confirm variance is real</li>
              <li>Check recent transactions (sales, receipts, adjustments)</li>
              <li>Review CCTV if theft suspected</li>
              <li>Interview staff involved</li>
              <li>Determine root cause</li>
              <li>Implement corrective action</li>
              <li>Adjust system to match reality</li>
            </ol>
          </div>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Acceptable Variance Levels:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Individual items:</strong> ±1-2 units (small variances acceptable)</li>
            <li>• <strong>Overall accuracy:</strong> Target 98%+ (98% of items count accurate)</li>
            <li>• <strong>Value variance:</strong> &lt;1% of total stock value</li>
            <li>• Large variances always investigated regardless of percentage</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">Stock Count Integrity</h3>
      <p className="text-gray-800 mb-3">
        <strong>Stock counts must be honest and accurate.</strong> Never:
      </p>
      <div className="space-y-2 text-gray-800">
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span>Adjust counts to match system "to avoid discrepancies"</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span>Manipulate counts to hide theft</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span>Rush counts and "fill in numbers" to finish faster</span>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span>Copy last count without actually counting</span>
        </div>
      </div>
      <p className="text-red-900 font-semibold mt-4">
        Dishonest stock counting is fraud and grounds for immediate dismissal.
      </p>
    </div>
  </div>
);

const OrderingSection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Ordering Procedures</h2>
    
    <div className="bg-green-100 border-2 border-green-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-900 mb-3">🛒 Smart Ordering = Profitability</h3>
      <p className="text-gray-800">
        Effective ordering ensures we have the right products, in the right quantities, at the right 
        time. Order too much = tied-up cash and expiry risk. Order too little = stockouts and lost sales.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Ordering Principles</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">1. Reorder Point</h4>
            <p className="text-sm text-gray-700 mb-2">
              Order when stock reaches minimum level (before you run out)
            </p>
            <p className="text-xs text-gray-600">
              Example: Paracetamol reorder point = 50 units. When you have 50 left, order more.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-2">2. Order Quantity</h4>
            <p className="text-sm text-gray-700 mb-2">
              Order enough to last until next delivery (typically 2-4 weeks)
            </p>
            <p className="text-xs text-gray-600">
              Example: Sell 200 units/month, delivery every 2 weeks → Order 100 units
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-2">3. Lead Time</h4>
            <p className="text-sm text-gray-700 mb-2">
              Account for delivery time (order before you need it)
            </p>
            <p className="text-xs text-gray-600">
              Example: 3-day lead time, reorder at 50 → Order arrives before stockout
            </p>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Ordering Process</h3>
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Step 1: Identify What to Order</h4>
            <p className="text-sm text-gray-700 mb-2">Three methods:</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>System-generated:</strong> Software suggests reorders based on sales history and stock levels</li>
              <li>• <strong>Par levels:</strong> Physical check of shelves - order items below minimum stock</li>
              <li>• <strong>Ad-hoc requests:</strong> Staff reports low stock, customer requests, promotions</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Step 2: Determine Order Quantity</h4>
            <p className="text-sm text-gray-700 mb-2">Consider:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Average sales rate (units per day/week)</li>
              <li>• Current stock on hand</li>
              <li>• Stock in transit (already ordered)</li>
              <li>• Shelf life/expiry date</li>
              <li>• Storage space available</li>
              <li>• Supplier minimum order quantities (MOQ)</li>
              <li>• Special promotions or season changes</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">Step 3: Create Purchase Order</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
              <li>List all items to order with quantities</li>
              <li>Review order for accuracy</li>
              <li>Check budget/credit limits</li>
              <li>Manager approves order</li>
              <li>Send PO to supplier (email/phone/portal)</li>
              <li>Supplier confirms order and delivery date</li>
              <li>Note expected delivery date in system/diary</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-3">Step 4: Follow Up</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Track order status</li>
              <li>• If delivery delayed: Contact supplier</li>
              <li>• Adjust reorder points if necessary</li>
              <li>• Inform customers of stockouts and expected arrival</li>
              <li>• When delivered: Follow receiving procedure (see Receiving section)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Ordering Categories</h3>
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">Fast Movers (A-items)</h4>
            <p className="text-sm text-gray-700 mb-2">
              <strong>20% of products = 80% of sales</strong>
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Order frequently (weekly)</li>
              <li>• Keep higher stock levels</li>
              <li>• Monitor daily</li>
              <li>• Never allow stockouts</li>
              <li>• Examples: Popular painkillers, chronic meds</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-3">Medium Movers (B-items)</h4>
            <p className="text-sm text-gray-700 mb-2">
              <strong>30% of products = 15% of sales</strong>
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Order bi-weekly or monthly</li>
              <li>• Moderate stock levels</li>
              <li>• Weekly monitoring</li>
              <li>• Balance availability vs. overstocking</li>
              <li>• Examples: Seasonal items, specialty products</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-3">Slow Movers (C-items)</h4>
            <p className="text-sm text-gray-700 mb-2">
              <strong>50% of products = 5% of sales</strong>
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Order monthly or less</li>
              <li>• Minimal stock levels (1-2 units)</li>
              <li>• May order on demand</li>
              <li>• Consider discontinuing if no sales</li>
              <li>• Examples: Rare supplements, niche products</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-orange-900 mb-3">Special Orders</h4>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Customer-specific requests</strong>
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Order only when customer commits to buy</li>
              <li>• Get deposit if expensive</li>
              <li>• Clear communication on arrival time</li>
              <li>• Non-refundable if customer cancels</li>
              <li>• Examples: Rare medications, special imports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Supplier Management</h3>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-3">Choosing Suppliers:</h4>
            <p className="text-sm text-gray-700 mb-2">Evaluate suppliers on:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Price:</strong> Competitive pricing, payment terms</li>
              <li>• <strong>Quality:</strong> Product authenticity, expiry dates</li>
              <li>• <strong>Reliability:</strong> On-time delivery, correct orders</li>
              <li>• <strong>Service:</strong> Returns policy, customer support</li>
              <li>• <strong>Range:</strong> Product variety, new products</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Supplier Relationships:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Build good relationships (helps with rush orders, credits)</li>
              <li>• Pay on time (maintains credit terms)</li>
              <li>• Communicate issues promptly</li>
              <li>• Provide feedback (quality issues, new needs)</li>
              <li>• Negotiate better terms as volume grows</li>
              <li>• Have backup suppliers for critical items</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Common Supplier Issues:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Stockouts:</p>
                <p className="text-xs text-gray-600">
                  Supplier out of stock → Order from alternative supplier or backorder
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Short-dated Stock:</p>
                <p className="text-xs text-gray-600">
                  Refuse delivery or negotiate discount/return policy
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Late Deliveries:</p>
                <p className="text-xs text-gray-600">
                  Follow up, document, consider changing supplier if repeated
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Wrong Items:</p>
                <p className="text-xs text-gray-600">
                  Return immediately, request credit note and correct items
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
      <h3 className="text-xl font-bold text-yellow-900 mb-3">Ordering Best Practices</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">✅ DO:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Order based on data (sales history, trends)</li>
            <li>• Review stock levels weekly</li>
            <li>• Plan ahead for seasons/promotions</li>
            <li>• Consolidate orders to save on delivery</li>
            <li>• Keep good records of orders and deliveries</li>
            <li>• Communicate with team about stock needs</li>
            <li>• Double-check orders before sending</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">❌ DON'T:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Over-order just to "be safe"</li>
            <li>• Order without checking current stock</li>
            <li>• Ignore slow-moving stock accumulation</li>
            <li>• Order based on gut feeling alone</li>
            <li>• Forget to check expiry dates on arrival</li>
            <li>• Order from unapproved suppliers</li>
            <li>• Rush orders without manager approval</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const ExpirySection = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900">Expiry Date Management</h2>
    
    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
      <h3 className="text-xl font-bold text-red-900 mb-3">📅 Expired Products = Total Loss</h3>
      <p className="text-gray-800 mb-3">
        Expired stock cannot be sold, cannot be returned (usually), and must be destroyed. Every 
        expired item is <strong>100% loss of cost + potential profit.</strong>
      </p>
      <p className="text-gray-800">
        Target: <strong>&lt;0.5% write-offs due to expiry.</strong> Achieving this requires daily 
        vigilance and systematic expiry management.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Daily Expiry Checks</h3>
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
          <p className="font-semibold text-orange-900 mb-2">⚠️ Mandatory Daily Task</p>
          <p className="text-sm text-orange-800">
            <strong>Every single day,</strong> designated staff must check expiry dates on:
          </p>
          <ul className="text-sm text-orange-800 space-y-1 mt-2 ml-4">
            <li>• All refrigerated items (cold chain products most critical)</li>
            <li>• Short-dated items (flagged in previous checks)</li>
            <li>• Front-facing shop floor stock</li>
            <li>• High-value items</li>
          </ul>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">Daily Check Procedure:</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700ml-4">
            <li>Check items expiring within 3 months (quarterly expiry check)</li>
            <li>Flag items expiring within 1 month (monthly expiry alert)</li>
            <li>Remove items expiring within 1 week (immediate action)</li>
            <li>Record all short-dated items on expiry management sheet</li>
            <li>Report to manager for markdown/promotion decision</li>
            <li>Never leave expired items on shelf</li>
        </ol>
      </div>
    </div>

  <div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Expiry Date Zones</h3>
    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
        <div className="bg-green-100 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                ✓
            </div>
            <h4 className="font-bold text-green-900">Safe Zone: &gt;6 Months to Expiry</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• No special action needed</li>
            <li>• Normal stock rotation (FIFO)</li>
            <li>• Regular monitoring</li>
            </ul>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                !
            </div>
            <h4 className="font-bold text-yellow-900">Caution Zone: 3-6 Months to Expiry</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Action:</strong> Monitor closely, prioritize in FIFO</li>
            <li>• Check weekly</li>
            <li>• Ensure placed at front of display</li>
            <li>• Consider bundling with promotions</li>
            <li>• Slow movers: Consider markdown</li>
            </ul>
        </div>

        <div className="bg-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                ⚠
            </div>
            <h4 className="font-bold text-orange-900">Alert Zone: 1-3 Months to Expiry</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Action:</strong> Immediate intervention required</li>
            <li>• Manager approval for markdown (10-30% off)</li>
            <li>• Create short-dated promotion</li>
            <li>• Inform regular customers who use this product</li>
            <li>• Place prominent "Clearance" signage</li>
            <li>• Consider return to supplier if option available</li>
            <li>• If still unsold at 1 month: Deeper discount (50% off)</li>
            </ul>
        </div>

        <div className="bg-red-100 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                ✕
            </div>
            <h4 className="font-bold text-red-900">Critical Zone: &lt;1 Month to Expiry</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Action:</strong> Aggressive clearance (50-70% off)</li>
            <li>• Last chance to recover some value</li>
            <li>• Staff purchase option (if legal)</li>
            <li>• Donate if charity will accept (tax benefit)</li>
            <li>• If expired: Remove immediately, quarantine, destroy</li>
            </ul>
        </div>
        </div>
    </div>
  </div>

  <div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Short-Dated Stock Management</h3>
    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">Prevention:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Order wisely:</strong> Don't over-order slow movers</li>
            <li>• <strong>Check on receipt:</strong> Reject short-dated deliveries</li>
            <li>• <strong>FIFO religiously:</strong> Ensure oldest always sold first</li>
            <li>• <strong>Monitor trends:</strong> Adjust ordering for seasonal changes</li>
            <li>• <strong>Supplier agreements:</strong> Negotiate return options</li>
            </ul>
        </div>

        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Recovery Options:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Markdowns:</strong> Discount to move quickly</li>
            <li>• <strong>Promotions:</strong> "Buy 2 Get 1" type deals</li>
            <li>• <strong>Staff sales:</strong> Offer to employees at cost</li>
            <li>• <strong>Donations:</strong> Give to charities (if acceptable)</li>
            <li>• <strong>Returns:</strong> Return to supplier (if policy allows)</li>
            <li>• <strong>Repurpose:</strong> Some items can be sampled/tested</li>
            </ul>
        </div>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-yellow-900 mb-2">📌 Short-Dated Display Area</h4>
        <p className="text-sm text-gray-700">
            Create dedicated "Clearance Corner" or "Special Offers" section:
        </p>
        <ul className="text-sm text-gray-700 space-y-1 mt-2">
            <li>• Prominent location (near entrance or till)</li>
            <li>• Clear signage: "Clearance - Short-Dated Items"</li>
            <li>• Price stickers showing discount</li>
            <li>• Organized by category</li>
            <li>• Updated daily</li>
            <li>• Customers appreciate honest transparency + savings</li>
        </ul>
        </div>
    </div>
  </div>

  <div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Expired Stock Disposal</h3>
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <div className="bg-red-100 border-l-4 border-red-500 rounded-lg p-4 mb-4">
        <p className="font-semibold text-red-900 mb-2">⚠️ Legal Requirement</p>
        <p className="text-sm text-red-800">
            Selling expired products is <strong>illegal</strong> and can result in:
        </p>
        <ul className="text-sm text-red-800 space-y-1 mt-2 ml-4">
            <li>• Heavy fines from regulatory authorities</li>
            <li>• License suspension or revocation</li>
            <li>• Criminal prosecution</li>
            <li>• Customer harm and lawsuits</li>
            <li>• Permanent reputation damage</li>
        </ul>
        </div>

        <h4 className="font-semibold text-gray-900 mb-3">Disposal Procedure:</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
        <li><strong>Immediate removal:</strong> As soon as item expires, remove from shelf</li>
        <li><strong>Quarantine area:</strong> Place in designated "expired stock" area (locked if possible)</li>
        <li><strong>Documentation:</strong>
            <ul className="ml-6 mt-1 space-y-0.5 text-sm">
            <li>- Complete expired stock register</li>
            <li>- Note product name, batch number, expiry date, quantity</li>
            <li>- Calculate cost value</li>
            <li>- Pharmacist/manager signs</li>
            </ul>
        </li>
        <li><strong>System adjustment:</strong> Write off stock in inventory system</li>
        <li><strong>Physical destruction:</strong>
            <ul className="ml-6 mt-1 space-y-0.5 text-sm">
            <li>- Medications: Crush/mix with coffee grounds/cat litter, seal in bag</li>
            <li>- Dispose in general waste (not recyclable)</li>
            <li>- Or use pharmaceutical waste disposal service</li>
            <li>- Take photo of destruction for records</li>
            </ul>
        </li>
        <li><strong>Never:</strong> Give expired products to anyone, even free</li>
        <li><strong>Records retention:</strong> Keep disposal records for 5 years (audit trail)</li>
        </ol>

        <div className="bg-orange-100 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-orange-900 mb-2">Special Disposal Requirements:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Controlled substances:</strong> Must be destroyed in presence of inspector or authorized person</li>
            <li>• <strong>Cytotoxic drugs:</strong> Require special hazardous waste disposal</li>
            <li>• <strong>Biological products:</strong> Follow biohazard disposal protocols</li>
            <li>• Always check regulatory requirements for specific categories</li>
        </ul>
        </div>
    </div>
  </div>

  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
    <h3 className="text-xl font-bold text-yellow-900 mb-3">Expiry Management Best Practices</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
        <h4 className="font-semibold text-gray-900 mb-2">✅ DO:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
            <li>• Check expiry dates daily</li>
            <li>• Practice strict FIFO rotation</li>
            <li>• Flag short-dated items immediately</li>
            <li>• Act quickly on markdowns</li>
            <li>• Keep accurate expiry records</li>
            <li>• Train all staff on expiry procedures</li>
            <li>• Destroy expired stock immediately</li>
        </ul>
        </div>

        <div>
        <h4 className="font-semibold text-gray-900 mb-2">❌ DON'T:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
            <li>• Leave expired products on shelf</li>
            <li>• Hide or cover expiry dates</li>
            <li>• Over-order slow-moving items</li>
            <li>• Accept short-dated deliveries</li>
            <li>• Delay markdown decisions</li>
            <li>• Give expired products away</li>
            <li>• Ignore expiry management systems</li>
        </ul>
        </div>
    </div>
  </div>

</div>
);
const ShrinkageSection = () => (
  <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Shrinkage Control</h2>
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-6">
    <h3 className="text-xl font-bold text-red-900 mb-3">📉 What is Shrinkage?</h3>
    <p className="text-gray-800 mb-3">
        <strong>Shrinkage</strong> is the difference between recorded inventory and actual physical stock. 
        It represents loss of inventory and directly reduces profitability.
    </p>
    <div className="bg-white rounded-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">Shrinkage Formula:</p>
        <p className="text-sm text-gray-700">
        <strong>Shrinkage % = (Book Stock - Physical Stock) / Sales × 100</strong>
        </p>
        <p className="text-xs text-gray-600 mt-2">
        Example: Book stock R100,000, Physical stock R98,000, Sales R1,000,000 → 
        Shrinkage = (R100k - R98k) / R1,000k × 100 = 2%
        </p>
    </div>
    <p className="text-red-900 font-semibold mt-3">
        Target: &lt;2% shrinkage. Every 1% = R10,000+ loss annually (depending on turnover)
    </p>
  </div>

  <div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Causes of Shrinkage</h3>
    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-3">1. Theft (40-50% of shrinkage)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Shoplifting:</strong> Customers stealing merchandise</li>
            <li>• <strong>Employee theft:</strong> Staff taking stock</li>
            <li>• <strong>Supplier fraud:</strong> Short deliveries</li>
            <li>• <strong>Organized crime:</strong> Professional theft rings</li>
            </ul>
            <p className="text-xs text-red-700 mt-2">
            Prevention: Security measures, staff vigilance, proper procedures (see Security SOP)
            </p>
        </div>

        <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-orange-900 mb-3">2. Administrative Errors (20-30%)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Receiving errors:</strong> Wrong quantities entered</li>
            <li>• <strong>Scanning errors:</strong> Wrong items/prices scanned</li>
            <li>• <strong>Returns not processed:</strong> Item returned but not captured</li>
            <li>• <strong>Counting mistakes:</strong> Stock count inaccuracies</li>
            </ul>
            <p className="text-xs text-orange-700 mt-2">
            Prevention: Double-checking, training, systematic procedures, regular audits
            </p>
        </div>

        <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-yellow-900 mb-3">3. Damage & Wastage (15-20%)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Breakages:</strong> Dropped items, damaged packaging</li>
            <li>• <strong>Expiry:</strong> Products passing expiry date</li>
            <li>• <strong>Spoilage:</strong> Temperature excursions, contamination</li>
            <li>• <strong>Returns/recalls:</strong> Manufacturer recalls</li>
            </ul>
            <p className="text-xs text-yellow-700 mt-2">
            Prevention: Careful handling, expiry management, proper storage, FIFO rotation
            </p>
        </div>

        <div className="bg-white rounded-lg p-4">
            <h4 className="font-bold text-purple-900 mb-3">4. Vendor Fraud (5-10%)</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Short deliveries:</strong> Invoiced for more than delivered</li>
            <li>• <strong>Wrong items:</strong> Substitutions not documented</li>
            <li>• <strong>Quality issues:</strong> Damaged goods accepted</li>
            <li>• <strong>Pricing errors:</strong> Overcharged on invoices</li>
            </ul>
            <p className="text-xs text-purple-700 mt-2">
            Prevention: Thorough receiving procedures, count everything, document discrepancies
            </p>
        </div>
        </div>
    </div>
  </div>

  <div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Shrinkage Prevention Strategies</h3>
    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <div className="space-y-4">
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">1. Accurate Record Keeping</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Scan every item at till (no manual entries unless necessary)</li>
            <li>• Capture all receipts same day (don't delay)</li>
            <li>• Process returns immediately</li>
            <li>• Record damage/breakage when it occurs</li>
            <li>• Write off expired stock in system</li>
            <li>• Double-check manual adjustments</li>
            </ul>
        </div>

        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">2. Physical Security</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• CCTV in all areas (shop floor, storeroom, dispensary)</li>
            <li>• Security tags on high-value/high-theft items</li>
            <li>• Locked cabinets for expensive products</li>
            <li>• Controlled access to storage areas</li>
            <li>• Visible staff presence on shop floor</li>
            <li>• Bag checks for staff leaving (random)</li>
            </ul>
        </div>

        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">3. Process Controls</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Separation of duties (different people receive, order, pay)</li>
            <li>• Manager approval for refunds, voids, discounts</li>
            <li>• Two-person counts for high-value deliveries</li>
            <li>• Regular spot-checks and audits</li>
            <li>• Exception reporting (unusual transactions reviewed)</li>
            <li>• Quarterly stock takes</li>
            </ul>
        </div>

        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-3">4. Staff Training & Culture</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Train all staff on proper procedures</li>
            <li>• Clear consequences for theft (immediate dismissal)</li>
            <li>• Reward accuracy and loss prevention</li>
            <li>• Open communication about shrinkage impact</li>
            <li>• Anonymous reporting for suspected theft</li>
            <li>• Regular reminders and refresher training</li>
            </ul>
        </div>
        </div>
    </div>
  </div>

  <div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4">Shrinkage Analysis</h3>
    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <p className="text-gray-700 mb-4">
        Regular shrinkage analysis helps identify problem areas and measure improvement:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Monthly Review:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Calculate overall shrinkage %</li>
            <li>• Identify categories with highest shrinkage</li>
            <li>• Review specific high-shrinkage items</li>
            <li>• Compare to previous months (trending up/down?)</li>
            <li>• Identify root causes</li>
            <li>• Implement corrective actions</li>
            </ul>
        </div>

        <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Red Flags to Investigate:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
            <li>• Sudden increase in shrinkage %</li>
            <li>• Specific items consistently short</li>
            <li>• Shrinkage higher on certain shifts/days</li>
            <li>• Patterns correlating with specific staff</li>
            <li>• Categories with unusually high variance</li>
            <li>• Recurring "receiving errors"</li>
            </ul>
        </div>
        </div>

        <div className="bg-yellow-100 rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Investigation Steps:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-4">
            <li>Identify shrinkage spike or pattern</li>
            <li>Review CCTV footage for affected items/times</li>
            <li>Check transaction logs for errors</li>
            <li>Interview staff involved</li>
            <li>Conduct surprise audit/count</li>
            <li>Determine cause (theft, error, damage)</li>
            <li>Take corrective action</li>
            <li>Monitor to ensure issue resolved</li>
        </ol>
        </div>
    </div>
  </div>

  <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
    <h3 className="text-xl font-bold text-purple-900 mb-3">Shrinkage Reduction Goals</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-4xl font-bold text-green-600 mb-2">&lt;2%</div>
        <div className="text-sm text-gray-700">
            <strong>Excellent</strong>
            <p className="text-xs mt-1">Industry best practice</p>
        </div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-4xl font-bold text-yellow-600 mb-2">2-3%</div>
        <div className="text-sm text-gray-700">
            <strong>Acceptable</strong>
            <p className="text-xs mt-1">Room for improvement</p>
        </div>
        </div>

        <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-4xl font-bold text-red-600 mb-2">&gt;3%</div>
        <div className="text-sm text-gray-700">
            <strong>Critical</strong>
            <p className="text-xs mt-1">Immediate action required</p>
        </div>
        </div>
    </div>

    <div className="bg-white rounded-lg p-4 mt-4">
        <h4 className="font-semibold text-purple-900 mb-2">Financial Impact Example:</h4>
        <p className="text-sm text-gray-700 mb-2">
        Store with R500,000 monthly sales:
        </p>
        <ul className="text-sm text-gray-700 space-y-1">
        <li>• <strong>1% shrinkage:</strong> R5,000/month loss = R60,000/year</li>
        <li>• <strong>2% shrinkage:</strong> R10,000/month loss = R120,000/year</li>
        <li>• <strong>3% shrinkage:</strong> R15,000/month loss = R180,000/year</li>
        </ul>
        <p className="text-sm text-purple-800 font-semibold mt-3">
        Reducing shrinkage from 3% to 1% = R120,000 additional annual profit!
        </p>
    </div>
  </div>

    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
    <h3 className="text-xl font-bold text-green-900 mb-3">Everyone's Role in Shrinkage Control</h3>
    <p className="text-gray-700 mb-3">
        <strong>Every employee impacts shrinkage.</strong> Your actions directly affect profitability:
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">How You Reduce Shrinkage:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Scan every item accurately</li>
            <li>✓ Practice FIFO religiously</li>
            <li>✓ Handle products carefully</li>
            <li>✓ Count deliveries thoroughly</li>
            <li>✓ Report damage immediately</li>
            <li>✓ Watch for shoplifters</li>
            <li>✓ Follow all procedures</li>
        </ul>
        </div>

        <div className="bg-white rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">How You Increase Shrinkage:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
            <li>✗ Scanning errors</li>
            <li>✗ Ignoring FIFO</li>
            <li>✗ Rough handling (breakage)</li>
            <li>✗ Not counting deliveries</li>
            <li>✗ Hiding damage</li>
            <li>✗ Not watching floor</li>
            <li>✗ Taking shortcuts</li>
        </ul>
        </div>
    </div>
  </div>
</div>
);
export default InventorySOPView;
