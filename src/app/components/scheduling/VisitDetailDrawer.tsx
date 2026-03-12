/**
 * Visit Detail Drawer
 * Side drawer for viewing and inline editing a visit.
 * Fields: caregiver, discipline, start/end time, status, notes.
 * Connected to visitGateway.update() for persistence.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X, Save, Clock, User, Stethoscope, FileText, MapPin, Loader2,
  CheckCircle2, Play, AlertTriangle, XCircle, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  visitGateway,
  caregiverGateway,
  type Visit,
  type Caregiver,
} from '../../lib/dataGateway';

interface VisitDetailDrawerProps {
  visit: Visit | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', icon: <Clock className="size-3" /> },
  { value: 'in_progress', label: 'In Progress', icon: <Play className="size-3" /> },
  { value: 'completed', label: 'Completed', icon: <CheckCircle2 className="size-3" /> },
  { value: 'missed', label: 'Missed', icon: <XCircle className="size-3" /> },
  { value: 'cancelled', label: 'Cancelled', icon: <XCircle className="size-3" /> },
  { value: 'open', label: 'Open', icon: <AlertTriangle className="size-3" /> },
];

const DISCIPLINE_OPTIONS = ['RN', 'PT', 'OT', 'ST', 'MSW', 'AIDE'];

export default function VisitDetailDrawer({ visit, open, onClose, onUpdated }: VisitDetailDrawerProps) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Editable fields
  const [caregiverId, setCaregiverId] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  // Load caregivers on mount
  useEffect(() => {
    caregiverGateway.list().then(setCaregivers).catch(console.error);
  }, []);

  // Populate fields when visit changes
  useEffect(() => {
    if (visit) {
      setCaregiverId(visit.caregiverId || visit.clinicianId || '');
      setDiscipline(visit.discipline || '');
      setStartTime(visit.startTime || visit.scheduledTime || '');
      setEndTime(visit.endTime || '');
      setStatus(visit.status || 'scheduled');
      setNotes(visit.notes || '');
      setDirty(false);
    }
  }, [visit]);

  const markDirty = useCallback(() => setDirty(true), []);

  const handleSave = useCallback(async () => {
    if (!visit) return;
    setSaving(true);
    try {
      await visitGateway.update(visit.id, {
        caregiver_id: caregiverId || null,
        discipline,
        start_time: startTime,
        end_time: endTime,
        status,
        notes,
      } as any);
      toast.success('Visit updated successfully');
      setDirty(false);
      onUpdated();
    } catch (err: any) {
      console.error('[VisitDetailDrawer] save error:', err);
      toast.error(err.message || 'Failed to update visit');
    } finally {
      setSaving(false);
    }
  }, [visit, caregiverId, discipline, startTime, endTime, status, notes, onUpdated]);

  const eligibleCaregivers = useMemo(() => {
    return caregivers.filter(cg =>
      cg.status === 'active' &&
      (cg.discipline === discipline || cg.disciplines?.includes(discipline))
    );
  }, [caregivers, discipline]);

  const selectedCaregiver = useMemo(() =>
    caregivers.find(cg => cg.id === caregiverId),
    [caregivers, caregiverId]
  );

  if (!open || !visit) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white z-50 shadow-2xl flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Visit Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">{visit.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-5">
          {/* Patient Info (read-only) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <User className="size-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">{visit.patientName || 'Unknown Patient'}</span>
            </div>
            {visit.patientMrn && (
              <p className="text-[10px] text-gray-500 ml-6">MRN: {visit.patientMrn}</p>
            )}
            {visit.patientAddress && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 ml-6">
                <MapPin className="size-3" />
                {visit.patientAddress}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 ml-6">
              <Calendar className="size-3" />
              {visit.scheduledDate || visit.visitDate}
            </div>
          </div>

          {/* Caregiver */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <Stethoscope className="size-3.5" /> Caregiver
            </Label>
            <Select
              value={caregiverId || '__unassigned__'}
              onValueChange={v => { setCaregiverId(v === '__unassigned__' ? '' : v); markDirty(); }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select caregiver..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__unassigned__">
                  <span className="text-orange-600">Unassigned</span>
                </SelectItem>
                {eligibleCaregivers.map(cg => (
                  <SelectItem key={cg.id} value={cg.id}>
                    {cg.name} ({cg.discipline}){cg.zone ? ` — ${cg.zone}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCaregiver && (
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <Badge variant="outline" className="text-[9px] h-4 px-1">{selectedCaregiver.zone}</Badge>
                {selectedCaregiver.rating && (
                  <span>Rating: {selectedCaregiver.rating}/5</span>
                )}
              </div>
            )}
          </div>

          {/* Discipline */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Discipline</Label>
            <Select value={discipline} onValueChange={v => { setDiscipline(v); markDirty(); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {DISCIPLINE_OPTIONS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Clock className="size-3.5" /> Start Time
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={e => { setStartTime(e.target.value); markDirty(); }}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700">End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={e => { setEndTime(e.target.value); markDirty(); }}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Status</Label>
            <Select value={status} onValueChange={v => { setStatus(v); markDirty(); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s.value} value={s.value}>
                    <span className="flex items-center gap-1.5">{s.icon} {s.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
              <FileText className="size-3.5" /> Notes
            </Label>
            <Textarea
              value={notes}
              onChange={e => { setNotes(e.target.value); markDirty(); }}
              rows={3}
              className="text-sm resize-none"
              placeholder="Add visit notes..."
            />
          </div>

          {/* Metadata (read-only) */}
          <div className="bg-gray-50 border rounded-lg p-3 space-y-1.5 text-xs text-gray-500">
            <p>Visit Type: <span className="text-gray-700 font-medium">{visit.visitType}</span></p>
            <p>Billing Code: <span className="text-gray-700 font-medium">{visit.billingCode || 'N/A'}</span></p>
            <p>Admission: <span className="text-gray-700 font-medium">{visit.admissionId || 'N/A'}</span></p>
            {visit.recurrenceId && (
              <p>Recurrence: <span className="text-gray-700 font-medium">
                Visit {(visit.recurrenceIndex ?? 0) + 1} of {visit.recurrenceTotal || '?'}
              </span></p>
            )}
            <p>EVV Status: <span className="text-gray-700 font-medium">{visit.evvStatus || 'N/A'}</span></p>
            <p>Doc Status: <span className="text-gray-700 font-medium">{visit.documentationStatus || 'N/A'}</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !dirty} className="gap-1.5">
            {saving ? (
              <><Loader2 className="size-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="size-4" /> Save Changes</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}