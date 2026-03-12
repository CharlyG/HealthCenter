/**
 * NotificationCenter — In-app notification bell with dropdown panel.
 * Collects pipeline events: stage transitions, SLA breach alerts,
 * new referrals, and system notifications.
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  Bell, ArrowRight, AlertTriangle, AlertOctagon, CheckCircle2,
  XCircle, Plus, Clock, ShieldAlert, X, Check, Trash2,
} from 'lucide-react';
import type { Referral, PipelineStage } from '../../lib/referralPipelineTypes';
import { getStageConfig, getUrgencyConfig } from '../../lib/referralPipelineTypes';

// ─── Notification Types ────────────────────────────────────────────────────

export type NotificationType = 'stage_change' | 'sla_warning' | 'sla_breach' | 'sla_critical' | 'new_referral' | 'rejected' | 'admitted';

export interface PipelineNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  patientName: string;
  referralId: string;
  stage?: PipelineStage;
  timestamp: string;
  read: boolean;
}

const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: React.ElementType;
  iconColor: string;
  bg: string;
  border: string;
}> = {
  stage_change: { icon: ArrowRight, iconColor: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  sla_warning: { icon: AlertTriangle, iconColor: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  sla_breach: { icon: ShieldAlert, iconColor: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  sla_critical: { icon: AlertOctagon, iconColor: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  new_referral: { icon: Plus, iconColor: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  rejected: { icon: XCircle, iconColor: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  admitted: { icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

// ─── Hook: useNotifications ────────────────────────────────────────────────

const STORAGE_KEY = 'referral-pipeline-notifications';
const MAX_NOTIFICATIONS = 50;

function loadNotifications(): PipelineNotification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveNotifications(notifications: PipelineNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<PipelineNotification[]>(loadNotifications);

  const addNotification = useCallback((notification: Omit<PipelineNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: PipelineNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Generate SLA notifications from referrals
  const generateSlaNotifications = useCallback((referrals: Referral[]) => {
    const SLA_THRESHOLDS: Record<string, { aging: number; atRisk: number }> = {
      new_referral: { aging: 2, atRisk: 3 },
      insurance_verification: { aging: 4, atRisk: 6 },
      clinical_review: { aging: 5, atRisk: 7 },
      admission_scheduled: { aging: 5, atRisk: 7 },
    };

    const existing = loadNotifications();
    const existingKeys = new Set(existing.map(n => `${n.referralId}-${n.type}-${n.stage}`));
    const newNotifs: Omit<PipelineNotification, 'id' | 'timestamp' | 'read'>[] = [];

    for (const ref of referrals) {
      if (ref.stage === 'admitted' || ref.stage === 'rejected') continue;
      const thresholds = SLA_THRESHOLDS[ref.stage];
      if (!thresholds) continue;

      const stageLabel = getStageConfig(ref.stage).label;
      const name = `${ref.patientLastName}, ${ref.patientFirstName}`;

      if (ref.daysInStage >= thresholds.atRisk * 2) {
        const key = `${ref.id}-sla_critical-${ref.stage}`;
        if (!existingKeys.has(key)) {
          newNotifs.push({
            type: 'sla_critical',
            title: 'Critical SLA Breach',
            message: `${name} has been in ${stageLabel} for ${ref.daysInStage} days (${thresholds.atRisk * 2}d critical threshold)`,
            patientName: name,
            referralId: ref.id,
            stage: ref.stage,
          });
        }
      } else if (ref.daysInStage >= thresholds.atRisk) {
        const key = `${ref.id}-sla_breach-${ref.stage}`;
        if (!existingKeys.has(key)) {
          newNotifs.push({
            type: 'sla_breach',
            title: 'SLA Breach',
            message: `${name} exceeded SLA in ${stageLabel} (${ref.daysInStage}d / ${thresholds.atRisk}d limit)`,
            patientName: name,
            referralId: ref.id,
            stage: ref.stage,
          });
        }
      } else if (ref.daysInStage >= thresholds.aging) {
        const key = `${ref.id}-sla_warning-${ref.stage}`;
        if (!existingKeys.has(key)) {
          newNotifs.push({
            type: 'sla_warning',
            title: 'SLA Warning',
            message: `${name} approaching SLA limit in ${stageLabel} (${ref.daysInStage}d / ${thresholds.atRisk}d limit)`,
            patientName: name,
            referralId: ref.id,
            stage: ref.stage,
          });
        }
      }
    }

    if (newNotifs.length > 0) {
      setNotifications(prev => {
        const additions: PipelineNotification[] = newNotifs.map(n => ({
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: new Date().toISOString(),
          read: false,
        }));
        const updated = [...additions, ...prev].slice(0, MAX_NOTIFICATIONS);
        saveNotifications(updated);
        return updated;
      });
    }
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    clearAll,
    generateSlaNotifications,
  };
}

// ─── Notification Item ──────────────────────────────────────────────────────

const NotificationItem = React.memo(function NotificationItem({
  notification,
  onMarkRead,
  onClickReferral,
}: {
  notification: PipelineNotification;
  onMarkRead: (id: string) => void;
  onClickReferral: (referralId: string) => void;
}) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const Icon = config.icon;

  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(notification.timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }, [notification.timestamp]);

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100',
        notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50/60',
      )}
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id);
        onClickReferral(notification.referralId);
      }}
    >
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', config.bg)}>
        <Icon className={cn('size-4', config.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-gray-800 truncate">{notification.title}</span>
          {!notification.read && (
            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 leading-snug line-clamp-2">{notification.message}</p>
        <span className="text-[10px] text-gray-400 mt-1 block">{timeAgo}</span>
      </div>
    </div>
  );
});

// ─── Notification Center Bell ───────────────────────────────────────────────

interface NotificationCenterProps {
  notifications: PipelineNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onClickReferral: (referralId: string) => void;
}

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onClickReferral,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-lg border transition-colors',
          open
            ? 'bg-gray-100 border-gray-300'
            : 'bg-white border-gray-200 hover:bg-gray-50',
        )}
      >
        <Bell className={cn('size-4', unreadCount > 0 ? 'text-blue-600' : 'text-gray-500')} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-blue-100 text-blue-700 rounded-full">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-blue-600 hover:text-blue-700" onClick={onMarkAllRead}>
                  <Check className="size-3 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-gray-500 hover:text-red-600" onClick={onClearAll}>
                  <Trash2 className="size-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* List */}
          <ScrollArea className="max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="size-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Pipeline events will appear here</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={onMarkRead}
                  onClickReferral={(id) => {
                    onClickReferral(id);
                    setOpen(false);
                  }}
                />
              ))
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[10px] text-gray-400">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;