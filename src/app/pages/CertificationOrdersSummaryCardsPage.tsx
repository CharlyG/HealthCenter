/**
 * Certification & Orders Summary Cards Demo Page
 * 
 * Demonstrates the enhanced admission dashboard with certification and order
 * summary cards for at-a-glance status visibility.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Activity,
  Info,
  Check,
  Layout,
  Eye,
} from 'lucide-react';
import CertificationOrdersSummaryCards, {
  generateMockCertificationOrdersData,
  CertificationOrdersSummaryData,
} from '../components/CertificationOrdersSummaryCards';

export default function CertificationOrdersSummaryCardsPage() {
  const navigate = useNavigate();
  const [mockData] = useState<CertificationOrdersSummaryData[]>(
    generateMockCertificationOrdersData()
  );
  const [selectedExample, setSelectedExample] = useState(0);

  const handleViewOrders = () => {
    console.log('View orders');
  };

  const handleViewSignatures = () => {
    console.log('View signatures');
  };

  const handleView485 = () => {
    console.log('View 485');
  };

  const handleViewRecertification = () => {
    console.log('View recertification');
  };

  const handleViewReturnedDocs = () => {
    console.log('View returned documents');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Certification & Orders Summary Cards
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Enhanced admission dashboard with at-a-glance status
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="examples">
          <TabsList>
            <TabsTrigger value="examples">
              <Layout className="w-4 h-4 mr-2" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Examples Tab */}
          <TabsContent value="examples" className="mt-6 space-y-6">
            {/* Example Selector */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Example:</h3>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setSelectedExample(0)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 0
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">Multiple Issues</p>
                  <p className="text-xs text-gray-600">8 orders, 485 expiring soon</p>
                </button>
                <button
                  onClick={() => setSelectedExample(1)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 1
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">Good Standing</p>
                  <p className="text-xs text-gray-600">2 orders, 485 current</p>
                </button>
                <button
                  onClick={() => setSelectedExample(2)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 2
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">Critical Issues</p>
                  <p className="text-xs text-gray-600">12 orders, 485 expired</p>
                </button>
                <button
                  onClick={() => setSelectedExample(3)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 3
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">New Admission</p>
                  <p className="text-xs text-gray-600">485 not submitted yet</p>
                </button>
              </div>
            </Card>

            {/* Mock Admission Dashboard Context */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Admission Dashboard - Margaret Johnson
              </h3>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs font-medium text-gray-600">Patient ID</p>
                  <p className="text-sm font-semibold text-gray-900">PAT-001</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Admission ID</p>
                  <p className="text-sm font-semibold text-gray-900">ADM-12345</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Start Date</p>
                  <p className="text-sm font-semibold text-gray-900">Oct 1, 2024</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Primary Diagnosis</p>
                  <p className="text-sm font-semibold text-gray-900">CHF, Diabetes</p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Certification & Orders Status
                </h4>
                <CertificationOrdersSummaryCards
                  data={mockData[selectedExample]}
                  onViewOrders={handleViewOrders}
                  onViewSignatures={handleViewSignatures}
                  onView485={handleView485}
                  onViewRecertification={handleViewRecertification}
                  onViewReturnedDocs={handleViewReturnedDocs}
                />
              </div>
            </Card>

            {/* Additional Dashboard Sections (for context) */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Care Team</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Primary Nurse</span>
                    <span className="font-medium text-gray-900">Emily Chen, RN</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Physical Therapist</span>
                    <span className="font-medium text-gray-900">Sarah Johnson, PT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Physician</span>
                    <span className="font-medium text-gray-900">Dr. Sarah Mitchell</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-gray-900">Visit completed</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-gray-900">Document reviewed</p>
                      <p className="text-xs text-gray-600">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <FeaturesOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════

function FeaturesOverview() {
  return (
    <>
      {/* Overview */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Certification & Orders Summary Cards Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Enhanced admission/care episode dashboard cards displaying certification and order
          status at a glance. Shows pending orders, pending signatures, current 485 status,
          recertification due dates, and returned documents with counts, status indicators,
          important warnings when needed, and quick action buttons. Makes certification and
          orders visible at a glance on the admission dashboard.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-xl">5️⃣</span>
            </div>
            <p className="font-semibold text-blue-900">5 Card Types</p>
            <p className="text-sm text-blue-700 mt-1">Comprehensive coverage</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-semibold text-green-900">At-a-Glance Status</p>
            <p className="text-sm text-green-700 mt-1">Instant visibility</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-semibold text-purple-900">Quick Actions</p>
            <p className="text-sm text-purple-700 mt-1">One-click navigation</p>
          </div>
        </div>
      </Card>

      {/* 5 Card Types */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">5 Summary Card Types</h3>
        <div className="space-y-4">
          {[
            {
              card: 'Pending Orders',
              icon: '📄',
              color: 'Blue/Red',
              count: 'Number of pending orders',
              status: 'Complete/Awaiting/Overdue',
              warning: 'High volume or overdue orders',
              action: 'View Orders',
            },
            {
              card: 'Pending Signatures',
              icon: '✍️',
              color: 'Purple/Red',
              count: 'Number of pending signatures',
              status: 'Signed/Pending/Overdue',
              warning: 'Multiple pending or overdue signatures',
              action: 'View Signatures',
            },
            {
              card: 'Current 485 Status',
              icon: '✅',
              color: 'Green/Amber/Red',
              count: 'Status badge (Current/Expiring/Expired)',
              status: 'Current/Expiring Soon/Expired/Not Submitted',
              warning: 'Expiring soon, expired, or not submitted',
              action: 'View 485 / Submit 485',
            },
            {
              card: 'Recertification Due',
              icon: '📅',
              color: 'Green/Amber/Red',
              count: 'Status badge (Not Due/Due Soon/Due/Overdue)',
              status: 'Not Due/Due Soon/Due/Overdue',
              warning: 'Due soon, due, or overdue',
              action: 'View Recert / Start Recert',
            },
            {
              card: 'Returned Documents',
              icon: '📋',
              color: 'Green/Amber/Red',
              count: 'Number of returned documents',
              status: 'None/Resolved/Unresolved',
              warning: 'Unresolved returned documents',
              action: 'View Documents / Resolve Issues',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{item.card}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.color}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-xs bg-blue-50 p-2 rounded">
                    <p className="font-medium text-blue-900 mb-1">Count Display:</p>
                    <p className="text-blue-700">{item.count}</p>
                  </div>
                  <div className="text-xs bg-green-50 p-2 rounded">
                    <p className="font-medium text-green-900 mb-1">Status Types:</p>
                    <p className="text-green-700">{item.status}</p>
                  </div>
                  <div className="text-xs bg-amber-50 p-2 rounded">
                    <p className="font-medium text-amber-900 mb-1">Warning Triggers:</p>
                    <p className="text-amber-700">{item.warning}</p>
                  </div>
                  <div className="text-xs bg-purple-50 p-2 rounded">
                    <p className="font-medium text-purple-900 mb-1">Quick Action:</p>
                    <p className="text-purple-700">{item.action}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Card Anatomy */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Card Anatomy - 4 Key Components</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">1. Count Display</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Large Number:</strong> Primary count displayed prominently (3xl font)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Badge Indicator:</strong> Overdue/unresolved count shown in red badge
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Additional Context:</strong> Oldest days, physician count, etc.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">2. Status Indicator</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Icon + Text:</strong> Checkmark/Clock/Alert icon with status text
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Color Coded:</strong> Green (good), Amber (warning), Red (critical)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Contextual Info:</strong> Days until/since, dates, additional details
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">3. Warning Alert (When Needed)</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Alert Triangle:</strong> Top-right corner when warning present
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Warning Box:</strong> Colored background with specific warning message
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Border Emphasis:</strong> Red border on card when critical
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">4. Quick Action Button</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Full Width:</strong> Button spans entire card width
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Contextual Label:</strong> "View Orders", "Start Recert", "Resolve
                  Issues", etc.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Chevron Arrow:</strong> Visual indicator for navigation
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Color Coding System */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Color Coding System</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              status: 'Good / Complete',
              color: 'Green (#10B981)',
              examples: 'All orders complete, All signed, 485 current, Not due',
              visual: 'Green icon background, green checkmark, green text',
            },
            {
              status: 'Warning / Due Soon',
              color: 'Amber (#F59E0B)',
              examples: '485 expiring soon, Recert due soon, Multiple pending',
              visual: 'Amber icon background, amber clock icon, amber text',
            },
            {
              status: 'Critical / Overdue',
              color: 'Red (#EF4444)',
              examples: 'Orders overdue, Signatures overdue, 485 expired, Recert overdue',
              visual: 'Red icon background, red alert icon, red border, red text',
            },
            {
              status: 'Neutral / Not Started',
              color: 'Gray (#6B7280)',
              examples: '485 not submitted, No returned documents',
              visual: 'Gray icon background, gray icons, gray text',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: item.color.match(/#[A-F0-9]+/)?.[0] }}
                />
                <h4 className="font-semibold text-gray-900">{item.status}</h4>
              </div>
              <p className="text-xs text-gray-600 mb-2">{item.color}</p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Examples:</span> {item.examples}
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Visual:</span> {item.visual}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Benefits for Admission Dashboard
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">✓ At-a-Glance Visibility</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>All certification and order status visible in one view</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>No need to navigate to multiple screens to check status</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Color-coded visual indicators for quick scanning</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Critical issues immediately visible via red cards/borders</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">✓ Proactive Problem Detection</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Warning alerts appear before items become overdue</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>485 expiring soon alerts allow proactive renewal</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Recertification due soon warnings enable preparation</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>High volume alerts prevent bottlenecks</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">✓ One-Click Navigation</h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Quick action buttons navigate directly to relevant screens</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Contextual actions change based on status (View vs Start vs Resolve)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Reduces clicks needed to address issues</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Streamlined workflow from identification to action</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Key Features Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '5 summary card types',
            'Count displays (large, prominent)',
            'Overdue/unresolved badges',
            'Status indicators (icon + text)',
            'Color-coded statuses (green/amber/red)',
            'Warning alerts when needed',
            'Alert triangle in corner',
            'Warning message boxes',
            'Red border emphasis for critical',
            'Quick action buttons',
            'Contextual button labels',
            'Full-width buttons with chevron',
            'Pending orders tracking',
            'Pending signatures tracking',
            '485 status monitoring',
            'Recertification due tracking',
            'Returned documents tracking',
            'Days until/since calculations',
            'Oldest item tracking',
            'Document type displays',
            'Physician count displays',
            'Certification period displays',
            'Hover shadow effects',
            'Responsive grid layout (1/2/5 columns)',
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

// cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
