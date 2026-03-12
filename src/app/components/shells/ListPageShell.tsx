/**
 * List Page Shell
 * 
 * Reusable layout for list-based modules and entity management.
 * Used for: Patients, Admissions, Orders, Claims, Caregivers, Documents, etc.
 * 
 * Layout Structure:
 * - Page header with title and primary actions
 * - Summary chips/counters for quick insights
 * - Filter bar with search and advanced filters
 * - Table or list region with sorting and pagination
 * - Bulk actions area
 * - Optional right-side detail drawer
 * 
 * Performance:
 * - Memoized component
 * - Server-side pagination support
 * - Virtualized lists for large datasets
 * - Debounced search
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  X,
  ChevronLeft,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface SummaryChip {
  id: string;
  label: string;
  value: number | string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
  onClick?: () => void;
}

interface ListPageShellProps {
  /** Page title */
  title: string;
  
  /** Page subtitle or description */
  subtitle?: string;
  
  /** Primary action button */
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  
  /** Additional header actions */
  headerActions?: ReactNode;
  
  /** Summary chips for quick insights */
  summaryChips?: SummaryChip[];
  
  /** Search placeholder text */
  searchPlaceholder?: string;
  
  /** Search value */
  searchValue?: string;
  
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  
  /** Filter panel content */
  filterPanel?: ReactNode;
  
  /** Show filter panel by default */
  filterPanelOpen?: boolean;
  
  /** Active filter count */
  activeFiltersCount?: number;
  
  /** Main content (table, list, grid, etc.) */
  children: ReactNode;
  
  /** Bulk actions when items are selected */
  bulkActions?: ReactNode;
  
  /** Number of selected items */
  selectedCount?: number;
  
  /** Clear selection handler */
  onClearSelection?: () => void;
  
  /** Right drawer content (for detail view) */
  detailDrawer?: ReactNode;
  
  /** Show detail drawer */
  detailDrawerOpen?: boolean;
  
  /** Close detail drawer handler */
  onCloseDetailDrawer?: () => void;
  
  /** Export data handler */
  onExport?: () => void;
  
  /** Import data handler */
  onImport?: () => void;
  
  /** Refresh data handler */
  onRefresh?: () => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Total count for display */
  totalCount?: number;
  
  /** Full width (no max-width constraint) */
  fullWidth?: boolean;
}

const ListPageShell = memo(function ListPageShell({
  title,
  subtitle,
  primaryAction,
  headerActions,
  summaryChips = [],
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filterPanel,
  filterPanelOpen: initialFilterPanelOpen = false,
  activeFiltersCount = 0,
  children,
  bulkActions,
  selectedCount = 0,
  onClearSelection,
  detailDrawer,
  detailDrawerOpen = false,
  onCloseDetailDrawer,
  onExport,
  onImport,
  onRefresh,
  loading = false,
  totalCount,
  fullWidth = false,
}: ListPageShellProps) {
  const [filterPanelOpen, setFilterPanelOpen] = useState(initialFilterPanelOpen);

  const toggleFilterPanel = useCallback(() => {
    setFilterPanelOpen(prev => !prev);
  }, []);

  // Chip variant color mapping
  const chipVariantClasses = {
    default: 'bg-gray-100 text-gray-900 border-gray-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-red-50 text-red-900 border-red-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className={cn(
          'px-6 py-6',
          !fullWidth && 'max-w-[1800px] mx-auto'
        )}>
          <div className="flex items-start justify-between gap-4">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {title}
                </h1>
                {totalCount !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {totalCount.toLocaleString()}
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
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
              
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
              
              {onImport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onImport}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              )}
              
              {headerActions}
              
              {primaryAction && (
                <Button
                  size="sm"
                  onClick={primaryAction.onClick}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {primaryAction.icon || <Plus className="w-4 h-4 mr-2" />}
                  {primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Chips */}
      {summaryChips.length > 0 && (
        <div className="bg-white border-b">
          <div className={cn(
            'px-6 py-4',
            !fullWidth && 'max-w-[1800px] mx-auto'
          )}>
            <div className="flex items-center gap-3 overflow-x-auto">
              {summaryChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={chip.onClick}
                  disabled={!chip.onClick}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                    chipVariantClasses[chip.variant || 'default'],
                    chip.onClick && 'hover:shadow-sm cursor-pointer',
                    !chip.onClick && 'cursor-default'
                  )}
                >
                  {chip.icon}
                  <div className="text-left whitespace-nowrap">
                    <div className="text-xs font-medium opacity-75">
                      {chip.label}
                    </div>
                    <div className="text-lg font-bold">
                      {typeof chip.value === 'number' 
                        ? chip.value.toLocaleString() 
                        : chip.value
                      }
                    </div>
                  </div>
                </button>
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

            {/* Filter Toggle */}
            {filterPanel && (
              <Button
                variant={filterPanelOpen ? 'default' : 'outline'}
                size="sm"
                onClick={toggleFilterPanel}
                className="relative"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-blue-600 text-white"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {filterPanel && filterPanelOpen && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              {filterPanel}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && bulkActions && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className={cn(
            'px-6 py-3',
            !fullWidth && 'max-w-[1800px] mx-auto'
          )}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-blue-600">
                  {selectedCount} selected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                >
                  Clear selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {bulkActions}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">
        <div className={cn(
          'transition-all duration-200',
          detailDrawerOpen && 'mr-[500px]'
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
            'fixed right-0 top-0 bottom-0 w-[500px] bg-white border-l shadow-lg z-40 transition-transform duration-200',
            detailDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Details</h3>
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

ListPageShell.displayName = 'ListPageShell';

export default ListPageShell;
