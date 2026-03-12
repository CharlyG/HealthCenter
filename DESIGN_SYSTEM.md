# Healthcare Design System Documentation

## Overview

A production-grade design system for enterprise healthcare operations platforms, optimized for home health and hospice workflows. This system prioritizes high information density, accessibility, and fast daily use by clinical, scheduling, QA, billing, and administrative roles.

## Design Philosophy

### Core Principles

1. **Calm, Professional Aesthetic** - Restrained color palette, excellent readability, modern yet serious
2. **High Information Density** - Maximize useful information without clutter
3. **Semantic Clarity** - Never rely on color alone; always combine with icons, text, and patterns
4. **Consistent Patterns** - Reusable components prevent one-off inconsistent UI
5. **Fast Workflows** - Optimized for daily repeated tasks, not discovery

### Visual Direction

- **NOT**: Consumer app playfulness, bright gradients, excessive whitespace
- **YES**: Enterprise clarity, subtle shadows, strong hierarchy, purposeful spacing

## Foundations

### Color System

#### Semantic Colors

```css
/* Primary - Healthcare Blue */
--primary-600: #2563eb;

/* Success - Clinical Green */
--success-600: #16a34a;

/* Warning - Attention Amber */
--warning-600: #d97706;

/* Danger - Critical Red */
--danger-600: #dc2626;

/* Info - Informational Cyan */
--info-600: #0891b2;
```

#### Neutrals (10-step scale)

From `--neutral-50` (lightest) to `--neutral-900` (darkest)

**Usage Rules:**
- Text: 900 (primary), 600 (secondary), 500 (tertiary)
- Borders: 200 (default), 300 (strong)
- Backgrounds: 50 (subtle), 100 (medium), white (cards)

### Typography Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-3xl` | 30px | 600 | Page Titles |
| `--text-2xl` | 24px | 600 | Section Headers |
| `--text-xl` | 20px | 600 | Card Headers |
| `--text-lg` | 18px | 500 | Large Body |
| `--text-base` | 16px | 400 | Body Text |
| `--text-sm` | 14px | 400 | Secondary Text, Tables |
| `--text-xs` | 12px | 400 | Helper Text, Labels |

**Font Stack:** System fonts for optimal performance
```css
--font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-family-mono: ui-monospace, SFMono-Regular, Monaco, Consolas, monospace;
```

### Spacing Scale (4/8-based)

```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
```

Use Tailwind utilities: `gap-4`, `p-6`, `mb-8`, etc.

### Radius & Shadows

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
```

Elevation system uses subtle shadows for depth without distraction.

## Core Components

### Layout Components

#### `PageLayout`
Standard page wrapper with max-width and padding.
```tsx
<PageLayout maxWidth="2xl">
  <PageHeader title="Patients" icon={<Users />} />
  <PageSection>...</PageSection>
</PageLayout>
```

#### `WorkspaceLayout`
For workflow pages with filters, sidebar, and content areas.
```tsx
<WorkspaceLayout
  header={<WorkspaceHeader title="Visit Queue" />}
  filters={<WorkspaceFilters>...</WorkspaceFilters>}
>
  <WorkspaceSection title="Today's Visits">...</WorkspaceSection>
</WorkspaceLayout>
```

#### `SplitViewLayout`
Two-column layout with primary content and inspector drawer.
```tsx
<SplitViewLayout
  inspectorTitle="Patient Details"
  inspector={<PatientInspector />}
>
  Main content here
</SplitViewLayout>
```

### Data Display

#### `DataTable`
High-performance table with memoized rows and sorting.
```tsx
<DataTable
  data={patients}
  columns={columns}
  keyExtractor={(row) => row.id}
  onRowClick={handleClick}
  sortColumn="name"
  sortDirection="asc"
/>
```

**Best Practices:**
- Define columns with `useMemo`
- Use `React.memo` for row components
- Implement server-side pagination for 1000+ records

#### `StatusBadge`
Standardized status indicators with icons.
```tsx
<StatusBadge status="active" size="sm" />
<StatusBadge status="pending" />
<StatusBadge status="discharged" />
```

### Cards

#### `QueueCard`
For work queue items (tasks, alerts, exceptions).
```tsx
<QueueCard
  title="Authorization Renewal Required"
  priority="high"
  status="in_progress"
  dueDate={new Date()}
  assignee="Sarah Johnson"
  labels={[{ text: 'Medicare', variant: 'default' }]}
  onClick={handleClick}
/>
```

#### `MetricCard`
Display KPIs and statistical data.
```tsx
<MetricCard
  title="Active Patients"
  value="342"
  trend="up"
  trendValue="+12%"
  icon={<Users />}
/>
```

### Forms

#### `FormSection`
Reusable form section with autosave UI.
```tsx
<FormSection
  title="Demographics"
  isDirty={isDirty}
  isSaving={isSaving}
  lastSaved={lastSaved}
  onSave={handleSave}
>
  <FormFieldGroup title="Basic Information" columns={2}>
    <Input label="First Name" />
    <Input label="Last Name" />
  </FormFieldGroup>
</FormSection>
```

## Healthcare-Specific Components

### Patient Context

#### `PatientContextHeader`
Sticky header showing patient summary and quick actions.
```tsx
<PatientContextHeader
  patient={patientData}
  onQuickAction={(action) => handleAction(action)}
/>
```

### Clinical Workflows

#### `AdmissionSummaryPanel`
Displays admission status, dates, and metrics.

#### `PayerSummaryPanel`
Insurance/payer information with authorization tracking.

#### `AuthorizationWarning`
Alert for missing or expiring authorizations.

#### `EVVStatusCard`
Electronic Visit Verification status tracking.

### Work Queues

#### `HOPEOASISTracker`
Tracks upcoming and overdue assessment deadlines.

#### `MDSignatureQueueItem`
Documents requiring Medical Director signature.

#### `OpenShiftQueueItem`
Unassigned shifts requiring coverage.

#### `DelayedVisitAlert`
Overdue or missed visits requiring attention.

#### `QAStatusBadge`
Quality assurance status for charts.

## Usage Guidelines

### Status Semantics

**Never rely on color alone.** Always combine:
- Color
- Icon
- Text label

✅ Good:
```tsx
<StatusBadge status="active" showIcon={true} />
// Shows: [✓ Icon] Active [Green background]
```

❌ Bad:
```tsx
<div className="bg-green-500">Status</div>
// No semantic meaning, not accessible
```

### Priority Levels

Use consistent priority mapping:

| Priority | Color | Use Case |
|----------|-------|----------|
| `critical` | Red | Overdue tasks, blockers, safety issues |
| `high` | Orange | Due today, urgent but not blocking |
| `medium` | Yellow | Due soon (2-3 days) |
| `low` | Gray | Future tasks, low urgency |

### Information Hierarchy

1. **Critical Info** - Large, bold, high contrast
2. **Supporting Info** - Medium size, medium weight
3. **Metadata** - Small, light color, compact

Example:
```tsx
<div>
  <h2 className="text-2xl font-semibold">Patient Name</h2>
  <div className="text-sm text-gray-600">DOB: 01/15/1965 · MRN: 12345</div>
</div>
```

### Spacing Consistency

Follow the 4/8-based scale:
- Small gaps: `gap-2` (8px)
- Medium gaps: `gap-4` (16px)
- Section gaps: `gap-6` (24px)
- Large breaks: `gap-8` (32px)

### Accessibility

#### Focus States
All interactive elements must have visible focus rings:
```tsx
className="focus:outline-none focus:ring-2 focus:ring-blue-600"
```

#### Color Contrast
Maintain WCAG AA standards:
- Text on white: `text-gray-900` (21:1)
- Secondary text: `text-gray-600` (7:1)
- Disabled text: `text-gray-400` (3:1 minimum)

#### Keyboard Navigation
All workflows must be keyboard-accessible:
- Tab order follows visual order
- Enter/Space activate buttons
- Escape closes modals/drawers

## Performance Best Practices

### Memoization
```tsx
// Expensive list items
export const PatientRow = React.memo(({ patient }) => {
  return <tr>...</tr>;
});

// Computed values
const sortedPatients = useMemo(() => {
  return patients.sort(...);
}, [patients, sortOrder]);
```

### Lazy Loading
```tsx
// Code splitting for modules
const PatientModule = lazy(() => import('./PatientModule'));

// Use Suspense boundary
<Suspense fallback={<Loading />}>
  <PatientModule />
</Suspense>
```

### Virtualization
For lists with 100+ items, use react-window:
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={patients.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{patients[index].name}</div>
  )}
</FixedSizeList>
```

## Testing the Design System

Navigate to `/design-system` to view the interactive showcase with all components, patterns, and usage examples.

## Migration from Old Components

### Before (one-off styling)
```tsx
<div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
  Active
</div>
```

### After (design system)
```tsx
<StatusBadge status="active" />
```

Benefits:
- Consistent appearance
- Semantic meaning
- Accessible by default
- Easy to update globally

## Component Import Paths

```tsx
// Centralized imports from design system
import {
  PageLayout,
  DataTable,
  StatusBadge,
  QueueCard,
  MetricCard,
  PatientContextHeader,
  // ... etc
} from '@/components/design-system';

// Type imports
import type { Column, QueuePriority } from '@/components/design-system';
```

## Future Enhancements

- [ ] Dark mode support
- [ ] Customizable theme tokens
- [ ] Animation library integration
- [ ] Advanced chart components
- [ ] Drag-and-drop utilities
- [ ] Command palette (Cmd+K)
- [ ] Toast notification patterns
- [ ] Multi-step wizard component
