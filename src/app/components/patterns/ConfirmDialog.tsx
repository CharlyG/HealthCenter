/**
 * Reusable Confirmation Dialog Pattern
 * 
 * Consistent confirmation dialogs for high-impact actions across the platform.
 * Prevents accidental data loss and ensures user awareness of consequences.
 * 
 * Use Cases:
 * - Deleting records
 * - Submitting documentation
 * - Closing admissions
 * - Sending orders for signature
 * - Disabling integrations
 * 
 * Design Principles:
 * - Clear action description
 * - Impact explanation
 * - Destructive vs Non-destructive actions
 * - Escape hatch (Cancel)
 * - No confirmation overload for low-risk actions
 */

import { memo, ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ConfirmDialogVariant = 'destructive' | 'warning' | 'info' | 'success';

export interface ConfirmDialogProps {
  /** Dialog open state */
  open: boolean;
  
  /** Callback when dialog state changes */
  onOpenChange: (open: boolean) => void;
  
  /** Callback when user confirms */
  onConfirm: () => void | Promise<void>;
  
  /** Dialog title */
  title: string;
  
  /** Dialog description/message */
  description: string | ReactNode;
  
  /** Confirm button text */
  confirmText?: string;
  
  /** Cancel button text */
  cancelText?: string;
  
  /** Dialog variant (affects styling and icon) */
  variant?: ConfirmDialogVariant;
  
  /** Loading state for async operations */
  loading?: boolean;
  
  /** Disable confirm button */
  disabled?: boolean;
  
  /** Custom icon */
  icon?: ReactNode;
  
  /** Additional footer content */
  footer?: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const variantConfig: Record<ConfirmDialogVariant, {
  icon: typeof AlertTriangle;
  iconColor: string;
  iconBg: string;
  confirmVariant: 'default' | 'destructive';
}> = {
  destructive: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    confirmVariant: 'destructive',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    confirmVariant: 'default',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmVariant: 'default',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    confirmVariant: 'default',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ConfirmDialog = memo(function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
  disabled = false,
  icon: customIcon,
  footer,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
      // Don't close dialog on error - let parent handle it
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          {/* Icon */}
          <div className="mx-auto mb-4 flex items-center justify-center">
            <div className={cn(
              'rounded-full p-3',
              config.iconBg
            )}>
              {customIcon || <Icon className={cn('w-6 h-6', config.iconColor)} />}
            </div>
          </div>

          {/* Title */}
          <AlertDialogTitle className="text-center">
            {title}
          </AlertDialogTitle>

          {/* Description */}
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          {/* Cancel Button */}
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>

          {/* Confirm Button */}
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={disabled || loading}
            className={cn(
              variant === 'destructive' && 'bg-red-600 hover:bg-red-700 text-white'
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>

        {/* Additional Footer */}
        {footer && (
          <div className="mt-4 text-center text-xs text-gray-500">
            {footer}
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

interface UseConfirmDialogOptions {
  onConfirm: () => void | Promise<void>;
  variant?: ConfirmDialogVariant;
}

export function useConfirmDialog({ onConfirm, variant = 'info' }: UseConfirmDialogOptions) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const show = useCallback(() => {
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    setLoading(false);
  }, []);

  const confirm = useCallback(async () => {
    setLoading(true);
    try {
      await onConfirm();
      hide();
    } catch (error) {
      console.error('Confirmation failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onConfirm, hide]);

  return {
    open,
    loading,
    show,
    hide,
    confirm,
    variant,
    setOpen,
  };
}

export default ConfirmDialog;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// BASIC USAGE
import { ConfirmDialog } from './components/patterns/ConfirmDialog';
import { useState } from 'react';

function MyComponent() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deletePatient(patientId);
  };

  return (
    <>
      <button onClick={() => setDeleteDialogOpen(true)}>
        Delete Patient
      </button>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Patient Record?"
        description="This action cannot be undone. All patient data, episodes, and documents will be permanently deleted."
        confirmText="Delete Patient"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
}

// USING THE HOOK
import { useConfirmDialog, ConfirmDialog } from './components/patterns/ConfirmDialog';

function MyComponent() {
  const deleteDialog = useConfirmDialog({
    onConfirm: async () => {
      await deletePatient(patientId);
      toast.success('Patient deleted');
    },
    variant: 'destructive',
  });

  return (
    <>
      <button onClick={deleteDialog.show}>Delete Patient</button>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.setOpen}
        onConfirm={deleteDialog.confirm}
        loading={deleteDialog.loading}
        title="Delete Patient Record?"
        description="This action cannot be undone."
        confirmText="Delete Patient"
        variant="destructive"
      />
    </>
  );
}

// COMMON PATTERNS

// 1. Delete Records
<ConfirmDialog
  variant="destructive"
  title="Delete Visit Note?"
  description="This visit note will be permanently deleted and cannot be recovered."
  confirmText="Delete"
  onConfirm={handleDelete}
/>

// 2. Submit Documentation
<ConfirmDialog
  variant="warning"
  title="Submit Documentation?"
  description="Once submitted, this document will be locked and sent to the physician for signature."
  confirmText="Submit"
  onConfirm={handleSubmit}
/>

// 3. Close Admission
<ConfirmDialog
  variant="warning"
  title="Close Admission?"
  description="This will mark the admission as complete. You can still access historical data."
  confirmText="Close Admission"
  onConfirm={handleClose}
/>

// 4. Disable Integration
<ConfirmDialog
  variant="warning"
  title="Disable Integration?"
  description="This will stop syncing data with the external system. You can re-enable it at any time."
  confirmText="Disable"
  onConfirm={handleDisable}
/>

// 5. Send for Signature
<ConfirmDialog
  variant="info"
  title="Send Order for Signature?"
  description="This order will be sent to Dr. Smith for electronic signature."
  confirmText="Send"
  onConfirm={handleSend}
/>
*/
