/**
 * Context Display Demo Page
 * 
 * Demonstrates the three-level context display system:
 * - Patient Context Header
 * - Admission Context Bar
 * - Operational Context Bar
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ContextDisplay,
  PatientContextHeader,
  AdmissionContextBar,
  OperationalContextBar,
  type PatientContextData,
  type AdmissionContextData,
  type OperationalContextData,
} from '../components/context/ContextDisplay';
import {
  Info,
  Layers,
  User,
  Briefcase,
  Activity,
  RefreshCw,
  Eye,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function ContextDisplayDemoPage() {
  const [currentScenario, setCurrentScenario] = useState<number>(1);
  const [compactMode, setCompactMode] = useState(false);

  // Mock patient data
  const mockPatient: PatientContextData = {
    mrn: '001234',
    name: 'Johnson, Mary Elizabeth',
    dob: '1945-01-15',
    gender: 'F',
    age: 81,
    office: 'Downtown Home Health',
    primaryPhone: '(555) 123-4567',
    email: 'mary.johnson@email.com',
    address: '123 Main St, Springfield, IL 62701',
    activeAdmissions: 2,
    lastVisit: '2024-03-05',
    isFavorite: true,
    alerts: [
      {
        id: '1',
        type: 'critical',
        message: 'Fall risk - Recent fall 3/1/2024. Recommend PT evaluation.',
      },
      {
        id: '2',
        type: 'warning',
        message: 'Medication reconciliation needed - New prescriptions added.',
      },
      {
        id: '3',
        type: 'info',
        message: 'Annual wellness visit due this month.',
      },
    ],
  };

  const mockAdmission: AdmissionContextData = {
    admissionId: 'ADM-2024-001',
    startDate: '2024-02-01',
    status: 'active',
    primaryPayer: 'Medicare',
    disciplines: ['RN', 'PT', 'OT', 'MSW'],
    caseManager: {
      name: 'Sarah Williams, RN',
      phone: '(555) 234-5678',
      email: 'swilliams@agency.com',
    },
    authorizationStatus: 'approved',
    authorizedVisits: {
      used: 18,
      total: 40,
    },
    authorizationEndDate: '2024-04-15',
    referralSource: 'Springfield Hospital',
    primaryDiagnosis: 'CHF, Diabetes Type 2',
    episodeNumber: 1,
    daysInEpisode: 35,
  };

  // Different operational contexts
  const scenarios = [
    {
      id: 1,
      name: 'Visit Documentation',
      description: 'Clinician documenting a skilled nursing visit',
      operational: {
        module: 'Visit Documentation',
        workflow: 'Skilled Nursing Visit',
        breadcrumbs: [
          { label: 'Visits', path: '/visits' },
          { label: 'Today', path: '/visits/today' },
          { label: 'Visit #12345' },
        ],
        actions: [
          { label: 'Save Draft', onClick: () => alert('Draft saved'), variant: 'secondary' as const },
          { label: 'Submit', onClick: () => alert('Visit submitted'), variant: 'default' as const },
        ],
      },
    },
    {
      id: 2,
      name: 'Billing Review',
      description: 'Billing specialist reviewing episode for claims',
      operational: {
        module: 'Billing Review',
        workflow: 'Episode Validation',
        breadcrumbs: [
          { label: 'Billing', path: '/billing' },
          { label: 'Ready for Billing Queue' },
        ],
        actions: [
          { label: 'Hold', onClick: () => alert('Held'), variant: 'secondary' as const },
          { label: 'Approve for Billing', onClick: () => alert('Approved'), variant: 'default' as const },
        ],
      },
    },
    {
      id: 3,
      name: 'Scheduling',
      description: 'Scheduler assigning visits to clinicians',
      operational: {
        module: 'Scheduling',
        workflow: 'Weekly Schedule',
        breadcrumbs: [
          { label: 'Schedule', path: '/scheduling' },
          { label: 'This Week' },
        ],
        actions: [
          { label: 'Auto-Schedule', onClick: () => alert('Auto-scheduling...'), variant: 'secondary' as const },
          { label: 'Publish', onClick: () => alert('Published'), variant: 'default' as const },
        ],
      },
    },
    {
      id: 4,
      name: 'Clinical Assessment',
      description: 'Therapist completing OASIS assessment',
      operational: {
        module: 'Clinical Assessment',
        workflow: 'OASIS-E SOC',
        breadcrumbs: [
          { label: 'Assessments', path: '/assessments' },
          { label: 'OASIS', path: '/assessments/oasis' },
          { label: 'Start of Care' },
        ],
        actions: [
          { label: 'Save Progress', onClick: () => alert('Saved'), variant: 'secondary' as const },
          { label: 'Lock & Sign', onClick: () => alert('Locked'), variant: 'default' as const },
        ],
      },
    },
  ];

  const currentOperational = scenarios.find((s) => s.id === currentScenario)?.operational || scenarios[0].operational;

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      {/* Demo Page Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="size-8 text-blue-600" />
            Context Display System
          </h1>
          <p className="text-gray-600 mt-2">
            Three-level context display that remains visible during navigation
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About the Context Display System</p>
                <p className="mt-1 text-blue-800">
                  This system provides three persistent context levels: <strong>Patient Context</strong> (who),{' '}
                  <strong>Admission Context</strong> (which episode), and{' '}
                  <strong>Operational Context</strong> (what task). These remain visible as you navigate
                  between related modules, ensuring you always know your working context.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Context Levels Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6 text-center">
              <User className="size-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-bold text-blue-900">Level 1</h3>
              <p className="text-sm text-gray-700 font-medium mt-1">Patient Context</p>
              <p className="text-xs text-gray-600 mt-2">
                Patient demographics, alerts, and quick actions
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-200">
            <CardContent className="p-6 text-center">
              <Briefcase className="size-8 text-indigo-600 mx-auto mb-2" />
              <h3 className="font-bold text-indigo-900">Level 2</h3>
              <p className="text-sm text-gray-700 font-medium mt-1">Admission Context</p>
              <p className="text-xs text-gray-600 mt-2">
                Admission status, payer, authorization, and care team
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardContent className="p-6 text-center">
              <Activity className="size-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-bold text-purple-900">Level 3</h3>
              <p className="text-sm text-gray-700 font-medium mt-1">Operational Context</p>
              <p className="text-xs text-gray-600 mt-2">
                Current module, workflow, and available actions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scenario Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Operational Context:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setCurrentScenario(scenario.id)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      currentScenario === scenario.id
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{scenario.name}</h4>
                      {currentScenario === scenario.id && (
                        <CheckCircle2 className="size-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Mode Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Compact Mode</p>
                <p className="text-xs text-gray-600">Reduces padding and hides some details</p>
              </div>
              <Button
                variant={compactMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCompactMode(!compactMode)}
              >
                {compactMode ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="size-5 text-blue-600" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <ContextDisplay
                patient={mockPatient}
                admission={mockAdmission}
                operational={currentOperational}
                onViewFullChart={() => alert('Navigating to full chart...')}
                onEditPatient={() => alert('Opening patient edit...')}
                onToggleFavorite={() => alert('Toggling favorite...')}
                onViewAdmission={() => alert('Viewing admission details...')}
                onChangeAdmission={() => alert('Opening admission selector...')}
                compact={compactMode}
              />

              {/* Sample Content Area */}
              <div className="p-8 bg-white border-t-4 border-gray-200">
                <div className="text-center text-gray-500">
                  <Activity className="size-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-medium">Main Content Area</p>
                  <p className="text-xs mt-1">
                    Context display remains visible as you navigate between modules
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Components */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Individual Component Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patient">
              <TabsList>
                <TabsTrigger value="patient">Patient Context</TabsTrigger>
                <TabsTrigger value="admission">Admission Context</TabsTrigger>
                <TabsTrigger value="operational">Operational Context</TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="space-y-3 pt-4">
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <PatientContextHeader
                    patient={mockPatient}
                    onViewFullChart={() => alert('Chart')}
                    onEditPatient={() => alert('Edit')}
                    onToggleFavorite={() => alert('Favorite')}
                    compact={compactMode}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold text-blue-900 mb-2">Patient Context Features:</h4>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Patient name, DOB, MRN, age</li>
                    <li>• Office location</li>
                    <li>• Contact information (phone, email)</li>
                    <li>• Alert system (critical, warning, info)</li>
                    <li>• Favorite star toggle</li>
                    <li>• Quick actions (Chart, Edit)</li>
                    <li>• Active admissions count</li>
                    <li>• Last visit date</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="admission" className="space-y-3 pt-4">
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <AdmissionContextBar
                    admission={mockAdmission}
                    onViewAdmission={() => alert('View')}
                    onChangeAdmission={() => alert('Change')}
                    compact={compactMode}
                  />
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold text-indigo-900 mb-2">Admission Context Features:</h4>
                  <ul className="space-y-1 text-indigo-800">
                    <li>• Admission ID and start date</li>
                    <li>• Status (active, pending, on hold, discharged)</li>
                    <li>• Primary payer information</li>
                    <li>• Disciplines assigned (RN, PT, OT, MSW)</li>
                    <li>• Case manager details</li>
                    <li>• Authorization status and visit count</li>
                    <li>• Episode number and day count</li>
                    <li>• Expandable details section</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="operational" className="space-y-3 pt-4">
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <OperationalContextBar context={currentOperational} />
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm">
                  <h4 className="font-semibold text-purple-900 mb-2">Operational Context Features:</h4>
                  <ul className="space-y-1 text-purple-800">
                    <li>• Current module name</li>
                    <li>• Workflow indicator</li>
                    <li>• Breadcrumb navigation</li>
                    <li>• Context-specific actions</li>
                    <li>• Module icon for quick recognition</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <UseCaseCard
                title="Visit Documentation"
                description="Clinician enters patient home, opens mobile app"
                context={{
                  patient: 'Patient header shows demographics and fall risk alert',
                  admission: 'Admission bar displays current episode and auth status (18/40 visits)',
                  operational: 'Visit Documentation module with Save Draft and Submit actions',
                }}
              />
              <UseCaseCard
                title="Billing Review"
                description="Billing specialist reviews episode before claims submission"
                context={{
                  patient: 'Patient info persistent across multiple admissions',
                  admission: 'Admission bar updates when switching between episodes',
                  operational: 'Billing Review module with Hold and Approve actions',
                }}
              />
              <UseCaseCard
                title="Multi-Episode Patient"
                description="Case manager reviews patient with multiple concurrent episodes"
                context={{
                  patient: 'Patient header remains constant (shows 2 active admissions)',
                  admission: 'Dropdown selector to switch between admissions',
                  operational: 'Context updates based on current task',
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">ContextDisplay</code> or
                  individual components from{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded">
                    @/components/context/ContextDisplay
                  </code>
                  . Components are fully typed and responsive.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for use case cards
interface UseCaseCardProps {
  title: string;
  description: string;
  context: {
    patient: string;
    admission: string;
    operational: string;
  };
}

function UseCaseCard({ title, description, context }: UseCaseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-0.5">{description}</p>
        </div>
        <Zap className="size-5 text-blue-600 flex-shrink-0" />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">L1</Badge>
          <p className="text-gray-700">{context.patient}</p>
        </div>
        <div className="flex items-start gap-2">
          <Badge className="bg-indigo-100 text-indigo-800 flex-shrink-0">L2</Badge>
          <p className="text-gray-700">{context.admission}</p>
        </div>
        <div className="flex items-start gap-2">
          <Badge className="bg-purple-100 text-purple-800 flex-shrink-0">L3</Badge>
          <p className="text-gray-700">{context.operational}</p>
        </div>
      </div>
    </div>
  );
}
