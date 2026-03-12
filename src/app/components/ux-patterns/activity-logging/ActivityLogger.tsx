/**
 * Activity Logger
 * 
 * Automatic activity logging system for audit trails and timelines.
 * Logs actions such as document edits, status changes, order submissions, etc.
 * 
 * Features:
 * - Automatic action logging
 * - Timeline visualization
 * - Audit trail generation
 * - Filterable activity history
 * 
 * @example
 * ```tsx
 * // Log an activity
 * logActivity({
 *   type: 'document_edit',
 *   entity: 'clinical_note',
 *   entityId: 'note-123',
 *   userId: 'user-456',
 *   description: 'Updated clinical assessment',
 *   metadata: { section: 'vitals', changes: ['blood_pressure'] }
 * });
 * 
 * // Display activity timeline
 * <ActivityTimeline
 *   entityId="patient-123"
 *   entityType="patient"
 *   filters={['document_edit', 'status_change']}
 * />
 * ```
 */

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { Clock, FileEdit, AlertCircle, Send, Settings, User, CheckCircle } from 'lucide-react';

// ==================== TYPES ====================

export type ActivityType =
  | 'document_edit'
  | 'document_create'
  | 'status_change'
  | 'order_submission'
  | 'integration_sync'
  | 'user_action'
  | 'system_event'
  | 'approval'
  | 'rejection';

export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: ActivityType;
  entity: string; // e.g., 'clinical_note', 'order', 'patient'
  entityId: string;
  userId: string;
  userName: string;
  description: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
}

export interface LogActivityParams {
  type: ActivityType;
  entity: string;
  entityId: string;
  userId: string;
  userName?: string;
  description: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
}

// ==================== CONTEXT ====================

interface ActivityLoggerContextValue {
  logs: ActivityLog[];
  logActivity: (params: LogActivityParams) => Promise<void>;
  getActivityForEntity: (entityType: string, entityId: string) => ActivityLog[];
  clearLogs: () => void;
}

const ActivityLoggerContext = createContext<ActivityLoggerContextValue | null>(null);

export const useActivityLogger = () => {
  const context = useContext(ActivityLoggerContext);
  if (!context) {
    throw new Error('useActivityLogger must be used within ActivityLoggerProvider');
  }
  return context;
};

// ==================== PROVIDER ====================

interface ActivityLoggerProviderProps {
  children: React.ReactNode;
  persistToServer?: boolean; // If true, logs are sent to backend
  onLog?: (log: ActivityLog) => void;
}

export const ActivityLoggerProvider: React.FC<ActivityLoggerProviderProps> = ({
  children,
  persistToServer = false,
  onLog
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const logActivity = useCallback(async (params: LogActivityParams) => {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: params.type,
      entity: params.entity,
      entityId: params.entityId,
      userId: params.userId,
      userName: params.userName || 'Unknown User',
      description: params.description,
      metadata: params.metadata,
      severity: params.severity || 'info'
    };

    setLogs(prev => [log, ...prev].slice(0, 1000)); // Keep last 1000 logs

    // Call custom handler
    if (onLog) {
      onLog(log);
    }

    // Persist to server if enabled
    if (persistToServer) {
      try {
        // TODO: Send to backend API
        console.log('[ActivityLogger] Persisting log to server:', log);
      } catch (error) {
        console.error('[ActivityLogger] Failed to persist log:', error);
      }
    }
  }, [persistToServer, onLog]);

  const getActivityForEntity = useCallback((entityType: string, entityId: string) => {
    return logs.filter(log => log.entity === entityType && log.entityId === entityId);
  }, [logs]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <ActivityLoggerContext.Provider value={{ logs, logActivity, getActivityForEntity, clearLogs }}>
      {children}
    </ActivityLoggerContext.Provider>
  );
};

// ==================== TIMELINE COMPONENT ====================

interface ActivityTimelineProps {
  entityType: string;
  entityId: string;
  filters?: ActivityType[];
  maxItems?: number;
  showUser?: boolean;
  compact?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  entityType,
  entityId,
  filters,
  maxItems = 50,
  showUser = true,
  compact = false
}) => {
  const { getActivityForEntity } = useActivityLogger();
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    let filtered = getActivityForEntity(entityType, entityId);
    
    if (filters && filters.length > 0) {
      filtered = filtered.filter(log => filters.includes(log.type));
    }
    
    setActivities(filtered.slice(0, maxItems));
  }, [entityType, entityId, filters, maxItems, getActivityForEntity]);

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'document_edit':
      case 'document_create':
        return FileEdit;
      case 'status_change':
        return AlertCircle;
      case 'order_submission':
        return Send;
      case 'integration_sync':
        return Settings;
      case 'approval':
        return CheckCircle;
      case 'user_action':
      default:
        return User;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getIcon(activity.type);
        
        return (
          <div
            key={activity.id}
            className={`flex gap-3 ${compact ? 'py-2' : 'py-3'} ${
              index !== activities.length - 1 ? 'border-b border-gray-200' : ''
            }`}
          >
            <div className={`flex-shrink-0 ${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-blue-100 flex items-center justify-center`}>
              <Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`${compact ? 'text-sm' : 'text-base'} text-gray-900`}>
                {activity.description}
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                {showUser && (
                  <span className="text-xs text-gray-600">{activity.userName}</span>
                )}
                <span className="text-xs text-gray-400">
                  {formatTimestamp(activity.timestamp)}
                </span>
                {activity.severity === 'critical' && (
                  <span className="text-xs text-red-600 font-medium">Critical</span>
                )}
                {activity.severity === 'warning' && (
                  <span className="text-xs text-yellow-600 font-medium">Warning</span>
                )}
              </div>
              
              {activity.metadata && !compact && (
                <div className="mt-2 text-xs text-gray-500">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==================== AUDIT TABLE ====================

interface ActivityAuditTableProps {
  activities: ActivityLog[];
  onActivityClick?: (activity: ActivityLog) => void;
}

export const ActivityAuditTable: React.FC<ActivityAuditTableProps> = ({
  activities,
  onActivityClick
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entity
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.map(activity => (
            <tr
              key={activity.id}
              onClick={() => onActivityClick?.(activity)}
              className={onActivityClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.timestamp.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {activity.type.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {activity.userName}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {activity.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.entity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==================== HOOK FOR EASY LOGGING ====================

export const useActivityLog = () => {
  const { logActivity } = useActivityLogger();

  return {
    logDocumentEdit: (entityId: string, userId: string, userName: string, changes: string[]) =>
      logActivity({
        type: 'document_edit',
        entity: 'document',
        entityId,
        userId,
        userName,
        description: `Edited document: ${changes.join(', ')}`,
        metadata: { changes }
      }),

    logStatusChange: (entity: string, entityId: string, userId: string, userName: string, from: string, to: string) =>
      logActivity({
        type: 'status_change',
        entity,
        entityId,
        userId,
        userName,
        description: `Status changed from "${from}" to "${to}"`,
        metadata: { fromStatus: from, toStatus: to }
      }),

    logOrderSubmission: (orderId: string, userId: string, userName: string, orderType: string) =>
      logActivity({
        type: 'order_submission',
        entity: 'order',
        entityId: orderId,
        userId,
        userName,
        description: `Submitted ${orderType} order`,
        metadata: { orderType }
      }),

    logIntegrationSync: (integrationName: string, userId: string, userName: string, success: boolean) =>
      logActivity({
        type: 'integration_sync',
        entity: 'integration',
        entityId: integrationName,
        userId,
        userName,
        description: `Integration sync ${success ? 'succeeded' : 'failed'}: ${integrationName}`,
        severity: success ? 'info' : 'warning',
        metadata: { success }
      })
  };
};
