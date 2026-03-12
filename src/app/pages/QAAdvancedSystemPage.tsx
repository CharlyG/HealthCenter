/**
 * QA Advanced System Demo Page
 * 
 * Comprehensive demo including:
 * - Operational Alerts
 * - Reviewer Shortcuts
 * - Admission QA Status Cards
 * - Care Ops QA Integration
 * - Document Escalation Workflow
 * - Reviewer Assignment Workflow
 * - Document Comparison Tool
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  ArrowLeft,
  Bell,
  Zap,
  Eye,
  AlertTriangle,
  Users,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  ChevronRight,
  Clock,
  User,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';
import QAOperationalAlerts, { generateMockQAAlerts, QAAlert } from '../components/QAOperationalAlerts';
import QAReviewerShortcuts, {
  generateMockShortcutsData,
  QAReviewerShortcutsData,
} from '../components/QAReviewerShortcuts';
import AdmissionQAStatusCards, {
  generateMockAdmissionQAStatus,
} from '../components/AdmissionQAStatusCards';

export default function QAAdvancedSystemPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<
    'alerts' | 'shortcuts' | 'admission' | 'careops' | 'escalation' | 'assignment' | 'comparison'
  >('alerts');

  // Alerts state
  const [alerts, setAlerts] = useState<QAAlert[]>(generateMockQAAlerts());

  // Shortcuts state
  const [shortcutsData] = useState<QAReviewerShortcutsData>(generateMockShortcutsData());

  // Admission QA state
  const [admissionQAData] = useState(generateMockAdmissionQAStatus());

  // Escalation state
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalationRecipient, setEscalationRecipient] = useState<'supervisor' | 'admin' | null>(null);

  // Assignment state
  const [reviewers] = useState([
    { id: 'rev-1', name: 'Jane Smith', workload: 12, capacity: 20, avgTurnaround: 3.5 },
    { id: 'rev-2', name: 'Bob Johnson', workload: 18, capacity: 20, avgTurnaround: 4.0 },
    { id: 'rev-3', name: 'Sarah Williams', workload: 8, capacity: 15, avgTurnaround: 5.2 },
    { id: 'rev-4', name: 'Mike Davis', workload: 5, capacity: 15, avgTurnaround: 4.5 },
  ]);
  const [selectedReviewer, setSelectedReviewer] = useState<string | null>(null);

  // Comparison state
  const [comparisonData] = useState({
    documentId: 'VN-2024-445',
    documentType: 'Visit Note',
    patientName: 'Margaret Johnson',
    originalVersion: {
      timestamp: '2024-12-08 14:30',
      submittedBy: 'Emily Chen, RN',
      fields: {
        bloodPressure: '',
        heartRate: '78',
        temperature: '98.6',
        assessment: 'Patient stable, wound healing well.',
        medications: 'Metformin 500mg BID, Lisinopril 10mg daily',
      },
    },
    correctedVersion: {
      timestamp: '2024-12-10 09:15',
      submittedBy: 'Emily Chen, RN',
      fields: {
        bloodPressure: '128/82',
        heartRate: '78',
        temperature: '98.6',
        assessment:
          'Patient stable, ambulatory with walker. Wound healing well with good granulation tissue. Wound size decreased from 2.5cm x 3.0cm to 2.0cm x 2.5cm. No signs of infection. Patient verbalized understanding of wound care instructions.',
        medications:
          'Metformin 500mg BID, Lisinopril 10mg daily, Aspirin 81mg daily (added post-hospital discharge 12/5)',
      },
    },
  });

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)));
  };

  const handleAlertAction = (alertId: string, route?: string) => {
    console.log('Navigate to:', route);
    alert(`Navigate to: ${route || 'default route'}`);
  };

  const handleApproveAndNext = () => {
    alert('Document approved! Moving to next document...');
  };

  const handleReturnWithTemplate = (templateId: string) => {
    alert(`Returning document with template: ${templateId}`);
  };

  const handleJumpToError = (errorId: string) => {
    alert(`Jumping to validation error: ${errorId}`);
  };

  const handleViewAdmissionSummary = () => {
    alert('Opening full admission summary...');
  };

  const handleViewQueue = (queue: string) => {
    console.log('View queue:', queue);
    alert(`Opening ${queue} queue...`);
  };

  const handleEscalate = () => {
    if (!escalationRecipient || !escalationReason) {
      alert('Please select recipient and provide reason');
      return;
    }
    alert(`Escalating to ${escalationRecipient}: ${escalationReason}`);
    setShowEscalation(false);
    setEscalationReason('');
    setEscalationRecipient(null);
  };

  const handleAssignReviewer = (documentId: string, reviewerId: string) => {
    alert(`Assigning document ${documentId} to reviewer ${reviewerId}`);
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
                <h1 className="text-xl font-bold text-gray-900">QA Advanced System</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Alerts, Shortcuts, Integration & Workflows
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* View Selector */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Select Feature</h2>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="alerts">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="shortcuts">
                <Zap className="w-4 h-4 mr-2" />
                Shortcuts
              </TabsTrigger>
              <TabsTrigger value="admission">
                <Eye className="w-4 h-4 mr-2" />
                Admission QA
              </TabsTrigger>
              <TabsTrigger value="careops">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Care Ops
              </TabsTrigger>
              <TabsTrigger value="escalation">
                <Send className="w-4 h-4 mr-2" />
                Escalation
              </TabsTrigger>
              <TabsTrigger value="assignment">
                <Users className="w-4 h-4 mr-2" />
                Assignment
              </TabsTrigger>
              <TabsTrigger value="comparison">
                <FileText className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Operational Alerts */}
        {activeView === 'alerts' && (
          <div className="space-y-6">
            <FeatureIntro
              title="QA Operational Alerts"
              description="Automated alerts for QA workflows including documents pending too long, repeatedly returned, overdue, and compliance issues. Appear in command center and QA dashboard."
              features={[
                '4 alert types (Pending/Repeated/Overdue/Compliance)',
                'Severity levels (Critical/Warning/Info)',
                'Affected document count',
                'Metadata (days overdue, return count, etc.)',
                'Quick action buttons with routes',
                'Dismissable alerts',
                'Compact mode for sidebars',
              ]}
            />

            <QAOperationalAlerts
              alerts={alerts}
              onDismiss={handleDismissAlert}
              onAction={handleAlertAction}
              mode="full"
            />

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode</h3>
              <QAOperationalAlerts
                alerts={alerts}
                onDismiss={handleDismissAlert}
                onAction={handleAlertAction}
                mode="compact"
              />
            </Card>
          </div>
        )}

        {/* Reviewer Shortcuts */}
        {activeView === 'shortcuts' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Shortcuts Sidebar */}
            <div>
              <QAReviewerShortcuts
                data={shortcutsData}
                onApproveAndNext={handleApproveAndNext}
                onReturnWithTemplate={handleReturnWithTemplate}
                onJumpToError={handleJumpToError}
                onViewAdmissionSummary={handleViewAdmissionSummary}
                mode="full"
              />
            </div>

            {/* Content */}
            <div className="col-span-2 space-y-6">
              <FeatureIntro
                title="QA Reviewer Productivity Shortcuts"
                description="Keyboard shortcuts and quick actions to help reviewers process documents efficiently."
                features={[
                  'Approve & Move to Next (Ctrl+A)',
                  'Return with Template Comment (Ctrl+R)',
                  'Jump to Next Validation Error (Ctrl+E)',
                  'View Admission Summary (Ctrl+I)',
                  'Template categories & filtering',
                  'Error navigation with severity',
                  'Compact sidebar mode',
                ]}
              />

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sidebar Mode</h3>
                <div className="max-w-xs">
                  <QAReviewerShortcuts
                    data={shortcutsData}
                    onApproveAndNext={handleApproveAndNext}
                    onReturnWithTemplate={handleReturnWithTemplate}
                    onJumpToError={handleJumpToError}
                    onViewAdmissionSummary={handleViewAdmissionSummary}
                    mode="sidebar"
                  />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Admission QA Status */}
        {activeView === 'admission' && (
          <div className="space-y-6">
            <FeatureIntro
              title="Admission QA Status Cards"
              description="QA status cards for admission dashboard showing documents in various QA states with quick links to queues."
              features={[
                '3 status cards (Pending/Returned/Approved)',
                'Document lists with metadata',
                'Priority indicators',
                'Days in queue tracking',
                'Assigned reviewer display',
                'Quick links to QA queues',
                'Compact mode for widgets',
              ]}
            />

            <AdmissionQAStatusCards
              data={admissionQAData}
              onViewQueue={handleViewQueue}
              mode="full"
            />

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode</h3>
              <div className="max-w-sm">
                <AdmissionQAStatusCards
                  data={admissionQAData}
                  onViewQueue={handleViewQueue}
                  mode="compact"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Care Ops Integration */}
        {activeView === 'careops' && (
          <div className="space-y-6">
            <FeatureIntro
              title="Care Operations Command Center QA Integration"
              description="QA alerts integrated into Care Ops Command Center for administrator oversight."
              features={[
                'High volume pending review alerts',
                'Repeated corrections by clinician',
                'Documentation backlog warnings',
                'Real-time operational metrics',
                'Quick action navigation',
                'Role-based alert visibility',
              ]}
            />

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Care Ops Command Center - QA Alerts Section
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="font-semibold text-gray-900">QA Operational Alerts</span>
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 ml-auto">
                    3 Critical
                  </Badge>
                </div>

                <div className="space-y-2">
                  <CareOpsAlertCard
                    icon={TrendingUp}
                    title="High Volume: Pending QA Reviews"
                    message="42 documents pending review, 12 over 48 hours"
                    severity="warning"
                    actionLabel="View QA Dashboard"
                  />
                  <CareOpsAlertCard
                    icon={Users}
                    title="Repeated Corrections: John Davis, RN"
                    message="5 documents returned this week, consider training"
                    severity="warning"
                    actionLabel="View Clinician Profile"
                  />
                  <CareOpsAlertCard
                    icon={Clock}
                    title="Documentation Backlog Alert"
                    message="18 documents overdue for correction"
                    severity="critical"
                    actionLabel="View Overdue Queue"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600">
                These alerts appear in the main Care Operations Command Center dashboard alongside other
                operational metrics, giving administrators visibility into QA bottlenecks and quality issues.
              </p>
            </Card>
          </div>
        )}

        {/* Escalation Workflow */}
        {activeView === 'escalation' && (
          <div className="space-y-6">
            <FeatureIntro
              title="Document Escalation Workflow"
              description="Escalation system for documents repeatedly returned or overdue, allowing escalation to supervisors or administrators."
              features={[
                'Escalate to Clinical Supervisor',
                'Escalate to Administrator',
                'Escalation reason tracking',
                'Resolution step logging',
                'Automated triggers (3+ returns, 5+ days overdue)',
                'Escalation history timeline',
              ]}
            />

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Document Escalation</h3>

              {!showEscalation ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold text-amber-900">Escalation Recommended</span>
                    </div>
                    <p className="text-sm text-amber-800">
                      Visit Note VN-2024-556 has been returned for correction 3 times and is now 5 days
                      overdue. Consider escalating to clinical supervisor.
                    </p>
                  </div>

                  <Button onClick={() => setShowEscalation(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Escalate Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escalate To
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setEscalationRecipient('supervisor')}
                        className={cn(
                          'p-3 border rounded-lg text-left transition-all',
                          escalationRecipient === 'supervisor'
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="font-medium text-gray-900">Clinical Supervisor</div>
                        <div className="text-xs text-gray-600">Sarah Johnson, RN BSN</div>
                      </button>
                      <button
                        onClick={() => setEscalationRecipient('admin')}
                        className={cn(
                          'p-3 border rounded-lg text-left transition-all',
                          escalationRecipient === 'admin'
                            ? 'bg-blue-50 border-blue-300'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="font-medium text-gray-900">Administrator</div>
                        <div className="text-xs text-gray-600">Michael Brown, Director</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Escalation Reason
                    </label>
                    <Textarea
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      placeholder="Describe why this document requires escalation..."
                      className="h-24"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleEscalate}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Escalation
                    </Button>
                    <Button variant="outline" onClick={() => setShowEscalation(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Escalation History */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Escalation History</h4>
                <div className="space-y-3">
                  <EscalationHistoryItem
                    timestamp="2024-12-09 10:30"
                    action="Escalated to Clinical Supervisor"
                    user="Jane Smith, QA Reviewer"
                    reason="Document returned 3 times with same issues"
                  />
                  <EscalationHistoryItem
                    timestamp="2024-12-09 14:45"
                    action="Supervisor reviewed and assigned mentor"
                    user="Sarah Johnson, Clinical Supervisor"
                    reason="Assigned senior RN to mentor clinician on documentation"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Reviewer Assignment */}
        {activeView === 'assignment' && (
          <div className="space-y-6">
            <FeatureIntro
              title="Reviewer Assignment Workflow"
              description="Assign documents to specific QA reviewers and balance workloads across the team."
              features={[
                'Workload tracking per reviewer',
                'Capacity management',
                'Average turnaround metrics',
                'Manual assignment interface',
                'Automatic load balancing suggestions',
                'Reviewer performance indicators',
              ]}
            />

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Assign Document to Reviewer</h3>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-medium text-blue-900 mb-1">
                    Visit Note VN-2024-445 • Margaret Johnson
                  </div>
                  <div className="text-sm text-blue-700">
                    Submitted 2 hours ago • Priority: Normal
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {reviewers.map((reviewer) => {
                  const workloadPercent = (reviewer.workload / reviewer.capacity) * 100;
                  const isSelected = selectedReviewer === reviewer.id;

                  return (
                    <button
                      key={reviewer.id}
                      onClick={() => setSelectedReviewer(reviewer.id)}
                      className={cn(
                        'w-full text-left p-4 border rounded-lg transition-all',
                        isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{reviewer.name}</div>
                            <div className="text-xs text-gray-600">
                              {reviewer.avgTurnaroundh avg turnaround
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {reviewer.workload} / {reviewer.capacity}
                            </div>
                            <div className="text-xs text-gray-600">Current / Capacity</div>
                          </div>
                          {workloadPercent >= 90 && (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-700 border-red-300 text-xs"
                            >
                              At Capacity
                            </Badge>
                          )}
                          {workloadPercent < 50 && (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-700 border-green-300 text-xs"
                            >
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            workloadPercent >= 90
                              ? 'bg-red-500'
                              : workloadPercent >= 70
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          )}
                          style={{ width: `${workloadPercent}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => selectedReviewer && handleAssignReviewer('VN-2024-445', selectedReviewer)}
                disabled={!selectedReviewer}
                className="w-full mt-4"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Assign to Selected Reviewer
              </Button>
            </Card>
          </div>
        )}

        {/* Document Comparison */}
        {activeView === 'comparison' && (
          <div className="space-y-6">
            <FeatureIntro
              title="Document Comparison Tool"
              description="Compare original and corrected versions of documents with highlighted changes."
              features={[
                'Side-by-side comparison view',
                'Field-level change highlighting',
                'Added content (green highlight)',
                'Modified content (yellow highlight)',
                'Removed content (red strikethrough)',
                'Timestamp and submitter tracking',
              ]}
            />

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Document Comparison</h3>
                  <p className="text-sm text-gray-600">
                    {comparisonData.documentType} • {comparisonData.patientName}
                  </p>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  {comparisonData.documentId}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Original Version */}
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-t-lg p-3">
                    <div className="font-semibold text-red-900">Original Version</div>
                    <div className="text-xs text-red-700">
                      {comparisonData.originalVersion.timestamp} •{' '}
                      {comparisonData.originalVersion.submittedBy}
                    </div>
                  </div>
                  <div className="border border-t-0 rounded-b-lg p-4 space-y-4">
                    <ComparisonField
                      label="Blood Pressure"
                      value={comparisonData.originalVersion.fields.bloodPressure}
                      empty
                    />
                    <ComparisonField
                      label="Heart Rate"
                      value={comparisonData.originalVersion.fields.heartRate}
                    />
                    <ComparisonField
                      label="Temperature"
                      value={comparisonData.originalVersion.fields.temperature}
                    />
                    <ComparisonField
                      label="Assessment"
                      value={comparisonData.originalVersion.fields.assessment}
                    />
                    <ComparisonField
                      label="Medications"
                      value={comparisonData.originalVersion.fields.medications}
                    />
                  </div>
                </div>

                {/* Corrected Version */}
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-t-lg p-3">
                    <div className="font-semibold text-green-900">Corrected Version</div>
                    <div className="text-xs text-green-700">
                      {comparisonData.correctedVersion.timestamp} •{' '}
                      {comparisonData.correctedVersion.submittedBy}
                    </div>
                  </div>
                  <div className="border border-t-0 rounded-b-lg p-4 space-y-4">
                    <ComparisonField
                      label="Blood Pressure"
                      value={comparisonData.correctedVersion.fields.bloodPressure}
                      changed
                    />
                    <ComparisonField
                      label="Heart Rate"
                      value={comparisonData.correctedVersion.fields.heartRate}
                    />
                    <ComparisonField
                      label="Temperature"
                      value={comparisonData.correctedVersion.fields.temperature}
                    />
                    <ComparisonField
                      label="Assessment"
                      value={comparisonData.correctedVersion.fields.assessment}
                      changed
                    />
                    <ComparisonField
                      label="Medications"
                      value={comparisonData.correctedVersion.fields.medications}
                      changed
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                  <span className="text-gray-600">Added/Changed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
                  <span className="text-gray-600">Missing/Empty</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components

function FeatureIntro({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <Card className="p-6">
      <h2 className="font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm">Key Features:</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          {features.map((feature, idx) => (
            <li key={idx}>• {feature}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function CareOpsAlertCard({
  icon: Icon,
  title,
  message,
  severity,
  actionLabel,
}: {
  icon: any;
  title: string;
  message: string;
  severity: 'critical' | 'warning';
  actionLabel: string;
}) {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4',
        severity === 'critical'
          ? 'bg-red-50 border-red-500'
          : 'bg-amber-50 border-amber-500'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            'w-5 h-5 flex-shrink-0 mt-0.5',
            severity === 'critical' ? 'text-red-600' : 'text-amber-600'
          )}
        />
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">{title}</div>
          <div className="text-sm text-gray-700 mb-2">{message}</div>
          <Button variant="outline" size="sm">
            {actionLabel}
            <ChevronRight className="w-3 h-3 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function EscalationHistoryItem({
  timestamp,
  action,
  user,
  reason,
}: {
  timestamp: string;
  action: string;
  user: string;
  reason: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">{action}</span>
          <span className="text-xs text-gray-600">{timestamp}</span>
        </div>
        <div className="text-sm text-gray-700 mb-1">{user}</div>
        <div className="text-sm text-gray-600">{reason}</div>
      </div>
    </div>
  );
}

function ComparisonField({
  label,
  value,
  changed,
  empty,
}: {
  label: string;
  value: string;
  changed?: boolean;
  empty?: boolean;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
      <div
        className={cn(
          'p-2 rounded border text-sm',
          changed && 'bg-green-100 border-green-300',
          empty && 'bg-red-100 border-red-300 text-red-700 italic',
          !changed && !empty && 'bg-white border-gray-200'
        )}
      >
        {value || '(empty)'}
      </div>
    </div>
  );
}
