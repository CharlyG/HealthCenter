/**
 * Recertification Workspace Component
 * 
 * Comprehensive workspace for managing home health recertification preparation.
 * Makes recertification clear and proactive rather than reactive through
 * readiness tracking, deadline monitoring, and guided workflows.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  User,
  Search,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FileCheck,
  Edit,
  Send,
  Eye,
  TrendingUp,
  Activity,
  FileSignature,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type RecertificationRequirement =
  | 'assessment'
  | 'plan-of-care'
  | 'orders-review'
  | 'physician-orders'
  | 'physician-signature';

export type RequirementStatus = 'complete' | 'in-progress' | 'not-started' | 'overdue';

export interface RecertificationItem {
  id: string;
  patient: {
    name: string;
    id: string;
  };
  admission: {
    id: string;
    startDate: string;
  };
  currentCertificationPeriod: {
    number: number;
    startDate: string;
    endDate: string;
  };
  daysUntilExpiration: number;
  recertificationDueDate: string;
  requirements: {
    [key in RecertificationRequirement]: {
      status: RequirementStatus;
      completedDate?: string;
      assignedTo?: string;
      notes?: string;
    };
  };
  overallReadiness: number; // 0-100
  assignedCoordinator?: {
    name: string;
    id: string;
  };
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const REQUIREMENT_CONFIG: Record<
  RecertificationRequirement,
  { label: string; description: string; icon: any; order: number }
> = {
  'assessment': {
    label: 'Recertification Assessment',
    description: 'Complete updated OASIS or clinical assessment',
    icon: ClipboardList,
    order: 1,
  },
  'plan-of-care': {
    label: 'Updated Plan of Care',
    description: 'Update POC / 485 with current goals and interventions',
    icon: FileText,
    order: 2,
  },
  'orders-review': {
    label: 'Orders Review',
    description: 'Review and update all physician orders',
    icon: FileCheck,
    order: 3,
  },
  'physician-orders': {
    label: 'Physician Orders Updated',
    description: 'Obtain updated orders from physician',
    icon: Stethoscope,
    order: 4,
  },
  'physician-signature': {
    label: 'Physician Signature',
    description: 'Obtain physician signature on recertification documents',
    icon: FileSignature,
    order: 5,
  },
};

const STATUS_CONFIG: Record<
  RequirementStatus,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  'complete': {
    label: 'Complete',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: CheckCircle,
  },
  'in-progress': {
    label: 'In Progress',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    icon: Activity,
  },
  'not-started': {
    label: 'Not Started',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: Clock,
  },
  'overdue': {
    label: 'Overdue',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: AlertTriangle,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

function generateMockRecertificationItems(): RecertificationItem[] {
  const now = new Date();

  return [
    {
      id: 'RECERT-001',
      patient: { name: 'Margaret Johnson', id: 'PAT-001' },
      admission: { id: 'ADM-12345', startDate: '2024-10-15' },
      currentCertificationPeriod: {
        number: 1,
        startDate: '2024-10-15',
        endDate: '2024-12-13',
      },
      daysUntilExpiration: 3,
      recertificationDueDate: '2024-12-13',
      requirements: {
        'assessment': { status: 'complete', completedDate: '2024-12-01', assignedTo: 'Emily Chen' },
        'plan-of-care': { status: 'complete', completedDate: '2024-12-03', assignedTo: 'Emily Chen' },
        'orders-review': { status: 'complete', completedDate: '2024-12-05', assignedTo: 'Emily Chen' },
        'physician-orders': { status: 'in-progress', assignedTo: 'Dr. Mitchell' },
        'physician-signature': { status: 'not-started' },
      },
      overallReadiness: 60,
      assignedCoordinator: { name: 'Emily Chen', id: 'USER-001' },
      priority: 'critical',
    },
    {
      id: 'RECERT-002',
      patient: { name: 'Robert Williams', id: 'PAT-002' },
      admission: { id: 'ADM-12346', startDate: '2024-11-01' },
      currentCertificationPeriod: {
        number: 1,
        startDate: '2024-11-01',
        endDate: '2024-12-30',
      },
      daysUntilExpiration: 20,
      recertificationDueDate: '2024-12-30',
      requirements: {
        'assessment': { status: 'complete', completedDate: '2024-12-05', assignedTo: 'Michael Torres' },
        'plan-of-care': { status: 'in-progress', assignedTo: 'Michael Torres' },
        'orders-review': { status: 'not-started' },
        'physician-orders': { status: 'not-started' },
        'physician-signature': { status: 'not-started' },
      },
      overallReadiness: 20,
      assignedCoordinator: { name: 'Michael Torres', id: 'USER-002' },
      priority: 'high',
    },
    {
      id: 'RECERT-003',
      patient: { name: 'Patricia Davis', id: 'PAT-003' },
      admission: { id: 'ADM-12347', startDate: '2024-09-20' },
      currentCertificationPeriod: {
        number: 2,
        startDate: '2024-11-19',
        endDate: '2025-01-17',
      },
      daysUntilExpiration: 38,
      recertificationDueDate: '2025-01-17',
      requirements: {
        'assessment': { status: 'not-started' },
        'plan-of-care': { status: 'not-started' },
        'orders-review': { status: 'not-started' },
        'physician-orders': { status: 'not-started' },
        'physician-signature': { status: 'not-started' },
      },
      overallReadiness: 0,
      assignedCoordinator: { name: 'Emily Chen', id: 'USER-001' },
      priority: 'medium',
    },
    {
      id: 'RECERT-004',
      patient: { name: 'James Anderson', id: 'PAT-004' },
      admission: { id: 'ADM-12348', startDate: '2024-10-01' },
      currentCertificationPeriod: {
        number: 1,
        startDate: '2024-10-01',
        endDate: '2024-11-29',
      },
      daysUntilExpiration: -11,
      recertificationDueDate: '2024-11-29',
      requirements: {
        'assessment': { status: 'overdue', assignedTo: 'Sarah Johnson' },
        'plan-of-care': { status: 'overdue' },
        'orders-review': { status: 'overdue' },
        'physician-orders': { status: 'not-started' },
        'physician-signature': { status: 'not-started' },
      },
      overallReadiness: 0,
      assignedCoordinator: { name: 'Sarah Johnson', id: 'USER-003' },
      priority: 'critical',
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationWorkspaceProps {
  onViewAssessment?: (itemId: string) => void;
  onEditPlanOfCare?: (itemId: string) => void;
  onReviewOrders?: (itemId: string) => void;
  onSendForSignature?: (itemId: string) => void;
}

export default function RecertificationWorkspace({
  onViewAssessment,
  onEditPlanOfCare,
  onReviewOrders,
  onSendForSignature,
}: RecertificationWorkspaceProps) {
  const [items] = useState<RecertificationItem[]>(generateMockRecertificationItems());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'upcoming'>('all');

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.patient.name.toLowerCase().includes(term) ||
          item.patient.id.toLowerCase().includes(term) ||
          item.admission.id.toLowerCase().includes(term)
      );
    }

    // Urgency filter
    if (urgencyFilter === 'critical') {
      filtered = filtered.filter(item => item.daysUntilExpiration <= 7);
    } else if (urgencyFilter === 'upcoming') {
      filtered = filtered.filter(
        item => item.daysUntilExpiration > 7 && item.daysUntilExpiration <= 30
      );
    }

    // Sort by days until expiration (ascending - most urgent first)
    return filtered.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration);
  }, [items, searchTerm, urgencyFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: items.length,
      dueSoon: items.filter(i => i.daysUntilExpiration <= 14 && i.daysUntilExpiration > 0)
        .length,
      overdue: items.filter(i => i.daysUntilExpiration < 0).length,
      avgReadiness: Math.round(
        items.reduce((acc, i) => acc + i.overallReadiness, 0) / items.length || 0
      ),
      critical: items.filter(i => i.daysUntilExpiration <= 7).length,
    };
  }, [items]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItemId(prev => (prev === itemId ? null : itemId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recertification Workspace</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage home health recertification preparation proactively
          </p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {stats.critical} Critical
        </Badge>
      </div>

      {/* Statistics Dashboard */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-4">
          <StatCard label="Total Active" value={stats.total} icon={Activity} />
          <StatCard
            label="Due Soon (≤14d)"
            value={stats.dueSoon}
            icon={Clock}
            alert={stats.dueSoon > 0}
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            alert={stats.overdue > 0}
          />
          <StatCard
            label="Critical (≤7d)"
            value={stats.critical}
            icon={AlertCircle}
            alert={stats.critical > 0}
          />
          <StatCard label="Avg Readiness" value={`${stats.avgReadiness}%`} icon={TrendingUp} />
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by patient name, patient ID, or admission ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={e =>
              setUrgencyFilter(e.target.value as 'all' | 'critical' | 'upcoming')
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Certifications</option>
            <option value="critical">Critical (≤7 days)</option>
            <option value="upcoming">Upcoming (8-30 days)</option>
          </select>
        </div>
      </Card>

      {/* Recertification Items */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Patient
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Cert Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Days Until Expiration
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Readiness
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Coordinator
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map(item => (
                <RecertificationItemRow
                  key={item.id}
                  item={item}
                  isExpanded={expandedItemId === item.id}
                  onToggleExpand={() => toggleExpanded(item.id)}
                  onViewAssessment={() => onViewAssessment?.(item.id)}
                  onEditPlanOfCare={() => onEditPlanOfCare?.(item.id)}
                  onReviewOrders={() => onReviewOrders?.(item.id)}
                  onSendForSignature={() => onSendForSignature?.(item.id)}
                />
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600">No recertifications found</p>
                    <p className="text-xs text-gray-500 mt-1">Try adjusting your filters</p>
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
// RECERTIFICATION ITEM ROW
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationItemRowProps {
  item: RecertificationItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewAssessment: () => void;
  onEditPlanOfCare: () => void;
  onReviewOrders: () => void;
  onSendForSignature: () => void;
}

function RecertificationItemRow({
  item,
  isExpanded,
  onToggleExpand,
  onViewAssessment,
  onEditPlanOfCare,
  onReviewOrders,
  onSendForSignature,
}: RecertificationItemRowProps) {
  const isCritical = item.daysUntilExpiration <= 7;
  const isOverdue = item.daysUntilExpiration < 0;

  const getUrgencyColor = () => {
    if (isOverdue) return 'text-red-600';
    if (isCritical) return 'text-red-600';
    if (item.daysUntilExpiration <= 14) return 'text-amber-600';
    return 'text-gray-900';
  };

  return (
    <>
      <tr
        className={cn(
          'hover:bg-gray-50 transition-colors',
          isCritical && 'bg-red-50/50 border-l-4 border-l-red-500'
        )}
      >
        {/* Patient */}
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-900">{item.patient.name}</p>
            <p className="text-xs text-gray-600">{item.patient.id}</p>
          </div>
        </td>

        {/* Cert Period */}
        <td className="px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Period {item.currentCertificationPeriod.number}</p>
            <p className="text-xs text-gray-600">
              {new Date(item.currentCertificationPeriod.startDate).toLocaleDateString()} -{' '}
              {new Date(item.currentCertificationPeriod.endDate).toLocaleDateString()}
            </p>
          </div>
        </td>

        {/* Days Until Expiration */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className={cn('text-sm font-bold', getUrgencyColor())}>
              {isOverdue
                ? `${Math.abs(item.daysUntilExpiration)} days overdue`
                : `${item.daysUntilExpiration} days`}
            </span>
          </div>
        </td>

        {/* Readiness */}
        <td className="px-4 py-3">
          <ReadinessIndicator percentage={item.overallReadiness} />
        </td>

        {/* Coordinator */}
        <td className="px-4 py-3">
          {item.assignedCoordinator && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-900">{item.assignedCoordinator.name}</span>
            </div>
          )}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          {isOverdue ? (
            <Badge className="bg-red-100 text-red-700 border-red-300">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Overdue
            </Badge>
          ) : isCritical ? (
            <Badge className="bg-red-100 text-red-700 border-red-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Critical
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Clock className="w-3 h-3 mr-1" />
              In Progress
            </Badge>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mr-1" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        </td>
      </tr>

      {/* Expanded Readiness Panel */}
      {isExpanded && (
        <tr>
          <td colSpan={7} className="px-4 py-6 bg-gray-50">
            <RecertificationReadinessPanel
              item={item}
              onViewAssessment={onViewAssessment}
              onEditPlanOfCare={onEditPlanOfCare}
              onReviewOrders={onReviewOrders}
              onSendForSignature={onSendForSignature}
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// READINESS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

function ReadinessIndicator({ percentage }: { percentage: number }) {
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-600';
    if (percentage >= 50) return 'bg-blue-600';
    if (percentage >= 20) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECERTIFICATION READINESS PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationReadinessPanelProps {
  item: RecertificationItem;
  onViewAssessment: () => void;
  onEditPlanOfCare: () => void;
  onReviewOrders: () => void;
  onSendForSignature: () => void;
}

function RecertificationReadinessPanel({
  item,
  onViewAssessment,
  onEditPlanOfCare,
  onReviewOrders,
  onSendForSignature,
}: RecertificationReadinessPanelProps) {
  // Sort requirements by order
  const sortedRequirements = (
    Object.entries(item.requirements) as [RecertificationRequirement, any][]
  ).sort(([keyA], [keyB]) => {
    return REQUIREMENT_CONFIG[keyA].order - REQUIREMENT_CONFIG[keyB].order;
  });

  const completedCount = sortedRequirements.filter(
    ([_, req]) => req.status === 'complete'
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Recertification Readiness Checklist
          </h3>
          <Badge
            variant="outline"
            className={cn(
              completedCount === sortedRequirements.length
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-amber-50 text-amber-700 border-amber-300'
            )}
          >
            {completedCount} of {sortedRequirements.length} Complete
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          Complete all requirements before the certification period expires on{' '}
          <span className="font-semibold">
            {new Date(item.currentCertificationPeriod.endDate).toLocaleDateString()}
          </span>
        </p>
      </div>

      <div className="space-y-3">
        {sortedRequirements.map(([requirementKey, requirement]) => {
          const config = REQUIREMENT_CONFIG[requirementKey];
          const statusConfig = STATUS_CONFIG[requirement.status];
          const StatusIcon = statusConfig.icon;
          const RequirementIcon = config.icon;

          return (
            <Card
              key={requirementKey}
              className={cn(
                'p-4 transition-all',
                requirement.status === 'complete' && 'bg-green-50 border-green-200',
                requirement.status === 'overdue' && 'bg-red-50 border-red-300'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: statusConfig.bgColor,
                  }}
                >
                  <RequirementIcon className="w-5 h-5" style={{ color: statusConfig.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{config.label}</h4>
                      <p className="text-sm text-gray-600">{config.description}</p>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                      }}
                      className="ml-3"
                    >
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Additional Info */}
                  {requirement.completedDate && (
                    <p className="text-xs text-gray-600 mb-2">
                      Completed on {new Date(requirement.completedDate).toLocaleDateString()}
                    </p>
                  )}
                  {requirement.assignedTo && requirement.status !== 'complete' && (
                    <p className="text-xs text-gray-600 mb-2">
                      Assigned to: {requirement.assignedTo}
                    </p>
                  )}

                  {/* Action Button */}
                  {requirement.status !== 'complete' && (
                    <div className="mt-3">
                      {requirementKey === 'assessment' && (
                        <Button size="sm" onClick={onViewAssessment}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Complete Assessment
                        </Button>
                      )}
                      {requirementKey === 'plan-of-care' && (
                        <Button size="sm" onClick={onEditPlanOfCare}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Update Plan of Care
                        </Button>
                      )}
                      {requirementKey === 'orders-review' && (
                        <Button size="sm" onClick={onReviewOrders}>
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Review Orders
                        </Button>
                      )}
                      {requirementKey === 'physician-orders' && (
                        <Button size="sm" onClick={onReviewOrders}>
                          <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
                          Request Updated Orders
                        </Button>
                      )}
                      {requirementKey === 'physician-signature' && (
                        <Button size="sm" onClick={onSendForSignature}>
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          Send for Signature
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-blue-900">Overall Progress</h4>
          <span className="text-lg font-bold text-blue-900">{item.overallReadiness}%</span>
        </div>
        <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${item.overallReadiness}%` }}
          />
        </div>
        {item.overallReadiness === 100 ? (
          <p className="text-sm text-blue-700 mt-2">
            ✓ All requirements complete! Ready to send for physician signature.
          </p>
        ) : (
          <p className="text-sm text-blue-700 mt-2">
            {sortedRequirements.length - completedCount} requirement(s) remaining
          </p>
        )}
      </div>
    </div>
  );
}
