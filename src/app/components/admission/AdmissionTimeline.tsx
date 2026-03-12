/**
 * Admission Timeline Component
 * 
 * Displays the entire episode of care for a specific admission showing:
 * - Admission creation
 * - Visits (scheduled, completed, missed)
 * - Clinical documentation (notes, assessments)
 * - Orders (verbal, written)
 * - Assessments (OASIS, HOPE, etc.)
 * - Billing events (claims, payments)
 * - Authorization updates
 * - Discharge
 * 
 * Each entry shows:
 * - Event icon
 * - Timestamp
 * - Caregiver or staff member
 * - Short description
 * - Quick action button
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import EventDetailContent from './EventDetailContent';
import {
  Clock,
  UserPlus,
  Stethoscope,
  FileText,
  ClipboardCheck,
  DollarSign,
  ShieldCheck,
  LogOut,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Pill,
  Activity,
  Heart,
  FileSignature,
  CreditCard,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  User,
  ArrowRight,
  Eye,
  Edit,
  Download,
  X,
  ExternalLink,
  Copy,
  Share2,
} from 'lucide-react';

export type TimelineEventType =
  | 'admission_created'
  | 'visit_scheduled'
  | 'visit_completed'
  | 'visit_missed'
  | 'visit_cancelled'
  | 'documentation_created'
  | 'documentation_signed'
  | 'order_created'
  | 'order_signed'
  | 'assessment_created'
  | 'assessment_updated'
  | 'assessment_started'
  | 'assessment_completed'
  | 'assessment_submitted'
  | 'billing_claim_created'
  | 'billing_claim_submitted'
  | 'billing_payment_received'
  | 'authorization_requested'
  | 'authorization_approved'
  | 'authorization_denied'
  | 'authorization_updated'
  | 'discharge_planned'
  | 'discharge_completed'
  | 'communication'
  | 'alert'
  | 'status_change';

export type TimelineEventCategory = 
  | 'admission'
  | 'visit'
  | 'documentation'
  | 'order'
  | 'assessment'
  | 'billing'
  | 'authorization'
  | 'discharge'
  | 'communication'
  | 'system';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  category: TimelineEventCategory;
  timestamp: string;
  title: string;
  description: string;
  staffMember?: {
    name: string;
    role: string;
  };
  metadata?: {
    location?: string;
    duration?: string;
    amount?: number;
    status?: string;
    [key: string]: any;
  };
  actionLabel?: string;
  onAction?: () => void;
}

interface AdmissionTimelineProps {
  admissionId: string;
  events: TimelineEvent[];
  loading?: boolean;
}

const eventTypeConfig: Record<
  TimelineEventType,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  admission_created: {
    icon: UserPlus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Admission Created',
  },
  visit_scheduled: {
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Visit Scheduled',
  },
  visit_completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Visit Completed',
  },
  visit_missed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Visit Missed',
  },
  visit_cancelled: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Visit Cancelled',
  },
  documentation_created: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Documentation Created',
  },
  documentation_signed: {
    icon: FileSignature,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Documentation Signed',
  },
  order_created: {
    icon: Pill,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Order Created',
  },
  order_signed: {
    icon: FileSignature,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Order Signed',
  },
  assessment_created: {
    icon: ClipboardCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Assessment Created',
  },
  assessment_updated: {
    icon: ClipboardCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Assessment Updated',
  },
  assessment_started: {
    icon: ClipboardCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Assessment Started',
  },
  assessment_completed: {
    icon: ClipboardCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Assessment Completed',
  },
  assessment_submitted: {
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Assessment Submitted',
  },
  billing_claim_created: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Claim Created',
  },
  billing_claim_submitted: {
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    label: 'Claim Submitted',
  },
  billing_payment_received: {
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Payment Received',
  },
  authorization_requested: {
    icon: ShieldCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Authorization Requested',
  },
  authorization_approved: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Authorization Approved',
  },
  authorization_denied: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Authorization Denied',
  },
  authorization_updated: {
    icon: ShieldCheck,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Authorization Updated',
  },
  discharge_planned: {
    icon: LogOut,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Discharge Planned',
  },
  discharge_completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Discharge Completed',
  },
  communication: {
    icon: MessageSquare,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Communication',
  },
  alert: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Alert',
  },
  status_change: {
    icon: Activity,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Status Change',
  },
};

const categoryConfig: Record<
  TimelineEventCategory,
  { label: string; color: string }
> = {
  admission: { label: 'Admission', color: 'bg-blue-100 text-blue-800' },
  visit: { label: 'Visits', color: 'bg-purple-100 text-purple-800' },
  documentation: { label: 'Documentation', color: 'bg-indigo-100 text-indigo-800' },
  order: { label: 'Orders', color: 'bg-amber-100 text-amber-800' },
  assessment: { label: 'Assessments', color: 'bg-teal-100 text-teal-800' },
  billing: { label: 'Billing', color: 'bg-green-100 text-green-800' },
  authorization: { label: 'Authorization', color: 'bg-cyan-100 text-cyan-800' },
  discharge: { label: 'Discharge', color: 'bg-gray-100 text-gray-800' },
  communication: { label: 'Communication', color: 'bg-blue-100 text-blue-800' },
  system: { label: 'System', color: 'bg-gray-100 text-gray-800' },
};

export function AdmissionTimeline({
  admissionId,
  events,
  loading = false,
}: AdmissionTimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState<TimelineEventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const filtered = selectedCategory === 'all' 
      ? events 
      : events.filter(e => e.category === selectedCategory);

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const grouped: Record<string, TimelineEvent[]> = {};
    sorted.forEach(event => {
      const dateKey = new Date(event.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events, selectedCategory]);

  // Count events by category
  const categoryCounts = useMemo(() => {
    const counts: Record<TimelineEventCategory, number> = {
      admission: 0,
      visit: 0,
      documentation: 0,
      order: 0,
      assessment: 0,
      billing: 0,
      authorization: 0,
      discharge: 0,
      communication: 0,
      system: 0,
    };
    events.forEach(event => {
      counts[event.category]++;
    });
    return counts;
  }, [events]);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedEvent(null), 200);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Clock className="size-12 text-gray-300 mx-auto animate-spin" />
            <p className="text-sm text-gray-600">Loading timeline...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Activity className="size-12 text-gray-300 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">No timeline events</p>
              <p className="text-xs text-gray-600 mt-1">
                Events will appear here as the admission progresses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="text-xs"
            >
              All Events
              <Badge variant="secondary" className="ml-2 text-[10px]">
                {events.length}
              </Badge>
            </Button>
            {(Object.keys(categoryConfig) as TimelineEventCategory[])
              .filter(cat => categoryCounts[cat] > 0)
              .map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {categoryConfig[category].label}
                  <Badge variant="secondary" className="ml-2 text-[10px]">
                    {categoryCounts[category]}
                  </Badge>
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
          <div key={dateKey}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 text-blue-700 rounded-lg px-3 py-1.5 text-sm font-semibold">
                {dateKey}
              </div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Events for this date */}
            <div className="relative pl-8 space-y-6">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

              {dayEvents.map((event, idx) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  isLast={idx === dayEvents.length - 1}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Drawer */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="border-b border-gray-200 p-6 pb-4">
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about this timeline event
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 pt-4">
            {selectedEvent && <EventDetailContent event={selectedEvent} />}
          </div>
          <DialogFooter className="border-t border-gray-200 p-6 pt-4">
            <Button variant="outline" onClick={handleCloseDrawer}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TimelineEventCardProps {
  event: TimelineEvent;
  isLast: boolean;
  onClick: (event: TimelineEvent) => void;
}

function TimelineEventCard({ event, isLast, onClick }: TimelineEventCardProps) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;
  const categoryStyle = categoryConfig[event.category];

  const time = new Date(event.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div
        className={`absolute -left-[30px] top-2 size-6 rounded-full ${config.bgColor} border-2 border-white shadow-sm flex items-center justify-center z-10`}
      >
        <Icon className={`size-3 ${config.color}`} />
      </div>

      {/* Card */}
      <Card className="hover:shadow-md transition-shadow" onClick={() => onClick(event)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">{time}</p>
                    {event.metadata?.duration && (
                      <p className="text-[10px] text-gray-500">{event.metadata.duration}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Staff Member */}
              {event.staffMember && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <User className="size-3.5" />
                  <span className="font-medium">{event.staffMember.name}</span>
                  <span className="text-gray-400">•</span>
                  <span>{event.staffMember.role}</span>
                </div>
              )}

              {/* Metadata */}
              {event.metadata && (
                <div className="flex items-center gap-3 flex-wrap text-xs text-gray-600">
                  {event.metadata.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      <span>{event.metadata.location}</span>
                    </div>
                  )}
                  {event.metadata.amount !== undefined && (
                    <div className="flex items-center gap-1 font-medium text-green-700">
                      <DollarSign className="size-3" />
                      <span>${event.metadata.amount.toLocaleString()}</span>
                    </div>
                  )}
                  {event.metadata.status && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 px-1.5 ${
                        event.metadata.status === 'completed' || event.metadata.status === 'approved'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : event.metadata.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : event.metadata.status === 'denied' || event.metadata.status === 'missed'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {event.metadata.status}
                    </Badge>
                  )}
                </div>
              )}

              {/* Quick Action */}
              {event.actionLabel && event.onAction && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={event.onAction}
                  >
                    {event.actionLabel}
                    <ArrowRight className="size-3 ml-1.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data generator for demonstration
export function generateMockTimelineEvents(admissionId: string): TimelineEvent[] {
  const now = new Date();
  const events: TimelineEvent[] = [];

  // Admission created (30 days ago)
  const admissionDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  events.push({
    id: 'evt-001',
    type: 'admission_created',
    category: 'admission',
    timestamp: admissionDate.toISOString(),
    title: 'Admission Created',
    description: 'Patient admitted to home health care - Medicare Part A',
    staffMember: {
      name: 'Sarah Martinez',
      role: 'Intake Coordinator',
    },
    metadata: {
      status: 'completed',
    },
    actionLabel: 'View Admission',
    onAction: () => console.log('View admission'),
  });

  // Authorization requested (29 days ago)
  events.push({
    id: 'evt-002',
    type: 'authorization_requested',
    category: 'authorization',
    timestamp: new Date(admissionDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Authorization Requested',
    description: 'Authorization request submitted to Medicare for 60 visits',
    staffMember: {
      name: 'Sarah Martinez',
      role: 'Intake Coordinator',
    },
    metadata: {
      status: 'pending',
    },
    actionLabel: 'View Authorization',
  });

  // Authorization approved (27 days ago)
  events.push({
    id: 'evt-003',
    type: 'authorization_approved',
    category: 'authorization',
    timestamp: new Date(admissionDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Authorization Approved',
    description: 'Medicare approved 60 visits through 05/15/2026',
    staffMember: {
      name: 'System',
      role: 'Automated',
    },
    metadata: {
      status: 'approved',
    },
    actionLabel: 'View Details',
  });

  // OASIS Assessment created (26 days ago)
  events.push({
    id: 'evt-004-created',
    type: 'assessment_created',
    category: 'assessment',
    timestamp: new Date(admissionDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'OASIS-E Start of Care Assessment Created',
    description: 'SOC assessment created in system',
    staffMember: {
      name: 'Sarah Martinez',
      role: 'Intake Coordinator',
    },
    metadata: {
      assessmentType: 'OASIS-E SOC',
      assessmentId: 'oasis-soc-001',
      status: 'draft',
    },
    actionLabel: 'Open Assessment',
    onAction: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/oasis-assessment-editor';
      }
    },
  });

  // OASIS Assessment started (26 days ago - 30 min later)
  events.push({
    id: 'evt-004',
    type: 'assessment_started',
    category: 'assessment',
    timestamp: new Date(admissionDate.getTime() + 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    title: 'OASIS-E Assessment Started',
    description: 'SOC assessment initiated during first visit',
    staffMember: {
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    metadata: {
      location: 'Patient Home',
      assessmentType: 'OASIS-E SOC',
      assessmentId: 'oasis-soc-001',
      status: 'in_progress',
      sectionsCompleted: 2,
      totalSections: 8,
    },
    actionLabel: 'Continue Assessment',
    onAction: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/oasis-assessment-editor';
      }
    },
  });

  // First visit (26 days ago)
  events.push({
    id: 'evt-005',
    type: 'visit_completed',
    category: 'visit',
    timestamp: new Date(admissionDate.getTime() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    title: 'Skilled Nursing Visit - Start of Care',
    description: 'Initial comprehensive assessment and care plan development',
    staffMember: {
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    metadata: {
      location: 'Patient Home',
      duration: '90 min',
      status: 'completed',
    },
    actionLabel: 'View Visit Note',
  });

  // Assessment updated (25 days ago)
  events.push({
    id: 'evt-005-updated',
    type: 'assessment_updated',
    category: 'assessment',
    timestamp: new Date(admissionDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'OASIS-E Assessment Updated',
    description: 'Additional sections completed - 5 of 8 sections done',
    staffMember: {
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    metadata: {
      assessmentType: 'OASIS-E SOC',
      assessmentId: 'oasis-soc-001',
      status: 'in_progress',
      sectionsCompleted: 5,
      totalSections: 8,
      progressPercentage: 63,
    },
    actionLabel: 'Continue Assessment',
    onAction: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/oasis-assessment-editor';
      }
    },
  });

  // Documentation created
  events.push({
    id: 'evt-006',
    type: 'documentation_created',
    category: 'documentation',
    timestamp: new Date(admissionDate.getTime() + 4 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    title: 'Visit Note Created',
    description: 'Comprehensive SOC visit note documented',
    staffMember: {
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    actionLabel: 'Review Note',
  });

  // Order created (25 days ago)
  events.push({
    id: 'evt-007',
    type: 'order_created',
    category: 'order',
    timestamp: new Date(admissionDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Verbal Orders Received',
    description: 'Skilled nursing 3x/week, PT eval and treat 2x/week',
    staffMember: {
      name: 'Dr. James Anderson',
      role: 'Physician',
    },
    metadata: {
      status: 'pending signature',
    },
    actionLabel: 'View Orders',
  });

  // OASIS completed (24 days ago)
  events.push({
    id: 'evt-008',
    type: 'assessment_completed',
    category: 'assessment',
    timestamp: new Date(admissionDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'OASIS-E Assessment Completed',
    description: 'All 8 sections completed - ready for review and submission',
    staffMember: {
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    metadata: {
      assessmentType: 'OASIS-E SOC',
      assessmentId: 'oasis-soc-001',
      status: 'completed',
      sectionsCompleted: 8,
      totalSections: 8,
      progressPercentage: 100,
    },
    actionLabel: 'Review Assessment',
    onAction: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/clinical-assessment-viewer';
      }
    },
  });

  // OASIS submitted (23 days ago)
  events.push({
    id: 'evt-008-submitted',
    type: 'assessment_submitted',
    category: 'assessment',
    timestamp: new Date(admissionDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'OASIS-E Assessment Submitted',
    description: 'Assessment submitted to CMS - Validation successful',
    staffMember: {
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    metadata: {
      assessmentType: 'OASIS-E SOC',
      assessmentId: 'oasis-soc-001',
      status: 'submitted',
      submittedTo: 'CMS',
      validationStatus: 'passed',
    },
    actionLabel: 'View Submission',
    onAction: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/clinical-assessment-viewer';
      }
    },
  });

  // Several visits over the past weeks
  const visitDays = [8, 10, 13, 15, 17, 20, 22, 24, 27, 29];
  visitDays.forEach((day, idx) => {
    events.push({
      id: `evt-visit-${idx}`,
      type: 'visit_completed',
      category: 'visit',
      timestamp: new Date(admissionDate.getTime() + day * 24 * 60 * 60 * 1000).toISOString(),
      title: idx % 3 === 0 ? 'Physical Therapy Visit' : 'Skilled Nursing Visit',
      description: idx % 3 === 0 ? 'Therapeutic exercises and gait training' : 'Wound care and medication management',
      staffMember: {
        name: idx % 3 === 0 ? 'Michael Chen, PT' : 'Jennifer Lee, RN',
        role: idx % 3 === 0 ? 'Physical Therapist' : 'Clinical Nurse',
      },
      metadata: {
        location: 'Patient Home',
        duration: '60 min',
        status: 'completed',
      },
      actionLabel: 'View Note',
    });
  });

  // HOPE Assessment created (15 days ago)
  events.push({
    id: 'evt-hope-created',
    type: 'assessment_created',
    category: 'assessment',
    timestamp: new Date(admissionDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'HOPE Assessment Created',
    description: 'Hospice Outcomes & Patient Evaluation assessment created',
    staffMember: {
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    metadata: {
      assessmentType: 'HOPE',
      assessmentId: 'hope-001',
      status: 'draft',
    },
    actionLabel: 'Start Assessment',
    onAction: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/assessment-workspace';
      }
    },
  });

  // HOPE Assessment completed (14 days ago)
  events.push({
    id: 'evt-hope-completed',
    type: 'assessment_completed',
    category: 'assessment',
    timestamp: new Date(admissionDate.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'HOPE Assessment Completed',
    description: 'Assessment finalized and locked',
    staffMember: {
      name: 'Jennifer Lee, RN',
      role: 'Clinical Nurse',
    },
    metadata: {
      assessmentType: 'HOPE',
      assessmentId: 'hope-001',
      status: 'completed',
    },
    actionLabel: 'View Assessment',
    onAction: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/assessment-workspace';
      }
    },
  });

  // Billing claim created (2 days ago)
  events.push({
    id: 'evt-009',
    type: 'billing_claim_created',
    category: 'billing',
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Claim Created - Statement Period 1',
    description: 'Claim for services 02/08/26 - 03/07/26',
    staffMember: {
      name: 'Robert Kim',
      role: 'Billing Specialist',
    },
    metadata: {
      amount: 2450.00,
      status: 'pending',
    },
    actionLabel: 'View Claim',
  });

  // Billing claim submitted (1 day ago)
  events.push({
    id: 'evt-010',
    type: 'billing_claim_submitted',
    category: 'billing',
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Claim Submitted to Medicare',
    description: 'Electronic claim submission successful - CLM-2026-0001',
    staffMember: {
      name: 'System',
      role: 'Automated',
    },
    metadata: {
      amount: 2450.00,
      status: 'submitted',
    },
    actionLabel: 'Track Claim',
  });

  // Recent visit scheduled (today)
  events.push({
    id: 'evt-011',
    type: 'visit_scheduled',
    category: 'visit',
    timestamp: new Date(now.getTime()).toISOString(),
    title: 'Visit Scheduled',
    description: 'Skilled nursing visit scheduled for tomorrow at 10:00 AM',
    staffMember: {
      name: 'Linda Thompson',
      role: 'Scheduler',
    },
    metadata: {
      status: 'scheduled',
    },
    actionLabel: 'View Schedule',
  });

  return events;
}