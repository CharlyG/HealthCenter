/**
 * OASIS SECTION NAVIGATION
 * 
 * Left sidebar navigation for OASIS sections with completion tracking
 * Color-coded for errors, warnings, and completion status
 */

import { CheckCircle2, Circle, AlertCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import type { OasisSection } from '../../types/oasis';

interface OasisSectionNavProps {
  sections: OasisSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  mode?: 'normal' | 'review-errors'; // Review mode shows only sections with errors
}

export function OasisSectionNav({
  sections,
  activeSection,
  onSectionChange,
  mode = 'normal',
}: OasisSectionNavProps) {
  const displaySections =
    mode === 'review-errors' ? sections.filter((s) => s.validationErrors > 0) : sections;

  return (
    <nav className="space-y-1">
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Sections
        </span>
        {mode === 'review-errors' && (
          <span className="text-xs text-red-600 font-medium">
            Showing errors only
          </span>
        )}
      </div>

      {/* Progress Summary */}
      <div className="px-3 py-2 bg-gray-50 rounded-lg mx-2 mb-2">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span>Completed:</span>
            <span className="font-medium text-green-600">
              {sections.filter((s) => s.isComplete).length} / {sections.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Errors:</span>
            <span className="font-medium text-red-600">
              {sections.reduce((sum, s) => sum + s.validationErrors, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Warnings:</span>
            <span className="font-medium text-amber-600">
              {sections.reduce((sum, s) => sum + s.validationWarnings, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Section List */}
      {displaySections.map((section) => {
        const isActive = section.id === activeSection;
        const hasErrors = section.validationErrors > 0;
        const hasWarnings = section.validationWarnings > 0;
        const isComplete = section.isComplete;

        // Determine color theme
        let colorClass = 'text-gray-700 hover:bg-gray-50';
        let borderClass = '';
        let iconColor = 'text-gray-400';

        if (isActive) {
          if (hasErrors) {
            colorClass = 'bg-red-50 text-red-900';
            borderClass = 'border-l-4 border-red-600';
            iconColor = 'text-red-600';
          } else if (hasWarnings) {
            colorClass = 'bg-amber-50 text-amber-900';
            borderClass = 'border-l-4 border-amber-600';
            iconColor = 'text-amber-600';
          } else if (isComplete) {
            colorClass = 'bg-green-50 text-green-900';
            borderClass = 'border-l-4 border-green-600';
            iconColor = 'text-green-600';
          } else {
            colorClass = 'bg-blue-50 text-blue-900';
            borderClass = 'border-l-4 border-blue-600';
            iconColor = 'text-blue-600';
          }
        } else {
          if (hasErrors) {
            iconColor = 'text-red-600';
          } else if (hasWarnings) {
            iconColor = 'text-amber-600';
          } else if (isComplete) {
            iconColor = 'text-green-600';
          }
        }

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${colorClass} ${borderClass}`}
          >
            <div className="flex items-start gap-2">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {hasErrors ? (
                  <AlertCircle className={`w-4 h-4 ${iconColor}`} />
                ) : hasWarnings ? (
                  <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
                ) : isComplete ? (
                  <CheckCircle2 className={`w-4 h-4 ${iconColor}`} />
                ) : (
                  <Circle className={`w-4 h-4 ${iconColor}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{section.title}</p>
                    <p className="text-xs opacity-75 mt-0.5">{section.subtitle}</p>
                  </div>
                  {isActive && <ChevronRight className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 mt-1.5 text-xs">
                  {/* M-Item Range */}
                  <span className="opacity-75">{section.mItemRange}</span>

                  {/* Completion */}
                  {!isComplete && (
                    <span className="opacity-75">
                      {section.completedItems}/{section.itemCount}
                    </span>
                  )}

                  {/* Errors/Warnings */}
                  {hasErrors && (
                    <span className="font-medium text-red-600">
                      {section.validationErrors} error{section.validationErrors !== 1 ? 's' : ''}
                    </span>
                  )}
                  {hasWarnings && !hasErrors && (
                    <span className="font-medium text-amber-600">
                      {section.validationWarnings} warning{section.validationWarnings !== 1 ? 's' : ''}
                    </span>
                  )}

                  {/* Required */}
                  {section.isRequired && !isComplete && (
                    <span className="text-red-600 font-medium">Required</span>
                  )}

                  {/* Time estimate */}
                  {!isComplete && !hasErrors && (
                    <span className="opacity-60">~{section.estimatedTime}</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {mode === 'review-errors' && displaySections.length === 0 && (
        <div className="px-3 py-4 text-center text-sm text-gray-600">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p>No validation errors!</p>
        </div>
      )}
    </nav>
  );
}
