# Healthcare Platform - Shell Architecture

## Overview

This document describes the 5 reusable shell components that provide consistent layout structure across the entire healthcare platform. These shells implement enterprise-grade patterns for navigation, context management, and operational workflows.

## Architecture Principles

1. **Consistency** - Users see the same layout patterns across all modules
2. **Composability** - Shells accept content via props and children
3. **Performance** - All shells are memoized and optimized
4. **Accessibility** - ARIA labels, keyboard navigation, semantic HTML
5. **Responsiveness** - Mobile-first design with breakpoints
6. **Role-Awareness** - Navigation adapts based on user role

---

## 1. Application Shell

**Purpose**: Main application wrapper used across the entire platform.

**Location**: `/src/app/components/shells/ApplicationShell.tsx`

**Use Cases**:
- Main application layout
- Wraps all authenticated pages
- Provides global navigation and search

**Key Features**:
- Persistent left sidebar (role-based navigation)
- Top application bar with breadcrumbs
- Global search/command palette (⌘K)
- Notification center access
- User profile menu
- Optional right context drawer
- Collapsible sidebar

**Props**:
```typescript
interface ApplicationShellProps {
  userRole: string;
  userProfile?: { name: string; email: string; avatar?: string };
  children: ReactNode;
  rightDrawer?: ReactNode;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  collapsibleSidebar?: boolean;
}
```

**Example Usage**:
```tsx
import { ApplicationShell } from './components/shells';

function App() {
  return (
    <ApplicationShell
      userRole="clinician"
      userProfile={{
        name: "Dr. Sarah Chen",
        email: "sarah.chen@hospital.com"
      }}
      notificationCount={5}
      breadcrumbs={[
        { label: 'Dashboard', path: '/' },
        { label: 'Patients', path: '/patients' },
        { label: 'Sarah Johnson' }
      ]}
    >
      <YourPageContent />
    </ApplicationShell>
  );
}
```

---

## 2. Workspace Page Shell

**Purpose**: Layout for role-based operational home screens (workspaces).

**Location**: `/src/app/components/shells/WorkspacePageShell.tsx`

**Use Cases**:
- Admissions workspace
- Scheduling workspace
- QA workspace
- Billing workspace
- Hospice workspace
- Care Operations Command Center

**Key Features**:
- Page header with title and actions
- Critical issues alert section (red banner)
- Today's priority work section
- Operational queues grid
- Quick actions sidebar
- Insights/metrics panel
- Customizable sections

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│ Header (Title + Actions)                │
├─────────────────────────────────────────┤
│ ⚠️  Critical Issues (if any)            │
├─────────────────────────────────────────┤
│ 📅 Today's Priority Work                │
├──────────────────────────┬──────────────┤
│ Operational Queues       │ Quick Actions│
│ (Main Content)           │              │
│                          │ Insights     │
│                          │              │
└──────────────────────────┴──────────────┘
```

**Props**:
```typescript
interface WorkspacePageShellProps {
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  criticalIssues?: ReactNode;
  criticalIssuesCount?: number;
  todaysWork?: ReactNode;
  queues?: ReactNode;
  quickActions?: ReactNode;
  insights?: ReactNode;
  layout?: 'default' | 'compact' | 'grid';
}
```

**Example Usage**:
```tsx
import { WorkspacePageShell } from './components/shells';

function AdmissionsWorkspace() {
  return (
    <WorkspacePageShell
      title="Admissions Workspace"
      subtitle="Manage admission pipeline and critical tasks"
      headerActions={
        <>
          <Button>New Admission</Button>
          <Button variant="outline">Reports</Button>
        </>
      }
      criticalIssues={
        <CriticalIssuesAlert issues={[...]} />
      }
      criticalIssuesCount={3}
      todaysWork={
        <TodaysPriorityList items={[...]} />
      }
      queues={
        <AdmissionQueuesGrid />
      }
      quickActions={
        <QuickActionButtons />
      }
      insights={
        <AdmissionMetrics />
      }
    />
  );
}
```

---

## 3. List Page Shell

**Purpose**: Layout for entity management and list-based modules.

**Location**: `/src/app/components/shells/ListPageShell.tsx`

**Use Cases**:
- Patients list
- Admissions list
- Orders list
- Claims list
- Caregivers list
- Documents list
- Any high-volume operational list

**Key Features**:
- Summary chips/counters (total, active, pending, etc.)
- Search bar with debouncing
- Advanced filter panel (collapsible)
- Table/list region with sorting
- Bulk actions when items selected
- Right-side detail drawer
- Export/Import actions
- Pagination support

**Layout Structure**:
```
┌──────────────────────────────────────────┐
│ Header (Title + Actions + Create)       │
├──────────────────────────────────────────┤
│ [Summary Chips: Total | Active | Etc.]  │
├──────────────────────────────────────────┤
│ 🔍 Search   [Filters]                    │
├──────────────────────────────────────────┤
│ ✓ 5 selected  [Bulk Actions]     (bulk) │
├──────────────────────────────────────────┤
│ Table/List Content                       │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

**Props**:
```typescript
interface ListPageShellProps {
  title: string;
  primaryAction?: { label: string; onClick: () => void };
  summaryChips?: SummaryChip[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterPanel?: ReactNode;
  children: ReactNode;
  bulkActions?: ReactNode;
  selectedCount?: number;
  detailDrawer?: ReactNode;
  onExport?: () => void;
  totalCount?: number;
}
```

**Example Usage**:
```tsx
import { ListPageShell } from './components/shells';

function PatientsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <ListPageShell
      title="Patients"
      subtitle="All active and discharged patients"
      totalCount={1247}
      primaryAction={{
        label: 'Add Patient',
        onClick: () => setShowAddModal(true)
      }}
      summaryChips={[
        { id: 'total', label: 'Total', value: 1247 },
        { id: 'active', label: 'Active', value: 892, variant: 'success' },
        { id: 'pending', label: 'Pending', value: 45, variant: 'warning' },
      ]}
      searchValue={search}
      onSearchChange={setSearch}
      filterPanel={<PatientFilters />}
      selectedCount={selected.length}
      bulkActions={
        <>
          <Button>Assign Caregiver</Button>
          <Button variant="outline">Export Selected</Button>
        </>
      }
      onExport={() => exportPatients()}
    >
      <PatientsTable 
        patients={filteredPatients}
        onSelect={setSelected}
      />
    </ListPageShell>
  );
}
```

---

## 4. Queue Page Shell

**Purpose**: Layout for work queue management and triage.

**Location**: `/src/app/components/shells/QueuePageShell.tsx`

**Use Cases**:
- Delayed visits queue
- EVV errors queue
- QA pending review
- Orders pending signature
- Credential expiration issues
- Admissions not ready
- Claims rejections
- Any prioritized work queue

**Key Features**:
- Priority summary cards (Critical/High/Medium/Low/Overdue)
- Quick filters (predefined common filters)
- Search and advanced filters
- Color-coded priority indicators
- SLA/age indicators
- Bulk triage actions
- Detail drawer for item review
- Queue type theming (clinical/operational/compliance/billing)

**Layout Structure**:
```
┌──────────────────────────────────────────┐
│ 🕐 Queue Title         [Refresh]         │
├──────────────────────────────────────────┤
│ [⚠️ Critical] [High] [Medium] [Low]      │
│ Priority Summary Cards                   │
├──────────────────────────────────────────┤
│ [All] [My Items] [Overdue] [Today]      │
│ Quick Filters                            │
├──────────────────────────────────────────┤
│ 🔍 Search   [Advanced Filters]           │
├──────────────────────────────────────────┤
│ ✓ 3 items selected  [Triage Actions]    │
├──────────────────────────────────────────┤
│ Queue Items (prioritized)                │
│                                          │
└──────────────────────────────────────────┘
```

**Props**:
```typescript
interface QueuePageShellProps {
  title: string;
  prioritySummary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    overdue?: number;
  };
  quickFilters?: QuickFilter[];
  children: ReactNode;
  triageActions?: ReactNode;
  selectedCount?: number;
  queueType?: 'clinical' | 'operational' | 'compliance' | 'billing';
}
```

**Example Usage**:
```tsx
import { QueuePageShell } from './components/shells';

function EVVErrorsQueue() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <QueuePageShell
      title="EVV Errors"
      subtitle="Electronic Visit Verification exceptions requiring resolution"
      queueType="operational"
      prioritySummary={{
        critical: 12,
        high: 28,
        medium: 45,
        low: 67,
        overdue: 5
      }}
      quickFilters={[
        { id: 'all', label: 'All Items', count: 152, active: true },
        { id: 'mine', label: 'My Items', count: 23 },
        { id: 'overdue', label: 'Overdue', count: 5 },
      ]}
      selectedCount={selected.length}
      triageActions={
        <>
          <Button>Assign to Me</Button>
          <Button>Mark Resolved</Button>
          <Button variant="outline">Escalate</Button>
        </>
      }
    >
      <EVVErrorsList 
        errors={errors}
        onSelect={setSelected}
      />
    </QueuePageShell>
  );
}
```

---

## 5. Patient Chart Shell

**Purpose**: Layout for patient-centered workflows and clinical screens.

**Location**: `/src/app/components/shells/PatientChartShell.tsx`

**Use Cases**:
- Patient chart view
- Clinical documentation
- Patient medications
- Visit notes
- Care plans
- Patient orders
- Any patient-context workflow

**Key Features**:
- Sticky patient context header (always visible)
- Sticky admission context bar (when admission selected)
- Left context navigation (patient-level and admission-level tabs)
- Main content panel (tab content)
- Right activity drawer (timeline, alerts, quick actions)
- Seamless patient/admission context switching
- Collapsible sidebar
- Clinical alerts display

**Layout Structure**:
```
┌──────────────────────────────────────────┐
│ 👤 Sarah Johnson | MRN-123456 | 79y  [X]│  <- Sticky Patient Header
├──────────────────────────────────────────┤
│ 📋 Active Admission | Medicare | RN/PT   │  <- Sticky Admission Bar
├─────┬────────────────────────────────┬───┤
│ Nav │ Main Content Panel             │Act│
│ ──  │                                │ │ │
│ 📄  │                                │ │ │
│ 💊  │ Tab content here               │ │ │
│ 📅  │                                │ │ │
│ ──  │                                │ │ │
│ 📝  │                                │ │ │
│ 🎯  │                                │ │ │
│ 📋  │                                │ │ │
│     │                                │   │
│ [<] │                                │[>]│
└─────┴────────────────────────────────┴───┘
  Left Sidebar       Main Content      Right Drawer
```

**Navigation Levels**:
- **Patient-Level**: Demographics, All Admissions, Medications, Documents, Contacts
- **Admission-Level**: Visit Notes, Care Plan, Orders, Assessments, Frequency

**Props**:
```typescript
interface PatientChartShellProps {
  patient: PatientInfo;
  alerts?: PatientAlert[];
  admission?: AdmissionInfo;
  navigationTabs: NavigationTab[];
  children: ReactNode;
  rightDrawer?: ReactNode;
  quickActions?: ReactNode;
  onClose?: () => void;
}
```

**Example Usage**:
```tsx
import { PatientChartShell } from './components/shells';
import { FileText, Pill, Calendar } from 'lucide-react';

function PatientChartPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const navigationTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FileText className="w-4 h-4" />,
      level: 'patient',
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview'
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: <Pill className="w-4 h-4" />,
      level: 'patient',
      badge: 12,
      onClick: () => setActiveTab('medications'),
      active: activeTab === 'medications'
    },
    {
      id: 'visits',
      label: 'Visit Notes',
      icon: <Calendar className="w-4 h-4" />,
      level: 'admission',
      badge: 3,
      onClick: () => setActiveTab('visits'),
      active: activeTab === 'visits'
    },
  ];

  return (
    <PatientChartShell
      patient={{
        id: 'P-001',
        name: 'Sarah Johnson',
        mrn: 'MRN-123456',
        dob: '1945-03-15',
        age: 79,
        office: 'Central Office'
      }}
      admission={{
        id: 'A-001',
        startDate: '2024-01-15',
        status: 'active',
        primaryPayer: 'Medicare',
        disciplines: ['Nursing', 'PT'],
        caseManager: 'Jane Smith',
        authorizationStatus: 'approved'
      }}
      navigationTabs={navigationTabs}
      rightDrawer={<ActivityTimeline />}
      quickActions={
        <>
          <Button size="sm" className="w-full">New Visit</Button>
          <Button size="sm" variant="outline" className="w-full">Add Order</Button>
        </>
      }
      onClose={() => navigate('/patients')}
    >
      {activeTab === 'overview' && <PatientOverview />}
      {activeTab === 'medications' && <MedicationList />}
      {activeTab === 'visits' && <VisitNotesList />}
    </PatientChartShell>
  );
}
```

---

## Performance Optimizations

All shells implement the following performance patterns:

1. **React.memo** - Prevent unnecessary re-renders
2. **useCallback** - Memoize event handlers
3. **useMemo** - Memoize computed values
4. **Lazy Loading** - Drawer content loaded on demand
5. **Debouncing** - Search inputs debounced (300ms)
6. **Virtualization** - Long lists use virtual scrolling
7. **CSS Transitions** - Hardware-accelerated animations

## Integration with Existing Navigation

The shells integrate seamlessly with existing navigation components:

- **UnifiedSidebar** (optimized) - Used in ApplicationShell
- **PatientContextHeader** - Used in PatientChartShell
- **AdmissionContextBar** - Used in PatientChartShell
- **CommandPalette** (optimized) - Used in ApplicationShell

## File Organization

```
/src/app/components/shells/
├── index.ts                    # Central exports
├── ApplicationShell.tsx        # Main app wrapper
├── WorkspacePageShell.tsx      # Workspace layouts
├── ListPageShell.tsx           # List/table layouts
├── QueuePageShell.tsx          # Queue management
└── PatientChartShell.tsx       # Patient context layouts
```

## Design Tokens

All shells use the platform's design tokens from `/src/styles/theme.css`:

- **Colors**: Semantic color scale (blue-50 to blue-900, etc.)
- **Spacing**: Consistent spacing units (px-4, py-6, gap-3)
- **Typography**: Font sizes and weights (text-sm, font-semibold)
- **Shadows**: Elevation system (shadow-sm, shadow-lg)
- **Borders**: Border colors and radii (border-gray-200, rounded-lg)

## Accessibility

All shells implement:

- ✅ Semantic HTML5 elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management
- ✅ Screen reader support
- ✅ Color contrast ratios (WCAG AA)

## Mobile Responsiveness

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Mobile behavior:
- Sidebars collapse to hamburger menu on mobile
- Summary chips scroll horizontally
- Drawers become full-screen modals
- Tables switch to card layout

## Migration Guide

### From Custom Layout to Shell

**Before**:
```tsx
function MyPage() {
  return (
    <div className="page">
      <header>...</header>
      <aside>...</aside>
      <main>...</main>
    </div>
  );
}
```

**After**:
```tsx
import { WorkspacePageShell } from './components/shells';

function MyPage() {
  return (
    <WorkspacePageShell
      title="My Workspace"
      queues={<MyQueues />}
    >
      <MyContent />
    </WorkspacePageShell>
  );
}
```

## Best Practices

1. **Use the right shell** - Match the shell to your use case
2. **Don't override styles** - Work with the shell's design
3. **Leverage props** - Use provided props instead of custom logic
4. **Keep content focused** - Let the shell handle layout
5. **Test responsiveness** - Verify mobile and tablet views
6. **Monitor performance** - Use React DevTools Profiler

## Future Enhancements

Planned improvements:
- [ ] Shell variants for different screen sizes
- [ ] Custom theme support per workspace
- [ ] Printable layouts
- [ ] Dashboard shell for analytics
- [ ] Modal shell for wizards
- [ ] Split-view shell for comparisons

---

**Last Updated**: March 10, 2026
**Version**: 1.0.0
**Maintainer**: Platform Team
