/**
 * Healthcare Design System - Authorization Warning
 * Displays critical authorization alerts and actions
 */
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { AlertTriangle, Clock, X } from 'lucide-react';

export type AuthWarningType = 'missing' | 'expiring' | 'expired' | 'visits_low';

interface AuthorizationWarningProps {
  type: AuthWarningType;
  patientName: string;
  payerName?: string;
  expirationDate?: string;
  visitsRemaining?: number;
  authorizationNumber?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const warningConfig: Record<AuthWarningType, {
  title: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive';
}> = {
  missing: {
    title: 'Authorization Missing',
    icon: <AlertTriangle className="size-5" />,
    variant: 'destructive',
  },
  expiring: {
    title: 'Authorization Expiring Soon',
    icon: <Clock className="size-5" />,
    variant: 'default',
  },
  expired: {
    title: 'Authorization Expired',
    icon: <AlertTriangle className="size-5" />,
    variant: 'destructive',
  },
  visits_low: {
    title: 'Authorized Visits Running Low',
    icon: <AlertTriangle className="size-5" />,
    variant: 'default',
  },
};

export const AuthorizationWarning = React.memo(({
  type,
  patientName,
  payerName,
  expirationDate,
  visitsRemaining,
  authorizationNumber,
  onAction,
  onDismiss,
  className = '',
}: AuthorizationWarningProps) => {
  const config = warningConfig[type];

  const getMessage = () => {
    switch (type) {
      case 'missing':
        return `Authorization required for ${patientName}${payerName ? ` (${payerName})` : ''} but not on file. Care delivery may be impacted.`;
      case 'expiring':
        return `Authorization ${authorizationNumber ? `#${authorizationNumber} ` : ''}for ${patientName} expires on ${expirationDate}. Request renewal to avoid service interruption.`;
      case 'expired':
        return `Authorization ${authorizationNumber ? `#${authorizationNumber} ` : ''}for ${patientName} expired on ${expirationDate}. Visits may not be reimbursable.`;
      case 'visits_low':
        return `Only ${visitsRemaining} authorized visit${visitsRemaining === 1 ? '' : 's'} remaining for ${patientName}. Request additional visits to continue care.`;
      default:
        return '';
    }
  };

  return (
    <Alert variant={config.variant} className={`relative ${className}`}>
      {config.icon}
      <AlertTitle className="flex items-center gap-2">
        {config.title}
        {type === 'expiring' && <Badge variant="warning" className="text-xs">Action Required</Badge>}
        {type === 'visits_low' && <Badge variant="warning" className="text-xs">Low Visits</Badge>}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {getMessage()}
      </AlertDescription>
      <div className="mt-4 flex items-center gap-3">
        {onAction && (
          <Button size="sm" variant={config.variant === 'destructive' ? 'default' : 'outline'} onClick={onAction}>
            {type === 'missing' ? 'Add Authorization' : 'Request Renewal'}
          </Button>
        )}
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X className="size-4 mr-1" />
            Dismiss
          </Button>
        )}
      </div>
    </Alert>
  );
});

AuthorizationWarning.displayName = 'AuthorizationWarning';