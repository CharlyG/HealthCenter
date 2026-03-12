/**
 * Return for Correction Workflow Component
 * 
 * Complete workflow for QA staff to return clinical documents to clinicians
 * for correction. Includes reviewer comment entry, issue classification,
 * correction instructions, and correction history tracking.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import {
  AlertTriangle,
  XCircle,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Check,
  Clock,
  User,
  FileText,
  ChevronRight,
  Info,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { QAReviewItem } from './QACenterWorkspace';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type IssueCategory = 
  | 'missing-information'
  | 'incorrect-data'
  | 'compliance-failure'
  | 'signature-required'
  | 'clinical-accuracy'
  | 'documentation-quality'
  | 'billing-impact';

export type IssueSeverity = 'critical' | 'major' | 'minor';

export interface IdentifiedIssue {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  fieldName?: string;
  sectionName?: string;
  description: string;
  correctionInstruction: string;
  reviewerComment?: string;
}

export interface ReturnMetadata {
  returnedBy: string;
  returnedAt: string;
  returnReason: string;
  issues: IdentifiedIssue[];
  dueDate?: string;
  priority: 'urgent' | 'high' | 'normal';
}

export interface CorrectionHistoryEntry {
  id: string;
  returnedAt: string;
  returnedBy: string;
  returnReason: string;
  issueCount: number;
  correctedAt?: string;
  correctedBy?: string;
  correctionNotes?: string;
  resubmittedAt?: string;
  iteration: number; // 1st return, 2nd return, etc.
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const ISSUE_CATEGORY_CONFIG: Record<
  IssueCategory,
  { label: string; icon: string; color: string; description: string }
> = {
  'missing-information': {
    label: 'Missing Information',
    icon: '📋',
    color: 'amber',
    description: 'Required field or section not completed',
  },
  'incorrect-data': {
    label: 'Incorrect Data',
    icon: '❌',
    color: 'red',
    description: 'Data entered is incorrect or inconsistent',
  },
  'compliance-failure': {
    label: 'Compliance Failure',
    icon: '⚠️',
    color: 'red',
    description: 'Fails regulatory or compliance requirements',
  },
  'signature-required': {
    label: 'Signature Required',
    icon: '✍️',
    color: 'purple',
    description: 'Document requires signature',
  },
  'clinical-accuracy': {
    label: 'Clinical Accuracy',
    icon: '🔍',
    color: 'orange',
    description: 'Clinical information needs verification',
  },
  'documentation-quality': {
    label: 'Documentation Quality',
    icon: '📝',
    color: 'blue',
    description: 'Documentation does not meet quality standards',
  },
  'billing-impact': {
    label: 'Billing Impact',
    icon: '💰',
    color: 'red',
    description: 'Issue impacts billing or reimbursement',
  },
};

const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { label: string; color: string; bgClass: string; textClass: string; description: string }
> = {
  critical: {
    label: 'Critical',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    description: 'Must be corrected before approval',
  },
  major: {
    label: 'Major',
    color: 'orange',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
    description: 'Significant issue requiring correction',
  },
  minor: {
    label: 'Minor',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
    description: 'Quality improvement suggestion',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ReturnForCorrectionWorkflowProps {
  item: QAReviewItem;
  currentReviewer: string;
  correctionHistory: CorrectionHistoryEntry[];
  onReturn: (metadata: ReturnMetadata) => void;
  onCancel: () => void;
}

export default function ReturnForCorrectionWorkflow({
  item,
  currentReviewer,
  correctionHistory,
  onReturn,
  onCancel,
}: ReturnForCorrectionWorkflowProps) {
  const [step, setStep] = useState<'issues' | 'instructions' | 'review'>(
    'issues'
  );
  const [issues, setIssues] = useState<IdentifiedIssue[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'normal'>('normal');
  const [dueDate, setDueDate] = useState('');
  
  // Current issue being added
  const [currentIssue, setCurrentIssue] = useState<Partial<IdentifiedIssue>>({
    category: 'missing-information',
    severity: 'major',
    description: '',
    correctionInstruction: '',
  });

  const handleAddIssue = () => {
    if (
      currentIssue.category &&
      currentIssue.severity &&
      currentIssue.description &&
      currentIssue.correctionInstruction
    ) {
      const newIssue: IdentifiedIssue = {
        id: `issue-${Date.now()}`,
        category: currentIssue.category as IssueCategory,
        severity: currentIssue.severity as IssueSeverity,
        fieldName: currentIssue.fieldName,
        sectionName: currentIssue.sectionName,
        description: currentIssue.description,
        correctionInstruction: currentIssue.correctionInstruction,
        reviewerComment: currentIssue.reviewerComment,
      };

      setIssues([...issues, newIssue]);
      setCurrentIssue({
        category: 'missing-information',
        severity: 'major',
        description: '',
        correctionInstruction: '',
      });
    }
  };

  const handleRemoveIssue = (issueId: string) => {
    setIssues(issues.filter((i) => i.id !== issueId));
  };

  const handleSubmitReturn = () => {
    const metadata: ReturnMetadata = {
      returnedBy: currentReviewer,
      returnedAt: new Date().toISOString(),
      returnReason,
      issues,
      dueDate: dueDate || undefined,
      priority,
    };

    onReturn(metadata);
  };

  const canProceedToInstructions = issues.length > 0;
  const canProceedToReview = returnReason.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Return for Correction</h2>
                <p className="text-sm text-gray-600">
                  {item.patientName} • {item.documentType} • {item.admissionId}
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <ProgressSteps currentStep={step} />

            {/* Correction History Banner */}
            {correctionHistory.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">
                    This document has been returned {correctionHistory.length} time(s) before
                  </span>
                </div>
                <p className="text-xs text-amber-700">
                  Last returned: {new Date(correctionHistory[0]?.returnedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Step Content */}
          {step === 'issues' && (
            <IssuesStep
              issues={issues}
              currentIssue={currentIssue}
              onCurrentIssueChange={setCurrentIssue}
              onAddIssue={handleAddIssue}
              onRemoveIssue={handleRemoveIssue}
            />
          )}

          {step === 'instructions' && (
            <InstructionsStep
              returnReason={returnReason}
              onReturnReasonChange={setReturnReason}
              priority={priority}
              onPriorityChange={setPriority}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              item={item}
              issues={issues}
              returnReason={returnReason}
              priority={priority}
              dueDate={dueDate}
              currentReviewer={currentReviewer}
            />
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {step !== 'issues' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === 'instructions') setStep('issues');
                    if (step === 'review') setStep('instructions');
                  }}
                >
                  Back
                </Button>
              )}

              {step === 'issues' && (
                <Button onClick={() => setStep('instructions')} disabled={!canProceedToInstructions}>
                  Continue to Instructions
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {step === 'instructions' && (
                <Button onClick={() => setStep('review')} disabled={!canProceedToReview}>
                  Review & Send
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {step === 'review' && (
                <Button onClick={handleSubmitReturn}>
                  <Send className="w-4 h-4 mr-2" />
                  Return Document
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS STEPS
// ═══════════════════════════════════════════════════════════════════════════

function ProgressSteps({ currentStep }: { currentStep: 'issues' | 'instructions' | 'review' }) {
  const steps = [
    { key: 'issues', label: 'Identify Issues' },
    { key: 'instructions', label: 'Provide Instructions' },
    { key: 'review', label: 'Review & Send' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div
              className={cn(
                'flex items-center gap-2 flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white'
                  : isCompleted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  isActive
                    ? 'bg-white text-blue-600'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span>{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-400 mx-1 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ISSUES STEP
// ═══════════════════════════════════════════════════════════════════════════

interface IssuesStepProps {
  issues: IdentifiedIssue[];
  currentIssue: Partial<IdentifiedIssue>;
  onCurrentIssueChange: (issue: Partial<IdentifiedIssue>) => void;
  onAddIssue: () => void;
  onRemoveIssue: (issueId: string) => void;
}

function IssuesStep({
  issues,
  currentIssue,
  onCurrentIssueChange,
  onAddIssue,
  onRemoveIssue,
}: IssuesStepProps) {
  return (
    <div className="space-y-6">
      {/* Identified Issues List */}
      {issues.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Identified Issues ({issues.length})
          </h3>
          <div className="space-y-2">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onRemove={() => onRemoveIssue(issue.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Add New Issue Form */}
      <Card className="p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-4">
          {issues.length === 0 ? 'Add First Issue' : 'Add Another Issue'}
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Category *
            </label>
            <select
              value={currentIssue.category}
              onChange={(e) =>
                onCurrentIssueChange({
                  ...currentIssue,
                  category: e.target.value as IssueCategory,
                })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {Object.entries(ISSUE_CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
            {currentIssue.category && (
              <p className="text-xs text-gray-600 mt-1">
                {ISSUE_CATEGORY_CONFIG[currentIssue.category].description}
              </p>
            )}
          </div>

          {/* Severity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() =>
                    onCurrentIssueChange({
                      ...currentIssue,
                      severity: key as IssueSeverity,
                    })
                  }
                  className={cn(
                    'px-3 py-2 text-xs font-medium rounded border transition-all',
                    currentIssue.severity === key
                      ? `${config.bgClass} ${config.textClass} border-${config.color}-300`
                      : 'bg-white text-gray-700 border-gray-300'
                  )}
                >
                  {config.label}
                </button>
              ))}
            </div>
            {currentIssue.severity && (
              <p className="text-xs text-gray-600 mt-1">
                {SEVERITY_CONFIG[currentIssue.severity].description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Field Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field Name (Optional)
            </label>
            <Input
              placeholder="e.g., Blood Pressure, Medication List"
              value={currentIssue.fieldName || ''}
              onChange={(e) =>
                onCurrentIssueChange({ ...currentIssue, fieldName: e.target.value })
              }
            />
          </div>

          {/* Section Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Name (Optional)
            </label>
            <Input
              placeholder="e.g., Vital Signs, Assessment"
              value={currentIssue.sectionName || ''}
              onChange={(e) =>
                onCurrentIssueChange({ ...currentIssue, sectionName: e.target.value })
              }
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Description *
          </label>
          <Textarea
            placeholder="Describe the issue clearly..."
            value={currentIssue.description || ''}
            onChange={(e) =>
              onCurrentIssueChange({ ...currentIssue, description: e.target.value })
            }
            className="h-24"
          />
        </div>

        {/* Correction Instruction */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correction Instructions *
          </label>
          <Textarea
            placeholder="Tell the clinician exactly what needs to be corrected..."
            value={currentIssue.correctionInstruction || ''}
            onChange={(e) =>
              onCurrentIssueChange({
                ...currentIssue,
                correctionInstruction: e.target.value,
              })
            }
            className="h-24"
          />
        </div>

        {/* Reviewer Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Reviewer Comment (Optional)
          </label>
          <Textarea
            placeholder="Additional context or notes for the clinician..."
            value={currentIssue.reviewerComment || ''}
            onChange={(e) =>
              onCurrentIssueChange({ ...currentIssue, reviewerComment: e.target.value })
            }
            className="h-20"
          />
        </div>

        <Button
          onClick={onAddIssue}
          disabled={
            !currentIssue.category ||
            !currentIssue.severity ||
            !currentIssue.description ||
            !currentIssue.correctionInstruction
          }
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Issue
        </Button>
      </Card>

      {issues.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-600">
          Add at least one issue to continue
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue, onRemove }: { issue: IdentifiedIssue; onRemove: () => void }) {
  const categoryConfig = ISSUE_CATEGORY_CONFIG[issue.category];
  const severityConfig = SEVERITY_CONFIG[issue.severity];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{categoryConfig.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{categoryConfig.label}</h4>
                <Badge
                  variant="outline"
                  className={cn('text-xs', severityConfig.bgClass, severityConfig.textClass)}
                >
                  {severityConfig.label}
                </Badge>
              </div>
              {(issue.fieldName || issue.sectionName) && (
                <p className="text-xs text-gray-600">
                  {issue.sectionName && `Section: ${issue.sectionName}`}
                  {issue.sectionName && issue.fieldName && ' • '}
                  {issue.fieldName && `Field: ${issue.fieldName}`}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Issue:</span>
              <p className="text-gray-900">{issue.description}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Correction Required:</span>
              <p className="text-gray-900">{issue.correctionInstruction}</p>
            </div>
            {issue.reviewerComment && (
              <div>
                <span className="font-medium text-gray-700">Reviewer Note:</span>
                <p className="text-gray-600 italic">{issue.reviewerComment}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INSTRUCTIONS STEP
// ═══════════════════════════════════════════════════════════════════════════

interface InstructionsStepProps {
  returnReason: string;
  onReturnReasonChange: (reason: string) => void;
  priority: 'urgent' | 'high' | 'normal';
  onPriorityChange: (priority: 'urgent' | 'high' | 'normal') => void;
  dueDate: string;
  onDueDateChange: (date: string) => void;
}

function InstructionsStep({
  returnReason,
  onReturnReasonChange,
  priority,
  onPriorityChange,
  dueDate,
  onDueDateChange,
}: InstructionsStepProps) {
  return (
    <div className="space-y-6">
      {/* Return Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Return Reason *
        </label>
        <Textarea
          placeholder="Provide a summary of why this document is being returned..."
          value={returnReason}
          onChange={(e) => onReturnReasonChange(e.target.value)}
          className="h-32"
        />
        <p className="text-xs text-gray-600 mt-1">
          This will appear at the top of the returned document notification
        </p>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correction Priority
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onPriorityChange('normal')}
            className={cn(
              'p-4 rounded-lg border-2 transition-all text-left',
              priority === 'normal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div className="font-semibold text-gray-900 mb-1">Normal</div>
            <div className="text-xs text-gray-600">Standard correction timeline</div>
          </button>
          <button
            onClick={() => onPriorityChange('high')}
            className={cn(
              'p-4 rounded-lg border-2 transition-all text-left',
              priority === 'high'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div className="font-semibold text-gray-900 mb-1">High Priority</div>
            <div className="text-xs text-gray-600">Needs prompt attention</div>
          </button>
          <button
            onClick={() => onPriorityChange('urgent')}
            className={cn(
              'p-4 rounded-lg border-2 transition-all text-left',
              priority === 'urgent'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            <div className="font-semibold text-gray-900 mb-1">Urgent</div>
            <div className="text-xs text-gray-600">Immediate correction required</div>
          </button>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correction Due Date (Optional)
        </label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-gray-600 mt-1">
          Set a deadline for when corrections should be completed
        </p>
      </div>

      {/* Preview Banner */}
      <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">Preview</span>
        </div>
        <p className="text-sm text-blue-700">
          The clinician will receive a notification with your return reason and detailed
          correction instructions for each issue.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW STEP
// ═══════════════════════════════════════════════════════════════════════════

interface ReviewStepProps {
  item: QAReviewItem;
  issues: IdentifiedIssue[];
  returnReason: string;
  priority: 'urgent' | 'high' | 'normal';
  dueDate: string;
  currentReviewer: string;
}

function ReviewStep({
  item,
  issues,
  returnReason,
  priority,
  dueDate,
  currentReviewer,
}: ReviewStepProps) {
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const majorCount = issues.filter((i) => i.severity === 'major').length;
  const minorCount = issues.filter((i) => i.severity === 'minor').length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <h3 className="font-semibold text-gray-900 mb-3">Return Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Patient:</span>
            <div className="font-medium text-gray-900">{item.patientName}</div>
          </div>
          <div>
            <span className="text-gray-600">Document:</span>
            <div className="font-medium text-gray-900">{item.documentType}</div>
          </div>
          <div>
            <span className="text-gray-600">Clinician:</span>
            <div className="font-medium text-gray-900">{item.clinicianName}</div>
          </div>
          <div>
            <span className="text-gray-600">Reviewer:</span>
            <div className="font-medium text-gray-900">{currentReviewer}</div>
          </div>
          <div>
            <span className="text-gray-600">Total Issues:</span>
            <div className="font-medium text-gray-900">{issues.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Priority:</span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                priority === 'urgent'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : priority === 'high'
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : 'bg-blue-100 text-blue-700 border-blue-300'
              )}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
          </div>
          {dueDate && (
            <div className="col-span-2">
              <span className="text-gray-600">Due Date:</span>
              <div className="font-medium text-gray-900">
                {new Date(dueDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Return Reason */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Return Reason</h3>
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-900">{returnReason}</p>
        </Card>
      </div>

      {/* Issues Breakdown */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">
          Issues by Severity ({issues.length} total)
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {criticalCount > 0 && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
              <div className="text-xs text-red-600">Critical</div>
            </div>
          )}
          {majorCount > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-300 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{majorCount}</div>
              <div className="text-xs text-orange-600">Major</div>
            </div>
          )}
          {minorCount > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{minorCount}</div>
              <div className="text-xs text-yellow-600">Minor</div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onRemove={() => {}} />
          ))}
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-900">Confirm Return</span>
        </div>
        <p className="text-sm text-amber-700">
          This document will be returned to <strong>{item.clinicianName}</strong> with{' '}
          <strong>{issues.length} issue(s)</strong> requiring correction. The clinician will
          receive a notification and the document will appear in their correction queue.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockCorrectionHistory(): CorrectionHistoryEntry[] {
  return [
    {
      id: 'history-1',
      returnedAt: '2024-12-10T09:30:00Z',
      returnedBy: 'Jane Smith, QA Reviewer',
      returnReason: 'Multiple required sections incomplete',
      issueCount: 5,
      correctedAt: '2024-12-11T14:20:00Z',
      correctedBy: 'Emily Chen, RN',
      correctionNotes: 'All sections completed as requested',
      resubmittedAt: '2024-12-11T14:25:00Z',
      iteration: 1,
    },
  ];
}
