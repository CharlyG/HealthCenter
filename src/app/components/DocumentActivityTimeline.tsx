/**
 * Document Activity Timeline Component
 * 
 * Comprehensive timeline visualization for tracking the full lifecycle
 * of orders and 485 documents. Makes document history easy to understand
 * through chronological event tracking with visual indicators.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  FileText,
  Edit,
  CheckCircle,
  Send,
  FileSignature,
  RotateCcw,
  Check,
  Download,
  Clock,
  User,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Activity,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type DocumentEventType =
  | 'created'
  | 'edited'
  | 'completed'
  | 'sent-for-signature'
  | 'signed'
  | 'returned-for-correction'
  | 'corrected'
  | 'printed-exported';

export interface DocumentEvent {
  id: string;
  type: DocumentEventType;
  timestamp: string;
  user: {
    name: string;
    role: string;
  };
  action: string;
  description: string;
  metadata?: {
    changes?: string[];
    signatureType?: string;
    returnReason?: string;
    exportFormat?: string;
    fieldsEdited?: string[];
    version?: number;
  };
}

export interface DocumentTimeline {
  documentId: string;
  documentType: string;
  documentTitle: string;
  patient: {
    name: string;
    id: string;
  };
  admission: {
    id: string;
  };
  events: DocumentEvent[];
  currentStatus: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const EVENT_CONFIG: Record<
  DocumentEventType,
  { label: string; icon: any; color: string; bgColor: string; borderColor: string }
> = {
  'created': {
    label: 'Created',
    icon: FileText,
    color: '#10B981',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  'edited': {
    label: 'Edited',
    icon: Edit,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  'completed': {
    label: 'Completed',
    icon: CheckCircle,
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  'sent-for-signature': {
    label: 'Sent for Signature',
    icon: Send,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  'signed': {
    label: 'Signed',
    icon: FileSignature,
    color: '#10B981',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  'returned-for-correction': {
    label: 'Returned for Correction',
    icon: RotateCcw,
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  'corrected': {
    label: 'Corrected',
    icon: Check,
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  'printed-exported': {
    label: 'Printed/Exported',
    icon: Download,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#6B7280',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

function generateMockTimeline(): DocumentTimeline {
  const now = new Date();

  return {
    documentId: 'DOC-485-12345',
    documentType: 'Plan of Care / 485',
    documentTitle: 'Initial Plan of Care - 60 day certification',
    patient: {
      name: 'Margaret Johnson',
      id: 'PAT-001',
    },
    admission: {
      id: 'ADM-12345',
    },
    currentStatus: 'Signed',
    events: [
      {
        id: 'EVT-001',
        type: 'created',
        timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Emily Chen', role: 'RN Case Manager' },
        action: 'Created document',
        description: 'Initial Plan of Care document created for new admission',
        metadata: {
          version: 1,
        },
      },
      {
        id: 'EVT-002',
        type: 'edited',
        timestamp: new Date(now.getTime() - 9.5 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Emily Chen', role: 'RN Case Manager' },
        action: 'Edited document',
        description: 'Added visit frequency for Physical Therapy (3x per week)',
        metadata: {
          fieldsEdited: ['Visit Frequency - PT'],
          version: 2,
        },
      },
      {
        id: 'EVT-003',
        type: 'edited',
        timestamp: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Emily Chen', role: 'RN Case Manager' },
        action: 'Edited document',
        description: 'Updated clinical goals to SMART format with measurable outcomes',
        metadata: {
          fieldsEdited: ['Clinical Goals', 'Target Dates'],
          version: 3,
        },
      },
      {
        id: 'EVT-004',
        type: 'completed',
        timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Emily Chen', role: 'RN Case Manager' },
        action: 'Marked as complete',
        description: 'All required sections completed and ready for physician signature',
        metadata: {
          version: 3,
        },
      },
      {
        id: 'EVT-005',
        type: 'sent-for-signature',
        timestamp: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Emily Chen', role: 'RN Case Manager' },
        action: 'Sent for signature',
        description: 'Sent to Dr. Sarah Mitchell for physician signature',
        metadata: {
          signatureType: 'Physician Signature',
        },
      },
      {
        id: 'EVT-006',
        type: 'returned-for-correction',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Dr. Sarah Mitchell', role: 'Physician' },
        action: 'Returned for correction',
        description: 'Speech Therapy frequency missing; ICD-10 code incomplete',
        metadata: {
          returnReason:
            'Speech Therapy is listed as a discipline but no visit frequency is specified. Primary diagnosis ICD-10 code appears incomplete (I50. should have additional digit).',
        },
      },
      {
        id: 'EVT-007',
        type: 'corrected',
        timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Emily Chen', role: 'RN Case Manager' },
        action: 'Made corrections',
        description: 'Added ST frequency (2x/week) and corrected ICD-10 to I50.9',
        metadata: {
          changes: [
            'Added Speech Therapy frequency: 2x per week for 4 weeks',
            'Updated Primary Diagnosis ICD-10: I50. → I50.9 (Heart Failure, unspecified)',
          ],
          version: 4,
        },
      },
      {
        id: 'EVT-008',
        type: 'sent-for-signature',
        timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Emily Chen', role: 'RN Case Manager' },
        action: 'Resubmitted for signature',
        description: 'Corrections completed, resubmitted to Dr. Sarah Mitchell',
        metadata: {
          signatureType: 'Physician Signature',
        },
      },
      {
        id: 'EVT-009',
        type: 'signed',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Dr. Sarah Mitchell', role: 'Physician' },
        action: 'Signed document',
        description: 'Physician signature applied electronically',
        metadata: {
          signatureType: 'Physician Signature',
        },
      },
      {
        id: 'EVT-010',
        type: 'printed-exported',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        user: { name: 'Michael Torres', role: 'Clinical Manager' },
        action: 'Exported document',
        description: 'Exported as PDF for submission to payer',
        metadata: {
          exportFormat: 'PDF',
        },
      },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentActivityTimelineProps {
  timeline?: DocumentTimeline;
  compact?: boolean;
}

export default function DocumentActivityTimeline({
  timeline: providedTimeline,
  compact = false,
}: DocumentActivityTimelineProps) {
  const timeline = providedTimeline || generateMockTimeline();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<DocumentEventType | 'all'>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = timeline.events;

    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === eventTypeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.action.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          event.user.name.toLowerCase().includes(term) ||
          EVENT_CONFIG[event.type].label.toLowerCase().includes(term)
      );
    }

    // Sort by timestamp descending (newest first)
    return [...filtered].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [timeline.events, eventTypeFilter, searchTerm]);

  const toggleEventExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const eventCounts = timeline.events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: timeline.events.length,
      created: eventCounts['created'] || 0,
      edited: eventCounts['edited'] || 0,
      signed: eventCounts['signed'] || 0,
      returned: eventCounts['returned-for-correction'] || 0,
    };
  }, [timeline.events]);

  return (
    <div className="space-y-6">
      {!compact && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Document Activity Timeline
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Complete lifecycle history for {timeline.documentTitle}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Timeline
            </Button>
          </div>

          {/* Document Info Card */}
          <Card className="p-4">
            <div className="grid grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Document Type</p>
                <p className="font-medium text-gray-900">{timeline.documentType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Patient</p>
                <p className="font-medium text-gray-900">{timeline.patient.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Admission</p>
                <p className="font-medium text-gray-900">{timeline.admission.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Document ID</p>
                <p className="font-medium text-gray-900">{timeline.documentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Current Status</p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {timeline.currentStatus}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card className="p-4">
            <div className="grid grid-cols-5 gap-4">
              <StatCard label="Total Events" value={stats.total} icon={Activity} />
              <StatCard label="Created" value={stats.created} icon={FileText} />
              <StatCard label="Edits" value={stats.edited} icon={Edit} />
              <StatCard label="Signatures" value={stats.signed} icon={FileSignature} />
              <StatCard
                label="Returns"
                value={stats.returned}
                icon={RotateCcw}
                alert={stats.returned > 0}
              />
            </div>
          </Card>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events by action, user, or description..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Event Type Filter */}
              <select
                value={eventTypeFilter}
                onChange={e => setEventTypeFilter(e.target.value as DocumentEventType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Event Types</option>
                <option value="created">Created</option>
                <option value="edited">Edited</option>
                <option value="completed">Completed</option>
                <option value="sent-for-signature">Sent for Signature</option>
                <option value="signed">Signed</option>
                <option value="returned-for-correction">Returned for Correction</option>
                <option value="corrected">Corrected</option>
                <option value="printed-exported">Printed/Exported</option>
              </select>
            </div>
          </Card>
        </>
      )}

      {/* Timeline */}
      <Card className="p-6">
        {!compact && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">
              Timeline ({filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''})
            </h3>
            <Badge variant="outline" className="text-xs">
              Newest First
            </Badge>
          </div>
        )}

        {/* Timeline Events */}
        <div className="space-y-0">
          {filteredEvents.map((event, index) => {
            const isLast = index === filteredEvents.length - 1;
            const isExpanded = expandedEvents.has(event.id);
            const hasExpandableContent = !!(
              event.metadata?.changes ||
              event.metadata?.returnReason ||
              event.metadata?.fieldsEdited
            );

            return (
              <TimelineEvent
                key={event.id}
                event={event}
                isLast={isLast}
                isExpanded={isExpanded}
                hasExpandableContent={hasExpandableContent}
                onToggleExpand={() => toggleEventExpanded(event.id)}
                compact={compact}
              />
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No events match your filters</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  alert?: boolean;
}

function StatCard({ label, value, icon: Icon, alert }: StatCardProps) {
  return (
    <div className={cn('text-center p-3 rounded-lg', alert ? 'bg-amber-50' : 'bg-gray-50')}>
      <Icon className={cn('w-5 h-5 mx-auto mb-2', alert ? 'text-amber-600' : 'text-gray-600')} />
      <p className="text-2xl font-bold" style={{ color: alert ? '#D97706' : '#111827' }}>
        {value}
      </p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE EVENT
// ═══════════════════════════════════════════════════════════════════════════

interface TimelineEventProps {
  event: DocumentEvent;
  isLast: boolean;
  isExpanded: boolean;
  hasExpandableContent: boolean;
  onToggleExpand: () => void;
  compact?: boolean;
}

function TimelineEvent({
  event,
  isLast,
  isExpanded,
  hasExpandableContent,
  onToggleExpand,
  compact = false,
}: TimelineEventProps) {
  const config = EVENT_CONFIG[event.type];
  const EventIcon = config.icon;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const timestampInfo = formatTimestamp(event.timestamp);

  return (
    <div className="flex gap-4 pb-6 relative">
      {/* Timeline Line and Icon */}
      <div className="flex flex-col items-center">
        {/* Icon Circle */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm relative z-10"
          style={{
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          }}
        >
          <EventIcon className="w-5 h-5" style={{ color: config.color }} />
        </div>

        {/* Connecting Line */}
        {!isLast && (
          <div
            className="w-0.5 flex-1 mt-2"
            style={{ backgroundColor: '#E5E7EB', minHeight: '40px' }}
          />
        )}
      </div>

      {/* Event Content */}
      <div className="flex-1 pt-1">
        {/* Main Event Info */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{config.label}</h4>
              <Badge
                variant="outline"
                style={{
                  backgroundColor: config.bgColor,
                  color: config.color,
                  borderColor: config.borderColor,
                }}
                className="text-xs"
              >
                {event.action}
              </Badge>
              {event.metadata?.version && (
                <Badge variant="outline" className="text-xs bg-gray-50">
                  v{event.metadata.version}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-700">{event.description}</p>
          </div>

          {/* Expand Button */}
          {hasExpandableContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="ml-2"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">{event.user.name}</span>
            <span className="text-gray-500">({event.user.role})</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{timestampInfo.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{timestampInfo.time}</span>
          </div>
          <Badge variant="outline" className="text-xs bg-gray-50">
            {timestampInfo.relative}
          </Badge>
        </div>

        {/* Expandable Content */}
        {hasExpandableContent && isExpanded && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {/* Changes List */}
            {event.metadata?.changes && event.metadata.changes.length > 0 && (
              <div className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-gray-700 mb-2">Changes Made:</p>
                <ul className="space-y-1">
                  {event.metadata.changes.map((change, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Return Reason */}
            {event.metadata?.returnReason && (
              <div className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-gray-700 mb-2">Return Reason:</p>
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
                  {event.metadata.returnReason}
                </p>
              </div>
            )}

            {/* Fields Edited */}
            {event.metadata?.fieldsEdited && event.metadata.fieldsEdited.length > 0 && (
              <div className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-gray-700 mb-2">Fields Edited:</p>
                <div className="flex flex-wrap gap-1">
                  {event.metadata.fieldsEdited.map((field, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-blue-50">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Type */}
            {event.metadata?.signatureType && (
              <div className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-gray-700 mb-2">Signature Type:</p>
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                  <FileSignature className="w-3 h-3 mr-1" />
                  {event.metadata.signatureType}
                </Badge>
              </div>
            )}

            {/* Export Format */}
            {event.metadata?.exportFormat && (
              <div className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-gray-700 mb-2">Export Format:</p>
                <Badge variant="outline" className="text-xs bg-gray-100">
                  <Download className="w-3 h-3 mr-1" />
                  {event.metadata.exportFormat}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
