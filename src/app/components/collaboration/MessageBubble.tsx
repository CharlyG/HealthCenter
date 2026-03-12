/**
 * Message Bubble — displays a single collaboration message with
 * author info, mentions highlighting, document attachments, and actions.
 */
import React, { useCallback } from 'react';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { CollaborationMessage, CareTeamMember } from '../../lib/collaborationTypes';
import { TEAM_ROLE_ABBREV } from '../../lib/collaborationTypes';
import {
  Pin,
  PinOff,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  Stethoscope,
  Paperclip,
} from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  note: { icon: FileText, label: 'Note', color: 'text-blue-600' },
  update: { icon: Stethoscope, label: 'Patient Update', color: 'text-emerald-600' },
  document: { icon: Paperclip, label: 'Document', color: 'text-purple-600' },
  task_created: { icon: ListTodo, label: 'Task Created', color: 'text-amber-600' },
  task_completed: { icon: CheckCircle2, label: 'Task Completed', color: 'text-emerald-600' },
  escalation: { icon: AlertCircle, label: 'Escalation', color: 'text-red-600' },
};

interface MessageBubbleProps {
  message: CollaborationMessage;
  teamMembers: CareTeamMember[];
  onTogglePin: (messageId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  teamMembers,
  onTogglePin,
}: MessageBubbleProps) {
  const config = TYPE_CONFIG[message.type] || TYPE_CONFIG.note;
  const TypeIcon = config.icon;

  const author = teamMembers.find((m) => m.id === message.authorId);
  const authorColor = author?.avatarColor || 'bg-gray-500';
  const authorInitials = message.authorName
    .split(' ')
    .map((n) => n[0])
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Highlight @mentions in content
  const renderContent = useCallback(() => {
    if (message.mentions.length === 0) {
      return <span>{message.content}</span>;
    }

    let content = message.content;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Find all @mentions and replace
    for (const mention of message.mentions) {
      const atName = `@${mention.memberName}`;
      const idx = content.indexOf(atName, lastIndex);
      if (idx >= 0) {
        if (idx > lastIndex) {
          parts.push(<span key={`t-${lastIndex}`}>{content.slice(lastIndex, idx)}</span>);
        }
        parts.push(
          <span
            key={`m-${mention.memberId}-${idx}`}
            className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-medium text-[11px] mx-0.5"
          >
            @{mention.memberName}
          </span>
        );
        lastIndex = idx + atName.length;
      }
    }
    if (lastIndex < content.length) {
      parts.push(<span key="tail">{content.slice(lastIndex)}</span>);
    }
    return <>{parts}</>;
  }, [message.content, message.mentions]);

  const isSystemMessage = message.type === 'task_created' || message.type === 'task_completed';

  if (isSystemMessage) {
    return (
      <div className="flex items-center gap-2 py-2 px-3">
        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0',
          message.type === 'task_completed' ? 'bg-emerald-100' : 'bg-amber-100'
        )}>
          <TypeIcon className={cn('size-3', config.color)} />
        </div>
        <div className="text-xs text-gray-500 flex-1">
          <span className="font-medium text-gray-700">{message.authorName}</span>
          {' '}{message.content.startsWith('Completed') ? 'completed' : 'created'} a task
          {message.mentions.length > 0 && (
            <> for <span className="font-medium text-gray-700">{message.mentions[0].memberName}</span></>
          )}
        </div>
        <span className="text-[10px] text-gray-400 shrink-0">
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative rounded-lg transition-all',
        message.isPinned && 'bg-amber-50/60 border border-amber-200',
        message.isUrgent && !message.isPinned && 'bg-red-50/40 border border-red-200',
        !message.isPinned && !message.isUrgent && 'hover:bg-gray-50',
      )}
    >
      <div className="flex gap-3 p-3">
        {/* Author avatar */}
        <Avatar className="size-8 shrink-0 mt-0.5">
          <AvatarFallback className={cn('text-white font-semibold text-[10px]', authorColor)}>
            {authorInitials}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{message.authorName}</span>
            <Badge variant="outline" className={cn('text-[9px] px-1 py-0 h-4 gap-0.5 border-0', config.color)}>
              <TypeIcon className="size-2.5" />
              {config.label}
            </Badge>
            {message.isUrgent && (
              <Badge className="bg-red-100 text-red-700 border-0 text-[9px] px-1 py-0 h-4">
                Urgent
              </Badge>
            )}
            {message.isPinned && (
              <Pin className="size-3 text-amber-500" />
            )}
            <span className="text-[10px] text-gray-400 ml-auto shrink-0">
              {formatRelativeTime(message.createdAt)}
            </span>
          </div>

          {/* Message body */}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {renderContent()}
          </div>

          {/* Document attachment */}
          {message.document && (
            <div className="mt-2 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center shrink-0">
                <FileText className="size-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {message.document.name}
                </div>
                <div className="text-[10px] text-gray-400">
                  {formatFileSize(message.document.size)}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="size-7 p-0 shrink-0">
                <Download className="size-3.5 text-gray-500" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="size-6 p-0"
          onClick={() => onTogglePin(message.id)}
          title={message.isPinned ? 'Unpin' : 'Pin'}
        >
          {message.isPinned ? (
            <PinOff className="size-3 text-amber-600" />
          ) : (
            <Pin className="size-3 text-gray-400" />
          )}
        </Button>
      </div>
    </div>
  );
});

export default MessageBubble;
