/**
 * Scheduling Validation Component
 * 
 * Validates caregiver assignment for visits based on discipline match,
 * credential validity, training requirements, and capacity.
 */

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Award,
  GraduationCap,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SchedulingValidationResult, SchedulingWarning, SchedulingBlocker } from '../../lib/caregiverManagementTypes';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SchedulingValidationProps {
  validation: SchedulingValidationResult;
  caregiverName: string;
  visitDetails?: {
    patientName: string;
    discipline: string;
    date: string;
    time: string;
  };
  onOverrideBlocker?: (blockerType: string) => void;
  onDismissWarning?: (warningType: string) => void;
}

export default function SchedulingValidation({
  validation,
  caregiverName,
  visitDetails,
  onOverrideBlocker,
  onDismissWarning,
}: SchedulingValidationProps) {
  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card className={cn(
        'p-6 border-l-4',
        validation.canBeAssigned
          ? validation.warnings.length > 0
            ? 'border-amber-500 bg-amber-50'
            : 'border-green-500 bg-green-50'
          : 'border-red-500 bg-red-50'
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            validation.canBeAssigned
              ? validation.warnings.length > 0
                ? 'bg-amber-100'
                : 'bg-green-100'
              : 'bg-red-100'
          )}>
            {validation.canBeAssigned ? (
              validation.warnings.length > 0 ? (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
          </div>

          <div className="flex-1">
            <h3 className={cn(
              'font-semibold mb-1',
              validation.canBeAssigned
                ? validation.warnings.length > 0
                  ? 'text-amber-900'
                  : 'text-green-900'
                : 'text-red-900'
            )}>
              {validation.canBeAssigned
                ? validation.warnings.length > 0
                  ? 'Assignment Possible with Warnings'
                  : 'Caregiver Can Be Assigned'
                : 'Cannot Assign Caregiver'}
            </h3>
            
            {visitDetails && (
              <p className="text-sm text-gray-700 mb-3">
                {caregiverName} → {visitDetails.patientName} ({visitDetails.discipline}) on{' '}
                {new Date(visitDetails.date).toLocaleDateString()} at {visitDetails.time}
              </p>
            )}

            {/* Validation Checks */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <ValidationCheck
                label="Discipline Match"
                passed={validation.disciplineMatch}
              />
              <ValidationCheck
                label="Credentials Valid"
                passed={validation.credentialValid}
              />
              <ValidationCheck
                label="Training Current"
                passed={validation.trainingCurrent}
              />
              <ValidationCheck
                label="Availability Match"
                passed={validation.availabilityMatch}
              />
              <ValidationCheck
                label="Workload Capacity"
                passed={validation.workloadCapacity}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Blockers */}
      {validation.blockers.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Assignment Blockers
          </h4>
          <div className="space-y-2">
            {validation.blockers.map((blocker, index) => (
              <BlockerCard
                key={index}
                blocker={blocker}
                onOverride={onOverrideBlocker}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Warnings
          </h4>
          <div className="space-y-2">
            {validation.warnings.map((warning, index) => (
              <WarningCard
                key={index}
                warning={warning}
                onDismiss={onDismissWarning}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Action Summary */}
      {!validation.canBeAssigned && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700">
            <strong>Action Required:</strong> Resolve all blockers before assigning this caregiver
            to the visit. Contact HR or the caregiver directly to update credentials or training.
          </p>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION CHECK
// ═══════════════════════════════════════════════════════════════════════════

function ValidationCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
      )}
      <span className={cn('text-sm', passed ? 'text-green-900' : 'text-red-900')}>
        {label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCKER CARD
// ═══════════════════════════════════════════════════════════════════════════

function BlockerCard({
  blocker,
  onOverride,
}: {
  blocker: SchedulingBlocker;
  onOverride?: (type: string) => void;
}) {
  const typeIcons = {
    'invalid-discipline': Award,
    'expired-credential': Shield,
    'missing-training': GraduationCap,
    'unavailable': Calendar,
    'max-capacity': TrendingUp,
  };

  const Icon = typeIcons[blocker.type] || XCircle;

  return (
    <div className="p-3 bg-white rounded-lg border border-red-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <Icon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-red-900 mb-1">{blocker.message}</div>
            {blocker.requirement && (
              <div className="text-xs text-red-700">Required: {blocker.requirement}</div>
            )}
          </div>
        </div>

        {onOverride && blocker.type !== 'invalid-discipline' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOverride(blocker.type)}
            className="text-xs"
          >
            Override
          </Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WARNING CARD
// ═══════════════════════════════════════════════════════════════════════════

function WarningCard({
  warning,
  onDismiss,
}: {
  warning: SchedulingWarning;
  onDismiss?: (type: string) => void;
}) {
  return (
    <div
      className={cn(
        'p-3 bg-white rounded-lg border',
        warning.severity === 'high'
          ? 'border-orange-200'
          : warning.severity === 'medium'
          ? 'border-amber-200'
          : 'border-yellow-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <AlertTriangle
            className={cn(
              'w-4 h-4 mt-0.5 flex-shrink-0',
              warning.severity === 'high'
                ? 'text-orange-600'
                : warning.severity === 'medium'
                ? 'text-amber-600'
                : 'text-yellow-600'
            )}
          />
          <div className="flex-1">
            <div
              className={cn(
                'font-medium mb-1',
                warning.severity === 'high'
                  ? 'text-orange-900'
                  : warning.severity === 'medium'
                  ? 'text-amber-900'
                  : 'text-yellow-900'
              )}
            >
              {warning.message}
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                warning.severity === 'high'
                  ? 'bg-orange-100 text-orange-700 border-orange-300'
                  : warning.severity === 'medium'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-yellow-100 text-yellow-700 border-yellow-300'
              )}
            >
              {warning.severity} priority
            </Badge>
          </div>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(warning.type)}
            className="text-xs"
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}
