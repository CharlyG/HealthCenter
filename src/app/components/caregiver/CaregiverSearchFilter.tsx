/**
 * Caregiver Search & Filter System
 * 
 * Advanced search and filtering for caregivers by name, discipline, office,
 * credential status, and availability.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  User,
  Calendar,
  Shield,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DisciplineType } from '../../lib/caregiverTypes';
import type { ComplianceScoreLevel } from './ComplianceScoreSystem';
import { ComplianceScoreBadge } from './ComplianceScoreSystem';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CaregiverSearchFilters {
  searchQuery: string;
  disciplines: DisciplineType[];
  offices: string[];
  credentialStatus: ('valid' | 'expiring-soon' | 'expired')[];
  complianceLevel: ComplianceScoreLevel[];
  availability: ('available-today' | 'available-this-week' | 'unavailable')[];
}

export interface CaregiverSearchResult {
  caregiverId: string;
  name: string;
  primaryDiscipline: DisciplineType;
  secondaryDisciplines: DisciplineType[];
  office: string;
  credentialStatus: 'valid' | 'expiring-soon' | 'expired';
  complianceScore: {
    score: number;
    level: ComplianceScoreLevel;
  };
  availability: {
    isAvailableToday: boolean;
    isAvailableThisWeek: boolean;
    nextAvailableDate?: string;
  };
  activeRenewals: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CaregiverSearchFilterProps {
  results: CaregiverSearchResult[];
  onSearch?: (filters: CaregiverSearchFilters) => void;
  onSelectCaregiver?: (caregiverId: string) => void;
}

export default function CaregiverSearchFilter({
  results,
  onSearch,
  onSelectCaregiver,
}: CaregiverSearchFilterProps) {
  const [filters, setFilters] = useState<CaregiverSearchFilters>({
    searchQuery: '',
    disciplines: [],
    offices: [],
    credentialStatus: [],
    complianceLevel: [],
    availability: [],
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (newFilters: Partial<CaregiverSearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onSearch?.(updated);
  };

  const clearFilters = () => {
    const cleared: CaregiverSearchFilters = {
      searchQuery: '',
      disciplines: [],
      offices: [],
      credentialStatus: [],
      complianceLevel: [],
      availability: [],
    };
    setFilters(cleared);
    onSearch?.(cleared);
  };

  const activeFilterCount =
    filters.disciplines.length +
    filters.offices.length +
    filters.credentialStatus.length +
    filters.complianceLevel.length +
    filters.availability.length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search caregivers by name..."
              value={filters.searchQuery}
              onChange={(e) =>
                handleFilterChange({ searchQuery: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Discipline Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Discipline</h4>
              <div className="space-y-2">
                {(['SN', 'PT', 'OT', 'ST', 'MSW', 'HHA'] as DisciplineType[]).map(
                  (discipline) => (
                    <label
                      key={discipline}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.disciplines.includes(discipline)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...filters.disciplines, discipline]
                            : filters.disciplines.filter((d) => d !== discipline);
                          handleFilterChange({ disciplines: updated });
                        }}
                        className="rounded"
                      />
                      <span className="text-gray-700">{discipline}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Credential Status Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                Credential Status
              </h4>
              <div className="space-y-2">
                {(['valid', 'expiring-soon', 'expired'] as const).map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.credentialStatus.includes(status)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...filters.credentialStatus, status]
                          : filters.credentialStatus.filter((s) => s !== status);
                        handleFilterChange({ credentialStatus: updated });
                      }}
                      className="rounded"
                    />
                    <span className="text-gray-700 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Compliance Level Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                Compliance Level
              </h4>
              <div className="space-y-2">
                {(['fully-compliant', 'minor-issues', 'non-compliant'] as ComplianceScoreLevel[]).map(
                  (level) => (
                    <label
                      key={level}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.complianceLevel.includes(level)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...filters.complianceLevel, level]
                            : filters.complianceLevel.filter((l) => l !== level);
                          handleFilterChange({ complianceLevel: updated });
                        }}
                        className="rounded"
                      />
                      <span className="text-gray-700 capitalize">
                        {level.replace('-', ' ')}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Availability</h4>
              <div className="space-y-2">
                {(['available-today', 'available-this-week', 'unavailable'] as const).map(
                  (avail) => (
                    <label
                      key={avail}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.availability.includes(avail)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...filters.availability, avail]
                            : filters.availability.filter((a) => a !== avail);
                          handleFilterChange({ availability: updated });
                        }}
                        className="rounded"
                      />
                      <span className="text-gray-700 capitalize">
                        {avail.replace('-', ' ')}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-600">
          {results.length} caregiver{results.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.length === 0 ? (
          <Card className="p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-1">No caregivers found</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search filters
            </p>
          </Card>
        ) : (
          results.map((caregiver) => (
            <CaregiverResultCard
              key={caregiver.caregiverId}
              caregiver={caregiver}
              onSelect={onSelectCaregiver}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CAREGIVER RESULT CARD
// ═══════════════════════════════════════════════════════════════════════════

function CaregiverResultCard({
  caregiver,
  onSelect,
}: {
  caregiver: CaregiverSearchResult;
  onSelect?: (caregiverId: string) => void;
}) {
  const disciplineColors: Record<DisciplineType, string> = {
    SN: 'blue',
    PT: 'purple',
    OT: 'green',
    ST: 'orange',
    MSW: 'teal',
    HHA: 'pink',
  };

  const credentialStatusConfig = {
    valid: { label: 'Valid', color: 'green' },
    'expiring-soon': { label: 'Expiring Soon', color: 'amber' },
    expired: { label: 'Expired', color: 'red' },
  };

  const credConfig = credentialStatusConfig[caregiver.credentialStatus];

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect?.(caregiver.caregiverId)}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">{caregiver.name}</h4>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  `bg-${disciplineColors[caregiver.primaryDiscipline]}-100`,
                  `text-${disciplineColors[caregiver.primaryDiscipline]}-700`,
                  `border-${disciplineColors[caregiver.primaryDiscipline]}-300`
                )}
              >
                {caregiver.primaryDiscipline}
              </Badge>
              {caregiver.secondaryDisciplines.length > 0 && (
                <span className="text-xs text-gray-600">
                  +{caregiver.secondaryDisciplines.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{caregiver.office}</span>
              </div>

              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span
                  className={cn(
                    'font-medium',
                    credConfig.color === 'green'
                      ? 'text-green-700'
                      : credConfig.color === 'amber'
                      ? 'text-amber-700'
                      : 'text-red-700'
                  )}
                >
                  {credConfig.label}
                </span>
              </div>

              {caregiver.availability.isAvailableToday && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-green-600" />
                  <span className="text-green-700 font-medium">Available Today</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ComplianceScoreBadge
                score={{
                  caregiverId: caregiver.caregiverId,
                  caregiverName: caregiver.name,
                  score: caregiver.complianceScore.score,
                  level: caregiver.complianceScore.level,
                  breakdown: {
                    requiredCredentials: { total: 4, valid: 4, expired: 0, expiringSoon: 0 },
                    requiredTraining: { total: 4, completed: 4, overdue: 0, expiringSoon: 0 },
                    optionalCredentials: { total: 0, valid: 0 },
                  },
                  issues: [],
                  lastCalculated: new Date().toISOString(),
                  trend: 'stable',
                }}
                size="sm"
              />

              {caregiver.activeRenewals > 0 && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  {caregiver.activeRenewals} Renewal{caregiver.activeRenewals !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </Card>
  );
}
