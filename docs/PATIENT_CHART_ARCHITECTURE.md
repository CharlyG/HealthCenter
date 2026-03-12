# Patient Chart Architecture Documentation

## Overview

The Patient Chart Architecture provides a **two-tier navigation system** that clearly separates:

1. **Patient-Level Data** - Constant across all admissions
2. **Admission-Level Workflows** - Updates when switching admissions

This architecture prevents confusion about data scope and ensures users always know which admission context they're working in.

---

## Core Philosophy

### The Problem

Traditional patient charts often mix patient-level and admission-level data without clear boundaries, leading to:

❌ Confusion about data scope ("Is this for all admissions or just this one?")  
❌ Incorrect assumptions about data context  
❌ Manual checking of which admission is selected  
❌ Difficulty navigating between multiple admissions

### The Solution

**Clear Architectural Separation:**

```
┌─────────────────────────────────────┐
│ PATIENT-LEVEL DATA                  │
│ ─────────────────────────────────── │
│ • Overview                          │
│ • Demographics                      │
│ • Locations                         │
│ • Patient Documents                 │
│ • Referral History                  │
│                                     │
│ ✓ Remains CONSTANT when switching  │
│   admissions                        │
│ ✓ Shows ALL data across admissions │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ADMISSION SELECTOR                  │
│ ─────────────────────────────────── │
│ Selected: ADM-2024-001  [Change ▼] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ADMISSION-LEVEL WORKFLOWS           │
│ ─────────────────────────────────── │
│ • Admission Overview                │
│ • Visits                            │
│ • Clinical Documentation            │
│ • Orders                            │
│ • Assessments                       │
│ • Scheduling                        │
│ • Billing                           │
│ • Care Team                         │
│ • Hospice                           │
│                                     │
│ ↻ UPDATES AUTOMATICALLY when        │
│   switching admissions              │
│ ↻ Shows data for SELECTED admission │
│   only                              │
└─────────────────────────────────────┘
```

---

## Two-Tier Structure

### Tier 1: Patient-Level Sections (5 sections)

#### **1. Overview**
- **Purpose:** High-level patient summary
- **Data Scope:** All admissions aggregated
- **Key Information:**
  - Patient demographics snapshot
  - All active admissions
  - Recent activity across admissions
  - High-risk alerts
  - Contact information

#### **2. Demographics**
- **Purpose:** Patient personal information
- **Data Scope:** Patient-level (constant)
- **Key Information:**
  - Full name, DOB, gender
  - Contact details (phone, email)
  - Emergency contacts
  - Primary language
  - Ethnicity/race
  - Insurance information (patient-level)

#### **3. Locations**
- **Purpose:** Patient addresses and service locations
- **Data Scope:** Patient-level (constant)
- **Key Information:**
  - Primary residence
  - Alternate addresses
  - GPS coordinates
  - Directions/access notes
  - Service territory

#### **4. Patient Documents**
- **Purpose:** Patient-level documentation
- **Data Scope:** All admissions
- **Key Information:**
  - Advance directives
  - Photo ID copies
  - Insurance cards
  - Consent forms (patient-level)
  - Medical history documents

#### **5. Referral History**
- **Purpose:** All referrals for this patient
- **Data Scope:** All admissions
- **Key Information:**
  - All referral sources
  - Referral dates
  - Admission outcomes
  - Referral source relationships

---

### Tier 2: Admission-Level Sections (9 sections)

#### **1. Admission Overview**
- **Purpose:** Summary of selected admission
- **Data Scope:** Selected admission only
- **Key Information:**
  - Admission dates
  - Status and phase
  - Primary diagnosis
  - Payer information
  - Episode timeline
  - Key dates (SOC, recert, etc.)

#### **2. Visits**
- **Purpose:** Visit history and scheduling
- **Data Scope:** Selected admission only
- **Key Information:**
  - Completed visits list
  - Scheduled visits
  - Visit types (RN, PT, OT, MSW)
  - Visit frequencies
  - Clinician assignments

#### **3. Clinical Documentation**
- **Purpose:** Clinical notes and documentation
- **Data Scope:** Selected admission only
- **Key Information:**
  - Visit notes
  - Progress notes
  - Clinical narratives
  - Documentation status
  - Pending signatures

#### **4. Orders**
- **Purpose:** Physician orders and medications
- **Data Scope:** Selected admission only
- **Key Information:**
  - Active orders
  - Medication list
  - DME orders
  - Treatment plans
  - Order changes history

#### **5. Assessments**
- **Purpose:** Clinical assessments
- **Data Scope:** Selected admission only
- **Key Information:**
  - OASIS assessments (SOC, Recert, DC)
  - Functional assessments
  - Pain assessments
  - Fall risk assessments
  - Assessment due dates

#### **6. Scheduling**
- **Purpose:** Visit scheduling for admission
- **Data Scope:** Selected admission only
- **Key Information:**
  - Scheduled visits calendar
  - Frequency requirements
  - Clinician assignments
  - Scheduling conflicts
  - Next visits due

#### **7. Billing**
- **Purpose:** Billing and claims
- **Data Scope:** Selected admission only
- **Key Information:**
  - Episode billing status
  - RAP/Final claim status
  - Visit counts
  - Billing holds
  - Reimbursement tracking

#### **8. Care Team**
- **Purpose:** Care team members
- **Data Scope:** Selected admission only
- **Key Information:**
  - Assigned clinicians
  - Case manager
  - Physician
  - Care team roles
  - Communication logs

#### **9. Hospice**
- **Purpose:** Hospice-specific workflows
- **Data Scope:** Selected admission only (hospice only)
- **Key Information:**
  - Level of care
  - IDG meeting notes
  - Bereavement contacts
  - Hospice certifications
  - Revocation/discharge details

---

## Admission Selector

### Purpose

Central control for switching between patient admissions. When changed, **all admission-level sections update automatically**.

### Visual Design

```
┌────────────────────────────────────────┐
│ SELECTED ADMISSION                     │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ ADM-2024-001            [● Active] │ │
│ │ Medicare • Episode 1               │ │
│ │                              [▼]   │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [Click to open dropdown]               │
│                                        │
│ ▼ DROPDOWN MENU                        │
│ ┌────────────────────────────────────┐ │
│ │ ● ADM-2024-001        [Active]    │ │ ← Selected
│ │   02/01/2024                       │ │
│ ├────────────────────────────────────┤ │
│ │   ADM-2024-015        [Discharged]│ │
│ │   01/15/2024 - 03/15/2024         │ │
│ ├────────────────────────────────────┤ │
│ │   ADM-2023-085        [Discharged]│ │
│ │   10/01/2023 - 12/15/2023         │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### Behavior

1. **Displays:**
   - Admission ID
   - Status badge (Active/Discharged/Pending)
   - Primary payer
   - Episode number
   - Date range

2. **On Selection:**
   - Patient-level sections: **No change**
   - Admission-level sections: **Update immediately** with new admission data
   - URL updates (optional): `/patient/:patientId/chart/:admissionId`

3. **Visual Feedback:**
   - Selected admission highlighted
   - Status badge color-coded
   - Dropdown closes after selection

---

## Data Update Flow

### Switching Admissions

```
User clicks admission selector
         ↓
Selects different admission (e.g., ADM-2024-015)
         ↓
┌─────────────────────────────────────────┐
│ WHAT HAPPENS?                           │
├─────────────────────────────────────────┤
│ ✓ Patient-Level Sections:               │
│   → NO CHANGE                           │
│   → Demographics still show same data   │
│   → Locations still show same data      │
│                                         │
│ ↻ Admission-Level Sections:             │
│   → UPDATE AUTOMATICALLY                │
│   → Visits now show ADM-2024-015 visits│
│   → Billing shows ADM-2024-015 status  │
│   → All admission sections reload      │
└─────────────────────────────────────────┘
```

### Implementation Pattern

```typescript
// When admission changes
function handleAdmissionChange(newAdmissionId: string) {
  // 1. Update state
  setSelectedAdmission(newAdmissionId);
  
  // 2. Patient-level sections: No API calls needed
  //    (data already loaded, remains constant)
  
  // 3. Admission-level sections: Fetch new data
  fetchVisits(newAdmissionId);
  fetchClinicalDocs(newAdmissionId);
  fetchOrders(newAdmissionId);
  fetchAssessments(newAdmissionId);
  fetchBilling(newAdmissionId);
  fetchCareTeam(newAdmissionId);
  
  // 4. UI updates automatically via state change
}
```

---

## Navigation Component

### Structure

```
┌──────────────────────────────────┐
│ 👤 Johnson, Mary                 │ ← Patient Header
│    MRN: 001234 • DOB: 01/15/45  │
├──────────────────────────────────┤
│ ▼ PATIENT DATA                   │ ← Section Group
│   Constant across admissions     │
│                                  │
│   □ Overview                     │ ← Nav Items
│   □ Demographics                 │
│   □ Locations                    │
│   □ Patient Documents            │
│   □ Referral History             │
├──────────────────────────────────┤
│ [ADMISSION SELECTOR]             │ ← Admission Control
│   ADM-2024-001 [Active] ▼       │
├──────────────────────────────────┤
│ ▼ ADMISSION WORKFLOWS            │ ← Section Group
│   Updates when switching         │
│                                  │
│   □ Admission Overview           │ ← Nav Items
│   □ Visits              [12]     │   (with badges)
│   □ Clinical Docs       [3]      │
│   □ Orders                       │
│   □ Assessments         [1]      │
│   □ Scheduling                   │
│   □ Billing             [2]      │
│   □ Care Team                    │
│   □ Hospice                      │
└──────────────────────────────────┘
```

### Visual Indicators

#### **Patient-Level Section:**
```
┌────────────────────────────────┐
│ 👤 Demographics                │
│    [Patient-Level Data]        │ ← Blue badge
└────────────────────────────────┘
```

#### **Admission-Level Section:**
```
┌────────────────────────────────┐
│ 🩺 Visits            [12]      │
│    [Admission-Level Workflow]  │ ← Indigo badge
│    [ADM-2024-001]              │ ← Admission ID
└────────────────────────────────┘
```

---

## Use Cases

### Use Case 1: Clinician Reviewing Patient Before Visit

**Scenario:** RN preparing for visit with patient

```
Step 1: Open Patient Chart
  → Lands on Overview (patient-level)
  → Sees all active admissions: 2

Step 2: Review Demographics
  → Still patient-level
  → Reviews contact info, allergies
  → Data constant across admissions

Step 3: Select Current Admission
  → Opens admission selector
  → Selects ADM-2024-001 (active home health)

Step 4: Review Visits
  → NOW admission-level
  → Sees only ADM-2024-001 visits
  → Last visit: 3 days ago

Step 5: Review Clinical Documentation
  → Admission-level
  → Sees recent progress notes for ADM-2024-001

Step 6: Review Orders
  → Admission-level
  → Sees current medication list for ADM-2024-001

Result: Clear understanding of current admission without confusion about data scope.
```

---

### Use Case 2: Billing Specialist Reviewing Episodes

**Scenario:** Billing specialist preparing claims for multiple episodes

```
Step 1: Open Patient Chart
  → Overview shows 3 admissions total

Step 2: Select First Episode
  → Selects ADM-2024-015 (discharged)

Step 3: Review Billing Section
  → Admission-level: Shows ADM-2024-015 data
  → Episode 2, 60 days, ready for billing

Step 4: Check Visit Count
  → Visits section: Shows 18 visits for ADM-2024-015

Step 5: Verify Assessments
  → Assessments section: Shows OASIS SOC, Recert, DC for ADM-2024-015

Step 6: Switch to Second Episode
  → Selects ADM-2023-085 (discharged)
  → Billing, Visits, Assessments ALL UPDATE
  → Now showing ADM-2023-085 data

Step 7: Patient Info Unchanged
  → Demographics still show same patient info
  → No need to re-navigate

Result: Efficient review of multiple episodes with clear data context.
```

---

### Use Case 3: Multi-Admission Patient (Concurrent Episodes)

**Scenario:** Case manager reviewing patient with multiple concurrent admissions

```
Step 1: Open Patient Chart
  → Overview shows 2 active admissions:
    - ADM-2024-001 (Home Health)
    - ADM-2024-050 (Hospice)

Step 2: Review Referral History
  → Patient-level: All referrals across both admissions

Step 3: Switch to Home Health Admission
  → Selects ADM-2024-001
  → Visits: Shows home health visits
  → Care Team: Shows home health clinicians

Step 4: Switch to Hospice Admission
  → Selects ADM-2024-050
  → Visits: NOW shows hospice visits
  → Care Team: NOW shows hospice team
  → Hospice section: Shows level of care

Step 5: Patient Data Always Accessible
  → Demographics: Same throughout
  → Locations: Same throughout
  → No re-navigation needed

Result: Seamless management of concurrent episodes with clear separation.
```

---

## Component API

### Complete Layout

```tsx
import { PatientChartLayout } from '@/components/patient-chart/PatientChartArchitecture';

const patientData = {
  patientId: 'PT-001234',
  name: 'Johnson, Mary',
  mrn: '001234',
  dob: '1945-01-15',
  selectedAdmissionId: 'ADM-2024-001',
  admissions: [
    {
      admissionId: 'ADM-2024-001',
      startDate: '2024-02-01',
      status: 'active',
      primaryPayer: 'Medicare',
      type: 'home_health',
      episodeNumber: 1,
    },
    // ... more admissions
  ],
};

<PatientChartLayout
  patientData={patientData}
  currentSection="overview"
  onSectionChange={(section) => console.log('Section:', section)}
  onAdmissionChange={(admissionId) => console.log('Admission:', admissionId)}
>
  {/* Optional: Custom section content */}
</PatientChartLayout>
```

### Navigation Only

```tsx
import { PatientChartNavigation } from '@/components/patient-chart/PatientChartArchitecture';

<PatientChartNavigation
  patientData={patientData}
  currentSection="visits"
  onSectionChange={handleSectionChange}
  onAdmissionChange={handleAdmissionChange}
/>
```

### Section Content

```tsx
import { SectionContent } from '@/components/patient-chart/PatientChartArchitecture';

<SectionContent
  section="visits"
  patientData={patientData}
  admissionId={selectedAdmissionId}
/>
```

---

## Responsive Behavior

### Desktop (≥ 1024px)

```
┌─────────────┬──────────────────────┐
│             │                      │
│ Navigation  │  Section Content     │
│ Sidebar     │                      │
│ (320px)     │  (Flexible width)    │
│             │                      │
└─────────────┴──────────────────────┘
```

### Tablet (768-1023px)

```
┌─────────────┬──────────────────────┐
│             │                      │
│ Navigation  │  Section Content     │
│ Sidebar     │                      │
│ (280px)     │  (Flexible)          │
│             │                      │
└─────────────┴──────────────────────┘
```

### Mobile (< 768px)

```
┌────────────────────────────────────┐
│ [☰] Patient Chart                  │ ← Hamburger menu
├────────────────────────────────────┤
│                                    │
│  Section Content (Full width)      │
│                                    │
└────────────────────────────────────┘

[Tap ☰ to open navigation overlay]
```

---

## Best Practices

### ✅ DO

- Keep patient-level sections focused on patient data only
- Update ALL admission-level sections when admission changes
- Provide visual indicators for section tier (patient vs admission)
- Show selected admission ID in admission-level section headers
- Allow users to switch admissions without losing navigation context
- Show admission status (active/discharged) clearly
- Aggregate patient-level data across all admissions
- Use badges to indicate pending items per admission

### ❌ DON'T

- Mix patient-level and admission-level data in same section
- Show admission-specific data in patient-level sections
- Forget to update admission-level sections when admission changes
- Hide which admission is currently selected
- Require users to navigate away from chart to switch admissions
- Show all admissions' data in admission-level sections
- Update patient-level sections when admission changes

---

## Performance Considerations

### Data Loading Strategy

```typescript
// On initial page load
async function loadPatientChart(patientId: string) {
  // 1. Load patient-level data (once)
  const patientData = await fetchPatient(patientId);
  const demographics = await fetchDemographics(patientId);
  const locations = await fetchLocations(patientId);
  const referrals = await fetchReferrals(patientId); // All admissions
  
  // 2. Load admission list
  const admissions = await fetchAdmissions(patientId);
  
  // 3. Select most recent active admission
  const activeAdmission = admissions.find(a => a.status === 'active') 
    || admissions[0];
  
  // 4. Load admission-level data for selected admission
  await loadAdmissionData(activeAdmission.admissionId);
}

// When admission changes
async function loadAdmissionData(admissionId: string) {
  // Only fetch admission-level data
  await Promise.all([
    fetchVisits(admissionId),
    fetchClinicalDocs(admissionId),
    fetchOrders(admissionId),
    fetchAssessments(admissionId),
    fetchBilling(admissionId),
    fetchCareTeam(admissionId),
  ]);
}
```

### Caching Strategy

```typescript
// Cache patient-level data (rarely changes)
const patientCache = new Map();

// Cache admission-level data per admission
const admissionCache = new Map();

// On admission switch, check cache first
function switchAdmission(admissionId: string) {
  if (admissionCache.has(admissionId)) {
    // Use cached data
    setAdmissionData(admissionCache.get(admissionId));
  } else {
    // Fetch and cache
    loadAdmissionData(admissionId).then(data => {
      admissionCache.set(admissionId, data);
    });
  }
}
```

---

## Summary

The Patient Chart Architecture provides:

✅ **Clear Tier Separation** - 5 patient-level + 9 admission-level sections  
✅ **Admission Selector** - Central control for switching admissions  
✅ **Automatic Updates** - Admission sections update on selection  
✅ **Visual Indicators** - Clear badges showing data tier  
✅ **Constant Patient Data** - Demographics never change  
✅ **Scoped Admission Data** - Only selected admission data shown  
✅ **Multi-Admission Support** - Easy switching between episodes  
✅ **Responsive Design** - Works on all devices  
✅ **Type-Safe** - Full TypeScript support  
✅ **Production-Ready** - Complete implementation  

**Result:** Healthcare staff have clear context about data scope—they always know whether they're viewing patient-level information (constant across admissions) or admission-specific workflows (updates when switching admissions)—eliminating confusion and improving data accuracy.
