/**
 * Task Card — displays a care coordination task with status, assignee, and actions.
 */
import React from 'react';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { CareTask, CareTeamMember } from '../../lib/collaborationTypes';
import { TEAM_ROLE_ABBREV } from '../../lib/collaborationTypes';
import {
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
  AlertTriangle,
  Calendar,
  XCircle,
} from 'lucide-react';

const PRIORITY_STYLES: Record<string, { color: string; bgColor: string; label: string }> = {
  urgent: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Urgent' },
  high: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'High' },
  normal: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Normal' },
  low: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Low' },
};

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Circle, color: 'text-gray-400', label: 'Pending' },
  in_progress: { icon: PlayCircle, color: 'text-blue-500', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-gray-400', label: 'Cancelled' },
};

interface TaskCardProps {
  task: CareTask;
  teamMembers: CareTeamMember[];
  onStatusChange: (taskId: string, status: string) => void;
}

export const TaskCard = React.memo(function TaskCard({
  task,
  teamMembers,
  onStatusChange,
}: TaskCardProps) {
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.normal;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const assignee = teamMembers.find((m) => m.id === task.assigneeId);
  const assigneeColor = assignee?.avatarColor || 'bg-gray-500';

  const initials = task.assigneeName
    .split(' ')
    .map((n) => n[0])
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isOverdue = task.dueDate && task.status !== 'completed' && task.status !== 'cancelled'
    && new Date(task.dueDate) < new Date();

  const isDone = task.status === 'completed' || task.status === 'cancelled';

  return (
    <div
      className={cn(
        'border rounded-lg p-3 transition-all',
        isDone ? 'bg-gray-50 border-gray-200 opacity-70' :
        isOverdue ? 'bg-red-50/40 border-red-200' :
        task.priority === 'urgent' ? 'bg-red-50/20 border-red-200' :
        'bg-white border-gray-200 hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status toggle */}
        <button
          className="mt-0.5 shrink-0"
          onClick={() => {
            if (task.status === 'completed') return;
            const nextStatus = task.status === 'pending' ? 'in_progress' : 'completed';
            onStatusChange(task.id, nextStatus);
          }}
          title={isDone ? status.label : `Mark as ${task.status === 'pending' ? 'In Progress' : 'Completed'}`}
        >
          <StatusIcon className={cn('size-5', status.color)} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={cn(
                'text-sm font-medium',
                isDone ? 'text-gray-500 line-through' : 'text-gray-900'
              )}
            >
              {task.title}
            </span>
            <Badge
              className={cn(
                'text-[9px] px-1.5 py-0 h-4 border-0',
                priority.bgColor,
                priority.color
              )}
            >
              {priority.label}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <Avatar className="size-5">
                <AvatarFallback className={cn('text-white font-semibold text-[8px]', assigneeColor)}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-gray-600">{task.assigneeName}</span>
            </div>

            {/* Due date */}
            {task.dueDate && (
              <div className={cn(
                'flex items-center gap-1 text-[11px]',
                isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
              )}>
                {isOverdue ? (
                  <AlertTriangle className="size-3" />
                ) : (
                  <Calendar className="size-3" />
                )}
                <span>
                  {isOverdue ? 'Overdue: ' : 'Due '}
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}

            {/* Completed */}
            {task.completedAt && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                <CheckCircle2 className="size-3" />
                <span>Completed {new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default TaskCard;
