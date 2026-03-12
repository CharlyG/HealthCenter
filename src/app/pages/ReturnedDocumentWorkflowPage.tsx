/**
 * Returned for Correction Workflow Demo Page
 * 
 * Demonstrates the comprehensive interface for managing clinical orders
 * and certification documents that have been returned for correction.
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  RotateCcw,
  Info,
  Check,
  Layout,
  MessageSquare,
  History,
} from 'lucide-react';
import ReturnedDocumentWorkflow from '../components/ReturnedDocumentWorkflow';

export default function ReturnedDocumentWorkflowPage() {
  const navigate = useNavigate();

  const handleOpenDocument = (docId: string) => {
    console.log('Opening document:', docId);
  };

  const handleEditDocument = (docId: string) => {
    console.log('Editing document:', docId);
  };

  const handleResubmit = (docId: string) => {
    console.log('Resubmitting document:', docId);
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
                  Returned for Correction Workflow
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage documents returned for correction and track resubmissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="workflow">
          <TabsList>
            <TabsTrigger value="workflow">
              <Layout className="w-4 h-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="mt-6">
            <div className="h-[calc(100vh-220px)]">
              <ReturnedDocumentWorkflow
                onOpenDocument={handleOpenDocument}
                onEditDocument={handleEditDocument}
                onResubmit={handleResubmit}
              />
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
          Returned for Correction Workflow Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Comprehensive interface for managing clinical orders and certification documents
          that have been returned for correction. The goal is to reduce confusion when
          documents are rejected or returned by clearly displaying return reasons,
          reviewer comments, correction history, and providing streamlined actions for
          editing and resubmitting documents.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <RotateCcw className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="font-semibold text-red-900">4 Status Types</p>
            <p className="text-sm text-red-700 mt-1">Track correction progress</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">Comment System</p>
            <p className="text-sm text-blue-700 mt-1">3 comment types</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <History className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Complete History</p>
            <p className="text-sm text-purple-700 mt-1">Full audit trail</p>
          </div>
        </div>
      </Card>

      {/* 4 Display Fields */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Core Display Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              field: 'Reason for Return',
              desc: 'Clear explanation of why document was rejected',
              display: 'Prominent red background alert box',
              example: '"Visit frequency does not match disciplines selected"',
            },
            {
              field: 'Returned By',
              desc: 'Person who returned the document',
              display: 'Name and role displayed with user icon',
              example: 'Dr. Sarah Mitchell, Physician',
            },
            {
              field: 'Returned Date',
              desc: 'When document was returned',
              display: 'Date and time with calendar icon',
              example: '12/15/2024 at 2:30 PM',
            },
            {
              field: 'Current Status',
              desc: 'Current state in correction workflow',
              display: 'Color-coded badge with icon',
              example: 'Needs Correction (red), In Correction (amber), etc.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{item.field}</h4>
              <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Display:</span> {item.display}
              </p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <span className="font-medium">Example:</span> {item.example}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 4 Status Types */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">4 Correction Workflow Statuses</h3>
        <div className="space-y-4">
          {[
            {
              status: 'Returned - Needs Correction',
              color: '#DC2626',
              bgColor: '#FEE2E2',
              icon: '🔴',
              desc: 'Document has been returned and awaits correction',
              actions: 'View, Edit, Show History',
              canResubmit: false,
            },
            {
              status: 'In Correction',
              color: '#F59E0B',
              bgColor: '#FEF3C7',
              icon: '✏️',
              desc: 'Someone is actively working on corrections',
              actions: 'View, Edit, Show History',
              canResubmit: false,
            },
            {
              status: 'Ready for Resubmission',
              color: '#3B82F6',
              bgColor: '#DBEAFE',
              icon: '✅',
              desc: 'Corrections completed, ready to resubmit',
              actions: 'View, Edit, Show History, Resubmit',
              canResubmit: true,
            },
            {
              status: 'Resubmitted - Pending Review',
              color: '#8B5CF6',
              bgColor: '#EDE9FE',
              icon: '⏳',
              desc: 'Resubmitted and awaiting physician review',
              actions: 'View, Show History',
              canResubmit: false,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1">
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
                  {item.canResubmit && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      Can Resubmit
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Available Actions:</span> {item.actions}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* User Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">5 User Actions Available</h3>
        <div className="space-y-3">
          {[
            {
              action: 'Open Document',
              desc: 'View read-only version of full document',
              button: 'View Document',
              availability: 'All statuses',
              icon: '👁️',
            },
            {
              action: 'View Comments',
              desc: 'See all reviewer comments and correction notes',
              button: 'Displayed in Comments section',
              availability: 'All statuses',
              icon: '💬',
            },
            {
              action: 'Edit Document',
              desc: 'Open document in edit mode to make corrections',
              button: 'Edit Document',
              availability: 'All statuses except Resubmitted',
              icon: '✏️',
            },
            {
              action: 'Resubmit for Review',
              desc: 'Submit corrected document back for physician review',
              button: 'Resubmit for Review',
              availability: 'Only "Ready for Resubmission" status',
              icon: '📤',
            },
            {
              action: 'Track Correction History',
              desc: 'View complete timeline of all correction activities',
              button: 'Show History',
              availability: 'All statuses',
              icon: '📜',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{item.action}</h4>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                    {item.button}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{item.desc}</p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Available:</span> {item.availability}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Comment System */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">3 Comment Types</h3>
        <div className="space-y-4">
          {[
            {
              type: 'Return Reason',
              color: 'Red (#DC2626)',
              bgColor: 'bg-red-50',
              borderColor: 'border-red-200',
              desc: 'Comments explaining why document was returned',
              author: 'Physician or Medical Director',
              example: '"Speech Therapy is listed as a discipline, but no visit frequency is specified for ST."',
            },
            {
              type: 'Correction Note',
              color: 'Blue (#3B82F6)',
              bgColor: 'bg-blue-50',
              borderColor: 'border-blue-200',
              desc: 'Notes added while making corrections',
              author: 'Clinical staff making corrections',
              example: '"Working on this correction now. Will add order date/time from clinical notes."',
            },
            {
              type: 'Resubmission Note',
              color: 'Green (#10B981)',
              bgColor: 'bg-green-50',
              borderColor: 'border-green-200',
              desc: 'Notes explaining what was corrected before resubmission',
              author: 'Clinical staff resubmitting',
              example: '"Updated all 4 clinical goals to SMART format with measurable outcomes."',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={cn('p-4 border rounded-lg', item.bgColor, item.borderColor)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.type}</h4>
                <span className="text-xs px-2 py-0.5 bg-white border rounded">
                  {item.color}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Typically from:</span> {item.author}
              </p>
              <p className="text-xs text-gray-700 bg-white p-2 rounded border">
                <span className="font-medium">Example:</span> {item.example}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Comment Display Features:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Author name and role displayed</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Timestamp with date and time</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Color-coded by comment type</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Badge indicating comment type</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Chronological order (oldest first)</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Correction History */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          5 Correction History Event Types
        </h3>
        <div className="space-y-3">
          {[
            {
              event: 'Returned',
              color: 'Red (#DC2626)',
              icon: '🔄',
              desc: 'Document was returned for correction',
              details: 'Shows who returned it and when',
            },
            {
              event: 'Correction Started',
              color: 'Amber (#F59E0B)',
              icon: '▶️',
              desc: 'Someone began working on corrections',
              details: 'Shows who started and when',
            },
            {
              event: 'Correction Saved',
              color: 'Blue (#3B82F6)',
              icon: '💾',
              desc: 'Corrections were saved (may be multiple saves)',
              details: 'Shows who saved and what was changed',
            },
            {
              event: 'Resubmitted',
              color: 'Purple (#8B5CF6)',
              icon: '📤',
              desc: 'Document was resubmitted for review',
              details: 'Shows who resubmitted and when',
            },
            {
              event: 'Approved',
              color: 'Green (#10B981)',
              icon: '✅',
              desc: 'Corrected document was approved',
              details: 'Shows who approved and when',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{item.event}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.color}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{item.desc}</p>
                <p className="text-xs text-gray-600">{item.details}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">History Timeline Features:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Vertical timeline visualization</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Color-coded event icons in circular badges</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Connecting line between events</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>User name and role for each action</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Timestamp badge for each event</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Optional details text for context</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Chronological order (oldest to newest)</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Layout & Navigation */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Layout & Navigation</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">3-Panel Layout:</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Left Panel</h5>
                <p className="text-sm text-blue-700 mb-2">Document List (96px width)</p>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>• Search bar</li>
                  <li>• Status filter dropdown</li>
                  <li>• Scrollable document list</li>
                  <li>• Document cards with key info</li>
                </ul>
              </div>
              <div className="col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2">Right Panel</h5>
                <p className="text-sm text-green-700 mb-2">Document Details (Flexible)</p>
                <ul className="space-y-1 text-xs text-green-700">
                  <li>• Document header with status and actions</li>
                  <li>• Return information card</li>
                  <li>• Comments section</li>
                  <li>• Correction history (toggleable)</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Filtering & Search:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Search by document title, patient name, or ID</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Filter by status (Needs Correction, In Correction, Ready, Resubmitted)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Real-time filtering and search</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Empty state when no matches</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Confusion Reduction Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          How This Reduces Confusion
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Problem: Traditional Approach</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Document just disappears from submitted queue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Staff doesn't know WHY it was returned</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Comments buried in email or phone messages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>No clear workflow for making corrections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-0.5">✗</span>
                <span>Can't track who did what when</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">Solution: This Interface</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Dedicated queue for returned documents</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Clear, prominent return reason display</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>All comments centralized and categorized</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Guided workflow: View → Edit → Resubmit</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Complete audit trail of all activities</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Status tracking shows progress</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Assignment tracking shows who's responsible</span>
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
            'Dedicated returned documents queue',
            'Prominent return reason display (red alert box)',
            'Returned by name and role',
            'Returned date with timestamp',
            '4 status types tracking correction progress',
            '3 comment types (Return, Correction, Resubmission)',
            'Color-coded comment display',
            'Complete correction history timeline',
            '5 event types in history',
            'View document action (read-only)',
            'Edit document action (correction mode)',
            'Resubmit action (when ready)',
            'Show/hide history toggle',
            'Search and filter capabilities',
            '3-panel layout (list + details)',
            'Document cards with key info',
            'Days in correction queue tracking',
            'Assignment tracking',
            'Empty states for no results',
            'Visual timeline with icons',
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
