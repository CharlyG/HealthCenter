# Field Component Rules

Comprehensive guide for form field components in the healthcare platform.

## Field Component Architecture

All field components share a common structure and behavior to ensure consistency across the application.

### Common Field Structure

```tsx
<FieldWrapper>
  <Label>
    Field Label
    {required && <RequiredIndicator />}
    {helpIcon && <HelpTooltip />}
  </Label>
  
  <FieldInput>
    {/* Actual input element */}
  </FieldInput>
  
  {helperText && <HelperText>{helperText}</HelperText>}
  {error && <ErrorText>{error}</ErrorText>}
</FieldWrapper>
```

## Field Components

### 1. Text Input

**Use for**: Names, MRNs, phone numbers, short text

```tsx
interface TextInputProps {
  /** Field label */
  label: string;
  
  /** Input name */
  name: string;
  
  /** Input value */
  value: string;
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** Input type */
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password';
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Required field */
  required?: boolean;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Read-only state */
  readOnly?: boolean;
  
  /** Helper text */
  helperText?: string;
  
  /** Error message */
  error?: string;
  
  /** Maximum length */
  maxLength?: number;
  
  /** Autocomplete hint */
  autoComplete?: string;
  
  /** Input mask (e.g., phone format) */
  mask?: string;
  
  /** Prefix icon */
  prefix?: React.ReactNode;
  
  /** Suffix icon */
  suffix?: React.ReactNode;
}

// Example usage
<TextInput
  label="Medical Record Number"
  name="mrn"
  value={mrn}
  onChange={setMrn}
  required
  helperText="Format: ABC-12345"
  error={errors.mrn}
  mask="AAA-99999"
/>
```

**States**:
- Default
- Focus (with focus ring)
- Filled
- Error (red border + error text)
- Disabled (gray background + reduced opacity)
- Read-only (no border + gray background)

### 2. Textarea

**Use for**: Clinical notes, descriptions, narratives

```tsx
interface TextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  
  /** Number of visible rows */
  rows?: number;
  
  /** Auto-resize as user types */
  autoResize?: boolean;
  
  /** Maximum height (for auto-resize) */
  maxHeight?: number;
  
  /** Character counter */
  showCharCount?: boolean;
  
  /** Maximum characters */
  maxLength?: number;
  
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
}

// Example usage
<Textarea
  label="Clinical Notes"
  name="notes"
  value={notes}
  onChange={setNotes}
  rows={4}
  autoResize
  maxHeight={300}
  showCharCount
  maxLength={2000}
  helperText="Document patient observations and interventions"
/>
```

### 3. Select

**Use for**: Fixed option lists (statuses, disciplines, payers)

```tsx
interface SelectProps {
  label: string;
  name: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  
  /** Options */
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  
  /** Enable multiple selection */
  multiple?: boolean;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Allow clearing selection */
  clearable?: boolean;
  
  /** Enable search/filter */
  searchable?: boolean;
  
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helperText?: string;
  error?: string;
}

// Example usage
<Select
  label="Admission Status"
  name="status"
  value={status}
  onChange={setStatus}
  options={[
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'discharged', label: 'Discharged' }
  ]}
  required
/>
```

### 4. Async Search Select

**Use for**: Large datasets (patients, caregivers, medications)

```tsx
interface AsyncSearchSelectProps {
  label: string;
  name: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  
  /** Async search function */
  onSearch: (query: string) => Promise<Array<{
    value: string;
    label: string;
    meta?: any;
  }>>;
  
  /** Debounce delay (ms) */
  debounce?: number;
  
  /** Minimum characters to trigger search */
  minChars?: number;
  
  /** Multiple selection */
  multiple?: boolean;
  
  /** Custom option renderer */
  renderOption?: (option: any) => React.ReactNode;
  
  /** Loading state */
  loading?: boolean;
  
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
}

// Example usage
<AsyncSearchSelect
  label="Assign Caregiver"
  name="caregiver"
  value={caregiverId}
  onChange={setCaregiverId}
  onSearch={async (query) => {
    const results = await searchCaregivers(query);
    return results.map(c => ({
      value: c.id,
      label: `${c.name} - ${c.discipline}`,
      meta: c
    }));
  }}
  debounce={300}
  minChars={2}
  placeholder="Search by name or ID..."
  renderOption={(option) => (
    <div>
      <div>{option.meta.name}</div>
      <div className="text-sm text-gray-500">{option.meta.discipline}</div>
    </div>
  )}
/>
```

### 5. Date Picker

**Use for**: Single date selection (admission date, birth date)

```tsx
interface DatePickerProps {
  label: string;
  name: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  
  /** Minimum selectable date */
  minDate?: Date;
  
  /** Maximum selectable date */
  maxDate?: Date;
  
  /** Disable specific dates */
  disabledDates?: Date[];
  
  /** Date format display */
  format?: string;
  
  /** Show time picker */
  showTime?: boolean;
  
  /** Time format (12h/24h) */
  timeFormat?: '12h' | '24h';
  
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
}

// Example usage
<DatePicker
  label="Admission Date"
  name="admissionDate"
  value={admissionDate}
  onChange={setAdmissionDate}
  maxDate={new Date()}
  format="MM/dd/yyyy"
  required
  helperText="Date patient was admitted to service"
/>
```

### 6. Date Range

**Use for**: Date range selection (reporting periods, date filters)

```tsx
interface DateRangeProps {
  label: string;
  name: string;
  value: { start: Date | null; end: Date | null };
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  
  /** Minimum selectable date */
  minDate?: Date;
  
  /** Maximum selectable date */
  maxDate?: Date;
  
  /** Preset ranges */
  presets?: Array<{
    label: string;
    range: { start: Date; end: Date };
  }>;
  
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
}

// Example usage
<DateRange
  label="Reporting Period"
  name="period"
  value={period}
  onChange={setPeriod}
  presets={[
    { label: 'Last 7 days', range: getLast7Days() },
    { label: 'Last 30 days', range: getLast30Days() },
    { label: 'This month', range: getThisMonth() },
    { label: 'Last month', range: getLastMonth() }
  ]}
/>
```

### 7. Radio Group

**Use for**: Mutually exclusive options (gender, yes/no)

```tsx
interface RadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  
  /** Radio options */
  options: Array<{
    value: string;
    label: string;
    helperText?: string;
    disabled?: boolean;
  }>;
  
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
}

// Example usage
<RadioGroup
  label="Patient Gender"
  name="gender"
  value={gender}
  onChange={setGender}
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'declined', label: 'Declined to specify' }
  ]}
  direction="horizontal"
  required
/>
```

### 8. Checkbox

**Use for**: Boolean options, consent, acknowledgments

```tsx
interface CheckboxProps {
  /** Checkbox label */
  label: string;
  
  /** Field name */
  name: string;
  
  /** Checked state */
  checked: boolean;
  
  /** Change handler */
  onChange: (checked: boolean) => void;
  
  /** Helper text below checkbox */
  helperText?: string;
  
  /** Indeterminate state (for parent checkboxes) */
  indeterminate?: boolean;
  
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
}

// Example usage
<Checkbox
  label="Patient has known allergies"
  name="hasAllergies"
  checked={hasAllergies}
  onChange={setHasAllergies}
  helperText="Check if patient has documented allergies"
/>

// Checkbox group example
<CheckboxGroup
  label="Disciplines Required"
  helperText="Select all disciplines needed for this patient"
  error={errors.disciplines}
>
  <Checkbox
    label="Skilled Nursing"
    name="discipline_sn"
    checked={disciplines.includes('SN')}
    onChange={(checked) => toggleDiscipline('SN', checked)}
  />
  <Checkbox
    label="Physical Therapy"
    name="discipline_pt"
    checked={disciplines.includes('PT')}
    onChange={(checked) => toggleDiscipline('PT', checked)}
  />
  <Checkbox
    label="Occupational Therapy"
    name="discipline_ot"
    checked={disciplines.includes('OT')}
    onChange={(checked) => toggleDiscipline('OT', checked)}
  />
</CheckboxGroup>
```

### 9. Switch

**Use for**: Settings, toggles, feature flags

```tsx
interface SwitchProps {
  /** Switch label */
  label: string;
  
  /** Field name */
  name: string;
  
  /** Checked state */
  checked: boolean;
  
  /** Change handler */
  onChange: (checked: boolean) => void;
  
  /** Helper text */
  helperText?: string;
  
  /** Label position */
  labelPosition?: 'left' | 'right';
  
  disabled?: boolean;
  readOnly?: boolean;
}

// Example usage
<Switch
  label="Enable Auto-Assignment"
  name="autoAssignment"
  checked={autoAssignment}
  onChange={setAutoAssignment}
  helperText="Automatically assign visits to available caregivers"
  labelPosition="left"
/>
```

### 10. Segmented Control

**Use for**: View toggles, filter options (2-4 options)

```tsx
interface SegmentedControlProps {
  /** Field label */
  label?: string;
  
  /** Field name */
  name: string;
  
  /** Selected value */
  value: string;
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** Segments */
  segments: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  
  /** Full width */
  fullWidth?: boolean;
  
  disabled?: boolean;
}

// Example usage
<SegmentedControl
  name="view"
  value={view}
  onChange={setView}
  segments={[
    { value: 'list', label: 'List', icon: <ListIcon /> },
    { value: 'grid', label: 'Grid', icon: <GridIcon /> },
    { value: 'calendar', label: 'Calendar', icon: <CalendarIcon /> }
  ]}
  fullWidth
/>
```

### 11. Lookup Field

**Use for**: Reference data with detailed preview (diagnoses, medications)

```tsx
interface LookupFieldProps {
  label: string;
  name: string;
  value: string | null;
  onChange: (value: string | null) => void;
  
  /** Search function */
  onSearch: (query: string) => Promise<any[]>;
  
  /** Display selected item */
  renderValue: (item: any) => React.ReactNode;
  
  /** Display search results */
  renderOption: (item: any) => React.ReactNode;
  
  /** Open detail panel */
  onViewDetails?: (item: any) => void;
  
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  placeholder?: string;
}

// Example usage
<LookupField
  label="Primary Diagnosis"
  name="primaryDiagnosis"
  value={diagnosisId}
  onChange={setDiagnosisId}
  onSearch={searchDiagnoses}
  renderValue={(diagnosis) => (
    <div>
      <div className="font-medium">{diagnosis.code}</div>
      <div className="text-sm text-gray-600">{diagnosis.description}</div>
    </div>
  )}
  renderOption={(diagnosis) => (
    <div>
      <div className="font-medium">{diagnosis.code} - {diagnosis.description}</div>
      <div className="text-xs text-gray-500">Category: {diagnosis.category}</div>
    </div>
  )}
  onViewDetails={(diagnosis) => openDiagnosisDrawer(diagnosis)}
  required
/>
```

### 12. File Upload

**Use for**: Document uploads, attachments, images

```tsx
interface FileUploadProps {
  label: string;
  name: string;
  value: File[] | null;
  onChange: (files: File[]) => void;
  
  /** Accepted file types */
  accept?: string;
  
  /** Multiple files */
  multiple?: boolean;
  
  /** Maximum file size (bytes) */
  maxSize?: number;
  
  /** Maximum number of files */
  maxFiles?: number;
  
  /** Drag and drop area */
  dropzone?: boolean;
  
  /** Show file preview */
  showPreview?: boolean;
  
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
}

// Example usage
<FileUpload
  label="Supporting Documents"
  name="documents"
  value={documents}
  onChange={setDocuments}
  accept=".pdf,.doc,.docx,.jpg,.png"
  multiple
  maxSize={10 * 1024 * 1024} // 10MB
  maxFiles={5}
  dropzone
  showPreview
  helperText="Upload physician orders, insurance cards, or other supporting documents"
/>
```

### 13. Signature Capture

**Use for**: Electronic signatures, consents

```tsx
interface SignatureCaptureProps {
  label: string;
  name: string;
  value: string | null; // Base64 encoded signature
  onChange: (signature: string | null) => void;
  
  /** Canvas width */
  width?: number;
  
  /** Canvas height */
  height?: number;
  
  /** Pen color */
  penColor?: string;
  
  /** Line width */
  lineWidth?: number;
  
  /** Show clear button */
  showClear?: boolean;
  
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
}

// Example usage
<SignatureCapture
  label="Patient Signature"
  name="patientSignature"
  value={signature}
  onChange={setSignature}
  width={400}
  height={150}
  showClear
  required
  helperText="Patient must sign to acknowledge consent"
/>
```

## Field States

### Visual States

All fields must support these visual states:

#### 1. Default State
```tsx
{
  border: borderColor.default,
  background: surface.default,
  color: textColor.primary
}
```

#### 2. Focus State
```tsx
{
  border: borderColor.focus,
  boxShadow: focusRing.default,
  outline: 'none'
}
```

#### 3. Filled State
```tsx
{
  border: borderColor.default,
  background: surface.default,
  color: textColor.primary
}
```

#### 4. Error State
```tsx
{
  border: borderColor.danger,
  background: surface.default,
  color: textColor.primary
}
// + Error message displayed below
```

#### 5. Disabled State
```tsx
{
  border: borderColor.disabled,
  background: surface.disabled,
  color: textColor.disabled,
  cursor: 'not-allowed',
  opacity: 0.6
}
```

#### 6. Read-Only State
```tsx
{
  border: 'none',
  background: surface.subtle,
  color: textColor.primary,
  cursor: 'default'
}
```

## Field Components Anatomy

### Label
```tsx
<label
  htmlFor={inputId}
  style={{
    display: 'block',
    fontSize: typography.label.size,
    fontWeight: typography.label.weight,
    color: textColor.primary,
    marginBottom: space.sm
  }}
>
  {label}
  {required && (
    <span style={{ color: status.danger.text, marginLeft: '4px' }}>
      *
    </span>
  )}
  {helpIcon && (
    <HelpTooltip content={helpContent} />
  )}
</label>
```

### Helper Text
```tsx
{helperText && (
  <div
    style={{
      fontSize: typography.helper.size,
      color: textColor.muted,
      marginTop: space.sm
    }}
  >
    {helperText}
  </div>
)}
```

### Error Message
```tsx
{error && (
  <div
    role="alert"
    style={{
      fontSize: typography.helper.size,
      color: status.danger.text,
      marginTop: space.sm,
      display: 'flex',
      alignItems: 'center',
      gap: space.xs
    }}
  >
    <ErrorIcon size={14} />
    {error}
  </div>
)}
```

### Required Indicator
```tsx
{required && (
  <span
    aria-label="Required field"
    style={{
      color: status.danger.text,
      marginLeft: space.xs
    }}
  >
    *
  </span>
)}
```

## Validation Patterns

### Validation Timing

```tsx
// 1. On blur (first validation)
<Input
  onBlur={() => validateField(name)}
/>

// 2. On change (after touched)
<Input
  onChange={(value) => {
    setValue(value);
    if (touched) validateField(name);
  }}
/>

// 3. On submit
<Form onSubmit={validateAllFields}>
```

### Validation Rules

```tsx
const validationRules = {
  // Required
  required: (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
  },
  
  // Email
  email: (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      return 'Invalid email format';
    }
  },
  
  // Phone
  phone: (value: string) => {
    const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (!regex.test(value)) {
      return 'Invalid phone number';
    }
  },
  
  // Date range
  dateRange: (value: { start: Date; end: Date }) => {
    if (value.end < value.start) {
      return 'End date must be after start date';
    }
  },
  
  // Custom validation
  custom: (value: any, validator: (val: any) => boolean, message: string) => {
    if (!validator(value)) {
      return message;
    }
  }
};
```

## Accessibility Requirements

### 1. Label Association
```tsx
<label htmlFor="patient-mrn">MRN</label>
<input id="patient-mrn" name="mrn" />
```

### 2. Required Indicator
```tsx
<input aria-required="true" required />
```

### 3. Error Announcement
```tsx
<input
  aria-invalid={!!error}
  aria-describedby={error ? `${id}-error` : undefined}
/>
{error && (
  <div id={`${id}-error`} role="alert">
    {error}
  </div>
)}
```

### 4. Helper Text Association
```tsx
<input aria-describedby={`${id}-helper`} />
<div id={`${id}-helper`}>{helperText}</div>
```

### 5. Disabled State
```tsx
<input disabled aria-disabled="true" />
```

## Best Practices

### DO ✅

- Use consistent field sizing across forms
- Provide clear labels and helper text
- Validate on blur, not on every keystroke
- Show error messages inline
- Use appropriate input types (email, tel, number)
- Support keyboard navigation
- Provide clear focus states
- Use autocomplete attributes
- Debounce async searches
- Show loading states for async operations

### DON'T ❌

- Use placeholder as label
- Validate on every keystroke (annoying)
- Hide required indicators
- Use color as sole error indicator
- Create custom inputs without accessibility
- Forget disabled/read-only states
- Make fields too small for content
- Skip helper text for complex fields
- Trigger search on every character
- Forget to handle edge cases

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
