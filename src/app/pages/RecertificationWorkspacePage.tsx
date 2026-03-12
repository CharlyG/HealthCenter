/**
 * Recertification Workspace Demo Page
 * 
 * Demonstrates the comprehensive recertification workflow for managing
 * home health recertification preparation proactively.
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  FileCheck,
  Info,
  Check,
  Layout,
  Clock,
  Target,
} from 'lucide-react';
import RecertificationWorkspace from '../components/RecertificationWorkspace';

export default function RecertificationWorkspacePage() {
  const navigate = useNavigate();

  const handleViewAssessment = (itemId: string) => {
    console.log('Viewing assessment for:', itemId);
  };

  const handleEditPlanOfCare = (itemId: string) => {
    console.log('Editing plan of care for:', itemId);
  };

  const handleReviewOrders = (itemId: string) => {
    console.log('Reviewing orders for:', itemId);
  };

  const handleSendForSignature = (itemId: string) => {
    console.log('Sending for signature:', itemId);
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
                  Recertification Workspace
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage home health recertification preparation proactively
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
            <RecertificationWorkspace
              onViewAssessment={handleViewAssessment}
              onEditPlanOfCare={handleEditPlanOfCare}
              onReviewOrders={handleReviewOrders}
              onSendForSignature={handleSendForSignature}
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
          Recertification Workspace Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Comprehensive workspace for managing home health recertification preparation.
          Makes recertification clear and proactive rather than reactive through readiness
          tracking, deadline monitoring, guided workflows, and visual checklists showing
          what is complete and what is still missing.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileCheck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">5 Requirements</p>
            <p className="text-sm text-blue-700 mt-1">Per certification</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">Deadline Tracking</p>
            <p className="text-sm text-green-700 mt-1">Days until expiration</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Readiness Panel</p>
            <p className="text-sm text-purple-700 mt-1">Visual checklist</p>
          </div>
        </div>
      </Card>

      {/* Core Displays */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          5 Core Display Components
        </h3>
        <div className="space-y-4">
          {[
            {
              component: 'Certification Period Ending Soon',
              desc: 'Shows cert period number, start/end dates, and days until expiration',
              visual: 'Period # badge + date range + countdown timer',
              example: 'Period 1: 10/15/2024 - 12/13/2024 (3 days remaining)',
            },
            {
              component: 'Recertification Assessment Status',
              desc: 'Tracks completion of updated OASIS or clinical assessment',
              visual: 'Status badge (Complete/In Progress/Not Started/Overdue)',
              example: 'Complete ✓ - Completed on 12/01/2024 by Emily Chen',
            },
            {
              component: 'Updated Plan of Care Status',
              desc: 'Tracks updates to POC / 485 with current goals and interventions',
              visual: 'Status badge + completion date + assigned user',
              example: 'In Progress - Assigned to Michael Torres',
            },
            {
              component: 'Orders Requiring Update',
              desc: 'Shows status of physician orders review and updates needed',
              visual: 'Two separate items: Orders Review + Physician Orders Updated',
              example: 'Orders Review: Complete ✓ | Physician Orders: Not Started',
            },
            {
              component: 'Signature Readiness',
              desc: 'Indicates if all documents are ready for physician signature',
              visual: 'Status badge + action button when ready',
              example: 'Not Started - "Send for Signature" button disabled until prerequisites complete',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{item.component}</h4>
              <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Visual:</span> {item.visual}
              </p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <span className="font-medium">Example:</span> {item.example}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 5 Recertification Requirements */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          5 Recertification Requirements Tracked
        </h3>
        <div className="space-y-4">
          {[
            {
              requirement: '1. Recertification Assessment',
              icon: '📋',
              desc: 'Complete updated OASIS or clinical assessment',
              actions: 'Complete Assessment button → Opens assessment editor',
              status: 'Complete, In Progress, Not Started, Overdue',
            },
            {
              requirement: '2. Updated Plan of Care',
              icon: '📄',
              desc: 'Update POC / 485 with current goals, interventions, and visit frequencies',
              actions: 'Update Plan of Care button → Opens POC editor',
              status: 'Complete, In Progress, Not Started, Overdue',
            },
            {
              requirement: '3. Orders Review',
              icon: '✅',
              desc: 'Review all current physician orders for accuracy and relevance',
              actions: 'Review Orders button → Opens orders list',
              status: 'Complete, In Progress, Not Started, Overdue',
            },
            {
              requirement: '4. Physician Orders Updated',
              icon: '🩺',
              desc: 'Obtain updated orders from physician as needed',
              actions: 'Request Updated Orders button → Initiates physician communication',
              status: 'Complete, In Progress, Not Started, Overdue',
            },
            {
              requirement: '5. Physician Signature',
              icon: '✍️',
              desc: 'Obtain physician signature on recertification documents',
              actions: 'Send for Signature button → Sends to physician workflow',
              status: 'Complete, In Progress, Not Started, Overdue',
            },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{item.requirement}</h4>
                <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
                <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded mb-1">
                  <span className="font-medium">Actions:</span> {item.actions}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Status Options:</span> {item.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Readiness Panel */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Recertification Readiness Panel
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Panel Features:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Expandable per admission (click "Show Details" button)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Visual checklist showing all 5 requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Color-coded requirement cards (green=complete, red=overdue, gray=not started)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Status badge per requirement with icon</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Completion date displayed when complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Assigned user displayed when in progress</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Quick action button per incomplete requirement</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Overall progress bar showing X of 5 complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Summary message: "X requirement(s) remaining" or "All complete!"</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">What Is Complete vs Missing:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2">✓ Complete</h5>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Green background on card</li>
                  <li>• Green checkmark icon</li>
                  <li>• "Complete" status badge</li>
                  <li>• Shows completion date</li>
                  <li>• No action button</li>
                  <li>• Counts toward overall progress</li>
                </ul>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h5 className="font-semibold text-red-900 mb-2">✗ Missing/Incomplete</h5>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• White or red background</li>
                  <li>• Clock/alert icon</li>
                  <li>• "Not Started" or "Overdue" badge</li>
                  <li>• Shows assigned user if applicable</li>
                  <li>• Action button displayed prominently</li>
                  <li>• Does not count toward progress</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Proactive Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Proactive vs Reactive Features
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-3">❌ Reactive Approach (Traditional)</h4>
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>No visibility into upcoming cert periods</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Staff scrambles at last minute when period is about to expire</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>No clear checklist of what needs to be done</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Frequent overdue recertifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Payment delays due to late submissions</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">✓ Proactive Approach (This System)</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Dashboard shows all cert periods ending within 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Days until expiration countdown for each admission</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Clear visual checklist of 5 requirements per recert</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Real-time readiness percentage (0-100%)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Critical alerts for certs ≤7 days (red highlighting)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Quick action buttons to complete each requirement</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Assignment tracking shows who's responsible</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Early preparation prevents last-minute rush</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Urgency Indicators */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Urgency Indicators</h3>
        <div className="space-y-3">
          {[
            {
              urgency: 'Critical (≤7 days)',
              color: 'Red',
              visual: 'Red background tint + red left border (4px) + Critical badge',
              action: 'Immediate attention required - all requirements must be completed ASAP',
            },
            {
              urgency: 'Due Soon (8-14 days)',
              color: 'Amber',
              visual: 'Amber text on days until expiration + standard row',
              action: 'Should begin preparing requirements if not already started',
            },
            {
              urgency: 'Upcoming (15-30 days)',
              color: 'Blue',
              visual: 'Standard row display + In Progress badge',
              action: 'Monitor progress, start early preparations',
            },
            {
              urgency: 'Overdue (negative days)',
              color: 'Red',
              visual: 'Red background + "X days overdue" text + Overdue badge',
              action: 'URGENT - Cert period expired, immediate completion required',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.urgency}</h4>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                  {item.color}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Visual:</span> {item.visual}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Action:</span> {item.action}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Statistics Dashboard */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">5 Statistics Metrics</h3>
        <div className="space-y-3">
          {[
            { metric: 'Total Active', desc: 'Total active recertifications being tracked' },
            { metric: 'Due Soon (≤14d)', desc: 'Certs expiring within 14 days (amber alert)', alert: true },
            { metric: 'Overdue', desc: 'Certs with expired periods (amber alert)', alert: true },
            { metric: 'Critical (≤7d)', desc: 'Certs expiring within 7 days (amber alert)', alert: true },
            { metric: 'Avg Readiness', desc: 'Average readiness percentage across all certs' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={cn(
                'p-3 rounded-lg border',
                item.alert ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
              )}
            >
              <h4 className="font-semibold text-gray-900 mb-1">{item.metric}</h4>
              <p className="text-sm text-gray-700">{item.desc}</p>
              {item.alert && (
                <p className="text-xs text-amber-700 mt-1">⚠️ Shows alert if count &gt; 0</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Filtering & Sorting */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Filtering & Sorting</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">2 Filter Dimensions:</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  filter: 'Search Bar',
                  options: 'Search by patient name, patient ID, or admission ID',
                },
                {
                  filter: 'Urgency Filter',
                  options: 'All, Critical (≤7 days), Upcoming (8-30 days)',
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
            <h4 className="font-medium text-gray-900 mb-3">Automatic Sorting:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Sorted by days until expiration (ascending - most urgent first)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Overdue items appear at top (negative days)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Critical items (≤7 days) next</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Then due soon, then upcoming</span>
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
            '5 tracked requirements per recertification',
            'Certification period display (number, dates)',
            'Days until expiration countdown',
            'Readiness percentage (0-100%)',
            'Expandable readiness panel per admission',
            'Visual checklist of all requirements',
            'Color-coded requirement cards',
            'Status badges (Complete/In Progress/Not Started/Overdue)',
            'Completion dates displayed',
            'Assigned user tracking',
            'Quick action buttons per requirement',
            'Overall progress bar',
            'Summary completion message',
            'Critical urgency indicators (red rows)',
            'Overdue detection and alerts',
            '5 statistics metrics dashboard',
            'Search by patient/admission',
            'Urgency filter (Critical/Upcoming)',
            'Automatic urgency-based sorting',
            'Assignment coordinator display',
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
