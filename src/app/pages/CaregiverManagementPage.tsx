/**
 * Caregiver Management Demo Page
 * 
 * Comprehensive demonstration of all caregiver management modules including
 * availability, documents, training, workload, activity, and scheduling validation.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Calendar, FileText, GraduationCap, BarChart3, Activity, Shield } from 'lucide-react';
import CaregiverAvailabilityModule from '../components/caregiver/CaregiverAvailabilityModule';
import {
  DocumentLibraryModule,
  TrainingModule,
  WorkloadMonitoringModule,
  ActivityTimelineModule,
} from '../components/caregiver/CaregiverModules';
import SchedulingValidation from '../components/caregiver/SchedulingValidation';
import {
  generateMockCaregiverManagementData,
  generateMockTrainingAlerts,
  generateMockWorkloadAlerts,
  generateMockValidation,
} from '../lib/caregiverManagementMockData';

export default function CaregiverManagementPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string>('availability');

  // Mock data
  const caregiverData = generateMockCaregiverManagementData();
  const trainingAlerts = generateMockTrainingAlerts();
  const workloadAlerts = generateMockWorkloadAlerts();
  const validationPassing = generateMockValidation(true);
  const validationFailing = generateMockValidation(false);

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
                  Caregiver Management System
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete management suite for caregiver operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Architecture Overview */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Caregiver Management Architecture
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Comprehensive system for discipline management, availability tracking, document
            library, training certification, workload monitoring, and scheduling validation.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                7 Core Modules
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Discipline & Role Management</li>
                <li>• Weekly Availability Scheduler</li>
                <li>• Document Library (HR docs)</li>
                <li>• Training & Certification Tracking</li>
                <li>• Scheduling Validation Engine</li>
                <li>• Workload Monitoring & Alerts</li>
                <li>• Activity Timeline History</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 text-sm">
                Scheduling Integration
              </h3>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Discipline match validation</li>
                <li>• Credential expiration check</li>
                <li>• Training requirement verification</li>
                <li>• Availability matching</li>
                <li>• Workload capacity assessment</li>
                <li>• Warning & blocker system</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                Key Features
              </h3>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Primary/secondary disciplines</li>
                <li>• Geographic preferences</li>
                <li>• Document preview/download</li>
                <li>• Training expiration alerts</li>
                <li>• Burnout risk detection</li>
                <li>• Chronological activity log</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Module Selector */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Select Module</h2>
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="availability">
                <Calendar className="w-4 h-4 mr-2" />
                Availability
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="training">
                <GraduationCap className="w-4 h-4 mr-2" />
                Training
              </TabsTrigger>
              <TabsTrigger value="workload">
                <BarChart3 className="w-4 h-4 mr-2" />
                Workload
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="validation">
                <Shield className="w-4 h-4 mr-2" />
                Validation
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Availability Module */}
        {activeView === 'availability' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Availability Module Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                    Weekly Schedule
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• 7-day availability grid</li>
                    <li>• Start/end times per day</li>
                    <li>• Break time configuration</li>
                    <li>• Max visits per day limits</li>
                    <li>• Available/unavailable indicators</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">
                    Geographic Preferences
                  </h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Preferred territories/cities/zip codes</li>
                    <li>• Travel radius in miles</li>
                    <li>• Multiple geographic areas</li>
                    <li>• Scheduling integration</li>
                  </ul>
                </div>
              </div>
            </Card>

            <CaregiverAvailabilityModule
              availability={caregiverData.availability}
              onUpdate={(updated) => console.log('Availability updated:', updated)}
              mode="view"
            />
          </div>
        )}

        {/* Document Library Module */}
        {activeView === 'documents' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Document Library Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                    5 Document Categories
                  </h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Credentials (licenses, certifications)</li>
                    <li>• Training (certificates, completions)</li>
                    <li>• Employment (contracts, agreements)</li>
                    <li>• Background Checks (screening reports)</li>
                    <li>• Other (miscellaneous HR docs)</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm">
                    Document Features
                  </h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Upload date & uploader tracking</li>
                    <li>• Expiration date management</li>
                    <li>• Status indicators (active/expired/expiring)</li>
                    <li>• Preview & download actions</li>
                    <li>• Tag system for organization</li>
                  </ul>
                </div>
              </div>
            </Card>

            <DocumentLibraryModule
              documents={caregiverData.documents}
              onUpload={() => alert('Upload document dialog would open')}
              onPreview={(id) => alert(`Preview document: ${id}`)}
              onDownload={(id) => alert(`Download document: ${id}`)}
              onDelete={(id) => confirm('Delete this document?') && alert('Document deleted')}
            />
          </div>
        )}

        {/* Training Module */}
        {activeView === 'training' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Training Module Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <h3 className="font-semibold text-teal-900 mb-2 text-sm">
                    6 Training Categories
                  </h3>
                  <ul className="text-xs text-teal-800 space-y-1">
                    <li>• 🦠 Infection Control (12mo)</li>
                    <li>• 🔒 HIPAA Compliance (12mo)</li>
                    <li>• ⚕️ Clinical Protocol (12mo)</li>
                    <li>• ⚠️ Safety Training (12mo)</li>
                    <li>• ✓ Compliance (12mo)</li>
                    <li>• 📚 Continuing Education (24mo)</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2 text-sm">
                    Alert System
                  </h3>
                  <ul className="text-xs text-red-800 space-y-1">
                    <li>• Overdue training alerts (critical)</li>
                    <li>• Expiring soon warnings (medium/high)</li>
                    <li>• Days overdue/until expiration</li>
                    <li>• Required vs optional training</li>
                    <li>• Certificate storage & viewing</li>
                  </ul>
                </div>
              </div>
            </Card>

            <TrainingModule
              training={caregiverData.training}
              alerts={trainingAlerts}
              onAddTraining={() => alert('Add training dialog would open')}
              onViewCertificate={(id) => alert(`View certificate: ${id}`)}
            />
          </div>
        )}

        {/* Workload Module */}
        {activeView === 'workload' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Workload Monitoring Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                    Workload Metrics
                  </h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Visits scheduled/completed/cancelled</li>
                    <li>• Average visits per day</li>
                    <li>• Total hours & mileage tracking</li>
                    <li>• Utilization rate (0-100%)</li>
                    <li>• Current week + month-to-date stats</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2 text-sm">
                    Status Detection
                  </h3>
                  <ul className="text-xs text-orange-800 space-y-1">
                    <li>• Underutilized (blue) - &lt;60% utilization</li>
                    <li>• Optimal (green) - 60-80% utilization</li>
                    <li>• High (amber) - 80-90% utilization</li>
                    <li>• Overloaded (red) - &gt;90% utilization</li>
                    <li>• Burnout risk levels (low/medium/high)</li>
                  </ul>
                </div>
              </div>
            </Card>

            <WorkloadMonitoringModule
              metrics={caregiverData.workload}
              alerts={workloadAlerts}
            />
          </div>
        )}

        {/* Activity Timeline */}
        {activeView === 'activity' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Activity Timeline Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-900 mb-2 text-sm">
                    10 Activity Types
                  </h3>
                  <ul className="text-xs text-indigo-800 space-y-1">
                    <li>• ✓ Visit Completed</li>
                    <li>• 📅 Visit Scheduled</li>
                    <li>• ✕ Visit Cancelled</li>
                    <li>• 📄 Documentation Submitted</li>
                    <li>• 🎓 Training Completed</li>
                    <li>• 🏥 Credential Updated</li>
                    <li>• ⚠️ Credential Expired</li>
                    <li>• 🔄 Schedule Changed</li>
                    <li>• 👤 Profile Updated</li>
                    <li>• 🔔 Alert Generated</li>
                  </ul>
                </div>

                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <h3 className="font-semibold text-pink-900 mb-2 text-sm">
                    Timeline Features
                  </h3>
                  <ul className="text-xs text-pink-800 space-y-1">
                    <li>• Chronological reverse order</li>
                    <li>• Color-coded activity types</li>
                    <li>• Timestamp + performer tracking</li>
                    <li>• Related entity linking (visits/docs)</li>
                    <li>• Visual timeline with dots</li>
                    <li>• Detailed descriptions</li>
                  </ul>
                </div>
              </div>
            </Card>

            <ActivityTimelineModule
              activities={caregiverData.activities}
              onViewActivity={(id) => alert(`View activity details: ${id}`)}
            />
          </div>
        )}

        {/* Scheduling Validation */}
        {activeView === 'validation' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Scheduling Validation System
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Automated validation engine that checks discipline match, credential validity,
                training requirements, availability, and workload capacity before allowing
                caregiver assignment to visits.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">
                    5 Validation Checks
                  </h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Discipline Match (primary/secondary)</li>
                    <li>• Credential Validity (not expired)</li>
                    <li>• Training Current (all required completed)</li>
                    <li>• Availability Match (day/time overlap)</li>
                    <li>• Workload Capacity (under max limits)</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2 text-sm">
                    Warning & Blocker System
                  </h3>
                  <ul className="text-xs text-red-800 space-y-1">
                    <li>• Warnings (low/medium/high severity)</li>
                    <li>• Blockers (prevents assignment)</li>
                    <li>• Invalid discipline (blocker)</li>
                    <li>• Expired credentials (blocker)</li>
                    <li>• Missing training (blocker)</li>
                    <li>• Unavailable times (blocker)</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Passing Validation Example */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Example: Valid Assignment (with warnings)
              </h3>
              <SchedulingValidation
                validation={validationPassing}
                caregiverName="Sarah Johnson, RN"
                visitDetails={{
                  patientName: 'Margaret Johnson',
                  discipline: 'SN',
                  date: '2024-03-12',
                  time: '10:00 AM',
                }}
                onDismissWarning={(type) => alert(`Dismiss warning: ${type}`)}
              />
            </div>

            {/* Failing Validation Example */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Example: Invalid Assignment (with blockers)
              </h3>
              <SchedulingValidation
                validation={validationFailing}
                caregiverName="Sarah Johnson, RN"
                visitDetails={{
                  patientName: 'Robert Smith',
                  discipline: 'PT',
                  date: '2024-03-12',
                  time: '2:00 PM',
                }}
                onOverrideBlocker={(type) => alert(`Override blocker: ${type} (requires supervisor approval)`)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
