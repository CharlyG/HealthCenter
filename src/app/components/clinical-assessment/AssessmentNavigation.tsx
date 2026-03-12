/**
 * Assessment Navigation Component
 * Left sidebar showing sections and progress
 */

import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '../ui/utils';
import type { AssessmentSection, AssessmentProgress, SectionStatus } from './types';

interface AssessmentNavigationProps {
  sections: AssessmentSection[];
  activeSection: string;
  sectionProgress: AssessmentProgress;
  formData: Record<string, any>;
  onSectionClick: (sectionId: string) => void;
}

export function AssessmentNavigation({
  sections,
  activeSection,
  sectionProgress,
  formData,
  onSectionClick,
}: AssessmentNavigationProps) {
  const getSectionStatus = (section: AssessmentSection): SectionStatus => {
    const sectionQuestions = section.questions;
    const answeredCount = sectionQuestions.filter(q => 
      formData[q.id] !== undefined && formData[q.id] !== ''
    ).length;
    const requiredCount = sectionQuestions.filter(q => q.required).length;
    const answeredRequiredCount = sectionQuestions.filter(q => 
      q.required && formData[q.id] !== undefined && formData[q.id] !== ''
    ).length;

    if (answeredCount === 0) {
      return 'not-started';
    } else if (answeredRequiredCount === requiredCount) {
      return 'completed';
    } else {
      return 'in-progress';
    }
  };

  const getSectionCompletionPercentage = (section: AssessmentSection): number => {
    const totalQuestions = section.questions.length;
    const answeredQuestions = section.questions.filter(q => 
      formData[q.id] !== undefined && formData[q.id] !== ''
    ).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Assessment Sections</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span>{sectionProgress.completedSections} Complete</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>{sectionProgress.inProgressSections} In Progress</span>
          </div>
        </div>
      </div>

      {/* Section List */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {sections.map((section, index) => {
            const status = getSectionStatus(section);
            const percentage = getSectionCompletionPercentage(section);
            const isActive = section.id === activeSection;

            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg transition-all',
                  'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isActive && 'bg-blue-50 border-2 border-blue-600',
                  !isActive && 'border-2 border-transparent'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="mt-0.5">
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : status === 'in-progress' ? (
                      <Clock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Section Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {index + 1}
                      </span>
                      <h4 className={cn(
                        'text-sm font-semibold truncate',
                        isActive ? 'text-blue-900' : 'text-gray-900'
                      )}>
                        {section.title}
                      </h4>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{percentage}% complete</span>
                        <span>{section.questions.length} questions</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',
                            status === 'completed' ? 'bg-green-600' :
                            status === 'in-progress' ? 'bg-blue-600' : 'bg-gray-300'
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overall Progress Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Overall Progress</span>
              <span className="font-semibold text-gray-900">
                {sectionProgress.percentComplete}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  sectionProgress.readyForSubmission ? 'bg-green-600' : 'bg-blue-600'
                )}
                style={{ width: `${sectionProgress.percentComplete}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded-lg p-2">
              <p className="text-gray-600 mb-1">Questions</p>
              <p className="font-semibold text-gray-900">
                {sectionProgress.answeredQuestions} / {sectionProgress.totalQuestions}
              </p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <p className="text-gray-600 mb-1">Required</p>
              <p className="font-semibold text-gray-900">
                {sectionProgress.answeredRequiredQuestions} / {sectionProgress.requiredQuestions}
              </p>
            </div>
          </div>

          {sectionProgress.readyForSubmission && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 font-medium">
                Ready for submission
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
