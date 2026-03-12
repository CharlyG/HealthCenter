/**
 * VisitMonitorTable — Main visit table for the PointOfCare Monitor.
 * Columns: Patient, Admission, Caregiver, Visit Time, Status, Doc Status, EVV Status.
 * Highlights conflict rows. Supports sorting, search, and filter.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, Clock, AlertTriangle,
  Layers, ShieldAlert, CalendarOff, Eye, Pencil, UserRoundCog, Send,
} from 'lucide-react';
import type { MonitorVisit, VisitStatus, EvvStatus, DocStatus, ConflictType } from './MonitorTypes';
import { VISIT_STATUS_CONFIG, EVV_STATUS_CONFIG, DOC_STATUS_CONFIG, CONFLICT_CONFIG } from './MonitorTypes';

// ─── Sorting ────────────────────────────────────────────────────────────────

type SortField = 'patient' | 'caregiver' | 'time' | 'status' | 'evv' | 'doc';
type SortDir = 'asc' | 'desc';

// ─── Filter helpers ─────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: VisitStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'missing_clock_out', label: 'Missing Clock Out' },
];

const EVV_OPTIONS: { value: EvvStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All EVV' },
  { value: 'pending', label: 'Pending' },
  { value: 'clocked_in', label: 'Clocked In' },
  { value: 'transmitted', label: 'Transmitted' },
  { value: 'evv_error', label: 'EVV Error' },
];

const CONFLICT_OPTIONS: { value: ConflictType | 'all' | 'none'; label: string }[] = [
  { value: 'all', label: 'All Visits' },
  { value: 'none', label: 'No Conflicts' },
  { value: 'missing_clock_out', label: 'Missing Clock Out' },
  { value: 'overlapping_visits', label: 'Overlapping' },
  { value: 'unscheduled_visit', label: 'Unscheduled' },
  { value: 'authorization_conflict', label: 'Auth Conflict' },
];

// ─── Conflict icon ──────────────────────────────────────────────────────────

function ConflictIcon({ type }: { type: ConflictType }) {
  const cfg = CONFLICT_CONFIG[type];
  switch (type) {
    case 'missing_clock_out': return <Clock className={cn('size-3.5', cfg.color)} />;
    case 'overlapping_visits': return <Layers className={cn('size-3.5', cfg.color)} />;
    case 'unscheduled_visit': return <CalendarOff className={cn('size-3.5', cfg.color)} />;
    case 'authorization_conflict': return <ShieldAlert className={cn('size-3.5', cfg.color)} />;
  }
}

// ─── Status Badge ───────────────────────────────────────────────────────────

const StatusBadge = React.memo(function StatusBadge({ status, config }: { status: string; config: { label: string; color: string; bg: string; border: string; dot: string } }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border', config.bg, config.border, config.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  );
});

// ─── Sort Header ────────────────────────────────────────────────────────────

function SortHeader({ label, field, currentField, direction, onSort, className }: {
  label: string; field: SortField; currentField: SortField | null; direction: SortDir; onSort: (f: SortField) => void; className?: string;
}) {
  const active = currentField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={cn('flex items-center gap-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors', className)}
    >
      {label}
      {active ? (direction === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />) : <ArrowUpDown className="size-3 text-gray-300" />}
    </button>
  );
}

// ─── Filter Pill ────────────────────────────────────────────────────────────

function FilterPill<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors',
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-700',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Table ─────────────────────────────────────────────────────────────

interface VisitMonitorTableProps {
  visits: MonitorVisit[];
  onViewVisit: (visit: MonitorVisit) => void;
  onEditVisit: (visit: MonitorVisit) => void;
  onReassign: (visit: MonitorVisit) => void;
  onTransmit: (visit: MonitorVisit) => void;
}

export default function VisitMonitorTable({ visits, onViewVisit, onEditVisit, onReassign, onTransmit }: VisitMonitorTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisitStatus | 'all'>('all');
  const [evvFilter, setEvvFilter] = useState<EvvStatus | 'all'>('all');
  const [conflictFilter, setConflictFilter] = useState<ConflictType | 'all' | 'none'>('all');
  const [sortField, setSortField] = useState<SortField | null>('time');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }, [sortField]);

  const filtered = useMemo(() => {
    let result = visits;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.patientName.toLowerCase().includes(q) ||
        v.caregiverName.toLowerCase().includes(q) ||
        v.patientMrn.toLowerCase().includes(q) ||
        v.admissionLabel.toLowerCase().includes(q) ||
        v.discipline.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(v => v.status === statusFilter);
    if (evvFilter !== 'all') result = result.filter(v => v.evvStatus === evvFilter);
    if (conflictFilter === 'none') result = result.filter(v => v.conflicts.length === 0);
    else if (conflictFilter !== 'all') result = result.filter(v => v.conflicts.includes(conflictFilter));

    // Sort
    if (sortField) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
          case 'patient': cmp = a.patientName.localeCompare(b.patientName); break;
          case 'caregiver': cmp = a.caregiverName.localeCompare(b.caregiverName); break;
          case 'time': cmp = a.scheduledTime.localeCompare(b.scheduledTime); break;
          case 'status': cmp = a.status.localeCompare(b.status); break;
          case 'evv': cmp = (a.evvStatus || '').localeCompare(b.evvStatus || ''); break;
          case 'doc': cmp = a.docStatus.localeCompare(b.docStatus); break;
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [visits, search, statusFilter, evvFilter, conflictFilter, sortField, sortDir]);

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="px-5 py-3 border-b border-gray-100 space-y-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient, caregiver, MRN..."
              className="pl-9 h-8 text-sm"
            />
          </div>
          <FilterPill options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
        </div>
        <div className="flex items-center gap-3">
          <FilterPill options={EVV_OPTIONS} value={evvFilter} onChange={setEvvFilter} />
          <FilterPill options={CONFLICT_OPTIONS} value={conflictFilter} onChange={setConflictFilter} />
          <div className="flex-1" />
          <span className="text-[11px] text-gray-400">{filtered.length} of {visits.length} visits</span>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-2.5 w-[3%]" />
              <th className="text-left px-4 py-2.5 w-[18%]">
                <SortHeader label="Patient" field="patient" currentField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-2.5 w-[12%]">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Admission</span>
              </th>
              <th className="text-left px-4 py-2.5 w-[16%]">
                <SortHeader label="Caregiver" field="caregiver" currentField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-2.5 w-[10%]">
                <SortHeader label="Visit Time" field="time" currentField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-2.5 w-[13%]">
                <SortHeader label="Status" field="status" currentField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-2.5 w-[10%]">
                <SortHeader label="Doc Status" field="doc" currentField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="text-left px-4 py-2.5 w-[12%]">
                <SortHeader label="EVV Status" field="evv" currentField={sortField} direction={sortDir} onSort={handleSort} />
              </th>
              <th className="text-right px-4 py-2.5 w-[6%]">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-sm text-gray-400">
                  No visits match your filters
                </td>
              </tr>
            ) : (
              filtered.map(visit => (
                <VisitRow
                  key={visit.id}
                  visit={visit}
                  onView={onViewVisit}
                  onEdit={onEditVisit}
                  onReassign={onReassign}
                  onTransmit={onTransmit}
                />
              ))
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

// ─── Visit Row ──────────────────────────────────────────────────────────────

const VisitRow = React.memo(function VisitRow({ visit, onView, onEdit, onReassign, onTransmit }: {
  visit: MonitorVisit;
  onView: (v: MonitorVisit) => void;
  onEdit: (v: MonitorVisit) => void;
  onReassign: (v: MonitorVisit) => void;
  onTransmit: (v: MonitorVisit) => void;
}) {
  const hasConflict = visit.conflicts.length > 0;
  const statusCfg = VISIT_STATUS_CONFIG[visit.status] || VISIT_STATUS_CONFIG.scheduled;
  const evvCfg = EVV_STATUS_CONFIG[visit.evvStatus] || EVV_STATUS_CONFIG.pending;
  const docCfg = DOC_STATUS_CONFIG[visit.docStatus] || DOC_STATUS_CONFIG['n/a'];

  const timeDisplay = visit.actualStartTime
    ? `${visit.actualStartTime}${visit.actualEndTime ? ' – ' + visit.actualEndTime : ' – ...'}`
    : visit.scheduledTime;

  return (
    <tr
      className={cn(
        'group hover:bg-gray-50/80 transition-colors cursor-pointer',
        hasConflict && 'bg-red-50/30',
      )}
      onClick={() => onView(visit)}
    >
      {/* Conflict indicator */}
      <td className="px-2 py-3">
        {hasConflict && (
          <div className="flex flex-col gap-1">
            {visit.conflicts.map(c => (
              <div key={c} title={CONFLICT_CONFIG[c].label}>
                <ConflictIcon type={c} />
              </div>
            ))}
          </div>
        )}
      </td>

      {/* Patient */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-blue-700">
              {visit.patientName.split(', ').map(w => w[0]).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{visit.patientName}</p>
            <p className="text-[11px] text-gray-400">{visit.patientMrn}</p>
          </div>
        </div>
      </td>

      {/* Admission */}
      <td className="px-4 py-3">
        <span className="text-xs text-gray-600 font-mono">{visit.admissionLabel}</span>
      </td>

      {/* Caregiver */}
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-800 truncate">{visit.caregiverName}</p>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 mt-0.5 rounded-full">
            {visit.discipline}
          </Badge>
        </div>
      </td>

      {/* Time */}
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-800 tabular-nums">{timeDisplay}</p>
          <p className="text-[10px] text-gray-400">
            Sched: {visit.scheduledTime}
          </p>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={visit.status} config={statusCfg} />
      </td>

      {/* Doc Status */}
      <td className="px-4 py-3">
        <span className={cn('text-xs font-medium', docCfg.color)}>{docCfg.label}</span>
      </td>

      {/* EVV Status */}
      <td className="px-4 py-3">
        <StatusBadge status={visit.evvStatus} config={evvCfg} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onEdit(visit)}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit Visit"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={() => onReassign(visit)}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            title="Reassign Caregiver"
          >
            <UserRoundCog className="size-3.5" />
          </button>
          {(visit.status === 'completed' && (visit.evvStatus === 'pending' || visit.evvStatus === 'evv_error')) && (
            <button
              onClick={() => onTransmit(visit)}
              className="p-1.5 rounded-md hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition-colors"
              title="Transmit EVV"
            >
              <Send className="size-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});
