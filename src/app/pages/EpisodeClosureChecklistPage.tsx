/**
 * Episode Closure Checklist Demo Page
 * 
 * Demonstrates the comprehensive checklist for closing patient admissions cleanly
 * and avoiding missing final documentation.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  CheckSquare,
  Info,
  Check,
  Layout,
} from 'lucide-react';
import EpisodeClosureChecklist, {
  generateMockEpisodeClosureData,
  EpisodeClosureData,
} from '../components/EpisodeClosureChecklist';

export default function EpisodeClosureChecklistPage() {
  const navigate = useNavigate();
  const [mockData] = useState<EpisodeClosureData[]>(generateMockEpisodeClosureData());
  const [selectedExample, setSelectedExample] = useState(0);

  const handleCompleteItem = (itemId: string) => {
    console.log('Complete item:', itemId);
  };

  const handleViewItem = (itemId: string) => {
    console.log('View item:', itemId);
  };

  const handleCloseEpisode = () => {
    console.log('Close episode');
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
                  Episode Closure Checklist
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive checklist for closing admissions cleanly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="examples">
          <TabsList>
            <TabsTrigger value="examples">
              <Layout className="w-4 h-4 mr-2" />
              Examples
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Examples Tab */}
          <TabsContent value="examples" className="mt-6 space-y-6">
            {/* Example Selector */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Example:</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedExample(0)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 0
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">58% Complete</p>
                  <p className="text-xs text-gray-600">7/12 items • 3 blocked • In Progress</p>
                </button>
                <button
                  onClick={() => setSelectedExample(1)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 1
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">100% Complete</p>
                  <p className="text-xs text-gray-600">14/14 items • Ready to close</p>
                </button>
              </div>
            </Card>

            {/* Active Example */}
            <EpisodeClosureChecklist
              data={mockData[selectedExample]}
              onCompleteItem={handleCompleteItem}
              onViewItem={handleViewItem}
              onCloseEpisode={handleCloseEpisode}
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
          Episode Closure Checklist Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Comprehensive checklist displaying all required items before a patient admission
          can be considered complete. Helps agencies close admissions cleanly and avoid
          missing final documentation through organized categories, status tracking (Complete,
          Incomplete, Blocked), blocking dependencies, and comprehensive progress monitoring.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">6 Categories</p>
            <p className="text-sm text-blue-700 mt-1">Organized checklist</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">3 Status States</p>
            <p className="text-sm text-green-700 mt-1">Complete/Incomplete/Blocked</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Info className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Blocking Dependencies</p>
            <p className="text-sm text-purple-700 mt-1">Smart prerequisites</p>
          </div>
        </div>
      </Card>

      {/* 6 Checklist Categories */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          6 Checklist Categories
        </h3>
        <div className="space-y-4">
          {[
            {
              category: 'Clinical Documentation',
              icon: '📄',
              color: 'Blue (#3B82F6)',
              desc: 'All clinical notes and documentation',
              items: ['Final Documentation Completed', 'Discharge Summary Completed', 'Final Visit Note'],
            },
            {
              category: 'Orders & Certification',
              icon: '🩺',
              color: 'Purple (#8B5CF6)',
              desc: 'Physician orders and certification documents',
              items: ['All Orders Signed', 'Discharge Order Obtained', 'Certification Documents Complete'],
            },
            {
              category: 'Assessments',
              icon: '📋',
              color: 'Green (#10B981)',
              desc: 'Required clinical assessments',
              items: ['Discharge Assessment Completed', 'Assessment Transmitted to CMS'],
            },
            {
              category: 'Care Plan & Goals',
              icon: '🎯',
              color: 'Amber (#F59E0B)',
              desc: 'Care plan closure and goal documentation',
              items: ['Care Plan Closure', 'Goal Outcomes Documented', 'Patient Education Verified'],
            },
            {
              category: 'Billing & Financial',
              icon: '💰',
              color: 'Pink (#EC4899)',
              desc: 'Billing handoff and financial closure',
              items: ['Billing Handoff Completed', 'Final Visit Codes Verified', 'Claims Submission Ready'],
            },
            {
              category: 'Administrative',
              icon: '✅',
              color: 'Cyan (#06B6D4)',
              desc: 'Administrative tasks and closeout',
              items: ['Medical Records Complete', 'Quality Review Completed', 'Patient Satisfaction Survey Sent'],
            },
          ].map((cat, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <span className="text-3xl">{cat.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{cat.category}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {cat.color}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{cat.desc}</p>
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <span className="font-medium">Example Items:</span>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {cat.items.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 Status States */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">3 Status States Per Item</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Complete
            </h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Green background & border</li>
              <li>• Green checkmark icon</li>
              <li>• "Complete" badge</li>
              <li>• Shows completion date</li>
              <li>• Shows completed by user</li>
              <li>• "View" button only</li>
            </ul>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-amber-600" />
              Incomplete
            </h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• Gray background</li>
              <li>• Gray border</li>
              <li>• Empty circle icon</li>
              <li>• "Incomplete" badge (amber)</li>
              <li>• No additional info</li>
              <li>• "Complete" + "View" buttons</li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="2"/>
                <path d="M12 16v-1" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="8" r="3" strokeWidth="2"/>
              </svg>
              Blocked
            </h4>
            <ul className="space-y-2 text-sm text-red-700">
              <li>• Red background & border</li>
              <li>• Lock icon</li>
              <li>• "Blocked" badge (red)</li>
              <li>• Shows blocker message</li>
              <li>• Lists blocking items</li>
              <li>• No action buttons</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Blocking Dependencies */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Blocking Dependencies System</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">How Blocking Works:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Prerequisites Required:</strong> Some items cannot be completed until
                  other items are finished first
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Automatic Detection:</strong> System automatically marks items as "Blocked"
                  when dependencies are not met
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Clear Messaging:</strong> Blocker message explains WHY the item is blocked
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Dependency List:</strong> Shows which specific items must be completed first
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Auto-Unblock:</strong> Once dependencies are met, item automatically
                  becomes available to complete
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Common Blocking Scenarios:</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  scenario: 'Discharge Order → All Orders Signed',
                  desc: 'Cannot obtain discharge order until all other orders are signed',
                },
                {
                  scenario: 'Assessment Transmission → Assessment Complete',
                  desc: 'Cannot transmit assessment to CMS until it is completed',
                },
                {
                  scenario: 'Claims Submission → Multiple Items',
                  desc: 'Cannot submit claims until billing handoff, codes verified, and orders signed',
                },
                {
                  scenario: 'Final Documentation → Visit Notes',
                  desc: 'Cannot finalize documentation until all visit notes are complete',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-900 text-sm mb-1">{item.scenario}</h5>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Summary Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Closure Progress Summary</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Progress Indicators:</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  indicator: 'Progress Bar',
                  desc: 'Horizontal bar showing percentage complete (0-100%)',
                  visual: 'Blue bar that turns green when 100% complete',
                },
                {
                  indicator: 'Percentage Display',
                  desc: 'Numeric percentage shown prominently',
                  visual: 'Large bold number on right side',
                },
                {
                  indicator: 'Completion Count',
                  desc: 'Fraction showing completed vs total items',
                  visual: '"X of Y Items Complete" text',
                },
                {
                  indicator: 'Status Breakdown Cards',
                  desc: 'Three cards showing Complete, Incomplete, Blocked counts',
                  visual: 'Green (Complete), Amber (Incomplete), Red (Blocked) cards',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-900 text-sm mb-1">
                    {item.indicator}
                  </h5>
                  <p className="text-xs text-gray-700 mb-1">{item.desc}</p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Visual:</span> {item.visual}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Alert Systems */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Alert Systems</h3>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-3">🔒 Blocked Items Warning</h4>
            <ul className="space-y-2 text-sm text-red-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Shows when items are blocked by dependencies</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Displays count: "X Item(s) Blocked"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Lists all blocked items with blocker messages</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>Message: "Some items cannot be completed until dependencies are resolved"</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-3">⚠️ Incomplete Items Alert</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Shows when not all required items are complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Only appears when no items are blocked</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Lists all incomplete required items</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Message: "Complete all required items to close the episode"</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">✓ All Complete Success</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Shows when all required items are 100% complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Large green checkmark icon</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Heading: "Episode Closure Complete"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Prominent "Close Episode" button to finalize</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Category Organization */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Category Organization Features</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Category Features:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Expandable/Collapsible:</strong> Click category header to expand/collapse items
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Color-Coded Icons:</strong> Each category has unique color and icon
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Progress Badge:</strong> Shows "X/Y" completion for that category
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Description:</strong> Brief description of what the category contains
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Visual Indicator:</strong> Green badge when category 100% complete
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          How This Helps Agencies Close Admissions Cleanly
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">✓ Prevents Missing Documentation</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Comprehensive checklist shows ALL required items in one place</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Cannot close episode until all items are complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Visual alerts highlight what's still missing</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">✓ Ensures Proper Sequencing</h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Blocking dependencies enforce correct order of operations</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Prevents skipping critical prerequisite steps</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Ensures regulatory requirements are met in proper order</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">✓ Improves Compliance</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>All regulatory requirements tracked (OASIS transmission, orders signed, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Audit trail shows who completed what and when</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Reduces compliance issues and denials</span>
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
            '6 organized categories',
            '3 status states (Complete/Incomplete/Blocked)',
            'Blocking dependencies system',
            'Progress bar (0-100%)',
            'Percentage display',
            'Completion count tracking',
            'Status breakdown cards',
            'Expandable/collapsible categories',
            'Color-coded category icons',
            'Category progress badges',
            'Blocked items warning alert',
            'Incomplete items alert',
            'All complete success message',
            '"Close Episode" button when ready',
            'Completion date tracking',
            'Completed-by user tracking',
            'Blocker messages',
            'Dependency lists',
            'Required vs Optional items',
            'Patient & admission info display',
            'Length of stay calculation',
            'Quick action buttons',
            'Auto-unblock when dependencies met',
            'Comprehensive audit trail',
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
