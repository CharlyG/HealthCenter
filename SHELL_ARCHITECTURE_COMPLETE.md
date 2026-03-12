# Complete Shell & Pattern Architecture

## Overview

Sistema completo de **9 shells reutilizables** y **3 pattern systems** que proporcionan estructura consistente en toda la plataforma de salud HIPAA-compliant.

---

## 📦 Shell Components (9 total)

### Core Application Shells

#### 1. **ApplicationShell** - Main App Wrapper
`/src/app/components/shells/ApplicationShell.tsx`

**Purpose**: Wrapper principal para toda la aplicación autenticada.

**Features**:
- ✅ Sidebar persistente role-based
- ✅ Top bar con breadcrumbs
- ✅ Command Palette global (⌘K)
- ✅ Notification center
- ✅ User profile menu
- ✅ Optional context drawer
- ✅ Collapsible sidebar

---

#### 2. **WorkspacePageShell** - Operational Workspaces
`/src/app/components/shells/WorkspacePageShell.tsx`

**Purpose**: Layout para workspaces operacionales por rol.

**Features**:
- ✅ Critical issues banner
- ✅ Today's priority work
- ✅ Operational queues grid
- ✅ Quick actions sidebar
- ✅ Insights panel
- ✅ Customizable sections

**Use Cases**: Admissions, QA, Billing, Scheduling, Hospice workspaces

---

#### 3. **ListPageShell** - Entity Management
`/src/app/components/shells/ListPageShell.tsx`

**Purpose**: Layout para listas de alto volumen.

**Features**:
- ✅ Summary chips
- ✅ Search + advanced filters
- ✅ Bulk actions
- ✅ Detail drawer
- ✅ Export/Import
- ✅ Pagination support

**Use Cases**: Patients, Admissions, Orders, Claims, Caregivers, Documents

---

#### 4. **QueuePageShell** - Work Queue Management
`/src/app/components/shells/QueuePageShell.tsx`

**Purpose**: Layout para colas de trabajo prioritizadas.

**Features**:
- ✅ Priority summary cards (Critical/High/Medium/Low/Overdue)
- ✅ Quick filters
- ✅ SLA indicators
- ✅ Bulk triage actions
- ✅ Queue type theming
- ✅ Detail drawer

**Use Cases**: EVV Errors, QA Review, Delayed Visits, Orders Pending Signature

---

#### 5. **PatientChartShell** - Patient Context
`/src/app/components/shells/PatientChartShell.tsx`

**Purpose**: Layout para workflows en contexto de paciente.

**Features**:
- ✅ Sticky patient header
- ✅ Sticky admission bar
- ✅ Left navigation (patient + admission levels)
- ✅ Activity drawer
- ✅ Quick actions
- ✅ Clinical alerts

**Use Cases**: Patient Chart, Visit Notes, Clinical Documentation, Care Plans

---

### Specialized Shells

#### 6. **AdmissionDashboardShell** - Episode Control Center ⭐ NEW
`/src/app/components/shells/AdmissionDashboardShell.tsx`

**Purpose**: Operational control center para un episodio de cuidado.

**Features**:
- ✅ Admission context bar
- ✅ Episode status summary (days in care, visits, certification)
- ✅ Clinical summary cards
- ✅ Operational summary cards
- ✅ Active alerts section
- ✅ Upcoming events timeline
- ✅ Optional full timeline panel

**Layout**:
```
┌─────────────────────────────────────────┐
│ Admission Context Bar                   │
├─────────────────────────────────────────┤
│ Episode Status (Days | Visits | Cert)   │
├─────────────────────────────────────────┤
│ ⚠️  Active Alerts (collapsible)         │
├──────────────────────────┬──────────────┤
│ Clinical Summary Cards   │ Operational  │
│                          │ Summary Cards│
├──────────────────────────┴──────────────┤
│ 📅 Upcoming Events                      │
├─────────────────────────────────────────┤
│ 📋 Timeline (optional, collapsible)     │
└─────────────────────────────────────────┘
```

**Use Cases**: Admission overview, Episode dashboard, Case management summary

---

#### 7. **DocumentEditorShell** - Clinical Documentation ⭐ NEW
`/src/app/components/shells/DocumentEditorShell.tsx`

**Purpose**: Layout para formularios clínicos largos y complejos.

**Features**:
- ✅ Document header con progress
- ✅ Section navigation sidebar
- ✅ Main form area
- ✅ Live validation panel
- ✅ Sticky action footer
- ✅ Auto-save support
- ✅ Unsaved changes warning

**Layout**:
```
┌───────────────────────────────────────────────┐
│ Document Header + Progress (80%)             │
├─────┬────────────────────────────────┬───────┤
│ Nav │ Main Form Content              │ Valid │
│ ──  │                                │ Panel │
│ Sec1│                                │  3err │
│ Sec2│   Question fields here         │  1wrn │
│ Sec3│                                │       │
│     │                                │       │
│     │                                │       │
├─────┴────────────────────────────────┴───────┤
│ [Cancel] [Save Draft] [Submit] ────────────→ │
└───────────────────────────────────────────────┘
```

**Use Cases**: Visit notes, Orders, Plan of Care/485, Recertification docs

---

#### 8. **AssessmentEditorShell** - Structured Assessments ⭐ NEW
`/src/app/components/shells/AssessmentEditorShell.tsx`

**Purpose**: Layout optimizado para assessments estructurados con lógica condicional.

**Features**:
- ✅ Assessment header con patient info
- ✅ Section sidebar con progress por sección
- ✅ Question panel principal
- ✅ Dynamic validation panel
- ✅ Progress tracker (overall + section)
- ✅ Skip logic visualization
- ✅ Previous/Next navigation
- ✅ Auto-save

**Layout**:
```
┌────────────────────────────────────────────┐
│ OASIS-E Assessment | Patient: Sarah J.    │
│ Progress: 65% | Q 45/120 | 12 skipped     │
├──────────┬────────────────────────┬────────┤
│ Sections │ Questions              │ Valid  │
│ M0010 ✓  │                        │        │
│ M0014 ✓  │ Question text here     │ 2 err  │
│ M0018 →  │ [ ] Option A           │        │
│ M0022    │ [ ] Option B           │        │
│ M0030    │ [ ] Option C           │        │
│          │                        │        │
├──────────┴────────────────────────┴────────┤
│ [← Prev] [Next →]    [Save] [Submit] ────→│
└────────────────────────────────────────────┘
```

**Use Cases**: OASIS-E, HOPE, Recertification assessments, Discharge assessments

---

#### 9. **SplitViewShell** - Side-by-Side Comparison ⭐ NEW
`/src/app/components/shells/SplitViewShell.tsx`

**Purpose**: Layout para comparación y revisión lado a lado.

**Features**:
- ✅ Dual panel layout
- ✅ Synchronized scrolling
- ✅ Resizable panels (drag divider)
- ✅ View mode toggle (split/primary-only/secondary-only)
- ✅ Shared header
- ✅ Independent panel headers

**Layout**:
```
┌────────────────────────────────────────────┐
│ Shared Header   [Split|←|→] [Sync] [Close]│
├─────────────────────┬──────────────────────┤
│ Primary Panel       │ Secondary Panel      │
│ Original Document   │ Corrected Document   │
│                     ║                      │
│ Lorem ipsum dolor...║ Lorem ipsum dolor... │
│ consectetur adipisc.║ consectetur adipisc. │
│ sed do eiusmod...   ║ sed do eiusmod...    │
│                     ║                      │
│ [scrollable]        ║ [scrollable]         │
│                     ║                      │
└─────────────────────┴──────────────────────┘
```

**Use Cases**: QA document review, Assessment comparison, Medication reconciliation, Document versioning

---

## 🎨 Pattern Components (3 systems)

### 10. **DetailDrawer** - Secondary Details ⭐ NEW
`/src/app/components/patterns/DetailDrawer.tsx`

**Purpose**: Drawer para mostrar detalles sin salir de la pantalla actual.

**Features**:
- ✅ Slide-in from right
- ✅ Overlay backdrop
- ✅ Header con icon + badge
- ✅ Key summary section
- ✅ Scrollable content
- ✅ Quick actions
- ✅ Footer actions
- ✅ Portal rendering (escapes z-index constraints)
- ✅ Keyboard support (ESC to close)
- ✅ Sizes: sm (384px) | md (512px) | lg (640px) | xl (768px)

**Use Cases**: Patient summary, Admission details, Medication details, Order history, Claim summary, Caregiver profile, Document preview

**Example**:
```tsx
<DetailDrawer
  isOpen={!!selectedPatient}
  onClose={() => setSelectedPatient(null)}
  title="Sarah Johnson"
  subtitle="Patient Summary"
  icon={<User className="w-5 h-5 text-blue-600" />}
  badge={{ label: 'Active', variant: 'default' }}
  summary={<QuickStats patient={selectedPatient} />}
  quickActions={[
    { id: 'edit', label: 'Edit', onClick: () => {} },
    { id: 'call', label: 'Call', onClick: () => {} },
  ]}
>
  <PatientDetailContent patient={selectedPatient} />
</DetailDrawer>
```

---

### 11. **DashboardCards** - Consistent Card System ⭐ NEW
`/src/app/components/patterns/DashboardCards.tsx`

**Purpose**: Sistema de cards reutilizables para dashboards.

**5 Card Types**:

#### **MetricCard** - Key Performance Metrics
```tsx
<MetricCard
  title="Total Admissions"
  value={247}
  trend={{ direction: 'up', value: '+15%', label: 'vs last week' }}
  status="success"
  icon={<Users className="w-5 h-5 text-green-600" />}
  onClick={() => navigate('/admissions')}
/>
```

#### **QueueCard** - Work Queues
```tsx
<QueueCard
  title="EVV Errors"
  count={152}
  description="Pending resolution"
  priority={{ critical: 12, high: 28, medium: 45 }}
  icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
  action={{ label: 'View Queue', onClick: () => {} }}
  onClick={() => navigate('/evv-errors')}
/>
```

#### **SummaryCard** - Multi-Item Summaries
```tsx
<SummaryCard
  title="Clinical Summary"
  items={[
    { label: 'Assessments Due', value: 5, status: 'warning' },
    { label: 'Orders Pending', value: 3, status: 'danger' },
    { label: 'Visits Today', value: 12, status: 'success' },
  ]}
  icon={<Activity className="w-5 h-5" />}
  action={{ label: 'View All', onClick: () => {} }}
/>
```

#### **AlertCard** - Important Alerts
```tsx
<AlertCard
  type="critical"
  title="Authorization Expiring Tomorrow"
  message="Medicare authorization for Sarah Johnson expires 03/11/2026"
  action={{ label: 'Review', onClick: () => {} }}
  timestamp="2 hours ago"
  onDismiss={() => {}}
/>
```

#### **InsightCard** - Data Insights
```tsx
<InsightCard
  title="Admission Rate"
  value="15%"
  description="Increase in new admissions compared to last week"
  trend={{ direction: 'up', value: '+3%' }}
  variant="success"
  icon={<TrendingUp className="w-5 h-5 text-green-600" />}
  action={{ label: 'View Details', onClick: () => {} }}
/>
```

**Use Cases**: All dashboards, workspaces, command centers

---

### 12. **FilterBar** - Consistent Filtering ⭐ NEW
`/src/app/components/patterns/FilterBar.tsx`

**Purpose**: Sistema de filtros estandarizado para listas y colas.

**Features**:
- ✅ Search bar
- ✅ Quick filters (predefined)
- ✅ Advanced filters (collapsible panel)
- ✅ Saved filter views
- ✅ Active filter count badge
- ✅ Clear all functionality
- ✅ Save current view

**Components Included**:
- `FilterBar` - Main component
- `FilterSelect` - Dropdown filter
- `FilterDateRange` - Date range picker
- `FilterCheckboxGroup` - Multi-select checkboxes

**Common Filters**:
- Office
- Date range
- Discipline
- Clinician
- Status
- Priority
- Payer

**Example**:
```tsx
<FilterBar
  searchValue={search}
  onSearchChange={setSearch}
  quickFilters={[
    { id: 'all', label: 'All', count: 152, active: true, onClick: () => {} },
    { id: 'mine', label: 'My Items', count: 23, onClick: () => {} },
    { id: 'overdue', label: 'Overdue', count: 5, onClick: () => {} },
  ]}
  advancedFilters={
    <div className="grid grid-cols-3 gap-4">
      <FilterSelect 
        label="Office" 
        value={filters.office}
        options={offices}
        onChange={(v) => setFilters({...filters, office: v})}
      />
      <FilterDateRange
        label="Date Range"
        startDate={filters.startDate}
        endDate={filters.endDate}
        onStartDateChange={(d) => setFilters({...filters, startDate: d})}
        onEndDateChange={(d) => setFilters({...filters, endDate: d})}
      />
    </div>
  }
  activeFiltersCount={3}
  onClearAll={() => resetFilters()}
  savedViews={savedViews}
  onSaveView={(name) => saveCurrentView(name)}
/>
```

**Use Cases**: All list pages, queue pages, dashboard filtering

---

## 📊 Component Matrix

| Component | Type | Size | Use Case | Complexity |
|-----------|------|------|----------|------------|
| ApplicationShell | Shell | Full App | Main wrapper | High |
| WorkspacePageShell | Shell | Full Page | Operational workspaces | Medium |
| ListPageShell | Shell | Full Page | Entity lists | Medium |
| QueuePageShell | Shell | Full Page | Work queues | Medium |
| PatientChartShell | Shell | Full Page | Patient context | High |
| AdmissionDashboardShell | Shell | Full Page | Episode dashboard | High |
| DocumentEditorShell | Shell | Full Page | Long forms | High |
| AssessmentEditorShell | Shell | Full Page | Structured assessments | High |
| SplitViewShell | Shell | Full Page | Side-by-side comparison | Medium |
| DetailDrawer | Pattern | 384-768px | Secondary details | Low |
| DashboardCards | Pattern | 200-400px | Metrics/summaries | Low |
| FilterBar | Pattern | Full Width | Filtering | Medium |

---

## 🗂️ File Structure

```
/src/app/components/
├── shells/
│   ├── index.ts                      # Central exports
│   ├── ApplicationShell.tsx          # Main app wrapper
│   ├── WorkspacePageShell.tsx        # Workspace layouts
│   ├── ListPageShell.tsx             # List/table layouts
│   ├── QueuePageShell.tsx            # Queue management
│   ├── PatientChartShell.tsx         # Patient context
│   ├── AdmissionDashboardShell.tsx   # Episode dashboard ⭐
│   ├── DocumentEditorShell.tsx       # Long forms ⭐
│   ├── AssessmentEditorShell.tsx     # Assessments ⭐
│   └── SplitViewShell.tsx            # Split view ⭐
│
└── patterns/
    ├── index.ts                      # Central exports
    ├── DetailDrawer.tsx              # Detail drawer ⭐
    ├── DashboardCards.tsx            # Card system ⭐
    └── FilterBar.tsx                 # Filter system ⭐
```

---

## 🚀 Quick Import Guide

### Import Shells:
```tsx
import {
  ApplicationShell,
  WorkspacePageShell,
  ListPageShell,
  QueuePageShell,
  PatientChartShell,
  AdmissionDashboardShell,      // NEW
  DocumentEditorShell,          // NEW
  AssessmentEditorShell,        // NEW
  SplitViewShell,               // NEW
} from './components/shells';
```

### Import Patterns:
```tsx
import {
  DetailDrawer,                 // NEW
  FilterBar,                    // NEW
  FilterSelect,
  FilterDateRange,
  MetricCard,                   // NEW
  QueueCard,
  SummaryCard,
  AlertCard,
  InsightCard,
} from './components/patterns';
```

---

## ⚡ Performance Features

All components implement:
- ✅ **React.memo** - Prevent unnecessary re-renders
- ✅ **useCallback** - Memoize event handlers
- ✅ **useMemo** - Memoize computed values
- ✅ **Lazy Loading** - Content loaded on demand
- ✅ **Debouncing** - Search/filter inputs debounced
- ✅ **CSS Transitions** - Hardware-accelerated
- ✅ **Portal Rendering** - For drawers and modals

---

## 📱 Responsive Design

All components support:
- **Desktop** (1024px+): Full layouts
- **Tablet** (768-1023px): Adapted layouts, collapsible sidebars
- **Mobile** (<768px): Hamburger menus, full-screen modals, card layouts

---

## ♿ Accessibility

All components include:
- ✅ Semantic HTML5
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ WCAG AA color contrast

---

## 🎯 Integration Strategy

### Phase 1: Core Shells (Already Complete)
- ✅ ApplicationShell
- ✅ WorkspacePageShell
- ✅ ListPageShell
- ✅ QueuePageShell
- ✅ PatientChartShell

### Phase 2: Specialized Shells (NEW - Just Completed)
- ✅ AdmissionDashboardShell
- ✅ DocumentEditorShell
- ✅ AssessmentEditorShell
- ✅ SplitViewShell

### Phase 3: Pattern Systems (NEW - Just Completed)
- ✅ DetailDrawer
- ✅ DashboardCards (5 card types)
- ✅ FilterBar (with 3 filter components)

### Phase 4: Migration (Next)
- [ ] Migrate existing pages to use shells
- [ ] Standardize all dashboards with DashboardCards
- [ ] Implement FilterBar across all list/queue pages
- [ ] Replace custom drawers with DetailDrawer

---

## 📝 Migration Examples

### Before: Custom Admission Dashboard
```tsx
function AdmissionDashboard() {
  return (
    <div className="custom-layout">
      <header>...</header>
      <div className="metrics">...</div>
      <div className="content">...</div>
    </div>
  );
}
```

### After: Using AdmissionDashboardShell
```tsx
import { AdmissionDashboardShell } from './components/shells';
import { MetricCard, AlertCard } from './components/patterns';

function AdmissionDashboard() {
  return (
    <AdmissionDashboardShell
      admission={admissionData}
      episodeStatus={statusData}
      clinicalSummary={[
        <MetricCard title="Assessments" value={5} status="warning" />,
        <MetricCard title="Orders" value={3} status="success" />,
      ]}
      alerts={[
        { type: 'critical', message: 'Auth expiring', action: {...} },
      ]}
      upcomingEvents={eventsData}
    />
  );
}
```

---

## 🎓 Best Practices

1. **Choose the right shell** - Match component to use case
2. **Use patterns consistently** - Same card types everywhere
3. **Don't override styles** - Work with the shell's design
4. **Leverage props** - Use provided props vs custom logic
5. **Test responsiveness** - Verify on all breakpoints
6. **Monitor performance** - Use React DevTools Profiler
7. **Follow accessibility** - Test with keyboard and screen readers

---

## 📦 Complete Component Count

- **9 Shell Components** (layouts)
- **1 Drawer Component** (modal pattern)
- **5 Dashboard Cards** (metric displays)
- **4 Filter Components** (filtering system)

**Total: 19 reusable components**

---

**Last Updated**: March 10, 2026  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
