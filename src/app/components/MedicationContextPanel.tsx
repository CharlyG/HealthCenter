/**
 * Medication Context Panel Component
 * 
 * Side panel that displays relevant medication information during assessment.
 * Reduces context switching by showing patient medication data inline.
 * 
 * DISPLAYS:
 * - Active medication count
 * - High-risk medications list
 * - Recent medication changes
 * - Medication reconciliation status
 * - Quick actions
 * 
 * FEATURES:
 * - Collapsible sections
 * - Auto-refresh capability
 * - Quick navigation to med profile
 * - Compact design for side panel
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Pill,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Clock,
  ShieldAlert,
  Plus,
  XCircle,
  Edit,
  ClipboardCheck,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MedicationContextData {
  // Summary
  totalActiveMedications: number;
  highRiskMedicationCount: number;
  recentChangesCount: number;
  
  // Reconciliation
  reconciliationStatus: 'not-started' | 'in-progress' | 'completed';
  reconciliationProgress?: number;
  lastReconciliationDate?: string;
  
  // Lists
  highRiskMedications: HighRiskMedication[];
  recentChanges: MedicationChange[];
  
  // Alerts
  activeCriticalAlerts: number;
}

export interface HighRiskMedication {
  id: string;
  name: string;
  strength: string;
  dose: string;
  frequency: string;
  riskCategory: 'anticoagulant' | 'insulin' | 'opioid' | 'high-alert' | 'other';
  requiresMonitoring: boolean;
}

export interface MedicationChange {
  id: string;
  medicationName: string;
  changeType: 'added' | 'discontinued' | 'dose-changed' | 'frequency-changed';
  date: string;
  changedBy: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MedicationContextPanelProps {
  data: MedicationContextData;
  onRefresh?: () => void;
  onViewMedicationProfile?: () => void;
  onViewReconciliation?: () => void;
  onViewChange?: (changeId: string) => void;
  compact?: boolean;
}

export default function MedicationContextPanel({
  data,
  onRefresh,
  onViewMedicationProfile,
  onViewReconciliation,
  onViewChange,
  compact = false,
}: MedicationContextPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['summary', 'high-risk']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const hasIssues = 
    data.reconciliationStatus !== 'completed' ||
    data.activeCriticalAlerts > 0;

  return (
    <div className={cn(
      'bg-white border-l overflow-y-auto',
      compact ? 'w-80' : 'w-96'
    )}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Medication Context</h3>
          </div>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-600">
          Patient medication information for assessment context
        </p>
        {hasIssues && (
          <Badge variant="destructive" className="mt-2 text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Action Required
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Summary Section */}
        <CollapsibleSection
          title="Medication Summary"
          icon={Pill}
          expanded={expandedSections.includes('summary')}
          onToggle={() => toggleSection('summary')}
        >
          <div className="space-y-2">
            <SummaryRow
              label="Active Medications"
              value={data.totalActiveMedications}
              color="blue"
              icon={Pill}
            />
            <SummaryRow
              label="High-Risk Medications"
              value={data.highRiskMedicationCount}
              color={data.highRiskMedicationCount > 0 ? 'red' : 'gray'}
              icon={ShieldAlert}
            />
            <SummaryRow
              label="Recent Changes (7d)"
              value={data.recentChangesCount}
              color="purple"
              icon={TrendingUp}
            />
            {data.activeCriticalAlerts > 0 && (
              <SummaryRow
                label="Critical Alerts"
                value={data.activeCriticalAlerts}
                color="red"
                icon={AlertTriangle}
                alert
              />
            )}
          </div>

          {onViewMedicationProfile && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={onViewMedicationProfile}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Medication Profile
            </Button>
          )}
        </CollapsibleSection>

        {/* Reconciliation Status */}
        <ReconciliationStatusCard
          status={data.reconciliationStatus}
          progress={data.reconciliationProgress}
          lastDate={data.lastReconciliationDate}
          onView={onViewReconciliation}
        />

        {/* High-Risk Medications */}
        {data.highRiskMedications.length > 0 && (
          <CollapsibleSection
            title="High-Risk Medications"
            icon={ShieldAlert}
            count={data.highRiskMedications.length}
            expanded={expandedSections.includes('high-risk')}
            onToggle={() => toggleSection('high-risk')}
          >
            <div className="space-y-2">
              {data.highRiskMedications.map(med => (
                <HighRiskMedicationCard key={med.id} medication={med} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Recent Changes */}
        {data.recentChanges.length > 0 && (
          <CollapsibleSection
            title="Recent Changes"
            icon={TrendingUp}
            count={data.recentChanges.length}
            expanded={expandedSections.includes('changes')}
            onToggle={() => toggleSection('changes')}
          >
            <div className="space-y-2">
              {data.recentChanges.map(change => (
                <MedicationChangeCard
                  key={change.id}
                  change={change}
                  onView={() => onViewChange?.(change.id)}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Helper Text */}
        <Card className="p-3 bg-blue-50 border-blue-200">
          <p className="text-xs text-blue-700 leading-relaxed">
            💡 This information is provided for context while completing medication-related 
            assessment questions. Consider recent changes and high-risk medications when 
            answering.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLAPSIBLE SECTION
// ═══════════════════════════════════════════════════════════════════════════

function CollapsibleSection({
  title,
  icon: Icon,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<any>;
  count?: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-sm text-gray-900">{title}</span>
          {count !== undefined && (
            <Badge variant="outline" className="text-xs">
              {count}
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="p-3 pt-0 border-t">
          {children}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY ROW
// ═══════════════════════════════════════════════════════════════════════════

function SummaryRow({
  label,
  value,
  color,
  icon: Icon,
  alert = false,
}: {
  label: string;
  value: number;
  color: 'blue' | 'red' | 'purple' | 'gray';
  icon: React.ComponentType<any>;
  alert?: boolean;
}) {
  const colorConfig = {
    blue: 'text-blue-600 bg-blue-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    gray: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2">
        <div className={cn('p-1 rounded', colorConfig[color])}>
          <Icon className="w-3 h-3" />
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {alert && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
        <span className="font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECONCILIATION STATUS CARD
// ═══════════════════════════════════════════════════════════════════════════

function ReconciliationStatusCard({
  status,
  progress,
  lastDate,
  onView,
}: {
  status: 'not-started' | 'in-progress' | 'completed';
  progress?: number;
  lastDate?: string;
  onView?: () => void;
}) {
  const statusConfig = {
    'not-started': {
      label: 'Not Started',
      color: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    'in-progress': {
      label: 'In Progress',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-900',
      icon: ClipboardCheck,
      iconColor: 'text-blue-600',
    },
    'completed': {
      label: 'Completed',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-900',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={cn('p-3', config.color)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', config.iconColor)} />
          <span className={cn('font-medium text-sm', config.textColor)}>
            Medication Reconciliation
          </span>
        </div>
        <Badge variant="outline" className="text-xs bg-white/70">
          {config.label}
        </Badge>
      </div>

      {status === 'in-progress' && progress !== undefined && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={config.textColor}>Progress</span>
            <span className={cn('font-semibold', config.textColor)}>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'completed' && lastDate && (
        <p className="text-xs text-green-700 mb-2">
          Completed {new Date(lastDate).toLocaleDateString()}
        </p>
      )}

      {status === 'not-started' && (
        <p className="text-xs text-amber-700 mb-2">
          Complete within 24 hours of admission
        </p>
      )}

      {onView && (
        <Button variant="outline" size="sm" className="w-full bg-white" onClick={onView}>
          <Eye className="w-3 h-3 mr-2" />
          View Reconciliation
        </Button>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HIGH-RISK MEDICATION CARD
// ═══════════════════════════════════════════════════════════════════════════

function HighRiskMedicationCard({ medication }: { medication: HighRiskMedication }) {
  const riskCategoryConfig = {
    anticoagulant: { label: 'Anticoagulant', color: 'bg-red-100 text-red-700' },
    insulin: { label: 'Insulin', color: 'bg-orange-100 text-orange-700' },
    opioid: { label: 'Opioid', color: 'bg-amber-100 text-amber-700' },
    'high-alert': { label: 'High Alert', color: 'bg-red-100 text-red-700' },
    other: { label: 'High Risk', color: 'bg-gray-100 text-gray-700' },
  };

  const config = riskCategoryConfig[medication.riskCategory];

  return (
    <div className="p-2 border border-gray-200 rounded-lg bg-white">
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900">{medication.name}</p>
          <p className="text-xs text-gray-600">{medication.strength}</p>
        </div>
        <Badge className={cn('text-xs', config.color)}>
          {config.label}
        </Badge>
      </div>
      <div className="text-xs text-gray-700 mt-1">
        {medication.dose} • {medication.frequency}
      </div>
      {medication.requiresMonitoring && (
        <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-700">
          <AlertTriangle className="w-3 h-3" />
          <span>Requires monitoring</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION CHANGE CARD
// ═══════════════════════════════════════════════════════════════════════════

function MedicationChangeCard({
  change,
  onView,
}: {
  change: MedicationChange;
  onView?: () => void;
}) {
  const changeTypeConfig = {
    added: { label: 'Added', icon: Plus, color: 'text-green-600 bg-green-50' },
    discontinued: { label: 'Discontinued', icon: XCircle, color: 'text-red-600 bg-red-50' },
    'dose-changed': { label: 'Dose Changed', icon: Edit, color: 'text-orange-600 bg-orange-50' },
    'frequency-changed': { label: 'Frequency Changed', icon: Clock, color: 'text-orange-600 bg-orange-50' },
  };

  const config = changeTypeConfig[change.changeType];
  const Icon = config.icon;

  return (
    <div className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-2">
        <div className={cn('p-1 rounded', config.color)}>
          <Icon className="w-3 h-3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">
            {change.medicationName}
          </p>
          <Badge variant="outline" className="text-xs mt-0.5">
            {config.label}
          </Badge>
          <div className="text-xs text-gray-600 mt-1">
            {new Date(change.date).toLocaleDateString()} • {change.changedBy}
          </div>
        </div>
        {onView && (
          <Button variant="ghost" size="sm" onClick={onView} className="h-6 w-6 p-0">
            <Eye className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
