/**
 * Admission Medication Review Dashboard Page
 * 
 * Centralized dashboard for medication management during active admission.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Pill,
  Users,
  FileText,
  TrendingUp,
  Settings,
  Download,
  Activity,
} from 'lucide-react';
import AdmissionMedicationReviewDashboard from '../components/AdmissionMedicationReviewDashboard';
import type { MedicationReviewDashboardData } from '../components/AdmissionMedicationReviewDashboard';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_DASHBOARD_DATA: MedicationReviewDashboardData = {
  admissionId: 'adm-12345',
  patientName: 'Margaret Johnson',
  admissionDate: '2024-03-01T08:00:00Z',
  
  // Summary metrics
  totalActiveMedications: 12,
  medicationsNotReconciled: 3,
  recentChanges: 5,
  criticalAlerts: 2,
  teachingNeeded: 4,
  highRiskMedications: 3,
  
  // Reconciliation status
  reconciliationStatus: 'in-progress',
  lastReconciliationDate: '2024-03-01T10:00:00Z',
  lastReconciliationBy: 'Jennifer Lee, RN',
  
  // Flags
  hasHighRiskMeds: true,
  hasPolypharmacy: true,
  hasDuplicateTherapy: false,
  
  // Unreconciled medications
  unreconciledMedications: [
    {
      id: 'med-unr-001',
      name: 'Aspirin 81mg',
      source: 'patient-reported',
      status: 'pending',
      addedDate: '2024-03-01T09:00:00Z',
    },
    {
      id: 'med-unr-002',
      name: 'Vitamin D3 2000 IU',
      source: 'patient-reported',
      status: 'pending',
      addedDate: '2024-03-01T09:00:00Z',
    },
    {
      id: 'med-unr-003',
      name: 'Lisinopril 20mg',
      source: 'hospital-discharge',
      status: 'discrepancy',
      addedDate: '2024-03-01T09:30:00Z',
    },
  ],
  
  // Critical alerts
  criticalAlertsList: [
    {
      id: 'alert-001',
      type: 'drug-interaction',
      severity: 'critical',
      medicationName: 'Warfarin + Aspirin',
      message: 'Severe interaction: Increased risk of bleeding. Monitor INR closely and watch for signs of bleeding.',
      createdDate: '2024-03-01T10:15:00Z',
    },
    {
      id: 'alert-002',
      type: 'allergy-conflict',
      severity: 'high',
      medicationName: 'Lisinopril',
      message: 'Patient has documented ACE inhibitor allergy (angioedema). Consider alternative antihypertensive.',
      createdDate: '2024-03-01T09:30:00Z',
    },
  ],
  
  // Recent changes
  recentChangesList: [
    {
      id: 'change-001',
      medicationName: 'Warfarin Sodium',
      changeType: 'dose-changed',
      date: '2024-03-12T13:30:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
    {
      id: 'change-002',
      medicationName: 'Gabapentin',
      changeType: 'dose-changed',
      date: '2024-03-05T14:30:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
    {
      id: 'change-003',
      medicationName: 'Furosemide',
      changeType: 'frequency-changed',
      date: '2024-03-09T15:20:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
    {
      id: 'change-004',
      medicationName: 'Oxycodone HCl',
      changeType: 'discontinued',
      date: '2024-03-07T09:00:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
    {
      id: 'change-005',
      medicationName: 'Furosemide',
      changeType: 'added',
      date: '2024-03-08T10:45:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
  ],
  
  // Teaching needed
  teachingNeededList: [
    {
      id: 'teach-001',
      medicationName: 'Warfarin Sodium',
      reason: 'high-risk',
      priority: 'high',
      dueDate: '2024-03-15T00:00:00Z',
    },
    {
      id: 'teach-002',
      medicationName: 'Gabapentin',
      reason: 'new-medication',
      priority: 'medium',
      dueDate: '2024-03-16T00:00:00Z',
    },
    {
      id: 'teach-003',
      medicationName: 'Furosemide',
      reason: 'new-medication',
      priority: 'medium',
      dueDate: '2024-03-16T00:00:00Z',
    },
    {
      id: 'teach-004',
      medicationName: 'Insulin Glargine',
      reason: 'complex-regimen',
      priority: 'high',
      dueDate: '2024-03-14T00:00:00Z',
    },
  ],
};

const MOCK_DASHBOARD_DATA_COMPLETED: MedicationReviewDashboardData = {
  ...MOCK_DASHBOARD_DATA,
  medicationsNotReconciled: 0,
  criticalAlerts: 0,
  teachingNeeded: 0,
  reconciliationStatus: 'completed',
  unreconciledMedications: [],
  criticalAlertsList: [],
  teachingNeededList: [],
};

const MOCK_DASHBOARD_DATA_NOT_STARTED: MedicationReviewDashboardData = {
  ...MOCK_DASHBOARD_DATA,
  reconciliationStatus: 'not-started',
  lastReconciliationDate: undefined,
  lastReconciliationBy: undefined,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdmissionMedicationReviewDashboardPage() {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<'in-progress' | 'not-started' | 'completed'>('in-progress');

  const dashboardData = 
    selectedScenario === 'in-progress' ? MOCK_DASHBOARD_DATA :
    selectedScenario === 'not-started' ? MOCK_DASHBOARD_DATA_NOT_STARTED :
    MOCK_DASHBOARD_DATA_COMPLETED;

  const handleStartReconciliation = () => {
    console.log('Starting reconciliation...');
    navigate('/medication-reconciliation-workflow');
  };

  const handleReviewAlerts = () => {
    console.log('Reviewing alerts...');
    navigate('/medication-alerts-demo');
  };

  const handleDocumentTeaching = (medicationId: string) => {
    console.log('Documenting teaching for:', medicationId);
    navigate('/visit-documentation-medication-demo');
  };

  const handleOpenMedicationProfile = () => {
    console.log('Opening medication profile...');
    navigate('/patient-medication-profile-view');
  };

  const handleViewMedicationHistory = (medicationId: string) => {
    console.log('Viewing history for:', medicationId);
    // Would open medication history drawer
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
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Pill className="w-6 h-6 text-blue-600" />
                  Admission Medication Review
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Centralized medication management dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">
              <Activity className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="scenarios">
              <TrendingUp className="w-4 h-4 mr-2" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="integration">
              <FileText className="w-4 h-4 mr-2" />
              Integration
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AdmissionMedicationReviewDashboard
              data={dashboardData}
              onStartReconciliation={handleStartReconciliation}
              onReviewAlerts={handleReviewAlerts}
              onDocumentTeaching={handleDocumentTeaching}
              onOpenMedicationProfile={handleOpenMedicationProfile}
              onViewMedicationHistory={handleViewMedicationHistory}
            />
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Dashboard Scenarios</h3>
              <p className="text-sm text-gray-600 mb-4">
                View different states of the medication review dashboard
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <ScenarioCard
                  title="Reconciliation Not Started"
                  description="Initial state when patient is admitted"
                  metrics={['12 active meds', '12 not reconciled', '2 critical alerts']}
                  isActive={selectedScenario === 'not-started'}
                  onClick={() => setSelectedScenario('not-started')}
                />
                <ScenarioCard
                  title="Reconciliation In Progress"
                  description="Actively reconciling medications"
                  metrics={['12 active meds', '3 not reconciled', '2 critical alerts']}
                  isActive={selectedScenario === 'in-progress'}
                  onClick={() => setSelectedScenario('in-progress')}
                />
                <ScenarioCard
                  title="All Tasks Complete"
                  description="Reconciliation done, no alerts"
                  metrics={['12 active meds', '0 not reconciled', '0 alerts']}
                  isActive={selectedScenario === 'completed'}
                  onClick={() => setSelectedScenario('completed')}
                />
              </div>

              <Separator className="my-6" />

              {/* Selected Scenario Preview */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Selected Scenario Preview</h4>
                <AdmissionMedicationReviewDashboard
                  data={dashboardData}
                  onStartReconciliation={handleStartReconciliation}
                  onReviewAlerts={handleReviewAlerts}
                  onDocumentTeaching={handleDocumentTeaching}
                  onOpenMedicationProfile={handleOpenMedicationProfile}
                  onViewMedicationHistory={handleViewMedicationHistory}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Integration Points</h3>
              
              <div className="space-y-4">
                <IntegrationExample
                  title="Patient Chart - Medications Section"
                  description="Dashboard appears as the main view in the medications section of the patient chart"
                  context="Patient Chart → Medications Tab"
                />
                
                <IntegrationExample
                  title="Admission Workflow"
                  description="Automatically shown after admission is created to prompt medication reconciliation"
                  context="New Admission → Medication Review Step"
                />
                
                <IntegrationExample
                  title="Care Team Dashboard"
                  description="Medication review tasks appear in the care team's task list with priority indicators"
                  context="Care Team Dashboard → Action Items"
                />
                
                <IntegrationExample
                  title="Visit Documentation"
                  description="Embedded in visit documentation to show current medication status while documenting"
                  context="Visit Note → Medication Review Section"
                />
                
                <IntegrationExample
                  title="Transfer/Discharge Workflow"
                  description="Verify medication reconciliation is complete before transfer or discharge"
                  context="Discharge Workflow → Medication Verification Gate"
                />

                <IntegrationExample
                  title="Clinical Compliance Monitor"
                  description="Dashboard metrics feed into compliance monitoring for timely reconciliation"
                  context="Compliance Monitor → Medication Reconciliation Compliance"
                />
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Navigation Flow</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">1</Badge>
                  <span>Dashboard identifies issues (unreconciled meds, alerts, teaching)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">2</Badge>
                  <span>Click quick action button to navigate to specific workflow</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">3</Badge>
                  <span>Complete task in dedicated workflow screen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">4</Badge>
                  <span>Return to dashboard to see updated metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">5</Badge>
                  <span>Continue until all tasks are complete (green state)</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Related Workflows</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate('/medication-reconciliation-workflow')}
                >
                  <div className="text-left">
                    <div className="font-medium">Medication Reconciliation</div>
                    <div className="text-xs text-gray-600">Compare and verify medications</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate('/medication-alerts-demo')}
                >
                  <div className="text-left">
                    <div className="font-medium">Medication Alerts</div>
                    <div className="text-xs text-gray-600">Review and resolve alerts</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate('/visit-documentation-medication-demo')}
                >
                  <div className="text-left">
                    <div className="font-medium">Medication Teaching</div>
                    <div className="text-xs text-gray-600">Document patient education</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate('/patient-medication-profile-view')}
                >
                  <div className="text-left">
                    <div className="font-medium">Medication Profile</div>
                    <div className="text-xs text-gray-600">View complete medication list</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate('/medication-timeline-demo')}
                >
                  <div className="text-left">
                    <div className="font-medium">Medication Timeline</div>
                    <div className="text-xs text-gray-600">View medication history</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate('/medication-change-tracking')}
                >
                  <div className="text-left">
                    <div className="font-medium">Change Tracking</div>
                    <div className="text-xs text-gray-600">Track medication changes</div>
                  </div>
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO CARD
// ═══════════════════════════════════════════════════════════════════════════

function ScenarioCard({
  title,
  description,
  metrics,
  isActive,
  onClick,
}: {
  title: string;
  description: string;
  metrics: string[];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all',
        isActive ? 'border-blue-500 bg-blue-50 shadow-md' : 'hover:border-gray-400'
      )}
      onClick={onClick}
    >
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="space-y-1">
        {metrics.map((metric, idx) => (
          <div key={idx} className="text-xs text-gray-700 flex items-center gap-1">
            <div className="w-1 h-1 bg-blue-600 rounded-full" />
            {metric}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION EXAMPLE
// ═══════════════════════════════════════════════════════════════════════════

function IntegrationExample({
  title,
  description,
  context,
}: {
  title: string;
  description: string;
  context: string;
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <Badge variant="outline" className="text-xs">{context}</Badge>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
