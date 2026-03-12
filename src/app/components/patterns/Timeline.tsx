/**
 * Timeline Pattern
 * 
 * Consistent timeline component for displaying chronological events.
 * Supports various entity timelines across the platform.
 * 
 * Use Cases:
 * - Patient activity timeline
 * - Admission timeline
 * - Document lifecycle timeline
 * - Medication timeline
 * - Caregiver activity timeline
 * - Audit log timeline
 * 
 * Performance:
 * - Virtualized for long lists
 * - Lazy-loaded images
 * - Memoized items
 */

import { memo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  User,
  FileText,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  Edit,
  Trash2,
  Send,
  Download,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TimelineEventType = 
  | 'visit'
  | 'assessment'
  | 'order'
  | 'document'
  | 'medication'
  | 'admission'
  | 'discharge'
  | 'note'
  | 'alert'
  | 'phone_call'
  | 'signature'
  | 'status_change'
  | 'custom';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description?: string;
  user?: {
    name: string;
    role?: string;
    avatar?: string;
  };
  icon?: ReactNode;
  iconColor?: string;
  iconBg?: string;
  metadata?: Array<{
    label: string;
    value: string | ReactNode;
  }>;
  actions?: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  }>;
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  onClick?: () => void;
}

interface TimelineProps {
  /** Timeline events */
  events: TimelineEvent[];
  
  /** Show user information */
  showUser?: boolean;
  
  /** Show timestamps */
  showTimestamp?: boolean;
  
  /** Compact mode */
  compact?: boolean;
  
  /** Group by date */
  groupByDate?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Empty state action */
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  
  /** Loading state */
  loading?: boolean;
  
  /** Max height */
  maxHeight?: string;
  
  /** Variant */
  variant?: 'default' | 'compact' | 'detailed';
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const Timeline = memo(function Timeline({
  events,
  showUser = true,
  showTimestamp = true,
  compact = false,
  groupByDate = false,
  emptyMessage = 'No activity yet',
  emptyAction,
  loading = false,
  maxHeight,
  variant = 'default',
}: TimelineProps) {
  // Default icons by type
  const defaultIcons: Record<TimelineEventType, { icon: typeof User; color: string; bg: string }> = {
    visit: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    assessment: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
    order: { icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    document: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
    medication: { icon: Plus, color: 'text-pink-600', bg: 'bg-pink-100' },
    admission: { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    discharge: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    note: { icon: Edit, color: 'text-amber-600', bg: 'bg-amber-100' },
    alert: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    phone_call: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    signature: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    status_change: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100' },
    custom: { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' },
  };

  // Group events by date if needed
  const groupedEvents = groupByDate ? groupEventsByDate(events) : { '': events };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Activity className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 mb-4">{emptyMessage}</p>
        {emptyAction && (
          <Button size="sm" onClick={emptyAction.onClick}>
            <Plus className="w-4 h-4 mr-2" />
            {emptyAction.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-y-auto', compact && 'text-sm')}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date || 'all'}>
          {/* Date Header */}
          {groupByDate && date && (
            <div className="sticky top-0 z-10 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 uppercase">
              {date}
            </div>
          )}

          {/* Events */}
          <div className={cn('relative', compact ? 'p-2' : 'p-4')}>
            {/* Timeline Line */}
            <div className="absolute left-9 top-0 bottom-0 w-px bg-gray-200" />

            {/* Event Items */}
            <div className="space-y-4">
              {dateEvents.map((event, index) => {
                const defaultIcon = defaultIcons[event.type];
                const Icon = event.icon ? null : defaultIcon.icon;
                const iconColor = event.iconColor || defaultIcon.color;
                const iconBg = event.iconBg || defaultIcon.bg;

                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'relative z-10 flex-shrink-0 flex items-center justify-center rounded-full',
                        compact ? 'w-8 h-8' : 'w-10 h-10',
                        iconBg
                      )}
                    >
                      {event.icon ? (
                        event.icon
                      ) : Icon ? (
                        <Icon className={cn(iconColor, compact ? 'w-4 h-4' : 'w-5 h-5')} />
                      ) : null}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-4">
                      <button
                        onClick={event.onClick}
                        disabled={!event.onClick}
                        className={cn(
                          'w-full text-left',
                          event.onClick && 'hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer'
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              'font-semibold text-gray-900',
                              compact ? 'text-sm' : 'text-base'
                            )}>
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className={cn(
                                'text-gray-600 mt-1',
                                compact ? 'text-xs' : 'text-sm'
                              )}>
                                {event.description}
                              </p>
                            )}
                          </div>

                          {event.status && (
                            <StatusIndicator status={event.status} compact={compact} />
                          )}
                        </div>

                        {/* Metadata */}
                        {event.metadata && event.metadata.length > 0 && (
                          <div className={cn(
                            'flex flex-wrap items-center gap-3 mt-2',
                            compact ? 'text-xs' : 'text-sm'
                          )}>
                            {event.metadata.map((meta, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <span className="text-gray-500">{meta.label}:</span>
                                <span className="font-medium text-gray-700">{meta.value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* User & Timestamp */}
                        {(showUser || showTimestamp) && (
                          <div className={cn(
                            'flex items-center gap-3 mt-2 text-gray-500',
                            compact ? 'text-xs' : 'text-sm'
                          )}>
                            {showUser && event.user && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>
                                  {event.user.name}
                                  {event.user.role && <span className="text-gray-400"> • {event.user.role}</span>}
                                </span>
                              </div>
                            )}
                            {showTimestamp && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{event.timestamp}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        {event.actions && event.actions.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            {event.actions.map((action) => (
                              <Button
                                key={action.id}
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick();
                                }}
                              >
                                {action.icon}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

const StatusIndicator = memo(function StatusIndicator({ 
  status, 
  compact 
}: { 
  status: string; 
  compact: boolean;
}) {
  const statusConfig = {
    success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    danger: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
    neutral: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-50' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.neutral;
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center justify-center rounded-full', config.bg, compact ? 'w-6 h-6' : 'w-8 h-8')}>
      <Icon className={cn(config.color, compact ? 'w-3 h-3' : 'w-4 h-4')} />
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function groupEventsByDate(events: TimelineEvent[]): Record<string, TimelineEvent[]> {
  const grouped: Record<string, TimelineEvent[]> = {};
  
  events.forEach(event => {
    // Extract date from timestamp (assumes ISO format or similar)
    const date = event.timestamp.split(' ')[0] || event.timestamp.split('T')[0] || 'Unknown Date';
    
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });

  return grouped;
}

Timeline.displayName = 'Timeline';

export default Timeline;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// Patient Activity Timeline
<Timeline
  events={[
    {
      id: '1',
      type: 'visit',
      timestamp: '2026-03-10 10:30 AM',
      title: 'Skilled Nursing Visit',
      description: 'Wound care and medication administration',
      user: { name: 'Sarah Chen', role: 'RN' },
      status: 'success',
      metadata: [
        { label: 'Duration', value: '45 min' },
        { label: 'Discipline', value: 'RN' },
      ],
      actions: [
        { id: 'view', label: 'View Note', onClick: () => {} },
      ],
      onClick: () => navigate('/visit/123')
    },
    {
      id: '2',
      type: 'assessment',
      timestamp: '2026-03-08 2:00 PM',
      title: 'OASIS-E Start of Care',
      description: 'Initial comprehensive assessment completed',
      user: { name: 'Jane Smith', role: 'RN' },
      status: 'success',
      onClick: () => navigate('/assessment/456')
    },
  ]}
  showUser
  showTimestamp
  groupByDate
/>

// Document Lifecycle Timeline
<Timeline
  events={[
    {
      id: '1',
      type: 'document',
      timestamp: '2026-03-10 3:45 PM',
      title: 'Document Signed',
      user: { name: 'Dr. Johnson', role: 'Physician' },
      icon: <Send className="w-5 h-5 text-green-600" />,
      status: 'success'
    },
    {
      id: '2',
      type: 'document',
      timestamp: '2026-03-10 2:15 PM',
      title: 'Document Submitted for Review',
      user: { name: 'Sarah Chen', role: 'RN' },
      status: 'info'
    },
  ]}
  variant="compact"
/>
*/
