/**
 * QA Workspace Component
 * 
 * Organizes clinical documentation review items into operational queues.
 * Displays 5 queues: Pending Review, Returned for Correction, Corrected
 * Awaiting Review, Approved Documents, and Blocked by Compliance Issues.
 * Users can open documents directly from any queue for detailed review.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Clock,
  XCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Calendar,
  User,
  FileText,
  Filter,
  Download,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { QAReviewItem, DocumentType, QAPriority } from './QACenterWorkspace';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type QueueType =
  | 'pending-review'
  | 'returned'
  | 'corrected-awaiting'
  | 'approved'
  | 'blocked';

export interface QAWorkspaceData {
  pendingReview: QAReviewItem[];
  returned: QAReviewItem[];
  correctedAwaiting: QAReviewItem[];
  approved: QAReviewItem[];
  blocked: QAReviewItem[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const QUEUE_CONFIG: Record<
  QueueType,
  {
    label: string;
    icon: any;
    color: string;
    description: string;
    bgClass: string;
    iconClass: string;
  }
> = {
  'pending-review': {
    label: 'Pending Review',
    icon: Clock,
    color: 'blue',
    description: 'Documents waiting for initial QA review',
    bgClass: 'bg-blue-50',
    iconClass: 'text-blue-600',
  },
  'returned': {
    label: 'Returned for Correction',
    icon: XCircle,
    color: 'amber',
    description: 'Documents returned to clinicians for correction',
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-600',
  },
  'corrected-awaiting': {
    label: 'Corrected Awaiting Review',
    icon: RefreshCw,
    color: 'purple',
    description: 'Corrected documents awaiting re-review',
    bgClass: 'bg-purple-50',
    iconClass: 'text-purple-600',
  },
  'approved': {
    label: 'Approved',
    icon: CheckCircle,
    color: 'green',
    description: 'Documents approved for billing',
    bgClass: 'bg-green-50',
    iconClass: 'text-green-600',
  },
  'blocked': {
    label: 'Blocked by Compliance',
    icon: AlertTriangle,
    color: 'red',
    description: 'Documents with critical compliance issues',
    bgClass: 'bg-red-50',
    iconClass: 'text-red-600',
  },
};

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'visit-note': 'Visit Note',
  'assessment': 'Assessment',
  '485': '485',
  'verbal-order': 'Verbal Order',
  'recertification': 'Recertification',
  'discharge-summary': 'Discharge Summary',
};

const PRIORITY_CONFIG: Record<
  QAPriority,
  { label: string; bgClass: string; textClass: string }
> = {
  urgent: {
    label: 'Urgent',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
  high: {
    label: 'High',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
  },
  normal: {
    label: 'Normal',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  low: {
    label: 'Low',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QAWorkspaceProps {
  data: QAWorkspaceData;
  onOpenDocument: (item: QAReviewItem) => void;
  onRefresh?: () => void;
  onExport?: (queueType: QueueType) => void;
  currentReviewer?: string;
}

export default function QAWorkspace({
  data,
  onOpenDocument,
  onRefresh,
  onExport,
  currentReviewer,
}: QAWorkspaceProps) {
  const [activeQueue, setActiveQueue] = useState<QueueType>('pending-review');
  const [priorityFilter, setPriorityFilter] = useState<QAPriority | 'all'>('all');

  // Calculate queue counts
  const queueCounts = {
    pendingReview: data.pendingReview.length,
    returned: data.returned.length,
    correctedAwaiting: data.correctedAwaiting.length,
    approved: data.approved.length,
    blocked: data.blocked.length,
  };

  // Get filtered items for active queue
  const filteredItems = useMemo(() => {
    let items: QAReviewItem[] = [];
    
    switch (activeQueue) {
      case 'pending-review':
        items = data.pendingReview;
        break;
      case 'returned':
        items = data.returned;
        break;
      case 'corrected-awaiting':
        items = data.correctedAwaiting;
        break;
      case 'approved':
        items = data.approved;
        break;
      case 'blocked':
        items = data.blocked;
        break;
    }

    if (priorityFilter !== 'all') {
      items = items.filter((item) => item.priority === priorityFilter);
    }

    return items;
  }, [data, activeQueue, priorityFilter]);

  const activeQueueConfig = QUEUE_CONFIG[activeQueue];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QA Workspace</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review clinical documentation organized by operational queues
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport?.(activeQueue)}>
              <Download className="w-4 h-4 mr-2" />
              Export Queue
            </Button>
          </div>
        </div>

        {/* Queue Summary Cards */}
        <QueueSummaryCards counts={queueCounts} />
      </div>

      {/* Queue Tabs */}
      <div className="bg-white border-b px-6">
        <Tabs value={activeQueue} onValueChange={(value) => setActiveQueue(value as QueueType)}>
          <TabsList className="h-auto p-0 bg-transparent border-b-0">
            <TabsTrigger
              value="pending-review"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pending Review
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                {queueCounts.pendingReview}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="returned"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:bg-transparent"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Returned
              <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-300">
                {queueCounts.returned}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="corrected-awaiting"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Corrected Awaiting
              <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                {queueCounts.correctedAwaiting}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-green-600 data-[state=active]:bg-transparent"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-300">
                {queueCounts.approved}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="blocked"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:bg-transparent"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Blocked
              <Badge variant="outline" className="ml-2 bg-red-100 text-red-700 border-red-300">
                {queueCounts.blocked}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Queue Header */}
      <div className={cn('px-6 py-3 border-b', activeQueueConfig.bgClass)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                activeQueueConfig.bgClass
              )}
            >
              {(() => {
                const Icon = activeQueueConfig.icon;
                return <Icon className={cn('w-5 h-5', activeQueueConfig.iconClass)} />;
              })()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{activeQueueConfig.label}</h2>
              <p className="text-sm text-gray-600">{activeQueueConfig.description}</p>
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as QAPriority | 'all')}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Only</option>
              <option value="high">High Only</option>
              <option value="normal">Normal Only</option>
              <option value="low">Low Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Queue Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredItems.length === 0 ? (
          <EmptyQueueState queueType={activeQueue} />
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <QueueItemCard key={item.id} item={item} onOpen={() => onOpenDocument(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE SUMMARY CARDS
// ═══════════════════════════════════════════════════════════════════════════

interface QueueSummaryCardsProps {
  counts: {
    pendingReview: number;
    returned: number;
    correctedAwaiting: number;
    approved: number;
    blocked: number;
  };
}

function QueueSummaryCards({ counts }: QueueSummaryCardsProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <SummaryCard
        label="Pending Review"
        count={counts.pendingReview}
        icon={Clock}
        color="blue"
      />
      <SummaryCard
        label="Returned"
        count={counts.returned}
        icon={XCircle}
        color="amber"
      />
      <SummaryCard
        label="Corrected Awaiting"
        count={counts.correctedAwaiting}
        icon={RefreshCw}
        color="purple"
      />
      <SummaryCard
        label="Approved"
        count={counts.approved}
        icon={CheckCircle}
        color="green"
      />
      <SummaryCard
        label="Blocked"
        count={counts.blocked}
        icon={AlertTriangle}
        color="red"
      />
    </div>
  );
}

function SummaryCard({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            colorClasses[color as keyof typeof colorClasses]
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE ITEM CARD
// ═══════════════════════════════════════════════════════════════════════════

interface QueueItemCardProps {
  item: QAReviewItem;
  onOpen: () => void;
}

function QueueItemCard({ item, onOpen }: QueueItemCardProps) {
  const priorityConfig = PRIORITY_CONFIG[item.priority];

  // Calculate admission start date (mock - in real app this would come from data)
  const admissionStartDate = '2024-11-01'; // This should be part of item data

  return (
    <Card
      className="p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-center gap-4">
        {/* Priority Indicator */}
        <div className={cn('w-1 h-16 rounded-full flex-shrink-0', priorityConfig.bgClass)} />

        {/* Main Content */}
        <div className="flex-1 min-w-0 grid grid-cols-7 gap-4 items-center">
          {/* Patient Name */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 truncate">{item.patientName}</h3>
            </div>
            <p className="text-xs text-gray-600">ID: {item.admissionId}</p>
          </div>

          {/* Admission Start Date */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">Admission</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {new Date(admissionStartDate).toLocaleDateString()}
            </p>
          </div>

          {/* Document Type */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">Document</p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {DOCUMENT_TYPE_LABELS[item.documentType]}
            </p>
          </div>

          {/* Clinician */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Clinician</p>
            <p className="text-sm font-medium text-gray-900 truncate">{item.clinicianName}</p>
          </div>

          {/* Visit Date */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Visit Date</p>
            <p className="text-sm font-medium text-gray-900">
              {item.visitDate ? new Date(item.visitDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {/* Status & Priority */}
          <div>
            <div className="flex flex-col gap-1">
              <Badge
                variant="outline"
                className={cn('text-xs', priorityConfig.bgClass, priorityConfig.textClass)}
              >
                {priorityConfig.label}
              </Badge>
              {item.flagCount > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                  {item.flagCount} flags
                </Badge>
              )}
              {item.billingImpact && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                  Billing Impact
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Open
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Additional Info Row */}
      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>Submitted: {new Date(item.submittedDate).toLocaleDateString()}</span>
          <span>•</span>
          <span>In queue: {item.daysInQueue} days</span>
          {item.complianceScore !== undefined && (
            <>
              <span>•</span>
              <span
                className={cn(
                  'font-medium',
                  item.complianceScore >= 90
                    ? 'text-green-700'
                    : item.complianceScore >= 80
                    ? 'text-amber-700'
                    : 'text-red-700'
                )}
              >
                Compliance: {item.complianceScore}%
              </span>
            </>
          )}
        </div>
        {item.assignedReviewer && (
          <div className="flex items-center gap-2">
            <span>Assigned to:</span>
            <span className="font-medium text-gray-900">{item.assignedReviewer}</span>
          </div>
        )}
      </div>

      {/* Flags */}
      {item.flags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.flags.slice(0, 3).map((flag, idx) => (
            <span
              key={idx}
              className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200"
            >
              {flag}
            </span>
          ))}
          {item.flags.length > 3 && (
            <span className="text-xs text-gray-600">+{item.flags.length - 3} more</span>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY QUEUE STATE
// ═══════════════════════════════════════════════════════════════════════════

function EmptyQueueState({ queueType }: { queueType: QueueType }) {
  const config = QUEUE_CONFIG[queueType];
  const Icon = config.icon;

  const messages = {
    'pending-review': {
      title: 'No Documents Pending Review',
      description: 'All submitted documents have been reviewed or assigned.',
    },
    'returned': {
      title: 'No Returned Documents',
      description: 'There are no documents currently returned for correction.',
    },
    'corrected-awaiting': {
      title: 'No Corrected Documents Awaiting Review',
      description: 'All corrected documents have been re-reviewed.',
    },
    'approved': {
      title: 'No Approved Documents',
      description: 'No documents have been approved yet.',
    },
    'blocked': {
      title: 'No Blocked Documents',
      description: 'No documents are currently blocked by compliance issues.',
    },
  };

  const message = messages[queueType];

  return (
    <Card className="p-12 text-center">
      <div className={cn('w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center', config.bgClass)}>
        <Icon className={cn('w-8 h-8', config.iconClass)} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{message.title}</h3>
      <p className="text-sm text-gray-600">{message.description}</p>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockQAWorkspaceData(): QAWorkspaceData {
  const baseItems: QAReviewItem[] = [
    {
      id: 'qa-1',
      documentId: 'VN-2024-445',
      documentType: 'visit-note',
      patientId: 'PAT-001',
      patientName: 'Margaret Johnson',
      admissionId: 'ADM-12345',
      clinicianId: 'CLN-101',
      clinicianName: 'Emily Chen, RN',
      visitDate: '2024-12-13',
      submittedDate: '2024-12-13T16:30:00Z',
      status: 'pending-review',
      priority: 'urgent',
      daysInQueue: 2,
      complianceScore: 75,
      flagCount: 3,
      flags: ['Missing vital signs', 'Incomplete assessment', 'No medication review'],
      requiresSignature: true,
      billingImpact: true,
    },
    {
      id: 'qa-2',
      documentId: 'OASIS-2024-156',
      documentType: 'assessment',
      patientId: 'PAT-002',
      patientName: 'Robert Williams',
      admissionId: 'ADM-12346',
      clinicianId: 'CLN-102',
      clinicianName: 'Sarah Johnson, PT',
      visitDate: '2024-12-12',
      submittedDate: '2024-12-12T14:20:00Z',
      status: 'pending-review',
      priority: 'high',
      daysInQueue: 3,
      complianceScore: 92,
      flagCount: 1,
      flags: ['M1400 response unclear'],
      requiresSignature: false,
      billingImpact: true,
    },
    {
      id: 'qa-3',
      documentId: '485-2024-078',
      documentType: '485',
      patientId: 'PAT-003',
      patientName: 'Patricia Davis',
      admissionId: 'ADM-12347',
      clinicianId: 'CLN-103',
      clinicianName: 'Michael Chen, RN',
      visitDate: undefined,
      submittedDate: '2024-12-10T10:15:00Z',
      status: 'returned',
      priority: 'high',
      daysInQueue: 5,
      complianceScore: 68,
      flagCount: 5,
      flags: [
        'Missing functional limitations',
        'Incomplete medication list',
        'No discharge plans',
        'Safety measures not documented',
        'Goals not SMART',
      ],
      requiresSignature: true,
      billingImpact: true,
      returnReason:
        'Multiple required sections incomplete. Please complete all sections before resubmission.',
      reviewedBy: 'Jane Smith',
      reviewedDate: '2024-12-11T09:30:00Z',
    },
    {
      id: 'qa-4',
      documentId: 'VN-2024-446',
      documentType: 'visit-note',
      patientId: 'PAT-004',
      patientName: 'James Anderson',
      admissionId: 'ADM-12348',
      clinicianId: 'CLN-104',
      clinicianName: 'Lisa Rodriguez, OT',
      visitDate: '2024-12-14',
      submittedDate: '2024-12-14T17:45:00Z',
      status: 'approved',
      priority: 'normal',
      daysInQueue: 1,
      assignedReviewer: 'Jane Smith',
      complianceScore: 95,
      flagCount: 0,
      flags: [],
      requiresSignature: false,
      billingImpact: false,
      reviewedBy: 'Jane Smith',
      reviewedDate: '2024-12-14T18:00:00Z',
    },
    {
      id: 'qa-5',
      documentId: 'VO-2024-223',
      documentType: 'verbal-order',
      patientId: 'PAT-001',
      patientName: 'Margaret Johnson',
      admissionId: 'ADM-12345',
      clinicianId: 'CLN-101',
      clinicianName: 'Emily Chen, RN',
      visitDate: '2024-12-10',
      submittedDate: '2024-12-10T11:20:00Z',
      status: 'escalated',
      priority: 'urgent',
      daysInQueue: 5,
      flagCount: 2,
      flags: ['Physician signature pending', 'Order expired'],
      requiresSignature: true,
      billingImpact: true,
    },
    {
      id: 'qa-6',
      documentId: 'VN-2024-447',
      documentType: 'visit-note',
      patientId: 'PAT-005',
      patientName: 'Mary Thompson',
      admissionId: 'ADM-12349',
      clinicianId: 'CLN-105',
      clinicianName: 'David Park, MSW',
      visitDate: '2024-12-11',
      submittedDate: '2024-12-11T15:10:00Z',
      status: 'in-review',
      priority: 'normal',
      daysInQueue: 4,
      assignedReviewer: 'John Doe',
      complianceScore: 88,
      flagCount: 1,
      flags: ['Missing care plan update'],
      requiresSignature: false,
      billingImpact: false,
    },
    {
      id: 'qa-7',
      documentId: 'VN-2024-448',
      documentType: 'visit-note',
      patientId: 'PAT-006',
      patientName: 'Thomas Brown',
      admissionId: 'ADM-12350',
      clinicianId: 'CLN-106',
      clinicianName: 'Jennifer White, RN',
      visitDate: '2024-12-09',
      submittedDate: '2024-12-09T14:00:00Z',
      status: 'in-review',
      priority: 'high',
      daysInQueue: 6,
      assignedReviewer: 'Jane Smith',
      complianceScore: 85,
      flagCount: 2,
      flags: ['Late submission', 'Wound measurement unclear'],
      requiresSignature: false,
      billingImpact: true,
    },
    {
      id: 'qa-8',
      documentId: 'ASSESS-2024-089',
      documentType: 'assessment',
      patientId: 'PAT-007',
      patientName: 'Susan Miller',
      admissionId: 'ADM-12351',
      clinicianId: 'CLN-107',
      clinicianName: 'Mark Davis, PT',
      visitDate: '2024-12-08',
      submittedDate: '2024-12-08T16:30:00Z',
      status: 'approved',
      priority: 'normal',
      daysInQueue: 7,
      assignedReviewer: 'John Doe',
      complianceScore: 98,
      flagCount: 0,
      flags: [],
      requiresSignature: false,
      billingImpact: true,
      reviewedBy: 'John Doe',
      reviewedDate: '2024-12-09T10:00:00Z',
    },
  ];

  return {
    pendingReview: baseItems.filter(
      (item) => item.status === 'pending-review'
    ),
    returned: baseItems.filter(
      (item) => item.status === 'returned'
    ),
    correctedAwaiting: baseItems.filter(
      (item) => item.status === 'in-review' && item.daysInQueue > 3
    ),
    approved: baseItems.filter(
      (item) => item.status === 'approved'
    ),
    blocked: baseItems.filter(
      (item) => item.status === 'escalated'
    ),
  };
}
