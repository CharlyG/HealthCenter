/**
 * ActivityFeed Component
 * Stream of activities and notifications with avatars and actions
 * Used for recent activity, notifications, audit trails
 */

import { ReactNode } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';

export interface ActivityItem {
  id: string;
  user: string;
  userInitials?: string;
  action: string;
  timestamp: string;
  metadata?: ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  emptyMessage?: string;
  compact?: boolean;
}

export function ActivityFeed({
  activities,
  emptyMessage = 'No recent activity',
  compact = false,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const initials = activity.userInitials || getInitials(activity.user);

        return (
          <div
            key={activity.id}
            className={`flex gap-3 ${compact ? 'py-2' : 'py-3'}`}
          >
            {/* Avatar */}
            <Avatar className={compact ? 'size-8' : 'size-10'}>
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-900`}>
                    <span className="font-medium">{activity.user}</span>
                    {' '}
                    <span className="text-gray-600">{activity.action}</span>
                  </p>
                  <p className={`${compact ? 'text-2xs' : 'text-xs'} text-gray-500 mt-0.5`}>
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>

                {activity.actionButton && (
                  <button
                    onClick={activity.actionButton.onClick}
                    className={`
                      ${compact ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'}
                      text-blue-600 hover:text-blue-700 hover:bg-blue-50
                      rounded-md font-medium transition-colors
                    `}
                  >
                    {activity.actionButton.label}
                  </button>
                )}
              </div>

              {activity.metadata && (
                <div className={compact ? 'mt-1' : 'mt-2'}>
                  {activity.metadata}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
