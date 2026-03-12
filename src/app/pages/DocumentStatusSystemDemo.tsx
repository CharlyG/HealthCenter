/**
 * Clinical Document Status System Demo
 * 
 * Comprehensive demonstration of the document status tracking system
 * Features: Status badges, timeline, tracker dashboard, transitions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  DocumentStatusBadge,
  DocumentStatusTimeline,
  DocumentStatusTracker,
  StatusTransitionSelector,
  StatusProgressBar
} from '../components/documentation/DocumentStatusComponents';
import {
  DocumentStatus,
  StatusChangeEvent,
  DOCUMENT_STATUS_CONFIGS,
  validateStatusTransition,
  createStatusChangeEvent,
  calculateStatusMetrics,
  getStatusConfig
} from '../lib/documentStatusSystem';
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  BarChart3
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

// Mock clinical documents
const MOCK_DOCUMENTS = [
  {
    id: 'doc-001',
    title: 'OASIS-E Start of Care - Margaret Thompson',
    type: 'OASIS Assessment',
    status: 'in_progress' as DocumentStatus,
    assignedTo: 'Maria Santos, RN',
    dueDate: '2026-03-14',
    createdAt: '2026-03-09T08:00:00Z',
  },
  {
    id: 'doc-002',
    title: 'PT Evaluation - William Rodriguez',
    type: 'PT Evaluation',
    status: 'completed' as DocumentStatus,
    assignedTo: 'Alex Chen, PT',
    dueDate: '2026-03-10',
    createdAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'doc-003',
    title: 'Skilled Nursing Visit Note - Dorothy Williams',
    type: 'SN Visit Note',
    status: 'returned_for_correction' as DocumentStatus,
    assignedTo: 'Jennifer Adams, RN',
    dueDate: '2026-03-09',
    createdAt: '2026-03-08T14:00:00Z',
  },
  {
    id: 'doc-004',
    title: 'ST Evaluation - Eleanor Patterson',
    type: 'ST Evaluation',
    status: 'approved' as DocumentStatus,
    assignedTo: 'Michael Chen, SLP',
    dueDate: '2026-03-08',
    createdAt: '2026-03-04T09:00:00Z',
  },
  {
    id: 'doc-005',
    title: 'Plan of Care - Robert Martinez',
    type: 'Plan of Care',
    status: 'signed' as DocumentStatus,
    assignedTo: 'Sarah Kim, RN',
    dueDate: '2026-03-05',
    createdAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 'doc-006',
    title: 'OASIS-E Follow-Up - James Wilson',
    type: 'OASIS Assessment',
    status: 'draft' as DocumentStatus,
    assignedTo: 'Maria Santos, RN',
    dueDate: '2026-03-15',
    createdAt: '2026-03-09T16:00:00Z',
  },
  {
    id: 'doc-007',
    title: 'PT Progress Note - Margaret Thompson',
    type: 'PT Progress Note',
    status: 'corrected' as DocumentStatus,
    assignedTo: 'Alex Chen, PT',
    dueDate: '2026-03-12',
    createdAt: '2026-03-07T13:00:00Z',
  },
];

// Mock status change events
const MOCK_STATUS_EVENTS: StatusChangeEvent[] = [
  {
    id: 'evt-001',
    documentId: 'doc-002',
    documentType: 'PT Evaluation',
    previousStatus: 'in_progress',
    newStatus: 'completed',
    changedBy: 'user-pt-001',
    changedByName: 'Alex Chen',
    changedByRole: 'Physical Therapist',
    changedAt: '2026-03-09T15:30:00Z',
    comment: 'Completed all sections of PT evaluation. Patient demonstrates good rehabilitation potential.'
  },
  {
    id: 'evt-002',
    documentId: 'doc-002',
    documentType: 'PT Evaluation',
    previousStatus: 'draft',
    newStatus: 'in_progress',
    changedBy: 'user-pt-001',
    changedByName: 'Alex Chen',
    changedByRole: 'Physical Therapist',
    changedAt: '2026-03-05T10:15:00Z',
  },
  {
    id: 'evt-003',
    documentId: 'doc-003',
    documentType: 'SN Visit Note',
    previousStatus: 'completed',
    newStatus: 'returned_for_correction',
    changedBy: 'user-supervisor-002',
    changedByName: 'Linda Martinez',
    changedByRole: 'Clinical Supervisor',
    changedAt: '2026-03-09T09:20:00Z',
    comment: 'Please add more detail to medication reconciliation section. Clarify patient response to new diabetic medication.',
    reason: 'Insufficient detail in medication section'
  },
  {
    id: 'evt-004',
    documentId: 'doc-003',
    documentType: 'SN Visit Note',
    previousStatus: 'in_progress',
    newStatus: 'completed',
    changedBy: 'user-rn-003',
    changedByName: 'Jennifer Adams',
    changedByRole: 'Registered Nurse',
    changedAt: '2026-03-08T16:45:00Z',
  },
];

export default function DocumentStatusSystemDemo() {
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState(MOCK_DOCUMENTS[1]); // PT Evaluation (completed)
  const [statusEvents, setStatusEvents] = useState<StatusChangeEvent[]>(MOCK_STATUS_EVENTS);
  const [transitionComment, setTransitionComment] = useState('');
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [pendingTransition, setPendingTransition] = useState<DocumentStatus | null>(null);

  const handleStatusTransition = (newStatus: DocumentStatus) => {
    const request = {
      documentId: selectedDocument.id,
      currentStatus: selectedDocument.status,
      newStatus,
      userId: 'user-current',
      userName: 'Current User',
      userRole: 'Clinical Supervisor',
      comment: transitionComment,
    };

    const validation = validateStatusTransition(request);

    if (!validation.success) {
      alert(validation.error);
      return;
    }

    if (validation.requiresComment && !transitionComment) {
      setPendingTransition(newStatus);
      setShowTransitionDialog(true);
      return;
    }

    // Create event
    const event = createStatusChangeEvent(request);
    setStatusEvents([event, ...statusEvents]);

    // Update document status
    setSelectedDocument({
      ...selectedDocument,
      status: newStatus
    });

    // Reset
    setTransitionComment('');
    setShowTransitionDialog(false);
    setPendingTransition(null);

    alert(`Status changed to ${getStatusConfig(newStatus).label}`);
  };

  const confirmTransition = () => {
    if (pendingTransition) {
      handleStatusTransition(pendingTransition);
    }
  };

  const metrics = calculateStatusMetrics(MOCK_DOCUMENTS);

  const documentEvents = statusEvents.filter(e => e.documentId === selectedDocument.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Clinical Document Status System
              </h1>
              <p className="text-sm text-gray-600">
                Comprehensive status tracking and workflow management
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* System Overview */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Document Status Workflow</AlertTitle>
          <AlertDescription>
            Documents move through defined states: Draft → In Progress → Completed → Approved → Signed.
            Documents can be returned for correction at any point before signing.
          </AlertDescription>
        </Alert>

        {/* Tabs */}
        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tracker">
              <BarChart3 className="w-4 h-4 mr-2" />
              Status Tracker
            </TabsTrigger>
            <TabsTrigger value="document">
              <FileText className="w-4 h-4 mr-2" />
              Document Detail
            </TabsTrigger>
            <TabsTrigger value="badges">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Status Badges
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <TrendingUp className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Status Tracker Tab */}
          <TabsContent value="tracker" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Document Status Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Track all clinical documents organized by status category. Click any document to view details.
              </p>

              <DocumentStatusTracker
                documents={MOCK_DOCUMENTS}
                onDocumentClick={(docId) => {
                  const doc = MOCK_DOCUMENTS.find(d => d.id === docId);
                  if (doc) {
                    setSelectedDocument(doc);
                  }
                }}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Total Documents"
                  value={metrics.totalDocuments}
                  color="blue"
                />
                <StatCard
                  label="Needs Attention"
                  value={metrics.byStatus.returned_for_correction}
                  color="amber"
                />
                <StatCard
                  label="Completion Rate"
                  value={`${Math.round(metrics.completionRate)}%`}
                  color="green"
                />
                <StatCard
                  label="Signature Rate"
                  value={`${Math.round(metrics.signatureRate)}%`}
                  color="purple"
                />
              </div>
            </Card>
          </TabsContent>

          {/* Document Detail Tab */}
          <TabsContent value="document" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedDocument.title}
                    </h2>
                    <div className="text-sm text-gray-600">
                      {selectedDocument.type} • Assigned to {selectedDocument.assignedTo}
                    </div>
                  </div>
                  <DocumentStatusBadge status={selectedDocument.status} size="lg" />
                </div>

                <StatusProgressBar currentStatus={selectedDocument.status} className="mb-6" />
              </div>

              {/* Status Transition */}
              {!showTransitionDialog && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <StatusTransitionSelector
                    currentStatus={selectedDocument.status}
                    onTransition={handleStatusTransition}
                  />
                </div>
              )}

              {/* Transition Dialog */}
              {showTransitionDialog && (
                <Card className="p-6 mb-6 bg-amber-50 border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Comment Required
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    This status change requires a comment. Please provide details about the transition.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="comment">Comment *</Label>
                      <Textarea
                        id="comment"
                        value={transitionComment}
                        onChange={(e) => setTransitionComment(e.target.value)}
                        placeholder="Explain the reason for this status change..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={confirmTransition}>
                        Confirm Transition
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowTransitionDialog(false);
                          setPendingTransition(null);
                          setTransitionComment('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Status Timeline */}
              <DocumentStatusTimeline
                events={documentEvents}
                currentStatus={selectedDocument.status}
              />
            </Card>
          </TabsContent>

          {/* Status Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Status Badge Showcase
              </h2>
              <p className="text-gray-600 mb-6">
                Visual representation of all document statuses with consistent styling.
              </p>

              <div className="space-y-8">
                {/* All statuses */}
                {Object.values(DOCUMENT_STATUS_CONFIGS).map(config => (
                  <div key={config.status} className="space-y-3">
                    <div className="flex items-center gap-4">
                      <DocumentStatusBadge status={config.status} size="lg" />
                      <div>
                        <div className="font-semibold text-gray-900">{config.label}</div>
                        <div className="text-sm text-gray-600">{config.description}</div>
                      </div>
                    </div>
                    <div className="pl-4 border-l-2 border-gray-200">
                      <div className="text-sm text-gray-700">
                        <strong>Category:</strong> {config.category}
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong>Transitions to:</strong>{' '}
                        {config.allowedTransitions.length > 0
                          ? config.allowedTransitions.map(s => getStatusConfig(s).label).join(', ')
                          : 'Terminal state (no further transitions)'}
                      </div>
                      {config.requiresComment && (
                        <div className="text-sm text-amber-700">
                          ⚠️ Requires comment
                        </div>
                      )}
                      {config.requiresApprover && (
                        <div className="text-sm text-blue-700">
                          ℹ️ Requires approver role
                        </div>
                      )}
                      {config.isLocked && (
                        <div className="text-sm text-red-700">
                          🔒 Document is locked
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Badge Sizes
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-20">Small:</span>
                  <DocumentStatusBadge status="completed" size="sm" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-20">Medium:</span>
                  <DocumentStatusBadge status="completed" size="md" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-20">Large:</span>
                  <DocumentStatusBadge status="completed" size="lg" />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Document Status Metrics
              </h2>
              <p className="text-gray-600 mb-6">
                Analytics and insights into documentation workflow.
              </p>

              <div className="space-y-6">
                {/* Status Distribution */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Status Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(metrics.byStatus).map(([status, count]) => {
                      const config = getStatusConfig(status as DocumentStatus);
                      const percentage = (count / metrics.totalDocuments) * 100;
                      
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <DocumentStatusBadge status={status as DocumentStatus} size="sm" />
                              <span className="text-sm text-gray-700">{count} documents</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${config.color.dot}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Metrics */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                      label="Completion Rate"
                      value={`${Math.round(metrics.completionRate)}%`}
                      description="Documents completed or finalized"
                      color="green"
                    />
                    <MetricCard
                      label="Signature Rate"
                      value={`${Math.round(metrics.signatureRate)}%`}
                      description="Documents electronically signed"
                      color="purple"
                    />
                    <MetricCard
                      label="Return Rate"
                      value={`${((metrics.returnedCount / metrics.totalDocuments) * 100).toFixed(1)}%`}
                      description="Documents returned for correction"
                      color="amber"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            System Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Status Management</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>7 distinct status states with clear progression</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Validated status transitions with business rules</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Required comments for critical transitions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Locked state prevents modification after signing</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Tracking & Visibility</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Status timeline with complete audit trail</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Visual status badges for quick identification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Dashboard tracker organized by status category</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span>Progress indicators showing document completion</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'blue' | 'amber' | 'green' | 'purple';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    green: 'bg-green-50 text-green-900 border-green-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  color: 'green' | 'purple' | 'amber';
}

function MetricCard({ label, value, description, color }: MetricCardProps) {
  const colorClasses = {
    green: 'border-green-200',
    purple: 'border-purple-200',
    amber: 'border-amber-200',
  };

  return (
    <div className={`p-4 border-2 rounded-lg ${colorClasses[color]}`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </div>
  );
}
