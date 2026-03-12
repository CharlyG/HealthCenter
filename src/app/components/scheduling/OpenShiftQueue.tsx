/**
 * Open Shift Queue
 * Display visits without assigned caregivers.
 * Shows: patient, discipline, visit time, location, required skills
 * Actions: assign caregiver, send open shift notifications
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserPlus, Clock, MapPin, Bell, Loader2, RefreshCw, Filter,
  CheckCircle2, AlertTriangle, Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  openShiftGateway,
  caregiverGateway,
  type OpenShift,
  type Caregiver,
} from '../../lib/dataGateway';

// Map disciplines to skill requirements
const DISCIPLINE_SKILLS: Record<string, string[]> = {
  RN: ['BLS', 'Wound Care', 'IV Therapy', 'Medication Management'],
  PT: ['DPT', 'Orthopedic', 'Neuro Rehab', 'Gait Training'],
  OT: ['OTR/L', 'ADL Training', 'CHT'],
  ST: ['CCC-SLP', 'Swallowing', 'Cognitive Rehab'],
  MSW: ['LCSW', 'Resource Assessment'],
  AIDE: ['CNA', 'HHA', 'Personal Care'],
};

interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  shift: OpenShift | null;
  caregivers: Caregiver[];
  onAssigned: () => void;
}

function AssignCaregiverDialog({ open, onClose, shift, caregivers, onAssigned }: AssignDialogProps) {
  const [selectedCg, setSelectedCg] = useState('');
  const [assigning, setAssigning] = useState(false);

  const eligible = useMemo(() => {
    if (!shift) return [];
    return caregivers.filter(cg =>
      cg.status === 'active' &&
      (cg.discipline === shift.discipline || cg.disciplines?.includes(shift.discipline))
    );
  }, [shift, caregivers]);

  const handleAssign = useCallback(async () => {
    if (!shift || !selectedCg) return;
    setAssigning(true);
    try {
      await openShiftGateway.claim(shift.id, selectedCg);
      toast.success('Caregiver assigned successfully');
      setSelectedCg('');
      onAssigned();
      onClose();
    } catch (err: any) {
      console.error('[AssignDialog] error:', err);
      toast.error(err.message || 'Failed to assign caregiver');
    } finally {
      setAssigning(false);
    }
  }, [shift, selectedCg, onAssigned, onClose]);

  if (!shift) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-blue-600" />
            Assign Caregiver
          </DialogTitle>
          <DialogDescription>
            Select a caregiver for this open shift
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 border rounded-lg p-3 space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{shift.discipline}</Badge>
            <span className="text-xs text-gray-500">
              {shift.visitDate} at {shift.startTime}–{shift.endTime}
            </span>
          </div>
          <p className="font-medium text-gray-900">{shift.patientName || 'Unknown Patient'}</p>
          {shift.patientAddress && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="size-3" /> {shift.patientAddress}
            </p>
          )}
        </div>

        <div className="space-y-2 py-1">
          <label className="text-xs font-medium text-gray-700">Select Caregiver ({eligible.length} eligible)</label>
          <Select value={selectedCg} onValueChange={setSelectedCg}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a caregiver..." />
            </SelectTrigger>
            <SelectContent>
              {eligible.length === 0 ? (
                <SelectItem value="none" disabled>No eligible caregivers</SelectItem>
              ) : (
                eligible.map(cg => (
                  <SelectItem key={cg.id} value={cg.id}>
                    {cg.name} ({cg.discipline}) — {cg.zone || 'N/A'} zone
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assigning}>Cancel</Button>
          <Button onClick={handleAssign} disabled={assigning || !selectedCg} className="gap-1.5">
            {assigning ? (
              <><Loader2 className="size-4 animate-spin" /> Assigning...</>
            ) : (
              <><UserPlus className="size-4" /> Assign</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OpenShiftQueue() {
  const [shifts, setShifts] = useState<OpenShift[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [assignShift, setAssignShift] = useState<OpenShift | null>(null);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [s, c] = await Promise.all([
        openShiftGateway.list(),
        caregiverGateway.list(),
      ]);
      setShifts(s);
      setCaregivers(c);
    } catch (err) {
      console.error('[OpenShiftQueue] error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const disciplines = useMemo(() => {
    const set = new Set(shifts.map(s => s.discipline).filter(Boolean));
    return Array.from(set).sort();
  }, [shifts]);

  const filtered = useMemo(() => {
    let result = shifts;
    if (disciplineFilter !== 'all') result = result.filter(s => s.discipline === disciplineFilter);
    return result;
  }, [shifts, disciplineFilter]);

  const handleNotify = useCallback(async (shift: OpenShift) => {
    setNotifyingId(shift.id);
    try {
      const eligible = caregivers.filter(cg =>
        cg.status === 'active' &&
        (cg.discipline === shift.discipline || cg.disciplines?.includes(shift.discipline))
      );
      if (eligible.length === 0) {
        toast.error('No eligible caregivers to notify');
        return;
      }
      await openShiftGateway.notify(shift.id, eligible.slice(0, 5).map(cg => cg.id));
      toast.success(`Notification sent to ${Math.min(5, eligible.length)} caregivers`);
    } catch (err) {
      console.error('[OpenShiftQueue] notify error:', err);
      toast.error('Failed to send notifications');
    } finally {
      setNotifyingId(null);
    }
  }, [caregivers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Loading open shifts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className={shifts.length > 0 ? 'ring-1 ring-orange-200' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="size-4 text-orange-500" />
              <span className="text-xs font-medium text-gray-600">Open Shifts</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{shifts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="size-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-600">Disciplines</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{disciplines.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="size-4 text-green-500" />
              <span className="text-xs font-medium text-gray-600">Available CGs</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {caregivers.filter(c => c.status === 'active').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3">
        <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <Filter className="size-3.5 mr-1 text-gray-400" />
            <SelectValue placeholder="Discipline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Disciplines</SelectItem>
            {disciplines.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={load} className="h-8 gap-1 text-xs">
          <RefreshCw className="size-3.5" /> Refresh
        </Button>
      </div>

      {/* Shift Cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="size-12 mx-auto mb-3 text-green-300" />
            <p className="text-lg font-semibold text-green-700">All shifts covered</p>
            <p className="text-sm text-gray-500 mt-1">No open shifts at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(shift => {
            const isToday = shift.visitDate === new Date().toISOString().split('T')[0];
            const skills = DISCIPLINE_SKILLS[shift.discipline] || ['General'];
            return (
              <Card
                key={shift.id}
                className={isToday ? 'ring-1 ring-red-200 bg-red-50/20' : ''}
              >
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{shift.patientName || 'Unknown Patient'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">{shift.discipline}</Badge>
                        <span className="text-xs text-gray-500">{shift.billingCode}</span>
                      </div>
                    </div>
                    {isToday && (
                      <Badge className="text-[10px] h-5 bg-red-600">Today</Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-gray-400" />
                      <span>{shift.visitDate} at {shift.startTime}–{shift.endTime}</span>
                    </div>
                    {shift.patientAddress && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3 text-gray-400" />
                        <span className="truncate">{shift.patientAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Required Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {skills.slice(0, 3).map(skill => (
                      <Badge key={skill} variant="outline" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1 flex-1"
                      onClick={() => setAssignShift(shift)}
                    >
                      <UserPlus className="size-3" /> Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 flex-1"
                      disabled={notifyingId === shift.id}
                      onClick={() => handleNotify(shift)}
                    >
                      {notifyingId === shift.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Bell className="size-3" />
                      )}
                      Notify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AssignCaregiverDialog
        open={!!assignShift}
        onClose={() => setAssignShift(null)}
        shift={assignShift}
        caregivers={caregivers}
        onAssigned={load}
      />
    </div>
  );
}