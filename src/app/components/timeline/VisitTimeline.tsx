/**
 * Visit Timeline Component
 * 
 * Displays chronological clinical events for a patient including:
 * - Visits
 * - Clinical notes
 * - Orders
 * - Assessments
 * - Medication changes
 * 
 * Features:
 * - Event icons and color coding
 * - Timestamps with relative time
 * - Staff member attribution
 * - Expandable details
 * - Filtering by event type
 * - Mobile-responsive design
 */

import { useState, useMemo } from 'react';
import {
  FileText,
  Pill,
  Activity,
  Calendar,
  User,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Heart,
  Syringe,
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export type TimelineEventType = 
  | 'visit'
  | 'clinical_note'
  | 'order'
  | 'assessment'
  | 'medication_change'
  | 'vital_signs'
  | 'procedure';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  timestamp: Date;
  staff_member: {
    name: string;
    role: string;
    credentials?: string;
  };
  status?: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  details?: Record<string, any>;
  visit_id?: string;
}

interface VisitTimelineProps {
  events: TimelineEvent[];
  patientName?: string;
  showFilters?: boolean;
  compact?: boolean;
  maxHeight?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

// ==================== EVENT TYPE CONFIG ====================

const EVENT_CONFIG: Record<TimelineEventType, {
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  visit: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Visit',
  },
  clinical_note: {
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Clinical Note',
  },
  order: {
    icon: ClipboardList,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Order',
  },
  assessment: {
    icon: Stethoscope,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Assessment',
  },
  medication_change: {
    icon: Pill,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Medication',
  },
  vital_signs: {
    icon: Activity,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    label: 'Vital Signs',
  },
  procedure: {
    icon: Syringe,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    label: 'Procedure',
  },
};

const STATUS_CONFIG = {
  completed: { icon: CheckCircle2, color: 'text-green-600', label: 'Completed' },
  in_progress: { icon: Clock, color: 'text-blue-600', label: 'In Progress' },
  pending: { icon: AlertCircle, color: 'text-yellow-600', label: 'Pending' },
  cancelled: { icon: AlertCircle, color: 'text-gray-500', label: 'Cancelled' },
};

// ==================== HELPER FUNCTIONS ====================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ==================== TIMELINE EVENT CARD ====================

interface TimelineEventCardProps {
  event: TimelineEvent;
  compact?: boolean;
  showConnector?: boolean;
  isLast?: boolean;
  onClick?: () => void;
}

function TimelineEventCard({ event, compact = false, showConnector = true, isLast = false, onClick }: TimelineEventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = EVENT_CONFIG[event.type];
  const Icon = config.icon;
  const statusConfig = event.status ? STATUS_CONFIG[event.status] : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <div className="flex gap-3 relative group">
      {/* Timeline Connector */}
      {showConnector && (
        <div className="flex flex-col items-center">
          {/* Icon Circle */}
          <div className={`flex items-center justify-center size-10 rounded-full ${config.bgColor} ${config.borderColor} border-2 z-10 shrink-0`}>
            <Icon className={`size-5 ${config.color}`} />
          </div>
          {/* Vertical Line */}
          {!isLast && (
            <div className="w-0.5 bg-gray-200 flex-1 min-h-[40px]" />
          )}
        </div>
      )}

      {/* Event Card */}
      <Card 
        className={`flex-1 mb-4 border-2 hover:shadow-md transition-all ${config.borderColor} ${
          onClick ? 'cursor-pointer hover:bg-gray-50' : ''
        } ${compact ? '' : 'min-h-[100px]'}`}
        onClick={onClick}
      >
        <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            {/* Event Title & Type Badge */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`${config.bgColor} ${config.color} border-0 text-xs`}>
                  {config.label}
                </Badge>
                {statusConfig && (
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`size-3 ${statusConfig.color}`} />
                    <span className={`text-xs ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                )}
              </div>
              <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                {event.title}
              </h4>
            </div>

            {/* Expand Button */}
            {event.details && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="shrink-0"
              >
                {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            )}
          </div>

          {/* Description */}
          <p className={`text-sm text-gray-700 mb-3 ${compact ? 'line-clamp-2' : ''}`}>
            {event.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {/* Staff Member */}
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 text-gray-500" />
              <span className="font-medium">{event.staff_member.name}</span>
              {event.staff_member.credentials && (
                <span className="text-gray-500">{event.staff_member.credentials}</span>
              )}
            </div>

            {/* Divider */}
            <span className="text-gray-300">•</span>

            {/* Timestamp */}
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-gray-500" />
              <span title={formatFullTimestamp(event.timestamp)}>
                {formatRelativeTime(event.timestamp)}
              </span>
            </div>

            {/* Visit ID */}
            {event.visit_id && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500">Visit {event.visit_id}</span>
              </>
            )}
          </div>

          {/* Expanded Details */}
          {isExpanded && event.details && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="bg-gray-50 rounded p-3 space-y-2">
                {Object.entries(event.details).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-gray-700 min-w-[100px]">
                      {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:
                    </span>
                    <span className="text-xs text-gray-600 flex-1">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== MAIN TIMELINE COMPONENT ====================

export default function VisitTimeline({
  events,
  patientName,
  showFilters = true,
  compact = false,
  maxHeight,
  onEventClick,
}: VisitTimelineProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<TimelineEventType>>(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Sort events by timestamp (most recent first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events]);

  // Filter events by selected types
  const filteredEvents = useMemo(() => {
    if (selectedTypes.size === 0) return sortedEvents;
    return sortedEvents.filter(event => selectedTypes.has(event.type));
  }, [sortedEvents, selectedTypes]);

  // Count events by type
  const eventCounts = useMemo(() => {
    const counts: Record<TimelineEventType, number> = {
      visit: 0,
      clinical_note: 0,
      order: 0,
      assessment: 0,
      medication_change: 0,
      vital_signs: 0,
      procedure: 0,
    };
    events.forEach(event => {
      counts[event.type]++;
    });
    return counts;
  }, [events]);

  const toggleTypeFilter = (type: TimelineEventType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };

  const clearFilters = () => {
    setSelectedTypes(new Set());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">Clinical Timeline</h3>
            {patientName && (
              <p className="text-sm text-gray-600">{patientName}</p>
            )}
          </div>
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="gap-2"
            >
              <Filter className="size-4" />
              Filter
              {selectedTypes.size > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTypes.size}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-700">Event Types</p>
              {selectedTypes.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-6 px-2"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EVENT_CONFIG) as TimelineEventType[]).map(type => {
                const config = EVENT_CONFIG[type];
                const Icon = config.icon;
                const count = eventCounts[type];
                const isSelected = selectedTypes.has(type);

                if (count === 0) return null;

                return (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-all ${
                      isSelected
                        ? `${config.bgColor} ${config.borderColor} ${config.color}`
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {config.label}
                    <span className={`ml-1 ${isSelected ? '' : 'text-gray-500'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Timeline Content */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6"
        style={maxHeight ? { maxHeight } : undefined}
      >
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="size-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">No Events Found</p>
            <p className="text-sm text-gray-600">
              {selectedTypes.size > 0
                ? 'Try adjusting your filters'
                : 'No clinical events recorded yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredEvents.map((event, index) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                compact={compact}
                showConnector={true}
                isLast={index === filteredEvents.length - 1}
                onClick={onEventClick ? () => onEventClick(event) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredEvents.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 shrink-0">
          <p className="text-xs text-gray-600 text-center">
            Showing {filteredEvents.length} of {events.length} events
            {filteredEvents.length > 0 && (
              <span className="ml-2">
                • Latest: {formatRelativeTime(filteredEvents[0].timestamp)}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
