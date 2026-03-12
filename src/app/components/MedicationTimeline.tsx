/**
 * Medication Timeline Component
 * 
 * Visual timeline of medication events during episode of care.
 * 
 * FEATURES:
 * - Chronological event display
 * - Grouped by date
 * - Expandable event details
 * - Filter by event type
 * - Filter by medication
 * - Color-coded events
 * - User attribution
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Plus,
  X,
  Edit,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Clock,
  User,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  medicationTimelineService,
  MEDICATION_EVENT_CONFIG,
  type MedicationEvent,
  type MedicationEventType,
  type TimelineGrouping,
} from '../services/medicationTimeline';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MedicationTimelineProps {
  events: MedicationEvent[];
  showFilters?: boolean;
  compact?: boolean;
  maxHeight?: string;
}

export default function MedicationTimeline({
  events,
  showFilters = true,
  compact = false,
  maxHeight,
}: MedicationTimelineProps) {
  const [selectedTypes, setSelectedTypes] = useState<MedicationEventType[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<string>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = medicationTimelineService.filterByType(filtered, selectedTypes);
    }

    // Filter by medication
    if (selectedMedication !== 'all') {
      filtered = medicationTimelineService.filterByMedication(filtered, selectedMedication);
    }

    return filtered;
  }, [events, selectedTypes, selectedMedication]);

  // Group by date
  const groupedEvents = useMemo(() => {
    return medicationTimelineService.groupEventsByDate(filteredEvents);
  }, [filteredEvents]);

  // Get unique medications
  const medications = useMemo(() => {
    const meds = new Set(events.map(e => e.medicationName));
    return Array.from(meds).sort();
  }, [events]);

  // Get event stats
  const stats = useMemo(() => {
    return medicationTimelineService.getEventStats(events);
  }, [events]);

  const handleToggleExpanded = (eventId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedMedication('all');
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedMedication !== 'all';

  if (events.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-medium">No Medication Events</p>
          <p className="text-sm text-gray-500 mt-1">
            Medication events will appear here as changes occur.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Type Filter */}
              <EventTypeFilter
                selectedTypes={selectedTypes}
                onSelectedTypesChange={setSelectedTypes}
                stats={stats}
              />

              {/* Medication Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">Medication:</Label>
                <Select value={selectedMedication} onValueChange={setSelectedMedication}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Medications</SelectItem>
                    {medications.map(med => (
                      <SelectItem key={med} value={med}>
                        {med}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}

            {/* Event Count */}
            <div className="text-sm text-gray-600">
              {filteredEvents.length} of {events.length} event{events.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <div
        className={cn(
          'relative',
          maxHeight && 'overflow-y-auto',
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {groupedEvents.length > 0 ? (
          <div className="space-y-8">
            {groupedEvents.map((group, groupIdx) => (
              <TimelineGroup
                key={group.date}
                grouping={group}
                isLast={groupIdx === groupedEvents.length - 1}
                expandedEvents={expandedEvents}
                onToggleExpanded={handleToggleExpanded}
                compact={compact}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <div className="text-center">
              <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 font-medium">No Events Match Filters</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your filter criteria.
              </p>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-3">
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPE FILTER
// ═══════════════════════════════════════════════════════════════════════════

interface EventTypeFilterProps {
  selectedTypes: MedicationEventType[];
  onSelectedTypesChange: (types: MedicationEventType[]) => void;
  stats: ReturnType<typeof medicationTimelineService.getEventStats>;
}

function EventTypeFilter({ selectedTypes, onSelectedTypesChange, stats }: EventTypeFilterProps) {
  const eventTypes: MedicationEventType[] = [
    'medication-added',
    'medication-discontinued',
    'dose-changed',
    'frequency-changed',
    'route-changed',
    'reconciliation-completed',
    'alert-resolved',
    'refill-authorized',
  ];

  const handleToggleType = (type: MedicationEventType) => {
    if (selectedTypes.includes(type)) {
      onSelectedTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onSelectedTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Event Type
          {selectedTypes.length > 0 && (
            <Badge className="ml-2 bg-blue-600 text-white">{selectedTypes.length}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Filter by Event Type</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eventTypes.map(type => {
              const config = MEDICATION_EVENT_CONFIG[type];
              const count = stats.byType[type] || 0;
              return (
                <div
                  key={type}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleToggleType(type)}
                >
                  <Checkbox checked={selectedTypes.includes(type)} />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{config.label}</span>
                    <Badge variant="outline" className="ml-2 text-xs">{count}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE GROUP
// ═══════════════════════════════════════════════════════════════════════════

interface TimelineGroupProps {
  grouping: TimelineGrouping;
  isLast: boolean;
  expandedEvents: Set<string>;
  onToggleExpanded: (eventId: string) => void;
  compact: boolean;
}

function TimelineGroup({
  grouping,
  isLast,
  expandedEvents,
  onToggleExpanded,
  compact,
}: TimelineGroupProps) {
  const date = new Date(grouping.date);
  const isToday = date.toDateString() === new Date().toDateString();
  const isYesterday = new Date(date.getTime() + 86400000).toDateString() === new Date().toDateString();

  const dateLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative">
      {/* Date Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">{dateLabel}</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Events */}
      <div className="space-y-4">
        {grouping.events.map((event, eventIdx) => (
          <TimelineEvent
            key={event.id}
            event={event}
            isExpanded={expandedEvents.has(event.id)}
            onToggleExpanded={() => onToggleExpanded(event.id)}
            isLast={isLast && eventIdx === grouping.events.length - 1}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE EVENT
// ═══════════════════════════════════════════════════════════════════════════

interface TimelineEventProps {
  event: MedicationEvent;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  isLast: boolean;
  compact: boolean;
}

function TimelineEvent({ event, isExpanded, onToggleExpanded, isLast, compact }: TimelineEventProps) {
  const config = MEDICATION_EVENT_CONFIG[event.type];
  const Icon = getEventIcon(event.type);
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="relative pl-8">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Event Icon */}
      <div className={cn(
        'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center',
        config.bgColor
      )}>
        <Icon className={cn('w-4 h-4', config.iconColor)} />
      </div>

      {/* Event Card */}
      <Card className={cn(
        'transition-all',
        isExpanded && 'shadow-md'
      )}>
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onToggleExpanded}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Event Title */}
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn('text-xs', config.badgeColor)}>
                  {config.label}
                </Badge>
                <span className="text-sm font-semibold text-gray-900">
                  {event.medicationName}
                </span>
              </div>

              {/* Event Description */}
              <p className="text-sm text-gray-700 mb-2">
                {event.description}
              </p>

              {/* Event Meta */}
              {!compact && (
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {time}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {event.user}
                  </div>
                  <div className="text-gray-500">
                    {event.userRole}
                  </div>
                </div>
              )}
            </div>

            {/* Expand Icon */}
            {event.details && (
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && event.details && (
          <div className="px-4 pb-4 border-t">
            <EventDetails event={event} />
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT DETAILS
// ═══════════════════════════════════════════════════════════════════════════

function EventDetails({ event }: { event: MedicationEvent }) {
  const details = event.details!;

  return (
    <div className="pt-3 space-y-3">
      {/* For changes */}
      {details.previousValue && details.newValue && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-1">Previous</p>
            <p className="text-sm font-semibold text-gray-900">{details.previousValue}</p>
          </div>
          <ArrowRightLeft className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-1">New</p>
            <p className="text-sm font-semibold text-gray-900">{details.newValue}</p>
          </div>
        </div>
      )}

      {/* For additions */}
      {event.type === 'medication-added' && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {details.strength && (
            <div>
              <p className="text-gray-600 mb-1">Strength</p>
              <p className="font-semibold text-gray-900">{details.strength}</p>
            </div>
          )}
          {details.dose && (
            <div>
              <p className="text-gray-600 mb-1">Dose</p>
              <p className="font-semibold text-gray-900">{details.dose}</p>
            </div>
          )}
          {details.route && (
            <div>
              <p className="text-gray-600 mb-1">Route</p>
              <p className="font-semibold text-gray-900">{details.route}</p>
            </div>
          )}
          {details.frequency && (
            <div>
              <p className="text-gray-600 mb-1">Frequency</p>
              <p className="font-semibold text-gray-900">{details.frequency}</p>
            </div>
          )}
          {details.indication && (
            <div className="col-span-2">
              <p className="text-gray-600 mb-1">Indication</p>
              <p className="font-semibold text-gray-900">{details.indication}</p>
            </div>
          )}
          {details.prescribingPhysician && (
            <div className="col-span-2">
              <p className="text-gray-600 mb-1">Prescribed By</p>
              <p className="font-semibold text-gray-900">{details.prescribingPhysician}</p>
            </div>
          )}
        </div>
      )}

      {/* For discontinuations */}
      {details.reason && (
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600 mb-1 font-medium">Reason for Discontinuation</p>
          <p className="text-sm text-red-900">{details.reason}</p>
        </div>
      )}

      {/* For reconciliation */}
      {details.reconciliationType && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Type</p>
            <p className="font-semibold text-gray-900 capitalize">{details.reconciliationType}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Reviewed</p>
            <p className="font-semibold text-gray-900">{details.medicationsReviewed}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Discrepancies</p>
            <p className="font-semibold text-gray-900">{details.discrepanciesFound}</p>
          </div>
        </div>
      )}

      {/* For alerts */}
      {details.alertType && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Alert Type</p>
              <p className="font-semibold text-gray-900">{details.alertType}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Severity</p>
              <Badge className={cn(
                details.alertSeverity === 'Critical' && 'bg-red-600 text-white',
                details.alertSeverity === 'High' && 'bg-orange-600 text-white',
                details.alertSeverity === 'Warning' && 'bg-amber-600 text-white'
              )}>
                {details.alertSeverity}
              </Badge>
            </div>
          </div>
          {details.resolutionNotes && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1 font-medium">Resolution Notes</p>
              <p className="text-sm text-blue-900">{details.resolutionNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Additional notes */}
      {details.notes && !details.resolutionNotes && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1 font-medium">Notes</p>
          <p className="text-sm text-gray-900">{details.notes}</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getEventIcon(type: MedicationEventType) {
  switch (type) {
    case 'medication-added':
    case 'medication-resumed':
      return Plus;
    case 'medication-discontinued':
      return X;
    case 'dose-changed':
    case 'strength-changed':
      return TrendingUp;
    case 'route-changed':
    case 'frequency-changed':
      return ArrowRightLeft;
    case 'reconciliation-completed':
      return FileCheck;
    case 'alert-resolved':
      return CheckCircle2;
    case 'prn-status-changed':
    case 'physician-changed':
      return Edit;
    case 'refill-authorized':
      return RefreshCw;
    default:
      return Pill;
  }
}
