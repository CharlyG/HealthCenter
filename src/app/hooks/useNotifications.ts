/**
 * useNotifications Hook
 * 
 * React hook for interacting with the Notification Service
 * 
 * Usage:
 * ```tsx
 * const { sendNotification, notifications, unreadCount } = useNotifications();
 * 
 * sendNotification({
 *   type: 'patient_alert',
 *   priority: 'critical',
 *   title: 'Critical Patient Alert',
 *   message: 'Patient vitals out of range',
 *   actionUrl: '/patients/123',
 *   actionLabel: 'View Patient'
 * });
 * ```
 */

import { useState, useEffect } from 'react';
import { 
  NotificationService, 
  Notification, 
  NotificationType, 
  NotificationPriority 
} from '../services/NotificationService';

interface SendNotificationParams {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = NotificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(NotificationService.getUnreadCount());
    });

    // Initial load
    setNotifications(NotificationService.getAll());
    setUnreadCount(NotificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  const sendNotification = (params: SendNotificationParams) => {
    NotificationService.send(params);
  };

  const markAsRead = (id: string) => {
    NotificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    NotificationService.markAllAsRead();
  };

  const deleteNotification = (id: string) => {
    NotificationService.delete(id);
  };

  const clearAll = () => {
    NotificationService.clearAll();
  };

  return {
    notifications,
    unreadCount,
    sendNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
}
