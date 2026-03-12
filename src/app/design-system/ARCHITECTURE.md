# Design System Architecture

Production-grade design system for HIPAA-compliant healthcare platform.

## Overview

This design system is organized into **6 layers** that build upon each other to create consistent, accessible, and performant UI components.

```
┌─────────────────────────────────────────┐
│  6. Screen Shells                        │  ← Page layouts
├─────────────────────────────────────────┤
│  5. Healthcare-Specific Patterns         │  ← Domain patterns
├─────────────────────────────────────────┤
│  4. Reusable Components                  │  ← UI components
├─────────────────────────────────────────┤
│  3. Component Tokens                     │  ← Component-specific tokens
├─────────────────────────────────────────┤
│  2. Semantic Tokens                      │  ← Usage-based tokens
├─────────────────────────────────────────┤
│  1. Foundations                          │  ← Raw design values
└─────────────────────────────────────────┘
```

---

## Layer 1: Foundations

**Purpose**: Raw design values that form the foundation of the design system.

**Location**: `/src/app/design-system/foundations/`

**Contents**:
- Color scales (neutral, primary, semantic)
- Typography (font sizes, weights, line heights)
- Spacing scale (4px-based)
- Border radius
- Shadows
- Z-index scale
- Motion (durations, easing)

**Rules**:
- ❌ **NEVER** use foundation tokens directly in components
- ✅ Use semantic tokens instead
- Foundation tokens are only consumed by semantic tokens

**Example**:
```ts
// ❌ DON'T DO THIS
<div style={{ color: neutral[700] }}>

// ✅ DO THIS
<div style={{ color: textColor.secondary }}>
```

---

## Layer 2: Semantic Tokens

**Purpose**: Usage-based tokens that describe **intent** rather than raw values.

**Location**: `/src/app/design-system/semantic/`

**Contents**:
- Text colors (primary, secondary, muted, disabled)
- Surface colors (default, elevated, subtle, sunken)
- Border colors (default, strong, subtle)
- Background states (hover, selected, disabled)
- Focus ring styles
- Status colors (success, warning, danger, info)
- Typography presets (pageTitle, cardTitle, body, etc.)
- Spacing presets (gaps, padding, margins)

**Benefits**:
- Self-documenting code
- Centralized theme control
- Easy dark mode implementation
- Consistent color usage across platform

**Example**:
```tsx
// Semantic tokens clearly describe usage
<div className="text-color-secondary bg-surface-subtle border-color-default">
  <h2 className="typography-cardTitle">Patient Information</h2>
</div>
```

---

## Layer 3: Component Tokens

**Purpose**: Component-specific design tokens.

**Location**: `/src/app/design-system/components/[component]/tokens.ts`

**Contents**:
- Button variants (primary, secondary, danger, ghost)
- Input sizes (sm, base, lg)
- Badge styles
- Table row heights
- Card padding
- etc.

**Rules**:
- Component tokens build on semantic tokens
- Each component can have its own token file
- Tokens should be composable and predictable

**Example**:
```ts
// Button component tokens
export const buttonTokens = {
  variants: {
    primary: {
      bg: bgState.primaryDefault,
      bgHover: bgState.primaryHover,
      text: textColor.inverted
    },
    secondary: {
      bg: bgState.secondaryDefault,
      bgHover: bgState.secondaryHover,
      text: textColor.primary
    }
  }
};
```

---

## Layer 4: Reusable Components

**Purpose**: Small, composable UI components.

**Location**: `/src/app/design-system/components/`

**Component Categories**:

### Form Components
- `Input` - Text input
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `Radio` - Radio input
- `Switch` - Toggle switch
- `Textarea` - Multi-line text input
- `DatePicker` - Date selection
- `FormField` - Field wrapper with label/error

### Display Components
- `Badge` - Status badge
- `Avatar` - User avatar
- `Tag` - Removable tag
- `Pill` - Status pill
- `StatusDot` - Status indicator
- `Icon` - Icon wrapper

### Layout Components
- `Card` - Card container
- `Panel` - Panel container
- `Divider` - Separator
- `Stack` - Vertical/horizontal stack
- `Grid` - Grid layout
- `Spacer` - Spacing element

### Feedback Components
- `Alert` - Alert message
- `Toast` - Toast notification
- `Spinner` - Loading spinner
- `Skeleton` - Skeleton loader
- `ProgressBar` - Progress indicator

### Overlay Components
- `Modal` - Modal dialog
- `Drawer` - Side drawer
- `Popover` - Popover content
- `Tooltip` - Tooltip
- `Dropdown` - Dropdown menu

### Navigation Components
- `Tabs` - Tab navigation
- `Breadcrumbs` - Breadcrumb navigation
- `Pagination` - Pagination controls
- `Menu` - Navigation menu

### Data Display Components
- `Table` - Data table
- `DataGrid` - Advanced data grid
- `List` - List container
- `ListItem` - List item
- `EmptyState` - Empty state display

### Action Components
- `Button` - Button
- `IconButton` - Icon-only button
- `ButtonGroup` - Button group
- `ActionMenu` - Action dropdown

**Component Rules**:

1. **Small and Focused**
   - Each component should do ONE thing well
   - Avoid giant page-specific components
   - Break down complex UI into smaller pieces

2. **Composable**
   - Components should compose together
   - Use children props for flexibility
   - Support render props when needed

3. **Predictable**
   - Consistent prop names across components
   - Predictable behavior
   - Clear documentation

4. **Separation of Concerns**
   - Layout responsibility (positioning, spacing)
   - Display responsibility (visual appearance)
   - Interaction responsibility (events, handlers)
   - Data responsibility (data fetching/management)

**Example**:
```tsx
// ❌ BAD: Giant page-specific component
function PatientListPage() {
  // 500 lines of mixed layout, data, and business logic
}

// ✅ GOOD: Composed from small components
function PatientListPage() {
  return (
    <PageShell>
      <PageHeader title="Patients" actions={<CreatePatientButton />} />
      <FilterBar filters={filters} onFilter={handleFilter} />
      <PatientTable data={patients} onRowClick={handleRowClick} />
      <PatientDrawer patient={selectedPatient} onClose={closeDrawer} />
    </PageShell>
  );
}
```

---

## Layer 5: Healthcare-Specific Patterns

**Purpose**: Domain-specific patterns for healthcare workflows.

**Location**: `/src/app/design-system/patterns/`

**Pattern Categories**:

### Clinical Patterns
- `VitalSignsCard` - Vital signs display
- `MedicationList` - Medication list
- `DiagnosisList` - Diagnosis list
- `AllergyList` - Allergy list
- `OrderCard` - Clinical order card
- `AssessmentForm` - Assessment form structure
- `ClinicalNote` - Clinical note template

### Operational Patterns
- `QueueItem` - Queue item structure
- `AdmissionCard` - Admission summary card
- `VisitCard` - Visit card
- `TimelineItem` - Timeline event item
- `StatusTimeline` - Status progression timeline
- `AssignmentCard` - Assignment card

### Administrative Patterns
- `BillingCard` - Billing information card
- `InsuranceCard` - Insurance details
- `AuthorizationCard` - Authorization tracking
- `ComplianceChecklist` - Compliance checklist

### Caregiver Patterns
- `CaregiverProfile` - Caregiver profile display
- `ScheduleCard` - Schedule card
- `CredentialBadge` - Credential badge
- `ComplianceStatus` - Compliance status display

**Pattern Rules**:
- Build on top of reusable components
- Encode domain knowledge
- Standardize common healthcare UI patterns
- Reduce duplication across modules

**Example**:
```tsx
// Healthcare-specific pattern
<VitalSignsCard
  vitals={{
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 98.6,
    respiratoryRate: 16
  }}
  timestamp={new Date()}
  abnormals={['heartRate']}
/>
```

---

## Layer 6: Screen Shells

**Purpose**: Reusable page layout templates.

**Location**: `/src/app/design-system/shells/`

**Shell Types**:

### Application Shell
- Global navigation
- User menu
- Workspace switcher
- Global search
- Notification center

### Page Shells
- `ListPageShell` - List/table pages
- `DetailPageShell` - Detail/view pages
- `FormPageShell` - Form pages
- `DashboardShell` - Dashboard pages
- `SplitViewShell` - Master-detail pages
- `TabsPageShell` - Multi-tab pages

### Section Shells
- `PageHeader` - Consistent page header
- `FilterBar` - Filter controls
- `SummaryCards` - Summary card grid
- `ActionBar` - Bulk action bar
- `DetailPanel` - Side detail panel

**Shell Rules**:
- All pages MUST use a shell
- ❌ No one-off layouts for individual pages
- Shells define layout structure, not content
- Shells handle responsive behavior

**Example**:
```tsx
// List page using shell
<ListPageShell
  header={
    <PageHeader
      title="Patients"
      subtitle="Active admissions"
      actions={<Button>Create Patient</Button>}
    />
  }
  filters={<FilterBar filters={filters} onFilter={handleFilter} />}
  summary={<SummaryCards cards={summaryData} />}
  content={<PatientTable data={patients} />}
  drawer={selectedPatient && <PatientDrawer patient={selectedPatient} />}
/>
```

---

## Component Architecture Rules

### 1. Keep Components Small

**Goal**: Components should be easy to understand, test, and reuse.

```tsx
// ❌ BAD: Giant component (500+ lines)
function PatientChart() {
  // Mixing data fetching, business logic, and rendering
  return <div>{/* 500 lines of mixed code */}</div>;
}

// ✅ GOOD: Small, focused components
function PatientChart() {
  const { patient } = usePatient();
  return (
    <ChartShell>
      <VitalSigns vitals={patient.vitals} />
      <Medications medications={patient.medications} />
      <Diagnoses diagnoses={patient.diagnoses} />
    </ChartShell>
  );
}
```

### 2. Separation of Concerns

**Layout Responsibility**:
```tsx
// Layout component - handles positioning
function PageLayout({ header, sidebar, content }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64">{sidebar}</aside>
      <main className="flex-1">
        <header>{header}</header>
        <div>{content}</div>
      </main>
    </div>
  );
}
```

**Display Responsibility**:
```tsx
// Display component - handles visual appearance
function PatientCard({ patient }) {
  return (
    <Card>
      <Avatar src={patient.photo} />
      <h3>{patient.name}</h3>
      <Badge status={patient.status} />
    </Card>
  );
}
```

**Interaction Responsibility**:
```tsx
// Interaction component - handles events
function EditButton({ onEdit }) {
  return <Button onClick={onEdit}>Edit</Button>;
}
```

**Data Responsibility**:
```tsx
// Data component - handles data fetching
function PatientDataProvider({ patientId, children }) {
  const { data, loading } = usePatient(patientId);
  return children({ data, loading });
}
```

### 3. Composition Over Configuration

**Prefer**:
```tsx
// Composition - flexible, clear
<Card>
  <CardHeader>
    <CardTitle>Patient Info</CardTitle>
    <CardActions><Button>Edit</Button></CardActions>
  </CardHeader>
  <CardBody>
    <PatientInfo patient={patient} />
  </CardBody>
</Card>
```

**Over**:
```tsx
// Configuration - rigid, unclear
<Card
  title="Patient Info"
  actions={[{ label: 'Edit', onClick: handleEdit }]}
  body={<PatientInfo patient={patient} />}
  showHeader
  showActions
/>
```

### 4. Predictable Props

**Consistent naming**:
```tsx
// ✅ GOOD: Consistent prop names
<Modal isOpen={open} onClose={handleClose}>
<Drawer isOpen={open} onClose={handleClose}>
<Dialog isOpen={open} onClose={handleClose}>

// ❌ BAD: Inconsistent prop names
<Modal visible={open} onDismiss={handleClose}>
<Drawer open={open} onHide={handleClose}>
<Dialog show={open} onCancel={handleClose}>
```

**Predictable behavior**:
```tsx
// All components with "disabled" prop should behave the same
<Button disabled>...</Button>
<Input disabled />
<Select disabled />
```

---

## React Performance Rules

### 1. Avoid Unnecessary Re-renders

```tsx
// ❌ BAD: Recreates function on every render
function PatientList({ patients }) {
  return patients.map(patient => (
    <PatientCard
      key={patient.id}
      patient={patient}
      onEdit={() => handleEdit(patient.id)}  // ⚠️ New function every render!
    />
  ));
}

// ✅ GOOD: Stable callback
function PatientList({ patients }) {
  const handleEdit = useCallback((patientId) => {
    // Edit logic
  }, []);

  return patients.map(patient => (
    <PatientCard
      key={patient.id}
      patient={patient}
      onEdit={handleEdit}
    />
  ));
}
```

### 2. Memoize Expensive Computations

```tsx
// ✅ Memoize expensive derived values
const sortedPatients = useMemo(
  () => patients.sort((a, b) => a.name.localeCompare(b.name)),
  [patients]
);

// ✅ Memoize table columns (large column definitions)
const columns = useMemo(() => [
  { key: 'name', label: 'Name', render: ... },
  { key: 'mrn', label: 'MRN', render: ... },
  // ... more columns
], []);
```

### 3. Lazy Loading

```tsx
// ✅ Lazy load heavy components
const PatientDrawer = lazy(() => import('./PatientDrawer'));
const DocumentPreview = lazy(() => import('./DocumentPreview'));

function PatientList() {
  return (
    <>
      <PatientTable />
      <Suspense fallback={<Spinner />}>
        {drawerOpen && <PatientDrawer />}
      </Suspense>
    </>
  );
}
```

### 4. Stable Props

```tsx
// ❌ BAD: Inline object creation
<Table columns={[{ key: 'name' }]} />  // New array every render!

// ✅ GOOD: Stable reference
const columns = [{ key: 'name' }];
<Table columns={columns} />
```

### 5. Avoid Full Page Rerenders

```tsx
// ❌ BAD: Drawer state in parent causes full page rerender
function Page() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <ExpensiveTable />  {/* Rerenders when drawer opens! */}
      <Drawer open={drawerOpen} />
    </>
  );
}

// ✅ GOOD: Drawer state is isolated
function Page() {
  return (
    <>
      <ExpensiveTable />
      <DrawerContainer />  {/* Manages its own state */}
    </>
  );
}
```

---

## Data Fetching Rules

### 1. Server-Side Operations

**All list operations must be server-side**:
- Pagination
- Filtering
- Sorting
- Search

```tsx
// ✅ Server-side pagination
function PatientList() {
  const { data, loading } = usePatients({
    page: 1,
    pageSize: 50,
    filter: { status: 'active' },
    sort: { field: 'name', direction: 'asc' }
  });
}
```

### 2. Summary vs Detail Data

```tsx
// ✅ Load summary data for lists
const { patients } = usePatients();  // Returns: { id, name, mrn, status }

// ✅ Load detail data when needed
const { patient } = usePatient(patientId);  // Returns: full patient object

// ❌ DON'T load full patient history for list view
```

### 3. Lazy Load Tabs

```tsx
// ✅ Load tab content when tab is opened
function PatientTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <TabPanel value="overview">
        <OverviewTab />  {/* Always loaded */}
      </TabPanel>
      <TabPanel value="vitals">
        {activeTab === 'vitals' && <VitalsTab />}  {/* Lazy loaded */}
      </TabPanel>
      <TabPanel value="medications">
        {activeTab === 'medications' && <MedicationsTab />}  {/* Lazy loaded */}
      </TabPanel>
    </Tabs>
  );
}
```

### 4. Cache Reference Data

```tsx
// ✅ Cache frequently used reference data
const { offices } = useCachedOffices();  // Cached globally
const { payers } = useCachedPayers();
const { disciplines } = useCachedDisciplines();
```

### 5. Avoid N+1 Fetches

```tsx
// ❌ BAD: N+1 fetch pattern
function PatientList({ patients }) {
  return patients.map(patient => (
    <PatientCard patient={patient}>
      <CareTeam patientId={patient.id} />  {/* Fetches for each patient! */}
    </PatientCard>
  ));
}

// ✅ GOOD: Batch fetch
function PatientList({ patients }) {
  const patientIds = patients.map(p => p.id);
  const { careTeams } = useCareTeams(patientIds);  // Single fetch

  return patients.map(patient => (
    <PatientCard patient={patient}>
      <CareTeam team={careTeams[patient.id]} />
    </PatientCard>
  ));
}
```

---

## State Management Rules

### Local State

**Use for**:
- Form input state
- Drawer/modal open/close
- Inline filters
- Temporary UI toggles
- Pagination state
- Sort/filter state

```tsx
// ✅ Local state for local concerns
function PatientList() {
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
}
```

### Shared State

**Use for**:
- Current user
- User permissions
- Selected patient context
- Selected admission context
- Global notifications
- Global search state
- Command palette state

```tsx
// ✅ Shared state for global concerns
const { user } = useAuth();
const { selectedPatient } = usePatientContext();
const { notify } = useNotifications();
```

### State Shape

```tsx
// ❌ DON'T store large API objects
const [patients, setPatients] = useState([/* full patient objects */]);

// ✅ DO store IDs or minimal summaries
const [patientIds, setPatientIds] = useState(['123', '456']);
const [patientSummaries, setPatientSummaries] = useState([
  { id: '123', name: 'John Doe', status: 'active' }
]);
```

---

## Page Composition Rules

### Standard Page Structure

```tsx
// ✅ All pages follow this structure
<ApplicationShell>
  <PageShell>
    <PageHeader
      title="Page Title"
      subtitle="Page description"
      actions={<CreateButton />}
    />
    
    <SummaryCards cards={summaryData} />
    
    <FilterBar filters={filters} onFilter={handleFilter} />
    
    <MainContent>
      {/* Primary content - table, cards, etc. */}
    </MainContent>
    
    <Drawer open={drawerOpen}>
      {/* Secondary content */}
    </Drawer>
  </PageShell>
</ApplicationShell>
```

### Layout Primitives

**Available primitives**:
- `Stack` - Vertical/horizontal stacking
- `Grid` - Grid layout
- `Flex` - Flexbox layout
- `Spacer` - Spacing element
- `Divider` - Visual separator
- `Container` - Max-width container
- `Section` - Content section

```tsx
// ✅ Compose layouts from primitives
<Container>
  <Stack gap="lg">
    <PageHeader />
    <Divider />
    <Grid cols={3} gap="md">
      <Card />
      <Card />
      <Card />
    </Grid>
  </Stack>
</Container>
```

---

## Next Steps

1. ✅ Foundation tokens defined
2. ✅ Semantic tokens defined
3. ⏳ Create component tokens
4. ⏳ Build reusable components
5. ⏳ Create healthcare patterns
6. ⏳ Build screen shells
7. ⏳ Document component API
8. ⏳ Create Storybook stories
9. ⏳ Build example screens

---

**Version**: 1.0  
**Last Updated**: March 11, 2026  
**Status**: Architecture Complete - Implementation In Progress
