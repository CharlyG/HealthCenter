# Focus Mode Rules

Guidelines for high-concentration workflows that require minimal distractions.

## Overview

Focus Mode reduces non-essential UI chrome while preserving critical context, progress, validation, and primary actions. Use for workflows requiring sustained attention and concentration.

## When to Use Focus Mode

### Clinical Workflows
- ✅ Clinical documentation
- ✅ OASIS-E assessments
- ✅ Plan of care editing
- ✅ Medication reconciliation
- ✅ Wound assessment
- ✅ Visit note completion

### QA and Review
- ✅ QA document review
- ✅ Clinical review
- ✅ Chart audit
- ✅ Compliance review

### Administrative Workflows
- ✅ Order entry
- ✅ Authorization request
- ✅ Discharge documentation
- ✅ Recertification planning

## Focus Mode Anatomy

```
┌─────────────────────────────────────────────────────────┐
│  Patient Context Bar (collapsed, minimal)               │
├─────────────────────────────────────────────────────────┤
│                                                           │
│                                                           │
│            PRIMARY CONTENT                                │
│            (maximized screen real estate)                 │
│                                                           │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  Progress · Validation Status · Primary Actions          │
└─────────────────────────────────────────────────────────┘
```

## Elements to Preserve

### 1. Patient Context

**Always show**:
- Patient name
- MRN
- DOB/Age
- Primary diagnosis

**Minimize but keep accessible**:
- Allergies (expandable)
- Active medications (expandable)
- Active orders (expandable)

```tsx
<FocusModePatientBar patient={patient} mode="collapsed">
  {/* Minimal display */}
  <div className="flex items-center gap-4 px-4 py-2">
    <div>
      <span className="font-semibold">{patient.name}</span>
      <span className="text-sm text-gray-500 ml-2">MRN: {patient.mrn}</span>
    </div>
    
    <ExpandButton onClick={toggleExpand} />
  </div>
  
  {/* Expanded view */}
  {expanded && (
    <div className="px-4 py-3 bg-gray-50">
      <AllergiesSection allergies={patient.allergies} />
      <MedicationsSection medications={patient.medications} />
    </div>
  )}
</FocusModePatientBar>
```

### 2. Admission Context

**Always show**:
- Admission ID
- Admission date
- Cert period
- Episode status

```tsx
<FocusModeAdmissionBar admission={admission} mode="minimal">
  <div className="text-sm text-gray-600">
    {admission.id} · {admission.certPeriod} · Admitted {formatDate(admission.startDate)}
  </div>
</FocusModeAdmissionBar>
```

### 3. Progress Indicator

**Show clear progress**:
- Current section
- Sections completed
- Sections remaining
- Overall completion %

```tsx
<FocusModeProgress>
  <div className="flex items-center gap-2">
    <div className="text-sm text-gray-600">
      Section {currentSection} of {totalSections}
    </div>
    
    <ProgressBar value={completionPercent} />
    
    <div className="text-sm font-medium">
      {completionPercent}% Complete
    </div>
  </div>
</FocusModeProgress>
```

### 4. Validation Status

**Real-time validation feedback**:
- Errors count
- Warnings count
- Required fields remaining

```tsx
<FocusModeValidation>
  {errors > 0 && (
    <div className="flex items-center gap-2 text-red-600">
      <AlertTriangle size={16} />
      <span>{errors} error{errors !== 1 ? 's' : ''}</span>
    </div>
  )}
  
  {warnings > 0 && (
    <div className="flex items-center gap-2 text-amber-600">
      <AlertCircle size={16} />
      <span>{warnings} warning{warnings !== 1 ? 's' : ''}</span>
    </div>
  )}
  
  {requiredFields > 0 && (
    <div className="text-sm text-gray-500">
      {requiredFields} required field{requiredFields !== 1 ? 's' : ''} remaining
    </div>
  )}
</FocusModeValidation>
```

### 5. Primary Actions

**Sticky footer with**:
- Save Draft
- Validate
- Submit
- Cancel

```tsx
<StickyFooter>
  <FooterLeft>
    <Button variant="link" onClick={handleCancel}>
      Exit Focus Mode
    </Button>
  </FooterLeft>
  
  <FooterCenter>
    <FocusModeProgress />
    <FocusModeValidation />
  </FooterCenter>
  
  <FooterRight>
    <SaveStatus status={saveStatus} />
    <Button variant="secondary" onClick={saveDraft}>
      Save Draft
    </Button>
    <Button variant="primary" onClick={handleSubmit} disabled={hasErrors}>
      Submit
    </Button>
  </FooterRight>
</StickyFooter>
```

## Elements to Hide

### Hide in Focus Mode:
- ❌ Global navigation
- ❌ Workspace navigation
- ❌ Secondary sidebars
- ❌ Marketing/promotional content
- ❌ Non-essential alerts
- ❌ Chat widgets
- ❌ Help panels (keep accessible via icon)

## Focus Mode Shell

```tsx
interface FocusModeShellProps {
  /** Page title */
  title: string;
  
  /** Patient context */
  patient?: Patient;
  
  /** Admission context */
  admission?: Admission;
  
  /** Progress tracking */
  progress?: {
    current: number;
    total: number;
  };
  
  /** Validation state */
  validation?: {
    errors: number;
    warnings: number;
    requiredFields: number;
  };
  
  /** Primary actions */
  actions: React.ReactNode;
  
  /** Exit handler */
  onExit: () => void;
  
  /** Content */
  children: React.ReactNode;
}

export function FocusModeShell({
  title,
  patient,
  admission,
  progress,
  validation,
  actions,
  onExit,
  children
}: FocusModeShellProps) {
  return (
    <div className="focus-mode-shell">
      {/* Minimal header */}
      <div className="focus-mode-header">
        {patient && (
          <FocusModePatientBar patient={patient} />
        )}
        
        {admission && (
          <FocusModeAdmissionBar admission={admission} />
        )}
        
        <div className="px-6 py-3 border-b">
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>
      
      {/* Main content - maximized */}
      <div className="focus-mode-content">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
      
      {/* Sticky footer */}
      <StickyFooter>
        <FooterLeft>
          <Button variant="link" onClick={onExit}>
            Exit Focus Mode
          </Button>
        </FooterLeft>
        
        <FooterCenter>
          {progress && (
            <div className="text-sm text-gray-600">
              Section {progress.current} of {progress.total}
            </div>
          )}
          
          {validation && (
            <FocusModeValidation {...validation} />
          )}
        </FooterCenter>
        
        <FooterRight>
          {actions}
        </FooterRight>
      </StickyFooter>
    </div>
  );
}
```

## Example Implementations

### 1. Clinical Documentation Focus Mode

```tsx
function ClinicalDocumentationFocusMode() {
  const { patient, admission } = useContext();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState({});
  const { errors, warnings, requiredFields } = useValidation(formData);
  
  return (
    <FocusModeShell
      title="Visit Note - Skilled Nursing"
      patient={patient}
      admission={admission}
      progress={{ current: currentSection, total: 5 }}
      validation={{ errors, warnings, requiredFields }}
      actions={
        <>
          <SaveStatus status="saved" lastSaved={new Date()} />
          <Button variant="secondary" onClick={saveDraft}>
            Save Draft
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={errors > 0}
          >
            Submit Note
          </Button>
        </>
      }
      onExit={() => navigate(-1)}
    >
      <VisitNoteForm
        section={currentSection}
        data={formData}
        onChange={setFormData}
        onSectionComplete={() => setCurrentSection(prev => prev + 1)}
      />
    </FocusModeShell>
  );
}
```

### 2. OASIS Assessment Focus Mode

```tsx
function OASISAssessmentFocusMode() {
  const { patient } = usePatient();
  const { sections, currentSection, goToSection } = useOASIS();
  
  return (
    <FocusModeShell
      title="OASIS-E Assessment - Start of Care"
      patient={patient}
      progress={{
        current: currentSection + 1,
        total: sections.length
      }}
      validation={{
        errors: sections[currentSection].errors,
        warnings: sections[currentSection].warnings,
        requiredFields: sections[currentSection].requiredFields
      }}
      actions={
        <>
          {currentSection > 0 && (
            <Button variant="secondary" onClick={() => goToSection(currentSection - 1)}>
              Previous
            </Button>
          )}
          
          {currentSection < sections.length - 1 ? (
            <Button variant="primary" onClick={() => goToSection(currentSection + 1)}>
              Next Section
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit}>
              Submit Assessment
            </Button>
          )}
        </>
      }
      onExit={confirmExit}
    >
      <OASISSection section={sections[currentSection]} />
    </FocusModeShell>
  );
}
```

### 3. Medication Reconciliation Focus Mode

```tsx
function MedicationReconciliationFocusMode() {
  const { patient } = usePatient();
  const { medications, reconcile } = useMedications();
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  
  const progress = {
    current: reviewed.size,
    total: medications.length
  };
  
  return (
    <FocusModeShell
      title="Medication Reconciliation"
      patient={patient}
      progress={progress}
      validation={{
        errors: 0,
        warnings: medications.filter(m => m.hasInteraction).length,
        requiredFields: medications.length - reviewed.size
      }}
      actions={
        <>
          <Button variant="secondary" onClick={saveDraft}>
            Save Progress
          </Button>
          <Button 
            variant="primary" 
            onClick={handleComplete}
            disabled={reviewed.size < medications.length}
          >
            Complete Reconciliation
          </Button>
        </>
      }
      onExit={confirmExit}
    >
      <MedicationReconciliationList
        medications={medications}
        reviewed={reviewed}
        onReview={setReviewed}
      />
    </FocusModeShell>
  );
}
```

## Keyboard Shortcuts in Focus Mode

```tsx
function useFocusModeShortcuts({
  onSave,
  onSubmit,
  onNext,
  onPrevious,
  onExit
}: FocusModeShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S - Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      
      // Cmd/Ctrl + Enter - Submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
      
      // Cmd/Ctrl + → - Next section
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
        e.preventDefault();
        onNext?.();
      }
      
      // Cmd/Ctrl + ← - Previous section
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevious?.();
      }
      
      // Escape - Exit (with confirmation)
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onSubmit, onNext, onPrevious, onExit]);
}
```

## Unsaved Changes Warning

```tsx
function FocusModeShell({ children, onExit, hasUnsavedChanges }: Props) {
  // Warn before closing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  // Confirm before exit
  const handleExit = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to exit?')) {
        onExit();
      }
    } else {
      onExit();
    }
  };
  
  return (
    <div className="focus-mode">
      {children}
      <ExitButton onClick={handleExit} />
    </div>
  );
}
```

## Best Practices

### DO ✅

- Minimize distractions
- Keep patient/admission context visible
- Show clear progress
- Display validation in real-time
- Use sticky footer for actions
- Support keyboard shortcuts
- Auto-save frequently
- Warn before exit with unsaved changes
- Use maximum screen width
- Keep critical context expandable

### DON'T ❌

- Hide patient information
- Remove all navigation
- Skip progress indicators
- Hide validation errors
- Forget auto-save
- Disable exit option
- Make focus mode mandatory
- Hide keyboard shortcuts
- Lose work on accidental exit
- Remove accessibility features

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
