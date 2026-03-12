/**
 * Document Activity Timeline Demo Page
 * 
 * Demonstrates the comprehensive timeline visualization for tracking
 * the full lifecycle of orders and 485 documents.
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Activity,
  Info,
  Check,
  Layout,
  Clock,
  FileText,
} from 'lucide-react';
import DocumentActivityTimeline from '../components/DocumentActivityTimeline';

export default function DocumentActivityTimelinePage() {
  const navigate = useNavigate();

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
                  Document Activity Timeline
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete lifecycle history for orders and certification documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">
              <Layout className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-6">
            <DocumentActivityTimeline />
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
          Document Activity Timeline Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Comprehensive timeline visualization for tracking the full lifecycle of orders
          and 485 documents. Makes document history easy to understand through chronological
          event tracking with visual indicators, expandable details, and comprehensive
          metadata for each activity.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Activity className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">8 Event Types</p>
            <p className="text-sm text-blue-700 mt-1">Complete lifecycle coverage</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">4 Display Fields</p>
            <p className="text-sm text-green-700 mt-1">Per event</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Visual Timeline</p>
            <p className="text-sm text-purple-700 mt-1">Easy to understand</p>
          </div>
        </div>
      </Card>

      {/* 8 Event Types */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">8 Timeline Event Types</h3>
        <div className="space-y-4">
          {[
            {
              type: 'Document Created',
              color: 'Green (#10B981)',
              icon: '📄',
              desc: 'Initial document creation',
              example: 'Initial Plan of Care document created for new admission',
              metadata: 'Version number',
            },
            {
              type: 'Document Edited',
              color: 'Blue (#3B82F6)',
              icon: '✏️',
              desc: 'Any changes made to document content',
              example: 'Added visit frequency for Physical Therapy (3x per week)',
              metadata: 'Fields edited list, version number',
            },
            {
              type: 'Completed',
              color: 'Purple (#8B5CF6)',
              icon: '✅',
              desc: 'Document marked as complete and ready for signature',
              example: 'All required sections completed and ready for physician signature',
              metadata: 'Version number',
            },
            {
              type: 'Sent for Signature',
              color: 'Amber (#F59E0B)',
              icon: '📤',
              desc: 'Document sent to physician/signer',
              example: 'Sent to Dr. Sarah Mitchell for physician signature',
              metadata: 'Signature type (Physician/Medical Director/Clinician)',
            },
            {
              type: 'Signed',
              color: 'Green (#10B981)',
              icon: '✍️',
              desc: 'Signature applied to document',
              example: 'Physician signature applied electronically',
              metadata: 'Signature type, signer name',
            },
            {
              type: 'Returned for Correction',
              color: 'Red (#DC2626)',
              icon: '🔄',
              desc: 'Document rejected and returned for fixes',
              example: 'Speech Therapy frequency missing; ICD-10 code incomplete',
              metadata: 'Return reason (detailed explanation)',
            },
            {
              type: 'Corrected',
              color: 'Blue (#3B82F6)',
              icon: '🔧',
              desc: 'Corrections made to returned document',
              example: 'Added ST frequency (2x/week) and corrected ICD-10 to I50.9',
              metadata: 'List of changes made, version number',
            },
            {
              type: 'Printed or Exported',
              color: 'Gray (#6B7280)',
              icon: '🖨️',
              desc: 'Document exported or printed',
              example: 'Exported as PDF for submission to payer',
              metadata: 'Export format (PDF, Print, etc.)',
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
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.color}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
                  <span className="font-medium">Example:</span> {item.example}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Metadata:</span> {item.metadata}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4 Display Fields Per Event */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">4 Display Fields Per Event</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              field: 'Timestamp',
              desc: 'When the event occurred',
              display: '3 formats: Date, Time, Relative (e.g., "2 days ago")',
              example: '12/15/2024 • 2:30 PM • 2 days ago',
            },
            {
              field: 'User',
              desc: 'Who performed the action',
              display: 'Name and role with user icon',
              example: 'Emily Chen (RN Case Manager)',
            },
            {
              field: 'Action',
              desc: 'Short label for what happened',
              display: 'Color-coded badge matching event type',
              example: 'Created document, Edited document, Signed document',
            },
            {
              field: 'Short Description',
              desc: 'Brief explanation of the event',
              display: 'Plain text summary',
              example: 'Added visit frequency for Physical Therapy (3x per week)',
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

      {/* Visual Timeline Design */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Visual Timeline Design</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Timeline Structure:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vertical timeline with connecting lines</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Color-coded circular icons for each event type</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Icons with colored backgrounds and borders</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Gray connecting line between events</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Chronological order (newest first by default)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Event Card Design:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Event type label (bold) with action badge</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Version number badge when applicable</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Description text below header</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Metadata row with user, date, time, relative time</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Expand button for events with additional details</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Color Coding:</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Created', color: 'Green (#10B981)' },
                { label: 'Edited', color: 'Blue (#3B82F6)' },
                { label: 'Completed', color: 'Purple (#8B5CF6)' },
                { label: 'Sent for Signature', color: 'Amber (#F59E0B)' },
                { label: 'Signed', color: 'Green (#10B981)' },
                { label: 'Returned', color: 'Red (#DC2626)' },
                { label: 'Corrected', color: 'Blue (#3B82F6)' },
                { label: 'Exported', color: 'Gray (#6B7280)' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">{item.label}:</span>
                  <span className="text-gray-600">{item.color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Expandable Details */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Expandable Event Details (5 Types)
        </h3>
        <div className="space-y-4">
          {[
            {
              type: 'Changes Made',
              availableFor: 'Corrected events',
              desc: 'Detailed list of all changes made to document',
              display: 'Bulleted list with green checkmarks',
              example: [
                'Added Speech Therapy frequency: 2x per week for 4 weeks',
                'Updated Primary Diagnosis ICD-10: I50. → I50.9 (Heart Failure, unspecified)',
              ],
            },
            {
              type: 'Return Reason',
              availableFor: 'Returned for Correction events',
              desc: 'Full explanation of why document was rejected',
              display: 'Red alert box with detailed text',
              example: [
                'Speech Therapy is listed as a discipline but no visit frequency is specified. Primary diagnosis ICD-10 code appears incomplete (I50. should have additional digit).',
              ],
            },
            {
              type: 'Fields Edited',
              availableFor: 'Edited events',
              desc: 'List of specific fields that were modified',
              display: 'Blue badge pills for each field',
              example: ['Visit Frequency - PT', 'Clinical Goals', 'Target Dates'],
            },
            {
              type: 'Signature Type',
              availableFor: 'Sent for Signature and Signed events',
              desc: 'Type of signature required or applied',
              display: 'Purple badge with signature icon',
              example: ['Physician Signature', 'Medical Director Signature'],
            },
            {
              type: 'Export Format',
              availableFor: 'Printed/Exported events',
              desc: 'Format document was exported to',
              display: 'Gray badge with download icon',
              example: ['PDF', 'Print', 'Excel'],
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.type}</h4>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  {item.availableFor}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium">Display:</span> {item.display}
              </p>
              <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                <span className="font-medium">Example:</span>
                <ul className="mt-1 space-y-1">
                  {item.example.map((ex, i) => (
                    <li key={i} className="ml-3">• {ex}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Statistics Dashboard */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">5 Statistics Metrics</h3>
        <div className="space-y-3">
          {[
            {
              metric: 'Total Events',
              desc: 'Total number of events in timeline',
              calculation: 'Count of all events',
            },
            {
              metric: 'Created',
              desc: 'Number of document creation events',
              calculation: 'Usually 1 per document',
            },
            {
              metric: 'Edits',
              desc: 'Number of times document was edited',
              calculation: 'Count of edit events',
            },
            {
              metric: 'Signatures',
              desc: 'Number of signatures applied',
              calculation: 'Count of signed events',
            },
            {
              metric: 'Returns',
              desc: 'Number of times returned for correction',
              calculation: 'Count of returned events (shows alert if > 0)',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{item.metric}</h4>
                <p className="text-sm text-gray-700 mb-1">{item.desc}</p>
                <p className="text-xs text-gray-600">{item.calculation}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filtering & Search */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Filtering & Search Features</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Search Capabilities:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Search by action (e.g., "edited", "signed")</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Search by description text</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Search by user name</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Search by event type label</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Real-time filtering as you type</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Event Type Filter:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Dropdown with all 8 event types plus "All"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Filter to specific event type (e.g., only "Edited")</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Combined with search (AND logic)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Empty State:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Centered icon and message when no events match</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>"No events match your filters" message</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Document Context */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Document Context Panel</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Information card displayed above timeline showing:
          </p>
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Document Type', example: 'Plan of Care / 485' },
              { label: 'Patient', example: 'Margaret Johnson' },
              { label: 'Admission', example: 'ADM-12345' },
              { label: 'Document ID', example: 'DOC-485-12345' },
              { label: 'Current Status', example: 'Signed (green badge)' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs font-medium text-gray-600 mb-1">{item.label}</p>
                <p className="text-sm text-gray-900">{item.example}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Makes Lifecycle Easy to Understand */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          How This Makes Document Lifecycle Easy to Understand
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">✓ Clear Visual Flow</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vertical timeline shows progression chronologically</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Color-coded icons instantly communicate event type</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Connecting lines show relationship between events</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">✓ Complete Context</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Every event shows WHO did WHAT, WHEN, and WHY</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Expandable details provide additional context when needed</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Version tracking shows document evolution</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">✓ Quick Insights</h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Statistics show key metrics at a glance (# edits, signatures, returns)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Relative timestamps ("2 days ago") provide time context</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Filter to specific event types for focused analysis</span>
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
            '8 event types covering full document lifecycle',
            '4 display fields per event (timestamp, user, action, description)',
            'Visual vertical timeline with connecting lines',
            'Color-coded circular icons (8 unique colors)',
            'Expandable event details (5 metadata types)',
            'Version number tracking',
            'Chronological order (newest first)',
            'Relative timestamps ("2 days ago")',
            'User name and role display',
            'Search across actions, descriptions, users',
            'Filter by event type dropdown',
            'Combined search and filter (AND logic)',
            'Statistics dashboard (5 metrics)',
            'Document context panel',
            'Empty state for no results',
            'Export timeline capability',
            'Changes made list (for corrections)',
            'Return reason display (red alert)',
            'Fields edited badges',
            'Signature type indicators',
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
