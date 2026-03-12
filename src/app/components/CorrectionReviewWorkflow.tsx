/**
 * Correction Review Workflow Component
 * 
 * Workflow for QA staff to review corrected documents that were previously
 * returned. Displays original reviewer comments alongside updated document,
 * highlights changed fields, and allows approval or additional return.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  MessageSquare,
  ArrowLeft,
  Send,
  History,
  Edit,
  User,
  Clock,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { QAReviewItem } from './QACenterWorkspace';
import type {
  IdentifiedIssue,
  ReturnMetadata,
  CorrectionHistoryEntry,
} from './ReturnForCorrectionWorkflow';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FieldChange {
  fieldId: string;
  fieldName: string;
  sectionName: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
  changedBy: string;
  relatedIssueId?: string; // Links to original issue
}

export interface CorrectionSubmission {
  submittedAt: string;
  submittedBy: string;
  correctionNotes: string;
  changedFields: FieldChange[];
  iteration: number;
}

export interface CorrectedDocument {
  item: QAReviewItem;
  originalReturn: ReturnMetadata;
  correction: CorrectionSubmission;
  correctionHistory: CorrectionHistoryEntry[];
}

export type IssueResolutionStatus = 'resolved' | 'partially-resolved' | 'unresolved';

export interface IssueResolution {
  issueId: string;
  status: IssueResolutionStatus;
  relatedChanges: FieldChange[];
  reviewerNotes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CorrectionReviewWorkflowProps {
  document: CorrectedDocument;
  currentReviewer: string;
  onApprove: (comments: string) => void;
  onReturnAgain: (reason: string, newIssues: IdentifiedIssue[]) => void;
  onBack: () => void;
}

export default function CorrectionReviewWorkflow({
  document,
  currentReviewer,
  onApprove,
  onReturnAgain,
  onBack,
}: CorrectionReviewWorkflowProps) {
  const [issueResolutions, setIssueResolutions] = useState<IssueResolution[]>(
    document.originalReturn.issues.map((issue) => {
      // Auto-detect related changes for each issue
      const relatedChanges = document.correction.changedFields.filter(
        (change) =>
          change.relatedIssueId === issue.id ||
          (issue.fieldName && change.fieldName === issue.fieldName) ||
          (issue.sectionName && change.sectionName === issue.sectionName)
      );

      return {
        issueId: issue.id,
        status: relatedChanges.length > 0 ? 'resolved' : 'unresolved',
        relatedChanges,
      };
    })
  );

  const [reviewNotes, setReviewNotes] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const resolvedCount = issueResolutions.filter((r) => r.status === 'resolved').length;
  const unresolvedCount = issueResolutions.filter((r) => r.status === 'unresolved').length;
  const partialCount = issueResolutions.filter((r) => r.status === 'partially-resolved').length;

  const canApprove = unresolvedCount === 0;

  const updateIssueStatus = (issueId: string, status: IssueResolutionStatus) => {
    setIssueResolutions(
      issueResolutions.map((r) => (r.issueId === issueId ? { ...r, status } : r))
    );
  };

  const updateIssueNotes = (issueId: string, notes: string) => {
    setIssueResolutions(
      issueResolutions.map((r) => (r.issueId === issueId ? { ...r, reviewerNotes: notes } : r))
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queue
            </Button>
            <div className="border-l h-6" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{document.item.patientName}</h2>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Corrected - Awaiting Re-Review
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {document.item.documentType} • {document.item.admissionId}
              </p>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <CorrectionSummary
          document={document}
          resolvedCount={resolvedCount}
          unresolvedCount={unresolvedCount}
          partialCount={partialCount}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Correction Timeline */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Correction Timeline
            </h3>
            <CorrectionTimeline document={document} />
          </Card>

          {/* Changed Fields */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Changed Fields ({document.correction.changedFields.length})
            </h3>
            {document.correction.changedFields.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-600">
                No field changes detected
              </div>
            ) : (
              <div className="space-y-3">
                {document.correction.changedFields.map((change) => (
                  <FieldChangeCard key={change.fieldId} change={change} />
                ))}
              </div>
            )}
          </Card>

          {/* Issue Resolution Review */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Issue Resolution Review ({document.originalReturn.issues.length} original issues)
            </h3>
            <div className="space-y-4">
              {document.originalReturn.issues.map((issue) => {
                const resolution = issueResolutions.find((r) => r.issueId === issue.id)!;
                return (
                  <IssueResolutionCard
                    key={issue.id}
                    issue={issue}
                    resolution={resolution}
                    onStatusChange={(status) => updateIssueStatus(issue.id, status)}
                    onNotesChange={(notes) => updateIssueNotes(issue.id, notes)}
                  />
                );
              })}
            </div>
          </Card>

          {/* Review Notes */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Overall Review Notes</h3>
            <Textarea
              placeholder="Add notes about this re-review..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="h-32"
            />
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Resolved:</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {resolvedCount}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-gray-600">Partial:</span>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                {partialCount}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-gray-600">Unresolved:</span>
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                {unresolvedCount}
              </Badge>
            </div>
            {!canApprove && (
              <div className="text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Cannot approve: Unresolved issues remain
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowReturnDialog(true)}>
              <XCircle className="w-4 h-4 mr-2" />
              Return Again
            </Button>
            <Button onClick={() => setShowApproveDialog(true)} disabled={!canApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve for Billing
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showApproveDialog && (
        <ApproveDialog
          document={document}
          reviewNotes={reviewNotes}
          onApprove={() => {
            onApprove(reviewNotes);
            setShowApproveDialog(false);
          }}
          onCancel={() => setShowApproveDialog(false)}
        />
      )}

      {showReturnDialog && (
        <ReturnAgainDialog
          document={document}
          unresolvedIssues={document.originalReturn.issues.filter((issue) => {
            const resolution = issueResolutions.find((r) => r.issueId === issue.id);
            return resolution?.status !== 'resolved';
          })}
          onReturn={(reason, newIssues) => {
            onReturnAgain(reason, newIssues);
            setShowReturnDialog(false);
          }}
          onCancel={() => setShowReturnDialog(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CORRECTION SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

function CorrectionSummary({
  document,
  resolvedCount,
  unresolvedCount,
  partialCount,
}: {
  document: CorrectedDocument;
  resolvedCount: number;
  unresolvedCount: number;
  partialCount: number;
}) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <SummaryCard
        label="Iteration"
        value={`#${document.correction.iteration}`}
        icon={RefreshCw}
        color="purple"
      />
      <SummaryCard
        label="Fields Changed"
        value={document.correction.changedFields.length}
        icon={Edit}
        color="blue"
      />
      <SummaryCard label="Resolved" value={resolvedCount} icon={CheckCircle} color="green" />
      <SummaryCard
        label="Partially Resolved"
        value={partialCount}
        icon={AlertTriangle}
        color="amber"
      />
      <SummaryCard label="Unresolved" value={unresolvedCount} icon={XCircle} color="red" />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-1">
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
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CORRECTION TIMELINE
// ═══════════════════════════════════════════════════════════════════════════

function CorrectionTimeline({ document }: { document: CorrectedDocument }) {
  return (
    <div className="space-y-3">
      {/* Original Return */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <XCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">Returned for Correction</span>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
              {document.originalReturn.issues.length} issues
            </Badge>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <User className="w-3 h-3 inline mr-1" />
            {document.originalReturn.returnedBy} •{' '}
            {new Date(document.originalReturn.returnedAt).toLocaleString()}
          </div>
          <p className="text-sm text-gray-800 bg-amber-50 border border-amber-200 rounded p-2">
            {document.originalReturn.returnReason}
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-2 ml-5">
        <div className="w-0.5 h-8 bg-gray-300" />
      </div>

      {/* Correction Submission */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Edit className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">Corrections Submitted</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
              {document.correction.changedFields.length} fields changed
            </Badge>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <User className="w-3 h-3 inline mr-1" />
            {document.correction.submittedBy} •{' '}
            {new Date(document.correction.submittedAt).toLocaleString()}
          </div>
          {document.correction.correctionNotes && (
            <p className="text-sm text-gray-800 bg-blue-50 border border-blue-200 rounded p-2">
              {document.correction.correctionNotes}
            </p>
          )}
          <div className="text-xs text-gray-600 mt-1">
            <Clock className="w-3 h-3 inline mr-1" />
            Time to correct:{' '}
            {Math.round(
              (new Date(document.correction.submittedAt).getTime() -
                new Date(document.originalReturn.returnedAt).getTime()) /
                (1000 * 60 * 60)
            )}{' '}
            hours
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center gap-2 ml-5">
        <div className="w-0.5 h-8 bg-gray-300" />
      </div>

      {/* Current Re-Review */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Eye className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">Re-Review in Progress</span>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
              Current
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            Awaiting your review decision
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD CHANGE CARD
// ═══════════════════════════════════════════════════════════════════════════

function FieldChangeCard({ change }: { change: FieldChange }) {
  return (
    <Card className="p-4 bg-blue-50 border-blue-300">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          <Edit className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{change.fieldName}</h4>
              <p className="text-xs text-gray-600">Section: {change.sectionName}</p>
            </div>
            <div className="text-xs text-gray-600">
              {new Date(change.changedAt).toLocaleString()}
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Before:</div>
              <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-gray-900">
                {change.oldValue || <span className="text-gray-400 italic">Empty</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">After:</div>
              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-gray-900">
                {change.newValue || <span className="text-gray-400 italic">Empty</span>}
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-600">
            <User className="w-3 h-3 inline mr-1" />
            Changed by {change.changedBy}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE RESOLUTION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface IssueResolutionCardProps {
  issue: IdentifiedIssue;
  resolution: IssueResolution;
  onStatusChange: (status: IssueResolutionStatus) => void;
  onNotesChange: (notes: string) => void;
}

function IssueResolutionCard({
  issue,
  resolution,
  onStatusChange,
  onNotesChange,
}: IssueResolutionCardProps) {
  const statusConfig = {
    resolved: {
      label: 'Resolved',
      color: 'green',
      bgClass: 'bg-green-50',
      borderClass: 'border-green-300',
      icon: CheckCircle,
    },
    'partially-resolved': {
      label: 'Partially Resolved',
      color: 'amber',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      icon: AlertTriangle,
    },
    unresolved: {
      label: 'Unresolved',
      color: 'red',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-300',
      icon: XCircle,
    },
  };

  const config = statusConfig[resolution.status];
  const StatusIcon = config.icon;

  return (
    <Card className={cn('p-4', config.bgClass, config.borderClass)}>
      <div className="space-y-3">
        {/* Issue Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  issue.severity === 'critical'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : issue.severity === 'major'
                    ? 'bg-orange-100 text-orange-700 border-orange-300'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                )}
              >
                {issue.severity}
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                {issue.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Badge>
            </div>
            {(issue.sectionName || issue.fieldName) && (
              <p className="text-xs text-gray-600 mb-1">
                {issue.sectionName && `Section: ${issue.sectionName}`}
                {issue.sectionName && issue.fieldName && ' • '}
                {issue.fieldName && `Field: ${issue.fieldName}`}
              </p>
            )}
            <p className="text-sm font-medium text-gray-900 mb-1">{issue.description}</p>
            <p className="text-sm text-gray-700">
              <strong>Required correction:</strong> {issue.correctionInstruction}
            </p>
          </div>

          <div className="ml-4">
            <StatusIcon className={cn('w-6 h-6', `text-${config.color}-600`)} />
          </div>
        </div>

        {/* Related Changes */}
        {resolution.relatedChanges.length > 0 && (
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Related Changes ({resolution.relatedChanges.length}):
            </div>
            <div className="space-y-2">
              {resolution.relatedChanges.map((change) => (
                <div key={change.fieldId} className="text-xs text-gray-600">
                  <Edit className="w-3 h-3 inline mr-1" />
                  <strong>{change.fieldName}:</strong> "{change.oldValue}" → "{change.newValue}"
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Selection */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Mark Resolution Status:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onStatusChange('resolved')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded border transition-all',
                resolution.status === 'resolved'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-white text-gray-700 border-gray-300'
              )}
            >
              <CheckCircle className="w-3 h-3 inline mr-1" />
              Resolved
            </button>
            <button
              onClick={() => onStatusChange('partially-resolved')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded border transition-all',
                resolution.status === 'partially-resolved'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-white text-gray-700 border-gray-300'
              )}
            >
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Partial
            </button>
            <button
              onClick={() => onStatusChange('unresolved')}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded border transition-all',
                resolution.status === 'unresolved'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-white text-gray-700 border-gray-300'
              )}
            >
              <XCircle className="w-3 h-3 inline mr-1" />
              Unresolved
            </button>
          </div>
        </div>

        {/* Reviewer Notes */}
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            Reviewer Notes (Optional):
          </label>
          <Textarea
            placeholder="Add notes about this issue resolution..."
            value={resolution.reviewerNotes || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            className="h-20 text-sm"
          />
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DIALOGS
// ═══════════════════════════════════════════════════════════════════════════

function ApproveDialog({
  document,
  reviewNotes,
  onApprove,
  onCancel,
}: {
  document: CorrectedDocument;
  reviewNotes: string;
  onApprove: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
            Approve Corrected Document?
          </h3>
          <p className="text-sm text-gray-600 mb-4 text-center">
            All issues have been resolved. This document will be approved for billing.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium text-gray-900">{document.item.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Iteration:</span>
              <span className="font-medium text-gray-900">#{document.correction.iteration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fields Changed:</span>
              <span className="font-medium text-gray-900">
                {document.correction.changedFields.length}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onApprove} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReturnAgainDialog({
  document,
  unresolvedIssues,
  onReturn,
  onCancel,
}: {
  document: CorrectedDocument;
  unresolvedIssues: IdentifiedIssue[];
  onReturn: (reason: string, newIssues: IdentifiedIssue[]) => void;
  onCancel: () => void;
}) {
  const [returnReason, setReturnReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Return Document Again</h3>

          {unresolvedIssues.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Unresolved Issues ({unresolvedIssues.length}):
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                {unresolvedIssues.map((issue) => (
                  <div key={issue.id} className="text-sm text-red-700">
                    • {issue.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Reason (Required)
            </label>
            <Textarea
              placeholder="Explain what still needs to be corrected..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="h-32"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => onReturn(returnReason, unresolvedIssues)}
              disabled={!returnReason.trim()}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Return Again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockCorrectedDocument(): CorrectedDocument {
  const now = new Date();
  const returnedDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const correctedDate = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago

  return {
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
      status: 'in-review',
      priority: 'high',
      daysInQueue: 2,
      complianceScore: 85,
      flagCount: 0,
      flags: [],
      requiresSignature: false,
      billingImpact: true,
    },
    originalReturn: {
      returnedBy: 'Jane Smith, QA Reviewer',
      returnedAt: returnedDate.toISOString(),
      returnReason: 'Multiple required fields incomplete. Please complete all sections before resubmission.',
      issues: [
        {
          id: 'issue-1',
          category: 'missing-information',
          severity: 'critical',
          sectionName: 'Vital Signs',
          fieldName: 'Blood Pressure',
          description: 'Blood pressure measurement is not recorded',
          correctionInstruction: 'Enter the blood pressure reading taken during this visit.',
        },
        {
          id: 'issue-2',
          category: 'incorrect-data',
          severity: 'major',
          sectionName: 'Medication Review',
          description: 'Medication list appears outdated',
          correctionInstruction: 'Verify all medications with patient and update the list.',
        },
        {
          id: 'issue-3',
          category: 'documentation-quality',
          severity: 'minor',
          sectionName: 'Assessment',
          description: 'Clinical assessment lacks sufficient detail',
          correctionInstruction: 'Expand assessment to include specific observations.',
        },
      ],
      priority: 'high',
    },
    correction: {
      submittedAt: correctedDate.toISOString(),
      submittedBy: 'Emily Chen, RN',
      correctionNotes: 'All sections have been completed as requested. Added missing vital signs and updated medication list with patient confirmation.',
      changedFields: [
        {
          fieldId: 'field-bp',
          fieldName: 'Blood Pressure',
          sectionName: 'Vital Signs',
          oldValue: '',
          newValue: '128/82 mmHg',
          changedAt: new Date(correctedDate.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          changedBy: 'Emily Chen, RN',
          relatedIssueId: 'issue-1',
        },
        {
          fieldId: 'field-meds',
          fieldName: 'Current Medications',
          sectionName: 'Medication Review',
          oldValue: 'Lisinopril 10mg daily, Metformin 500mg BID',
          newValue: 'Lisinopril 10mg daily, Metformin 500mg BID, Atorvastatin 20mg daily (added 12/10/24)',
          changedAt: new Date(correctedDate.getTime() - 30 * 60 * 1000).toISOString(),
          changedBy: 'Emily Chen, RN',
          relatedIssueId: 'issue-2',
        },
        {
          fieldId: 'field-assessment',
          fieldName: 'Clinical Assessment',
          sectionName: 'Assessment',
          oldValue: 'Patient doing well',
          newValue: 'Patient alert and oriented x3. Ambulating with walker independently. Wound on left lower leg shows continued healing with decreased drainage. Patient reports pain level 2/10, well controlled.',
          changedAt: correctedDate.toISOString(),
          changedBy: 'Emily Chen, RN',
          relatedIssueId: 'issue-3',
        },
      ],
      iteration: 2,
    },
    correctionHistory: [
      {
        id: 'history-1',
        returnedAt: returnedDate.toISOString(),
        returnedBy: 'Jane Smith, QA Reviewer',
        returnReason: 'Multiple required fields incomplete.',
        issueCount: 3,
        correctedAt: correctedDate.toISOString(),
        correctedBy: 'Emily Chen, RN',
        correctionNotes: 'All sections completed as requested.',
        resubmittedAt: correctedDate.toISOString(),
        iteration: 1,
      },
    ],
  };
}
