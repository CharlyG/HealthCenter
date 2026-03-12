/**
 * Extended UX Patterns Demo
 * 
 * Comprehensive demonstration of the 7 additional UX patterns.
 * 
 * This demo showcases:
 * 1. Activity Logging
 * 2. Retry Behavior
 * 3. Long-Running Operations
 * 4. Alert Severity System
 * 5. Inline Help
 * 6. Empty States
 * 7. Interaction Rules
 */

import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  Pill,
  Users,
  Plus,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';

// Activity Logging
import {
  ActivityLoggerProvider,
  ActivityTimeline,
  useActivityLog,
  ActivityAuditTable
} from './activity-logging';

// Retry Behavior
import {
  RetryableOperation,
  RetryButton,
  RetryStatusIndicator,
  FailedOperationsQueue,
  useRetry,
  type RetryStatus
} from './retry-behavior';

// Long-Running Operations
import {
  LongRunningOperation,
  ProgressBar,
  TimeRemaining,
  OperationStatusCard,
  StepProgress,
  BackgroundOperationsTray,
  type OperationProgress,
  type OperationStep,
  type BackgroundOperation
} from './long-running-ops';

// Alert Severity
import {
  AlertProvider,
  useAlert,
  Alert,
  AlertQueue,
  InlineAlert,
  NotificationBadge
} from './alert-severity';

// Inline Help
import {
  HelpTooltip,
  HelpIcon,
  FieldWithHelp,
  HelpPanel,
  ContextualHelp
} from './inline-help';

// Empty States
import {
  EmptyState,
  NoVisitsScheduled,
  NoMedications,
  NoSearchResults,
  EmptyTable,
  EmptyUpload,
  OnboardingEmpty
} from './empty-states';

// Interaction Rules
import {
  ConfirmationProvider,
  useConfirmation,
  useAutoSave,
  SaveStatusIndicator,
  ActionButton,
  ErrorDisplay,
  type SaveStatus
} from './interaction-rules';

// ==================== DEMO COMPONENT ====================

export const ExtendedPatternsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('activity-logging');

  const tabs = [
    { id: 'activity-logging', label: 'Activity Logging' },
    { id: 'retry', label: 'Retry Behavior' },
    { id: 'long-running', label: 'Long-Running Ops' },
    { id: 'alerts', label: 'Alert Severity' },
    { id: 'help', label: 'Inline Help' },
    { id: 'empty-states', label: 'Empty States' },
    { id: 'interaction-rules', label: 'Interaction Rules' }
  ];

  return (
    <ActivityLoggerProvider persistToServer={false}>
      <AlertProvider maxAlerts={10}>
        <ConfirmationProvider>
          <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Extended UX Patterns Demo
                </h1>
                <p className="text-gray-600">
                  Demonstration of 7 additional UX patterns for the healthcare platform
                </p>
              </header>

              {/* Tab Navigation */}
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                {activeTab === 'activity-logging' && <ActivityLoggingDemo />}
                {activeTab === 'retry' && <RetryBehaviorDemo />}
                {activeTab === 'long-running' && <LongRunningOpsDemo />}
                {activeTab === 'alerts' && <AlertSeverityDemo />}
                {activeTab === 'help' && <InlineHelpDemo />}
                {activeTab === 'empty-states' && <EmptyStatesDemo />}
                {activeTab === 'interaction-rules' && <InteractionRulesDemo />}
              </div>

              {/* Global Alert Queue */}
              <AlertQueue position="top-right" maxVisible={5} />
            </div>
          </div>
        </ConfirmationProvider>
      </AlertProvider>
    </ActivityLoggerProvider>
  );
};

// ==================== ACTIVITY LOGGING DEMO ====================

const ActivityLoggingDemo: React.FC = () => {
  const { logDocumentEdit, logStatusChange, logOrderSubmission } = useActivityLog();

  const handleLogDocument = () => {
    logDocumentEdit(
      'note-123',
      'user-001',
      'Dr. Sarah Johnson',
      ['vital_signs', 'medications']
    );
  };

  const handleLogStatus = () => {
    logStatusChange(
      'order',
      'order-456',
      'user-001',
      'Dr. Sarah Johnson',
      'Draft',
      'Submitted'
    );
  };

  const handleLogOrder = () => {
    logOrderSubmission('order-789', 'user-001', 'Dr. Sarah Johnson', 'Medication Order');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Logging</h2>
        <p className="text-gray-600 mb-6">
          Automatic activity logging for audit trails and timelines. All user actions are
          logged and can be displayed in various formats.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={handleLogDocument}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Log Document Edit
        </button>
        <button
          onClick={handleLogStatus}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Log Status Change
        </button>
        <button
          onClick={handleLogOrder}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Log Order Submission
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
        <ActivityTimeline
          entityType="patient"
          entityId="patient-001"
          maxItems={10}
          showUser
        />
      </div>
    </div>
  );
};

// ==================== RETRY BEHAVIOR DEMO ====================

const RetryBehaviorDemo: React.FC = () => {
  const [retryStatus, setRetryStatus] = useState<RetryStatus | null>(null);
  const { failedOperations, addFailedOperation, retryOperation, dismissOperation } = useRetry();

  const simulateFailedOperation = async () => {
    throw new Error('Network timeout - simulated failure');
  };

  const handleAddFailedOp = () => {
    addFailedOperation({
      id: `op-${Date.now()}`,
      name: 'EVV Transmission',
      timestamp: new Date(),
      error: new Error('Failed to transmit EVV data'),
      retry: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return;
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Retry Behavior</h2>
        <p className="text-gray-600 mb-6">
          Automatic retry with configurable strategies. Failed operations can be retried
          with exponential backoff, linear delay, or custom strategies.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Retryable Operation</h3>
          <RetryableOperation
            operation={simulateFailedOperation}
            operationName="EVV Transmission"
            config={{
              maxRetries: 3,
              strategy: 'exponential'
            }}
            autoStart={false}
          >
            {(status, { start }) => (
              <div className="space-y-3">
                <RetryStatusIndicator
                  status={status}
                  operationName="EVV Transmission"
                  onManualRetry={start}
                />
                {status.status === 'idle' && (
                  <button
                    onClick={start}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Start Operation
                  </button>
                )}
              </div>
            )}
          </RetryableOperation>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Retry Button</h3>
          <RetryButton
            operation={async () => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }}
            label="Retry Integration Sync"
            showProgress
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Failed Operations Queue</h3>
          <button
            onClick={handleAddFailedOp}
            className="mb-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
          >
            Simulate Failed Operation
          </button>
          <FailedOperationsQueue
            operations={failedOperations}
            onRetry={retryOperation}
            onDismiss={dismissOperation}
          />
        </div>
      </div>
    </div>
  );
};

// ==================== LONG-RUNNING OPS DEMO ====================

const LongRunningOpsDemo: React.FC = () => {
  const [showOperation, setShowOperation] = useState(false);
  const [backgroundOps, setBackgroundOps] = useState<BackgroundOperation[]>([]);

  const generateReport = async (onProgress: (p: OperationProgress) => void) => {
    onProgress({ percentage: 0, status: 'running', currentStep: 'Initializing...' });
    await new Promise((r) => setTimeout(r, 1000));

    onProgress({ percentage: 25, status: 'running', currentStep: 'Fetching data...' });
    await new Promise((r) => setTimeout(r, 1500));

    onProgress({ percentage: 50, status: 'running', currentStep: 'Processing records...' });
    await new Promise((r) => setTimeout(r, 2000));

    onProgress({ percentage: 75, status: 'running', currentStep: 'Generating file...' });
    await new Promise((r) => setTimeout(r, 1500));

    onProgress({ percentage: 100, status: 'complete', message: 'Report generated!' });
    return { success: true };
  };

  const steps: OperationStep[] = [
    { id: '1', label: 'Exporting patient data', status: 'complete' },
    { id: '2', label: 'Processing 1,234 records', status: 'active', message: '67% complete' },
    { id: '3', label: 'Generating PDF file', status: 'pending' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Long-Running Operations</h2>
        <p className="text-gray-600 mb-6">
          Progress feedback for operations that take significant time. Shows progress bars,
          estimated time, and step-by-step indicators.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Progress Bar</h3>
          <ProgressBar percentage={67} label="Processing..." showPercentage />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Time Remaining</h3>
          <TimeRemaining milliseconds={45000} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Step Progress</h3>
          <StepProgress steps={steps} orientation="vertical" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Complete Operation</h3>
          {!showOperation ? (
            <button
              onClick={() => setShowOperation(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Generate Report
            </button>
          ) : (
            <LongRunningOperation
              operation={generateReport}
              operationName="Report Generation"
              config={{
                estimatedDuration: 6000,
                onComplete: () => {
                  setTimeout(() => setShowOperation(false), 2000);
                }
              }}
            >
              {(progress) => (
                <OperationStatusCard
                  progress={progress}
                  operationName="Generating Report"
                  showTimeRemaining
                  showProgressBar
                />
              )}
            </LongRunningOperation>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== ALERT SEVERITY DEMO ====================

const AlertSeverityDemo: React.FC = () => {
  const { critical, warning, info, success } = useAlert();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Severity System</h2>
        <p className="text-gray-600 mb-6">
          Tiered alert system with three severity levels: Critical, Warning, and Info.
          Alerts are prioritized and displayed with appropriate visual styling.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() =>
            critical('Patient Safety Alert', 'Drug interaction detected between medications', {
              actions: [
                { label: 'Review Now', onClick: () => alert('Reviewing...'), variant: 'danger' }
              ]
            })
          }
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Show Critical Alert
        </button>
        <button
          onClick={() => warning('Missing Documentation', 'Visit notes incomplete for today')}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
        >
          Show Warning Alert
        </button>
        <button
          onClick={() => info('New Feature Available', 'Check out the new documentation assistant')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Show Info Alert
        </button>
        <button
          onClick={() => success('Order Submitted', 'Medication order submitted successfully')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Show Success Alert
        </button>
      </div>

      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Inline Alerts</h3>
        <InlineAlert severity="critical" message="This field requires immediate attention" />
        <InlineAlert severity="warning" message="This value seems unusual" />
        <InlineAlert severity="info" message="Remember to save your changes" compact />
      </div>
    </div>
  );
};

// ==================== INLINE HELP DEMO ====================

const InlineHelpDemo: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Inline Help System</h2>
        <p className="text-gray-600 mb-6">
          Contextual help system with tooltips, popovers, and detailed side panels.
          Includes CMS references and regulatory guidance.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Simple Tooltip:</span>
          <HelpTooltip content="This is a helpful tooltip that provides quick context" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Detailed Help Icon:</span>
          <HelpIcon
            title="OASIS M1021 - Primary Diagnosis"
            content="The primary diagnosis most related to the current plan of care."
            cmsReference="OASIS-E Guidance Manual, Chapter 3, Section M1021"
            examples={['I50.9 - Heart failure, unspecified', 'I10 - Essential hypertension']}
          />
        </div>

        <FieldWithHelp
          label="Functional Score"
          helpContent="Rate patient's ability to perform activity"
          helpDetails="0=Unable, 1=Substantial Assistance, 2=Partial Assistance, 3=Supervision, 4=Independent"
          cmsReference="OASIS M1850 - Transferring"
          required
        >
          <input
            type="number"
            min={0}
            max={4}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FieldWithHelp>

        <button
          onClick={() => setShowPanel(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Open Help Panel
        </button>

        <HelpPanel isOpen={showPanel} onClose={() => setShowPanel(false)} title="Assessment Help">
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              This panel provides detailed help content for complex workflows.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-1">CMS Guidance</p>
              <p className="text-xs text-blue-800">
                Follow OASIS-E manual guidelines for accurate assessment completion.
              </p>
            </div>
          </div>
        </HelpPanel>
      </div>
    </div>
  );
};

// ==================== EMPTY STATES DEMO ====================

const EmptyStatesDemo: React.FC = () => {
  const [activeExample, setActiveExample] = useState<string>('visits');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Empty States</h2>
        <p className="text-gray-600 mb-6">
          Helpful empty state components with suggested actions. Guides users when no data
          is available.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {['visits', 'medications', 'search', 'upload', 'onboarding'].map((example) => (
          <button
            key={example}
            onClick={() => setActiveExample(example)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeExample === example
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {example.charAt(0).toUpperCase() + example.slice(1)}
          </button>
        ))}
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        {activeExample === 'visits' && (
          <NoVisitsScheduled onAction={() => alert('Schedule visit clicked')} />
        )}
        {activeExample === 'medications' && (
          <NoMedications onAction={() => alert('Add medication clicked')} />
        )}
        {activeExample === 'search' && (
          <NoSearchResults query="patient xyz" onReset={() => alert('Clear search')} />
        )}
        {activeExample === 'upload' && (
          <EmptyUpload
            onUpload={() => alert('Upload clicked')}
            acceptedFormats={['PDF', 'JPG', 'PNG']}
            maxSize="10MB"
          />
        )}
        {activeExample === 'onboarding' && (
          <OnboardingEmpty
            title="Welcome to Care Dashboard"
            steps={[
              {
                icon: Users,
                title: 'Add Patients',
                description: 'Start by adding your first patient',
                action: { label: 'Add Patient', onClick: () => alert('Add patient') }
              },
              {
                icon: Calendar,
                title: 'Schedule Visits',
                description: 'Create visit schedules',
                action: { label: 'Schedule', onClick: () => alert('Schedule') }
              },
              {
                icon: FileText,
                title: 'Document Care',
                description: 'Create clinical notes',
                action: { label: 'Create Note', onClick: () => alert('Create note') }
              }
            ]}
          />
        )}
      </div>
    </div>
  );
};

// ==================== INTERACTION RULES DEMO ====================

const InteractionRulesDemo: React.FC = () => {
  const { confirm } = useConfirmation();
  const [formData, setFormData] = useState({ notes: '' });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const { status, scheduleAutoSave } = useAutoSave({
    onSave: async (data) => {
      // Simulate save
      await new Promise((r) => setTimeout(r, 1000));
      console.log('Saved:', data);
    },
    debounceMs: 2000
  });

  const handleChange = (value: string) => {
    setFormData({ notes: value });
    scheduleAutoSave({ notes: value });
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Patient Record?',
      message: 'This action cannot be undone. All patient data will be permanently deleted.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmVariant: 'danger',
      icon: 'warning'
    });

    if (confirmed) {
      alert('Patient deleted (simulated)');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Interaction Rules</h2>
        <p className="text-gray-600 mb-6">
          System-wide consistency patterns including save behavior, confirmations, and
          navigation rules.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Auto-Save Behavior</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Clinical Notes</label>
              <SaveStatusIndicator status={status} compact />
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Type to trigger auto-save (2s debounce)..."
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Confirmation Dialog</h3>
          <ActionButton
            label="Delete Patient"
            onClick={handleDelete}
            variant="danger"
            requireConfirmation
            confirmationOptions={{
              title: 'Delete Patient?',
              message: 'This action cannot be undone',
              confirmLabel: 'Delete',
              confirmVariant: 'danger',
              icon: 'warning'
            }}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Action Buttons</h3>
          <div className="flex gap-3">
            <ActionButton
              label="Save Changes"
              onClick={async () => {
                await new Promise((r) => setTimeout(r, 1000));
                alert('Saved!');
              }}
              variant="primary"
            />
            <ActionButton
              label="Cancel"
              onClick={() => alert('Cancelled')}
              variant="secondary"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Error Display</h3>
          <ErrorDisplay
            error={new Error('Failed to save patient record. Please check your connection.')}
            onRetry={() => alert('Retrying...')}
            variant="banner"
          />
        </div>
      </div>
    </div>
  );
};

export default ExtendedPatternsDemo;
