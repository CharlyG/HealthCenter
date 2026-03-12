/**
 * Autosave Indicator Pattern
 * 
 * Subtle, non-intrusive feedback for autosave status.
 * Shows saving state, success state, and last saved timestamp.
 * 
 * Design Principles:
 * - Never interrupts typing or causes UI lag
 * - Subtle and unobtrusive
 * - Clear status indication
 * - Timestamp for user confidence
 * - Error handling with clear messaging
 */

import { memo } from 'react';
import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../ui/utils';
import { formatDistanceToNow } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutosaveIndicatorProps {
  /** Current autosave status */
  status: AutosaveStatus;
  
  /** Last saved timestamp */
  lastSaved?: Date | null;
  
  /** Error message (shown when status is 'error') */
  errorMessage?: string;
  
  /** Show timestamp in saved state */
  showTimestamp?: boolean;
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Position */
  position?: 'inline' | 'fixed-bottom' | 'fixed-top';
  
  /** Custom className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AutosaveIndicator = memo(function AutosaveIndicator({
  status,
  lastSaved,
  errorMessage,
  showTimestamp = true,
  size = 'md',
  position = 'inline',
  className,
}: AutosaveIndicatorProps) {
  // Don't render anything if idle and no last saved time
  if (status === 'idle' && !lastSaved) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Position classes
  const positionClasses = {
    'inline': '',
    'fixed-bottom': 'fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg px-4 py-2 border',
    'fixed-top': 'fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg px-4 py-2 border',
  };

  // Render content based on status
  const renderContent = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
            <span className={sizeClasses[size]}>Saving...</span>
          </div>
        );

      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <Check className={iconSizes[size]} />
            <span className={sizeClasses[size]}>
              Saved
              {showTimestamp && lastSaved && (
                <span className="text-gray-500 ml-1">
                  · {formatDistanceToNow(lastSaved, { addSuffix: true })}
                </span>
              )}
            </span>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className={iconSizes[size]} />
            <span className={sizeClasses[size]}>
              {errorMessage || 'Failed to save'}
            </span>
          </div>
        );

      case 'idle':
      default:
        if (lastSaved && showTimestamp) {
          return (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className={iconSizes[size]} />
              <span className={sizeClasses[size]}>
                Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
              </span>
            </div>
          );
        }
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <div className={cn(
      'transition-all duration-200',
      positionClasses[position],
      className
    )}>
      {content}
    </div>
  );
});

AutosaveIndicator.displayName = 'AutosaveIndicator';

export default AutosaveIndicator;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// BASIC USAGE WITH AUTOSAVE HOOK
import { useFormAutosave } from '@/hooks/useFormAutosave';
import { AutosaveIndicator } from './components/patterns/AutosaveIndicator';

function ClinicalDocumentEditor() {
  const [formData, setFormData] = useState(initialData);

  const autosave = useFormAutosave({
    formData,
    onSave: async (data, isDraft) => {
      await saveDocument(data, isDraft);
    },
    autosaveInterval: 10000, // 10 seconds
  });

  return (
    <div>
      {/* Document editing UI *\/}
      <textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
      />

      {/* Autosave indicator in top-right of editor *\/}
      <div className="absolute top-2 right-2">
        <AutosaveIndicator
          status={autosave.isSaving ? 'saving' : 'saved'}
          lastSaved={autosave.lastSaved}
          size="sm"
        />
      </div>
    </div>
  );
}

// INLINE VARIANT (in form footer)
<div className="flex justify-between items-center py-4 border-t">
  <AutosaveIndicator
    status={autosave.isSaving ? 'saving' : autosave.isDirty ? 'idle' : 'saved'}
    lastSaved={autosave.lastSaved}
    showTimestamp
  />
  
  <button onClick={() => autosave.saveNow()}>
    Save Now
  </button>
</div>

// FIXED POSITION (bottom-right corner)
<AutosaveIndicator
  status={autosave.isSaving ? 'saving' : 'saved'}
  lastSaved={autosave.lastSaved}
  position="fixed-bottom"
/>

// WITH ERROR HANDLING
const [autosaveError, setAutosaveError] = useState<string>();

const autosave = useFormAutosave({
  formData,
  onSave: async (data, isDraft) => {
    try {
      await saveDocument(data, isDraft);
      setAutosaveError(undefined);
    } catch (error) {
      setAutosaveError('Network error - changes not saved');
      throw error;
    }
  },
});

<AutosaveIndicator
  status={autosaveError ? 'error' : autosave.isSaving ? 'saving' : 'saved'}
  lastSaved={autosave.lastSaved}
  errorMessage={autosaveError}
/>

// FULL INTEGRATION EXAMPLE
function AssessmentEditor() {
  const [assessment, setAssessment] = useState(initialAssessment);
  const [saveError, setSaveError] = useState<string>();

  const autosave = useFormAutosave({
    formData: assessment,
    onSave: async (data, isDraft) => {
      try {
        await api.saveAssessment({
          ...data,
          status: isDraft ? 'draft' : 'submitted',
        });
        setSaveError(undefined);
      } catch (error) {
        setSaveError('Failed to save assessment');
        throw error;
      }
    },
    autosaveInterval: 15000, // 15 seconds
  });

  const getAutosaveStatus = (): AutosaveStatus => {
    if (saveError) return 'error';
    if (autosave.isSaving) return 'saving';
    if (autosave.lastSaved) return 'saved';
    return 'idle';
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4">
        <AutosaveIndicator
          status={getAutosaveStatus()}
          lastSaved={autosave.lastSaved}
          errorMessage={saveError}
          size="sm"
        />
      </div>

      {/* Assessment form fields *\/}
      <AssessmentForm data={assessment} onChange={setAssessment} />

      {/* Footer with manual save *\/}
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => autosave.saveNow(true)}>
          Save Draft
        </button>
        <button onClick={() => autosave.saveNow(false)}>
          Submit
        </button>
      </div>
    </div>
  );
}
*/
