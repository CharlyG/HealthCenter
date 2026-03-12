/**
 * Patient Chart Demo Page
 * 
 * Demonstrates the patient chart architecture with clear separation
 * between patient-level data and admission-level workflows.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  PatientChartLayout,
  type PatientChartData,
  patientLevelSections,
  admissionLevelSections,
} from '../components/patient-chart/PatientChartArchitecture';
import {
  Info,
  User,
  Briefcase,
  RefreshCw,
  CheckCircle2,
  Layers,
  Split,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function PatientChartDemoPage() {
  // Mock patient data with multiple admissions
  const mockPatientData: PatientChartData = {
    patientId: 'PT-001234',
    name: 'Johnson, Mary Elizabeth',
    mrn: '001234',
    dob: '1945-01-15',
    selectedAdmissionId: 'ADM-2024-001',
    admissions: [
      {
        admissionId: 'ADM-2024-001',
        startDate: '2024-02-01',
        status: 'active',
        primaryPayer: 'Medicare',
        type: 'home_health',
        episodeNumber: 1,
      },
      {
        admissionId: 'ADM-2024-015',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        status: 'discharged',
        primaryPayer: 'Medicaid',
        type: 'home_health',
        episodeNumber: 2,
      },
      {
        admissionId: 'ADM-2023-085',
        startDate: '2023-10-01',
        endDate: '2023-12-15',
        status: 'discharged',
        primaryPayer: 'Medicare',
        type: 'home_health',
        episodeNumber: 1,
      },
    ],
  };

  const [selectedAdmission, setSelectedAdmission] = useState(mockPatientData.selectedAdmissionId);
  const [sectionChanges, setSectionChanges] = useState(0);
  const [admissionChanges, setAdmissionChanges] = useState(0);

  const handleAdmissionChange = (admissionId: string) => {
    setSelectedAdmission(admissionId);
    setAdmissionChanges((prev) => prev + 1);
  };

  const updatedPatientData = {
    ...mockPatientData,
    selectedAdmissionId: selectedAdmission,
  };

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="size-8 text-blue-600" />
            Patient Chart Architecture
          </h1>
          <p className="text-gray-600 mt-2">
            Two-tier navigation separating patient-level data from admission-level workflows
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About This Architecture</p>
                <p className="mt-1 text-blue-800">
                  The patient chart clearly separates <strong>patient-level data</strong> (demographics,
                  locations—constant across admissions) from <strong>admission-level workflows</strong>{' '}
                  (visits, clinical documentation—updates when switching admissions). This prevents
                  confusion about data scope and ensures users always know which admission context
                  they're working in.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient-Level */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="size-5 text-blue-600" />
                Patient-Level Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900 mb-2">Characteristics:</p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5" />
                    <span>Remains <strong>constant</strong> across all admissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5" />
                    <span>Shows data at the <strong>patient level</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 flex-shrink-0 mt-0.5" />
                    <span>Includes all admissions aggregated</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Sections ({patientLevelSections.length}):</p>
                <div className="space-y-1">
                  {patientLevelSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <div
                        key={section.id}
                        className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded px-3 py-2"
                      >
                        <Icon className="size-4 text-gray-600" />
                        <span className="text-gray-900">{section.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admission-Level */}
          <Card className="border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="size-5 text-indigo-600" />
                Admission-Level Workflows
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-indigo-900 mb-2">Characteristics:</p>
                <ul className="space-y-1 text-sm text-indigo-800">
                  <li className="flex items-start gap-2">
                    <RefreshCw className="size-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Updates automatically</strong> when switching admissions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="size-4 flex-shrink-0 mt-0.5" />
                    <span>Shows data for <strong>selected admission only</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RefreshCw className="size-4 flex-shrink-0 mt-0.5" />
                    <span>Requires an admission to be selected</span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Sections ({admissionLevelSections.length}):
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {admissionLevelSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <div
                        key={section.id}
                        className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded px-3 py-2"
                      >
                        <Icon className="size-4 text-gray-600" />
                        <span className="text-gray-900">{section.label}</span>
                        {section.badge && (
                          <Badge className="ml-auto text-xs bg-amber-100 text-amber-800">
                            {section.badge.value}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{patientLevelSections.length}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Patient-Level Sections</p>
              <p className="text-xs text-gray-500 mt-1">Always visible</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-indigo-600">{admissionLevelSections.length}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Admission-Level Sections</p>
              <p className="text-xs text-gray-500 mt-1">Updates on admission change</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {mockPatientData.admissions.length}
              </p>
              <p className="text-sm text-gray-700 font-medium mt-1">Patient Admissions</p>
              <p className="text-xs text-gray-500 mt-1">Switch between them</p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="size-5 text-orange-600" />
                Interactive Demo
              </span>
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline">
                  Section Changes: {sectionChanges}
                </Badge>
                <Badge variant="outline" className="bg-indigo-50">
                  Admission Changes: {admissionChanges}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <PatientChartLayout
                patientData={updatedPatientData}
                onSectionChange={() => setSectionChanges((prev) => prev + 1)}
                onAdmissionChange={handleAdmissionChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="scenario1">
              <TabsList>
                <TabsTrigger value="scenario1">Clinician Review</TabsTrigger>
                <TabsTrigger value="scenario2">Billing Review</TabsTrigger>
                <TabsTrigger value="scenario3">Multi-Episode</TabsTrigger>
              </TabsList>

              <TabsContent value="scenario1" className="space-y-3 pt-4">
                <UseCaseCard
                  title="Clinician Reviewing Patient"
                  description="RN preparing for visit needs to review patient information"
                  steps={[
                    'Opens patient chart → sees patient-level Overview',
                    'Reviews Demographics (patient-level: constant)',
                    'Selects current active admission (ADM-2024-001)',
                    'Navigates to Visits (admission-level: shows only ADM-2024-001 visits)',
                    'Reviews Clinical Documentation (admission-level)',
                    'Patient-level sections remain unchanged throughout',
                  ]}
                  dataFlow={[
                    { level: 'patient', data: 'Demographics stay constant' },
                    { level: 'admission', data: 'Visits update for ADM-2024-001' },
                  ]}
                />
              </TabsContent>

              <TabsContent value="scenario2" className="space-y-3 pt-4">
                <UseCaseCard
                  title="Billing Specialist Review"
                  description="Billing team reviewing episode for claims submission"
                  steps={[
                    'Opens patient chart to see all patient admissions',
                    'Selects completed admission (ADM-2024-015)',
                    'Reviews Billing section (admission-level: shows ADM-2024-015 data)',
                    'Checks Visits count (admission-level)',
                    'Verifies Assessments completion (admission-level)',
                    'Patient Demographics remain visible (patient-level)',
                  ]}
                  dataFlow={[
                    { level: 'patient', data: 'Patient info constant' },
                    { level: 'admission', data: 'Billing/Visits update for ADM-2024-015' },
                  ]}
                />
              </TabsContent>

              <TabsContent value="scenario3" className="space-y-3 pt-4">
                <UseCaseCard
                  title="Multi-Episode Patient Management"
                  description="Case manager reviewing patient with multiple episodes"
                  steps={[
                    'Opens patient chart → sees 3 total admissions',
                    'Reviews Referral History (patient-level: all referrals)',
                    'Switches to ADM-2024-001 → Visits section updates',
                    'Switches to ADM-2024-015 → Visits section updates again',
                    'Switches to ADM-2023-085 → Visits section updates',
                    'Patient Demographics never change',
                  ]}
                  dataFlow={[
                    { level: 'patient', data: 'Referral History shows all admissions' },
                    { level: 'admission', data: 'Visits update each time admission changes' },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Key Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BenefitCard
                icon={Split}
                title="Clear Separation"
                description="No confusion about whether data is patient-level or admission-level"
                color="blue"
              />
              <BenefitCard
                icon={RefreshCw}
                title="Automatic Updates"
                description="Admission sections update automatically when switching admissions"
                color="indigo"
              />
              <BenefitCard
                icon={CheckCircle2}
                title="Data Consistency"
                description="Patient-level data remains constant across all admissions"
                color="green"
              />
              <BenefitCard
                icon={Zap}
                title="Efficient Navigation"
                description="Quick access to both patient and admission information"
                color="orange"
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
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">PatientChartLayout</code>{' '}
                  from <code className="bg-green-200 px-1 py-0.5 rounded">@/components/patient-chart</code>.
                  The architecture is fully typed and responsive.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface UseCaseCardProps {
  title: string;
  description: string;
  steps: string[];
  dataFlow: Array<{ level: 'patient' | 'admission'; data: string }>;
}

function UseCaseCard({ title, description, steps, dataFlow }: UseCaseCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 mb-3">{description}</p>

        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">Workflow:</p>
          <ol className="space-y-1">
            {steps.map((step, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="font-semibold text-blue-600 flex-shrink-0">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Data Flow:</p>
          <div className="space-y-2">
            {dataFlow.map((flow, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge
                  className={
                    flow.level === 'patient'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }
                >
                  {flow.level === 'patient' ? 'Patient' : 'Admission'}
                </Badge>
                <ArrowRight className="size-3 text-gray-400" />
                <span className="text-sm text-gray-700">{flow.data}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BenefitCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'blue' | 'indigo' | 'green' | 'orange';
}

function BenefitCard({ icon: Icon, title, description, color }: BenefitCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className={`size-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
