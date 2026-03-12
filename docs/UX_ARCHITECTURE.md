# Healthcare Platform UX Architecture

## Executive Summary

This document defines the **5-level context hierarchy** and UX architecture for a modern home health and hospice platform. The architecture ensures users always know their operational context and eliminates confusion between patient-level and admission-level information.

---

## Context Hierarchy Model

### 5-Level Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1: WORKSPACE                                          │
│ ─────────────────────────────────────────────────────────── │
│ System-wide operational context                             │
│ Examples: Clinical Dashboard, Billing Workspace, Scheduling │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Level 2: PATIENT                                            │
│ ─────────────────────────────────────────────────────────── │
│ Individual person context (persistent across admissions)    │
│ Includes: Demographics, Medical History, Contacts          │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Level 3: ADMISSION                                          │
│ ─────────────────────────────────────────────────────────── │
│ Service episode context (one patient can have multiple)     │
│ Includes: Authorization, Care Team, Orders, Payer Info     │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Level 4: EPISODE OF CARE                                    │
│ ─────────────────────────────────────────────────────────── │
│ 60-day certification period (within an admission)           │
│ Includes: Certification Dates, OASIS, Recertification      │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ Level 5: VISIT / DOCUMENTATION                              │
│ ─────────────────────────────────────────────────────────── │
│ Individual service event or document                        │
│ Includes: Visit Notes, Assessments, Care Plans             │
└─────────────────────────────────────────────────────────────┘
```

---

## Visual Design System

### 1. Context Indicator (Breadcrumbs)

**Location:** Top of every page  
**Purpose:** Show current location in hierarchy  
**Design:**

```
┌────────────────────────────────────────────────────────────────┐
│ 🏠 Clinical Dashboard > 👤 Johnson, Mary (MRN: 001234) >      │
│ 💼 Admission ADM-2024-001 > 📅 Episode 1 (25d remaining)      │
│                                           [● Active] ───────→  │
└────────────────────────────────────────────────────────────────┘
```

**Features:**
- Each level is clickable to navigate up the hierarchy
- Current level is highlighted in bold blue
- Status badge shows admission state
- Icons provide quick visual recognition

---

### 2. Patient Header (Level 2)

**Location:** Below context indicator when in patient context  
**Purpose:** Display persistent patient information  
**Design:**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   ┌──┐                                                         │
│   │MJ│  Mary Johnson                        [Chart] [Schedule] │
│   └──┘  MRN: 001234 • DOB: 01/15/1945 (81y) • [ACTIVE]       │
│         Primary Dx: CHF, Diabetes Type 2                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Color:** Blue gradient (`from-blue-600 to-indigo-600`)  
**Text:** White for high contrast  
**Behavior:** 
- Sticky/fixed when scrolling (optional)
- Remains visible when switching between admissions
- Quick actions for common tasks

---

### 3. Admission Context Bar (Level 3)

**Location:** Below Patient Header when in admission context  
**Purpose:** Show current admission details and episode progress  
**Design:**

```
┌────────────────────────────────────────────────────────────────┐
│ 💼 Admission: ADM-2024-001 ▼              Episode Progress    │
│    Started: 02/01/2024 • Payer: Medicare  Day 35 of 60        │
│    [● Active]                              ████████░░ 58%      │
└────────────────────────────────────────────────────────────────┘
```

**Color:** Indigo/Purple gradient (`from-indigo-50 to-purple-50`)  
**Features:**
- Admission selector dropdown (▼)
- Real-time episode progress bar
- Status indicator
- Key admission metadata

---

### 4. Episode Dashboard Widget (Level 4)

**Location:** Sidebar or main content area  
**Purpose:** Show detailed episode information  
**Design:**

```
┌─────────────────────────────────────┐
│ 📅 Episode 1          [Active]      │
│ ────────────────────────────────── │
│ Start:     Feb 1, 2024              │
│ End:       Apr 1, 2024              │
│ Days Remaining: 25 days             │
│                                     │
│ Progress           58%              │
│ ████████████░░░░░░░░                │
└─────────────────────────────────────┘
```

**Color Coding:**
- Green: > 14 days remaining
- Amber: 8-14 days remaining  
- Red: ≤ 7 days remaining

---

### 5. Visit Context (Level 5)

**Location:** Within documentation screens  
**Purpose:** Show current visit/document details  
**Design:**

```
┌────────────────────────────────────────────────────────────────┐
│ 🩺 Visit: VST-2024-0123                                        │
│ ──────────────────────────────────────────────────────────────│
│ Type: Skilled Nursing • Date: 03/07/2024 • Status: Scheduled │
│ Clinician: Jennifer Lee, RN                                    │
└────────────────────────────────────────────────────────────────┘
```

---

## Information Architecture Rules

### Rule 1: Patient-Level Data (Persistent)

**These remain constant regardless of admission context:**

- Demographics (Name, DOB, MRN, Gender)
- Contact Information (Phone, Address, Emergency Contacts)
- Medical History (Allergies, Past Diagnoses, Medications)
- Insurance Information (Primary across all episodes)
- Advance Directives
- Family/Caregiver Information

**Storage Location:** Patient table  
**Navigation:** Accessible from patient context  
**UI Indicator:** Patient Header (always visible)

---

### Rule 2: Admission-Level Data (Context-Specific)

**These change when switching between admissions:**

- Authorization Details (Visit count, date ranges)
- Care Team (Assigned clinicians for this admission)
- Orders (Specific to this service episode)
- Plan of Care (Admission-specific goals)
- Payer Information (May differ per admission)
- Referral Source
- Admission Diagnoses (ICD codes for this episode)
- Discharge Planning

**Storage Location:** Admission table  
**Navigation:** Updates when admission context changes  
**UI Indicator:** Admission Context Bar

---

### Rule 3: Episode-Level Data (60-Day Periods)

**These are tied to certification periods within an admission:**

- OASIS Assessments (SOC, Recert, Discharge)
- Certification/Recertification Documents
- Episode Start/End Dates
- Physician Orders for this period
- Episode-specific billing records

**Storage Location:** Episode table (linked to admission)  
**Navigation:** Episode selector within admission  
**UI Indicator:** Episode Dashboard Widget

---

### Rule 4: Visit-Level Data (Individual Events)

**These are specific to single service visits:**

- Visit Notes
- Vital Signs from that visit
- Tasks completed during visit
- Mileage for that visit
- Time in/out
- Visit-specific observations

**Storage Location:** Visit table (linked to admission)  
**Navigation:** Visit selector or timeline  
**UI Indicator:** Visit Context Card

---

## Navigation Patterns

### Pattern 1: Top-Down Navigation

**Use Case:** Starting from workspace, drilling into details

```
Dashboard → Patient List → Patient Chart → Admission → Visit
```

**UX Implementation:**
1. Click patient name from list
2. Patient Header appears (sticky)
3. Select admission from dropdown or list
4. Admission Context Bar appears
5. Select visit from schedule
6. Visit Context Card appears

---

### Pattern 2: Context Switching

**Use Case:** Changing admission while viewing patient

```
Patient → [Admission A] → [Admission B]
```

**UX Implementation:**
1. Click admission dropdown in Context Bar
2. Modal/dropdown shows all admissions for patient
3. Select different admission
4. **Patient Header remains** (no refresh)
5. **Admission Context Bar updates** with new admission
6. Content area refreshes with new admission data

**Critical:** Patient-level sidebar/info remains unchanged

---

### Pattern 3: Bottom-Up Navigation

**Use Case:** Accessing patient from a task or alert

```
Alert → Visit → Admission → Patient
```

**UX Implementation:**
1. Click notification/alert about a visit
2. All context indicators appear automatically
3. Breadcrumbs show full path
4. User can navigate up hierarchy via breadcrumbs

---

### Pattern 4: Cross-Context Navigation

**Use Case:** Jumping between contexts at same level

```
Admission A, Visit 1 → Admission A, Visit 2
```

**UX Implementation:**
1. Visit selector (dropdown or timeline)
2. Patient Header + Admission Bar remain stable
3. Only Visit Context updates
4. Smooth transition with loading state

---

## Component Library

### Core Context Components

```typescript
// 1. Context Indicator (Breadcrumbs)
<ContextIndicator context={hierarchy} />

// 2. Patient Header
<PatientHeader patient={patientData} />

// 3. Admission Context Bar
<AdmissionContextBar admission={admissionData} patient={patientData} />

// 4. Episode Dashboard
<EpisodeDashboard episode={episodeData} />

// 5. Context-Aware Layout Wrapper
<ContextAwareLayout context={hierarchy}>
  {children}
</ContextAwareLayout>
```

### Usage Example

```tsx
function PatientChartPage() {
  const context: ContextHierarchy = {
    workspace: { id: 'clinical', name: 'Clinical Dashboard', type: 'clinical' },
    patient: { mrn: '001234', name: 'Johnson, Mary', dob: '1945-01-15', status: 'active' },
    admission: { 
      admissionId: 'ADM-2024-001', 
      admissionDate: '2024-02-01',
      status: 'active',
      type: 'home_health',
      daysInEpisode: 35,
      totalEpisodeDays: 60
    },
    episode: {
      episodeNumber: 1,
      startDate: '2024-02-01',
      endDate: '2024-04-01',
      daysRemaining: 25,
      status: 'active'
    }
  };

  return (
    <ContextAwareLayout context={context}>
      {/* Page content here */}
    </ContextAwareLayout>
  );
}
```

---

## Context Switching Scenarios

### Scenario 1: Viewing Multiple Admissions

**Context:** Patient has 3 admissions (2 discharged, 1 active)

```
Patient: Johnson, Mary (MRN: 001234)
├─ Admission 1 (Discharged 2023-12-15)
├─ Admission 2 (Discharged 2024-05-20)
└─ Admission 3 (Active, current)
```

**UX Behavior:**
- Patient Header shows patient info (constant)
- Admission dropdown shows all 3 admissions
- Selecting different admission updates:
  - Admission Context Bar
  - Episode information
  - Care team
  - Orders
  - Visit history
- Does NOT update:
  - Patient demographics
  - Patient contacts
  - Medical history

---

### Scenario 2: Multiple Episodes in One Admission

**Context:** Admission spans 120 days (2 episodes)

```
Admission: ADM-2024-001
├─ Episode 1 (Days 1-60) [Complete]
└─ Episode 2 (Days 61-120) [Active]
```

**UX Behavior:**
- Episode selector in sidebar or tabs
- Switch between episodes to view:
  - Different OASIS assessments
  - Different certifications
  - Visits grouped by episode
- Admission-level data stays constant:
  - Care team
  - Overall orders
  - Admission diagnoses

---

### Scenario 3: Visit Documentation

**Context:** Clinician documenting a visit

```
Current Context:
Workspace: Clinical Dashboard
Patient: Johnson, Mary
Admission: ADM-2024-001
Episode: Episode 1
Visit: VST-2024-0123 (Today's visit)
```

**UX Behavior:**
- All 5 levels visible in breadcrumbs
- Patient Header locked at top
- Admission Bar shows episode progress
- Visit Context shows visit details
- Can click breadcrumbs to navigate up:
  - Click "Episode 1" → Episode overview
  - Click "Admission" → Admission dashboard
  - Click "Patient" → Patient chart

---

## Mobile Considerations

### Responsive Context Display

**Desktop (≥ 1024px):**
- Full breadcrumbs visible
- Patient Header expanded
- Admission Bar with full details
- Side-by-side layouts

**Tablet (768px - 1023px):**
- Abbreviated breadcrumbs
- Patient Header compact
- Admission Bar single line
- Stacked layouts

**Mobile (< 768px):**
- Hamburger menu for breadcrumbs
- Patient Header minimal (name + MRN only)
- Admission Bar collapsible
- Vertical layouts only
- Floating context button (bottom-right)

---

## Context Persistence

### Session State Management

**Local Storage Keys:**
```
- current_workspace
- current_patient_mrn
- current_admission_id
- current_episode_number
- current_visit_id
```

**Behavior:**
- Save context on every navigation
- Restore context on page reload
- Clear on logout
- Validate context still exists on restore

---

## Error States

### Context Not Found

**Scenario:** User navigates to admission that doesn't exist

**UX Response:**
```
┌────────────────────────────────────────┐
│ ⚠️ Admission Not Found                 │
│ ─────────────────────────────────────  │
│ The admission you're looking for       │
│ doesn't exist or you don't have        │
│ permission to view it.                 │
│                                        │
│  [Back to Patient Chart]               │
└────────────────────────────────────────┘
```

---

### Context Mismatch

**Scenario:** Visit doesn't belong to current admission

**UX Response:**
- Show warning banner
- Offer to switch to correct admission
- Maintain data integrity

---

## Accessibility

### ARIA Labels

```html
<nav aria-label="Context breadcrumbs">
  <ol>
    <li><a href="/">Workspace: Clinical Dashboard</a></li>
    <li><a href="/patient/001234">Patient: Johnson, Mary</a></li>
    <li aria-current="page">Admission: ADM-2024-001</li>
  </ol>
</nav>
```

### Keyboard Navigation

- Tab through breadcrumbs
- Enter to activate
- Escape to close dropdowns
- Arrow keys for dropdown navigation

---

## Performance Optimization

### Context Loading Strategy

1. **Eager Load:** Patient + Current Admission
2. **Lazy Load:** Other admissions (on dropdown open)
3. **Cache:** Keep 3 most recent contexts in memory
4. **Prefetch:** Next likely context (e.g., next visit)

---

## Summary

This UX architecture ensures:

✅ Users always know their operational context  
✅ Clear visual hierarchy with 5 levels  
✅ Patient info persists across admission switches  
✅ Admission info updates when context changes  
✅ No confusion between patient and admission data  
✅ Intuitive navigation up and down the hierarchy  
✅ Responsive design for all devices  
✅ Accessible and keyboard-friendly  
✅ Performance-optimized context switching  

**Result:** A modern, healthcare-grade UX that supports complex operational workflows while maintaining clarity and ease of use.
