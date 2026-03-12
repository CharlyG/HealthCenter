/**
 * Healthcare Design System - Queue Card Component
 */
import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export type QueuePriority = 'critical' | 'high' | 'medium' | 'low';
export type QueueStatus = 'new' | 'in_progress' | 'blocked' | 'completed';

interface QueueCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  priority: QueuePriority;
  status?: QueueStatus;
  dueDate?: Date;
  assignee?: string;
  icon?: React.ReactNode;
  labels?: Array<{ text: string; variant?: 'default' | 'success' | 'warning' | 'danger' }>;
  onClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const priorityConfig: Record<QueuePriority, { color: string; icon: React.ReactNode }> = {
  critical: { 
    color: 'border-l-4 border-l-red-600 bg-red-50', 
    icon: <AlertCircle className="size-5 text-red-600" /> 
  },
  high: { 
    color: 'border-l-4 border-l-orange-500 bg-orange-50', 
    icon: <AlertCircle className="size-5 text-orange-500" /> 
  },
  medium: { 
    color: 'border-l-4 border-l-yellow-500', 
    icon: <Clock className="size-5 text-yellow-600" /> 
  },
  low: { 
    color: 'border-l-4 border-l-gray-300', 
    icon: <Clock className="size-5 text-gray-500" /> 
  },
};

const statusConfig: Record<QueueStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  new: { label: 'New', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  blocked: { label: 'Blocked', variant: 'danger' },
  completed: { label: 'Completed', variant: 'success' },
};

export const QueueCard = React.memo(({
  title,
  subtitle,
  description,
  priority,
  status,
  dueDate,
  assignee,
  icon,
  labels,
  onClick,
  actions,
  className = '',
}: QueueCardProps) => {
  const priorityStyles = priorityConfig[priority];
  
  const isDueToday = dueDate && new Date(dueDate).toDateString() === new Date().toDateString();
  const isOverdue = dueDate && new Date(dueDate) < new Date();

  return (
    <Card
      className={`${priorityStyles.color} ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow ${className}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {icon || priorityStyles.icon}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 truncate">{title}</h4>
                {status && (
                  <Badge variant={statusConfig[status].variant} className="text-xs">
                    {statusConfig[status].label}
                  </Badge>
                )}
              </div>
              
              {subtitle && (
                <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
              )}
              
              {description && (
                <p className="text-sm text-gray-700 mb-3">{description}</p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {dueDate && (
                  <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-orange-600 font-medium' : ''}`}>
                    <Clock className="size-3" />
                    <span>
                      {isOverdue ? 'Overdue: ' : isDueToday ? 'Due today: ' : 'Due: '}
                      {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                
                {assignee && (
                  <span>Assigned to: <span className="font-medium text-gray-700">{assignee}</span></span>
                )}
              </div>
              
              {labels && labels.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  {labels.map((label, idx) => (
                    <Badge key={idx} variant={label.variant || 'default'} className="text-xs">
                      {label.text}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </Card>
  );
});

QueueCard.displayName = 'QueueCard';