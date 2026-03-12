/**
 * Queue Page Shell
 * 
 * Reusable layout for work queue management screens.
 * Used for: Delayed Visits, EVV Errors, QA Pending Review, Orders Pending Signature, 
 *          Credential Issues, Admissions Not Ready, etc.
 * 
 * Layout Structure:
 * - Queue header with title and priority summary
 * - Priority summary cards (high/medium/low/overdue)
 * - Filter bar with quick filters and search
 * - Queue list with sorting and grouping
 * - Quick triage actions
 * - Optional details drawer for item review
 * 
 * Features:
 * - Priority-based color coding
 * - Age/SLA indicators
 * - Bulk triage actions
 * - Quick assignment workflows
 * - Real-time updates support
 * 
 * Performance:
 * - Memoized component
 * - Virtualized queue list
 * - Server-side filtering and sorting
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  AlertTriangle,
  Clock,
  Filter,
  Search,
  RefreshCw,
  ChevronLeft,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface PrioritySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  overdue?: number;
}

interface QuickFilter {
  id: string;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}

interface QueuePageShellProps {
  /** Queue title */
  title: string;
  
  /** Queue description */
  subtitle?: string;
  
  /** Priority summary data */
  prioritySummary?: PrioritySummary;
  
  /** Quick filters */
  quickFilters?: QuickFilter[];
  
  /** Search placeholder */
  searchPlaceholder?: string;
  
  /** Search value */
  searchValue?: string;
  
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  
  /** Advanced filter panel */
  filterPanel?: ReactNode;
  
  /** Show filter panel by default */
  filterPanelOpen?: boolean;
  
  /** Active filter count */
  activeFiltersCount?: number;
  
  /** Main queue content */
  children: ReactNode;
  
  /** Quick triage actions */
  triageActions?: ReactNode;
  
  /** Number of selected items */
  selectedCount?: number;
  
  /** Clear selection handler */
  onClearSelection?: () => void;
  
  /** Detail drawer content */
  detailDrawer?: ReactNode;
  
  /** Show detail drawer */
  detailDrawerOpen?: boolean;
  
  /** Close detail drawer handler */
  onCloseDetailDrawer?: () => void;
  
  /** Refresh handler */
  onRefresh?: () => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Total queue count */
  totalCount?: number;
  
  /** Show SLA indicators */
  showSlaIndicators?: boolean;
  
  /** Queue type for styling */
  queueType?: 'clinical' | 'operational' | 'compliance' | 'billing';
  
  /** Full width layout */
  fullWidth?: boolean;
  
  /** Header actions */
  headerActions?: ReactNode;
}

const QueuePageShell = memo(function QueuePageShell({
  title,
  subtitle,
  prioritySummary,
  quickFilters = [],
  searchPlaceholder = 'Search queue...',
  searchValue = '',
  onSearchChange,
  filterPanel,
  filterPanelOpen: initialFilterPanelOpen = false,
  activeFiltersCount = 0,
  children,
  triageActions,
  selectedCount = 0,
  onClearSelection,
  detailDrawer,
  detailDrawerOpen = false,
  onCloseDetailDrawer,
  onRefresh,
  loading = false,
  totalCount,
  showSlaIndicators = true,
  queueType = 'operational',
  fullWidth = false,
  headerActions,
}: QueuePageShellProps) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(initialFilterPanelOpen);

  const toggleFilterPanel = useCallback(() => {
    setFilterPanelOpen(prev => !prev);
  }, []);

  // Queue type color themes
  const queueTypeColors = {
    clinical: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
    operational: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
    compliance: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
    billing: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
  };

  const theme = queueTypeColors[queueType];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className={cn('border-b', theme.bg, theme.border)}>
        <div className={cn(
          'px-6 py-6',
          !fullWidth && 'max-w-[1800px] mx-auto'
        )}>
          <div className="flex items-start justify-between gap-4">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center border">
                  <Clock className={cn('w-5 h-5', theme.text)} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {title}
                    </h1>
                    <Badge variant="secondary" className="text-xs">
                      Queue
                    </Badge>
                    {totalCount !== undefined && (
                      <Badge variant="default" className="bg-gray-900">
                        {totalCount.toLocaleString()} items
                      </Badge>
                    )}
                  </div>
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-600">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={cn(
                    'w-4 h-4',
                    loading && 'animate-spin'
                  )} />
                </Button>
              )}
              {headerActions}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Summary Cards */}
      {prioritySummary && (
        <div className="bg-white border-b">
          <div className={cn(
            'px-6 py-4',
            !fullWidth && 'max-w-[1800px] mx-auto'
          )}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Overdue */}
              {prioritySummary.overdue !== undefined && prioritySummary.overdue > 0 && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-900 uppercase">
                      Overdue
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-900">
                    {prioritySummary.overdue.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Critical */}
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-semibold text-red-900 uppercase">
                    Critical
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-900">
                  {prioritySummary.critical.toLocaleString()}
                </div>
              </div>

              {/* High */}
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-900 uppercase">
                    High
                  </span>
                </div>
                <div className="text-2xl font-bold text-orange-900">
                  {prioritySummary.high.toLocaleString()}
                </div>
              </div>

              {/* Medium */}
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-900 uppercase">
                    Medium
                  </span>
                </div>
                <div className="text-2xl font-bold text-amber-900">
                  {prioritySummary.medium.toLocaleString()}
                </div>
              </div>

              {/* Low */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDown className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900 uppercase">
                    Low
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {prioritySummary.low.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filters Bar */}
      {quickFilters.length > 0 && (
        <div className="bg-white border-b">
          <div className={cn(
            'px-6 py-3',
            !fullWidth && 'max-w-[1800px] mx-auto'
          )}>
            <div className="flex items-center gap-2 overflow-x-auto">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={filter.active ? 'default' : 'outline'}
                  size="sm"
                  onClick={filter.onClick}
                  className="whitespace-nowrap"
                >
                  {filter.label}
                  {filter.count !== undefined && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        'ml-2',
                        filter.active && 'bg-white text-blue-600'
                      )}
                    >
                      {filter.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border-b">
        <div className={cn(
          'px-6 py-4',
          !fullWidth && 'max-w-[1800px] mx-auto'
        )}>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Advanced Filter Toggle */}
            {filterPanel && (
              <Button
                variant={filterPanelOpen ? 'default' : 'outline'}
                size="sm"
                onClick={toggleFilterPanel}
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* Advanced Filter Panel */}
          {filterPanel && filterPanelOpen && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              {filterPanel}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Triage Actions Bar */}
      {selectedCount > 0 && triageActions && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className={cn(
            'px-6 py-3',
            !fullWidth && 'max-w-[1800px] mx-auto'
          )}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                  className="text-blue-700 hover:text-blue-900"
                >
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {triageActions}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Queue Content */}
      <div className="relative">
        <div className={cn(
          'transition-all duration-200',
          detailDrawerOpen && 'mr-[600px]'
        )}>
          <div className={cn(
            'px-6 py-6',
            !fullWidth && 'max-w-[1800px] mx-auto'
          )}>
            {children}
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {detailDrawer && (
        <aside 
          className={cn(
            'fixed right-0 top-0 bottom-0 w-[600px] bg-white border-l shadow-lg z-40 transition-transform duration-200',
            detailDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Item Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseDetailDrawer}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto">
              {detailDrawer}
            </div>
          </div>
        </aside>
      )}

      {/* Detail Drawer Toggle (when closed) */}
      {detailDrawer && !detailDrawerOpen && (
        <button
          onClick={() => onCloseDetailDrawer?.()}
          className="fixed right-0 top-32 w-8 h-16 bg-white border border-r-0 rounded-l-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors z-20"
          aria-label="Open detail drawer"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
});

QueuePageShell.displayName = 'QueuePageShell';

export default QueuePageShell;
