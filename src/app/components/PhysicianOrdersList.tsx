/**
 * Physician Orders List View Component
 * 
 * Dedicated list view for physician orders within a patient admission.
 * Displays comprehensive order information with clear status indicators
 * and contextual quick actions.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Eye,
  CheckCircle,
  Send,
  RotateCcw,
  History,
  AlertCircle,
  CheckSquare,
  XCircle,
  Edit,
  Plus,
  Download,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type PhysicianOrderStatus =
  | 'draft'
  | 'pending-review'
  | 'pending-signature'
  | 'signed'
  | 'returned-for-correction'
  | 'expired';

export type SignatureStatus = 'not-signed' | 'clinician-signed' | 'physician-signed' | 'fully-signed';

export interface PhysicianOrder {
  id: string;
  orderTitle: string;
  orderSummary: string;
  orderDate: string;
  effectiveDate: string;
  orderingPhysician: {
    id: string;
    name: string;
    credentials?: string;
  };
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  status: PhysicianOrderStatus;
  clinicianSignatureStatus: SignatureStatus;
  physicianSignatureStatus: SignatureStatus;
  expirationDate?: string;
  returnReason?: string;
  lastModified: string;
  needsAttention: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<
  PhysicianOrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    priority: number;
  }
> = {
  'draft': {
    label: 'Draft',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    textColor: '#374151',
    priority: 3,
  },
  'pending-review': {
    label: 'Pending Review',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    priority: 1,
  },
  'pending-signature': {
    label: 'Pending Signature',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    textColor: '#1E40AF',
    priority: 2,
  },
  'signed': {
    label: 'Signed',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    priority: 5,
  },
  'returned-for-correction': {
    label: 'Returned for Correction',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: '#991B1B',
    priority: 1,
  },
  'expired': {
    label: 'Expired',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    textColor: '#374151',
    priority: 4,
  },
};

const SIGNATURE_STATUS_CONFIG: Record<
  SignatureStatus,
  {
    label: string;
    icon: any;
    color: string;
  }
> = {
  'not-signed': {
    label: 'Not Signed',
    icon: XCircle,
    color: '#6B7280',
  },
  'clinician-signed': {
    label: 'Clinician Signed',
    icon: CheckSquare,
    color: '#3B82F6',
  },
  'physician-signed': {
    label: 'Physician Signed',
    icon: CheckSquare,
    color: '#3B82F6',
  },
  'fully-signed': {
    label: 'Fully Signed',
    icon: CheckCircle,
    color: '#10B981',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

function generateMockOrders(): PhysicianOrder[] {
  return [
    {
      id: 'ORD-001',
      orderTitle: 'Increase Lasix Dosage',
      orderSummary: 'Increase Lasix to 40mg PO daily for CHF management',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-001',
        name: 'Dr. Sarah Mitchell',
        credentials: 'MD',
      },
      createdBy: {
        id: 'USER-001',
        name: 'Emily Chen',
        role: 'RN',
      },
      status: 'pending-signature',
      clinicianSignatureStatus: 'clinician-signed',
      physicianSignatureStatus: 'not-signed',
      lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      needsAttention: true,
    },
    {
      id: 'ORD-002',
      orderTitle: 'Wound Care Protocol',
      orderSummary: 'Apply silver dressing to sacral wound daily, assess for signs of infection',
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-001',
        name: 'Dr. Sarah Mitchell',
        credentials: 'MD',
      },
      createdBy: {
        id: 'USER-002',
        name: 'Michael Torres',
        role: 'RN',
      },
      status: 'signed',
      clinicianSignatureStatus: 'fully-signed',
      physicianSignatureStatus: 'fully-signed',
      lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      needsAttention: false,
    },
    {
      id: 'ORD-003',
      orderTitle: 'Medication Reconciliation',
      orderSummary: 'Review and reconcile all medications with hospital discharge list',
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-002',
        name: 'Dr. James Patterson',
        credentials: 'MD',
      },
      createdBy: {
        id: 'USER-001',
        name: 'Emily Chen',
        role: 'RN',
      },
      status: 'pending-review',
      clinicianSignatureStatus: 'not-signed',
      physicianSignatureStatus: 'not-signed',
      lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      needsAttention: true,
    },
    {
      id: 'ORD-004',
      orderTitle: 'Blood Glucose Monitoring',
      orderSummary: 'Check blood glucose QID before meals and bedtime',
      orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-001',
        name: 'Dr. Sarah Mitchell',
        credentials: 'MD',
      },
      createdBy: {
        id: 'USER-003',
        name: 'Lisa Wang',
        role: 'RN',
      },
      status: 'returned-for-correction',
      clinicianSignatureStatus: 'not-signed',
      physicianSignatureStatus: 'not-signed',
      returnReason: 'Please specify insulin sliding scale parameters',
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      needsAttention: true,
    },
    {
      id: 'ORD-005',
      orderTitle: 'Physical Therapy Evaluation',
      orderSummary: 'PT to evaluate and treat 3x per week for gait training and strengthening',
      orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-002',
        name: 'Dr. James Patterson',
        credentials: 'MD',
      },
      createdBy: {
        id: 'USER-001',
        name: 'Emily Chen',
        role: 'RN',
      },
      status: 'signed',
      clinicianSignatureStatus: 'fully-signed',
      physicianSignatureStatus: 'fully-signed',
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      needsAttention: false,
    },
    {
      id: 'ORD-006',
      orderTitle: 'Vital Signs Monitoring',
      orderSummary: 'Monitor vital signs daily and report abnormal findings immediately',
      orderDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(Date.now()).toISOString(),
      orderingPhysician: {
        id: 'PHY-001',
        name: 'Dr. Sarah Mitchell',
        credentials: 'MD',
      },
      createdBy: {
        id: 'USER-002',
        name: 'Michael Torres',
        role: 'RN',
      },
      status: 'draft',
      clinicianSignatureStatus: 'not-signed',
      physicianSignatureStatus: 'not-signed',
      lastModified: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      needsAttention: false,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PhysicianOrdersListProps {
  admissionId: string;
  patientName?: string;
  onOrderOpen?: (orderId: string) => void;
  onOrderReview?: (orderId: string) => void;
  onSendForSignature?: (orderId: string) => void;
  onMarkSigned?: (orderId: string) => void;
  onReturnForCorrection?: (orderId: string) => void;
  onViewHistory?: (orderId: string) => void;
  onCreateOrder?: () => void;
}

export default function PhysicianOrdersList({
  admissionId,
  patientName = 'Margaret Johnson',
  onOrderOpen,
  onOrderReview,
  onSendForSignature,
  onMarkSigned,
  onReturnForCorrection,
  onViewHistory,
  onCreateOrder,
}: PhysicianOrdersListProps) {
  const [orders] = useState<PhysicianOrder[]>(generateMockOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PhysicianOrderStatus | 'all'>('all');
  const [showOnlyNeedsAttention, setShowOnlyNeedsAttention] = useState(false);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Needs attention filter
    if (showOnlyNeedsAttention) {
      filtered = filtered.filter(order => order.needsAttention);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.orderTitle.toLowerCase().includes(term) ||
          order.orderSummary.toLowerCase().includes(term) ||
          order.id.toLowerCase().includes(term) ||
          order.orderingPhysician.name.toLowerCase().includes(term)
      );
    }

    // Sort by priority (needs attention first, then by priority level, then by date)
    return filtered.sort((a, b) => {
      if (a.needsAttention && !b.needsAttention) return -1;
      if (!a.needsAttention && b.needsAttention) return 1;

      const priorityDiff = STATUS_CONFIG[a.status].priority - STATUS_CONFIG[b.status].priority;
      if (priorityDiff !== 0) return priorityDiff;

      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    });
  }, [orders, statusFilter, showOnlyNeedsAttention, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: orders.length,
      needsAttention: orders.filter(o => o.needsAttention).length,
      pendingSignature: orders.filter(o => o.status === 'pending-signature').length,
      pendingReview: orders.filter(o => o.status === 'pending-review').length,
      returned: orders.filter(o => o.status === 'returned-for-correction').length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Physician Orders</h2>
          <p className="text-sm text-gray-600 mt-1">
            {patientName} • Admission #{admissionId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={onCreateOrder}>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Statistics Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-4">
          <StatItem label="Total Orders" value={stats.total} />
          <StatItem
            label="Needs Attention"
            value={stats.needsAttention}
            alert={stats.needsAttention > 0}
          />
          <StatItem
            label="Pending Signature"
            value={stats.pendingSignature}
            alert={stats.pendingSignature > 0}
          />
          <StatItem
            label="Pending Review"
            value={stats.pendingReview}
            alert={stats.pendingReview > 0}
          />
          <StatItem
            label="Returned"
            value={stats.returned}
            alert={stats.returned > 0}
          />
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders by title, summary, ID, or physician..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as PhysicianOrderStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_CONFIG) as PhysicianOrderStatus[]).map(status => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>

          {/* Needs Attention Toggle */}
          <Button
            variant={showOnlyNeedsAttention ? 'default' : 'outline'}
            onClick={() => setShowOnlyNeedsAttention(!showOnlyNeedsAttention)}
            size="sm"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Needs Attention
            {stats.needsAttention > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.needsAttention}
              </Badge>
            )}
          </Button>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h4 className="font-semibold text-gray-900 mb-1">No Orders Found</h4>
              <p className="text-sm text-gray-600">
                No orders match your current filters
              </p>
            </div>
          </Card>
        ) : (
          filteredOrders.map(order => (
            <OrderListItem
              key={order.id}
              order={order}
              onOpen={() => onOrderOpen?.(order.id)}
              onReview={() => onOrderReview?.(order.id)}
              onSendForSignature={() => onSendForSignature?.(order.id)}
              onMarkSigned={() => onMarkSigned?.(order.id)}
              onReturnForCorrection={() => onReturnForCorrection?.(order.id)}
              onViewHistory={() => onViewHistory?.(order.id)}
            />
          ))
        )}
      </div>

      {/* Results Summary */}
      <div className="text-center text-sm text-gray-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface StatItemProps {
  label: string;
  value: number;
  alert?: boolean;
}

function StatItem({ label, value, alert }: StatItemProps) {
  return (
    <div className={cn('text-center p-3 rounded-lg', alert ? 'bg-amber-50' : 'bg-gray-50')}>
      <p className="text-2xl font-bold" style={{ color: alert ? '#D97706' : '#111827' }}>
        {value}
      </p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER LIST ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface OrderListItemProps {
  order: PhysicianOrder;
  onOpen?: () => void;
  onReview?: () => void;
  onSendForSignature?: () => void;
  onMarkSigned?: () => void;
  onReturnForCorrection?: () => void;
  onViewHistory?: () => void;
}

function OrderListItem({
  order,
  onOpen,
  onReview,
  onSendForSignature,
  onMarkSigned,
  onReturnForCorrection,
  onViewHistory,
}: OrderListItemProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const clinicianSigConfig = SIGNATURE_STATUS_CONFIG[order.clinicianSignatureStatus];
  const physicianSigConfig = SIGNATURE_STATUS_CONFIG[order.physicianSignatureStatus];

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md',
        order.needsAttention && 'border-2 border-amber-300 bg-amber-50/30'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Left: Priority Indicator */}
        {order.needsAttention && (
          <div className="flex-shrink-0">
            <div className="w-2 h-full bg-amber-500 rounded-full" />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Title and Status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {order.orderTitle}
                </h4>
                <Badge
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    color: statusConfig.textColor,
                  }}
                >
                  {statusConfig.label}
                </Badge>
                {order.needsAttention && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Needs Attention
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{order.orderSummary}</p>
              <p className="text-xs text-gray-500 mt-1">Order #{order.id}</p>
            </div>
          </div>

          {/* Return Reason Alert */}
          {order.returnReason && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">Returned for Correction</p>
                  <p className="text-sm text-red-700 mt-1">{order.returnReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
            {/* Order Date */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Order Date
              </p>
              <p className="font-medium text-gray-900">
                {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>

            {/* Effective Date */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Effective Date
              </p>
              <p className="font-medium text-gray-900">
                {new Date(order.effectiveDate).toLocaleDateString()}
              </p>
            </div>

            {/* Ordering Physician */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Ordering Physician
              </p>
              <p className="font-medium text-gray-900">
                {order.orderingPhysician.name}
                {order.orderingPhysician.credentials && `, ${order.orderingPhysician.credentials}`}
              </p>
            </div>

            {/* Created By */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Created By
              </p>
              <p className="font-medium text-gray-900">
                {order.createdBy.name}, {order.createdBy.role}
              </p>
            </div>
          </div>

          {/* Signature Status Row */}
          <div className="flex items-center gap-6 mb-4 text-sm">
            {/* Clinician Signature */}
            <div className="flex items-center gap-2">
              <p className="text-gray-600">Clinician Signature:</p>
              <div className="flex items-center gap-1.5">
                <clinicianSigConfig.icon
                  className="w-4 h-4"
                  style={{ color: clinicianSigConfig.color }}
                />
                <span
                  className="font-medium"
                  style={{ color: clinicianSigConfig.color }}
                >
                  {clinicianSigConfig.label}
                </span>
              </div>
            </div>

            {/* Physician Signature */}
            <div className="flex items-center gap-2">
              <p className="text-gray-600">Physician Signature:</p>
              <div className="flex items-center gap-1.5">
                <physicianSigConfig.icon
                  className="w-4 h-4"
                  style={{ color: physicianSigConfig.color }}
                />
                <span
                  className="font-medium"
                  style={{ color: physicianSigConfig.color }}
                >
                  {physicianSigConfig.label}
                </span>
              </div>
            </div>

            {/* Last Modified */}
            <div className="flex items-center gap-2 ml-auto">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-gray-600">
                Modified {new Date(order.lastModified).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onOpen}>
              <Eye className="w-4 h-4 mr-1.5" />
              Open
            </Button>

            {order.status === 'pending-review' && (
              <Button variant="default" size="sm" onClick={onReview}>
                <CheckSquare className="w-4 h-4 mr-1.5" />
                Review
              </Button>
            )}

            {order.status === 'draft' && (
              <Button variant="outline" size="sm" onClick={onSendForSignature}>
                <Send className="w-4 h-4 mr-1.5" />
                Send for Signature
              </Button>
            )}

            {order.status === 'pending-signature' && (
              <Button variant="default" size="sm" onClick={onMarkSigned}>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Mark Signed
              </Button>
            )}

            {(order.status === 'draft' ||
              order.status === 'pending-review' ||
              order.status === 'pending-signature') && (
              <Button variant="outline" size="sm" onClick={onReturnForCorrection}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Return for Correction
              </Button>
            )}

            {order.status === 'returned-for-correction' && (
              <Button variant="default" size="sm" onClick={onReview}>
                <Edit className="w-4 h-4 mr-1.5" />
                Edit & Resubmit
              </Button>
            )}

            <Button variant="ghost" size="sm" onClick={onViewHistory} className="ml-auto">
              <History className="w-4 h-4 mr-1.5" />
              History
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
