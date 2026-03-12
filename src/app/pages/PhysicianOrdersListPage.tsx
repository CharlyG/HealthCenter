/**
 * Physician Orders List Demo Page
 * 
 * Demonstrates the dedicated list view for physician orders within
 * a patient admission with comprehensive information display and
 * contextual quick actions.
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
  AlertCircle,
  Users,
  Zap,
} from 'lucide-react';
import PhysicianOrdersList from '../components/PhysicianOrdersList';

export default function PhysicianOrdersListPage() {
  const navigate = useNavigate();

  const handleOrderOpen = (orderId: string) => {
    console.log('Opening order:', orderId);
  };

  const handleOrderReview = (orderId: string) => {
    console.log('Reviewing order:', orderId);
  };

  const handleSendForSignature = (orderId: string) => {
    console.log('Sending for signature:', orderId);
  };

  const handleMarkSigned = (orderId: string) => {
    console.log('Marking as signed:', orderId);
  };

  const handleReturnForCorrection = (orderId: string) => {
    console.log('Returning for correction:', orderId);
  };

  const handleViewHistory = (orderId: string) => {
    console.log('Viewing history:', orderId);
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
                <h1 className="text-xl font-bold text-gray-900">
                  Physician Orders List View
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Dedicated list view for managing physician orders within patient admission
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="list-view">
          <TabsList>
            <TabsTrigger value="list-view">
              <Layout className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* List View Tab */}
          <TabsContent value="list-view" className="mt-6">
            <PhysicianOrdersList
              admissionId="ADM-12345"
              patientName="Margaret Johnson"
              onOrderOpen={handleOrderOpen}
              onOrderReview={handleOrderReview}
              onSendForSignature={handleSendForSignature}
              onMarkSigned={handleMarkSigned}
              onReturnForCorrection={handleReturnForCorrection}
              onViewHistory={handleViewHistory}
              onCreateOrder={handleCreateOrder}
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
          Physician Orders List View Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Dedicated list view for physician orders within a patient admission. Displays
          comprehensive order information with clear status indicators and contextual quick
          actions to help staff understand which orders need attention.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">8 Information Fields</p>
            <p className="text-sm text-blue-700 mt-1">Per order item</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Zap className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">6 Quick Actions</p>
            <p className="text-sm text-green-700 mt-1">Contextual to status</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Priority Indicators</p>
            <p className="text-sm text-purple-700 mt-1">Needs attention</p>
          </div>
        </div>
      </Card>

      {/* Information Display */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">8 Information Fields Per Order</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              field: 'Order Title',
              desc: 'Primary title or name of the order',
              example: 'Increase Lasix Dosage',
            },
            {
              field: 'Order Summary',
              desc: 'Detailed description of the order',
              example: 'Increase Lasix to 40mg PO daily for CHF management',
            },
            {
              field: 'Order Date',
              desc: 'Date when order was written',
              example: '12/15/2024',
            },
            {
              field: 'Effective Date',
              desc: 'Date when order becomes effective',
              example: '12/16/2024',
            },
            {
              field: 'Ordering Physician',
              desc: 'Physician who wrote the order',
              example: 'Dr. Sarah Mitchell, MD',
            },
            {
              field: 'Created By',
              desc: 'Staff member who entered the order',
              example: 'Emily Chen, RN',
            },
            {
              field: 'Current Status',
              desc: 'Workflow status with color-coded badge',
              example: 'Pending Signature, Signed, etc.',
            },
            {
              field: 'Signature Statuses',
              desc: 'Clinician and physician signature status',
              example: 'Clinician: Signed, Physician: Pending',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-1">{item.field}</h4>
              <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                Example: {item.example}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Status Types */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">6 Status Types</h3>
        <div className="space-y-3">
          {[
            {
              status: 'Draft',
              color: '#6B7280',
              bgColor: '#F9FAFB',
              desc: 'Order is being created, not yet submitted',
              priority: 'Medium',
            },
            {
              status: 'Pending Review',
              color: '#F59E0B',
              bgColor: '#FEF3C7',
              desc: 'Order submitted and awaiting clinical review',
              priority: 'High',
            },
            {
              status: 'Pending Signature',
              color: '#3B82F6',
              bgColor: '#DBEAFE',
              desc: 'Order reviewed and awaiting physician signature',
              priority: 'High',
            },
            {
              status: 'Signed',
              color: '#10B981',
              bgColor: '#D1FAE5',
              desc: 'Order fully signed and active',
              priority: 'Low',
            },
            {
              status: 'Returned for Correction',
              color: '#EF4444',
              bgColor: '#FEE2E2',
              desc: 'Order returned by reviewer with correction notes',
              priority: 'Critical',
            },
            {
              status: 'Expired',
              color: '#6B7280',
              bgColor: '#F3F4F6',
              desc: 'Order has passed its effective period',
              priority: 'Low',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <div
                className="px-3 py-1 rounded-md font-medium text-sm"
                style={{
                  backgroundColor: item.bgColor,
                  color: item.color,
                }}
              >
                {item.status}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{item.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-900">Priority</p>
                <p
                  className={cn(
                    'text-xs font-semibold',
                    item.priority === 'Critical' && 'text-red-600',
                    item.priority === 'High' && 'text-amber-600',
                    item.priority === 'Medium' && 'text-blue-600',
                    item.priority === 'Low' && 'text-gray-600'
                  )}
                >
                  {item.priority}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Signature Status */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Signature Status Display</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">4 Signature Status Types:</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  status: 'Not Signed',
                  icon: '✗',
                  color: '#6B7280',
                  desc: 'No signature obtained',
                },
                {
                  status: 'Clinician Signed',
                  icon: '☑',
                  color: '#3B82F6',
                  desc: 'Clinician has signed',
                },
                {
                  status: 'Physician Signed',
                  icon: '☑',
                  color: '#3B82F6',
                  desc: 'Physician has signed',
                },
                {
                  status: 'Fully Signed',
                  icon: '✓',
                  color: '#10B981',
                  desc: 'All required signatures obtained',
                },
              ].map((sig, idx) => (
                <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: sig.color }}>{sig.icon}</span>
                    <span className="font-medium text-sm" style={{ color: sig.color }}>
                      {sig.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{sig.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Dual Signature Tracking:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Separate status for clinician signature</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Separate status for physician signature</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Visual icons indicate signature state</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Color-coded by status (gray/blue/green)</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">6 Contextual Quick Actions</h3>
        <div className="space-y-3">
          {[
            {
              action: 'Open',
              desc: 'View full order details',
              availability: 'All orders',
              variant: 'Outline',
            },
            {
              action: 'Review',
              desc: 'Review order content and approve/reject',
              availability: 'Pending Review status only',
              variant: 'Default (Primary)',
            },
            {
              action: 'Send for Signature',
              desc: 'Send order to physician for signature',
              availability: 'Draft status only',
              variant: 'Outline',
            },
            {
              action: 'Mark Signed',
              desc: 'Mark order as signed by physician',
              availability: 'Pending Signature status only',
              variant: 'Default (Primary)',
            },
            {
              action: 'Return for Correction',
              desc: 'Return order to creator with correction notes',
              availability: 'Draft, Pending Review, Pending Signature',
              variant: 'Outline',
            },
            {
              action: 'View History',
              desc: 'View complete audit trail and change history',
              availability: 'All orders',
              variant: 'Ghost',
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

      {/* Priority & Attention System */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Priority & Needs Attention System
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Visual Priority Indicators:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Amber border (2px) for orders needing attention</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Amber background tint for visual emphasis</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vertical amber bar on left edge</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>"Needs Attention" badge with alert icon</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Automatic Sorting:</h4>
            <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
              <li>Orders needing attention appear first</li>
              <li>Then sorted by status priority (high to low)</li>
              <li>Finally sorted by order date (newest first)</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Needs Attention Filter:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Toggle button with alert icon and count badge</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Shows only orders requiring immediate action</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Highlighted when active</span>
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
            { label: 'Total Orders', desc: 'Count of all orders', alert: false },
            { label: 'Needs Attention', desc: 'Orders requiring action', alert: true },
            { label: 'Pending Signature', desc: 'Awaiting physician signature', alert: true },
            { label: 'Pending Review', desc: 'Awaiting clinical review', alert: true },
            { label: 'Returned', desc: 'Returned for correction', alert: true },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3 rounded-lg text-center',
                stat.alert ? 'bg-amber-50' : 'bg-gray-50'
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

      {/* Use Cases */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Clinical Use Cases</h3>
        <div className="space-y-3">
          {[
            {
              role: 'Nurses',
              desc: 'Quickly identify orders needing signature or review',
              workflows: [
                'Send orders for signature',
                'Track signature status',
                'Review returned orders',
              ],
            },
            {
              role: 'Physicians',
              desc: 'Review and sign pending orders efficiently',
              workflows: [
                'Filter pending signatures',
                'Mark orders as signed',
                'Return for corrections',
              ],
            },
            {
              role: 'Clinical Supervisors',
              desc: 'Monitor order workflow and ensure timely completion',
              workflows: [
                'View all pending reviews',
                'Identify bottlenecks',
                'Track correction cycles',
              ],
            },
            {
              role: 'Quality Reviewers',
              desc: 'Review orders for compliance and completeness',
              workflows: [
                'Review order content',
                'Return for corrections',
                'View change history',
              ],
            },
            {
              role: 'Case Managers',
              desc: 'Ensure all required orders are in place',
              workflows: [
                'Check order status',
                'Follow up on pending',
                'Export order list',
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

      {/* Key Features Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '8 information fields per order',
            '6 contextual quick actions',
            '6 status types with color coding',
            'Dual signature status tracking',
            'Priority sorting algorithm',
            'Needs attention visual indicators',
            'Statistics dashboard with alerts',
            'Return reason display',
            'Search by multiple fields',
            'Status filtering',
            'Needs attention toggle',
            'Last modified timestamp',
            'Empty state handling',
            'Responsive grid layout',
            'Export capability',
            'New order creation',
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
