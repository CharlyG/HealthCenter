/**
 * Orders Workspace Demo Page
 * 
 * Demonstrates the Orders Workspace for managing all order-related documents
 * within an active patient admission.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  FileText,
  Info,
  Check,
  Layout,
  Filter as FilterIcon,
  Workflow,
  Users,
} from 'lucide-react';
import OrdersWorkspace from '../components/OrdersWorkspace';

export default function OrdersWorkspacePage() {
  const navigate = useNavigate();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const handleDocumentOpen = (documentId: string) => {
    console.log('Opening document:', documentId);
    setSelectedDocumentId(documentId);
  };

  const handleDocumentEdit = (documentId: string) => {
    console.log('Editing document:', documentId);
  };

  const handleDocumentSign = (documentId: string) => {
    console.log('Signing document:', documentId);
  };

  const handleDocumentReturn = (documentId: string) => {
    console.log('Returning document:', documentId);
  };

  const handleCreateOrder = () => {
    console.log('Creating new order');
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
                <h1 className="text-xl font-bold text-gray-900">Orders Workspace</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Organize and manage all order-related documents for patient admission
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="workspace">
          <TabsList>
            <TabsTrigger value="workspace">
              <Layout className="w-4 h-4 mr-2" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Workspace Tab */}
          <TabsContent value="workspace" className="mt-6">
            <Card className="overflow-hidden">
              <OrdersWorkspace
                admissionId="ADM-12345"
                patientName="Margaret Johnson"
                onDocumentOpen={handleDocumentOpen}
                onDocumentEdit={handleDocumentEdit}
                onDocumentSign={handleDocumentSign}
                onDocumentReturn={handleDocumentReturn}
                onCreateOrder={handleCreateOrder}
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
        <h3 className="font-semibold text-gray-900 mb-4">Orders Workspace Overview</h3>
        <p className="text-gray-700 mb-4">
          Comprehensive workspace for organizing and managing all order-related documents
          within an active patient admission. Groups documents by category with advanced
          filtering and direct action capabilities.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Layout className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">7 Category Groups</p>
            <p className="text-sm text-blue-700 mt-1">Organized workspace</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FilterIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">6 Filter Options</p>
            <p className="text-sm text-green-700 mt-1">Precise filtering</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Workflow className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">4 Quick Actions</p>
            <p className="text-sm text-purple-700 mt-1">Direct from workspace</p>
          </div>
        </div>
      </Card>

      {/* Category Groups */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">7 Category Groups</h3>
        <div className="space-y-3">
          {[
            {
              title: 'Pending Orders',
              description:
                'Orders in draft, pending review, or pending signature status',
              color: '#F59E0B',
              includes: ['Draft documents', 'Under clinical review', 'Awaiting signatures'],
            },
            {
              title: 'Signed Orders',
              description: 'Fully signed and active orders currently in effect',
              color: '#10B981',
              includes: ['Signed documents', 'Active orders', 'Approved for implementation'],
            },
            {
              title: 'Returned Orders',
              description: 'Orders returned for revision or cancelled',
              color: '#EF4444',
              includes: ['Cancelled orders', 'Rejected documents', 'Revision requests'],
            },
            {
              title: 'Expired Orders',
              description: 'Orders that have passed their certification period',
              color: '#6B7280',
              includes: ['Past effective dates', 'Superseded documents', 'Historical records'],
            },
            {
              title: 'Verbal Orders',
              description: 'All verbal orders regardless of status',
              color: '#F59E0B',
              includes: [
                'Read-back verified',
                'Pending physician signature',
                'Active verbal orders',
              ],
            },
            {
              title: 'Plan of Care / 485',
              description: 'CMS 485 Plan of Care documents',
              color: '#10B981',
              includes: [
                'Initial certifications',
                'Active care plans',
                'Discipline-specific orders',
              ],
            },
            {
              title: 'Recertification Documents',
              description: 'Recertification for continued care',
              color: '#8B5CF6',
              includes: [
                'Period recertifications',
                'Continued need justification',
                'Updated care plans',
              ],
            },
          ].map((group, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{group.title}</h4>
                <p className="text-sm text-gray-700 mb-2">{group.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {group.includes.map((item, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Document Display */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Document Information Display</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Each Item Shows (7 Fields):</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Document Type', example: 'Physician Order, Verbal Order, etc.' },
                { label: 'Order Date', example: '12/15/2024' },
                { label: 'Effective Date', example: '12/16/2024' },
                { label: 'Ordering Physician', example: 'Dr. Sarah Mitchell' },
                { label: 'Created By', example: 'Emily Chen, RN' },
                { label: 'Status', example: 'Active, Pending, Signed, etc.' },
                { label: 'Signature Status', example: 'Fully Signed, Pending Physician, etc.' },
              ].map((field, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm mb-1">{field.label}</p>
                  <p className="text-xs text-gray-600">{field.example}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Visual Indicators:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Status badges with color-coded backgrounds</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Pending signature alerts (amber badge)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Expiration warnings with severity levels (critical/warning/info)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Icons for dates, physicians, and creators</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Advanced Filtering System</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">6 Filter Options:</h4>
            <div className="space-y-2">
              {[
                {
                  label: 'Document Type',
                  desc: 'Filter by physician order, verbal order, plan of care, etc.',
                },
                {
                  label: 'Status',
                  desc: 'Filter by draft, pending, signed, active, expired, etc.',
                },
                {
                  label: 'Physician',
                  desc: 'Search and filter by ordering physician name',
                },
                {
                  label: 'Signature Status',
                  desc: 'Filter by pending, partially signed, fully signed',
                },
                {
                  label: 'Date Range (Start)',
                  desc: 'Filter orders from a specific date',
                },
                {
                  label: 'Date Range (End)',
                  desc: 'Filter orders up to a specific date',
                },
              ].map((filter, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm mb-1">{filter.label}</p>
                  <p className="text-xs text-gray-600">{filter.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Filter Features:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Collapsible filter panel (toggle on/off)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Active filter badge indicator</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Clear all filters button</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Real-time filtering (instant results)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Combined filters (AND logic)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Search bar (separate from filters)</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Direct Actions from Workspace</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">4 Primary Actions:</h4>
            <div className="space-y-3">
              {[
                {
                  action: 'Open',
                  desc: 'View full document detail with all tabs',
                  available: 'All documents',
                },
                {
                  action: 'Edit',
                  desc: 'Modify document content and properties',
                  available: 'Draft and pending documents only',
                },
                {
                  action: 'Sign',
                  desc: 'Send for or complete electronic signature',
                  available: 'Pending signature documents',
                },
                {
                  action: 'Return',
                  desc: 'Return document for revision or cancel',
                  available: 'All except cancelled documents',
                },
              ].map((action, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{action.action}</p>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      Action
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{action.desc}</p>
                  <p className="text-xs text-gray-600">Available: {action.available}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Workspace Actions:</h4>
            <div className="space-y-3">
              {[
                {
                  action: 'New Order',
                  desc: 'Create new order document',
                  location: 'Header button',
                },
                {
                  action: 'Export',
                  desc: 'Export workspace data to CSV/PDF',
                  location: 'Header button',
                },
                {
                  action: 'Expand/Collapse Categories',
                  desc: 'Show or hide category contents',
                  location: 'Category headers',
                },
                {
                  action: 'Search',
                  desc: 'Search by ID, physician, or creator',
                  location: 'Search bar',
                },
              ].map((action, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{action.action}</p>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      Workspace
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{action.desc}</p>
                  <p className="text-xs text-gray-600">Location: {action.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Dashboard */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Statistics Dashboard</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: 'Total Orders',
              desc: 'Count of all documents in admission',
              alert: false,
            },
            {
              label: 'Pending',
              desc: 'Documents awaiting action',
              alert: true,
            },
            {
              label: 'Needs Signature',
              desc: 'Documents pending physician/nurse signature',
              alert: true,
            },
            {
              label: 'Expiring Soon',
              desc: 'Documents expiring within 14 days',
              alert: true,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3 rounded-lg border',
                stat.alert ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
              )}
            >
              <p className="font-medium text-gray-900 text-sm mb-1">{stat.label}</p>
              <p className="text-xs text-gray-600">{stat.desc}</p>
              {stat.alert && (
                <p className="text-xs text-amber-700 mt-1">⚠️ Shows alert if count &gt; 0</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Use Cases */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Clinical Use Cases</h3>
        <div className="space-y-3">
          {[
            {
              role: 'Care Coordinators',
              desc: 'Track all orders for admission with single-screen visibility',
              workflows: [
                'Monitor pending signatures',
                'Track expiration dates',
                'Ensure compliance',
              ],
            },
            {
              role: 'Nurses',
              desc: 'Manage verbal orders and track physician signatures',
              workflows: [
                'Create verbal orders',
                'Send for signature',
                'Follow up on pending',
              ],
            },
            {
              role: 'Physicians',
              desc: 'Review and sign pending orders efficiently',
              workflows: [
                'View pending orders queue',
                'Sign electronically',
                'Return for revision',
              ],
            },
            {
              role: 'Clinical Supervisors',
              desc: 'Oversee order workflow and compliance',
              workflows: [
                'Monitor all categories',
                'Identify bottlenecks',
                'Review returned orders',
              ],
            },
            {
              role: 'Billing Teams',
              desc: 'Verify signed orders before claim submission',
              workflows: [
                'Check signature status',
                'Verify active orders',
                'Validate date ranges',
              ],
            },
          ].map((useCase, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">{useCase.role}</p>
                <p className="text-sm text-gray-700 mb-2">{useCase.desc}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {useCase.workflows.map((workflow, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                    >
                      {workflow}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '7 category groups with expand/collapse',
            '6 advanced filter options',
            '4 direct actions per document',
            'Real-time search functionality',
            'Statistics dashboard with alerts',
            'Color-coded status indicators',
            'Signature status tracking',
            'Expiration warnings (3 levels)',
            'Physician name filtering',
            'Date range filtering',
            'Empty state handling',
            'Responsive grid layout',
            'Export capability',
            'New order creation',
            'Document count badges',
            'Visual category icons',
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
