/**
 * Clinician Feedback Panel Component
 * 
 * Panel showing QA review comments, correction instructions, and highlighted
 * fields needing updates for clinicians. Provides quick navigation to fields
 * requiring correction.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  User,
  Clock,
  ChevronRight,
  Edit,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { IdentifiedIssue, IssueSeverity, IssueCategory } from './ReturnForCorrectionWorkflow';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ReviewComment {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  timestamp: string;
  comment: string;
  type: 'general' | 'issue-specific';
  relatedIssueId?: string;
}

export interface FieldHighlight {
  fieldId: string;
  fieldName: string;
  sectionName: string;
  status: 'needs-correction' | 'optional' | 'completed';
  relatedIssueIds: string[];
}

export interface ClinicianFeedbackData {
  documentId: string;
  documentType: string;
  patientName: string;
  admissionId: string;
  returnedBy: string;
  returnedAt: string;
  returnReason: string;
  issues: IdentifiedIssue[];
  comments: ReviewComment[];
  fieldHighlights: FieldHighlight[];
  dueDate?: string;
  priority: 'urgent' | 'high' | 'normal';
  iteration: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { label: string; bgClass: string; textClass: string; icon: any }
> = {
  critical: {
    label: 'Critical',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    icon: AlertTriangle,
  },
  major: {
    label: 'Major',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    icon: AlertTriangle,
  },
  minor: {
    label: 'Minor',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    icon: AlertTriangle,
  },
};

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  'missing-information': 'Missing Information',
  'incorrect-data': 'Incorrect Data',
  'compliance-failure': 'Compliance Failure',
  'signature-required': 'Signature Required',
  'clinical-accuracy': 'Clinical Accuracy',
  'documentation-quality': 'Documentation Quality',
  'billing-impact': 'Billing Impact',
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ClinicianFeedbackPanelProps {
  data: ClinicianFeedbackData;
  onFieldClick: (fieldId: string, sectionName: string) => void;
  onStartCorrection: () => void;
  mode?: 'full' | 'compact';
}

export default function ClinicianFeedbackPanel({
  data,
  onFieldClick,
  onStartCorrection,
  mode = 'full',
}: ClinicianFeedbackPanelProps) {
  if (mode === 'compact') {
    return <CompactFeedbackPanel data={data} onStartCorrection={onStartCorrection} />;
  }

  const criticalIssues = data.issues.filter((i) => i.severity === 'critical');
  const majorIssues = data.issues.filter((i) => i.severity === 'major');
  const minorIssues = data.issues.filter((i) => i.severity === 'minor');

  const fieldsNeedingCorrection = data.fieldHighlights.filter(
    (f) => f.status === 'needs-correction'
  ).length;

  const isOverdue = data.dueDate && new Date(data.dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card
        className={cn(
          'p-6',
          data.priority === 'urgent' && 'border-l-4 border-l-red-500',
          isOverdue && 'bg-red-50'
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-gray-900">Document Returned for Correction</h2>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  data.priority === 'urgent'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : data.priority === 'high'
                    ? 'bg-orange-100 text-orange-700 border-orange-300'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                )}
              >
                {data.priority.toUpperCase()} Priority
              </Badge>
              {data.iteration > 1 && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                  Iteration #{data.iteration}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {data.patientName} • {data.documentType} • {data.admissionId}
            </p>
          </div>

          <Button onClick={onStartCorrection}>
            <Edit className="w-4 h-4 mr-2" />
            Start Correction
          </Button>
        </div>

        {/* Return Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Returned by: <strong className="text-gray-900">{data.returnedBy}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{new Date(data.returnedAt).toLocaleString()}</span>
          </div>
          {data.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Due: <strong className={cn('text-gray-900', isOverdue && 'text-red-700')}>
                  {new Date(data.dueDate).toLocaleDateString()}
                  {isOverdue && ' (OVERDUE)'}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Return Reason */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-amber-900">QA Reviewer Feedback</span>
          </div>
          <p className="text-sm text-amber-800">{data.returnReason}</p>
        </div>
      </Card>

      {/* Issue Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Issue Summary</h3>
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard
            label="Total Issues"
            value={data.issues.length}
            icon={AlertTriangle}
            color="blue"
          />
          <SummaryCard
            label="Critical"
            value={criticalIssues.length}
            icon={AlertTriangle}
            color="red"
          />
          <SummaryCard label="Major" value={majorIssues.length} icon={AlertTriangle} color="orange" />
          <SummaryCard
            label="Fields to Update"
            value={fieldsNeedingCorrection}
            icon={Edit}
            color="purple"
          />
        </div>
      </Card>

      {/* Issues Requiring Correction */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Issues Requiring Correction ({data.issues.length})
        </h3>
        <div className="space-y-3">
          {data.issues.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} index={index + 1} onFieldClick={onFieldClick} />
          ))}
        </div>
      </Card>

      {/* Field Highlights */}
      {data.fieldHighlights.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Fields Needing Updates ({fieldsNeedingCorrection} required)
          </h3>
          <div className="space-y-2">
            {data.fieldHighlights
              .filter((f) => f.status === 'needs-correction')
              .map((field) => (
                <FieldHighlightCard
                  key={field.fieldId}
                  field={field}
                  issues={data.issues.filter((i) => field.relatedIssueIds.includes(i.id))}
                  onFieldClick={onFieldClick}
                />
              ))}
          </div>
        </Card>
      )}

      {/* Reviewer Comments */}
      {data.comments.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviewer Comments ({data.comments.length})
          </h3>
          <div className="space-y-3">
            {data.comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        </Card>
      )}

      {/* Action Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Ready to make corrections?</p>
            <p className="text-sm text-gray-600 mt-1">
              Review all {data.issues.length} issue{data.issues.length !== 1 ? 's' : ''} and update
              the highlighted fields
            </p>
          </div>
          <Button onClick={onStartCorrection} size="lg">
            <Edit className="w-4 h-4 mr-2" />
            Start Correction
          </Button>
        </div>
      </Card>
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
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            colorClasses[color as keyof typeof colorClasses]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE CARD
// ═══════════════════════════════════════════════════════════════════════════

function IssueCard({
  issue,
  index,
  onFieldClick,
}: {
  issue: IdentifiedIssue;
  index: number;
  onFieldClick: (fieldId: string, sectionName: string) => void;
}) {
  const severityConfig = SEVERITY_CONFIG[issue.severity];
  const SeverityIcon = severityConfig.icon;

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        severityConfig.bgClass,
        `border-${severityConfig.bgClass.split('-')[1]}-300`
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {index}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SeverityIcon className={cn('w-4 h-4', severityConfig.textClass)} />
            <Badge
              variant="outline"
              className={cn('text-xs', severityConfig.bgClass, severityConfig.textClass)}
            >
              {severityConfig.label}
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
              {CATEGORY_LABELS[issue.category]}
            </Badge>
          </div>

          {(issue.sectionName || issue.fieldName) && (
            <div className="text-xs text-gray-600 mb-2">
              {issue.sectionName && <span><strong>Section:</strong> {issue.sectionName}</span>}
              {issue.sectionName && issue.fieldName && ' • '}
              {issue.fieldName && <span><strong>Field:</strong> {issue.fieldName}</span>}
            </div>
          )}

          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="text-xs font-semibold text-red-900 mb-1">❌ Issue:</div>
              <p className="text-sm text-red-800">{issue.description}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                What You Need to Do:
              </div>
              <p className="text-sm text-blue-800">{issue.correctionInstruction}</p>
            </div>

            {issue.reviewerComment && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">💭 Reviewer Note:</div>
                <p className="text-sm text-gray-700 italic">{issue.reviewerComment}</p>
              </div>
            )}
          </div>

          {issue.fieldName && issue.sectionName && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onFieldClick(issue.fieldName!, issue.sectionName!)}
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              Go to {issue.fieldName}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD HIGHLIGHT CARD
// ═══════════════════════════════════════════════════════════════════════════

function FieldHighlightCard({
  field,
  issues,
  onFieldClick,
}: {
  field: FieldHighlight;
  issues: IdentifiedIssue[];
  onFieldClick: (fieldId: string, sectionName: string) => void;
}) {
  return (
    <Card className="p-4 bg-purple-50 border-purple-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Edit className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-gray-900">{field.fieldName}</span>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
              {field.sectionName}
            </Badge>
          </div>
          <div className="text-sm text-gray-700">
            {issues.length} issue{issues.length !== 1 ? 's' : ''} require{issues.length === 1 ? 's' : ''}{' '}
            updating this field
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => onFieldClick(field.fieldId, field.sectionName)}>
          <ExternalLink className="w-3 h-3 mr-2" />
          Go to Field
          <ChevronRight className="w-3 h-3 ml-2" />
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENT CARD
// ═══════════════════════════════════════════════════════════════════════════

function CommentCard({ comment }: { comment: ReviewComment }) {
  return (
    <Card className="p-4 bg-gray-50">
      <div className="flex items-start gap-3">
        <MessageSquare className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">{comment.reviewerName}</span>
            <span className="text-xs text-gray-600">• {comment.reviewerRole}</span>
            <span className="text-xs text-gray-600">
              • {new Date(comment.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.comment}</p>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT FEEDBACK PANEL
// ═══════════════════════════════════════════════════════════════════════════

function CompactFeedbackPanel({
  data,
  onStartCorrection,
}: {
  data: ClinicianFeedbackData;
  onStartCorrection: () => void;
}) {
  const criticalIssues = data.issues.filter((i) => i.severity === 'critical').length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Returned for Correction</div>
            <div className="text-xs text-gray-600">
              {data.issues.length} issues • {criticalIssues} critical
            </div>
          </div>
        </div>

        <Button size="sm" onClick={onStartCorrection}>
          <Edit className="w-3 h-3 mr-2" />
          Correct
        </Button>
      </div>

      <div className="text-sm text-gray-700 bg-amber-50 rounded p-2">
        {data.returnReason}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockClinicianFeedbackData(): ClinicianFeedbackData {
  return {
    documentId: 'VN-2024-445',
    documentType: 'Visit Note',
    patientName: 'Margaret Johnson',
    admissionId: 'ADM-12345',
    returnedBy: 'Jane Smith, QA Reviewer',
    returnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    returnReason:
      'Multiple required sections are incomplete or contain inaccurate information. Please review and correct all identified issues before resubmitting for QA approval.',
    issues: [
      {
        id: 'issue-1',
        category: 'missing-information',
        severity: 'critical',
        fieldName: 'Blood Pressure',
        sectionName: 'Vital Signs',
        description: 'Blood pressure measurement is not recorded',
        correctionInstruction:
          'Enter the blood pressure reading taken during this visit. If not measured, document the clinical reason why it was not obtained.',
      },
      {
        id: 'issue-2',
        category: 'incorrect-data',
        severity: 'major',
        sectionName: 'Medication Review',
        description: 'Medication list appears outdated and does not match recent hospital discharge',
        correctionInstruction:
          'Verify all current medications with the patient and update the medication list. Ensure dosages and frequencies are accurate and match recent discharge orders.',
        reviewerComment:
          'Patient was discharged from hospital on 12/8 with medication changes. Current list predates hospitalization.',
      },
      {
        id: 'issue-3',
        category: 'documentation-quality',
        severity: 'minor',
        sectionName: 'Clinical Assessment',
        description: 'Clinical assessment lacks sufficient detail about wound healing progress',
        correctionInstruction:
          'Expand the assessment to include specific observations about wound size, drainage characteristics, signs of healing, and patient response to treatment.',
      },
    ],
    comments: [
      {
        id: 'comment-1',
        reviewerName: 'Jane Smith',
        reviewerRole: 'QA Reviewer',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        comment:
          'Please ensure all vital signs are documented for billing compliance. Blood pressure is a required field for this visit type.',
        type: 'issue-specific',
        relatedIssueId: 'issue-1',
      },
      {
        id: 'comment-2',
        reviewerName: 'Jane Smith',
        reviewerRole: 'QA Reviewer',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        comment:
          'Overall documentation quality is good. These corrections will bring the note up to compliance standards. Let me know if you have questions.',
        type: 'general',
      },
    ],
    fieldHighlights: [
      {
        fieldId: 'field-bp',
        fieldName: 'Blood Pressure',
        sectionName: 'Vital Signs',
        status: 'needs-correction',
        relatedIssueIds: ['issue-1'],
      },
      {
        fieldId: 'field-meds',
        fieldName: 'Current Medications',
        sectionName: 'Medication Review',
        status: 'needs-correction',
        relatedIssueIds: ['issue-2'],
      },
      {
        fieldId: 'field-assessment',
        fieldName: 'Clinical Assessment',
        sectionName: 'Assessment',
        status: 'needs-correction',
        relatedIssueIds: ['issue-3'],
      },
    ],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    iteration: 1,
  };
}
