/**
 * Admission Readiness Warning Component
 * 
 * Shows warnings when attempting to schedule visits for an admission
 * that is not ready for care delivery.
 */

import { useState } from 'react';
import { AlertTriangle, XCircle, AlertCircle, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  ReadinessBadge,
  CompactReadinessChecklist,
  type AdmissionReadiness,
  type ChecklistItem,
} from './AdmissionReadiness';

// ==================== READINESS WARNING ALERT ====================

interface ReadinessWarningAlertProps {
  readiness: AdmissionReadiness;
  onViewChecklist?: () => void;
  onNavigateToItem?: (item: ChecklistItem) => void;
  allowOverride?: boolean;
  onOverride?: () => void;
}

export function ReadinessWarningAlert({
  readiness,
  onViewChecklist,
  onNavigateToItem,
  allowOverride = false,
  onOverride,
}: ReadinessWarningAlertProps) {
  if (readiness.state === 'ready_for_care') {
    return null; // No warnings needed
  }

  const { state, blockedItems, incompleteItems, checklist, blockerReasons } = readiness;

  // Critical blockers - prevent scheduling
  const criticalBlockers = checklist.filter(
    (item) => item.state === 'blocked' && item.isRequired
  );

  // Required incomplete items - warning but allow override
  const requiredIncomplete = checklist.filter(
    (item) => item.state === 'incomplete' && item.isRequired
  );

  const isCritical = criticalBlockers.length > 0;

  return (
    <Alert
      variant={isCritical ? 'destructive' : 'default'}
      className={`mb-4 ${
        isCritical
          ? 'border-red-600 bg-red-50'
          : 'border-amber-500 bg-amber-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {isCritical ? (
          <XCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">
              {isCritical ? 'Admission Blocked' : 'Admission Not Ready'}
            </h4>
            <ReadinessBadge state={state} size="sm" />
          </div>

          <AlertDescription className="text-sm text-gray-800 mb-3">
            {isCritical ? (
              <>
                This admission has <strong>{criticalBlockers.length} critical blocker(s)</strong>{' '}
                that must be resolved before scheduling visits.
              </>
            ) : (
              <>
                This admission is missing <strong>{requiredIncomplete.length} required item(s)</strong>.{' '}
                {allowOverride
                  ? 'Review the items below and proceed with caution.'
                  : 'Complete these items before scheduling.'}
              </>
            )}
          </AlertDescription>

          {/* Critical Blockers */}
          {criticalBlockers.length > 0 && (
            <div className="mb-3 space-y-2">
              {criticalBlockers.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-red-100 border border-red-300 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <XCircle className="size-4 text-red-700 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900">{item.label}</p>
                      {item.blockerReason && (
                        <p className="text-xs text-red-800 mt-1">{item.blockerReason}</p>
                      )}
                      {item.navigationPath && onNavigateToItem && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 text-xs gap-1 border-red-300 hover:bg-red-200"
                          onClick={() => onNavigateToItem(item)}
                        >
                          Resolve Blocker
                          <ChevronRight className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Required Incomplete Items */}
          {!isCritical && requiredIncomplete.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Missing Required Items:</p>
              <ul className="space-y-1">
                {requiredIncomplete.slice(0, 5).map((item) => (
                  <li key={item.id} className="text-xs text-gray-800 flex items-start gap-1.5">
                    <AlertCircle className="size-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>{item.label}</strong> — {item.description}
                    </span>
                  </li>
                ))}
                {requiredIncomplete.length > 5 && (
                  <li className="text-xs text-gray-600 italic">
                    + {requiredIncomplete.length - 5} more items
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onViewChecklist && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-8 text-xs"
                onClick={onViewChecklist}
              >
                <Eye className="size-3.5" />
                View Full Checklist
              </Button>
            )}
            {allowOverride && !isCritical && onOverride && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-8 text-xs border-amber-500 text-amber-700 hover:bg-amber-100"
                onClick={onOverride}
              >
                Schedule Anyway
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

// ==================== READINESS SUMMARY BADGE ====================

interface ReadinessSummaryBadgeProps {
  readiness: AdmissionReadiness;
  onClick?: () => void;
}

export function ReadinessSummaryBadge({ readiness, onClick }: ReadinessSummaryBadgeProps) {
  const { state, completedItems, totalItems, blockedItems } = readiness;

  const getIcon = () => {
    if (state === 'blocked') return <XCircle className="size-3.5" />;
    if (state === 'ready_for_care') return <CheckCircle2 className="size-3.5" />;
    return <AlertTriangle className="size-3.5" />;
  };

  const getColor = () => {
    if (state === 'blocked') return 'border-red-300 bg-red-50 text-red-800';
    if (state === 'ready_for_care') return 'border-green-300 bg-green-50 text-green-800';
    return 'border-amber-300 bg-amber-50 text-amber-800';
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-medium transition-all hover:shadow-sm ${getColor()}`}
    >
      {getIcon()}
      <span>
        {completedItems}/{totalItems} Complete
      </span>
      {blockedItems > 0 && (
        <Badge className="h-4 px-1 text-[9px] bg-red-600 border-0 text-white">
          {blockedItems} Blocked
        </Badge>
      )}
      {onClick && <ChevronRight className="size-3.5 ml-1" />}
    </button>
  );
}

// ==================== READINESS DIALOG ====================

interface ReadinessDialogProps {
  readiness: AdmissionReadiness;
  admissionId: string;
  patientName?: string;
  onNavigateToItem?: (item: ChecklistItem) => void;
  trigger?: React.ReactNode;
}

export function ReadinessDialog({
  readiness,
  admissionId,
  patientName,
  onNavigateToItem,
  trigger,
}: ReadinessDialogProps) {
  const [open, setOpen] = useState(false);

  const handleNavigate = (item: ChecklistItem) => {
    if (onNavigateToItem) {
      onNavigateToItem(item);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="size-4" />
            View Readiness
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Admission Readiness
            <ReadinessBadge state={readiness.state} size="sm" />
          </DialogTitle>
          <DialogDescription>
            {patientName && <span className="font-semibold">{patientName}</span>}
            {patientName && ' • '}
            Admission ID: {admissionId}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Progress Summary */}
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{readiness.completedItems}</p>
                  <p className="text-xs text-gray-600 mt-1">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{readiness.incompleteItems}</p>
                  <p className="text-xs text-gray-600 mt-1">Remaining</p>
                </div>
                {readiness.blockedItems > 0 && (
                  <div>
                    <p className="text-2xl font-bold text-red-600">{readiness.blockedItems}</p>
                    <p className="text-xs text-gray-600 mt-1">Blocked</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Readiness Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <CompactReadinessChecklist items={readiness.checklist} onNavigate={handleNavigate} />
            </CardContent>
          </Card>

          {/* Warning if not ready */}
          {readiness.state !== 'ready_for_care' && (
            <Alert className="border-amber-300 bg-amber-50">
              <AlertTriangle className="size-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-900">
                {readiness.state === 'blocked'
                  ? 'This admission is blocked and cannot be scheduled until critical items are resolved.'
                  : 'This admission is not fully ready. Complete the remaining items before scheduling visits.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== INLINE READINESS CHECK ====================

interface InlineReadinessCheckProps {
  readiness: AdmissionReadiness;
  admissionId: string;
  patientName?: string;
  onNavigateToItem?: (item: ChecklistItem) => void;
  compact?: boolean;
}

export function InlineReadinessCheck({
  readiness,
  admissionId,
  patientName,
  onNavigateToItem,
  compact = false,
}: InlineReadinessCheckProps) {
  const [showFullChecklist, setShowFullChecklist] = useState(false);

  if (readiness.state === 'ready_for_care' && compact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="size-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-900">Ready for Care</p>
          <p className="text-xs text-green-800">All requirements met</p>
        </div>
        <ReadinessBadge state={readiness.state} size="sm" />
      </div>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Admission Readiness</CardTitle>
          <ReadinessBadge state={readiness.state} size="sm" />
        </div>
      </CardHeader>
      <CardContent>
        {!showFullChecklist ? (
          <div>
            <ReadinessWarningAlert
              readiness={readiness}
              onViewChecklist={() => setShowFullChecklist(true)}
              onNavigateToItem={onNavigateToItem}
              allowOverride={false}
            />
            {readiness.state === 'ready_for_care' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="size-5 text-green-600" />
                <span className="text-sm text-green-900 font-medium">
                  All requirements met. Ready to schedule visits.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullChecklist(false)}
              className="mb-3 text-xs"
            >
              ← Back to Summary
            </Button>
            <CompactReadinessChecklist items={readiness.checklist} onNavigate={onNavigateToItem} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
