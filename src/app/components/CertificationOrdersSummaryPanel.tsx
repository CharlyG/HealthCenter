/**
 * Certification & Orders Summary Panel Component
 * 
 * Reusable panel summarizing certification and orders status for the active
 * admission. Displays current certification period, 485 status, open orders,
 * pending signatures, returned items, and recertification readiness. Designed
 * for use in admission dashboard, patient chart, and recertification workspace.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Calendar,
  FileText,
  FileSignature,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  FileCheck,
  XCircle,
  TrendingUp,
  Activity,
  Info,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type CertificationStatus = 'active' | 'expiring-soon' | 'expired' | 'not-started';
export type Status485 = 'current' | 'expiring-soon' | 'expired' | 'not-submitted' | 'pending-signature';
export type RecertReadinessLevel = 'ready' | 'almost-ready' | 'not-ready' | 'blocked';

export interface CertificationPeriodData {
  period: number; // 1, 2, 3, etc.
  status: CertificationStatus;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  totalDays: number;
}

export interface Status485Data {
  status: Status485;
  submittedDate?: string;
  expirationDate?: string;
  daysUntilExpiration?: number;
  missingSections?: string[];
  awaitingPhysician?: string;
}

export interface OpenOrdersData {
  totalCount: number;
  overdueCount: number;
  byType: {
    verbal: number;
    skilled: number;
    therapy: number;
    other: number;
  };
  oldestDays?: number;
}

export interface PendingSignaturesData {
  totalCount: number;
  overdueCount: number;
  physicianCount: number;
  documents: Array<{
    type: string;
    daysWaiting: number;
  }>;
}

export interface ReturnedItemsData {
  totalCount: number;
  unresolvedCount: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  oldestDays?: number;
}

export interface RecertificationReadinessData {
  status: RecertReadinessLevel;
  score: number; // 0-100
  daysUntilDue: number;
  blockers: string[];
  completedItems: number;
  totalItems: number;
}

export interface CertificationOrdersSummary {
  admissionId: string;
  patientName: string;
  certificationPeriod: CertificationPeriodData;
  status485: Status485Data;
  openOrders: OpenOrdersData;
  pendingSignatures: PendingSignaturesData;
  returnedItems: ReturnedItemsData;
  recertificationReadiness: RecertificationReadinessData;
}

export type DisplayMode = 'full' | 'compact' | 'sidebar';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CertificationOrdersSummaryPanelProps {
  data: CertificationOrdersSummary;
  mode?: DisplayMode;
  onViewCertificationPeriod?: () => void;
  onView485?: () => void;
  onViewOrders?: () => void;
  onViewSignatures?: () => void;
  onViewReturnedItems?: () => void;
  onViewRecertReadiness?: () => void;
  className?: string;
}

export default function CertificationOrdersSummaryPanel({
  data,
  mode = 'full',
  onViewCertificationPeriod,
  onView485,
  onViewOrders,
  onViewSignatures,
  onViewReturnedItems,
  onViewRecertReadiness,
  className,
}: CertificationOrdersSummaryPanelProps) {
  if (mode === 'sidebar') {
    return (
      <SidebarMode
        data={data}
        onViewCertificationPeriod={onViewCertificationPeriod}
        onView485={onView485}
        onViewOrders={onViewOrders}
        onViewSignatures={onViewSignatures}
        onViewReturnedItems={onViewReturnedItems}
        onViewRecertReadiness={onViewRecertReadiness}
        className={className}
      />
    );
  }

  if (mode === 'compact') {
    return (
      <CompactMode
        data={data}
        onViewCertificationPeriod={onViewCertificationPeriod}
        onView485={onView485}
        onViewOrders={onViewOrders}
        onViewSignatures={onViewSignatures}
        onViewReturnedItems={onViewReturnedItems}
        onViewRecertReadiness={onViewRecertReadiness}
        className={className}
      />
    );
  }

  // Full mode (default)
  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Certification & Orders Summary</h3>
        <p className="text-sm text-gray-600">
          {data.patientName} • Admission {data.admissionId}
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Certification Period */}
        <CertificationPeriodSection
          data={data.certificationPeriod}
          onClick={onViewCertificationPeriod}
        />

        {/* 485 Status */}
        <Status485Section data={data.status485} onClick={onView485} />

        {/* Open Orders */}
        <OpenOrdersSection data={data.openOrders} onClick={onViewOrders} />

        {/* Pending Signatures */}
        <PendingSignaturesSection data={data.pendingSignatures} onClick={onViewSignatures} />

        {/* Returned Items */}
        <ReturnedItemsSection data={data.returnedItems} onClick={onViewReturnedItems} />

        {/* Recertification Readiness */}
        <RecertificationReadinessSection
          data={data.recertificationReadiness}
          onClick={onViewRecertReadiness}
        />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CERTIFICATION PERIOD SECTION
// ═══════════════════════════════════════════════════════════════════════════

function CertificationPeriodSection({
  data,
  onClick,
}: {
  data: CertificationPeriodData;
  onClick?: () => void;
}) {
  const isExpiringSoon = data.status === 'expiring-soon';
  const isExpired = data.status === 'expired';
  const hasWarning = isExpiringSoon || isExpired;

  const progressPercentage = Math.max(0, Math.min(100, (data.daysRemaining / data.totalDays) * 100));

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border text-left transition-all hover:shadow-md',
        isExpired ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200 hover:border-blue-300'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              isExpired ? 'bg-red-100' : isExpiringSoon ? 'bg-amber-100' : 'bg-blue-100'
            )}
          >
            <Calendar
              className={cn(
                'w-4 h-4',
                isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-blue-600'
              )}
            />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">Certification Period</h4>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      <div className="mb-3">
        <Badge
          variant="outline"
          className={cn(
            'text-xs mb-2',
            data.status === 'active' && 'bg-green-50 text-green-700 border-green-300',
            isExpiringSoon && 'bg-amber-50 text-amber-700 border-amber-300',
            isExpired && 'bg-red-50 text-red-700 border-red-300'
          )}
        >
          Period {data.period}
        </Badge>
        <p className="text-xs text-gray-600">
          {new Date(data.startDate).toLocaleDateString()} -{' '}
          {new Date(data.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              isExpired ? 'bg-red-600' : isExpiringSoon ? 'bg-amber-600' : 'bg-green-600'
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <p
        className={cn(
          'text-sm font-semibold',
          isExpired ? 'text-red-700' : isExpiringSoon ? 'text-amber-700' : 'text-gray-900'
        )}
      >
        {data.daysRemaining > 0 ? (
          <>
            {data.daysRemaining} day{data.daysRemaining !== 1 ? 's' : ''} remaining
          </>
        ) : (
          <>Expired {Math.abs(data.daysRemaining)} days ago</>
        )}
      </p>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 485 STATUS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function Status485Section({ data, onClick }: { data: Status485Data; onClick?: () => void }) {
  const isExpired = data.status === 'expired';
  const isExpiringSoon = data.status === 'expiring-soon';
  const isNotSubmitted = data.status === 'not-submitted';
  const isPendingSignature = data.status === 'pending-signature';
  const hasWarning = isExpired || isExpiringSoon || isNotSubmitted || isPendingSignature;

  const getStatusConfig = () => {
    switch (data.status) {
      case 'current':
        return {
          color: 'green',
          icon: CheckCircle,
          label: 'Current',
          bgClass: 'bg-green-100',
          iconClass: 'text-green-600',
          badgeClass: 'bg-green-50 text-green-700 border-green-300',
        };
      case 'expiring-soon':
        return {
          color: 'amber',
          icon: Clock,
          label: 'Expiring Soon',
          bgClass: 'bg-amber-100',
          iconClass: 'text-amber-600',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
        };
      case 'expired':
        return {
          color: 'red',
          icon: XCircle,
          label: 'Expired',
          bgClass: 'bg-red-100',
          iconClass: 'text-red-600',
          badgeClass: 'bg-red-50 text-red-700 border-red-300',
        };
      case 'not-submitted':
        return {
          color: 'gray',
          icon: AlertCircle,
          label: 'Not Submitted',
          bgClass: 'bg-gray-100',
          iconClass: 'text-gray-600',
          badgeClass: 'bg-gray-50 text-gray-700 border-gray-300',
        };
      case 'pending-signature':
        return {
          color: 'purple',
          icon: FileSignature,
          label: 'Pending Signature',
          bgClass: 'bg-purple-100',
          iconClass: 'text-purple-600',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-300',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border text-left transition-all hover:shadow-md',
        isExpired || isNotSubmitted
          ? 'bg-red-50 border-red-300'
          : 'bg-white border-gray-200 hover:border-blue-300'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgClass)}>
            <FileCheck className={cn('w-4 h-4', config.iconClass)} />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">485 Status</h4>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      <div className="mb-3">
        <Badge variant="outline" className={cn('text-xs mb-2', config.badgeClass)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      {data.status === 'current' && data.expirationDate && (
        <p className="text-xs text-gray-600">
          Expires {new Date(data.expirationDate).toLocaleDateString()}
          {data.daysUntilExpiration !== undefined && (
            <span className="block mt-1">({data.daysUntilExpiration} days)</span>
          )}
        </p>
      )}

      {isExpiringSoon && data.daysUntilExpiration !== undefined && (
        <p className="text-xs text-amber-700 font-medium">
          Expires in {data.daysUntilExpiration} days
        </p>
      )}

      {isExpired && data.expirationDate && (
        <p className="text-xs text-red-700 font-medium">
          Expired {new Date(data.expirationDate).toLocaleDateString()}
        </p>
      )}

      {isNotSubmitted && (
        <p className="text-xs text-gray-700 font-medium">Submission required</p>
      )}

      {isPendingSignature && data.awaitingPhysician && (
        <p className="text-xs text-purple-700 font-medium">
          Awaiting: {data.awaitingPhysician}
        </p>
      )}

      {data.missingSections && data.missingSections.length > 0 && (
        <p className="text-xs text-amber-700 mt-2">
          {data.missingSections.length} section{data.missingSections.length !== 1 ? 's' : ''}{' '}
          missing
        </p>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OPEN ORDERS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function OpenOrdersSection({ data, onClick }: { data: OpenOrdersData; onClick?: () => void }) {
  const hasOverdue = data.overdueCount > 0;
  const hasOrders = data.totalCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border text-left transition-all hover:shadow-md',
        hasOverdue ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200 hover:border-blue-300'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              hasOverdue ? 'bg-red-100' : hasOrders ? 'bg-blue-100' : 'bg-green-100'
            )}
          >
            <FileText
              className={cn(
                'w-4 h-4',
                hasOverdue ? 'text-red-600' : hasOrders ? 'text-blue-600' : 'text-green-600'
              )}
            />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">Open Orders</h4>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-2xl font-bold text-gray-900">{data.totalCount}</p>
        {hasOverdue && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
            {data.overdueCount} overdue
          </Badge>
        )}
      </div>

      {hasOrders ? (
        <div className="space-y-1">
          {data.byType.verbal > 0 && (
            <p className="text-xs text-gray-600">Verbal: {data.byType.verbal}</p>
          )}
          {data.byType.skilled > 0 && (
            <p className="text-xs text-gray-600">Skilled: {data.byType.skilled}</p>
          )}
          {data.byType.therapy > 0 && (
            <p className="text-xs text-gray-600">Therapy: {data.byType.therapy}</p>
          )}
          {data.byType.other > 0 && (
            <p className="text-xs text-gray-600">Other: {data.byType.other}</p>
          )}
          {data.oldestDays !== undefined && data.oldestDays > 0 && (
            <p className="text-xs text-amber-700 font-medium mt-2">
              Oldest: {data.oldestDays} days
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-green-700">
          <CheckCircle className="w-3 h-3" />
          <span>All orders complete</span>
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PENDING SIGNATURES SECTION
// ═══════════════════════════════════════════════════════════════════════════

function PendingSignaturesSection({
  data,
  onClick,
}: {
  data: PendingSignaturesData;
  onClick?: () => void;
}) {
  const hasOverdue = data.overdueCount > 0;
  const hasPending = data.totalCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border text-left transition-all hover:shadow-md',
        hasOverdue
          ? 'bg-red-50 border-red-300'
          : 'bg-white border-gray-200 hover:border-blue-300'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              hasOverdue ? 'bg-red-100' : hasPending ? 'bg-purple-100' : 'bg-green-100'
            )}
          >
            <FileSignature
              className={cn(
                'w-4 h-4',
                hasOverdue ? 'text-red-600' : hasPending ? 'text-purple-600' : 'text-green-600'
              )}
            />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">Pending Signatures</h4>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-2xl font-bold text-gray-900">{data.totalCount}</p>
        {hasOverdue && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
            {data.overdueCount} overdue
          </Badge>
        )}
      </div>

      {hasPending ? (
        <div className="space-y-1">
          <p className="text-xs text-gray-600">{data.physicianCount} physician signatures</p>
          {data.documents.slice(0, 2).map((doc, idx) => (
            <p key={idx} className="text-xs text-gray-600">
              {doc.type}: {doc.daysWaiting} days
            </p>
          ))}
          {data.documents.length > 2 && (
            <p className="text-xs text-gray-500">+{data.documents.length - 2} more</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-green-700">
          <CheckCircle className="w-3 h-3" />
          <span>All documents signed</span>
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RETURNED ITEMS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function ReturnedItemsSection({
  data,
  onClick,
}: {
  data: ReturnedItemsData;
  onClick?: () => void;
}) {
  const hasUnresolved = data.unresolvedCount > 0;
  const hasReturned = data.totalCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border text-left transition-all hover:shadow-md',
        hasUnresolved
          ? 'bg-red-50 border-red-300'
          : 'bg-white border-gray-200 hover:border-blue-300'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              hasUnresolved ? 'bg-red-100' : hasReturned ? 'bg-amber-100' : 'bg-green-100'
            )}
          >
            <AlertTriangle
              className={cn(
                'w-4 h-4',
                hasUnresolved ? 'text-red-600' : hasReturned ? 'text-amber-600' : 'text-green-600'
              )}
            />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">Returned Items</h4>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-2xl font-bold text-gray-900">{data.totalCount}</p>
        {hasUnresolved && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
            {data.unresolvedCount} unresolved
          </Badge>
        )}
      </div>

      {hasReturned ? (
        <div className="space-y-1">
          {data.byType.slice(0, 3).map((item, idx) => (
            <p key={idx} className="text-xs text-gray-600">
              {item.type}: {item.count}
            </p>
          ))}
          {data.byType.length > 3 && (
            <p className="text-xs text-gray-500">+{data.byType.length - 3} more types</p>
          )}
          {data.oldestDays !== undefined && data.oldestDays > 0 && (
            <p className="text-xs text-red-700 font-medium mt-2">Oldest: {data.oldestDays} days</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-green-700">
          <CheckCircle className="w-3 h-3" />
          <span>No returned documents</span>
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECERTIFICATION READINESS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function RecertificationReadinessSection({
  data,
  onClick,
}: {
  data: RecertificationReadinessData;
  onClick?: () => void;
}) {
  const isBlocked = data.status === 'blocked';
  const isNotReady = data.status === 'not-ready';
  const isAlmostReady = data.status === 'almost-ready';
  const isReady = data.status === 'ready';

  const getStatusConfig = () => {
    switch (data.status) {
      case 'ready':
        return {
          color: 'green',
          icon: CheckCircle,
          label: 'Ready',
          bgClass: 'bg-green-100',
          iconClass: 'text-green-600',
          badgeClass: 'bg-green-50 text-green-700 border-green-300',
        };
      case 'almost-ready':
        return {
          color: 'blue',
          icon: TrendingUp,
          label: 'Almost Ready',
          bgClass: 'bg-blue-100',
          iconClass: 'text-blue-600',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-300',
        };
      case 'not-ready':
        return {
          color: 'amber',
          icon: Clock,
          label: 'Not Ready',
          bgClass: 'bg-amber-100',
          iconClass: 'text-amber-600',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
        };
      case 'blocked':
        return {
          color: 'red',
          icon: XCircle,
          label: 'Blocked',
          bgClass: 'bg-red-100',
          iconClass: 'text-red-600',
          badgeClass: 'bg-red-50 text-red-700 border-red-300',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border text-left transition-all hover:shadow-md',
        isBlocked ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200 hover:border-blue-300'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgClass)}>
            <Activity className={cn('w-4 h-4', config.iconClass)} />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">Recert Readiness</h4>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      <div className="mb-3">
        <Badge variant="outline" className={cn('text-xs mb-2', config.badgeClass)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      {/* Score Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Completion</span>
          <span className="text-xs font-semibold text-gray-900">{data.score}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              isReady && 'bg-green-600',
              isAlmostReady && 'bg-blue-600',
              isNotReady && 'bg-amber-600',
              isBlocked && 'bg-red-600'
            )}
            style={{ width: `${data.score}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-2">
        {data.completedItems} of {data.totalItems} items complete
      </p>

      {data.daysUntilDue > 0 && (
        <p className="text-xs text-gray-600">Due in {data.daysUntilDue} days</p>
      )}

      {data.blockers.length > 0 && (
        <p className="text-xs text-red-700 font-medium mt-2">
          {data.blockers.length} blocker{data.blockers.length !== 1 ? 's' : ''}
        </p>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT MODE
// ═══════════════════════════════════════════════════════════════════════════

function CompactMode({
  data,
  onViewCertificationPeriod,
  onView485,
  onViewOrders,
  onViewSignatures,
  onViewReturnedItems,
  onViewRecertReadiness,
  className,
}: CertificationOrdersSummaryPanelProps) {
  return (
    <Card className={cn('p-4', className)}>
      <h3 className="text-sm font-bold text-gray-900 mb-3">Certification & Orders</h3>
      <div className="space-y-2">
        <CompactItem
          icon={Calendar}
          label="Cert Period"
          value={`Period ${data.certificationPeriod.period}`}
          status={`${data.certificationPeriod.daysRemaining}d left`}
          statusColor={
            data.certificationPeriod.status === 'expired'
              ? 'red'
              : data.certificationPeriod.status === 'expiring-soon'
              ? 'amber'
              : 'green'
          }
          onClick={onViewCertificationPeriod}
        />
        <CompactItem
          icon={FileCheck}
          label="485 Status"
          value={data.status485.status.replace('-', ' ')}
          statusColor={
            data.status485.status === 'expired' || data.status485.status === 'not-submitted'
              ? 'red'
              : data.status485.status === 'expiring-soon'
              ? 'amber'
              : 'green'
          }
          onClick={onView485}
        />
        <CompactItem
          icon={FileText}
          label="Open Orders"
          value={data.openOrders.totalCount.toString()}
          badge={data.openOrders.overdueCount > 0 ? `${data.openOrders.overdueCount} overdue` : undefined}
          statusColor={data.openOrders.overdueCount > 0 ? 'red' : data.openOrders.totalCount > 0 ? 'blue' : 'green'}
          onClick={onViewOrders}
        />
        <CompactItem
          icon={FileSignature}
          label="Pending Signatures"
          value={data.pendingSignatures.totalCount.toString()}
          badge={data.pendingSignatures.overdueCount > 0 ? `${data.pendingSignatures.overdueCount} overdue` : undefined}
          statusColor={data.pendingSignatures.overdueCount > 0 ? 'red' : data.pendingSignatures.totalCount > 0 ? 'purple' : 'green'}
          onClick={onViewSignatures}
        />
        <CompactItem
          icon={AlertTriangle}
          label="Returned Items"
          value={data.returnedItems.totalCount.toString()}
          badge={data.returnedItems.unresolvedCount > 0 ? `${data.returnedItems.unresolvedCount} unresolved` : undefined}
          statusColor={data.returnedItems.unresolvedCount > 0 ? 'red' : data.returnedItems.totalCount > 0 ? 'amber' : 'green'}
          onClick={onViewReturnedItems}
        />
        <CompactItem
          icon={Activity}
          label="Recert Readiness"
          value={`${data.recertificationReadiness.score}%`}
          status={data.recertificationReadiness.status.replace('-', ' ')}
          statusColor={
            data.recertificationReadiness.status === 'blocked'
              ? 'red'
              : data.recertificationReadiness.status === 'not-ready'
              ? 'amber'
              : data.recertificationReadiness.status === 'almost-ready'
              ? 'blue'
              : 'green'
          }
          onClick={onViewRecertReadiness}
        />
      </div>
    </Card>
  );
}

function CompactItem({
  icon: Icon,
  label,
  value,
  status,
  badge,
  statusColor,
  onClick,
}: {
  icon: any;
  label: string;
  value: string;
  status?: string;
  badge?: string;
  statusColor: 'red' | 'amber' | 'green' | 'blue' | 'purple';
  onClick?: () => void;
}) {
  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-2 rounded hover:bg-gray-50 transition-colors text-left"
    >
      <div className={cn('w-6 h-6 rounded flex items-center justify-center flex-shrink-0', colorClasses[statusColor])}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{value}</p>
          {status && <span className="text-xs text-gray-500 capitalize">{status}</span>}
          {badge && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
              {badge}
            </Badge>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR MODE
// ═══════════════════════════════════════════════════════════════════════════

function SidebarMode({
  data,
  onViewCertificationPeriod,
  onView485,
  onViewOrders,
  onViewSignatures,
  onViewReturnedItems,
  onViewRecertReadiness,
  className,
}: CertificationOrdersSummaryPanelProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
          Cert & Orders
        </h3>
      </div>

      <SidebarItem
        icon={Calendar}
        label="Period"
        value={data.certificationPeriod.period.toString()}
        detail={`${data.certificationPeriod.daysRemaining}d`}
        warning={data.certificationPeriod.status === 'expired' || data.certificationPeriod.status === 'expiring-soon'}
        onClick={onViewCertificationPeriod}
      />
      <SidebarItem
        icon={FileCheck}
        label="485"
        value={data.status485.status === 'current' ? 'Current' : 'Action Needed'}
        warning={data.status485.status !== 'current'}
        onClick={onView485}
      />
      <SidebarItem
        icon={FileText}
        label="Orders"
        value={data.openOrders.totalCount.toString()}
        detail={data.openOrders.overdueCount > 0 ? `${data.openOrders.overdueCount} overdue` : undefined}
        warning={data.openOrders.overdueCount > 0}
        onClick={onViewOrders}
      />
      <SidebarItem
        icon={FileSignature}
        label="Signatures"
        value={data.pendingSignatures.totalCount.toString()}
        detail={data.pendingSignatures.overdueCount > 0 ? `${data.pendingSignatures.overdueCount} overdue` : undefined}
        warning={data.pendingSignatures.overdueCount > 0}
        onClick={onViewSignatures}
      />
      <SidebarItem
        icon={AlertTriangle}
        label="Returned"
        value={data.returnedItems.totalCount.toString()}
        detail={data.returnedItems.unresolvedCount > 0 ? `${data.returnedItems.unresolvedCount} unresolved` : undefined}
        warning={data.returnedItems.unresolvedCount > 0}
        onClick={onViewReturnedItems}
      />
      <SidebarItem
        icon={Activity}
        label="Recert"
        value={`${data.recertificationReadiness.score}%`}
        detail={data.recertificationReadiness.status.replace('-', ' ')}
        warning={data.recertificationReadiness.status === 'blocked'}
        onClick={onViewRecertReadiness}
      />
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  value,
  detail,
  warning,
  onClick,
}: {
  icon: any;
  label: string;
  value: string;
  detail?: string;
  warning?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full p-2 rounded transition-all text-left',
        warning ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
          warning ? 'bg-red-100' : 'bg-gray-100'
        )}
      >
        <Icon className={cn('w-3 h-3', warning ? 'text-red-600' : 'text-gray-600')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600">{label}</p>
        <p className={cn('text-sm font-semibold', warning ? 'text-red-900' : 'text-gray-900')}>
          {value}
        </p>
        {detail && (
          <p className={cn('text-xs', warning ? 'text-red-700' : 'text-gray-500')}>{detail}</p>
        )}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockCertificationOrdersSummary(): CertificationOrdersSummary[] {
  return [
    {
      // Good standing admission
      admissionId: 'ADM-12345',
      patientName: 'Margaret Johnson',
      certificationPeriod: {
        period: 1,
        status: 'active',
        startDate: '2024-11-01',
        endDate: '2025-01-30',
        daysRemaining: 45,
        totalDays: 60,
      },
      status485: {
        status: 'current',
        submittedDate: '2024-11-02',
        expirationDate: '2025-01-30',
        daysUntilExpiration: 45,
      },
      openOrders: {
        totalCount: 2,
        overdueCount: 0,
        byType: {
          verbal: 0,
          skilled: 1,
          therapy: 1,
          other: 0,
        },
        oldestDays: 2,
      },
      pendingSignatures: {
        totalCount: 1,
        overdueCount: 0,
        physicianCount: 1,
        documents: [{ type: 'Verbal Order', daysWaiting: 1 }],
      },
      returnedItems: {
        totalCount: 0,
        unresolvedCount: 0,
        byType: [],
      },
      recertificationReadiness: {
        status: 'not-ready',
        score: 35,
        daysUntilDue: 45,
        blockers: [],
        completedItems: 7,
        totalItems: 20,
      },
    },
    {
      // Multiple issues admission
      admissionId: 'ADM-12346',
      patientName: 'Robert Williams',
      certificationPeriod: {
        period: 2,
        status: 'expiring-soon',
        startDate: '2024-10-15',
        endDate: '2024-12-20',
        daysRemaining: 5,
        totalDays: 60,
      },
      status485: {
        status: 'pending-signature',
        submittedDate: '2024-10-16',
        awaitingPhysician: 'Dr. Sarah Mitchell',
        missingSections: [],
      },
      openOrders: {
        totalCount: 8,
        overdueCount: 3,
        byType: {
          verbal: 2,
          skilled: 3,
          therapy: 2,
          other: 1,
        },
        oldestDays: 7,
      },
      pendingSignatures: {
        totalCount: 5,
        overdueCount: 2,
        physicianCount: 3,
        documents: [
          { type: 'Verbal Order', daysWaiting: 5 },
          { type: '485', daysWaiting: 3 },
          { type: 'Visit Note', daysWaiting: 2 },
        ],
      },
      returnedItems: {
        totalCount: 3,
        unresolvedCount: 2,
        byType: [
          { type: 'Visit Note', count: 2 },
          { type: '485', count: 1 },
        ],
        oldestDays: 4,
      },
      recertificationReadiness: {
        status: 'almost-ready',
        score: 75,
        daysUntilDue: 5,
        blockers: ['Pending physician signature on 485'],
        completedItems: 15,
        totalItems: 20,
      },
    },
    {
      // Critical issues admission
      admissionId: 'ADM-12347',
      patientName: 'Patricia Davis',
      certificationPeriod: {
        period: 3,
        status: 'expired',
        startDate: '2024-09-01',
        endDate: '2024-11-30',
        daysRemaining: -15,
        totalDays: 60,
      },
      status485: {
        status: 'expired',
        submittedDate: '2024-09-02',
        expirationDate: '2024-11-30',
        daysUntilExpiration: -15,
      },
      openOrders: {
        totalCount: 12,
        overdueCount: 6,
        byType: {
          verbal: 4,
          skilled: 4,
          therapy: 3,
          other: 1,
        },
        oldestDays: 14,
      },
      pendingSignatures: {
        totalCount: 8,
        overdueCount: 5,
        physicianCount: 4,
        documents: [
          { type: 'Verbal Order', daysWaiting: 12 },
          { type: '485', daysWaiting: 10 },
          { type: 'Visit Note', daysWaiting: 8 },
          { type: 'Assessment', daysWaiting: 6 },
        ],
      },
      returnedItems: {
        totalCount: 6,
        unresolvedCount: 5,
        byType: [
          { type: 'Visit Note', count: 3 },
          { type: '485', count: 2 },
          { type: 'Assessment', count: 1 },
        ],
        oldestDays: 10,
      },
      recertificationReadiness: {
        status: 'blocked',
        score: 25,
        daysUntilDue: -15,
        blockers: [
          'Certification period expired',
          '485 expired',
          '5 returned documents unresolved',
          '5 signatures overdue',
        ],
        completedItems: 5,
        totalItems: 20,
      },
    },
    {
      // Ready for recertification
      admissionId: 'ADM-12348',
      patientName: 'James Anderson',
      certificationPeriod: {
        period: 2,
        status: 'expiring-soon',
        startDate: '2024-10-20',
        endDate: '2024-12-25',
        daysRemaining: 10,
        totalDays: 60,
      },
      status485: {
        status: 'current',
        submittedDate: '2024-10-21',
        expirationDate: '2024-12-25',
        daysUntilExpiration: 10,
      },
      openOrders: {
        totalCount: 1,
        overdueCount: 0,
        byType: {
          verbal: 0,
          skilled: 0,
          therapy: 1,
          other: 0,
        },
        oldestDays: 1,
      },
      pendingSignatures: {
        totalCount: 0,
        overdueCount: 0,
        physicianCount: 0,
        documents: [],
      },
      returnedItems: {
        totalCount: 0,
        unresolvedCount: 0,
        byType: [],
      },
      recertificationReadiness: {
        status: 'ready',
        score: 100,
        daysUntilDue: 10,
        blockers: [],
        completedItems: 20,
        totalItems: 20,
      },
    },
  ];
}
