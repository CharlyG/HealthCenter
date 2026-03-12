/**
 * Enhanced Visit Preparation Panel
 * 
 * Comprehensive pre-visit briefing interface integrating data from all clinical modules:
 * - Patient Summary
 * - Medication Snapshot (with recent changes)
 * - Care Plan Goals (discipline-relevant)
 * - Outstanding Clinical Alerts
 * - Recent Wound Updates
 * - Frequency Compliance Warnings
 * - Visit Tasks Checklist
 * 
 * Helps clinicians walk into the visit fully prepared with all critical information.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  User,
  Heart,
  AlertTriangle,
  Pill,
  Target,
  Activity,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Info,
  Phone,
  Navigation,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  ArrowRight,
  Eye,
  Droplet,
  Ruler,
  Users,
  XCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

// Import services for data
import { getMockClinicalAlerts, ALERT_SEVERITY_CONFIG, ALERT_CATEGORY_CONFIG } from '../services/clinicalAlerts';
import type { ClinicalAlert } from '../services/clinicalAlerts';
import { getMockWounds, WOUND_STATUS_CONFIG, getMostRecentAssessment } from '../services/woundCareTracking';
import type { Wound } from '../services/woundCareTracking';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface EnhancedVisitPreparationPanelProps {
  visitId: string;
  patientId: string;
  admissionId: string;
  discipline: 'SN' | 'PT' | 'OT' | 'ST' | 'MSW' | 'HHA';
  onStartVisit?: () => void;
}

interface PatientSummary {
  name: string;
  age: number;
  gender: string;
  mrn: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  allergies: Allergy[];
  contactPhone: string;
  address: string;
}

interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface MedicationSummary {
  id: string;
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  isNew?: boolean;
  isChanged?: boolean;
  isDiscontinued?: boolean;
  changeDate?: string;
  changeReason?: string;
}

interface CarePlanGoal {
  id: string;
  problemStatement: string;
  goalStatement: string;
  disciplines: string[];
  status: 'active' | 'achieved' | 'discontinued';
  progress: number;
  interventions: string[];
}

interface FrequencyWarning {
  discipline: string;
  ordered: number;
  scheduled: number;
  completed: number;
  missed: number;
  status: 'on-track' | 'ahead' | 'behind' | 'critical';
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function EnhancedVisitPreparationPanel({
  visitId,
  patientId,
  admissionId,
  discipline,
  onStartVisit,
}: EnhancedVisitPreparationPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    patient: true,
    medications: true,
    carePlan: true,
    alerts: true,
    wounds: true,
    frequency: true,
    tasks: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Load data
  const patientData = getMockPatientData();
  const medications = getMockMedications();
  const recentChanges = medications.filter(m => m.isNew || m.isChanged || m.isDiscontinued);
  const activeAlerts = getMockClinicalAlerts(admissionId).filter(a => a.status === 'active');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');
  const wounds = getMockWounds(admissionId).filter(w => w.isActive);
  const carePlanGoals = getMockCarePlanGoals(discipline);
  const frequencyWarning = getMockFrequencyWarning(discipline);
  const [tasks, setTasks] = useState(getMockVisitTasks(discipline));

  const hasAnyAlerts = criticalAlerts.length > 0 || recentChanges.length > 0 || wounds.length > 0 || frequencyWarning.status === 'behind' || frequencyWarning.status === 'critical';

  return (
    <div className="space-y-4 pb-6">
      {/* Critical Alerts Banner */}
      {hasAnyAlerts && (
        <Card className="border-2 border-amber-500 bg-amber-50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-2">Action Required Before Visit</h3>
                <div className="space-y-1 text-sm text-amber-800">
                  {criticalAlerts.length > 0 && (
                    <p>• {criticalAlerts.length} critical/high priority alert{criticalAlerts.length !== 1 ? 's' : ''}</p>
                  )}
                  {recentChanges.length > 0 && (
                    <p>• {recentChanges.length} recent medication change{recentChanges.length !== 1 ? 's' : ''}</p>
                  )}
                  {wounds.length > 0 && (
                    <p>• {wounds.length} active wound{wounds.length !== 1 ? 's' : ''} to assess</p>
                  )}
                  {(frequencyWarning.status === 'behind' || frequencyWarning.status === 'critical') && (
                    <p>• Visit frequency is behind schedule</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Patient Summary */}
      <CollapsibleSection
        title="Patient Summary"
        icon={<User className="w-5 h-5" />}
        expanded={expandedSections.patient}
        onToggle={() => toggleSection('patient')}
        highlight
      >
        <PatientSummaryContent patient={patientData} />
      </CollapsibleSection>

      {/* Medication Snapshot */}
      <CollapsibleSection
        title="Medication Snapshot"
        icon={<Pill className="w-5 h-5" />}
        expanded={expandedSections.medications}
        onToggle={() => toggleSection('medications')}
        badge={recentChanges.length > 0 ? { text: `${recentChanges.length} changes`, variant: 'warning' } : undefined}
      >
        <MedicationSnapshotContent medications={medications} recentChanges={recentChanges} />
      </CollapsibleSection>

      {/* Care Plan Goals */}
      <CollapsibleSection
        title={`Care Plan Goals (${discipline})`}
        icon={<Target className="w-5 h-5" />}
        expanded={expandedSections.carePlan}
        onToggle={() => toggleSection('carePlan')}
      >
        <CarePlanGoalsContent goals={carePlanGoals} discipline={discipline} />
      </CollapsibleSection>

      {/* Outstanding Clinical Alerts */}
      {criticalAlerts.length > 0 && (
        <CollapsibleSection
          title="Outstanding Clinical Alerts"
          icon={<AlertCircle className="w-5 h-5" />}
          expanded={expandedSections.alerts}
          onToggle={() => toggleSection('alerts')}
          badge={{ text: `${criticalAlerts.length}`, variant: 'critical' }}
        >
          <ClinicalAlertsContent alerts={criticalAlerts} />
        </CollapsibleSection>
      )}

      {/* Recent Wound Updates */}
      {wounds.length > 0 && (
        <CollapsibleSection
          title="Recent Wound Updates"
          icon={<Activity className="w-5 h-5" />}
          expanded={expandedSections.wounds}
          onToggle={() => toggleSection('wounds')}
          badge={{ text: `${wounds.length} active`, variant: 'default' }}
        >
          <WoundUpdatesContent wounds={wounds} />
        </CollapsibleSection>
      )}

      {/* Frequency Compliance */}
      {frequencyWarning && (
        <CollapsibleSection
          title="Frequency Compliance"
          icon={<Calendar className="w-5 h-5" />}
          expanded={expandedSections.frequency}
          onToggle={() => toggleSection('frequency')}
          badge={
            frequencyWarning.status === 'behind' || frequencyWarning.status === 'critical'
              ? { text: frequencyWarning.status, variant: 'warning' }
              : undefined
          }
        >
          <FrequencyComplianceContent warning={frequencyWarning} />
        </CollapsibleSection>
      )}

      {/* Visit Tasks */}
      <CollapsibleSection
        title="Visit Tasks Checklist"
        icon={<FileText className="w-5 h-5" />}
        expanded={expandedSections.tasks}
        onToggle={() => toggleSection('tasks')}
        badge={{
          text: `${tasks.filter(t => t.completed).length}/${tasks.length}`,
          variant: 'default',
        }}
      >
        <VisitTasksContent tasks={tasks} onToggleTask={(id) => {
          setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        }} />
      </CollapsibleSection>

      {/* Start Visit Button */}
      <div className="sticky bottom-0 bg-white border-t pt-4">
        <Button
          className="w-full h-14 text-lg"
          onClick={onStartVisit}
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          Start Visit
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLAPSIBLE SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  highlight?: boolean;
  badge?: {
    text: string;
    variant: 'default' | 'warning' | 'critical';
  };
}

function CollapsibleSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
  highlight,
  badge,
}: CollapsibleSectionProps) {
  return (
    <Card className={cn(
      'overflow-hidden',
      highlight && 'border-2 border-blue-300 bg-blue-50'
    )}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            highlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          )}>
            {icon}
          </div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {badge && (
            <Badge
              className={cn(
                'text-xs',
                badge.variant === 'critical' && 'bg-red-500 text-white',
                badge.variant === 'warning' && 'bg-amber-500 text-white',
                badge.variant === 'default' && 'bg-gray-500 text-white'
              )}
            >
              {badge.text}
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PATIENT SUMMARY CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function PatientSummaryContent({ patient }: { patient: PatientSummary }) {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div>
        <h4 className="text-xl font-bold text-gray-900 mb-1">{patient.name}</h4>
        <p className="text-sm text-gray-700">
          {patient.age} yrs • {patient.gender} • MRN: {patient.mrn}
        </p>
      </div>

      {/* Primary Diagnosis */}
      <div className="p-3 bg-white rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Primary Diagnosis</p>
            <p className="text-sm font-medium text-gray-900">{patient.primaryDiagnosis}</p>
            {patient.secondaryDiagnoses.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600">Secondary:</p>
                <ul className="mt-1 space-y-0.5">
                  {patient.secondaryDiagnoses.map((dx, i) => (
                    <li key={i} className="text-xs text-gray-700">• {dx}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Allergies */}
      {patient.allergies.length > 0 && (
        <div className="p-3 bg-red-50 rounded-lg border-2 border-red-300">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-red-900">ALLERGIES</p>
          </div>
          <div className="space-y-2">
            {patient.allergies.map((allergy, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-900">{allergy.allergen}</p>
                  <p className="text-xs text-red-800">{allergy.reaction}</p>
                </div>
                <Badge
                  className={cn(
                    'text-xs text-white',
                    allergy.severity === 'severe' && 'bg-red-600',
                    allergy.severity === 'moderate' && 'bg-orange-600',
                    allergy.severity === 'mild' && 'bg-amber-600'
                  )}
                >
                  {allergy.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Phone className="w-4 h-4 mr-2" />
          Call Patient
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Navigation className="w-4 h-4 mr-2" />
          Directions
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION SNAPSHOT CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function MedicationSnapshotContent({
  medications,
  recentChanges,
}: {
  medications: MedicationSummary[];
  recentChanges: MedicationSummary[];
}) {
  return (
    <div className="space-y-4">
      {/* Recent Changes */}
      {recentChanges.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-900">Recent Medication Changes</h4>
          </div>
          <div className="space-y-2">
            {recentChanges.map(med => (
              <div key={med.id} className="p-2 bg-white rounded border border-amber-200">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{med.name}</p>
                  <Badge
                    className={cn(
                      'text-xs',
                      med.isNew && 'bg-green-500 text-white',
                      med.isChanged && 'bg-blue-500 text-white',
                      med.isDiscontinued && 'bg-red-500 text-white'
                    )}
                  >
                    {med.isNew ? 'NEW' : med.isChanged ? 'CHANGED' : 'D/C'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-700">{med.dosage} {med.route} {med.frequency}</p>
                {med.changeReason && (
                  <p className="text-xs text-gray-600 mt-1 italic">{med.changeReason}</p>
                )}
                {med.changeDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(med.changeDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Medications */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Active Medications ({medications.filter(m => !m.isDiscontinued).length})
        </h4>
        <div className="space-y-2">
          {medications
            .filter(m => !m.isDiscontinued)
            .slice(0, 5)
            .map(med => (
              <div key={med.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-medium text-gray-900">{med.name}</p>
                <p className="text-xs text-gray-700">{med.dosage} {med.route} {med.frequency}</p>
              </div>
            ))}
        </div>
        {medications.filter(m => !m.isDiscontinued).length > 5 && (
          <Button variant="ghost" size="sm" className="w-full mt-2">
            <Eye className="w-4 h-4 mr-2" />
            View All ({medications.filter(m => !m.isDiscontinued).length} total)
          </Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CARE PLAN GOALS CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function CarePlanGoalsContent({
  goals,
  discipline,
}: {
  goals: CarePlanGoal[];
  discipline: string;
}) {
  return (
    <div className="space-y-3">
      {goals.length === 0 ? (
        <div className="text-center py-6 text-gray-600">
          <Target className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No active goals for {discipline}</p>
        </div>
      ) : (
        goals.map(goal => (
          <div key={goal.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">{goal.problemStatement}</p>
                <p className="text-sm font-medium text-gray-900">{goal.goalStatement}</p>
              </div>
              <Badge
                className={cn(
                  'text-xs',
                  goal.status === 'active' && 'bg-blue-500 text-white',
                  goal.status === 'achieved' && 'bg-green-500 text-white',
                  goal.status === 'discontinued' && 'bg-gray-500 text-white'
                )}
              >
                {goal.status}
              </Badge>
            </div>
            
            {/* Progress Bar */}
            {goal.status === 'active' && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium text-gray-900">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all',
                      goal.progress >= 75 && 'bg-green-500',
                      goal.progress >= 50 && goal.progress < 75 && 'bg-blue-500',
                      goal.progress >= 25 && goal.progress < 50 && 'bg-amber-500',
                      goal.progress < 25 && 'bg-red-500'
                    )}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Interventions */}
            {goal.interventions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Key Interventions:</p>
                <ul className="space-y-0.5">
                  {goal.interventions.slice(0, 2).map((intervention, i) => (
                    <li key={i} className="text-xs text-gray-700">• {intervention}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLINICAL ALERTS CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function ClinicalAlertsContent({ alerts }: { alerts: ClinicalAlert[] }) {
  return (
    <div className="space-y-2">
      {alerts.map(alert => {
        const severityConfig = ALERT_SEVERITY_CONFIG[alert.severity];
        const categoryConfig = ALERT_CATEGORY_CONFIG[alert.category];
        
        return (
          <div
            key={alert.id}
            className={cn(
              'p-3 rounded-lg border-l-4',
              alert.severity === 'critical' && 'border-l-red-500 bg-red-50',
              alert.severity === 'high' && 'border-l-amber-500 bg-amber-50'
            )}
          >
            <div className="flex items-start gap-2 mb-1">
              <AlertCircle className={cn(
                'w-4 h-4 flex-shrink-0 mt-0.5',
                alert.severity === 'critical' && 'text-red-600',
                alert.severity === 'high' && 'text-amber-600'
              )} />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{alert.title}</p>
                <p className="text-xs text-gray-700 mt-1">{alert.description}</p>
                {alert.suggestedAction && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                    <p className="text-xs font-medium text-blue-900">Action:</p>
                    <p className="text-xs text-blue-800">{alert.suggestedAction}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WOUND UPDATES CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function WoundUpdatesContent({ wounds }: { wounds: Wound[] }) {
  return (
    <div className="space-y-3">
      {wounds.map(wound => {
        const recentAssessment = getMostRecentAssessment(wound);
        const statusConfig = WOUND_STATUS_CONFIG[wound.currentStatus];
        
        return (
          <div key={wound.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {wound.location.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </p>
                <p className="text-xs text-gray-600">{wound.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
              </div>
              <Badge
                style={{
                  backgroundColor: statusConfig.color,
                  color: 'white',
                }}
                className="text-xs"
              >
                {statusConfig.label}
              </Badge>
            </div>

            {recentAssessment && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Size: </span>
                  <span className="font-medium text-gray-900">
                    {recentAssessment.area ? `${recentAssessment.area} cm²` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Drainage: </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {recentAssessment.drainageAmount || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Last: </span>
                  <span className="font-medium text-gray-900">
                    {new Date(recentAssessment.assessmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            )}

            {recentAssessment?.percentChange !== undefined && recentAssessment.percentChange !== 0 && (
              <div className={cn(
                'mt-2 flex items-center gap-1 text-xs font-medium',
                recentAssessment.percentChange < 0 ? 'text-green-700' : 'text-red-700'
              )}>
                {recentAssessment.percentChange < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <TrendingUp className="w-3 h-3" />
                )}
                {recentAssessment.percentChange > 0 ? '+' : ''}{recentAssessment.percentChange}% from previous
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FREQUENCY COMPLIANCE CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function FrequencyComplianceContent({ warning }: { warning: FrequencyWarning }) {
  const statusColors = {
    'on-track': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900' },
    'ahead': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' },
    'behind': { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900' },
    'critical': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900' },
  };

  const colors = statusColors[warning.status];

  return (
    <div className={cn('p-3 rounded-lg border', colors.bg, colors.border)}>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className={cn('w-5 h-5', colors.text)} />
        <h4 className={cn('font-semibold', colors.text)}>{warning.discipline}</h4>
        <Badge
          className={cn(
            'text-xs ml-auto',
            warning.status === 'critical' && 'bg-red-500 text-white',
            warning.status === 'behind' && 'bg-amber-500 text-white',
            warning.status === 'ahead' && 'bg-blue-500 text-white',
            warning.status === 'on-track' && 'bg-green-500 text-white'
          )}
        >
          {warning.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
        <div className="text-center p-2 bg-white rounded">
          <p className="text-xs text-gray-600">Ordered</p>
          <p className="font-bold text-gray-900">{warning.ordered}</p>
        </div>
        <div className="text-center p-2 bg-white rounded">
          <p className="text-xs text-gray-600">Scheduled</p>
          <p className="font-bold text-gray-900">{warning.scheduled}</p>
        </div>
        <div className="text-center p-2 bg-white rounded">
          <p className="text-xs text-green-600">Completed</p>
          <p className="font-bold text-green-900">{warning.completed}</p>
        </div>
        <div className="text-center p-2 bg-white rounded">
          <p className="text-xs text-red-600">Missed</p>
          <p className="font-bold text-red-900">{warning.missed}</p>
        </div>
      </div>

      <p className={cn('text-sm font-medium', colors.text)}>{warning.message}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VISIT TASKS CONTENT
// ═══════════════════════════════════════════════════════════════════════════

interface VisitTask {
  id: string;
  category: 'observation' | 'intervention' | 'education' | 'assessment';
  description: string;
  isRequired: boolean;
  completed: boolean;
}

function VisitTasksContent({
  tasks,
  onToggleTask,
}: {
  tasks: VisitTask[];
  onToggleTask: (id: string) => void;
}) {
  const categoryIcons = {
    observation: Eye,
    intervention: Activity,
    education: FileText,
    assessment: CheckCircle2,
  };

  return (
    <div className="space-y-2">
      {tasks.map(task => {
        const Icon = categoryIcons[task.category];
        
        return (
          <div
            key={task.id}
            className={cn(
              'p-3 rounded-lg border transition-all',
              task.completed ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleTask(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <p className={cn(
                    'text-sm font-medium',
                    task.completed ? 'line-through text-gray-600' : 'text-gray-900'
                  )}>
                    {task.description}
                  </p>
                  {task.isRequired && !task.completed && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 capitalize">{task.category}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getMockPatientData(): PatientSummary {
  return {
    name: 'Margaret Johnson',
    age: 78,
    gender: 'Female',
    mrn: 'MRN-334455',
    primaryDiagnosis: 'Congestive Heart Failure (CHF)',
    secondaryDiagnoses: [
      'Type 2 Diabetes Mellitus',
      'Hypertension',
      'Chronic Kidney Disease Stage 3',
    ],
    allergies: [
      {
        allergen: 'Penicillin',
        reaction: 'Anaphylaxis',
        severity: 'severe',
      },
      {
        allergen: 'Sulfa drugs',
        reaction: 'Rash',
        severity: 'moderate',
      },
    ],
    contactPhone: '(555) 123-4567',
    address: '123 Main St, Springfield, IL 62701',
  };
}

function getMockMedications(): MedicationSummary[] {
  return [
    {
      id: 'med-1',
      name: 'Lisinopril',
      dosage: '20mg',
      route: 'PO',
      frequency: 'Daily',
      isNew: true,
      changeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      changeReason: 'Increased from 10mg for better BP control',
    },
    {
      id: 'med-2',
      name: 'Metformin',
      dosage: '1000mg',
      route: 'PO',
      frequency: 'BID',
    },
    {
      id: 'med-3',
      name: 'Furosemide',
      dosage: '40mg',
      route: 'PO',
      frequency: 'Daily',
    },
    {
      id: 'med-4',
      name: 'Atorvastatin',
      dosage: '40mg',
      route: 'PO',
      frequency: 'Nightly',
    },
    {
      id: 'med-5',
      name: 'Aspirin',
      dosage: '81mg',
      route: 'PO',
      frequency: 'Daily',
      isDiscontinued: true,
      changeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      changeReason: 'Replaced with Warfarin per physician order',
    },
    {
      id: 'med-6',
      name: 'Warfarin',
      dosage: '5mg',
      route: 'PO',
      frequency: 'Daily',
      isNew: true,
      changeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      changeReason: 'Started for AF prophylaxis',
    },
  ];
}

function getMockCarePlanGoals(discipline: string): CarePlanGoal[] {
  const allGoals: CarePlanGoal[] = [
    {
      id: 'goal-1',
      problemStatement: 'Impaired physical mobility related to deconditioning',
      goalStatement: 'Patient will ambulate 50 feet with walker independently',
      disciplines: ['PT', 'SN'],
      status: 'active',
      progress: 65,
      interventions: [
        'Gait training with walker 3x/week',
        'Progressive strengthening exercises',
        'Safety education for fall prevention',
      ],
    },
    {
      id: 'goal-2',
      problemStatement: 'Knowledge deficit regarding CHF management',
      goalStatement: 'Patient will verbalize understanding of daily weights and fluid restriction',
      disciplines: ['SN'],
      status: 'active',
      progress: 80,
      interventions: [
        'Daily weight monitoring education',
        'Fluid restriction teaching (1500mL/day)',
        'S/S of exacerbation education',
      ],
    },
    {
      id: 'goal-3',
      problemStatement: 'Risk for falls related to deconditioning and polypharmacy',
      goalStatement: 'Patient will implement fall prevention strategies in home',
      disciplines: ['PT', 'OT', 'SN'],
      status: 'active',
      progress: 45,
      interventions: [
        'Home safety assessment',
        'Balance and coordination exercises',
        'Medication review for fall risk',
      ],
    },
  ];

  return allGoals.filter(g => g.disciplines.includes(discipline));
}

function getMockFrequencyWarning(discipline: string): FrequencyWarning {
  const warnings: Record<string, FrequencyWarning> = {
    SN: {
      discipline: 'Skilled Nursing',
      ordered: 12,
      scheduled: 10,
      completed: 7,
      missed: 2,
      status: 'behind',
      message: 'Behind schedule by 3 visits. Schedule additional visits this week.',
    },
    PT: {
      discipline: 'Physical Therapy',
      ordered: 18,
      scheduled: 18,
      completed: 12,
      missed: 1,
      status: 'on-track',
      message: 'On track with ordered frequency. Continue current schedule.',
    },
    OT: {
      discipline: 'Occupational Therapy',
      ordered: 6,
      scheduled: 6,
      completed: 4,
      missed: 0,
      status: 'on-track',
      message: 'On track. 2 visits remaining this certification period.',
    },
  };

  return warnings[discipline] || warnings.SN;
}

function getMockVisitTasks(discipline: string): VisitTask[] {
  const commonTasks: VisitTask[] = [
    {
      id: 'task-1',
      category: 'observation',
      description: 'Obtain and record vital signs',
      isRequired: true,
      completed: false,
    },
    {
      id: 'task-2',
      category: 'assessment',
      description: 'Assess pain level (0-10 scale)',
      isRequired: true,
      completed: false,
    },
    {
      id: 'task-3',
      category: 'observation',
      description: 'Inspect wounds and document status',
      isRequired: true,
      completed: false,
    },
  ];

  const disciplineTasks: Record<string, VisitTask[]> = {
    SN: [
      {
        id: 'task-sn-1',
        category: 'intervention',
        description: 'Administer insulin per sliding scale',
        isRequired: true,
        completed: false,
      },
      {
        id: 'task-sn-2',
        category: 'education',
        description: 'Educate on CHF symptoms and daily weights',
        isRequired: true,
        completed: false,
      },
      {
        id: 'task-sn-3',
        category: 'observation',
        description: 'Assess for edema and respiratory status',
        isRequired: true,
        completed: false,
      },
    ],
    PT: [
      {
        id: 'task-pt-1',
        category: 'assessment',
        description: 'Assess gait pattern and balance',
        isRequired: true,
        completed: false,
      },
      {
        id: 'task-pt-2',
        category: 'intervention',
        description: 'Perform strengthening exercises',
        isRequired: true,
        completed: false,
      },
      {
        id: 'task-pt-3',
        category: 'education',
        description: 'Teach home exercise program',
        isRequired: false,
        completed: false,
      },
    ],
  };

  return [...commonTasks, ...(disciplineTasks[discipline] || [])];
}
