/**
 * Notification Center Component
 * 
 * Real-time notification UI with:
 * - Notification dropdown
 * - Unread badge
 * - Mark as read/delete actions
 * - Filter by type/priority
 * - Settings panel
 */

import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Settings, Trash2, X, AlertCircle, Calendar, FileText, MessageSquare, ClipboardList } from 'lucide-react';
import { NotificationService, Notification, NotificationSettings, NotificationType } from '../../services/NotificationService';
import { Button } from '../../design-system/components/Button';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>(NotificationService.getSettings());
  const [filterType, setFilterType] = useState<'all' | NotificationType>('all');

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

  const handleMarkAsRead = (id: string) => {
    NotificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    NotificationService.markAllAsRead();
  };

  const handleDelete = (id: string) => {
    NotificationService.delete(id);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      NotificationService.clearAll();
    }
  };

  const handleSettingsChange = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    NotificationService.updateSettings(newSettings);
  };

  const toggleMuteType = (type: NotificationType) => {
    const mutedTypes = settings.mutedTypes.includes(type)
      ? settings.mutedTypes.filter(t => t !== type)
      : [...settings.mutedTypes, type];
    handleSettingsChange('mutedTypes', mutedTypes);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'schedule_change':
        return <Calendar className="size-4" />;
      case 'patient_alert':
        return <AlertCircle className="size-4" />;
      case 'documentation_reminder':
        return <FileText className="size-4" />;
      case 'message':
        return <MessageSquare className="size-4" />;
      case 'task_assigned':
        return <ClipboardList className="size-4" />;
      default:
        return <Bell className="size-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'medium':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700';
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="size-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 z-50 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Notification settings"
                >
                  <Settings className="size-4 text-gray-500" />
                </button>
              </div>

              {/* Actions */}
              {!showSettings && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    <CheckCheck className="size-4 mr-1" />
                    Mark all read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={notifications.length === 0}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}

              {/* Filter Tabs */}
              {!showSettings && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {(['all', 'schedule_change', 'patient_alert', 'documentation_reminder', 'task_assigned'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                        filterType === type
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type === 'all' ? 'All' : type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="p-4 space-y-4 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 dark:text-white">Settings</h4>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Notifications enabled</span>
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sound alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => handleSettingsChange('soundEnabled', e.target.checked)}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Desktop notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.desktopEnabled}
                    onChange={(e) => handleSettingsChange('desktopEnabled', e.target.checked)}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Do Not Disturb</span>
                  <input
                    type="checkbox"
                    checked={settings.doNotDisturb}
                    onChange={(e) => handleSettingsChange('doNotDisturb', e.target.checked)}
                    className="rounded"
                  />
                </label>

                {settings.doNotDisturb && (
                  <div className="pl-4 space-y-2">
                    <label className="block">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Start time</span>
                      <input
                        type="time"
                        value={settings.doNotDisturbStart || '22:00'}
                        onChange={(e) => handleSettingsChange('doNotDisturbStart', e.target.value)}
                        className="block w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-gray-600 dark:text-gray-400">End time</span>
                      <input
                        type="time"
                        value={settings.doNotDisturbEnd || '08:00'}
                        onChange={(e) => handleSettingsChange('doNotDisturbEnd', e.target.value)}
                        className="block w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                      />
                    </label>
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Muted notification types</h5>
                  {(['schedule_change', 'patient_alert', 'documentation_reminder', 'message', 'task_assigned'] as NotificationType[]).map((type) => (
                    <label key={type} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{type.replace('_', ' ')}</span>
                      <input
                        type="checkbox"
                        checked={settings.mutedTypes.includes(type)}
                        onChange={() => toggleMuteType(type)}
                        className="rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notification List */}
            {!showSettings && (
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Bell className="size-12 mb-2 opacity-20" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getPriorityColor(notification.priority)}`}>
                            {getIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {formatTime(notification.timestamp)}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-1">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                    aria-label="Mark as read"
                                  >
                                    <Check className="size-4 text-gray-600 dark:text-gray-400" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                  aria-label="Delete"
                                >
                                  <X className="size-4 text-gray-600 dark:text-gray-400" />
                                </button>
                              </div>
                            </div>

                            {/* Action Button */}
                            {notification.actionUrl && notification.actionLabel && (
                              <button
                                onClick={() => {
                                  window.location.href = notification.actionUrl!;
                                  setIsOpen(false);
                                }}
                                className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {notification.actionLabel} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
