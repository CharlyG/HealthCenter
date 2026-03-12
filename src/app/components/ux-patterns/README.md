# UX Patterns Library

Comprehensive UX patterns for HIPAA-compliant healthcare platform.

## Overview

This library provides **14 fundamental UX patterns** that ensure consistent, accessible, and user-friendly experiences across the healthcare platform:

### Core Patterns (1-7)
1. **Error Handling** - Clear, actionable error messages
2. **Inline Validation** - Real-time form validation
3. **Bulk Actions** - Multi-select and batch operations
4. **Loading States** - Skeleton loaders that mimic final layout
5. **Progressive Disclosure** - Reveal complexity progressively
6. **Global Search** - Fast search with categorized results
7. **Keyboard Shortcuts** - Productivity shortcuts for power users

### Extended Patterns (8-14)
8. **Activity Logging** - Automatic audit trail and timeline generation
9. **Retry Behavior** - Failed operation retry with progress feedback
10. **Long-Running Operations** - Progress indicators for async tasks
11. **Alert Severity System** - Tiered alert system (critical/warning/info)
12. **Inline Help** - Contextual help with CMS references
13. **Empty States** - Helpful no-data states with suggested actions
14. **Interaction Rules** - System-wide consistency patterns

## Quick Start

```tsx
// Import patterns you need
import {
  // Activity logging
  ActivityLoggerProvider,
  useActivityLog,
  ActivityTimeline,
  
  // Retry behavior
  RetryableOperation,
  RetryButton,
  
  // Long-running operations
  LongRunningOperation,
  ProgressBar,
  
  // Alert severity
  AlertProvider,
  useAlert,
  AlertQueue,
  
  // Inline help
  HelpIcon,
  FieldWithHelp,
  
  // Empty states
  NoVisitsScheduled,
  EmptyState,
  
  // Interaction rules
  ConfirmationProvider,
  useConfirmation,
  useAutoSave
} from '@/components/ux-patterns';

// Wrap your app with providers
<ActivityLoggerProvider persistToServer={true}>
  <AlertProvider maxAlerts={10}>
    <ConfirmationProvider>
      <YourApp />
    </ConfirmationProvider>
  </AlertProvider>
</ActivityLoggerProvider>
```

## Pattern Details

### 1. Error Handling Pattern

**Purpose:** Display errors with clear explanations, context, and actionable next steps.

**Components:**
- `ErrorDisplay` - Full error display with actions
- `InlineError` - Compact error for inline use
- `ErrorBoundary` - React error boundary
- `useErrorHandler` - Hook for standardized error handling

**Usage:**
```tsx
import { ErrorDisplay, useErrorHandler } from '@/components/ux-patterns';

const { error, setError, showErrorToast } = useErrorHandler();

// Show error
setError('SAVE_FAILED');

// Show toast
showErrorToast('NETWORK_ERROR');

// Display error
<ErrorDisplay
  title="Failed to save"
  description="Changes could not be saved"
  suggestion="Check your connection and try again"
  severity="error"
  actions={[
    { label: 'Retry', onClick: handleRetry, variant: 'primary' }
  ]}
/>
```

**Design Principles:**
- Avoid technical jargon
- Provide clear next steps
- Use appropriate severity levels
- HIPAA-compliant (no PHI in errors)

---

### 2. Inline Validation Pattern

**Purpose:** Validate form fields with immediate, contextual feedback.

**Components:**
- `FormField` - Field wrapper with validation display
- `useFormValidation` - Form validation hook
- `validationRules` - Pre-built validation rules

**Usage:**
```tsx
import { FormField, useFormValidation, validationRules } from '@/components/ux-patterns';

const { errors, getFieldProps, validateForm } = useFormValidation({
  rules: {
    email: [validationRules.required(), validationRules.email()],
    age: [validationRules.min(18)]
  }
});

<FormField
  label="Email"
  required
  {...getFieldProps('email', formData.email)}
>
  <input
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    onBlur={getFieldProps('email', formData.email).onBlur}
  />
</FormField>
```

**Validation Timing:**
- On blur (when user leaves field)
- On submit (when form is submitted)
- On change (after first blur, optional)

**Built-in Rules:**
- `required()` - Field is required
- `email()` - Valid email format
- `phone()` - Valid phone number
- `mrn()` - Valid Medical Record Number
- `minLength()` / `maxLength()` - String length
- `min()` / `max()` - Number range
- `date()` / `futureDate()` / `pastDate()` - Date validation

---

### 3. Bulk Actions Pattern

**Purpose:** Enable selection and bulk operations on multiple records.

**Components:**
- `BulkActionBar` - Action toolbar (appears when items selected)
- `useBulkSelection` - Selection state management
- `SelectableRow` - Table row with checkbox
- `SelectAllCheckbox` - Checkbox with indeterminate state

**Usage:**
```tsx
import { BulkActionBar, useBulkSelection, SelectableRow } from '@/components/ux-patterns';

const {
  selectedCount,
  isSelected,
  toggleSelection,
  deselectAll
} = useBulkSelection();

<BulkActionBar
  selectedCount={selectedCount}
  onClearSelection={deselectAll}
  actions={[
    { id: 'approve', label: 'Approve', onClick: handleApprove, variant: 'primary' },
    { id: 'delete', label: 'Delete', onClick: handleDelete, variant: 'danger' }
  ]}
/>

<SelectableRow
  id={item.id}
  selected={isSelected(item.id)}
  onSelectionChange={toggleSelection}
>
  <td>{item.name}</td>
</SelectableRow>
```

**Common Bulk Actions:**
- Approve / Reject
- Assign reviewer
- Export
- Send reminders
- Delete
- Change status

---

### 4. Loading States Pattern

**Purpose:** Show skeleton states that mimic final layout during loading.

**Components:**
- `SkeletonLoader` - Base skeleton component
- `TableSkeleton` - Table loading state
- `CardSkeleton` - Card loading state
- `FormSkeleton` - Form loading state
- `LoadingSpinner` - Spinner (use sparingly)

**Usage:**
```tsx
import { TableSkeleton, CardSkeleton } from '@/components/ux-patterns';

{loading ? (
  <TableSkeleton rows={5} columns={4} />
) : (
  <Table data={data} />
)}

{loading ? (
  <CardSkeleton showAvatar lines={3} showActions />
) : (
  <Card {...props} />
)}
```

**Best Practices:**
- Prefer skeletons over spinners
- Match skeleton layout to final content
- Avoid blank screens during loading
- Use consistent skeleton patterns

---

### 5. Progressive Disclosure Pattern

**Purpose:** Hide complexity until needed, reducing cognitive load.

**Components:**
- `CollapsibleSection` - Expandable section with header
- `ExpandableFieldset` - Basic/advanced field sections

**Usage:**
```tsx
import { CollapsibleSection, ExpandableFieldset } from '@/components/ux-patterns';

<CollapsibleSection
  title="Advanced Options"
  badge="5"
  description="Additional clinical fields"
>
  {/* Advanced content */}
</CollapsibleSection>

<ExpandableFieldset
  basicFields={<>...</>}
  advancedFields={<>...</>}
  expandLabel="Show advanced options"
/>
```

**Use Cases:**
- Advanced clinical options
- Additional medication details
- Extended order fields
- Optional documentation sections

---

### 6. Global Search Pattern

**Purpose:** Fast, comprehensive search across all platform entities.

**Components:**
- `GlobalSearch` - Search dialog with categorized results
- `useGlobalSearch` - Search state and keyboard shortcut

**Usage:**
```tsx
import { GlobalSearch, useGlobalSearch } from '@/components/ux-patterns';

const globalSearch = useGlobalSearch({
  onSearch: async (query) => {
    // Perform search
    return searchResults;
  }
});

<GlobalSearch
  open={globalSearch.isOpen}
  onClose={globalSearch.close}
  onSearch={globalSearch.search}
/>
```

**Features:**
- Partial matching
- Search by: name, MRN, admission ID, document, caregiver
- Categorized results (Patients, Admissions, Documents, etc.)
- Keyboard navigation (↑↓ to navigate, Enter to select)
- Ctrl+K shortcut to open

**Search Result Categories:**
- Patients
- Admissions
- Documents
- Visits
- Caregivers
- Orders

---

### 7. Keyboard Shortcuts Pattern

**Purpose:** Improve productivity for power users with keyboard shortcuts.

**Components:**
- `KeyboardShortcut` - Display shortcut keys
- `useKeyboardShortcut` - Register single shortcut
- `useKeyboardShortcuts` - Register multiple shortcuts
- `CommandPalette` - Command palette (Ctrl+K)

**Usage:**
```tsx
import {
  useKeyboardShortcut,
  KeyboardShortcut,
  CommandPalette
} from '@/components/ux-patterns';

// Register shortcut
useKeyboardShortcut({
  key: 's',
  ctrl: true,
  callback: handleSave
});

// Display shortcut
<KeyboardShortcut keys={['Ctrl', 'S']} />

// Command palette
<CommandPalette
  actions={[
    {
      id: 'save',
      label: 'Save Document',
      shortcut: ['Ctrl', 'S'],
      onExecute: handleSave
    }
  ]}
/>
```

**Standard Shortcuts:**
- `Ctrl + K` - Open command palette / search
- `Ctrl + S` - Save document
- `Ctrl + Enter` - Submit document
- `Esc` - Close dialog / drawer

**Best Practices:**
- Use standard OS conventions
- Don't override browser shortcuts
- Exclude shortcuts when typing in inputs
- Show shortcuts in tooltips/help

---

### 8. Activity Logging Pattern

**Purpose:** Automatically generate audit trails and timelines for user actions.

**Components:**
- `ActivityLoggerProvider` - Context provider for activity logging
- `useActivityLog` - Hook to log activities
- `ActivityTimeline` - Display activity timeline

**Usage:**
```tsx
import {
  ActivityLoggerProvider,
  useActivityLog,
  ActivityTimeline
} from '@/components/ux-patterns';

// Wrap your app with provider
<ActivityLoggerProvider persistToServer={true}>
  <YourApp />
</ActivityLoggerProvider>

// Log activity
const logActivity = useActivityLog();
logActivity({
  action: 'CREATE_PATIENT',
  details: { patientId: '12345' }
});

// Display timeline
<ActivityTimeline />
```

**Best Practices:**
- Log all user actions
- Include timestamps and user IDs
- Persist logs to server for audit
- Display timelines in relevant modules

---

### 9. Retry Behavior Pattern

**Purpose:** Provide retry functionality with progress feedback for failed operations.

**Components:**
- `RetryableOperation` - Wrapper for retryable operations
- `RetryButton` - Button to retry failed operations

**Usage:**
```tsx
import { RetryableOperation, RetryButton } from '@/components/ux-patterns';

<RetryableOperation
  operation={async () => {
    // Perform operation
    await saveData();
  }}
  onRetry={handleRetry}
>
  <RetryButton />
</RetryableOperation>
```

**Best Practices:**
- Provide clear retry options
- Show progress feedback during retries
- Limit retry attempts to prevent infinite loops
- Log retry attempts for audit

---

### 10. Long-Running Operations Pattern

**Purpose:** Show progress indicators for asynchronous tasks.

**Components:**
- `LongRunningOperation` - Wrapper for long-running operations
- `ProgressBar` - Progress bar to show task progress

**Usage:**
```tsx
import { LongRunningOperation, ProgressBar } from '@/components/ux-patterns';

<LongRunningOperation
  operation={async () => {
    // Perform operation
    await processData();
  }}
  onProgress={handleProgress}
>
  <ProgressBar />
</LongRunningOperation>
```

**Best Practices:**
- Show progress indicators for tasks taking longer than 2 seconds
- Update progress regularly
- Provide estimated time remaining if possible
- Allow cancellation of operations if applicable

---

### 11. Alert Severity System Pattern

**Purpose:** Implement a tiered alert system with different severity levels.

**Components:**
- `AlertProvider` - Context provider for alerts
- `useAlert` - Hook to show alerts
- `AlertQueue` - Display queued alerts

**Usage:**
```tsx
import { AlertProvider, useAlert, AlertQueue } from '@/components/ux-patterns';

// Wrap your app with provider
<AlertProvider maxAlerts={10}>
  <YourApp />
</AlertProvider>

// Show alert
const showAlert = useAlert();
showAlert({
  severity: 'critical',
  message: 'System error occurred'
});

// Display alerts
<AlertQueue />
```

**Best Practices:**
- Use severity levels to prioritize alerts
- Show critical alerts immediately
- Queue lower severity alerts
- Allow users to dismiss alerts

---

### 12. Inline Help Pattern

**Purpose:** Provide contextual help with CMS references.

**Components:**
- `HelpIcon` - Icon to indicate help is available
- `FieldWithHelp` - Field with inline help

**Usage:**
```tsx
import { HelpIcon, FieldWithHelp } from '@/components/ux-patterns';

<HelpIcon
  onClick={() => {
    // Show help
    showHelp();
  }}
/>

<FieldWithHelp
  label="Email"
  helpText="Enter a valid email address"
  cmsRef="CMS-12345"
>
  <input
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  />
</FieldWithHelp>
```

**Best Practices:**
- Provide help for complex fields
- Include CMS references for documentation
- Show help on hover or click
- Keep help text concise and clear

---

### 13. Empty States Pattern

**Purpose:** Display helpful no-data states with suggested actions.

**Components:**
- `NoVisitsScheduled` - Specific empty state for no visits
- `EmptyState` - Generic empty state

**Usage:**
```tsx
import { NoVisitsScheduled, EmptyState } from '@/components/ux-patterns';

<NoVisitsScheduled
  onScheduleVisit={handleScheduleVisit}
/>

<EmptyState
  title="No Data Available"
  description="There is no data to display"
  actionLabel="Add Data"
  onAction={handleAddData}
/>
```

**Best Practices:**
- Provide clear actions for users to take
- Include descriptive text
- Use appropriate icons
- Keep empty states simple and user-friendly

---

### 14. Interaction Rules Pattern

**Purpose:** Ensure system-wide consistency in user interactions.

**Components:**
- `ConfirmationProvider` - Context provider for confirmations
- `useConfirmation` - Hook to show confirmations
- `useAutoSave` - Hook for auto-saving changes

**Usage:**
```tsx
import {
  ConfirmationProvider,
  useConfirmation,
  useAutoSave
} from '@/components/ux-patterns';

// Wrap your app with provider
<ConfirmationProvider>
  <YourApp />
</ConfirmationProvider>

// Show confirmation
const showConfirmation = useConfirmation();
showConfirmation({
  title: 'Delete Patient',
  message: 'Are you sure you want to delete this patient?',
  onConfirm: handleDelete
});

// Auto-save changes
const autoSave = useAutoSave();
autoSave({
  onSave: handleSave,
  debounce: 1000
});
```

**Best Practices:**
- Use confirmations for critical actions
- Provide clear options in confirmations
- Implement auto-save for forms to prevent data loss
- Ensure consistency across the platform

---

## Performance Considerations

All patterns follow platform performance standards:

- ✅ Components are memoized
- ✅ Event handlers use useCallback
- ✅ Expensive computations use useMemo
- ✅ No unnecessary re-renders
- ✅ Optimized for large datasets

## Accessibility (A11y)

All patterns are WCAG 2.1 AA compliant:

- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Color contrast compliance

## HIPAA Compliance

Error handling patterns are HIPAA-compliant:

- ❌ Never expose PHI in error messages
- ✅ Use generic, user-friendly messages
- ✅ Log technical details server-side only
- ✅ Secure error tracking

## Migration to .NET 8

These patterns are designed with future migration in mind:

- Patterns are framework-agnostic concepts
- Similar patterns can be implemented in .NET/Blazor
- Validation rules can be shared between frontend/backend
- Error messages can be standardized across stack

---

## Additional Resources

- **Extended Patterns Documentation**: See `EXTENDED_PATTERNS.md` for detailed documentation of patterns 8-14
- **Demo**: See `UXPatternsDemo.tsx` for core patterns demo
- **Extended Demo**: See `ExtendedPatternsDemo.tsx` for extended patterns demo
- **Best Practices**: See `BEST_PRACTICES.md` for implementation guidelines
- **Architecture**: See `ARCHITECTURE.md` for system design documentation

---

**Last Updated:** March 11, 2026  
**Version:** 2.0 (Extended Patterns)  
**Total Patterns:** 14 (7 Core + 7 Extended)  
**Maintained by:** Healthcare Platform UX Team