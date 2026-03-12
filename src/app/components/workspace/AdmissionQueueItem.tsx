/**
 * Admission Queue Card Component
 * 
 * Displays admission-level queue items for workspace queues:
 * - Admissions missing required fields
 * - Admissions missing authorization
 * - Admissions missing physician signature
 * - Admissions missing documentation
 * - Admissions ready for billing
 * 
 * Each item shows:
 * - Patient name
 * - Admission start date
 * - Primary payer
 * - Assigned coordinator
 * - Current issue
 */
import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  AlertTriangle,
  Clock,
  User,
  CreditCard,
  Calendar,
  FileText,
  ShieldCheck,
  FileCheck,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export type AdmissionQueueType =
  | 'missing_fields'
  | 'missing_authorization'
  | 'missing_signature'
  | 'missing_documentation'
  | 'ready_for_billing'
  | 'pending_review'
  | 'incomplete';

export type AdmissionQueuePriority = 'critical' | 'high' | 'medium' | 'low';

interface AdmissionQueueItemProps {
  // Admission info
  admissionId: string;
  patientName: string;
  patientMRN: string;
  admissionStartDate: string;
  primaryPayer: string;
  assignedCoordinator?: string;

  // Issue details
  queueType: AdmissionQueueType;
  currentIssue: string;
  issueDetails?: string[];
  priority?: AdmissionQueuePriority;
  daysOverdue?: number;

  // Actions
  onClick?: () => void;
  onResolve?: () => void;
  className?: string;
}

const queueTypeConfig: Record<
  AdmissionQueueType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  missing_fields: {
    label: 'Missing Required Fields',
    icon: FileText,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-l-amber-500',
  },
  missing_authorization: {
    label: 'Missing Authorization',
    icon: ShieldCheck,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-l-red-500',
  },
  missing_signature: {
    label: 'Missing Physician Signature',
    icon: FileCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-l-purple-500',
  },
  missing_documentation: {
    label: 'Missing Documentation',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-l-orange-500',
  },
  ready_for_billing: {
    label: 'Ready for Billing',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-l-green-500',
  },
  pending_review: {
    label: 'Pending Review',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-l-blue-500',
  },
  incomplete: {
    label: 'Incomplete Admission',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-l-red-500',
  },
};

const priorityConfig: Record<
  AdmissionQueuePriority,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertCircle,
  },
  medium: {
    label: 'Medium',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: CheckCircle2,
  },
};

export const AdmissionQueueItem = React.memo(
  ({
    admissionId,
    patientName,
    patientMRN,
    admissionStartDate,
    primaryPayer,
    assignedCoordinator,
    queueType,
    currentIssue,
    issueDetails,
    priority = 'medium',
    daysOverdue,
    onClick,
    onResolve,
    className = '',
  }: AdmissionQueueItemProps) => {
    const config = queueTypeConfig[queueType];
    const Icon = config.icon;
    const priorityStyle = priorityConfig[priority];
    const PriorityIcon = priorityStyle.icon;

    const formattedDate = new Date(admissionStartDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Card
        className={`border-l-4 ${config.borderColor} ${config.bgColor} hover:shadow-md transition-all cursor-pointer ${className}`}
        onClick={onClick}
      >
        <div className="p-4">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Icon */}
              <div className={`p-2 rounded-lg bg-white flex-shrink-0`}>
                <Icon className={`size-5 ${config.color}`} />
              </div>

              {/* Patient Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{patientName}</h4>
                <p className="text-xs text-gray-600 mt-0.5">MRN: {patientMRN}</p>
              </div>
            </div>

            {/* Priority Badge */}
            <Badge className={`${priorityStyle.color} border text-xs flex items-center gap-1 flex-shrink-0 ml-2`}>
              <PriorityIcon className="size-3" />
              {priorityStyle.label}
            </Badge>
          </div>

          {/* Issue Description */}
          <div className="mb-3 bg-white rounded-lg p-2.5 border border-gray-100">
            <div className="flex items-start gap-2">
              <AlertCircle className={`size-4 ${config.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{currentIssue}</p>
                {issueDetails && issueDetails.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {issueDetails.map((detail, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-gray-400 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Admission Details Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {/* Admission Start Date */}
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="size-3.5 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500">Admission</p>
                <p className="font-medium text-gray-900 truncate">{formattedDate}</p>
              </div>
            </div>

            {/* Primary Payer */}
            <div className="flex items-center gap-1.5 text-xs">
              <CreditCard className="size-3.5 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-500">Payer</p>
                <p className="font-medium text-gray-900 truncate">{primaryPayer}</p>
              </div>
            </div>

            {/* Assigned Coordinator */}
            {assignedCoordinator && (
              <div className="flex items-center gap-1.5 text-xs">
                <User className="size-3.5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500">Coordinator</p>
                  <p className="font-medium text-gray-900 truncate">{assignedCoordinator}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Row */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              {/* Queue Type Badge */}
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                {config.label}
              </Badge>

              {/* Days Overdue */}
              {daysOverdue !== undefined && daysOverdue > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <Clock className="size-3" />
                  <span className="font-medium">{daysOverdue} days overdue</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
              >
                View Details
              </Button>
              {onResolve && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve();
                  }}
                >
                  Resolve
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

AdmissionQueueItem.displayName = 'AdmissionQueueItem';

// Admission Queue List Component
interface AdmissionQueueListProps {
  title: string;
  description?: string;
  items: AdmissionQueueItemProps[];
  emptyMessage?: string;
  loading?: boolean;
  onViewAll?: () => void;
  maxItems?: number;
}

export function AdmissionQueueList({
  title,
  description,
  items,
  emptyMessage = 'No items in this queue',
  loading = false,
  onViewAll,
  maxItems,
}: AdmissionQueueListProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const hasMore = maxItems && items.length > maxItems;

  if (loading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <Clock className="size-5 animate-spin" />
            <span className="text-sm">Loading queue...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
        </div>
        {items.length > 0 && (
          <Badge variant="secondary" className="text-sm">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        )}
      </div>

      {/* Items */}
      {displayItems.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <CheckCircle2 className="size-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900">{emptyMessage}</p>
            <p className="text-xs text-gray-600 mt-1">All admissions in this queue are up to date</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayItems.map((item) => (
            <AdmissionQueueItem key={item.admissionId} {...item} />
          ))}

          {/* View All Button */}
          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onViewAll}
            >
              View All {items.length} Items
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
