/**
 * ASSESSMENT VALIDATION PANEL
 * 
 * Real-time validation display with errors, warnings, and info messages
 * Supports auto-fix and navigation to issues
 */

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Wrench } from 'lucide-react';
import type { ValidationIssue } from '../../types/assessment';

interface AssessmentValidationPanelProps {
  issues: ValidationIssue[];
  onNavigateToIssue?: (issue: ValidationIssue) => void;
  onAutoFix?: (issue: ValidationIssue) => void;
  isValid: boolean;
  percentComplete: number;
}

export function AssessmentValidationPanel({
  issues,
  onNavigateToIssue,
  onAutoFix,
  isValid,
  percentComplete,
}: AssessmentValidationPanelProps) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  return (
    <div className="space-y-4">
      {/* Completion Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Completion Status</h3>
          <span className="text-sm font-medium text-gray-900">{percentComplete}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        {isValid ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Ready to submit</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{errors.length} issue{errors.length !== 1 ? 's' : ''} to resolve</span>
          </div>
        )}
      </div>

      {/* Validation Issues */}
      {issues.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Validation Issues</h3>

          {/* Summary */}
          <div className="flex items-center gap-3 mb-4">
            {errors.length > 0 && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                {errors.length} Error{errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {warnings.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {infos.length > 0 && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                {infos.length} Info
              </Badge>
            )}
          </div>

          {/* Issue List */}
          <div className="space-y-2">
            {errors.map((issue) => (
              <ValidationIssueItem
                key={issue.id}
                issue={issue}
                onNavigate={onNavigateToIssue}
                onAutoFix={onAutoFix}
              />
            ))}
            {warnings.map((issue) => (
              <ValidationIssueItem
                key={issue.id}
                issue={issue}
                onNavigate={onNavigateToIssue}
                onAutoFix={onAutoFix}
              />
            ))}
            {infos.map((issue) => (
              <ValidationIssueItem
                key={issue.id}
                issue={issue}
                onNavigate={onNavigateToIssue}
                onAutoFix={onAutoFix}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Issues */}
      {issues.length === 0 && percentComplete === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900">Assessment Complete</h4>
              <p className="text-sm text-green-700 mt-1">
                All required fields are complete and validated. Ready to submit for signature.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ValidationIssueItem({
  issue,
  onNavigate,
  onAutoFix,
}: {
  issue: ValidationIssue;
  onNavigate?: (issue: ValidationIssue) => void;
  onAutoFix?: (issue: ValidationIssue) => void;
}) {
  const severityConfig = {
    error: {
      icon: AlertCircle,
      color: 'red',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-200',
      textClass: 'text-red-700',
      iconClass: 'text-red-600',
    },
    warning: {
      icon: AlertTriangle,
      color: 'amber',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      textClass: 'text-amber-700',
      iconClass: 'text-amber-600',
    },
    info: {
      icon: Info,
      color: 'blue',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-700',
      iconClass: 'text-blue-600',
    },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div className={`border rounded-lg p-3 ${config.bgClass} ${config.borderClass}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <p className={`text-sm font-medium ${config.textClass}`}>{issue.message}</p>
              <p className="text-xs text-gray-600 mt-1">
                {issue.section} → {issue.field}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {onNavigate && (
              <Button size="sm" variant="outline" onClick={() => onNavigate(issue)} className="h-7 text-xs">
                Go to Field
              </Button>
            )}
            {issue.autoFixable && onAutoFix && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAutoFix(issue)}
                className="h-7 text-xs"
              >
                <Wrench className="w-3 h-3 mr-1" />
                Auto-Fix
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
