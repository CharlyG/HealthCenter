/**
 * Signature Workflow Center Demo Page
 * 
 * Demonstrates the comprehensive signature tracking interface for managing
 * clinician, physician, and medical director signatures on orders and
 * certification documents.
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  FileSignature,
  Info,
  Check,
  Layout,
  Users,
  Clock,
} from 'lucide-react';
import SignatureWorkflowCenter from '../components/SignatureWorkflowCenter';

export default function SignatureWorkflowCenterPage() {
  const navigate = useNavigate();

  const handleViewDocument = (itemId: string) => {
    console.log('Viewing document:', itemId);
  };

  const handleSendReminder = (itemId: string) => {
    console.log('Sending reminder for:', itemId);
  };

  const handleMarkSigned = (itemId: string) => {
    console.log('Marking as signed:', itemId);
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
                  Signature Workflow Center
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Track and manage signature requirements for orders and certifications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="workflow-center">
          <TabsList>
            <TabsTrigger value="workflow-center">
              <Layout className="w-4 h-4 mr-2" />
              Workflow Center
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Workflow Center Tab */}
          <TabsContent value="workflow-center" className="mt-6">
            <SignatureWorkflowCenter
              onViewDocument={handleViewDocument}
              onSendReminder={handleSendReminder}
              onMarkSigned={handleMarkSigned}
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
          Signature Workflow Center Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Comprehensive tracking interface for managing signature requirements on orders
          and certification documents. Helps agencies manage signature turnaround
          efficiently by tracking clinician, physician, and medical director signatures
          with visual indicators for overdue items and quick actions.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">3 Signature Types</p>
            <p className="text-sm text-blue-700 mt-1">Clinician, Physician, Med Director</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FileSignature className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">7 Data Fields</p>
            <p className="text-sm text-green-700 mt-1">Per item</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Turnaround Tracking</p>
            <p className="text-sm text-purple-700 mt-1">Days pending monitoring</p>
          </div>
        </div>
      </Card>

      {/* Signature Types */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">3 Signature Types Tracked</h3>
        <div className="space-y-4">
          {[
            {
              type: 'Clinician Signatures',
              color: '#3B82F6',
              icon: '👨‍⚕️',
              desc: 'Signatures required from nurses, therapists, and other clinicians',
              examples: [
                'Visit documentation signatures',
                'Assessment co-signatures',
                'Treatment plan acknowledgments',
              ],
            },
            {
              type: 'Physician Signatures',
              color: '#8B5CF6',
              icon: '🩺',
              desc: 'Signatures required from ordering physicians',
              examples: [
                'Physician orders',
                'Verbal orders',
                'Plan of Care / 485',
                'Recertification documents',
              ],
            },
            {
              type: 'Medical Director Signatures',
              color: '#10B981',
              icon: '🛡️',
              desc: 'Signatures required from medical director for oversight',
              examples: [
                'Recertification reviews',
                'Quality assurance documents',
                'Policy exceptions',
              ],
            },
          ].map((sig, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{sig.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{sig.type}</h4>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sig.color }}
                  />
                </div>
                <p className="text-sm text-gray-700 mb-3">{sig.desc}</p>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Common Examples:</p>
                  <ul className="space-y-1">
                    {sig.examples.map((example, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 7 Data Fields */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">7 Information Fields Per Item</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              field: 'Document Type',
              desc: 'Type of document requiring signature',
              examples: 'Physician Order, Verbal Order, Plan of Care, Recertification, etc.',
            },
            {
              field: 'Patient',
              desc: 'Patient name associated with document',
              examples: 'Margaret Johnson',
            },
            {
              field: 'Admission',
              desc: 'Admission ID for context',
              examples: 'ADM-12345',
            },
            {
              field: 'Sent for Signature Date',
              desc: 'Date document was sent for signature',
              examples: '12/15/2024',
            },
            {
              field: 'Days Pending',
              desc: 'Number of days since sent, color-coded by urgency',
              examples: '5 days (red if >3 days)',
            },
            {
              field: 'Current Status',
              desc: 'Current signature workflow status',
              examples: 'Pending, Signed, Returned, Overdue',
            },
            {
              field: 'Assigned Physician',
              desc: 'Physician responsible for signing',
              examples: 'Dr. Sarah Mitchell, MD',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-1">{item.field}</h4>
              <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                Example: {item.examples}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 4 Status Filters */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">4 Status Filters</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              status: 'Pending Signature',
              color: '#F59E0B',
              bgColor: '#FEF3C7',
              desc: 'Documents sent for signature but not yet signed',
              count: 'Shows items awaiting signature',
            },
            {
              status: 'Signed',
              color: '#10B981',
              bgColor: '#D1FAE5',
              desc: 'Documents with completed signatures',
              count: 'Shows successfully signed items',
            },
            {
              status: 'Returned',
              color: '#EF4444',
              bgColor: '#FEE2E2',
              desc: 'Documents returned for correction or revision',
              count: 'Shows items needing attention',
            },
            {
              status: 'Overdue',
              color: '#DC2626',
              bgColor: '#FEE2E2',
              desc: 'Documents pending >3 days (requires follow-up)',
              count: 'Shows urgent items needing action',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="px-3 py-1 rounded-md font-medium text-sm"
                  style={{
                    backgroundColor: item.bgColor,
                    color: item.color,
                  }}
                >
                  {item.status}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-1">{item.desc}</p>
              <p className="text-xs text-gray-600">{item.count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Statistics Dashboard */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">6 Statistics Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              metric: 'Total Items',
              desc: 'Total number of signature items in workflow',
              alert: false,
            },
            {
              metric: 'Pending',
              desc: 'Items currently awaiting signature',
              alert: true,
            },
            {
              metric: 'Overdue',
              desc: 'Items pending >3 days requiring follow-up',
              alert: true,
            },
            {
              metric: 'Avg Days Pending',
              desc: 'Average turnaround time for pending items',
              alert: false,
            },
            {
              metric: 'Signed',
              desc: 'Items with completed signatures',
              alert: false,
            },
            {
              metric: 'Returned',
              desc: 'Items returned for correction',
              alert: true,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'p-4 rounded-lg border text-center',
                item.alert ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
              )}
            >
              <p className="font-semibold text-gray-900 mb-1">{item.metric}</p>
              <p className="text-xs text-gray-600">{item.desc}</p>
              {item.alert && (
                <p className="text-xs text-amber-700 mt-1">⚠️ Shows alert if &gt; 0</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Filtering & Search */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Advanced Filtering & Search</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">4 Filter Dimensions:</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  filter: 'Status Filter',
                  options: 'All, Pending, Signed, Returned, Overdue',
                },
                {
                  filter: 'Signature Type Filter',
                  options: 'All, Clinician, Physician, Medical Director',
                },
                {
                  filter: 'Document Type Filter',
                  options: 'All, Physician Order, Verbal Order, POC, Recert, Discharge',
                },
                {
                  filter: 'Search Bar',
                  options: 'Document title, patient name, physician name, ID',
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
            <h4 className="font-medium text-gray-900 mb-3">Filter Features:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
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
                <span>Search across multiple fields simultaneously</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Dropdown selects for precise filtering</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Visual Indicators */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Visual Priority Indicators</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Overdue Items ({'>'}3 days):</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Red background tint for immediate visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Red left border (4px) for visual emphasis</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>"Overdue" badge with alert icon</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Days pending displayed in red bold text</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Days Pending Color Coding:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-900">•</span>
                <span>0-3 days: Gray (normal)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600">•</span>
                <span>{'>'}3 days: Red bold (overdue, needs follow-up)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Reminder Tracking:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Blue info banner showing reminder count</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Last reminder date displayed</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Bell icon for visual identification</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions (Per Item)</h3>
        <div className="space-y-3">
          {[
            {
              action: 'View',
              desc: 'Open full document detail view',
              availability: 'All items',
              variant: 'Ghost',
            },
            {
              action: 'Remind',
              desc: 'Send reminder notification to assigned physician',
              availability: 'Pending and Overdue items only',
              variant: 'Outline',
            },
            {
              action: 'Mark Signed',
              desc: 'Manually mark document as signed',
              availability: 'Pending and Overdue items only',
              variant: 'Primary',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{item.action}</p>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {item.variant}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{item.desc}</p>
                <p className="text-xs text-gray-600">Available: {item.availability}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grouping & Organization */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Grouping by Signature Type
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Automatic Grouping:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Items grouped by signature type (Clinician/Physician/Med Director)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Each group shows in separate collapsible section</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Color-coded section headers (blue/purple/green)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Item count displayed per section</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Automatic Sorting:</h4>
            <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
              <li>Overdue items appear first (highest priority)</li>
              <li>Then sorted by days pending (descending - oldest first)</li>
              <li>Within same days pending, alphabetical by patient name</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '3 signature types tracked (Clinician, Physician, Med Director)',
            '7 information fields per item',
            '4 status filters (Pending, Signed, Returned, Overdue)',
            '6 statistics metrics with alerts',
            'Advanced filtering (4 dimensions)',
            'Real-time search across multiple fields',
            'Visual priority indicators (overdue items)',
            'Days pending color coding (red >3 days)',
            'Reminder tracking and count',
            'Grouped by signature type',
            'Automatic sorting (overdue first)',
            '3 quick actions per item',
            'Export functionality',
            'Empty state handling',
            'Responsive grid layout',
            'Color-coded status badges',
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
