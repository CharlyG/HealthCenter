/**
 * Visit Board — Primary table-style operational board
 * Features:
 *  - Columns: Checkbox, Drag, Patient, Admission, Caregiver, Discipline, Start/End Time, Status, Doc Status
 *  - Drag-and-drop time slot rescheduling via react-dnd
 *  - Row click opens VisitDetailDrawer for inline editing
 *  - Multi-select with checkbox + bulk status update toolbar
 *  - Auto-refresh polling (30s)
 *  - Search, sort, filter
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Loader2, Search, Filter, RefreshCw, ChevronUp, ChevronDown,
  CheckCircle2, Clock, AlertTriangle, Play, XCircle, FileX, GripVertical,
  SquareCheck, X,
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { visitGateway, type Visit } from '../../lib/dataGateway';
import VisitDetailDrawer from './VisitDetailDrawer';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  scheduled:   { label: 'Scheduled',   color: 'bg-blue-100 text-blue-800 border-blue-200',     icon: <Clock className="size-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Play className="size-3" /> },
  completed:   { label: 'Completed',   color: 'bg-green-100 text-green-800 border-green-200',   icon: <CheckCircle2 className="size-3" /> },
  missed:      { label: 'Missed',      color: 'bg-red-100 text-red-800 border-red-200',         icon: <XCircle className="size-3" /> },
  cancelled:   { label: 'Cancelled',   color: 'bg-gray-100 text-gray-600 border-gray-200',     icon: <XCircle className="size-3" /> },
  open:        { label: 'Open',        color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <AlertTriangle className="size-3" /> },
};

const DOC_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  completed:   { label: 'Complete',     color: 'bg-green-100 text-green-800' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
  pending:     { label: 'Pending',      color: 'bg-red-100 text-red-800' },
  'n/a':       { label: 'N/A',         color: 'bg-gray-100 text-gray-500' },
};

const ITEM_TYPE = 'VISIT_ROW';
type SortKey = 'patientName' | 'caregiverName' | 'discipline' | 'startTime' | 'status' | 'documentationStatus';

const AUTO_REFRESH_INTERVAL = 30_000; // 30 seconds

interface VisitBoardProps {
  selectedDate: Date;
  refreshKey: number;
}

// ─── DnD Row ────────────────────────────────────────────────────────────────

interface DraggableRowProps {
  visit: Visit;
  index: number;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onDrop: (dragId: string, hoverIndex: number) => void;
  onClick: (visit: Visit) => void;
}

function DraggableVisitRow({ visit, index, selected, onSelect, onDrop, onClick }: DraggableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => ({ id: visit.id, index }),
    canDrag: () => ['scheduled', 'open'].includes(visit.status),
    collect: m => ({ isDragging: m.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; index: number }) => {
      if (item.id !== visit.id) onDrop(item.id, index);
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  preview(drop(ref));

  const sc = STATUS_CONFIG[visit.status] || STATUS_CONFIG.scheduled;
  const dc = DOC_STATUS_CONFIG[visit.documentationStatus || 'n/a'] || DOC_STATUS_CONFIG['n/a'];
  const canDrag = ['scheduled', 'open'].includes(visit.status);

  return (
    <tr
      ref={ref}
      className={`
        transition-colors cursor-pointer
        ${isDragging ? 'opacity-40 bg-blue-50' : ''}
        ${isOver ? 'bg-blue-100/40 ring-1 ring-blue-300 ring-inset' : ''}
        ${selected ? 'bg-blue-50/60' : 'hover:bg-blue-50/30'}
      `}
      onClick={() => onClick(visit)}
    >
      {/* Checkbox */}
      <td className="w-10 px-2 py-3" onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onSelect(visit.id, !!v)}
          className="size-4"
        />
      </td>
      {/* Drag handle */}
      <td className="w-8 px-1 py-3">
        {canDrag ? (
          <span ref={drag} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500" onClick={e => e.stopPropagation()}>
            <GripVertical className="size-4" />
          </span>
        ) : (
          <span className="text-gray-200"><GripVertical className="size-4" /></span>
        )}
      </td>
      <td className="px-3 py-3">
        <div>
          <p className="font-medium text-gray-900 text-sm">{visit.patientName || 'Unknown'}</p>
          {visit.patientMrn && <p className="text-[10px] text-gray-400">{visit.patientMrn}</p>}
        </div>
      </td>
      <td className="px-3 py-3 text-xs text-gray-600">
        {visit.admissionId ? (
          <span className="truncate max-w-[90px] block">{visit.admissionId.slice(0, 12)}</span>
        ) : (
          <span className="text-gray-300">&mdash;</span>
        )}
      </td>
      <td className="px-3 py-3">
        {visit.caregiverName ? (
          <span className="text-sm text-gray-700">{visit.caregiverName}</span>
        ) : (
          <Badge variant="outline" className="text-[10px] h-5 bg-orange-50 text-orange-700 border-orange-200">
            Unassigned
          </Badge>
        )}
      </td>
      <td className="px-3 py-3">
        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-gray-50">
          {visit.discipline}
        </Badge>
      </td>
      <td className="px-3 py-3 text-xs font-mono text-gray-700">
        {visit.startTime || visit.scheduledTime || '—'}
      </td>
      <td className="px-3 py-3 text-xs font-mono text-gray-700">
        {visit.endTime || '—'}
      </td>
      <td className="px-3 py-3">
        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 gap-1 ${sc.color}`}>
          {sc.icon} {sc.label}
        </Badge>
      </td>
      <td className="px-3 py-3">
        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${dc.color}`}>
          {dc.label}
        </Badge>
      </td>
    </tr>
  );
}

// ─── Bulk Action Toolbar ────────────────────────────────────────────────────

interface BulkToolbarProps {
  count: number;
  onClear: () => void;
  onBulkStatus: (status: string) => void;
  updating: boolean;
}

function BulkActionToolbar({ count, onClear, onBulkStatus, updating }: BulkToolbarProps) {
  return (
    <div className="flex items-center gap-3 bg-blue-600 text-white rounded-lg px-4 py-2.5 shadow-lg">
      <div className="flex items-center gap-2">
        <SquareCheck className="size-4" />
        <span className="text-sm font-semibold">{count} selected</span>
      </div>
      <div className="w-px h-5 bg-blue-400" />
      <span className="text-xs text-blue-200">Set status:</span>
      {(['completed', 'missed', 'cancelled', 'scheduled'] as const).map(s => {
        const cfg = STATUS_CONFIG[s];
        return (
          <Button
            key={s}
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-white hover:bg-blue-500 gap-1"
            disabled={updating}
            onClick={() => onBulkStatus(s)}
          >
            {cfg.icon} {cfg.label}
          </Button>
        );
      })}
      <div className="flex-1" />
      {updating && <Loader2 className="size-4 animate-spin" />}
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs text-white hover:bg-blue-500"
        onClick={onClear}
        disabled={updating}
      >
        <X className="size-3.5 mr-1" /> Clear
      </Button>
    </div>
  );
}

// ─── Main Board ─────────────────────────────────────────────────────────────

export default function VisitBoard({ selectedDate, refreshKey }: VisitBoardProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('startTime');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Drawer
  const [drawerVisit, setDrawerVisit] = useState<Visit | null>(null);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const dateStr = selectedDate.toISOString().split('T')[0];

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const result = await visitGateway.search({
        filters: { startDate: dateStr, endDate: dateStr },
        pagination: { page: 1, pageSize: 200 },
      });
      setVisits(result.data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('[VisitBoard] error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { load(); }, [load, refreshKey]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      load(true); // silent refresh
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRefresh, load]);

  // Clear selection when date changes
  useEffect(() => { setSelectedIds(new Set()); }, [dateStr]);

  // ─── Sort ──────────────────────────────────────────────────────────────────

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const disciplines = useMemo(() => {
    const set = new Set(visits.map(v => v.discipline).filter(Boolean));
    return Array.from(set).sort();
  }, [visits]);

  const filtered = useMemo(() => {
    let result = [...visits];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        (v.patientName || '').toLowerCase().includes(q) ||
        (v.caregiverName || '').toLowerCase().includes(q) ||
        v.discipline.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(v => v.status === statusFilter);
    if (disciplineFilter !== 'all') result = result.filter(v => v.discipline === disciplineFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'patientName': cmp = (a.patientName || '').localeCompare(b.patientName || ''); break;
        case 'caregiverName': cmp = (a.caregiverName || '').localeCompare(b.caregiverName || ''); break;
        case 'discipline': cmp = a.discipline.localeCompare(b.discipline); break;
        case 'startTime': cmp = (a.startTime || '').localeCompare(b.startTime || ''); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'documentationStatus': cmp = (a.documentationStatus || '').localeCompare(b.documentationStatus || ''); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [visits, search, statusFilter, disciplineFilter, sortKey, sortDir]);

  // ─── Selection ─────────────────────────────────────────────────────────────

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filtered.map(v => v.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [filtered]);

  const allSelected = filtered.length > 0 && filtered.every(v => selectedIds.has(v.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  // ─── Bulk Status Update ────────────────────────────────────────────────────

  const handleBulkStatus = useCallback(async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    try {
      const ids = Array.from(selectedIds);
      // Batch in groups of 5 to avoid overwhelming the server
      const batchSize = 5;
      let successCount = 0;
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        await Promise.all(
          batch.map(id => visitGateway.update(id, { status: newStatus } as any))
        );
        successCount += batch.length;
      }
      toast.success(`Updated ${successCount} visit${successCount > 1 ? 's' : ''} to "${STATUS_CONFIG[newStatus]?.label || newStatus}"`);
      setSelectedIds(new Set());
      load();
    } catch (err: any) {
      console.error('[VisitBoard] bulk update error:', err);
      toast.error(err.message || 'Bulk update failed');
    } finally {
      setBulkUpdating(false);
    }
  }, [selectedIds, load]);

  // ─── Drag-and-drop time swap ──────────────────────────────────────────────

  const handleDrop = useCallback(async (dragId: string, hoverIndex: number) => {
    const dragVisit = visits.find(v => v.id === dragId);
    const hoverVisit = filtered[hoverIndex];
    if (!dragVisit || !hoverVisit || dragVisit.id === hoverVisit.id) return;

    const dragStart = dragVisit.startTime || dragVisit.scheduledTime || '';
    const dragEnd = dragVisit.endTime || '';
    const hoverStart = hoverVisit.startTime || hoverVisit.scheduledTime || '';
    const hoverEnd = hoverVisit.endTime || '';

    try {
      await Promise.all([
        visitGateway.update(dragVisit.id, { start_time: hoverStart, end_time: hoverEnd } as any),
        visitGateway.update(hoverVisit.id, { start_time: dragStart, end_time: dragEnd } as any),
      ]);
      toast.success(`Swapped time slots: ${dragVisit.patientName} ↔ ${hoverVisit.patientName}`);
      load();
    } catch (err: any) {
      console.error('[VisitBoard] swap error:', err);
      toast.error(err.message || 'Failed to swap time slots');
    }
  }, [visits, filtered, load]);

  const handleRowClick = useCallback((visit: Visit) => {
    setDrawerVisit(visit);
  }, []);

  const handleDrawerUpdated = useCallback(() => {
    setDrawerVisit(null);
    load();
  }, [load]);

  const SortHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <button
      className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      onClick={() => handleSort(sortKeyVal)}
    >
      {label}
      {sortKey === sortKeyVal && (
        sortDir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Loading visit board...</span>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-3">
        {/* Bulk Action Toolbar */}
        {selectedIds.size > 0 && (
          <BulkActionToolbar
            count={selectedIds.size}
            onClear={() => setSelectedIds(new Set())}
            onBulkStatus={handleBulkStatus}
            updating={bulkUpdating}
          />
        )}

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search patient, caregiver..."
                className="pl-9 w-[240px] h-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <Filter className="size-3.5 mr-1 text-gray-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Discipline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disciplines</SelectItem>
                {disciplines.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1 bg-blue-50 border-blue-200 text-blue-700">
              <GripVertical className="size-3" /> Drag to swap
            </Badge>
            <Badge variant="secondary" className="text-xs">{filtered.length} visits</Badge>
            {/* Auto-refresh indicator */}
            <button
              onClick={() => setAutoRefresh(prev => !prev)}
              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border transition-colors ${
                autoRefresh
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
              title={autoRefresh ? `Auto-refresh ON (every 30s)\nLast: ${lastRefresh.toLocaleTimeString()}` : 'Auto-refresh OFF'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {autoRefresh ? 'Live' : 'Paused'}
            </button>
            <Button variant="ghost" size="sm" onClick={() => load()} className="h-8 gap-1 text-xs">
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="w-10 px-2 py-3">
                    <Checkbox
                      checked={allSelected}
                      ref={(el: any) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onCheckedChange={(v) => handleSelectAll(!!v)}
                      className="size-4"
                    />
                  </th>
                  <th className="w-8 px-1 py-3" />
                  <th className="text-left px-3 py-3"><SortHeader label="Patient" sortKeyVal="patientName" /></th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-600">Admission</th>
                  <th className="text-left px-3 py-3"><SortHeader label="Caregiver" sortKeyVal="caregiverName" /></th>
                  <th className="text-left px-3 py-3"><SortHeader label="Discipline" sortKeyVal="discipline" /></th>
                  <th className="text-left px-3 py-3"><SortHeader label="Start" sortKeyVal="startTime" /></th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-gray-600">End</th>
                  <th className="text-left px-3 py-3"><SortHeader label="Status" sortKeyVal="status" /></th>
                  <th className="text-left px-3 py-3"><SortHeader label="Doc Status" sortKeyVal="documentationStatus" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                      <FileX className="size-8 mx-auto mb-2 text-gray-300" />
                      No visits found for {selectedDate.toLocaleDateString()}
                    </td>
                  </tr>
                ) : (
                  filtered.map((visit, idx) => (
                    <DraggableVisitRow
                      key={visit.id}
                      visit={visit}
                      index={idx}
                      selected={selectedIds.has(visit.id)}
                      onSelect={handleSelect}
                      onDrop={handleDrop}
                      onClick={handleRowClick}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <VisitDetailDrawer
        visit={drawerVisit}
        open={!!drawerVisit}
        onClose={() => setDrawerVisit(null)}
        onUpdated={handleDrawerUpdated}
      />
    </DndProvider>
  );
}