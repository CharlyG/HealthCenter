/**
 * Care Plan Editor Component
 * 
 * Interactive editor for managing care plans throughout admission.
 * 
 * FEATURES:
 * - Expandable problem cards with nested goals/interventions
 * - Quick actions (Add, Edit, Complete, Update Status)
 * - Longitudinal care planning across admission
 * - Real-time validation
 * - Auto-save functionality
 * - Multi-discipline coordination
 * 
 * COMPONENTS:
 * - Problem cards (expandable)
 * - Goal cards (nested, expandable)
 * - Intervention cards (nested)
 * - Add/Edit dialogs
 * - Status update controls
 * - Progress tracking
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
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
import {
  Plus,
  Edit,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Target,
  Activity,
  Calendar,
  Users,
  Clock,
  Save,
  X,
  CheckCircle2,
  CircleDot,
  PlayCircle,
  PauseCircle,
  StopCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  CarePlan,
  Problem,
  Goal,
  Intervention,
  ProblemStatus,
  GoalStatus,
  InterventionStatus,
  DisciplineType,
  ProblemSeverity,
} from '../services/carePlan';
import {
  DISCIPLINE_CONFIG,
  PROBLEM_STATUS_CONFIG,
  GOAL_STATUS_CONFIG,
  INTERVENTION_STATUS_CONFIG,
  carePlanService,
} from '../services/carePlan';
import { GoalDialog, InterventionDialog } from './CarePlanDialogs';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type DialogType = 'problem' | 'goal' | 'intervention' | null;

interface DialogState {
  type: DialogType;
  mode: 'add' | 'edit';
  data?: Partial<Problem | Goal | Intervention>;
  problemId?: string;
  goalId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CarePlanEditorProps {
  carePlan: CarePlan;
  onChange: (carePlan: CarePlan) => void;
  autoSave?: boolean;
}

export default function CarePlanEditor({
  carePlan,
  onChange,
  autoSave = true,
}: CarePlanEditorProps) {
  const [expandedProblems, setExpandedProblems] = useState<Set<string>>(
    new Set(carePlan.problems.filter(p => p.status === 'active').map(p => p.id))
  );
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, mode: 'add' });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Toggle handlers
  const toggleProblem = (problemId: string) => {
    setExpandedProblems(prev => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        next.delete(problemId);
      } else {
        next.add(problemId);
      }
      return next;
    });
  };

  const toggleGoal = (goalId: string) => {
    setExpandedGoals(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  // Dialog handlers
  const openAddProblemDialog = () => {
    setDialogState({ type: 'problem', mode: 'add' });
  };

  const openEditProblemDialog = (problem: Problem) => {
    setDialogState({ type: 'problem', mode: 'edit', data: problem });
  };

  const openAddGoalDialog = (problemId: string) => {
    setDialogState({ type: 'goal', mode: 'add', problemId });
  };

  const openEditGoalDialog = (goal: Goal) => {
    setDialogState({ type: 'goal', mode: 'edit', data: goal, problemId: goal.problemId });
  };

  const openAddInterventionDialog = (goalId: string, problemId: string) => {
    setDialogState({ type: 'intervention', mode: 'add', goalId, problemId });
  };

  const openEditInterventionDialog = (intervention: Intervention) => {
    setDialogState({
      type: 'intervention',
      mode: 'edit',
      data: intervention,
      goalId: intervention.goalId,
      problemId: intervention.problemId,
    });
  };

  const closeDialog = () => {
    setDialogState({ type: null, mode: 'add' });
  };

  // CRUD operations
  const handleSaveProblem = (problemData: Partial<Problem>) => {
    setSaveStatus('saving');
    const updatedCarePlan = { ...carePlan };

    if (dialogState.mode === 'add') {
      carePlanService.addProblem(updatedCarePlan, {
        name: problemData.name!,
        description: problemData.description,
        icd10Code: problemData.icd10Code,
        icd10Description: problemData.icd10Description,
        severity: problemData.severity!,
        isPrimary: problemData.isPrimary!,
        status: problemData.status!,
        identifiedDate: problemData.identifiedDate || new Date().toISOString(),
        createdBy: 'Current User', // Would come from auth context
      });
    } else {
      const problem = updatedCarePlan.problems.find(p => p.id === (problemData as Problem).id);
      if (problem) {
        Object.assign(problem, {
          ...problemData,
          lastModifiedBy: 'Current User',
          lastModifiedDate: new Date().toISOString(),
        });
      }
    }

    onChange(updatedCarePlan);
    closeDialog();
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const handleSaveGoal = (goalData: Partial<Goal>) => {
    setSaveStatus('saving');
    const updatedCarePlan = { ...carePlan };

    if (dialogState.mode === 'add') {
      carePlanService.addGoal(updatedCarePlan, {
        problemId: dialogState.problemId!,
        name: goalData.name!,
        description: goalData.description!,
        measurableCriteria: goalData.measurableCriteria!,
        targetValue: goalData.targetValue,
        startDate: goalData.startDate || new Date().toISOString(),
        targetDate: goalData.targetDate!,
        status: goalData.status!,
        progressPercentage: goalData.progressPercentage || 0,
        responsibleDisciplines: goalData.responsibleDisciplines!,
        primaryDiscipline: goalData.primaryDiscipline!,
        createdBy: 'Current User',
      });
    } else {
      const goal = updatedCarePlan.goals.find(g => g.id === (goalData as Goal).id);
      if (goal) {
        Object.assign(goal, {
          ...goalData,
          lastModifiedBy: 'Current User',
          lastModifiedDate: new Date().toISOString(),
        });
      }
    }

    onChange(updatedCarePlan);
    closeDialog();
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const handleSaveIntervention = (interventionData: Partial<Intervention>) => {
    setSaveStatus('saving');
    const updatedCarePlan = { ...carePlan };

    if (dialogState.mode === 'add') {
      carePlanService.addIntervention(updatedCarePlan, {
        goalId: dialogState.goalId!,
        problemId: dialogState.problemId!,
        name: interventionData.name!,
        description: interventionData.description!,
        instructions: interventionData.instructions,
        frequency: interventionData.frequency!,
        duration: interventionData.duration,
        responsibleDisciplines: interventionData.responsibleDisciplines!,
        primaryDiscipline: interventionData.primaryDiscipline!,
        startDate: interventionData.startDate || new Date().toISOString(),
        status: interventionData.status!,
        requiresPatientTeaching: interventionData.requiresPatientTeaching || false,
        teachingCompleted: interventionData.teachingCompleted || false,
        createdBy: 'Current User',
      });
    } else {
      const intervention = updatedCarePlan.interventions.find(
        i => i.id === (interventionData as Intervention).id
      );
      if (intervention) {
        Object.assign(intervention, {
          ...interventionData,
          lastModifiedBy: 'Current User',
          lastModifiedDate: new Date().toISOString(),
        });
      }
    }

    onChange(updatedCarePlan);
    closeDialog();
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  // Quick actions
  const handleDeleteProblem = (problemId: string) => {
    if (confirm('Are you sure you want to delete this problem and all related goals/interventions?')) {
      const updatedCarePlan = { ...carePlan };
      updatedCarePlan.problems = updatedCarePlan.problems.filter(p => p.id !== problemId);
      updatedCarePlan.goals = updatedCarePlan.goals.filter(g => g.problemId !== problemId);
      updatedCarePlan.interventions = updatedCarePlan.interventions.filter(
        i => i.problemId !== problemId
      );
      onChange(updatedCarePlan);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal and all related interventions?')) {
      const updatedCarePlan = { ...carePlan };
      updatedCarePlan.goals = updatedCarePlan.goals.filter(g => g.id !== goalId);
      updatedCarePlan.interventions = updatedCarePlan.interventions.filter(i => i.goalId !== goalId);
      onChange(updatedCarePlan);
    }
  };

  const handleDeleteIntervention = (interventionId: string) => {
    if (confirm('Are you sure you want to delete this intervention?')) {
      const updatedCarePlan = { ...carePlan };
      updatedCarePlan.interventions = updatedCarePlan.interventions.filter(
        i => i.id !== interventionId
      );
      onChange(updatedCarePlan);
    }
  };

  const handleUpdateGoalProgress = (goalId: string, progress: number) => {
    const updatedCarePlan = { ...carePlan };
    const goal = updatedCarePlan.goals.find(g => g.id === goalId);
    if (goal) {
      carePlanService.updateGoalProgress(goal, progress);
      onChange(updatedCarePlan);
    }
  };

  const handleMarkGoalComplete = (goalId: string) => {
    const updatedCarePlan = { ...carePlan };
    const goal = updatedCarePlan.goals.find(g => g.id === goalId);
    if (goal) {
      goal.status = 'met';
      goal.progressPercentage = 100;
      goal.achievedDate = new Date().toISOString();
      onChange(updatedCarePlan);
    }
  };

  const handleMarkInterventionComplete = (interventionId: string) => {
    const updatedCarePlan = { ...carePlan };
    const intervention = updatedCarePlan.interventions.find(i => i.id === interventionId);
    if (intervention) {
      intervention.status = 'completed';
      intervention.endDate = new Date().toISOString();
      onChange(updatedCarePlan);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Quick Add */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Care Plan Editor</h3>
          <p className="text-sm text-gray-600">Manage problems, goals, and interventions</p>
        </div>
        <div className="flex items-center gap-2">
          {autoSave && (
            <div className="flex items-center gap-2 text-sm">
              {saveStatus === 'saving' && (
                <>
                  <Clock className="w-4 h-4 text-gray-400 animate-spin" />
                  <span className="text-gray-600">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">All changes saved</span>
                </>
              )}
            </div>
          )}
          <Button onClick={openAddProblemDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </Button>
        </div>
      </div>

      {/* Problems List */}
      {carePlan.problems.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h4 className="font-semibold text-gray-900 mb-1">No Problems Defined</h4>
            <p className="text-sm text-gray-600 mb-4">
              Start by adding a clinical problem to create your care plan
            </p>
            <Button onClick={openAddProblemDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Problem
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {carePlan.problems.map(problem => (
            <ProblemEditorCard
              key={problem.id}
              problem={problem}
              carePlan={carePlan}
              expanded={expandedProblems.has(problem.id)}
              onToggle={() => toggleProblem(problem.id)}
              onEdit={() => openEditProblemDialog(problem)}
              onDelete={() => handleDeleteProblem(problem.id)}
              onAddGoal={() => openAddGoalDialog(problem.id)}
              onEditGoal={openEditGoalDialog}
              onDeleteGoal={handleDeleteGoal}
              onMarkGoalComplete={handleMarkGoalComplete}
              onUpdateGoalProgress={handleUpdateGoalProgress}
              onAddIntervention={(goalId) => openAddInterventionDialog(goalId, problem.id)}
              onEditIntervention={openEditInterventionDialog}
              onDeleteIntervention={handleDeleteIntervention}
              onMarkInterventionComplete={handleMarkInterventionComplete}
              expandedGoals={expandedGoals}
              onToggleGoal={toggleGoal}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {dialogState.type === 'problem' && (
        <ProblemDialog
          open={true}
          mode={dialogState.mode}
          problem={dialogState.data as Problem}
          onSave={handleSaveProblem}
          onClose={closeDialog}
        />
      )}

      {dialogState.type === 'goal' && (
        <GoalDialog
          open={true}
          mode={dialogState.mode}
          goal={dialogState.data as Goal}
          problemId={dialogState.problemId!}
          onSave={handleSaveGoal}
          onClose={closeDialog}
        />
      )}

      {dialogState.type === 'intervention' && (
        <InterventionDialog
          open={true}
          mode={dialogState.mode}
          intervention={dialogState.data as Intervention}
          goalId={dialogState.goalId!}
          problemId={dialogState.problemId!}
          onSave={handleSaveIntervention}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROBLEM EDITOR CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ProblemEditorCardProps {
  problem: Problem;
  carePlan: CarePlan;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onMarkGoalComplete: (goalId: string) => void;
  onUpdateGoalProgress: (goalId: string, progress: number) => void;
  onAddIntervention: (goalId: string) => void;
  onEditIntervention: (intervention: Intervention) => void;
  onDeleteIntervention: (interventionId: string) => void;
  onMarkInterventionComplete: (interventionId: string) => void;
  expandedGoals: Set<string>;
  onToggleGoal: (goalId: string) => void;
}

function ProblemEditorCard({
  problem,
  carePlan,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onMarkGoalComplete,
  onUpdateGoalProgress,
  onAddIntervention,
  onEditIntervention,
  onDeleteIntervention,
  onMarkInterventionComplete,
  expandedGoals,
  onToggleGoal,
}: ProblemEditorCardProps) {
  const statusConfig = PROBLEM_STATUS_CONFIG[problem.status];
  const goals = carePlanService.getGoalsForProblem(carePlan, problem.id);

  return (
    <Card className={cn(
      'overflow-hidden border-l-4',
      problem.severity === 'high' && 'border-l-red-500',
      problem.severity === 'medium' && 'border-l-amber-500',
      problem.severity === 'low' && 'border-l-green-500'
    )}>
      {/* Problem Header */}
      <div
        className={cn(
          'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
          problem.isPrimary && 'bg-blue-50'
        )}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <button className="mt-1" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <AlertCircle className={cn(
              'w-5 h-5 mt-0.5',
              problem.severity === 'high' && 'text-red-600',
              problem.severity === 'medium' && 'text-amber-600',
              problem.severity === 'low' && 'text-green-600'
            )} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-gray-900">{problem.name}</h4>
                {problem.isPrimary && (
                  <Badge className="bg-blue-600 text-white text-xs">Primary</Badge>
                )}
                <Badge className={cn('text-xs', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {problem.severity}
                </Badge>
              </div>
              {problem.description && (
                <p className="text-sm text-gray-700 mb-1">{problem.description}</p>
              )}
              {problem.icd10Code && (
                <p className="text-xs text-gray-600">
                  <strong>ICD-10:</strong> {problem.icd10Code}{problem.icd10Description && ` - ${problem.icd10Description}`}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {goals.length} goal{goals.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {problem.relatedInterventionIds.length} intervention{problem.relatedInterventionIds.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content - Goals */}
      {expanded && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-sm text-gray-900">Goals & Interventions</h5>
            <Button variant="outline" size="sm" onClick={onAddGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map(goal => (
                <GoalEditorCard
                  key={goal.id}
                  goal={goal}
                  carePlan={carePlan}
                  expanded={expandedGoals.has(goal.id)}
                  onToggle={() => onToggleGoal(goal.id)}
                  onEdit={() => onEditGoal(goal)}
                  onDelete={() => onDeleteGoal(goal.id)}
                  onMarkComplete={() => onMarkGoalComplete(goal.id)}
                  onUpdateProgress={(progress) => onUpdateGoalProgress(goal.id, progress)}
                  onAddIntervention={() => onAddIntervention(goal.id)}
                  onEditIntervention={onEditIntervention}
                  onDeleteIntervention={onDeleteIntervention}
                  onMarkInterventionComplete={onMarkInterventionComplete}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <p className="text-sm text-gray-500 text-center">
                No goals defined. Click "Add Goal" to create patient-specific goals.
              </p>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GOAL EDITOR CARD
// ═══════════════════════════════════════════════════════════════════════════

interface GoalEditorCardProps {
  goal: Goal;
  carePlan: CarePlan;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMarkComplete: () => void;
  onUpdateProgress: (progress: number) => void;
  onAddIntervention: () => void;
  onEditIntervention: (intervention: Intervention) => void;
  onDeleteIntervention: (interventionId: string) => void;
  onMarkInterventionComplete: (interventionId: string) => void;
}

function GoalEditorCard({
  goal,
  carePlan,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onMarkComplete,
  onUpdateProgress,
  onAddIntervention,
  onEditIntervention,
  onDeleteIntervention,
  onMarkInterventionComplete,
}: GoalEditorCardProps) {
  const statusConfig = GOAL_STATUS_CONFIG[goal.status];
  const interventions = carePlanService.getInterventionsForGoal(carePlan, goal.id);
  const targetDate = new Date(goal.targetDate);
  const isOverdue = targetDate < new Date() && goal.status === 'active';

  return (
    <Card className="bg-white">
      <div className="p-3">
        {/* Goal Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-2 flex-1">
            <button className="mt-1" onClick={onToggle}>
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <Target className="w-4 h-4 text-blue-600 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h6 className="font-semibold text-sm text-gray-900">{goal.name}</h6>
                <Badge className={cn('text-xs', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">Overdue</Badge>
                )}
              </div>
              <p className="text-xs text-gray-700 mb-2">{goal.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Target: {targetDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{DISCIPLINE_CONFIG[goal.primaryDiscipline].label}</span>
                </div>
              </div>

              {/* Progress Bar with Quick Update */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-gray-900">{goal.progressPercentage}%</span>
                </div>
                <Progress value={goal.progressPercentage} className="h-2" />
                <div className="flex items-center gap-1 mt-1">
                  {[0, 25, 50, 75, 100].map(value => (
                    <button
                      key={value}
                      onClick={() => onUpdateProgress(value)}
                      className={cn(
                        'flex-1 px-1 py-0.5 text-xs rounded border transition-colors',
                        goal.progressPercentage === value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Disciplines */}
              <div className="flex items-center gap-1 flex-wrap">
                {goal.responsibleDisciplines.map(discipline => (
                  <Badge key={discipline} variant="outline" className="text-xs">
                    {DISCIPLINE_CONFIG[discipline].abbreviation}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            {goal.status === 'active' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkComplete}
                className="text-green-600 hover:text-green-700"
                title="Mark as Met"
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Interventions Toggle */}
        <button
          onClick={onToggle}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          {interventions.length} intervention{interventions.length !== 1 ? 's' : ''}
        </button>

        {/* Expanded Interventions */}
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Interventions</span>
              <Button variant="outline" size="sm" onClick={onAddIntervention}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            {interventions.length > 0 ? (
              interventions.map(intervention => (
                <InterventionEditorCard
                  key={intervention.id}
                  intervention={intervention}
                  onEdit={() => onEditIntervention(intervention)}
                  onDelete={() => onDeleteIntervention(intervention.id)}
                  onMarkComplete={() => onMarkInterventionComplete(intervention.id)}
                />
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-2">
                No interventions defined
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERVENTION EDITOR CARD
// ═══════════════════════════════════════════════════════════════════════════

interface InterventionEditorCardProps {
  intervention: Intervention;
  onEdit: () => void;
  onDelete: () => void;
  onMarkComplete: () => void;
}

function InterventionEditorCard({
  intervention,
  onEdit,
  onDelete,
  onMarkComplete,
}: InterventionEditorCardProps) {
  const statusConfig = INTERVENTION_STATUS_CONFIG[intervention.status];

  return (
    <div className="p-2 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <Activity className="w-3 h-3 text-purple-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-xs text-gray-900">{intervention.name}</span>
              <Badge className={cn('text-xs', statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-700 mb-1">{intervention.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{intervention.frequency}</span>
              </div>
              <span>{DISCIPLINE_CONFIG[intervention.primaryDiscipline].abbreviation}</span>
            </div>
            {intervention.totalPlannedCount && (
              <div className="mt-1">
                <Progress
                  value={(intervention.completedCount || 0) / intervention.totalPlannedCount * 100}
                  className="h-1 mb-0.5"
                />
                <span className="text-xs text-gray-500">
                  {intervention.completedCount}/{intervention.totalPlannedCount} completed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-0.5">
          {intervention.status === 'active' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkComplete}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
              title="Mark as Completed"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-6 w-6 p-0">
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROBLEM DIALOG
// ═══════════════════════════════════════════════════════════════════════════

interface ProblemDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  problem?: Problem;
  onSave: (data: Partial<Problem>) => void;
  onClose: () => void;
}

function ProblemDialog({ open, mode, problem, onSave, onClose }: ProblemDialogProps) {
  const [formData, setFormData] = useState<Partial<Problem>>(
    problem || {
      name: '',
      description: '',
      icd10Code: '',
      icd10Description: '',
      severity: 'medium',
      isPrimary: false,
      status: 'active',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Clinical Problem' : 'Edit Clinical Problem'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Problem Name */}
          <div>
            <Label htmlFor="problem-name">
              Problem Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="problem-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Congestive Heart Failure"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="problem-description">Description</Label>
            <Textarea
              id="problem-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the clinical problem..."
              rows={3}
            />
          </div>

          {/* ICD-10 Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icd10-code">ICD-10 Code</Label>
              <Input
                id="icd10-code"
                value={formData.icd10Code || ''}
                onChange={(e) => setFormData({ ...formData, icd10Code: e.target.value })}
                placeholder="e.g., I50.9"
              />
            </div>
            <div>
              <Label htmlFor="icd10-description">ICD-10 Description</Label>
              <Input
                id="icd10-description"
                value={formData.icd10Description || ''}
                onChange={(e) => setFormData({ ...formData, icd10Description: e.target.value })}
                placeholder="e.g., Heart failure, unspecified"
              />
            </div>
          </div>

          {/* Severity & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="severity">
                Severity <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.severity}
                onValueChange={(value: ProblemSeverity) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">
                Status <span className="text-red-600">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProblemStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Primary Diagnosis */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-primary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked as boolean })}
            />
            <Label htmlFor="is-primary" className="cursor-pointer">
              This is the primary diagnosis
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {mode === 'add' ? 'Add Problem' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}