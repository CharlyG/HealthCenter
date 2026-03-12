/**
 * ASSESSMENT STATUS CARD
 * 
 * Displays assessment with status, metadata, and quick actions
 * Reusable across all assessment types
 */

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  FileText,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Edit,
  Eye,
  MoreVertical,
  Calendar,
} from 'lucide-react';
import type { Assessment, AssessmentStatus } from '../../types/assessment';
import { ASSESSMENT_STATUS_CONFIG, ASSESSMENT_TYPES } from '../../types/assessment';

interface AssessmentStatusCardProps {
  assessment: Assessment;
  onEdit?: (assessment: Assessment) => void;
  onView?: (assessment: Assessment) => void;
  onAction?: (assessment: Assessment, action: string) => void;
  compact?: boolean;
}

export function AssessmentStatusCard({
  assessment,
  onEdit,
  onView,
  onAction,
  compact = false,
}: AssessmentStatusCardProps) {
  const statusConfig = ASSESSMENT_STATUS_CONFIG[assessment.status];
  const typeConfig = ASSESSMENT_TYPES[assessment.type];

  const canEdit = ['draft', 'in-progress', 'returned-for-correction'].includes(assessment.status);
  const needsAttention = ['pending-signature', 'pending-qa', 'returned-for-correction'].includes(
    assessment.status
  );

  return (
    <div
      className={`border rounded-lg bg-white hover:shadow-md transition-all ${
        needsAttention ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
      }`}
    >
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <FileText className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-blue-600`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                  {assessment.patientName}
                </h3>
                <p className="text-xs text-gray-600">{typeConfig.name}</p>
              </div>
              <StatusBadge status={assessment.status} compact={compact} />
            </div>

            {/* Metadata */}
            {!compact && (
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{assessment.createdBy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(assessment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Updated {new Date(assessment.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {assessment.lastAutoSave && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-saved</span>
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span className="font-medium">{assessment.percentComplete}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${assessment.percentComplete}%` }}
                />
              </div>
            </div>

            {/* Validation Issues */}
            {assessment.validationIssues.length > 0 && (
              <div className="flex items-center gap-2 mb-3 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700 font-medium">
                  {assessment.validationIssues.length} validation issue
                  {assessment.validationIssues.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <Button
                  size="sm"
                  onClick={() => onEdit(assessment)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  {compact ? 'Edit' : 'Continue Editing'}
                </Button>
              )}
              {!canEdit && onView && (
                <Button size="sm" variant="outline" onClick={() => onView(assessment)}>
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
              {assessment.status === 'pending-signature' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Sign
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => onAction?.(assessment, 'menu')}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, compact }: { status: AssessmentStatus; compact?: boolean }) {
  const config = ASSESSMENT_STATUS_CONFIG[status];
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Badge className={`${colorClasses[config.color]} ${compact ? 'text-xs' : ''}`}>
      {config.label}
    </Badge>
  );
}
