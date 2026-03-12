/**
 * Orders & Certification Smart Alerts Component
 * 
 * Intelligent alert system for orders and certification workflows displaying
 * severity, issue description, suggested actions, and quick action buttons.
 * Alerts appear in workspaces, admission dashboards, orders queues, and
 * notification centers to proactively surface critical issues.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  FileText,
  FileSignature,
  Calendar,
  XCircle,
  ChevronRight,
  CheckCircle,
  Edit,
  Send,
  Eye,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType =
  | 'signature-overdue'
  | '485-missing-sections'
  | 'recertification-due-soon'
  | 'returned-document'
  | 'order-expired-unsigned';

export interface OrdersCertificationAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  suggestedAction: string;
  actionLabel: string;
  metadata?: {
    patientName?: string;
    admissionId?: string;
    documentId?: string;
    documentType?: string;
    daysOverdue?: number;
    daysUntilDue?: number;
    missingSections?: string[];
    physicianName?: string;
    orderDate?: string;
    expirationDate?: string;
  };
  timestamp: string;
  dismissed?: boolean;
}

export type DisplayVariant = 'full' | 'compact' | 'inline';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    icon: any;
    color: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
    iconClass: string;
    badgeClass: string;
  }
> = {
  critical: {
    icon: AlertTriangle,
    color: '#EF4444',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-300',
    textClass: 'text-red-700',
    iconClass: 'text-red-600',
    badgeClass: 'bg-red-100 text-red-700 border-red-300',
  },
  warning: {
    icon: AlertCircle,
    color: '#F59E0B',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-700',
    iconClass: 'text-amber-600',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300',
  },
  info: {
    icon: Info,
    color: '#3B82F6',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-300',
    textClass: 'text-blue-700',
    iconClass: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
  },
};

const ALERT_TYPE_CONFIG: Record<
  AlertType,
  {
    defaultSeverity: AlertSeverity;
    icon: any;
    category: string;
  }
> = {
  'signature-overdue': {
    defaultSeverity: 'critical',
    icon: FileSignature,
    category: 'Signature',
  },
  '485-missing-sections': {
    defaultSeverity: 'warning',
    icon: FileText,
    category: '485 Form',
  },
  'recertification-due-soon': {
    defaultSeverity: 'warning',
    icon: Calendar,
    category: 'Recertification',
  },
  'returned-document': {
    defaultSeverity: 'critical',
    icon: XCircle,
    category: 'Returned Document',
  },
  'order-expired-unsigned': {
    defaultSeverity: 'critical',
    icon: Clock,
    category: 'Order',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OrdersCertificationAlertProps {
  alert: OrdersCertificationAlert;
  variant?: DisplayVariant;
  onAction?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  showDismiss?: boolean;
}

export default function OrdersCertificationAlertComponent({
  alert,
  variant = 'full',
  onAction,
  onDismiss,
  showDismiss = true,
}: OrdersCertificationAlertProps) {
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const typeConfig = ALERT_TYPE_CONFIG[alert.type];
  const SeverityIcon = severityConfig.icon;
  const TypeIcon = typeConfig.icon;

  if (variant === 'compact') {
    return (
      <CompactAlertView
        alert={alert}
        severityConfig={severityConfig}
        typeConfig={typeConfig}
        onAction={onAction}
        onDismiss={onDismiss}
        showDismiss={showDismiss}
      />
    );
  }

  if (variant === 'inline') {
    return (
      <InlineAlertView
        alert={alert}
        severityConfig={severityConfig}
        typeConfig={typeConfig}
        onAction={onAction}
      />
    );
  }

  // Full variant (default)
  return (
    <Card
      className={cn(
        'p-4 border-l-4 transition-all hover:shadow-md',
        severityConfig.bgClass,
        severityConfig.borderClass
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            alert.severity === 'critical' ? 'bg-red-100' : 'bg-amber-100'
          )}
        >
          <SeverityIcon className={cn('w-5 h-5', severityConfig.iconClass)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={severityConfig.badgeClass}>
                {alert.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                <TypeIcon className="w-3 h-3 mr-1" />
                {typeConfig.category}
              </Badge>
            </div>
            {showDismiss && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
                className="h-6 w-6 p-0 -mt-1 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Title */}
          <h4 className={cn('font-semibold mb-1', severityConfig.textClass)}>{alert.title}</h4>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-3">{alert.description}</p>

          {/* Metadata */}
          {alert.metadata && (
            <AlertMetadata alert={alert} severityConfig={severityConfig} />
          )}

          {/* Suggested Action */}
          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Suggested Action:</p>
                <p className="text-sm text-gray-900">{alert.suggestedAction}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onAction?.(alert.id)}
              className={cn(
                alert.severity === 'critical'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              )}
            >
              {alert.actionLabel}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-500 mt-3">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT ALERT VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface CompactAlertViewProps {
  alert: OrdersCertificationAlert;
  severityConfig: any;
  typeConfig: any;
  onAction?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  showDismiss: boolean;
}

function CompactAlertView({
  alert,
  severityConfig,
  typeConfig,
  onAction,
  onDismiss,
  showDismiss,
}: CompactAlertViewProps) {
  const SeverityIcon = severityConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        severityConfig.bgClass,
        severityConfig.borderClass
      )}
    >
      <SeverityIcon className={cn('w-5 h-5 flex-shrink-0', severityConfig.iconClass)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={cn(severityConfig.badgeClass, 'text-xs')}>
            {alert.severity.toUpperCase()}
          </Badge>
          <TypeIcon className="w-3 h-3 text-gray-600" />
          <span className="text-xs text-gray-600">{typeConfig.category}</span>
        </div>
        <p className={cn('font-medium text-sm', severityConfig.textClass)}>{alert.title}</p>
      </div>
      <Button size="sm" onClick={() => onAction?.(alert.id)} className="flex-shrink-0">
        {alert.actionLabel}
      </Button>
      {showDismiss && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(alert.id)}
          className="h-8 w-8 p-0 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE ALERT VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface InlineAlertViewProps {
  alert: OrdersCertificationAlert;
  severityConfig: any;
  typeConfig: any;
  onAction?: (alertId: string) => void;
}

function InlineAlertView({
  alert,
  severityConfig,
  typeConfig,
  onAction,
}: InlineAlertViewProps) {
  const SeverityIcon = severityConfig.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded border',
        severityConfig.bgClass,
        severityConfig.borderClass
      )}
    >
      <SeverityIcon className={cn('w-4 h-4 flex-shrink-0', severityConfig.iconClass)} />
      <p className={cn('text-sm font-medium flex-1', severityConfig.textClass)}>
        {alert.title}
      </p>
      <Button size="sm" variant="ghost" onClick={() => onAction?.(alert.id)}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT METADATA
// ═══════════════════════════════════════════════════════════════════════════

function AlertMetadata({
  alert,
  severityConfig,
}: {
  alert: OrdersCertificationAlert;
  severityConfig: any;
}) {
  const { metadata } = alert;
  if (!metadata) return null;

  return (
    <div className="mb-3 text-sm">
      {metadata.patientName && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-600">Patient:</span>
          <span className="font-semibold text-gray-900">{metadata.patientName}</span>
          {metadata.admissionId && (
            <span className="text-xs text-gray-500">({metadata.admissionId})</span>
          )}
        </div>
      )}
      {metadata.documentType && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-600">Document:</span>
          <span className="font-semibold text-gray-900">{metadata.documentType}</span>
          {metadata.documentId && (
            <span className="text-xs text-gray-500">({metadata.documentId})</span>
          )}
        </div>
      )}
      {metadata.physicianName && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-600">Physician:</span>
          <span className="font-semibold text-gray-900">{metadata.physicianName}</span>
        </div>
      )}
      {metadata.daysOverdue !== undefined && metadata.daysOverdue > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-red-600" />
          <span className={severityConfig.textClass}>
            <strong>{metadata.daysOverdue}</strong> day{metadata.daysOverdue !== 1 ? 's' : ''}{' '}
            overdue
          </span>
        </div>
      )}
      {metadata.daysUntilDue !== undefined && metadata.daysUntilDue > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className={severityConfig.textClass}>
            Due in <strong>{metadata.daysUntilDue}</strong> day
            {metadata.daysUntilDue !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      {metadata.missingSections && metadata.missingSections.length > 0 && (
        <div className="mb-1">
          <p className="text-gray-600 mb-1">Missing sections:</p>
          <ul className="ml-4 space-y-0.5">
            {metadata.missingSections.map((section, idx) => (
              <li key={idx} className="text-xs text-gray-700 list-disc">
                {section}
              </li>
            ))}
          </ul>
        </div>
      )}
      {metadata.orderDate && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-600">Order Date:</span>
          <span className="text-gray-900">{new Date(metadata.orderDate).toLocaleDateString()}</span>
        </div>
      )}
      {metadata.expirationDate && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-600">Expiration:</span>
          <span className="text-gray-900">
            {new Date(metadata.expirationDate).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS LIST COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OrdersCertificationAlertsListProps {
  alerts: OrdersCertificationAlert[];
  variant?: DisplayVariant;
  onAction?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  showDismiss?: boolean;
  maxDisplay?: number;
}

export function OrdersCertificationAlertsList({
  alerts,
  variant = 'full',
  onAction,
  onDismiss,
  showDismiss = true,
  maxDisplay,
}: OrdersCertificationAlertsListProps) {
  const displayedAlerts = maxDisplay ? alerts.slice(0, maxDisplay) : alerts;
  const hasMore = maxDisplay && alerts.length > maxDisplay;

  if (alerts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
        <h3 className="font-semibold text-gray-900 mb-1">No Active Alerts</h3>
        <p className="text-sm text-gray-600">All orders and certifications are in good standing</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {displayedAlerts.map((alert) => (
        <OrdersCertificationAlertComponent
          key={alert.id}
          alert={alert}
          variant={variant}
          onAction={onAction}
          onDismiss={onDismiss}
          showDismiss={showDismiss}
        />
      ))}
      {hasMore && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-600">
            +{alerts.length - maxDisplay} more alert{alerts.length - maxDisplay !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERTS SUMMARY BANNER
// ═══════════════════════════════════════════════════════════════════════════

interface AlertsSummaryBannerProps {
  alerts: OrdersCertificationAlert[];
  onViewAll?: () => void;
}

export function AlertsSummaryBanner({ alerts, onViewAll }: AlertsSummaryBannerProps) {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  if (alerts.length === 0) return null;

  const hasCritical = criticalCount > 0;

  return (
    <Card
      className={cn(
        'p-4 border-l-4',
        hasCritical
          ? 'bg-red-50 border-red-400'
          : 'bg-amber-50 border-amber-400'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            hasCritical ? 'bg-red-100' : 'bg-amber-100'
          )}
        >
          <AlertTriangle
            className={cn('w-5 h-5', hasCritical ? 'text-red-600' : 'text-amber-600')}
          />
        </div>
        <div className="flex-1">
          <h4 className={cn('font-semibold mb-1', hasCritical ? 'text-red-900' : 'text-amber-900')}>
            {alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''} - Action Required
          </h4>
          <p className={cn('text-sm', hasCritical ? 'text-red-700' : 'text-amber-700')}>
            {criticalCount > 0 && (
              <span>
                <strong>{criticalCount}</strong> critical
              </span>
            )}
            {criticalCount > 0 && warningCount > 0 && <span>, </span>}
            {warningCount > 0 && (
              <span>
                <strong>{warningCount}</strong> warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onViewAll}
          className={cn(
            hasCritical
              ? 'border-red-300 text-red-700 hover:bg-red-100'
              : 'border-amber-300 text-amber-700 hover:bg-amber-100'
          )}
        >
          View All Alerts
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockOrdersCertificationAlerts(): OrdersCertificationAlert[] {
  return [
    {
      id: 'alert-1',
      type: 'signature-overdue',
      severity: 'critical',
      title: 'Physician Signature Overdue',
      description:
        'Verbal order from Dr. Sarah Mitchell has not been signed within the required 48-hour timeframe.',
      suggestedAction:
        'Contact Dr. Mitchell immediately to obtain signature. Document may require revision if not signed within regulatory deadline.',
      actionLabel: 'Request Signature',
      metadata: {
        patientName: 'Margaret Johnson',
        admissionId: 'ADM-12345',
        documentId: 'VO-2024-789',
        documentType: 'Verbal Order - Medication Change',
        daysOverdue: 3,
        physicianName: 'Dr. Sarah Mitchell',
        orderDate: '2024-12-10',
      },
      timestamp: '2024-12-15T08:30:00Z',
    },
    {
      id: 'alert-2',
      type: '485-missing-sections',
      severity: 'warning',
      title: '485 Form Missing Required Sections',
      description:
        'Plan of Care (485) is incomplete and cannot be submitted. Multiple required sections need completion.',
      suggestedAction:
        'Complete all missing sections before submitting to CMS. Review care plan goals and physician orders for accuracy.',
      actionLabel: 'Complete 485',
      metadata: {
        patientName: 'Robert Williams',
        admissionId: 'ADM-12346',
        documentId: '485-2024-156',
        documentType: 'Plan of Care (485)',
        missingSections: [
          'Functional Limitations',
          'Safety Measures',
          'Discharge Plans',
          'Medication List (Section K)',
        ],
      },
      timestamp: '2024-12-15T09:15:00Z',
    },
    {
      id: 'alert-3',
      type: 'recertification-due-soon',
      severity: 'warning',
      title: 'Recertification Due Soon',
      description:
        'Patient recertification is due in 7 days. Begin preparation of recertification documents and physician orders.',
      suggestedAction:
        'Schedule recertification visit, prepare updated 485, and obtain physician recertification orders before due date.',
      actionLabel: 'Start Recertification',
      metadata: {
        patientName: 'Patricia Davis',
        admissionId: 'ADM-12347',
        daysUntilDue: 7,
      },
      timestamp: '2024-12-15T10:00:00Z',
    },
    {
      id: 'alert-4',
      type: 'returned-document',
      severity: 'critical',
      title: 'Returned Document Awaiting Correction',
      description:
        'Visit note was returned by QA for correction. Missing required assessment fields and patient vital signs.',
      suggestedAction:
        'Review QA feedback, add missing vital signs and assessment data, and resubmit for approval within 24 hours.',
      actionLabel: 'Correct Document',
      metadata: {
        patientName: 'Margaret Johnson',
        admissionId: 'ADM-12345',
        documentId: 'VN-2024-445',
        documentType: 'Skilled Nursing Visit Note',
        daysOverdue: 2,
      },
      timestamp: '2024-12-15T11:20:00Z',
    },
    {
      id: 'alert-5',
      type: 'order-expired-unsigned',
      severity: 'critical',
      title: 'Order Expired Before Physician Signature',
      description:
        'Physical therapy order expired on 12/12/2024 before physician signature was obtained. Services cannot continue without valid order.',
      suggestedAction:
        'Obtain new physician order immediately. PT visits may need to be held until new signed order is in place.',
      actionLabel: 'Request New Order',
      metadata: {
        patientName: 'James Anderson',
        admissionId: 'ADM-12348',
        documentId: 'ORD-2024-223',
        documentType: 'Physical Therapy Order',
        physicianName: 'Dr. Michael Chen',
        orderDate: '2024-11-15',
        expirationDate: '2024-12-12',
        daysOverdue: 3,
      },
      timestamp: '2024-12-15T12:45:00Z',
    },
    {
      id: 'alert-6',
      type: 'signature-overdue',
      severity: 'critical',
      title: '485 Signature Overdue',
      description:
        '485 Plan of Care has been waiting for physician signature for 5 days. Medicare requires signature within 30 days of start of care.',
      suggestedAction:
        'Send urgent reminder to physician. Escalate to office manager if no response within 24 hours.',
      actionLabel: 'Send Reminder',
      metadata: {
        patientName: 'Robert Williams',
        admissionId: 'ADM-12346',
        documentId: '485-2024-156',
        documentType: 'Plan of Care (485)',
        daysOverdue: 5,
        physicianName: 'Dr. Lisa Rodriguez',
      },
      timestamp: '2024-12-15T14:10:00Z',
    },
  ];
}
