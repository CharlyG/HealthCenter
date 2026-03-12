/**
 * QA Center Workspace Component
 * 
 * Central workspace for reviewing clinical documentation before billing and
 * compliance submission. Supports document review, compliance validation,
 * return for correction, and approval for billing workflows. Allows QA
 * reviewers to triage large volumes of documentation efficiently.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  Eye,
  UserCheck,
  Calendar,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type QADocumentStatus = 
  | 'pending-review'
  | 'in-review'
  | 'returned'
  | 'approved'
  | 'rejected'
  | 'escalated';

export type DocumentType = 
  | 'visit-note'
  | 'assessment'
  | '485'
  | 'verbal-order'
  | 'recertification'
  | 'discharge-summary';

export type QAPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface QAReviewItem {
  id: string;
  documentId: string;
  documentType: DocumentType;
  patientId: string;
  patientName: string;
  admissionId: string;
  clinicianId: string;
  clinicianName: string;
  visitDate?: string;
  submittedDate: string;
  status: QADocumentStatus;
  priority: QAPriority;
  daysInQueue: number;
  assignedReviewer?: string;
  complianceScore?: number;
  flagCount: number;
  flags: string[];
  requiresSignature: boolean;
  billingImpact: boolean;
  reviewNotes?: string;
  returnReason?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

export interface QAFilters {
  status: QADocumentStatus | 'all';
  documentType: DocumentType | 'all';
  priority: QAPriority | 'all';
  assignedReviewer: string | 'all' | 'unassigned';
  dateRange: 'today' | 'week' | 'month' | 'all';
  searchTerm: string;
}

export interface QAMetrics {
  totalPending: number;
  totalInReview: number;
  totalReturned: number;
  totalApproved: number;
  averageReviewTime: number; // hours
  complianceRate: number; // percentage
  returnRate: number; // percentage
  oldestItem: number; // days
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<
  QADocumentStatus,
  { label: string; color: string; icon: any; bgClass: string; textClass: string }
> = {
  'pending-review': {
    label: 'Pending Review',
    color: 'blue',
    icon: Clock,
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
  },
  'in-review': {
    label: 'In Review',
    color: 'purple',
    icon: Eye,
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
  },
  'returned': {
    label: 'Returned',
    color: 'amber',
    icon: AlertTriangle,
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
  },
  'approved': {
    label: 'Approved',
    color: 'green',
    icon: CheckCircle,
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
  },
  'rejected': {
    label: 'Rejected',
    color: 'red',
    icon: XCircle,
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
  },
  'escalated': {
    label: 'Escalated',
    color: 'orange',
    icon: TrendingUp,
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
  },
};

const DOCUMENT_TYPE_CONFIG: Record<
  DocumentType,
  { label: string; icon: string; color: string }
> = {
  'visit-note': { label: 'Visit Note', icon: '📋', color: 'blue' },
  'assessment': { label: 'Assessment', icon: '📊', color: 'purple' },
  '485': { label: '485', icon: '📄', color: 'green' },
  'verbal-order': { label: 'Verbal Order', icon: '🗣️', color: 'amber' },
  'recertification': { label: 'Recertification', icon: '🔄', color: 'indigo' },
  'discharge-summary': { label: 'Discharge Summary', icon: '✅', color: 'teal' },
};

const PRIORITY_CONFIG: Record<
  QAPriority,
  { label: string; color: string; bgClass: string; textClass: string }
> = {
  urgent: {
    label: 'Urgent',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
  high: {
    label: 'High',
    color: 'orange',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
  },
  normal: {
    label: 'Normal',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  low: {
    label: 'Low',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QACenterWorkspaceProps {
  items: QAReviewItem[];
  metrics: QAMetrics;
  currentReviewer: string;
  onReviewItem: (itemId: string) => void;
  onBulkAssign?: (itemIds: string[], reviewer: string) => void;
  onExportQueue?: () => void;
  onRefresh?: () => void;
}

export default function QACenterWorkspace({
  items,
  metrics,
  currentReviewer,
  onReviewItem,
  onBulkAssign,
  onExportQueue,
  onRefresh,
}: QACenterWorkspaceProps) {
  const [filters, setFilters] = useState<QAFilters>({
    status: 'all',
    documentType: 'all',
    priority: 'all',
    assignedReviewer: 'all',
    dateRange: 'all',
    searchTerm: '',
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'priority' | 'age' | 'type' | 'patient'>('priority');

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter((item) => item.status === filters.status);
    }
    if (filters.documentType !== 'all') {
      filtered = filtered.filter((item) => item.documentType === filters.documentType);
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter((item) => item.priority === filters.priority);
    }
    if (filters.assignedReviewer === 'unassigned') {
      filtered = filtered.filter((item) => !item.assignedReviewer);
    } else if (filters.assignedReviewer !== 'all') {
      filtered = filtered.filter((item) => item.assignedReviewer === filters.assignedReviewer);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.patientName.toLowerCase().includes(term) ||
          item.clinicianName.toLowerCase().includes(term) ||
          item.documentId.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'age') {
        return b.daysInQueue - a.daysInQueue;
      } else if (sortBy === 'type') {
        return a.documentType.localeCompare(b.documentType);
      } else {
        return a.patientName.localeCompare(b.patientName);
      }
    });

    return filtered;
  }, [items, filters, sortBy]);

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleBulkAssign = () => {
    if (onBulkAssign && selectedItems.size > 0) {
      onBulkAssign(Array.from(selectedItems), currentReviewer);
      clearSelection();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">QA Center</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review clinical documentation for compliance and billing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onExportQueue}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Metrics Summary */}
        <QAMetricsSummary metrics={metrics} />
      </div>

      {/* Filters and Toolbar */}
      <div className="bg-gray-50 border-b px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search patients, clinicians, or document IDs..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value as QADocumentStatus | 'all' })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending-review">Pending Review</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.documentType}
            onValueChange={(value) =>
              setFilters({ ...filters, documentType: value as DocumentType | 'all' })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="visit-note">Visit Note</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="485">485</SelectItem>
              <SelectItem value="verbal-order">Verbal Order</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.priority}
            onValueChange={(value) =>
              setFilters({ ...filters, priority: value as QAPriority | 'all' })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Secondary Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as 'priority' | 'age' | 'type' | 'patient')
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="age">Sort by Age</SelectItem>
                <SelectItem value="type">Sort by Type</SelectItem>
                <SelectItem value="patient">Sort by Patient</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600">
              Showing {filteredItems.length} of {items.length} items
            </div>
          </div>

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedItems.size} selected
              </span>
              <Button size="sm" variant="outline" onClick={handleBulkAssign}>
                <UserCheck className="w-4 h-4 mr-2" />
                Assign to Me
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-auto bg-gray-50 px-6 py-4">
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h3 className="font-semibold text-gray-900 mb-1">No Items Found</h3>
              <p className="text-sm text-gray-600">
                Try adjusting your filters or search criteria
              </p>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <QAReviewItemCard
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onToggleSelect={() => toggleItemSelection(item.id)}
                onReview={() => onReviewItem(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QA METRICS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

function QAMetricsSummary({ metrics }: { metrics: QAMetrics }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        label="Pending Review"
        value={metrics.totalPending}
        icon={Clock}
        color="blue"
      />
      <MetricCard
        label="In Review"
        value={metrics.totalInReview}
        icon={Eye}
        color="purple"
      />
      <MetricCard
        label="Compliance Rate"
        value={`${metrics.complianceRate}%`}
        icon={CheckCircle}
        color="green"
      />
      <MetricCard
        label="Avg Review Time"
        value={`${metrics.averageReviewTime}h`}
        icon={TrendingUp}
        color="indigo"
      />
    </div>
  );
}

function MetricCard({
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
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color as keyof typeof colorClasses])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QA REVIEW ITEM CARD
// ═══════════════════════════════════════════════════════════════════════════

interface QAReviewItemCardProps {
  item: QAReviewItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onReview: () => void;
}

function QAReviewItemCard({
  item,
  isSelected,
  onToggleSelect,
  onReview,
}: QAReviewItemCardProps) {
  const statusConfig = STATUS_CONFIG[item.status];
  const docTypeConfig = DOCUMENT_TYPE_CONFIG[item.documentType];
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const StatusIcon = statusConfig.icon;

  const hasIssues = item.flagCount > 0 || item.complianceScore !== undefined && item.complianceScore < 80;

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md cursor-pointer',
        isSelected && 'ring-2 ring-blue-500',
        hasIssues && 'border-l-4 border-l-amber-500'
      )}
      onClick={onReview}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Document Icon */}
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
          {docTypeConfig.icon}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{item.patientName}</h3>
                <Badge variant="outline" className={cn('text-xs', priorityConfig.bgClass, priorityConfig.textClass)}>
                  {priorityConfig.label}
                </Badge>
                {item.billingImpact && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                    Billing Impact
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{docTypeConfig.label}</span>
                <span>•</span>
                <span>ID: {item.admissionId}</span>
                <span>•</span>
                <span>Clinician: {item.clinicianName}</span>
                {item.visitDate && (
                  <>
                    <span>•</span>
                    <span>Visit: {new Date(item.visitDate).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          {/* Status and Metrics Row */}
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn('text-xs', statusConfig.bgClass, statusConfig.textClass)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{item.daysInQueue}d in queue</span>
            </div>

            {item.complianceScore !== undefined && (
              <div className="flex items-center gap-1 text-xs">
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
                  {item.complianceScore}% compliance
                </span>
              </div>
            )}

            {item.flagCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span className="text-amber-700 font-medium">{item.flagCount} flags</span>
              </div>
            )}

            {item.requiresSignature && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                Signature Required
              </Badge>
            )}

            {item.assignedReviewer && (
              <div className="flex items-center gap-1 text-xs text-gray-600 ml-auto">
                <UserCheck className="w-3 h-3" />
                <span>{item.assignedReviewer}</span>
              </div>
            )}
          </div>

          {/* Flags */}
          {item.flags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.flags.slice(0, 3).map((flag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded"
                >
                  {flag}
                </span>
              ))}
              {item.flags.length > 3 && (
                <span className="text-xs text-gray-600">+{item.flags.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockQAReviewItems(): QAReviewItem[] {
  return [
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
      status: 'in-review',
      priority: 'high',
      daysInQueue: 3,
      assignedReviewer: 'Jane Smith',
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
      returnReason: 'Multiple required sections incomplete. Please complete all sections before resubmission.',
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
      status: 'pending-review',
      priority: 'normal',
      daysInQueue: 1,
      complianceScore: 95,
      flagCount: 0,
      flags: [],
      requiresSignature: false,
      billingImpact: false,
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
      status: 'pending-review',
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
      visitDate: '2024-12-14',
      submittedDate: '2024-12-14T15:10:00Z',
      status: 'approved',
      priority: 'normal',
      daysInQueue: 1,
      assignedReviewer: 'Jane Smith',
      complianceScore: 98,
      flagCount: 0,
      flags: [],
      requiresSignature: false,
      billingImpact: false,
      reviewedBy: 'Jane Smith',
      reviewedDate: '2024-12-14T16:00:00Z',
    },
  ];
}

export function generateMockQAMetrics(): QAMetrics {
  return {
    totalPending: 23,
    totalInReview: 8,
    totalReturned: 5,
    totalApproved: 142,
    averageReviewTime: 2.5,
    complianceRate: 87,
    returnRate: 12,
    oldestItem: 7,
  };
}
