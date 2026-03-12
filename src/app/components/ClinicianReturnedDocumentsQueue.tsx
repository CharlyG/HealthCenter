/**
 * Clinician Returned Documents Queue Component
 * 
 * Queue displaying documents returned to clinicians for correction.
 * Shows clear explanation of required corrections, issue categories,
 * correction instructions, and allows clinicians to view and correct
 * documents.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertTriangle,
  Clock,
  ChevronRight,
  Eye,
  Calendar,
  User,
  FileText,
  Flag,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { QAReviewItem } from './QACenterWorkspace';
import type {
  ReturnMetadata,
  IdentifiedIssue,
  IssueCategory,
  IssueSeverity,
} from './ReturnForCorrectionWorkflow';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ReturnedDocument {
  item: QAReviewItem;
  returnMetadata: ReturnMetadata;
  returnedDaysAgo: number;
  isOverdue: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const ISSUE_CATEGORY_CONFIG: Record<
  IssueCategory,
  { label: string; icon: string; color: string }
> = {
  'missing-information': { label: 'Missing Information', icon: '📋', color: 'amber' },
  'incorrect-data': { label: 'Incorrect Data', icon: '❌', color: 'red' },
  'compliance-failure': { label: 'Compliance Failure', icon: '⚠️', color: 'red' },
  'signature-required': { label: 'Signature Required', icon: '✍️', color: 'purple' },
  'clinical-accuracy': { label: 'Clinical Accuracy', icon: '🔍', color: 'orange' },
  'documentation-quality': { label: 'Documentation Quality', icon: '📝', color: 'blue' },
  'billing-impact': { label: 'Billing Impact', icon: '💰', color: 'red' },
};

const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { label: string; bgClass: string; textClass: string }
> = {
  critical: { label: 'Critical', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  major: { label: 'Major', bgClass: 'bg-orange-100', textClass: 'text-orange-700' },
  minor: { label: 'Minor', bgClass: 'bg-yellow-100', textClass: 'text-yellow-700' },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ClinicianReturnedDocumentsQueueProps {
  documents: ReturnedDocument[];
  currentClinician: string;
  onOpenDocument: (document: ReturnedDocument) => void;
  onMarkAsRead?: (documentId: string) => void;
}

export default function ClinicianReturnedDocumentsQueue({
  documents,
  currentClinician,
  onOpenDocument,
  onMarkAsRead,
}: ClinicianReturnedDocumentsQueueProps) {
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'severity'>('priority');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'normal'>('all');

  // Sort and filter documents
  const sortedDocuments = [...documents]
    .filter((doc) => filterPriority === 'all' || doc.returnMetadata.priority === filterPriority)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, normal: 2 };
        return (
          priorityOrder[a.returnMetadata.priority] - priorityOrder[b.returnMetadata.priority]
        );
      } else if (sortBy === 'date') {
        return (
          new Date(b.returnMetadata.returnedAt).getTime() -
          new Date(a.returnMetadata.returnedAt).getTime()
        );
      } else {
        // severity
        const getCriticalCount = (doc: ReturnedDocument) =>
          doc.returnMetadata.issues.filter((i) => i.severity === 'critical').length;
        return getCriticalCount(b) - getCriticalCount(a);
      }
    });

  const overdueCount = documents.filter((d) => d.isOverdue).length;
  const urgentCount = documents.filter((d) => d.returnMetadata.priority === 'urgent').length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Returned Documents</h1>
            <p className="text-sm text-gray-600 mt-1">
              Documents requiring your corrections
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard
            label="Total Returned"
            value={documents.length}
            icon={AlertTriangle}
            color="amber"
          />
          <SummaryCard label="Urgent" value={urgentCount} icon={Flag} color="red" />
          <SummaryCard label="Overdue" value={overdueCount} icon={Clock} color="red" />
          <SummaryCard
            label="Avg Issues"
            value={
              documents.length > 0
                ? Math.round(
                    documents.reduce((sum, d) => sum + d.returnMetadata.issues.length, 0) /
                      documents.length
                  )
                : 0
            }
            icon={FileText}
            color="blue"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="priority">Priority</option>
              <option value="date">Return Date</option>
              <option value="severity">Issue Severity</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Filter:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Only</option>
              <option value="high">High Only</option>
              <option value="normal">Normal Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue */}
      <div className="flex-1 overflow-auto p-6">
        {sortedDocuments.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {sortedDocuments.map((document) => (
              <ReturnedDocumentCard
                key={document.item.id}
                document={document}
                onOpen={() => onOpenDocument(document)}
                onMarkAsRead={() => onMarkAsRead?.(document.item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY CARD
// ═══════════════════════════════════════════════════════════════════════════

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            colorClasses[color as keyof typeof colorClasses]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RETURNED DOCUMENT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ReturnedDocumentCardProps {
  document: ReturnedDocument;
  onOpen: () => void;
  onMarkAsRead?: () => void;
}

function ReturnedDocumentCard({ document, onOpen, onMarkAsRead }: ReturnedDocumentCardProps) {
  const { item, returnMetadata, returnedDaysAgo, isOverdue } = document;
  const [expanded, setExpanded] = useState(false);

  const criticalIssues = returnMetadata.issues.filter((i) => i.severity === 'critical');
  const majorIssues = returnMetadata.issues.filter((i) => i.severity === 'major');
  const minorIssues = returnMetadata.issues.filter((i) => i.severity === 'minor');

  return (
    <Card
      className={cn(
        'transition-all',
        isOverdue && 'border-l-4 border-l-red-500',
        returnMetadata.priority === 'urgent' && !isOverdue && 'border-l-4 border-l-orange-500'
      )}
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Priority/Status Indicator */}
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>

          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{item.patientName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{item.documentType}</span>
                  <span>•</span>
                  <span>{item.admissionId}</span>
                  {item.visitDate && (
                    <>
                      <span>•</span>
                      <span>Visit: {new Date(item.visitDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>

              <Button size="sm" onClick={onOpen}>
                <Eye className="w-4 h-4 mr-2" />
                Open & Correct
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Return Info */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Returned by:</span>
                <span className="font-medium text-gray-900">{returnMetadata.returnedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {returnedDaysAgo === 0
                    ? 'Today'
                    : returnedDaysAgo === 1
                    ? 'Yesterday'
                    : `${returnedDaysAgo} days ago`}
                </span>
              </div>
              {returnMetadata.dueDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Due:</span>
                  <span
                    className={cn(
                      'font-medium',
                      isOverdue ? 'text-red-700' : 'text-gray-900'
                    )}
                  >
                    {new Date(returnMetadata.dueDate).toLocaleDateString()}
                    {isOverdue && ' (Overdue)'}
                  </span>
                </div>
              )}
            </div>

            {/* Priority and Issue Count */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  returnMetadata.priority === 'urgent'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : returnMetadata.priority === 'high'
                    ? 'bg-orange-100 text-orange-700 border-orange-300'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                )}
              >
                <Flag className="w-3 h-3 mr-1" />
                {returnMetadata.priority.charAt(0).toUpperCase() + returnMetadata.priority.slice(1)}{' '}
                Priority
              </Badge>

              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                {returnMetadata.issues.length} issue{returnMetadata.issues.length !== 1 ? 's' : ''}
              </Badge>

              {criticalIssues.length > 0 && (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                  {criticalIssues.length} critical
                </Badge>
              )}

              {isOverdue && (
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>

            {/* Return Reason */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Return Reason</span>
              </div>
              <p className="text-sm text-amber-800">{returnMetadata.returnReason}</p>
            </div>

            {/* Issue Summary */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {expanded ? 'Hide' : 'Show'} Detailed Issues ({returnMetadata.issues.length})
              <ChevronRight
                className={cn('w-4 h-4 transition-transform', expanded && 'rotate-90')}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Issues */}
      {expanded && (
        <div className="border-t bg-gray-50 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Issues Requiring Correction</h4>
          <div className="space-y-3">
            {returnMetadata.issues.map((issue, index) => (
              <IssueDetailCard key={issue.id} issue={issue} index={index + 1} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE DETAIL CARD
// ═══════════════════════════════════════════════════════════════════════════

function IssueDetailCard({ issue, index }: { issue: IdentifiedIssue; index: number }) {
  const categoryConfig = ISSUE_CATEGORY_CONFIG[issue.category];
  const severityConfig = SEVERITY_CONFIG[issue.severity];

  return (
    <Card className="p-4 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {index}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{categoryConfig.icon}</span>
            <span className="font-semibold text-gray-900">{categoryConfig.label}</span>
            <Badge variant="outline" className={cn('text-xs', severityConfig.bgClass, severityConfig.textClass)}>
              {severityConfig.label}
            </Badge>
          </div>

          {(issue.sectionName || issue.fieldName) && (
            <div className="text-sm text-gray-600 mb-2">
              {issue.sectionName && (
                <span>
                  <strong>Section:</strong> {issue.sectionName}
                </span>
              )}
              {issue.sectionName && issue.fieldName && ' • '}
              {issue.fieldName && (
                <span>
                  <strong>Field:</strong> {issue.fieldName}
                </span>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="font-semibold text-red-900 mb-1">Issue:</div>
              <p className="text-red-800">{issue.description}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="font-semibold text-blue-900 mb-1">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Correction Required:
              </div>
              <p className="text-blue-800">{issue.correctionInstruction}</p>
            </div>

            {issue.reviewerComment && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="font-semibold text-gray-900 mb-1">Reviewer Note:</div>
                <p className="text-gray-700 italic">{issue.reviewerComment}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">No Returned Documents</h3>
      <p className="text-sm text-gray-600">
        You have no documents requiring corrections at this time.
      </p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockReturnedDocuments(): ReturnedDocument[] {
  const baseDate = new Date();

  return [
    {
      item: {
        id: 'doc-1',
        documentId: 'VN-2024-445',
        documentType: 'visit-note',
        patientId: 'PAT-001',
        patientName: 'Margaret Johnson',
        admissionId: 'ADM-12345',
        clinicianId: 'CLN-101',
        clinicianName: 'Emily Chen, RN',
        visitDate: '2024-12-13',
        submittedDate: '2024-12-13T16:30:00Z',
        status: 'returned',
        priority: 'urgent',
        daysInQueue: 2,
        complianceScore: 75,
        flagCount: 3,
        flags: ['Missing vital signs', 'Incomplete assessment'],
        requiresSignature: true,
        billingImpact: true,
      },
      returnMetadata: {
        returnedBy: 'Jane Smith, QA Reviewer',
        returnedAt: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        returnReason:
          'Multiple required sections are incomplete or contain inaccurate information. Please review and correct all identified issues before resubmitting.',
        issues: [
          {
            id: 'issue-1',
            category: 'missing-information',
            severity: 'critical',
            sectionName: 'Vital Signs',
            fieldName: 'Blood Pressure',
            description: 'Blood pressure measurement is not recorded',
            correctionInstruction:
              'Enter the blood pressure reading taken during this visit. If not measured, document the reason.',
          },
          {
            id: 'issue-2',
            category: 'incorrect-data',
            severity: 'major',
            sectionName: 'Medication Review',
            description: 'Medication list appears outdated',
            correctionInstruction:
              'Verify all medications with patient and update the list. Ensure dosages and frequencies are current.',
            reviewerComment:
              'Patient reported adding new medication during recent hospital stay.',
          },
          {
            id: 'issue-3',
            category: 'documentation-quality',
            severity: 'minor',
            sectionName: 'Assessment',
            description: 'Clinical assessment lacks sufficient detail',
            correctionInstruction:
              'Expand assessment to include specific observations about wound healing progress and patient response to treatment.',
          },
        ],
        priority: 'urgent',
        dueDate: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      returnedDaysAgo: 2,
      isOverdue: false,
    },
    {
      item: {
        id: 'doc-2',
        documentId: '485-2024-078',
        documentType: '485',
        patientId: 'PAT-003',
        patientName: 'Patricia Davis',
        admissionId: 'ADM-12347',
        clinicianId: 'CLN-103',
        clinicianName: 'Michael Chen, RN',
        visitDate: undefined,
        submittedDate: '2024-12-10T10:15:00Z',
        status: 'returned',
        priority: 'high',
        daysInQueue: 5,
        complianceScore: 68,
        flagCount: 5,
        flags: ['Missing functional limitations', 'Incomplete medication list'],
        requiresSignature: true,
        billingImpact: true,
      },
      returnMetadata: {
        returnedBy: 'Jane Smith, QA Reviewer',
        returnedAt: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        returnReason:
          'Plan of Care (485) does not meet CMS requirements. Multiple critical sections are missing or incomplete.',
        issues: [
          {
            id: 'issue-4',
            category: 'compliance-failure',
            severity: 'critical',
            sectionName: 'Functional Limitations',
            description: 'Functional limitations section is not completed',
            correctionInstruction:
              'Complete all applicable functional limitation checkboxes based on your assessment of the patient.',
          },
          {
            id: 'issue-5',
            category: 'compliance-failure',
            severity: 'critical',
            sectionName: 'Goals',
            description: 'Goals are not SMART (Specific, Measurable, Achievable, Relevant, Time-bound)',
            correctionInstruction:
              'Revise goals to be specific and measurable. Include target dates and clear success criteria.',
          },
          {
            id: 'issue-6',
            category: 'missing-information',
            severity: 'critical',
            sectionName: 'Safety Measures',
            description: 'Safety measures not documented',
            correctionInstruction:
              'Document all safety measures in place for this patient (fall precautions, infection control, etc.).',
          },
          {
            id: 'issue-7',
            category: 'billing-impact',
            severity: 'critical',
            sectionName: 'Orders',
            description: 'Physician orders incomplete',
            correctionInstruction:
              'Ensure all required physician orders are included with frequencies and start dates.',
          },
        ],
        priority: 'high',
        dueDate: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      returnedDaysAgo: 6,
      isOverdue: true,
    },
  ];
}
