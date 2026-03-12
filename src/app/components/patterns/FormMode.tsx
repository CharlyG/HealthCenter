/**
 * Form Mode Pattern
 * 
 * Consistent Create/Edit/View mode pattern for forms and entities.
 * Provides clear visual distinction and appropriate actions for each mode.
 * 
 * Modes:
 * - View: Read-only display with Edit/Close actions
 * - Edit: Editable fields with Save/Cancel actions
 * - Create: New entity form with Create/Cancel actions
 * 
 * Design Principles:
 * - Clear mode indication
 * - Appropriate field states per mode
 * - Contextual primary actions
 * - Consistent layout across modes
 */

import { memo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Edit2, X, Save, Plus, Eye, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type FormMode = 'view' | 'edit' | 'create';

export interface FormModeConfig {
  mode: FormMode;
  label: string;
  icon: typeof Edit2;
  variant: 'default' | 'secondary' | 'outline';
  color: string;
}

export interface FormModeHeaderProps {
  /** Current form mode */
  mode: FormMode;
  
  /** Entity title/name */
  title: string;
  
  /** Optional subtitle/description */
  subtitle?: string;
  
  /** Custom mode label */
  modeLabel?: string;
  
  /** Hide mode badge */
  hideBadge?: boolean;
  
  /** Additional header content */
  extra?: ReactNode;
  
  /** Custom className */
  className?: string;
}

export interface FormModeActionsProps {
  /** Current form mode */
  mode: FormMode;
  
  /** Primary action handler */
  onPrimaryAction: () => void | Promise<void>;
  
  /** Secondary action handler (Cancel/Close) */
  onSecondaryAction: () => void;
  
  /** Optional tertiary action */
  onTertiaryAction?: () => void;
  
  /** Primary action text override */
  primaryText?: string;
  
  /** Secondary action text override */
  secondaryText?: string;
  
  /** Tertiary action text override */
  tertiaryText?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Disable primary action */
  disabled?: boolean;
  
  /** Custom className */
  className?: string;
}

export interface FormModeWrapperProps {
  /** Current form mode */
  mode: FormMode;
  
  /** Form content */
  children: ReactNode;
  
  /** Header props */
  header: FormModeHeaderProps;
  
  /** Actions props */
  actions: FormModeActionsProps;
  
  /** Custom className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MODE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const modeConfigs: Record<FormMode, FormModeConfig> = {
  view: {
    mode: 'view',
    label: 'Viewing',
    icon: Eye,
    variant: 'secondary',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  edit: {
    mode: 'edit',
    label: 'Editing',
    icon: Edit2,
    variant: 'default',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  create: {
    mode: 'create',
    label: 'Creating',
    icon: Plus,
    variant: 'default',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Form Mode Header
 * Shows title, subtitle, and mode badge
 */
export const FormModeHeader = memo(function FormModeHeader({
  mode,
  title,
  subtitle,
  modeLabel,
  hideBadge = false,
  extra,
  className,
}: FormModeHeaderProps) {
  const config = modeConfigs[mode];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900 truncate">
            {title}
          </h2>
          
          {!hideBadge && (
            <Badge
              variant={config.variant}
              className={cn(
                'flex items-center gap-1.5 font-medium',
                config.color
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {modeLabel || config.label}
            </Badge>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      {extra && (
        <div className="flex-shrink-0">
          {extra}
        </div>
      )}
    </div>
  );
});

/**
 * Form Mode Actions
 * Mode-specific action buttons
 */
export const FormModeActions = memo(function FormModeActions({
  mode,
  onPrimaryAction,
  onSecondaryAction,
  onTertiaryAction,
  primaryText,
  secondaryText,
  tertiaryText,
  loading = false,
  disabled = false,
  className,
}: FormModeActionsProps) {
  // Default action texts based on mode
  const defaultPrimaryText = {
    view: 'Edit',
    edit: 'Save Changes',
    create: 'Create',
  };

  const defaultSecondaryText = {
    view: 'Close',
    edit: 'Cancel',
    create: 'Cancel',
  };

  // Primary action icons
  const primaryIcons = {
    view: Edit2,
    edit: Save,
    create: Plus,
  };

  const PrimaryIcon = primaryIcons[mode];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Tertiary Action (optional) */}
      {onTertiaryAction && (
        <Button
          variant="outline"
          onClick={onTertiaryAction}
          disabled={loading}
        >
          {tertiaryText || 'More Options'}
        </Button>
      )}

      {/* Secondary Action (Cancel/Close) */}
      <Button
        variant="outline"
        onClick={onSecondaryAction}
        disabled={loading}
      >
        <X className="w-4 h-4 mr-2" />
        {secondaryText || defaultSecondaryText[mode]}
      </Button>

      {/* Primary Action */}
      <Button
        onClick={onPrimaryAction}
        disabled={disabled || loading}
        variant={mode === 'view' ? 'default' : 'default'}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {mode === 'create' ? 'Creating...' : mode === 'edit' ? 'Saving...' : 'Loading...'}
          </>
        ) : (
          <>
            <PrimaryIcon className="w-4 h-4 mr-2" />
            {primaryText || defaultPrimaryText[mode]}
          </>
        )}
      </Button>
    </div>
  );
});

/**
 * Form Mode Wrapper
 * Complete form layout with header and actions
 */
export const FormModeWrapper = memo(function FormModeWrapper({
  mode,
  children,
  header,
  actions,
  className,
}: FormModeWrapperProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <FormModeHeader {...header} mode={mode} />
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 overflow-y-auto px-6 py-6',
        mode === 'view' && 'bg-gray-50'
      )}>
        {children}
      </div>

      {/* Actions Footer */}
      <div className="px-6 py-4 border-t bg-white flex justify-end">
        <FormModeActions {...actions} mode={mode} />
      </div>
    </div>
  );
});

// Display names
FormModeHeader.displayName = 'FormModeHeader';
FormModeActions.displayName = 'FormModeActions';
FormModeWrapper.displayName = 'FormModeWrapper';

export default FormModeWrapper;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

export interface UseFormModeOptions {
  /** Initial mode */
  initialMode?: FormMode;
  
  /** Callback when entering edit mode */
  onEdit?: () => void;
  
  /** Callback when saving (edit/create mode) */
  onSave?: () => void | Promise<void>;
  
  /** Callback when canceling */
  onCancel?: () => void;
}

export function useFormMode({
  initialMode = 'view',
  onEdit,
  onSave,
  onCancel,
}: UseFormModeOptions = {}) {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [loading, setLoading] = useState(false);

  const enterEditMode = useCallback(() => {
    setMode('edit');
    onEdit?.();
  }, [onEdit]);

  const enterViewMode = useCallback(() => {
    setMode('view');
  }, []);

  const save = useCallback(async () => {
    if (!onSave) return;
    
    setLoading(true);
    try {
      await onSave();
      if (mode === 'edit') {
        setMode('view');
      }
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mode, onSave]);

  const cancel = useCallback(() => {
    if (mode === 'edit') {
      setMode('view');
    }
    onCancel?.();
  }, [mode, onCancel]);

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  return {
    mode,
    setMode,
    loading,
    enterEditMode,
    enterViewMode,
    save,
    cancel,
    isReadOnly,
    isEditing,
    isCreating,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// BASIC USAGE WITH WRAPPER
import { FormModeWrapper, useFormMode } from './components/patterns/FormMode';

function PatientEditor({ patient, onSave, onClose }) {
  const formMode = useFormMode({
    initialMode: patient ? 'view' : 'create',
    onSave: async () => {
      await onSave(formData);
      toast.success('Patient saved');
    },
    onCancel: onClose,
  });

  return (
    <FormModeWrapper
      mode={formMode.mode}
      header={{
        title: patient?.name || 'New Patient',
        subtitle: formMode.isCreating ? 'Fill in patient details' : `MRN: ${patient?.mrn}`,
      }}
      actions={{
        onPrimaryAction: formMode.isReadOnly ? formMode.enterEditMode : formMode.save,
        onSecondaryAction: formMode.cancel,
        loading: formMode.loading,
      }}
    >
      <PatientForm
        data={formData}
        onChange={setFormData}
        disabled={formMode.isReadOnly}
      />
    </FormModeWrapper>
  );
}

// CUSTOM LAYOUT WITH INDIVIDUAL COMPONENTS
function AssessmentEditor() {
  const formMode = useFormMode();

  return (
    <div className="h-full flex flex-col">
      {/* Custom header with extra actions *\/}
      <div className="border-b p-6">
        <FormModeHeader
          mode={formMode.mode}
          title="OASIS-E Assessment"
          subtitle="Start of Care Assessment"
          extra={
            <button>View History</button>
          }
        />
      </div>

      {/* Content *\/}
      <div className="flex-1 overflow-y-auto p-6">
        <AssessmentForm readOnly={formMode.isReadOnly} />
      </div>

      {/* Custom footer with autosave indicator *\/}
      <div className="border-t p-6 flex justify-between">
        <AutosaveIndicator status="saved" />
        
        <FormModeActions
          mode={formMode.mode}
          onPrimaryAction={formMode.isReadOnly ? formMode.enterEditMode : formMode.save}
          onSecondaryAction={formMode.cancel}
          loading={formMode.loading}
        />
      </div>
    </div>
  );
}

// CONDITIONAL RENDERING BASED ON MODE
function OrderForm() {
  const formMode = useFormMode();

  return (
    <FormModeWrapper
      mode={formMode.mode}
      header={{
        title: formMode.isCreating ? 'New Order' : 'Order #12345',
      }}
      actions={{
        onPrimaryAction: formMode.isReadOnly ? formMode.enterEditMode : formMode.save,
        onSecondaryAction: formMode.cancel,
        onTertiaryAction: formMode.isReadOnly ? undefined : () => console.log('Save as Draft'),
        tertiaryText: 'Save Draft',
      }}
    >
      {formMode.isReadOnly ? (
        <OrderViewContent order={order} />
      ) : (
        <OrderEditForm order={order} />
      )}
    </FormModeWrapper>
  );
}

// WITH UNSAVED CHANGES PROTECTION
import { useNavigationGuard } from '@/hooks/useNavigationGuard';

function ClinicalDocumentEditor() {
  const [isDirty, setIsDirty] = useState(false);
  
  const formMode = useFormMode({
    onSave: async () => {
      await saveDocument();
      setIsDirty(false);
    },
  });

  useNavigationGuard({
    when: isDirty && !formMode.isReadOnly,
    message: 'You have unsaved changes. Save before leaving?',
  });

  return (
    <FormModeWrapper
      mode={formMode.mode}
      header={{ title: 'Clinical Documentation' }}
      actions={{
        onPrimaryAction: formMode.isReadOnly ? formMode.enterEditMode : formMode.save,
        onSecondaryAction: formMode.cancel,
        disabled: !isDirty,
      }}
    >
      <DocumentForm onChange={() => setIsDirty(true)} />
    </FormModeWrapper>
  );
}
*/
