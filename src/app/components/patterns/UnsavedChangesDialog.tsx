/**
 * Unsaved Changes Dialog
 * 
 * Dialog component for preventing accidental data loss when navigating away
 * from a form with unsaved changes.
 * 
 * Works with useNavigationGuard hook to provide a consistent UX pattern.
 * 
 * Dialog Options:
 * - Save Changes (and proceed)
 * - Discard Changes (and proceed)
 * - Cancel (stay on page)
 */

import { memo } from 'react';
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
import { Save, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UnsavedChangesDialogProps {
  /** Dialog open state */
  open: boolean;
  
  /** Callback when user chooses to save */
  onSave: () => void | Promise<void>;
  
  /** Callback when user chooses to discard */
  onDiscard: () => void;
  
  /** Callback when user cancels */
  onCancel: () => void;
  
  /** Dialog title */
  title?: string;
  
  /** Dialog message */
  message?: string;
  
  /** Save button text */
  saveText?: string;
  
  /** Discard button text */
  discardText?: string;
  
  /** Cancel button text */
  cancelText?: string;
  
  /** Hide the save option */
  hideSave?: boolean;
  
  /** Loading state (for async save) */
  loading?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const UnsavedChangesDialog = memo(function UnsavedChangesDialog({
  open,
  onSave,
  onDiscard,
  onCancel,
  title = 'Unsaved Changes',
  message = 'You have unsaved changes. What would you like to do?',
  saveText = 'Save Changes',
  discardText = 'Discard Changes',
  cancelText = 'Cancel',
  hideSave = false,
  loading = false,
}: UnsavedChangesDialogProps) {
  const handleSave = async () => {
    try {
      await onSave();
    } catch (error) {
      console.error('Save failed:', error);
      // Don't close dialog on error - let parent handle it
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && !loading && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          {/* Warning Icon */}
          <div className="mx-auto mb-4 flex items-center justify-center">
            <div className="rounded-full p-3 bg-amber-100">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          {/* Title */}
          <AlertDialogTitle className="text-center">
            {title}
          </AlertDialogTitle>

          {/* Message */}
          <AlertDialogDescription className="text-center">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Custom Footer with Three Buttons */}
        <div className="flex flex-col gap-2 mt-4">
          {/* Save Button (Primary) */}
          {!hideSave && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleSave();
              }}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {saveText}
                </>
              )}
            </Button>
          )}

          {/* Discard Button (Destructive) */}
          <Button
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              onDiscard();
            }}
            disabled={loading}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {discardText}
          </Button>

          {/* Cancel Button (Outline) */}
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            disabled={loading}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            {cancelText}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Tip: Use "Save Changes" to keep your work before navigating away
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
});

UnsavedChangesDialog.displayName = 'UnsavedChangesDialog';

export default UnsavedChangesDialog;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// BASIC USAGE WITH useNavigationGuard
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { UnsavedChangesDialog } from './components/patterns/UnsavedChangesDialog';

function DocumentEditor() {
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const navigationGuard = useNavigationGuard({
    when: isDirty,
    onSave: async () => {
      await saveDocument(formData);
      setIsDirty(false);
    },
    onDiscard: () => {
      setIsDirty(false);
    },
  });

  return (
    <>
      <form onChange={() => setIsDirty(true)}>
        {/* Form fields *\/}
      </form>

      {/* Unsaved Changes Dialog *\/}
      <UnsavedChangesDialog
        open={navigationGuard.dialogOpen}
        onSave={navigationGuard.saveAndProceed}
        onDiscard={navigationGuard.discardAndProceed}
        onCancel={navigationGuard.cancelNavigation}
        loading={navigationGuard.isSaving}
      />
    </>
  );
}

// CUSTOM MESSAGES
<UnsavedChangesDialog
  open={dialogOpen}
  onSave={handleSave}
  onDiscard={handleDiscard}
  onCancel={handleCancel}
  title="Leave Assessment?"
  message="This assessment has unsaved changes. Save your progress before leaving?"
  saveText="Save Assessment"
  discardText="Discard Changes"
/>

// WITHOUT SAVE OPTION (e.g., when auto-save is enabled)
<UnsavedChangesDialog
  open={dialogOpen}
  onSave={handleDiscard} // Won't be used
  onDiscard={handleDiscard}
  onCancel={handleCancel}
  hideSave
  message="Are you sure you want to leave? Your changes have been auto-saved."
  discardText="Leave Page"
/>

// COMPLETE EXAMPLE WITH FORM MODE
import { useFormMode } from './components/patterns/FormMode';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { UnsavedChangesDialog } from './components/patterns/UnsavedChangesDialog';

function ClinicalDocumentEditor() {
  const [document, setDocument] = useState(initialDocument);
  const [isDirty, setIsDirty] = useState(false);

  const formMode = useFormMode({
    initialMode: 'edit',
    onSave: async () => {
      await saveDocument(document);
      setIsDirty(false);
    },
  });

  const navigationGuard = useNavigationGuard({
    when: isDirty && !formMode.isReadOnly,
    onSave: async () => {
      await saveDocument(document);
      setIsDirty(false);
    },
    onDiscard: () => {
      setDocument(initialDocument);
      setIsDirty(false);
    },
  });

  return (
    <>
      <FormModeWrapper
        mode={formMode.mode}
        header={{
          title: 'Clinical Documentation',
        }}
        actions={{
          onPrimaryAction: formMode.isReadOnly ? formMode.enterEditMode : formMode.save,
          onSecondaryAction: formMode.cancel,
        }}
      >
        <DocumentForm
          data={document}
          onChange={(data) => {
            setDocument(data);
            setIsDirty(true);
          }}
          readOnly={formMode.isReadOnly}
        />
      </FormModeWrapper>

      <UnsavedChangesDialog
        open={navigationGuard.dialogOpen}
        onSave={navigationGuard.saveAndProceed}
        onDiscard={navigationGuard.discardAndProceed}
        onCancel={navigationGuard.cancelNavigation}
        loading={navigationGuard.isSaving}
      />
    </>
  );
}

// WITH AUTOSAVE
import { useFormAutosave } from '@/hooks/useFormAutosave';

function AssessmentEditor() {
  const [assessment, setAssessment] = useState(initialAssessment);

  const autosave = useFormAutosave({
    formData: assessment,
    onSave: async (data, isDraft) => {
      await saveAssessment(data, isDraft);
    },
  });

  const navigationGuard = useNavigationGuard({
    when: autosave.isDirty,
    onSave: async () => {
      await autosave.saveNow(false); // Final save before leaving
    },
    onDiscard: () => {
      autosave.markClean();
    },
    message: "You have unsaved changes. Your work has been auto-saved, but you may want to finalize before leaving.",
  });

  return (
    <>
      <AssessmentForm
        data={assessment}
        onChange={setAssessment}
      />

      <UnsavedChangesDialog
        open={navigationGuard.dialogOpen}
        onSave={navigationGuard.saveAndProceed}
        onDiscard={navigationGuard.discardAndProceed}
        onCancel={navigationGuard.cancelNavigation}
        loading={navigationGuard.isSaving}
        saveText="Finalize & Leave"
        message="Auto-save is enabled, but would you like to finalize before leaving?"
      />
    </>
  );
}
*/
