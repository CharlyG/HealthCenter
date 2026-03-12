/**
 * Compose Box — message/note/update composer with @mention support.
 */
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import type { CareTeamMember, MessageType, MessageMention } from '../../lib/collaborationTypes';
import { TEAM_ROLE_ABBREV } from '../../lib/collaborationTypes';
import {
  Send,
  FileText,
  Stethoscope,
  AlertCircle,
  AtSign,
  Loader2,
  X,
} from 'lucide-react';

const MESSAGE_TYPES: { value: MessageType; label: string; icon: React.ElementType }[] = [
  { value: 'note', label: 'Note', icon: FileText },
  { value: 'update', label: 'Patient Update', icon: Stethoscope },
  { value: 'escalation', label: 'Escalation', icon: AlertCircle },
];

interface ComposeBoxProps {
  teamMembers: CareTeamMember[];
  onSend: (data: {
    type: MessageType;
    content: string;
    mentions: MessageMention[];
    isUrgent: boolean;
  }) => Promise<void>;
  sending: boolean;
}

export const ComposeBox = React.memo(function ComposeBox({
  teamMembers,
  onSend,
  sending,
}: ComposeBoxProps) {
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('note');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentions, setMentions] = useState<MessageMention[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredMembers = useMemo(() => {
    if (!mentionQuery) return teamMembers;
    const q = mentionQuery.toLowerCase();
    return teamMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.discipline.toLowerCase().includes(q)
    );
  }, [teamMembers, mentionQuery]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setContent(val);

      // Detect @mention trigger
      const cursorPos = e.target.selectionStart || 0;
      const textBefore = val.slice(0, cursorPos);
      const atMatch = textBefore.match(/@(\w*)$/);
      if (atMatch) {
        setShowMentions(true);
        setMentionQuery(atMatch[1]);
      } else {
        setShowMentions(false);
        setMentionQuery('');
      }
    },
    []
  );

  const insertMention = useCallback(
    (member: CareTeamMember) => {
      if (!textareaRef.current) return;
      const cursorPos = textareaRef.current.selectionStart || 0;
      const textBefore = content.slice(0, cursorPos);
      const textAfter = content.slice(cursorPos);

      // Replace the @query with the full mention
      const atIdx = textBefore.lastIndexOf('@');
      const newText =
        textBefore.slice(0, atIdx) + `@${member.name} ` + textAfter;
      setContent(newText);

      // Track mention
      if (!mentions.find((m) => m.memberId === member.id)) {
        setMentions((prev) => [
          ...prev,
          { memberId: member.id, memberName: member.name },
        ]);
      }

      setShowMentions(false);
      setMentionQuery('');

      // Re-focus
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    },
    [content, mentions]
  );

  const removeMention = useCallback((memberId: string) => {
    setMentions((prev) => prev.filter((m) => m.memberId !== memberId));
  }, []);

  const handleSend = useCallback(async () => {
    if (!content.trim()) return;
    await onSend({
      type: messageType,
      content: content.trim(),
      mentions,
      isUrgent,
    });
    setContent('');
    setMentions([]);
    setIsUrgent(false);
    setMessageType('note');
  }, [content, messageType, mentions, isUrgent, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
      }
    },
    [handleSend]
  );

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
      {/* Type selector */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-1">
        {MESSAGE_TYPES.map((mt) => {
          const Icon = mt.icon;
          const active = messageType === mt.value;
          return (
            <button
              key={mt.value}
              onClick={() => setMessageType(mt.value)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                active
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <Icon className="size-3" />
              {mt.label}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={() => setIsUrgent(!isUrgent)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
            isUrgent
              ? 'bg-red-100 text-red-700'
              : 'text-gray-400 hover:bg-gray-100'
          )}
        >
          <AlertCircle className="size-3" />
          Urgent
        </button>
      </div>

      {/* Textarea */}
      <div className="relative px-3">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a note, update, or @mention a team member..."
          className="min-h-[72px] max-h-[180px] border-0 shadow-none resize-none focus-visible:ring-0 p-0 text-sm"
          rows={3}
        />

        {/* @Mention dropdown */}
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-0 w-64 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-auto">
            <div className="p-1">
              {filteredMembers.map((member) => {
                const initials = member.name
                  .split(' ')
                  .map((n) => n[0])
                  .filter((_, i, arr) => i === 0 || i === arr.length - 1)
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <button
                    key={member.id}
                    onClick={() => insertMention(member)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-blue-50 text-left transition-colors"
                  >
                    <Avatar className="size-6">
                      <AvatarFallback
                        className={cn(
                          'text-white font-semibold text-[9px]',
                          member.avatarColor
                        )}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-medium text-gray-900">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {TEAM_ROLE_ABBREV[member.role]}
                        {member.status !== 'active' && (
                          <span className="ml-1 text-amber-600">
                            ({member.status.replace('_', ' ')})
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mentions badges + Send */}
      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        {/* Tagged mentions */}
        {mentions.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap flex-1">
            <AtSign className="size-3 text-gray-400" />
            {mentions.map((m) => (
              <Badge
                key={m.memberId}
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-5 gap-1 bg-blue-50 text-blue-700 border-blue-200"
              >
                {m.memberName}
                <button onClick={() => removeMention(m.memberId)}>
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {mentions.length === 0 && <div className="flex-1" />}

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-400 hidden sm:block">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to send
          </span>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!content.trim() || sending}
            className="h-8 gap-1.5"
          >
            {sending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
});

export default ComposeBox;
