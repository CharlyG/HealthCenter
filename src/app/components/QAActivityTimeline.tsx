/**
 * QA Activity Timeline Component
 * 
 * Displays timeline of all QA-related events for a clinical document including
 * document creation, submission, QA review, returns, corrections, and approvals.
 * Each event shows timestamp, user, and action description.
 */

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  FileText,
  Send,
  Eye,
  XCircle,
  Edit,
  CheckCircle,
  User,
  Clock,
  AlertTriangle,
  MessageSquare,
  History,
  Flag,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type QAEventType =
  | 'document-created'
  | 'document-submitted'
  | 'qa-review-started'
  | 'qa-review-completed'
  | 'returned-for-correction'
  | 'correction-started'
  | 'correction-completed'
  | 'correction-resubmitted'
  | 'approved-for-billing'
  | 'comment-added'
  | 'status-changed'
  | 'assigned-to-reviewer';

export interface QAEvent {
  id: string;
  type: QAEventType;
  timestamp: string;
  user: string;
  userRole?: string;
  actionDescription: string;
  metadata?: {
    issueCount?: number;
    priority?: 'urgent' | 'high' | 'normal';
    previousStatus?: string;
    newStatus?: string;
    comment?: string;
    duration?: number; // in hours
    iteration?: number;
    complianceScore?: number;
  };
}

export interface QAActivityTimelineData {
  documentId: string;
  documentType: string;
  patientName: string;
  admissionId: string;
  events: QAEvent[];
  currentStatus: string;
  totalDuration: number; // hours from creation to current
  qaReviewCount: number;
  correctionCycles: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const EVENT_TYPE_CONFIG: Record<
  QAEventType,
  {
    label: string;
    icon: any;
    color: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  'document-created': {
    label: 'Document Created',
    icon: FileText,
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
  },
  'document-submitted': {
    label: 'Submitted for QA',
    icon: Send,
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-300',
  },
  'qa-review-started': {
    label: 'QA Review Started',
    icon: Eye,
    color: 'indigo',
    bgClass: 'bg-indigo-100',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-300',
  },
  'qa-review-completed': {
    label: 'QA Review Completed',
    icon: CheckCircle,
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
  },
  'returned-for-correction': {
    label: 'Returned for Correction',
    icon: XCircle,
    color: 'amber',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
  },
  'correction-started': {
    label: 'Correction Started',
    icon: Edit,
    color: 'orange',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-300',
  },
  'correction-completed': {
    label: 'Correction Completed',
    icon: CheckCircle,
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
  },
  'correction-resubmitted': {
    label: 'Resubmitted for Review',
    icon: Send,
    color: 'purple',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-300',
  },
  'approved-for-billing': {
    label: 'Approved for Billing',
    icon: CheckCircle,
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    borderClass: 'border-green-300',
  },
  'comment-added': {
    label: 'Comment Added',
    icon: MessageSquare,
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'border-gray-300',
  },
  'status-changed': {
    label: 'Status Changed',
    icon: Flag,
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
  },
  'assigned-to-reviewer': {
    label: 'Assigned to Reviewer',
    icon: User,
    color: 'teal',
    bgClass: 'bg-teal-100',
    textClass: 'text-teal-700',
    borderClass: 'border-teal-300',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QAActivityTimelineProps {
  data: QAActivityTimelineData;
  mode?: 'full' | 'compact';
  highlightEventId?: string;
}

export default function QAActivityTimeline({
  data,
  mode = 'full',
  highlightEventId,
}: QAActivityTimelineProps) {
  if (mode === 'compact') {
    return <CompactTimeline data={data} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">QA Activity Timeline</h2>
            <p className="text-sm text-gray-600 mt-1">
              {data.patientName} • {data.documentType} • {data.admissionId}
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            {data.currentStatus}
          </Badge>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard
            label="Total Events"
            value={data.events.length}
            icon={History}
            color="blue"
          />
          <SummaryCard
            label="QA Reviews"
            value={data.qaReviewCount}
            icon={Eye}
            color="purple"
          />
          <SummaryCard
            label="Correction Cycles"
            value={data.correctionCycles}
            icon={Edit}
            color="amber"
          />
          <SummaryCard
            label="Total Duration"
            value={`${Math.round(data.totalDuration)}h`}
            icon={Clock}
            color="green"
          />
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <History className="w-5 h-5" />
          Event History ({data.events.length} events)
        </h3>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Events */}
          <div className="space-y-6">
            {data.events.map((event, index) => (
              <TimelineEvent
                key={event.id}
                event={event}
                isLatest={index === data.events.length - 1}
                isHighlighted={event.id === highlightEventId}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY CARD
// ═══════════════════════════════════════════════════════════════════════════

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            colorClasses[color as keyof typeof colorClasses]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE EVENT
// ═══════════════════════════════════════════════════════════════════════════

function TimelineEvent({
  event,
  isLatest,
  isHighlighted,
}: {
  event: QAEvent;
  isLatest: boolean;
  isHighlighted: boolean;
}) {
  const eventConfig = EVENT_TYPE_CONFIG[event.type];
  const EventIcon = eventConfig.icon;

  return (
    <div
      className={cn(
        'relative pl-16 transition-all',
        isHighlighted && 'bg-yellow-50 -ml-4 -mr-4 px-4 py-3 rounded-lg'
      )}
    >
      {/* Timeline Marker */}
      <div
        className={cn(
          'absolute left-3 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center',
          eventConfig.bgClass,
          isLatest && 'ring-4 ring-blue-200'
        )}
      >
        <EventIcon className={cn('w-3 h-3', eventConfig.textClass)} />
      </div>

      {/* Latest Badge */}
      {isLatest && (
        <div className="absolute left-0 top-8 text-xs font-medium text-blue-600">Latest</div>
      )}

      {/* Event Content */}
      <div className="space-y-2">
        {/* Event Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{eventConfig.label}</h4>
              {event.metadata?.iteration && (
                <Badge
                  variant="outline"
                  className="bg-purple-100 text-purple-700 border-purple-300 text-xs"
                >
                  Iteration #{event.metadata.iteration}
                </Badge>
              )}
              {event.metadata?.priority && event.metadata.priority !== 'normal' && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    event.metadata.priority === 'urgent'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-orange-100 text-orange-700 border-orange-300'
                  )}
                >
                  {event.metadata.priority.charAt(0).toUpperCase() +
                    event.metadata.priority.slice(1)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-700">{event.actionDescription}</p>
          </div>

          <div className="ml-4 text-right">
            <div className="text-xs text-gray-600">
              {new Date(event.timestamp).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-600">
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-3 h-3" />
          <span className="font-medium">{event.user}</span>
          {event.userRole && (
            <>
              <span>•</span>
              <span className="text-gray-500">{event.userRole}</span>
            </>
          )}
        </div>

        {/* Metadata */}
        {event.metadata && (
          <div className={cn('rounded-lg p-3 space-y-2', eventConfig.bgClass)}>
            {event.metadata.issueCount !== undefined && (
              <div className="text-sm">
                <span className="font-medium">Issues:</span>{' '}
                <span className={eventConfig.textClass}>{event.metadata.issueCount}</span>
              </div>
            )}

            {event.metadata.previousStatus && event.metadata.newStatus && (
              <div className="text-sm">
                <span className="font-medium">Status Change:</span>{' '}
                <span className="text-gray-600">{event.metadata.previousStatus}</span>
                <span className="mx-2">→</span>
                <span className={eventConfig.textClass}>{event.metadata.newStatus}</span>
              </div>
            )}

            {event.metadata.duration !== undefined && (
              <div className="text-sm flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span className="font-medium">Duration:</span>
                <span className={eventConfig.textClass}>{event.metadata.duration} hours</span>
              </div>
            )}

            {event.metadata.complianceScore !== undefined && (
              <div className="text-sm">
                <span className="font-medium">Compliance Score:</span>{' '}
                <span
                  className={cn(
                    'font-bold',
                    event.metadata.complianceScore >= 90
                      ? 'text-green-700'
                      : event.metadata.complianceScore >= 70
                      ? 'text-amber-700'
                      : 'text-red-700'
                  )}
                >
                  {event.metadata.complianceScore}%
                </span>
              </div>
            )}

            {event.metadata.comment && (
              <div className="bg-white border border-gray-200 rounded p-2 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-3 h-3 text-gray-500" />
                  <span className="font-medium text-gray-700">Comment:</span>
                </div>
                <p className="text-gray-800 italic">{event.metadata.comment}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT TIMELINE
// ═══════════════════════════════════════════════════════════════════════════

function CompactTimeline({ data }: { data: QAActivityTimelineData }) {
  const latestEvent = data.events[data.events.length - 1];
  const eventConfig = latestEvent ? EVENT_TYPE_CONFIG[latestEvent.type] : null;
  const EventIcon = eventConfig?.icon || History;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {eventConfig && (
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', eventConfig.bgClass)}>
              <EventIcon className={cn('w-4 h-4', eventConfig.textClass)} />
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900">QA Activity</div>
            <div className="text-xs text-gray-600">
              {data.events.length} events • {data.correctionCycles} correction cycles
            </div>
          </div>
        </div>

        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
          {data.currentStatus}
        </Badge>
      </div>

      {latestEvent && (
        <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">
          <div className="font-medium text-gray-900 mb-1">Latest:</div>
          <div className="text-xs">
            {eventConfig?.label} • {latestEvent.user}
          </div>
          <div className="text-xs text-gray-600">
            {new Date(latestEvent.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockQAActivityTimelineData(): QAActivityTimelineData {
  const now = new Date();
  const events: QAEvent[] = [
    {
      id: 'event-1',
      type: 'document-created',
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Emily Chen, RN',
      userRole: 'Skilled Nurse',
      actionDescription: 'Visit note created for skilled nursing visit',
    },
    {
      id: 'event-2',
      type: 'document-submitted',
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Emily Chen, RN',
      userRole: 'Skilled Nurse',
      actionDescription: 'Submitted visit note for QA review',
      metadata: {
        complianceScore: 75,
      },
    },
    {
      id: 'event-3',
      type: 'assigned-to-reviewer',
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      user: 'System',
      actionDescription: 'Document automatically assigned to Jane Smith for review',
    },
    {
      id: 'event-4',
      type: 'qa-review-started',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Jane Smith',
      userRole: 'QA Reviewer',
      actionDescription: 'Started QA review of visit documentation',
    },
    {
      id: 'event-5',
      type: 'comment-added',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
      user: 'Jane Smith',
      userRole: 'QA Reviewer',
      actionDescription: 'Added review comment',
      metadata: {
        comment: 'Multiple required sections appear incomplete. Vital signs missing.',
      },
    },
    {
      id: 'event-6',
      type: 'returned-for-correction',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      user: 'Jane Smith',
      userRole: 'QA Reviewer',
      actionDescription: 'Returned document to clinician for corrections',
      metadata: {
        issueCount: 3,
        priority: 'high',
        iteration: 1,
        comment: 'Please complete all required sections before resubmission.',
      },
    },
    {
      id: 'event-7',
      type: 'correction-started',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Emily Chen, RN',
      userRole: 'Skilled Nurse',
      actionDescription: 'Started making corrections to returned document',
    },
    {
      id: 'event-8',
      type: 'correction-completed',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
      user: 'Emily Chen, RN',
      userRole: 'Skilled Nurse',
      actionDescription: 'Completed all requested corrections',
      metadata: {
        duration: 5,
        comment: 'All sections completed as requested. Added missing vital signs.',
      },
    },
    {
      id: 'event-9',
      type: 'correction-resubmitted',
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 5.5 * 60 * 60 * 1000).toISOString(),
      user: 'Emily Chen, RN',
      userRole: 'Skilled Nurse',
      actionDescription: 'Resubmitted corrected document for QA re-review',
      metadata: {
        iteration: 2,
        complianceScore: 92,
      },
    },
    {
      id: 'event-10',
      type: 'qa-review-started',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Jane Smith',
      userRole: 'QA Reviewer',
      actionDescription: 'Started re-review of corrected document',
    },
    {
      id: 'event-11',
      type: 'qa-review-completed',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      user: 'Jane Smith',
      userRole: 'QA Reviewer',
      actionDescription: 'Completed QA re-review - all issues resolved',
      metadata: {
        complianceScore: 95,
      },
    },
    {
      id: 'event-12',
      type: 'approved-for-billing',
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      user: 'Jane Smith',
      userRole: 'QA Reviewer',
      actionDescription: 'Approved document for billing submission',
      metadata: {
        complianceScore: 95,
        comment: 'All required corrections completed. Document meets compliance standards.',
      },
    },
  ];

  return {
    documentId: 'VN-2024-445',
    documentType: 'Visit Note',
    patientName: 'Margaret Johnson',
    admissionId: 'ADM-12345',
    events,
    currentStatus: 'Approved for Billing',
    totalDuration: 5 * 24, // 5 days in hours
    qaReviewCount: 2,
    correctionCycles: 1,
  };
}
