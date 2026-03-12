# UX Patterns Best Practices

## Table of Contents
1. [General Guidelines](#general-guidelines)
2. [Error Handling](#error-handling-best-practices)
3. [Form Validation](#form-validation-best-practices)
4. [Bulk Actions](#bulk-actions-best-practices)
5. [Loading States](#loading-states-best-practices)
6. [Progressive Disclosure](#progressive-disclosure-best-practices)
7. [Global Search](#global-search-best-practices)
8. [Keyboard Shortcuts](#keyboard-shortcuts-best-practices)
9. [Common Pitfalls](#common-pitfalls)
10. [Accessibility](#accessibility-guidelines)

---

## General Guidelines

### ✅ DO

- **Use consistent patterns** across all modules
- **Combine patterns** when appropriate
- **Test with real data** to ensure patterns scale
- **Consider mobile** - ensure patterns work on all devices
- **Follow HIPAA** - never expose PHI in patterns
- **Optimize performance** - use memoization and lazy loading

### ❌ DON'T

- **Mix patterns inconsistently** - choose one approach per use case
- **Override pattern styles** unnecessarily - use provided variants
- **Ignore accessibility** - patterns are A11y-compliant by default
- **Skip validation** - always validate user input
- **Forget error handling** - every operation can fail

---

## Error Handling Best Practices

### Message Guidelines

#### ✅ Good Error Messages

```tsx
// Clear, actionable, no jargon
setError('SAVE_FAILED', {
  title: 'Failed to save changes',
  description: 'Your changes could not be saved at this time.',
  suggestion: 'Please check your connection and try again.'
});

// Specific next step
setError('VALIDATION_ERROR', {
  title: 'Please fix validation errors',
  description: 'Some required fields are missing or invalid.',
  suggestion: 'Review the highlighted fields and make corrections.'
});
```

#### ❌ Bad Error Messages

```tsx
// Too technical
setError({
  title: 'Exception in SaveAsync()',
  description: 'NullReferenceException at line 42',
  suggestion: 'Check the stack trace'
});

// Exposes PHI
setError({
  title: 'Failed to save patient John Doe (MRN: 12345)',
  description: error.message // May contain sensitive data
});

// No actionable information
setError({
  title: 'Error',
  description: 'Something went wrong'
});
```

### Error Severity

Use appropriate severity levels:

```tsx
// ERROR - Operation failed, user action blocked
<ErrorDisplay severity="error" title="Failed to submit document" />

// WARNING - Potential issue, user can continue
<ErrorDisplay severity="warning" title="Document pending review" />

// INFO - Informational message
<ErrorDisplay severity="info" title="Changes saved automatically" />
```

### HIPAA Compliance

```tsx
// ✅ HIPAA-compliant error
const handleError = (error: unknown) => {
  // Log full error server-side for debugging
  logToServer({
    error: error,
    context: 'patient-save',
    userId: currentUser.id,
    timestamp: new Date()
  });
  
  // Show generic message to user
  setError('SAVE_FAILED', {
    title: 'Failed to save record',
    errorCode: generateErrorCode() // For support reference
  });
};

// ❌ PHI exposure risk
const handleError = (error: any) => {
  setError({
    title: `Failed to save ${patient.name}`,
    description: error.message // May contain PHI
  });
};
```

---

## Form Validation Best Practices

### Validation Timing

```tsx
// ✅ Good: Validate on blur, not while typing
const { getFieldProps } = useFormValidation({
  rules: { email: [validationRules.email()] },
  validateOnBlur: true,  // ✅ Validate when field loses focus
  validateOnChange: false // ❌ Don't validate while typing
});

// ✅ Good: Validate all fields on submit
const handleSubmit = () => {
  const isValid = validateForm(formData);
  if (!isValid) {
    showErrorToast('VALIDATION_ERROR');
    return;
  }
  // Proceed with submission
};
```

### Required Fields

```tsx
// ✅ Clear visual indicator
<FormField
  label="Email Address"
  required  // Shows asterisk
  helperText="We'll never share your email"
  error={errors.email}
>
  <input type="email" {...props} />
</FormField>

// ❌ Unclear requirement
<label>Email</label>
<input type="email" />
{errors.email && <span>{errors.email}</span>}
```

### Custom Validation Rules

```tsx
// ✅ Reusable custom rule
const customRules = {
  bloodPressure: (): ValidationRule<string> => ({
    validate: (value) => {
      if (!value) return true;
      const match = value.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (!match) return false;
      
      const systolic = parseInt(match[1]);
      const diastolic = parseInt(match[2]);
      
      return systolic >= 70 && systolic <= 200 &&
             diastolic >= 40 && diastolic <= 130 &&
             systolic > diastolic;
    },
    message: 'Blood pressure must be in format 120/80 with valid ranges'
  })
};

// Usage
const { errors } = useFormValidation({
  rules: {
    bp: [validationRules.required(), customRules.bloodPressure()]
  }
});
```

### Progressive Enhancement

```tsx
// ✅ Start with basic validation, add complexity
<ExpandableFieldset
  basicFields={
    <>
      <FormField label="Required Field" required>
        <input type="text" />
      </FormField>
    </>
  }
  advancedFields={
    <>
      <FormField 
        label="Advanced Field" 
        helperText="Optional advanced configuration"
      >
        <input type="text" />
      </FormField>
    </>
  }
/>
```

---

## Bulk Actions Best Practices

### Action Availability

```tsx
// ✅ Show actions only when items selected
<BulkActionBar
  selectedCount={selectedCount}
  // Bar appears automatically when selectedCount > 0
  actions={[...]}
/>

// ✅ Disable dangerous actions based on state
<BulkActionBar
  actions={[
    {
      id: 'delete',
      label: 'Delete',
      variant: 'danger',
      disabled: selectedItems.some(item => item.status === 'locked'),
      onClick: handleDelete
    }
  ]}
/>
```

### Confirmation Dialogs

```tsx
// ✅ Require confirmation for destructive actions
const handleBulkDelete = async () => {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedCount} records? This cannot be undone.`
  );
  
  if (!confirmed) return;
  
  try {
    await deleteRecords(selectedArray);
    healthcareToasts.bulkSuccess(selectedCount, 'deleted', 'record');
    deselectAll();
  } catch (err) {
    setError('SAVE_FAILED');
  }
};

// ❌ No confirmation for destructive action
const handleBulkDelete = async () => {
  await deleteRecords(selectedArray); // Dangerous!
};
```

### Selection State

```tsx
// ✅ Clear selection after bulk operation
const handleBulkApprove = async () => {
  await approveDocuments(selectedArray);
  deselectAll(); // ✅ Clear selection
  toast.success(`Approved ${selectedCount} documents`);
};

// ✅ Show selection count prominently
<BulkActionBar
  selectedCount={selectedCount}
  totalCount={totalRecords}
  selectionMessage={`${selectedCount} of ${totalRecords} selected`}
/>
```

### Performance with Large Datasets

```tsx
// ✅ Use Set for O(1) lookups
const { isSelected } = useBulkSelection();

// ✅ Efficient rendering
{patients.map(patient => (
  <SelectableRow
    key={patient.id}
    selected={isSelected(patient.id)} // O(1) lookup
    onSelectionChange={toggleSelection}
  >
    {/* row content */}
  </SelectableRow>
))}

// ❌ Array.includes() is O(n)
{patients.map(patient => (
  <tr>
    <td>
      <input
        checked={selectedArray.includes(patient.id)} // O(n) - slow!
      />
    </td>
  </tr>
))}
```

---

## Loading States Best Practices

### Choose the Right Skeleton

```tsx
// ✅ Match skeleton to content
{loading ? (
  <TableSkeleton rows={10} columns={5} />
) : (
  <Table data={data} />
)}

{loading ? (
  <CardSkeleton showAvatar lines={3} showActions />
) : (
  <UserCard user={user} />
)}

{loading ? (
  <FormSkeleton fields={5} />
) : (
  <PatientForm patient={patient} />
)}
```

### Avoid Blank Screens

```tsx
// ✅ Show skeleton immediately
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData().finally(() => setLoading(false));
}, []);

return loading ? <TableSkeleton /> : <Table />;

// ❌ Blank screen while loading
const [data, setData] = useState(null);

useEffect(() => {
  loadData().then(setData);
}, []);

return data ? <Table data={data} /> : null; // Blank!
```

### Progressive Loading

```tsx
// ✅ Load critical data first
const [patients, setPatients] = useState<Patient[]>([]);
const [stats, setStats] = useState(null);

useEffect(() => {
  // Load patients first (critical)
  loadPatients().then(setPatients);
  
  // Load stats later (non-critical)
  loadStats().then(setStats);
}, []);

return (
  <>
    {patients.length === 0 ? (
      <TableSkeleton />
    ) : (
      <Table data={patients} />
    )}
    
    {!stats ? (
      <SkeletonLoader variant="rectangle" height={100} />
    ) : (
      <StatsCard stats={stats} />
    )}
  </>
);
```

### Loading with Retry

```tsx
// ✅ Allow retry on load failure
const [loading, setLoading] = useState(true);
const { error, setError } = useErrorHandler();

const loadData = async () => {
  try {
    setLoading(true);
    const data = await fetchData();
    setData(data);
  } catch (err) {
    setError('LOAD_FAILED');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadData();
}, []);

if (error) {
  return (
    <ErrorDisplay
      {...error}
      actions={[
        { label: 'Retry', onClick: loadData, variant: 'primary' }
      ]}
    />
  );
}

return loading ? <TableSkeleton /> : <Table />;
```

---

## Progressive Disclosure Best Practices

### When to Use

```tsx
// ✅ Use for optional/advanced fields
<CollapsibleSection title="Advanced Clinical Options">
  <FormField label="Alternative Diagnosis">
    <input type="text" />
  </FormField>
</CollapsibleSection>

// ✅ Use for lengthy forms
<ExpandableFieldset
  basicFields={<>Required fields</>}
  advancedFields={<>Optional fields</>}
/>

// ❌ Don't hide critical information
<CollapsibleSection title="Patient Allergies"> {/* Bad! */}
  <AllergyList /> {/* Should be visible */}
</CollapsibleSection>
```

### Default State

```tsx
// ✅ Expand by default if has errors
<CollapsibleSection
  title="Advanced Options"
  defaultExpanded={Object.keys(errors).some(key => 
    advancedFields.includes(key)
  )}
>
  {/* Advanced fields */}
</CollapsibleSection>

// ✅ Remember user preference
const [expanded, setExpanded] = useLocalStorage('advanced-expanded', false);

<CollapsibleSection
  title="Advanced Options"
  expanded={expanded}
  onExpandedChange={setExpanded}
>
  {/* Fields */}
</CollapsibleSection>
```

### Visual Indicators

```tsx
// ✅ Show field count in badge
<CollapsibleSection
  title="Additional Medications"
  badge={medicationList.length}
  description="Secondary and PRN medications"
>
  {/* Medication list */}
</CollapsibleSection>

// ✅ Show validation status
<CollapsibleSection
  title="Advanced Options"
  badge={hasAdvancedErrors ? '!' : undefined}
>
  {/* Fields */}
</CollapsibleSection>
```

---

## Global Search Best Practices

### Search Implementation

```tsx
// ✅ Efficient search with debouncing
const globalSearch = useGlobalSearch({
  onSearch: async (query) => {
    // Search is automatically debounced
    const results = await Promise.all([
      searchPatients(query),
      searchAdmissions(query),
      searchDocuments(query)
    ]);
    
    return results.flat();
  }
});

// ❌ No debouncing - too many requests
const handleSearch = async (query) => {
  // Fires on every keystroke!
  const results = await searchEverything(query);
};
```

### Result Quality

```tsx
// ✅ Provide rich context in results
{
  id: '123',
  type: 'patient',
  title: 'John Doe',
  subtitle: 'Active patient - Last visit: 3/8/2026',
  metadata: 'MRN: MRN001 • DOB: 1/1/1950',
  onClick: () => navigate(`/patients/${id}`)
}

// ❌ Minimal context
{
  id: '123',
  type: 'patient',
  title: 'John Doe',
  onClick: () => {}
}
```

### Search Shortcuts

```tsx
// ✅ Multiple ways to open search
<>
  {/* Keyboard shortcut */}
  <GlobalSearch {...globalSearch} /> {/* Opens with Ctrl+K */}
  
  {/* Button in header */}
  <button onClick={globalSearch.open}>
    <Search /> Search (Ctrl+K)
  </button>
  
  {/* Search icon with tooltip */}
  <Tooltip content="Search (Ctrl+K)">
    <button onClick={globalSearch.open}>
      <Search />
    </button>
  </Tooltip>
</>
```

---

## Keyboard Shortcuts Best Practices

### Standard Shortcuts

```tsx
// ✅ Use standard conventions
useKeyboardShortcut({ key: 's', ctrl: true, callback: handleSave }); // Ctrl+S = Save
useKeyboardShortcut({ key: 'k', ctrl: true, callback: openSearch }); // Ctrl+K = Search
useKeyboardShortcut({ key: 'Enter', ctrl: true, callback: handleSubmit }); // Ctrl+Enter = Submit
useKeyboardShortcut({ key: 'Escape', callback: handleClose }); // Esc = Close

// ❌ Non-standard shortcuts
useKeyboardShortcut({ key: 'q', ctrl: true, callback: handleSave }); // Confusing
useKeyboardShortcut({ key: 'x', callback: handleDelete }); // Too easy to trigger
```

### Shortcut Discovery

```tsx
// ✅ Show shortcuts in UI
<button onClick={handleSave} title="Save (Ctrl+S)">
  <Save /> Save
  <KeyboardShortcut keys={['Ctrl', 'S']} size="sm" />
</button>

// ✅ Provide shortcut reference
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

// ✅ Show in tooltips
<Tooltip content={
  <>
    Save document
    <KeyboardShortcut keys={['Ctrl', 'S']} />
  </>
}>
  <button onClick={handleSave}>
    <Save />
  </button>
</Tooltip>
```

### Shortcut Conflicts

```tsx
// ✅ Exclude shortcuts from inputs
useKeyboardShortcut({
  key: 's',
  ctrl: true,
  excludeInputs: true, // ✅ Don't trigger while typing
  callback: handleSave
});

// ✅ Context-aware shortcuts
const isModalOpen = useModalState();

useKeyboardShortcut({
  key: 'Escape',
  callback: () => {
    if (isModalOpen) {
      closeModal();
    } else {
      clearSelection();
    }
  }
});
```

---

## Common Pitfalls

### 1. Not Clearing Errors

```tsx
// ❌ Error persists after fix
const { error, setError } = useErrorHandler();

const handleSave = async () => {
  try {
    await save();
  } catch (err) {
    setError('SAVE_FAILED');
  }
};

// ✅ Clear error on success
const { error, setError, clearError } = useErrorHandler();

const handleSave = async () => {
  try {
    await save();
    clearError(); // ✅ Clear previous errors
    toast.success('Saved');
  } catch (err) {
    setError('SAVE_FAILED');
  }
};
```

### 2. Validating While Typing

```tsx
// ❌ Validates while typing - annoying
const { errors } = useFormValidation({
  rules: { email: [validationRules.email()] },
  validateOnChange: true // ❌ Shows error immediately
});

// ✅ Validate on blur
const { errors } = useFormValidation({
  rules: { email: [validationRules.email()] },
  validateOnBlur: true // ✅ Only shows error after leaving field
});
```

### 3. Missing Loading States

```tsx
// ❌ Blank screen while loading
{data && <Table data={data} />}

// ✅ Show skeleton
{loading ? <TableSkeleton /> : <Table data={data} />}
```

### 4. Inconsistent Patterns

```tsx
// ❌ Mixed error handling
try {
  await operation1();
  toast.error('Failed'); // Using toast
} catch {}

try {
  await operation2();
  setError('SAVE_FAILED'); // Using ErrorDisplay
} catch {}

// ✅ Consistent approach
const { handleApiError } = useErrorHandler();

try {
  await operation1();
} catch (err) {
  handleApiError(err, 'operation1');
}

try {
  await operation2();
} catch (err) {
  handleApiError(err, 'operation2');
}
```

---

## Accessibility Guidelines

### Keyboard Navigation

```tsx
// ✅ All interactive elements keyboard accessible
<button onClick={handleClick}>Action</button> // ✅ Tab + Enter

<div onClick={handleClick}>Action</div> // ❌ Not keyboard accessible

// ✅ Proper focus management
<Dialog open={open} onClose={close}>
  <input ref={firstFieldRef} /> {/* Auto-focus on open */}
</Dialog>
```

### ARIA Labels

```tsx
// ✅ Descriptive labels
<button aria-label="Save patient record">
  <Save />
</button>

// ✅ Error announcements
<div role="alert" aria-live="assertive">
  {error && <ErrorDisplay {...error} />}
</div>

// ✅ Selection state
<input
  type="checkbox"
  aria-label="Select all patients"
  aria-checked={isAllSelected}
/>
```

### Screen Readers

```tsx
// ✅ Hidden text for context
<button>
  <Save />
  <span className="sr-only">Save document (Ctrl+S)</span>
</button>

// ✅ Loading announcements
<div role="status" aria-live="polite">
  {loading && 'Loading patient data...'}
</div>
```

---

**Last Updated:** March 10, 2026  
**Maintained by:** Healthcare Platform UX Team
