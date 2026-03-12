/**
 * Alert Severity System
 * 
 * Tiered alert system with severity levels and action requirements.
 * 
 * Severity Levels:
 * - Critical: Requires immediate action, blocks workflow
 * - Warning: Indicates potential problems, suggests action
 * - Informational: Provides context without urgency
 * 
 * Features:
 * - Visual distinction by severity
 * - Action buttons based on urgency
 * - Dismissible/persistent modes
 * - Sound/notification integration
 * - Alert queuing and prioritization
 * 
 * @example
 * ```tsx
 * // Critical alert
 * <Alert
 *   severity="critical"
 *   title="Patient Safety Alert"
 *   message="Drug interaction detected"
 *   actions={[
 *     { label: 'Review Now', onClick: handleReview, variant: 'danger' },
 *     { label: 'Override', onClick: handleOverride }
 *   ]}
 *   persistent
 * />
 * 
 * // Warning alert
 * <Alert
 *   severity="warning"
 *   title="Missing Documentation"
 *   message="Visit notes incomplete"
 *   dismissible
 * />
 * ```
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, AlertCircle, Info, XCircle, CheckCircle, Bell } from 'lucide-react';

// ==================== TYPES ====================

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface AlertConfig {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  actions?: AlertAction[];
  dismissible?: boolean;
  persistent?: boolean; // If true, alert requires explicit action or dismissal
  timestamp?: Date;
  metadata?: Record<string, any>;
  onDismiss?: () => void;
}

// ==================== CONTEXT ====================

interface AlertContextValue {
  alerts: AlertConfig[];
  addAlert: (alert: Omit<AlertConfig, 'id' | 'timestamp'>) => string;
  dismissAlert: (alertId: string) => void;
  clearAlerts: (severity?: AlertSeverity) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
};

// ==================== PROVIDER ====================

interface AlertProviderProps {
  children: React.ReactNode;
  maxAlerts?: number;
  autoDismissTimeout?: number; // milliseconds (0 = no auto-dismiss)
}

export const AlertProvider: React.FC<AlertProviderProps> = ({
  children,
  maxAlerts = 10,
  autoDismissTimeout = 0
}) => {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);

  const addAlert = useCallback((alert: Omit<AlertConfig, 'id' | 'timestamp'>) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: AlertConfig = {
      ...alert,
      id,
      timestamp: new Date()
    };

    setAlerts(prev => {
      // Critical alerts go to front, others to back
      const updated = alert.severity === 'critical'
        ? [newAlert, ...prev]
        : [...prev, newAlert];
      
      // Limit total alerts
      return updated.slice(0, maxAlerts);
    });

    // Auto-dismiss if configured and alert is dismissible
    if (autoDismissTimeout > 0 && alert.dismissible && !alert.persistent) {
      setTimeout(() => {
        dismissAlert(id);
      }, autoDismissTimeout);
    }

    return id;
  }, [maxAlerts, autoDismissTimeout]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => {
      const alert = prev.find(a => a.id === alertId);
      if (alert?.onDismiss) {
        alert.onDismiss();
      }
      return prev.filter(a => a.id !== alertId);
    });
  }, []);

  const clearAlerts = useCallback((severity?: AlertSeverity) => {
    setAlerts(prev => {
      if (severity) {
        return prev.filter(a => a.severity !== severity);
      }
      return [];
    });
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, dismissAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};

// ==================== ALERT COMPONENT ====================

interface AlertProps extends Omit<AlertConfig, 'id' | 'timestamp'> {
  onDismiss?: () => void;
  compact?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  severity,
  title,
  message,
  actions,
  dismissible = true,
  persistent = false,
  compact = false,
  onDismiss,
  metadata
}) => {
  const getSeverityConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          messageColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-800'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          messageColor: 'text-green-800'
        };
      default: // info
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-800'
        };
    }
  };

  const config = getSeverityConfig();
  const Icon = config.icon;

  const getActionButtonClasses = (variant: AlertAction['variant'] = 'secondary') => {
    const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors';
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
      default: // secondary
        return `${baseClasses} bg-white hover:bg-gray-50 text-gray-700 border border-gray-300`;
    }
  };

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg ${
        compact ? 'p-3' : 'p-4'
      } ${persistent ? 'shadow-lg' : ''}`}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Icon className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold ${config.titleColor}`}>
                {title}
                {severity === 'critical' && (
                  <span className="ml-2 text-xs font-bold uppercase tracking-wider">
                    ACTION REQUIRED
                  </span>
                )}
              </h3>
              
              <p className={`${compact ? 'text-xs' : 'text-sm'} ${config.messageColor} mt-1`}>
                {message}
              </p>
            </div>
            
            {dismissible && !persistent && onDismiss && (
              <button
                onClick={onDismiss}
                className={`flex-shrink-0 ${config.iconColor} hover:opacity-75 transition-opacity`}
                aria-label="Dismiss alert"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`${getActionButtonClasses(action.variant)} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== ALERT BANNER ====================

interface AlertBannerProps {
  severity: AlertSeverity;
  message: string;
  action?: AlertAction;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  severity,
  message,
  action,
  onDismiss,
  position = 'top'
}) => {
  const getBannerClasses = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-gray-900';
      case 'success':
        return 'bg-green-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 ${getBannerClasses()} px-4 py-3 shadow-lg`}
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1">{message}</p>
        
        <div className="flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
            >
              {action.label}
            </button>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="hover:opacity-75 transition-opacity"
              aria-label="Dismiss"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== ALERT QUEUE ====================

interface AlertQueueProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({
  position = 'top-right',
  maxVisible = 5
}) => {
  const { alerts, dismissAlert } = useAlerts();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  const visibleAlerts = alerts.slice(0, maxVisible);

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-96 space-y-3`}>
      {visibleAlerts.map(alert => (
        <Alert
          key={alert.id}
          severity={alert.severity}
          title={alert.title}
          message={alert.message}
          actions={alert.actions}
          dismissible={alert.dismissible}
          persistent={alert.persistent}
          onDismiss={() => dismissAlert(alert.id)}
          metadata={alert.metadata}
        />
      ))}
      
      {alerts.length > maxVisible && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600">
            +{alerts.length - maxVisible} more alerts
          </p>
        </div>
      )}
    </div>
  );
};

// ==================== INLINE ALERT ====================

interface InlineAlertProps {
  severity: AlertSeverity;
  message: string;
  compact?: boolean;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  severity,
  message,
  compact = false
}) => {
  const getConfig = () => {
    switch (severity) {
      case 'critical':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' };
      case 'warning':
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'success':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      default:
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-start gap-2 ${config.bg} ${compact ? 'px-2 py-1' : 'px-3 py-2'} rounded-lg`}>
      <Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${config.color} flex-shrink-0 ${compact ? 'mt-0' : 'mt-0.5'}`} />
      <p className={`${compact ? 'text-xs' : 'text-sm'} ${config.color} font-medium`}>
        {message}
      </p>
    </div>
  );
};

// ==================== NOTIFICATION BADGE ====================

interface NotificationBadgeProps {
  count: number;
  severity?: AlertSeverity;
  onClick?: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  severity = 'info',
  onClick
}) => {
  if (count === 0) {
    return null;
  }

  const getColorClasses = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-gray-900';
      case 'success':
        return 'bg-green-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label={`${count} notifications`}
    >
      <Bell className="w-6 h-6 text-gray-600" />
      
      <span
        className={`absolute top-0 right-0 ${getColorClasses()} text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5`}
      >
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
};

// ==================== HOOKS ====================

export const useAlert = () => {
  const { addAlert } = useAlerts();

  return {
    critical: (title: string, message: string, options?: Partial<AlertConfig>) =>
      addAlert({ severity: 'critical', title, message, persistent: true, ...options }),

    warning: (title: string, message: string, options?: Partial<AlertConfig>) =>
      addAlert({ severity: 'warning', title, message, dismissible: true, ...options }),

    info: (title: string, message: string, options?: Partial<AlertConfig>) =>
      addAlert({ severity: 'info', title, message, dismissible: true, ...options }),

    success: (title: string, message: string, options?: Partial<AlertConfig>) =>
      addAlert({ severity: 'success', title, message, dismissible: true, ...options })
  };
};
