/**
 * Empty State Pattern
 * 
 * Consistent empty state component for when pages/modules have no data.
 * Guides users on what to do next with clear CTAs.
 * 
 * Use Cases:
 * - No visits scheduled
 * - No documents available
 * - No alerts
 * - No integrations configured
 * - No search results
 * - No filter matches
 * 
 * Performance:
 * - Lazy-loaded illustrations
 * - Memoized component
 */

import { memo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { 
  FileText,
  Calendar,
  Users,
  AlertTriangle,
  Search,
  Filter,
  Inbox,
  Package,
  Settings,
  Plus,
  Upload,
  Download,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type EmptyStateType =
  | 'no-data'
  | 'no-results'
  | 'no-filter-matches'
  | 'not-configured'
  | 'access-denied'
  | 'error'
  | 'custom';

interface EmptyStateAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  onClick: () => void;
}

interface EmptyStateProps {
  /** Empty state type (determines default icon/message) */
  type?: EmptyStateType;
  
  /** Custom icon */
  icon?: ReactNode;
  
  /** Title */
  title: string;
  
  /** Description */
  description?: string;
  
  /** Primary action */
  primaryAction?: EmptyStateAction;
  
  /** Secondary action */
  secondaryAction?: EmptyStateAction;
  
  /** Additional actions */
  additionalActions?: EmptyStateAction[];
  
  /** Illustration or custom content */
  illustration?: ReactNode;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show border */
  bordered?: boolean;
  
  /** Custom className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT ICONS BY TYPE
// ═══════════════════════════════════════════════════════════════════════════

const defaultIcons: Record<EmptyStateType, typeof Inbox> = {
  'no-data': Inbox,
  'no-results': Search,
  'no-filter-matches': Filter,
  'not-configured': Settings,
  'access-denied': AlertTriangle,
  'error': AlertTriangle,
  'custom': Package,
};

const defaultIconColors: Record<EmptyStateType, string> = {
  'no-data': 'text-gray-400',
  'no-results': 'text-blue-400',
  'no-filter-matches': 'text-amber-400',
  'not-configured': 'text-purple-400',
  'access-denied': 'text-red-400',
  'error': 'text-red-400',
  'custom': 'text-gray-400',
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const EmptyState = memo(function EmptyState({
  type = 'no-data',
  icon: customIcon,
  title,
  description,
  primaryAction,
  secondaryAction,
  additionalActions = [],
  illustration,
  size = 'md',
  bordered = false,
  className,
}: EmptyStateProps) {
  const DefaultIcon = defaultIcons[type];
  const iconColor = defaultIconColors[type];

  const sizeConfig = {
    sm: {
      icon: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
      padding: 'py-8',
    },
    md: {
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-base',
      padding: 'py-12',
    },
    lg: {
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-lg',
      padding: 'py-16',
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        config.padding,
        bordered && 'border-2 border-dashed border-gray-300 rounded-lg',
        className
      )}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className={cn('mb-6', iconColor)}>
          {customIcon || <DefaultIcon className={config.icon} />}
        </div>
      )}

      {/* Title */}
      <h3 className={cn('font-bold text-gray-900 mb-2', config.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn('text-gray-600 mb-6 max-w-md', config.description)}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction || additionalActions.length > 0) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Primary Action */}
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              variant={primaryAction.variant || 'default'}
              className={cn(
                'bg-blue-600 hover:bg-blue-700',
                size === 'lg' && 'px-6 py-3 text-base'
              )}
            >
              {primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}

          {/* Secondary Action */}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
              className={size === 'lg' ? 'px-6 py-3 text-base' : ''}
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}

          {/* Additional Actions */}
          {additionalActions.map((action) => (
            <Button
              key={action.id}
              onClick={action.onClick}
              variant={action.variant || 'ghost'}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// PRE-CONFIGURED VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

interface NoDataEmptyStateProps {
  entityName: string;
  onAdd?: () => void;
  onImport?: () => void;
}

export const NoDataEmptyState = memo(function NoDataEmptyState({
  entityName,
  onAdd,
  onImport,
}: NoDataEmptyStateProps) {
  return (
    <EmptyState
      type="no-data"
      title={`No ${entityName} yet`}
      description={`Get started by adding your first ${entityName.toLowerCase()}.`}
      primaryAction={onAdd ? {
        id: 'add',
        label: `Add ${entityName}`,
        icon: <Plus className="w-4 h-4 mr-2" />,
        onClick: onAdd,
      } : undefined}
      secondaryAction={onImport ? {
        id: 'import',
        label: 'Import',
        icon: <Upload className="w-4 h-4 mr-2" />,
        onClick: onImport,
      } : undefined}
    />
  );
});

interface NoSearchResultsEmptyStateProps {
  searchTerm: string;
  onClearSearch: () => void;
}

export const NoSearchResultsEmptyState = memo(function NoSearchResultsEmptyState({
  searchTerm,
  onClearSearch,
}: NoSearchResultsEmptyStateProps) {
  return (
    <EmptyState
      type="no-results"
      title="No results found"
      description={`We couldn't find any results for "${searchTerm}". Try adjusting your search.`}
      primaryAction={{
        id: 'clear',
        label: 'Clear Search',
        variant: 'outline',
        onClick: onClearSearch,
      }}
    />
  );
});

interface NoFilterMatchesEmptyStateProps {
  onClearFilters: () => void;
}

export const NoFilterMatchesEmptyState = memo(function NoFilterMatchesEmptyState({
  onClearFilters,
}: NoFilterMatchesEmptyStateProps) {
  return (
    <EmptyState
      type="no-filter-matches"
      title="No matches found"
      description="No items match your current filters. Try adjusting your filter criteria."
      primaryAction={{
        id: 'clear',
        label: 'Clear Filters',
        variant: 'outline',
        onClick: onClearFilters,
      }}
    />
  );
});

interface NotConfiguredEmptyStateProps {
  moduleName: string;
  onConfigure: () => void;
}

export const NotConfiguredEmptyState = memo(function NotConfiguredEmptyState({
  moduleName,
  onConfigure,
}: NotConfiguredEmptyStateProps) {
  return (
    <EmptyState
      type="not-configured"
      title={`${moduleName} not configured`}
      description={`${moduleName} requires configuration before it can be used. Configure it now to get started.`}
      primaryAction={{
        id: 'configure',
        label: 'Configure Now',
        icon: <Settings className="w-4 h-4 mr-2" />,
        onClick: onConfigure,
      }}
      size="lg"
    />
  );
});

EmptyState.displayName = 'EmptyState';
NoDataEmptyState.displayName = 'NoDataEmptyState';
NoSearchResultsEmptyState.displayName = 'NoSearchResultsEmptyState';
NoFilterMatchesEmptyState.displayName = 'NoFilterMatchesEmptyState';
NotConfiguredEmptyState.displayName = 'NotConfiguredEmptyState';

export default EmptyState;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// Generic Empty State
<EmptyState
  type="no-data"
  title="No visits scheduled"
  description="There are no visits scheduled for this week. Schedule your first visit to get started."
  primaryAction={{
    id: 'schedule',
    label: 'Schedule Visit',
    icon: <Calendar className="w-4 h-4 mr-2" />,
    onClick: () => setShowScheduleModal(true)
  }}
  secondaryAction={{
    id: 'view-all',
    label: 'View All Visits',
    variant: 'outline',
    onClick: () => navigate('/visits')
  }}
/>

// Pre-configured: No Data
<NoDataEmptyState
  entityName="Patients"
  onAdd={() => setShowAddPatientModal(true)}
  onImport={() => setShowImportModal(true)}
/>

// Pre-configured: No Search Results
<NoSearchResultsEmptyState
  searchTerm={searchQuery}
  onClearSearch={() => setSearchQuery('')}
/>

// Pre-configured: No Filter Matches
<NoFilterMatchesEmptyState
  onClearFilters={resetFilters}
/>

// Pre-configured: Not Configured
<NotConfiguredEmptyState
  moduleName="Electronic Signature Integration"
  onConfigure={() => navigate('/settings/integrations/signature')}
/>

// Custom with Illustration
<EmptyState
  icon={<FileText className="w-20 h-20 text-blue-400" />}
  title="No documents found"
  description="This patient doesn't have any clinical documents yet."
  primaryAction={{
    id: 'create',
    label: 'Create Document',
    onClick: createDocument
  }}
  size="lg"
  bordered
/>
*/
