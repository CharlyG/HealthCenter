/**
 * EvvResolutionCenter — Dedicated panel for resolving EVV transmission issues.
 * Shows error items with patient, caregiver, visit time, error description,
 * suggested fix, and inline actions (edit, reassign, resend).
 */
import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  AlertOctagon, Send, Pencil, UserRoundCog, RotateCcw,
  CheckCircle, Lightbulb, Clock, ChevronDown, ChevronUp,
  Filter, Zap, CheckSquare, Square, X,
} from 'lucide-react';
import type { EvvError, MonitorVisit } from './MonitorTypes';
import { VISIT_STATUS_CONFIG, EVV_STATUS_CONFIG } from './MonitorTypes';

// ─── Severity config ────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  high: { label: 'High', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', stripe: 'border-l-red-500' },
  medium: { label: 'Medium', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', stripe: 'border-l-orange-400' },
  low: { label: 'Low', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', stripe: 'border-l-amber-400' },
};

// ─── Error Card ─────────────────────────────────────────────────────────────

interface ErrorCardProps {
  error: EvvError;
  onEdit: (visit: MonitorVisit) => void;
  onReassign: (visit: MonitorVisit) => void;
  onResend: (error: EvvError) => void;
  resending: string | null;
  bulkMode: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}

const ErrorCard = React.memo(function ErrorCard({ error, onEdit, onReassign, onResend, resending, bulkMode, selected, onSelect }: ErrorCardProps) {
  const [expanded, setExpanded] = useState(true);
  const sev = SEVERITY_CONFIG[error.severity];
  const v = error.visit;

  const timeDisplay = v.actualStartTime
    ? `${v.actualStartTime}${v.actualEndTime ? ' – ' + v.actualEndTime : ' – ...'}`
    : v.scheduledTime;

  return (
    <div className={cn('rounded-xl border-l-4 border bg-white shadow-sm transition-all hover:shadow-md', sev.stripe, 'border-gray-200', selected && 'ring-2 ring-blue-400')}>
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {bulkMode && (
              <button
                onClick={() => onSelect(error.id)}
                className="mt-1 shrink-0"
              >
                {selected
                  ? <CheckSquare className="size-5 text-blue-600" />
                  : <Square className="size-5 text-gray-300 hover:text-gray-400" />
                }
              </button>
            )}
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', sev.bg)}>
              <AlertOctagon className={cn('size-5', sev.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-bold text-gray-900">{error.errorCode}</span>
                <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 rounded-full font-bold', sev.bg, sev.border, sev.color)}>
                  {sev.label} Severity
                </Badge>
                {error.retryCount > 0 && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-full text-gray-500 border-gray-200">
                    <RotateCcw className="size-3 mr-0.5" />
                    {error.retryCount} retry
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-snug">{error.errorDescription}</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 shrink-0"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {/* Visit info row */}
        <div className="mt-3 flex items-center gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
              <span className="text-[8px] font-bold text-blue-700">
                {v.patientName.split(', ').map(w => w[0]).join('')}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">{v.patientName}</span>
              <span className="text-gray-400 ml-1">({v.patientMrn})</span>
            </div>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="text-gray-600">
            <span className="text-gray-400">Caregiver:</span>{' '}
            <span className="font-medium">{v.caregiverName}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="size-3 text-gray-400" />
            <span className="font-medium tabular-nums">{timeDisplay}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-full">{v.discipline} — {v.visitType}</Badge>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="px-5 pb-4 pt-0">
          {/* Suggested fix */}
          <div className={cn('rounded-lg px-4 py-3 mb-3 border', sev.bg, sev.border)}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lightbulb className="size-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-gray-700">Suggested Fix</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed ml-5">{error.suggestedFix}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => onResend(error)}
              disabled={resending === error.id}
            >
              {resending === error.id ? (
                <RotateCcw className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Resend EVV Transmission
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => onEdit(v)}
            >
              <Pencil className="size-3.5" />
              Edit Visit Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => onReassign(v)}
            >
              <UserRoundCog className="size-3.5" />
              Reassign Caregiver
            </Button>
            <div className="flex-1" />
            <span className="text-[10px] text-gray-400">
              Error at {new Date(error.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface EvvResolutionCenterProps {
  errors: EvvError[];
  onEdit: (visit: MonitorVisit) => void;
  onReassign: (visit: MonitorVisit) => void;
  onResend: (error: EvvError) => void;
  resending: string | null;
  bulkMode: boolean;
  selectedIds: string[];
  onSelect: (id: string) => void;
}

export default function EvvResolutionCenter({ errors, onEdit, onReassign, onResend, resending, bulkMode, selectedIds, onSelect }: EvvResolutionCenterProps) {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filtered = useMemo(() => {
    if (severityFilter === 'all') return errors;
    return errors.filter(e => e.severity === severityFilter);
  }, [errors, severityFilter]);

  const counts = useMemo(() => ({
    total: errors.length,
    high: errors.filter(e => e.severity === 'high').length,
    medium: errors.filter(e => e.severity === 'medium').length,
    low: errors.filter(e => e.severity === 'low').length,
  }), [errors]);

  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle className="size-8 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">No EVV Errors</p>
        <p className="text-xs text-gray-400">All EVV transmissions are successful. Great compliance!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-red-500" />
          <span className="text-sm font-bold text-gray-800">{counts.total} EVV Errors</span>
        </div>
        <div className="flex items-center gap-1.5">
          {counts.high > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 bg-red-50 border-red-200 text-red-700">{counts.high} High</Badge>
          )}
          {counts.medium > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 bg-orange-50 border-orange-200 text-orange-700">{counts.medium} Medium</Badge>
          )}
          {counts.low > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 bg-amber-50 border-amber-200 text-amber-700">{counts.low} Low</Badge>
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Filter className="size-3.5 text-gray-400" />
          {(['all', 'high', 'medium', 'low'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={cn(
                'px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                severityFilter === sev
                  ? 'bg-gray-200 text-gray-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
              )}
            >
              {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error list */}
      <ScrollArea className="flex-1 px-5 py-4">
        <div className="space-y-3">
          {filtered.map(error => (
            <ErrorCard
              key={error.id}
              error={error}
              onEdit={onEdit}
              onReassign={onReassign}
              onResend={onResend}
              resending={resending}
              bulkMode={bulkMode}
              selected={selectedIds.includes(error.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}