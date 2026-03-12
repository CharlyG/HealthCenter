# Form Architecture Rules

Comprehensive guide for form patterns in the healthcare platform.

## Form Structure

### Form Anatomy

```
┌──────────────────────────────────────────────────────┐
│  Form Header                                          │
│  ├─ Title                                             │
│  ├─ Description                                       │
│  └─ Save Status Indicator                            │
├──────────────────────────────────────────────────────┤
│  Section 1: Patient Information                       │
│  ├─ Field: Name [Required]                           │
│  ├─ Field: MRN                                        │
│  └─ Field: Date of Birth                             │
├──────────────────────────────────────────────────────┤
│  Section 2: Contact Information                       │
│  ├─ Field: Phone                                      │
│  ├─ Field: Email                                      │
│  └─ Field: Address                                    │
├──────────────────────────────────────────────────────┤
│  Section 3: Clinical Information (Collapsible)        │
│  ├─ Field: Primary Diagnosis                         │
│  ├─ Field: Medications                               │
│  └─ Field: Allergies                                  │
├──────────────────────────────────────────────────────┤
│  Sticky Footer                                        │
│  ├─ [Cancel Button]  [Save Draft]  [Submit Button]   │
│  └─ Validation Summary (if errors)                   │
└──────────────────────────────────────────────────────┘
```

## Form Types

### 1. Short Forms (<5 fields)

**Characteristics**:
- Manual save with Save button
- Single section
- No auto-save
- Inline validation on blur

**Example**: Create Tag, Add Note, Quick Assignment

```tsx
<Form onSubmit={handleSubmit}>
  <FormField label="Tag Name" required>
    <Input name="tagName" />
  </FormField>
  
  <FormField label="Color">
    <ColorPicker name="color" />
  </FormField>
  
  <FormActions>
    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
    <Button variant="primary" type="submit">Create Tag</Button>
  </FormActions>
</Form>
```

### 2. Medium Forms (5-15 fields)

**Characteristics**:
- Auto-save with debounce (2s)
- 2-3 sections
- Save status indicator
- Inline validation
- Optional draft saving

**Example**: Edit Patient, Create Visit, Order Form

```tsx
<Form autoSave onSave={handleSave}>
  <FormHeader>
    <h2>Edit Patient</h2>
    <SaveStatusIndicator status={saveStatus} />
  </FormHeader>
  
  <FormSection title="Demographics">
    <FormField label="Full Name" required>
      <Input name="name" />
    </FormField>
    {/* More fields */}
  </FormSection>
  
  <FormSection title="Contact">
    {/* Fields */}
  </FormSection>
  
  <StickyFormFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary" type="submit">Save Patient</Button>
  </StickyFormFooter>
</Form>
```

### 3. Long Forms (15+ fields)

**Characteristics**:
- Auto-save with debounce (2s)
- Multiple sections (4+)
- Collapsible sections
- Progress indicator
- Sticky save footer
- Validation summary panel
- Keyboard shortcuts (Ctrl+S to save)

**Example**: OASIS Assessment, Admission Form, Comprehensive Order

```tsx
<Form autoSave onSave={handleSave}>
  <FormHeader>
    <h2>OASIS-E Assessment</h2>
    <ProgressIndicator current={3} total={8} />
    <SaveStatusIndicator status={saveStatus} />
  </FormHeader>
  
  <FormSection title="M1021: Primary Diagnosis" collapsible>
    {/* Fields */}
  </FormSection>
  
  <FormSection title="M1030: Therapies" collapsible>
    {/* Fields */}
  </FormSection>
  
  {/* More sections */}
  
  <ValidationSummary errors={validationErrors} />
  
  <StickyFormFooter>
    <Button variant="secondary">Save Draft</Button>
    <Button variant="primary" type="submit">Submit Assessment</Button>
  </StickyFormFooter>
</Form>
```

## Form Sections

### Section Component

```tsx
interface FormSectionProps {
  /** Section title */
  title: string;
  
  /** Section description/helper text */
  description?: string;
  
  /** Make section collapsible */
  collapsible?: boolean;
  
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  
  /** Badge content (e.g., field count) */
  badge?: string | number;
  
  /** Section content */
  children: React.ReactNode;
}

<FormSection
  title="Clinical Information"
  description="Enter patient's clinical details"
  collapsible
  defaultCollapsed={false}
  badge="5 fields"
>
  {/* Form fields */}
</FormSection>
```

### Section Rules

1. **Logical Grouping**
   - Group related fields together
   - Each section should have clear purpose
   - Section title clearly describes contents

2. **Section Ordering**
   - Most important fields first
   - Follow natural workflow order
   - Advanced/optional fields last

3. **Collapsible Sections**
   - Use for optional/advanced fields
   - Show field count in badge
   - Remember expansion state

## Field Components

### FormField Component

```tsx
interface FormFieldProps {
  /** Field label */
  label: string;
  
  /** Required indicator */
  required?: boolean;
  
  /** Helper text below field */
  helperText?: string;
  
  /** Error message */
  error?: string;
  
  /** Field input element */
  children: React.ReactNode;
  
  /** Inline help/tooltip */
  helpIcon?: React.ReactNode;
}

<FormField
  label="Patient MRN"
  required
  helperText="Medical Record Number assigned by facility"
  error={errors.mrn}
  helpIcon={<HelpTooltip content="MRN format: ABC-12345" />}
>
  <Input name="mrn" />
</FormField>
```

### Field Types

```tsx
// Text input
<FormField label="Patient Name" required>
  <Input name="name" />
</FormField>

// Number input
<FormField label="Age">
  <Input type="number" name="age" min={0} max={120} />
</FormField>

// Select dropdown
<FormField label="Status">
  <Select name="status" options={statusOptions} />
</FormField>

// Multi-select
<FormField label="Disciplines">
  <MultiSelect name="disciplines" options={disciplineOptions} />
</FormField>

// Date picker
<FormField label="Admission Date">
  <DatePicker name="admissionDate" />
</FormField>

// Checkbox
<FormField>
  <Checkbox name="hasAllergies" label="Patient has known allergies" />
</FormField>

// Radio group
<FormField label="Gender">
  <RadioGroup name="gender" options={genderOptions} />
</FormField>

// Textarea
<FormField label="Clinical Notes">
  <Textarea name="notes" rows={4} />
</FormField>

// Rich text editor
<FormField label="Assessment Narrative">
  <RichTextEditor name="narrative" />
</FormField>
```

## Validation

### Validation Timing

```tsx
// 1. On blur (when user leaves field)
<Input name="email" onBlur={validateField} />

// 2. On submit (when form is submitted)
<Form onSubmit={handleSubmit}>
  {/* Fields */}
</Form>

// 3. On change (after first blur, optional for real-time feedback)
<Input 
  name="email" 
  onChange={touched.email ? validateField : undefined}
  onBlur={() => setTouched({ ...touched, email: true })}
/>
```

### Inline Validation

```tsx
<FormField
  label="Email"
  error={errors.email}  // Show error inline
  required
>
  <Input
    name="email"
    invalid={!!errors.email}  // Visual indicator
    onBlur={validateEmail}
  />
</FormField>
```

### Validation Summary

```tsx
// Show validation summary at top of form (when errors exist)
<ValidationSummary
  errors={[
    { field: 'email', message: 'Valid email required' },
    { field: 'phone', message: 'Phone number is required' }
  ]}
  onErrorClick={(field) => scrollToField(field)}
/>
```

### Validation Rules

```tsx
import { useFormValidation, validationRules } from '@/design-system/hooks';

const { errors, validateForm, validateField } = useFormValidation({
  rules: {
    // Required field
    name: [validationRules.required('Name is required')],
    
    // Email validation
    email: [
      validationRules.required('Email is required'),
      validationRules.email('Invalid email format')
    ],
    
    // Phone validation
    phone: [
      validationRules.required('Phone is required'),
      validationRules.phone('Invalid phone format')
    ],
    
    // MRN validation
    mrn: [
      validationRules.required('MRN is required'),
      validationRules.mrn('Invalid MRN format')
    ],
    
    // Number range
    age: [
      validationRules.min(0, 'Age must be positive'),
      validationRules.max(120, 'Invalid age')
    ],
    
    // Date validation
    admissionDate: [
      validationRules.required('Admission date required'),
      validationRules.pastDate('Date must be in the past')
    ],
    
    // Custom validation
    password: [
      validationRules.custom(
        (value) => value.length >= 8,
        'Password must be at least 8 characters'
      )
    ]
  }
});
```

## Auto-Save

### Auto-Save Implementation

```tsx
import { useAutoSave } from '@/design-system/hooks';

function ClinicalNoteForm() {
  const [formData, setFormData] = useState({});
  
  const { status, saveNow } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      await saveClinicalNote(data);
    },
    debounceMs: 2000,  // Wait 2s after last change
    onError: (error) => toast.error('Failed to save')
  });
  
  return (
    <Form>
      <FormHeader>
        <h2>Clinical Note</h2>
        <SaveStatusIndicator status={status} />
      </FormHeader>
      
      <FormField label="Notes">
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </FormField>
      
      <FormActions>
        <Button onClick={saveNow}>Save Now</Button>
      </FormActions>
    </Form>
  );
}
```

### Save Status Indicator

```tsx
<SaveStatusIndicator
  status="idle"     // No changes
  status="saving"   // Saving in progress
  status="saved"    // Successfully saved
  status="error"    // Save failed
/>
```

## Form Actions

### Action Footer

```tsx
// Standard footer (bottom of form)
<FormActions>
  <Button variant="secondary" onClick={onCancel}>Cancel</Button>
  <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
  <Button variant="primary" type="submit">Submit</Button>
</FormActions>

// Sticky footer (for long forms)
<StickyFormFooter>
  <div className="flex justify-between items-center">
    <Button variant="link" onClick={onCancel}>Cancel</Button>
    <div className="flex gap-3">
      <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
      <Button variant="primary" type="submit">Submit</Button>
    </div>
  </div>
</StickyFormFooter>
```

### Action Patterns

```tsx
// Create form
<FormActions>
  <Button variant="secondary" onClick={onCancel}>Cancel</Button>
  <Button variant="primary" type="submit">Create Patient</Button>
</FormActions>

// Edit form (with auto-save)
<FormActions>
  <Button variant="secondary" onClick={onClose}>Close</Button>
  <Button variant="primary" onClick={saveNow}>Save Now</Button>
</FormActions>

// Multi-step form
<FormActions>
  <Button variant="secondary" onClick={onBack}>Back</Button>
  <Button variant="primary" onClick={onNext}>Next</Button>
</FormActions>

// Final step of multi-step form
<FormActions>
  <Button variant="secondary" onClick={onBack}>Back</Button>
  <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
  <Button variant="primary" type="submit">Submit</Button>
</FormActions>
```

## Progressive Disclosure

### Basic/Advanced Fields

```tsx
<Form>
  {/* Basic fields - always visible */}
  <FormSection title="Basic Information">
    <FormField label="Name" required>
      <Input name="name" />
    </FormField>
  </FormSection>
  
  {/* Advanced fields - collapsible */}
  <FormSection 
    title="Advanced Options" 
    collapsible 
    defaultCollapsed
  >
    <FormField label="Custom Field 1">
      <Input name="custom1" />
    </FormField>
  </FormSection>
</Form>
```

### Conditional Fields

```tsx
// Show fields based on other field values
<FormField label="Has Allergies">
  <Checkbox
    name="hasAllergies"
    checked={formData.hasAllergies}
    onChange={(checked) => setFormData({ ...formData, hasAllergies: checked })}
  />
</FormField>

{formData.hasAllergies && (
  <FormField label="Allergy List" required>
    <Textarea name="allergies" />
  </FormField>
)}
```

## Structured vs Narrative

### Structured Fields First

```tsx
<FormSection title="Vital Signs">
  {/* Structured data */}
  <div className="grid grid-cols-2 gap-4">
    <FormField label="Blood Pressure">
      <Input name="bloodPressure" placeholder="120/80" />
    </FormField>
    <FormField label="Heart Rate">
      <Input type="number" name="heartRate" />
    </FormField>
    <FormField label="Temperature">
      <Input type="number" name="temperature" step="0.1" />
    </FormField>
    <FormField label="Respiratory Rate">
      <Input type="number" name="respiratoryRate" />
    </FormField>
  </div>
  
  {/* Narrative text second */}
  <FormField label="Additional Notes">
    <Textarea name="vitalNotes" rows={3} />
  </FormField>
</FormSection>
```

### Pattern

1. **Structured fields** - Codified, searchable, reportable data
2. **Narrative fields** - Free-text notes and context

This pattern:
- Improves data quality
- Enables analytics
- Maintains clinical flexibility

## Multi-Step Forms

### Wizard Pattern

```tsx
function AdmissionWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  return (
    <Form>
      <FormHeader>
        <StepIndicator current={currentStep} total={totalSteps} />
      </FormHeader>
      
      {currentStep === 1 && <PatientInfoStep />}
      {currentStep === 2 && <InsuranceStep />}
      {currentStep === 3 && <ClinicalStep />}
      {currentStep === 4 && <OrdersStep />}
      {currentStep === 5 && <ReviewStep />}
      
      <FormActions>
        {currentStep > 1 && (
          <Button variant="secondary" onClick={() => setCurrentStep(currentStep - 1)}>
            Back
          </Button>
        )}
        
        {currentStep < totalSteps ? (
          <Button variant="primary" onClick={() => setCurrentStep(currentStep + 1)}>
            Next
          </Button>
        ) : (
          <Button variant="primary" type="submit">
            Submit Admission
          </Button>
        )}
      </FormActions>
    </Form>
  );
}
```

## Tab Forms

### Tab Pattern

```tsx
function PatientForm() {
  const [activeTab, setActiveTab] = useState('demographics');
  
  return (
    <Form>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="demographics" label="Demographics" />
        <Tab value="contact" label="Contact" />
        <Tab value="clinical" label="Clinical" />
        <Tab value="insurance" label="Insurance" />
      </Tabs>
      
      <TabPanel value="demographics" active={activeTab === 'demographics'}>
        <DemographicsFields />
      </TabPanel>
      
      <TabPanel value="contact" active={activeTab === 'contact'}>
        <ContactFields />
      </TabPanel>
      
      {/* More panels */}
      
      <StickyFormFooter>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary" type="submit">Save Patient</Button>
      </StickyFormFooter>
    </Form>
  );
}
```

## Keyboard Shortcuts

### Standard Shortcuts

```tsx
import { useKeyboardShortcut } from '@/design-system/hooks';

function ClinicalNoteForm() {
  const { saveNow } = useAutoSave(...);
  
  // Ctrl+S to save
  useKeyboardShortcut({
    key: 's',
    ctrl: true,
    callback: saveNow
  });
  
  // Ctrl+Enter to submit
  useKeyboardShortcut({
    key: 'Enter',
    ctrl: true,
    callback: handleSubmit
  });
  
  return <Form>{/* ... */}</Form>;
}
```

## Accessibility

### Form Accessibility

```tsx
// Proper label association
<FormField label="Email" htmlFor="email-input">
  <Input id="email-input" name="email" />
</FormField>

// Required indicator
<FormField label="Name" required aria-required="true">
  <Input name="name" />
</FormField>

// Error announcement
<FormField 
  label="Email" 
  error={errors.email}
  aria-describedby="email-error"
>
  <Input 
    name="email" 
    aria-invalid={!!errors.email}
  />
  {errors.email && (
    <span id="email-error" role="alert">
      {errors.email}
    </span>
  )}
</FormField>

// Helper text
<FormField 
  label="Password"
  helperText="Must be at least 8 characters"
  aria-describedby="password-help"
>
  <Input type="password" name="password" />
  <span id="password-help">{helperText}</span>
</FormField>
```

## Best Practices

### DO ✅

- Divide long forms into logical sections
- Use auto-save for forms with 5+ fields
- Show save status clearly
- Validate inline (on blur)
- Group related fields
- Use structured fields before narrative
- Implement keyboard shortcuts
- Show validation summary for multiple errors
- Use sticky footer for long forms
- Remember form state on page refresh

### DON'T ❌

- Create excessively long uninterrupted forms
- Hide important fields in collapsed sections
- Use color as sole error indicator
- Validate on every keystroke (annoying)
- Mix unrelated fields in same section
- Force structured data when narrative is better
- Forget to handle unsaved changes warning
- Submit forms without validation
- Lose form data on accidental navigation

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
