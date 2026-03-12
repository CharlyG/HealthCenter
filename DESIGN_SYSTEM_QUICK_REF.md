# Healthcare Design System - Quick Reference

## 🎨 Color Tokens

### Semantic Colors
```css
Primary:  #2563eb  (Healthcare Blue)
Success:  #16a34a  (Clinical Green)
Warning:  #d97706  (Attention Amber)
Danger:   #dc2626  (Critical Red)
Info:     #0891b2  (Informational Cyan)
```

### Neutrals
```
50  #fafafa  (Lightest)
100 #f5f5f5
200 #e5e5e5  (Default border)
300 #d4d4d4
400 #a3a3a3
500 #737373
600 #525252  (Secondary text)
700 #404040
800 #262626
900 #171717  (Primary text)
```

## 📏 Typography

```tsx
<h1>          // 30px, semibold - Page titles
<h2>          // 24px, semibold - Section headers
<h3>          // 20px, semibold - Card headers
<h4>          // 18px, medium  - Large body
text-base     // 16px, normal  - Body text
text-sm       // 14px, normal  - Secondary, tables
text-xs       // 12px, normal  - Helper, labels
```

## 📦 Spacing (4/8-based)

```tsx
gap-1   // 4px
gap-2   // 8px
gap-3   // 12px
gap-4   // 16px
gap-6   // 24px
gap-8   // 32px
gap-10  // 40px
gap-12  // 48px
```

## 🧩 Component Quick Start

### Layout
```tsx
// Standard page
<PageLayout maxWidth="2xl">
  <PageHeader title="Title" icon={<Icon />} actions={<Button />} />
  <PageSection>Content</PageSection>
</PageLayout>

// Workspace
<WorkspaceLayout
  header={<WorkspaceHeader title="Queue" />}
  filters={<Filters />}
>
  Content
</WorkspaceLayout>

// Split view
<SplitViewLayout inspector={<Inspector />}>
  Main content
</SplitViewLayout>
```

### Data Table
```tsx
const columns = useMemo(() => [
  { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
], []);

<DataTable
  data={data}
  columns={columns}
  keyExtractor={(row) => row.id}
  onRowClick={handleClick}
/>
```

### Status & Badges
```tsx
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="discharged" />
<QAStatusBadge status="passed" score={95} showScore />
```

### Cards
```tsx
// Metrics
<MetricCard
  title="Active Patients"
  value="342"
  trend="up"
  trendValue="+12%"
  icon={<Users />}
/>

// Queue items
<QueueCard
  title="Task title"
  priority="high"
  status="in_progress"
  dueDate={date}
  assignee="Name"
  onClick={handler}
/>
```

### Forms
```tsx
<FormSection
  title="Section"
  isDirty={dirty}
  isSaving={saving}
  onSave={save}
>
  <FormFieldGroup title="Group" columns={2}>
    <Input label="Field" />
  </FormFieldGroup>
</FormSection>
```

## 🏥 Healthcare Components

```tsx
// Patient context (sticky header)
<PatientContextHeader patient={data} />

// Admission summary
<AdmissionSummaryPanel admission={data} />

// Payer/insurance
<PayerSummaryPanel payer={data} />

// Authorization alerts
<AuthorizationWarning
  type="expiring"
  patientName="Doe, John"
  expirationDate="Mar 31"
/>

// EVV tracking
<EVVStatusCard data={evvData} />

// Assessment tracker
<HOPEOASISTracker
  patient_name="Doe, John"
  assessment_type="OASIS-E"
  reason="Recert"
  due_date={date}
/>

// MD signature queue
<MDSignatureQueueItem
  patient_name="Doe, John"
  document_type="Plan of Care"
  submitted_date={date}
/>

// Open shifts
<OpenShiftQueueItem
  patient_name="Doe, John"
  shift_type="Visit"
  service_line="Skilled Nursing"
  shift_date={date}
/>

// Delayed visits
<DelayedVisitAlert
  patient_name="Doe, John"
  scheduled_date={date}
  service_type="PT"
  delay_reason="Patient Unavailable"
/>
```

## 🎯 Priority Mapping

```tsx
critical  // Red    - Overdue, blockers, safety
high      // Orange - Due today, urgent
medium    // Yellow - Due soon (2-3 days)
low       // Gray   - Future, low urgency
```

## 📐 Status Mapping

```tsx
active       // Green  - Currently active
pending      // Yellow - Awaiting action
inactive     // Gray   - Not active
discharged   // Gray   - Completed/discharged
success      // Green  - Successful completion
warning      // Orange - Needs attention
error/danger // Red    - Failed or critical
```

## ✅ Best Practices

### Do ✓
- Use design system components
- Combine color + icon + text
- Follow 4/8 spacing scale
- Memoize expensive lists
- Test keyboard navigation

### Don't ✗
- Create one-off styled divs
- Rely on color alone
- Use arbitrary spacing
- Re-render entire tables
- Forget focus states

## 🚀 Import Pattern

```tsx
// Single import for design system
import {
  PageLayout,
  DataTable,
  StatusBadge,
  QueueCard,
  MetricCard,
  PatientContextHeader,
  AdmissionSummaryPanel,
  PayerSummaryPanel,
} from '@/components/design-system';

// Types
import type {
  Column,
  QueuePriority,
  StatusType,
} from '@/components/design-system';
```

## 📱 Responsive Breakpoints

```tsx
sm:   // 640px
md:   // 768px
lg:   // 1024px
xl:   // 1280px
2xl:  // 1536px
```

## 🎨 Interactive Showcase

View all components in action:
```
Navigate to: /design-system
```

## 📚 Full Documentation

See `/DESIGN_SYSTEM.md` for complete documentation with:
- Design philosophy
- Detailed component APIs
- Accessibility guidelines
- Performance best practices
- Migration guides
