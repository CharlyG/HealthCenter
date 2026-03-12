# Healthcare UI Patterns

Comprehensive guide for reusable UI patterns in the healthcare platform.

## Card System

### Card Categories

#### 1. Summary Card

**Use for**: Dashboard metrics, KPIs, statistics

```tsx
interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    label: string;
  };
  icon?: React.ReactNode;
  trend?: Array<number>;
  onClick?: () => void;
}

<SummaryCard
  title="Active Patients"
  value={247}
  change={{ value: 12, direction: 'up', label: 'from last month' }}
  icon={<PatientsIcon />}
  trend={[220, 235, 242, 247]}
/>
```

#### 2. Queue Card

**Use for**: Queue items, task lists, work items

```tsx
interface QueueCardProps {
  title: string;
  subtitle?: string;
  status: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: { name: string; avatar?: string };
  dueDate?: Date;
  metadata?: Array<{ label: string; value: string }>;
  actions?: Array<{ label: string; onClick: () => void }>;
  onClick?: () => void;
}

<QueueCard
  title="OASIS Assessment - John Doe"
  subtitle="MRN: 12345"
  status="In Progress"
  priority="high"
  assignedTo={{ name: "Jane Smith" }}
  dueDate={new Date('2026-03-15')}
  metadata={[
    { label: 'Type', value: 'Start of Care' },
    { label: 'Discipline', value: 'Skilled Nursing' }
  ]}
  actions={[
    { label: 'Continue', onClick: handleContinue },
    { label: 'Reassign', onClick: handleReassign }
  ]}
/>
```

#### 3. Alert Card

**Use for**: Warnings, notifications, action needed

```tsx
interface AlertCardProps {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
  onDismiss?: () => void;
}

<AlertCard
  severity="warning"
  title="Orders Expiring Soon"
  message="3 physician orders will expire in the next 7 days"
  action={{ label: 'Review Orders', onClick: goToOrders }}
  dismissible
  onDismiss={handleDismiss}
/>
```

#### 4. Metric Card

**Use for**: Analytics, reports, performance metrics

```tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  target?: number;
  comparison?: {
    label: string;
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  chart?: React.ReactNode;
}

<MetricCard
  title="Documentation Completion"
  value={94.5}
  unit="%"
  target={95}
  comparison={{
    label: 'vs last month',
    value: 3.2,
    direction: 'up'
  }}
  chart={<MiniLineChart data={chartData} />}
/>
```

#### 5. Profile Card

**Use for**: User profiles, caregiver cards, patient cards

```tsx
interface ProfileCardProps {
  name: string;
  subtitle?: string;
  avatar?: string;
  status?: string;
  badges?: Array<{ label: string; variant: string }>;
  metadata?: Array<{ label: string; value: string }>;
  actions?: Array<{ label: string; onClick: () => void; variant?: string }>;
  onClick?: () => void;
}

<ProfileCard
  name="Sarah Johnson, RN"
  subtitle="Skilled Nursing"
  avatar="/avatars/sarah.jpg"
  status="Available"
  badges={[
    { label: 'OASIS Certified', variant: 'success' },
    { label: 'Wound Care', variant: 'info' }
  ]}
  metadata={[
    { label: 'Employee ID', value: 'EMP-1234' },
    { label: 'License', value: 'RN-567890' },
    { label: 'Visits Today', value: '3 of 6' }
  ]}
  actions={[
    { label: 'Assign Visit', onClick: handleAssign },
    { label: 'View Schedule', onClick: viewSchedule }
  ]}
/>
```

#### 6. Timeline Card

**Use for**: Activity history, event logs, audit trails

```tsx
interface TimelineCardProps {
  events: Array<{
    id: string;
    timestamp: Date;
    actor: { name: string; avatar?: string };
    action: string;
    description?: string;
    icon?: React.ReactNode;
    metadata?: Record<string, any>;
  }>;
  onEventClick?: (event: any) => void;
}

<TimelineCard
  events={[
    {
      id: '1',
      timestamp: new Date(),
      actor: { name: 'Jane Smith' },
      action: 'submitted',
      description: 'OASIS assessment submitted for review',
      icon: <CheckIcon />,
      metadata: { documentId: 'DOC-123' }
    }
  ]}
  onEventClick={handleEventClick}
/>
```

## Status Badges and Priority Indicators

### Status Badge

**Status must use color + text + icon (never color alone)**

```tsx
interface StatusBadgeProps {
  status: 'draft' | 'in-progress' | 'completed' | 'submitted' | 
          'approved' | 'returned' | 'blocked' | 'signed' | 'pending';
  showIcon?: boolean;
  size?: 'sm' | 'base';
}

// Status configuration
const statusConfig = {
  draft: {
    label: 'Draft',
    color: neutral[600],
    bg: neutral[100],
    icon: <DraftIcon />
  },
  'in-progress': {
    label: 'In Progress',
    color: primary[700],
    bg: primary[50],
    icon: <InProgressIcon />
  },
  completed: {
    label: 'Completed',
    color: status.success.text,
    bg: status.success.bg,
    icon: <CheckIcon />
  },
  submitted: {
    label: 'Submitted',
    color: status.info.text,
    bg: status.info.bg,
    icon: <SubmitIcon />
  },
  approved: {
    label: 'Approved',
    color: status.success.text,
    bg: status.success.bg,
    icon: <ApproveIcon />
  },
  returned: {
    label: 'Returned',
    color: status.warning.text,
    bg: status.warning.bg,
    icon: <ReturnIcon />
  },
  blocked: {
    label: 'Blocked',
    color: status.danger.text,
    bg: status.danger.bg,
    icon: <BlockIcon />
  },
  signed: {
    label: 'Signed',
    color: status.success.text,
    bg: status.success.bg,
    icon: <SignatureIcon />
  },
  pending: {
    label: 'Pending',
    color: status.warning.text,
    bg: status.warning.bg,
    icon: <ClockIcon />
  }
};

// Usage
<StatusBadge status="in-progress" showIcon size="base" />
```

### Priority Indicator

**Priority must use color + text + icon**

```tsx
interface PriorityIndicatorProps {
  priority: 'critical' | 'high' | 'medium' | 'low';
  showLabel?: boolean;
  variant?: 'badge' | 'dot' | 'inline';
}

// Priority configuration
const priorityConfig = {
  critical: {
    label: 'Critical',
    color: status.danger.text,
    bg: status.danger.bg,
    icon: <AlertTriangleIcon />,
    dotColor: status.danger.icon
  },
  high: {
    label: 'High',
    color: status.warning.text,
    bg: status.warning.bg,
    icon: <AlertIcon />,
    dotColor: status.warning.icon
  },
  medium: {
    label: 'Medium',
    color: status.info.text,
    bg: status.info.bg,
    icon: <InfoIcon />,
    dotColor: status.info.icon
  },
  low: {
    label: 'Low',
    color: neutral[600],
    bg: neutral[100],
    icon: <MinusIcon />,
    dotColor: neutral[400]
  }
};

// Badge variant
<PriorityIndicator priority="high" variant="badge" showLabel />

// Dot variant (with text)
<PriorityIndicator priority="critical" variant="dot" showLabel />

// Inline variant
<PriorityIndicator priority="medium" variant="inline" />
```

## Timeline and Activity Patterns

### Activity Timeline

```tsx
interface ActivityTimelineProps {
  activities: Array<{
    id: string;
    timestamp: Date;
    actor: {
      name: string;
      avatar?: string;
      role?: string;
    };
    action: string;
    description?: string;
    icon?: React.ReactNode;
    quickAction?: {
      label: string;
      onClick: () => void;
    };
  }>;
  groupBy?: 'date' | 'none';
  showAvatars?: boolean;
  compact?: boolean;
}

<ActivityTimeline
  activities={[
    {
      id: '1',
      timestamp: new Date('2026-03-11T10:30:00'),
      actor: {
        name: 'Dr. Smith',
        avatar: '/avatars/smith.jpg',
        role: 'Physician'
      },
      action: 'signed',
      description: 'Plan of Care 485 signed',
      icon: <SignatureIcon />,
      quickAction: {
        label: 'View Document',
        onClick: () => viewDocument('DOC-123')
      }
    },
    {
      id: '2',
      timestamp: new Date('2026-03-11T09:15:00'),
      actor: {
        name: 'Jane Doe, RN',
        role: 'Clinician'
      },
      action: 'updated',
      description: 'Updated medication list',
      icon: <EditIcon />
    }
  ]}
  groupBy="date"
  showAvatars
/>
```

### Timeline Event Component

```tsx
function TimelineEvent({ event, showAvatar, compact }: TimelineEventProps) {
  return (
    <div style={{
      display: 'flex',
      gap: space.md,
      padding: compact ? space.sm : space.md
    }}>
      {/* Timeline Line */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: space.xs
      }}>
        {/* Icon/Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: borderRadius.full,
          backgroundColor: surface.elevated,
          border: `2px solid ${borderColor.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {showAvatar && event.actor.avatar ? (
            <img src={event.actor.avatar} alt={event.actor.name} />
          ) : (
            event.icon
          )}
        </div>
        
        {/* Connecting Line */}
        <div style={{
          width: '2px',
          flex: 1,
          backgroundColor: borderColor.subtle
        }} />
      </div>
      
      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: typography.body.size,
          color: textColor.primary,
          marginBottom: space.xs
        }}>
          <strong>{event.actor.name}</strong> {event.action} {event.description}
        </div>
        
        <div style={{
          fontSize: typography.helper.size,
          color: textColor.muted
        }}>
          {formatRelativeTime(event.timestamp)}
          {event.actor.role && ` • ${event.actor.role}`}
        </div>
        
        {event.quickAction && (
          <div style={{ marginTop: space.sm }}>
            <Button
              variant="link"
              size="sm"
              onClick={event.quickAction.onClick}
            >
              {event.quickAction.label}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Search and Command UX

### Global Search

```tsx
interface GlobalSearchProps {
  onSearch: (query: string) => Promise<SearchResults>;
  onResultSelect: (result: SearchResult) => void;
  placeholder?: string;
  debounce?: number;
}

interface SearchResults {
  patients?: Array<PatientResult>;
  admissions?: Array<AdmissionResult>;
  documents?: Array<DocumentResult>;
  caregivers?: Array<CaregiverResult>;
}

<GlobalSearch
  onSearch={async (query) => {
    const results = await searchAll(query);
    return {
      patients: results.patients,
      admissions: results.admissions,
      documents: results.documents,
      caregivers: results.caregivers
    };
  }}
  onResultSelect={handleResultSelect}
  placeholder="Search patients, admissions, documents..."
  debounce={300}
/>

// Search UI
function GlobalSearchResults({ results }: { results: SearchResults }) {
  return (
    <div>
      {results.patients && results.patients.length > 0 && (
        <SearchCategory title="Patients" icon={<PatientIcon />}>
          {results.patients.map(patient => (
            <SearchResultItem
              key={patient.id}
              title={patient.name}
              subtitle={`MRN: ${patient.mrn}`}
              metadata={`DOB: ${formatDate(patient.dob)}`}
              onClick={() => navigate(`/patient/${patient.id}`)}
            />
          ))}
        </SearchCategory>
      )}
      
      {results.admissions && results.admissions.length > 0 && (
        <SearchCategory title="Admissions" icon={<AdmissionIcon />}>
          {results.admissions.map(admission => (
            <SearchResultItem
              key={admission.id}
              title={admission.patientName}
              subtitle={`Admission Date: ${formatDate(admission.startDate)}`}
              metadata={admission.status}
              onClick={() => navigate(`/admissions/${admission.id}`)}
            />
          ))}
        </SearchCategory>
      )}
    </div>
  );
}
```

### Command Palette

```tsx
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Array<{
    id: string;
    label: string;
    category: 'navigation' | 'action' | 'search';
    icon?: React.ReactNode;
    keywords?: string[];
    action: () => void;
  }>;
}

// Keyboard shortcut to open: Cmd+K / Ctrl+K
useKeyboardShortcut({
  key: 'k',
  ctrl: true,
  callback: () => setCommandPaletteOpen(true)
});

<CommandPalette
  isOpen={commandPaletteOpen}
  onClose={() => setCommandPaletteOpen(false)}
  commands={[
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      category: 'navigation',
      icon: <HomeIcon />,
      keywords: ['home', 'main'],
      action: () => navigate('/')
    },
    {
      id: 'nav-patients',
      label: 'Go to Patients',
      category: 'navigation',
      icon: <PatientsIcon />,
      action: () => navigate('/patients')
    },
    
    // Actions
    {
      id: 'action-new-patient',
      label: 'Create New Patient',
      category: 'action',
      icon: <PlusIcon />,
      action: () => openNewPatientModal()
    },
    {
      id: 'action-new-admission',
      label: 'Create New Admission',
      category: 'action',
      icon: <PlusIcon />,
      action: () => navigate('/new-admission')
    },
    
    // Quick access to queues
    {
      id: 'queue-qa',
      label: 'Open QA Queue',
      category: 'navigation',
      keywords: ['quality', 'review'],
      action: () => navigate('/qa-workspace')
    }
  ]}
/>
```

### Search Debouncing

```tsx
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage in search
function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);
  
  return (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## Loading and Empty States

### Skeleton States

#### Table Skeleton

```tsx
function TableSkeleton({ rows = 5, columns = 4 }: SkeletonProps) {
  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: space.md,
        padding: space.md,
        borderBottom: `1px solid ${borderColor.default}`
      }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="20px" width="60%" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: space.md,
            padding: space.md,
            borderBottom: `1px solid ${borderColor.subtle}`
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" width="80%" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### Card Skeleton

```tsx
function CardSkeleton() {
  return (
    <div style={{
      backgroundColor: surface.elevated,
      borderRadius: borderRadius.medium,
      padding: space.lg,
      boxShadow: shadows.card
    }}>
      <Skeleton height="24px" width="40%" style={{ marginBottom: space.md }} />
      <Skeleton height="16px" width="100%" style={{ marginBottom: space.sm }} />
      <Skeleton height="16px" width="80%" style={{ marginBottom: space.sm }} />
      <Skeleton height="16px" width="60%" />
    </div>
  );
}
```

#### Form Skeleton

```tsx
function FormSkeleton({ fields = 5 }: { fields: number }) {
  return (
    <div>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: space.lg }}>
          <Skeleton height="14px" width="30%" style={{ marginBottom: space.sm }} />
          <Skeleton height="40px" width="100%" />
        </div>
      ))}
    </div>
  );
}
```

### Empty States

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${space.sectionLg} ${space.lg}`,
      textAlign: 'center'
    }}>
      {icon && (
        <div style={{
          width: '64px',
          height: '64px',
          marginBottom: space.lg,
          color: textColor.muted,
          opacity: 0.5
        }}>
          {icon}
        </div>
      )}
      
      <h3 style={{
        fontSize: typography.cardTitle.size,
        fontWeight: typography.cardTitle.weight,
        color: textColor.primary,
        marginBottom: space.sm
      }}>
        {title}
      </h3>
      
      <p style={{
        fontSize: typography.body.size,
        color: textColor.secondary,
        maxWidth: '400px',
        marginBottom: space.lg
      }}>
        {description}
      </p>
      
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Example usage
<EmptyState
  icon={<PatientsIcon />}
  title="No patients found"
  description="There are no patients matching your current filters. Try adjusting your search criteria or create a new patient."
  action={{
    label: 'Create New Patient',
    onClick: () => navigate('/patient/new')
  }}
/>
```

## Accessibility Rules

### 1. Color Contrast

**WCAG AA Requirements**:
- Normal text (< 18px): 4.5:1 contrast ratio
- Large text (≥ 18px): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

```tsx
// All semantic tokens meet WCAG AA standards
textColor.primary on surface.default = 16.6:1 ✅
textColor.secondary on surface.default = 7.5:1 ✅
borderColor.default on surface.default = 3.8:1 ✅
```

### 2. Keyboard Navigation

**All interactive elements must be keyboard accessible**:

```tsx
// Tab order
tabIndex={0}  // Normal tab order
tabIndex={-1} // Programmatically focusable, not in tab order

// Focus visible
<button className="focus:ring-2 focus:ring-primary-500 focus:outline-none">
  Click me
</button>

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### 3. Focus States

**All focusable elements must have visible focus indicators**:

```tsx
const focusStyles = {
  outline: 'none',
  boxShadow: focusRing.default,
  borderColor: borderColor.focus
};
```

### 4. Semantic HTML

```tsx
// ✅ DO: Use semantic headings
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// ❌ DON'T: Skip heading levels
<h1>Page Title</h1>
<h3>Subsection</h3> {/* ⚠️ Skipped h2 */}
```

### 5. ARIA Labels

```tsx
// Descriptive labels
<button aria-label="Close drawer">
  <CloseIcon />
</button>

// Form labels
<label htmlFor="patient-name">Patient Name</label>
<input id="patient-name" name="name" />

// Status announcements
<div role="status" aria-live="polite">
  Document saved successfully
</div>

// Error announcements
<div role="alert" aria-live="assertive">
  Failed to save document
</div>
```

### 6. Status Indicators

**Never use color alone**:

```tsx
// ❌ DON'T: Color only
<div style={{ color: 'red' }}>Error</div>

// ✅ DO: Color + icon + text
<div style={{ color: status.danger.text }}>
  <ErrorIcon />
  <span>Error: Document failed validation</span>
</div>
```

### 7. Screen Reader Support

```tsx
// Skip repetitive content
<nav aria-label="Main navigation">

// Landmark regions
<main>
<aside aria-label="Patient summary">
<footer>

// Hidden content for screen readers
<span className="sr-only">Required field</span>

// Hide decorative content
<div aria-hidden="true">
  <DecorativeIcon />
</div>
```

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
