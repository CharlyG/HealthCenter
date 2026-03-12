/**
 * HOPE Timeline Component
 * Displays HOPE (Hospice Outcomes & Patient Evaluation) assessments
 * along a horizontal timeline: Admission → HUV1 → HUV2 → Discharge
 *
 * Wired to backend: GET /hospice/patients
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  FileText,
  CalendarDays,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LoadingState } from '../design-system/LoadingState';
import { fetchHospicePatients, startHOPEAssessment, fetchOASISRecords } from '../../lib/hospiceApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type HOPEPhase = 'admission' | 'huv1' | 'huv2' | 'discharge';
type HOPEStatus = 'completed' | 'in_progress' | 'due' | 'overdue' | 'upcoming' | 'not_applicable';
type FilterStatus = 'all' | 'action_needed' | 'on_track';

interface HOPEAssessment {
  phase: HOPEPhase;
  status: HOPEStatus;
  dueDate?: string;
  completedDate?: string;
  assessor?: string;
  score?: number;
}

interface HOPEPatient {
  id: string;
  patientName: string;
  mrn: string;
  admitDate: string;
  primaryDiagnosis: string;
  certPeriod: string;
  assessments: HOPEAssessment[];
}

const phaseLabels: Record<HOPEPhase, string> = {
  admission: 'Admission',
  huv1: 'HUV-1',
  huv2: 'HUV-2',
  discharge: 'Discharge',
};

const phaseDescriptions: Record<HOPEPhase, string> = {
  admission: 'Initial assessment within 5 days',
  huv1: '1st Hospice Utilization Visit',
  huv2: '2nd Hospice Utilization Visit',
  discharge: 'Discharge or death assessment',
};

const statusConfig: Record<HOPEStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300', icon: <CheckCircle2 className="size-4 text-green-600" /> },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300', icon: <Clock className="size-4 text-blue-600" /> },
  due: { label: 'Due', color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-300', icon: <AlertTriangle className="size-4 text-amber-600" /> },
  overdue: { label: 'Overdue', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300', icon: <AlertTriangle className="size-4 text-red-600" /> },
  upcoming: { label: 'Upcoming', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200', icon: <Circle className="size-4 text-gray-400" /> },
  not_applicable: { label: 'N/A', color: 'text-gray-400', bgColor: 'bg-gray-50 border-gray-200 opacity-50', icon: <Circle className="size-4 text-gray-300" /> },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const PhaseNode = React.memo(({ assessment, isLast }: { assessment: HOPEAssessment; isLast: boolean }) => {
  const config = statusConfig[assessment.status];
  return (
    <div className="flex items-center">
      <div className="relative flex flex-col items-center min-w-[120px]">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${config.bgColor}`}>
          {config.icon}
        </div>
        <span className="text-xs font-medium text-gray-700 mt-1.5">{phaseLabels[assessment.phase]}</span>
        <span className={`text-[10px] mt-0.5 ${config.color}`}>
          {assessment.completedDate
            ? formatDate(assessment.completedDate)
            : assessment.dueDate
              ? `Due ${formatDate(assessment.dueDate)}`
              : config.label}
        </span>
        {assessment.score !== undefined && (
          <span className="text-[10px] font-semibold text-gray-500 mt-0.5">Score: {assessment.score}</span>
        )}
      </div>
      {!isLast && (
        <div className={`h-0.5 w-8 -mx-2 ${
          assessment.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
        }`} />
      )}
    </div>
  );
});
PhaseNode.displayName = 'PhaseNode';

export const HOPETimeline = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<HOPEPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingAssessment, setStartingAssessment] = useState<string | null>(null);
  const [oasisRecords, setOasisRecords] = useState<Record<string, any[]>>({});
  const [loadingOasis, setLoadingOasis] = useState<string | null>(null);

  // Assessment detail modal
  const [detailAssessment, setDetailAssessment] = useState<{ patient: HOPEPatient; assessment: HOPEAssessment } | null>(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHospicePatients({
        search: searchQuery || undefined,
        filter: filterStatus !== 'all' ? filterStatus : undefined,
      });
      setPatients(data);
    } catch (err: any) {
      console.error('[HOPETimeline] Error loading patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStatus]);

  useEffect(() => {
    const debounce = setTimeout(loadPatients, 300);
    return () => clearTimeout(debounce);
  }, [loadPatients]);

  const handleStartAssessment = useCallback(async (patientId: string, phase: HOPEPhase) => {
    const key = `${patientId}:${phase}`;
    setStartingAssessment(key);
    try {
      await startHOPEAssessment(patientId, phase);
      await loadPatients();
    } catch (err: any) {
      console.error('[HOPETimeline] Error starting assessment:', err);
    } finally {
      setStartingAssessment(null);
    }
  }, [loadPatients]);

  const loadOASIS = useCallback(async (patientId: string) => {
    if (oasisRecords[patientId]) return;
    setLoadingOasis(patientId);
    try {
      const records = await fetchOASISRecords(patientId);
      setOasisRecords((prev) => ({ ...prev, [patientId]: records }));
    } catch (err: any) {
      console.error('[HOPETimeline] Error loading OASIS:', err);
    } finally {
      setLoadingOasis(null);
    }
  }, [oasisRecords]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedPatient((prev) => {
      const next = prev === id ? null : id;
      if (next) loadOASIS(next);
      return next;
    });
  }, [loadOASIS]);

  const statusCounts = useMemo(() => {
    let overdue = 0, due = 0, inProgress = 0;
    patients.forEach((p) =>
      p.assessments?.forEach((a) => {
        if (a.status === 'overdue') overdue++;
        if (a.status === 'due') due++;
        if (a.status === 'in_progress') inProgress++;
      })
    );
    return { overdue, due, inProgress };
  }, [patients]);

  return (
    <div className="space-y-6">
      {/* Phase Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['admission', 'huv1', 'huv2', 'discharge'] as HOPEPhase[]).map((phase) => (
          <div key={phase} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-gray-900">{phaseLabels[phase]}</div>
            <div className="text-xs text-gray-500 mt-0.5">{phaseDescriptions[phase]}</div>
          </div>
        ))}
      </div>

      {/* Status Summary */}
      <div className="flex items-center gap-4 text-sm">
        <Badge className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="size-3 mr-1" />
          {statusCounts.overdue} Overdue
        </Badge>
        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="size-3 mr-1" />
          {statusCounts.due} Due Now
        </Badge>
        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="size-3 mr-1" />
          {statusCounts.inProgress} In Progress
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="size-5 text-rose-600" />
              HOPE Assessment Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search patients..."
                  className="pl-9 w-56 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <Filter className="size-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="action_needed">Action Needed</SelectItem>
                  <SelectItem value="on_track">On Track</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-9" onClick={loadPatients}>
                <RefreshCw className="size-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading HOPE assessments..." />
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertTriangle className="size-12 mx-auto mb-4 text-red-300" />
              <p className="text-lg font-medium mb-1">Error loading data</p>
              <p className="text-sm mb-4">{error}</p>
              <Button size="sm" variant="outline" onClick={loadPatients}>Retry</Button>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="size-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-1">No patients found</p>
              <p className="text-sm">Adjust your filters to see HOPE timelines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => {
                const hasUrgent = patient.assessments?.some((a) => a.status === 'overdue' || a.status === 'due');
                const isExpanded = expandedPatient === patient.id;

                return (
                  <div
                    key={patient.id}
                    className={`border rounded-lg transition-shadow ${
                      hasUrgent ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200 bg-white'
                    } hover:shadow-sm`}
                  >
                    <button
                      className="w-full flex items-center gap-4 p-4 text-left"
                      onClick={() => toggleExpand(patient.id)}
                    >
                      <ChevronRight
                        className={`size-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                      <div className="min-w-[180px]">
                        <div className="font-medium text-gray-900 text-sm">{patient.patientName}</div>
                        <div className="text-xs text-gray-500">{patient.mrn} · {patient.primaryDiagnosis}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{patient.certPeriod}</div>
                      </div>
                      <div className="flex items-center gap-0 ml-auto overflow-x-auto">
                        {patient.assessments?.map((assessment, idx) => (
                          <PhaseNode
                            key={assessment.phase}
                            assessment={assessment}
                            isLast={idx === patient.assessments.length - 1}
                          />
                        ))}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {patient.assessments?.map((a) => {
                            const cfg = statusConfig[a.status];
                            return (
                              <div key={a.phase} className="bg-white border border-gray-200 rounded-md p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-gray-700">{phaseLabels[a.phase]}</span>
                                  <Badge className={`${cfg.bgColor} ${cfg.color} text-[10px]`}>{cfg.label}</Badge>
                                </div>
                                {a.completedDate && <div className="text-xs text-gray-600">Completed: {formatDate(a.completedDate)}</div>}
                                {a.assessor && <div className="text-xs text-gray-500">By: {a.assessor}</div>}
                                {a.score !== undefined && <div className="text-xs text-gray-600 font-medium">HOPE Score: {a.score}/100</div>}
                                {a.dueDate && a.status !== 'completed' && (
                                  <div className={`text-xs mt-1 ${a.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                    Due: {formatDate(a.dueDate)}
                                  </div>
                                )}
                                {(a.status === 'due' || a.status === 'overdue') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 h-7 text-xs w-full"
                                    disabled={startingAssessment === `${patient.id}:${a.phase}`}
                                    onClick={(e) => { e.stopPropagation(); handleStartAssessment(patient.id, a.phase); }}
                                  >
                                    {startingAssessment === `${patient.id}:${a.phase}` ? (
                                      <><RefreshCw className="size-3 mr-1 animate-spin" />Starting...</>
                                    ) : (
                                      <><Plus className="size-3 mr-1" />Start Assessment</>
                                    )}
                                  </Button>
                                )}
                                {a.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="mt-2 h-7 text-xs w-full"
                                    onClick={(e) => { e.stopPropagation(); setDetailAssessment({ patient, assessment: a }); }}
                                  >
                                    <Eye className="size-3 mr-1" />View Details
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* OASIS Records Section */}
                        {loadingOasis === patient.id ? (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <RefreshCw className="size-3 animate-spin" /> Loading linked OASIS records...
                            </div>
                          </div>
                        ) : oasisRecords[patient.id]?.length > 0 ? (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <FileText className="size-3" /> Linked OASIS-E Records
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {oasisRecords[patient.id].map((oasis: any) => (
                                <div key={oasis.id} className="bg-white border border-gray-200 rounded-md p-2.5 text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-gray-800">{oasis.assessmentType} — {oasis.reason}</span>
                                    <Badge className={`text-[9px] ${oasis.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                      {oasis.status === 'completed' ? 'Completed' : 'In Progress'}
                                    </Badge>
                                  </div>
                                  <div className="text-gray-500">
                                    {oasis.completedDate ? formatDate(oasis.completedDate) : oasis.startedDate ? `Started ${formatDate(oasis.startedDate)}` : ''}
                                    {oasis.clinician && ` · ${oasis.clinician}`}
                                  </div>
                                  {oasis.hopePhase && (
                                    <div className="text-gray-400 mt-0.5">
                                      HOPE Phase: {phaseLabels[oasis.hopePhase as HOPEPhase] || oasis.hopePhase}
                                      {oasis.hopeScore !== undefined && ` · Score: ${oasis.hopeScore}`}
                                    </div>
                                  )}
                                  {oasis.m1860_ambulation !== undefined && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600">Grooming: {oasis.m1800_grooming}</span>
                                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600">Bathing: {oasis.m1830_bathing}</span>
                                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600">Ambulation: {oasis.m1860_ambulation}</span>
                                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[9px] text-gray-600">Hosp Risk: {oasis.m1033_hosp_risk}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* OASIS M-Item Trend Chart */}
                            {oasisRecords[patient.id].filter((o: any) => o.m1860_ambulation !== undefined).length >= 2 && (
                              <div className="mt-3">
                                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                  Functional Status Trend (OASIS M-Items)
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-md p-3">
                                  <ResponsiveContainer width="100%" height={200}>
                                    <LineChart
                                      data={oasisRecords[patient.id]
                                        .filter((o: any) => o.m1860_ambulation !== undefined && o.completedDate)
                                        .sort((a: any, b: any) => new Date(a.completedDate).getTime() - new Date(b.completedDate).getTime())
                                        .map((o: any) => ({
                                          name: o.hopePhase ? phaseLabels[o.hopePhase as HOPEPhase] || o.hopePhase : formatDate(o.completedDate),
                                          Grooming: o.m1800_grooming,
                                          Bathing: o.m1830_bathing,
                                          Ambulation: o.m1860_ambulation,
                                          'Hosp Risk': o.m1033_hosp_risk,
                                          'HOPE Score': o.hopeScore,
                                        }))
                                      }
                                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                      <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                                      <Tooltip contentStyle={{ fontSize: 11 }} />
                                      <Legend wrapperStyle={{ fontSize: 10 }} />
                                      <Line key="grooming" type="monotone" dataKey="Grooming" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                      <Line key="bathing" type="monotone" dataKey="Bathing" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                                      <Line key="ambulation" type="monotone" dataKey="Ambulation" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                                      <Line key="hosprisk" type="monotone" dataKey="Hosp Risk" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                  </ResponsiveContainer>
                                  <p className="text-[10px] text-gray-400 mt-1 text-center">
                                    Higher values = greater impairment. Track functional decline across assessment periods.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Assessment Detail Modal ─────────────────────────────────────── */}
      {detailAssessment && (() => {
        const { patient, assessment } = detailAssessment;
        const cfg = statusConfig[assessment.status];
        const linkedOasis = oasisRecords[patient.id]?.filter(
          (o: any) => o.hopePhase === assessment.phase
        ) || [];

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetailAssessment(null)}>
            <Card className="w-[560px] max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarDays className="size-4 text-rose-600" />
                      HOPE Assessment — {phaseLabels[assessment.phase]}
                    </CardTitle>
                    <div className="text-xs text-gray-500 mt-1">
                      {patient.patientName} · {patient.mrn} · {patient.primaryDiagnosis}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setDetailAssessment(null)}>
                    <span className="text-gray-400 text-lg">&times;</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status & Score */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{assessment.score ?? '—'}</div>
                    <div className="text-xs text-green-600">HOPE Score</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                    <Badge className={`${cfg.bgColor} ${cfg.color} text-xs`}>{cfg.label}</Badge>
                    <div className="text-xs text-gray-500 mt-1">Status</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                    <div className="text-sm font-semibold text-gray-700">{phaseDescriptions[assessment.phase]}</div>
                    <div className="text-xs text-gray-500 mt-1">Phase Type</div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Completed Date</div>
                    <div className="font-medium">{assessment.completedDate ? formatDate(assessment.completedDate) : '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Assessor</div>
                    <div className="font-medium">{assessment.assessor || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Admission Date</div>
                    <div className="font-medium">{formatDate(patient.admitDate)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Cert Period</div>
                    <div className="font-medium">{patient.certPeriod}</div>
                  </div>
                </div>

                {/* Timeline Position */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Assessment Timeline</h4>
                  <div className="flex items-center justify-center gap-0 py-2">
                    {patient.assessments?.map((a, idx) => (
                      <PhaseNode key={a.phase} assessment={a} isLast={idx === patient.assessments.length - 1} />
                    ))}
                  </div>
                </div>

                {/* Linked OASIS */}
                {linkedOasis.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <FileText className="size-3" /> Linked OASIS-E Record
                    </h4>
                    {linkedOasis.map((oasis: any) => (
                      <div key={oasis.id} className="bg-white border border-gray-200 rounded-md p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{oasis.assessmentType} — {oasis.reason}</span>
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-[9px]">
                            {oasis.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                        </div>
                        <div className="text-gray-500">
                          {oasis.completedDate ? formatDate(oasis.completedDate) : ''} · {oasis.clinician}
                        </div>
                        {oasis.m1860_ambulation !== undefined && (
                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                            <div className="bg-blue-50 rounded p-1.5 text-center">
                              <div className="font-bold text-blue-700">{oasis.m1800_grooming}</div>
                              <div className="text-[9px] text-blue-600">Grooming</div>
                            </div>
                            <div className="bg-purple-50 rounded p-1.5 text-center">
                              <div className="font-bold text-purple-700">{oasis.m1830_bathing}</div>
                              <div className="text-[9px] text-purple-600">Bathing</div>
                            </div>
                            <div className="bg-red-50 rounded p-1.5 text-center">
                              <div className="font-bold text-red-700">{oasis.m1860_ambulation}</div>
                              <div className="text-[9px] text-red-600">Ambulation</div>
                            </div>
                            <div className="bg-amber-50 rounded p-1.5 text-center">
                              <div className="font-bold text-amber-700">{oasis.m1033_hosp_risk}</div>
                              <div className="text-[9px] text-amber-600">Hosp Risk</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                  <Button size="sm" variant="outline" onClick={() => setDetailAssessment(null)}>Close</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
});

HOPETimeline.displayName = 'HOPETimeline';