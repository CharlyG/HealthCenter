import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';

interface UseFormAutosaveOptions<T> {
  formData: T;
  onSave: (data: T, isDraft: boolean) => Promise<void>;
  autosaveInterval?: number; // milliseconds
  enabled?: boolean;
}

interface UseFormAutosaveReturn {
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  saveNow: (isDraft?: boolean) => Promise<void>;
  markClean: () => void;
  markDirty: () => void;
}

/**
 * Hook for automatic form saving with draft support
 * - Auto-saves as draft every N seconds when dirty
 * - Tracks dirty state
 * - Provides manual save function
 */
export function useFormAutosave<T>({
  formData,
  onSave,
  autosaveInterval = 30000, // 30 seconds default
  enabled = true,
}: UseFormAutosaveOptions<T>): UseFormAutosaveReturn {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const lastFormData = useRef<T>(formData);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Detect changes in form data
  useEffect(() => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(lastFormData.current);
    if (hasChanged && !isDirty) {
      setIsDirty(true);
    }
  }, [formData, isDirty]);

  // Manual save function
  const saveNow = useCallback(async (isDraft = false) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      await onSave(formData, isDraft);
      setLastSaved(new Date());
      setIsDirty(false);
      lastFormData.current = formData;
      
      if (!isDraft) {
        toast.success('Changes saved successfully');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save changes');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave, isSaving]);

  // Autosave as draft
  useEffect(() => {
    if (!enabled || !isDirty) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      return;
    }

    autosaveTimerRef.current = setTimeout(() => {
      console.log('[FormAutosave] Auto-saving draft...');
      saveNow(true).then(() => {
        console.log('[FormAutosave] Draft saved');
      }).catch((err) => {
        console.error('[FormAutosave] Draft save failed:', err);
      });
    }, autosaveInterval);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [enabled, isDirty, autosaveInterval, saveNow]);

  const markClean = useCallback(() => {
    setIsDirty(false);
    lastFormData.current = formData;
  }, [formData]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  return {
    isDirty,
    isSaving,
    lastSaved,
    saveNow,
    markClean,
    markDirty,
  };
}
