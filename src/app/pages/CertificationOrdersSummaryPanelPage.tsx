/**
 * Certification & Orders Summary Panel Demo Page
 * 
 * Demonstrates the reusable summary panel in different contexts:
 * admission dashboard, patient chart, and recertification workspace.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Info,
  Check,
  Layout,
  FileText,
  Activity,
  User,
} from 'lucide-react';
import CertificationOrdersSummaryPanel, {
  generateMockCertificationOrdersSummary,
  CertificationOrdersSummary,
} from '../components/CertificationOrdersSummaryPanel';

export default function CertificationOrdersSummaryPanelPage() {
  const navigate = useNavigate();
  const [mockData] = useState<CertificationOrdersSummary[]>(
    generateMockCertificationOrdersSummary()
  );
  const [selectedExample, setSelectedExample] = useState(0);

  const handleViewCertificationPeriod = () => {
    console.log('View certification period');
  };

  const handleView485 = () => {
    console.log('View 485');
  };

  const handleViewOrders = () => {
    console.log('View orders');
  };

  const handleViewSignatures = () => {
    console.log('View signatures');
  };

  const handleViewReturnedItems = () => {
    console.log('View returned items');
  };

  const handleViewRecertReadiness = () => {
    console.log('View recertification readiness');
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
                  Certification & Orders Summary Panel
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Reusable panel for admission dashboard, patient chart, and recert workspace
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="contexts">
          <TabsList>
            <TabsTrigger value="contexts">
              <Layout className="w-4 h-4 mr-2" />
              Context Examples
            </TabsTrigger>
            <TabsTrigger value="modes">
              <FileText className="w-4 h-4 mr-2" />
              Display Modes
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Contexts Tab */}
          <TabsContent value="contexts" className="mt-6 space-y-6">
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
                  <p className="font-semibold text-sm">Good Standing</p>
                  <p className="text-xs text-gray-600">Period 1, 45d left, 2 orders</p>
                </button>
                <button
                  onClick={() => setSelectedExample(1)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 1
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">Multiple Issues</p>
                  <p className="text-xs text-gray-600">Period 2, 5d left, 8 orders</p>
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
                  <p className="text-xs text-gray-600">Period 3, expired, 12 orders</p>
                </button>
                <button
                  onClick={() => setSelectedExample(3)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 3
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">Ready for Recert</p>
                  <p className="text-xs text-gray-600">Period 2, 100% ready</p>
                </button>
              </div>
            </Card>

            {/* Context 1: Admission Dashboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Layout className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Context 1: Admission Dashboard (Full Mode)
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Full panel displayed prominently on the admission dashboard overview. Shows all 6
                sections in a responsive grid.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Admission Dashboard - {mockData[selectedExample].patientName}
                </h4>
                <CertificationOrdersSummaryPanel
                  data={mockData[selectedExample]}
                  mode="full"
                  onViewCertificationPeriod={handleViewCertificationPeriod}
                  onView485={handleView485}
                  onViewOrders={handleViewOrders}
                  onViewSignatures={handleViewSignatures}
                  onViewReturnedItems={handleViewReturnedItems}
                  onViewRecertReadiness={handleViewRecertReadiness}
                />
              </div>
            </Card>

            {/* Context 2: Patient Chart */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Context 2: Patient Chart (Compact Mode)
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Compact panel in the patient chart sidebar. Shows all 6 sections in a condensed
                vertical list.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {/* Main Chart Content */}
                <div className="col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Patient Chart Content</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Demographics</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Diagnoses</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Medications</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Care Plan</p>
                    </div>
                  </div>
                </div>

                {/* Sidebar with Compact Panel */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Info</h4>
                  <CertificationOrdersSummaryPanel
                    data={mockData[selectedExample]}
                    mode="compact"
                    onViewCertificationPeriod={handleViewCertificationPeriod}
                    onView485={handleView485}
                    onViewOrders={handleViewOrders}
                    onViewSignatures={handleViewSignatures}
                    onViewReturnedItems={handleViewReturnedItems}
                    onViewRecertReadiness={handleViewRecertReadiness}
                  />
                </div>
              </div>
            </Card>

            {/* Context 3: Recertification Workspace */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Context 3: Recertification Workspace (Sidebar Mode)
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Sidebar panel in the recertification workspace. Ultra-compact vertical list
                optimized for narrow sidebars.
              </p>
              <div className="grid grid-cols-4 gap-6">
                {/* Sidebar with Sidebar Panel */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Status</h4>
                  <CertificationOrdersSummaryPanel
                    data={mockData[selectedExample]}
                    mode="sidebar"
                    onViewCertificationPeriod={handleViewCertificationPeriod}
                    onView485={handleView485}
                    onViewOrders={handleViewOrders}
                    onViewSignatures={handleViewSignatures}
                    onViewReturnedItems={handleViewReturnedItems}
                    onViewRecertReadiness={handleViewRecertReadiness}
                  />
                </div>

                {/* Main Workspace Content */}
                <div className="col-span-3 bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Recertification Workspace Content
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded">
                      <p className="font-medium text-blue-900">Recertification Checklist</p>
                      <p className="text-sm text-blue-700 mt-1">
                        20 items • 15 completed • 5 remaining
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded">
                      <p className="font-medium text-green-900">Required Documents</p>
                      <p className="text-sm text-green-700 mt-1">
                        485, OASIS, Visit Notes, Physician Orders
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded">
                      <p className="font-medium text-amber-900">Timeline</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Due in {mockData[selectedExample].recertificationReadiness.daysUntilDue}{' '}
                        days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Modes Tab */}
          <TabsContent value="modes" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Full Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete panel with all 6 sections displayed in a responsive grid (1/2/3 columns).
                Each section is a clickable card with icon, title, key metrics, and status
                indicators. Best for admission dashboards and dedicated views.
              </p>
              <CertificationOrdersSummaryPanel
                data={mockData[selectedExample]}
                mode="full"
                onViewCertificationPeriod={handleViewCertificationPeriod}
                onView485={handleView485}
                onViewOrders={handleViewOrders}
                onViewSignatures={handleViewSignatures}
                onViewReturnedItems={handleViewReturnedItems}
                onViewRecertReadiness={handleViewRecertReadiness}
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Condensed vertical list showing all 6 sections with icon, label, value, and status.
                Each item is a clickable row with chevron. Best for sidebars and patient chart
                quick info panels.
              </p>
              <div className="max-w-md">
                <CertificationOrdersSummaryPanel
                  data={mockData[selectedExample]}
                  mode="compact"
                  onViewCertificationPeriod={handleViewCertificationPeriod}
                  onView485={handleView485}
                  onViewOrders={handleViewOrders}
                  onViewSignatures={handleViewSignatures}
                  onViewReturnedItems={handleViewReturnedItems}
                  onViewRecertReadiness={handleViewRecertReadiness}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Sidebar Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ultra-compact vertical list optimized for narrow sidebars. Shows icon, label,
                value, and optional detail/warning. Each item is clickable. Best for recertification
                workspace sidebars and narrow panels.
              </p>
              <div className="max-w-xs">
                <CertificationOrdersSummaryPanel
                  data={mockData[selectedExample]}
                  mode="sidebar"
                  onViewCertificationPeriod={handleViewCertificationPeriod}
                  onView485={handleView485}
                  onViewOrders={handleViewOrders}
                  onViewSignatures={handleViewSignatures}
                  onViewReturnedItems={handleViewReturnedItems}
                  onViewRecertReadiness={handleViewRecertReadiness}
                />
              </div>
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
          Certification & Orders Summary Panel Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Reusable panel summarizing certification and orders status for the active admission.
          Displays current certification period, 485 status, open orders, pending signatures,
          returned items, and recertification readiness. Designed for use in admission dashboard,
          patient chart, and recertification workspace with 3 display modes (full, compact,
          sidebar) to fit different contexts.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-xl">6️⃣</span>
            </div>
            <p className="font-semibold text-blue-900">6 Summary Sections</p>
            <p className="text-sm text-blue-700 mt-1">Comprehensive coverage</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-xl">3️⃣</span>
            </div>
            <p className="font-semibold text-green-900">3 Display Modes</p>
            <p className="text-sm text-green-700 mt-1">Full/Compact/Sidebar</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-purple-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-semibold text-purple-900">Fully Reusable</p>
            <p className="text-sm text-purple-700 mt-1">Multiple contexts</p>
          </div>
        </div>
      </Card>

      {/* 6 Summary Sections */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">6 Summary Sections</h3>
        <div className="space-y-4">
          {[
            {
              section: 'Current Certification Period',
              icon: '📅',
              data: 'Period number, status (active/expiring/expired), start/end dates, days remaining, progress bar',
              insights: 'Visual progress bar shows time remaining, color-coded by status',
              actions: 'View certification details, plan recertification',
            },
            {
              section: '485 Status',
              icon: '✅',
              data: 'Status badge (current/expiring/expired/not submitted/pending signature), expiration date, days until expiration, missing sections count, awaiting physician',
              insights: 'Critical compliance indicator, shows submission and signature status',
              actions: 'Submit 485, complete missing sections, request signature',
            },
            {
              section: 'Open Orders',
              icon: '📄',
              data: 'Total count, overdue count badge, breakdown by type (verbal/skilled/therapy/other), oldest days',
              insights: 'Shows volume and urgency of pending orders by category',
              actions: 'View orders queue, complete orders, follow up on overdue',
            },
            {
              section: 'Pending Signatures',
              icon: '✍️',
              data: 'Total count, overdue count badge, physician count, document list with days waiting',
              insights: 'Tracks physician signature bottlenecks across multiple documents',
              actions: 'Request signatures, send reminders, escalate overdue',
            },
            {
              section: 'Returned Items',
              icon: '🔴',
              data: 'Total count, unresolved count badge, breakdown by type, oldest days',
              insights: 'QA feedback requiring correction, prioritized by age',
              actions: 'Correct documents, resubmit for approval, resolve issues',
            },
            {
              section: 'Recertification Readiness',
              icon: '📊',
              data: 'Status badge (ready/almost ready/not ready/blocked), score 0-100, progress bar, days until due, blocker count, completed/total items',
              insights: 'Overall readiness score with specific blockers identified',
              actions: 'View checklist, complete items, remove blockers',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{item.section}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-xs bg-blue-50 p-2 rounded">
                    <p className="font-medium text-blue-900 mb-1">Data Displayed:</p>
                    <p className="text-blue-700">{item.data}</p>
                  </div>
                  <div className="text-xs bg-green-50 p-2 rounded">
                    <p className="font-medium text-green-900 mb-1">Key Insights:</p>
                    <p className="text-green-700">{item.insights}</p>
                  </div>
                  <div className="text-xs bg-purple-50 p-2 rounded">
                    <p className="font-medium text-purple-900 mb-1">Quick Actions:</p>
                    <p className="text-purple-700">{item.actions}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 Display Modes */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">3 Display Modes</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Full Mode</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Layout:</strong> Responsive grid (1/2/3 columns)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Sections:</strong> Clickable cards with full details
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Details:</strong> Icon, title, badges, metrics, progress bars, status
                  text
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Best For:</strong> Admission dashboards, dedicated overview pages
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Compact Mode</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Layout:</strong> Vertical list
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Sections:</strong> Clickable rows with chevron
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Details:</strong> Icon, label, value, status, badge
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Best For:</strong> Patient chart sidebars, quick info panels
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">Sidebar Mode</h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Layout:</strong> Ultra-compact vertical list
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Sections:</strong> Minimal clickable items
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Details:</strong> Icon, label, value, optional detail/warning
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Best For:</strong> Recertification workspace sidebars, narrow panels
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Integration Contexts */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Integration Contexts</h3>
        <div className="space-y-4">
          {[
            {
              context: 'Admission Dashboard',
              mode: 'Full',
              placement: 'Prominently displayed on admission overview page',
              usage: 'Main certification and orders summary for care coordinators reviewing admission status',
            },
            {
              context: 'Patient Chart',
              mode: 'Compact',
              placement: 'Sidebar quick info panel alongside demographics and diagnoses',
              usage: 'Quick reference for clinicians accessing patient chart to see current cert status',
            },
            {
              context: 'Recertification Workspace',
              mode: 'Sidebar',
              placement: 'Left sidebar showing at-a-glance status while working on recert checklist',
              usage: 'Persistent summary visible while completing recertification tasks',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{item.context}</h4>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  {item.mode} Mode
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Placement:</span> {item.placement}
              </p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <span className="font-medium">Usage:</span> {item.usage}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Features Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '6 summary sections',
            '3 display modes (full/compact/sidebar)',
            'Responsive grid layout (1/2/3 columns)',
            'Clickable sections with callbacks',
            'Color-coded status indicators',
            'Progress bars (cert period, recert readiness)',
            'Status badges (period, 485, readiness)',
            'Count displays with overdue badges',
            'Days remaining/overdue calculations',
            'Breakdown by type (orders)',
            'Document lists (signatures)',
            'Missing sections tracking (485)',
            'Blocker identification (recert)',
            'Score calculation (0-100 for recert)',
            'Completed/total items tracking',
            'Oldest days tracking',
            'Physician count display',
            'Warning indicators (red backgrounds)',
            'Hover states and transitions',
            'Icon-based visual hierarchy',
            'Compact vertical lists',
            'Ultra-compact sidebar mode',
            'Chevron navigation indicators',
            'Empty state messages',
            'Fully reusable component',
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
