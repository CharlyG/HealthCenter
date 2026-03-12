# Reusability Enforcement Rules

Guidelines to ensure consistency and prevent pattern proliferation across the healthcare platform.

## Overview

When creating new pages, first reuse existing patterns. The application should feel like one coherent system, not a collection of unique pages.

## Reuse Hierarchy

### 1. Existing Shell (FIRST)

Before creating any custom layout, check for existing shells:

```tsx
// ✅ DO: Reuse existing shell
import { ListPageShell } from '@/components/shells/ListPageShell';

function CaregiverList() {
  return (
    <ListPageShell
      title="Caregivers"
      icon={<UsersIcon />}
      actions={<CreateCaregiverButton />}
      filters={<CaregiverFilters />}
    >
      <CaregiverTable />
    </ListPageShell>
  );
}

// ❌ DON'T: Create unique layout
function CaregiverList() {
  return (
    <div className="custom-layout">
      <div className="custom-header">
        <h1>Caregivers</h1>
        {/* Custom structure */}
      </div>
      <div className="custom-content">
        {/* Reinventing the wheel */}
      </div>
    </div>
  );
}
```

**Available Shells**:
- `ListPageShell` - Entity lists
- `DetailPageShell` - Entity details
- `EditorShell` - Forms and editors
- `WorkflowShell` - Multi-step workflows
- `WorkspaceShell` - Workspace dashboards
- `SettingsShell` - Settings pages
- `PatientContextShell` - Patient-scoped pages
- `AdmissionContextShell` - Admission-scoped pages

### 2. Existing Card Type (SECOND)

Use established card patterns:

```tsx
// ✅ DO: Reuse card patterns
import { SummaryCard, QueueCard, AlertCard, MetricCard } from '@/components/cards';

function Dashboard() {
  return (
    <>
      <SummaryCard
        title="Active Patients"
        value={247}
        trend={[220, 235, 242, 247]}
      />
      
      <QueueCard
        title="OASIS Assessment - John Doe"
        status="In Progress"
        priority="high"
      />
      
      <AlertCard
        severity="warning"
        title="Orders Expiring Soon"
        message="3 orders expire in 7 days"
      />
    </>
  );
}

// ❌ DON'T: Create unique card design
function Dashboard() {
  return (
    <div className="my-special-card">
      {/* Reinventing card structure */}
    </div>
  );
}
```

**Available Cards**:
- `SummaryCard` - Dashboard metrics
- `QueueCard` - Work queue items
- `AlertCard` - Warnings/notifications
- `MetricCard` - Analytics
- `ProfileCard` - User/caregiver profiles
- `TimelineCard` - Activity history
- `PatientCard` - Patient summaries
- `AdmissionCard` - Admission summaries
- `OrderCard` - Order details
- `MedicationCard` - Medication info

### 3. Existing Filter Bar (THIRD)

Reuse filter patterns:

```tsx
// ✅ DO: Reuse FilterBar
import { FilterBar } from '@/components/common/FilterBar';

function PatientList() {
  return (
    <ListPageShell
      filters={
        <FilterBar
          filters={[
            {
              id: 'status',
              label: 'Status',
              type: 'select',
              options: statusOptions
            },
            {
              id: 'branch',
              label: 'Branch',
              type: 'select',
              options: branchOptions
            },
            {
              id: 'dateRange',
              label: 'Date Range',
              type: 'dateRange'
            }
          ]}
          onFiltersChange={handleFiltersChange}
        />
      }
    >
      <PatientTable />
    </ListPageShell>
  );
}
```

**Filter Components**:
- `FilterBar` - Multi-filter container
- `StatusFilter` - Status dropdown
- `DateRangeFilter` - Date range picker
- `SearchFilter` - Search input
- `BranchFilter` - Branch selector
- `DisciplineFilter` - Discipline selector

### 4. Existing Drawer Pattern (FOURTH)

Reuse drawer implementations:

```tsx
// ✅ DO: Reuse drawer patterns
import { useDrawer } from '@/hooks/useDrawer';
import { PatientSummaryDrawer } from '@/components/drawers/PatientSummaryDrawer';

function PatientList() {
  const { isOpen, data, open, close } = useDrawer<Patient>();
  
  return (
    <>
      <PatientTable onRowClick={open} />
      
      <PatientSummaryDrawer
        isOpen={isOpen}
        patient={data}
        onClose={close}
      />
    </>
  );
}
```

**Available Drawers**:
- `PatientSummaryDrawer`
- `AdmissionSummaryDrawer`
- `DocumentPreviewDrawer`
- `MedicationDetailsDrawer`
- `OrderDetailsDrawer`
- `CaregiverProfileDrawer`
- `IntegrationLogsDrawer`

### 5. Existing Status Pattern (FIFTH)

Use established status systems:

```tsx
// ✅ DO: Reuse status badges
import { StatusBadge, PriorityIndicator } from '@/components/common';

<StatusBadge status="in-progress" />
<PriorityIndicator priority="high" />

// ❌ DON'T: Create custom status display
<div className="my-custom-status">
  {/* Custom status rendering */}
</div>
```

**Status Systems**:
- `StatusBadge` - Document/workflow status
- `PriorityIndicator` - Priority levels
- `ComplianceStatus` - Compliance indicators
- `AuthorizationStatus` - Auth status
- `DocumentStatus` - Document lifecycle
- `VisitStatus` - Visit states

### 6. Existing Form Section Pattern (SIXTH)

Reuse form structures:

```tsx
// ✅ DO: Reuse FormSection
import { FormSection } from '@/components/forms/FormSection';

function PatientEditForm() {
  return (
    <form>
      <FormSection
        title="Demographics"
        description="Patient demographic information"
        icon={<UserIcon />}
      >
        <TextInput label="First Name" name="firstName" required />
        <TextInput label="Last Name" name="lastName" required />
        <DatePicker label="Date of Birth" name="dob" required />
      </FormSection>
      
      <FormSection
        title="Contact Information"
        description="Primary contact details"
        icon={<PhoneIcon />}
      >
        <TextInput label="Phone" name="phone" type="tel" />
        <TextInput label="Email" name="email" type="email" />
      </FormSection>
    </form>
  );
}
```

**Form Patterns**:
- `FormSection` - Grouped form fields
- `FormRow` - Horizontal field layout
- `FormGrid` - Grid layout
- `FormActions` - Action buttons
- `ValidationSummary` - Error display

## Pattern Inventory

### Page Shells (27 total)

**List Shells**:
- `ListPageShell` - Generic list
- `QueuePageShell` - Work queue
- `SearchPageShell` - Search results

**Detail Shells**:
- `DetailPageShell` - Entity detail
- `PatientChartShell` - Patient chart
- `AdmissionDashboardShell` - Admission dashboard

**Editor Shells**:
- `EditorShell` - Generic editor
- `AssessmentShell` - Assessment forms
- `DocumentEditorShell` - Document editing

**Workflow Shells**:
- `WorkflowShell` - Multi-step
- `WizardShell` - Guided setup

**Context Shells**:
- `PatientContextShell` - Patient scope
- `AdmissionContextShell` - Admission scope
- `WorkspaceShell` - Workspace scope

**Settings Shells**:
- `SettingsShell` - Settings layout
- `ConfigurationShell` - Config pages

### Card Components (10 total)

- `SummaryCard`
- `QueueCard`
- `AlertCard`
- `MetricCard`
- `ProfileCard`
- `TimelineCard`
- `PatientCard`
- `AdmissionCard`
- `OrderCard`
- `MedicationCard`

### Filter Components (8 total)

- `FilterBar`
- `StatusFilter`
- `DateRangeFilter`
- `SearchFilter`
- `BranchFilter`
- `DisciplineFilter`
- `PriorityFilter`
- `CustomFilter`

### Drawer Components (7 total)

- `PatientSummaryDrawer`
- `AdmissionSummaryDrawer`
- `DocumentPreviewDrawer`
- `MedicationDetailsDrawer`
- `OrderDetailsDrawer`
- `CaregiverProfileDrawer`
- `IntegrationLogsDrawer`

### Status Components (6 total)

- `StatusBadge`
- `PriorityIndicator`
- `ComplianceStatus`
- `AuthorizationStatus`
- `DocumentStatus`
- `VisitStatus`

### Form Components (13 total)

- `FormSection`
- `FormRow`
- `FormGrid`
- `FormActions`
- `ValidationSummary`
- `TextInput`
- `Textarea`
- `Select`
- `DatePicker`
- `DateRange`
- `RadioGroup`
- `Checkbox`
- `Switch`

## Consistency Checklist

Before creating a new page, ask:

### Layout

- [ ] Does `ListPageShell` work?
- [ ] Does `DetailPageShell` work?
- [ ] Does `EditorShell` work?
- [ ] Does `WorkflowShell` work?
- [ ] Is a custom layout truly necessary?

### Cards

- [ ] Can I use `SummaryCard`?
- [ ] Can I use `QueueCard`?
- [ ] Can I use `AlertCard`?
- [ ] Can I use `MetricCard`?
- [ ] Do I need a new card type?

### Filters

- [ ] Does `FilterBar` support my filters?
- [ ] Can I use existing filter components?
- [ ] Do I need a custom filter?

### Drawers

- [ ] Does an existing drawer pattern fit?
- [ ] Can I reuse drawer logic?
- [ ] Is this truly a unique drawer need?

### Status

- [ ] Can I use `StatusBadge`?
- [ ] Can I use `PriorityIndicator`?
- [ ] Do I need custom status display?

### Forms

- [ ] Can I use `FormSection`?
- [ ] Can I use existing field components?
- [ ] Do I need custom form structure?

## Code Review Guidelines

### Approve ✅

```tsx
// Reuses existing patterns
import { ListPageShell, QueueCard, FilterBar } from '@/components';

function NewPage() {
  return (
    <ListPageShell
      title="New Entity"
      filters={<FilterBar filters={filters} />}
    >
      {items.map(item => (
        <QueueCard key={item.id} {...item} />
      ))}
    </ListPageShell>
  );
}
```

### Request Changes ⚠️

```tsx
// Creates unique patterns
function NewPage() {
  return (
    <div className="unique-layout">
      <div className="unique-header">
        <h1>New Entity</h1>
      </div>
      <div className="unique-cards">
        {items.map(item => (
          <div className="unique-card" key={item.id}>
            {/* Custom card structure */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Ask**:
- Why can't `ListPageShell` be used?
- Why create a custom card instead of using `QueueCard`?
- What makes this page structurally unique?

## Extending Patterns

### When to Extend

Create new patterns only when:

1. **Truly unique requirement** - Not covered by existing patterns
2. **Reusable across 3+ screens** - Not one-off
3. **Documented and reviewed** - Properly integrated
4. **Follows design system** - Uses tokens and components

### How to Extend

```tsx
// 1. Create in appropriate directory
/src/app/components/shells/NewShell.tsx

// 2. Follow existing patterns
export function NewShell({ title, children }: NewShellProps) {
  return (
    <div className="new-shell">
      <PageHeader title={title} />
      <div className="new-shell-content">
        {children}
      </div>
    </div>
  );
}

// 3. Document usage
/**
 * NewShell
 * 
 * Use for: [specific use case]
 * 
 * Example:
 * ```tsx
 * <NewShell title="Example">
 *   <Content />
 * </NewShell>
 * ```
 */

// 4. Export from index
export { NewShell } from './shells/NewShell';

// 5. Update pattern inventory
// Add to REUSABILITY.md
```

## Best Practices

### DO ✅

- Check existing patterns first
- Reuse shells whenever possible
- Use established card types
- Follow filter patterns
- Reuse drawer implementations
- Use standard status badges
- Follow form structures
- Document new patterns
- Get pattern review before implementing
- Think "system" not "page"

### DON'T ❌

- Create unique layouts by default
- Reinvent existing patterns
- Skip pattern check
- Create one-off components
- Build custom status displays
- Ignore existing drawers
- Create unique form structures
- Add patterns without review
- Prioritize uniqueness over consistency
- Think "my page is special"

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
