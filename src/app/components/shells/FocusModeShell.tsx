/**
 * Focus Mode Shell
 * 
 * Minimalist shell for high-concentration workflows.
 * Reduces visual distractions while preserving essential context.
 * 
 * Use Cases:
 * - Clinical documentation
 * - OASIS/HOPE assessments
 * - Plan of care editing
 * - Medication reconciliation
 * - QA review
 * - Complex form completion
 * 
 * Features:
 * - Minimal chrome
 * - Preserved patient/admission context
 * - Progress tracking
 * - Validation feedback
 * - Quick exit to full view
 * 
 * Performance:
 * - Optimized re-renders
 * - Memoized components
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  X,
  Minimize2,
  Maximize2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ContextInfo {
  label: string;
  value: string | ReactNode;
  onClick?: () => void;
}

interface FocusModeShellProps {
  /** Main content */
  children: ReactNode;
  
  /** Document/workflow title */
  title: string;
  
  /** Document type */
  documentType?: string;
  
  /** Patient context (minimal) */
  patientContext?: ContextInfo[];
  
  /** Admission context (minimal) */
  admissionContext?: ContextInfo[];
  
  /** Progress (0-100) */
  progress?: number;
  
  /** Current section/step */
  currentSection?: string;
  
  /** Total sections/steps */
  totalSections?: number;
  
  /** Validation summary */
  validation?: {
    errors: number;
    warnings: number;
  };
  
  /** Save handler */
  onSave?: () => void | Promise<void>;
  
  /** Submit handler */
  onSubmit?: () => void | Promise<void>;
  
  /** Exit focus mode */
  onExit: () => void;
  
  /** Toggle context visibility */
  showContext?: boolean;
  
  /** Saving state */
  saving?: boolean;
  
  /** Submitting state */
  submitting?: boolean;
  
  /** Last saved */
  lastSaved?: string;
  
  /** Navigation */
  onPrevious?: () => void;
  
  /** Navigation */
  onNext?: () => void;
  
  /** Can navigate previous */
  canGoPrevious?: boolean;
  
  /** Can navigate next */
  canGoNext?: boolean;
  
  /** Footer content (replaces default) */
  customFooter?: ReactNode;
  
  /** Show validation */
  showValidation?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const FocusModeShell = memo(function FocusModeShell({
  children,
  title,
  documentType,
  patientContext,
  admissionContext,
  progress,
  currentSection,
  totalSections,
  validation,
  onSave,
  onSubmit,
  onExit,
  showContext: initialShowContext = true,
  saving = false,
  submitting = false,
  lastSaved,
  onPrevious,
  onNext,
  canGoPrevious = true,
  canGoNext = true,
  customFooter,
  showValidation = true,
}: FocusModeShellProps) {
  const [showContext, setShowContext] = useState(initialShowContext);

  const toggleContext = useCallback(() => {
    setShowContext(prev => !prev);
  }, []);

  const hasErrors = validation && validation.errors > 0;
  const hasWarnings = validation && validation.warnings > 0;
  const canSubmit = !hasErrors && !saving && !submitting;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Minimal Header */}
      <header className="flex-shrink-0 border-b bg-white">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title & Context Toggle */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                    {title}
                  </h1>
                  {documentType && (
                    <Badge variant="outline" className="text-xs">
                      {documentType}
                    </Badge>
                  )}
                </div>
                
                {/* Progress */}
                {progress !== undefined && (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 max-w-xs">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {Math.round(progress)}%
                      {currentSection && totalSections && (
                        <span className="ml-2">
                          ({currentSection} / {totalSections})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Context Toggle */}
              {(patientContext || admissionContext) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleContext}
                >
                  {showContext ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  Context
                </Button>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Last Saved */}
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
                      {lastSaved}
                    </>
                  )}
                </span>
              )}

              {/* Exit Focus Mode */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-gray-600"
              >
                <X className="w-4 h-4 mr-2" />
                Exit Focus Mode
              </Button>
            </div>
          </div>
        </div>

        {/* Context Bar (collapsible) */}
        {showContext && (patientContext || admissionContext) && (
          <div className="px-6 py-2 bg-gray-50 border-t">
            <div className="flex items-center gap-6 text-sm">
              {/* Patient Context */}
              {patientContext && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Patient
                  </span>
                  {patientContext.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      disabled={!item.onClick}
                      className={cn(
                        'flex items-center gap-1',
                        item.onClick && 'hover:text-blue-600 cursor-pointer'
                      )}
                    >
                      <span className="text-gray-600">{item.label}:</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Admission Context */}
              {admissionContext && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Admission
                  </span>
                  {admissionContext.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      disabled={!item.onClick}
                      className={cn(
                        'flex items-center gap-1',
                        item.onClick && 'hover:text-blue-600 cursor-pointer'
                      )}
                    >
                      <span className="text-gray-600">{item.label}:</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {children}
        </div>
        
        {/* Spacer for footer */}
        <div className="h-20" />
      </main>

      {/* Minimal Footer */}
      <footer className="flex-shrink-0 border-t bg-white sticky bottom-0">
        {customFooter || (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Validation */}
              <div className="flex items-center gap-4">
                {showValidation && validation && (
                  <>
                    {hasErrors && (
                      <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        {validation.errors} {validation.errors === 1 ? 'error' : 'errors'}
                      </span>
                    )}
                    {hasWarnings && (
                      <span className="flex items-center gap-1 text-sm text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        {validation.warnings} {validation.warnings === 1 ? 'warning' : 'warnings'}
                      </span>
                    )}
                    {!hasErrors && !hasWarnings && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        No validation issues
                      </span>
                    )}
                  </>
                )}

                {/* Navigation */}
                {(onPrevious || onNext) && (
                  <div className="flex items-center gap-2">
                    {onPrevious && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onPrevious}
                        disabled={!canGoPrevious || saving || submitting}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                    )}
                    {onNext && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onNext}
                        disabled={!canGoNext || saving || submitting}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                {onSave && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSave}
                    disabled={saving || submitting}
                  >
                    {saving ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Draft'
                    )}
                  </Button>
                )}

                {onSubmit && (
                  <Button
                    size="sm"
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
});

FocusModeShell.displayName = 'FocusModeShell';

export default FocusModeShell;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
<FocusModeShell
  title="Skilled Nursing Visit Note"
  documentType="Visit Documentation"
  patientContext={[
    { label: 'Name', value: 'Sarah Johnson' },
    { label: 'MRN', value: '123456' },
    { label: 'Age', value: '74y' },
  ]}
  admissionContext={[
    { label: 'SOC', value: '01/15/2026' },
    { label: 'Day', value: '45' },
    { label: 'Payer', value: 'Medicare' },
  ]}
  progress={65}
  currentSection="3"
  totalSections="5"
  validation={{ errors: 2, warnings: 5 }}
  onSave={handleSave}
  onSubmit={handleSubmit}
  onExit={() => setFocusMode(false)}
  onPrevious={goToPreviousSection}
  onNext={goToNextSection}
  lastSaved="2 minutes ago"
  saving={isSaving}
>
  <VisitNoteForm data={formData} onChange={setFormData} />
</FocusModeShell>
*/
