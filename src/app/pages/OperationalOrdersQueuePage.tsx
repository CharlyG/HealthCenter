/**
 * Operational Orders Queue Demo Page
 * 
 * Demonstrates the comprehensive queue interface for coordinators, QA staff,
 * and administrators to manage actionable order-related items with fast
 * triage and resolution capabilities.
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  ClipboardList,
  Info,
  Check,
  Layout,
  Users,
  AlertTriangle,
} from 'lucide-react';
import OperationalOrdersQueue from '../components/OperationalOrdersQueue';

export default function OperationalOrdersQueuePage() {
  const navigate = useNavigate();

  const handleViewItem = (itemId: string) => {
    console.log('Viewing item:', itemId);
  };

  const handleEditItem = (itemId: string) => {
    console.log('Editing item:', itemId);
  };

  const handleAssignItem = (itemId: string, userId: string) => {
    console.log('Assigning item:', itemId, 'to user:', userId);
  };

  const handleResolveItem = (itemId: string) => {
    console.log('Resolving item:', itemId);
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
                  Operational Orders Queue
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage actionable order-related items for fast triage and resolution
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue">
              <Layout className="w-4 h-4 mr-2" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Queue Tab */}
          <TabsContent value="queue" className="mt-6">
            <OperationalOrdersQueue
              onViewItem={handleViewItem}
              onEditItem={handleEditItem}
              onAssignItem={handleAssignItem}
              onResolveItem={handleResolveItem}
            />
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
          Operational Orders Queue Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Comprehensive queue interface for coordinators, QA staff, and administrators to
          manage actionable order-related items. Supports fast triage and resolution of
          order-related issues with priority management, quick actions, advanced filtering,
          and assignment tracking.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">5 Queue Categories</p>
            <p className="text-sm text-blue-700 mt-1">Actionable items</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">7 Display Fields</p>
            <p className="text-sm text-green-700 mt-1">Per queue item</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">4 Priority Levels</p>
            <p className="text-sm text-purple-700 mt-1">Visual indicators</p>
          </div>
        </div>
      </Card>

      {/* 5 Queue Categories */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">5 Actionable Queue Categories</h3>
        <div className="space-y-4">
          {[
            {
              category: 'Orders Pending Completion',
              color: 'Amber (#F59E0B)',
              icon: '✏️',
              desc: 'Orders that have been created but not marked as complete',
              actionRequired: 'Complete all required fields and mark document as complete',
              example: '"Physical Therapy 3x per week" - Order created but not marked as complete',
            },
            {
              category: 'Orders Pending Physician Signature',
              color: 'Blue (#3B82F6)',
              icon: '📤',
              desc: 'Orders that are complete and awaiting physician signature',
              actionRequired: 'Send reminder to physician or follow up on signature',
              example: '"Increase Lasix to 40mg PO daily" - Awaiting Dr. Mitchell\'s signature for 2 days',
            },
            {
              category: 'Orders Returned for Correction',
              color: 'Red (#DC2626)',
              icon: '🔄',
              desc: 'Orders that have been returned by physician with issues to fix',
              actionRequired: 'Review return reason, make corrections, and resubmit',
              example: '"Verbal Order" - Returned: Order date/time not specified',
            },
            {
              category: '485 Documents Pending Signature',
              color: 'Purple (#8B5CF6)',
              icon: '📋',
              desc: 'Plan of Care / 485 documents awaiting physician signature',
              actionRequired: 'Prioritize 485 signatures to avoid payer submission delays',
              example: '"Plan of Care Amendment - Add OT" - Pending signature for 3 days',
            },
            {
              category: 'Overdue Signatures',
              color: 'Red (#DC2626)',
              icon: '⚠️',
              desc: 'Signatures pending >3 days (regulatory compliance issue)',
              actionRequired: 'Immediate action required - escalate to physician or supervisor',
              example: '"Recertification - Period 2" - 7 days overdue, payer deadline approaching',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{item.category}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.color}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
                <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded mb-2">
                  <span className="font-medium">Action Required:</span> {item.actionRequired}
                </p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Example:</span> {item.example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 7 Display Fields */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">7 Display Fields Per Queue Item</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              field: 'Patient Name',
              desc: 'Patient name and ID for identification',
              display: 'Bold name with ID below',
              example: 'Margaret Johnson\nPAT-001',
            },
            {
              field: 'Admission Start Date',
              desc: 'When the admission began',
              display: 'Date with calendar icon',
              example: '12/01/2024',
            },
            {
              field: 'Document Type',
              desc: 'Type of order/certification document',
              display: 'Type label + document title (truncated)',
              example: 'Verbal Order\n"Increase Lasix to 40mg PO daily"',
            },
            {
              field: 'Physician',
              desc: 'Assigned physician for the order',
              display: 'Name with user icon',
              example: 'Dr. Sarah Mitchell',
            },
            {
              field: 'Days Pending',
              desc: 'Number of days since item entered queue',
              display: 'Bold number, RED if >3 days',
              example: '5 days (red)',
            },
            {
              field: 'Issue Description',
              desc: 'Clear explanation of what needs to be done',
              display: 'Text (max 250px) + assigned to info if applicable',
              example: '"Order date/time not specified, returned by physician"\nAssigned to Emily Chen',
            },
            {
              field: 'Priority',
              desc: 'Urgency level for triage',
              display: 'Color-coded badge (Critical/High/Medium/Low)',
              example: 'Critical (red badge)',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{item.field}</h4>
              <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Display:</span> {item.display}
              </p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded whitespace-pre-line">
                <span className="font-medium">Example:</span> {item.example}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 4 Priority Levels */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">4 Priority Levels</h3>
        <div className="space-y-4">
          {[
            {
              priority: 'Critical',
              color: 'Red (#DC2626)',
              bgColor: '#FEE2E2',
              criteria: 'Regulatory deadline imminent, >7 days overdue, patient discharge blocked',
              visualTreatment: 'Red badge + red background tint on entire row + red left border (4px)',
              examples: [
                'Recertification 7 days overdue with payer deadline approaching',
                'Verbal order 5 days overdue (regulatory requirement: sign within 3 days)',
                'Discharge certification blocking patient discharge',
              ],
            },
            {
              priority: 'High',
              color: 'Amber (#F59E0B)',
              bgColor: '#FEF3C7',
              criteria: '4-6 days pending, important clinical change, payer submission upcoming',
              visualTreatment: 'Amber badge on white background',
              examples: [
                '485 pending signature for 4 days',
                'Order for new medication awaiting signature',
                'Returned order needs correction for care delivery',
              ],
            },
            {
              priority: 'Medium',
              color: 'Blue (#3B82F6)',
              bgColor: '#DBEAFE',
              criteria: '2-3 days pending, routine orders, standard workflow',
              visualTreatment: 'Blue badge on white background',
              examples: [
                'PT order pending signature for 2 days',
                'Routine medication order awaiting completion',
              ],
            },
            {
              priority: 'Low',
              color: 'Gray (#6B7280)',
              bgColor: '#F3F4F6',
              criteria: '0-1 days pending, informational, non-urgent',
              visualTreatment: 'Gray badge on white background',
              examples: [
                'Order created today, pending completion',
                'Routine order in normal workflow',
              ],
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="px-3 py-1 rounded-md font-semibold text-sm"
                  style={{
                    backgroundColor: item.bgColor,
                    color: item.color,
                  }}
                >
                  {item.priority}
                </div>
                <span className="text-xs text-gray-600">{item.color}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Criteria:</span> {item.criteria}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Visual Treatment:</span> {item.visualTreatment}
              </p>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Examples:</p>
                <ul className="space-y-1">
                  {item.examples.map((example, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Advanced Filtering */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Advanced Filtering & Search</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">4 Filter Dimensions:</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  filter: 'Search Bar',
                  options: 'Search patient name, document title, issue description, or queue ID',
                },
                {
                  filter: 'Priority Filter',
                  options: 'All Priorities, Critical, High, Medium, Low',
                },
                {
                  filter: 'Physician Filter',
                  options: 'All Physicians, or select specific physician from dropdown',
                },
                {
                  filter: 'Category Tabs',
                  options: '5 tabs - auto-filter items by category',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm mb-1">{item.filter}</p>
                  <p className="text-xs text-gray-600">{item.options}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Filter Behavior:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Real-time filtering (instant results as you type)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Combined filters (AND logic) - all filters applied simultaneously</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Result count displayed ("X items found")</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Empty state message when no matches</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Sorting Capabilities */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">3 Sortable Columns</h3>
        <div className="space-y-3">
          {[
            {
              column: 'Patient',
              desc: 'Sort alphabetically by patient name',
              defaultDirection: 'Ascending (A-Z)',
            },
            {
              column: 'Days Pending',
              desc: 'Sort by urgency based on time in queue',
              defaultDirection: 'Descending (highest first)',
            },
            {
              column: 'Priority',
              desc: 'Sort by priority level',
              defaultDirection: 'Descending (Critical → High → Medium → Low)',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{item.column}</h4>
                <p className="text-sm text-gray-700 mb-1">{item.desc}</p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Default:</span> {item.defaultDirection}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-3">Sorting Features:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Click column header to sort</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Click again to toggle ascending/descending</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Visual indicator (chevron up/down) shows current sort</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Sorting persists across filter changes</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">3 Quick Actions Per Item</h3>
        <div className="space-y-3">
          {[
            {
              action: 'View',
              desc: 'Open full document detail view',
              icon: '👁️',
              availability: 'All items',
            },
            {
              action: 'Edit',
              desc: 'Open document in edit mode to make changes',
              icon: '✏️',
              availability: 'All items',
            },
            {
              action: 'Resolve',
              desc: 'Mark item as resolved and remove from queue',
              icon: '✅',
              availability: 'All items',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{item.action}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.availability}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Statistics Dashboard */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">7 Statistics Metrics</h3>
        <div className="space-y-3">
          {[
            { metric: 'Pending Completion', desc: 'Count of orders pending completion', alert: true },
            { metric: 'Pending Signature', desc: 'Count of orders pending physician signature', alert: true },
            { metric: 'Returned', desc: 'Count of orders returned for correction', alert: true },
            { metric: '485 Pending', desc: 'Count of 485 documents pending signature', alert: true },
            { metric: 'Overdue', desc: 'Count of overdue signatures (>3 days)', alert: true },
            { metric: 'Critical Priority', desc: 'Count of critical priority items', alert: true },
            { metric: 'Avg Days Pending', desc: 'Average days pending across all items', alert: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-start gap-4 p-3 rounded-lg border',
                item.alert ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
              )}
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{item.metric}</h4>
                <p className="text-sm text-gray-700">{item.desc}</p>
                {item.alert && (
                  <p className="text-xs text-amber-700 mt-1">⚠️ Shows alert if count &gt; 0</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fast Triage Support */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Features Supporting Fast Triage & Resolution
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">✓ Visual Priority Indicators</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Critical items have red background tint + red left border for immediate visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Days pending shown in RED BOLD when &gt;3 days (overdue)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Color-coded priority badges (Critical/High/Medium/Low)</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">✓ Quick Decision Making</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Clear issue descriptions explain WHAT needs to be done</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Assignment visibility shows WHO is responsible</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Days pending shows HOW URGENT the item is</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">✓ Efficient Workflow</h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Category tabs organize items by action type</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>One-click actions (View, Edit, Resolve)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Filter by physician to batch-process items</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Sort by days pending to tackle oldest items first</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '5 actionable queue categories (tabs)',
            '7 display fields per queue item',
            '4 priority levels with color coding',
            '7 statistics metrics dashboard',
            'Advanced filtering (4 dimensions)',
            'Real-time search across multiple fields',
            '3 sortable columns with visual indicators',
            'Quick actions (View, Edit, Resolve)',
            'Critical item visual treatment (red row)',
            'Overdue indicator (red bold days)',
            'Assignment tracking display',
            'Empty state for no results',
            'Result count display',
            'Responsive table layout',
            'Category-based organization',
            'Physician-specific filtering',
            'Combined filter logic (AND)',
            'Toggle sort direction',
            'Issue description truncation',
            'Document title tooltips',
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
