/**
 * Recertification Readiness Tracker Demo Page
 * 
 * Demonstrates the compact visual tracker for recertification completion status.
 * Shows multiple variants and use cases.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  CheckCircle,
  Info,
  Check,
  Layout,
  Target,
  Layers,
} from 'lucide-react';
import RecertificationReadinessTracker, {
  generateMockRecertificationData,
  RecertificationReadinessData,
} from '../components/RecertificationReadinessTracker';

export default function RecertificationReadinessTrackerPage() {
  const navigate = useNavigate();
  const [mockData] = useState<RecertificationReadinessData[]>(
    generateMockRecertificationData()
  );

  const handleItemClick = (admissionId: string, requirementKey: string) => {
    console.log(`Clicked requirement ${requirementKey} for admission ${admissionId}`);
  };

  const handleViewDetails = (admissionId: string) => {
    console.log(`View details for admission ${admissionId}`);
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
                  Recertification Readiness Tracker
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Visual progress tracker for recertification packet completion
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
            <TabsTrigger value="variants">
              <Layers className="w-4 h-4 mr-2" />
              Variants
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Examples Tab */}
          <TabsContent value="examples" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Example 1: 60% Complete - Critical */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  60% Complete - Critical (3 days)
                </h3>
                <RecertificationReadinessTracker
                  data={mockData[0]}
                  variant="default"
                  onItemClick={key => handleItemClick(mockData[0].admissionId, key)}
                  onViewDetails={() => handleViewDetails(mockData[0].admissionId)}
                />
              </div>

              {/* Example 2: 20% Complete - Upcoming */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  20% Complete - Upcoming (20 days)
                </h3>
                <RecertificationReadinessTracker
                  data={mockData[1]}
                  variant="default"
                  onItemClick={key => handleItemClick(mockData[1].admissionId, key)}
                  onViewDetails={() => handleViewDetails(mockData[1].admissionId)}
                />
              </div>

              {/* Example 3: 0% Complete - Far Out */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  0% Complete - Far Out (38 days)
                </h3>
                <RecertificationReadinessTracker
                  data={mockData[2]}
                  variant="default"
                  onItemClick={key => handleItemClick(mockData[2].admissionId, key)}
                  onViewDetails={() => handleViewDetails(mockData[2].admissionId)}
                />
              </div>

              {/* Example 4: 100% Complete - Ready */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  100% Complete - Ready ✓
                </h3>
                <RecertificationReadinessTracker
                  data={mockData[3]}
                  variant="detailed"
                  onItemClick={key => handleItemClick(mockData[3].admissionId, key)}
                  onViewDetails={() => handleViewDetails(mockData[3].admissionId)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="mt-6 space-y-6">
            {/* Default Variant */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Default Variant
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Standard display with header, progress summary, checklist, and alerts.
                Suitable for main workspace views and admission dashboards.
              </p>
              <RecertificationReadinessTracker
                data={mockData[0]}
                variant="default"
                onItemClick={key => handleItemClick(mockData[0].admissionId, key)}
              />
            </Card>

            {/* Detailed Variant */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Variant
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Extended display showing completion dates and completed-by information
                for each requirement. Includes "View Full Details" button.
              </p>
              <RecertificationReadinessTracker
                data={mockData[3]}
                variant="detailed"
                onItemClick={key => handleItemClick(mockData[3].admissionId, key)}
                onViewDetails={() => handleViewDetails(mockData[3].admissionId)}
              />
            </Card>

            {/* Compact Variant */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Compact Variant
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Minimal display with circular progress and icon checklist. Perfect for
                sidebar widgets, patient chart summaries, and space-constrained views.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <RecertificationReadinessTracker
                  data={mockData[0]}
                  variant="compact"
                  showHeader={false}
                  onItemClick={key => handleItemClick(mockData[0].admissionId, key)}
                />
                <RecertificationReadinessTracker
                  data={mockData[1]}
                  variant="compact"
                  showHeader={false}
                  onItemClick={key => handleItemClick(mockData[1].admissionId, key)}
                />
                <RecertificationReadinessTracker
                  data={mockData[3]}
                  variant="compact"
                  showHeader={false}
                  onItemClick={key => handleItemClick(mockData[3].admissionId, key)}
                />
              </div>
            </Card>

            {/* Without Header */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Without Header (showHeader=false)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Removes header section for embedded contexts where patient/admission
                info is already displayed.
              </p>
              <RecertificationReadinessTracker
                data={mockData[0]}
                variant="default"
                showHeader={false}
                onItemClick={key => handleItemClick(mockData[0].admissionId, key)}
              />
            </Card>
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
          Recertification Readiness Tracker Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Compact visual tracker showing completion status for recertification requirements.
          Displays progress summary and highlights missing items to help staff know whether
          the recertification packet is ready to submit to payer.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">5 Requirements</p>
            <p className="text-sm text-blue-700 mt-1">Tracked per cert</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">Visual Progress</p>
            <p className="text-sm text-green-700 mt-1">Bar and percentage</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Layers className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">3 Variants</p>
            <p className="text-sm text-purple-700 mt-1">Default, Detailed, Compact</p>
          </div>
        </div>
      </Card>

      {/* 5 Requirements Tracked */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          5 Requirements Tracked
        </h3>
        <div className="space-y-4">
          {[
            {
              requirement: 'Assessment Completed',
              icon: '📋',
              color: 'Blue (#3B82F6)',
              desc: 'Recertification assessment (OASIS or clinical) has been completed',
            },
            {
              requirement: 'Plan of Care Updated',
              icon: '📄',
              color: 'Purple (#8B5CF6)',
              desc: 'Plan of Care / 485 has been updated with current goals and interventions',
            },
            {
              requirement: 'Visit Frequency Reviewed',
              icon: '📅',
              color: 'Green (#10B981)',
              desc: 'Visit frequency has been reviewed and updated as needed',
            },
            {
              requirement: 'Orders Updated',
              icon: '🩺',
              color: 'Amber (#F59E0B)',
              desc: 'Physician orders have been reviewed and updated as needed',
            },
            {
              requirement: 'Physician Signature Obtained',
              icon: '✍️',
              color: 'Pink (#EC4899)',
              desc: 'Physician signature has been obtained on recertification documents',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{item.requirement}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.color}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Visual Progress Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Visual Progress Summary
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Progress Indicators:</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  indicator: 'Progress Bar',
                  desc: 'Horizontal bar showing percentage complete (0-100%)',
                  visual: 'Blue bar that turns green when 100% complete',
                },
                {
                  indicator: 'Percentage Text',
                  desc: 'Numeric percentage displayed prominently',
                  visual: 'Large bold number: "60%", "100%", etc.',
                },
                {
                  indicator: 'Completion Count',
                  desc: 'Fraction showing completed vs total',
                  visual: '"3 of 5 Complete" text above progress bar',
                },
                {
                  indicator: 'Circular Progress (Compact)',
                  desc: 'Circular progress ring in compact variant',
                  visual: 'Ring changes color: Blue → Green when ready, Red when critical',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 text-sm mb-1">
                    {item.indicator}
                  </h5>
                  <p className="text-xs text-gray-700 mb-1">{item.desc}</p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Visual:</span> {item.visual}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Missing Items Highlighting */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Missing Items Highlighting
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Visual Treatment:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2">✓ Complete Items</h5>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Green background (#D1FAE5)</li>
                  <li>• Green border (#A7F3D0)</li>
                  <li>• Green checkmark icon</li>
                  <li>• "Complete" badge (green)</li>
                  <li>• Shows completion date & user</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h5 className="font-semibold text-red-900 mb-2">✗ Missing Items</h5>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• Gray background (#F9FAFB)</li>
                  <li>• Gray border (#E5E7EB)</li>
                  <li>• Colored icon (requirement-specific)</li>
                  <li>• "Missing" badge (red)</li>
                  <li>• "Action required" text</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Missing Items Alert Box:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Amber alert box appears when not all items complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Shows count: "2 Items Remaining"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Lists missing items by name with bullet points</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Includes reminder: "Complete all requirements before cert period expires"</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">All Complete Success Box:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Green success box appears when 100% complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Green checkmark icon</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>"Recertification Packet Ready" heading</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>"Ready to submit to payer" message</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Readiness Status Badges */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Readiness Status Badges
        </h3>
        <div className="space-y-3">
          {[
            {
              status: 'Ready',
              condition: '100% complete',
              color: 'Green',
              icon: 'Checkmark',
              display: 'Green badge: "Ready" with checkmark icon',
            },
            {
              status: 'In Progress',
              condition: 'Incomplete, >7 days remaining',
              color: 'Amber',
              icon: 'Clock',
              display: 'Amber badge: "In Progress" with clock icon',
            },
            {
              status: 'Critical',
              condition: 'Incomplete, ≤7 days remaining',
              color: 'Red',
              icon: 'Clock',
              display: 'Red badge: "Xd Remaining" with clock icon',
            },
            {
              status: 'Overdue',
              condition: 'Certification period expired',
              color: 'Red',
              icon: 'Alert',
              display: 'Red badge: "Xd Overdue" with alert icon',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{item.status}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.color}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Condition:</span> {item.condition}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Display:</span> {item.display}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 Variants */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">3 Display Variants</h3>
        <div className="space-y-4">
          {[
            {
              variant: 'Default',
              use: 'Main workspace views, admission dashboards',
              includes: 'Header, progress bar, checklist, missing items alert, success box',
              size: 'Full card (~400px width)',
            },
            {
              variant: 'Detailed',
              use: 'Patient chart, recertification detail view',
              includes: 'Everything in Default + completion dates/users + "View Details" button',
              size: 'Full card (~400px width)',
            },
            {
              variant: 'Compact',
              use: 'Sidebar widgets, patient chart summaries, space-constrained views',
              includes: 'Circular progress, mini icon checklist, readiness badge',
              size: 'Small card (~300px width)',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{item.variant} Variant</h4>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Use Case:</span> {item.use}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Includes:</span> {item.includes}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Size:</span> {item.size}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Interactive Features</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Click Actions:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Click requirement item:</strong> Navigate to complete that specific requirement
                  (e.g., click "Assessment Completed" → opens assessment editor)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Click icon (compact variant):</strong> Quick navigation to requirement
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Click "View Full Details":</strong> Navigate to full recertification workspace
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Hover Effects:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Clickable items show shadow on hover</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Cursor changes to pointer for interactive elements</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Compact variant icons highlight on hover</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Use Cases */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Common Use Cases</h3>
        <div className="space-y-3">
          {[
            {
              useCase: 'Admission Dashboard Widget',
              variant: 'Compact',
              desc: 'Show recert readiness for each admission in dashboard grid',
            },
            {
              useCase: 'Patient Chart Summary',
              variant: 'Compact or Default',
              desc: 'Display current recertification status in patient chart sidebar',
            },
            {
              useCase: 'Recertification Workspace',
              variant: 'Default',
              desc: 'Main tracker in recertification workspace showing all details',
            },
            {
              useCase: 'QA Review Dashboard',
              variant: 'Default',
              desc: 'Help QA staff quickly see which recerts are ready for review',
            },
            {
              useCase: 'Coordinator Task List',
              variant: 'Compact',
              desc: 'Show readiness status in task list for prioritization',
            },
            {
              useCase: 'Recertification Detail Page',
              variant: 'Detailed',
              desc: 'Full detailed view with completion dates and users',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 text-sm">{item.useCase}</h4>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                  {item.variant}
                </span>
              </div>
              <p className="text-sm text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '5 requirements tracked per recertification',
            'Visual progress bar (0-100%)',
            'Percentage display (large, bold)',
            'Completion count (X of 5 Complete)',
            'Color-coded requirement items',
            'Complete vs Missing badges',
            'Green/red item backgrounds',
            'Missing items alert box',
            'All complete success box',
            'Readiness status badge (Ready/In Progress/Critical/Overdue)',
            'Circular progress (compact variant)',
            'Mini icon checklist (compact variant)',
            'Completion dates shown (detailed variant)',
            'Completed-by user shown (detailed variant)',
            'Click requirement to navigate',
            '"View Full Details" button',
            'Hover effects on interactive items',
            '3 display variants (Default/Detailed/Compact)',
            'Optional header (showHeader prop)',
            'Flexible sizing (className prop)',
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
