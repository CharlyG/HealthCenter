/**
 * PointOfCare Monitor & EVV Resolution Center
 * Operational visibility into visit execution and EVV compliance.
 * Single-screen design: KPI strip → 5 tabbed views.
 *
 * Data flow: pointOfCareGateway → server endpoints → KV store.
 * Falls back to mock data when server is unavailable.
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { cn } from '../components/ui/utils';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Send,
  Monitor, Zap, CalendarCheck, BarChart3, TrendingUp,
  CheckSquare, X, WifiOff, Wifi,
  Navigation,
} from 'lucide-react';

import VisitMonitorTable from '../components/poc/VisitMonitorTable';
import EvvResolutionCenter from '../components/poc/EvvResolutionCenter';
import ConflictPanel from '../components/poc/ConflictPanel';
import VisitDetailDrawer from '../components/poc/VisitDetailDrawer';
import EvvComplianceAnalytics from '../components/poc/EvvComplianceAnalytics';
import ComplianceExport from '../components/poc/ComplianceExport';
import CaregiverFieldMap from '../components/poc/CaregiverFieldMap';
import { VisitEditDialog } from '../components/poc/VisitEditDialog';
import { ReassignDialog } from '../components/poc/ReassignDialog';
import {
  MOCK_VISITS, MOCK_EVV_ERRORS, MOCK_CONFLICTS, computeMetrics,
} from '../components/poc/MonitorMockData';
import { pointOfCareGateway } from '../lib/dataGateway';
import type {
  MonitorVisit, EvvError, ConflictItem, MonitorMetrics,
  VisitStatus, EvvStatus, DocStatus, ConflictType,
} from '../components/poc/MonitorTypes';

// ─── Data mappers ───────────────────────────────────────────────────────────

function mapServerVisit(sv: any): MonitorVisit {
  return {
    id: sv.id,
    patientId: sv.patientId || '',
    patientName: sv.patientName || '',
    patientMrn: sv.patientMrn || '',
    admissionId: sv.admissionId || '',
    admissionLabel: sv.admissionLabel || sv.admissionId || '',
    caregiverId: sv.caregiverId || '',
    caregiverName: sv.caregiverName || 'Unassigned',
    discipline: sv.discipline || '',
    visitType: sv.visitType || '',
    scheduledDate: sv.scheduledDate || '',
    scheduledTime: sv.scheduledTime || '',
    actualStartTime: sv.actualStartTime || undefined,
    actualEndTime: sv.actualEndTime || undefined,
    status: (sv.status || 'scheduled') as VisitStatus,
    evvStatus: (sv.evvStatus || 'pending') as EvvStatus,
    docStatus: (sv.docStatus || 'n/a') as DocStatus,
    conflicts: (sv.conflicts || []) as ConflictType[],
    authorizationRemaining: sv.authorizationRemaining,
    notes: sv.notes || '',
  };
}

function buildEvvErrors(serverErrors: any[], visits: MonitorVisit[]): EvvError[] {
  const visitMap = new Map(visits.map(v => [v.id, v]));
  return serverErrors.map(se => {
    const visit = visitMap.get(se.visit_id);
    // If visit not found, create a stub from visits with evv_error status
    const matchVisit = visit || visits.find(v => v.evvStatus === 'evv_error' || v.evvStatus === 'exception');
    if (!matchVisit) return null;
    return {
      id: se.id,
      visit: matchVisit,
      errorCode: se.error_code || '',
      errorDescription: se.error_description || '',
      suggestedFix: se.suggested_fix || '',
      severity: se.severity as 'high' | 'medium' | 'low',
      occurredAt: se.occurred_at || new Date().toISOString(),
      retryCount: se.retry_count || 0,
    };
  }).filter(Boolean) as EvvError[];
}

function buildConflicts(serverConflicts: any[], visits: MonitorVisit[]): ConflictItem[] {
  const visitMap = new Map(visits.map(v => [v.id, v]));
  return serverConflicts.map(sc => {
    const conflictVisits = (sc.visitIds || [])
      .map((id: string) => visitMap.get(id))
      .filter(Boolean) as MonitorVisit[];
    if (conflictVisits.length === 0) return null;
    return {
      id: sc.id,
      type: sc.type as ConflictType,
      severity: (sc.severity || 'warning') as 'critical' | 'warning' | 'info',
      description: sc.description || '',
      visits: conflictVisits,
      suggestedAction: sc.suggestedAction || sc.suggested_action || '',
    };
  }).filter(Boolean) as ConflictItem[];
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

const KpiCard = React.memo(function KpiCard({
  icon: Icon, label, value, iconColor, bgColor, pulse,
}: {
  icon: React.ElementType; label: string; value: string | number;
  iconColor: string; bgColor: string; pulse?: boolean;
}) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-xl border transition-all', bgColor)}>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bgColor)}>
        <Icon className={cn('size-5', iconColor, pulse && 'animate-pulse')} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
        <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
});

// ─── Tab type ───────────────────────────────────────────────────────────────

type MonitorTab = 'visits' | 'conflicts' | 'evv_resolution' | 'field_map' | 'analytics';

const TAB_CONFIG: { id: MonitorTab; label: string; icon: React.ElementType }[] = [
  { id: 'visits', label: 'Visit Monitor', icon: CalendarCheck },
  { id: 'field_map', label: 'Field Map', icon: Navigation },
  { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
  { id: 'evv_resolution', label: 'EVV Resolution', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

// ─── Live indicator ─────────────────────────────────────────────────────────

function LiveIndicator({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
        paused
          ? 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', paused ? 'bg-gray-400' : 'bg-emerald-500 animate-pulse')} />
      {paused ? 'Paused' : 'Live'}
    </button>
  );
}

// ─── Data source indicator ──────────────────────────────────────────────────

function DataSourceBadge({ live }: { live: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
      live
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-amber-50 border-amber-200 text-amber-700',
    )}>
      {live ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
      {live ? 'Live Data' : 'Demo Data'}
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PointOfCareMonitor() {
  const [visits, setVisits] = useState<MonitorVisit[]>(MOCK_VISITS);
  const [evvErrors, setEvvErrors] = useState<EvvError[]>(MOCK_EVV_ERRORS);
  const [conflicts, setConflicts] = useState<ConflictItem[]>(MOCK_CONFLICTS);
  const [activeTab, setActiveTab] = useState<MonitorTab>('visits');
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resending, setResending] = useState<string | null>(null);
  const [isLiveData, setIsLiveData] = useState(false);

  // Detail drawer (view mode)
  const [viewingVisit, setViewingVisit] = useState<MonitorVisit | null>(null);
  // Edit dialog
  const [editingVisit, setEditingVisit] = useState<MonitorVisit | null>(null);
  // Reassign dialog
  const [reassigningVisit, setReassigningVisit] = useState<MonitorVisit | null>(null);

  // Bulk mode for EVV Resolution
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedErrorIds, setSelectedErrorIds] = useState<string[]>([]);
  const [bulkResending, setBulkResending] = useState(false);

  // Date filter
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Track mount for initial load
  const initialLoadDone = useRef(false);

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch all three data sources in parallel
      const [serverVisits, serverErrors, serverConflicts] = await Promise.all([
        pointOfCareGateway.getMonitorVisits(selectedDate),
        pointOfCareGateway.getEvvErrors(),
        pointOfCareGateway.getConflicts(selectedDate),
      ]);

      // Map server data to frontend types
      if (serverVisits.length > 0) {
        const mappedVisits = serverVisits.map(mapServerVisit);
        setVisits(mappedVisits);

        // Build EVV errors by joining with visits
        if (serverErrors.length > 0) {
          const mappedErrors = buildEvvErrors(serverErrors, mappedVisits);
          setEvvErrors(mappedErrors);
        } else {
          // If no server errors, derive from visits with evv_error status
          const derivedErrors: EvvError[] = mappedVisits
            .filter(v => v.evvStatus === 'evv_error' || v.evvStatus === 'exception')
            .map((v, idx) => ({
              id: `derived-err-${v.id}`,
              visit: v,
              errorCode: 'EVV-UNK',
              errorDescription: `EVV transmission error for visit ${v.id}`,
              suggestedFix: 'Review visit details and retry transmission.',
              severity: 'medium' as const,
              occurredAt: new Date().toISOString(),
              retryCount: 0,
            }));
          setEvvErrors(derivedErrors);
        }

        // Build conflicts
        if (serverConflicts.length > 0) {
          const mappedConflicts = buildConflicts(serverConflicts, mappedVisits);
          setConflicts(mappedConflicts);
        } else {
          // Derive conflicts from visit conflict arrays
          const derivedConflicts: ConflictItem[] = [];
          const seen = new Set<string>();
          for (const v of mappedVisits) {
            for (const c of v.conflicts) {
              const key = `${c}-${v.id}`;
              if (seen.has(key)) continue;
              seen.add(key);
              derivedConflicts.push({
                id: `derived-conf-${key}`,
                type: c,
                severity: (c === 'missing_clock_out' || c === 'authorization_conflict') ? 'critical' : 'warning',
                description: `${v.caregiverName} — ${v.patientName}: ${c.replace(/_/g, ' ')}`,
                visits: [v],
                suggestedAction: 'Review and resolve this conflict.',
              });
            }
          }
          setConflicts(derivedConflicts);
        }

        setIsLiveData(true);
        if (!silent) toast.success('Monitor data loaded from server');
      } else {
        // Fallback to mock data
        setVisits([...MOCK_VISITS]);
        setEvvErrors([...MOCK_EVV_ERRORS]);
        setConflicts([...MOCK_CONFLICTS]);
        setIsLiveData(false);
        if (!silent) toast.info('Using demo data (server returned no visits)');
      }
    } catch (err) {
      console.error('[PointOfCareMonitor] Error fetching data:', err);
      setVisits([...MOCK_VISITS]);
      setEvvErrors([...MOCK_EVV_ERRORS]);
      setConflicts([...MOCK_CONFLICTS]);
      setIsLiveData(false);
      if (!silent) toast.error('Failed to load server data — using demo data');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedDate]);

  // Initial load
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchData(true);
    }
  }, [fetchData]);

  // Re-fetch when date changes
  useEffect(() => {
    if (initialLoadDone.current) {
      fetchData(true);
    }
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh polling (30s)
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [paused, fetchData]);

  // Metrics
  const metrics = useMemo(() => computeMetrics(visits), [visits]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  const handleViewVisit = useCallback((visit: MonitorVisit) => {
    setViewingVisit(visit);
  }, []);

  const handleEditVisit = useCallback((visit: MonitorVisit) => {
    setViewingVisit(null);
    setEditingVisit(visit);
  }, []);

  const handleReassign = useCallback((visit: MonitorVisit) => {
    setViewingVisit(null);
    setReassigningVisit(visit);
  }, []);

  const handleTransmit = useCallback(async (visit: MonitorVisit) => {
    toast.promise(
      (async () => {
        // Try server first
        if (isLiveData) {
          const result = await pointOfCareGateway.updateVisit(visit.id, { evv_status: 'transmitted' });
          if (!result.success) throw new Error('Server transmission failed');
        } else {
          await new Promise(r => setTimeout(r, 1200));
        }
        // Optimistic local update
        setVisits(prev => prev.map(v =>
          v.id === visit.id ? { ...v, evvStatus: 'transmitted' as const } : v
        ));
        setEvvErrors(prev => prev.filter(e => e.visit.id !== visit.id));
      })(),
      {
        loading: `Transmitting EVV for ${visit.patientName}...`,
        success: `EVV transmitted for ${visit.patientName}`,
        error: 'EVV transmission failed',
      }
    );
  }, [isLiveData]);

  const handleResendEvv = useCallback(async (error: EvvError) => {
    setResending(error.id);
    try {
      if (isLiveData) {
        const result = await pointOfCareGateway.resendEvvError(error.id);
        if (!result.success) {
          toast.error(result.error || 'Resend failed');
          return;
        }
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }
      // Optimistic local update
      setVisits(prev => prev.map(v =>
        v.id === error.visit.id ? { ...v, evvStatus: 'transmitted' as const } : v
      ));
      setEvvErrors(prev => prev.filter(e => e.id !== error.id));
      setSelectedErrorIds(prev => prev.filter(id => id !== error.id));
      toast.success(`EVV retransmitted for ${error.visit.patientName}`);
    } catch {
      toast.error('Resend failed');
    } finally {
      setResending(null);
    }
  }, [isLiveData]);

  const handleSaveEdit = useCallback(async (visit: MonitorVisit, changes: Record<string, any>) => {
    // Call server if live
    if (isLiveData) {
      // Map frontend field names to server field names
      const serverChanges: Record<string, any> = {};
      if (changes.scheduledTime) serverChanges.start_time = changes.scheduledTime;
      if (changes.actualStartTime) serverChanges.evv_clock_in = changes.actualStartTime;
      if (changes.actualEndTime) serverChanges.evv_clock_out = changes.actualEndTime;
      if (changes.notes !== undefined) serverChanges.notes = changes.notes;
      if (changes.status) serverChanges.status = changes.status;

      const result = await pointOfCareGateway.updateVisit(visit.id, serverChanges);
      if (!result.success) {
        toast.error('Failed to save visit changes on server');
      }
    }
    // Optimistic local update
    setVisits(prev => prev.map(v =>
      v.id === visit.id ? { ...v, ...changes } : v
    ));
  }, [isLiveData]);

  const handleReassignComplete = useCallback(async (
    visit: MonitorVisit, newCaregiverId: string, newCaregiverName: string, reason: string
  ) => {
    // Call server if live
    if (isLiveData) {
      const result = await pointOfCareGateway.reassignVisit(visit.id, newCaregiverId, reason);
      if (!result.success) {
        toast.error('Failed to reassign on server');
      }
    }
    // Optimistic local update
    setVisits(prev => prev.map(v =>
      v.id === visit.id ? { ...v, caregiverId: newCaregiverId, caregiverName: newCaregiverName } : v
    ));
    setConflicts(prev => prev.filter(c =>
      !(c.type === 'overlapping_visits' && c.visits.some(cv => cv.id === visit.id))
    ));
  }, [isLiveData]);

  // ─── Bulk selection ─────────────────────────────────────────────────────

  const handleSelectError = useCallback((id: string) => {
    setSelectedErrorIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const handleBulkResend = useCallback(async () => {
    if (selectedErrorIds.length === 0) return;
    setBulkResending(true);
    const count = selectedErrorIds.length;
    try {
      if (isLiveData) {
        const result = await pointOfCareGateway.bulkResendEvvErrors(selectedErrorIds);
        if (!result.success) {
          toast.error(result.error || 'Bulk resend failed on server');
          return;
        }
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }

      // Optimistic local update
      const idsToRemove = new Set(selectedErrorIds);
      const visitIdsToUpdate = new Set(
        evvErrors.filter(e => idsToRemove.has(e.id)).map(e => e.visit.id)
      );
      setVisits(prev => prev.map(v =>
        visitIdsToUpdate.has(v.id) ? { ...v, evvStatus: 'transmitted' as const } : v
      ));
      setEvvErrors(prev => prev.filter(e => !idsToRemove.has(e.id)));
      setSelectedErrorIds([]);
      setBulkMode(false);
      toast.success(`${count} EVV error${count !== 1 ? 's' : ''} retransmitted`);
    } catch {
      toast.error('Bulk resend failed');
    } finally {
      setBulkResending(false);
    }
  }, [selectedErrorIds, evvErrors, isLiveData]);

  const handleSelectAllErrors = useCallback(() => {
    if (selectedErrorIds.length === evvErrors.length) {
      setSelectedErrorIds([]);
    } else {
      setSelectedErrorIds(evvErrors.map(e => e.id));
    }
  }, [selectedErrorIds, evvErrors]);

  // ─── Field Map simulation handlers ──────────────────────────────────────

  const handleSimulateClockIn = useCallback(async (visit: MonitorVisit) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const changes: Partial<MonitorVisit> = {
      status: 'in_progress' as const,
      evvStatus: 'clocked_in' as const,
      actualStartTime: timeStr,
    };

    if (isLiveData) {
      await pointOfCareGateway.updateVisit(visit.id, {
        status: 'in_progress',
        evv_clock_in: now.toISOString(),
      });
    }

    setVisits(prev => prev.map(v =>
      v.id === visit.id ? { ...v, ...changes } : v
    ));
    toast.success(`Clock In simulated for ${visit.caregiverName} at ${timeStr}`);
  }, [isLiveData]);

  const handleSimulateClockOut = useCallback(async (visit: MonitorVisit) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const changes: Partial<MonitorVisit> = {
      status: 'completed' as const,
      evvStatus: 'transmitted' as const,
      actualEndTime: timeStr,
      docStatus: 'pending' as const,
    };

    if (isLiveData) {
      await pointOfCareGateway.updateVisit(visit.id, {
        status: 'completed',
        evv_clock_out: now.toISOString(),
      });
    }

    setVisits(prev => prev.map(v =>
      v.id === visit.id ? { ...v, ...changes } : v
    ));
    // Remove any missing_clock_out conflicts for this visit
    setConflicts(prev => prev.filter(c =>
      !(c.type === 'missing_clock_out' && c.visits.some(cv => cv.id === visit.id))
    ));
    toast.success(`Clock Out simulated for ${visit.caregiverName} at ${timeStr} — EVV auto-transmitted`);
  }, [isLiveData]);

  return (
    <div className="size-full flex flex-col bg-gray-50/80 overflow-hidden">
      {/* ═══ Header ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Monitor className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">PointOfCare Monitor</h1>
                <DataSourceBadge live={isLiveData} />
              </div>
              <p className="text-sm text-gray-500">EVV compliance &amp; visit execution monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ComplianceExport
              visits={visits}
              metrics={metrics}
              evvErrors={evvErrors}
              date={selectedDate}
            />
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2 mr-2">
              <Label className="text-xs text-gray-500">Date:</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="h-8 w-36 text-xs"
              />
            </div>
            <LiveIndicator paused={paused} onToggle={() => setPaused(!paused)} />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-7 gap-2.5">
          <KpiCard icon={CalendarCheck} label="Total Visits" value={metrics.totalVisits} iconColor="text-blue-600" bgColor="bg-blue-50/60 border-blue-100" />
          <KpiCard icon={Clock} label="Scheduled" value={metrics.scheduled} iconColor="text-gray-600" bgColor="bg-gray-50 border-gray-200" />
          <KpiCard icon={Activity} label="In Progress" value={metrics.inProgress} iconColor="text-blue-500" bgColor="bg-blue-50/60 border-blue-100" />
          <KpiCard icon={CheckCircle} label="Completed" value={metrics.completed} iconColor="text-emerald-600" bgColor="bg-emerald-50/60 border-emerald-100" />
          <KpiCard icon={Send} label="EVV Transmitted" value={metrics.evvTransmitted} iconColor="text-purple-600" bgColor="bg-purple-50/60 border-purple-100" />
          <KpiCard icon={Zap} label="EVV Errors" value={metrics.evvErrors} iconColor="text-red-500" bgColor="bg-red-50/60 border-red-100" pulse={metrics.evvErrors > 0} />
          <KpiCard icon={BarChart3} label="Compliance %" value={`${metrics.complianceRate}%`} iconColor="text-teal-600" bgColor="bg-teal-50/60 border-teal-100" />
        </div>
      </div>

      {/* ═══ Tabs ════════════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {TAB_CONFIG.map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            let count = 0;
            if (tab.id === 'conflicts') count = conflicts.length;
            if (tab.id === 'evv_resolution') count = evvErrors.length;

            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id !== 'evv_resolution') { setBulkMode(false); setSelectedErrorIds([]); } }}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                  active ? 'text-blue-700 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300',
                )}
              >
                <Icon className={cn('size-4', active ? 'text-blue-600' : 'text-gray-400')} />
                {tab.label}
                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px] h-5 min-w-[20px] px-1.5 rounded-full ml-0.5',
                      tab.id === 'evv_resolution' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Bulk mode toggle (only on EVV tab) */}
        {activeTab === 'evv_resolution' && evvErrors.length > 0 && (
          <div className="flex items-center gap-2 py-2">
            <Button
              variant={bulkMode ? 'default' : 'outline'}
              size="sm"
              className={cn('gap-1.5 text-xs', bulkMode && 'bg-blue-600 hover:bg-blue-700')}
              onClick={() => { setBulkMode(!bulkMode); setSelectedErrorIds([]); }}
            >
              <CheckSquare className="size-3.5" />
              {bulkMode ? 'Exit Bulk' : 'Bulk Select'}
            </Button>
          </div>
        )}
      </div>

      {/* ═══ Bulk Action Bar ═════════════════════════════════════════════════ */}
      {bulkMode && selectedErrorIds.length > 0 && (
        <div className="shrink-0 px-6 py-2.5 bg-blue-600 flex items-center gap-4 text-white">
          <span className="text-sm font-semibold">{selectedErrorIds.length} error{selectedErrorIds.length !== 1 ? 's' : ''} selected</span>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 text-xs bg-white/15 hover:bg-white/25 text-white border-0"
            onClick={handleSelectAllErrors}
          >
            {selectedErrorIds.length === evvErrors.length ? 'Deselect All' : 'Select All'}
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-white text-blue-700 hover:bg-blue-50"
            onClick={handleBulkResend}
            disabled={bulkResending}
          >
            {bulkResending ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Resend All Selected
          </Button>
          <button
            onClick={() => { setBulkMode(false); setSelectedErrorIds([]); }}
            className="p-1 rounded hover:bg-white/15"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ═══ Content ═════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'visits' && (
          <VisitMonitorTable
            visits={visits}
            onViewVisit={handleViewVisit}
            onEditVisit={handleEditVisit}
            onReassign={handleReassign}
            onTransmit={handleTransmit}
          />
        )}
        {activeTab === 'conflicts' && (
          <ConflictPanel
            conflicts={conflicts}
            onReassign={handleReassign}
          />
        )}
        {activeTab === 'evv_resolution' && (
          <EvvResolutionCenter
            errors={evvErrors}
            onEdit={handleEditVisit}
            onReassign={handleReassign}
            onResend={handleResendEvv}
            resending={resending}
            bulkMode={bulkMode}
            selectedIds={selectedErrorIds}
            onSelect={handleSelectError}
          />
        )}
        {activeTab === 'field_map' && (
          <CaregiverFieldMap
            visits={visits}
            onSimulateClockIn={handleSimulateClockIn}
            onSimulateClockOut={handleSimulateClockOut}
            onViewVisit={handleViewVisit}
          />
        )}
        {activeTab === 'analytics' && (
          <EvvComplianceAnalytics
            visits={visits}
            metrics={metrics}
          />
        )}
      </div>

      {/* ═══ Visit Detail Drawer ═════════════════════════════════════════════ */}
      <VisitDetailDrawer
        visit={viewingVisit}
        open={!!viewingVisit}
        onClose={() => setViewingVisit(null)}
        onEdit={handleEditVisit}
        onReassign={handleReassign}
        onTransmit={handleTransmit}
      />

      {/* ═══ Edit Dialog ═════════════════════════════════════════════════════ */}
      <VisitEditDialog
        visit={editingVisit}
        open={!!editingVisit}
        onOpenChange={open => { if (!open) setEditingVisit(null); }}
        onSave={handleSaveEdit}
      />

      {/* ═══ Reassign Dialog ═════════════════════════════════════════════════ */}
      <ReassignDialog
        visit={reassigningVisit}
        open={!!reassigningVisit}
        onOpenChange={open => { if (!open) setReassigningVisit(null); }}
        onReassign={handleReassignComplete}
      />
    </div>
  );
}