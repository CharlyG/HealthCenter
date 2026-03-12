/**
 * Care Plan Editor Dialogs
 * 
 * Form dialogs for adding/editing goals and interventions
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Save, X } from 'lucide-react';
import type {
  Goal,
  Intervention,
  GoalStatus,
  InterventionStatus,
  DisciplineType,
} from '../services/carePlan';
import { DISCIPLINE_CONFIG } from '../services/carePlan';

// ═══════════════════════════════════════════════════════════════════════════
// GOAL DIALOG
// ═══════════════════════════════════════════════════════════════════════════

interface GoalDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  goal?: Goal;
  problemId: string;
  onSave: (data: Partial<Goal>) => void;
  onClose: () => void;
}

export function GoalDialog({ open, mode, goal, problemId, onSave, onClose }: GoalDialogProps) {
  const [formData, setFormData] = useState<Partial<Goal>>(
    goal || {
      problemId,
      name: '',
      description: '',
      measurableCriteria: '',
      targetValue: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      progressPercentage: 0,
      responsibleDisciplines: [],
      primaryDiscipline: 'skilled-nursing' as DisciplineType,
    }
  );

  const handleDisciplineToggle = (discipline: DisciplineType) => {
    const disciplines = formData.responsibleDisciplines || [];
    const newDisciplines = disciplines.includes(discipline)
      ? disciplines.filter(d => d !== discipline)
      : [...disciplines, discipline];
    setFormData({ ...formData, responsibleDisciplines: newDisciplines });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Patient Goal' : 'Edit Patient Goal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div>
            <Label htmlFor="goal-name">
              Goal Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="goal-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Improve Cardiac Function"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="goal-description">
              Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="goal-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what the patient will achieve..."
              rows={3}
              required
            />
          </div>

          {/* Measurable Criteria */}
          <div>
            <Label htmlFor="measurable-criteria">
              Measurable Criteria <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="measurable-criteria"
              value={formData.measurableCriteria || ''}
              onChange={(e) => setFormData({ ...formData, measurableCriteria: e.target.value })}
              placeholder="How will success be measured? Be specific..."
              rows={2}
              required
            />
            <p className="text-xs text-gray-600 mt-1">
              SMART goal: Specific, Measurable, Achievable, Relevant, Time-bound
            </p>
          </div>

          {/* Target Value */}
          <div>
            <Label htmlFor="target-value">Target Value</Label>
            <Input
              id="target-value"
              value={formData.targetValue || ''}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              placeholder="e.g., Walk 50 feet independently"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">
                Start Date <span className="text-red-600">*</span>
              </Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate?.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="target-date">
                Target Date <span className="text-red-600">*</span>
              </Label>
              <Input
                id="target-date"
                type="date"
                value={formData.targetDate?.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Status & Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goal-status">
                Status <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: GoalStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="goal-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="met">Met</SelectItem>
                  <SelectItem value="partially-met">Partially Met</SelectItem>
                  <SelectItem value="not-met">Not Met</SelectItem>
                  <SelectItem value="revised">Revised</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progressPercentage || 0}
                onChange={(e) => setFormData({ ...formData, progressPercentage: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Primary Discipline */}
          <div>
            <Label htmlFor="primary-discipline">
              Primary Discipline <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.primaryDiscipline}
              onValueChange={(value: DisciplineType) => setFormData({ ...formData, primaryDiscipline: value })}
            >
              <SelectTrigger id="primary-discipline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISCIPLINE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label} ({config.abbreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsible Disciplines */}
          <div>
            <Label className="mb-2 block">
              Responsible Disciplines <span className="text-red-600">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DISCIPLINE_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`discipline-${key}`}
                    checked={formData.responsibleDisciplines?.includes(key as DisciplineType)}
                    onCheckedChange={() => handleDisciplineToggle(key as DisciplineType)}
                  />
                  <Label htmlFor={`discipline-${key}`} className="cursor-pointer">
                    {config.label} ({config.abbreviation})
                  </Label>
                </div>
              ))}
            </div>
            {formData.responsibleDisciplines && formData.responsibleDisciplines.length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                Please select at least one responsible discipline
              </p>
            )}
          </div>

          {/* Progress Notes */}
          <div>
            <Label htmlFor="progress-notes">Progress Notes</Label>
            <Textarea
              id="progress-notes"
              value={formData.progressNotes || ''}
              onChange={(e) => setFormData({ ...formData, progressNotes: e.target.value })}
              placeholder="Document progress toward this goal..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.responsibleDisciplines || formData.responsibleDisciplines.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {mode === 'add' ? 'Add Goal' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERVENTION DIALOG
// ═══════════════════════════════════════════════════════════════════════════

interface InterventionDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  intervention?: Intervention;
  goalId: string;
  problemId: string;
  onSave: (data: Partial<Intervention>) => void;
  onClose: () => void;
}

export function InterventionDialog({
  open,
  mode,
  intervention,
  goalId,
  problemId,
  onSave,
  onClose,
}: InterventionDialogProps) {
  const [formData, setFormData] = useState<Partial<Intervention>>(
    intervention || {
      goalId,
      problemId,
      name: '',
      description: '',
      instructions: '',
      frequency: '',
      duration: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      responsibleDisciplines: [],
      primaryDiscipline: 'skilled-nursing' as DisciplineType,
      requiresPatientTeaching: false,
      teachingCompleted: false,
    }
  );

  const handleDisciplineToggle = (discipline: DisciplineType) => {
    const disciplines = formData.responsibleDisciplines || [];
    const newDisciplines = disciplines.includes(discipline)
      ? disciplines.filter(d => d !== discipline)
      : [...disciplines, discipline];
    setFormData({ ...formData, responsibleDisciplines: newDisciplines });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Intervention' : 'Edit Intervention'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Intervention Name */}
          <div>
            <Label htmlFor="intervention-name">
              Intervention Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="intervention-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Skilled Nursing Assessment"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="intervention-description">
              Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="intervention-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the intervention..."
              rows={2}
              required
            />
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions">Detailed Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions || ''}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Step-by-step instructions for performing this intervention..."
              rows={3}
            />
          </div>

          {/* Frequency & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">
                Frequency <span className="text-red-600">*</span>
              </Label>
              <Input
                id="frequency"
                value={formData.frequency || ''}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., 3 times per week"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 30 minutes"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intervention-start-date">
                Start Date <span className="text-red-600">*</span>
              </Label>
              <Input
                id="intervention-start-date"
                type="date"
                value={formData.startDate?.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="intervention-status">
              Status <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: InterventionStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="intervention-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Discipline */}
          <div>
            <Label htmlFor="intervention-primary-discipline">
              Primary Discipline <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.primaryDiscipline}
              onValueChange={(value: DisciplineType) => setFormData({ ...formData, primaryDiscipline: value })}
            >
              <SelectTrigger id="intervention-primary-discipline">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISCIPLINE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label} ({config.abbreviation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Responsible Disciplines */}
          <div>
            <Label className="mb-2 block">
              Responsible Disciplines <span className="text-red-600">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DISCIPLINE_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`int-discipline-${key}`}
                    checked={formData.responsibleDisciplines?.includes(key as DisciplineType)}
                    onCheckedChange={() => handleDisciplineToggle(key as DisciplineType)}
                  />
                  <Label htmlFor={`int-discipline-${key}`} className="cursor-pointer">
                    {config.label} ({config.abbreviation})
                  </Label>
                </div>
              ))}
            </div>
            {formData.responsibleDisciplines && formData.responsibleDisciplines.length === 0 && (
              <p className="text-xs text-red-600 mt-1">
                Please select at least one responsible discipline
              </p>
            )}
          </div>

          {/* Completion Tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="completed-count">Completed Count</Label>
              <Input
                id="completed-count"
                type="number"
                min="0"
                value={formData.completedCount || 0}
                onChange={(e) => setFormData({ ...formData, completedCount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="total-planned">Total Planned</Label>
              <Input
                id="total-planned"
                type="number"
                min="0"
                value={formData.totalPlannedCount || 0}
                onChange={(e) => setFormData({ ...formData, totalPlannedCount: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Teaching Requirements */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires-teaching"
                checked={formData.requiresPatientTeaching}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresPatientTeaching: checked as boolean })}
              />
              <Label htmlFor="requires-teaching" className="cursor-pointer">
                Requires patient/caregiver teaching
              </Label>
            </div>
            {formData.requiresPatientTeaching && (
              <div className="flex items-center space-x-2 ml-6">
                <Checkbox
                  id="teaching-completed"
                  checked={formData.teachingCompleted}
                  onCheckedChange={(checked) => setFormData({ ...formData, teachingCompleted: checked as boolean })}
                />
                <Label htmlFor="teaching-completed" className="cursor-pointer">
                  Teaching completed
                </Label>
              </div>
            )}
          </div>

          {/* Precautions */}
          <div>
            <Label htmlFor="precautions">Precautions / Safety Considerations</Label>
            <Textarea
              id="precautions"
              value={formData.precautions?.join('\n') || ''}
              onChange={(e) => setFormData({ ...formData, precautions: e.target.value.split('\n').filter(Boolean) })}
              placeholder="Enter each precaution on a new line..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.responsibleDisciplines || formData.responsibleDisciplines.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {mode === 'add' ? 'Add Intervention' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
