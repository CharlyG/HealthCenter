/**
 * Context Hierarchy Demo Page
 * 
 * Demonstrates the 5-level context hierarchy system with interactive examples.
 * Shows how context indicators adapt to different scenarios.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  ContextIndicator,
  PatientHeader,
  AdmissionContextBar,
  EpisodeDashboard,
  ContextAwareLayout,
  type ContextHierarchy,
  type PatientContext,
  type AdmissionContext,
  type EpisodeContext,
} from '../components/context/ContextHierarchy';
import {
  Layers,
  Info,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Eye,
} from 'lucide-react';

export default function ContextHierarchyDemoPage() {
  const [currentScenario, setCurrentScenario] = useState<number>(1);

  // Mock data for different scenarios
  const mockPatient: PatientContext = {
    mrn: '001234',
    name: 'Johnson, Mary',
    dob: '1945-01-15',
    status: 'active',
    primaryDiagnosis: 'CHF, Diabetes Type 2',
  };

  const mockAdmission1: AdmissionContext = {
    admissionId: 'ADM-2024-001',
    admissionDate: '2024-02-01',
    status: 'active',
    type: 'home_health',
    primaryPayer: 'Medicare',
    daysInEpisode: 35,
    totalEpisodeDays: 60,
  };

  const mockAdmission2: AdmissionContext = {
    admissionId: 'ADM-2023-045',
    admissionDate: '2023-10-15',
    status: 'discharged',
    type: 'home_health',
    primaryPayer: 'Medicaid',
    daysInEpisode: 60,
    totalEpisodeDays: 60,
  };

  const mockEpisode: EpisodeContext = {
    episodeNumber: 1,
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    daysRemaining: 25,
    status: 'active',
  };

  // Scenario configurations
  const scenarios = [
    {
      id: 1,
      name: 'Workspace Only',
      description: 'User in Clinical Dashboard with no patient selected',
      context: {
        workspace: { id: 'clinical', name: 'Clinical Dashboard', type: 'clinical' as const },
      },
    },
    {
      id: 2,
      name: 'Patient Context',
      description: 'User viewing patient chart without specific admission',
      context: {
        workspace: { id: 'clinical', name: 'Clinical Dashboard', type: 'clinical' as const },
        patient: mockPatient,
      },
    },
    {
      id: 3,
      name: 'Active Admission',
      description: 'User working with active admission - most common scenario',
      context: {
        workspace: { id: 'clinical', name: 'Clinical Dashboard', type: 'clinical' as const },
        patient: mockPatient,
        admission: mockAdmission1,
      },
    },
    {
      id: 4,
      name: 'With Episode Context',
      description: 'Full context including episode progress tracking',
      context: {
        workspace: { id: 'clinical', name: 'Clinical Dashboard', type: 'clinical' as const },
        patient: mockPatient,
        admission: mockAdmission1,
        episode: mockEpisode,
      },
    },
    {
      id: 5,
      name: 'Discharged Admission',
      description: 'Historical admission view (read-only context)',
      context: {
        workspace: { id: 'clinical', name: 'Clinical Dashboard', type: 'clinical' as const },
        patient: mockPatient,
        admission: mockAdmission2,
      },
    },
  ];

  const currentContext = scenarios.find((s) => s.id === currentScenario)?.context || {};

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="size-8 text-blue-600" />
            Context Hierarchy System Demo
          </h1>
          <p className="text-gray-600 mt-2">
            Interactive demonstration of the 5-level context hierarchy architecture
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About This Demo</p>
                <p className="mt-1 text-blue-800">
                  This page demonstrates how context indicators adapt to different scenarios in the
                  platform. Select a scenario below to see how the UI changes to reflect the
                  operational context. This system ensures users always know where they are in the
                  hierarchy: Workspace → Patient → Admission → Episode → Visit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select a Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setCurrentScenario(scenario.id)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    currentScenario === scenario.id
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                    {currentScenario === scenario.id && (
                      <CheckCircle2 className="size-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Context Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="size-5 text-blue-600" />
              Current Context Visualization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Context Hierarchy Diagram */}
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Context Levels Active:</h4>
              <div className="space-y-2">
                <ContextLevel
                  level={1}
                  name="Workspace"
                  active={!!currentContext.workspace}
                  data={currentContext.workspace?.name}
                />
                <ContextLevel
                  level={2}
                  name="Patient"
                  active={!!currentContext.patient}
                  data={currentContext.patient?.name}
                />
                <ContextLevel
                  level={3}
                  name="Admission"
                  active={!!currentContext.admission}
                  data={currentContext.admission?.admissionId}
                />
                <ContextLevel
                  level={4}
                  name="Episode"
                  active={!!currentContext.episode}
                  data={currentContext.episode ? `Episode ${currentContext.episode.episodeNumber}` : undefined}
                />
                <ContextLevel
                  level={5}
                  name="Visit"
                  active={!!currentContext.visit}
                  data={currentContext.visit?.visitId}
                />
              </div>
            </div>

            {/* Component Preview */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">UI Component Preview:</h4>
              <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                <ContextAwareLayout
                  context={currentContext as ContextHierarchy}
                  showPatientHeader={!!currentContext.patient}
                  showAdmissionBar={!!currentContext.admission}
                  showBreadcrumbs={true}
                >
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Episode Widget (if applicable) */}
                      {currentContext.episode && (
                        <EpisodeDashboard episode={currentContext.episode} />
                      )}

                      {/* Context Info Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Context Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {currentContext.workspace && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Workspace:</span>
                              <span className="font-medium">{currentContext.workspace.name}</span>
                            </div>
                          )}
                          {currentContext.patient && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Patient MRN:</span>
                              <span className="font-medium font-mono">{currentContext.patient.mrn}</span>
                            </div>
                          )}
                          {currentContext.admission && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Admission Status:</span>
                              <Badge
                                className={
                                  currentContext.admission.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {currentContext.admission.status}
                              </Badge>
                            </div>
                          )}
                          {currentContext.episode && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Days Remaining:</span>
                              <span className="font-bold text-indigo-700">
                                {currentContext.episode.daysRemaining} days
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Sample Content Area */}
                    <Card className="border-dashed border-2">
                      <CardContent className="p-8 text-center text-gray-500">
                        <p className="text-sm">Main content area would appear here</p>
                        <p className="text-xs mt-2">
                          Content adapts based on current context level
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </ContextAwareLayout>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Context Switching Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patient">
              <TabsList>
                <TabsTrigger value="patient">Patient Level</TabsTrigger>
                <TabsTrigger value="admission">Admission Level</TabsTrigger>
                <TabsTrigger value="episode">Episode Level</TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Patient-Level Data (Persistent)</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    This information remains constant when switching between admissions:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Demographics (Name, DOB, MRN, Gender)</li>
                    <li>Contact Information</li>
                    <li>Medical History & Allergies</li>
                    <li>Insurance Information</li>
                    <li>Advance Directives</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="admission" className="space-y-3">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2">
                    Admission-Level Data (Context-Specific)
                  </h4>
                  <p className="text-sm text-indigo-800 mb-3">
                    This information updates when switching between admissions:
                  </p>
                  <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
                    <li>Authorization Details</li>
                    <li>Care Team Assignment</li>
                    <li>Orders for this admission</li>
                    <li>Plan of Care</li>
                    <li>Admission Diagnoses</li>
                    <li>Discharge Planning</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="episode" className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Episode-Level Data (60-Day Periods)
                  </h4>
                  <p className="text-sm text-purple-800 mb-3">
                    This information is specific to certification periods:
                  </p>
                  <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                    <li>OASIS Assessments (SOC, Recert, Discharge)</li>
                    <li>Certification/Recertification Documents</li>
                    <li>Episode Start/End Dates</li>
                    <li>Physician Orders for this period</li>
                    <li>Episode-specific billing</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Try different scenarios to see how context indicators adapt
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentScenario(currentScenario === 5 ? 1 : currentScenario + 1)}
                >
                  <RefreshCw className="size-4 mr-2" />
                  Next Scenario
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ContextLevelProps {
  level: number;
  name: string;
  active: boolean;
  data?: string;
}

function ContextLevel({ level, name, active, data }: ContextLevelProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-32">
        <Badge
          variant="outline"
          className={`w-16 justify-center ${
            active ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-200 text-gray-500'
          }`}
        >
          Level {level}
        </Badge>
        <span className="text-sm font-medium text-gray-700">{name}</span>
      </div>
      <ArrowRight className={`size-4 ${active ? 'text-blue-600' : 'text-gray-300'}`} />
      <div
        className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
          active
            ? 'bg-blue-100 text-blue-900 border border-blue-300'
            : 'bg-gray-100 text-gray-400 border border-gray-200'
        }`}
      >
        {active && data ? data : 'Not Active'}
      </div>
    </div>
  );
}
