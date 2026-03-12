/**
 * ASSESSMENT SECTION NAVIGATION
 * 
 * Left sidebar navigation for assessment sections
 * Shows completion status and validation errors
 */

import { CheckCircle2, Circle, AlertCircle, ChevronRight } from 'lucide-react';
import type { AssessmentSection } from '../../types/assessment';

interface AssessmentSectionNavProps {
  sections: AssessmentSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export function AssessmentSectionNav({
  sections,
  activeSection,
  onSectionChange,
}: AssessmentSectionNavProps) {
  return (
    <nav className="space-y-1">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Sections
      </div>
      {sections.map((section) => {
        const isActive = section.id === activeSection;
        const isComplete = section.completionStatus === 'complete';
        const hasErrors = section.validationErrors > 0;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-start gap-2">
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : hasErrors ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {section.title}
                    </p>
                    {section.subtitle && (
                      <p className="text-xs text-gray-600 mt-0.5">{section.subtitle}</p>
                    )}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 mt-1 text-xs">
                  {section.required && (
                    <span className="text-red-600 font-medium">Required</span>
                  )}
                  {hasErrors && (
                    <span className="text-red-600">
                      {section.validationErrors} error{section.validationErrors !== 1 ? 's' : ''}
                    </span>
                  )}
                  {section.estimatedTime && !hasErrors && (
                    <span className="text-gray-500">~{section.estimatedTime}</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
