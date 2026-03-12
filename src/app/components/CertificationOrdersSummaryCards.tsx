/**
 * Certification & Orders Summary Cards Component
 * 
 * Enhanced admission/care episode dashboard cards displaying certification and
 * order status at a glance. Shows pending orders, pending signatures, current
 * 485 status, recertification due dates, and returned documents with counts,
 * status indicators, warnings, and quick action buttons.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  FileText,
  FileSignature,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  XCircle,
  FileCheck,
  Edit,
  Eye,
  Send,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type OrderStatus = 'pending' | 'approved' | 'completed' | 'overdue';
export type SignatureStatus = 'pending' | 'signed' | 'overdue';
export type Status485 = 'current' | 'expiring-soon' | 'expired' | 'not-submitted';
export type RecertStatus = 'not-due' | 'due-soon' | 'due' | 'overdue';
export type ReturnedDocStatus = 'none' | 'action-needed' | 'resolved';

export interface PendingOrdersData {
  count: number;
  overdueCount: number;
  oldestDays?: number;
}

export interface PendingSignaturesData {
  count: number;
  overdueCount: number;
  physicianCount: number;
  oldestDays?: number;
}

export interface Status485Data {
  status: Status485;
  expirationDate?: string;
  daysUntilExpiration?: number;
  submittedDate?: string;
}

export interface RecertificationData {
  status: RecertStatus;
  dueDate?: string;
  daysUntilDue?: number;
  certificationPeriod?: string;
}

export interface ReturnedDocumentsData {
  count: number;
  unresolvedCount: number;
  documentTypes?: string[];
}

export interface CertificationOrdersSummaryData {
  pendingOrders: PendingOrdersData;
  pendingSignatures: PendingSignaturesData;
  status485: Status485Data;
  recertification: RecertificationData;
  returnedDocuments: ReturnedDocumentsData;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CertificationOrdersSummaryCardsProps {
  data: CertificationOrdersSummaryData;
  onViewOrders?: () => void;
  onViewSignatures?: () => void;
  onView485?: () => void;
  onViewRecertification?: () => void;
  onViewReturnedDocs?: () => void;
}

export default function CertificationOrdersSummaryCards({
  data,
  onViewOrders,
  onViewSignatures,
  onView485,
  onViewRecertification,
  onViewReturnedDocs,
}: CertificationOrdersSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Pending Orders Card */}
      <PendingOrdersCard data={data.pendingOrders} onView={onViewOrders} />

      {/* Pending Signatures Card */}
      <PendingSignaturesCard data={data.pendingSignatures} onView={onViewSignatures} />

      {/* Current 485 Status Card */}
      <Status485Card data={data.status485} onView={onView485} />

      {/* Recertification Due Card */}
      <RecertificationCard data={data.recertification} onView={onViewRecertification} />

      {/* Returned Documents Card */}
      <ReturnedDocumentsCard data={data.returnedDocuments} onView={onViewReturnedDocs} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PENDING ORDERS CARD
// ═══════════════════════════════════════════════════════════════════════════

interface PendingOrdersCardProps {
  data: PendingOrdersData;
  onView?: () => void;
}

function PendingOrdersCard({ data, onView }: PendingOrdersCardProps) {
  const hasOverdue = data.overdueCount > 0;
  const hasWarning = data.count > 5 || hasOverdue;

  return (
    <Card className={cn('p-4 transition-all hover:shadow-md', hasOverdue && 'border-red-300')}>
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            hasOverdue ? 'bg-red-100' : 'bg-blue-100'
          )}
        >
          <FileText className={cn('w-5 h-5', hasOverdue ? 'text-red-600' : 'text-blue-600')} />
        </div>
        {hasWarning && (
          <AlertTriangle
            className={cn('w-5 h-5', hasOverdue ? 'text-red-600' : 'text-amber-600')}
          />
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Orders</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">{data.count}</p>
          {hasOverdue && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
              {data.overdueCount} overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        {data.count === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>All orders complete</span>
          </div>
        ) : hasOverdue ? (
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>Action needed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{data.count} awaiting completion</span>
          </div>
        )}
        {data.oldestDays !== undefined && data.oldestDays > 0 && (
          <p className="text-xs text-gray-600 mt-1">Oldest: {data.oldestDays} days</p>
        )}
      </div>

      {/* Warning */}
      {hasWarning && (
        <div
          className={cn(
            'text-xs p-2 rounded mb-3',
            hasOverdue
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          )}
        >
          {hasOverdue ? (
            <span>
              <strong>{data.overdueCount}</strong> order{data.overdueCount !== 1 ? 's' : ''}{' '}
              overdue
            </span>
          ) : (
            <span>High volume of pending orders</span>
          )}
        </div>
      )}

      {/* Quick Action */}
      <Button size="sm" variant="outline" onClick={onView} className="w-full">
        View Orders
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PENDING SIGNATURES CARD
// ═══════════════════════════════════════════════════════════════════════════

interface PendingSignaturesCardProps {
  data: PendingSignaturesData;
  onView?: () => void;
}

function PendingSignaturesCard({ data, onView }: PendingSignaturesCardProps) {
  const hasOverdue = data.overdueCount > 0;
  const hasWarning = data.count > 3 || hasOverdue;

  return (
    <Card className={cn('p-4 transition-all hover:shadow-md', hasOverdue && 'border-red-300')}>
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            hasOverdue ? 'bg-red-100' : 'bg-purple-100'
          )}
        >
          <FileSignature
            className={cn('w-5 h-5', hasOverdue ? 'text-red-600' : 'text-purple-600')}
          />
        </div>
        {hasWarning && (
          <AlertTriangle
            className={cn('w-5 h-5', hasOverdue ? 'text-red-600' : 'text-amber-600')}
          />
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Signatures</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">{data.count}</p>
          {hasOverdue && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
              {data.overdueCount} overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        {data.count === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>All documents signed</span>
          </div>
        ) : hasOverdue ? (
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>Signatures overdue</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {data.physicianCount} physician signature{data.physicianCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {data.oldestDays !== undefined && data.oldestDays > 0 && (
          <p className="text-xs text-gray-600 mt-1">Oldest: {data.oldestDays} days</p>
        )}
      </div>

      {/* Warning */}
      {hasWarning && (
        <div
          className={cn(
            'text-xs p-2 rounded mb-3',
            hasOverdue
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          )}
        >
          {hasOverdue ? (
            <span>
              <strong>{data.overdueCount}</strong> signature{data.overdueCount !== 1 ? 's' : ''}{' '}
              overdue
            </span>
          ) : (
            <span>Multiple signatures pending</span>
          )}
        </div>
      )}

      {/* Quick Action */}
      <Button size="sm" variant="outline" onClick={onView} className="w-full">
        View Signatures
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 485 STATUS CARD
// ═══════════════════════════════════════════════════════════════════════════

interface Status485CardProps {
  data: Status485Data;
  onView?: () => void;
}

function Status485Card({ data, onView }: Status485CardProps) {
  const isExpired = data.status === 'expired';
  const isExpiringSoon = data.status === 'expiring-soon';
  const isNotSubmitted = data.status === 'not-submitted';
  const hasWarning = isExpired || isExpiringSoon || isNotSubmitted;

  const getStatusConfig = () => {
    switch (data.status) {
      case 'current':
        return {
          color: 'green',
          icon: CheckCircle,
          label: 'Current',
          bgClass: 'bg-green-100',
          textClass: 'text-green-600',
        };
      case 'expiring-soon':
        return {
          color: 'amber',
          icon: Clock,
          label: 'Expiring Soon',
          bgClass: 'bg-amber-100',
          textClass: 'text-amber-600',
        };
      case 'expired':
        return {
          color: 'red',
          icon: XCircle,
          label: 'Expired',
          bgClass: 'bg-red-100',
          textClass: 'text-red-600',
        };
      case 'not-submitted':
        return {
          color: 'gray',
          icon: AlertCircle,
          label: 'Not Submitted',
          bgClass: 'bg-gray-100',
          textClass: 'text-gray-600',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md',
        (isExpired || isNotSubmitted) && 'border-red-300'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bgClass)}>
          <FileCheck className={cn('w-5 h-5', config.textClass)} />
        </div>
        {hasWarning && (
          <AlertTriangle
            className={cn('w-5 h-5', isExpired || isNotSubmitted ? 'text-red-600' : 'text-amber-600')}
          />
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Current 485 Status</h3>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            config.color === 'green' && 'bg-green-50 text-green-700 border-green-300',
            config.color === 'amber' && 'bg-amber-50 text-amber-700 border-amber-300',
            config.color === 'red' && 'bg-red-50 text-red-700 border-red-300',
            config.color === 'gray' && 'bg-gray-50 text-gray-700 border-gray-300'
          )}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      {/* Status Details */}
      <div className="mb-3">
        {data.status === 'current' && data.expirationDate && (
          <div className="text-sm text-gray-600">
            <p>Expires: {new Date(data.expirationDate).toLocaleDateString()}</p>
            {data.daysUntilExpiration !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                {data.daysUntilExpiration} days remaining
              </p>
            )}
          </div>
        )}
        {data.status === 'expiring-soon' && data.daysUntilExpiration !== undefined && (
          <div className="text-sm text-amber-700">
            <p>Expires in {data.daysUntilExpiration} days</p>
            {data.expirationDate && (
              <p className="text-xs text-amber-600 mt-1">
                {new Date(data.expirationDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        {data.status === 'expired' && data.expirationDate && (
          <div className="text-sm text-red-700">
            <p>Expired {new Date(data.expirationDate).toLocaleDateString()}</p>
          </div>
        )}
        {data.status === 'not-submitted' && (
          <div className="text-sm text-gray-600">
            <p>485 not yet submitted</p>
          </div>
        )}
      </div>

      {/* Warning */}
      {hasWarning && (
        <div
          className={cn(
            'text-xs p-2 rounded mb-3',
            isExpired || isNotSubmitted
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          )}
        >
          {isExpired && <span>485 has expired - submit renewal</span>}
          {isExpiringSoon && <span>485 expiring soon - prepare renewal</span>}
          {isNotSubmitted && <span>485 submission required</span>}
        </div>
      )}

      {/* Quick Action */}
      <Button size="sm" variant="outline" onClick={onView} className="w-full">
        {isNotSubmitted ? 'Submit 485' : 'View 485'}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECERTIFICATION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationCardProps {
  data: RecertificationData;
  onView?: () => void;
}

function RecertificationCard({ data, onView }: RecertificationCardProps) {
  const isDue = data.status === 'due';
  const isOverdue = data.status === 'overdue';
  const isDueSoon = data.status === 'due-soon';
  const hasWarning = isDue || isOverdue || isDueSoon;

  const getStatusConfig = () => {
    switch (data.status) {
      case 'not-due':
        return {
          color: 'green',
          icon: CheckCircle,
          label: 'Not Due',
          bgClass: 'bg-green-100',
          textClass: 'text-green-600',
        };
      case 'due-soon':
        return {
          color: 'amber',
          icon: Clock,
          label: 'Due Soon',
          bgClass: 'bg-amber-100',
          textClass: 'text-amber-600',
        };
      case 'due':
        return {
          color: 'orange',
          icon: AlertCircle,
          label: 'Due',
          bgClass: 'bg-orange-100',
          textClass: 'text-orange-600',
        };
      case 'overdue':
        return {
          color: 'red',
          icon: XCircle,
          label: 'Overdue',
          bgClass: 'bg-red-100',
          textClass: 'text-red-600',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card className={cn('p-4 transition-all hover:shadow-md', isOverdue && 'border-red-300')}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bgClass)}>
          <Calendar className={cn('w-5 h-5', config.textClass)} />
        </div>
        {hasWarning && (
          <AlertTriangle
            className={cn('w-5 h-5', isOverdue ? 'text-red-600' : 'text-amber-600')}
          />
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Recertification Due</h3>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            config.color === 'green' && 'bg-green-50 text-green-700 border-green-300',
            config.color === 'amber' && 'bg-amber-50 text-amber-700 border-amber-300',
            config.color === 'orange' && 'bg-orange-50 text-orange-700 border-orange-300',
            config.color === 'red' && 'bg-red-50 text-red-700 border-red-300'
          )}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      {/* Status Details */}
      <div className="mb-3">
        {data.status === 'not-due' && data.dueDate && (
          <div className="text-sm text-gray-600">
            <p>Due: {new Date(data.dueDate).toLocaleDateString()}</p>
            {data.daysUntilDue !== undefined && (
              <p className="text-xs text-gray-500 mt-1">{data.daysUntilDue} days away</p>
            )}
          </div>
        )}
        {data.status === 'due-soon' && data.daysUntilDue !== undefined && (
          <div className="text-sm text-amber-700">
            <p>Due in {data.daysUntilDue} days</p>
            {data.dueDate && (
              <p className="text-xs text-amber-600 mt-1">
                {new Date(data.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        {data.status === 'due' && data.dueDate && (
          <div className="text-sm text-orange-700">
            <p>Due: {new Date(data.dueDate).toLocaleDateString()}</p>
          </div>
        )}
        {data.status === 'overdue' && data.daysUntilDue !== undefined && (
          <div className="text-sm text-red-700">
            <p>Overdue by {Math.abs(data.daysUntilDue)} days</p>
          </div>
        )}
        {data.certificationPeriod && (
          <p className="text-xs text-gray-500 mt-1">{data.certificationPeriod}</p>
        )}
      </div>

      {/* Warning */}
      {hasWarning && (
        <div
          className={cn(
            'text-xs p-2 rounded mb-3',
            isOverdue
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          )}
        >
          {isOverdue && <span>Recertification is overdue</span>}
          {isDue && <span>Recertification is due now</span>}
          {isDueSoon && <span>Prepare recertification documents</span>}
        </div>
      )}

      {/* Quick Action */}
      <Button size="sm" variant="outline" onClick={onView} className="w-full">
        {isOverdue || isDue ? 'Start Recert' : 'View Recert'}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RETURNED DOCUMENTS CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ReturnedDocumentsCardProps {
  data: ReturnedDocumentsData;
  onView?: () => void;
}

function ReturnedDocumentsCard({ data, onView }: ReturnedDocumentsCardProps) {
  const hasReturned = data.count > 0;
  const hasUnresolved = data.unresolvedCount > 0;

  return (
    <Card className={cn('p-4 transition-all hover:shadow-md', hasUnresolved && 'border-red-300')}>
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            hasUnresolved ? 'bg-red-100' : hasReturned ? 'bg-amber-100' : 'bg-green-100'
          )}
        >
          <FileText
            className={cn(
              'w-5 h-5',
              hasUnresolved ? 'text-red-600' : hasReturned ? 'text-amber-600' : 'text-green-600'
            )}
          />
        </div>
        {hasUnresolved && <AlertTriangle className="w-5 h-5 text-red-600" />}
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Returned Documents</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">{data.count}</p>
          {hasUnresolved && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
              {data.unresolvedCount} unresolved
            </Badge>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mb-3">
        {data.count === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>No returned documents</span>
          </div>
        ) : hasUnresolved ? (
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>Action required</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Clock className="w-4 h-4" />
            <span>All resolved</span>
          </div>
        )}
        {data.documentTypes && data.documentTypes.length > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            Types: {data.documentTypes.slice(0, 2).join(', ')}
            {data.documentTypes.length > 2 && ` +${data.documentTypes.length - 2}`}
          </p>
        )}
      </div>

      {/* Warning */}
      {hasUnresolved && (
        <div className="text-xs p-2 rounded mb-3 bg-red-50 text-red-700 border border-red-200">
          <span>
            <strong>{data.unresolvedCount}</strong> document{data.unresolvedCount !== 1 ? 's' : ''}{' '}
            need correction
          </span>
        </div>
      )}

      {/* Quick Action */}
      <Button
        size="sm"
        variant="outline"
        onClick={onView}
        className="w-full"
        disabled={data.count === 0}
      >
        {hasUnresolved ? 'Resolve Issues' : 'View Documents'}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockCertificationOrdersData(): CertificationOrdersSummaryData[] {
  return [
    {
      // Admission with multiple issues
      pendingOrders: {
        count: 8,
        overdueCount: 2,
        oldestDays: 7,
      },
      pendingSignatures: {
        count: 5,
        overdueCount: 1,
        physicianCount: 3,
        oldestDays: 5,
      },
      status485: {
        status: 'expiring-soon',
        expirationDate: '2024-12-28',
        daysUntilExpiration: 13,
        submittedDate: '2024-10-01',
      },
      recertification: {
        status: 'due-soon',
        dueDate: '2024-12-25',
        daysUntilDue: 10,
        certificationPeriod: 'Period 2',
      },
      returnedDocuments: {
        count: 3,
        unresolvedCount: 2,
        documentTypes: ['485', 'Verbal Order', 'Visit Note'],
      },
    },
    {
      // Admission in good standing
      pendingOrders: {
        count: 2,
        overdueCount: 0,
        oldestDays: 2,
      },
      pendingSignatures: {
        count: 1,
        overdueCount: 0,
        physicianCount: 1,
        oldestDays: 1,
      },
      status485: {
        status: 'current',
        expirationDate: '2025-02-15',
        daysUntilExpiration: 67,
        submittedDate: '2024-11-01',
      },
      recertification: {
        status: 'not-due',
        dueDate: '2025-02-10',
        daysUntilDue: 62,
        certificationPeriod: 'Period 1',
      },
      returnedDocuments: {
        count: 1,
        unresolvedCount: 0,
        documentTypes: ['Visit Note'],
      },
    },
    {
      // Admission with critical issues
      pendingOrders: {
        count: 12,
        overdueCount: 5,
        oldestDays: 14,
      },
      pendingSignatures: {
        count: 8,
        overdueCount: 4,
        physicianCount: 5,
        oldestDays: 12,
      },
      status485: {
        status: 'expired',
        expirationDate: '2024-12-01',
        daysUntilExpiration: -14,
        submittedDate: '2024-09-15',
      },
      recertification: {
        status: 'overdue',
        dueDate: '2024-12-05',
        daysUntilDue: -10,
        certificationPeriod: 'Period 3',
      },
      returnedDocuments: {
        count: 6,
        unresolvedCount: 5,
        documentTypes: ['485', 'Verbal Order', 'Visit Note', 'Assessment'],
      },
    },
    {
      // New admission - not submitted yet
      pendingOrders: {
        count: 3,
        overdueCount: 0,
        oldestDays: 1,
      },
      pendingSignatures: {
        count: 2,
        overdueCount: 0,
        physicianCount: 1,
        oldestDays: 1,
      },
      status485: {
        status: 'not-submitted',
      },
      recertification: {
        status: 'not-due',
        dueDate: '2025-03-01',
        daysUntilDue: 76,
        certificationPeriod: 'Period 1',
      },
      returnedDocuments: {
        count: 0,
        unresolvedCount: 0,
        documentTypes: [],
      },
    },
  ];
}
