/**
 * Empty States
 * 
 * Helpful empty state components with suggested actions.
 * 
 * Features:
 * - Context-specific empty messages
 * - Suggested actions (CTAs)
 * - Visual consistency
 * - Onboarding guidance
 * - Quick action buttons
 * 
 * @example
 * ```tsx
 * // No data with action
 * <EmptyState
 *   icon={Calendar}
 *   title="No visits scheduled"
 *   description="Schedule your first visit to get started"
 *   action={{
 *     label: 'Schedule Visit',
 *     onClick: handleScheduleVisit
 *   }}
 * />
 * 
 * // Search results empty
 * <EmptyState
 *   variant="search"
 *   title="No results found"
 *   description="Try adjusting your search criteria"
 * />
 * ```
 */

import React from 'react';
import {
  FileText,
  Calendar,
  Pill,
  Users,
  Search,
  Inbox,
  FileQuestion,
  Plus,
  Upload,
  Filter,
  AlertCircle,
  CheckCircle,
  Package
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ==================== TYPES ====================

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

export type EmptyStateVariant = 'default' | 'search' | 'filter' | 'error' | 'success';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  variant?: EmptyStateVariant;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

// ==================== EMPTY STATE COMPONENT ====================

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  size = 'md',
  children
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'search':
        return {
          icon: Icon || Search,
          iconColor: 'text-gray-400',
          iconBg: 'bg-gray-100'
        };
      case 'filter':
        return {
          icon: Icon || Filter,
          iconColor: 'text-gray-400',
          iconBg: 'bg-gray-100'
        };
      case 'error':
        return {
          icon: Icon || AlertCircle,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-100'
        };
      case 'success':
        return {
          icon: Icon || CheckCircle,
          iconColor: 'text-green-500',
          iconBg: 'bg-green-100'
        };
      default:
        return {
          icon: Icon || Inbox,
          iconColor: 'text-blue-500',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-8',
          iconSize: 'w-12 h-12',
          iconContainer: 'w-16 h-16',
          title: 'text-base',
          description: 'text-sm',
          spacing: 'space-y-2'
        };
      case 'lg':
        return {
          container: 'py-16',
          iconSize: 'w-20 h-20',
          iconContainer: 'w-28 h-28',
          title: 'text-2xl',
          description: 'text-base',
          spacing: 'space-y-6'
        };
      default: // md
        return {
          container: 'py-12',
          iconSize: 'w-16 h-16',
          iconContainer: 'w-24 h-24',
          title: 'text-xl',
          description: 'text-base',
          spacing: 'space-y-4'
        };
    }
  };

  const config = getVariantConfig();
  const sizeClasses = getSizeClasses();
  const DisplayIcon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses.container}`}>
      <div className={`${config.iconBg} ${sizeClasses.iconContainer} rounded-full flex items-center justify-center mb-4`}>
        <DisplayIcon className={`${sizeClasses.iconSize} ${config.iconColor}`} />
      </div>
      
      <div className={sizeClasses.spacing}>
        <h3 className={`${sizeClasses.title} font-semibold text-gray-900`}>
          {title}
        </h3>
        
        {description && (
          <p className={`${sizeClasses.description} text-gray-600 max-w-md mx-auto`}>
            {description}
          </p>
        )}
        
        {children && (
          <div className="max-w-md mx-auto">
            {children}
          </div>
        )}
        
        {(action || secondaryAction) && (
          <div className="flex items-center justify-center gap-3 pt-2">
            {action && (
              <button
                onClick={action.onClick}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  action.variant === 'secondary'
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </button>
            )}
            
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
              >
                {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== PRESET EMPTY STATES ====================

interface PresetEmptyStateProps {
  onAction?: () => void;
  actionLabel?: string;
  customDescription?: string;
}

export const NoVisitsScheduled: React.FC<PresetEmptyStateProps> = ({
  onAction,
  actionLabel = 'Schedule Visit',
  customDescription
}) => (
  <EmptyState
    icon={Calendar}
    title="No visits scheduled"
    description={customDescription || "You haven't scheduled any visits yet. Create your first visit to get started."}
    action={onAction ? { label: actionLabel, onClick: onAction, icon: Plus } : undefined}
  />
);

export const NoMedications: React.FC<PresetEmptyStateProps> = ({
  onAction,
  actionLabel = 'Add Medication',
  customDescription
}) => (
  <EmptyState
    icon={Pill}
    title="No medications recorded"
    description={customDescription || "No medications have been added to this patient's record."}
    action={onAction ? { label: actionLabel, onClick: onAction, icon: Plus } : undefined}
  />
);

export const NoDocuments: React.FC<PresetEmptyStateProps> = ({
  onAction,
  actionLabel = 'Create Document',
  customDescription
}) => (
  <EmptyState
    icon={FileText}
    title="No documents created"
    description={customDescription || "Start documenting care by creating your first clinical note."}
    action={onAction ? { label: actionLabel, onClick: onAction, icon: Plus } : undefined}
  />
);

export const NoPatients: React.FC<PresetEmptyStateProps> = ({
  onAction,
  actionLabel = 'Add Patient',
  customDescription
}) => (
  <EmptyState
    icon={Users}
    title="No patients found"
    description={customDescription || "Your patient list is empty. Add your first patient to begin."}
    action={onAction ? { label: actionLabel, onClick: onAction, icon: Plus } : undefined}
  />
);

export const NoSearchResults: React.FC<{ query?: string; onReset?: () => void }> = ({
  query,
  onReset
}) => (
  <EmptyState
    variant="search"
    title="No results found"
    description={query ? `No results found for "${query}". Try different keywords.` : 'Try adjusting your search criteria.'}
    action={onReset ? { label: 'Clear Search', onClick: onReset, variant: 'secondary' } : undefined}
  />
);

export const NoFilterResults: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <EmptyState
    variant="filter"
    title="No matching results"
    description="No items match your current filters. Try adjusting your criteria."
    action={onReset ? { label: 'Clear Filters', onClick: onReset, variant: 'secondary' } : undefined}
  />
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message,
  onRetry
}) => (
  <EmptyState
    variant="error"
    title="Something went wrong"
    description={message || 'An error occurred while loading data. Please try again.'}
    action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
  />
);

export const SuccessState: React.FC<{ title?: string; message?: string; onContinue?: () => void }> = ({
  title = 'All done!',
  message,
  onContinue
}) => (
  <EmptyState
    variant="success"
    title={title}
    description={message || 'Operation completed successfully.'}
    action={onContinue ? { label: 'Continue', onClick: onContinue } : undefined}
  />
);

// ==================== EMPTY TABLE ====================

interface EmptyTableProps {
  columns: number;
  icon?: LucideIcon;
  message?: string;
  action?: EmptyStateAction;
}

export const EmptyTable: React.FC<EmptyTableProps> = ({
  columns,
  icon: Icon = Inbox,
  message = 'No data available',
  action
}) => (
  <tr>
    <td colSpan={columns} className="px-6 py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 mb-4">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {action.icon && <action.icon className="w-4 h-4" />}
            {action.label}
          </button>
        )}
      </div>
    </td>
  </tr>
);

// ==================== EMPTY LIST ====================

interface EmptyListProps {
  icon?: LucideIcon;
  message?: string;
  action?: EmptyStateAction;
  compact?: boolean;
}

export const EmptyList: React.FC<EmptyListProps> = ({
  icon: Icon = Inbox,
  message = 'No items to display',
  action,
  compact = false
}) => (
  <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-12'}`}>
    <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} bg-gray-100 rounded-full flex items-center justify-center mb-3`}>
      <Icon className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-gray-400`} />
    </div>
    <p className={`text-gray-600 ${compact ? 'text-sm mb-2' : 'mb-4'}`}>{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className={`inline-flex items-center gap-2 ${compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors`}
      >
        {action.icon && <action.icon className={compact ? 'w-3 h-3' : 'w-4 h-4'} />}
        {action.label}
      </button>
    )}
  </div>
);

// ==================== EMPTY DASHBOARD CARD ====================

interface EmptyCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: EmptyStateAction;
}

export const EmptyCard: React.FC<EmptyCardProps> = ({
  title,
  description,
  icon: Icon = Package,
  action
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-600 mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
        >
          {action.icon && <action.icon className="w-3 h-3" />}
          {action.label}
        </button>
      )}
    </div>
  </div>
);

// ==================== UPLOAD EMPTY STATE ====================

interface EmptyUploadProps {
  onUpload: () => void;
  acceptedFormats?: string[];
  maxSize?: string;
}

export const EmptyUpload: React.FC<EmptyUploadProps> = ({
  onUpload,
  acceptedFormats,
  maxSize
}) => (
  <div
    onClick={onUpload}
    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
  >
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Upload className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-900 mb-2">
      Upload files
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      Click to browse or drag and drop
    </p>
    {(acceptedFormats || maxSize) && (
      <p className="text-xs text-gray-500">
        {acceptedFormats && `Supported: ${acceptedFormats.join(', ')}`}
        {acceptedFormats && maxSize && ' • '}
        {maxSize && `Max size: ${maxSize}`}
      </p>
    )}
  </div>
);

// ==================== ONBOARDING EMPTY STATE ====================

interface OnboardingEmptyProps {
  steps: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    action?: EmptyStateAction;
  }>;
  title?: string;
}

export const OnboardingEmpty: React.FC<OnboardingEmptyProps> = ({
  steps,
  title = "Let's get started"
}) => (
  <div className="py-12">
    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{title}</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        return (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{step.description}</p>
            {step.action && (
              <button
                onClick={step.action.onClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                {step.action.icon && <step.action.icon className="w-4 h-4" />}
                {step.action.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
