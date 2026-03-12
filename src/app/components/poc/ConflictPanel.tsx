/**
 * ConflictPanel — Conflict detection panel showing visits with issues:
 * Missing clock out, Overlapping visits, Unscheduled visits, Authorization conflicts.
 */
import React, { useMemo, useState } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  AlertTriangle, CheckCircle, Clock, Layers, CalendarOff, ShieldAlert,
  ArrowRight, UserRoundCog, Phone,
} from 'lucide-react';
import type { ConflictItem, ConflictType, MonitorVisit } from './MonitorTypes';
import { CONFLICT_CONFIG } from './MonitorTypes';

// ─── Conflict Type Icon ─────────────────────────────────────────────────────

function ConflictTypeIcon({ type, className }: { type: ConflictType; className?: string }) {
  switch (type) {
    case 'missing_clock_out': return <Clock className={className} />;
    case 'overlapping_visits': return <Layers className={className} />;
    case 'unscheduled_visit': return <CalendarOff className={className} />;
    case 'authorization_conflict': return <ShieldAlert className={className} />;
  }
}

const SEVERITY_STYLE = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', stripe: 'border-l-red-500', badge: 'bg-red-100 text-red-700 border-red-300' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', stripe: 'border-l-amber-400', badge: 'bg-amber-100 text-amber-700 border-amber-300' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', stripe: 'border-l-blue-400', badge: 'bg-blue-100 text-blue-700 border-blue-300' },
};

// ─── Conflict Card ──────────────────────────────────────────────────────────

const ConflictCard = React.memo(function ConflictCard({ conflict, onReassign }: { conflict: ConflictItem; onReassign: (v: MonitorVisit) => void }) {
  const cfg = CONFLICT_CONFIG[conflict.type];
  const sev = SEVERITY_STYLE[conflict.severity];

  return (
    <div className={cn('rounded-xl border-l-4 border bg-white shadow-sm', sev.stripe, 'border-gray-200')}>
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', cfg.bg)}>
            <ConflictTypeIcon type={conflict.type} className={cn('size-5', cfg.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{cfg.label}</span>
              <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 rounded-full font-bold', sev.badge)}>
                {conflict.severity.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 leading-snug">{conflict.description}</p>
          </div>
        </div>

        {/* Involved visits */}
        <div className="space-y-2 mb-3">
          {conflict.visits.map(v => (
            <div key={v.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-[8px] font-bold text-blue-700">
                  {v.patientName.split(', ').map(w => w[0]).join('')}
                </span>
              </div>
              <span className="font-semibold text-gray-800">{v.patientName}</span>
              <span className="text-gray-400">&middot;</span>
              <span className="text-gray-600">{v.caregiverName}</span>
              <span className="text-gray-400">&middot;</span>
              <span className="tabular-nums text-gray-600">{v.scheduledTime}</span>
              <Badge variant="outline" className="text-[9px] h-4 px-1 rounded">{v.discipline}</Badge>
            </div>
          ))}
        </div>

        {/* Suggested action + buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-1">
            <ArrowRight className="size-3 text-gray-400 shrink-0" />
            <span className="italic">{conflict.suggestedAction}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {conflict.type === 'missing_clock_out' && (
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                <Phone className="size-3" />
                Contact
              </Button>
            )}
            {(conflict.type === 'overlapping_visits' || conflict.type === 'unscheduled_visit') && (
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={() => onReassign(conflict.visits[0])}>
                <UserRoundCog className="size-3" />
                Reassign
              </Button>
            )}
            {conflict.type === 'authorization_conflict' && (
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7">
                <ShieldAlert className="size-3" />
                Request Auth
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface ConflictPanelProps {
  conflicts: ConflictItem[];
  onReassign: (visit: MonitorVisit) => void;
}

export default function ConflictPanel({ conflicts, onReassign }: ConflictPanelProps) {
  const [typeFilter, setTypeFilter] = useState<ConflictType | 'all'>('all');

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return conflicts;
    return conflicts.filter(c => c.type === typeFilter);
  }, [conflicts, typeFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of conflicts) counts[c.type] = (counts[c.type] || 0) + 1;
    return counts;
  }, [conflicts]);

  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle className="size-8 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">No Conflicts Detected</p>
        <p className="text-xs text-gray-400">All visits are properly documented and scheduled</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
        <AlertTriangle className="size-4 text-amber-500" />
        <span className="text-sm font-bold text-gray-800">{conflicts.length} Conflict{conflicts.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 ml-3">
          <button
            onClick={() => setTypeFilter('all')}
            className={cn(
              'px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
              typeFilter === 'all' ? 'bg-white text-gray-800 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            All ({conflicts.length})
          </button>
          {Object.entries(typeCounts).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type as ConflictType)}
              className={cn(
                'px-2 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1',
                typeFilter === type ? 'bg-white text-gray-800 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <ConflictTypeIcon type={type as ConflictType} className="size-3" />
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict list */}
      <ScrollArea className="flex-1 px-5 py-4">
        <div className="space-y-3">
          {filtered.map(c => (
            <ConflictCard key={c.id} conflict={c} onReassign={onReassign} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
