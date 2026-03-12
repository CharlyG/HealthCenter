/**
 * Orders & Certification Smart Alerts Demo Page
 * 
 * Demonstrates intelligent alerts for orders and certification workflows
 * appearing in different contexts: workspaces, admission dashboards,
 * orders queues, and notification centers.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Bell,
  Info,
  Check,
  Layout,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import OrdersCertificationAlertComponent, {
  OrdersCertificationAlertsList,
  AlertsSummaryBanner,
  generateMockOrdersCertificationAlerts,
  OrdersCertificationAlert,
} from '../components/OrdersCertificationAlerts';

export default function OrdersCertificationAlertsPage() {
  const navigate = useNavigate();
  const [mockAlerts] = useState<OrdersCertificationAlert[]>(
    generateMockOrdersCertificationAlerts()
  );

  const handleAction = (alertId: string) => {
    console.log('Alert action:', alertId);
  };

  const handleDismiss = (alertId: string) => {
    console.log('Dismiss alert:', alertId);
  };

  const handleViewAll = () => {
    console.log('View all alerts');
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
                  Orders & Certification Smart Alerts
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Intelligent alerts across workspaces and dashboards
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
            <TabsTrigger value="variants">
              <FileText className="w-4 h-4 mr-2" />
              Display Variants
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Contexts Tab */}
          <TabsContent value="contexts" className="mt-6 space-y-6">
            {/* Workspace Context */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Layout className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Context 1: Orders Workspace
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Alerts appear at the top of the workspace to surface critical issues
                requiring immediate attention.
              </p>
              <div className="space-y-3">
                <AlertsSummaryBanner alerts={mockAlerts} onViewAll={handleViewAll} />
                <OrdersCertificationAlertsList
                  alerts={mockAlerts.slice(0, 2)}
                  variant="full"
                  onAction={handleAction}
                  onDismiss={handleDismiss}
                />
              </div>
            </Card>

            {/* Admission Dashboard Context */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Context 2: Admission Dashboard
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Compact alerts show patient-specific issues on the admission dashboard.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Admission: Margaret Johnson (ADM-12345)
                </h4>
                <div className="space-y-3">
                  {mockAlerts
                    .filter((a) => a.metadata?.patientName === 'Margaret Johnson')
                    .map((alert) => (
                      <OrdersCertificationAlertComponent
                        key={alert.id}
                        alert={alert}
                        variant="compact"
                        onAction={handleAction}
                        onDismiss={handleDismiss}
                      />
                    ))}
                </div>
              </div>
            </Card>

            {/* Orders Queue Context */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Context 3: Orders Queue</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Inline alerts appear next to specific orders in the queue.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Physical Therapy Order - James Anderson
                      </p>
                      <p className="text-xs text-gray-600">ORD-2024-223 • ADM-12348</p>
                    </div>
                  </div>
                  <OrdersCertificationAlertComponent
                    alert={mockAlerts[4]}
                    variant="inline"
                    onAction={handleAction}
                  />
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Verbal Order - Margaret Johnson
                      </p>
                      <p className="text-xs text-gray-600">VO-2024-789 • ADM-12345</p>
                    </div>
                  </div>
                  <OrdersCertificationAlertComponent
                    alert={mockAlerts[0]}
                    variant="inline"
                    onAction={handleAction}
                  />
                </div>
              </div>
            </Card>

            {/* Notification Center Context */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Context 4: Notification Center
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                All alerts consolidated in the notification center with compact view.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    Notifications ({mockAlerts.length})
                  </h4>
                  <Button size="sm" variant="ghost">
                    Mark All Read
                  </Button>
                </div>
                <OrdersCertificationAlertsList
                  alerts={mockAlerts}
                  variant="compact"
                  onAction={handleAction}
                  onDismiss={handleDismiss}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Full Variant</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete alert with all details, metadata, suggested action, and action buttons.
                Best for workspaces and dedicated alert views.
              </p>
              <OrdersCertificationAlertComponent
                alert={mockAlerts[0]}
                variant="full"
                onAction={handleAction}
                onDismiss={handleDismiss}
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Variant</h3>
              <p className="text-sm text-gray-600 mb-4">
                Condensed alert showing severity, title, and primary action. Best for dashboards
                and sidebars.
              </p>
              <div className="space-y-3">
                {mockAlerts.slice(0, 3).map((alert) => (
                  <OrdersCertificationAlertComponent
                    key={alert.id}
                    alert={alert}
                    variant="compact"
                    onAction={handleAction}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Inline Variant</h3>
              <p className="text-sm text-gray-600 mb-4">
                Minimal alert for embedding within lists and queues. Shows icon, title, and
                action button only.
              </p>
              <div className="space-y-2">
                {mockAlerts.slice(0, 4).map((alert) => (
                  <OrdersCertificationAlertComponent
                    key={alert.id}
                    alert={alert}
                    variant="inline"
                    onAction={handleAction}
                  />
                ))}
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
          Orders & Certification Smart Alerts Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Intelligent alert system for orders and certification workflows displaying severity,
          issue description, suggested actions, and quick action buttons. Alerts appear in
          workspaces, admission dashboards, orders queues, and notification centers to
          proactively surface critical issues requiring immediate attention.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="font-semibold text-red-900">5 Alert Types</p>
            <p className="text-sm text-red-700 mt-1">Critical workflows</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <p className="font-semibold text-amber-900">3 Severity Levels</p>
            <p className="text-sm text-amber-700 mt-1">Prioritized response</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-100 flex items-center justify-center">
              <Layout className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-semibold text-blue-900">4 Display Contexts</p>
            <p className="text-sm text-blue-700 mt-1">Everywhere needed</p>
          </div>
        </div>
      </Card>

      {/* 5 Alert Types */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">5 Smart Alert Types</h3>
        <div className="space-y-4">
          {[
            {
              type: 'Physician Signature Overdue',
              icon: '✍️',
              severity: 'Critical',
              description: 'Verbal order or document not signed within required timeframe',
              example: 'Verbal order 48+ hours without physician signature',
              action: 'Request Signature / Send Reminder',
            },
            {
              type: '485 Missing Required Sections',
              icon: '📋',
              severity: 'Warning',
              description: 'Plan of Care incomplete and cannot be submitted',
              example: 'Missing Functional Limitations, Safety Measures, Discharge Plans',
              action: 'Complete 485',
            },
            {
              type: 'Recertification Due Soon',
              icon: '📅',
              severity: 'Warning',
              description: 'Approaching recertification deadline requiring preparation',
              example: 'Recertification due in 7 days',
              action: 'Start Recertification',
            },
            {
              type: 'Returned Document Awaiting Correction',
              icon: '🔴',
              severity: 'Critical',
              description: 'QA returned document requiring immediate correction',
              example: 'Visit note missing vital signs and assessment data',
              action: 'Correct Document',
            },
            {
              type: 'Order Expired Before Signature',
              icon: '⏰',
              severity: 'Critical',
              description: 'Order expired without physician signature obtained',
              example: 'PT order expired 12/12, services cannot continue',
              action: 'Request New Order',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{item.type}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.severity === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-xs bg-blue-50 p-2 rounded">
                    <p className="font-medium text-blue-900 mb-1">Example:</p>
                    <p className="text-blue-700">{item.example}</p>
                  </div>
                  <div className="text-xs bg-green-50 p-2 rounded">
                    <p className="font-medium text-green-900 mb-1">Quick Action:</p>
                    <p className="text-green-700">{item.action}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 Severity Levels */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">3 Severity Levels</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Critical</h4>
            </div>
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Red color scheme</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Requires immediate action</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Compliance risk</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Service disruption</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900">Warning</h4>
            </div>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Amber color scheme</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Action needed soon</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Potential risk</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Preparation required</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Info</h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Blue color scheme</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Informational only</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Optional action</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>FYI notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 4 Display Contexts */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">4 Display Contexts</h3>
        <div className="space-y-4">
          {[
            {
              context: 'Workspaces',
              variant: 'Full',
              description: 'Complete alerts at top of workspace pages',
              features:
                'Summary banner + full alert cards with all metadata, suggested actions, and quick action buttons',
            },
            {
              context: 'Admission Dashboard',
              variant: 'Compact',
              description: 'Patient-specific alerts on admission overview',
              features:
                'Compact cards showing severity, title, primary action button, and dismiss option',
            },
            {
              context: 'Orders Queue',
              variant: 'Inline',
              description: 'Alerts embedded within order list items',
              features:
                'Minimal inline alerts with icon, title, and quick action - does not break list flow',
            },
            {
              context: 'Notification Center',
              variant: 'Compact',
              description: 'Consolidated alert center with all notifications',
              features:
                'Compact view with scrollable list, dismiss all, and mark read functionality',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{item.context}</h4>
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                  {item.variant} Variant
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{item.description}</p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <span className="font-medium">Features:</span> {item.features}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Alert Components */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Alert Component Breakdown</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">1. Severity Indicator</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Icon:</strong> AlertTriangle (critical), AlertCircle (warning), Info
                  (info)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Badge:</strong> CRITICAL / WARNING / INFO text badge
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Color Coding:</strong> Red (critical), Amber (warning), Blue (info)
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">2. Issue Description</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Title:</strong> Clear, concise alert title
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Description:</strong> Detailed explanation of the issue
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Category Badge:</strong> Signature, 485 Form, Recertification, etc.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">3. Contextual Metadata</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Patient Info:</strong> Name and admission ID
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Document Info:</strong> Type and ID
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Timeframes:</strong> Days overdue, days until due
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Missing Items:</strong> List of missing sections (for 485)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Physician:</strong> Name when signature-related
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">4. Suggested Action</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Action Box:</strong> White box with checkmark icon
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Action Text:</strong> Specific steps to resolve the issue
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Context-Aware:</strong> Actions tailored to the specific alert type
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">5. Quick Action Button</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Primary Button:</strong> One-click action to address issue
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Contextual Label:</strong> "Request Signature", "Complete 485",
                  "Correct Document", etc.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Severity Color:</strong> Red for critical, amber for warning
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Secondary Button:</strong> "View Details" for more information
                </span>
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
            '5 smart alert types',
            '3 severity levels (critical/warning/info)',
            '3 display variants (full/compact/inline)',
            '4 integration contexts',
            'Color-coded severity (red/amber/blue)',
            'Severity icons (AlertTriangle/AlertCircle/Info)',
            'Category badges (Signature, 485, etc.)',
            'Alert titles',
            'Detailed descriptions',
            'Patient name and admission ID',
            'Document type and ID',
            'Days overdue tracking',
            'Days until due tracking',
            'Missing sections list (485)',
            'Physician name display',
            'Order/expiration dates',
            'Suggested action box',
            'Quick action buttons',
            'View details button',
            'Dismiss functionality',
            'Summary banner component',
            'Alerts list component',
            'Empty state (no alerts)',
            'Timestamp display',
            'Responsive layouts',
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
