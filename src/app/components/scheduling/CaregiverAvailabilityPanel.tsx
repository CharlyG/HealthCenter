/**
 * Caregiver Availability Panel
 * Display caregiver availability, highlight conflicts, and reassign visits.
 * Connected to caregiverGateway + visitGateway for real data.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User, Clock, CheckCircle2, XCircle, AlertTriangle,
  Loader2, RefreshCw, Search, ChevronDown, ChevronRight,
  UserPlus, ArrowRightLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { caregiverGateway, visitGateway, type Caregiver, type Visit } from '../../lib/dataGateway';

interface CaregiverWithAvailability extends Caregiver {
  todayVisits: Visit[];
  visitCount: number;
  maxVisits: number;
  utilizationPct: number;
  availableSlots: string[];
  hasConflicts: boolean;
  conflictDetails: string[];
}

interface CaregiverAvailabilityPanelProps {
  selectedDate: Date;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  on_leave: 'bg-amber-100 text-amber-800',
  inactive: 'bg-gray-100 text-gray-500',
};

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

function computeAvailableSlots(visits: Visit[]): string[] {
  const occupied = new Set<string>();
  for (const v of visits) {
    if (['cancelled', 'missed'].includes(v.status)) continue;
    const st = v.startTime || v.scheduledTime || '';
    const et = v.endTime || '';
    for (const slot of TIME_SLOTS) {
      if (slot >= st && slot < et) occupied.add(slot);
    }
  }
  return TIME_SLOTS.filter(s => !occupied.has(s));
}

function detectConflicts(visits: Visit[]): string[] {
  const active = visits
    .filter(v => !['cancelled', 'missed'].includes(v.status))
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  const conflicts: string[] = [];
  for (let i = 0; i < active.length - 1; i++) {
    const a = active[i], b = active[i + 1];
    if ((a.endTime || '') > (b.startTime || b.scheduledTime || '')) {
      conflicts.push(`Overlap: ${a.patientName || 'Visit'} (${a.startTime}-${a.endTime}) & ${b.patientName || 'Visit'} (${b.startTime}-${b.endTime})`);
    }
  }
  return conflicts;
}

// ─── Reassign Dialog ────────────────────────────────────────────────────────

interface ReassignDialogProps {
  open: boolean;
  onClose: () => void;
  caregiver: CaregiverWithAvailability | null;
  allVisits: Visit[];
  allCaregivers: CaregiverWithAvailability[];
  onReassigned: () => void;
  dateStr: string;
}

function ReassignVisitDialog({ open, onClose, caregiver, allVisits, allCaregivers, onReassigned, dateStr }: ReassignDialogProps) {
  const [mode, setMode] = useState<'assign' | 'reassign'>('assign');
  const [selectedVisitId, setSelectedVisitId] = useState('');
  const [selectedFromCgId, setSelectedFromCgId] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedVisitId('');
      setSelectedFromCgId('');
      setMode('assign');
    }
  }, [open]);

  // Unassigned visits that match this caregiver's discipline
  const unassignedVisits = useMemo(() => {
    if (!caregiver) return [];
    return allVisits.filter(v =>
      !v.caregiverId && !v.clinicianId &&
      v.discipline === caregiver.discipline &&
      !['cancelled', 'completed'].includes(v.status)
    );
  }, [allVisits, caregiver]);

  // Visits from other caregivers that could be reassigned (same discipline)
  const reassignableVisits = useMemo(() => {
    if (!caregiver || !selectedFromCgId) return [];
    return allVisits.filter(v =>
      (v.caregiverId === selectedFromCgId || v.clinicianId === selectedFromCgId) &&
      v.discipline === caregiver.discipline &&
      ['scheduled', 'open'].includes(v.status)
    );
  }, [allVisits, caregiver, selectedFromCgId]);

  // Other caregivers with visits in same discipline
  const otherCaregivers = useMemo(() => {
    if (!caregiver) return [];
    return allCaregivers.filter(cg =>
      cg.id !== caregiver.id &&
      cg.discipline === caregiver.discipline &&
      cg.todayVisits.length > 0
    );
  }, [allCaregivers, caregiver]);

  const handleAssign = useCallback(async () => {
    if (!caregiver || !selectedVisitId) return;
    setSaving(true);
    try {
      await visitGateway.update(selectedVisitId, {
        caregiver_id: caregiver.id,
      } as any);
      toast.success(`Visit assigned to ${caregiver.name}`);
      onReassigned();
      onClose();
    } catch (err: any) {
      console.error('[ReassignDialog] assign error:', err);
      toast.error(err.message || 'Failed to assign visit');
    } finally {
      setSaving(false);
    }
  }, [caregiver, selectedVisitId, onReassigned, onClose]);

  const handleReassign = useCallback(async () => {
    if (!caregiver || !selectedVisitId) return;
    setSaving(true);
    try {
      await visitGateway.update(selectedVisitId, {
        caregiver_id: caregiver.id,
      } as any);
      toast.success(`Visit reassigned to ${caregiver.name}`);
      onReassigned();
      onClose();
    } catch (err: any) {
      console.error('[ReassignDialog] reassign error:', err);
      toast.error(err.message || 'Failed to reassign visit');
    } finally {
      setSaving(false);
    }
  }, [caregiver, selectedVisitId, onReassigned, onClose]);

  if (!caregiver) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'assign' ? (
              <><UserPlus className="size-5 text-green-600" /> Assign Visit</>
            ) : (
              <><ArrowRightLeft className="size-5 text-blue-600" /> Reassign Visit</>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'assign'
              ? `Assign an unassigned visit to ${caregiver.name}`
              : `Reassign a visit from another caregiver to ${caregiver.name}`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Caregiver Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="size-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">{caregiver.name}</p>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <Badge variant="outline" className="text-[9px] h-4 px-1">{caregiver.discipline}</Badge>
                <span>{caregiver.visitCount}/{caregiver.maxVisits} visits</span>
                <span>{caregiver.availableSlots.length} slots open</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'assign' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => { setMode('assign'); setSelectedVisitId(''); }}
          >
            <UserPlus className="size-3 mr-1" /> Assign Unassigned
            {unassignedVisits.length > 0 && (
              <Badge className="ml-1 h-4 px-1 text-[9px] bg-orange-600">{unassignedVisits.length}</Badge>
            )}
          </Button>
          <Button
            variant={mode === 'reassign' ? 'default' : 'outline'}
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => { setMode('reassign'); setSelectedVisitId(''); setSelectedFromCgId(''); }}
          >
            <ArrowRightLeft className="size-3 mr-1" /> Reassign From Other
          </Button>
        </div>

        {/* Assign Mode */}
        {mode === 'assign' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Select unassigned visit ({unassignedVisits.length})</label>
            {unassignedVisits.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded">
                No unassigned {caregiver.discipline} visits for this date
              </div>
            ) : (
              <Select value={selectedVisitId} onValueChange={setSelectedVisitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a visit..." />
                </SelectTrigger>
                <SelectContent>
                  {unassignedVisits.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.patientName || 'Unknown'} &mdash; {v.startTime || v.scheduledTime || '?'}–{v.endTime || '?'} ({v.visitType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Reassign Mode */}
        {mode === 'reassign' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">From caregiver</label>
              {otherCaregivers.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded">
                  No other {caregiver.discipline} caregivers with visits today
                </div>
              ) : (
                <Select value={selectedFromCgId} onValueChange={v => { setSelectedFromCgId(v); setSelectedVisitId(''); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose source caregiver..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherCaregivers.map(cg => (
                      <SelectItem key={cg.id} value={cg.id}>
                        {cg.name} ({cg.visitCount} visits, {cg.utilizationPct}% utilized)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedFromCgId && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Select visit to reassign ({reassignableVisits.length})</label>
                {reassignableVisits.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-3 bg-gray-50 rounded">
                    No reassignable visits from this caregiver
                  </div>
                ) : (
                  <Select value={selectedVisitId} onValueChange={setSelectedVisitId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a visit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {reassignableVisits.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.patientName || 'Unknown'} &mdash; {v.startTime || v.scheduledTime || '?'}–{v.endTime || '?'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            onClick={mode === 'assign' ? handleAssign : handleReassign}
            disabled={saving || !selectedVisitId}
            className="gap-1.5"
          >
            {saving ? (
              <><Loader2 className="size-4 animate-spin" /> Processing...</>
            ) : mode === 'assign' ? (
              <><UserPlus className="size-4" /> Assign</>
            ) : (
              <><ArrowRightLeft className="size-4" /> Reassign</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

export default function CaregiverAvailabilityPanel({ selectedDate }: CaregiverAvailabilityPanelProps) {
  const [caregivers, setCaregivers] = useState<CaregiverWithAvailability[]>([]);
  const [allVisits, setAllVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Reassign dialog
  const [reassignCg, setReassignCg] = useState<CaregiverWithAvailability | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [cgList, visitResult] = await Promise.all([
        caregiverGateway.list(),
        visitGateway.search({
          filters: { startDate: dateStr, endDate: dateStr },
          pagination: { page: 1, pageSize: 500 },
        }),
      ]);

      setAllVisits(visitResult.data);

      const visitsByCg = new Map<string, Visit[]>();
      for (const v of visitResult.data) {
        const cgId = v.caregiverId || v.clinicianId || '';
        if (!cgId) continue;
        if (!visitsByCg.has(cgId)) visitsByCg.set(cgId, []);
        visitsByCg.get(cgId)!.push(v);
      }

      const enriched: CaregiverWithAvailability[] = cgList.map(cg => {
        const todayVisits = visitsByCg.get(cg.id) || [];
        const activeVisits = todayVisits.filter(v => !['cancelled'].includes(v.status));
        const maxVisits = cg.maxDailyVisits || 6;
        const visitCount = activeVisits.length;
        const conflictDetails = detectConflicts(todayVisits);
        return {
          ...cg,
          todayVisits,
          visitCount,
          maxVisits,
          utilizationPct: Math.min(100, Math.round((visitCount / maxVisits) * 100)),
          availableSlots: computeAvailableSlots(todayVisits),
          hasConflicts: conflictDetails.length > 0,
          conflictDetails,
        };
      });

      enriched.sort((a, b) => {
        if (a.hasConflicts !== b.hasConflicts) return a.hasConflicts ? -1 : 1;
        return b.utilizationPct - a.utilizationPct;
      });

      setCaregivers(enriched);
    } catch (err) {
      console.error('[CaregiverAvailabilityPanel] error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { load(); }, [load]);

  const disciplines = useMemo(() => {
    const set = new Set(caregivers.map(c => c.discipline).filter(Boolean));
    return Array.from(set).sort();
  }, [caregivers]);

  const filtered = useMemo(() => {
    let result = caregivers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }
    if (disciplineFilter !== 'all') result = result.filter(c => c.discipline === disciplineFilter);
    if (statusFilter !== 'all') result = result.filter(c => c.status === statusFilter);
    return result;
  }, [caregivers, search, disciplineFilter, statusFilter]);

  const summaryStats = useMemo(() => {
    const available = caregivers.filter(c => c.status === 'active' && c.utilizationPct < 100);
    const atCapacity = caregivers.filter(c => c.utilizationPct >= 100);
    const withConflicts = caregivers.filter(c => c.hasConflicts);
    const unassigned = allVisits.filter(v => !v.caregiverId && !v.clinicianId && !['cancelled', 'completed'].includes(v.status));
    return { available: available.length, atCapacity: atCapacity.length, withConflicts: withConflicts.length, unassigned: unassigned.length };
  }, [caregivers, allVisits]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Loading caregiver availability...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="size-4 text-green-500" />
              <span className="text-xs font-medium text-gray-600">Available</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{summaryStats.available}</p>
          </CardContent>
        </Card>
        <Card className={summaryStats.atCapacity > 0 ? 'ring-1 ring-amber-200' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="size-4 text-amber-500" />
              <span className="text-xs font-medium text-gray-600">At Capacity</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{summaryStats.atCapacity}</p>
          </CardContent>
        </Card>
        <Card className={summaryStats.withConflicts > 0 ? 'ring-1 ring-red-200' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="size-4 text-red-500" />
              <span className="text-xs font-medium text-gray-600">Conflicts</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{summaryStats.withConflicts}</p>
          </CardContent>
        </Card>
        <Card className={summaryStats.unassigned > 0 ? 'ring-1 ring-orange-200' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="size-4 text-orange-500" />
              <span className="text-xs font-medium text-gray-600">Unassigned</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{summaryStats.unassigned}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search caregiver..."
              className="pl-9 w-[200px] h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disciplines</SelectItem>
              {disciplines.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="h-8 gap-1 text-xs">
          <RefreshCw className="size-3.5" /> Refresh
        </Button>
      </div>

      {/* Caregiver List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="size-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500">No caregivers match your filters</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(cg => {
            const isExpanded = expandedId === cg.id;
            return (
              <Card
                key={cg.id}
                className={cg.hasConflicts ? 'ring-1 ring-red-200' : ''}
              >
                <div
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : cg.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="size-4 text-gray-400" /> : <ChevronRight className="size-4 text-gray-400" />}
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="size-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{cg.name}</p>
                          <Badge variant="outline" className="text-[10px] h-4 px-1">{cg.discipline}</Badge>
                          <Badge variant="outline" className={`text-[10px] h-4 px-1 ${STATUS_COLORS[cg.status] || ''}`}>
                            {cg.status === 'on_leave' ? 'On Leave' : cg.status}
                          </Badge>
                          {cg.hasConflicts && (
                            <Badge className="text-[10px] h-4 px-1 bg-red-600 text-white gap-0.5">
                              <AlertTriangle className="size-2.5" /> Conflict
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">{cg.zone || 'N/A'} zone</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right w-24">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-gray-500">Visits</span>
                          <span className="font-medium">{cg.visitCount}/{cg.maxVisits}</span>
                        </div>
                        <Progress
                          value={cg.utilizationPct}
                          className={`h-1.5 ${cg.utilizationPct >= 100 ? '[&>div]:bg-red-500' : cg.utilizationPct >= 80 ? '[&>div]:bg-amber-500' : ''}`}
                        />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Available</p>
                        <p className="text-xs font-semibold text-gray-700">{cg.availableSlots.length} slots</p>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4 border-t border-gray-100">
                    {/* Conflict warnings */}
                    {cg.conflictDetails.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {cg.conflictDetails.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                            <AlertTriangle className="size-3 flex-shrink-0" />
                            {c}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Time grid */}
                    <h5 className="text-[10px] font-semibold text-gray-500 mb-2">Time Slots</h5>
                    <div className="flex gap-1 flex-wrap">
                      {TIME_SLOTS.map(slot => {
                        const isAvailable = cg.availableSlots.includes(slot);
                        const visit = cg.todayVisits.find(v => {
                          const st = v.startTime || v.scheduledTime || '';
                          const et = v.endTime || '';
                          return slot >= st && slot < et && !['cancelled'].includes(v.status);
                        });
                        return (
                          <div
                            key={slot}
                            className={`px-2 py-1.5 rounded text-[10px] font-mono border ${
                              visit
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : isAvailable
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`}
                            title={visit ? `${visit.patientName || 'Visit'} (${visit.visitType})` : 'Available'}
                          >
                            <div>{slot}</div>
                            {visit && (
                              <div className="text-[8px] truncate max-w-[60px]">{visit.patientName || '...'}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Today's Visits */}
                    {cg.todayVisits.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-[10px] font-semibold text-gray-500 mb-1.5">Today's Schedule</h5>
                        <div className="space-y-1">
                          {cg.todayVisits
                            .filter(v => !['cancelled'].includes(v.status))
                            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                            .map(v => (
                              <div key={v.id} className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="font-mono text-[10px] text-gray-400 w-20">{v.startTime}-{v.endTime}</span>
                                <span className="font-medium">{v.patientName || 'Unknown'}</span>
                                <Badge variant="outline" className="text-[9px] h-4 px-1">{v.visitType}</Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Reassignment actions */}
                    {cg.status === 'active' && cg.utilizationPct < 100 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReassignCg(cg);
                          }}
                        >
                          <UserPlus className="size-3" /> Assign / Reassign Visit
                        </Button>
                        <span className="text-[10px] text-gray-400">
                          {cg.availableSlots.length} open slot{cg.availableSlots.length !== 1 ? 's' : ''} available
                        </span>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Reassign Dialog */}
      <ReassignVisitDialog
        open={!!reassignCg}
        onClose={() => setReassignCg(null)}
        caregiver={reassignCg}
        allVisits={allVisits}
        allCaregivers={caregivers}
        onReassigned={load}
        dateStr={dateStr}
      />
    </div>
  );
}