# Context Display System Documentation

## Overview

The Context Display System provides three persistent levels of context that remain visible as users navigate between related modules in the healthcare platform. This ensures users always know:

1. **WHO** they're working with (Patient Context)
2. **WHICH** episode they're managing (Admission Context)
3. **WHAT** they're doing (Operational Context)

---

## Three-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│ LEVEL 1: PATIENT CONTEXT HEADER                           │
│ ─────────────────────────────────────────────────────────│
│ Patient Name, DOB, MRN, Office, Alerts, Quick Actions    │
│ ● Always visible when working with a patient              │
│ ● Remains constant when switching admissions              │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ LEVEL 2: ADMISSION CONTEXT BAR                            │
│ ─────────────────────────────────────────────────────────│
│ Admission ID, Status, Payer, Disciplines, Auth Status    │
│ ● Visible when admission selected                         │
│ ● Updates when switching between admissions               │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│ LEVEL 3: OPERATIONAL CONTEXT BAR                          │
│ ─────────────────────────────────────────────────────────│
│ Current Module, Workflow, Breadcrumbs, Actions           │
│ ● Shows current task/workflow                             │
│ ● Updates based on current page                           │
└────────────────────────────────────────────────────────────┘
```

---

## Level 1: Patient Context Header

### Purpose
Display patient demographics, alerts, and quick access to patient-related functions.

### Visual Design

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────┐                                                          │
│  │ MJ │  Mary Elizabeth Johnson            ⚠️ 3 Alerts  ⭐ 📄 ✏️│
│  └────┘  # MRN: 001234 • DOB: 01/15/1945 (81y)                 │
│          🏢 Downtown Home Health                                │
│          📞 (555) 123-4567 • ✉️ mary.johnson@email.com         │
│                                                                  │
│          📊 Active Admissions: 2 • 🕐 Last Visit: 03/05/2024   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Fields

#### **Required:**
- `mrn` - Medical Record Number
- `name` - Patient full name
- `dob` - Date of birth (ISO format)

#### **Optional:**
- `gender` - 'M' | 'F' | 'Other'
- `age` - Calculated age (auto-calculated if not provided)
- `office` - Office/branch name
- `primaryPhone` - Contact phone number
- `email` - Email address
- `address` - Full address
- `activeAdmissions` - Count of active admissions
- `lastVisit` - Date of last visit (ISO format)
- `isFavorite` - Boolean for favorite star

#### **Alerts:**
```typescript
alerts?: Array<{
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  icon?: React.ComponentType;
}>;
```

### Features

1. **Patient Avatar**
   - Displays initials in colored circle
   - Favorite star indicator (top-right)

2. **Alert System**
   - Badge showing alert count
   - Dropdown panel with full alert details
   - Color-coded by severity:
     - Critical: Red background
     - Warning: Amber background
     - Info: Blue background

3. **Quick Actions**
   - ⭐ Favorite toggle
   - 📄 View full chart
   - ✏️ Edit patient

4. **Stats Bar**
   - Active admissions count
   - Last visit date
   - (Compact mode: hidden)

### Color Scheme
```css
Background: Linear gradient blue-600 to indigo-700
Border: 4px blue-800 bottom border
Text: White
Badge: White with 20% opacity background
```

---

## Level 2: Admission Context Bar

### Purpose
Display admission-specific information including authorization status, payer, and care team.

### Visual Design

```
┌──────────────────────────────────────────────────────────────────┐
│ 📄 Admission: ADM-2024-001 ▼            [● Active]              │
│    📅 Started: 02/01/2024 • 💰 Medicare • Episode 1             │
│    👥 RN | PT | OT | MSW                                         │
│                                                                  │
│    ✓ Auth: Approved     👤 Case Manager      👁️ More            │
│      18/40 visits       Sarah Williams, RN                      │
└──────────────────────────────────────────────────────────────────┘
```

### Data Fields

#### **Required:**
- `admissionId` - Unique admission identifier
- `startDate` - Admission start date (ISO format)
- `status` - 'active' | 'pending' | 'on_hold' | 'discharged'

#### **Optional:**
- `primaryPayer` - Insurance/payer name
- `disciplines` - Array of discipline codes (RN, PT, OT, MSW, etc.)
- `caseManager` - { name, phone?, email? }
- `authorizationStatus` - 'approved' | 'pending' | 'denied' | 'expired'
- `authorizedVisits` - { used: number, total: number }
- `authorizationEndDate` - Auth expiration date
- `referralSource` - Referring entity
- `primaryDiagnosis` - Primary diagnosis description
- `episodeNumber` - Current episode number
- `daysInEpisode` - Days into current episode

### Features

1. **Status Badge**
   - Active: Green background
   - Pending: Yellow background
   - On Hold: Orange background
   - Discharged: Gray background

2. **Admission Selector**
   - Dropdown button (▼) to switch admissions
   - Triggers `onChangeAdmission` callback

3. **Disciplines Display**
   - Shows first 3 disciplines
   - "+X" badge for additional disciplines

4. **Authorization Card**
   - Icon + status label
   - Visit count progress (used/total)
   - Color-coded by status

5. **Case Manager Card**
   - Manager name and title
   - Contact info on hover/click

6. **Expandable Details**
   - "More" button (⋮) toggles details
   - Shows: Referral source, diagnosis, episode days, auth end date

### Color Scheme
```css
Background: Linear gradient indigo-50 to purple-50
Border: 2px indigo-200 bottom border
Cards: White with gray-200 border
```

---

## Level 3: Operational Context Bar

### Purpose
Display current module, workflow, and available actions for the current task.

### Visual Design

```
┌──────────────────────────────────────────────────────────────────┐
│ 🩺 Visit Documentation  [Skilled Nursing Visit]                 │
│    › Visits › Today › Visit #12345                               │
│                                      [Save Draft] [Submit]       │
└──────────────────────────────────────────────────────────────────┘
```

### Data Fields

#### **Required:**
- `module` - Current module name

#### **Optional:**
- `workflow` - Current workflow (badge)
- `breadcrumbs` - Array of { label, path? }
- `actions` - Array of action buttons

#### **Actions Structure:**
```typescript
actions?: Array<{
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  icon?: React.ComponentType;
}>;
```

### Features

1. **Module Icon**
   - Auto-selected based on module name
   - Predefined icons for common modules:
     - Visit Documentation: Stethoscope
     - Billing Review: Receipt
     - Scheduling: CalendarClock
     - Clinical Assessment: ClipboardCheck
     - Hospice Care: Heart

2. **Workflow Badge**
   - Outline badge showing sub-workflow
   - Example: "OASIS-E SOC", "Skilled Nursing Visit"

3. **Breadcrumb Navigation**
   - Clickable path to parent pages
   - Current page highlighted
   - Separator: ›

4. **Action Buttons**
   - Right-aligned
   - Configurable variants and icons
   - Common patterns:
     - Save Draft (secondary) + Submit (primary)
     - Hold (secondary) + Approve (primary)
     - Cancel (ghost) + Confirm (primary)

### Color Scheme
```css
Background: White
Border: 1px gray-200 bottom border
Icon: Blue-600
Module Name: Gray-900 (bold)
Breadcrumbs: Gray-600, active: Gray-900
```

---

## Component API

### Complete Context Display

```tsx
import { ContextDisplay } from '@/components/context/ContextDisplay';

<ContextDisplay
  patient={patientData}
  admission={admissionData}          // Optional
  operational={operationalData}
  onViewFullChart={() => {}}         // Optional
  onEditPatient={() => {}}           // Optional
  onToggleFavorite={() => {}}        // Optional
  onViewAdmission={() => {}}         // Optional
  onChangeAdmission={() => {}}       // Optional
  compact={false}                     // Optional
/>
```

### Individual Components

```tsx
import {
  PatientContextHeader,
  AdmissionContextBar,
  OperationalContextBar,
} from '@/components/context/ContextDisplay';

// Use individually
<PatientContextHeader patient={data} />
<AdmissionContextBar admission={data} />
<OperationalContextBar context={data} />
```

---

## Sticky Behavior

### Desktop Implementation

```tsx
// Patient header sticky at top
<div className="sticky top-0 z-50">
  <PatientContextHeader />
</div>

// Admission bar sticky below patient header
<div className="sticky top-[84px] z-40">
  <AdmissionContextBar />
</div>

// Operational bar sticky below admission bar
<div className="sticky top-[168px] z-30">
  <OperationalContextBar />
</div>
```

### Mobile Behavior

On mobile (< 768px):
- All context bars scroll with content (no sticky)
- Patient header uses compact mode
- Admission bar hides extended details
- Operational bar may hide breadcrumbs

---

## Use Cases

### Use Case 1: Visit Documentation

**Scenario:** Clinician documenting a skilled nursing visit

```
┌─────────────────────────────────────────────────────┐
│ PATIENT: Johnson, Mary (MRN: 001234)               │
│ ⚠️ Fall Risk Alert                                  │
├─────────────────────────────────────────────────────┤
│ ADMISSION: ADM-2024-001 [Active]                    │
│ Auth: Approved (18/40 visits)                       │
├─────────────────────────────────────────────────────┤
│ OPERATIONAL: Visit Documentation                    │
│ › Visits › Today › Visit #12345                     │
│                        [Save Draft] [Submit]        │
└─────────────────────────────────────────────────────┘
```

**Context Persistence:**
- Patient header remains visible during entire visit
- Admission bar shows auth status for visit validation
- Operational bar provides Save/Submit actions

---

### Use Case 2: Billing Review

**Scenario:** Billing specialist reviewing episode for claims submission

```
┌─────────────────────────────────────────────────────┐
│ PATIENT: Johnson, Mary (MRN: 001234)               │
│ 2 Active Admissions                                 │
├─────────────────────────────────────────────────────┤
│ ADMISSION: ADM-2024-001 ▼ [Active]                 │
│ Medicare • Episode 1 • Day 35                       │
├─────────────────────────────────────────────────────┤
│ OPERATIONAL: Billing Review                         │
│ › Billing › Ready for Billing Queue                 │
│                    [Hold] [Approve for Billing]     │
└─────────────────────────────────────────────────────┘
```

**Context Persistence:**
- Patient info constant across multiple episodes
- Admission selector (▼) to switch between episodes
- Operational actions specific to billing workflow

---

### Use Case 3: Multi-Admission Patient

**Scenario:** Case manager reviewing patient with multiple concurrent admissions

```
┌─────────────────────────────────────────────────────┐
│ PATIENT: Johnson, Mary (MRN: 001234)               │
│ Active Admissions: 2                                │
├─────────────────────────────────────────────────────┤
│ ADMISSION: ADM-2024-001 ▼ [Active]                 │
│ Home Health • Medicare                              │
├─────────────────────────────────────────────────────┤
│ ADMISSION: ADM-2024-015 ▼ [Active]                 │
│ Hospice • Medicaid                                  │
├─────────────────────────────────────────────────────┤
│ OPERATIONAL: Care Coordination                      │
│ › CareConnect › Active Cases                        │
└─────────────────────────────────────────────────────┘
```

**Key Feature:**
- Dropdown to switch between ADM-2024-001 and ADM-2024-015
- Patient header stays constant
- Admission bar updates on switch

---

## Compact Mode

### When to Use
- Mobile devices
- Tablet portrait mode
- Side-by-side views
- Secondary windows

### Changes in Compact Mode

#### Patient Header:
- Smaller avatar (size-12 vs size-16)
- Smaller text (text-xl vs text-2xl)
- Hides contact info
- Hides stats bar
- Reduces padding

#### Admission Bar:
- Hides discipline badges
- Hides case manager card
- Reduces padding
- Single-line layout

#### Operational Bar:
- No changes (already minimal)

```tsx
<ContextDisplay compact={true} />
```

---

## Responsive Breakpoints

```css
/* Desktop (≥ 1024px) */
- Full layout with all details
- Sticky positioning
- Side-by-side cards

/* Tablet (768px - 1023px) */
- Compact mode recommended
- May collapse some cards
- Vertical stacking

/* Mobile (< 768px) */
- Compact mode required
- No sticky positioning
- Hide extended details
- Touch-optimized spacing
```

---

## Alert System Deep Dive

### Alert Types

#### **Critical Alerts**
```typescript
{
  id: '1',
  type: 'critical',
  message: 'Fall risk - Recent fall 3/1/2024',
}
```
- **Color:** Red (bg-red-50, text-red-900)
- **Icon:** AlertTriangle (red-600)
- **Use:** Safety issues, urgent medical changes

#### **Warning Alerts**
```typescript
{
  id: '2',
  type: 'warning',
  message: 'Medication reconciliation needed',
}
```
- **Color:** Amber (bg-amber-50, text-amber-900)
- **Icon:** AlertTriangle (amber-600)
- **Use:** Tasks needing attention, missing info

#### **Info Alerts**
```typescript
{
  id: '3',
  type: 'info',
  message: 'Annual wellness visit due this month',
}
```
- **Color:** Blue (bg-blue-50, text-blue-900)
- **Icon:** AlertTriangle (blue-600)
- **Use:** Reminders, informational notices

### Alert Badge

```
┌──────────────────────┐
│ ⚠️ 3 Alerts          │ ← Clickable button
└──────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Patient Alerts                  │
├─────────────────────────────────┤
│ ⚠️ Fall risk - Recent fall...   │
│ ⚠️ Medication reconciliation... │
│ ℹ️ Annual wellness visit...     │
└─────────────────────────────────┘
```

---

## Integration Examples

### Example 1: Visit Documentation Page

```tsx
import { ContextDisplay } from '@/components/context/ContextDisplay';

function VisitDocumentationPage() {
  const patient = usePatientData(mrn);
  const admission = useAdmissionData(admissionId);

  return (
    <div className="flex flex-col h-screen">
      <ContextDisplay
        patient={patient}
        admission={admission}
        operational={{
          module: 'Visit Documentation',
          workflow: 'Skilled Nursing Visit',
          breadcrumbs: [
            { label: 'Visits', path: '/visits' },
            { label: 'Today', path: '/visits/today' },
            { label: `Visit #${visitId}` },
          ],
          actions: [
            {
              label: 'Save Draft',
              onClick: handleSaveDraft,
              variant: 'secondary',
            },
            {
              label: 'Submit',
              onClick: handleSubmit,
              variant: 'default',
            },
          ],
        }}
        onViewFullChart={() => navigate(`/patient/${mrn}/chart`)}
        onEditPatient={() => setEditModalOpen(true)}
        onToggleFavorite={handleToggleFavorite}
        onViewAdmission={() => navigate(`/admissions/${admissionId}`)}
        onChangeAdmission={() => setAdmissionSelectorOpen(true)}
      />
      
      {/* Page content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Visit form */}
      </div>
    </div>
  );
}
```

### Example 2: Billing Workspace

```tsx
function BillingWorkspacePage() {
  const patient = usePatientData(mrn);
  const admission = useAdmissionData(admissionId);

  return (
    <div className="flex flex-col h-screen">
      <ContextDisplay
        patient={patient}
        admission={admission}
        operational={{
          module: 'Billing Review',
          workflow: 'Episode Validation',
          breadcrumbs: [
            { label: 'Billing', path: '/billing' },
            { label: 'Ready for Billing Queue' },
          ],
          actions: [
            {
              label: 'Hold',
              onClick: handleHold,
              variant: 'secondary',
            },
            {
              label: 'Approve for Billing',
              onClick: handleApprove,
              variant: 'default',
            },
          ],
        }}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {/* Billing details */}
      </div>
    </div>
  );
}
```

---

## Accessibility

### ARIA Labels

```html
<header role="banner" aria-label="Patient context">
  <h2 id="patient-name">Johnson, Mary</h2>
  <button aria-label="View patient alerts" aria-describedby="alert-count">
    <span id="alert-count">3 Alerts</span>
  </button>
</header>

<div role="region" aria-label="Admission context">
  <button aria-label="Change admission" aria-haspopup="true">
    Admission: ADM-2024-001
  </button>
</div>

<nav role="navigation" aria-label="Operational context">
  <ol aria-label="Breadcrumb">
    <li><a href="/visits">Visits</a></li>
    <li aria-current="page">Today</li>
  </ol>
</nav>
```

### Keyboard Navigation

- **Tab:** Navigate through actions and buttons
- **Enter/Space:** Activate buttons
- **Escape:** Close alert dropdown
- **Arrow keys:** Navigate breadcrumbs (planned)

---

## Best Practices

### ✅ DO

- Keep patient context visible at all times
- Update admission context when switching episodes
- Provide relevant actions in operational context
- Use appropriate alert severity
- Show auth status prominently
- Enable favorite toggle for frequently accessed patients
- Provide clear breadcrumb trail

### ❌ DON'T

- Hide patient context mid-workflow
- Show too many alerts (combine if possible)
- Overload operational actions (max 3-4 buttons)
- Use critical alerts for non-urgent items
- Change patient header when switching admissions
- Forget to update operational context on page change

---

## Summary

The Context Display System provides:

✅ **Three Persistent Levels** of context  
✅ **Patient-Level Continuity** across admissions  
✅ **Admission-Specific Updates** on context switch  
✅ **Operational Clarity** with module and actions  
✅ **Alert System** with color-coded severity  
✅ **Authorization Tracking** front and center  
✅ **Quick Actions** for common tasks  
✅ **Responsive Design** with compact mode  
✅ **Sticky Positioning** on desktop  
✅ **Full Accessibility** support  

**Result:** Healthcare staff always know who they're working with, which episode they're managing, and what they're doing—reducing errors and improving workflow efficiency.
