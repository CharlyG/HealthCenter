/**
 * Operational Orders Queue Component
 * 
 * Comprehensive queue interface for coordinators, QA staff, and administrators
 * to manage actionable order-related items. Supports fast triage and resolution
 * of order-related issues with priority management and quick actions.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  FileText,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Send,
  Edit,
  Eye,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileSignature,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type QueueCategory =
  | 'pending-completion'
  | 'pending-signature'
  | 'returned-for-correction'
  | '485-pending-signature'
  | 'overdue-signatures';

export type DocumentType =
  | 'physician-order'
  | 'verbal-order'
  | 'plan-of-care'
  | 'recertification'
  | 'discharge-certification';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface QueueItem {
  id: string;
  patientName: string;
  patientId: string;
  admissionStartDate: string;
  documentType: DocumentType;
  documentTitle: string;
  physician: {
    name: string;
    id: string;
  };
  daysPending: number;
  issueDescription: string;
  priority: PriorityLevel;
  category: QueueCategory;
  assignedTo?: {
    name: string;
    id: string;
  };
  admissionId: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const QUEUE_CATEGORIES: Record<
  QueueCategory,
  { label: string; description: string; icon: any; color: string }
> = {
  'pending-completion': {
    label: 'Pending Completion',
    description: 'Orders that need to be completed',
    icon: Edit,
    color: '#F59E0B',
  },
  'pending-signature': {
    label: 'Pending Signature',
    description: 'Orders awaiting physician signature',
    icon: FileSignature,
    color: '#3B82F6',
  },
  'returned-for-correction': {
    label: 'Returned for Correction',
    description: 'Orders returned by physician',
    icon: RotateCcw,
    color: '#DC2626',
  },
  '485-pending-signature': {
    label: '485 Pending Signature',
    description: 'Plan of Care / 485 documents awaiting signature',
    icon: FileText,
    color: '#8B5CF6',
  },
  'overdue-signatures': {
    label: 'Overdue Signatures',
    description: 'Signatures pending >3 days',
    icon: AlertTriangle,
    color: '#DC2626',
  },
};

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'physician-order': 'Physician Order',
  'verbal-order': 'Verbal Order',
  'plan-of-care': 'Plan of Care / 485',
  'recertification': 'Recertification',
  'discharge-certification': 'Discharge Certification',
};

const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  'critical': {
    label: 'Critical',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  'high': {
    label: 'High',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  'medium': {
    label: 'Medium',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  'low': {
    label: 'Low',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#6B7280',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

function generateMockQueueItems(): QueueItem[] {
  return [
    {
      id: 'Q-001',
      patientName: 'Margaret Johnson',
      patientId: 'PAT-001',
      admissionStartDate: '2024-12-01',
      documentType: 'verbal-order',
      documentTitle: 'Increase Lasix to 40mg PO daily',
      physician: { name: 'Dr. Sarah Mitchell', id: 'PHY-001' },
      daysPending: 5,
      issueDescription: 'Order date/time not specified, returned by physician',
      priority: 'critical',
      category: 'returned-for-correction',
      assignedTo: { name: 'Emily Chen', id: 'USER-001' },
      admissionId: 'ADM-12345',
    },
    {
      id: 'Q-002',
      patientName: 'Robert Williams',
      patientId: 'PAT-002',
      admissionStartDate: '2024-12-05',
      documentType: 'plan-of-care',
      documentTitle: 'Initial Plan of Care - 60 day certification',
      physician: { name: 'Dr. James Patterson', id: 'PHY-002' },
      daysPending: 2,
      issueDescription: 'Awaiting physician signature',
      priority: 'high',
      category: 'pending-signature',
      admissionId: 'ADM-12346',
    },
    {
      id: 'Q-003',
      patientName: 'Patricia Davis',
      patientId: 'PAT-003',
      admissionStartDate: '2024-11-20',
      documentType: 'recertification',
      documentTitle: 'Recertification - Period 2',
      physician: { name: 'Dr. Amanda Rodriguez', id: 'PHY-003' },
      daysPending: 7,
      issueDescription: 'Signature overdue >3 days, payer submission deadline approaching',
      priority: 'critical',
      category: 'overdue-signatures',
      assignedTo: { name: 'Michael Torres', id: 'USER-002' },
      admissionId: 'ADM-12347',
    },
    {
      id: 'Q-004',
      patientName: 'James Anderson',
      patientId: 'PAT-004',
      admissionStartDate: '2024-12-10',
      documentType: 'physician-order',
      documentTitle: 'Physical Therapy 3x per week',
      physician: { name: 'Dr. Sarah Mitchell', id: 'PHY-001' },
      daysPending: 1,
      issueDescription: 'Order created but not marked as complete',
      priority: 'medium',
      category: 'pending-completion',
      admissionId: 'ADM-12348',
    },
    {
      id: 'Q-005',
      patientName: 'Maria Garcia',
      patientId: 'PAT-005',
      admissionStartDate: '2024-12-08',
      documentType: 'plan-of-care',
      documentTitle: 'Plan of Care Amendment - Add OT',
      physician: { name: 'Dr. James Patterson', id: 'PHY-002' },
      daysPending: 3,
      issueDescription: 'Awaiting physician signature',
      priority: 'high',
      category: '485-pending-signature',
      admissionId: 'ADM-12349',
    },
    {
      id: 'Q-006',
      patientName: 'Linda Martinez',
      patientId: 'PAT-006',
      admissionStartDate: '2024-12-12',
      documentType: 'verbal-order',
      documentTitle: 'Hold metoprolol for SBP < 100',
      physician: { name: 'Dr. Amanda Rodriguez', id: 'PHY-003' },
      daysPending: 4,
      issueDescription: 'Signature overdue, verbal order must be signed within 3 days',
      priority: 'critical',
      category: 'overdue-signatures',
      assignedTo: { name: 'Emily Chen', id: 'USER-001' },
      admissionId: 'ADM-12350',
    },
    {
      id: 'Q-007',
      patientName: 'John Thompson',
      patientId: 'PAT-007',
      admissionStartDate: '2024-12-03',
      documentType: 'discharge-certification',
      documentTitle: 'Discharge Certification',
      physician: { name: 'Dr. Sarah Mitchell', id: 'PHY-001' },
      daysPending: 2,
      issueDescription: 'Clinical goals not measurable, returned by physician',
      priority: 'high',
      category: 'returned-for-correction',
      assignedTo: { name: 'Michael Torres', id: 'USER-002' },
      admissionId: 'ADM-12351',
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OperationalOrdersQueueProps {
  onViewItem?: (itemId: string) => void;
  onEditItem?: (itemId: string) => void;
  onAssignItem?: (itemId: string, userId: string) => void;
  onResolveItem?: (itemId: string) => void;
}

export default function OperationalOrdersQueue({
  onViewItem,
  onEditItem,
  onAssignItem,
  onResolveItem,
}: OperationalOrdersQueueProps) {
  const [items] = useState<QueueItem[]>(generateMockQueueItems());
  const [activeCategory, setActiveCategory] = useState<QueueCategory>('overdue-signatures');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | 'all'>('all');
  const [physicianFilter, setPhysicianFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'daysPending' | 'priority' | 'patient'>('daysPending');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter items by category
  const categoryItems = useMemo(() => {
    let filtered = items.filter(item => item.category === activeCategory);

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.patientName.toLowerCase().includes(term) ||
          item.documentTitle.toLowerCase().includes(term) ||
          item.issueDescription.toLowerCase().includes(term) ||
          item.id.toLowerCase().includes(term)
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    // Physician filter
    if (physicianFilter !== 'all') {
      filtered = filtered.filter(item => item.physician.id === physicianFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'daysPending') {
        comparison = a.daysPending - b.daysPending;
      } else if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'patient') {
        comparison = a.patientName.localeCompare(b.patientName);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, activeCategory, searchTerm, priorityFilter, physicianFilter, sortBy, sortDirection]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      pendingCompletion: items.filter(i => i.category === 'pending-completion').length,
      pendingSignature: items.filter(i => i.category === 'pending-signature').length,
      returnedForCorrection: items.filter(i => i.category === 'returned-for-correction').length,
      pending485: items.filter(i => i.category === '485-pending-signature').length,
      overdue: items.filter(i => i.category === 'overdue-signatures').length,
      critical: items.filter(i => i.priority === 'critical').length,
      avgDaysPending: Math.round(
        items.reduce((acc, i) => acc + i.daysPending, 0) / items.length || 0
      ),
    };
  }, [items]);

  // Get unique physicians for filter
  const physicians = useMemo(() => {
    const unique = new Map<string, string>();
    items.forEach(item => {
      unique.set(item.physician.id, item.physician.name);
    });
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  const toggleSort = (field: 'daysPending' | 'priority' | 'patient') => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operational Orders Queue</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage actionable order-related items for fast triage and resolution
          </p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          {stats.critical} Critical Items
        </Badge>
      </div>

      {/* Statistics Dashboard */}
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-4">
          <StatCard
            label="Pending Completion"
            value={stats.pendingCompletion}
            icon={Edit}
            alert={stats.pendingCompletion > 0}
          />
          <StatCard
            label="Pending Signature"
            value={stats.pendingSignature}
            icon={FileSignature}
            alert={stats.pendingSignature > 0}
          />
          <StatCard
            label="Returned"
            value={stats.returnedForCorrection}
            icon={RotateCcw}
            alert={stats.returnedForCorrection > 0}
          />
          <StatCard
            label="485 Pending"
            value={stats.pending485}
            icon={FileText}
            alert={stats.pending485 > 0}
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            alert={stats.overdue > 0}
          />
          <StatCard
            label="Critical Priority"
            value={stats.critical}
            icon={AlertCircle}
            alert={stats.critical > 0}
          />
          <StatCard
            label="Avg Days Pending"
            value={`${stats.avgDaysPending}d`}
            icon={TrendingUp}
          />
        </div>
      </Card>

      {/* Queue Category Tabs */}
      <Card>
        <div className="border-b">
          <div className="flex items-center overflow-x-auto">
            {(Object.keys(QUEUE_CATEGORIES) as QueueCategory[]).map(category => {
              const config = QUEUE_CATEGORIES[category];
              const count = items.filter(i => i.category === category).length;
              const Icon = config.icon;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap',
                    activeCategory === category
                      ? 'border-blue-600 text-blue-900 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{config.label}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'ml-1',
                      activeCategory === category
                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search patient, document, or issue..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as PriorityLevel | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Physician Filter */}
            <select
              value={physicianFilter}
              onChange={e => setPhysicianFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Physicians</option>
              {physicians.map(physician => (
                <option key={physician.id} value={physician.id}>
                  {physician.name}
                </option>
              ))}
            </select>

            {/* Result Count */}
            <div className="flex items-center justify-end text-sm text-gray-600">
              {categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort('patient')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase hover:text-gray-900"
                  >
                    Patient
                    {sortBy === 'patient' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Admission Start
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Document Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Physician
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort('daysPending')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase hover:text-gray-900"
                  >
                    Days Pending
                    {sortBy === 'daysPending' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Issue Description
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => toggleSort('priority')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase hover:text-gray-900"
                  >
                    Priority
                    {sortBy === 'priority' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categoryItems.map(item => (
                <QueueItemRow
                  key={item.id}
                  item={item}
                  onView={() => onViewItem?.(item.id)}
                  onEdit={() => onEditItem?.(item.id)}
                  onResolve={() => onResolveItem?.(item.id)}
                />
              ))}
              {categoryItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600">No items found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try adjusting your filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
  value: number | string;
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
// QUEUE ITEM ROW
// ═══════════════════════════════════════════════════════════════════════════

interface QueueItemRowProps {
  item: QueueItem;
  onView: () => void;
  onEdit: () => void;
  onResolve: () => void;
}

function QueueItemRow({ item, onView, onEdit, onResolve }: QueueItemRowProps) {
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const isCritical = item.priority === 'critical';
  const isOverdue = item.daysPending > 3;

  return (
    <tr
      className={cn(
        'hover:bg-gray-50 transition-colors',
        isCritical && 'bg-red-50/50 border-l-4 border-l-red-500'
      )}
    >
      {/* Patient Name */}
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-gray-900">{item.patientName}</p>
          <p className="text-xs text-gray-600">{item.patientId}</p>
        </div>
      </td>

      {/* Admission Start Date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {new Date(item.admissionStartDate).toLocaleDateString()}
        </div>
      </td>

      {/* Document Type */}
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {DOCUMENT_TYPE_LABELS[item.documentType]}
          </p>
          <p className="text-xs text-gray-600 truncate max-w-[200px]" title={item.documentTitle}>
            {item.documentTitle}
          </p>
        </div>
      </td>

      {/* Physician */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-900">{item.physician.name}</span>
        </div>
      </td>

      {/* Days Pending */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span
            className={cn(
              'text-sm font-bold',
              isOverdue ? 'text-red-600' : 'text-gray-900'
            )}
          >
            {item.daysPending} days
          </span>
        </div>
      </td>

      {/* Issue Description */}
      <td className="px-4 py-3">
        <p className="text-sm text-gray-700 max-w-[250px]" title={item.issueDescription}>
          {item.issueDescription}
        </p>
        {item.assignedTo && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
            <UserCheck className="w-3 h-3" />
            Assigned to {item.assignedTo.name}
          </div>
        )}
      </td>

      {/* Priority */}
      <td className="px-4 py-3">
        <Badge
          style={{
            backgroundColor: priorityConfig.bgColor,
            color: priorityConfig.color,
            borderColor: priorityConfig.borderColor,
          }}
          className="font-semibold"
        >
          {priorityConfig.label}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button variant="default" size="sm" onClick={onResolve}>
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Resolve
          </Button>
        </div>
      </td>
    </tr>
  );
}
