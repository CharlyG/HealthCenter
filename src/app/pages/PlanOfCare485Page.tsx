/**
 * Plan of Care / 485 Editor Demo Page
 * 
 * Demonstrates the structured section-based CMS 485 editor with
 * progress tracking, validation, and contextual panels.
 */

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
  Activity,
  Target,
} from 'lucide-react';
import PlanOfCare485Editor from '../components/PlanOfCare485Editor';

export default function PlanOfCare485Page() {
  const navigate = useNavigate();

  const handleSave = (data: any) => {
    console.log('Saving Plan of Care:', data);
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
                  Plan of Care / 485 Editor
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Structured section-based editor for CMS 485 creation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">
              <Layout className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="mt-6">
            <PlanOfCare485Editor
              admissionId="ADM-12345"
              patientName="Margaret Johnson"
              onSave={handleSave}
              onCancel={() => console.log('Cancelled')}
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
          Plan of Care / 485 Editor Overview
        </h3>
        <p className="text-gray-700 mb-4">
          Structured section-based editor for creating CMS 485 Plan of Care documents.
          Makes the 485 easier to complete than traditional long static forms through
          guided section navigation, real-time validation, progress tracking, and
          contextual panels providing relevant patient information.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold text-blue-900">10 Sections</p>
            <p className="text-sm text-blue-700 mt-1">Organized workflow</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="font-semibold text-green-900">Progress Tracking</p>
            <p className="text-sm text-green-700 mt-1">Visual completion</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-semibold text-purple-900">5 Context Panels</p>
            <p className="text-sm text-purple-700 mt-1">Helpful information</p>
          </div>
        </div>
      </Card>

      {/* 10 Sections */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">10 Document Sections</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              section: 'Certification Period',
              desc: 'Start date, end date, certification number',
              required: true,
              fields: 'Start date, End date, Cert # (1, 2, 3...)',
            },
            {
              section: 'Patient Diagnoses',
              desc: 'Primary and secondary diagnoses with ICD-10',
              required: true,
              fields: 'Primary diagnosis, Secondary diagnoses list',
            },
            {
              section: 'Disciplines Involved',
              desc: 'Healthcare disciplines providing care',
              required: true,
              fields: 'SN, PT, OT, ST, MSW, HHA checkboxes',
            },
            {
              section: 'Visit Frequency',
              desc: 'Visit schedule for each discipline',
              required: true,
              fields: 'Frequency (3x/week), Duration (4 weeks)',
            },
            {
              section: 'Functional Limitations',
              desc: 'Patient functional status and limitations',
              required: true,
              fields: 'Ambulation, Transferring, ADLs, etc.',
            },
            {
              section: 'Clinical Goals',
              desc: 'Measurable patient-centered goals',
              required: true,
              fields: 'Goal description, Target date',
            },
            {
              section: 'Interventions',
              desc: 'Specific interventions by discipline',
              required: true,
              fields: 'Discipline, Intervention description',
            },
            {
              section: 'Orders',
              desc: 'Physician orders and treatments',
              required: true,
              fields: 'List of physician orders',
            },
            {
              section: 'Safety Measures',
              desc: 'Safety precautions and fall risk',
              required: false,
              fields: 'Fall risk, Non-slip footwear, etc.',
            },
            {
              section: 'Narrative Summary',
              desc: 'Clinical overview and summary',
              required: true,
              fields: 'Free text summary (min 50 chars)',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.section}</h4>
                {item.required ? (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                    Required
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    Optional
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-2">{item.desc}</p>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                Fields: {item.fields}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Section Navigation */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Section-Based Navigation</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Left Sidebar Navigation:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Click any section to navigate directly</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Active section highlighted in blue</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Green checkmark for completed sections</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Amber alert icon for incomplete required sections</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Section icons for visual identification</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Advantages Over Static Forms:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Focus on one section at a time (reduces overwhelm)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Jump to any section instantly (no scrolling long form)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Clear visual feedback on completion status</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Section-specific guidance and descriptions</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Progress Tracking */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Progress Tracking System</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Overall Progress Bar:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Located in header, always visible</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Percentage calculated: (completed sections / total sections) × 100</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Visual progress bar with blue fill</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Updates in real-time as sections are completed</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Section Completion Criteria:</h4>
            <div className="space-y-2 text-sm">
              {[
                {
                  section: 'Certification Period',
                  criteria: 'Start date AND end date filled',
                },
                { section: 'Patient Diagnoses', criteria: 'Primary diagnosis filled' },
                { section: 'Disciplines', criteria: 'At least 1 discipline selected' },
                { section: 'Visit Frequency', criteria: 'Frequency set for at least 1 discipline' },
                { section: 'Functional Limitations', criteria: 'At least 1 limitation selected' },
                { section: 'Clinical Goals', criteria: 'At least 1 goal added' },
                { section: 'Interventions', criteria: 'At least 1 intervention added' },
                { section: 'Orders', criteria: 'At least 1 order entered' },
                { section: 'Safety Measures', criteria: 'Optional - always complete' },
                { section: 'Narrative Summary', criteria: 'At least 50 characters entered' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900 min-w-[180px]">
                    {item.section}:
                  </span>
                  <span className="text-gray-700">{item.criteria}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Validation System */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Validation Warning System</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Real-Time Validation:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Checks all required sections continuously</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Warning banner appears at top of editor when issues exist</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Lists all incomplete required sections</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Submit button disabled until all required sections complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Amber background with alert icon for visibility</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Validation Messages:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>"Certification Period is required but incomplete"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>"Patient Diagnoses is required but incomplete"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>"Clinical Goals is required but incomplete"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>All validation clears when document is complete</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Contextual Panel */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          5 Contextual Panel Components
        </h3>
        <div className="space-y-4">
          {[
            {
              component: 'Admission Summary',
              desc: 'Patient name, admission date, admission ID',
              purpose: 'Quick reference to admission context',
            },
            {
              component: 'Care Team',
              desc: 'Physician, case manager, therapists',
              purpose: 'Know who is involved in patient care',
            },
            {
              component: 'Recent Orders',
              desc: 'Latest physician orders for patient',
              purpose: 'Reference when completing Orders section',
            },
            {
              component: 'Frequency Summary',
              desc: 'Current visit frequency by discipline',
              purpose: 'Quick reference for Visit Frequency section',
            },
            {
              component: 'Medication Summary',
              desc: 'Active medications with dosing',
              purpose: 'Reference for Orders and Interventions sections',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{item.component}</h4>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Content:</span> {item.desc}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Purpose:</span> {item.purpose}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Panel Features:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Always visible on right side of screen</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Scrollable independently from main content</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Provides context without leaving editor</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Reduces need to switch between screens</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Available Actions</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              action: 'Cancel',
              desc: 'Discard changes and exit editor',
              variant: 'Ghost',
            },
            {
              action: 'Save Draft',
              desc: 'Save progress without submitting',
              variant: 'Outline',
            },
            {
              action: 'Submit for Review',
              desc: 'Complete and submit for physician signature',
              variant: 'Primary',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.action}</h4>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  {item.variant}
                </span>
              </div>
              <p className="text-sm text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Key Features Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            '10 organized sections with icons',
            'Section-based navigation (left sidebar)',
            'Overall progress bar with percentage',
            'Real-time section completion tracking',
            'Validation warning banner',
            'Required vs optional section indicators',
            'Green checkmarks for completed sections',
            'Amber alerts for incomplete sections',
            '5 contextual panel components',
            'Always-visible admission context',
            'Care team quick reference',
            'Recent orders display',
            'Visit frequency summary',
            'Medication summary',
            'Save draft capability',
            'Submit for review action',
            'Disabled submit until complete',
            'Section-specific guidance',
            'Checkbox selections for common items',
            'Dynamic form fields based on disciplines',
            'Add/remove goals and interventions',
            'Character counters for text fields',
            'Date pickers for dates',
            'Textarea for narrative sections',
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
