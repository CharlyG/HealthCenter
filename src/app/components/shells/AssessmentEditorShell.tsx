/**
 * Assessment Editor Shell
 * 
 * Optimized layout for structured clinical assessments.
 * Designed for: OASIS-E, HOPE, Recertification, Discharge assessments.
 * 
 * Features:
 * - Section-based navigation
 * - Question-by-question progression
 * - Conditional logic support
 * - Dynamic validation
 * - Progress tracking
 * - Auto-save
 * - Skip logic visualization
 * 
 * Performance:
 * - Lazy-loaded sections
 * - Memoized question components
 * - Debounced validation
 */

import { memo, ReactNode, useState, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Info,
  X,
  SkipForward,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface AssessmentSection {
  id: string;
  code?: string;
  title: string;
  description?: string;
  required?: boolean;
  questionsTotal: number;
  questionsAnswered: number;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  skipped?: boolean;
}

interface ValidationMessage {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  questionId?: string;
  onClick?: () => void;
}

interface SkipLogicInfo {
  skippedQuestions: number;
  reason: string;
}

interface AssessmentEditorShellProps {
  /** Assessment title */
  title: string;
  
  /** Assessment type */
  assessmentType: string;
  
  /** Patient name */
  patientName?: string;
  
  /** Assessment sections */
  sections: AssessmentSection[];
  
  /** Active section ID */
  activeSection: string;
  
  /** Section change handler */
  onSectionChange: (sectionId: string) => void;
  
  /** Go to next section */
  onNextSection?: () => void;
  
  /** Go to previous section */
  onPreviousSection?: () => void;
  
  /** Main content (questions) */
  children: ReactNode;
  
  /** Validation messages for current section */
  validationMessages?: ValidationMessage[];
  
  /** Overall progress (0-100) */
  progress: number;
  
  /** Current question number */
  currentQuestion?: number;
  
  /** Total questions */
  totalQuestions?: number;
  
  /** Skip logic information */
  skipLogic?: SkipLogicInfo;
  
  /** Save handler */
  onSave?: () => void | Promise<void>;
  
  /** Submit handler */
  onSubmit?: () => void | Promise<void>;
  
  /** Cancel handler */
  onCancel?: () => void;
  
  /** Saving state */
  saving?: boolean;
  
  /** Submitting state */
  submitting?: boolean;
  
  /** Has unsaved changes */
  hasUnsavedChanges?: boolean;
  
  /** Last saved timestamp */
  lastSaved?: string;
  
  /** Assessment status */
  status?: 'draft' | 'in-progress' | 'complete' | 'locked';
  
  /** Show validation panel */
  showValidation?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Header actions */
  headerActions?: ReactNode;
}

const AssessmentEditorShell = memo(function AssessmentEditorShell({
  title,
  assessmentType,
  patientName,
  sections,
  activeSection,
  onSectionChange,
  onNextSection,
  onPreviousSection,
  children,
  validationMessages = [],
  progress,
  currentQuestion,
  totalQuestions,
  skipLogic,
  onSave,
  onSubmit,
  onCancel,
  saving = false,
  submitting = false,
  hasUnsavedChanges = false,
  lastSaved,
  status = 'draft',
  showValidation = true,
  compact = false,
  headerActions,
}: AssessmentEditorShellProps) {
  const [validationOpen, setValidationOpen] = useState(validationMessages.length > 0);

  const toggleValidation = useCallback(() => {
    setValidationOpen(prev => !prev);
  }, []);

  // Find current section index
  const currentSectionIndex = useMemo(() => {
    return sections.findIndex(s => s.id === activeSection);
  }, [sections, activeSection]);

  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Count validation issues
  const errorCount = validationMessages.filter(v => v.type === 'error').length;
  const warningCount = validationMessages.filter(v => v.type === 'warning').length;

  // Calculate section completion
  const completedSections = sections.filter(s => 
    s.questionsAnswered === s.questionsTotal && !s.hasErrors
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Assessment Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                  <p className="text-sm text-gray-600">{assessmentType}</p>
                </div>
              </div>
              {patientName && (
                <div className="text-sm text-gray-700">
                  Patient: <span className="font-medium">{patientName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  {saving ? (
                    <>
                      <Clock className="w-3 h-3 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Saved {lastSaved}
                    </>
                  )}
                </span>
              )}
              {headerActions}
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-3">
            {/* Overall Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  Overall Progress: {Math.round(progress)}%
                </span>
                <span className="text-xs text-gray-600">
                  {completedSections} of {sections.length} sections complete
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current Section Progress */}
            {currentQuestion !== undefined && totalQuestions !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  Question {currentQuestion} of {totalQuestions}
                </span>
                {skipLogic && skipLogic.skippedQuestions > 0 && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <SkipForward className="w-3 h-3" />
                    <span className="text-xs">
                      {skipLogic.skippedQuestions} skipped ({skipLogic.reason})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Section Sidebar */}
        <aside className="w-72 bg-white border-r flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Assessment Sections
            </h2>
            <nav className="space-y-1">
              {sections.map((section, index) => {
                const completionPercent = section.questionsTotal > 0
                  ? (section.questionsAnswered / section.questionsTotal) * 100
                  : 0;

                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionChange(section.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border-2 transition-all',
                      activeSection === section.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    {/* Section Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {section.code && (
                            <span className="text-xs font-mono text-gray-500">
                              {section.code}
                            </span>
                          )}
                          {section.required && (
                            <span className="text-red-500 text-xs">*</span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-1">
                          {section.title}
                        </div>
                      </div>
                      
                      {/* Status Icon */}
                      <div>
                        {section.hasErrors ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : section.skipped ? (
                          <SkipForward className="w-4 h-4 text-amber-500" />
                        ) : completionPercent === 100 ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : null}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all duration-300',
                            section.hasErrors ? 'bg-red-500' :
                            completionPercent === 100 ? 'bg-green-500' :
                            'bg-blue-500'
                          )}
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        {section.questionsAnswered} / {section.questionsTotal} answered
                      </div>
                    </div>

                    {section.description && (
                      <p className="text-xs text-gray-500 mt-2">
                        {section.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Question Panel */}
        <main className="flex-1 overflow-y-auto">
          <div className={cn(
            'px-8 py-6',
            !compact && 'max-w-3xl mx-auto'
          )}>
            {children}
          </div>
          
          {/* Spacer for footer */}
          <div className="h-24" />
        </main>

        {/* Validation Panel */}
        {showValidation && validationMessages.length > 0 && (
          <aside
            className={cn(
              'w-80 bg-white border-l flex-shrink-0 overflow-y-auto transition-all duration-200',
              !validationOpen && 'w-0 border-0'
            )}
          >
            {validationOpen && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Validation
                  </h2>
                  <button
                    onClick={toggleValidation}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {validationMessages.map((msg) => {
                    const typeConfig = {
                      error: { 
                        bg: 'bg-red-50', 
                        border: 'border-red-200',
                        icon: AlertTriangle,
                        iconColor: 'text-red-600'
                      },
                      warning: { 
                        bg: 'bg-amber-50', 
                        border: 'border-amber-200',
                        icon: AlertTriangle,
                        iconColor: 'text-amber-600'
                      },
                      info: { 
                        bg: 'bg-blue-50', 
                        border: 'border-blue-200',
                        icon: Info,
                        iconColor: 'text-blue-600'
                      },
                    };

                    const config = typeConfig[msg.type];
                    const Icon = config.icon;

                    return (
                      <button
                        key={msg.id}
                        onClick={msg.onClick}
                        className={cn(
                          'w-full text-left p-3 rounded-lg border',
                          config.bg,
                          config.border,
                          msg.onClick && 'hover:shadow-sm cursor-pointer'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={cn('w-4 h-4 mt-0.5', config.iconColor)} />
                          <div className="flex-1 text-xs text-gray-900">
                            {msg.message}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Validation Toggle (when closed) */}
        {showValidation && validationMessages.length > 0 && !validationOpen && (
          <button
            onClick={toggleValidation}
            className="fixed right-0 top-32 w-10 h-20 bg-white border border-r-0 rounded-l-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 transition-colors z-30"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 mb-1" />
            <span className="text-xs font-semibold text-red-600">
              {validationMessages.length}
            </span>
          </button>
        )}
      </div>

      {/* Sticky Action Footer */}
      <div className="bg-white border-t sticky bottom-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onPreviousSection}
                disabled={isFirstSection || saving || submitting}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              {!isLastSection && onNextSection && (
                <Button
                  variant="outline"
                  onClick={onNextSection}
                  disabled={saving || submitting}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Center: Validation Status */}
            <div className="flex items-center gap-3 text-sm">
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
                </span>
              )}
            </div>

            {/* Right: Save/Submit */}
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={saving || submitting}
                >
                  Cancel
                </Button>
              )}
              
              {onSave && (
                <Button
                  variant="outline"
                  onClick={onSave}
                  disabled={saving || submitting}
                >
                  {saving ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              )}
              
              {onSubmit && (
                <Button
                  onClick={onSubmit}
                  disabled={saving || submitting || errorCount > 0 || progress < 100}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Assessment
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AssessmentEditorShell.displayName = 'AssessmentEditorShell';

export default AssessmentEditorShell;
