# Design System Architecture

Comprehensive architecture documentation for the healthcare platform design system.

## Table of Contents

1. [Overview](#overview)
2. [Design System Layers](#design-system-layers)
3. [Token System](#token-system)
4. [Component Architecture](#component-architecture)
5. [Performance Rules](#performance-rules)
6. [Data Fetching Patterns](#data-fetching-patterns)
7. [State Management](#state-management)
8. [Page Composition](#page-composition)
9. [Healthcare-Specific Patterns](#healthcare-specific-patterns)

---

## Overview

This design system is built for **high information density**, **accessibility**, and **consistency** across all modules of the healthcare platform.

### Design Principles

1. **Information Density** - Display maximum relevant data without clutter
2. **Calm Visual Hierarchy** - Clear but not overwhelming
3. **Fast Workflows** - Minimize clicks, optimize for keyboard navigation
4. **Consistency** - Reuse patterns, avoid one-off solutions
5. **Accessibility** - WCAG 2.1 AA compliant
6. **Performance** - Fast load times, smooth interactions

---

## Design System Layers

The design system is organized into 6 layers:

```
┌─────────────────────────────────────────┐
│  6. Screen Shells                       │  ← Page layouts
├─────────────────────────────────────────┤
│  5. Healthcare-Specific Patterns        │  ← Domain patterns
├─────────────────────────────────────────┤
│  4. Reusable Components                 │  ← UI components
├─────────────────────────────────────────┤
│  3. Component Tokens                    │  ← Component styling
├─────────────────────────────────────────┤
│  2. Semantic Tokens                     │  ← Usage-based tokens
├─────────────────────────────────────────┤
│  1. Foundations                         │  ← Raw design values
└─────────────────────────────────────────┘
```

### Layer 1: Foundations

**Raw design values** - colors, typography, spacing, etc.

**Location**: `/src/design-system/foundations/`

**Files**:
- `colors.ts` - Color scales (neutral, primary, semantic)
- `typography.ts` - Font families, sizes, weights, text styles
- `spacing.ts` - Spacing scale (4px grid system)
- `radius.ts` - Border radius scale
- `borders.ts` - Border widths and styles
- `shadows.ts` - Shadow system for elevation
- `elevation.ts` - Z-index and stacking contexts
- `motion.ts` - Animation and transition timing

**Rule**: Components must **NOT** import foundation tokens directly. Use semantic tokens instead.

### Layer 2: Semantic Tokens

**Usage-based tokens** that describe intent, not appearance.

**Location**: `/src/design-system/tokens/semantic.ts`

**Token Categories**:
- `text.*` - Text colors (primary, secondary, muted, etc.)
- `surface.*` - Surface backgrounds (default, elevated, hover, etc.)
- `border.*` - Border colors (default, strong, subtle, etc.)
- `background.*` - Interactive element backgrounds (buttons, inputs, etc.)
- `state.*` - State colors (success, warning, danger, info, disabled)
- `focusRing.*` - Focus indication
- `healthcare.*` - Healthcare-specific semantic colors
- `chart.*` - Data visualization colors

**Examples**:
```tsx
// ✅ CORRECT - Use semantic tokens
const textColor = text.primary;
const bgColor = surface.elevated;
const borderColor = border.default;

// ❌ WRONG - Don't use foundation tokens directly
const textColor = colors.neutral[900];  // NO!
const bgColor = colors.neutral[0];      // NO!
```

### Layer 3: Component Tokens

**Component-specific tokens** built on semantic tokens.

**Location**: `/src/design-system/tokens/component.ts`

**Token Categories**:
- `button.*` - Button sizing, variants, states
- `input.*` - Input sizing, states
- `card.*` - Card variants, spacing
- `table.*` - Table cells, headers, rows
- `badge.*` - Badge sizing, variants
- `modal.*` - Modal sizing, spacing
- `drawer.*` - Drawer sizing
- `tooltip.*` - Tooltip styling
- `toast.*` - Toast variants
- `form.*` - Form field spacing, labels

**Example**:
```tsx
import { button } from '@/design-system/tokens';

// Button component uses component tokens
const ButtonStyles = {
  height: button.size.md.height,
  padding: `${button.size.md.paddingY} ${button.size.md.paddingX}`,
  background: button.variant.primary.bg,
  color: button.variant.primary.text,
  borderRadius: button.radius,
  fontWeight: button.fontWeight
};
```

### Layer 4: Reusable Components

**Small, composable UI components**.

**Location**: `/src/app/components/` (existing) or `/src/design-system/components/`

**Categories**:
- **Primitives** - Button, Input, Select, Checkbox, etc.
- **Layout** - Card, Panel, Stack, Grid, etc.
- **Data Display** - Table, List, Badge, Avatar, etc.
- **Feedback** - Alert, Toast, Modal, Tooltip, etc.
- **Navigation** - Tabs, Breadcrumbs, Pagination, etc.

**Rules**:
1. Components must be **small** (< 200 lines)
2. Components must be **reusable** (not page-specific)
3. Components must be **composable** (work together)
4. Components must use **component tokens** or **semantic tokens**
5. Components must be **accessible** (ARIA, keyboard navigation)
6. Components must be **performant** (memoized, optimized)

### Layer 5: Healthcare-Specific Patterns

**Domain-specific composite patterns**.

**Examples**:
- Patient header
- Visit item
- Admission card
- Order item
- QA review panel
- Clinical note section
- Medication list item
- Caregiver profile card

**Rules**:
1. Built from Layer 4 components
2. Encapsulate healthcare domain logic
3. Consistent across all modules
4. Reusable across different contexts

### Layer 6: Screen Shells

**Page layout templates**.

**Examples**:
- List + Detail Shell
- Dashboard Shell
- Form Shell
- Queue Shell
- Wizard Shell

**Rules**:
1. Define page-level layout structure
2. Handle responsive behavior
3. Manage navigation patterns
4. No business logic

---

## Token System

### Foundation Tokens

#### Colors

```tsx
// Neutral scale (0-1000)
neutral[0]    // #FFFFFF - Pure white
neutral[50]   // #FAFAFA - Subtle background
neutral[100]  // #F5F5F5 - Surface background
neutral[200]  // #E5E5E5 - Default border
neutral[500]  // #737373 - Muted text
neutral[900]  // #171717 - Primary text
neutral[1000] // #000000 - Pure black

// Primary brand
primary[500]  // #3B82F6 - Main brand color
primary[600]  // #2563EB - Brand hover

// Semantic colors
success[600]  // #16A34A - Success actions
warning[600]  // #D97706 - Warnings
danger[600]   // #DC2626 - Errors, destructive actions
info[600]     // #2563EB - Informational
```

#### Typography

```tsx
// Font sizes (optimized for density)
fontSize.xs   // 11px - Micro labels
fontSize.sm   // 12px - Helper text, compact tables
fontSize.base // 13px - Table cells, secondary text
fontSize.md   // 14px - Body text, form labels
fontSize.lg   // 15px - Card titles
fontSize.xl   // 16px - Section titles
fontSize['2xl'] // 18px - Page titles

// Font weights
fontWeight.normal   // 400
fontWeight.medium   // 500
fontWeight.semibold // 600
fontWeight.bold     // 700
```

#### Spacing

**Strict 4px grid system**:

```tsx
spacing[0]  // 0
spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px
spacing[5]  // 20px
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px
spacing[16] // 64px
```

**Semantic spacing**:

```tsx
semanticSpacing.componentMd  // 12px - Standard component padding
semanticSpacing.cardPadding  // 16px - Card padding
semanticSpacing.sectionMd    // 32px - Section gaps
semanticSpacing.tableCellPadding // 12px - Table cells
```

### Semantic Tokens

**Text Colors**:

```tsx
text.primary    // Main content - neutral[900]
text.secondary  // Less emphasized - neutral[600]
text.muted      // Helper text - neutral[500]
text.disabled   // Disabled state - neutral[400]
text.inverted   // On dark backgrounds - neutral[0]
text.link       // Link text - primary[600]
```

**Surface Colors**:

```tsx
surface.default  // Page background - neutral[0]
surface.subtle   // Slight contrast - neutral[50]
surface.elevated // Cards, panels - neutral[0]
surface.hover    // Hover state - neutral[50]
surface.selected // Selected state - primary[50]
```

**State Colors**:

```tsx
// Success state
state.success.bg      // success[50]
state.success.border  // success[300]
state.success.text    // success[800]
state.success.icon    // success[600]

// Warning, danger, info follow same pattern
```

### Component Tokens

**Button Tokens**:

```tsx
button.size.md.height    // 36px
button.size.md.paddingX  // 16px
button.size.md.paddingY  // 8px

button.variant.primary.bg       // primary[600]
button.variant.primary.bgHover  // primary[700]
button.variant.primary.text     // neutral[0]
```

**Input Tokens**:

```tsx
input.size.md.height   // 36px
input.size.md.paddingX // 12px

input.state.default.bg     // neutral[0]
input.state.default.border // neutral[200]
input.state.focus.border   // primary[500]
input.state.focus.shadow   // Focus ring
```

---

## Component Architecture

### Component Composition Rules

**Rule 1: Build Small Components**

Components should be **< 200 lines** and have a **single responsibility**.

```tsx
// ❌ BAD - Monolithic component
function PatientDashboard() {
  // 800 lines of mixed concerns
  return (
    <div>
      <Header />
      <PatientInfo />
      <MedicationList />
      <VisitHistory />
      <Documents />
      {/* All logic mixed together */}
    </div>
  );
}

// ✅ GOOD - Composed from small components
function PatientDashboard({ patientId }: Props) {
  return (
    <DashboardShell>
      <PatientHeader patientId={patientId} />
      <DashboardGrid>
        <MedicationPanel patientId={patientId} />
        <VisitPanel patientId={patientId} />
        <DocumentPanel patientId={patientId} />
      </DashboardGrid>
    </DashboardShell>
  );
}
```

**Rule 2: Separate Concerns**

Components should separate:
- **Layout responsibility** - How things are positioned
- **Display responsibility** - How things look
- **Interaction responsibility** - How things behave
- **Data responsibility** - Where data comes from

```tsx
// ✅ Layout Component
function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {children}
    </div>
  );
}

// ✅ Display Component
function MedicationCard({ medication }: { medication: Medication }) {
  return (
    <Card>
      <CardTitle>{medication.name}</CardTitle>
      <CardContent>
        <Text>{medication.dosage}</Text>
        <Badge>{medication.frequency}</Badge>
      </CardContent>
    </Card>
  );
}

// ✅ Container Component (data + composition)
function MedicationPanel({ patientId }: { patientId: string }) {
  const { medications, loading } = useMedications(patientId);
  
  if (loading) return <MedicationSkeleton />;
  
  return (
    <Panel title="Medications">
      {medications.map(med => (
        <MedicationCard key={med.id} medication={med} />
      ))}
    </Panel>
  );
}
```

**Rule 3: Prefer Composition Over Configuration**

```tsx
// ❌ BAD - Too many props, configuration hell
<DataTable
  columns={columns}
  data={data}
  sortable
  filterable
  paginated
  selectable
  expandable
  stickyHeader
  compactMode
  onSort={handleSort}
  onFilter={handleFilter}
  onPageChange={handlePage}
  onRowSelect={handleSelect}
  onRowExpand={handleExpand}
  renderExpandedRow={renderExpanded}
  // ... 20 more props
/>

// ✅ GOOD - Composition pattern
<Table>
  <TableHeader sticky>
    <TableRow>
      <TableHeaderCell sortable onSort={handleSort}>Name</TableHeaderCell>
      <TableHeaderCell>Date</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.id} selectable onSelect={handleSelect}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.date}</TableCell>
        <TableCell><Badge>{row.status}</Badge></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Common Composition Patterns

**Pattern: List + Detail**

```tsx
function PatientListView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  return (
    <ListDetailShell>
      <ListPanel>
        <PatientList onSelect={setSelectedId} />
      </ListPanel>
      
      {selectedId && (
        <DetailDrawer>
          <PatientDetail patientId={selectedId} />
        </DetailDrawer>
      )}
    </ListDetailShell>
  );
}
```

**Pattern: Panel with Actions**

```tsx
function MedicationPanel({ patientId }: Props) {
  return (
    <Panel
      title="Active Medications"
      actions={
        <Button onClick={handleAdd}>Add Medication</Button>
      }
    >
      <MedicationList patientId={patientId} />
    </Panel>
  );
}
```

**Pattern: Card Grid**

```tsx
function Dashboard() {
  return (
    <DashboardGrid columns={3}>
      <StatCard label="Total Patients" value={142} />
      <StatCard label="Active Visits" value={23} />
      <StatCard label="Pending Orders" value={8} />
    </DashboardGrid>
  );
}
```

---

## Performance Rules

### Rule 1: Build Small Components

Large page files slow down development and runtime performance.

```tsx
// ❌ BAD - 1000-line page component
function PatientChartPage() {
  // Massive component with everything
}

// ✅ GOOD - Small, focused components
function PatientChartPage() {
  return (
    <PageShell>
      <PatientHeader />
      <TabNavigation />
      <TabContent />
    </PageShell>
  );
}
```

### Rule 2: Avoid Unnecessary Re-renders

```tsx
// ❌ BAD - Inline object creates new reference every render
<Button style={{ padding: '8px 16px' }}>Save</Button>

// ✅ GOOD - Stable reference
const buttonStyle = { padding: '8px 16px' };
<Button style={buttonStyle}>Save</Button>

// ✅ BETTER - Use design tokens
<Button>Save</Button>
```

### Rule 3: Memoize Expensive Computations

```tsx
function PatientTable({ patients }: Props) {
  // ❌ BAD - Recalculates on every render
  const sortedPatients = patients.sort((a, b) => 
    a.lastName.localeCompare(b.lastName)
  );
  
  // ✅ GOOD - Memoized
  const sortedPatients = useMemo(
    () => patients.sort((a, b) => a.lastName.localeCompare(b.lastName)),
    [patients]
  );
  
  return <Table data={sortedPatients} />;
}
```

### Rule 4: Memoize Table Columns

```tsx
// ❌ BAD - New array every render
function PatientTable() {
  return <Table columns={[
    { key: 'name', label: 'Name' },
    { key: 'mrn', label: 'MRN' }
  ]} />;
}

// ✅ GOOD - Stable reference
const PATIENT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'mrn', label: 'MRN' }
];

function PatientTable() {
  return <Table columns={PATIENT_COLUMNS} />;
}
```

### Rule 5: Use Lazy Loading

```tsx
// ❌ BAD - Load everything upfront
import { PatientDetailDrawer } from './PatientDetailDrawer';

// ✅ GOOD - Lazy load heavy components
const PatientDetailDrawer = lazy(() => import('./PatientDetailDrawer'));

function PatientList() {
  const [showDetail, setShowDetail] = useState(false);
  
  return (
    <>
      <List />
      {showDetail && (
        <Suspense fallback={<DrawerSkeleton />}>
          <PatientDetailDrawer />
        </Suspense>
      )}
    </>
  );
}
```

### Rule 6: Paginate or Virtualize Large Lists

```tsx
// ❌ BAD - Render all 10,000 rows
function PatientTable({ patients }: { patients: Patient[] }) {
  return (
    <table>
      {patients.map(p => <PatientRow key={p.id} patient={p} />)}
    </table>
  );
}

// ✅ GOOD - Server-side pagination
function PatientTable() {
  const [page, setPage] = useState(1);
  const { patients } = usePatients({ page, pageSize: 50 });
  
  return (
    <>
      <Table data={patients} />
      <Pagination page={page} onPageChange={setPage} />
    </>
  );
}

// ✅ ALSO GOOD - Virtual scrolling for long lists
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualPatientList({ patients }: { patients: Patient[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(item => (
          <PatientRow
            key={patients[item.index].id}
            patient={patients[item.index]}
          />
        ))}
      </div>
    </div>
  );
}
```

### Rule 7: Split Long Forms

```tsx
// ❌ BAD - 100-field form in one component
function AdmissionForm() {
  // 1000 lines of form fields
}

// ✅ GOOD - Split into sections/tabs
function AdmissionForm() {
  return (
    <Tabs>
      <Tab label="Patient Info">
        <PatientInfoSection />
      </Tab>
      <Tab label="Insurance">
        <InsuranceSection />
      </Tab>
      <Tab label="Clinical">
        <ClinicalSection />
      </Tab>
    </Tabs>
  );
}
```

### Rule 8: Avoid Full Page Rerenders

```tsx
// ❌ BAD - Opening drawer rerenders entire page
function Page() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  return (
    <div>
      <HeavyTable />  {/* Rerenders when drawer opens! */}
      <HeavyChart />  {/* Rerenders when drawer opens! */}
      {drawerOpen && <Drawer />}
    </div>
  );
}

// ✅ GOOD - Isolate drawer state
function Page() {
  return (
    <>
      <HeavyTable />   {/* Won't rerender */}
      <HeavyChart />   {/* Won't rerender */}
      <DrawerManager /> {/* Manages its own state */}
    </>
  );
}

const DrawerManager = memo(() => {
  const [open, setOpen] = useState(false);
  return open ? <Drawer onClose={() => setOpen(false)} /> : null;
});
```

---

## Data Fetching Patterns

### Rule 1: Server-Side Operations

**All filtering, sorting, and pagination must happen server-side.**

```tsx
// ❌ BAD - Client-side filtering of large dataset
const { patients } = usePatients(); // Fetches ALL patients
const filtered = patients.filter(p => p.status === 'active'); // Client-side!

// ✅ GOOD - Server-side filtering
const { patients } = usePatients({
  filters: { status: 'active' },
  page: 1,
  pageSize: 50,
  sortBy: 'lastName',
  sortOrder: 'asc'
});
```

### Rule 2: Load Summary Data First

```tsx
// ❌ BAD - Load full patient object in list
interface PatientListItem {
  id: string;
  demographics: { ... };  // Heavy nested object
  medications: [ ... ];    // Array of full med objects
  visits: [ ... ];         // Array of full visit objects
  documents: [ ... ];      // Large document array
}

// ✅ GOOD - Load only what's needed for the list
interface PatientListItem {
  id: string;
  name: string;
  mrn: string;
  status: string;
  lastVisitDate: string;
  // Only summary data!
}

// Load details when user opens the patient
function PatientDetailDrawer({ patientId }: { patientId: string }) {
  const { patient } = usePatientDetail(patientId); // Full data only when needed
  return <PatientDetail patient={patient} />;
}
```

### Rule 3: Lazy Load Tabs

```tsx
function PatientChart({ patientId }: { patientId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tab label="Overview">
        {activeTab === 'overview' && <OverviewTab patientId={patientId} />}
      </Tab>
      
      <Tab label="Medications">
        {/* Only fetch when tab is active */}
        {activeTab === 'medications' && <MedicationsTab patientId={patientId} />}
      </Tab>
      
      <Tab label="Documents">
        {activeTab === 'documents' && <DocumentsTab patientId={patientId} />}
      </Tab>
    </Tabs>
  );
}
```

### Rule 4: Cache Reference Data

```tsx
// ✅ Cache lookup data that rarely changes
const { offices } = useOffices();           // Cached
const { disciplines } = useDisciplines();   // Cached
const { payers } = usePayers();             // Cached
const { icd10Codes } = useICD10Codes();     // Cached

// Use React Query or similar for automatic caching
const { data: offices } = useQuery({
  queryKey: ['offices'],
  queryFn: fetchOffices,
  staleTime: 1000 * 60 * 60 // Cache for 1 hour
});
```

### Rule 5: Avoid N+1 Queries

```tsx
// ❌ BAD - N+1 query problem
function VisitList({ visits }: { visits: Visit[] }) {
  return (
    <>
      {visits.map(visit => (
        <VisitRow key={visit.id} visit={visit}>
          <CaregiverName caregiverId={visit.caregiverId} /> {/* Separate query! */}
        </VisitRow>
      ))}
    </>
  );
}

function CaregiverName({ caregiverId }: { caregiverId: string }) {
  const { caregiver } = useCaregiver(caregiverId); // N separate queries!
  return <span>{caregiver.name}</span>;
}

// ✅ GOOD - Include related data in initial fetch
interface VisitWithCaregiver {
  id: string;
  date: string;
  caregiverName: string; // Included in initial query
}

function VisitList({ visits }: { visits: VisitWithCaregiver[] }) {
  return (
    <>
      {visits.map(visit => (
        <VisitRow key={visit.id} visit={visit}>
          <span>{visit.caregiverName}</span>
        </VisitRow>
      ))}
    </>
  );
}
```

---

## State Management

### Local State

Use for:
- Form input state
- Drawer/modal open/close
- Inline filters
- Temporary UI toggles
- Tab selection
- Expanded/collapsed sections

```tsx
function PatientForm() {
  // ✅ Local state
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<FormErrors>({});
  
  return <Form data={formData} onChange={setFormData} errors={errors} />;
}
```

### Shared State

Use **ONLY** for:
- Current user
- User role and permissions
- Selected patient context
- Selected admission context
- Global notifications
- Global search state
- Command palette state

```tsx
// ✅ Shared state (via Context or Zustand)
const AppContext = createContext({
  user: null,
  selectedPatientId: null,
  selectedAdmissionId: null
});

// ❌ DON'T put in shared state
// - Form data (use local state)
// - Large API responses (use React Query cache)
// - UI toggles (use local state)
```

### State Scope Rules

```tsx
// ❌ BAD - Everything in global state
const useAppStore = create((set) => ({
  patients: [],
  filteredPatients: [],
  selectedPatient: null,
  patientDrawerOpen: false,
  patientFormData: {},
  // ... hundreds of properties
}));

// ✅ GOOD - Minimal global state
const useAppStore = create((set) => ({
  user: null,
  selectedPatientId: null
}));

// ✅ GOOD - Local state for local concerns
function PatientList() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({});
  // Local to this component tree
}
```

---

## Page Composition

### Standard Page Shells

**Shell 1: List + Optional Detail**

```tsx
<PageShell>
  <PageHeader title="Patients" />
  <FilterBar />
  <ListContent>
    <PatientTable />
  </ListContent>
  {selectedId && (
    <DetailDrawer>
      <PatientDetail patientId={selectedId} />
    </DetailDrawer>
  )}
</PageShell>
```

**Shell 2: Dashboard**

```tsx
<PageShell>
  <PageHeader title="Dashboard" />
  <SummaryCards />
  <DashboardGrid>
    <Panel title="Recent Activity">...</Panel>
    <Panel title="Alerts">...</Panel>
    <Panel title="Metrics">...</Panel>
  </DashboardGrid>
</PageShell>
```

**Shell 3: Form**

```tsx
<PageShell>
  <PageHeader title="New Admission" />
  <FormContent>
    <FormSections>
      <FormSection title="Patient Information">...</FormSection>
      <FormSection title="Insurance">...</FormSection>
    </FormSections>
  </FormContent>
  <StickyFooter>
    <Button variant="primary">Save</Button>
    <Button variant="secondary">Cancel</Button>
  </StickyFooter>
</PageShell>
```

**Shell 4: Queue/Operational List**

```tsx
<PageShell>
  <PageHeader title="Admission Queue" />
  <QueueFilters />
  <QueueStats />
  <QueueList>
    {items.map(item => <QueueItem key={item.id} item={item} />)}
  </QueueList>
</PageShell>
```

### Avoid One-Off Layouts

```tsx
// ❌ BAD - Custom layout for every page
function CustomPage1() {
  return (
    <div className="flex flex-col h-screen p-custom-23">
      <div className="sticky top-17 bg-custom">
        {/* One-off header */}
      </div>
      <div className="flex-1 overflow-custom">
        {/* One-off content area */}
      </div>
    </div>
  );
}

// ✅ GOOD - Reuse standard shell
function StandardPage() {
  return (
    <PageShell>
      <PageHeader title="Page Title" />
      <PageContent>
        {/* Content */}
      </PageContent>
    </PageShell>
  );
}
```

---

## Healthcare-Specific Patterns

### Pattern: Patient Header

**Reusable across all patient-related screens**

```tsx
<PatientHeader
  patientId={patientId}
  showAvatar
  showVitals
  showAlerts
/>
```

### Pattern: Visit Item

**Standard structure for visit lists/queues**

```tsx
<VisitItem
  visit={visit}
  showCaregiver
  showStatus
  quickActions={[
    { label: 'Start Visit', onClick: handleStart },
    { label: 'Cancel', onClick: handleCancel }
  ]}
/>
```

### Pattern: Status Badge

**Consistent status indication**

```tsx
<StatusBadge
  status={visit.status}
  variant={getStatusVariant(visit.status)}
/>
```

### Pattern: Queue Item

**Reusable for admission queue, QA queue, order queue, etc.**

```tsx
<QueueItem
  title={item.title}
  identifiers={[
    { label: 'MRN', value: item.mrn },
    { label: 'Admission', value: item.admissionId }
  ]}
  status={item.status}
  priority={item.priority}
  assignedTo={item.assignedUser}
  actions={[
    { label: 'Review', onClick: handleReview },
    { label: 'Assign', onClick: handleAssign }
  ]}
/>
```

---

## Summary

### Key Takeaways

1. **Use the token system** - Foundation → Semantic → Component
2. **Build small components** - < 200 lines, single responsibility
3. **Compose, don't configure** - Build up from small pieces
4. **Optimize performance** - Memoize, lazy load, paginate
5. **Server-side operations** - Filter, sort, paginate on server
6. **Minimal shared state** - Local state by default
7. **Reuse page shells** - No one-off layouts
8. **Consistent patterns** - Same structure across modules

### Next Steps

1. Review existing components for token compliance
2. Extract reusable patterns from current modules
3. Build component library with Storybook
4. Document healthcare-specific patterns
5. Create page shell templates
6. Establish code review checklist

---

**Last Updated**: March 11, 2026  
**Version**: 1.0  
**Maintained by**: Healthcare Platform Team
