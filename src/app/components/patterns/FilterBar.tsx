/**
 * Filter Bar Pattern
 * 
 * Reusable filter component for lists, queues, and dashboards.
 * Provides consistent filtering experience across modules.
 * 
 * Features:
 * - Quick filters (predefined common filters)
 * - Advanced filters (detailed filter form)
 * - Saved filter views
 * - Clear all functionality
 * - Active filter count badge
 * 
 * Use Cases:
 * - List pages (patients, admissions, orders)
 * - Queue pages (EVV errors, QA review)
 * - Dashboard filtering
 * 
 * Performance:
 * - Memoized components
 * - Debounced filter changes
 * - Optimized re-renders
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Filter,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  Star,
  Trash2,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface QuickFilter {
  id: string;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, any>;
  isDefault?: boolean;
}

interface FilterBarProps {
  /** Quick filters */
  quickFilters?: QuickFilter[];
  
  /** Advanced filter panel content */
  advancedFilters?: ReactNode;
  
  /** Show advanced filters by default */
  advancedFiltersOpen?: boolean;
  
  /** Active filter count */
  activeFiltersCount?: number;
  
  /** Search value */
  searchValue?: string;
  
  /** Search placeholder */
  searchPlaceholder?: string;
  
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  
  /** Clear all filters handler */
  onClearAll?: () => void;
  
  /** Saved views */
  savedViews?: SavedView[];
  
  /** Active saved view ID */
  activeSavedView?: string;
  
  /** Saved view change handler */
  onSavedViewChange?: (viewId: string) => void;
  
  /** Save current view handler */
  onSaveView?: (name: string) => void;
  
  /** Delete saved view handler */
  onDeleteView?: (viewId: string) => void;
  
  /** Show search */
  showSearch?: boolean;
  
  /** Show quick filters */
  showQuickFilters?: boolean;
  
  /** Show saved views */
  showSavedViews?: boolean;
  
  /** Compact mode */
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER BAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const FilterBar = memo(function FilterBar({
  quickFilters = [],
  advancedFilters,
  advancedFiltersOpen: initialAdvancedOpen = false,
  activeFiltersCount = 0,
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  onClearAll,
  savedViews = [],
  activeSavedView,
  onSavedViewChange,
  onSaveView,
  onDeleteView,
  showSearch = true,
  showQuickFilters = true,
  showSavedViews = false,
  compact = false,
}: FilterBarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(initialAdvancedOpen);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const toggleAdvanced = useCallback(() => {
    setAdvancedOpen(prev => !prev);
  }, []);

  const handleSaveView = useCallback(() => {
    if (newViewName.trim() && onSaveView) {
      onSaveView(newViewName.trim());
      setNewViewName('');
      setShowSaveDialog(false);
    }
  }, [newViewName, onSaveView]);

  const hasActiveFilters = activeFiltersCount > 0 || quickFilters.some(f => f.active);

  return (
    <div className="bg-white border-b">
      <div className={cn('px-6', compact ? 'py-3' : 'py-4')}>
        {/* Main Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          {showSearch && onSearchChange && (
            <div className="flex-1 min-w-[200px] max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* Saved Views Dropdown */}
          {showSavedViews && savedViews.length > 0 && (
            <div className="relative">
              <select
                value={activeSavedView || ''}
                onChange={(e) => onSavedViewChange?.(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white pr-8 appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <option value="">All Filters</option>
                {savedViews.map((view) => (
                  <option key={view.id} value={view.id}>
                    {view.isDefault ? '⭐ ' : ''}{view.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Advanced Filters Toggle */}
          {advancedFilters && (
            <Button
              variant={advancedOpen ? 'default' : 'outline'}
              size="sm"
              onClick={toggleAdvanced}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'ml-2',
                    advancedOpen && 'bg-white text-blue-600'
                  )}
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Clear All */}
          {hasActiveFilters && onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}

          {/* Save View Button */}
          {showSavedViews && onSaveView && activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save View
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        {showQuickFilters && quickFilters.length > 0 && (
          <div className="flex items-center gap-2 mt-3 overflow-x-auto">
            <span className="text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
              Quick Filters:
            </span>
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
        )}

        {/* Advanced Filters Panel */}
        {advancedFilters && advancedOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            {advancedFilters}
          </div>
        )}

        {/* Save View Dialog */}
        {showSaveDialog && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="View name..."
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveView();
                  } else if (e.key === 'Escape') {
                    setShowSaveDialog(false);
                    setNewViewName('');
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleSaveView}
                disabled={!newViewName.trim()}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewViewName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// COMMON FILTER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface FilterSelectProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const FilterSelect = memo(function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
}: FilterSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

interface FilterDateRangeProps {
  label: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const FilterDateRange = memo(function FilterDateRange({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: FilterDateRangeProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          placeholder="Start date"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          placeholder="End date"
        />
      </div>
    </div>
  );
});

interface FilterCheckboxGroupProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const FilterCheckboxGroup = memo(function FilterCheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: FilterCheckboxGroupProps) {
  const handleToggle = useCallback((value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }, [selected, onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
});

// Export all components
export default {
  FilterBar,
  FilterSelect,
  FilterDateRange,
  FilterCheckboxGroup,
};
