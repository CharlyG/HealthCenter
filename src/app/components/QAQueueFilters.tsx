/**
 * QA Queue Filters Component
 * 
 * Advanced filtering capabilities for QA queues allowing reviewers to filter
 * items by office, clinician, discipline, document type, priority, and date
 * range. Helps reviewers manage large workloads efficiently.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Filter,
  X,
  ChevronDown,
  Search,
  Calendar,
  Building,
  User,
  Briefcase,
  FileText,
  Flag,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface QAQueueFilterOptions {
  offices: string[];
  clinicians: string[];
  disciplines: string[];
  documentTypes: string[];
  priorities: ('urgent' | 'high' | 'normal')[];
  statuses: string[];
}

export interface QAQueueFilters {
  offices: string[];
  clinicians: string[];
  disciplines: string[];
  documentTypes: string[];
  priorities: ('urgent' | 'high' | 'normal')[];
  statuses: string[];
  dateRange: {
    from?: string;
    to?: string;
  };
  searchQuery: string;
}

export interface QAQueueFilterStats {
  totalItems: number;
  filteredItems: number;
  activeFilterCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QAQueueFiltersProps {
  filters: QAQueueFilters;
  options: QAQueueFilterOptions;
  stats: QAQueueFilterStats;
  onFiltersChange: (filters: QAQueueFilters) => void;
  onReset: () => void;
  mode?: 'full' | 'compact';
}

export default function QAQueueFilters({
  filters,
  options,
  stats,
  onFiltersChange,
  onReset,
  mode = 'full',
}: QAQueueFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['search']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateFilter = <K extends keyof QAQueueFilters>(
    key: K,
    value: QAQueueFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof QAQueueFilters>(
    key: K,
    value: string
  ) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as QAQueueFilters[K]);
  };

  const hasActiveFilters = stats.activeFilterCount > 0;

  if (mode === 'compact') {
    return <CompactFilters filters={filters} stats={stats} onReset={onReset} />;
  }

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Queue Filters</h3>
              <p className="text-xs text-gray-600">
                Showing {stats.filteredItems} of {stats.totalItems} items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  {stats.activeFilterCount} active filter{stats.activeFilterCount !== 1 ? 's' : ''}
                </Badge>
                <Button variant="outline" size="sm" onClick={onReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset All
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Search */}
      <FilterSection
        title="Search"
        icon={Search}
        isExpanded={expandedSections.has('search')}
        onToggle={() => toggleSection('search')}
        count={filters.searchQuery ? 1 : 0}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by patient name, document ID, admission ID..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>
      </FilterSection>

      {/* Date Range */}
      <FilterSection
        title="Date Range"
        icon={Calendar}
        isExpanded={expandedSections.has('dateRange')}
        onToggle={() => toggleSection('dateRange')}
        count={
          (filters.dateRange.from ? 1 : 0) + (filters.dateRange.to ? 1 : 0)
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
            <Input
              type="date"
              value={filters.dateRange.from || ''}
              onChange={(e) =>
                updateFilter('dateRange', { ...filters.dateRange, from: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
            <Input
              type="date"
              value={filters.dateRange.to || ''}
              onChange={(e) =>
                updateFilter('dateRange', { ...filters.dateRange, to: e.target.value })
              }
            />
          </div>
        </div>
      </FilterSection>

      {/* Office */}
      <FilterSection
        title="Office"
        icon={Building}
        isExpanded={expandedSections.has('offices')}
        onToggle={() => toggleSection('offices')}
        count={filters.offices.length}
      >
        <div className="space-y-2">
          {options.offices.map((office) => (
            <label
              key={office}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.offices.includes(office)}
                onChange={() => toggleArrayFilter('offices', office)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-900">{office}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Clinician */}
      <FilterSection
        title="Clinician"
        icon={User}
        isExpanded={expandedSections.has('clinicians')}
        onToggle={() => toggleSection('clinicians')}
        count={filters.clinicians.length}
      >
        <div className="space-y-2">
          {options.clinicians.map((clinician) => (
            <label
              key={clinician}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.clinicians.includes(clinician)}
                onChange={() => toggleArrayFilter('clinicians', clinician)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-900">{clinician}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Discipline */}
      <FilterSection
        title="Discipline"
        icon={Briefcase}
        isExpanded={expandedSections.has('disciplines')}
        onToggle={() => toggleSection('disciplines')}
        count={filters.disciplines.length}
      >
        <div className="space-y-2">
          {options.disciplines.map((discipline) => (
            <label
              key={discipline}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.disciplines.includes(discipline)}
                onChange={() => toggleArrayFilter('disciplines', discipline)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-900">{discipline}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Document Type */}
      <FilterSection
        title="Document Type"
        icon={FileText}
        isExpanded={expandedSections.has('documentTypes')}
        onToggle={() => toggleSection('documentTypes')}
        count={filters.documentTypes.length}
      >
        <div className="space-y-2">
          {options.documentTypes.map((docType) => (
            <label
              key={docType}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.documentTypes.includes(docType)}
                onChange={() => toggleArrayFilter('documentTypes', docType)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-900">{docType}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Priority */}
      <FilterSection
        title="Priority"
        icon={Flag}
        isExpanded={expandedSections.has('priorities')}
        onToggle={() => toggleSection('priorities')}
        count={filters.priorities.length}
      >
        <div className="space-y-2">
          {options.priorities.map((priority) => (
            <label
              key={priority}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.priorities.includes(priority)}
                onChange={() => toggleArrayFilter('priorities', priority)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-900 capitalize">{priority}</span>
              <Badge
                variant="outline"
                className={cn(
                  'ml-auto text-xs',
                  priority === 'urgent'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : priority === 'high'
                    ? 'bg-orange-100 text-orange-700 border-orange-300'
                    : 'bg-blue-100 text-blue-700 border-blue-300'
                )}
              >
                {priority}
              </Badge>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Active Filters</h4>
            <Button variant="ghost" size="sm" onClick={onReset}>
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.searchQuery && (
              <FilterBadge
                label={`Search: "${filters.searchQuery}"`}
                onRemove={() => updateFilter('searchQuery', '')}
              />
            )}
            {filters.dateRange.from && (
              <FilterBadge
                label={`From: ${new Date(filters.dateRange.from).toLocaleDateString()}`}
                onRemove={() =>
                  updateFilter('dateRange', { ...filters.dateRange, from: undefined })
                }
              />
            )}
            {filters.dateRange.to && (
              <FilterBadge
                label={`To: ${new Date(filters.dateRange.to).toLocaleDateString()}`}
                onRemove={() =>
                  updateFilter('dateRange', { ...filters.dateRange, to: undefined })
                }
              />
            )}
            {filters.offices.map((office) => (
              <FilterBadge
                key={office}
                label={`Office: ${office}`}
                onRemove={() => toggleArrayFilter('offices', office)}
              />
            ))}
            {filters.clinicians.map((clinician) => (
              <FilterBadge
                key={clinician}
                label={`Clinician: ${clinician}`}
                onRemove={() => toggleArrayFilter('clinicians', clinician)}
              />
            ))}
            {filters.disciplines.map((discipline) => (
              <FilterBadge
                key={discipline}
                label={`Discipline: ${discipline}`}
                onRemove={() => toggleArrayFilter('disciplines', discipline)}
              />
            ))}
            {filters.documentTypes.map((docType) => (
              <FilterBadge
                key={docType}
                label={`Type: ${docType}`}
                onRemove={() => toggleArrayFilter('documentTypes', docType)}
              />
            ))}
            {filters.priorities.map((priority) => (
              <FilterBadge
                key={priority}
                label={`Priority: ${priority}`}
                onRemove={() => toggleArrayFilter('priorities', priority)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER SECTION
// ═══════════════════════════════════════════════════════════════════════════

function FilterSection({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  count,
  children,
}: {
  title: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">{title}</span>
          {count > 0 && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
              {count}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FILTER BADGE
// ═══════════════════════════════════════════════════════════════════════════

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      variant="outline"
      className="bg-blue-50 text-blue-700 border-blue-300 pl-2 pr-1 py-1"
    >
      <span className="text-xs">{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-blue-200 rounded p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT FILTERS
// ═══════════════════════════════════════════════════════════════════════════

function CompactFilters({
  filters,
  stats,
  onReset,
}: {
  filters: QAQueueFilters;
  stats: QAQueueFilterStats;
  onReset: () => void;
}) {
  const hasActiveFilters = stats.activeFilterCount > 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">Filters</div>
            <div className="text-xs text-gray-600">
              {stats.filteredItems} of {stats.totalItems} items
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
              {stats.activeFilterCount} active
            </Badge>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockFilterOptions(): QAQueueFilterOptions {
  return {
    offices: [
      'Downtown Office',
      'West Side Clinic',
      'North Branch',
      'East Valley Center',
      'South Metro Office',
    ],
    clinicians: [
      'Emily Chen, RN',
      'Michael Johnson, PT',
      'Sarah Williams, OT',
      'David Brown, SLP',
      'Lisa Anderson, MSW',
      'John Davis, RN',
      'Maria Garcia, PT',
      'Robert Wilson, RN',
    ],
    disciplines: [
      'Skilled Nursing',
      'Physical Therapy',
      'Occupational Therapy',
      'Speech Therapy',
      'Medical Social Work',
      'Home Health Aide',
    ],
    documentTypes: [
      'Visit Note',
      'OASIS Assessment',
      'Plan of Care (485)',
      'Physician Orders',
      'Verbal Order',
      'Recertification',
      'Discharge Summary',
    ],
    priorities: ['urgent', 'high', 'normal'],
    statuses: [
      'Pending Review',
      'In Review',
      'Returned for Correction',
      'Corrected Awaiting Review',
      'Approved',
    ],
  };
}

export function generateMockFilters(): QAQueueFilters {
  return {
    offices: [],
    clinicians: [],
    disciplines: [],
    documentTypes: [],
    priorities: [],
    statuses: [],
    dateRange: {},
    searchQuery: '',
  };
}

export function generateMockFilterStats(
  filters: QAQueueFilters,
  totalItems: number = 150
): QAQueueFilterStats {
  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.dateRange.from ? 1 : 0) +
    (filters.dateRange.to ? 1 : 0) +
    filters.offices.length +
    filters.clinicians.length +
    filters.disciplines.length +
    filters.documentTypes.length +
    filters.priorities.length +
    filters.statuses.length;

  const filteredItems =
    activeFilterCount === 0 ? totalItems : Math.floor(totalItems * (1 - activeFilterCount * 0.15));

  return {
    totalItems,
    filteredItems: Math.max(filteredItems, 5),
    activeFilterCount,
  };
}
