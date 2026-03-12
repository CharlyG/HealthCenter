/**
 * Toast Notification System
 * 
 * Centralized toast notification utilities using Sonner.
 * Provides consistent feedback messages across the platform.
 * 
 * Toast Types:
 * - Success: Action completed successfully
 * - Error: Action failed
 * - Warning: Important information/caution
 * - Info: General information
 * - Loading: Async operation in progress
 * 
 * Design Principles:
 * - Brief, actionable messages
 * - Auto-dismiss (except errors)
 * - Support for actions/undo
 * - Accessible and keyboard-friendly
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════
// TOAST CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_DURATION = 4000; // 4 seconds
const ERROR_DURATION = 6000; // 6 seconds for errors
const LOADING_DURATION = Infinity; // Loading toasts don't auto-dismiss

// ═══════════════════════════════════════════════════════════════════════════
// CORE TOAST FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

interface ToastOptions extends ExternalToast {
  /** Custom action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Show undo button */
  undo?: () => void;
}

/**
 * Success toast - green theme
 * Use for successful operations
 */
export function success(message: string, options?: ToastOptions) {
  return sonnerToast.success(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
}

/**
 * Error toast - red theme
 * Use for failed operations
 */
export function error(message: string, options?: ToastOptions) {
  return sonnerToast.error(message, {
    duration: ERROR_DURATION,
    ...options,
  });
}

/**
 * Warning toast - amber theme
 * Use for important cautionary information
 */
export function warning(message: string, options?: ToastOptions) {
  return sonnerToast.warning(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
}

/**
 * Info toast - blue theme
 * Use for general information
 */
export function info(message: string, options?: ToastOptions) {
  return sonnerToast.info(message, {
    duration: DEFAULT_DURATION,
    ...options,
  });
}

/**
 * Loading toast
 * Use for async operations - must be manually dismissed
 */
export function loading(message: string, options?: ToastOptions) {
  return sonnerToast.loading(message, {
    duration: LOADING_DURATION,
    ...options,
  });
}

/**
 * Dismiss a specific toast
 */
export function dismiss(toastId: string | number) {
  return sonnerToast.dismiss(toastId);
}

/**
 * Dismiss all toasts
 */
export function dismissAll() {
  return sonnerToast.dismiss();
}

/**
 * Promise toast - shows loading, then success/error
 * Automatically handles async operations
 */
export function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
  options?: ToastOptions
) {
  return sonnerToast.promise(promise, messages, options);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMON HEALTHCARE TOASTS
// ═══════════════════════════════════════════════════════════════════════════

export const toasts = {
  // Document Operations
  documentSaved: () => success('Document saved successfully'),
  documentSubmitted: () => success('Document submitted for review'),
  documentSigned: () => success('Document signed successfully'),
  documentDeleted: () => success('Document deleted'),
  
  // Visit Operations
  visitScheduled: (patientName: string) => 
    success(`Visit scheduled for ${patientName}`),
  visitCompleted: () => success('Visit completed'),
  visitCancelled: () => success('Visit cancelled'),
  
  // Assessment Operations
  assessmentSaved: () => success('Assessment saved'),
  assessmentSubmitted: () => success('Assessment submitted'),
  assessmentApproved: () => success('Assessment approved'),
  
  // Order Operations
  orderCreated: () => success('Order created successfully'),
  orderSigned: () => success('Order signed'),
  orderCancelled: () => success('Order cancelled'),
  
  // Patient Operations
  patientAdmitted: (patientName: string) => 
    success(`${patientName} admitted successfully`),
  patientDischarged: (patientName: string) => 
    success(`${patientName} discharged successfully`),
  
  // Care Plan Operations
  carePlanUpdated: () => success('Care plan updated'),
  goalAdded: () => success('Goal added to care plan'),
  
  // Integration Operations
  integrationEnabled: (name: string) => 
    success(`${name} integration enabled`),
  integrationDisabled: (name: string) => 
    success(`${name} integration disabled`),
  integrationTestSuccess: (name: string) => 
    success(`${name} connection test succeeded`),
  
  // QA Operations
  documentReturned: () => success('Document returned for corrections'),
  documentApproved: () => success('Document approved'),
  
  // Caregiver Operations
  credentialAdded: () => success('Credential added'),
  credentialExpiring: (name: string, days: number) => 
    warning(`${name} expires in ${days} days`),
  
  // General Errors
  networkError: () => error('Network error - please try again'),
  saveError: () => error('Failed to save - please try again'),
  loadError: () => error('Failed to load data'),
  validationError: (message: string) => error(message),
  permissionError: () => error('You do not have permission for this action'),
  
  // Warnings
  unsavedChanges: () => warning('You have unsaved changes'),
  sessionExpiring: (minutes: number) => 
    warning(`Your session will expire in ${minutes} minutes`),
  
  // Info
  autosaveEnabled: () => info('Auto-save is enabled'),
  offlineMode: () => info('Working in offline mode'),
};

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED TOAST PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Undo toast pattern
 * Shows success with undo button
 */
export function successWithUndo(
  message: string,
  onUndo: () => void,
  options?: ToastOptions
) {
  return success(message, {
    ...options,
    action: {
      label: 'Undo',
      onClick: onUndo,
    },
  });
}

/**
 * Delete confirmation toast with undo
 */
export function deleted(
  itemName: string,
  onUndo: () => void,
  options?: ToastOptions
) {
  return successWithUndo(`${itemName} deleted`, onUndo, {
    ...options,
    duration: 5000, // Give more time to undo
  });
}

/**
 * Async operation toast
 * Shows loading, then success/error automatically
 */
export function asyncOperation<T>(
  operation: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error?: string;
  }
) {
  return promise(operation, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error || 'Operation failed',
  });
}

/**
 * Batch operation progress toast
 */
export function batchProgress(
  message: string,
  current: number,
  total: number
) {
  return info(`${message} (${current}/${total})`, {
    duration: LOADING_DURATION,
  });
}

// Export all functions
export const toast = {
  success,
  error,
  warning,
  info,
  loading,
  promise,
  dismiss,
  dismissAll,
  ...toasts,
  successWithUndo,
  deleted,
  asyncOperation,
  batchProgress,
};

export default toast;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// BASIC USAGE
import { toast } from '@/lib/toastNotifications';

// Simple success
toast.success('Patient saved successfully');

// Simple error
toast.error('Failed to load patient data');

// Warning
toast.warning('This action cannot be undone');

// Info
toast.info('New message received');

// COMMON HEALTHCARE OPERATIONS
import { toast } from '@/lib/toastNotifications';

// Document operations
toast.documentSaved();
toast.documentSubmitted();

// Visit operations
toast.visitScheduled('John Doe');
toast.visitCompleted();

// Assessment operations
toast.assessmentSubmitted();

// WITH UNDO ACTION
import { toast } from '@/lib/toastNotifications';

const handleDelete = async () => {
  const backup = [...items];
  setItems(items.filter(i => i.id !== itemId));
  
  toast.deleted('Visit note', async () => {
    setItems(backup);
    await restoreItem(itemId);
  });
};

// ASYNC OPERATIONS
import { toast } from '@/lib/toastNotifications';

// Manual loading toast
const saveDocument = async () => {
  const toastId = toast.loading('Saving document...');
  
  try {
    await api.saveDocument(document);
    toast.dismiss(toastId);
    toast.success('Document saved');
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('Failed to save document');
  }
};

// Automatic promise toast
const saveDocument = async () => {
  await toast.asyncOperation(
    api.saveDocument(document),
    {
      loading: 'Saving document...',
      success: 'Document saved successfully',
      error: 'Failed to save document',
    }
  );
};

// WITH PROMISE API
const submitAssessment = async () => {
  toast.promise(
    api.submitAssessment(assessmentId),
    {
      loading: 'Submitting assessment...',
      success: (data) => `Assessment ${data.id} submitted successfully`,
      error: (err) => `Submission failed: ${err.message}`,
    }
  );
};

// BATCH OPERATIONS
const syncDocuments = async (documents) => {
  let toastId;
  
  for (let i = 0; i < documents.length; i++) {
    toastId = toast.batchProgress('Syncing documents', i + 1, documents.length);
    await syncDocument(documents[i]);
  }
  
  toast.dismiss(toastId);
  toast.success(`${documents.length} documents synced`);
};

// WITH CUSTOM ACTION
toast.error('Integration test failed', {
  action: {
    label: 'Retry',
    onClick: () => testIntegration(),
  },
});

// COMPLEX EXAMPLE - FORM SUBMISSION
const handleSubmit = async (formData) => {
  const toastId = toast.loading('Submitting form...');
  
  try {
    const result = await submitForm(formData);
    toast.dismiss(toastId);
    
    if (result.warnings?.length > 0) {
      toast.warning(`Form submitted with ${result.warnings.length} warnings`, {
        action: {
          label: 'View',
          onClick: () => showWarnings(result.warnings),
        },
      });
    } else {
      toast.success('Form submitted successfully');
    }
    
    navigate('/forms');
  } catch (error) {
    toast.dismiss(toastId);
    toast.error(error.message || 'Submission failed', {
      action: {
        label: 'Retry',
        onClick: () => handleSubmit(formData),
      },
    });
  }
};

// SESSION MANAGEMENT
const handleSessionWarning = (minutesRemaining) => {
  toast.warning(`Session expires in ${minutesRemaining} minutes`, {
    duration: 10000,
    action: {
      label: 'Extend',
      onClick: () => extendSession(),
    },
  });
};

// OFFLINE MODE
const handleOfflineSync = async () => {
  const pendingChanges = getOfflineChanges();
  
  if (pendingChanges.length === 0) {
    toast.info('No pending changes to sync');
    return;
  }
  
  const toastId = toast.loading(`Syncing ${pendingChanges.length} changes...`);
  
  try {
    await syncOfflineChanges(pendingChanges);
    toast.dismiss(toastId);
    toast.success(`${pendingChanges.length} changes synced successfully`);
  } catch (error) {
    toast.dismiss(toastId);
    toast.error('Sync failed - will retry later');
  }
};
*/
