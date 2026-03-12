/**
 * DocNotificationBell — In-app notification bell for documentation workflow events.
 * Shows unread count badge, dropdown with recent notifications,
 * and mark-as-read functionality.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  FileCheck,
  UserCheck,
  XCircle,
  Clock,
  CheckCheck,
  Bell,
} from 'lucide-react';
import { documentationGateway } from '../../lib/dataGateway';
import { useAuth } from '../../context/AuthContext';
import type { DocNotification, DocNotificationType } from '../../lib/documentationTypes';

const TYPE_CONFIG: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  cosign_request: {
    icon: UserCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  cosign_requested: {
    icon: UserCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  cosign_approved: {
    icon: FileCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  cosign_rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  cosign_overdue: {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
};

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const DocNotificationBell = React.memo(function DocNotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<DocNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadNotifications = useCallback(async () => {
    // Don't attempt to fetch if no user session is active
    if (!user) return;
    try {
      const res = await documentationGateway.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err: any) {
      // Suppress network errors when user may have just signed out
      if (err?.message?.includes('Failed to fetch')) {
        console.warn('[DocNotifications] Network unavailable, skipping poll');
      } else {
        console.error('[DocNotifications] Load error:', err);
      }
    }
  }, [user]);

  // Poll every 30 seconds — only when authenticated
  useEffect(() => {
    if (!user) {
      // Clear state when logged out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    loadNotifications();
    pollRef.current = setInterval(loadNotifications, 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadNotifications, user]);

  // Refresh when popover opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      loadNotifications().finally(() => setLoading(false));
    }
  }, [open, loadNotifications]);

  const handleMarkRead = useCallback(async (notifId: string) => {
    try {
      await documentationGateway.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[DocNotifications] Mark read error:', err);
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await documentationGateway.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[DocNotifications] Mark all read error:', err);
    }
  }, []);

  const handleNotificationClick = useCallback((notif: DocNotification) => {
    handleMarkRead(notif.id);
    if (notif.type === 'cosign_requested' || notif.type === 'cosign_request') {
      navigate('/cosign-queue');
    }
    setOpen(false);
  }, [handleMarkRead, navigate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 p-0"
        >
          <FileCheck className="size-4 text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileCheck className="size-4 text-indigo-500" />
            <h4 className="text-sm font-semibold text-gray-900">Documentation Alerts</h4>
            {unreadCount > 0 && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-indigo-50 border-indigo-200 text-indigo-700">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 gap-1 text-[10px] text-gray-500"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications list */}
        <ScrollArea className="max-h-80">
          {loading && notifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-gray-500">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="size-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-gray-500">No notifications yet</p>
              <p className="text-[10px] text-gray-400 mt-1">
                You'll be notified when co-signature actions occur
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => {
                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.cosign_request;
                const Icon = config.icon;

                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 transition-colors hover:bg-gray-50 flex gap-2.5',
                      !notif.read && 'bg-indigo-50/30'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      config.bgColor
                    )}>
                      <Icon className={cn('size-3.5', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          'text-xs',
                          notif.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'
                        )}>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-gray-400">
                          {getTimeAgo(notif.timestamp)}
                        </span>
                        <span className="text-[9px] text-gray-300">|</span>
                        <span className="text-[9px] text-gray-400">
                          {notif.actorName}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-[10px] text-indigo-600"
              onClick={() => {
                navigate('/cosign-queue');
                setOpen(false);
              }}
            >
              View Co-Sign Queue
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

export default DocNotificationBell;