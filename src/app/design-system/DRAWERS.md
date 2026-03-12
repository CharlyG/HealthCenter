# Drawer and Side Panel Rules

Guidelines for drawers and side panels in the healthcare platform.

## Overview

Drawers provide secondary detail and contextual workflows without leaving the current page context. They load lazily and preserve page state.

## When to Use Drawers

### Use Drawers For:
- ✅ Patient summary views
- ✅ Admission details
- ✅ Medication details
- ✅ Document preview
- ✅ Claim details
- ✅ Caregiver profile
- ✅ Integration logs
- ✅ Quick edit workflows
- ✅ Contextual help/documentation

### Don't Use Drawers For:
- ❌ Primary workflows (use full pages)
- ❌ Deep nested workflows (use navigation)
- ❌ Multiple levels of drawers (max 2 levels)
- ❌ Critical data entry (use forms on pages)
- ❌ Long multi-step processes (use wizard pages)

## Drawer Anatomy

```
┌─────────────────────────────────────┬─────────────────────────────┐
│                                     │  Drawer Header              │
│  Main Page Content                  │  ┌───────────────────────┐  │
│  (remains visible and interactive)  │  │ Title          [Close]│  │
│                                     │  └───────────────────────┘  │
│                                     ├─────────────────────────────┤
│                                     │  Drawer Body                │
│                                     │                             │
│                                     │  [Content loads lazily]     │
│                                     │                             │
│                                     │                             │
│                                     ├─────────────────────────────┤
│                                     │  Drawer Footer (optional)   │
│                                     │  [Actions]                  │
└─────────────────────────────────────┴─────────────────────────────┘
```

## Drawer Sizes

### Small Drawer (400px)
**Use for**: Quick previews, simple details

```tsx
<Drawer
  isOpen={open}
  onClose={close}
  size="sm"
  title="Patient Summary"
>
  <PatientQuickView patient={patient} />
</Drawer>
```

### Medium Drawer (600px) - Default
**Use for**: Most use cases, detailed views

```tsx
<Drawer
  isOpen={open}
  onClose={close}
  size="md"
  title="Admission Details"
>
  <AdmissionDetails admissionId={admissionId} />
</Drawer>
```

### Large Drawer (800px)
**Use for**: Document preview, complex forms

```tsx
<Drawer
  isOpen={open}
  onClose={close}
  size="lg"
  title="Document Preview"
>
  <DocumentPreview documentId={documentId} />
</Drawer>
```

### Full-Width Drawer
**Use for**: Side-by-side comparison, wide content

```tsx
<Drawer
  isOpen={open}
  onClose={close}
  size="full"
  title="Assessment Comparison"
>
  <AssessmentComparison leftId={id1} rightId={id2} />
</Drawer>
```

## Component API

### Drawer Component

```tsx
interface DrawerProps {
  /** Drawer open state */
  isOpen: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Drawer title */
  title: string;
  
  /** Drawer size */
  size?: 'sm' | 'md' | 'lg' | 'full';
  
  /** Drawer content */
  children: React.ReactNode;
  
  /** Footer content */
  footer?: React.ReactNode;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string;
  
  /** Prevent closing on overlay click */
  disableOverlayClose?: boolean;
  
  /** Prevent closing on escape */
  disableEscapeClose?: boolean;
  
  /** Custom header actions */
  headerActions?: React.ReactNode;
  
  /** Z-index override */
  zIndex?: number;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  loading = false,
  error,
  disableOverlayClose = false,
  disableEscapeClose = false,
  headerActions,
  zIndex = layer.drawer
}) => {
  const sizeMap = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    full: '100%'
  };
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || disableEscapeClose) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, disableEscapeClose]);
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex
        }}
        onClick={() => !disableOverlayClose && onClose()}
      />
      
      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: sizeMap[size],
          maxWidth: '100vw',
          backgroundColor: surface.default,
          boxShadow: shadows.drawer,
          zIndex: zIndex + 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: space.lg,
          borderBottom: `1px solid ${borderColor.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2
            id="drawer-title"
            style={{
              fontSize: typography.sectionTitle.size,
              fontWeight: typography.sectionTitle.weight,
              color: textColor.primary,
              margin: 0
            }}
          >
            {title}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
            {headerActions}
            <button
              onClick={onClose}
              aria-label="Close drawer"
              style={{
                padding: space.sm,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: textColor.secondary
              }}
            >
              <CloseIcon size={20} />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: space.lg
        }}>
          {loading && <DrawerSkeleton />}
          {error && <ErrorState message={error} />}
          {!loading && !error && children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div style={{
            padding: space.lg,
            borderTop: `1px solid ${borderColor.default}`,
            backgroundColor: surface.subtle
          }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
```

## Drawer Patterns

### 1. Patient Summary Drawer

```tsx
<Drawer
  isOpen={patientDrawerOpen}
  onClose={() => setPatientDrawerOpen(false)}
  size="md"
  title={patient.name}
  headerActions={
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(`/patient/${patient.id}`)}
    >
      View Full Chart
    </Button>
  }
>
  <PatientSummaryDrawer patientId={patient.id} />
</Drawer>

// Lazy loaded content
function PatientSummaryDrawer({ patientId }: { patientId: string }) {
  const { data: patient, loading } = usePatient(patientId);
  
  if (loading) return <Skeleton />;
  
  return (
    <div>
      <SummarySection title="Demographics">
        <DataRow label="MRN" value={patient.mrn} />
        <DataRow label="DOB" value={formatDate(patient.dob)} />
        <DataRow label="Age" value={patient.age} />
      </SummarySection>
      
      <SummarySection title="Active Admissions">
        {patient.activeAdmissions.map(admission => (
          <AdmissionCard key={admission.id} admission={admission} />
        ))}
      </SummarySection>
      
      <SummarySection title="Recent Activity">
        <ActivityTimeline activities={patient.recentActivity} />
      </SummarySection>
    </div>
  );
}
```

### 2. Document Preview Drawer

```tsx
<Drawer
  isOpen={previewOpen}
  onClose={() => setPreviewOpen(false)}
  size="lg"
  title="Visit Note Preview"
  headerActions={
    <>
      <Button variant="ghost" size="sm" onClick={downloadDocument}>
        Download
      </Button>
      <Button variant="ghost" size="sm" onClick={printDocument}>
        Print
      </Button>
    </>
  }
  footer={
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
        Close
      </Button>
      <Button variant="primary" onClick={signDocument}>
        Sign Document
      </Button>
    </div>
  }
>
  <DocumentPreview documentId={documentId} />
</Drawer>
```

### 3. Quick Edit Drawer

```tsx
<Drawer
  isOpen={editDrawerOpen}
  onClose={() => setEditDrawerOpen(false)}
  size="md"
  title="Edit Visit"
  footer={
    <div className="flex justify-between">
      <Button variant="link" onClick={() => setEditDrawerOpen(false)}>
        Cancel
      </Button>
      <div className="flex gap-3">
        <SaveStatus status={saveStatus} />
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  }
>
  <VisitEditForm visitId={visitId} onSave={handleSave} />
</Drawer>
```

### 4. Integration Logs Drawer

```tsx
<Drawer
  isOpen={logsOpen}
  onClose={() => setLogsOpen(false)}
  size="lg"
  title="Integration Logs"
  headerActions={
    <Select
      value={logLevel}
      onChange={setLogLevel}
      options={[
        { value: 'all', label: 'All Levels' },
        { value: 'error', label: 'Errors Only' },
        { value: 'warning', label: 'Warnings Only' }
      ]}
    />
  }
>
  <IntegrationLogs
    integrationId={integrationId}
    level={logLevel}
  />
</Drawer>
```

## Nested Drawers

**Maximum 2 levels of drawers**

```tsx
// Level 1: Patient drawer
<Drawer isOpen={patientOpen} onClose={closePatient} title="Patient Details">
  <PatientDetails />
  
  {/* Level 2: Admission drawer opens on top */}
  <Drawer
    isOpen={admissionOpen}
    onClose={closeAdmission}
    title="Admission Details"
    zIndex={layer.drawer + 10}
  >
    <AdmissionDetails />
  </Drawer>
</Drawer>
```

**Avoid deeper nesting** - Navigate to a full page instead

## Performance Rules

### 1. Lazy Load Content

```tsx
// ❌ DON'T: Load drawer content on page mount
function PatientList() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { data: patientDetails } = usePatientDetails(selectedPatient?.id); // ⚠️ Loads for all patients!
  
  return (
    <>
      <PatientTable patients={patients} onRowClick={setSelectedPatient} />
      <Drawer isOpen={!!selectedPatient}>
        {patientDetails}
      </Drawer>
    </>
  );
}

// ✅ DO: Load drawer content only when opened
function PatientList() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  return (
    <>
      <PatientTable patients={patients} onRowClick={(p) => setSelectedPatientId(p.id)} />
      <Drawer isOpen={!!selectedPatientId}>
        {selectedPatientId && <PatientDrawerContent patientId={selectedPatientId} />}
      </Drawer>
    </>
  );
}

// Content component loads data only when rendered
function PatientDrawerContent({ patientId }: { patientId: string }) {
  const { data, loading } = usePatientDetails(patientId); // ✅ Loads only when drawer opens
  
  if (loading) return <Skeleton />;
  return <PatientDetails patient={data} />;
}
```

### 2. Avoid Page Rerenders

```tsx
// ❌ DON'T: Store drawer state in page component
function PatientListPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  return (
    <>
      <ExpensivePatientTable />  {/* ⚠️ Rerenders when drawer opens! */}
      <Drawer isOpen={drawerOpen} />
    </>
  );
}

// ✅ DO: Isolate drawer state
function PatientListPage() {
  return (
    <>
      <ExpensivePatientTable />
      <PatientDrawerContainer />  {/* ✅ Manages own state */}
    </>
  );
}

function PatientDrawerContainer() {
  const [open, setOpen] = useState(false);
  // Drawer state doesn't affect PatientTable
  return <Drawer isOpen={open} />;
}
```

### 3. Preserve Page Context

**Drawers should NOT**:
- Clear page filters
- Reset page scroll position
- Lose page state
- Unload page data

```tsx
// ✅ Drawer preserves page state
function AdmissionQueue() {
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('date');
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  
  return (
    <>
      {/* Page maintains its state */}
      <FilterBar filters={filters} onChange={setFilters} />
      <AdmissionTable
        filters={filters}
        sortBy={sortBy}
        onRowClick={setSelectedAdmission}
      />
      
      {/* Drawer doesn't affect page state */}
      <Drawer isOpen={!!selectedAdmission}>
        <AdmissionDetails admission={selectedAdmission} />
      </Drawer>
    </>
  );
}
```

## Loading and Error States

### Loading State

```tsx
<Drawer isOpen={open} onClose={close} title="Patient Details" loading>
  {/* Skeleton automatically shown */}
</Drawer>

// Or custom loading
function DrawerContent({ patientId }: { patientId: string }) {
  const { data, loading, error } = usePatient(patientId);
  
  if (loading) return <DrawerSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  return <PatientDetails patient={data} />;
}
```

### Error State

```tsx
<Drawer isOpen={open} onClose={close} title="Patient Details" error="Failed to load patient">
  {/* Error automatically shown */}
</Drawer>
```

## Accessibility

### Focus Management

```tsx
// Focus first focusable element when drawer opens
useEffect(() => {
  if (isOpen) {
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }
}, [isOpen]);

// Return focus to trigger element when drawer closes
const triggerRef = useRef<HTMLElement>();

const openDrawer = (e: React.MouseEvent<HTMLElement>) => {
  triggerRef.current = e.currentTarget;
  setDrawerOpen(true);
};

const closeDrawer = () => {
  setDrawerOpen(false);
  triggerRef.current?.focus();
};
```

### Keyboard Navigation

```tsx
// Escape to close
// Tab to navigate within drawer
// Focus trap within drawer

<Drawer
  isOpen={open}
  onClose={close}
  onEscapeKey={close}
  trapFocus
>
  {content}
</Drawer>
```

### ARIA Attributes

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="drawer-title"
  aria-describedby="drawer-description"
>
  <h2 id="drawer-title">{title}</h2>
  <div id="drawer-description">{description}</div>
  {content}
</div>
```

## Best Practices

### DO ✅

- Load drawer content lazily
- Keep drawers focused on a single task
- Provide clear close affordances
- Support keyboard navigation (Escape to close)
- Show loading states
- Handle errors gracefully
- Preserve page context
- Use appropriate drawer size
- Limit nesting to 2 levels
- Return focus on close

### DON'T ❌

- Load drawer content on page mount
- Create deep nested drawer hierarchies (>2 levels)
- Use drawers for primary workflows
- Lose page state when drawer opens
- Forget loading/error states
- Make drawers too wide (>800px for detail)
- Skip keyboard accessibility
- Auto-open drawers without user action
- Use drawers for critical data entry
- Forget to clean up on unmount

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
