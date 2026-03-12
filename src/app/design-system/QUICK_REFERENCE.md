# Design System Quick Reference

**One-page cheat sheet for building healthcare platform screens.**

---

## 🎯 Golden Rules

### Before Writing Any Code

1. **Check** → Does an existing shell/pattern exist?
2. **Compose** → Build from small components, not monoliths
3. **Optimize** → Load summary data, lazy load details
4. **Reuse** → Use design system components
5. **Consistency** → Follow established patterns

---

## 📋 Screen Generation Checklist

```
□ Using existing shell? (ListPageShell, DetailPageShell, etc.)
□ Loading summary data for lists?
□ Lazy loading tabs/sections?
□ Using drawers for secondary context?
□ Paginating large datasets?
□ Using semantic tokens?
□ Reusing card patterns?
□ Using standard status badges?
□ Actions in expected locations?
□ Using data gateway (not direct Supabase)?
```

---

## 🏗️ Available Shells (Use These First!)

```tsx
import { 
  ListPageShell,          // Entity lists, queues
  DetailPageShell,        // Entity details with tabs
  EditorShell,            // Forms, editing
  WorkflowShell,          // Multi-step processes
  WorkspaceShell,         // Workspace dashboards
  PatientContextShell,    // Patient-scoped pages
  AdmissionContextShell,  // Admission-scoped pages
  SettingsShell           // Settings pages
} from '@/components/shells';
```

---

## 🎨 Semantic Tokens (Always Use These)

```tsx
import { 
  textColor,    // .primary, .secondary, .muted, .inverse
  surface,      // .default, .elevated, .subtle
  borderColor,  // .default, .muted, .strong
  space,        // .xs, .sm, .md, .lg, .xl, .2xl, .3xl
  typography,   // .h1, .h2, .h3, .body, .helper
  status        // .success, .danger, .warning, .info
} from '@/design-system/semantic/tokens';
```

---

## 🧩 Card Components (Reuse These)

```tsx
import {
  MetricCard,        // Dashboard metrics
  SummaryCard,       // Entity summaries
  QueueCard,         // Work queue items
  AlertCard,         // Warnings/notifications
  TimelineCard,      // Activity history
  PatientCard,       // Patient summaries
  AdmissionCard,     // Admission summaries
  MedicationCard,    // Medication info
  DocumentCard       // Document summaries
} from '@/components/cards';
```

---

## 🏥 Healthcare Components (Domain-Specific)

```tsx
import {
  PatientContextHeader,      // Patient info bar
  AdmissionContextBar,       // Admission info bar
  AuthorizationTracker,      // Auth status & units
  FrequencyTracker,          // Visit compliance
  MedicationSummaryCard,     // Active meds
  ClinicalAlertCard,         // Clinical alerts
  DocumentationProgressCard, // Doc completion
  SignatureStatusCard,       // Signature tracking
  QAQueueItem,              // QA review items
  EVVStatusCard,            // EVV compliance
  ComplianceChecklistCard,  // Compliance tracking
  CredentialStatusBadge     // Credential status
} from '@/components/healthcare';
```

---

## 📊 Data Loading Patterns

### List View (Summary Data)
```tsx
// ✅ DO
const { patients } = usePatientsSummary();
// Returns: { id, name, mrn, status }

// ❌ DON'T
const { patients } = usePatients();
// Returns: Full patient objects (slow!)
```

### Detail View (Full Data)
```tsx
// ✅ DO
const { patient } = usePatient(id);
// Returns: Complete patient object
```

### Lazy Tabs
```tsx
// ✅ DO
{activeTab === 'vitals' && <VitalsView />}

// ❌ DON'T
<VitalsView /> // Loads even when hidden
```

### Drawers vs Navigation
```tsx
// ✅ Drawer for quick preview
<Table onRowClick={openDrawer} />

// ✅ Navigation for full interaction
<Table onRowDoubleClick={navigateToDetail} />
```

---

## 🎨 Visual Consistency Rules

### Typography Hierarchy
```
h1 (24px, 600) → Page titles
h2 (20px, 600) → Section titles
h3 (16px, 600) → Card titles
body (14px, 400) → Content
helper (12px, 400) → Metadata
```

### Spacing Scale
```
space.xs   →  4px  → Icon-to-text
space.sm   →  8px  → Related elements
space.md   → 12px  → Default spacing
space.lg   → 16px  → Card padding
space.xl   → 24px  → Section margins
space.2xl  → 32px  → Major sections
space.3xl  → 48px  → Page sections
```

### Status Badges
```tsx
<StatusBadge status="in-progress" />
<StatusBadge status="completed" />
<StatusBadge status="cancelled" />
<PriorityIndicator priority="high" />
```

### Action Placement
```
Page Actions    → Top right header
Card Actions    → Top/bottom right card
Form Actions    → Bottom sticky footer
Row Actions     → Right side (hover)
Bulk Actions    → Above table
```

---

## ⚡ Performance Rules

### Pagination (Tables > 25 rows)
```tsx
<PaginatedTable
  items={patients}
  pageSize={25}
  onPageChange={setPage}
/>
```

### Virtualization (Logs/Long Lists)
```tsx
<VirtualList
  items={logs}
  itemHeight={60}
  renderItem={(log) => <LogRow log={log} />}
/>
```

### Memoization
```tsx
const columns = useMemo(() => [...], []);
const handleClick = useCallback(() => {}, []);
const MemoRow = React.memo(Row);
```

---

## 🔄 Migration-Friendly Patterns

### Data Access (Use Gateway)
```tsx
// ✅ DO
import { patientGateway } from '@/lib/dataGateway';
const patients = await patientGateway.getPatients(filters);

// ❌ DON'T
import { supabase } from '@/lib/supabase';
const { data } = await supabase.from('patients').select();
```

### Custom Hooks
```tsx
// ✅ DO
const { patients, loading } = usePatients(filters);

// ❌ DON'T
const [patients, setPatients] = useState([]);
useEffect(() => {
  supabase.from('patients').select()...
}, []);
```

---

## 🎯 Common Patterns

### List Page
```tsx
<ListPageShell
  title="Patients"
  icon={<UsersIcon />}
  actions={<Button>New Patient</Button>}
  filters={<FilterBar filters={filters} />}
>
  <PaginatedList items={patients} />
</ListPageShell>
```

### Detail Page with Tabs
```tsx
<DetailPageShell
  title={patient.name}
  subtitle={`MRN: ${patient.mrn}`}
  status={<StatusBadge status={patient.status} />}
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
>
  {activeTab === 'overview' && <Overview />}
  {activeTab === 'vitals' && <Vitals />}
</DetailPageShell>
```

### Form with Sticky Footer
```tsx
<EditorShell
  title="Edit Patient"
  footer={
    <StickyFooter>
      <FooterLeft>
        <Button variant="link">Cancel</Button>
      </FooterLeft>
      <FooterRight>
        <SaveStatus status="saved" />
        <Button variant="secondary">Save Draft</Button>
        <Button variant="primary">Submit</Button>
      </FooterRight>
    </StickyFooter>
  }
>
  <PatientForm />
</EditorShell>
```

### Workspace Dashboard
```tsx
<WorkspaceShell
  title="QA Center"
  tabs={[
    { id: 'pending', label: 'Pending', count: 12 },
    { id: 'in-review', label: 'In Review', count: 5 }
  ]}
>
  <div className="grid grid-cols-3 gap-4">
    <MetricCard label="Pending" value={12} />
    <MetricCard label="Avg Time" value="2.3 hrs" />
  </div>
  
  <PaginatedList items={queue} />
</WorkspaceShell>
```

---

## ✅ ALWAYS Do

- Use existing shells
- Load summary data for lists
- Lazy load tabs
- Use drawers for quick context
- Paginate large datasets
- Use semantic tokens
- Reuse card patterns
- Use standard status badges
- Use data gateway
- Memoize expensive operations
- Support keyboard navigation
- Follow WCAG 2.1 AA

---

## ❌ NEVER Do

- Create custom layout structures
- Load full objects in lists
- Load all tabs upfront
- Navigate for quick context
- Render 100+ rows without pagination
- Use foundation tokens directly
- Create custom card designs
- Create custom status displays
- Import Supabase in components
- Skip loading/error states
- Recreate existing patterns
- Forget accessibility

---

## 📚 Full Documentation

- **[SCREEN_GENERATION.md](./SCREEN_GENERATION.md)** - Complete generation guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
- **[LARGE_DATA.md](./LARGE_DATA.md)** - Pagination & virtualization
- **[ROUTING.md](./ROUTING.md)** - Route patterns
- **[REUSABILITY.md](./REUSABILITY.md)** - Pattern reuse
- **[MIGRATION.md](./MIGRATION.md)** - Backend migration
- **[HEALTHCARE_COMPONENTS.md](./HEALTHCARE_COMPONENTS.md)** - Domain components
- **[FOCUS_MODE.md](./FOCUS_MODE.md)** - High-concentration workflows

---

## 🚀 Start Coding

1. **Read** → SCREEN_GENERATION.md (10 min)
2. **Check** → Existing shells/patterns
3. **Compose** → Build from components
4. **Test** → Performance & accessibility
5. **Review** → Checklist above

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
