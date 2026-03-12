# Healthcare Platform UX Patterns

Comprehensive guide to the UX interaction patterns used throughout the healthcare platform. These patterns ensure consistency, prevent data loss, and provide clear feedback to users.

---

## Table of Contents

1. [Save & Autosave Behavior](#1-save--autosave-behavior)
2. [Unsaved Changes Protection](#2-unsaved-changes-protection)
3. [Create, Edit, and View Modes](#3-create-edit-and-view-modes)
4. [Status Transitions](#4-status-transitions)
5. [Confirmation Dialogs](#5-confirmation-dialogs)
6. [Toast Notifications](#6-toast-notifications)

---

## 1. Save & Autosave Behavior

### Overview
Automatic draft saving prevents data loss while editing long-form content such as clinical documentation, assessments, and care plans.

### Components
- **Hook**: `useFormAutosave` (`/src/app/hooks/useFormAutosave.ts`)
- **UI**: `AutosaveIndicator` (`/src/app/components/patterns/AutosaveIndicator.tsx`)

### Behavior Rules
- ✅ Auto-saves as **draft** every 10-30 seconds (configurable)
- ✅ Never interrupts typing or causes UI lag
- ✅ Displays subtle indicator: `Saving...` → `Saved` → timestamp
- ✅ Users can still click **Save Draft** manually
- ✅ Final **Submit** button for non-draft saves
- ⚠️ Shows warning on autosave failure

### Usage Example

```tsx
import { useFormAutosave } from '@/hooks/useFormAutosave';
import { AutosaveIndicator } from '@/components/patterns';

function ClinicalDocumentEditor() {
  const [formData, setFormData] = useState(initialData);

  const autosave = useFormAutosave({
    formData,
    onSave: async (data, isDraft) => {
      await saveDocument(data, isDraft);
    },
    autosaveInterval: 15000, // 15 seconds
  });

  return (
    <div>
      {/* Editor UI */}
      <textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
      />

      {/* Autosave indicator */}
      <AutosaveIndicator
        status={autosave.isSaving ? 'saving' : 'saved'}
        lastSaved={autosave.lastSaved}
        position="fixed-bottom"
      />

      {/* Manual actions */}
      <button onClick={() => autosave.saveNow(true)}>
        Save Draft
      </button>
      <button onClick={() => autosave.saveNow(false)}>
        Submit
      </button>
    </div>
  );
}
```

### When to Use
- ✅ Clinical documentation
- ✅ Assessments (OASIS, therapy notes)
- ✅ Plan of care editing
- ✅ Order creation
- ❌ Short forms (contact info, filters)

---

## 2. Unsaved Changes Protection

### Overview
Prevents accidental data loss when users navigate away from a form with unsaved changes.

### Components
- **Hook**: `useNavigationGuard` (`/src/app/hooks/useNavigationGuard.ts`)
- **Dialog**: `UnsavedChangesDialog` (`/src/app/components/patterns/UnsavedChangesDialog.tsx`)

### Behavior Rules
- ✅ Blocks navigation when form is dirty
- ✅ Shows dialog with 3 options:
  - **Save Changes** (save and proceed)
  - **Discard Changes** (proceed without saving)
  - **Cancel** (stay on page)
- ✅ Also handles browser/tab close (shows native browser warning)
- ✅ Can be combined with autosave

### Usage Example

```tsx
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { UnsavedChangesDialog } from '@/components/patterns';

function AssessmentForm() {
  const [assessment, setAssessment] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const navigationGuard = useNavigationGuard({
    when: isDirty,
    onSave: async () => {
      await saveAssessment(assessment);
      setIsDirty(false);
    },
    onDiscard: () => {
      setIsDirty(false);
    },
  });

  return (
    <>
      <form onChange={() => setIsDirty(true)}>
        {/* Form fields */}
      </form>

      <UnsavedChangesDialog
        open={navigationGuard.dialogOpen}
        onSave={navigationGuard.saveAndProceed}
        onDiscard={navigationGuard.discardAndProceed}
        onCancel={navigationGuard.cancelNavigation}
        loading={navigationGuard.isSaving}
      />
    </>
  );
}
```

### When to Apply
- ✅ Clinical documents
- ✅ Assessments
- ✅ Orders
- ✅ Configuration settings
- ✅ Care plans
- ❌ Read-only views
- ❌ Filters/search

---

## 3. Create, Edit, and View Modes

### Overview
Consistent pattern for entities that support viewing, editing, and creation.

### Components
- **Hook**: `useFormMode` (`/src/app/components/patterns/FormMode.tsx`)
- **Wrapper**: `FormModeWrapper`
- **Parts**: `FormModeHeader`, `FormModeActions`

### Mode Definitions

| Mode | State | Actions | Use Case |
|------|-------|---------|----------|
| **View** | Read-only | Edit / Close | Viewing existing record |
| **Edit** | Editable | Save / Cancel | Modifying existing record |
| **Create** | Editable | Create / Cancel | Adding new record |

### Primary Actions by Mode

| Mode | Primary Button | Secondary Button |
|------|----------------|------------------|
| View | Edit | Close |
| Edit | Save Changes | Cancel |
| Create | Create | Cancel |

### Usage Example

```tsx
import { FormModeWrapper, useFormMode } from '@/components/patterns';

function PatientEditor({ patient, onSave, onClose }) {
  const [formData, setFormData] = useState(patient || {});

  const formMode = useFormMode({
    initialMode: patient ? 'view' : 'create',
    onSave: async () => {
      await onSave(formData);
      toast.success('Patient saved');
    },
    onCancel: onClose,
  });

  return (
    <FormModeWrapper
      mode={formMode.mode}
      header={{
        title: patient?.name || 'New Patient',
        subtitle: patient?.mrn ? `MRN: ${patient.mrn}` : 'Fill in patient details',
      }}
      actions={{
        onPrimaryAction: formMode.isReadOnly ? formMode.enterEditMode : formMode.save,
        onSecondaryAction: formMode.cancel,
        loading: formMode.loading,
      }}
    >
      <PatientForm
        data={formData}
        onChange={setFormData}
        disabled={formMode.isReadOnly}
      />
    </FormModeWrapper>
  );
}
```

### When to Use
- ✅ Patient records
- ✅ Orders
- ✅ Assessments
- ✅ Care plans
- ✅ Configuration entities
- ❌ List views
- ❌ Dashboards

---

## 4. Status Transitions

### Overview
Manages workflow status transitions with validation, confirmation, and audit trail.

### Components
- **Main**: `StatusTransition` (`/src/app/components/patterns/StatusTransition.tsx`)
- **Timeline**: `StatusTimeline`

### Common Workflows

#### Visit Status
```
Draft → Scheduled → In Progress → Completed → Submitted → Signed
```

#### Assessment Status
```
Draft → In Progress → Submitted → Approved / Returned
```

#### Order Status
```
Draft → Pending → Approved → Signed / Cancelled
```

#### Claim Status
```
Draft → Submitted → Approved → Paid / Denied
```

### Usage Example

```tsx
import { StatusTransition, StatusTransitionRule } from '@/components/patterns';

const visitTransitions: StatusTransitionRule[] = [
  {
    from: 'draft',
    to: 'scheduled',
    label: 'Schedule Visit',
  },
  {
    from: 'in-progress',
    to: 'completed',
    label: 'Complete Visit',
    requiresConfirmation: true,
    confirmationMessage: 'Mark this visit as completed? Documentation must be finalized.',
  },
  {
    from: 'completed',
    to: 'submitted',
    label: 'Submit for Review',
    requiresConfirmation: true,
    canTransition: async () => {
      return await validateDocumentation();
    },
  },
];

function VisitStatusManager({ visit, onUpdate }) {
  const handleStatusChange = async (newStatus) => {
    await updateVisitStatus(visit.id, newStatus);
    onUpdate();
  };

  return (
    <StatusTransition
      currentStatus={visit.status}
      transitions={visitTransitions}
      onStatusChange={handleStatusChange}
      history={visit.statusHistory}
      showHistory
    />
  );
}
```

### Design Rules
- ✅ Display current status prominently
- ✅ Show only allowed transitions
- ✅ Require confirmation for critical transitions
- ✅ Validate before allowing transition
- ✅ Maintain audit trail
- ⚠️ Prevent impossible state transitions

---

## 5. Confirmation Dialogs

### Overview
Reusable confirmation dialogs for high-impact actions.

### Component
- `ConfirmDialog` (`/src/app/components/patterns/ConfirmDialog.tsx`)
- `useConfirmDialog` hook

### Variants

| Variant | Color | Use Case |
|---------|-------|----------|
| `destructive` | Red | Deleting records |
| `warning` | Amber | Irreversible actions |
| `info` | Blue | Important actions |
| `success` | Green | Positive confirmations |

### When to Use Confirmations

✅ **Always confirm:**
- Deleting records
- Submitting documentation
- Closing admissions
- Sending orders for signature
- Disabling integrations

❌ **Don't confirm:**
- Saving drafts
- Filtering/sorting
- Opening modals
- Expanding sections

### Usage Example

```tsx
import { ConfirmDialog, useConfirmDialog } from '@/components/patterns';

function PatientList() {
  const deleteDialog = useConfirmDialog({
    onConfirm: async () => {
      await deletePatient(patientId);
      toast.success('Patient deleted');
    },
    variant: 'destructive',
  });

  return (
    <>
      <button onClick={deleteDialog.show}>
        Delete Patient
      </button>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.setOpen}
        onConfirm={deleteDialog.confirm}
        loading={deleteDialog.loading}
        title="Delete Patient Record?"
        description="This action cannot be undone. All patient data, episodes, and documents will be permanently deleted."
        confirmText="Delete Patient"
        variant="destructive"
      />
    </>
  );
}
```

---

## 6. Toast Notifications

### Overview
Brief, auto-dismissing feedback messages for user actions.

### Module
- `toast` utilities (`/src/app/lib/toastNotifications.ts`)

### Toast Types

| Type | Duration | Use Case |
|------|----------|----------|
| **Success** | 4s | Action completed successfully |
| **Error** | 6s | Action failed |
| **Warning** | 4s | Important information/caution |
| **Info** | 4s | General information |
| **Loading** | Manual | Async operation in progress |

### Usage Example

```tsx
import { toast } from '@/lib/toastNotifications';

// Simple toasts
toast.success('Document saved successfully');
toast.error('Failed to load patient data');
toast.warning('Session expires in 5 minutes');
toast.info('New message received');

// Healthcare-specific toasts
toast.visitScheduled('John Doe');
toast.documentSubmitted();
toast.assessmentApproved();

// With undo action
toast.deleted('Visit note', async () => {
  await restoreNote(noteId);
});

// Async operations
await toast.asyncOperation(
  api.saveDocument(document),
  {
    loading: 'Saving document...',
    success: 'Document saved successfully',
    error: 'Failed to save document',
  }
);

// With custom action
toast.error('Integration test failed', {
  action: {
    label: 'Retry',
    onClick: () => testIntegration(),
  },
});
```

### Best Practices
- ✅ Keep messages brief (< 60 characters)
- ✅ Use action verbs ("Saved", "Submitted", "Failed")
- ✅ Provide undo for destructive actions
- ✅ Don't show toasts for every minor action
- ⚠️ Errors stay longer (6s vs 4s)
- ❌ Don't stack too many toasts

---

## Integration Example

Complete example showing all patterns working together:

```tsx
import { useState } from 'react';
import { useFormAutosave } from '@/hooks/useFormAutosave';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import {
  FormModeWrapper,
  useFormMode,
  AutosaveIndicator,
  UnsavedChangesDialog,
  StatusTransition,
} from '@/components/patterns';
import { toast } from '@/lib/toastNotifications';

function ClinicalDocumentEditor({ document, onClose }) {
  const [formData, setFormData] = useState(document || {});

  // Form mode management
  const formMode = useFormMode({
    initialMode: document ? 'view' : 'create',
    onSave: async () => {
      await saveDocument(formData);
      toast.documentSaved();
    },
  });

  // Autosave
  const autosave = useFormAutosave({
    formData,
    onSave: async (data, isDraft) => {
      await saveDocument(data, isDraft);
    },
    enabled: !formMode.isReadOnly,
  });

  // Navigation guard
  const navigationGuard = useNavigationGuard({
    when: autosave.isDirty && !formMode.isReadOnly,
    onSave: async () => {
      await autosave.saveNow(false);
    },
    onDiscard: () => {
      autosave.markClean();
    },
  });

  // Status transitions
  const handleStatusChange = async (newStatus) => {
    await updateDocumentStatus(document.id, newStatus);
    setFormData({ ...formData, status: newStatus });
  };

  return (
    <>
      <FormModeWrapper
        mode={formMode.mode}
        header={{
          title: 'Clinical Documentation',
          subtitle: formData.patientName,
        }}
        actions={{
          onPrimaryAction: formMode.isReadOnly ? formMode.enterEditMode : formMode.save,
          onSecondaryAction: formMode.cancel,
          loading: formMode.loading,
        }}
      >
        <div className="grid grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="col-span-2">
            <DocumentEditor
              data={formData}
              onChange={setFormData}
              readOnly={formMode.isReadOnly}
            />

            {/* Autosave indicator */}
            {!formMode.isReadOnly && (
              <AutosaveIndicator
                status={autosave.isSaving ? 'saving' : 'saved'}
                lastSaved={autosave.lastSaved}
              />
            )}
          </div>

          {/* Status sidebar */}
          <div>
            <StatusTransition
              currentStatus={formData.status}
              transitions={documentTransitions}
              onStatusChange={handleStatusChange}
              showHistory
            />
          </div>
        </div>
      </FormModeWrapper>

      {/* Unsaved changes protection */}
      <UnsavedChangesDialog
        open={navigationGuard.dialogOpen}
        onSave={navigationGuard.saveAndProceed}
        onDiscard={navigationGuard.discardAndProceed}
        onCancel={navigationGuard.cancelNavigation}
        loading={navigationGuard.isSaving}
      />
    </>
  );
}
```

---

## Summary

| Pattern | Purpose | Key Component |
|---------|---------|---------------|
| **Autosave** | Prevent data loss | `useFormAutosave` + `AutosaveIndicator` |
| **Navigation Guard** | Protect unsaved changes | `useNavigationGuard` + `UnsavedChangesDialog` |
| **Form Modes** | Create/Edit/View states | `useFormMode` + `FormModeWrapper` |
| **Status Transitions** | Workflow state management | `StatusTransition` |
| **Confirmations** | High-impact action protection | `ConfirmDialog` |
| **Toasts** | Brief action feedback | `toast` utilities |

---

## Implementation Checklist

When implementing a new form/editor:

- [ ] Choose appropriate mode (Create/Edit/View)
- [ ] Enable autosave for long forms
- [ ] Add unsaved changes protection
- [ ] Define status transition rules
- [ ] Add confirmation dialogs for destructive actions
- [ ] Use toast notifications for feedback
- [ ] Test all navigation scenarios
- [ ] Verify mobile responsiveness
- [ ] Check accessibility (keyboard nav, screen readers)

---

**Last Updated**: March 10, 2026
