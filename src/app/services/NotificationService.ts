/**
 * Real-time Notification Service
 * 
 * Provides push notifications for critical events:
 * - Schedule changes
 * - Patient alerts
 * - Documentation reminders
 * - System notifications
 * 
 * Features:
 * - Desktop notifications (Web Notification API)
 * - In-app notification center
 * - Audio alerts for critical events
 * - Notification persistence
 * - Do Not Disturb mode
 */

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationType = 
  | 'schedule_change'
  | 'patient_alert'
  | 'documentation_reminder'
  | 'system'
  | 'message'
  | 'task_assigned';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;
  doNotDisturb: boolean;
  doNotDisturbStart?: string; // HH:mm format
  doNotDisturbEnd?: string;
  mutedTypes: NotificationType[];
}

class NotificationServiceClass {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private settings: NotificationSettings;
  private unreadCount = 0;

  constructor() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    this.settings = savedSettings 
      ? JSON.parse(savedSettings)
      : {
          enabled: true,
          soundEnabled: true,
          desktopEnabled: true,
          doNotDisturb: false,
          mutedTypes: []
        };

    // Load persisted notifications
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      this.notifications = JSON.parse(savedNotifications).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      this.updateUnreadCount();
    }

    // Request desktop notification permission
    if (this.settings.desktopEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  }

  /**
   * Send a notification
   */
  send(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    if (!this.settings.enabled) return;
    if (this.settings.mutedTypes.includes(notification.type)) return;
    if (this.isDoNotDisturbActive()) return;

    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.updateUnreadCount();
    this.persist();
    this.notifyListeners();

    // Play sound for critical/high priority
    if (this.settings.soundEnabled && ['critical', 'high'].includes(notification.priority)) {
      this.playSound(notification.priority);
    }

    // Show desktop notification
    if (this.settings.desktopEnabled && this.canShowDesktopNotification()) {
      this.showDesktopNotification(newNotification);
    }
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get unread notifications
   */
  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.updateUnreadCount();
      this.persist();
      this.notifyListeners();
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    let changed = false;
    this.notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) {
      this.updateUnreadCount();
      this.persist();
      this.notifyListeners();
    }
  }

  /**
   * Delete notification
   */
  delete(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.updateUnreadCount();
      this.persist();
      this.notifyListeners();
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.unreadCount = 0;
    this.persist();
    this.notifyListeners();
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));

    // Request permission if desktop notifications enabled
    if (settings.desktopEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Private: Update unread count
   */
  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  /**
   * Private: Persist to localStorage
   */
  private persist(): void {
    // Keep only last 100 notifications
    const toSave = this.notifications.slice(0, 100);
    localStorage.setItem('notifications', JSON.stringify(toSave));
  }

  /**
   * Private: Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.notifications]);
    });
  }

  /**
   * Private: Check if Do Not Disturb is active
   */
  private isDoNotDisturbActive(): boolean {
    if (!this.settings.doNotDisturb) return false;
    if (!this.settings.doNotDisturbStart || !this.settings.doNotDisturbEnd) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const start = this.settings.doNotDisturbStart;
    const end = this.settings.doNotDisturbEnd;

    // Handle overnight range (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }
    
    return currentTime >= start && currentTime < end;
  }

  /**
   * Private: Check if desktop notifications can be shown
   */
  private canShowDesktopNotification(): boolean {
    return (
      'Notification' in window &&
      Notification.permission === 'granted' &&
      document.hidden // Only show when tab is not visible
    );
  }

  /**
   * Private: Show desktop notification
   */
  private showDesktopNotification(notification: Notification): void {
    try {
      const desktopNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
        silent: !this.settings.soundEnabled
      });

      desktopNotif.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        desktopNotif.close();
      };
    } catch (error) {
      console.error('Failed to show desktop notification:', error);
    }
  }

  /**
   * Private: Play notification sound
   */
  private playSound(priority: NotificationPriority): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different tones for different priorities
      if (priority === 'critical') {
        // Urgent: Three quick beeps
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);

        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          osc2.connect(gainNode);
          osc2.frequency.value = 800;
          osc2.start();
          osc2.stop(audioContext.currentTime + 0.1);
        }, 150);

        setTimeout(() => {
          const osc3 = audioContext.createOscillator();
          osc3.connect(gainNode);
          osc3.frequency.value = 800;
          osc3.start();
          osc3.stop(audioContext.currentTime + 0.1);
        }, 300);
      } else if (priority === 'high') {
        // High: Single beep
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.2;
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }
}

// Export singleton instance
export const NotificationService = new NotificationServiceClass();
