/**
 * Verbal Order Workflow Demo Page
 * 
 * Demonstrates the complete verbal order workflow including form entry,
 * status tracking, signature monitoring, and turnaround time analysis.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Phone,
  Info,
  Check,
  Plus,
  Layout,
  Clock,
  Workflow,
} from 'lucide-react';
import VerbalOrderForm from '../components/VerbalOrderForm';
import VerbalOrdersTracking from '../components/VerbalOrdersTracking';

export default function VerbalOrderWorkflowPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const handleSaveOrder = (data: any, sendForSignature: boolean) => {
    console.log('Saving order:', data, 'Send for signature:', sendForSignature);
    setShowForm(false);
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
                <h1 className="text-xl font-bold text-gray-900">Verbal Order Workflow</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Document verbal orders and track physician signature process
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="tracking">
          <TabsList>
            <TabsTrigger value="tracking">
              <Layout className="w-4 h-4 mr-2" />
              Orders Tracking
            </TabsTrigger>
            <TabsTrigger value="form">
              <Phone className="w-4 h-4 mr-2" />
              New Verbal Order
            </TabsTrigger>
            <TabsTrigger value="workflow">
              <Info className="w-4 h-4 mr-2" />
              Workflow Information
            </TabsTrigger>
          </TabsList>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Verbal Orders</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Track all verbal orders and signature status
                  </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Verbal Order
                </Button>
              </div>

              {showForm ? (
                <Card className="p-6">
                  <VerbalOrderForm
                    mode="create"
                    onSave={handleSaveOrder}
                    onCancel={() => setShowForm(false)}
                  />
                </Card>
              ) : (
                <VerbalOrdersTracking
                  onOrderView={id => console.log('View order:', id)}
                  onOrderEdit={id => console.log('Edit order:', id)}
                  onSendForSignature={id => console.log('Send for signature:', id)}
                  onMarkSigned={id => console.log('Mark signed:', id)}
                  onReturnForCorrection={id => console.log('Return:', id)}
                />
              )}
            </div>
          </TabsContent>

          {/* Form Tab */}
          <TabsContent value="form" className="mt-6">
            <Card className="p-6">
              <VerbalOrderForm
                mode="create"
                onSave={handleSaveOrder}
                onCancel={() => {}}
              />
            </Card>
          </TabsContent>

          {/* Workflow Info Tab */}
          <TabsContent value="workflow" className="mt-6 space-y-6">
            <WorkflowInformation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW INFORMATION
// ═══════════════════════════════════════════════════════════════════════════

function WorkflowInformation() {
  return (
    <>
      {/* Overview */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Verbal Order Workflow Overview</h3>
        <p className="text-gray-700 mb-4">
          Comprehensive workflow for documenting verbal orders received from physicians and
          tracking the required signature process. Ensures regulatory compliance while
          providing visibility into signature turnaround times.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Phone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">7 Form Fields</p>
            <p className="text-sm text-blue-700 mt-1">Complete documentation</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Workflow className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">5 Workflow States</p>
            <p className="text-sm text-green-700 mt-1">Full lifecycle</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Signature Tracking</p>
            <p className="text-sm text-purple-700 mt-1">Turnaround monitoring</p>
          </div>
        </div>
      </Card>

      {/* Form Fields */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">7 Verbal Order Form Fields</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              field: 'Order Date',
              desc: 'Date when verbal order was received',
              required: true,
              type: 'Date picker',
            },
            {
              field: 'Effective Date',
              desc: 'Date when order becomes effective',
              required: true,
              type: 'Date picker',
            },
            {
              field: 'Ordering Physician',
              desc: 'Physician who gave the verbal order',
              required: true,
              type: 'Search & select',
            },
            {
              field: 'Verbal Order Summary',
              desc: 'Order as received from physician',
              required: true,
              type: 'Textarea (min 10 chars)',
            },
            {
              field: 'Clinical Context',
              desc: 'Rationale and clinical situation',
              required: true,
              type: 'Textarea (min 10 chars)',
            },
            {
              field: 'Entered By',
              desc: 'Clinician documenting the order',
              required: true,
              type: 'Auto-filled from current user',
            },
            {
              field: 'Related Admission',
              desc: 'Patient admission for this order',
              required: true,
              type: 'Search & select',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.field}</h4>
                {item.required && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                    Required
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-1">{item.desc}</p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-2">
                Type: {item.type}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Workflow States */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">5 Workflow States</h3>
        <div className="space-y-3">
          {[
            {
              state: 'Draft',
              color: '#6B7280',
              bgColor: '#F9FAFB',
              desc: 'Order being created, not yet completed',
              actions: ['Edit', 'Save'],
              icon: '✏️',
            },
            {
              state: 'Completed',
              color: '#3B82F6',
              bgColor: '#DBEAFE',
              desc: 'Order completed and ready to send for signature',
              actions: ['Send for Signature', 'Edit'],
              icon: '✓',
            },
            {
              state: 'Pending Physician Signature',
              color: '#F59E0B',
              bgColor: '#FEF3C7',
              desc: 'Sent to physician and awaiting signature',
              actions: ['Mark as Signed', 'Return for Correction'],
              icon: '⏳',
            },
            {
              state: 'Signed',
              color: '#10B981',
              bgColor: '#D1FAE5',
              desc: 'Physician signature obtained, order active',
              actions: ['View Only'],
              icon: '✅',
            },
            {
              state: 'Returned for Correction',
              color: '#EF4444',
              bgColor: '#FEE2E2',
              desc: 'Returned by physician with correction notes',
              actions: ['Edit & Resubmit'],
              icon: '↩️',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="px-3 py-1 rounded-md font-medium text-sm"
                    style={{
                      backgroundColor: item.bgColor,
                      color: item.color,
                    }}
                  >
                    {item.state}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-600">Available Actions:</span>
                  {item.actions.map((action, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Signature Tracking */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Signature Tracking Features</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Days Pending Indicator</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Automatic calculation of days since sent for signature
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Badge display showing "Xd pending" on order cards</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Color-coded: Amber (1-3 days), Red ({'>'}3 days overdue)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Overdue Alerts</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Orders pending &gt;3 days get red border and background</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Alert banner with "Signature Overdue" message and follow-up prompt
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Overdue count in statistics dashboard</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Turnaround Time Monitoring</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  Average turnaround time calculation (sent to signed)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Displayed in statistics dashboard for quick reference</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Helps identify physician responsiveness patterns</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Timeline Visualization</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Created timestamp with user and date/time</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Sent for signature timestamp</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Signed timestamp (when applicable)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Icons indicating each milestone</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Statistics Dashboard */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Statistics Dashboard</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            {
              label: 'Total Orders',
              desc: 'All verbal orders in system',
              alert: false,
            },
            {
              label: 'Pending Signature',
              desc: 'Orders awaiting physician signature',
              alert: true,
            },
            {
              label: 'Overdue (>3 days)',
              desc: 'Orders pending longer than 3 days',
              alert: true,
            },
            {
              label: 'Avg Turnaround',
              desc: 'Average days from sent to signed',
              alert: false,
            },
            {
              label: 'Signed',
              desc: 'Orders with physician signature',
              alert: false,
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3 rounded-lg text-center border',
                stat.alert ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
              )}
            >
              <p className="font-medium text-sm text-gray-900 mb-1">{stat.label}</p>
              <p className="text-xs text-gray-600">{stat.desc}</p>
              {stat.alert && (
                <p className="text-xs text-amber-700 mt-1">⚠️ Alerts if &gt; 0</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Actions & Workflow */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">User Actions by State</h3>
        <div className="space-y-3">
          {[
            {
              state: 'Draft',
              actions: ['Edit form fields', 'Save as draft', 'Complete and send for signature'],
            },
            {
              state: 'Completed',
              actions: ['Send for signature', 'Edit before sending'],
            },
            {
              state: 'Pending Physician Signature',
              actions: [
                'Mark as signed (when physician confirms)',
                'Return for correction (if issues found)',
                'View pending status and days',
              ],
            },
            {
              state: 'Signed',
              actions: ['View only (read-only)', 'Download/print', 'View history'],
            },
            {
              state: 'Returned for Correction',
              actions: [
                'View return reason',
                'Edit order with corrections',
                'Resubmit for signature',
              ],
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">{item.state}</p>
              <ul className="space-y-1">
                {item.actions.map((action, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '7 required form fields with validation',
            '5 workflow states with clear transitions',
            'Automatic days pending calculation',
            'Overdue alerts (>3 days) with visual emphasis',
            'Average turnaround time tracking',
            'Timeline visualization with timestamps',
            'Return for correction workflow',
            'Clinical context documentation',
            'Physician search and selection',
            'Admission association',
            'Statistics dashboard',
            'Status filtering',
            'Search functionality',
            'Priority sorting (overdue first)',
            'Save as draft capability',
            'Send for signature action',
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
