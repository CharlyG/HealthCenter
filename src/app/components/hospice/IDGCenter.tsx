/**
 * IDG Center Component — Hospice Interdisciplinary Group Meeting Hub
 *
 * Three-phase workflow:
 * 1. Meeting Preparation - Patient list with enriched clinical data
 * 2. Meeting Workspace - Live note-taking by clinical section
 * 3. Meeting Summary - Auto-generated decisions and follow-up tasks
 *
 * All data wired to backend via hospiceApi.ts
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { cn } from '../ui/utils';
import {
  Users2, CalendarDays, Plus, ChevronRight, ChevronDown,
  CheckCircle2, Clock, AlertCircle, ClipboardList, Eye,
  RefreshCw, X, UserCheck, FileText, MessageSquare, Play,
  Stethoscope, Pill, HeartPulse, Home, ListTodo, Save,
  Loader2, AlertTriangle, GitBranch, Download, Printer,
  ArrowLeft, ArrowRight, Search, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import {
  fetchIDGMeetings, createIDGMeeting, updateIDGMeeting,
  fetchIDGPreparation, saveIDGWorkspaceNotes, generateIDGSummary,
} from '../../lib/hospiceApi';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════════
// Types & Config
// ═══════════════════════════════════════════════════════════════════════════════

type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
type Phase = 'list' | 'preparation' | 'workspace' | 'summary';

interface WorkspaceNotes {
  clinicalStatus: string;
  medicationChanges: string;
  carePlanUpdates: string;
  familyConcerns: string;
  actionItems: { text: string; assignee: string; dueDate: string; priority: 'high' | 'medium' | 'low' }[];
}

const STATUS_CFG: Record<MeetingStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  scheduled:   { label: 'Scheduled',   bg: 'bg-blue-50',    color: 'text-blue-700',    icon: <CalendarDays className="size-3" /> },
  in_progress: { label: 'In Progress', bg: 'bg-emerald-50', color: 'text-emerald-700', icon: <Clock className="size-3 animate-pulse" /> },
  completed:   { label: 'Completed',   bg: 'bg-gray-100',   color: 'text-gray-600',    icon: <CheckCircle2 className="size-3" /> },
  cancelled:   { label: 'Cancelled',   bg: 'bg-red-50',     color: 'text-red-600',     icon: <AlertCircle className="size-3" /> },
};

const REVIEW_STATUS_CFG: Record<string, { label: string; bg: string; color: string }> = {
  pending:  { label: 'Pending',  bg: 'bg-amber-50',   color: 'text-amber-700' },
  reviewed: { label: 'Reviewed', bg: 'bg-emerald-50', color: 'text-emerald-700' },
  deferred: { label: 'Deferred', bg: 'bg-gray-100',   color: 'text-gray-600' },
};

const LOC_CFG: Record<string, { color: string }> = {
  'Routine Home Care':     { color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Continuous Home Care':  { color: 'bg-orange-50 text-orange-700 border-orange-200' },
  'General Inpatient Care': { color: 'bg-red-50 text-red-700 border-red-200' },
  'Inpatient Respite Care': { color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const HOPE_PHASE_LABELS: Record<string, string> = {
  admission: 'Admission', huv1: 'HUV-1', huv2: 'HUV-2', discharge: 'Discharge',
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const formatShortDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const emptyWorkspace = (): WorkspaceNotes => ({
  clinicalStatus: '', medicationChanges: '', carePlanUpdates: '', familyConcerns: '',
  actionItems: [{ text: '', assignee: '', dueDate: '', priority: 'medium' }],
});

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Patient Preparation Card ──────────────────────────────────────────────

const PatientPrepCard = React.memo(function PatientPrepCard({ review, expanded, onToggle }: {
  review: any; expanded: boolean; onToggle: () => void;
}) {
  const details = review.patientDetails || {};
  const hope = review.hopeStatus || {};
  const locCfg = LOC_CFG[details.levelOfCare] || LOC_CFG['Routine Home Care'];
  const rCfg = REVIEW_STATUS_CFG[review.status] || REVIEW_STATUS_CFG.pending;

  return (
    <div className={cn('rounded-xl border-2 transition-all overflow-hidden',
      hope.overdue ? 'border-red-200' :
      review.status === 'reviewed' ? 'border-emerald-200' : 'border-gray-200',
    )}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50" onClick={onToggle}>
        {expanded ? <ChevronDown className="size-4 text-gray-400 shrink-0" /> : <ChevronRight className="size-4 text-gray-400 shrink-0" />}
        <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
          <HeartPulse className="size-5 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{review.patientName}</span>
            <span className="text-[10px] text-gray-400">{review.mrn}</span>
            <Badge variant="outline" className={cn('text-[9px] h-4 px-1', rCfg.bg, rCfg.color)}>{rCfg.label}</Badge>
            {hope.overdue && <Badge variant="outline" className="text-[9px] h-4 px-1 bg-red-50 text-red-700 border-red-200"><AlertTriangle className="size-2 mr-0.5" />HOPE Overdue</Badge>}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {details.primaryDiagnosis} · {review.reviewType}
          </p>
        </div>
        <Badge variant="outline" className={cn('text-[9px] h-5 px-1.5 shrink-0 hidden md:flex', locCfg.color)}>
          {details.levelOfCare}
        </Badge>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {/* Clinical Updates */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <Stethoscope className="size-3" /> Recent Clinical Updates
              </h4>
              {(review.clinicalUpdates || []).slice(0, 3).map((u: any, i: number) => (
                <div key={i} className="text-xs border-l-2 border-rose-200 pl-2 py-0.5">
                  <p className="text-gray-800">{u.note}</p>
                  <p className="text-[9px] text-gray-400">{formatShortDate(u.date)} · {u.author}</p>
                </div>
              ))}
            </div>

            {/* HOPE Assessment Status */}
            <div className={cn('rounded-xl p-3 space-y-2', hope.overdue ? 'bg-red-50' : 'bg-gray-50')}>
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <GitBranch className="size-3" /> HOPE Assessment Status
              </h4>
              {hope.lastCompleted && (
                <div className="text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Last Completed</span><span className="font-semibold">{HOPE_PHASE_LABELS[hope.lastCompleted.phase] || hope.lastCompleted.phase}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{formatShortDate(hope.lastCompleted.date)}</span></div>
                  {hope.lastCompleted.score != null && <div className="flex justify-between"><span className="text-gray-500">Score</span><span className="font-bold text-rose-600">{hope.lastCompleted.score}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Assessor</span><span className="font-semibold">{hope.lastCompleted.assessor}</span></div>
                </div>
              )}
              {hope.nextDue && (
                <div className={cn('rounded-lg p-2 text-xs mt-1',
                  hope.nextDue.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  hope.nextDue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800',
                )}>
                  <span className="font-bold">{HOPE_PHASE_LABELS[hope.nextDue.phase] || hope.nextDue.phase}</span>
                  <span className="ml-1">— {hope.nextDue.status === 'overdue' ? 'OVERDUE' : hope.nextDue.status === 'in_progress' ? 'In Progress' : 'Due'}</span>
                  {hope.nextDue.dueDate && <span className="ml-1">({formatShortDate(hope.nextDue.dueDate)})</span>}
                </div>
              )}
            </div>

            {/* Care Team */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <Users2 className="size-3" /> Care Team
              </h4>
              {(review.careTeam || []).map((member: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[8px] h-4 px-1 bg-gray-100 text-gray-500 border-gray-200 shrink-0 w-10 justify-center">
                    {member.discipline}
                  </Badge>
                  <span className="text-gray-800 font-medium">{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient details row */}
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-400">
            <span>Admitted: <strong className="text-gray-600">{details.admitDate ? formatShortDate(details.admitDate) : '—'}</strong></span>
            <span>Cert Period: <strong className="text-gray-600">{details.certPeriod || '—'}</strong></span>
            <span>LOC: <strong className="text-gray-600">{details.levelOfCare}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Workspace Section ────────────────────────────────────────────────────

function WorkspaceSection({ icon, title, value, onChange, placeholder, color }: {
  icon: React.ReactNode; title: string; value: string; onChange: (v: string) => void; placeholder: string; color: string;
}) {
  return (
    <div className={cn('rounded-xl border-2 p-4 transition-all', value ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200')}>
      <h4 className={cn('text-xs font-bold flex items-center gap-1.5 mb-2', color)}>
        {icon} {title}
        {value && <CheckCircle2 className="size-3 text-emerald-500 ml-auto" />}
      </h4>
      <Textarea
        className="text-xs min-h-[80px] bg-white border-gray-200 resize-none"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// ─── Action Item Row ──────────────────────────────────────────────────────

function ActionItemRow({ item, index, onChange, onRemove }: {
  item: WorkspaceNotes['actionItems'][0]; index: number;
  onChange: (updates: Partial<typeof item>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2.5">
      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 space-y-1.5">
        <Input
          className="h-7 text-xs"
          placeholder="Action item description..."
          value={item.text}
          onChange={e => onChange({ text: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <Input
            className="h-6 text-[10px] flex-1"
            placeholder="Assignee"
            value={item.assignee}
            onChange={e => onChange({ assignee: e.target.value })}
          />
          <Input
            type="date"
            className="h-6 text-[10px] w-32"
            value={item.dueDate}
            onChange={e => onChange({ dueDate: e.target.value })}
          />
          <select
            className="h-6 text-[10px] border border-gray-200 rounded px-1"
            value={item.priority}
            onChange={e => onChange({ priority: e.target.value as any })}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-gray-400 hover:text-red-500 shrink-0 mt-0.5" onClick={onRemove}>
        <X className="size-3" />
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export const IDGCenter = React.memo(function IDGCenter() {
  const [phase, setPhase] = useState<Phase>('list');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'all'>('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ date: '', time: '10:00 AM', facilitator: 'Davis, Karen (RN)' });

  // Active meeting state
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [prepData, setPrepData] = useState<any>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());

  // Workspace state
  const [activePatientIdx, setActivePatientIdx] = useState(0);
  const [workspaceMap, setWorkspaceMap] = useState<Record<string, WorkspaceNotes>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Summary state
  const [summaryData, setSummaryData] = useState<any>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // ─── Load meetings ────────────────────────────────────────────────────

  const loadMeetings = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await fetchIDGMeetings(viewMode);
      setMeetings(data);
    } catch (err: any) { console.error('[IDGCenter] Error:', err); setError(err.message); }
    finally { setLoading(false); }
  }, [viewMode]);

  useEffect(() => { loadMeetings(); }, [loadMeetings]);

  // ─── Open preparation ─────────────────────────────────────────────────

  const openPreparation = useCallback(async (meetingId: string) => {
    setActiveMeetingId(meetingId);
    setPrepLoading(true); setPhase('preparation');
    try {
      const data = await fetchIDGPreparation(meetingId);
      setPrepData(data);
      // Pre-populate workspace from existing saved notes
      const wsMap: Record<string, WorkspaceNotes> = {};
      (data.patientReviews || []).forEach((r: any) => {
        wsMap[r.patientId] = r.workspaceNotes || emptyWorkspace();
      });
      setWorkspaceMap(wsMap);
      // Auto-expand first patient
      if (data.patientReviews?.length) setExpandedPatients(new Set([data.patientReviews[0].patientId]));
    } catch (err: any) { toast.error('Failed to load preparation data'); setPhase('list'); }
    finally { setPrepLoading(false); }
  }, []);

  // ─── Start meeting → go to workspace ──────────────────────────────────

  const startMeeting = useCallback(async () => {
    if (!activeMeetingId || !prepData) return;
    try {
      const updatedAttendees = (prepData.attendees || []).map((a: any) => ({ ...a, present: true }));
      await updateIDGMeeting(activeMeetingId, { status: 'in_progress', startedAt: new Date().toISOString(), attendees: updatedAttendees });
      setPrepData((prev: any) => prev ? { ...prev, status: 'in_progress', attendees: updatedAttendees } : prev);
      setActivePatientIdx(0);
      setPhase('workspace');
      toast.success('Meeting started — ready for patient reviews');
    } catch { toast.error('Failed to start meeting'); }
  }, [activeMeetingId, prepData]);

  // ─── Save workspace notes ─────────────────────────────────────────────

  const saveNotes = useCallback(async (patientId: string) => {
    if (!activeMeetingId) return;
    setSaving(true);
    try {
      const notes = workspaceMap[patientId] || emptyWorkspace();
      await saveIDGWorkspaceNotes(activeMeetingId, patientId, notes);
      setDirty(false);
      toast.success('Notes saved');
    } catch { toast.error('Failed to save notes'); }
    finally { setSaving(false); }
  }, [activeMeetingId, workspaceMap]);

  // ─── Generate summary ─────────────────────────────────────────────────

  const handleGenerateSummary = useCallback(async () => {
    if (!activeMeetingId) return;
    // Save all unsaved notes first
    setGeneratingSummary(true);
    try {
      for (const [pid, notes] of Object.entries(workspaceMap)) {
        if (notes.clinicalStatus || notes.medicationChanges || notes.carePlanUpdates || notes.familyConcerns || notes.actionItems.some(a => a.text)) {
          await saveIDGWorkspaceNotes(activeMeetingId, pid, notes);
        }
      }
      const result = await generateIDGSummary(activeMeetingId);
      setSummaryData(result.summary);
      setPhase('summary');
      toast.success('Meeting summary generated');
    } catch { toast.error('Failed to generate summary'); }
    finally { setGeneratingSummary(false); }
  }, [activeMeetingId, workspaceMap]);

  // ─── Update workspace notes helper ────────────────────────────────────

  const updateNotes = useCallback((patientId: string, field: keyof WorkspaceNotes, value: any) => {
    setWorkspaceMap(prev => ({
      ...prev,
      [patientId]: { ...(prev[patientId] || emptyWorkspace()), [field]: value },
    }));
    setDirty(true);
  }, []);

  const updateActionItem = useCallback((patientId: string, idx: number, updates: any) => {
    setWorkspaceMap(prev => {
      const ws = { ...(prev[patientId] || emptyWorkspace()) };
      const items = [...ws.actionItems];
      items[idx] = { ...items[idx], ...updates };
      return { ...prev, [patientId]: { ...ws, actionItems: items } };
    });
    setDirty(true);
  }, []);

  const addActionItem = useCallback((patientId: string) => {
    setWorkspaceMap(prev => {
      const ws = { ...(prev[patientId] || emptyWorkspace()) };
      return { ...prev, [patientId]: { ...ws, actionItems: [...ws.actionItems, { text: '', assignee: '', dueDate: '', priority: 'medium' as const }] } };
    });
  }, []);

  const removeActionItem = useCallback((patientId: string, idx: number) => {
    setWorkspaceMap(prev => {
      const ws = { ...(prev[patientId] || emptyWorkspace()) };
      const items = ws.actionItems.filter((_, i) => i !== idx);
      return { ...prev, [patientId]: { ...ws, actionItems: items.length ? items : [{ text: '', assignee: '', dueDate: '', priority: 'medium' as const }] } };
    });
  }, []);

  // ─── Create meeting ───────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    if (!newMeeting.date) return;
    setCreating(true);
    try {
      const standardTeam = [
        { name: 'Dr. Patel, Ravi', role: 'Medical Director' },
        { name: 'Smith, Janet (RN)', role: 'Hospice Nurse' },
        { name: 'Davis, Karen (RN)', role: 'Case Manager' },
        { name: 'Chen, Lisa (MSW)', role: 'Social Worker' },
        { name: 'Rev. Johnson, Michael', role: 'Chaplain' },
        { name: 'Miller, Sarah (CNA)', role: 'Aide Representative' },
        { name: 'Brown, David', role: 'Volunteer Coordinator' },
      ];
      await createIDGMeeting({ date: newMeeting.date, time: newMeeting.time, status: 'scheduled', facilitator: newMeeting.facilitator, attendees: standardTeam.map(t => ({ ...t })), patientReviews: [], actionItemCount: 0, completedActions: 0 });
      toast.success('IDG meeting scheduled');
      setShowCreateModal(false);
      setNewMeeting({ date: '', time: '10:00 AM', facilitator: 'Davis, Karen (RN)' });
      await loadMeetings();
    } catch { toast.error('Failed to create meeting'); }
    finally { setCreating(false); }
  }, [newMeeting, loadMeetings]);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const upcoming = meetings.filter(m => m.status === 'scheduled').length;
    const inProgress = meetings.filter(m => m.status === 'in_progress').length;
    const completed = meetings.filter(m => m.status === 'completed').length;
    const totalReviews = meetings.reduce((s, m) => s + (m.patientReviews?.length || 0), 0);
    return { upcoming, inProgress, completed, totalReviews };
  }, [meetings]);

  // ─── Current workspace patient ────────────────────────────────────────

  const patients = prepData?.patientReviews || [];
  const currentPatient = patients[activePatientIdx] || null;
  const currentNotes = currentPatient ? (workspaceMap[currentPatient.patientId] || emptyWorkspace()) : emptyWorkspace();

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER: Meeting List
  // ═══════════════════════════════════════════════════════════════════════

  if (loading) return <LoadingState message="Loading IDG meetings..." />;
  if (error) return <div className="text-center py-12 text-red-500"><p className="text-sm mb-2">{error}</p><Button size="sm" variant="outline" onClick={loadMeetings}>Retry</Button></div>;

  // ── Phase: Summary ─────────────────────────────────────────────────────

  if (phase === 'summary' && summaryData) {
    const s = summaryData;
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => { setPhase('list'); loadMeetings(); }}>
              <ArrowLeft className="size-3" /> Back to Meetings
            </Button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Sparkles className="size-5 text-rose-600" /> Meeting Summary</h2>
              <p className="text-xs text-gray-500">{formatDate(s.date)} at {s.time} · Facilitator: {s.facilitator}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Printer className="size-3" /> Print</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Download className="size-3" /> Export</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MetricCard title="Patients Reviewed" value={s.statistics.reviewed} subtitle={`of ${s.statistics.totalPatients} scheduled`} icon={<UserCheck className="size-4" />} variant="success" />
          <MetricCard title="Deferred" value={s.statistics.deferred} icon={<Clock className="size-4" />} variant={s.statistics.deferred > 0 ? 'warning' : 'default'} />
          <MetricCard title="Pending" value={s.statistics.pending} icon={<AlertCircle className="size-4" />} variant={s.statistics.pending > 0 ? 'danger' : 'default'} />
          <MetricCard title="Action Items" value={s.statistics.totalActionItems} subtitle="Generated" icon={<ListTodo className="size-4" />} />
          <MetricCard title="Attendees" value={s.attendees?.length || 0} subtitle={s.absentees?.length ? `${s.absentees.length} absent` : 'All present'} icon={<Users2 className="size-4" />} />
        </div>

        {/* Patient summaries */}
        {(s.patientSummaries || []).map((ps: any) => (
          <Card key={ps.patientId} className="border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <HeartPulse className="size-4 text-rose-600" />
                {ps.patientName}
                <span className="text-[10px] text-gray-400">{ps.mrn}</span>
                <Badge variant="outline" className="text-[9px] h-4 px-1 bg-emerald-50 text-emerald-700">{ps.reviewType}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {ps.clinicalStatus && (
                  <div className="bg-blue-50/50 rounded-lg p-3">
                    <h5 className="text-[10px] font-bold text-blue-700 uppercase mb-1 flex items-center gap-1"><Stethoscope className="size-3" /> Clinical Status</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">{ps.clinicalStatus}</p>
                  </div>
                )}
                {ps.medicationChanges && (
                  <div className="bg-purple-50/50 rounded-lg p-3">
                    <h5 className="text-[10px] font-bold text-purple-700 uppercase mb-1 flex items-center gap-1"><Pill className="size-3" /> Medication Changes</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">{ps.medicationChanges}</p>
                  </div>
                )}
                {ps.carePlanUpdates && (
                  <div className="bg-amber-50/50 rounded-lg p-3">
                    <h5 className="text-[10px] font-bold text-amber-700 uppercase mb-1 flex items-center gap-1"><ClipboardList className="size-3" /> Care Plan Updates</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">{ps.carePlanUpdates}</p>
                  </div>
                )}
                {ps.familyConcerns && (
                  <div className="bg-rose-50/50 rounded-lg p-3">
                    <h5 className="text-[10px] font-bold text-rose-700 uppercase mb-1 flex items-center gap-1"><Home className="size-3" /> Family Concerns</h5>
                    <p className="text-gray-700 whitespace-pre-wrap">{ps.familyConcerns}</p>
                  </div>
                )}
              </div>
              {ps.actions?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h5 className="text-[10px] font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1"><ListTodo className="size-3" /> Action Items ({ps.actionCount})</h5>
                  <div className="space-y-1">
                    {ps.actions.map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs">
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</span>
                        <span className="flex-1 text-gray-800">{a.text}</span>
                        {a.assignee && <span className="text-gray-500 shrink-0">{a.assignee}</span>}
                        {a.dueDate && <span className="text-gray-400 shrink-0 text-[10px]">{formatShortDate(a.dueDate)}</span>}
                        <Badge variant="outline" className={cn('text-[8px] h-4 px-1',
                          a.priority === 'high' ? 'bg-red-50 text-red-700' : a.priority === 'low' ? 'bg-gray-50 text-gray-500' : 'bg-amber-50 text-amber-700',
                        )}>{a.priority}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Deferred */}
        {s.deferredPatients?.length > 0 && (
          <Card className="border-amber-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="size-4 text-amber-600" /> Deferred Patients ({s.deferredPatients.length})</CardTitle></CardHeader>
            <CardContent>
              {s.deferredPatients.map((d: any) => (
                <div key={d.patientId} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-gray-900">{d.patientName}</span>
                  <span className="text-gray-500">{d.reason}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* All action items consolidated */}
        {s.allActionItems?.length > 0 && (
          <Card className="border-rose-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ListTodo className="size-4 text-rose-600" /> All Action Items ({s.allActionItems.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">#</th>
                    <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Patient</th>
                    <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Action</th>
                    <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Assigned To</th>
                    <th className="py-2 px-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Due</th>
                    <th className="py-2 px-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Priority</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {s.allActionItems.map((a: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/80">
                        <td className="py-2 px-3 font-bold text-gray-400">{i + 1}</td>
                        <td className="py-2 px-3 font-medium text-gray-900">{a.patientName}</td>
                        <td className="py-2 px-3 text-gray-700">{a.text}</td>
                        <td className="py-2 px-3 text-gray-600">{a.assignee || '—'}</td>
                        <td className="py-2 px-3 text-center text-gray-500">{a.dueDate ? formatShortDate(a.dueDate) : '—'}</td>
                        <td className="py-2 px-3 text-center">
                          <Badge variant="outline" className={cn('text-[8px] h-4 px-1', a.priority === 'high' ? 'bg-red-50 text-red-700' : a.priority === 'low' ? 'bg-gray-50 text-gray-500' : 'bg-amber-50 text-amber-700')}>{a.priority}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Phase: Workspace ───────────────────────────────────────────────────

  if (phase === 'workspace' && prepData && currentPatient) {
    const progress = Math.round((patients.filter((p: any) => {
      const ws = workspaceMap[p.patientId];
      return ws && (ws.clinicalStatus || ws.medicationChanges || ws.carePlanUpdates || ws.familyConcerns);
    }).length / Math.max(1, patients.length)) * 100);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setPhase('preparation')}>
              <ArrowLeft className="size-3" /> Preparation
            </Button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="size-5 text-rose-600" /> Meeting Workspace
              </h2>
              <p className="text-xs text-gray-500">{formatDate(prepData.date)} · Patient {activePatientIdx + 1} of {patients.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', STATUS_CFG.in_progress.bg, STATUS_CFG.in_progress.color)}>{STATUS_CFG.in_progress.icon}<span className="ml-1">Meeting Active</span></Badge>
            <Button size="sm" className="h-8 text-xs gap-1 bg-rose-600 hover:bg-rose-700" onClick={handleGenerateSummary} disabled={generatingSummary}>
              {generatingSummary ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
              Generate Summary
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1 h-2 [&>[data-slot=progress-indicator]]:bg-rose-500" />
          <span className="text-xs font-bold text-gray-500 tabular-nums">{progress}%</span>
        </div>

        {/* Patient navigator */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {patients.map((p: any, idx: number) => {
            const ws = workspaceMap[p.patientId];
            const hasNotes = ws && (ws.clinicalStatus || ws.medicationChanges || ws.carePlanUpdates || ws.familyConcerns);
            return (
              <button
                key={p.patientId}
                onClick={() => { if (dirty && currentPatient) saveNotes(currentPatient.patientId); setActivePatientIdx(idx); }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border-2 transition-all shrink-0',
                  idx === activePatientIdx
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : hasNotes
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              >
                {hasNotes && <CheckCircle2 className="size-3" />}
                {p.patientName?.split(',')[0]}
              </button>
            );
          })}
        </div>

        {/* Patient context bar */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeartPulse className="size-5 text-rose-600" />
            <div>
              <span className="text-sm font-bold text-gray-900">{currentPatient.patientName}</span>
              <span className="text-[10px] text-gray-400 ml-2">{currentPatient.mrn}</span>
              <p className="text-[10px] text-gray-500">{currentPatient.patientDetails?.primaryDiagnosis} · {currentPatient.reviewType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => saveNotes(currentPatient.patientId)} disabled={saving}>
              {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />} Save
            </Button>
          </div>
        </div>

        {/* Workspace sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WorkspaceSection
            icon={<Stethoscope className="size-3.5" />} title="Clinical Status" color="text-blue-700"
            value={currentNotes.clinicalStatus}
            onChange={v => updateNotes(currentPatient.patientId, 'clinicalStatus', v)}
            placeholder="Document current clinical status, symptoms, vital signs, functional status..."
          />
          <WorkspaceSection
            icon={<Pill className="size-3.5" />} title="Medication Changes" color="text-purple-700"
            value={currentNotes.medicationChanges}
            onChange={v => updateNotes(currentPatient.patientId, 'medicationChanges', v)}
            placeholder="Document any medication additions, discontinuations, dosage changes..."
          />
          <WorkspaceSection
            icon={<ClipboardList className="size-3.5" />} title="Care Plan Updates" color="text-amber-700"
            value={currentNotes.carePlanUpdates}
            onChange={v => updateNotes(currentPatient.patientId, 'carePlanUpdates', v)}
            placeholder="Document care plan modifications, goal changes, frequency adjustments..."
          />
          <WorkspaceSection
            icon={<Home className="size-3.5" />} title="Family Concerns" color="text-rose-700"
            value={currentNotes.familyConcerns}
            onChange={v => updateNotes(currentPatient.patientId, 'familyConcerns', v)}
            placeholder="Document family questions, psychosocial concerns, caregiver needs..."
          />
        </div>

        {/* Action Items */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><ListTodo className="size-4 text-rose-600" /> Action Items</CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => addActionItem(currentPatient.patientId)}>
                <Plus className="size-3" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentNotes.actionItems.map((item, idx) => (
              <ActionItemRow key={idx} item={item} index={idx}
                onChange={updates => updateActionItem(currentPatient.patientId, idx, updates)}
                onRemove={() => removeActionItem(currentPatient.patientId, idx)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button variant="outline" size="sm" disabled={activePatientIdx === 0}
            onClick={() => { if (dirty) saveNotes(currentPatient.patientId); setActivePatientIdx(i => i - 1); }}>
            <ArrowLeft className="size-3 mr-1" /> Previous Patient
          </Button>
          {activePatientIdx < patients.length - 1 ? (
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700"
              onClick={() => { if (dirty) saveNotes(currentPatient.patientId); setActivePatientIdx(i => i + 1); }}>
              Next Patient <ArrowRight className="size-3 ml-1" />
            </Button>
          ) : (
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 gap-1" onClick={handleGenerateSummary} disabled={generatingSummary}>
              {generatingSummary ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
              Finish & Generate Summary
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Phase: Preparation ─────────────────────────────────────────────────

  if (phase === 'preparation' && prepData) {
    if (prepLoading) return <LoadingState message="Loading preparation data..." />;
    const reviewedCount = patients.filter((p: any) => p.status === 'reviewed').length;

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setPhase('list')}>
              <ArrowLeft className="size-3" /> Back
            </Button>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="size-5 text-rose-600" /> Meeting Preparation
              </h2>
              <p className="text-xs text-gray-500">
                {formatDate(prepData.date)} at {prepData.time} · Facilitator: {prepData.facilitator} · {patients.length} patient{patients.length !== 1 ? 's' : ''} to review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', STATUS_CFG[prepData.status as MeetingStatus]?.bg, STATUS_CFG[prepData.status as MeetingStatus]?.color)}>
              {STATUS_CFG[prepData.status as MeetingStatus]?.icon}
              <span className="ml-1">{STATUS_CFG[prepData.status as MeetingStatus]?.label}</span>
            </Badge>
            {(prepData.status === 'scheduled' || prepData.status === 'in_progress') && (
              <Button size="sm" className="h-8 text-xs gap-1 bg-rose-600 hover:bg-rose-700" onClick={prepData.status === 'scheduled' ? startMeeting : () => setPhase('workspace')}>
                <Play className="size-3" /> {prepData.status === 'scheduled' ? 'Start Meeting' : 'Continue Workspace'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard title="Patients to Review" value={patients.length} icon={<HeartPulse className="size-4" />} />
          <MetricCard title="Reviewed" value={reviewedCount} subtitle={`${patients.length - reviewedCount} remaining`} icon={<CheckCircle2 className="size-4" />} variant="success" />
          <MetricCard title="Team Members" value={prepData.attendees?.length || 0} subtitle="Invited" icon={<Users2 className="size-4" />} />
          <MetricCard title="HOPE Overdue" value={patients.filter((p: any) => p.hopeStatus?.overdue).length} icon={<AlertTriangle className="size-4" />} variant={patients.some((p: any) => p.hopeStatus?.overdue) ? 'danger' : 'default'} />
        </div>

        {/* Team */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1"><Users2 className="size-3.5" /> Interdisciplinary Team</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(prepData.attendees || []).map((a: any) => (
                <div key={a.name} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs border',
                  a.present === true ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  a.present === false ? 'bg-red-50 border-red-200 text-red-600 line-through' :
                  'bg-gray-50 border-gray-200 text-gray-600',
                )}>
                  {a.present === true && <CheckCircle2 className="size-3" />}
                  <span className="font-medium">{a.name}</span>
                  <span className="text-gray-400">({a.role})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient list */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <HeartPulse className="size-4 text-rose-600" />
            Patients Scheduled for Review ({patients.length})
          </h3>
          <div className="space-y-3">
            {patients.map((review: any) => (
              <PatientPrepCard
                key={review.patientId}
                review={review}
                expanded={expandedPatients.has(review.patientId)}
                onToggle={() => setExpandedPatients(prev => {
                  const n = new Set(prev);
                  if (n.has(review.patientId)) n.delete(review.patientId); else n.add(review.patientId);
                  return n;
                })}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: Meeting List (default) ──────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Upcoming" value={stats.upcoming} icon={<CalendarDays className="size-4" />} variant={stats.upcoming > 0 ? 'warning' : 'default'} />
        <MetricCard title="In Progress" value={stats.inProgress} icon={<Clock className="size-4" />} variant={stats.inProgress > 0 ? 'success' : 'default'} />
        <MetricCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="size-4" />} />
        <MetricCard title="Total Reviews" value={stats.totalReviews} icon={<UserCheck className="size-4" />} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={viewMode === 'upcoming' ? 'default' : 'outline'} className={viewMode === 'upcoming' ? 'bg-rose-600 hover:bg-rose-700' : ''} onClick={() => setViewMode('upcoming')}>Upcoming</Button>
          <Button size="sm" variant={viewMode === 'all' ? 'default' : 'outline'} className={viewMode === 'all' ? 'bg-rose-600 hover:bg-rose-700' : ''} onClick={() => setViewMode('all')}>All Meetings</Button>
          <Button size="sm" variant="outline" onClick={loadMeetings}><RefreshCw className="size-3" /></Button>
        </div>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700 gap-1" onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4" /> Schedule IDG Meeting
        </Button>
      </div>

      {/* Meeting cards */}
      {meetings.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-400">
            <Users2 className="size-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">No {viewMode === 'upcoming' ? 'upcoming ' : ''}meetings</p>
            <p className="text-sm">Schedule a new IDG meeting to get started</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {meetings.map(meeting => {
            const sCfg = STATUS_CFG[meeting.status as MeetingStatus] || STATUS_CFG.scheduled;
            const totalReviews = meeting.patientReviews?.length || 0;
            const reviewedCount = meeting.patientReviews?.filter((r: any) => r.status === 'reviewed').length || 0;
            const presentCount = meeting.attendees?.filter((a: any) => a.present).length || 0;

            return (
              <Card key={meeting.id} className={cn(
                meeting.status === 'in_progress' ? 'border-emerald-300 ring-1 ring-emerald-100' :
                meeting.status === 'scheduled' ? 'border-rose-200' : '',
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        meeting.status === 'in_progress' ? 'bg-emerald-50' :
                        meeting.status === 'scheduled' ? 'bg-rose-50' : 'bg-gray-50',
                      )}>
                        <CalendarDays className={cn('size-5',
                          meeting.status === 'in_progress' ? 'text-emerald-600' :
                          meeting.status === 'scheduled' ? 'text-rose-600' : 'text-gray-400',
                        )} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          IDG Meeting — {formatDate(meeting.date)}
                        </h3>
                        <p className="text-[10px] text-gray-400">
                          {meeting.time} · Facilitator: {meeting.facilitator} · {totalReviews} patient{totalReviews !== 1 ? 's' : ''}
                          {meeting.status === 'completed' && ` · ${reviewedCount}/${totalReviews} reviewed`}
                          {meeting.status === 'in_progress' && ` · ${presentCount} present`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn('text-xs border', sCfg.bg, sCfg.color)}>{sCfg.icon}<span className="ml-1">{sCfg.label}</span></Badge>
                      {meeting.status === 'completed' && meeting.generatedSummary && (
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1"
                          onClick={() => { setSummaryData(meeting.generatedSummary); setActiveMeetingId(meeting.id); setPhase('summary'); }}>
                          <Eye className="size-3" /> View Summary
                        </Button>
                      )}
                      {(meeting.status === 'scheduled' || meeting.status === 'in_progress') && (
                        <Button size="sm" className="h-7 text-[10px] gap-1 bg-rose-600 hover:bg-rose-700" onClick={() => openPreparation(meeting.id)}>
                          <Play className="size-3" /> {meeting.status === 'scheduled' ? 'Prepare' : 'Continue'}
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Patient pills */}
                  {totalReviews > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                      {meeting.patientReviews.map((r: any) => {
                        const rCfg2 = REVIEW_STATUS_CFG[r.status] || REVIEW_STATUS_CFG.pending;
                        return (
                          <span key={r.patientId} className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border', rCfg2.bg, rCfg2.color)}>
                            {r.status === 'reviewed' && <CheckCircle2 className="size-2.5" />}
                            {r.patientName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Create Meeting Modal ──────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <Card className="w-[440px] max-w-[90vw] shadow-xl" onClick={e => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Plus className="size-4 text-rose-600" /> Schedule IDG Meeting</CardTitle>
                  <CardDescription>The standard IDG team will be auto-invited.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}><X className="size-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Date *</label>
                <input type="date" className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm" value={newMeeting.date} onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Time</label>
                <input type="text" className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm" value={newMeeting.time} onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })} placeholder="e.g. 10:00 AM" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Facilitator</label>
                <input type="text" className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm" value={newMeeting.facilitator} onChange={e => setNewMeeting({ ...newMeeting, facilitator: e.target.value })} />
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-rose-700 mb-1">Standard IDG Team (Auto-Invited)</h4>
                <p className="text-[10px] text-rose-600">Medical Director, Hospice Nurse, Case Manager, Social Worker, Chaplain, Aide Representative, Volunteer Coordinator</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button size="sm" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={handleCreate} disabled={creating || !newMeeting.date}>
                  {creating ? <><Loader2 className="size-3 mr-1 animate-spin" />Creating...</> : 'Create Meeting'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});
