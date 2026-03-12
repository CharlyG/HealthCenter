/**
 * Discharge Documentation Workflow Component
 * 
 * Comprehensive workflow for managing discharge documentation when ending a
 * home health admission. Guides staff through completing all required clinical
 * and certification documents needed to properly close an episode of care.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  CheckCircle,
  Circle,
  FileText,
  ClipboardList,
  Stethoscope,
  FileCheck,
  UserCheck,
  AlertCircle,
  Clock,
  ChevronRight,
  Edit,
  Eye,
  CheckSquare,
  GraduationCap,
  Home,
  Activity,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type DischargeRequirement =
  | 'discharge-summary'
  | 'final-visit-note'
  | 'discharge-assessment'
  | 'final-orders'
  | 'care-plan-closure'
  | 'physician-discharge-order'
  | 'patient-education';

export type RequirementStatus = 'complete' | 'in-progress' | 'not-started';

export type DischargeReason =
  | 'goals-met'
  | 'transfer-facility'
  | 'transfer-agency'
  | 'deceased'
  | 'physician-decision'
  | 'patient-refused'
  | 'financial';

export interface DischargeDocumentationData {
  patientName: string;
  patientId: string;
  admissionId: string;
  admissionStartDate: string;
  dischargeReason: DischargeReason;
  plannedDischargeDate: string;
  requirements: {
    [key in DischargeRequirement]: {
      status: RequirementStatus;
      completedDate?: string;
      completedBy?: string;
      notes?: string;
    };
  };
  readinessPercentage: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const REQUIREMENT_CONFIG: Record<
  DischargeRequirement,
  { label: string; description: string; icon: any; color: string; order: number }
> = {
  'discharge-summary': {
    label: 'Discharge Summary',
    description: 'Complete clinical summary of care provided during admission',
    icon: FileText,
    color: '#3B82F6',
    order: 1,
  },
  'final-visit-note': {
    label: 'Final Visit Note',
    description: 'Document final visit with discharge planning and outcomes',
    icon: ClipboardList,
    color: '#8B5CF6',
    order: 2,
  },
  'discharge-assessment': {
    label: 'Discharge Assessment',
    description: 'Complete discharge OASIS or clinical assessment',
    icon: Activity,
    color: '#10B981',
    order: 3,
  },
  'final-orders': {
    label: 'Final Orders Review',
    description: 'Review and finalize all physician orders',
    icon: Stethoscope,
    color: '#F59E0B',
    order: 4,
  },
  'care-plan-closure': {
    label: 'Care Plan Closure',
    description: 'Close all active care plan goals and interventions',
    icon: FileCheck,
    color: '#EC4899',
    order: 5,
  },
  'physician-discharge-order': {
    label: 'Physician Discharge Order',
    description: 'Obtain physician order to discharge from service',
    icon: UserCheck,
    color: '#06B6D4',
    order: 6,
  },
  'patient-education': {
    label: 'Patient Education Verification',
    description: 'Verify discharge education and follow-up instructions provided',
    icon: GraduationCap,
    color: '#F97316',
    order: 7,
  },
};

const DISCHARGE_REASON_LABELS: Record<DischargeReason, string> = {
  'goals-met': 'Goals Met / Improved',
  'transfer-facility': 'Transfer to Facility',
  'transfer-agency': 'Transfer to Another Agency',
  'deceased': 'Patient Deceased',
  'physician-decision': 'Physician Decision',
  'patient-refused': 'Patient Refused Services',
  'financial': 'Financial / Insurance',
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DischargeDocumentationWorkflowProps {
  data: DischargeDocumentationData;
  onCompleteRequirement?: (requirementKey: DischargeRequirement) => void;
  onViewRequirement?: (requirementKey: DischargeRequirement) => void;
  onSubmitDischarge?: () => void;
}

export default function DischargeDocumentationWorkflow({
  data,
  onCompleteRequirement,
  onViewRequirement,
  onSubmitDischarge,
}: DischargeDocumentationWorkflowProps) {
  // Sort requirements by order
  const sortedRequirements = useMemo(() => {
    return (Object.entries(data.requirements) as [DischargeRequirement, any][]).sort(
      ([keyA], [keyB]) => {
        return REQUIREMENT_CONFIG[keyA].order - REQUIREMENT_CONFIG[keyB].order;
      }
    );
  }, [data.requirements]);

  const completedCount = sortedRequirements.filter(
    ([_, req]) => req.status === 'complete'
  ).length;
  const totalCount = sortedRequirements.length;
  const isReady = completedCount === totalCount;

  const daysUntilDischarge = useMemo(() => {
    const planned = new Date(data.plannedDischargeDate);
    const today = new Date();
    const diff = Math.ceil((planned.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [data.plannedDischargeDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discharge Documentation</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete all required documents to close the episode of care
          </p>
        </div>
        {isReady ? (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready to Discharge
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            {completedCount}/{totalCount} Complete
          </Badge>
        )}
      </div>

      {/* Patient & Admission Info */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Patient</p>
            <p className="font-semibold text-gray-900">{data.patientName}</p>
            <p className="text-xs text-gray-600">{data.patientId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Admission ID</p>
            <p className="font-semibold text-gray-900">{data.admissionId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Admission Start</p>
            <p className="font-semibold text-gray-900">
              {new Date(data.admissionStartDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Planned Discharge</p>
            <p className="font-semibold text-gray-900">
              {new Date(data.plannedDischargeDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-600">
              {daysUntilDischarge > 0
                ? `in ${daysUntilDischarge} days`
                : daysUntilDischarge === 0
                ? 'Today'
                : `${Math.abs(daysUntilDischarge)} days ago`}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Discharge Reason</p>
            <p className="font-semibold text-gray-900">
              {DISCHARGE_REASON_LABELS[data.dischargeReason]}
            </p>
          </div>
        </div>
      </Card>

      {/* Discharge Readiness Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Discharge Readiness</h3>
        <DischargeReadinessSummary
          completedCount={completedCount}
          totalCount={totalCount}
          readinessPercentage={data.readinessPercentage}
          isReady={isReady}
        />
      </Card>

      {/* Documentation Checklist */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Required Documentation Checklist
        </h3>
        <div className="space-y-3">
          {sortedRequirements.map(([requirementKey, requirement]) => (
            <RequirementCard
              key={requirementKey}
              requirementKey={requirementKey}
              requirement={requirement}
              onComplete={() => onCompleteRequirement?.(requirementKey)}
              onView={() => onViewRequirement?.(requirementKey)}
            />
          ))}
        </div>
      </Card>

      {/* Missing Items Alert */}
      {!isReady && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 text-sm mb-1">
                {totalCount - completedCount} Document{totalCount - completedCount !== 1 ? 's' : ''}{' '}
                Remaining
              </h4>
              <p className="text-xs text-amber-700 mb-2">
                Complete all required documentation before discharging the patient.
              </p>
              <ul className="space-y-1">
                {sortedRequirements
                  .filter(([_, req]) => req.status !== 'complete')
                  .map(([key]) => {
                    const config = REQUIREMENT_CONFIG[key];
                    return (
                      <li key={key} className="text-xs text-amber-700 flex items-center gap-2">
                        <Circle className="w-3 h-3 fill-amber-600 text-amber-600" />
                        {config.label}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* All Complete - Ready to Submit */}
      {isReady && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">
                Discharge Documentation Complete
              </h4>
              <p className="text-sm text-green-700 mb-4">
                All required documents have been completed. The patient is ready to be
                discharged from the episode of care.
              </p>
              <Button onClick={onSubmitDischarge} className="bg-green-600 hover:bg-green-700">
                <Home className="w-4 h-4 mr-2" />
                Submit Discharge
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCHARGE READINESS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

interface DischargeReadinessSummaryProps {
  completedCount: number;
  totalCount: number;
  readinessPercentage: number;
  isReady: boolean;
}

function DischargeReadinessSummary({
  completedCount,
  totalCount,
  readinessPercentage,
  isReady,
}: DischargeReadinessSummaryProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {completedCount} of {totalCount} Documents Complete
        </span>
        <span className="text-lg font-bold text-gray-900">{readinessPercentage}%</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className={cn(
            'h-full transition-all duration-500',
            isReady ? 'bg-green-600' : 'bg-blue-600'
          )}
          style={{ width: `${readinessPercentage}%` }}
        />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: totalCount }).map((_, index) => {
          const isComplete = index < completedCount;
          return (
            <div
              key={index}
              className={cn(
                'h-2 rounded-full transition-all',
                isComplete ? 'bg-green-600' : 'bg-gray-300'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUIREMENT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface RequirementCardProps {
  requirementKey: DischargeRequirement;
  requirement: {
    status: RequirementStatus;
    completedDate?: string;
    completedBy?: string;
    notes?: string;
  };
  onComplete: () => void;
  onView: () => void;
}

function RequirementCard({
  requirementKey,
  requirement,
  onComplete,
  onView,
}: RequirementCardProps) {
  const config = REQUIREMENT_CONFIG[requirementKey];
  const Icon = config.icon;
  const isComplete = requirement.status === 'complete';
  const isInProgress = requirement.status === 'in-progress';

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-all',
        isComplete && 'bg-green-50 border-green-200',
        isInProgress && 'bg-blue-50 border-blue-200',
        !isComplete && !isInProgress && 'bg-gray-50 border-gray-200'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          isComplete && 'bg-green-100',
          isInProgress && 'bg-blue-100',
          !isComplete && !isInProgress && 'bg-white border border-gray-300'
        )}
      >
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h4
              className={cn(
                'font-semibold text-sm',
                isComplete && 'text-green-900',
                isInProgress && 'text-blue-900',
                !isComplete && !isInProgress && 'text-gray-900'
              )}
            >
              {config.label}
            </h4>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded font-medium',
                isComplete && 'bg-green-100 text-green-700',
                isInProgress && 'bg-blue-100 text-blue-700',
                !isComplete && !isInProgress && 'bg-gray-200 text-gray-700'
              )}
            >
              {config.order}
            </span>
          </div>
          {isComplete ? (
            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          ) : isInProgress ? (
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              In Progress
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
              <Circle className="w-3 h-3 mr-1" />
              Not Started
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-700 mb-3">{config.description}</p>

        {/* Completed Info */}
        {isComplete && (
          <div className="text-xs text-green-700 mb-3">
            {requirement.completedDate && (
              <span>Completed {new Date(requirement.completedDate).toLocaleDateString()}</span>
            )}
            {requirement.completedBy && requirement.completedDate && <span> • </span>}
            {requirement.completedBy && <span>by {requirement.completedBy}</span>}
          </div>
        )}

        {/* Notes */}
        {requirement.notes && (
          <div className="text-xs text-gray-600 bg-white p-2 rounded mb-3 border border-gray-200">
            <span className="font-medium">Notes:</span> {requirement.notes}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isComplete && (
            <Button size="sm" onClick={onComplete}>
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Complete Document
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onView}>
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            {isComplete ? 'View' : 'Preview'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockDischargeData(): DischargeDocumentationData[] {
  return [
    {
      patientName: 'Margaret Johnson',
      patientId: 'PAT-001',
      admissionId: 'ADM-12345',
      admissionStartDate: '2024-09-15',
      dischargeReason: 'goals-met',
      plannedDischargeDate: '2024-12-15',
      requirements: {
        'discharge-summary': {
          status: 'complete',
          completedDate: '2024-12-08',
          completedBy: 'Emily Chen, RN',
          notes: 'Patient achieved all functional goals',
        },
        'final-visit-note': {
          status: 'complete',
          completedDate: '2024-12-10',
          completedBy: 'Sarah Johnson, PT',
        },
        'discharge-assessment': {
          status: 'complete',
          completedDate: '2024-12-10',
          completedBy: 'Emily Chen, RN',
        },
        'final-orders': {
          status: 'in-progress',
          notes: 'Waiting for physician review',
        },
        'care-plan-closure': {
          status: 'not-started',
        },
        'physician-discharge-order': {
          status: 'not-started',
        },
        'patient-education': {
          status: 'not-started',
        },
      },
      readinessPercentage: 43,
    },
    {
      patientName: 'Robert Williams',
      patientId: 'PAT-002',
      admissionId: 'ADM-12346',
      admissionStartDate: '2024-10-01',
      dischargeReason: 'transfer-facility',
      plannedDischargeDate: '2024-12-18',
      requirements: {
        'discharge-summary': {
          status: 'complete',
          completedDate: '2024-12-12',
          completedBy: 'Michael Torres, RN',
        },
        'final-visit-note': {
          status: 'complete',
          completedDate: '2024-12-12',
          completedBy: 'Michael Torres, RN',
        },
        'discharge-assessment': {
          status: 'complete',
          completedDate: '2024-12-13',
          completedBy: 'Michael Torres, RN',
        },
        'final-orders': {
          status: 'complete',
          completedDate: '2024-12-13',
          completedBy: 'Dr. Sarah Mitchell',
        },
        'care-plan-closure': {
          status: 'complete',
          completedDate: '2024-12-13',
          completedBy: 'Michael Torres, RN',
        },
        'physician-discharge-order': {
          status: 'complete',
          completedDate: '2024-12-14',
          completedBy: 'Dr. Sarah Mitchell',
        },
        'patient-education': {
          status: 'complete',
          completedDate: '2024-12-14',
          completedBy: 'Michael Torres, RN',
          notes: 'Family educated on facility transfer process',
        },
      },
      readinessPercentage: 100,
    },
    {
      patientName: 'Patricia Davis',
      patientId: 'PAT-003',
      admissionId: 'ADM-12347',
      admissionStartDate: '2024-11-01',
      dischargeReason: 'patient-refused',
      plannedDischargeDate: '2024-12-20',
      requirements: {
        'discharge-summary': {
          status: 'not-started',
        },
        'final-visit-note': {
          status: 'not-started',
        },
        'discharge-assessment': {
          status: 'not-started',
        },
        'final-orders': {
          status: 'not-started',
        },
        'care-plan-closure': {
          status: 'not-started',
        },
        'physician-discharge-order': {
          status: 'not-started',
        },
        'patient-education': {
          status: 'not-started',
        },
      },
      readinessPercentage: 0,
    },
  ];
}
