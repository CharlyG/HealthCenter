/**
 * Document Editor Shell
 * 
 * Reusable layout for complex clinical documentation forms.
 * Supports visit notes, assessments, orders, plan of care, recertification docs.
 * 
 * Features:
 * - Section navigation sidebar for long forms
 * - Progress indicator showing completion
 * - Live validation panel
 * - Sticky action footer with save/submit
 * - Auto-save support
 * - Unsaved changes warning
 * 
 * Performance:
 * - Memoized sections
 * - Lazy-loaded validation
 * - Debounced auto-save
 */

import { memo, ReactNode, useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Save,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  X,
  Info,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface DocumentSection {
  id: string;
  label: string;
  required?: boolean;
  completed?: boolean;
  hasErrors?: boolean;
  subsections?: Array<{
    id: string;
    label: string;
  }>;
}

interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  section?: string;
  field?: string;
  onClick?: () => void;
}

interface DocumentEditorShellProps {
  /** Document title */
  title: string;
  
  /** Document type */
  documentType?: string;
  
  /** Document status */
  status?: 'draft' | 'in-progress' | 'complete' | 'submitted';
  
  /** Navigation sections */
  sections: DocumentSection[];
  
  /** Active section ID */
  activeSection: string;
  
  /** Section change handler */
  onSectionChange: (sectionId: string) => void;
  
  /** Main form content */
  children: ReactNode;
  
  /** Validation issues */
  validationIssues?: ValidationIssue[];
  
  /** Show validation panel */
  showValidation?: boolean;
  
  /** Progress percentage (0-100) */
  progress?: number;
  
  /** Save handler */
  onSave?: () => void | Promise<void>;
  
  /** Submit handler */
  onSubmit?: () => void | Promise<void>;
  
  /** Cancel handler */
  onCancel?: () => void;
  
  /** Auto-save enabled */
  autoSave?: boolean;
  
  /** Auto-save interval (ms) */
  autoSaveInterval?: number;
  
  /** Last saved timestamp */
  lastSaved?: string;
  
  /** Saving state */
  saving?: boolean;
  
  /** Submitting state */
  submitting?: boolean;
  
  /** Has unsaved changes */
  hasUnsavedChanges?: boolean;
  
  /** Custom footer actions */
  footerActions?: ReactNode;
  
  /** Header actions */
  headerActions?: ReactNode;
  
  /** Show sidebar */
  showSidebar?: boolean;
  
  /** Compact mode */
  compact?: boolean;
}

const DocumentEditorShell = memo(function DocumentEditorShell({
  title,
  documentType,
  status = 'draft',
  sections,
  activeSection,
  onSectionChange,
  children,
  validationIssues = [],
  showValidation = true,
  progress = 0,
  onSave,
  onSubmit,
  onCancel,
  autoSave = false,
  autoSaveInterval = 30000,
  lastSaved,
  saving = false,
  submitting = false,
  hasUnsavedChanges = false,
  footerActions,
  headerActions,
  showSidebar = true,
  compact = false,
}: DocumentEditorShellProps) {
  const [validationPanelOpen, setValidationPanelOpen] = useState(
    validationIssues.length > 0
  );

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !onSave || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      onSave();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [autoSave, autoSaveInterval, onSave, hasUnsavedChanges]);

  // Warn on unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const toggleValidationPanel = useCallback(() => {
    setValidationPanelOpen(prev => !prev);
  }, []);

  // Count validation issues by severity
  const errorCount = validationIssues.filter(v => v.severity === 'error').length;
  const warningCount = validationIssues.filter(v => v.severity === 'warning').length;

  // Status badge styling
  const statusConfig = {
    draft: { color: 'gray', label: 'Draft' },
    'in-progress': { color: 'blue', label: 'In Progress' },
    complete: { color: 'green', label: 'Complete' },
    submitted: { color: 'purple', label: 'Submitted' },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Document Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                <Badge variant="outline">
                  {statusConfig[status].label}
                </Badge>
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="text-xs">
                    Unsaved changes
                  </Badge>
                )}
              </div>
              {documentType && (
                <p className="text-sm text-gray-600 mt-1">{documentType}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">
                Progress: {Math.round(progress)}%
              </span>
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
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Section Navigation Sidebar */}
        {showSidebar && (
          <aside className="w-64 bg-white border-r flex-shrink-0 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Sections
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => onSectionChange(section.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <span className="flex-1 text-left flex items-center gap-2">
                        {section.label}
                        {section.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        {section.hasErrors ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : section.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : null}
                      </div>
                    </button>
                    
                    {/* Subsections */}
                    {section.subsections && activeSection === section.id && (
                      <div className="ml-4 mt-1 space-y-1">
                        {section.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => onSectionChange(sub.id)}
                            className="w-full text-left px-3 py-1 text-xs text-gray-600 hover:text-gray-900 rounded"
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Form Area */}
        <main className="flex-1 overflow-y-auto">
          <div className={cn(
            'px-6 py-6',
            !compact && 'max-w-4xl mx-auto'
          )}>
            {children}
          </div>
          
          {/* Spacer for sticky footer */}
          <div className="h-20" />
        </main>

        {/* Validation Panel */}
        {showValidation && validationIssues.length > 0 && (
          <aside
            className={cn(
              'w-80 bg-white border-l flex-shrink-0 overflow-y-auto transition-all duration-200',
              !validationPanelOpen && 'w-0 border-0'
            )}
          >
            {validationPanelOpen && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Validation
                  </h2>
                  <button
                    onClick={toggleValidationPanel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Issue Counts */}
                <div className="flex gap-2 mb-4">
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
                    </Badge>
                  )}
                </div>

                {/* Validation Issues */}
                <div className="space-y-2">
                  {validationIssues.map((issue) => {
                    const severityConfig = {
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

                    const config = severityConfig[issue.severity];
                    const Icon = config.icon;

                    return (
                      <button
                        key={issue.id}
                        onClick={issue.onClick}
                        className={cn(
                          'w-full text-left p-3 rounded-lg border transition-all',
                          config.bg,
                          config.border,
                          issue.onClick && 'hover:shadow-sm cursor-pointer'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={cn('w-4 h-4 mt-0.5', config.iconColor)} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900">
                              {issue.message}
                            </div>
                            {(issue.section || issue.field) && (
                              <div className="text-xs text-gray-600 mt-1">
                                {issue.section && <span>{issue.section}</span>}
                                {issue.section && issue.field && <span> • </span>}
                                {issue.field && <span>{issue.field}</span>}
                              </div>
                            )}
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

        {/* Validation Panel Toggle (when closed) */}
        {showValidation && validationIssues.length > 0 && !validationPanelOpen && (
          <button
            onClick={toggleValidationPanel}
            className="fixed right-0 top-32 w-10 h-20 bg-white border border-r-0 rounded-l-lg shadow-sm flex flex-col items-center justify-center hover:bg-gray-50 transition-colors z-30"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 mb-1" />
            <span className="text-xs font-semibold text-red-600">
              {validationIssues.length}
            </span>
          </button>
        )}
      </div>

      {/* Sticky Action Footer */}
      <div className="bg-white border-t sticky bottom-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
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
              
              {footerActions}
              
              {onSave && (
                <Button
                  variant="outline"
                  onClick={onSave}
                  disabled={saving || submitting || !hasUnsavedChanges}
                >
                  {saving ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
              )}
              
              {onSubmit && (
                <Button
                  onClick={onSubmit}
                  disabled={saving || submitting || errorCount > 0}
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
                      Submit
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

DocumentEditorShell.displayName = 'DocumentEditorShell';

export default DocumentEditorShell;
