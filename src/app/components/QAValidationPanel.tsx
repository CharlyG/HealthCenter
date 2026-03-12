/**
 * QA Validation Panel Component
 * 
 * Displays automated validation checks for clinical documents including
 * missing required fields, incomplete assessments, unsigned orders,
 * frequency mismatches, and missing physician signatures. Each validation
 * item includes severity level, description, and link to affected field.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertTriangle,
  XCircle,
  CheckCircle,
  FileText,
  Clock,
  UserX,
  Activity,
  Edit,
  ChevronRight,
  RefreshCw,
  Filter,
  Info,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ValidationSeverity = 'critical' | 'major' | 'minor' | 'warning';

export type ValidationCategory =
  | 'missing-required-fields'
  | 'incomplete-assessments'
  | 'unsigned-orders'
  | 'frequency-mismatches'
  | 'missing-signatures'
  | 'data-consistency'
  | 'compliance-requirements';

export interface ValidationIssue {
  id: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  title: string;
  description: string;
  affectedField?: {
    fieldId: string;
    fieldName: string;
    sectionName: string;
  };
  recommendation?: string;
  autoFixAvailable?: boolean;
  relatedDocuments?: string[];
}

export interface ValidationResult {
  documentId: string;
  documentType: string;
  validatedAt: string;
  totalIssues: number;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  warningCount: number;
  issues: ValidationIssue[];
  overallStatus: 'pass' | 'fail' | 'warning';
  complianceScore: number; // 0-100
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const SEVERITY_CONFIG: Record<
  ValidationSeverity,
  {
    label: string;
    color: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    icon: any;
  }
> = {
  critical: {
    label: 'Critical',
    color: 'red',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
    icon: XCircle,
  },
  major: {
    label: 'Major',
    color: 'orange',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-300',
    icon: AlertTriangle,
  },
  minor: {
    label: 'Minor',
    color: 'yellow',
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-300',
    icon: Info,
  },
  warning: {
    label: 'Warning',
    color: 'amber',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    icon: AlertTriangle,
  },
};

const CATEGORY_CONFIG: Record<
  ValidationCategory,
  { label: string; icon: any; description: string }
> = {
  'missing-required-fields': {
    label: 'Missing Required Fields',
    icon: FileText,
    description: 'Required fields that have not been completed',
  },
  'incomplete-assessments': {
    label: 'Incomplete Assessments',
    icon: Activity,
    description: 'Assessment sections that are partially completed',
  },
  'unsigned-orders': {
    label: 'Unsigned Orders',
    icon: Edit,
    description: 'Orders requiring physician signature',
  },
  'frequency-mismatches': {
    label: 'Frequency Mismatches',
    icon: Clock,
    description: 'Visit frequency does not match plan of care',
  },
  'missing-signatures': {
    label: 'Missing Physician Signatures',
    icon: UserX,
    description: 'Documents requiring physician signature',
  },
  'data-consistency': {
    label: 'Data Consistency',
    icon: AlertTriangle,
    description: 'Data inconsistencies across related fields',
  },
  'compliance-requirements': {
    label: 'Compliance Requirements',
    icon: CheckCircle,
    description: 'Regulatory compliance requirements',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QAValidationPanelProps {
  validationResult: ValidationResult;
  onFieldClick?: (fieldId: string, sectionName: string) => void;
  onAutoFix?: (issueId: string) => void;
  onRefresh?: () => void;
  mode?: 'full' | 'compact';
}

export default function QAValidationPanel({
  validationResult,
  onFieldClick,
  onAutoFix,
  onRefresh,
  mode = 'full',
}: QAValidationPanelProps) {
  const [filterSeverity, setFilterSeverity] = useState<ValidationSeverity | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ValidationCategory | 'all'>('all');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const filteredIssues = validationResult.issues.filter((issue) => {
    if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    return true;
  });

  const toggleIssueExpanded = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  if (mode === 'compact') {
    return <CompactValidationPanel validationResult={validationResult} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Validation Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            Automated quality and compliance checks
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-validate
        </Button>
      </div>

      {/* Summary */}
      <ValidationSummary validationResult={validationResult} />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex-1 flex items-center gap-3">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as ValidationSeverity | 'all')}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="major">Major Only</option>
              <option value="minor">Minor Only</option>
              <option value="warning">Warnings Only</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as ValidationCategory | 'all')}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">All Categories</option>
              <option value="missing-required-fields">Missing Required Fields</option>
              <option value="incomplete-assessments">Incomplete Assessments</option>
              <option value="unsigned-orders">Unsigned Orders</option>
              <option value="frequency-mismatches">Frequency Mismatches</option>
              <option value="missing-signatures">Missing Signatures</option>
              <option value="data-consistency">Data Consistency</option>
              <option value="compliance-requirements">Compliance Requirements</option>
            </select>

            <div className="text-sm text-gray-600">
              Showing {filteredIssues.length} of {validationResult.totalIssues} issues
            </div>
          </div>
        </div>
      </Card>

      {/* Issues by Category */}
      <div className="space-y-4">
        {Object.entries(
          filteredIssues.reduce((acc, issue) => {
            if (!acc[issue.category]) acc[issue.category] = [];
            acc[issue.category].push(issue);
            return acc;
          }, {} as Record<ValidationCategory, ValidationIssue[]>)
        ).map(([category, issues]) => (
          <ValidationCategorySection
            key={category}
            category={category as ValidationCategory}
            issues={issues}
            expandedIssues={expandedIssues}
            onToggleExpanded={toggleIssueExpanded}
            onFieldClick={onFieldClick}
            onAutoFix={onAutoFix}
          />
        ))}

        {filteredIssues.length === 0 && (
          <Card className="p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold text-gray-900 mb-1">No Issues Found</h3>
            <p className="text-sm text-gray-600">
              {filterSeverity !== 'all' || filterCategory !== 'all'
                ? 'No issues match the current filters'
                : 'All validation checks passed'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

function ValidationSummary({ validationResult }: { validationResult: ValidationResult }) {
  const statusConfig = {
    pass: { label: 'Pass', color: 'green', icon: CheckCircle },
    fail: { label: 'Fail', color: 'red', icon: XCircle },
    warning: { label: 'Warning', color: 'amber', icon: AlertTriangle },
  };

  const config = statusConfig[validationResult.overallStatus];
  const StatusIcon = config.icon;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              `bg-${config.color}-100`
            )}
          >
            <StatusIcon className={cn('w-6 h-6', `text-${config.color}-600`)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">Overall Status</h3>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  `bg-${config.color}-100 text-${config.color}-700 border-${config.color}-300`
                )}
              >
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Validated {new Date(validationResult.validatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            {validationResult.complianceScore}%
          </div>
          <div className="text-sm text-gray-600">Compliance Score</div>
        </div>
      </div>

      {/* Issue Counts */}
      <div className="grid grid-cols-4 gap-4">
        <IssueCountCard
          label="Critical"
          count={validationResult.criticalCount}
          severity="critical"
        />
        <IssueCountCard label="Major" count={validationResult.majorCount} severity="major" />
        <IssueCountCard label="Minor" count={validationResult.minorCount} severity="minor" />
        <IssueCountCard
          label="Warnings"
          count={validationResult.warningCount}
          severity="warning"
        />
      </div>
    </Card>
  );
}

function IssueCountCard({
  label,
  count,
  severity,
}: {
  label: string;
  count: number;
  severity: ValidationSeverity;
}) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-lg border p-3', config.bgClass, config.borderClass)}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('w-4 h-4', config.textClass)} />
        <span className={cn('text-xs font-medium', config.textClass)}>{label}</span>
      </div>
      <div className={cn('text-2xl font-bold', config.textClass)}>{count}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION CATEGORY SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationCategorySectionProps {
  category: ValidationCategory;
  issues: ValidationIssue[];
  expandedIssues: Set<string>;
  onToggleExpanded: (issueId: string) => void;
  onFieldClick?: (fieldId: string, sectionName: string) => void;
  onAutoFix?: (issueId: string) => void;
}

function ValidationCategorySection({
  category,
  issues,
  expandedIssues,
  onToggleExpanded,
  onFieldClick,
  onAutoFix,
}: ValidationCategorySectionProps) {
  const categoryConfig = CATEGORY_CONFIG[category];
  const CategoryIcon = categoryConfig.icon;

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <CategoryIcon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{categoryConfig.label}</h3>
          <p className="text-xs text-gray-600">{categoryConfig.description}</p>
        </div>
        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
          {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
        </Badge>
        {criticalCount > 0 && (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            {criticalCount} critical
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <ValidationIssueCard
            key={issue.id}
            issue={issue}
            isExpanded={expandedIssues.has(issue.id)}
            onToggleExpanded={() => onToggleExpanded(issue.id)}
            onFieldClick={onFieldClick}
            onAutoFix={onAutoFix}
          />
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ISSUE CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationIssueCardProps {
  issue: ValidationIssue;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onFieldClick?: (fieldId: string, sectionName: string) => void;
  onAutoFix?: (issueId: string) => void;
}

function ValidationIssueCard({
  issue,
  isExpanded,
  onToggleExpanded,
  onFieldClick,
  onAutoFix,
}: ValidationIssueCardProps) {
  const severityConfig = SEVERITY_CONFIG[issue.severity];
  const SeverityIcon = severityConfig.icon;

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        severityConfig.bgClass,
        severityConfig.borderClass
      )}
    >
      <div className="flex items-start gap-3">
        <SeverityIcon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', severityConfig.textClass)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={cn('text-xs', severityConfig.bgClass, severityConfig.textClass)}
                >
                  {severityConfig.label}
                </Badge>
              </div>
              <h4 className={cn('font-semibold mb-1', severityConfig.textClass)}>{issue.title}</h4>
              <p className="text-sm text-gray-700">{issue.description}</p>
            </div>

            <button
              onClick={onToggleExpanded}
              className="ml-4 p-1 hover:bg-white/50 rounded transition-colors"
            >
              <ChevronRight
                className={cn(
                  'w-5 h-5 transition-transform',
                  isExpanded && 'rotate-90',
                  severityConfig.textClass
                )}
              />
            </button>
          </div>

          {/* Field Link */}
          {issue.affectedField && (
            <button
              onClick={() =>
                onFieldClick?.(issue.affectedField!.fieldId, issue.affectedField!.sectionName)
              }
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mb-2"
            >
              <Edit className="w-3 h-3" />
              Go to {issue.affectedField.fieldName} in {issue.affectedField.sectionName}
            </button>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-3">
              {issue.recommendation && (
                <div className="bg-white rounded p-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Recommendation:</div>
                  <p className="text-sm text-gray-800">{issue.recommendation}</p>
                </div>
              )}

              {issue.relatedDocuments && issue.relatedDocuments.length > 0 && (
                <div className="bg-white rounded p-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Related Documents:</div>
                  <div className="flex flex-wrap gap-1">
                    {issue.relatedDocuments.map((doc, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-gray-100 text-gray-700 border-gray-300 text-xs"
                      >
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {issue.autoFixAvailable && onAutoFix && (
                <Button size="sm" variant="outline" onClick={() => onAutoFix(issue.id)}>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Auto-Fix Available
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT VALIDATION PANEL
// ═══════════════════════════════════════════════════════════════════════════

function CompactValidationPanel({ validationResult }: { validationResult: ValidationResult }) {
  const statusConfig = {
    pass: { color: 'green', icon: CheckCircle },
    fail: { color: 'red', icon: XCircle },
    warning: { color: 'amber', icon: AlertTriangle },
  };

  const config = statusConfig[validationResult.overallStatus];
  const StatusIcon = config.icon;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon className={cn('w-5 h-5', `text-${config.color}-600`)} />
          <div>
            <div className="font-semibold text-gray-900">Validation Status</div>
            <div className="text-xs text-gray-600">
              {validationResult.totalIssues} issues • {validationResult.complianceScore}% compliance
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {validationResult.criticalCount > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
              {validationResult.criticalCount} critical
            </Badge>
          )}
          {validationResult.majorCount > 0 && (
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
              {validationResult.majorCount} major
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockValidationResult(): ValidationResult {
  const issues: ValidationIssue[] = [
    {
      id: 'val-1',
      category: 'missing-required-fields',
      severity: 'critical',
      title: 'Blood Pressure Not Recorded',
      description: 'Blood pressure is a required vital sign for this visit type but has not been documented.',
      affectedField: {
        fieldId: 'field-bp',
        fieldName: 'Blood Pressure',
        sectionName: 'Vital Signs',
      },
      recommendation: 'Enter the blood pressure reading taken during this visit. If not measured, document the clinical reason.',
    },
    {
      id: 'val-2',
      category: 'incomplete-assessments',
      severity: 'major',
      title: 'OASIS M1400 Incomplete',
      description: 'OASIS item M1400 (vision) has not been completed. This is required for recertification.',
      affectedField: {
        fieldId: 'field-m1400',
        fieldName: 'M1400 - Vision',
        sectionName: 'OASIS Assessment',
      },
      recommendation: 'Complete the vision assessment based on patient observation and functional ability.',
    },
    {
      id: 'val-3',
      category: 'unsigned-orders',
      severity: 'critical',
      title: 'Verbal Order Requires Signature',
      description: 'Verbal order for Lasix 40mg daily has not been signed by physician within required 21-day timeframe.',
      affectedField: {
        fieldId: 'field-vo-123',
        fieldName: 'Verbal Order VO-2024-223',
        sectionName: 'Physician Orders',
      },
      recommendation: 'Obtain physician signature immediately. Order will expire in 3 days.',
      relatedDocuments: ['VO-2024-223'],
    },
    {
      id: 'val-4',
      category: 'frequency-mismatches',
      severity: 'major',
      title: 'Visit Frequency Does Not Match 485',
      description: 'Current visit frequency (2x/week) does not match Plan of Care (3x/week SN).',
      recommendation: 'Either update visit schedule to match 485 or obtain physician order to modify frequency and update 485.',
      relatedDocuments: ['485-2024-078'],
    },
    {
      id: 'val-5',
      category: 'missing-signatures',
      severity: 'critical',
      title: 'Plan of Care Not Physician Signed',
      description: 'Plan of Care (485) requires physician signature before certification can be submitted.',
      affectedField: {
        fieldId: 'field-485-sig',
        fieldName: 'Physician Signature',
        sectionName: 'Plan of Care (485)',
      },
      recommendation: 'Send 485 to physician for signature and review.',
      relatedDocuments: ['485-2024-078'],
    },
    {
      id: 'val-6',
      category: 'data-consistency',
      severity: 'minor',
      title: 'Medication List Inconsistency',
      description: 'Medication list in visit note differs from most recent medication reconciliation.',
      recommendation: 'Verify current medications with patient and update reconciliation if changes occurred.',
    },
    {
      id: 'val-7',
      category: 'compliance-requirements',
      severity: 'warning',
      title: 'Visit Note Approaching Late Submission',
      description: 'Visit note must be completed within 5 days. Current status: 4 days since visit.',
      recommendation: 'Complete and submit visit note today to avoid late documentation flag.',
    },
  ];

  return {
    documentId: 'VN-2024-445',
    documentType: 'Visit Note',
    validatedAt: new Date().toISOString(),
    totalIssues: issues.length,
    criticalCount: issues.filter((i) => i.severity === 'critical').length,
    majorCount: issues.filter((i) => i.severity === 'major').length,
    minorCount: issues.filter((i) => i.severity === 'minor').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
    issues,
    overallStatus: 'fail',
    complianceScore: 68,
  };
}
