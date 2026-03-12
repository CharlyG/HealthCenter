/**
 * Recertification Readiness Tracker Component
 * 
 * Compact visual tracker showing completion status for recertification requirements.
 * Displays progress summary and highlights missing items to help staff know if
 * the recertification packet is ready to submit.
 */

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  CheckCircle,
  Circle,
  ClipboardList,
  FileText,
  Calendar,
  Stethoscope,
  FileSignature,
  AlertCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RecertificationRequirement {
  key: string;
  label: string;
  completed: boolean;
  completedDate?: string;
  completedBy?: string;
}

export interface RecertificationReadinessData {
  patientName: string;
  admissionId: string;
  certificationPeriod: number;
  certificationEndDate: string;
  daysUntilExpiration: number;
  requirements: {
    assessment: RecertificationRequirement;
    planOfCare: RecertificationRequirement;
    visitFrequency: RecertificationRequirement;
    orders: RecertificationRequirement;
    physicianSignature: RecertificationRequirement;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationReadinessTrackerProps {
  data: RecertificationReadinessData;
  variant?: 'default' | 'compact' | 'detailed';
  showHeader?: boolean;
  onItemClick?: (requirementKey: string) => void;
  onViewDetails?: () => void;
  className?: string;
}

export default function RecertificationReadinessTracker({
  data,
  variant = 'default',
  showHeader = true,
  onItemClick,
  onViewDetails,
  className,
}: RecertificationReadinessTrackerProps) {
  // Calculate readiness
  const requirements = [
    { ...data.requirements.assessment, icon: ClipboardList, color: '#3B82F6' },
    { ...data.requirements.planOfCare, icon: FileText, color: '#8B5CF6' },
    { ...data.requirements.visitFrequency, icon: Calendar, color: '#10B981' },
    { ...data.requirements.orders, icon: Stethoscope, color: '#F59E0B' },
    { ...data.requirements.physicianSignature, icon: FileSignature, color: '#EC4899' },
  ];

  const completedCount = requirements.filter(r => r.completed).length;
  const totalCount = requirements.length;
  const readinessPercentage = Math.round((completedCount / totalCount) * 100);
  const isReady = completedCount === totalCount;
  const isCritical = data.daysUntilExpiration <= 7;
  const isOverdue = data.daysUntilExpiration < 0;

  if (variant === 'compact') {
    return (
      <CompactTracker
        requirements={requirements}
        completedCount={completedCount}
        totalCount={totalCount}
        readinessPercentage={readinessPercentage}
        isReady={isReady}
        daysUntilExpiration={data.daysUntilExpiration}
        onItemClick={onItemClick}
        className={className}
      />
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recertification Readiness
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Period {data.certificationPeriod} • Expires{' '}
              {new Date(data.certificationEndDate).toLocaleDateString()}
            </p>
          </div>
          <ReadinessStatusBadge
            isReady={isReady}
            isCritical={isCritical}
            isOverdue={isOverdue}
            daysUntilExpiration={data.daysUntilExpiration}
          />
        </div>
      )}

      {/* Progress Summary */}
      <div className="mb-6">
        <ProgressSummary
          completedCount={completedCount}
          totalCount={totalCount}
          readinessPercentage={readinessPercentage}
          isReady={isReady}
        />
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-3">
        {requirements.map((requirement, index) => (
          <RequirementItem
            key={requirement.key}
            requirement={requirement}
            onClick={() => onItemClick?.(requirement.key)}
            variant={variant}
          />
        ))}
      </div>

      {/* Missing Items Alert */}
      {!isReady && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 text-sm mb-1">
                {totalCount - completedCount} Item{totalCount - completedCount !== 1 ? 's' : ''}{' '}
                Remaining
              </h4>
              <p className="text-xs text-amber-700">
                Complete all requirements before the certification period expires.
              </p>
              <div className="mt-2">
                <ul className="space-y-1">
                  {requirements
                    .filter(r => !r.completed)
                    .map(r => (
                      <li key={r.key} className="text-xs text-amber-700 flex items-center gap-2">
                        <Circle className="w-3 h-3 fill-amber-600 text-amber-600" />
                        {r.label}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Complete Success */}
      {isReady && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 text-sm mb-1">
                Recertification Packet Ready
              </h4>
              <p className="text-xs text-green-700">
                All requirements complete. Ready to submit to payer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      {variant === 'detailed' && onViewDetails && (
        <div className="mt-6 pt-6 border-t">
          <Button onClick={onViewDetails} className="w-full">
            View Full Details
          </Button>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// READINESS STATUS BADGE
// ═══════════════════════════════════════════════════════════════════════════

interface ReadinessStatusBadgeProps {
  isReady: boolean;
  isCritical: boolean;
  isOverdue: boolean;
  daysUntilExpiration: number;
}

function ReadinessStatusBadge({
  isReady,
  isCritical,
  isOverdue,
  daysUntilExpiration,
}: ReadinessStatusBadgeProps) {
  if (isOverdue) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-300">
        <AlertCircle className="w-3 h-3 mr-1" />
        {Math.abs(daysUntilExpiration)}d Overdue
      </Badge>
    );
  }

  if (isCritical && !isReady) {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-300">
        <Clock className="w-3 h-3 mr-1" />
        {daysUntilExpiration}d Remaining
      </Badge>
    );
  }

  if (isReady) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-300">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ready
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700">
      <Clock className="w-3 h-3 mr-1" />
      In Progress
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

interface ProgressSummaryProps {
  completedCount: number;
  totalCount: number;
  readinessPercentage: number;
  isReady: boolean;
}

function ProgressSummary({
  completedCount,
  totalCount,
  readinessPercentage,
  isReady,
}: ProgressSummaryProps) {
  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {completedCount} of {totalCount} Complete
          </span>
          <span className="text-sm font-bold text-gray-900">{readinessPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              isReady ? 'bg-green-600' : 'bg-blue-600'
            )}
            style={{ width: `${readinessPercentage}%` }}
          />
        </div>
      </div>

      {/* Circular Progress (Alternative) */}
      <div className="hidden">
        <CircularProgress percentage={readinessPercentage} isReady={isReady} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CIRCULAR PROGRESS
// ═══════════════════════════════════════════════════════════════════════════

function CircularProgress({
  percentage,
  isReady,
}: {
  percentage: number;
  isReady: boolean;
}) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90" width="128" height="128">
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke={isReady ? '#10B981' : '#3B82F6'}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
            <div className="text-xs text-gray-600">Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUIREMENT ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface RequirementItemProps {
  requirement: RecertificationRequirement & { icon: any; color: string };
  onClick?: () => void;
  variant?: 'default' | 'detailed';
}

function RequirementItem({ requirement, onClick, variant = 'default' }: RequirementItemProps) {
  const Icon = requirement.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-all',
        requirement.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200',
        onClick && 'cursor-pointer hover:shadow-sm'
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
          requirement.completed ? 'bg-green-100' : 'bg-white border border-gray-300'
        )}
      >
        {requirement.completed ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Icon className="w-5 h-5" style={{ color: requirement.color }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4
            className={cn(
              'font-semibold text-sm',
              requirement.completed ? 'text-green-900' : 'text-gray-900'
            )}
          >
            {requirement.label}
          </h4>
          {requirement.completed ? (
            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
              Complete
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
              Missing
            </Badge>
          )}
        </div>

        {/* Completed Info */}
        {requirement.completed && variant === 'detailed' && (
          <div className="text-xs text-green-700">
            {requirement.completedDate && (
              <span>Completed {new Date(requirement.completedDate).toLocaleDateString()}</span>
            )}
            {requirement.completedBy && requirement.completedDate && <span> • </span>}
            {requirement.completedBy && <span>by {requirement.completedBy}</span>}
          </div>
        )}

        {/* Not Completed Info */}
        {!requirement.completed && variant === 'detailed' && (
          <div className="text-xs text-gray-600 mt-1">Action required</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT TRACKER
// ═══════════════════════════════════════════════════════════════════════════

interface CompactTrackerProps {
  requirements: (RecertificationRequirement & { icon: any; color: string })[];
  completedCount: number;
  totalCount: number;
  readinessPercentage: number;
  isReady: boolean;
  daysUntilExpiration: number;
  onItemClick?: (requirementKey: string) => void;
  className?: string;
}

function CompactTracker({
  requirements,
  completedCount,
  totalCount,
  readinessPercentage,
  isReady,
  daysUntilExpiration,
  onItemClick,
  className,
}: CompactTrackerProps) {
  const isCritical = daysUntilExpiration <= 7;

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-4">
        {/* Circular Progress */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="transform -rotate-90" width="64" height="64">
            <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="6" fill="none" />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={isReady ? '#10B981' : isCritical ? '#DC2626' : '#3B82F6'}
              strokeWidth="6"
              fill="none"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 * (1 - readinessPercentage / 100)}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{readinessPercentage}%</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Recert Readiness</h4>
            {isReady ? (
              <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs">
                {completedCount}/{totalCount}
              </Badge>
            )}
          </div>

          {/* Mini Checklist */}
          <div className="flex items-center gap-1 flex-wrap">
            {requirements.map(req => {
              const Icon = req.icon;
              return (
                <button
                  key={req.key}
                  onClick={() => onItemClick?.(req.key)}
                  className={cn(
                    'w-7 h-7 rounded flex items-center justify-center transition-all',
                    req.completed
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-50 text-red-400 hover:bg-red-100'
                  )}
                  title={`${req.label} - ${req.completed ? 'Complete' : 'Missing'}`}
                >
                  {req.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockRecertificationData(): RecertificationReadinessData[] {
  return [
    {
      patientName: 'Margaret Johnson',
      admissionId: 'ADM-12345',
      certificationPeriod: 1,
      certificationEndDate: '2024-12-13',
      daysUntilExpiration: 3,
      requirements: {
        assessment: {
          key: 'assessment',
          label: 'Assessment Completed',
          completed: true,
          completedDate: '2024-12-01',
          completedBy: 'Emily Chen, RN',
        },
        planOfCare: {
          key: 'planOfCare',
          label: 'Plan of Care Updated',
          completed: true,
          completedDate: '2024-12-03',
          completedBy: 'Emily Chen, RN',
        },
        visitFrequency: {
          key: 'visitFrequency',
          label: 'Visit Frequency Reviewed',
          completed: true,
          completedDate: '2024-12-05',
          completedBy: 'Michael Torres',
        },
        orders: {
          key: 'orders',
          label: 'Orders Updated',
          completed: false,
        },
        physicianSignature: {
          key: 'physicianSignature',
          label: 'Physician Signature Obtained',
          completed: false,
        },
      },
    },
    {
      patientName: 'Robert Williams',
      admissionId: 'ADM-12346',
      certificationPeriod: 1,
      certificationEndDate: '2024-12-30',
      daysUntilExpiration: 20,
      requirements: {
        assessment: {
          key: 'assessment',
          label: 'Assessment Completed',
          completed: true,
          completedDate: '2024-12-05',
          completedBy: 'Sarah Johnson, PT',
        },
        planOfCare: {
          key: 'planOfCare',
          label: 'Plan of Care Updated',
          completed: false,
        },
        visitFrequency: {
          key: 'visitFrequency',
          label: 'Visit Frequency Reviewed',
          completed: false,
        },
        orders: {
          key: 'orders',
          label: 'Orders Updated',
          completed: false,
        },
        physicianSignature: {
          key: 'physicianSignature',
          label: 'Physician Signature Obtained',
          completed: false,
        },
      },
    },
    {
      patientName: 'Patricia Davis',
      admissionId: 'ADM-12347',
      certificationPeriod: 2,
      certificationEndDate: '2025-01-17',
      daysUntilExpiration: 38,
      requirements: {
        assessment: {
          key: 'assessment',
          label: 'Assessment Completed',
          completed: false,
        },
        planOfCare: {
          key: 'planOfCare',
          label: 'Plan of Care Updated',
          completed: false,
        },
        visitFrequency: {
          key: 'visitFrequency',
          label: 'Visit Frequency Reviewed',
          completed: false,
        },
        orders: {
          key: 'orders',
          label: 'Orders Updated',
          completed: false,
        },
        physicianSignature: {
          key: 'physicianSignature',
          label: 'Physician Signature Obtained',
          completed: false,
        },
      },
    },
    {
      patientName: 'Linda Martinez',
      admissionId: 'ADM-12348',
      certificationPeriod: 3,
      certificationEndDate: '2024-12-20',
      daysUntilExpiration: 10,
      requirements: {
        assessment: {
          key: 'assessment',
          label: 'Assessment Completed',
          completed: true,
          completedDate: '2024-11-25',
          completedBy: 'Dr. Amanda Rodriguez',
        },
        planOfCare: {
          key: 'planOfCare',
          label: 'Plan of Care Updated',
          completed: true,
          completedDate: '2024-11-26',
          completedBy: 'Emily Chen, RN',
        },
        visitFrequency: {
          key: 'visitFrequency',
          label: 'Visit Frequency Reviewed',
          completed: true,
          completedDate: '2024-11-27',
          completedBy: 'Michael Torres',
        },
        orders: {
          key: 'orders',
          label: 'Orders Updated',
          completed: true,
          completedDate: '2024-11-28',
          completedBy: 'Dr. Sarah Mitchell',
        },
        physicianSignature: {
          key: 'physicianSignature',
          label: 'Physician Signature Obtained',
          completed: true,
          completedDate: '2024-12-01',
          completedBy: 'Dr. Sarah Mitchell',
        },
      },
    },
  ];
}
