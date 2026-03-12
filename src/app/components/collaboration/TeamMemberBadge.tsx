/**
 * Team Member Badge — compact avatar + name display for care team members.
 */
import React from 'react';
import { cn } from '../ui/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { CareTeamMember } from '../../lib/collaborationTypes';
import { TEAM_ROLE_ABBREV } from '../../lib/collaborationTypes';

interface TeamMemberBadgeProps {
  member: CareTeamMember;
  size?: 'sm' | 'md';
  showRole?: boolean;
  showStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TeamMemberBadge = React.memo(function TeamMemberBadge({
  member,
  size = 'md',
  showRole = true,
  showStatus = false,
  onClick,
  className,
}: TeamMemberBadgeProps) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const abbrev = TEAM_ROLE_ABBREV[member.role] || member.discipline;

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        onClick && 'cursor-pointer hover:bg-gray-50 rounded-lg transition-colors',
        size === 'sm' ? 'p-1' : 'p-1.5',
        className
      )}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className={size === 'sm' ? 'size-7' : 'size-9'}>
          <AvatarFallback
            className={cn(
              'text-white font-semibold',
              member.avatarColor,
              size === 'sm' ? 'text-[10px]' : 'text-xs'
            )}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <span
            className={cn(
              'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white',
              member.status === 'active'
                ? 'bg-emerald-500'
                : member.status === 'on_leave'
                ? 'bg-amber-500'
                : 'bg-gray-400'
            )}
          />
        )}
      </div>
      <div className="min-w-0">
        <div
          className={cn(
            'font-medium text-gray-900 truncate',
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}
        >
          {member.name}
        </div>
        {showRole && (
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <span
              className={cn(
                'inline-flex items-center justify-center rounded font-bold text-white px-1',
                member.avatarColor,
                'text-[8px] leading-none py-0.5'
              )}
            >
              {abbrev}
            </span>
            {member.isPrimary && (
              <span className="text-blue-600 font-semibold">Primary</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default TeamMemberBadge;
