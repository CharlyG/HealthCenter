/**
 * RecurrenceEditDialog
 * Microsoft Teams-style dialog for editing/cancelling/rescheduling recurring visits.
 *
 * Flow:
 *  1. User picks a scope (This visit only / This and following / All)
 *  2. If action is 'edit', an inline form appears for field-level changes
 *     (time, caregiver, discipline, notes)
 *  3. On confirm, calls onConfirm with scope + field updates
 *
 * For 'cancel' and 'reschedule', the scope selection is the only step.
 */
import { useState } from 'react';
import {
  Repeat,
  CalendarDays,
  CalendarRange,
  CalendarCheck2,
  AlertTriangle,
  Loader2,
  Clock,
  User,
  Stethoscope,
  StickyNote,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export type RecurrenceScope = 'single' | 'this_and_following' | 'all';

export interface RecurrenceFieldUpdates {
  startTime?: string;
  endTime?: string;
  caregiverId?: string;
  caregiverName?: string;
  discipline?: string;
  notes?: string;
}

export interface RecurrenceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The action the user is performing */
  action: 'edit' | 'cancel' | 'reschedule';
  /** Info about the visit being acted on */
  visitInfo: {
    id: string;
    recurrenceId: string;
    recurrenceIndex: number;
    recurrenceTotal: number;
    visitDate: string;
    patientName?: string;
    visitType?: string;
    startTime?: string;
    endTime?: string;
    caregiverName?: string;
    discipline?: string;
  };
  /** Called when the user confirms their scope selection */
  onConfirm: (scope: RecurrenceScope, updates?: RecurrenceFieldUpdates) => void | Promise<void>;
  /** Whether the confirm action is in progress */
  loading?: boolean;
}

const SCOPE_OPTIONS: {
  value: RecurrenceScope;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'single',
    label: 'This visit only',
    description: 'Only modify this specific occurrence. All other visits in the series remain unchanged.',
    icon: <CalendarDays className="size-5" />,
  },
  {
    value: 'this_and_following',
    label: 'This and all following visits',
    description: 'Apply changes to this visit and every future visit in the series. Past visits remain unchanged.',
    icon: <CalendarRange className="size-5" />,
  },
  {
    value: 'all',
    label: 'All visits in the series',
    description: 'Apply changes to every visit in the recurring series (past completed visits are excluded).',
    icon: <CalendarCheck2 className="size-5" />,
  },
];

const DISCIPLINES = ['SN', 'PT', 'OT', 'ST', 'MSW', 'HHA', 'RN'];

export default function RecurrenceEditDialog({
  open,
  onOpenChange,
  action,
  visitInfo,
  onConfirm,
  loading = false,
}: RecurrenceEditDialogProps) {
  const [selectedScope, setSelectedScope] = useState<RecurrenceScope>('single');
  // Step 2: field edits (only for 'edit' action)
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [fieldUpdates, setFieldUpdates] = useState<RecurrenceFieldUpdates>({
    startTime: visitInfo.startTime || '',
    endTime: visitInfo.endTime || '',
    caregiverName: visitInfo.caregiverName || '',
    discipline: visitInfo.discipline || '',
    notes: '',
  });

  const actionLabels: Record<string, { title: string; button: string; destructive: boolean }> = {
    edit: { title: 'Edit Recurring Visit', button: 'Apply Changes', destructive: false },
    cancel: { title: 'Cancel Recurring Visit', button: 'Cancel Visit(s)', destructive: true },
    reschedule: { title: 'Reschedule Recurring Visit', button: 'Reschedule', destructive: false },
  };

  const config = actionLabels[action] || actionLabels.edit;

  const handleNext = () => {
    if (action === 'edit' && !showFieldForm) {
      // Move to step 2: show field form
      setShowFieldForm(true);
      return;
    }
    handleConfirm();
  };

  const handleConfirm = () => {
    if (action === 'edit') {
      // Only pass non-empty fields
      const updates: RecurrenceFieldUpdates = {};
      if (fieldUpdates.startTime && fieldUpdates.startTime !== visitInfo.startTime) updates.startTime = fieldUpdates.startTime;
      if (fieldUpdates.endTime && fieldUpdates.endTime !== visitInfo.endTime) updates.endTime = fieldUpdates.endTime;
      if (fieldUpdates.caregiverName && fieldUpdates.caregiverName !== visitInfo.caregiverName) updates.caregiverName = fieldUpdates.caregiverName;
      if (fieldUpdates.discipline && fieldUpdates.discipline !== visitInfo.discipline) updates.discipline = fieldUpdates.discipline;
      if (fieldUpdates.notes) updates.notes = fieldUpdates.notes;
      onConfirm(selectedScope, Object.keys(updates).length > 0 ? updates : undefined);
    } else {
      onConfirm(selectedScope);
    }
  };

  const handleBack = () => {
    setShowFieldForm(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Reset state when closing
      setShowFieldForm(false);
      setSelectedScope('single');
    }
    onOpenChange(nextOpen);
  };

  const positionLabel = visitInfo.recurrenceIndex != null && visitInfo.recurrenceTotal
    ? `Visit ${visitInfo.recurrenceIndex + 1} of ${visitInfo.recurrenceTotal}`
    : '';

  const hasFieldChanges = action === 'edit' && (
    (fieldUpdates.startTime && fieldUpdates.startTime !== visitInfo.startTime) ||
    (fieldUpdates.endTime && fieldUpdates.endTime !== visitInfo.endTime) ||
    (fieldUpdates.caregiverName && fieldUpdates.caregiverName !== visitInfo.caregiverName) ||
    (fieldUpdates.discipline && fieldUpdates.discipline !== visitInfo.discipline) ||
    fieldUpdates.notes
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]" aria-describedby="recurrence-dialog-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="size-5 text-blue-600" />
            {config.title}
          </DialogTitle>
          <DialogDescription id="recurrence-dialog-desc">
            {showFieldForm
              ? 'Modify the visit fields below. Only changed fields will be applied.'
              : 'This visit is part of a recurring series. Choose how you want to apply your changes.'}
          </DialogDescription>
        </DialogHeader>

        {/* Visit context banner */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 text-sm">
              {visitInfo.patientName || 'Patient Visit'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {visitInfo.visitDate}
              {visitInfo.visitType && ` \u2022 ${visitInfo.visitType}`}
              {visitInfo.startTime && ` \u2022 ${visitInfo.startTime}`}
            </div>
          </div>
          {positionLabel && (
            <Badge variant="outline" className="text-xs shrink-0">
              <Repeat className="size-3 mr-1" />
              {positionLabel}
            </Badge>
          )}
        </div>

        {/* Step 1: Scope selection */}
        {!showFieldForm && (
          <div className="space-y-2 py-2">
            {SCOPE_OPTIONS.map((option) => {
              const isSelected = selectedScope === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedScope(option.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-200'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio circle */}
                    <div className={`mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="size-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                      {option.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Field-level edit form (only for 'edit' action) */}
        {showFieldForm && action === 'edit' && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg p-2">
              <Badge variant="outline" className="text-[10px] h-5">
                {selectedScope === 'single' ? 'This visit' : selectedScope === 'this_and_following' ? 'This + following' : 'All visits'}
              </Badge>
              <span>Changes will apply to the selected scope</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Start Time */}
              <div>
                <Label htmlFor="re-start-time" className="text-xs flex items-center gap-1.5 mb-1">
                  <Clock className="size-3.5 text-gray-400" />
                  Start Time
                </Label>
                <Input
                  id="re-start-time"
                  type="time"
                  value={fieldUpdates.startTime || ''}
                  onChange={(e) => setFieldUpdates({ ...fieldUpdates, startTime: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              {/* End Time */}
              <div>
                <Label htmlFor="re-end-time" className="text-xs flex items-center gap-1.5 mb-1">
                  <Clock className="size-3.5 text-gray-400" />
                  End Time
                </Label>
                <Input
                  id="re-end-time"
                  type="time"
                  value={fieldUpdates.endTime || ''}
                  onChange={(e) => setFieldUpdates({ ...fieldUpdates, endTime: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>

              {/* Caregiver */}
              <div>
                <Label htmlFor="re-caregiver" className="text-xs flex items-center gap-1.5 mb-1">
                  <User className="size-3.5 text-gray-400" />
                  Caregiver
                </Label>
                <Input
                  id="re-caregiver"
                  value={fieldUpdates.caregiverName || ''}
                  onChange={(e) => setFieldUpdates({ ...fieldUpdates, caregiverName: e.target.value })}
                  placeholder="Caregiver name"
                  className="h-9 text-sm"
                />
              </div>

              {/* Discipline */}
              <div>
                <Label htmlFor="re-discipline" className="text-xs flex items-center gap-1.5 mb-1">
                  <Stethoscope className="size-3.5 text-gray-400" />
                  Discipline
                </Label>
                <Select
                  value={fieldUpdates.discipline || ''}
                  onValueChange={(val) => setFieldUpdates({ ...fieldUpdates, discipline: val })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCIPLINES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="re-notes" className="text-xs flex items-center gap-1.5 mb-1">
                <StickyNote className="size-3.5 text-gray-400" />
                Notes (optional)
              </Label>
              <Input
                id="re-notes"
                value={fieldUpdates.notes || ''}
                onChange={(e) => setFieldUpdates({ ...fieldUpdates, notes: e.target.value })}
                placeholder="Reason for change, special instructions..."
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}

        {/* Warning for destructive actions */}
        {action === 'cancel' && selectedScope !== 'single' && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              {selectedScope === 'all'
                ? 'This will cancel all non-completed visits in the series. This action cannot be undone.'
                : `This will cancel this visit and all ${(visitInfo.recurrenceTotal || 0) - (visitInfo.recurrenceIndex || 0) - 1} following visits. This action cannot be undone.`}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {showFieldForm && (
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={loading}
              className="mr-auto"
            >
              Back
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={config.destructive ? 'destructive' : 'default'}
            onClick={handleNext}
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            {action === 'edit' && !showFieldForm ? 'Next' : config.button}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
