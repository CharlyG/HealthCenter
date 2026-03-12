/**
 * Visit Preparation Panel
 * 
 * Pre-visit briefing interface for clinicians to review patient information
 * before beginning a visit.
 * 
 * Sections:
 * 1. Patient Summary - Name, diagnosis, care team, allergies, alerts
 * 2. Care Plan Snapshot - Goals, interventions, special instructions
 * 3. Recent Clinical Activity - Visits, orders, medications, hospitalizations
 * 4. Visit Tasks - Checklist of tasks to complete during visit
 * 
 * Features:
 * - Mobile-optimized layout
 * - Quick-scan information hierarchy
 * - Expandable sections
 * - Critical information highlighted
 * - One-tap actions
 */

import { useState } from 'react';
import {
  User,
  Heart,
  Users,
  AlertTriangle,
  Target,
  FileText,
  Activity,
  Calendar,
  Pill,
  Hospital,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Phone,
  Navigation,
  Clock,
  Stethoscope,
  AlertCircle,
  Info,
  Eye,
  Droplet,
  ThermometerSun,
  Scale,
  Syringe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

// ==================== TYPE DEFINITIONS ====================

export interface PatientSummary {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  primary_diagnosis: string;
  secondary_diagnoses: string[];
  care_team: CareTeamMember[];
  allergies: Allergy[];
  recent_alerts: Alert[];
  contact_phone: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
}

export interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  is_primary: boolean;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export interface Alert {
  id: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  date: string;
}

export interface CarePlanGoal {
  id: string;
  description: string;
  target_date: string;
  status: 'on_track' | 'at_risk' | 'achieved';
  progress_percent: number;
}

export interface Intervention {
  id: string;
  description: string;
  frequency: string;
  special_notes?: string;
}

export interface SpecialInstruction {
  id: string;
  category: string;
  instruction: string;
  is_critical: boolean;
}

export interface RecentVisit {
  id: string;
  date: string;
  discipline: string;
  clinician: string;
  service_type: string;
  key_findings: string[];
}

export interface Order {
  id: string;
  date: string;
  type: string;
  description: string;
  ordered_by: string;
  status: 'active' | 'pending' | 'discontinued';
}

export interface MedicationUpdate {
  id: string;
  date: string;
  action: 'added' | 'changed' | 'discontinued';
  medication_name: string;
  details: string;
}

export interface Hospitalization {
  id: string;
  admission_date: string;
  discharge_date?: string;
  facility: string;
  reason: string;
  discharge_summary?: string;
}

export interface VisitTask {
  id: string;
  category: 'observation' | 'intervention' | 'education' | 'assessment';
  description: string;
  is_required: boolean;
  completed: boolean;
  notes?: string;
}

export interface VisitPreparationData {
  patient_summary: PatientSummary;
  care_plan: {
    goals: CarePlanGoal[];
    interventions: Intervention[];
    special_instructions: SpecialInstruction[];
  };
  recent_activity: {
    visits: RecentVisit[];
    orders: Order[];
    medication_updates: MedicationUpdate[];
    hospitalizations: Hospitalization[];
  };
  visit_tasks: VisitTask[];
}

// ==================== PATIENT SUMMARY SECTION ====================

interface PatientSummarySectionProps {
  summary: PatientSummary;
  onCallPatient: () => void;
  onGetDirections: () => void;
}

function PatientSummarySection({ summary, onCallPatient, onGetDirections }: PatientSummarySectionProps) {
  return (
    <Card className="border-2 border-blue-300 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="size-5 text-blue-600" />
          Patient Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patient Info */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{summary.patient_name}</h3>
          <p className="text-sm text-gray-700">
            {summary.age} yrs • {summary.gender} • ID: {summary.patient_id}
          </p>
        </div>

        {/* Primary Diagnosis */}
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Heart className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">Primary Diagnosis</p>
              <p className="text-sm font-medium text-gray-900">{summary.primary_diagnosis}</p>
              {summary.secondary_diagnoses.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600">Secondary:</p>
                  <ul className="mt-1 space-y-0.5">
                    {summary.secondary_diagnoses.map((dx, i) => (
                      <li key={i} className="text-xs text-gray-700">• {dx}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Allergies */}
        {summary.allergies.length > 0 && (
          <div className="p-3 bg-red-50 rounded-lg border-2 border-red-300">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-900">ALLERGIES</p>
            </div>
            <div className="space-y-2">
              {summary.allergies.map((allergy) => (
                <div key={allergy.id} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-900">{allergy.allergen}</p>
                    <p className="text-xs text-red-800">{allergy.reaction}</p>
                  </div>
                  <Badge className={`text-xs ${
                    allergy.severity === 'severe' ? 'bg-red-600' :
                    allergy.severity === 'moderate' ? 'bg-orange-600' :
                    'bg-amber-600'
                  } text-white`}>
                    {allergy.severity.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Alerts */}
        {summary.recent_alerts.length > 0 && (
          <div className="space-y-2">
            {summary.recent_alerts.map((alert) => {
              const severityColors = {
                critical: 'bg-red-100 border-red-300 text-red-900',
                warning: 'bg-orange-100 border-orange-300 text-orange-900',
                info: 'bg-blue-100 border-blue-300 text-blue-900',
              };
              return (
                <div key={alert.id} className={`p-2 rounded border ${severityColors[alert.severity]}`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{alert.type}</p>
                      <p className="text-xs">{alert.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(alert.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Care Team */}
        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="size-4 text-gray-700" />
            <p className="text-xs font-semibold text-gray-700">Care Team</p>
          </div>
          <div className="space-y-2">
            {summary.care_team.map((member) => (
              <div key={member.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-medium text-gray-900">
                    {member.name}
                    {member.is_primary && (
                      <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                    )}
                  </p>
                  <p className="text-gray-600">{member.role}</p>
                </div>
                {member.phone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`tel:${member.phone}`)}
                  >
                    <Phone className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1 gap-2" onClick={onCallPatient}>
            <Phone className="size-4" />
            Call Patient
          </Button>
          <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={onGetDirections}>
            <Navigation className="size-4" />
            Directions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== CARE PLAN SNAPSHOT SECTION ====================

interface CarePlanSnapshotSectionProps {
  goals: CarePlanGoal[];
  interventions: Intervention[];
  special_instructions: SpecialInstruction[];
}

function CarePlanSnapshotSection({ goals, interventions, special_instructions }: CarePlanSnapshotSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const criticalInstructions = special_instructions.filter(i => i.is_critical);
  const normalInstructions = special_instructions.filter(i => !i.is_critical);

  return (
    <Card>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="size-5 text-green-600" />
            Care Plan Snapshot
          </CardTitle>
          {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          {/* Active Goals */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Active Goals ({goals.length})</p>
            <div className="space-y-2">
              {goals.map((goal) => {
                const statusColors = {
                  on_track: 'text-green-700 bg-green-100',
                  at_risk: 'text-orange-700 bg-orange-100',
                  achieved: 'text-blue-700 bg-blue-100',
                };
                return (
                  <div key={goal.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm text-gray-900 flex-1">{goal.description}</p>
                      <Badge className={`text-xs ${statusColors[goal.status]}`}>
                        {goal.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{goal.progress_percent}% complete</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Interventions */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Key Interventions</p>
            <div className="space-y-2">
              {interventions.map((intervention) => (
                <div key={intervention.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-900">{intervention.description}</p>
                  <p className="text-xs text-gray-600 mt-1">Frequency: {intervention.frequency}</p>
                  {intervention.special_notes && (
                    <p className="text-xs text-blue-700 mt-1 italic">Note: {intervention.special_notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {special_instructions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">Special Instructions</p>
              <div className="space-y-2">
                {criticalInstructions.map((instruction) => (
                  <div key={instruction.id} className="p-2 bg-amber-50 rounded border-2 border-amber-300">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900">{instruction.category}</p>
                        <p className="text-sm text-amber-800">{instruction.instruction}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {normalInstructions.map((instruction) => (
                  <div key={instruction.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700">{instruction.category}</p>
                    <p className="text-sm text-gray-900">{instruction.instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ==================== RECENT CLINICAL ACTIVITY SECTION ====================

interface RecentClinicalActivitySectionProps {
  visits: RecentVisit[];
  orders: Order[];
  medications: MedicationUpdate[];
  hospitalizations: Hospitalization[];
}

function RecentClinicalActivitySection({ 
  visits, 
  orders, 
  medications, 
  hospitalizations 
}: RecentClinicalActivitySectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="size-5 text-purple-600" />
            Recent Clinical Activity
          </CardTitle>
          {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          {/* Recent Visits */}
          {visits.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-gray-700" />
                <p className="text-xs font-semibold text-gray-700">Recent Visits ({visits.length})</p>
              </div>
              <div className="space-y-2">
                {visits.map((visit) => (
                  <div key={visit.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {visit.discipline} - {visit.service_type}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(visit.date).toLocaleDateString()} • {visit.clinician}
                        </p>
                      </div>
                    </div>
                    {visit.key_findings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Key Findings:</p>
                        <ul className="space-y-0.5">
                          {visit.key_findings.map((finding, i) => (
                            <li key={i} className="text-xs text-gray-700">• {finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Orders */}
          {orders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-4 text-gray-700" />
                <p className="text-xs font-semibold text-gray-700">Recent Orders ({orders.length})</p>
              </div>
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{order.type}</p>
                        <p className="text-xs text-gray-700 mt-1">{order.description}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Ordered by {order.ordered_by} • {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`text-xs ${
                        order.status === 'active' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medication Updates */}
          {medications.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pill className="size-4 text-gray-700" />
                <p className="text-xs font-semibold text-gray-700">Medication Updates ({medications.length})</p>
              </div>
              <div className="space-y-2">
                {medications.map((med) => (
                  <div key={med.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{med.medication_name}</p>
                          <Badge className={`text-xs ${
                            med.action === 'added' ? 'bg-green-100 text-green-700' :
                            med.action === 'changed' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {med.action.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">{med.details}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(med.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Hospitalizations */}
          {hospitalizations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hospital className="size-4 text-gray-700" />
                <p className="text-xs font-semibold text-gray-700">Recent Hospitalizations ({hospitalizations.length})</p>
              </div>
              <div className="space-y-2">
                {hospitalizations.map((hosp) => (
                  <div key={hosp.id} className="p-2 bg-amber-50 rounded border border-amber-200">
                    <p className="text-sm font-medium text-gray-900">{hosp.facility}</p>
                    <p className="text-xs text-gray-700 mt-1">Reason: {hosp.reason}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Admitted: {new Date(hosp.admission_date).toLocaleDateString()}
                      {hosp.discharge_date && (
                        <> • Discharged: {new Date(hosp.discharge_date).toLocaleDateString()}</>
                      )}
                    </p>
                    {hosp.discharge_summary && (
                      <div className="mt-2 p-2 bg-white rounded">
                        <p className="text-xs font-semibold text-gray-700">Discharge Summary:</p>
                        <p className="text-xs text-gray-700 mt-1">{hosp.discharge_summary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ==================== VISIT TASKS SECTION ====================

interface VisitTasksSectionProps {
  tasks: VisitTask[];
  onToggleTask: (taskId: string) => void;
}

function VisitTasksSection({ tasks, onToggleTask }: VisitTasksSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const observations = tasks.filter(t => t.category === 'observation');
  const interventions = tasks.filter(t => t.category === 'intervention');
  const education = tasks.filter(t => t.category === 'education');
  const assessments = tasks.filter(t => t.category === 'assessment');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const categoryIcons = {
    observation: Eye,
    intervention: Stethoscope,
    education: FileText,
    assessment: CheckSquare,
  };

  const renderTaskGroup = (title: string, taskList: VisitTask[], icon: React.ComponentType<{ className?: string }>) => {
    if (taskList.length === 0) return null;

    const Icon = icon;

    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="size-4 text-gray-700" />
          <p className="text-xs font-semibold text-gray-700">{title} ({taskList.length})</p>
        </div>
        <div className="space-y-2">
          {taskList.map((task) => (
            <div
              key={task.id}
              className={`p-2 rounded border ${
                task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(task.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={`text-sm ${task.completed ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                    {task.description}
                    {task.is_required && (
                      <Badge className="ml-2 bg-red-100 text-red-700 text-xs">Required</Badge>
                    )}
                  </p>
                  {task.notes && (
                    <p className="text-xs text-gray-600 mt-1 italic">{task.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckSquare className="size-5 text-green-600" />
            Visit Tasks
          </CardTitle>
          {expanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
            <span>{completedCount} of {totalCount} completed</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4">
          {renderTaskGroup('Clinical Observations', observations, categoryIcons.observation)}
          {renderTaskGroup('Interventions', interventions, categoryIcons.intervention)}
          {renderTaskGroup('Patient Education', education, categoryIcons.education)}
          {renderTaskGroup('Assessments', assessments, categoryIcons.assessment)}
        </CardContent>
      )}
    </Card>
  );
}

// ==================== MAIN VISIT PREPARATION PANEL ====================

interface VisitPreparationPanelProps {
  visitId: string;
  data?: VisitPreparationData;
  onStartVisit: () => void;
}

export default function VisitPreparationPanel({ 
  visitId, 
  data,
  onStartVisit 
}: VisitPreparationPanelProps) {
  const [tasks, setTasks] = useState<VisitTask[]>(
    data?.visit_tasks || generateMockTasks()
  );

  const prepData = data || generateMockData();

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleCallPatient = () => {
    window.open(`tel:${prepData.patient_summary.contact_phone}`);
  };

  const handleGetDirections = () => {
    const address = encodeURIComponent(prepData.patient_summary.address);
    window.open(`https://maps.google.com/?q=${address}`, '_blank');
  };

  const allTasksComplete = tasks.every(t => t.completed);

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visit Preparation</h1>
            <p className="text-sm text-gray-600">Review before starting visit</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="size-3" />
            Pre-Visit
          </Badge>
        </div>

        {/* Patient Summary */}
        <PatientSummarySection
          summary={prepData.patient_summary}
          onCallPatient={handleCallPatient}
          onGetDirections={handleGetDirections}
        />

        {/* Care Plan Snapshot */}
        <CarePlanSnapshotSection
          goals={prepData.care_plan.goals}
          interventions={prepData.care_plan.interventions}
          special_instructions={prepData.care_plan.special_instructions}
        />

        {/* Recent Clinical Activity */}
        <RecentClinicalActivitySection
          visits={prepData.recent_activity.visits}
          orders={prepData.recent_activity.orders}
          medications={prepData.recent_activity.medication_updates}
          hospitalizations={prepData.recent_activity.hospitalizations}
        />

        {/* Visit Tasks */}
        <VisitTasksSection
          tasks={tasks}
          onToggleTask={handleToggleTask}
        />

        {/* Start Visit Button */}
        <Card className={allTasksComplete ? 'border-2 border-green-300 bg-green-50' : ''}>
          <CardContent className="p-4">
            {allTasksComplete ? (
              <div className="text-center">
                <CheckSquare className="size-12 text-green-600 mx-auto mb-3" />
                <p className="font-semibold text-green-900 mb-2">Review Complete!</p>
                <p className="text-sm text-green-800 mb-4">All tasks reviewed. Ready to start visit.</p>
                <Button size="lg" className="w-full gap-2" onClick={onStartVisit}>
                  <Clock className="size-5" />
                  Start Visit
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Info className="size-12 text-blue-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 mb-2">Review In Progress</p>
                <p className="text-sm text-gray-600 mb-4">
                  Review all sections before starting visit
                </p>
                <Button size="lg" variant="outline" className="w-full gap-2" onClick={onStartVisit}>
                  <Clock className="size-5" />
                  Start Visit Anyway
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== MOCK DATA GENERATORS ====================

function generateMockData(): VisitPreparationData {
  return {
    patient_summary: {
      patient_id: 'PAT-001',
      patient_name: 'Mary Johnson',
      age: 72,
      gender: 'Female',
      primary_diagnosis: 'Congestive Heart Failure (CHF)',
      secondary_diagnoses: [
        'Type 2 Diabetes Mellitus',
        'Hypertension',
        'Chronic Kidney Disease Stage 3',
      ],
      care_team: [
        { id: 'CT-001', name: 'Dr. Robert Chen', role: 'Primary Care Physician', phone: '555-0101', is_primary: true },
        { id: 'CT-002', name: 'Dr. Lisa Martinez', role: 'Cardiologist', phone: '555-0102', is_primary: false },
        { id: 'CT-003', name: 'Sarah Williams, RN', role: 'Case Manager', phone: '555-0103', is_primary: false },
      ],
      allergies: [
        { id: 'AL-001', allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' },
        { id: 'AL-002', allergen: 'Sulfa drugs', reaction: 'Rash', severity: 'moderate' },
      ],
      recent_alerts: [
        {
          id: 'ALERT-001',
          type: 'Weight Gain',
          message: 'Patient gained 5 lbs in past 3 days - possible fluid retention',
          severity: 'warning',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'ALERT-002',
          type: 'Medication Compliance',
          message: 'Patient reports missing Lasix doses over weekend',
          severity: 'critical',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      contact_phone: '555-1234',
      address: '1234 Oak Street, Springfield, IL 62701',
      emergency_contact: 'John Johnson (Son)',
      emergency_phone: '555-5678',
    },
    care_plan: {
      goals: [
        {
          id: 'G-001',
          description: 'Patient will maintain weight within 2 lbs of baseline',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'at_risk',
          progress_percent: 60,
        },
        {
          id: 'G-002',
          description: 'Patient will demonstrate proper use of home blood pressure monitor',
          target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'on_track',
          progress_percent: 85,
        },
      ],
      interventions: [
        {
          id: 'INT-001',
          description: 'Monitor vital signs including BP, HR, weight',
          frequency: 'Each visit',
          special_notes: 'Report BP >160/90 or <90/60 to MD immediately',
        },
        {
          id: 'INT-002',
          description: 'Assess for signs of fluid overload (edema, SOB, weight gain)',
          frequency: 'Each visit',
        },
        {
          id: 'INT-003',
          description: 'Review medication compliance and effectiveness',
          frequency: 'Each visit',
          special_notes: 'Patient has difficulty remembering evening meds',
        },
      ],
      special_instructions: [
        {
          id: 'SI-001',
          category: 'Safety',
          instruction: 'Patient has aggressive dog - call before entering home',
          is_critical: true,
        },
        {
          id: 'SI-002',
          category: 'Communication',
          instruction: 'Patient is hard of hearing - speak clearly and face patient',
          is_critical: false,
        },
      ],
    },
    recent_activity: {
      visits: [
        {
          id: 'V-001',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          discipline: 'RN',
          clinician: 'Sarah Chen',
          service_type: 'Skilled Nursing Visit',
          key_findings: [
            'BP 148/86, HR 82, Weight 168 lbs (↑3 lbs from prior visit)',
            'Trace pedal edema bilaterally',
            'Patient reports increased SOB with exertion',
            'Medication review completed',
          ],
        },
      ],
      orders: [
        {
          id: 'ORD-001',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'Medication Change',
          description: 'Increase Lasix from 20mg to 40mg PO daily',
          ordered_by: 'Dr. Robert Chen',
          status: 'active',
        },
      ],
      medication_updates: [
        {
          id: 'MED-001',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          action: 'changed',
          medication_name: 'Lasix (Furosemide)',
          details: 'Increased from 20mg to 40mg PO daily due to fluid retention',
        },
      ],
      hospitalizations: [
        {
          id: 'HOSP-001',
          admission_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          discharge_date: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
          facility: 'Springfield Memorial Hospital',
          reason: 'Acute CHF exacerbation',
          discharge_summary: 'Patient responded well to IV diuresis. Discharged on increased Lasix dose. Follow-up with cardiologist in 2 weeks.',
        },
      ],
    },
    visit_tasks: generateMockTasks(),
  };
}

function generateMockTasks(): VisitTask[] {
  return [
    {
      id: 'TASK-001',
      category: 'observation',
      description: 'Assess vital signs (BP, HR, RR, Temp, O2 sat)',
      is_required: true,
      completed: false,
    },
    {
      id: 'TASK-002',
      category: 'observation',
      description: 'Check daily weight',
      is_required: true,
      completed: false,
      notes: 'Compare to baseline - report gain >2 lbs',
    },
    {
      id: 'TASK-003',
      category: 'observation',
      description: 'Assess for edema (ankles, legs, sacrum)',
      is_required: true,
      completed: false,
    },
    {
      id: 'TASK-004',
      category: 'observation',
      description: 'Auscultate lung sounds',
      is_required: true,
      completed: false,
      notes: 'Listen for crackles indicating fluid',
    },
    {
      id: 'TASK-005',
      category: 'intervention',
      description: 'Review medication compliance',
      is_required: true,
      completed: false,
      notes: 'Check pill counts if concerned',
    },
    {
      id: 'TASK-006',
      category: 'intervention',
      description: 'Verify patient taking new Lasix dose (40mg)',
      is_required: true,
      completed: false,
    },
    {
      id: 'TASK-007',
      category: 'education',
      description: 'Educate on signs of worsening CHF',
      is_required: false,
      completed: false,
      notes: 'Weight gain, increased SOB, swelling',
    },
    {
      id: 'TASK-008',
      category: 'education',
      description: 'Review low-sodium diet',
      is_required: false,
      completed: false,
    },
    {
      id: 'TASK-009',
      category: 'assessment',
      description: 'Complete OASIS assessment items',
      is_required: true,
      completed: false,
    },
  ];
}
