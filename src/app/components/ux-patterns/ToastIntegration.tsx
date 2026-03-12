/**
 * Toast Integration
 * 
 * Integration between UX patterns and Sonner toast system.
 * Provides standardized toast notifications for common scenarios.
 * 
 * @module UXPatterns/Integration
 */

import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

/**
 * Toast notification types aligned with error handling pattern
 */
export const toasts = {
  /**
   * Success toast - for successful operations
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle2 className="w-5 h-5" />
    });
  },

  /**
   * Error toast - for failed operations
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="w-5 h-5" />
    });
  },

  /**
   * Warning toast - for warnings that need attention
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertTriangle className="w-5 h-5" />
    });
  },

  /**
   * Info toast - for informational messages
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="w-5 h-5" />
    });
  },

  /**
   * Loading toast - for ongoing operations
   * Returns promise that can be updated
   */
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
      icon: <Loader2 className="w-5 h-5 animate-spin" />
    });
  },

  /**
   * Promise toast - automatically handles loading/success/error states
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error
    });
  }
};

/**
 * Healthcare-specific toast templates
 */
export const healthcareToasts = {
  // Save operations
  saveSuccess: (entity: string) => {
    toasts.success(`${entity} saved successfully`);
  },

  saveError: (entity: string) => {
    toasts.error(
      `Failed to save ${entity}`,
      'Please check your connection and try again.'
    );
  },

  // Delete operations
  deleteSuccess: (entity: string) => {
    toasts.success(`${entity} deleted successfully`);
  },

  deleteError: (entity: string) => {
    toasts.error(
      `Failed to delete ${entity}`,
      'The item may be in use or you may not have permission.'
    );
  },

  // Submit operations
  submitSuccess: (entity: string) => {
    toasts.success(
      `${entity} submitted successfully`,
      'It will be reviewed shortly.'
    );
  },

  submitError: (entity: string) => {
    toasts.error(
      `Failed to submit ${entity}`,
      'Please ensure all required fields are complete.'
    );
  },

  // Approval operations
  approveSuccess: (entity: string, count?: number) => {
    const message = count && count > 1 
      ? `${count} ${entity}s approved`
      : `${entity} approved`;
    toasts.success(message);
  },

  approveError: (entity: string) => {
    toasts.error(
      `Failed to approve ${entity}`,
      'Please try again or contact support.'
    );
  },

  // Export operations
  exportSuccess: (entity: string, count?: number) => {
    const message = count 
      ? `Exported ${count} ${entity} records`
      : `${entity} exported successfully`;
    toasts.success(message, 'The file is ready for download.');
  },

  exportError: (entity: string) => {
    toasts.error(
      `Failed to export ${entity}`,
      'Please try again later.'
    );
  },

  // Validation errors
  validationError: (message?: string) => {
    toasts.error(
      'Please fix validation errors',
      message || 'Some required fields are missing or invalid.'
    );
  },

  // Permission errors
  permissionError: () => {
    toasts.error(
      'Access denied',
      'You do not have permission to perform this action.'
    );
  },

  // Network errors
  networkError: () => {
    toasts.error(
      'Connection problem',
      'Unable to reach the server. Please check your connection.'
    );
  },

  // Assignment operations
  assignSuccess: (entity: string, assignee: string) => {
    toasts.success(
      `${entity} assigned to ${assignee}`,
      'They will be notified.'
    );
  },

  assignError: (entity: string) => {
    toasts.error(
      `Failed to assign ${entity}`,
      'Please try again.'
    );
  },

  // Document operations
  documentSigned: (documentType: string) => {
    toasts.success(
      `${documentType} signed successfully`,
      'The document is now complete.'
    );
  },

  documentReturned: (documentType: string, reviewer: string) => {
    toasts.warning(
      `${documentType} returned for corrections`,
      `Returned by ${reviewer}. Please review the feedback.`
    );
  },

  // Clinical operations
  assessmentCompleted: (assessmentType: string) => {
    toasts.success(
      `${assessmentType} completed`,
      'Assessment has been saved.'
    );
  },

  orderCreated: (orderType: string) => {
    toasts.success(
      `${orderType} created successfully`,
      'The order is pending physician signature.'
    );
  },

  visitCompleted: () => {
    toasts.success(
      'Visit completed',
      'Documentation has been saved and will be reviewed.'
    );
  },

  // Integration operations
  syncSuccess: (integration: string) => {
    toasts.success(
      `${integration} synced successfully`,
      'All data is up to date.'
    );
  },

  syncError: (integration: string) => {
    toasts.error(
      `Failed to sync with ${integration}`,
      'Please check integration settings.'
    );
  },

  // Bulk operations
  bulkSuccess: (count: number, action: string, entity: string) => {
    toasts.success(
      `${count} ${entity}${count > 1 ? 's' : ''} ${action}`,
      'Operation completed successfully.'
    );
  },

  bulkError: (count: number, action: string, entity: string) => {
    toasts.error(
      `Failed to ${action} ${count} ${entity}${count > 1 ? 's' : ''}`,
      'Some items may not have been processed.'
    );
  }
};

/**
 * Example usage:
 * 
 * // Basic toasts
 * toasts.success('Operation successful');
 * toasts.error('Operation failed', 'Please try again');
 * 
 * // Healthcare-specific toasts
 * healthcareToasts.saveSuccess('Patient record');
 * healthcareToasts.documentSigned('Plan of Care');
 * healthcareToasts.bulkSuccess(5, 'approved', 'visit');
 * 
 * // Promise toast for async operations
 * toasts.promise(
 *   savePatient(),
 *   {
 *     loading: 'Saving patient...',
 *     success: 'Patient saved successfully',
 *     error: 'Failed to save patient'
 *   }
 * );
 */
