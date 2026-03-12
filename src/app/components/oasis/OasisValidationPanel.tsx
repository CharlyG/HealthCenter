/**
 * OASIS VALIDATION PANEL
 * 
 * Real-time validation display for OASIS assessments
 * Groups issues by section and supports navigation to errors
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import type { OasisValidationIssue, OasisSection } from '../../types/oasis';

interface OasisValidationPanelProps {
  issues: OasisValidationIssue[];
  sections: OasisSection[];
  percentComplete: number;
  onNavigateToIssue?: (issue: OasisValidationIssue) => void;
  onNavigateToSection?: (sectionId: string) => void;
}

export function OasisValidationPanel({
  issues,
  sections,
  percentComplete,
  onNavigateToIssue,
  onNavigateToSection,
}: OasisValidationPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  // Group issues by section
  const issuesBySection = issues.reduce((acc, issue) => {
    if (!acc[issue.section]) {
      acc[issue.section] = [];
    }
    acc[issue.section].push(issue);
    return acc;
  }, {} as Record<string, OasisValidationIssue[]>);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isComplete = percentComplete === 100;
  const isValid = errors.length === 0;

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Assessment Status</h3>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Completion</span>
            <span className="font-medium text-gray-900">{percentComplete}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isComplete ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        {isComplete && isValid ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-900">Ready to Submit</p>
              <p className="text-green-700 text-xs mt-0.5">
                All required items complete and validated
              </p>
            </div>
          </div>
        ) : errors.length > 0 ? (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-900">
                {errors.length} Validation Error{errors.length !== 1 ? 's' : ''}
              </p>
              <p className="text-red-700 text-xs mt-0.5">
                Please resolve all errors before submitting
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">In Progress</p>
              <p className="text-blue-700 text-xs mt-0.5">
                Continue completing required items
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Summary */}
      {issues.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Validation Issues</h3>

          {/* Summary Badges */}
          <div className="flex items-center gap-2 mb-4">
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

          {/* Issues by Section */}
          <div className="space-y-2">
            {Object.entries(issuesBySection).map(([sectionId, sectionIssues]) => {
              const section = sections.find((s) => s.id === sectionId);
              const isExpanded = expandedSections.has(sectionId);
              const sectionErrors = sectionIssues.filter((i) => i.severity === 'error');

              return (
                <div key={sectionId} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(sectionId)}
                    className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {section?.title || sectionId}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          sectionErrors.length > 0
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {sectionIssues.length}
                      </Badge>
                    </div>
                    {onNavigateToSection && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToSection(sectionId);
                        }}
                        className="h-6 text-xs"
                      >
                        Go to Section
                      </Button>
                    )}
                  </button>

                  {/* Section Issues */}
                  {isExpanded && (
                    <div className="p-3 space-y-2 bg-white">
                      {sectionIssues.map((issue) => (
                        <ValidationIssueItem
                          key={issue.id}
                          issue={issue}
                          onNavigate={onNavigateToIssue}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expand All / Collapse All */}
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandedSections(new Set(Object.keys(issuesBySection)))}
              className="text-xs"
            >
              Expand All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandedSections(new Set())}
              className="text-xs"
            >
              Collapse All
            </Button>
          </div>
        </div>
      )}

      {/* Section Status Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Section Status</h3>
        <div className="space-y-2">
          {sections.map((section) => {
            const hasErrors = section.validationErrors > 0;
            const hasWarnings = section.validationWarnings > 0;
            const isComplete = section.isComplete;

            return (
              <div
                key={section.id}
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : hasErrors ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : hasWarnings ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm text-gray-900">{section.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasErrors > 0 && (
                    <Badge variant="outline" className="text-xs text-red-700 border-red-300">
                      {section.validationErrors} error{section.validationErrors !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {!hasErrors && hasWarnings > 0 && (
                    <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                      {section.validationWarnings} warning{section.validationWarnings !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {isComplete && !hasErrors && !hasWarnings && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ValidationIssueItem({
  issue,
  onNavigate,
}: {
  issue: OasisValidationIssue;
  onNavigate?: (issue: OasisValidationIssue) => void;
}) {
  const severityConfig = {
    error: {
      icon: AlertCircle,
      bgClass: 'bg-red-50',
      borderClass: 'border-red-200',
      textClass: 'text-red-700',
      iconClass: 'text-red-600',
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      textClass: 'text-amber-700',
      iconClass: 'text-amber-600',
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-700',
      iconClass: 'text-blue-600',
    },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <div className={`border rounded p-2 ${config.bgClass} ${config.borderClass}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1">
              <p className={`text-xs font-medium ${config.textClass}`}>
                {issue.mItem}: {issue.mItemTitle}
              </p>
              <p className="text-xs text-gray-700 mt-0.5">{issue.message}</p>
              {issue.skipLogic && (
                <p className="text-xs text-gray-600 mt-1 italic">Skip Logic: {issue.skipLogic}</p>
              )}
            </div>
          </div>
          {onNavigate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate(issue)}
              className="h-6 text-xs mt-1"
            >
              Go to Item
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
