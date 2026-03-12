/**
 * ASSESSMENT LIST
 * 
 * Filterable, searchable list of assessments with sorting
 * Supports all assessment types and statuses
 */

import { useState, useMemo } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { AssessmentStatusCard } from './AssessmentStatusCard';
import { Search, Filter, SlidersHorizontal, FileText } from 'lucide-react';
import type { Assessment, AssessmentFilters, AssessmentStatus, AssessmentType } from '../../types/assessment';
import { ASSESSMENT_TYPES, ASSESSMENT_STATUS_CONFIG } from '../../types/assessment';

interface AssessmentListProps {
  assessments: Assessment[];
  onEdit?: (assessment: Assessment) => void;
  onView?: (assessment: Assessment) => void;
  onAction?: (assessment: Assessment, action: string) => void;
  initialFilters?: AssessmentFilters;
  showFilters?: boolean;
  compact?: boolean;
}

export function AssessmentList({
  assessments,
  onEdit,
  onView,
  onAction,
  initialFilters,
  showFilters = true,
  compact = false,
}: AssessmentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssessmentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AssessmentType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'home-health' | 'hospice'>('all');

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          assessment.patientName.toLowerCase().includes(query) ||
          assessment.patientId.toLowerCase().includes(query) ||
          ASSESSMENT_TYPES[assessment.type].name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && assessment.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && assessment.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        const typeConfig = ASSESSMENT_TYPES[assessment.type];
        if (typeConfig.category !== categoryFilter) {
          return false;
        }
      }

      return true;
    });
  }, [assessments, searchQuery, statusFilter, typeFilter, categoryFilter]);

  // Sort by updated date (most recent first)
  const sortedAssessments = useMemo(() => {
    return [...filteredAssessments].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredAssessments]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by patient name, ID, or assessment type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(ASSESSMENT_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
            <SelectTrigger className="w-48">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="home-health">Home Health</SelectItem>
              <SelectItem value="hospice">Hospice</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setTypeFilter('all');
              setCategoryFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {sortedAssessments.length} of {assessments.length} assessments
        </span>
        {searchQuery && <span>Searching for: "{searchQuery}"</span>}
      </div>

      {/* Assessment List */}
      {sortedAssessments.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No assessments found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No assessments available'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAssessments.map((assessment) => (
            <AssessmentStatusCard
              key={assessment.id}
              assessment={assessment}
              onEdit={onEdit}
              onView={onView}
              onAction={onAction}
              compact={compact}
            />
          ))}
        </div>
      )}
    </div>
  );
}
