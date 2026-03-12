/**
 * Care Plan Management Component
 * 
 * Comprehensive interface for managing patient care plans.
 * 
 * VIEWS:
 * - Overview (summary statistics)
 * - Problems list
 * - Goals by problem
 * - Interventions by goal
 * - Progress tracking
 * - Timeline view
 * 
 * FEATURES:
 * - Add/edit/delete problems, goals, interventions
 * - Status tracking
 * - Progress updates
 * - Multi-discipline coordination
 * - Easy updates throughout episode
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Target,
  Activity,
  Users,
  Calendar,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  CarePlan,
  Problem,
  Goal,
  Intervention,
  DisciplineType,
} from '../services/carePlan';
import {
  DISCIPLINE_CONFIG,
  PROBLEM_STATUS_CONFIG,
  GOAL_STATUS_CONFIG,
  INTERVENTION_STATUS_CONFIG,
  carePlanService,
} from '../services/carePlan';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CarePlanManagementProps {
  carePlan: CarePlan;
  onUpdate: (carePlan: CarePlan) => void;
  onAddProblem: () => void;
  onEditProblem: (problem: Problem) => void;
  onAddGoal: (problemId: string) => void;
  onEditGoal: (goal: Goal) => void;
  onAddIntervention: (goalId: string) => void;
  onEditIntervention: (intervention: Intervention) => void;
  readOnly?: boolean;
}

export default function CarePlanManagement({
  carePlan,
  onUpdate,
  onAddProblem,
  onEditProblem,
  onAddGoal,
  onEditGoal,
  onAddIntervention,
  onEditIntervention,
  readOnly = false,
}: CarePlanManagementProps) {
  const [expandedProblems, setExpandedProblems] = useState<Set<string>>(
    new Set(carePlan.problems.filter(p => p.status === 'active').map(p => p.id))
  );
  const [view, setView] = useState<'hierarchy' | 'timeline' | 'discipline'>('hierarchy');

  const stats = carePlanService.getStatistics(carePlan);

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

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Care Plan</h2>
          <p className="text-sm text-gray-600 mt-1">
            Version {carePlan.version} • Last updated {new Date(carePlan.lastModifiedDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={cn(
            carePlan.status === 'active' && 'bg-green-600 text-white',
            carePlan.status === 'draft' && 'bg-gray-600 text-white',
            carePlan.status === 'updated' && 'bg-blue-600 text-white'
          )}>
            {carePlan.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          icon={AlertCircle}
          label="Active Problems"
          value={stats.activeProblems}
          total={stats.totalProblems}
          color="red"
        />
        <StatCard
          icon={Target}
          label="Active Goals"
          value={stats.activeGoals}
          total={stats.totalGoals}
          color="blue"
        />
        <StatCard
          icon={Activity}
          label="Active Interventions"
          value={stats.activeInterventions}
          total={stats.totalInterventions}
          color="purple"
        />
        <StatCard
          icon={CheckCircle2}
          label="Goals Met"
          value={stats.metGoals}
          total={stats.totalGoals}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Disciplines"
          value={stats.disciplinesInvolved.length}
          color="orange"
        />
        <StatCard
          icon={TrendingUp}
          label="Overall Progress"
          value={`${stats.overallProgress}%`}
          color="teal"
        />
      </div>

      {/* Overall Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Care Plan Progress</span>
          <span className="text-sm font-semibold text-gray-900">{stats.overallProgress}%</span>
        </div>
        <Progress value={stats.overallProgress} className="h-3" />
      </Card>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v: any) => setView(v)}>
        <TabsList>
          <TabsTrigger value="hierarchy">
            <FileText className="w-4 h-4 mr-2" />
            Hierarchy View
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Calendar className="w-4 h-4 mr-2" />
            Timeline View
          </TabsTrigger>
          <TabsTrigger value="discipline">
            <Users className="w-4 h-4 mr-2" />
            By Discipline
          </TabsTrigger>
        </TabsList>

        {/* Hierarchy View */}
        <TabsContent value="hierarchy" className="mt-6 space-y-4">
          {/* Add Problem Button */}
          {!readOnly && (
            <Button onClick={onAddProblem} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Problem
            </Button>
          )}

          {/* Problems List */}
          {carePlan.problems.map(problem => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              carePlan={carePlan}
              expanded={expandedProblems.has(problem.id)}
              onToggle={() => toggleProblem(problem.id)}
              onEdit={() => onEditProblem(problem)}
              onAddGoal={() => onAddGoal(problem.id)}
              onEditGoal={onEditGoal}
              onAddIntervention={onAddIntervention}
              onEditIntervention={onEditIntervention}
              readOnly={readOnly}
            />
          ))}

          {carePlan.problems.length === 0 && (
            <Card className="p-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 font-medium">No Problems Defined</p>
                <p className="text-sm text-gray-500 mt-1">Add a problem to begin care planning</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          <TimelineView carePlan={carePlan} />
        </TabsContent>

        {/* Discipline View */}
        <TabsContent value="discipline" className="mt-6">
          <DisciplineView carePlan={carePlan} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon,
  label,
  value,
  total,
  color,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  total?: number;
  color: 'red' | 'blue' | 'purple' | 'green' | 'orange' | 'teal';
}) {
  const colorConfig = {
    red: 'bg-red-50 border-red-200 text-red-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    teal: 'bg-teal-50 border-teal-200 text-teal-600',
  };

  return (
    <Card className={cn('p-4', colorConfig[color])}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <div className="text-2xl font-bold">
            {value}{total !== undefined && <span className="text-sm font-normal">/{total}</span>}
          </div>
          <div className="text-xs opacity-80">{label}</div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROBLEM CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ProblemCardProps {
  problem: Problem;
  carePlan: CarePlan;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onAddIntervention: (goalId: string) => void;
  onEditIntervention: (intervention: Intervention) => void;
  readOnly: boolean;
}

function ProblemCard({
  problem,
  carePlan,
  expanded,
  onToggle,
  onEdit,
  onAddGoal,
  onEditGoal,
  onAddIntervention,
  onEditIntervention,
  readOnly,
}: ProblemCardProps) {
  const statusConfig = PROBLEM_STATUS_CONFIG[problem.status];
  const goals = carePlanService.getGoalsForProblem(carePlan, problem.id);

  return (
    <Card className="overflow-hidden">
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
            <button className="mt-1">
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900">{problem.name}</h4>
                {problem.isPrimary && (
                  <Badge className="bg-blue-600 text-white text-xs">Primary</Badge>
                )}
                <Badge className={cn('text-xs', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {problem.severity}
                </Badge>
              </div>
              {problem.description && (
                <p className="text-sm text-gray-700 mb-1">{problem.description}</p>
              )}
              {problem.icd10Code && (
                <p className="text-xs text-gray-600">
                  ICD-10: {problem.icd10Code} - {problem.icd10Description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <span>{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
                <span>{problem.relatedInterventionIds.length} intervention{problem.relatedInterventionIds.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {!readOnly && (
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Content - Goals */}
      {expanded && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-sm text-gray-900">Goals</h5>
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={onAddGoal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            )}
          </div>

          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  carePlan={carePlan}
                  onEdit={() => onEditGoal(goal)}
                  onAddIntervention={() => onAddIntervention(goal.id)}
                  onEditIntervention={onEditIntervention}
                  readOnly={readOnly}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No goals defined for this problem
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GOAL CARD
// ═══════════════════════════════════════════════════════════════════════════

interface GoalCardProps {
  goal: Goal;
  carePlan: CarePlan;
  onEdit: () => void;
  onAddIntervention: () => void;
  onEditIntervention: (intervention: Intervention) => void;
  readOnly: boolean;
}

function GoalCard({
  goal,
  carePlan,
  onEdit,
  onAddIntervention,
  onEditIntervention,
  readOnly,
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = GOAL_STATUS_CONFIG[goal.status];
  const interventions = carePlanService.getInterventionsForGoal(carePlan, goal.id);
  const targetDate = new Date(goal.targetDate);
  const isOverdue = targetDate < new Date() && goal.status === 'active';

  return (
    <Card className="bg-white">
      <div className="p-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <h6 className="font-semibold text-sm text-gray-900">{goal.name}</h6>
              <Badge className={cn('text-xs', statusConfig.color)}>
                {statusConfig.label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">Overdue</Badge>
              )}
            </div>
            <p className="text-xs text-gray-700 mb-2">{goal.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Target: {targetDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{DISCIPLINE_CONFIG[goal.primaryDiscipline].abbreviation}</span>
              </div>
            </div>
          </div>

          {!readOnly && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">{goal.progressPercentage}%</span>
          </div>
          <Progress value={goal.progressPercentage} className="h-2" />
        </div>

        {/* Disciplines */}
        <div className="flex items-center gap-1 mb-2">
          {goal.responsibleDisciplines.map(discipline => (
            <Badge
              key={discipline}
              variant="outline"
              className="text-xs"
            >
              {DISCIPLINE_CONFIG[discipline].abbreviation}
            </Badge>
          ))}
        </div>

        {/* Interventions Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
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
              {!readOnly && (
                <Button variant="outline" size="sm" onClick={onAddIntervention}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
            {interventions.map(intervention => (
              <InterventionCard
                key={intervention.id}
                intervention={intervention}
                onEdit={() => onEditIntervention(intervention)}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERVENTION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface InterventionCardProps {
  intervention: Intervention;
  onEdit: () => void;
  readOnly: boolean;
}

function InterventionCard({ intervention, onEdit, readOnly }: InterventionCardProps) {
  const statusConfig = INTERVENTION_STATUS_CONFIG[intervention.status];

  return (
    <div className="p-2 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3 h-3 text-purple-600" />
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
                className="h-1"
              />
              <span className="text-xs text-gray-500">
                {intervention.completedCount}/{intervention.totalPlannedCount} completed
              </span>
            </div>
          )}
        </div>

        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-6 w-6 p-0">
            <Edit className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE VIEW
// ═══════════════════════════════════════════════════════════════════════════

function TimelineView({ carePlan }: { carePlan: CarePlan }) {
  // Sort all items by date
  const timelineItems = [
    ...carePlan.goals.map(g => ({ type: 'goal' as const, item: g, date: g.targetDate })),
    ...carePlan.interventions.map(i => ({ type: 'intervention' as const, item: i, date: i.endDate || i.startDate })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-3">
      {timelineItems.map((item, idx) => (
        <Card key={idx} className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {item.type === 'goal' ? (
                <Target className="w-5 h-5 text-blue-600" />
              ) : (
                <Activity className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{item.item.name}</span>
                <Badge variant="outline" className="text-xs">
                  {item.type === 'goal' ? 'Goal' : 'Intervention'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                {item.type === 'goal' ? 'Target Date' : 'End Date'}: {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCIPLINE VIEW
// ═══════════════════════════════════════════════════════════════════════════

function DisciplineView({ carePlan }: { carePlan: CarePlan }) {
  const disciplines = carePlanService.getStatistics(carePlan).disciplinesInvolved;

  return (
    <div className="space-y-4">
      {disciplines.map(discipline => {
        const config = DISCIPLINE_CONFIG[discipline];
        const disciplineGoals = carePlan.goals.filter(g =>
          g.responsibleDisciplines.includes(discipline)
        );
        const disciplineInterventions = carePlan.interventions.filter(i =>
          i.responsibleDisciplines.includes(discipline)
        );

        return (
          <Card key={discipline} className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              {config.label}
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Goals: </span>
                <span className="text-sm text-gray-600">{disciplineGoals.length}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Interventions: </span>
                <span className="text-sm text-gray-600">{disciplineInterventions.length}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
