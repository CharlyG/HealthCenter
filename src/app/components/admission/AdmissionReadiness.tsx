/**
 * Smart Admission Readiness System
 * 
 * Operational readiness indicator for home health and hospice admissions.
 * 
 * Readiness States:
 * - Draft: Initial state, minimal information entered
 * - Pending Setup: Some information entered, not ready
 * - Ready for Care: All requirements met, can schedule care
 * - Blocked: Critical items missing, cannot proceed
 * 
 * Checklist Categories:
 * - Patient Information: Demographics, contact, emergency contact
 * - Clinical: Diagnosis, physician, orders, disciplines
 * - Payer: Primary payer, authorization, insurance verification
 * - Operational: Start of care date, care team, schedule
 * 
 * Features:
 * - Real-time readiness calculation
 * - Visual progress indicators
 * - Click-to-navigate checklist items
 * - Blocked item highlighting
 * - Readiness summary metrics
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Circle,
  ChevronRight,
  User,
  Stethoscope,
  Shield,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  Info,
  Edit,
  ExternalLink,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export type ReadinessState = 'draft' | 'pending_setup' | 'ready_for_care' | 'blocked';

export type ChecklistItemState = 'complete' | 'incomplete' | 'blocked' | 'optional';

export type ChecklistCategory = 'patient_info' | 'clinical' | 'payer' | 'operational';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  label: string;
  description: string;
  state: ChecklistItemState;
  isRequired: boolean;
  blockerReason?: string;
  navigationPath?: string;
  navigationSection?: string;
}

export interface AdmissionReadiness {
  state: ReadinessState;
  overallProgress: number;
  totalItems: number;
  completedItems: number;
  incompleteItems: number;
  blockedItems: number;
  optionalItems: number;
  checklist: ChecklistItem[];
  blockerReasons: string[];
}

// ==================== READINESS BADGE ====================

interface ReadinessBadgeProps {
  state: ReadinessState;
  size?: 'sm' | 'md' | 'lg';
}

export function ReadinessBadge({ state, size = 'md' }: ReadinessBadgeProps) {
  const configs = {
    draft: {
      label: 'Draft',
      color: 'bg-gray-500',
      textColor: 'text-white',
      icon: Circle,
      description: 'Initial setup in progress',
    },
    pending_setup: {
      label: 'Pending Setup',
      color: 'bg-amber-500',
      textColor: 'text-white',
      icon: Clock,
      description: 'Additional information required',
    },
    ready_for_care: {
      label: 'Ready for Care',
      color: 'bg-green-600',
      textColor: 'text-white',
      icon: CheckCircle2,
      description: 'All requirements met',
    },
    blocked: {
      label: 'Blocked',
      color: 'bg-red-600 animate-pulse',
      textColor: 'text-white',
      icon: AlertTriangle,
      description: 'Critical items require attention',
    },
  };

  const config = configs[state];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.color} ${config.textColor} ${sizeClasses[size]}`}
      >
        <Icon className={size === 'sm' ? 'size-3' : size === 'md' ? 'size-4' : 'size-5'} />
        <span>{config.label}</span>
      </div>
    </div>
  );
}

// ==================== READINESS STATE CARD ====================

interface ReadinessStateCardProps {
  state: ReadinessState;
  blockerReasons?: string[];
}

export function ReadinessStateCard({ state, blockerReasons = [] }: ReadinessStateCardProps) {
  const configs = {
    draft: {
      label: 'Draft',
      color: 'border-gray-300 bg-gray-50',
      icon: Circle,
      iconColor: 'text-gray-500',
      title: 'Admission in Draft',
      message: 'This admission is in the initial draft stage. Complete the checklist items to proceed.',
    },
    pending_setup: {
      label: 'Pending Setup',
      color: 'border-amber-300 bg-amber-50',
      icon: Clock,
      iconColor: 'text-amber-600',
      title: 'Setup in Progress',
      message: 'Some information is missing. Complete the remaining checklist items to make this admission ready for care.',
    },
    ready_for_care: {
      label: 'Ready for Care',
      color: 'border-green-300 bg-green-50',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      title: 'Ready for Care',
      message: 'All requirements have been met. This admission is ready for scheduling and service delivery.',
    },
    blocked: {
      label: 'Blocked',
      color: 'border-red-300 bg-red-50',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      title: 'Admission Blocked',
      message: 'Critical items require immediate attention. Resolve blockers before proceeding.',
    },
  };

  const config = configs[state];
  const Icon = config.icon;

  return (
    <Card className={`border-2 ${config.color}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`size-14 rounded-full ${config.color} flex items-center justify-center`}>
            <Icon className={`size-7 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
              <ReadinessBadge state={state} size="sm" />
            </div>
            <p className="text-sm text-gray-700 mb-3">{config.message}</p>

            {state === 'blocked' && blockerReasons.length > 0 && (
              <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-red-900 mb-2">Blockers:</p>
                <ul className="space-y-1">
                  {blockerReasons.map((reason, index) => (
                    <li key={index} className="text-xs text-red-800 flex items-start gap-1">
                      <AlertCircle className="size-3 mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {state === 'ready_for_care' && (
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" className="gap-1">
                  <Calendar className="size-4" />
                  Schedule First Visit
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <FileText className="size-4" />
                  Generate Documents
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== CHECKLIST ITEM ====================

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onNavigate?: (item: ChecklistItem) => void;
}

export function ChecklistItemCard({ item, onNavigate }: ChecklistItemCardProps) {
  const stateConfigs = {
    complete: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      label: 'Complete',
    },
    incomplete: {
      icon: Circle,
      color: 'text-gray-400',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      label: 'Incomplete',
    },
    blocked: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      label: 'Blocked',
    },
    optional: {
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      label: 'Optional',
    },
  };

  const config = stateConfigs[item.state];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onNavigate && onNavigate(item)}
      className={`w-full text-left p-4 border-l-4 rounded-lg bg-white hover:shadow-md transition-all ${
        config.borderColor
      } ${item.state === 'blocked' ? 'border-l-red-600' : ''}`}
      disabled={!item.navigationPath && !item.navigationSection}
    >
      <div className="flex items-start gap-3">
        <div className={`size-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`size-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">{item.label}</h4>
            {item.isRequired && item.state !== 'complete' && (
              <Badge variant="outline" className="text-xs text-red-700 border-red-300">
                Required
              </Badge>
            )}
            {!item.isRequired && (
              <Badge variant="outline" className="text-xs text-gray-600">
                Optional
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2">{item.description}</p>

          {item.state === 'blocked' && item.blockerReason && (
            <div className="flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800 mb-2">
              <AlertCircle className="size-3 mt-0.5 flex-shrink-0" />
              <span>{item.blockerReason}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Badge className={`${config.bgColor} ${config.color} text-xs`}>
              {config.label}
            </Badge>
            {(item.navigationPath || item.navigationSection) && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <span className="font-medium">
                  {item.state === 'complete' ? 'View' : 'Complete'}
                </span>
                <ChevronRight className="size-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ==================== READINESS CHECKLIST ====================

interface ReadinessChecklistProps {
  items: ChecklistItem[];
  onNavigate?: (item: ChecklistItem) => void;
}

export function ReadinessChecklist({ items, onNavigate }: ReadinessChecklistProps) {
  const categorizedItems = useMemo(() => {
    const categories = {
      patient_info: [] as ChecklistItem[],
      clinical: [] as ChecklistItem[],
      payer: [] as ChecklistItem[],
      operational: [] as ChecklistItem[],
    };

    items.forEach((item) => {
      categories[item.category].push(item);
    });

    return categories;
  }, [items]);

  const categoryConfigs = {
    patient_info: {
      label: 'Patient Information',
      icon: User,
      color: 'text-blue-600',
    },
    clinical: {
      label: 'Clinical Information',
      icon: Stethoscope,
      color: 'text-green-600',
    },
    payer: {
      label: 'Payer & Authorization',
      icon: Shield,
      color: 'text-purple-600',
    },
    operational: {
      label: 'Operational Setup',
      icon: Calendar,
      color: 'text-orange-600',
    },
  };

  return (
    <div className="space-y-6">
      {Object.entries(categorizedItems).map(([category, categoryItems]) => {
        if (categoryItems.length === 0) return null;

        const config = categoryConfigs[category as ChecklistCategory];
        const Icon = config.icon;
        const completedCount = categoryItems.filter((item) => item.state === 'complete').length;

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`size-5 ${config.color}`} />
              <h3 className="font-semibold text-gray-900">{config.label}</h3>
              <Badge variant="outline" className="text-xs">
                {completedCount}/{categoryItems.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <ChecklistItemCard key={item.id} item={item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==================== READINESS SUMMARY ====================

interface ReadinessSummaryProps {
  readiness: AdmissionReadiness;
}

export function ReadinessSummary({ readiness }: ReadinessSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Readiness Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900">{readiness.overallProgress}%</span>
          </div>
          <Progress value={readiness.overallProgress} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{readiness.completedItems}</p>
            <p className="text-xs text-gray-700">Completed</p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-700">{readiness.incompleteItems}</p>
            <p className="text-xs text-gray-700">Remaining</p>
          </div>
          {readiness.blockedItems > 0 && (
            <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{readiness.blockedItems}</p>
              <p className="text-xs text-gray-700">Blocked Items</p>
            </div>
          )}
        </div>

        {/* Readiness Badge */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Current State:</p>
          <ReadinessBadge state={readiness.state} size="md" />
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== ADMISSION READINESS PANEL ====================

interface AdmissionReadinessPanelProps {
  readiness: AdmissionReadiness;
  admissionId: string;
  onNavigate?: (item: ChecklistItem) => void;
}

export function AdmissionReadinessPanel({
  readiness,
  admissionId,
  onNavigate,
}: AdmissionReadinessPanelProps) {
  return (
    <div className="space-y-6">
      {/* State Card */}
      <ReadinessStateCard state={readiness.state} blockerReasons={readiness.blockerReasons} />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Readiness Checklist</CardTitle>
                <Badge variant="outline">
                  {readiness.completedItems}/{readiness.totalItems} Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ReadinessChecklist items={readiness.checklist} onNavigate={onNavigate} />
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <ReadinessSummary readiness={readiness} />
        </div>
      </div>
    </div>
  );
}

// ==================== COMPACT READINESS CHECKLIST ====================

interface CompactReadinessChecklistProps {
  items: ChecklistItem[];
  onNavigate?: (item: ChecklistItem) => void;
}

export function CompactReadinessChecklist({ items, onNavigate }: CompactReadinessChecklistProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = item.state === 'complete' 
          ? CheckCircle2 
          : item.state === 'blocked' 
          ? XCircle 
          : AlertTriangle;
        
        const iconColor = item.state === 'complete' 
          ? 'text-green-600' 
          : item.state === 'blocked' 
          ? 'text-red-600' 
          : 'text-amber-600';

        return (
          <button
            key={item.id}
            onClick={() => onNavigate && onNavigate(item)}
            className="w-full flex items-center gap-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors group"
          >
            <Icon className={`size-5 flex-shrink-0 ${iconColor}`} />
            <span className={`text-sm ${item.state === 'complete' ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
              {item.label}
            </span>
            {item.state === 'blocked' && item.blockerReason && (
              <span className="text-xs text-red-600 ml-auto">({item.blockerReason})</span>
            )}
            {(item.navigationPath || item.navigationSection) && item.state !== 'complete' && (
              <ChevronRight className="size-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ==================== SIMPLE READINESS CARD ====================

interface SimpleReadinessCardProps {
  readiness: AdmissionReadiness;
  onNavigate?: (item: ChecklistItem) => void;
}

export function SimpleReadinessCard({ readiness, onNavigate }: SimpleReadinessCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Admission Readiness</CardTitle>
          <ReadinessBadge state={readiness.state} size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        <CompactReadinessChecklist items={readiness.checklist} onNavigate={onNavigate} />
        
        {readiness.state !== 'ready_for_care' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {readiness.incompleteItems + readiness.blockedItems} items remaining
              </span>
              <span className="font-semibold text-gray-900">{readiness.overallProgress}%</span>
            </div>
            <Progress value={readiness.overallProgress} className="h-2 mt-2" />
          </div>
        )}

        {readiness.state === 'ready_for_care' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button className="w-full gap-2">
              <Calendar className="size-4" />
              Schedule First Visit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate admission readiness based on checklist items
 */
export function calculateReadiness(checklist: ChecklistItem[]): AdmissionReadiness {
  const requiredItems = checklist.filter((item) => item.isRequired);
  const completedItems = checklist.filter((item) => item.state === 'complete');
  const incompleteItems = checklist.filter(
    (item) => item.state === 'incomplete' && item.isRequired
  );
  const blockedItems = checklist.filter((item) => item.state === 'blocked');
  const optionalItems = checklist.filter((item) => !item.isRequired);

  const blockerReasons = blockedItems
    .map((item) => item.blockerReason)
    .filter((reason): reason is string => !!reason);

  // Calculate progress (only required items count toward progress)
  const requiredCompleted = requiredItems.filter((item) => item.state === 'complete').length;
  const overallProgress = requiredItems.length > 0
    ? Math.round((requiredCompleted / requiredItems.length) * 100)
    : 0;

  // Determine state
  let state: ReadinessState;

  if (blockedItems.length > 0) {
    state = 'blocked';
  } else if (incompleteItems.length === 0 && requiredCompleted === requiredItems.length) {
    state = 'ready_for_care';
  } else if (completedItems.length === 0) {
    state = 'draft';
  } else {
    state = 'pending_setup';
  }

  return {
    state,
    overallProgress,
    totalItems: checklist.length,
    completedItems: completedItems.length,
    incompleteItems: incompleteItems.length,
    blockedItems: blockedItems.length,
    optionalItems: optionalItems.length,
    checklist,
    blockerReasons,
  };
}

/**
 * Generate mock checklist for demo purposes
 */
export function generateMockChecklist(scenario: 'complete' | 'blocked' | 'partial' | 'draft'): ChecklistItem[] {
  const baseChecklist: ChecklistItem[] = [
    // Patient Information
    {
      id: 'patient_demographics',
      category: 'patient_info',
      label: 'Patient Demographics',
      description: 'Name, DOB, gender, SSN, contact information',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/demographics',
      navigationSection: 'demographics',
    },
    {
      id: 'emergency_contact',
      category: 'patient_info',
      label: 'Emergency Contact',
      description: 'Emergency contact name, relationship, phone number',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/demographics',
      navigationSection: 'emergency_contact',
    },
    {
      id: 'address_verification',
      category: 'patient_info',
      label: 'Address Verification',
      description: 'Service address verified and geocoded',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/demographics',
      navigationSection: 'address',
    },

    // Clinical
    {
      id: 'primary_diagnosis',
      category: 'clinical',
      label: 'Primary Diagnosis',
      description: 'Primary diagnosis code (ICD-10)',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/clinical',
      navigationSection: 'diagnosis',
    },
    {
      id: 'physician_orders',
      category: 'clinical',
      label: 'Physician Orders',
      description: 'Signed physician orders for home health services',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/clinical',
      navigationSection: 'orders',
    },
    {
      id: 'disciplines',
      category: 'clinical',
      label: 'Disciplines Selected',
      description: 'Select disciplines (RN, PT, OT, ST, MSW, Aide)',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/clinical',
      navigationSection: 'disciplines',
    },
    {
      id: 'medication_list',
      category: 'clinical',
      label: 'Medication List',
      description: 'Current medication list documented',
      state: 'incomplete',
      isRequired: false,
      navigationPath: '/admissions/ADM-001/clinical',
      navigationSection: 'medications',
    },

    // Payer
    {
      id: 'primary_payer',
      category: 'payer',
      label: 'Primary Payer',
      description: 'Primary insurance selected and verified',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/payer',
      navigationSection: 'insurance',
    },
    {
      id: 'authorization',
      category: 'payer',
      label: 'Authorization Entered',
      description: 'Authorization number and dates entered',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/payer',
      navigationSection: 'authorization',
    },
    {
      id: 'insurance_verification',
      category: 'payer',
      label: 'Insurance Verification',
      description: 'Eligibility and benefits verified',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/payer',
      navigationSection: 'verification',
    },

    // Operational
    {
      id: 'start_of_care_date',
      category: 'operational',
      label: 'Start of Care Date',
      description: 'Planned start of care date set',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/operational',
      navigationSection: 'soc_date',
    },
    {
      id: 'care_team_assigned',
      category: 'operational',
      label: 'Care Team Assigned',
      description: 'Primary clinician and care team assigned',
      state: 'incomplete',
      isRequired: true,
      navigationPath: '/admissions/ADM-001/operational',
      navigationSection: 'care_team',
    },
    {
      id: 'territory_assignment',
      category: 'operational',
      label: 'Territory Assignment',
      description: 'Admission assigned to service territory',
      state: 'incomplete',
      isRequired: false,
      navigationPath: '/admissions/ADM-001/operational',
      navigationSection: 'territory',
    },
  ];

  // Modify checklist based on scenario
  if (scenario === 'complete') {
    return baseChecklist.map((item) => ({ ...item, state: 'complete' as ChecklistItemState }));
  }

  if (scenario === 'blocked') {
    return baseChecklist.map((item, index) => {
      if (index < 5) {
        return { ...item, state: 'complete' as ChecklistItemState };
      }
      if (index === 5) {
        return {
          ...item,
          state: 'blocked' as ChecklistItemState,
          blockerReason: 'Authorization denied by payer. Appeal required.',
        };
      }
      if (index === 6) {
        return {
          ...item,
          state: 'blocked' as ChecklistItemState,
          blockerReason: 'Physician not enrolled in Medicare. Different physician required.',
        };
      }
      return item;
    });
  }

  if (scenario === 'partial') {
    return baseChecklist.map((item, index) => {
      if (index < 7) {
        return { ...item, state: 'complete' as ChecklistItemState };
      }
      return item;
    });
  }

  // draft - all incomplete
  return baseChecklist;
}