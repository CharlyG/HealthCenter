/**
 * ReassignDialog — Dialog to reassign a visit's caregiver.
 * Shows available caregivers filtered by discipline with availability status.
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { UserRoundCog, CheckCircle, User, Clock } from 'lucide-react';
import type { MonitorVisit } from './MonitorTypes';
import { AVAILABLE_CAREGIVERS } from './MonitorMockData';

interface ReassignDialogProps {
  visit: MonitorVisit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReassign: (visit: MonitorVisit, newCaregiverId: string, newCaregiverName: string, reason: string) => void;
}

export function ReassignDialog({ visit, open, onOpenChange, onReassign }: ReassignDialogProps) {
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedCaregiverId(null);
      setReason('');
    }
  }, [open]);

  const availableCaregivers = useMemo(() => {
    if (!visit) return AVAILABLE_CAREGIVERS;
    // Show same-discipline caregivers first, then others
    return [...AVAILABLE_CAREGIVERS]
      .filter(c => c.id !== visit.caregiverId)
      .sort((a, b) => {
        const aDiscipline = a.discipline === visit.discipline ? 0 : 1;
        const bDiscipline = b.discipline === visit.discipline ? 0 : 1;
        if (aDiscipline !== bDiscipline) return aDiscipline - bDiscipline;
        if (a.available !== b.available) return a.available ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [visit]);

  const handleReassign = useCallback(async () => {
    if (!visit || !selectedCaregiverId) return;
    setSaving(true);
    try {
      const caregiver = AVAILABLE_CAREGIVERS.find(c => c.id === selectedCaregiverId);
      if (!caregiver) return;
      onReassign(visit, caregiver.id, caregiver.name, reason);
      toast.success(`Visit reassigned to ${caregiver.name}`);
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to reassign');
    } finally {
      setSaving(false);
    }
  }, [visit, selectedCaregiverId, reason, onReassign, onOpenChange]);

  if (!visit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundCog className="size-5 text-blue-600" />
            Reassign Caregiver
          </DialogTitle>
          <DialogDescription>
            Select a new caregiver for this visit. Same-discipline caregivers are prioritized.
          </DialogDescription>
        </DialogHeader>

        {/* Visit context */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
              <span className="text-[9px] font-bold text-blue-700">
                {visit.patientName.split(', ').map(w => w[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{visit.patientName}</p>
              <p className="text-[10px] text-gray-400">{visit.scheduledTime} &middot; {visit.discipline} — {visit.visitType}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="size-3" />
            Current: <span className="font-medium text-gray-700">{visit.caregiverName}</span>
          </div>
        </div>

        {/* Caregiver list */}
        <ScrollArea className="max-h-[240px] -mx-1 px-1">
          <div className="space-y-1.5">
            {availableCaregivers.map(cg => {
              const sameDiscipline = cg.discipline === visit.discipline;
              const selected = selectedCaregiverId === cg.id;
              return (
                <button
                  key={cg.id}
                  onClick={() => setSelectedCaregiverId(cg.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left',
                    selected
                      ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    !cg.available && 'opacity-60',
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    selected ? 'bg-blue-100' : 'bg-gray-100',
                  )}>
                    {selected ? (
                      <CheckCircle className="size-4 text-blue-600" />
                    ) : (
                      <User className="size-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{cg.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className={cn(
                        'text-[9px] h-4 px-1 rounded',
                        sameDiscipline ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : '',
                      )}>
                        {cg.discipline}
                      </Badge>
                      {sameDiscipline && (
                        <span className="text-[9px] text-emerald-600 font-medium">Same discipline</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium',
                      cg.available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500',
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', cg.available ? 'bg-green-500' : 'bg-gray-400')} />
                      {cg.available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Reason */}
        <div>
          <Label className="text-xs font-medium text-gray-600">Reason for Reassignment</Label>
          <Textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g., Schedule conflict, certification issue..."
            rows={2}
            className="mt-1 text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="gap-1.5"
            onClick={handleReassign}
            disabled={!selectedCaregiverId || saving}
          >
            <UserRoundCog className="size-4" />
            Reassign Visit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReassignDialog;
