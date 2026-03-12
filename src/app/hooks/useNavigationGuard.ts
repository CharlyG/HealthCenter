import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useBlocker } from 'react-router';
import { toast } from 'sonner';

interface UseNavigationGuardOptions {
  when: boolean; // Block navigation when true (e.g., form is dirty)
  onSave?: () => Promise<void>; // Optional: auto-save before navigating
  onDiscard?: () => void; // Optional: cleanup when discarding changes
  message?: string;
  title?: string;
}

export interface NavigationGuardState {
  isBlocking: boolean;
  dialogOpen: boolean;
  closeDialog: () => void;
  saveAndProceed: () => Promise<void>;
  discardAndProceed: () => void;
  cancelNavigation: () => void;
  message: string;
  title: string;
  isSaving: boolean;
}

/**
 * Hook to prevent navigation when form has unsaved changes
 * Returns state for rendering a custom confirmation dialog
 * 
 * IMPORTANT: This hook returns state - you must render the dialog yourself
 * using the UnsavedChangesDialog component or a custom dialog.
 */
export function useNavigationGuard({
  when,
  onSave,
  onDiscard,
  message = 'You have unsaved changes. What would you like to do?',
  title = 'Unsaved Changes',
}: UseNavigationGuardOptions): NavigationGuardState {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Block navigation when condition is true
  const blocker = useBlocker(when);

  // Handle the blocking by showing our custom dialog
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setDialogOpen(true);
    }
  }, [blocker.state]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  const saveAndProceed = useCallback(async () => {
    if (!onSave) {
      if (blocker.state === 'blocked') {
        blocker.proceed();
      }
      setDialogOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave();
      if (blocker.state === 'blocked') {
        blocker.proceed();
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save before navigation:', error);
      toast.error('Failed to save changes');
      blocker.reset();
      setDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  }, [blocker, onSave]);

  const discardAndProceed = useCallback(() => {
    onDiscard?.();
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
    setDialogOpen(false);
  }, [blocker, onDiscard]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    setDialogOpen(false);
  }, [blocker]);

  // Also handle browser/tab close
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages but still show a dialog
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [when]);

  return {
    isBlocking: blocker.state === 'blocked',
    dialogOpen,
    closeDialog,
    saveAndProceed,
    discardAndProceed,
    cancelNavigation,
    message,
    title,
    isSaving,
  };
}
