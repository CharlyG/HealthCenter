/**
 * Discharge Documentation Workflow Demo Page
 * 
 * Demonstrates the comprehensive discharge documentation journey for properly
 * closing home health admissions with all required clinical and certification documents.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Home,
  Info,
  Check,
  Layout,
  FileText,
  Target,
} from 'lucide-react';
import DischargeDocumentationWorkflow, {
  generateMockDischargeData,
  DischargeDocumentationData,
  DischargeRequirement,
} from '../components/DischargeDocumentationWorkflow';

export default function DischargeDocumentationWorkflowPage() {
  const navigate = useNavigate();
  const [mockData] = useState<DischargeDocumentationData[]>(generateMockDischargeData());
  const [selectedExample, setSelectedExample] = useState(0);

  const handleCompleteRequirement = (requirementKey: DischargeRequirement) => {
    console.log('Complete requirement:', requirementKey);
  };

  const handleViewRequirement = (requirementKey: DischargeRequirement) => {
    console.log('View requirement:', requirementKey);
  };

  const handleSubmitDischarge = () => {
    console.log('Submit discharge');
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
                  Discharge Documentation Workflow
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Guided journey for completing discharge documentation
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
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedExample(0)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 0
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">43% Complete</p>
                  <p className="text-xs text-gray-600">Goals Met - In Progress</p>
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
                  <p className="text-xs text-gray-600">Transfer to Facility - Ready</p>
                </button>
                <button
                  onClick={() => setSelectedExample(2)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedExample === 2
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">0% Complete</p>
                  <p className="text-xs text-gray-600">Patient Refused - Not Started</p>
                </button>
              </div>
            </Card>

            {/* Active Example */}
            <DischargeDocumentationWorkflow
              data={mockData[selectedExample]}
              onCompleteRequirement={handleCompleteRequirement}
              onViewRequirement={handleViewRequirement}
              onSubmitDischarge={handleSubmitDischarge}
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
          Discharge Documentation Workflow Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Comprehensive workflow for managing discharge documentation when ending a home
          health admission. Guides staff through completing all required clinical and
          certification documents needed to properly close an episode of care. Makes clear
          what documentation is still required before the episode can be closed.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">7 Requirements</p>
            <p className="text-sm text-blue-700 mt-1">Discharge documents</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">Visual Progress</p>
            <p className="text-sm text-green-700 mt-1">Readiness tracking</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Home className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">Guided Journey</p>
            <p className="text-sm text-purple-700 mt-1">Step-by-step workflow</p>
          </div>
        </div>
      </Card>

      {/* 7 Required Documents */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          7 Required Discharge Documents
        </h3>
        <div className="space-y-4">
          {[
            {
              order: 1,
              document: 'Discharge Summary',
              icon: '📄',
              color: 'Blue (#3B82F6)',
              desc: 'Complete clinical summary of care provided during admission',
              includes: 'Patient status, services provided, outcomes achieved, discharge destination',
            },
            {
              order: 2,
              document: 'Final Visit Note',
              icon: '📋',
              color: 'Purple (#8B5CF6)',
              desc: 'Document final visit with discharge planning and outcomes',
              includes: 'Final clinical assessment, patient/family education, discharge instructions',
            },
            {
              order: 3,
              document: 'Discharge Assessment',
              icon: '📊',
              color: 'Green (#10B981)',
              desc: 'Complete discharge OASIS (OASIS-D for Medicare) or clinical assessment',
              includes: 'OASIS-D discharge items, functional status, symptom management',
            },
            {
              order: 4,
              document: 'Final Orders Review',
              icon: '🩺',
              color: 'Amber (#F59E0B)',
              desc: 'Review and finalize all physician orders',
              includes: 'Discontinue home health orders, post-discharge medication orders',
            },
            {
              order: 5,
              document: 'Care Plan Closure',
              icon: '✅',
              color: 'Pink (#EC4899)',
              desc: 'Close all active care plan goals and interventions',
              includes: 'Mark goals as met/not met, document goal outcomes, close interventions',
            },
            {
              order: 6,
              document: 'Physician Discharge Order',
              icon: '👨‍⚕️',
              color: 'Cyan (#06B6D4)',
              desc: 'Obtain physician order to discharge from home health service',
              includes: 'Discharge order with reason, physician signature, discharge date',
            },
            {
              order: 7,
              document: 'Patient Education Verification',
              icon: '🎓',
              color: 'Orange (#F97316)',
              desc: 'Verify discharge education and follow-up instructions provided',
              includes: 'Discharge instructions given, follow-up appointments, emergency contacts',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 flex-shrink-0">
                  {item.order}
                </div>
                <span className="text-3xl">{item.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{item.document}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.color}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
                <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  <span className="font-medium">Includes:</span> {item.includes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Discharge Reasons */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">7 Discharge Reason Types</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              reason: 'Goals Met / Improved',
              desc: 'Patient achieved therapy goals and improved functional status',
              typical: 'Most common discharge reason - positive outcome',
            },
            {
              reason: 'Transfer to Facility',
              desc: 'Patient transferred to SNF, hospital, or other facility',
              typical: 'Requires coordination with receiving facility',
            },
            {
              reason: 'Transfer to Another Agency',
              desc: 'Patient transferred to another home health agency',
              typical: 'Requires care coordination and records transfer',
            },
            {
              reason: 'Patient Deceased',
              desc: 'Patient passed away during home health episode',
              typical: 'Modified documentation requirements',
            },
            {
              reason: 'Physician Decision',
              desc: 'Physician determined services no longer medically necessary',
              typical: 'Requires physician discharge order',
            },
            {
              reason: 'Patient Refused Services',
              desc: 'Patient voluntarily chose to discontinue services',
              typical: 'Document patient refusal and education provided',
            },
            {
              reason: 'Financial / Insurance',
              desc: 'Insurance coverage ended or financial barriers',
              typical: 'Document reason and patient notification',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.reason}</h4>
              <p className="text-xs text-gray-700 mb-1">{item.desc}</p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Typical:</span> {item.typical}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Discharge Readiness Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Discharge Readiness Summary Features
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">4 Visual Indicators:</h4>
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
                  visual: 'Large bold number on right side of progress bar',
                },
                {
                  indicator: 'Completion Count',
                  desc: 'Fraction showing completed vs total documents',
                  visual: '"X of 7 Documents Complete" text',
                },
                {
                  indicator: 'Step Dots',
                  desc: 'Visual dots representing each of 7 documents',
                  visual: 'Green dots for complete, gray for incomplete',
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

      {/* Patient & Admission Info Bar */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Patient & Admission Information Bar
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">5 Key Information Fields:</h4>
            <div className="space-y-2">
              {[
                {
                  field: 'Patient',
                  display: 'Patient name + Patient ID',
                  example: 'Margaret Johnson\nPAT-001',
                },
                {
                  field: 'Admission ID',
                  display: 'Admission identifier',
                  example: 'ADM-12345',
                },
                {
                  field: 'Admission Start',
                  display: 'Date admission began',
                  example: '9/15/2024',
                },
                {
                  field: 'Planned Discharge',
                  display: 'Date + days until/since discharge',
                  example: '12/15/2024 (in 5 days)',
                },
                {
                  field: 'Discharge Reason',
                  display: 'Reason for discharge',
                  example: 'Goals Met / Improved',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.field}</p>
                    <p className="text-xs text-gray-600">{item.display}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-700 whitespace-pre-line">{item.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Requirement Card Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Requirement Card Visual Treatment
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">3 Status States:</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-semibold text-green-900 mb-2">✓ Complete</h5>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Green background</li>
                  <li>• Green border</li>
                  <li>• Green checkmark icon</li>
                  <li>• "Complete" badge</li>
                  <li>• Shows completion date & user</li>
                  <li>• "View" button only</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">⏳ In Progress</h5>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Blue background</li>
                  <li>• Blue border</li>
                  <li>• Colored document icon</li>
                  <li>• "In Progress" badge</li>
                  <li>• Shows notes if present</li>
                  <li>• "Complete" + "Preview" buttons</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">○ Not Started</h5>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Gray background</li>
                  <li>• Gray border</li>
                  <li>• Colored document icon</li>
                  <li>• "Not Started" badge (red)</li>
                  <li>• No additional info</li>
                  <li>• "Complete" + "Preview" buttons</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Card Components:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Order Number Badge:</strong> Shows sequential order (1-7)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Icon:</strong> Document-specific icon with color coding
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Title:</strong> Document name (e.g., "Discharge Summary")
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Description:</strong> What the document entails
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Status Badge:</strong> Complete/In Progress/Not Started
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Completion Info:</strong> Date and user when complete
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Notes Section:</strong> Additional context if provided
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Action Buttons:</strong> "Complete Document" and "View/Preview"
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Missing Items Alert */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Missing Items Alert Features
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-3">⚠️ Alert Box (When Incomplete)</h4>
            <ul className="space-y-2 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Shows when not all 7 documents are complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Displays count: "X Document(s) Remaining"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Lists all incomplete documents by name with bullet points</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Warning message: "Complete all required documentation before discharging"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Amber color scheme (background, border, text)</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">✓ Success Box (When Complete)</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Shows when all 7 documents are 100% complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Large green checkmark icon</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Heading: "Discharge Documentation Complete"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Message: "Patient is ready to be discharged from the episode"</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Prominent "Submit Discharge" button to finalize</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Green color scheme (background, border, text, button)</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Workflow Benefits */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Workflow Benefits
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">✓ Makes Clear What's Required</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>All 7 required documents listed in sequential order</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Clear description of each document's purpose</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Visual order numbers (1-7) for logical progression</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>No ambiguity about what must be done before discharge</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-3">✓ Prevents Incomplete Discharges</h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>"Submit Discharge" button only appears when 100% complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Missing items alert prevents overlooking requirements</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Visual progress tracking shows exactly what's left</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Reduces compliance issues and documentation errors</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">✓ Streamlines Workflow</h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>One-click access to complete each document from workflow</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Sequential order guides logical completion flow</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Status tracking shows real-time progress</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Reduces time searching for what needs to be done</span>
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
            '7 required discharge documents tracked',
            'Sequential order numbering (1-7)',
            'Color-coded document icons',
            'Patient & admission info bar (5 fields)',
            'Discharge reason display',
            'Days until/since discharge calculation',
            'Discharge readiness summary with progress bar',
            'Percentage display (0-100%)',
            'Completion count (X of 7 Complete)',
            'Visual step dots (green/gray)',
            '3 status states (Complete/In Progress/Not Started)',
            'Color-coded requirement cards',
            'Completion date & user display',
            'Notes section for additional context',
            'Quick action buttons per requirement',
            'Missing items alert box (amber)',
            'Lists incomplete documents',
            'All complete success box (green)',
            '"Submit Discharge" button when ready',
            'Click to complete each requirement',
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
