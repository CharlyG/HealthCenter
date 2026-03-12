/**
 * Status Transition Pattern
 * 
 * Manages workflow status transitions with validation and UI feedback.
 * Ensures users can only perform valid state transitions.
 * 
 * Use Cases:
 * - Visit status: Draft → In Progress → Completed → Signed
 * - Assessment: Draft → In Progress → Submitted → Approved
 * - Order: Draft → Pending → Approved → Signed
 * - Claim: Draft → Submitted → Approved → Paid
 * 
 * Design Principles:
 * - Clear current status display
 * - Show only allowed transitions
 * - Confirmation for critical transitions
 * - Audit trail of status changes
 */

import { memo, ReactNode, useState } from 'react';
import { Button } from '../ui/button';
import { StatusBadge, StatusType } from './StatusBadge';
import { ConfirmDialog } from './ConfirmDialog';
import { ChevronRight, Clock } from 'lucide-react';
import { cn } from '../ui/utils';
import { formatDistanceToNow } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface StatusTransitionRule {
  /** Status to transition from */
  from: StatusType;
  
  /** Status to transition to */
  to: StatusType;
  
  /** Action label */
  label: string;
  
  /** Requires confirmation */
  requiresConfirmation?: boolean;
  
  /** Confirmation message */
  confirmationMessage?: string;
  
  /** Validation function */
  canTransition?: () => boolean | Promise<boolean>;
  
  /** Icon for the action */
  icon?: ReactNode;
  
  /** Custom button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

export interface StatusHistory {
  status: StatusType;
  timestamp: Date;
  user: string;
  notes?: string;
}

export interface StatusTransitionProps {
  /** Current status */
  currentStatus: StatusType;
  
  /** Available transition rules */
  transitions: StatusTransitionRule[];
  
  /** Callback when status changes */
  onStatusChange: (newStatus: StatusType) => void | Promise<void>;
  
  /** Status history */
  history?: StatusHistory[];
  
  /** Show history */
  showHistory?: boolean;
  
  /** Loading state */
  loading?: boolean;
  
  /** Custom className */
  className?: string;
}

export interface StatusTimelineProps {
  /** Status history */
  history: StatusHistory[];
  
  /** Current status */
  currentStatus: StatusType;
  
  /** Compact layout */
  compact?: boolean;
  
  /** Custom className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Status Transition Component
 * Displays current status and available transition actions
 */
export const StatusTransition = memo(function StatusTransition({
  currentStatus,
  transitions,
  onStatusChange,
  history,
  showHistory = false,
  loading = false,
  className,
}: StatusTransitionProps) {
  const [pendingTransition, setPendingTransition] = useState<StatusTransitionRule | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Get available transitions from current status
  const availableTransitions = transitions.filter((t) => t.from === currentStatus);

  const handleTransition = async (rule: StatusTransitionRule) => {
    // Check if transition is allowed
    if (rule.canTransition) {
      const canProceed = await rule.canTransition();
      if (!canProceed) return;
    }

    // Show confirmation if required
    if (rule.requiresConfirmation) {
      setPendingTransition(rule);
      setConfirmOpen(true);
      return;
    }

    // Execute transition
    await executeTransition(rule);
  };

  const executeTransition = async (rule: StatusTransitionRule) => {
    setProcessing(true);
    try {
      await onStatusChange(rule.to);
      setPendingTransition(null);
      setConfirmOpen(false);
    } catch (error) {
      console.error('Status transition failed:', error);
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Status */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Current Status</div>
          <StatusBadge status={currentStatus} size="lg" />
        </div>

        {history && history.length > 0 && (
          <div className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            Updated {formatDistanceToNow(history[history.length - 1].timestamp, { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Available Transitions */}
      {availableTransitions.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">Available Actions</div>
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map((transition, index) => (
              <Button
                key={index}
                variant={transition.variant || 'outline'}
                onClick={() => handleTransition(transition)}
                disabled={loading || processing}
                className="flex items-center gap-2"
              >
                {transition.icon}
                {transition.label}
                <ChevronRight className="w-4 h-4 opacity-50" />
                <StatusBadge
                  status={transition.to}
                  size="sm"
                  showIcon={false}
                />
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Status History */}
      {showHistory && history && history.length > 0 && (
        <div className="pt-4 border-t">
          <div className="text-sm font-medium text-gray-700 mb-3">Status History</div>
          <StatusTimeline history={history} currentStatus={currentStatus} />
        </div>
      )}

      {/* Confirmation Dialog */}
      {pendingTransition && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={() => executeTransition(pendingTransition)}
          title={`${pendingTransition.label}?`}
          description={
            pendingTransition.confirmationMessage ||
            `Are you sure you want to change the status to ${pendingTransition.to}?`
          }
          confirmText={pendingTransition.label}
          variant="info"
          loading={processing}
        />
      )}
    </div>
  );
});

/**
 * Status Timeline Component
 * Visual history of status changes
 */
export const StatusTimeline = memo(function StatusTimeline({
  history,
  currentStatus,
  compact = false,
  className,
}: StatusTimelineProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {history.map((item, index) => {
        const isLast = index === history.length - 1;
        const isCurrent = item.status === currentStatus;

        return (
          <div key={index} className="flex gap-3">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full border-2',
                  isCurrent
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-gray-300 border-gray-300'
                )}
              />
              {!isLast && (
                <div className="w-0.5 h-full bg-gray-200 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1 pb-4', isLast && 'pb-0')}>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge
                  status={item.status}
                  size={compact ? 'sm' : 'md'}
                />
                {isCurrent && (
                  <span className="text-xs text-blue-600 font-medium">Current</span>
                )}
              </div>

              <div className={cn(
                'text-gray-600',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {item.user} · {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </div>

              {item.notes && !compact && (
                <div className="mt-1 text-sm text-gray-500 italic">
                  {item.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

StatusTransition.displayName = 'StatusTransition';
StatusTimeline.displayName = 'StatusTimeline';

export default StatusTransition;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// VISIT STATUS WORKFLOW
import { StatusTransition, StatusTransitionRule } from './components/patterns/StatusTransition';

const visitTransitions: StatusTransitionRule[] = [
  // Draft → Scheduled
  {
    from: 'draft',
    to: 'scheduled',
    label: 'Schedule Visit',
    icon: <Calendar className="w-4 h-4" />,
  },
  // Scheduled → In Progress
  {
    from: 'scheduled',
    to: 'in-progress',
    label: 'Start Visit',
    canTransition: async () => {
      // Check if visit is ready to start
      return await checkVisitReadiness();
    },
  },
  // In Progress → Completed
  {
    from: 'in-progress',
    to: 'completed',
    label: 'Complete Visit',
    requiresConfirmation: true,
    confirmationMessage: 'Mark this visit as completed? Documentation must be finalized before submission.',
  },
  // Completed → Submitted
  {
    from: 'completed',
    to: 'submitted',
    label: 'Submit for Review',
    requiresConfirmation: true,
    confirmationMessage: 'Submit visit for QA review? You will not be able to edit after submission.',
  },
  // Submitted → Signed
  {
    from: 'submitted',
    to: 'signed',
    label: 'Sign Document',
    requiresConfirmation: true,
    confirmationMessage: 'Electronically sign this document? This action is final.',
  },
];

function VisitStatusManager({ visit, onUpdate }) {
  const [statusHistory, setStatusHistory] = useState(visit.statusHistory || []);

  const handleStatusChange = async (newStatus) => {
    // Update visit status
    await updateVisitStatus(visit.id, newStatus);
    
    // Add to history
    const historyEntry = {
      status: newStatus,
      timestamp: new Date(),
      user: currentUser.name,
    };
    setStatusHistory([...statusHistory, historyEntry]);
    
    onUpdate();
  };

  return (
    <StatusTransition
      currentStatus={visit.status}
      transitions={visitTransitions}
      onStatusChange={handleStatusChange}
      history={statusHistory}
      showHistory
    />
  );
}

// ASSESSMENT WORKFLOW
const assessmentTransitions: StatusTransitionRule[] = [
  {
    from: 'draft',
    to: 'in-progress',
    label: 'Start Assessment',
  },
  {
    from: 'in-progress',
    to: 'submitted',
    label: 'Submit Assessment',
    requiresConfirmation: true,
    confirmationMessage: 'Submit this assessment? All required fields must be completed.',
    canTransition: async () => {
      return validateAssessment();
    },
  },
  {
    from: 'submitted',
    to: 'approved',
    label: 'Approve',
    variant: 'default',
  },
  {
    from: 'submitted',
    to: 'returned',
    label: 'Return for Corrections',
    variant: 'destructive',
    requiresConfirmation: true,
  },
];

// ORDER STATUS WORKFLOW
const orderTransitions: StatusTransitionRule[] = [
  {
    from: 'draft',
    to: 'pending',
    label: 'Submit Order',
    requiresConfirmation: true,
  },
  {
    from: 'pending',
    to: 'approved',
    label: 'Approve',
  },
  {
    from: 'approved',
    to: 'signed',
    label: 'Send for Signature',
    requiresConfirmation: true,
  },
  {
    from: 'approved',
    to: 'cancelled',
    label: 'Cancel Order',
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationMessage: 'Cancel this order? This action cannot be undone.',
  },
];

// COMPACT TIMELINE VIEW
function DocumentStatusSidebar({ document }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-3">Document Status</h3>
      <StatusTimeline
        history={document.statusHistory}
        currentStatus={document.status}
        compact
      />
    </div>
  );
}

// CUSTOM VALIDATION
const customTransitions: StatusTransitionRule[] = [
  {
    from: 'in-progress',
    to: 'completed',
    label: 'Complete',
    canTransition: async () => {
      // Check if all required sections are filled
      const validationResult = await validateDocument();
      if (!validationResult.valid) {
        toast.error(`Cannot complete: ${validationResult.errors.join(', ')}`);
        return false;
      }
      return true;
    },
  },
];

// INTEGRATED WITH FORM MODE
function DocumentEditor() {
  const formMode = useFormMode();
  const [document, setDocument] = useState(initialDocument);

  return (
    <FormModeWrapper
      mode={formMode.mode}
      header={{ title: 'Clinical Document' }}
      actions={{
        onPrimaryAction: formMode.isReadOnly ? formMode.enterEditMode : formMode.save,
        onSecondaryAction: formMode.cancel,
      }}
    >
      <div className="grid grid-cols-3 gap-6">
        {/* Main content *\/}
        <div className="col-span-2">
          <DocumentForm readOnly={formMode.isReadOnly} />
        </div>

        {/* Status sidebar *\/}
        <div>
          <StatusTransition
            currentStatus={document.status}
            transitions={documentTransitions}
            onStatusChange={async (newStatus) => {
              await updateDocumentStatus(document.id, newStatus);
              setDocument({ ...document, status: newStatus });
            }}
            showHistory
            history={document.statusHistory}
          />
        </div>
      </div>
    </FormModeWrapper>
  );
}
*/
