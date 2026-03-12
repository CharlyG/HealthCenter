# Design System Training Guide

**For**: Engineering Team  
**Duration**: 3 sessions (2 hours each)  
**Date**: April 2026

---

## 📋 Training Overview

### Session 1: Foundations & Components (2 hours)
- Design system architecture
- Semantic tokens usage
- Healthcare components overview
- Hands-on: Build a simple card

### Session 2: Patterns & Pages (2 hours)
- List page pattern
- Server-side pagination
- Data loading best practices
- Hands-on: Refactor a page

### Session 3: Advanced & Best Practices (2 hours)
- Performance optimization
- Accessibility requirements
- ESLint rules and automation
- Q&A and troubleshooting

---

## 🎯 Session 1: Foundations & Components

### Part 1: Architecture Overview (30 min)

#### Design System Layers

```
╔═══════════════════════════════════════╗
║  6. Screen Shells (ListPageShell)     ║
╠═══════════════════════════════════════╣
║  5. Healthcare Patterns (14 comps)    ║
╠═══════════════════════════════════════╣
║  4. Reusable Components               ║
╠═══════════════════════════════════════╣
║  3. Component Tokens                  ║
╠═══════════════════════════════════════╣
║  2. Semantic Tokens ← USE THIS LAYER  ║
╠═══════════════════════════════════════╣
║  1. Foundation Tokens (INTERNAL ONLY) ║
╚═══════════════════════════════════════╝
```

**Key Principle**: Always use Semantic Tokens (Layer 2)

#### Why Semantic Tokens?

❌ **DON'T** (Foundation tokens):
```tsx
import { colors } from '@/design-system/foundations/tokens';
<div style={{ color: colors.neutral[700] }} />
```

✅ **DO** (Semantic tokens):
```tsx
import { textColor } from '@/design-system/semantic/tokens';
<div style={{ color: textColor.primary }} />
```

**Benefits**:
- Easy theming (change once, update everywhere)
- Consistent colors across app
- Self-documenting code
- Future-proof for dark mode

### Part 2: Semantic Tokens Quick Reference (30 min)

#### Text Colors

```tsx
import { textColor } from '@/design-system/semantic/tokens';

textColor.primary    // Main content (headings, body)
textColor.secondary  // Supporting text (labels, metadata)
textColor.muted      // Least emphasis (helper text)
textColor.link       // Interactive links
textColor.inverse    // Text on dark backgrounds
```

#### Surfaces

```tsx
import { surface } from '@/design-system/semantic/tokens';

surface.default      // Page background
surface.elevated     // Cards, panels
surface.subtle       // Grouped sections
surface.hover        // Hover states
```

#### Status Colors

```tsx
import { status } from '@/design-system/semantic/tokens';

status.success.text     // Green text
status.success.bg       // Green background
status.success.border   // Green border

// Same pattern for: danger, warning, info
```

#### Spacing

```tsx
import { space } from '@/design-system/semantic/tokens';

space.xs    // 4px  - Tight spacing
space.sm    // 8px  - Small gaps
space.md    // 16px - Default spacing
space.lg    // 24px - Section spacing
space.xl    // 32px - Large sections
space.xxl   // 48px - Major sections
```

#### Typography

```tsx
import { typography } from '@/design-system/semantic/tokens';

typography.pageTitle.size       // 28px
typography.pageTitle.weight     // 700

typography.cardTitle.size       // 18px
typography.cardTitle.weight     // 600

typography.body.size            // 14px
typography.body.lineHeight      // 1.5

typography.helper.size          // 12px
```

### Part 3: Healthcare Components (45 min)

#### Component Library (14 components)

**Core (2)**:
- `StatusBadge` - Status indicators
- `PriorityIndicator` - Priority levels

**Healthcare (12)**:
- `AdmissionContextBar` - Context display
- `AuthorizationTracker` - Auth tracking
- `FrequencyTracker` - Visit frequency
- `MedicationSummaryCard` - Medications
- `ClinicalAlertCard` - Clinical alerts
- `DocumentationProgressCard` - Doc progress
- `SignatureStatusCard` - Signatures
- `QAQueueItem` - QA queue items
- `EVVComplianceCard` - EVV tracking
- `CredentialStatusCard` - Credentials
- `OrderSummaryCard` - Clinical orders
- `VisitSummaryCard` - Visit info

#### Using Components

```tsx
// 1. Import from design system
import { StatusBadge, PriorityIndicator } from '@/components/design-system';

// 2. Use in your component
function PatientCard({ patient }) {
  return (
    <div>
      <h3>{patient.name}</h3>
      <StatusBadge status={patient.status} size="sm" />
      <PriorityIndicator priority={patient.priority} variant="badge" />
    </div>
  );
}
```

#### Component Variants

Most components support variants:
- `variant="default"` - Full display
- `variant="compact"` - Condensed display

Example:
```tsx
<MedicationSummaryCard 
  medications={meds} 
  variant="compact"  // ← Smaller display
/>
```

### Part 4: Hands-On Exercise (15 min)

**Task**: Build a Patient Alert Card

```tsx
import React from 'react';
import { 
  PriorityIndicator, 
  ClinicalAlertCard 
} from '@/components/design-system';
import { 
  textColor, 
  surface, 
  space, 
  typography 
} from '@/design-system/semantic/tokens';

interface PatientAlertCardProps {
  patientName: string;
  alert: {
    type: 'vital-sign' | 'medication' | 'fall-risk';
    priority: 'critical' | 'high' | 'medium' | 'low';
    message: string;
  };
}

export const PatientAlertCard = ({ patientName, alert }: PatientAlertCardProps) => {
  return (
    <div style={{
      backgroundColor: surface.elevated,
      padding: space.md,
      borderRadius: '0.5rem',
    }}>
      <div style={{ 
        fontSize: typography.cardTitle.size, 
        fontWeight: typography.cardTitle.weight,
        color: textColor.primary,
        marginBottom: space.sm
      }}>
        {patientName}
      </div>
      
      <ClinicalAlertCard alert={alert} variant="compact" />
    </div>
  );
};
```

**Success Criteria**:
- ✅ Uses semantic tokens (not hardcoded values)
- ✅ Imports from design system
- ✅ TypeScript types defined
- ✅ Follows spacing conventions

---

## 🎯 Session 2: Patterns & Pages

### Part 1: List Page Pattern (45 min)

#### The Golden Template

Every list page should use `ListPageShell`:

```tsx
import ListPageShell from '@/components/shells/ListPageShell';

export default function PatientsPage() {
  return (
    <ListPageShell
      // 1. Header
      title="Patients"
      subtitle="Active admissions"
      
      // 2. Primary action
      primaryAction={{
        label: 'New Patient',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => navigate('/new-patient')
      }}
      
      // 3. Summary chips (metrics)
      summaryChips={[
        { label: 'Active', value: 42, variant: 'success' },
        { label: 'Pending', value: 8, variant: 'warning' }
      ]}
      
      // 4. Search
      searchPlaceholder="Search patients..."
      searchValue={search}
      onSearchChange={setSearch}
      
      // 5. Filters
      filterPanel={<PatientFilters />}
      activeFiltersCount={2}
      
      // 6. State
      loading={loading}
      totalCount={data?.total}
      onRefresh={loadData}
    >
      {/* 7. Content */}
      <PatientTable data={data} />
    </ListPageShell>
  );
}
```

**Benefits**:
- ✅ Consistent layout across all list pages
- ✅ Built-in search, filters, refresh
- ✅ Loading states handled
- ✅ Responsive design
- ✅ Accessibility baked in

### Part 2: Server-Side Pagination (30 min)

#### Why Server-Side?

❌ **Client-Side** (old way):
```tsx
// Load ALL 1000 patients
const { data } = await fetch('/api/patients');
// Filter in browser
const filtered = data.filter(p => p.status === 'active');
```

**Problems**:
- Slow initial load (3-5 seconds)
- Large data transfer (45KB+)
- Browser memory issues
- Doesn't scale

✅ **Server-Side** (new way):
```tsx
// Load only 25 patients
const result = await dataGateway.getPatientsPaginated(orgId, {
  page: 1,
  pageSize: 25,
  filters: { status: 'active' }
});
```

**Benefits**:
- Fast load (< 1 second)
- Small data transfer (8KB)
- Scalable to 10,000+ records
- Better UX

#### Implementation Pattern

**Step 1: Add to dataGateway.ts**

```tsx
export interface EntitySummary {
  id: string;
  name: string;
  status: string;
  // Only 5-8 essential fields
}

export async function getEntitiesPaginated(
  orgId: string,
  params: {
    page: number;
    pageSize: number;
    filters?: { search?: string; status?: string };
  }
): Promise<PaginatedResponse<EntitySummary>> {
  // Implementation
}
```

**Step 2: Use in page**

```tsx
const [page, setPage] = useState(1);
const [pageSize] = useState(25);
const [search, setSearch] = useState('');

const { data, loading } = useQuery({
  queryKey: ['entities', page, pageSize, search],
  queryFn: () => dataGateway.getEntitiesPaginated(orgId, {
    page,
    pageSize,
    filters: { search }
  })
});
```

### Part 3: Data Loading Best Practices (30 min)

#### Summary vs Detail

**List Views** → Load summary data only:
```tsx
interface PatientSummary {
  id: string;
  name: string;
  mrn: string;
  status: string;
  lastVisit: string;
  // 5-8 fields max
}
```

**Detail Views** → Load full data:
```tsx
interface PatientDetail extends PatientSummary {
  // ... 50+ additional fields
  medications: Medication[];
  vitals: VitalSign[];
  // etc.
}
```

**Rule of Thumb**:
- List view: < 10 fields per record
- Detail view: Full object

#### Lazy Loading Tabs

Don't load all tabs at once:

```tsx
<Tabs>
  <TabPanel value="overview">
    <Overview />  {/* Always loaded */}
  </TabPanel>
  
  <TabPanel value="medications">
    {activeTab === 'medications' && <Medications />}  {/* Lazy */}
  </TabPanel>
  
  <TabPanel value="vitals">
    {activeTab === 'vitals' && <Vitals />}  {/* Lazy */}
  </TabPanel>
</Tabs>
```

### Part 4: Hands-On Exercise (15 min)

**Task**: Refactor an existing list page

1. Replace custom layout with `ListPageShell`
2. Add server-side pagination
3. Implement search and filters
4. Use semantic tokens

**Example**: See `/src/app/pages/PatientList.tsx`

---

## 🎯 Session 3: Advanced & Best Practices

### Part 1: Performance Optimization (30 min)

#### React.memo

Always memoize healthcare components:

```tsx
export const ComponentName = React.memo(({ data }: Props) => {
  // Component implementation
});

ComponentName.displayName = 'ComponentName';
```

**Why?**:
- Prevents unnecessary re-renders
- Critical for list items
- ~2-3x faster rendering

#### useMemo & useCallback

```tsx
// Memoize expensive computations
const sortedPatients = useMemo(() => {
  return patients.sort((a, b) => a.name.localeCompare(b.name));
}, [patients]);

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  navigate(`/patients/${id}`);
}, [navigate]);
```

#### Code Splitting

```tsx
// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<Spinner />}>
  {showChart && <HeavyChart />}
</Suspense>
```

### Part 2: Accessibility Requirements (30 min)

#### WCAG 2.1 AA Compliance

**Color Contrast**:
- All text must meet 4.5:1 ratio
- Large text (18px+) must meet 3:1 ratio
- Semantic tokens guarantee this ✅

**Keyboard Navigation**:
```tsx
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  aria-label="Delete patient record"
>
  <TrashIcon />
</button>
```

**Screen Readers**:
```tsx
// Status must not rely on color alone
<div>
  <AlertIcon aria-hidden="true" />  {/* Visual */}
  <span className="sr-only">Critical Alert</span>  {/* Screen reader */}
  <span>Patient vitals abnormal</span>
</div>
```

**Focus States**:
All interactive elements need visible focus states (handled by semantic tokens):

```tsx
<button style={{
  ':focus': {
    outline: `2px solid ${status.info.border}`,
    outlineOffset: '2px'
  }
}}>
  Click me
</button>
```

### Part 3: ESLint Rules & Automation (30 min)

#### Pre-commit Hooks

Automatically check compliance before commit:

```bash
# .husky/pre-commit
- Checks for hardcoded colors
- Checks for direct foundation imports
- Runs ESLint with design system rules
```

**To bypass** (emergencies only):
```bash
git commit --no-verify
```

#### ESLint Rules

1. **No hardcoded colors**
```tsx
// ❌ Error
<div style={{ color: '#333' }} />

// ✅ Correct
<div style={{ color: textColor.primary }} />
```

2. **No foundation imports**
```tsx
// ❌ Error
import { colors } from '@/design-system/foundations/tokens';

// ✅ Correct
import { textColor } from '@/design-system/semantic/tokens';
```

3. **Use shells for pages**
```tsx
// ⚠️  Warning: Consider using ListPageShell
<div className="max-w-7xl mx-auto">...</div>

// ✅ Preferred
<ListPageShell>...</ListPageShell>
```

#### Compliance Checker

Run manually:
```bash
./scripts/check-design-compliance.sh
```

Output:
```
✅ No hardcoded hex colors
✅ No hardcoded RGB colors
✅ No direct foundation imports
✅ Semantic tokens imported (14 files)
✅ Healthcare components use React.memo (14/14)

Compliance: 95% ✅ EXCELLENT!
```

### Part 4: Q&A and Troubleshooting (30 min)

#### Common Issues

**Q: "Where do I find the right semantic token?"**

A: Check `/src/app/design-system/QUICK_REFERENCE.md`

**Q: "My component isn't re-rendering?"**

A: Check:
1. Is it wrapped in React.memo?
2. Are props properly compared?
3. Use React DevTools Profiler

**Q: "Page is slow with large data?"**

A: Checklist:
1. ✅ Using server-side pagination?
2. ✅ Loading summary data (not full objects)?
3. ✅ Components memoized?
4. ✅ useMemo for expensive computations?

**Q: "How do I add a new healthcare component?"**

A: Follow template:
1. Create in `/src/app/components/design-system/healthcare/`
2. Use semantic tokens only
3. Export interface for data
4. Memoize component
5. Set displayName
6. Add to index.ts
7. Document with JSDoc

---

## 📚 Resources

### Quick Links

- **Quick Reference**: `/src/app/design-system/QUICK_REFERENCE.md`
- **Screen Generation Guide**: `/src/app/design-system/SCREEN_GENERATION.md`
- **Healthcare Components**: `/src/app/design-system/HEALTHCARE_COMPONENTS.md`
- **Examples**: `/src/app/pages/PatientList.tsx`, `/src/app/pages/Admissions.tsx`

### Component Examples

**Good Examples** (Follow these):
- `/src/app/pages/PatientList.tsx` - Perfect list page
- `/src/app/pages/Admissions.tsx` - List with summary chips
- `/src/app/components/design-system/healthcare/*.tsx` - All healthcare components

**Templates**:
- List Page: Use PatientList.tsx as template
- Healthcare Component: Use any healthcare/*.tsx as template

### Getting Help

1. **Documentation** - Check guides first
2. **Examples** - Look at existing implementations
3. **Team** - Ask in #design-system Slack
4. **Office Hours** - Weekly drop-in sessions

---

## ✅ Post-Training Checklist

After completing training, you should be able to:

- [ ] Explain the design system architecture
- [ ] Use semantic tokens instead of hardcoded values
- [ ] Import and use healthcare components
- [ ] Create a list page with ListPageShell
- [ ] Implement server-side pagination
- [ ] Follow data loading best practices
- [ ] Write accessible components
- [ ] Pass ESLint design system rules
- [ ] Run compliance checker
- [ ] Know where to find help

---

## 🎓 Certification

To become "Design System Certified":

1. Complete all 3 training sessions
2. Pass hands-on exercises
3. Refactor one existing page
4. Create one new healthcare component
5. Pass code review

**Benefits**:
- Authority to review design system PRs
- Contribute to component library
- Help train new team members

---

**Prepared By**: Design System Team  
**Version**: 1.0  
**Date**: April 2026
