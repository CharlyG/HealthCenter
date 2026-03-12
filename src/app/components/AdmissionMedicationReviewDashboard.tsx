/**
 * Admission Medication Review Dashboard Component
 * 
 * Centralized dashboard for medication management during active admission.
 * 
 * SUMMARY METRICS:
 * - Total active medications
 * - Medications not reconciled
 * - Recent medication changes
 * - Critical medication alerts
 * - Medication teaching needed
 * 
 * QUICK ACTIONS:
 * - Start reconciliation
 * - Review alerts
 * - Document medication teaching
 * - Open medication profile
 * 
 * FEATURES:
 * - Real-time status tracking
 * - Risk indicators
 * - Priority alerts
 * - Teaching tracker
 * - Quick navigation
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Pill,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  BookOpen,
  ExternalLink,
  Plus,
  Edit,
  Eye,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Activity,
  Calendar,
  User,
  ChevronRight,
  XCircle,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MedicationReviewDashboardData {
  admissionId: string;
  patientName: string;
  admissionDate: string;
  
  // Summary metrics
  totalActiveMedications: number;
  medicationsNotReconciled: number;
  recentChanges: number;
  criticalAlerts: number;
  teachingNeeded: number;
  highRiskMedications: number;
  
  // Reconciliation status
  reconciliationStatus: 'not-started' | 'in-progress' | 'completed';
  lastReconciliationDate?: string;
  lastReconciliationBy?: string;
  
  // Lists
  unreconciledMedications: UnreconciledMedication[];
  criticalAlertsList: CriticalAlert[];
  recentChangesList: RecentChange[];
  teachingNeededList: TeachingNeeded[];
  
  // Flags
  hasHighRiskMeds: boolean;
  hasPolypharmacy: boolean;
  hasDuplicateTherapy: boolean;
}

export interface UnreconciledMedication {
  id: string;
  name: string;
  source: 'patient-reported' | 'hospital-discharge' | 'pharmacy' | 'other';
  status: 'pending' | 'discrepancy' | 'verified';
  addedDate: string;
}

export interface CriticalAlert {
  id: string;
  type: 'drug-interaction' | 'allergy-conflict' | 'duplicate-therapy' | 'high-risk' | 'monitoring-required';
  severity: 'critical' | 'high';
  medicationName: string;
  message: string;
  createdDate: string;
}

export interface RecentChange {
  id: string;
  medicationName: string;
  changeType: 'added' | 'discontinued' | 'dose-changed' | 'frequency-changed';
  date: string;
  changedBy: string;
}

export interface TeachingNeeded {
  id: string;
  medicationName: string;
  reason: 'new-medication' | 'high-risk' | 'complex-regimen' | 'patient-request';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AdmissionMedicationReviewDashboardProps {
  data: MedicationReviewDashboardData;
  onStartReconciliation: () => void;
  onReviewAlerts: () => void;
  onDocumentTeaching: (medicationId: string) => void;
  onOpenMedicationProfile: () => void;
  onViewMedicationHistory: (medicationId: string) => void;
  compact?: boolean;
}

export default function AdmissionMedicationReviewDashboard({
  data,
  onStartReconciliation,
  onReviewAlerts,
  onDocumentTeaching,
  onOpenMedicationProfile,
  onViewMedicationHistory,
  compact = false,
}: AdmissionMedicationReviewDashboardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('alerts');

  const hasIssues = 
    data.medicationsNotReconciled > 0 ||
    data.criticalAlerts > 0 ||
    data.teachingNeeded > 0;

  const reconciliationProgress = data.totalActiveMedications > 0
    ? Math.round(((data.totalActiveMedications - data.medicationsNotReconciled) / data.totalActiveMedications) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      {!compact && (
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Pill className="w-7 h-7 text-blue-600" />
              Medication Review Dashboard
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {data.patientName} • Admitted {new Date(data.admissionDate).toLocaleDateString()}
            </p>
          </div>

          {hasIssues && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Action Required
            </Badge>
          )}
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          icon={Pill}
          label="Active Meds"
          value={data.totalActiveMedications}
          color="blue"
          onClick={onOpenMedicationProfile}
        />
        <MetricCard
          icon={ClipboardCheck}
          label="Not Reconciled"
          value={data.medicationsNotReconciled}
          color={data.medicationsNotReconciled > 0 ? 'amber' : 'green'}
          alert={data.medicationsNotReconciled > 0}
          onClick={onStartReconciliation}
        />
        <MetricCard
          icon={TrendingUp}
          label="Recent Changes"
          value={data.recentChanges}
          color="purple"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Critical Alerts"
          value={data.criticalAlerts}
          color={data.criticalAlerts > 0 ? 'red' : 'green'}
          alert={data.criticalAlerts > 0}
          onClick={data.criticalAlerts > 0 ? onReviewAlerts : undefined}
        />
        <MetricCard
          icon={BookOpen}
          label="Teaching Needed"
          value={data.teachingNeeded}
          color={data.teachingNeeded > 0 ? 'orange' : 'green'}
          onClick={data.teachingNeeded > 0 ? () => setExpandedSection('teaching') : undefined}
        />
        <MetricCard
          icon={ShieldAlert}
          label="High Risk"
          value={data.highRiskMedications}
          color={data.highRiskMedications > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Reconciliation Status Banner */}
      {data.reconciliationStatus !== 'completed' && (
        <Card className={cn(
          'p-4',
          data.reconciliationStatus === 'not-started' && 'bg-amber-50 border-amber-200',
          data.reconciliationStatus === 'in-progress' && 'bg-blue-50 border-blue-200'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                data.reconciliationStatus === 'not-started' && 'bg-amber-100',
                data.reconciliationStatus === 'in-progress' && 'bg-blue-100'
              )}>
                <ClipboardCheck className={cn(
                  'w-5 h-5',
                  data.reconciliationStatus === 'not-started' && 'text-amber-600',
                  data.reconciliationStatus === 'in-progress' && 'text-blue-600'
                )} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {data.reconciliationStatus === 'not-started' && 'Medication Reconciliation Required'}
                  {data.reconciliationStatus === 'in-progress' && 'Medication Reconciliation In Progress'}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {data.reconciliationStatus === 'not-started' && 'Complete reconciliation within 24 hours of admission'}
                  {data.reconciliationStatus === 'in-progress' && `${reconciliationProgress}% complete • ${data.medicationsNotReconciled} medications remaining`}
                </p>
              </div>
            </div>
            <Button onClick={onStartReconciliation}>
              {data.reconciliationStatus === 'not-started' ? 'Start Reconciliation' : 'Continue Reconciliation'}
            </Button>
          </div>
          {data.reconciliationStatus === 'in-progress' && (
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${reconciliationProgress}%` }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Reconciliation Complete Banner */}
      {data.reconciliationStatus === 'completed' && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Medication Reconciliation Completed</h3>
                <p className="text-sm text-green-700 mt-0.5">
                  Completed {data.lastReconciliationDate ? new Date(data.lastReconciliationDate).toLocaleDateString() : ''} by {data.lastReconciliationBy}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onStartReconciliation}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Update
            </Button>
          </div>
        </Card>
      )}

      {/* Warning Flags */}
      {(data.hasPolypharmacy || data.hasDuplicateTherapy) && (
        <div className="flex gap-3">
          {data.hasPolypharmacy && (
            <Card className="flex-1 p-3 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Polypharmacy: {data.totalActiveMedications} active medications
                </span>
              </div>
            </Card>
          )}
          {data.hasDuplicateTherapy && (
            <Card className="flex-1 p-3 bg-red-50 border-red-200">
              <div className="flex items-center gap-2 text-red-900">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Duplicate therapy detected</span>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionButton
            icon={ClipboardCheck}
            label="Start Reconciliation"
            onClick={onStartReconciliation}
            color="blue"
            badge={data.medicationsNotReconciled > 0 ? data.medicationsNotReconciled : undefined}
          />
          <QuickActionButton
            icon={AlertTriangle}
            label="Review Alerts"
            onClick={onReviewAlerts}
            color="red"
            badge={data.criticalAlerts > 0 ? data.criticalAlerts : undefined}
          />
          <QuickActionButton
            icon={BookOpen}
            label="Document Teaching"
            onClick={() => setExpandedSection('teaching')}
            color="green"
            badge={data.teachingNeeded > 0 ? data.teachingNeeded : undefined}
          />
          <QuickActionButton
            icon={Pill}
            label="Medication Profile"
            onClick={onOpenMedicationProfile}
            color="purple"
          />
        </div>
      </Card>

      {/* Expandable Sections */}
      <div className="space-y-4">
        {/* Critical Alerts */}
        {data.criticalAlertsList.length > 0 && (
          <ExpandableSection
            title="Critical Medication Alerts"
            count={data.criticalAlertsList.length}
            icon={AlertTriangle}
            color="red"
            expanded={expandedSection === 'alerts'}
            onToggle={() => setExpandedSection(expandedSection === 'alerts' ? null : 'alerts')}
          >
            <div className="space-y-2">
              {data.criticalAlertsList.map(alert => (
                <CriticalAlertCard
                  key={alert.id}
                  alert={alert}
                  onReview={() => onReviewAlerts()}
                />
              ))}
            </div>
          </ExpandableSection>
        )}

        {/* Unreconciled Medications */}
        {data.unreconciledMedications.length > 0 && (
          <ExpandableSection
            title="Medications Pending Reconciliation"
            count={data.unreconciledMedications.length}
            icon={ClipboardCheck}
            color="amber"
            expanded={expandedSection === 'unreconciled'}
            onToggle={() => setExpandedSection(expandedSection === 'unreconciled' ? null : 'unreconciled')}
          >
            <div className="space-y-2">
              {data.unreconciledMedications.map(med => (
                <UnreconciledMedicationCard
                  key={med.id}
                  medication={med}
                  onReconcile={() => onStartReconciliation()}
                />
              ))}
            </div>
          </ExpandableSection>
        )}

        {/* Recent Changes */}
        {data.recentChangesList.length > 0 && (
          <ExpandableSection
            title="Recent Medication Changes"
            count={data.recentChangesList.length}
            icon={TrendingUp}
            color="purple"
            expanded={expandedSection === 'changes'}
            onToggle={() => setExpandedSection(expandedSection === 'changes' ? null : 'changes')}
          >
            <div className="space-y-2">
              {data.recentChangesList.map(change => (
                <RecentChangeCard
                  key={change.id}
                  change={change}
                  onViewHistory={() => onViewMedicationHistory(change.id)}
                />
              ))}
            </div>
          </ExpandableSection>
        )}

        {/* Teaching Needed */}
        {data.teachingNeededList.length > 0 && (
          <ExpandableSection
            title="Medication Teaching Needed"
            count={data.teachingNeededList.length}
            icon={BookOpen}
            color="green"
            expanded={expandedSection === 'teaching'}
            onToggle={() => setExpandedSection(expandedSection === 'teaching' ? null : 'teaching')}
          >
            <div className="space-y-2">
              {data.teachingNeededList.map(teaching => (
                <TeachingNeededCard
                  key={teaching.id}
                  teaching={teaching}
                  onDocument={() => onDocumentTeaching(teaching.id)}
                />
              ))}
            </div>
          </ExpandableSection>
        )}
      </div>

      {/* All Clear State */}
      {!hasIssues && data.reconciliationStatus === 'completed' && (
        <Card className="p-8 bg-green-50 border-green-200">
          <div className="text-center">
            <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-1">All Medication Tasks Complete</h3>
            <p className="text-sm text-green-700">
              No critical alerts, reconciliation completed, and no teaching pending.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════════════════

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  alert = false,
  onClick,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  color: 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'orange' | 'gray';
  alert?: boolean;
  onClick?: () => void;
}) {
  const colorConfig = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  };

  return (
    <Card
      className={cn(
        'p-4 relative',
        colorConfig[color],
        onClick && 'cursor-pointer hover:shadow-md transition-shadow'
      )}
      onClick={onClick}
    >
      {alert && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs opacity-80">{label}</div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════

function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  color,
  badge,
}: {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  color: 'blue' | 'red' | 'green' | 'purple';
  badge?: number;
}) {
  const colorConfig = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <Button
      onClick={onClick}
      className={cn('h-auto py-4 flex-col gap-2 relative', colorConfig[color])}
    >
      {badge !== undefined && badge > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-white text-gray-900 border-2 border-current">
          {badge}
        </Badge>
      )}
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPANDABLE SECTION
// ═══════════════════════════════════════════════════════════════════════════

function ExpandableSection({
  title,
  count,
  icon: Icon,
  color,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<any>;
  color: 'red' | 'amber' | 'purple' | 'green';
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const colorConfig = {
    red: 'bg-red-50 border-red-200 text-red-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    green: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <Card className={cn('overflow-hidden', colorConfig[color])}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="outline" className="bg-white/50">
            {count}
          </Badge>
        </div>
        <ChevronRight
          className={cn('w-5 h-5 transition-transform', expanded && 'rotate-90')}
        />
      </button>
      {expanded && (
        <div className="p-4 pt-0 bg-white">
          {children}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CRITICAL ALERT CARD
// ═══════════════════════════════════════════════════════════════════════════

function CriticalAlertCard({
  alert,
  onReview,
}: {
  alert: CriticalAlert;
  onReview: () => void;
}) {
  const severityConfig = {
    critical: 'bg-red-100 border-red-300 text-red-900',
    high: 'bg-orange-100 border-orange-300 text-orange-900',
  };

  const typeLabels = {
    'drug-interaction': 'Drug Interaction',
    'allergy-conflict': 'Allergy Conflict',
    'duplicate-therapy': 'Duplicate Therapy',
    'high-risk': 'High Risk',
    'monitoring-required': 'Monitoring Required',
  };

  return (
    <Card className={cn('p-3', severityConfig[alert.severity])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-white/70 text-xs">
              {typeLabels[alert.type]}
            </Badge>
            <Badge className={cn(
              'text-xs',
              alert.severity === 'critical' && 'bg-red-600 text-white',
              alert.severity === 'high' && 'bg-orange-600 text-white'
            )}>
              {alert.severity.toUpperCase()}
            </Badge>
          </div>
          <p className="font-semibold mb-1">{alert.medicationName}</p>
          <p className="text-sm opacity-90">{alert.message}</p>
          <p className="text-xs opacity-70 mt-1">
            {new Date(alert.createdDate).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReview} className="bg-white">
          Review
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UNRECONCILED MEDICATION CARD
// ═══════════════════════════════════════════════════════════════════════════

function UnreconciledMedicationCard({
  medication,
  onReconcile,
}: {
  medication: UnreconciledMedication;
  onReconcile: () => void;
}) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
    discrepancy: { label: 'Discrepancy', color: 'bg-red-100 text-red-700' },
    verified: { label: 'Verified', color: 'bg-green-100 text-green-700' },
  };

  const sourceLabels = {
    'patient-reported': 'Patient Reported',
    'hospital-discharge': 'Hospital Discharge',
    'pharmacy': 'Pharmacy',
    'other': 'Other',
  };

  return (
    <Card className="p-3 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900">{medication.name}</p>
            <Badge className={statusConfig[medication.status].color}>
              {statusConfig[medication.status].label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>Source: {sourceLabels[medication.source]}</span>
            <span>•</span>
            <span>Added {new Date(medication.addedDate).toLocaleDateString()}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onReconcile}>
          Reconcile
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECENT CHANGE CARD
// ═══════════════════════════════════════════════════════════════════════════

function RecentChangeCard({
  change,
  onViewHistory,
}: {
  change: RecentChange;
  onViewHistory: () => void;
}) {
  const changeTypeConfig = {
    'added': { label: 'Added', icon: Plus, color: 'text-green-600 bg-green-100' },
    'discontinued': { label: 'Discontinued', icon: XCircle, color: 'text-red-600 bg-red-100' },
    'dose-changed': { label: 'Dose Changed', icon: Edit, color: 'text-orange-600 bg-orange-100' },
    'frequency-changed': { label: 'Frequency Changed', icon: Clock, color: 'text-orange-600 bg-orange-100' },
  };

  const config = changeTypeConfig[change.changeType];
  const Icon = config.icon;

  return (
    <Card className="p-3 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className={cn('p-2 rounded-lg', config.color)}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">{change.medicationName}</p>
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>{new Date(change.date).toLocaleDateString()}</span>
              <span>•</span>
              <span>by {change.changedBy}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewHistory}>
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEACHING NEEDED CARD
// ═══════════════════════════════════════════════════════════════════════════

function TeachingNeededCard({
  teaching,
  onDocument,
}: {
  teaching: TeachingNeeded;
  onDocument: () => void;
}) {
  const priorityConfig = {
    high: 'bg-red-100 border-red-300',
    medium: 'bg-amber-100 border-amber-300',
    low: 'bg-blue-100 border-blue-300',
  };

  const reasonLabels = {
    'new-medication': 'New Medication',
    'high-risk': 'High Risk Medication',
    'complex-regimen': 'Complex Regimen',
    'patient-request': 'Patient Request',
  };

  return (
    <Card className={cn('p-3 bg-white', priorityConfig[teaching.priority])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900">{teaching.medicationName}</p>
            <Badge className={cn(
              'text-xs',
              teaching.priority === 'high' && 'bg-red-600 text-white',
              teaching.priority === 'medium' && 'bg-amber-600 text-white',
              teaching.priority === 'low' && 'bg-blue-600 text-white'
            )}>
              {teaching.priority.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-1">{reasonLabels[teaching.reason]}</p>
          {teaching.dueDate && (
            <p className="text-xs text-gray-600">
              Due: {new Date(teaching.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onDocument} className="bg-white">
          <FileText className="w-4 h-4 mr-2" />
          Document
        </Button>
      </div>
    </Card>
  );
}
