/**
 * VisitEditDialog — Dialog to edit visit details for EVV resolution.
 * Allows editing times, status, notes. Used by both monitor table and EVV resolution center.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Pencil, Save, Clock } from 'lucide-react';
import type { MonitorVisit } from './MonitorTypes';
import { VISIT_STATUS_CONFIG, EVV_STATUS_CONFIG } from './MonitorTypes';
import { cn } from '../ui/utils';

interface VisitEditDialogProps {
  visit: MonitorVisit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (visit: MonitorVisit, changes: Record<string, any>) => void;
}

export function VisitEditDialog({ visit, open, onOpenChange, onSave }: VisitEditDialogProps) {
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visit && open) {
      setClockIn(visit.actualStartTime || '');
      setClockOut(visit.actualEndTime || '');
      setScheduledTime(visit.scheduledTime || '');
      setNotes(visit.notes || '');
    }
  }, [visit, open]);

  const handleSave = useCallback(async () => {
    if (!visit) return;
    setSaving(true);
    try {
      const changes: Record<string, any> = {};
      if (clockIn !== (visit.actualStartTime || '')) changes.actualStartTime = clockIn;
      if (clockOut !== (visit.actualEndTime || '')) changes.actualEndTime = clockOut;
      if (scheduledTime !== visit.scheduledTime) changes.scheduledTime = scheduledTime;
      if (notes !== (visit.notes || '')) changes.notes = notes;

      onSave(visit, changes);
      toast.success('Visit details updated');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }, [visit, clockIn, clockOut, scheduledTime, notes, onSave, onOpenChange]);

  if (!visit) return null;

  const statusCfg = VISIT_STATUS_CONFIG[visit.status];
  const evvCfg = EVV_STATUS_CONFIG[visit.evvStatus];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-5 text-blue-600" />
            Edit Visit Details
          </DialogTitle>
          <DialogDescription>
            Modify visit times and notes for EVV compliance resolution.
          </DialogDescription>
        </DialogHeader>

        {/* Visit context */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-700">
                  {visit.patientName.split(', ').map(w => w[0]).join('')}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{visit.patientName}</p>
                <p className="text-[11px] text-gray-400">{visit.patientMrn} &middot; {visit.admissionLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', statusCfg.bg, statusCfg.border, statusCfg.color)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
                {statusCfg.label}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {visit.caregiverName} &middot; {visit.discipline} — {visit.visitType}
          </p>
        </div>

        <div className="space-y-4">
          {/* Scheduled time */}
          <div>
            <Label className="text-xs font-medium text-gray-600">Scheduled Time</Label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={e => setScheduledTime(e.target.value)}
              className="mt-1 h-9"
            />
          </div>

          {/* Clock in / out */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Clock className="size-3" />
                Actual Clock In
              </Label>
              <Input
                type="time"
                value={clockIn}
                onChange={e => setClockIn(e.target.value)}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Clock className="size-3" />
                Actual Clock Out
              </Label>
              <Input
                type="time"
                value={clockOut}
                onChange={e => setClockOut(e.target.value)}
                className="mt-1 h-9"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-medium text-gray-600">Resolution Notes</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Document reason for time adjustment..."
              rows={3}
              className="mt-1 text-sm"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Changes will be logged in the audit trail for HIPAA compliance.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
            <Save className="size-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VisitEditDialog;
