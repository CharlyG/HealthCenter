/**
 * Sticky Action Footer Pattern
 * 
 * Footer that remains visible during editing workflows.
 * Reduces scrolling and makes primary actions easily accessible.
 * 
 * Use Cases:
 * - Clinical documentation editing
 * - Assessment completion
 * - Order creation/editing
 * - Care plan editing
 * - Configuration settings
 * - QA review workflows
 * 
 * Performance:
 * - Memoized component
 * - Optimized re-renders
 */

import { memo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { 
  Save,
  Send,
  CheckCircle,
  X,
  AlertTriangle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationSummary {
  errors: number;
  warnings: number;
  info?: number;
}

interface StickyActionFooterProps {
  /** Save draft handler */
  onSave?: () => void | Promise<void>;
  
  /** Validate handler */
  onValidate?: () => void | Promise<void>;
  
  /** Submit handler */
  onSubmit?: () => void | Promise<void>;
  
  /** Cancel handler */
  onCancel?: () => void;
  
  /** Return for correction handler */
  onReturnForCorrection?: () => void;
  
  /** Custom primary action */
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void | Promise<void>;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
  };
  
  /** Custom secondary actions */
  secondaryActions?: ReactNode;
  
  /** Validation summary */
  validationSummary?: ValidationSummary;
  
  /** Has unsaved changes */
  hasUnsavedChanges?: boolean;
  
  /** Last saved timestamp */
  lastSaved?: string;
  
  /** Saving state */
  saving?: boolean;
  
  /** Validating state */
  validating?: boolean;
  
  /** Submitting state */
  submitting?: boolean;
  
  /** Disable all actions */
  disabled?: boolean;
  
  /** Left content */
  leftContent?: ReactNode;
  
  /** Show validation summary */
  showValidation?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Variant */
  variant?: 'default' | 'qa' | 'clinical' | 'admin';
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const StickyActionFooter = memo(function StickyActionFooter({
  onSave,
  onValidate,
  onSubmit,
  onCancel,
  onReturnForCorrection,
  primaryAction,
  secondaryActions,
  validationSummary,
  hasUnsavedChanges = false,
  lastSaved,
  saving = false,
  validating = false,
  submitting = false,
  disabled = false,
  leftContent,
  showValidation = true,
  compact = false,
  variant = 'default',
}: StickyActionFooterProps) {
  const hasErrors = validationSummary && validationSummary.errors > 0;
  const hasWarnings = validationSummary && validationSummary.warnings > 0;
  const canSubmit = !hasErrors && !saving && !submitting && !validating;

  // Variant-specific styles
  const variantConfig = {
    default: {
      bg: 'bg-white',
      border: 'border-gray-200',
    },
    qa: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    clinical: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    admin: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        'sticky bottom-0 z-40 border-t',
        config.bg,
        config.border,
        compact ? 'px-4 py-3' : 'px-6 py-4'
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side - Status & Validation */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Custom Left Content */}
            {leftContent}

            {/* Auto-save Status */}
            {!leftContent && (onSave || lastSaved) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {saving ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700 font-medium">Unsaved changes</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Saved {lastSaved}</span>
                  </>
                ) : null}
              </div>
            )}

            {/* Validation Summary */}
            {showValidation && validationSummary && (
              <div className="flex items-center gap-3">
                {validationSummary.errors > 0 && (
                  <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    {validationSummary.errors} {validationSummary.errors === 1 ? 'error' : 'errors'}
                  </span>
                )}
                {validationSummary.warnings > 0 && (
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    {validationSummary.warnings} {validationSummary.warnings === 1 ? 'warning' : 'warnings'}
                  </span>
                )}
                {!hasErrors && !hasWarnings && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    No validation issues
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Cancel */}
            {onCancel && (
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={onCancel}
                disabled={disabled || saving || submitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}

            {/* Secondary Actions */}
            {secondaryActions}

            {/* Return for Correction (QA workflow) */}
            {onReturnForCorrection && (
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={onReturnForCorrection}
                disabled={disabled || submitting}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Return for Correction
              </Button>
            )}

            {/* Save Draft */}
            {onSave && (
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={onSave}
                disabled={disabled || saving || submitting || !hasUnsavedChanges}
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

            {/* Validate */}
            {onValidate && (
              <Button
                variant="outline"
                size={compact ? 'sm' : 'default'}
                onClick={onValidate}
                disabled={disabled || validating || submitting}
              >
                {validating ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate
                  </>
                )}
              </Button>
            )}

            {/* Submit (or Custom Primary Action) */}
            {primaryAction ? (
              <Button
                variant={primaryAction.variant || 'default'}
                size={compact ? 'sm' : 'default'}
                onClick={primaryAction.onClick}
                disabled={disabled || primaryAction.disabled || submitting}
                className={cn(
                  primaryAction.variant === 'default' && 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </Button>
            ) : onSubmit ? (
              <Button
                size={compact ? 'sm' : 'default'}
                onClick={onSubmit}
                disabled={disabled || !canSubmit}
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

StickyActionFooter.displayName = 'StickyActionFooter';

export default StickyActionFooter;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// Clinical Documentation
<StickyActionFooter
  onSave={handleSave}
  onSubmit={handleSubmit}
  onCancel={() => navigate(-1)}
  validationSummary={{ errors: 2, warnings: 5 }}
  hasUnsavedChanges={hasChanges}
  lastSaved="2 minutes ago"
  saving={isSaving}
  submitting={isSubmitting}
  variant="clinical"
/>

// Assessment
<StickyActionFooter
  onSave={saveAssessment}
  onValidate={validateAssessment}
  onSubmit={submitAssessment}
  validationSummary={{ errors: 0, warnings: 3 }}
  validating={isValidating}
  compact
/>

// QA Review
<StickyActionFooter
  onReturnForCorrection={returnDocument}
  primaryAction={{
    label: 'Approve Document',
    icon: <CheckCircle className="w-4 h-4 mr-2" />,
    onClick: approveDocument,
  }}
  variant="qa"
/>

// Configuration
<StickyActionFooter
  onSave={saveConfig}
  onCancel={resetConfig}
  hasUnsavedChanges={configChanged}
  leftContent={
    <span className="text-sm text-gray-600">
      Changes will affect all users
    </span>
  }
  variant="admin"
/>
*/
