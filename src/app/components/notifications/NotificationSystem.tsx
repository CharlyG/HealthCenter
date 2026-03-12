/**
 * Notification System
 * 
 * Centralized notification center for healthcare operations.
 * 
 * Notification Types:
 * - Operational: Critical alerts, system status
 * - Documentation: Reminders, signatures needed
 * - Visits: Updates, cancellations, delays
 * - Billing: Issues, rejections, payments
 * - Referrals: New referrals, status updates
 * - Authorization: Approvals, denials, expiring
 * - Messages: Team communication
 * 
 * Features:
 * - Real-time notifications
 * - Priority-based sorting
 * - Quick action links
 * - Mark as read/unread
 * - Filtering by type
 * - Toast notifications
 * - Badge indicators
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Bell,
  AlertTriangle,
  FileText,
  Stethoscope,
  Receipt,
  UserPlus,
  Shield,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Filter,
  Check,
  MailOpen,
  Trash2,
  Settings,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ==================== TYPE DEFINITIONS ====================

export type NotificationType =
  | 'operational_alert'
  | 'operational_warning'
  | 'documentation_reminder'
  | 'documentation_overdue'
  | 'signature_needed'
  | 'visit_scheduled'
  | 'visit_cancelled'
  | 'visit_delayed'
  | 'visit_completed'
  | 'billing_issue'
  | 'claim_rejected'
  | 'claim_paid'
  | 'authorization_expiring'
  | 'authorization_approved'
  | 'authorization_denied'
  | 'referral_new'
  | 'referral_accepted'
  | 'referral_declined'
  | 'message_received'
  | 'staff_assigned';

export type NotificationCategory = 'operational' | 'documentation' | 'visit' | 'billing' | 'referral' | 'authorization' | 'message';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  patientName?: string;
  admissionId?: string;
  actionPath?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationConfig {
  type: NotificationType;
  category: NotificationCategory;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}

// ==================== NOTIFICATION CONFIGURATIONS ====================

export const notificationConfigs: Record<NotificationType, NotificationConfig> = {
  // Operational
  operational_alert: {
    type: 'operational_alert',
    category: 'operational',
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Critical Alert',
  },
  operational_warning: {
    type: 'operational_warning',
    category: 'operational',
    icon: AlertCircle,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: 'Warning',
  },

  // Documentation
  documentation_reminder: {
    type: 'documentation_reminder',
    category: 'documentation',
    icon: FileText,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Documentation Reminder',
  },
  documentation_overdue: {
    type: 'documentation_overdue',
    category: 'documentation',
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Documentation Overdue',
  },
  signature_needed: {
    type: 'signature_needed',
    category: 'documentation',
    icon: FileText,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: 'Signature Needed',
  },

  // Visits
  visit_scheduled: {
    type: 'visit_scheduled',
    category: 'visit',
    icon: Clock,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Visit Scheduled',
  },
  visit_cancelled: {
    type: 'visit_cancelled',
    category: 'visit',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Visit Cancelled',
  },
  visit_delayed: {
    type: 'visit_delayed',
    category: 'visit',
    icon: AlertCircle,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: 'Visit Delayed',
  },
  visit_completed: {
    type: 'visit_completed',
    category: 'visit',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Visit Completed',
  },

  // Billing
  billing_issue: {
    type: 'billing_issue',
    category: 'billing',
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Billing Issue',
  },
  claim_rejected: {
    type: 'claim_rejected',
    category: 'billing',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Claim Rejected',
  },
  claim_paid: {
    type: 'claim_paid',
    category: 'billing',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Claim Paid',
  },

  // Authorization
  authorization_expiring: {
    type: 'authorization_expiring',
    category: 'authorization',
    icon: AlertCircle,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    label: 'Authorization Expiring',
  },
  authorization_approved: {
    type: 'authorization_approved',
    category: 'authorization',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Authorization Approved',
  },
  authorization_denied: {
    type: 'authorization_denied',
    category: 'authorization',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Authorization Denied',
  },

  // Referrals
  referral_new: {
    type: 'referral_new',
    category: 'referral',
    icon: UserPlus,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'New Referral',
  },
  referral_accepted: {
    type: 'referral_accepted',
    category: 'referral',
    icon: CheckCircle2,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Referral Accepted',
  },
  referral_declined: {
    type: 'referral_declined',
    category: 'referral',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Referral Declined',
  },

  // Messages
  message_received: {
    type: 'message_received',
    category: 'message',
    icon: MessageSquare,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Message Received',
  },
  staff_assigned: {
    type: 'staff_assigned',
    category: 'message',
    icon: UserPlus,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Staff Assigned',
  },
};

// ==================== NOTIFICATION ITEM ====================

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}: NotificationItemProps) {
  const config = notificationConfigs[notification.type];
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  const priorityColors = {
    critical: 'border-l-4 border-l-red-600',
    high: 'border-l-4 border-l-amber-600',
    medium: 'border-l-4 border-l-blue-600',
    low: 'border-l-4 border-l-gray-400',
  };

  return (
    <div
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        priorityColors[notification.priority]
      } ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`size-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`size-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              {notification.priority === 'critical' && (
                <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
              )}
              {notification.priority === 'high' && (
                <Badge className="bg-amber-100 text-amber-800 text-xs">High</Badge>
              )}
              {!notification.isRead && (
                <div className="size-2 bg-blue-600 rounded-full" title="Unread" />
              )}
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</span>
          </div>

          {/* Title & Message */}
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{notification.title}</h4>
          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>

          {/* Context */}
          {(notification.patientName || notification.admissionId) && (
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
              {notification.patientName && <span>Patient: {notification.patientName}</span>}
              {notification.admissionId && <span>Admission: {notification.admissionId}</span>}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {notification.actionPath && (
              <Button
                size="sm"
                onClick={() => onAction(notification)}
                className="h-7 text-xs gap-1"
              >
                {notification.actionLabel || 'Take Action'}
                <ChevronRight className="size-3" />
              </Button>
            )}
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-7 text-xs gap-1"
              >
                <Check className="size-3" />
                Mark Read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="h-7 text-xs gap-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== NOTIFICATION CENTER ====================

interface NotificationCenterProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onAction: (notification: Notification) => void;
}

export function NotificationCenter({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onAction,
}: NotificationCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (selectedCategory !== 'all') {
      result = result.filter((n) => n.category === selectedCategory);
    }

    if (showUnreadOnly) {
      result = result.filter((n) => !n.isRead);
    }

    // Sort by priority then timestamp
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return result;
  }, [notifications, selectedCategory, showUnreadOnly]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const categories = useMemo(() => {
    const cats = new Set<NotificationCategory>();
    notifications.forEach((n) => cats.add(n.category));
    return Array.from(cats);
  }, [notifications]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-4 top-16 w-[480px] max-h-[calc(100vh-100px)] bg-white shadow-2xl rounded-lg z-50 flex flex-col border-2 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <Badge className="bg-blue-600 text-white">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead} className="h-8 text-xs">
              <MailOpen className="size-4 mr-1" />
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="size-8 p-0">
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-gray-700">Show unread only</span>
          </label>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  onAction={onAction}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="size-4 mr-2" />
              Clear All Notifications
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

// ==================== NOTIFICATION BELL BUTTON ====================

interface NotificationBellProps {
  notifications: Notification[];
  onClick: () => void;
}

export function NotificationBell({ notifications, onClick }: NotificationBellProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const criticalCount = notifications.filter(
    (n) => !n.isRead && n.priority === 'critical'
  ).length;

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="size-6 text-gray-700" />
      {unreadCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
            criticalCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-blue-600'
          }`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

// ==================== NOTIFICATION SUMMARY CARD ====================

interface NotificationSummaryProps {
  notifications: Notification[];
  onViewAll: () => void;
}

export function NotificationSummary({ notifications, onViewAll }: NotificationSummaryProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const criticalCount = notifications.filter(
    (n) => !n.isRead && n.priority === 'critical'
  ).length;
  const highCount = notifications.filter(
    (n) => !n.isRead && n.priority === 'high'
  ).length;

  const categoryCounts = useMemo(() => {
    const counts: Record<NotificationCategory, number> = {
      operational: 0,
      documentation: 0,
      visit: 0,
      billing: 0,
      referral: 0,
      authorization: 0,
      message: 0,
    };

    notifications
      .filter((n) => !n.isRead)
      .forEach((n) => {
        counts[n.category]++;
      });

    return counts;
  }, [notifications]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-5 text-blue-600" />
            Notifications
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1">
            View All
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
            <p className="text-xs text-gray-700">Unread</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-xs text-gray-700">Critical</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{highCount}</p>
            <p className="text-xs text-gray-700">High</p>
          </div>
        </div>

        {/* By Category */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-2">By Category</h4>
          <div className="space-y-2">
            {Object.entries(categoryCounts)
              .filter(([_, count]) => count > 0)
              .map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium text-gray-900 capitalize">{category}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
