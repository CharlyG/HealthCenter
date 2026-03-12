# Screen Generation Rules

**Master guide for generating all healthcare platform screens.**

## Overview

All screens must prioritize:
1. **Performance First** - Speed and efficiency over visual complexity
2. **Consistency First** - Cohesive experience over visual novelty
3. **Component Reuse** - Existing patterns over custom layouts
4. **Migration-Friendly** - Backend-agnostic architecture
5. **HIPAA Compliance** - Healthcare security standards

---

## Performance-First Rules

### When Generating Any New Screen

#### 1. Prefer Composition Over Large Custom Layouts

**❌ DON'T: Create monolithic page components**
```tsx
function PatientDashboard() {
  return (
    <div className="custom-patient-layout">
      {/* 800 lines of custom JSX */}
      <div className="custom-header">...</div>
      <div className="custom-sidebar">...</div>
      <div className="custom-content">...</div>
      <div className="custom-footer">...</div>
    </div>
  );
}
```

**✅ DO: Compose from reusable components**
```tsx
import { PatientContextShell } from '@/components/shells/PatientContextShell';
import { VitalSignsCard, MedicationCard, AlertsCard } from '@/components/healthcare';

function PatientDashboard({ patientId }: { patientId: string }) {
  const { patient } = usePatient(patientId);
  
  return (
    <PatientContextShell patientId={patientId}>
      <div className="grid grid-cols-3 gap-4">
        <VitalSignsCard vitals={patient.vitals} />
        <MedicationCard medications={patient.medications} />
        <AlertsCard alerts={patient.alerts} />
      </div>
    </PatientContextShell>
  );
}
```

**Benefits**:
- Faster development (reuse > rebuild)
- Better performance (optimized components)
- Easier maintenance (shared logic)
- Consistent UX (familiar patterns)

#### 2. Prefer Summary Data Over Full Detail Payloads

**❌ DON'T: Load full objects in list views**
```tsx
// Loads ALL patient data for list view
const { patients } = usePatients(); 
// Returns: { id, firstName, lastName, dob, ssn, address, phone, email, 
//           insurance, medications, vitals, allergies, diagnoses, ... }
```

**✅ DO: Load minimal data for lists, full data for details**
```tsx
// List view: Summary data only
const { patients } = usePatientsSummary();
// Returns: { id, name, mrn, status, lastVisit }

// Detail view: Full data when needed
function PatientDetails({ patientId }: { patientId: string }) {
  const { patient } = usePatient(patientId); // Full object
  return <PatientChart patient={patient} />;
}
```

**Data Loading Strategy**:
```
List View     → Summary payload (5-10 fields)
Card View     → Summary + key metrics (10-15 fields)
Detail View   → Full object (all fields)
Edit View     → Full object + relations
```

#### 3. Prefer Drawers for Secondary Context

**❌ DON'T: Navigate to new page for quick context**
```tsx
// Clicking patient row navigates to full page
<PatientRow onClick={() => navigate(`/patients/${patient.id}`)} />
```

**✅ DO: Use drawer for quick preview, navigation for full interaction**
```tsx
function PatientList() {
  const { isOpen, data, open, close } = useDrawer<Patient>();
  
  return (
    <>
      <PatientTable 
        onRowClick={open}  // Quick preview in drawer
        onRowDoubleClick={(patient) => navigate(`/patients/${patient.id}`)} // Full page
      />
      
      <PatientSummaryDrawer
        isOpen={isOpen}
        patient={data}
        onClose={close}
        onViewFull={() => navigate(`/patients/${data.id}`)}
      />
    </>
  );
}
```

**When to Use Drawers**:
- ✅ Quick reference (patient summary, medication details)
- ✅ Secondary actions (order details, document preview)
- ✅ Contextual help (field descriptions, validation rules)
- ✅ Form wizards (multi-step inline flows)

**When to Use Navigation**:
- ✅ Primary workflows (patient chart, admission dashboard)
- ✅ Complex editing (care plan, assessment)
- ✅ Multi-section views (patient tabs, workspace tabs)

#### 4. Prefer Lazy-Loaded Details

**❌ DON'T: Load all tab content upfront**
```tsx
function PatientChart({ patientId }: { patientId: string }) {
  const { vitals } = useVitals(patientId);           // ❌ Loads immediately
  const { medications } = useMedications(patientId); // ❌ Loads immediately
  const { documents } = useDocuments(patientId);     // ❌ Loads immediately
  const { orders } = useOrders(patientId);           // ❌ Loads immediately
  
  return (
    <Tabs>
      <TabPanel value="vitals"><VitalsView data={vitals} /></TabPanel>
      <TabPanel value="medications"><MedicationsView data={medications} /></TabPanel>
      <TabPanel value="documents"><DocumentsView data={documents} /></TabPanel>
      <TabPanel value="orders"><OrdersView data={orders} /></TabPanel>
    </Tabs>
  );
}
```

**✅ DO: Lazy load tab content**
```tsx
function PatientChart({ patientId }: { patientId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* Always load overview */}
      <TabPanel value="overview">
        <PatientOverview patientId={patientId} />
      </TabPanel>
      
      {/* Lazy load other tabs */}
      <TabPanel value="vitals">
        {activeTab === 'vitals' && <VitalsView patientId={patientId} />}
      </TabPanel>
      
      <TabPanel value="medications">
        {activeTab === 'medications' && <MedicationsView patientId={patientId} />}
      </TabPanel>
      
      <TabPanel value="documents">
        {activeTab === 'documents' && <DocumentsView patientId={patientId} />}
      </TabPanel>
    </Tabs>
  );
}
```

**Lazy Loading Patterns**:
```tsx
// 1. Conditional rendering
{activeTab === 'tab1' && <HeavyComponent />}

// 2. React.lazy with Suspense
const HeavyComponent = lazy(() => import('./HeavyComponent'));
<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>

// 3. On-demand data fetching
const { data } = useQuery(['key'], fetcher, {
  enabled: isVisible  // Only fetch when needed
});
```

#### 5. Prefer Reusable Shells and Sections

**❌ DON'T: Create unique page structure**
```tsx
function AdmissionQueue() {
  return (
    <div className="unique-queue-layout">
      <div className="unique-queue-header">
        <h1>Admission Queue</h1>
        <div className="unique-actions">...</div>
      </div>
      <div className="unique-filters">...</div>
      <div className="unique-queue-content">...</div>
      <div className="unique-pagination">...</div>
    </div>
  );
}
```

**✅ DO: Use existing shell patterns**
```tsx
import { ListPageShell } from '@/components/shells/ListPageShell';
import { FilterBar } from '@/components/common/FilterBar';
import { QueueCard } from '@/components/healthcare/QueueCard';

function AdmissionQueue() {
  return (
    <ListPageShell
      title="Admission Queue"
      icon={<ClipboardListIcon />}
      actions={<CreateAdmissionButton />}
      filters={
        <FilterBar
          filters={[
            { id: 'status', type: 'select', options: statusOptions },
            { id: 'priority', type: 'select', options: priorityOptions },
            { id: 'dateRange', type: 'dateRange' }
          ]}
          onFiltersChange={setFilters}
        />
      }
    >
      <PaginatedQueueList
        items={admissions}
        renderItem={(admission) => <QueueCard item={admission} />}
      />
    </ListPageShell>
  );
}
```

**Available Shells** (always check these first):
- `ListPageShell` - Entity lists and queues
- `DetailPageShell` - Entity details with tabs
- `EditorShell` - Forms and editing
- `WorkflowShell` - Multi-step processes
- `WorkspaceShell` - Workspace dashboards
- `PatientContextShell` - Patient-scoped pages
- `AdmissionContextShell` - Admission-scoped pages
- `SettingsShell` - Settings pages

---

## Consistency-First Visual Rules

### When Generating Screens, Prioritize:

#### 1. Clear Hierarchy

**Visual hierarchy should be immediately obvious:**

```tsx
// ✅ GOOD: Clear visual hierarchy
<div className="space-y-6">
  {/* Level 1: Page title */}
  <h1 style={{ fontSize: typography.h1.size, fontWeight: typography.h1.weight }}>
    Patients
  </h1>
  
  {/* Level 2: Section title */}
  <h2 style={{ fontSize: typography.h2.size, fontWeight: typography.h2.weight }}>
    Active Admissions
  </h2>
  
  {/* Level 3: Card title */}
  <h3 style={{ fontSize: typography.h3.size, fontWeight: typography.h3.weight }}>
    John Doe
  </h3>
  
  {/* Level 4: Body text */}
  <p style={{ fontSize: typography.body.size, color: textColor.primary }}>
    Patient details...
  </p>
  
  {/* Level 5: Helper text */}
  <p style={{ fontSize: typography.helper.size, color: textColor.muted }}>
    Last updated 2 hours ago
  </p>
</div>
```

**Typography Hierarchy**:
```
h1 (24px, 600) → Page titles
h2 (20px, 600) → Section titles
h3 (16px, 600) → Card/subsection titles
body (14px, 400) → Primary content
helper (12px, 400) → Metadata, timestamps
```

#### 2. Consistent Spacing

**Use design system spacing tokens:**

```tsx
import { space } from '@/design-system/semantic/tokens';

// ✅ DO: Use semantic spacing
<div style={{
  padding: space.lg,           // 16px
  gap: space.md,               // 12px
  marginBottom: space.xl       // 24px
}}>

// ❌ DON'T: Use arbitrary values
<div style={{
  padding: '17px',
  gap: '13px',
  marginBottom: '23px'
}}>
```

**Spacing Scale**:
```
space.xs   → 4px   → Tight spacing (icon-to-text)
space.sm   → 8px   → Related elements
space.md   → 12px  → Default spacing
space.lg   → 16px  → Section padding
space.xl   → 24px  → Section margins
space.2xl  → 32px  → Major sections
space.3xl  → 48px  → Page sections
```

**Common Patterns**:
```tsx
// Card padding
padding: space.lg (16px)

// Stack gap (vertical list)
gap: space.md (12px)

// Section margin
marginBottom: space.xl (24px)

// Form field spacing
marginBottom: space.md (12px)

// Page padding
padding: space.xl (24px)
```

#### 3. Reused Card Patterns

**Never create custom card designs - use existing patterns:**

```tsx
import { 
  SummaryCard, 
  QueueCard, 
  AlertCard, 
  MetricCard 
} from '@/components/cards';

// ✅ DO: Reuse card patterns
function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard
        label="Active Patients"
        value={247}
        trend={{ direction: 'up', value: 12 }}
      />
      
      <QueueCard
        title="OASIS Assessment"
        patient="John Doe"
        status="in-progress"
        priority="high"
      />
      
      <AlertCard
        severity="warning"
        title="Orders Expiring Soon"
        message="3 orders expire in 7 days"
      />
    </div>
  );
}

// ❌ DON'T: Create unique card structure
function Dashboard() {
  return (
    <div className="my-special-card">
      {/* Custom card design */}
    </div>
  );
}
```

**Available Card Types**:
- `MetricCard` - Dashboard metrics
- `SummaryCard` - Entity summaries
- `QueueCard` - Work queue items
- `AlertCard` - Warnings/notifications
- `TimelineCard` - Activity history
- `PatientCard` - Patient summaries
- `AdmissionCard` - Admission summaries
- `OrderCard` - Order details
- `MedicationCard` - Medication info
- `DocumentCard` - Document summaries

#### 4. Reused Status Indicators

**Use consistent status patterns:**

```tsx
import { StatusBadge, PriorityIndicator } from '@/components/common';

// ✅ DO: Use standard status badges
<StatusBadge status="in-progress" />      // Blue badge
<StatusBadge status="completed" />        // Green badge
<StatusBadge status="cancelled" />        // Red badge
<PriorityIndicator priority="high" />     // Red dot

// ❌ DON'T: Create custom status display
<span className="my-custom-status-chip">In Progress</span>
```

**Standard Status Types**:
```tsx
// Document/workflow status
'draft' | 'in-progress' | 'pending-review' | 'approved' | 'rejected' | 'completed'

// Priority levels
'critical' | 'high' | 'medium' | 'low'

// Admission status
'pending' | 'active' | 'on-hold' | 'discharged' | 'cancelled'

// Visit status
'scheduled' | 'in-progress' | 'completed' | 'missed' | 'cancelled'

// Compliance status
'compliant' | 'warning' | 'non-compliant' | 'pending'
```

#### 5. Predictable Action Placement

**Actions should always be in expected locations:**

```tsx
// ✅ Page-level actions: Top right
<ListPageShell
  title="Patients"
  actions={
    <div className="flex gap-2">
      <Button variant="secondary">Import</Button>
      <Button variant="primary">New Patient</Button>
    </div>
  }
>

// ✅ Card actions: Top right or bottom right
<Card>
  <CardHeader>
    <CardTitle>Patient Details</CardTitle>
    <CardActions>
      <Button size="sm" variant="ghost">Edit</Button>
    </CardActions>
  </CardHeader>
</Card>

// ✅ Form actions: Bottom sticky footer
<EditorShell
  footer={
    <StickyFooter>
      <FooterLeft>
        <Button variant="link">Cancel</Button>
      </FooterLeft>
      <FooterRight>
        <Button variant="secondary">Save Draft</Button>
        <Button variant="primary">Submit</Button>
      </FooterRight>
    </StickyFooter>
  }
>

// ❌ DON'T: Put primary actions in unusual places
<div className="actions-on-left-side">...</div>
```

**Action Placement Rules**:
```
Page Actions     → Top right of page header
Card Actions     → Top right or bottom right of card
Form Actions     → Bottom sticky footer
Row Actions      → Right side of row (hover reveal)
Bulk Actions     → Above table when rows selected
Contextual       → Near related content
```

#### 6. Stable Navigation Behavior

**Navigation should be predictable:**

```tsx
// ✅ DO: Keep navigation stable within context
<PatientContextShell patientId={patientId}>
  {/* Patient header stays visible */}
  <PatientContextHeader patient={patient} />
  
  {/* Content changes, header doesn't */}
  <Outlet />
</PatientContextShell>

// ✅ DO: Use breadcrumbs for deep navigation
<Breadcrumbs>
  <Breadcrumb href="/patients">Patients</Breadcrumb>
  <Breadcrumb href={`/patients/${patientId}`}>{patient.name}</Breadcrumb>
  <Breadcrumb>Medications</Breadcrumb>
</Breadcrumbs>

// ❌ DON'T: Hide context during navigation
// Patient header disappears when navigating to medications
```

**Navigation Stability Rules**:
- Context headers remain visible (patient, admission)
- Breadcrumbs show clear path
- Back button works predictably
- Active tab clearly indicated
- URL reflects current state
- Deep linking supported

---

## Screen Generation Checklist

### Before Creating Any Screen

**1. Check Existing Patterns**
- [ ] Can I use `ListPageShell`?
- [ ] Can I use `DetailPageShell`?
- [ ] Can I use `WorkspaceShell`?
- [ ] Can I use `PatientContextShell`?
- [ ] Can I use `AdmissionContextShell`?

**2. Performance Considerations**
- [ ] Am I loading summary data for lists?
- [ ] Am I lazy-loading tabs?
- [ ] Am I using drawers for secondary context?
- [ ] Am I paginating large datasets?
- [ ] Am I memoizing expensive computations?

**3. Consistency Check**
- [ ] Am I using semantic tokens?
- [ ] Am I using existing card patterns?
- [ ] Am I using standard status badges?
- [ ] Are actions in predictable locations?
- [ ] Is the visual hierarchy clear?

**4. Component Reuse**
- [ ] Am I reusing existing components?
- [ ] Am I composing vs building monoliths?
- [ ] Am I following established patterns?

**5. Migration-Friendly**
- [ ] Am I using data gateway pattern?
- [ ] Am I avoiding Supabase coupling?
- [ ] Am I abstracting backend logic?

---

## Screen Generation Examples

### Example 1: List Page

```tsx
import { ListPageShell } from '@/components/shells/ListPageShell';
import { FilterBar } from '@/components/common/FilterBar';
import { usePatientsSummary } from '@/hooks/data/usePatients';
import { PatientCard } from '@/components/healthcare/PatientCard';
import { useDrawer } from '@/hooks/useDrawer';
import { PatientSummaryDrawer } from '@/components/drawers/PatientSummaryDrawer';

function PatientsPage() {
  // Performance: Load summary data only
  const { patients, loading } = usePatientsSummary(filters);
  
  // Consistency: Use drawer for quick preview
  const { isOpen, data, open, close } = useDrawer<Patient>();
  
  return (
    <>
      <ListPageShell
        title="Patients"
        icon={<UsersIcon />}
        actions={<Button variant="primary">New Patient</Button>}
        filters={
          <FilterBar
            filters={[
              { id: 'status', type: 'select', options: statusOptions },
              { id: 'branch', type: 'select', options: branchOptions }
            ]}
            onFiltersChange={setFilters}
          />
        }
      >
        {/* Performance: Paginated list */}
        <PaginatedList
          items={patients}
          loading={loading}
          renderItem={(patient) => (
            <PatientCard
              patient={patient}
              onClick={() => open(patient)}  // Drawer for preview
              onDoubleClick={() => navigate(`/patients/${patient.id}`)}  // Full page
            />
          )}
        />
      </ListPageShell>
      
      {/* Consistency: Reuse drawer pattern */}
      <PatientSummaryDrawer
        isOpen={isOpen}
        patient={data}
        onClose={close}
      />
    </>
  );
}
```

### Example 2: Detail Page with Tabs

```tsx
import { DetailPageShell } from '@/components/shells/DetailPageShell';
import { usePatient } from '@/hooks/data/usePatient';
import { StatusBadge } from '@/components/common/StatusBadge';

function PatientDetailsPage({ patientId }: { patientId: string }) {
  // Performance: Load full data for detail view
  const { patient, loading } = usePatient(patientId);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  if (loading) return <Skeleton />;
  
  return (
    <DetailPageShell
      title={patient.name}
      subtitle={`MRN: ${patient.mrn}`}
      status={<StatusBadge status={patient.status} />}
      actions={
        <div className="flex gap-2">
          <Button variant="secondary">Edit</Button>
          <Button variant="primary">Schedule Visit</Button>
        </div>
      }
      breadcrumbs={[
        { label: 'Patients', href: '/patients' },
        { label: patient.name }
      ]}
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'vitals', label: 'Vitals' },
        { id: 'medications', label: 'Medications' },
        { id: 'documents', label: 'Documents' }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Performance: Lazy load tabs */}
      {activeTab === 'overview' && <PatientOverview patient={patient} />}
      {activeTab === 'vitals' && <VitalsView patientId={patientId} />}
      {activeTab === 'medications' && <MedicationsView patientId={patientId} />}
      {activeTab === 'documents' && <DocumentsView patientId={patientId} />}
    </DetailPageShell>
  );
}
```

### Example 3: Workspace Dashboard

```tsx
import { WorkspaceShell } from '@/components/shells/WorkspaceShell';
import { MetricCard, QueueCard, AlertCard } from '@/components/cards';
import { useQASummary } from '@/hooks/data/useQA';

function QAWorkspace() {
  // Performance: Load summary data for dashboard
  const { metrics, pending, alerts } = useQASummary();
  
  return (
    <WorkspaceShell
      title="QA Center"
      icon={<ClipboardCheckIcon />}
      tabs={[
        { id: 'pending', label: 'Pending Review', count: metrics.pending },
        { id: 'in-review', label: 'In Review', count: metrics.inReview },
        { id: 'completed', label: 'Completed', count: metrics.completed }
      ]}
    >
      {/* Consistency: Use standard card patterns */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Pending Review"
          value={metrics.pending}
          trend={{ direction: 'down', value: 5 }}
        />
        <MetricCard
          label="Avg Review Time"
          value="2.3 hrs"
        />
        <MetricCard
          label="Completion Rate"
          value="94%"
          trend={{ direction: 'up', value: 3 }}
        />
      </div>
      
      {/* Performance: Paginated queue */}
      <PaginatedList
        items={pending}
        renderItem={(doc) => (
          <QueueCard
            title={doc.type}
            patient={doc.patientName}
            status={doc.status}
            priority={doc.priority}
            onClick={() => navigate(`/qa-workspace/review/${doc.id}`)}
          />
        )}
      />
      
      {/* Consistency: Reuse alert card */}
      {alerts.map(alert => (
        <AlertCard
          key={alert.id}
          severity={alert.severity}
          title={alert.title}
          message={alert.message}
        />
      ))}
    </WorkspaceShell>
  );
}
```

---

## Final Rules for All Future Screens

### ALWAYS

✅ Use existing shells (ListPageShell, DetailPageShell, etc.)  
✅ Load summary data for lists  
✅ Load full data for details  
✅ Lazy load tab content  
✅ Use drawers for secondary context  
✅ Paginate large datasets  
✅ Use semantic tokens  
✅ Reuse card patterns  
✅ Use standard status badges  
✅ Place actions predictably  
✅ Maintain navigation stability  
✅ Use data gateway pattern  
✅ Compose from small components  
✅ Memoize expensive operations  
✅ Support keyboard navigation  
✅ Follow WCAG 2.1 AA  

### NEVER

❌ Create monolithic page components  
❌ Load full objects in list views  
❌ Create custom card designs  
❌ Use arbitrary spacing values  
❌ Create custom status displays  
❌ Put actions in unusual locations  
❌ Load all tabs upfront  
❌ Navigate for quick context  
❌ Couple to Supabase directly  
❌ Skip pagination for large data  
❌ Recreate existing patterns  
❌ Use foundation tokens directly  
❌ Forget loading/error states  
❌ Skip accessibility features  
❌ Create visual novelty  

---

## Code Review Criteria

**Approve ✅ when screen:**
- Uses existing shell pattern
- Loads appropriate data payload
- Lazy loads heavy content
- Reuses existing components
- Uses semantic tokens
- Follows spacing guidelines
- Uses standard status badges
- Has predictable action placement
- Supports keyboard navigation
- Is WCAG 2.1 AA compliant

**Request changes ⚠️ when screen:**
- Creates custom layout structure
- Loads unnecessary data
- Loads all content upfront
- Creates custom components for existing patterns
- Uses arbitrary spacing/colors
- Creates unique status displays
- Has unusual action placement
- Missing keyboard support
- Has accessibility issues

---

**Version**: 1.0  
**Last Updated**: March 11, 2026  
**Status**: Master Guide for All Screen Generation
