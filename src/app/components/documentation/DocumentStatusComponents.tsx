/**
 * Document Status Components
 * 
 * Visual components for displaying and managing document status
 */

import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  CheckSquare, 
  ThumbsUp, 
  ShieldCheck,
  ArrowRight,
  User,
  MessageSquare
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  DocumentStatus, 
  StatusChangeEvent,
  DOCUMENT_STATUS_CONFIGS,
  getStatusConfig,
  getNextPossibleStatuses
} from '../lib/documentStatusSystem';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DocumentStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className 
}: DocumentStatusBadgeProps) {
  const config = getStatusConfig(status);
  
  const Icon = getStatusIcon(status);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };
  
  return (
    <Badge 
      className={cn(
        'flex items-center gap-1.5 font-medium border',
        config.color.bg,
        config.color.text,
        config.color.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </Badge>
  );
}

function getStatusIcon(status: DocumentStatus) {
  const iconMap = {
    draft: FileText,
    in_progress: Clock,
    completed: CheckCircle,
    returned_for_correction: AlertCircle,
    corrected: CheckSquare,
    approved: ThumbsUp,
    signed: ShieldCheck,
  };
  return iconMap[status];
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentStatusTimelineProps {
  events: StatusChangeEvent[];
  currentStatus: DocumentStatus;
  className?: string;
}

export function DocumentStatusTimeline({ 
  events, 
  currentStatus,
  className 
}: DocumentStatusTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-semibold text-gray-900">Status History</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {/* Events */}
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <StatusTimelineEvent 
              key={event.id} 
              event={event} 
              isLatest={index === 0}
              isCurrentStatus={event.newStatus === currentStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatusTimelineEventProps {
  event: StatusChangeEvent;
  isLatest: boolean;
  isCurrentStatus: boolean;
}

function StatusTimelineEvent({ event, isLatest, isCurrentStatus }: StatusTimelineEventProps) {
  const newStatusConfig = getStatusConfig(event.newStatus);
  const Icon = getStatusIcon(event.newStatus);
  
  return (
    <div className="relative pl-10">
      {/* Icon */}
      <div 
        className={cn(
          'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white',
          isCurrentStatus ? newStatusConfig.color.border : 'border-gray-300'
        )}
      >
        <Icon className={cn(
          'w-4 h-4',
          isCurrentStatus ? newStatusConfig.color.text : 'text-gray-400'
        )} />
      </div>
      
      {/* Content */}
      <div className={cn(
        'pb-4',
        isLatest && 'bg-blue-50 -ml-2 pl-2 pt-2 rounded-lg'
      )}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">
            {newStatusConfig.label}
          </span>
          {isLatest && (
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
              Current
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-gray-600 mb-1">
          <User className="w-3 h-3 inline mr-1" />
          {event.changedByName} ({event.changedByRole})
        </div>
        
        <div className="text-xs text-gray-500">
          {new Date(event.changedAt).toLocaleString()}
        </div>
        
        {event.comment && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 border border-gray-200">
            <MessageSquare className="w-3 h-3 inline mr-1" />
            {event.comment}
          </div>
        )}
        
        {event.reason && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Reason: </span>
            {event.reason}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS TRACKER COMPONENT (for dashboards)
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentStatusTrackerProps {
  documents: Array<{
    id: string;
    title: string;
    type: string;
    status: DocumentStatus;
    assignedTo?: string;
    dueDate?: string;
  }>;
  onDocumentClick?: (documentId: string) => void;
  className?: string;
}

export function DocumentStatusTracker({ 
  documents, 
  onDocumentClick,
  className 
}: DocumentStatusTrackerProps) {
  const statusGroups = {
    active: documents.filter(d => ['draft', 'in_progress'].includes(d.status)),
    review: documents.filter(d => ['completed', 'corrected'].includes(d.status)),
    issue: documents.filter(d => d.status === 'returned_for_correction'),
    final: documents.filter(d => ['approved', 'signed'].includes(d.status)),
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <StatusTrackerColumn
        title="Active"
        documents={statusGroups.active}
        color="blue"
        onDocumentClick={onDocumentClick}
      />
      <StatusTrackerColumn
        title="Ready for Review"
        documents={statusGroups.review}
        color="purple"
        onDocumentClick={onDocumentClick}
      />
      <StatusTrackerColumn
        title="Needs Attention"
        documents={statusGroups.issue}
        color="amber"
        onDocumentClick={onDocumentClick}
      />
      <StatusTrackerColumn
        title="Finalized"
        documents={statusGroups.final}
        color="green"
        onDocumentClick={onDocumentClick}
      />
    </div>
  );
}

interface StatusTrackerColumnProps {
  title: string;
  documents: Array<{
    id: string;
    title: string;
    type: string;
    status: DocumentStatus;
    assignedTo?: string;
    dueDate?: string;
  }>;
  color: 'blue' | 'purple' | 'amber' | 'green';
  onDocumentClick?: (documentId: string) => void;
}

function StatusTrackerColumn({ 
  title, 
  documents, 
  color,
  onDocumentClick 
}: StatusTrackerColumnProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    green: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No documents
          </div>
        ) : (
          documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => onDocumentClick?.(doc.id)}
              className={cn(
                'w-full p-3 rounded-lg border text-left transition-all hover:shadow-md',
                colorClasses[color]
              )}
            >
              <div className="font-medium text-sm mb-1 truncate">
                {doc.title}
              </div>
              <div className="flex items-center gap-2">
                <DocumentStatusBadge status={doc.status} size="sm" />
              </div>
              {doc.assignedTo && (
                <div className="text-xs text-gray-600 mt-1">
                  <User className="w-3 h-3 inline mr-1" />
                  {doc.assignedTo}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS TRANSITION SELECTOR
// ═══════════════════════════════════════════════════════════════════════════

interface StatusTransitionSelectorProps {
  currentStatus: DocumentStatus;
  onTransition: (newStatus: DocumentStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function StatusTransitionSelector({ 
  currentStatus, 
  onTransition,
  disabled = false,
  className 
}: StatusTransitionSelectorProps) {
  const possibleTransitions = getNextPossibleStatuses(currentStatus);
  
  if (possibleTransitions.length === 0) {
    return (
      <div className={cn('text-sm text-gray-500', className)}>
        No status changes available. Document is in final state.
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-sm font-medium text-gray-700 mb-3">
        Change Status:
      </div>
      <div className="flex flex-wrap gap-2">
        {possibleTransitions.map(status => {
          const config = getStatusConfig(status);
          const Icon = getStatusIcon(status);
          
          return (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => onTransition(status)}
              disabled={disabled}
              className={cn(
                'flex items-center gap-2',
                config.color.bg,
                config.color.text,
                'hover:opacity-80'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{config.label}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════

interface StatusProgressBarProps {
  currentStatus: DocumentStatus;
  className?: string;
}

export function StatusProgressBar({ currentStatus, className }: StatusProgressBarProps) {
  const statuses: DocumentStatus[] = [
    'draft',
    'in_progress',
    'completed',
    'approved',
    'signed'
  ];
  
  const currentIndex = statuses.indexOf(currentStatus);
  const progress = ((currentIndex + 1) / statuses.length) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-xs text-gray-600 mb-2">
        <span>Document Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <div className="relative">
        {/* Progress bar background */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Status markers */}
        <div className="flex justify-between mt-3">
          {statuses.map((status, index) => {
            const config = getStatusConfig(status);
            const Icon = getStatusIcon(status);
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={status} className="flex flex-col items-center gap-1">
                <div 
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted 
                      ? cn(config.color.bg, config.color.border, config.color.text)
                      : 'bg-white border-gray-300 text-gray-400'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                </div>
                <span className={cn(
                  'text-xs text-center max-w-[60px]',
                  isCurrent ? 'font-semibold text-gray-900' : 'text-gray-500'
                )}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
