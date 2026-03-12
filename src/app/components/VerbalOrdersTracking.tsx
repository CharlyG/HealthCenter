/**
 * Verbal Orders Tracking Component
 * 
 * Comprehensive tracking interface for verbal orders with workflow states,
 * signature status, and turnaround time monitoring.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Phone,
  Search,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Send,
  Edit,
  Eye,
  RotateCcw,
  XCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type VerbalOrderStatus =
  | 'draft'
  | 'completed'
  | 'pending-physician-signature'
  | 'signed'
  | 'returned-for-correction';

export interface VerbalOrder {
  id: string;
  orderDate: string;
  effectiveDate: string;
  orderingPhysician: {
    id: string;
    name: string;
    credentials?: string;
  };
  verbalOrderSummary: string;
  clinicalContext: string;
  enteredBy: {
    id: string;
    name: string;
    role: string;
  };
  relatedAdmission: {
    id: string;
    patientName: string;
  };
  status: VerbalOrderStatus;
  createdAt: string;
  updatedAt: string;
  sentForSignatureAt?: string;
  signedAt?: string;
  returnedAt?: string;
  returnReason?: string;
  daysPending?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<
  VerbalOrderStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    icon: any;
    description: string;
  }
> = {
  'draft': {
    label: 'Draft',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    textColor: '#374151',
    icon: Edit,
    description: 'Order being created',
  },
  'completed': {
    label: 'Completed',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    textColor: '#1E40AF',
    icon: CheckCircle,
    description: 'Order completed, ready to send',
  },
  'pending-physician-signature': {
    label: 'Pending Physician Signature',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: '#92400E',
    icon: Clock,
    description: 'Awaiting physician signature',
  },
  'signed': {
    label: 'Signed',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: '#065F46',
    icon: CheckCircle,
    description: 'Physician signature obtained',
  },
  'returned-for-correction': {
    label: 'Returned for Correction',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: '#991B1B',
    icon: RotateCcw,
    description: 'Returned by physician',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

function generateMockVerbalOrders(): VerbalOrder[] {
  const now = new Date();
  
  return [
    {
      id: 'VO-001',
      orderDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-001',
        name: 'Dr. Sarah Mitchell',
        credentials: 'MD',
      },
      verbalOrderSummary: 'Increase Lasix to 40mg PO daily',
      clinicalContext: 'Patient showing signs of fluid overload with 3+ pitting edema',
      enteredBy: {
        id: 'USER-001',
        name: 'Emily Chen',
        role: 'RN',
      },
      relatedAdmission: {
        id: 'ADM-12345',
        patientName: 'Margaret Johnson',
      },
      status: 'pending-physician-signature',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sentForSignatureAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 1,
    },
    {
      id: 'VO-002',
      orderDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-002',
        name: 'Dr. James Patterson',
        credentials: 'MD',
      },
      verbalOrderSummary: 'Hold metoprolol for systolic BP < 100',
      clinicalContext: 'Patient experiencing hypotension with SBP 95mmHg',
      enteredBy: {
        id: 'USER-002',
        name: 'Michael Torres',
        role: 'RN',
      },
      relatedAdmission: {
        id: 'ADM-12346',
        patientName: 'Robert Williams',
      },
      status: 'signed',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sentForSignatureAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      signedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'VO-003',
      orderDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-001',
        name: 'Dr. Sarah Mitchell',
        credentials: 'MD',
      },
      verbalOrderSummary: 'Administer morphine 2mg IV for pain',
      clinicalContext: 'Patient reporting severe pain 8/10, breakthrough pain',
      enteredBy: {
        id: 'USER-003',
        name: 'Lisa Wang',
        role: 'RN',
      },
      relatedAdmission: {
        id: 'ADM-12347',
        patientName: 'Patricia Davis',
      },
      status: 'pending-physician-signature',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sentForSignatureAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 5,
    },
    {
      id: 'VO-004',
      orderDate: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(now.getTime()).toISOString(),
      orderingPhysician: {
        id: 'PHY-003',
        name: 'Dr. Amanda Rodriguez',
        credentials: 'MD',
      },
      verbalOrderSummary: 'Change wound dressing to silver dressing BID',
      clinicalContext: 'Wound showing signs of infection, increased drainage',
      enteredBy: {
        id: 'USER-001',
        name: 'Emily Chen',
        role: 'RN',
      },
      relatedAdmission: {
        id: 'ADM-12348',
        patientName: 'James Anderson',
      },
      status: 'completed',
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'VO-005',
      orderDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      effectiveDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      orderingPhysician: {
        id: 'PHY-001',
        name: 'Dr. Sarah Mitchell',
        credentials: 'MD',
      },
      verbalOrderSummary: 'Increase insulin sliding scale',
      clinicalContext: 'Blood glucose consistently > 200mg/dL',
      enteredBy: {
        id: 'USER-002',
        name: 'Michael Torres',
        role: 'RN',
      },
      relatedAdmission: {
        id: 'ADM-12349',
        patientName: 'Maria Garcia',
      },
      status: 'returned-for-correction',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sentForSignatureAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      returnedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      returnReason: 'Please specify exact sliding scale parameters and target glucose range',
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface VerbalOrdersTrackingProps {
  onOrderView?: (orderId: string) => void;
  onOrderEdit?: (orderId: string) => void;
  onSendForSignature?: (orderId: string) => void;
  onMarkSigned?: (orderId: string) => void;
  onReturnForCorrection?: (orderId: string) => void;
}

export default function VerbalOrdersTracking({
  onOrderView,
  onOrderEdit,
  onSendForSignature,
  onMarkSigned,
  onReturnForCorrection,
}: VerbalOrdersTrackingProps) {
  const [orders] = useState<VerbalOrder[]>(generateMockVerbalOrders());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VerbalOrderStatus | 'all'>('all');

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.id.toLowerCase().includes(term) ||
          order.verbalOrderSummary.toLowerCase().includes(term) ||
          order.orderingPhysician.name.toLowerCase().includes(term) ||
          order.relatedAdmission.patientName.toLowerCase().includes(term)
      );
    }

    // Sort: pending with most days first, then by created date
    return filtered.sort((a, b) => {
      if (a.status === 'pending-physician-signature' && b.status !== 'pending-physician-signature') {
        return -1;
      }
      if (a.status !== 'pending-physician-signature' && b.status === 'pending-physician-signature') {
        return 1;
      }
      if (a.daysPending && b.daysPending) {
        return b.daysPending - a.daysPending;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, statusFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending-physician-signature').length,
      overdue: orders.filter(
        o => o.status === 'pending-physician-signature' && (o.daysPending || 0) > 3
      ).length,
      avgTurnaround: Math.round(
        orders
          .filter(o => o.signedAt && o.sentForSignatureAt)
          .reduce((acc, o) => {
            const sent = new Date(o.sentForSignatureAt!).getTime();
            const signed = new Date(o.signedAt!).getTime();
            return acc + (signed - sent) / (24 * 60 * 60 * 1000);
          }, 0) /
          orders.filter(o => o.signedAt && o.sentForSignatureAt).length || 0
      ),
      signed: orders.filter(o => o.status === 'signed').length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Statistics Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-4">
          <StatCard label="Total Orders" value={stats.total} icon={Phone} />
          <StatCard
            label="Pending Signature"
            value={stats.pending}
            icon={Clock}
            alert={stats.pending > 0}
          />
          <StatCard
            label="Overdue (>3 days)"
            value={stats.overdue}
            icon={AlertTriangle}
            alert={stats.overdue > 0}
          />
          <StatCard
            label="Avg Turnaround"
            value={`${stats.avgTurnaround}d`}
            icon={TrendingUp}
          />
          <StatCard
            label="Signed"
            value={stats.signed}
            icon={CheckCircle}
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
              placeholder="Search by ID, summary, physician, or patient..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as VerbalOrderStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_CONFIG) as VerbalOrderStatus[]).map(status => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h4 className="font-semibold text-gray-900 mb-1">No Verbal Orders Found</h4>
              <p className="text-sm text-gray-600">
                No orders match your current filters
              </p>
            </div>
          </Card>
        ) : (
          filteredOrders.map(order => (
            <VerbalOrderCard
              key={order.id}
              order={order}
              onView={() => onOrderView?.(order.id)}
              onEdit={() => onOrderEdit?.(order.id)}
              onSendForSignature={() => onSendForSignature?.(order.id)}
              onMarkSigned={() => onMarkSigned?.(order.id)}
              onReturnForCorrection={() => onReturnForCorrection?.(order.id)}
            />
          ))
        )}
      </div>
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
// VERBAL ORDER CARD
// ═══════════════════════════════════════════════════════════════════════════

interface VerbalOrderCardProps {
  order: VerbalOrder;
  onView?: () => void;
  onEdit?: () => void;
  onSendForSignature?: () => void;
  onMarkSigned?: () => void;
  onReturnForCorrection?: () => void;
}

function VerbalOrderCard({
  order,
  onView,
  onEdit,
  onSendForSignature,
  onMarkSigned,
  onReturnForCorrection,
}: VerbalOrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  const isOverdue = order.status === 'pending-physician-signature' && (order.daysPending || 0) > 3;

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md',
        isOverdue && 'border-2 border-red-300 bg-red-50/30',
        order.status === 'pending-physician-signature' &&
          !isOverdue &&
          'border-2 border-amber-300 bg-amber-50/30'
      )}
    >
      <div className="space-y-4">
        {/* Top Row */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{order.verbalOrderSummary}</h4>
              <Badge
                style={{
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.textColor,
                }}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {order.status === 'pending-physician-signature' && (
                <Badge
                  variant="outline"
                  className={cn(
                    isOverdue
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  )}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {order.daysPending}d pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">Verbal Order #{order.id}</p>
          </div>
        </div>

        {/* Return Reason Alert */}
        {order.returnReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Returned for Correction</p>
                <p className="text-sm text-red-700 mt-1">{order.returnReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overdue Warning */}
        {isOverdue && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Signature Overdue</p>
                <p className="text-sm text-red-700">
                  This order has been pending physician signature for {order.daysPending} days.
                  Follow up with physician required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Order Date
            </p>
            <p className="font-medium text-gray-900">
              {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Ordering Physician
            </p>
            <p className="font-medium text-gray-900">
              {order.orderingPhysician.name}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Entered By
            </p>
            <p className="font-medium text-gray-900">{order.enteredBy.name}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Patient
            </p>
            <p className="font-medium text-gray-900">
              {order.relatedAdmission.patientName}
            </p>
          </div>
        </div>

        {/* Clinical Context Preview */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-1">Clinical Context</p>
          <p className="text-sm text-gray-600 line-clamp-2">{order.clinicalContext}</p>
        </div>

        {/* Timeline */}
        {order.status !== 'draft' && (
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Created: {new Date(order.createdAt).toLocaleString()}
            </div>
            {order.sentForSignatureAt && (
              <div className="flex items-center gap-1">
                <Send className="w-3 h-3" />
                Sent: {new Date(order.sentForSignatureAt).toLocaleString()}
              </div>
            )}
            {order.signedAt && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                Signed: {new Date(order.signedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="w-4 h-4 mr-1.5" />
            View
          </Button>

          {(order.status === 'draft' || order.status === 'returned-for-correction') && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
          )}

          {order.status === 'completed' && (
            <Button variant="default" size="sm" onClick={onSendForSignature}>
              <Send className="w-4 h-4 mr-1.5" />
              Send for Signature
            </Button>
          )}

          {order.status === 'pending-physician-signature' && (
            <>
              <Button variant="default" size="sm" onClick={onMarkSigned}>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Mark as Signed
              </Button>
              <Button variant="outline" size="sm" onClick={onReturnForCorrection}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Return
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
