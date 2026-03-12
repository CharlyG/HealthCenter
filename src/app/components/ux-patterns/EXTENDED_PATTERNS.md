# Extended UX Patterns Documentation

This document covers the 7 additional UX patterns that extend the core system to 14 total patterns.

## Table of Contents

1. [Activity Logging](#activity-logging)
2. [Retry Behavior](#retry-behavior)
3. [Long-Running Operations](#long-running-operations)
4. [Alert Severity System](#alert-severity-system)
5. [Inline Help](#inline-help)
6. [Empty States](#empty-states)
7. [Interaction Rules](#interaction-rules)

---

## 1. Activity Logging

**Purpose**: Automatic activity logging for audit trails and timelines.

### Features

- Automatic action logging
- Timeline visualization
- Audit trail generation
- Filterable activity history

### Usage

```tsx
import {
  ActivityLoggerProvider,
  useActivityLogger,
  ActivityTimeline,
  useActivityLog
} from '@/components/ux-patterns';

// Wrap your app with the provider
<ActivityLoggerProvider persistToServer={true}>
  <YourApp />
</ActivityLoggerProvider>

// Log activities
const { logActivity } = useActivityLogger();

logActivity({
  type: 'document_edit',
  entity: 'clinical_note',
  entityId: 'note-123',
  userId: 'user-456',
  description: 'Updated vital signs',
  metadata: { section: 'vitals', changes: ['blood_pressure'] }
});

// Display activity timeline
<ActivityTimeline
  entityType="patient"
  entityId="patient-123"
  filters={['document_edit', 'status_change']}
/>

// Use convenience hooks
const { logDocumentEdit, logStatusChange, logOrderSubmission } = useActivityLog();
logDocumentEdit('doc-123', 'user-456', 'Dr. Smith', ['vitals', 'medications']);
```

### Activity Types

- `document_edit` - Document modifications
- `document_create` - New document creation
- `status_change` - Status transitions
- `order_submission` - Order submissions
- `integration_sync` - Integration synchronization
- `user_action` - General user actions
- `system_event` - Automated system events
- `approval` - Approval actions
- `rejection` - Rejection actions

---

## 2. Retry Behavior

**Purpose**: Automatic retry with configurable strategies for failed operations.

### Features

- Configurable retry strategies (exponential, linear, immediate, custom)
- Progress feedback and status updates
- Manual retry triggers
- Failed operation queuing

### Usage

```tsx
import {
  RetryableOperation,
  RetryButton,
  RetryStatusIndicator,
  FailedOperationsQueue,
  useRetry
} from '@/components/ux-patterns';

// Auto-retry with exponential backoff
<RetryableOperation
  operation={async () => await sendEVVData(visit)}
  operationName="EVV Transmission"
  config={{
    maxRetries: 3,
    strategy: 'exponential',
    baseDelay: 1000
  }}
  onSuccess={() => toast.success('EVV sent')}
  onFinalFailure={(error) => toast.error('Failed to send EVV')}
/>

// Manual retry button
<RetryButton
  operation={retryFailedIntegration}
  label="Retry Integration"
  showProgress
  onSuccess={() => console.log('Success!')}
/>

// Failed operations queue
const { failedOperations, retryOperation, dismissOperation, retryAll } = useRetry();

<FailedOperationsQueue
  operations={failedOperations}
  onRetry={retryOperation}
  onDismiss={dismissOperation}
  onRetryAll={retryAll}
/>
```

### Retry Strategies

- **Immediate**: No delay between retries (0ms)
- **Linear**: Delay increases linearly (1s, 2s, 3s...)
- **Exponential**: Delay doubles each time (1s, 2s, 4s, 8s...) - **Default**
- **Custom**: Provide custom delay function

---

## 3. Long-Running Operations

**Purpose**: Progress feedback for operations that take significant time.

### Features

- Progress bars with percentage
- Estimated time remaining
- Step-by-step progress indicators
- Background operation tracking
- Cancellation support

### Usage

```tsx
import {
  LongRunningOperation,
  ProgressBar,
  TimeRemaining,
  OperationStatusCard,
  StepProgress,
  BackgroundOperationsTray
} from '@/components/ux-patterns';

// Report generation with progress
<LongRunningOperation
  operation={async (onProgress) => {
    // Update progress during operation
    onProgress({ percentage: 25, status: 'running', currentStep: 'Fetching data' });
    await fetchData();
    
    onProgress({ percentage: 50, status: 'running', currentStep: 'Processing' });
    await processData();
    
    onProgress({ percentage: 100, status: 'complete' });
    return result;
  }}
  operationName="Generating Report"
  config={{
    estimatedDuration: 30000,
    allowCancel: true,
    onComplete: (result) => downloadReport(result)
  }}
/>

// Multi-step progress
<StepProgress
  steps={[
    { id: '1', label: 'Exporting data', status: 'complete' },
    { id: '2', label: 'Processing records', status: 'active', message: '1,234 of 5,000 processed' },
    { id: '3', label: 'Generating file', status: 'pending' }
  ]}
  orientation="vertical"
/>

// Background operations tray
<BackgroundOperationsTray
  operations={backgroundOps}
  position="bottom-right"
/>
```

---

## 4. Alert Severity System

**Purpose**: Tiered alert system with severity levels and action requirements.

### Features

- Three severity levels: Critical, Warning, Info, Success
- Visual distinction by severity
- Action buttons based on urgency
- Dismissible/persistent modes
- Alert queuing and prioritization

### Usage

```tsx
import {
  AlertProvider,
  useAlerts,
  useAlert,
  Alert,
  AlertBanner,
  AlertQueue,
  InlineAlert,
  NotificationBadge
} from '@/components/ux-patterns';

// Wrap app with provider
<AlertProvider maxAlerts={10} autoDismissTimeout={5000}>
  <YourApp />
</AlertProvider>

// Create alerts using hooks
const { critical, warning, info, success } = useAlert();

// Critical alert (persistent, requires action)
critical(
  'Patient Safety Alert',
  'Drug interaction detected between medications',
  {
    actions: [
      { label: 'Review Now', onClick: handleReview, variant: 'danger' },
      { label: 'Override', onClick: handleOverride }
    ]
  }
);

// Warning alert (dismissible)
warning('Missing Documentation', 'Visit notes incomplete');

// Success alert (auto-dismiss)
success('Order Submitted', 'Order sent successfully');

// Display alerts
<AlertQueue position="top-right" maxVisible={5} />

// Inline alert
<InlineAlert severity="warning" message="This field is required" compact />

// Notification badge
<NotificationBadge count={criticalAlerts.length} severity="critical" onClick={showAlerts} />
```

### Severity Rules

- **Critical**: Requires immediate action, blocks workflow, persistent
- **Warning**: Indicates potential problems, suggests action, dismissible
- **Info**: Provides context without urgency, auto-dismiss
- **Success**: Confirms successful operations, auto-dismiss

---

## 5. Inline Help

**Purpose**: Contextual help system with tooltips and detailed explanations.

### Features

- Help icons near complex fields
- Tooltip-based quick help
- Side panel for detailed explanations
- CMS references and regulatory guidance
- Examples and best practices
- Searchable help content

### Usage

```tsx
import {
  HelpTooltip,
  HelpIcon,
  FieldWithHelp,
  HelpPanel,
  HelpSection,
  ContextualHelp,
  QuickHelpBadge
} from '@/components/ux-patterns';

// Simple tooltip
<HelpTooltip content="Enter patient's primary diagnosis code" />

// Detailed help with CMS reference
<HelpIcon
  title="OASIS M1021 - Primary Diagnosis"
  content="The primary diagnosis most related to the current plan of care."
  cmsReference="OASIS-E Guidance Manual, Chapter 3, Section M1021"
  examples={[
    'I50.9 - Heart failure, unspecified',
    'I10 - Essential hypertension'
  ]}
  links={[
    { label: 'CMS OASIS Guidance', url: 'https://cms.gov/oasis' }
  ]}
/>

// Field with inline help
<FieldWithHelp
  label="Functional Score"
  helpContent="Rate patient's ability on scale of 0-4"
  helpDetails="0=Unable, 1=Substantial Assistance, 2=Partial Assistance, 3=Supervision, 4=Independent"
  cmsReference="OASIS M1850"
  required
  error={errors.functionalScore}
>
  <input type="number" min={0} max={4} />
</FieldWithHelp>

// Contextual help panel
<ContextualHelp
  context="OASIS Assessment"
  helpItems={[
    {
      title: 'M1021 - Primary Diagnosis',
      content: 'Primary diagnosis description...',
      cmsReference: 'OASIS-E Chapter 3',
      examples: ['I50.9', 'I10'],
      keywords: ['diagnosis', 'icd10', 'primary']
    }
  ]}
/>
```

---

## 6. Empty States

**Purpose**: Helpful empty state components with suggested actions.

### Features

- Context-specific empty messages
- Suggested actions (CTAs)
- Visual consistency
- Onboarding guidance
- Quick action buttons

### Usage

```tsx
import {
  EmptyState,
  NoVisitsScheduled,
  NoMedications,
  NoDocuments,
  NoSearchResults,
  NoFilterResults,
  ErrorState,
  SuccessState,
  EmptyTable,
  EmptyList,
  EmptyCard,
  EmptyUpload,
  OnboardingEmpty
} from '@/components/ux-patterns';

// Generic empty state
<EmptyState
  icon={Calendar}
  title="No visits scheduled"
  description="Schedule your first visit to get started"
  action={{
    label: 'Schedule Visit',
    onClick: handleScheduleVisit,
    icon: Plus
  }}
  size="md"
/>

// Preset empty states
<NoVisitsScheduled onAction={handleSchedule} />
<NoMedications onAction={handleAddMedication} />
<NoDocuments onAction={handleCreateDocument} />
<NoSearchResults query={searchQuery} onReset={clearSearch} />
<NoFilterResults onReset={clearFilters} />
<ErrorState message="Failed to load data" onRetry={retryLoad} />

// Empty table
<table>
  <tbody>
    <EmptyTable
      columns={5}
      icon={Users}
      message="No patients found"
      action={{ label: 'Add Patient', onClick: handleAdd }}
    />
  </tbody>
</table>

// Empty upload area
<EmptyUpload
  onUpload={handleUpload}
  acceptedFormats={['PDF', 'JPG', 'PNG']}
  maxSize="10MB"
/>

// Onboarding empty state
<OnboardingEmpty
  title="Welcome to your Care Dashboard"
  steps={[
    {
      icon: Users,
      title: 'Add Patients',
      description: 'Start by adding your first patient',
      action: { label: 'Add Patient', onClick: handleAddPatient }
    },
    {
      icon: Calendar,
      title: 'Schedule Visits',
      description: 'Create visit schedules',
      action: { label: 'Schedule', onClick: handleSchedule }
    }
  ]}
/>
```

---

## 7. Interaction Rules

**Purpose**: System-wide consistency patterns and interaction behaviors.

### Features

- Consistent save behavior (auto-save vs manual)
- Standard confirmation dialogs
- Unsaved changes warnings
- Action button patterns
- Error display consistency

### Core Rules

#### Rule 1: Save Behavior
- Forms with <5 fields: Manual save with "Save" button
- Forms with 5+ fields: Auto-save with debounce (2s default)
- Always show save status indicator
- Provide undo option for auto-saved changes

#### Rule 2: Navigation Patterns
- Use React Router for all navigation
- Preserve scroll position on back navigation
- Show loading state during route transitions
- Breadcrumbs for hierarchical navigation

#### Rule 3: Error Handling
- Inline errors for form validation
- Toast notifications for operation failures
- Error boundaries for component crashes
- Retry buttons for network failures

#### Rule 4: Confirmation Dialogs
- Destructive actions require confirmation
- Confirmation shows what will happen
- Primary action on the right
- Escape key dismisses dialog

#### Rule 5: Notifications
- Success: Auto-dismiss after 3s
- Info: Auto-dismiss after 5s
- Warning: Manual dismiss
- Error: Manual dismiss + retry option

### Usage

```tsx
import {
  ConfirmationProvider,
  useConfirmation,
  useAutoSave,
  useUnsavedChangesWarning,
  SaveStatusIndicator,
  ActionButton,
  ErrorDisplay,
  SPACING,
  DURATION,
  Z_INDEX
} from '@/components/ux-patterns';

// Wrap app with confirmation provider
<ConfirmationProvider>
  <YourApp />
</ConfirmationProvider>

// Use confirmation dialogs
const { confirm } = useConfirmation();

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
    await deletePatient();
  }
};

// Auto-save
const { status, scheduleAutoSave, saveNow } = useAutoSave({
  onSave: async (data) => {
    await saveToServer(data);
  },
  debounceMs: 2000,
  onError: (error) => toast.error(error.message)
});

// Update form data
const handleChange = (newData) => {
  setFormData(newData);
  scheduleAutoSave(newData);
};

// Show save status
<SaveStatusIndicator status={status} />

// Warn about unsaved changes
useUnsavedChangesWarning(hasUnsavedChanges);

// Standard action buttons
<ActionButton
  label="Delete Patient"
  onClick={handleDelete}
  variant="danger"
  requireConfirmation
  confirmationOptions={{
    title: 'Delete Patient?',
    message: 'This action cannot be undone',
    confirmLabel: 'Delete',
    confirmVariant: 'danger'
  }}
/>

// Consistent error display
<ErrorDisplay
  error={new Error('Failed to save')}
  onRetry={handleRetry}
  variant="banner"
/>

// Use consistent spacing
<div style={{ padding: SPACING.md, marginBottom: SPACING.lg }}>
  Content
</div>
```

### Constants

```tsx
// Standard spacing scale
SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem'
}

// Animation durations
DURATION = {
  fast: 150,    // ms
  normal: 300,  // ms
  slow: 500     // ms
}

// Z-index layers
Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 40,
  popover: 50,
  tooltip: 60
}
```

---

## Integration Examples

### Complete Form with All Patterns

```tsx
import {
  // Activity logging
  useActivityLog,
  
  // Save behavior
  useAutoSave,
  SaveStatusIndicator,
  useUnsavedChangesWarning,
  
  // Validation & errors
  useValidation,
  ErrorDisplay,
  
  // Help system
  FieldWithHelp,
  ContextualHelp,
  
  // Alerts
  useAlert,
  
  // Empty states
  NoDocuments,
  
  // Confirmation
  useConfirmation
} from '@/components/ux-patterns';

function ClinicalNoteForm({ patientId, noteId }) {
  const [formData, setFormData] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { logDocumentEdit } = useActivityLog();
  const { success, error: showError } = useAlert();
  const { confirm } = useConfirmation();
  
  // Auto-save
  const { status, scheduleAutoSave, saveNow } = useAutoSave({
    onSave: async (data) => {
      await saveNote(data);
      logDocumentEdit(noteId, user.id, user.name, Object.keys(data));
      setHasUnsavedChanges(false);
      success('Note Saved', 'Clinical note saved successfully');
    },
    onError: (err) => showError('Save Failed', err.message)
  });
  
  // Warn on navigation
  useUnsavedChangesWarning(hasUnsavedChanges);
  
  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setHasUnsavedChanges(true);
    scheduleAutoSave(newData);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Clinical Note</h1>
        <SaveStatusIndicator status={status} />
      </div>
      
      <FieldWithHelp
        label="Primary Diagnosis"
        helpContent="Enter the primary diagnosis code"
        cmsReference="OASIS M1021"
        required
      >
        <input
          value={formData.diagnosis}
          onChange={(e) => handleChange('diagnosis', e.target.value)}
        />
      </FieldWithHelp>
      
      <ContextualHelp context="Clinical Note" helpItems={helpContent} />
    </div>
  );
}
```

---

## Best Practices

### Activity Logging
- ✅ Log all significant user actions
- ✅ Include contextual metadata
- ✅ Use consistent activity types
- ❌ Don't log every keystroke
- ❌ Don't log sensitive PHI in descriptions

### Retry Behavior
- ✅ Use exponential backoff for network failures
- ✅ Show progress feedback
- ✅ Limit max retries (3-5)
- ❌ Don't retry indefinitely
- ❌ Don't hide retry failures from users

### Long-Running Operations
- ✅ Show estimated time for operations >5s
- ✅ Allow cancellation when possible
- ✅ Update progress incrementally
- ❌ Don't block UI during operations
- ❌ Don't show progress for fast operations

### Alert Severity
- ✅ Use critical for patient safety issues
- ✅ Use warning for potential problems
- ✅ Use info for helpful context
- ❌ Don't overuse critical severity
- ❌ Don't show too many alerts at once

### Inline Help
- ✅ Place help near relevant fields
- ✅ Include CMS references for regulatory items
- ✅ Provide concrete examples
- ❌ Don't show help for obvious fields
- ❌ Don't duplicate information

### Empty States
- ✅ Provide clear next actions
- ✅ Use encouraging, friendly language
- ✅ Include relevant icons
- ❌ Don't leave users stuck
- ❌ Don't use technical jargon

### Interaction Rules
- ✅ Follow consistent patterns everywhere
- ✅ Confirm destructive actions
- ✅ Show save status clearly
- ❌ Don't create custom patterns without reason
- ❌ Don't skip unsaved changes warnings

---

## Performance Considerations

All patterns are optimized for performance:

- **Activity Logging**: Debounced server persistence, in-memory caching
- **Retry Behavior**: Cancellable timeouts, cleanup on unmount
- **Long-Running Operations**: Cancelable promises, progress throttling
- **Alert Severity**: Max queue size, auto-dismiss timers
- **Inline Help**: Lazy-loaded content, click-outside cleanup
- **Empty States**: Lightweight SVG icons, minimal re-renders
- **Interaction Rules**: Memoized callbacks, debounced auto-save

---

## Accessibility

All patterns follow WCAG 2.1 Level AA standards:

- Keyboard navigation support
- Screen reader announcements
- Focus management
- Color contrast compliance
- ARIA labels and roles
- Skip links where appropriate

---

## Testing

Each pattern includes:

- Unit tests for core logic
- Integration tests for user flows
- Accessibility tests
- Visual regression tests

Example test:

```tsx
import { render, screen, userEvent } from '@testing-library/react';
import { AlertProvider, useAlert } from '@/components/ux-patterns';

test('critical alert shows action required', async () => {
  const { critical } = useAlert();
  
  critical('Patient Safety', 'Drug interaction detected');
  
  expect(screen.getByText('ACTION REQUIRED')).toBeInTheDocument();
  expect(screen.getByText('Drug interaction detected')).toBeInTheDocument();
});
```

---

## Migration Guide

If upgrading from core patterns to extended patterns:

1. **Install**: Patterns are already in `/src/app/components/ux-patterns/`
2. **Import**: Update imports to use new patterns
3. **Wrap App**: Add new providers (ActivityLoggerProvider, AlertProvider, ConfirmationProvider)
4. **Update Code**: Replace custom implementations with standard patterns
5. **Test**: Verify functionality in your use cases

---

## Support

For questions or issues:

1. Check this documentation
2. Review code examples in `/UXPatternsDemo.tsx`
3. See integration examples in `/IntegrationExample.tsx`
4. Refer to component JSDoc comments

---

**Last Updated**: March 11, 2026  
**Version**: 2.0 (Extended Patterns)  
**Total Patterns**: 14
