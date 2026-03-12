/**
 * Timeline Component
 * Vertical timeline for displaying chronological events
 * Used for patient history, audit logs, activity feeds
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  user?: string;
  icon?: LucideIcon;
  iconColor?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  metadata?: ReactNode;
}

export interface TimelineProps {
  events: TimelineEvent[];
  emptyMessage?: string;
}

const iconColorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
};

export function Timeline({ events, emptyMessage = 'No events' }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

      {/* Events */}
      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = event.icon;
          const iconColor = event.iconColor || 'gray';
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`
                    size-12 rounded-full flex items-center justify-center
                    ${iconColorClasses[iconColor]}
                  `}
                >
                  {Icon && <Icon className="size-5" />}
                  {!Icon && (
                    <div className="size-2 rounded-full bg-current" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 ${isLast ? '' : 'pb-6'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}
                    {event.metadata && (
                      <div className="mt-2">
                        {event.metadata}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
                {event.user && (
                  <div className="text-xs text-gray-500 mt-1">
                    by {event.user}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
