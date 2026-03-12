# Healthcare Operations Platform - Navigation Model

## Overview

The healthcare operations platform implements a **role-aware, workspace-centric navigation model** optimized for different healthcare roles and workflows. The system reduces clicks, minimizes context loss, and makes daily workflows significantly better than legacy healthcare software.

## Primary Navigation Structure

### Main Modules

1. **Home / Workspace** (`/`) - Role-specific personalized workspace
2. **Patients** (`/patient-new`) - Patient management and records
3. **Admissions** (`/admissions`) - Admission processing and management
4. **Scheduling** (`/scheduling`) - Visit scheduling and coordination
5. **CareConnect** (`/careconnect`) - Care coordination tools
6. **Monitor / EVV** (`/monitor`) - Electronic Visit Verification
7. **Clinical** - Clinical documentation and assessments
8. **Billing / A/R** - Revenue cycle and accounts receivable
9. **Hospice** (`/hospice`) - Hospice-specific workflows
10. **Reports** - Analytics and reporting
11. **Admin / Platform** (`/admin/platform-config`) - System administration

## Role-Specific Workspaces

### Concept

Each user role sees a **personalized home workspace** focused on "what needs attention now" rather than generic analytics. The workspace emphasizes:

- **Queues** - Work items requiring action
- **Priorities** - Critical and urgent items first
- **Due Items** - Tasks approaching or past deadlines
- **Blockers** - Items preventing progress
- **Quick Actions** - One-click access to common tasks
- **Recent Work** - Recently accessed or modified items
- **Alerts/Exceptions** - Issues requiring immediate attention

### Workspace Implementations

#### 1. Intake / Admissions Workspace

**User Roles:** Intake Coordinator, Admissions Specialist

**Focus Areas:**
- Pending Referrals
- Ready for Admission
- Pending Insurance Verification
- Incomplete Intake Forms

**Key Metrics:**
- Pending referrals count
- Ready for admission count
- Pending insurance verifications
- Incomplete intake forms

**Quick Actions:**
- New Referral
- Contact Patient
- Verify Insurance
- Schedule Admission

**Route:** `/` (when user role is `intake` or `admissions`)

---

#### 2. Scheduler / Coordinator Workspace

**User Roles:** Scheduler, Coordinator, Staffing Manager

**Focus Areas:**
- Open Shifts Today
- Open Shifts This Week
- Delayed Visits
- Pending Confirmations

**Key Metrics:**
- Open shifts today (critical)
- Open shifts this week
- Delayed visits requiring rescheduling
- Pending clinician confirmations

**Quick Actions:**
- Schedule Visit
- Find Available Clinician
- Reschedule Delayed Visit
- Confirm Visit

**Route:** `/` (when user role is `scheduler` or `coordinator`)

---

#### 3. Clinician Workspace

**User Roles:** RN, PT, OT, ST, MSW, HHA

**Focus Areas:**
- Today's Schedule
- Pending Documentation
- Assessments Due
- Completed Visits

**Key Metrics:**
- Visits scheduled today
- Pending documentation (overdue)
- Assessments due soon
- Visits completed this month

**Quick Actions:**
- Start Visit
- Complete Documentation
- Submit Assessment
- View Route Map

**Route:** `/` (when user role is `clinician`)

---

#### 4. QA Reviewer Workspace

**User Roles:** QA Reviewer, QA Manager

**Focus Areas:**
- Pending Review
- Needs Correction
- Completed Today
- QA Reports

**Key Metrics:**
- Charts pending review
- Charts needing correction
- QA pass rate (%)
- Charts reviewed this month

**Quick Actions:**
- Review Chart
- Request Correction
- Approve Chart
- View QA Report

**Route:** `/` (when user role is `qa`)

---

#### 5. Billing / A/R Workspace

**User Roles:** Billing Specialist, A/R Coordinator

**Focus Areas:**
- Ready to Bill
- Pending Submission
- Claim Denials
- A/R Aging

**Key Metrics:**
- Ready to bill (complete documentation)
- Pending submission
- Claim denials requiring action
- A/R over 90 days

**Quick Actions:**
- Create Claim
- Submit Claims Batch
- Work Denial
- View A/R Report

**Route:** `/` (when user role is `billing` or `ar`)

---

#### 6. Hospice / Medical Director Workspace

**User Roles:** Medical Director, Hospice Coordinator

**Focus Areas:**
- Pending Signatures
- IDG Meetings
- New Referrals
- Census

**Key Metrics:**
- Documents pending MD signature
- IDG meetings this week
- Hospice census (active patients)
- New referrals requiring review

**Quick Actions:**
- Sign Document
- Schedule IDG Meeting
- Review Referral
- View Census Report

**Route:** `/` (when user role is `hospice` or `medical_director`)

---

#### 7. Administrator Workspace

**User Roles:** System Admin, Platform Admin

**Focus Areas:**
- User Management
- Platform Configuration
- Office Setup
- System Health

**Quick Actions:**
- Manage Users
- Configure Modules
- Manage Offices
- View System Logs

**Route:** `/` (when user role is `admin` or `administrator`)

---

## Patient/Admission Context

### Persistent Context Header

When a patient or admission is selected anywhere in the system, a **sticky context header** appears at the top of the page containing:

- **Patient Name** - Full name prominently displayed
- **DOB / Age** - Date of birth and calculated age
- **Account/MRN** - Medical record number
- **Office** - Current office/branch
- **Admission Status** - Active, Pending, Discharged
- **Payer Tags** - Insurance/payer badges (e.g., Medicare, Medicaid)
- **Care Disciplines** - Services patient is receiving (SN, PT, OT, etc.)
- **Alert Badges** - Critical alerts (auth expiring, visits low, etc.)
- **Quick Actions** - Common patient actions (Schedule Visit, Add Note, View Chart)
- **Admission Switcher** - Dropdown to switch between multiple admissions

**Implementation:** `PatientContextHeader` component in `/src/app/components/design-system/PatientContextHeader.tsx`

### Benefits

- **Context Retention** - Users never lose sight of which patient they're working with
- **Reduced Navigation** - Quick actions available without leaving the page
- **Multi-Admission Support** - Easy switching between admissions for same patient
- **Alert Visibility** - Critical information always visible

---

## Global Productivity Features

### 1. Command Palette (Cmd+K / Ctrl+K)

**Activation:** 
- Keyboard: `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- Click: Search bar in top navigation

**Features:**
- Quick navigation to any module
- Quick actions (Add Patient, Schedule Visit, etc.)
- Recent patients/admissions
- Search by keyword

**Implementation:** `CommandPalette` component

**Categories:**
- **Quick Actions** - Create new records, schedule visits
- **Navigation** - Jump to any module or page
- **Recent** - Recently accessed patients/admissions (future)

**Example Commands:**
- "Add New Patient"
- "Schedule Visit"
- "Go to Patients"
- "Go to Admissions"
- "Go to Scheduling"

---

### 2. Global Search

**Location:** Top navigation bar

**Features:**
- Search patients by name, MRN, DOB
- Search admissions
- Search visits
- Search documents
- Instant results with type indicators

**Implementation:** `GlobalSearch` component

**Search Scope:**
- Patients (name, MRN, DOB, phone)
- Admissions (patient name, admission date)
- Visits (patient, date, clinician)
- Documents (patient, document type)

---

### 3. Recent Items

**Feature:** Quick access to recently viewed/edited items

**Implementation:** (Future) Recent items tracker in local storage or database

**Types:**
- Recently viewed patients
- Recently viewed admissions
- Recently edited forms
- Recently accessed modules

---

### 4. Notification Center

**Feature:** Centralized alert and notification system

**Implementation:** (Future) Notification bell icon in top navigation

**Notification Types:**
- Task assignments
- Document approvals
- Authorization expiring
- Visit confirmations
- System announcements

---

### 5. Quick-Create Actions

**Feature:** One-click access to create new records

**Location:** Command palette, module pages

**Actions:**
- Add New Patient
- New Referral
- Schedule Visit
- Create Admission
- Add Authorization
- Document Visit

---

## Right-Side Context Drawer Pattern

**Purpose:** Provide additional context without navigating away from current page

**Use Cases:**
- Patient details while viewing admission list
- Visit details while viewing schedule
- Authorization details while viewing patient
- Clinician details while assigning shifts

**Implementation:** `SplitViewLayout` component with inspector drawer

**Behavior:**
- Slides in from right
- Does not replace main content
- Keyboard shortcut to toggle
- Mobile: Full-screen overlay
- Desktop: Side-by-side layout

---

## Navigation Best Practices

### 1. Reduce Clicks
- ✅ One-click access to common actions from workspace
- ✅ Quick actions in context header
- ✅ Command palette for power users
- ❌ Avoid deep menu hierarchies

### 2. Reduce Context Loss
- ✅ Persistent patient context header
- ✅ Breadcrumbs for deep navigation
- ✅ Right-side drawer for details
- ❌ Avoid full-page navigations when drawer suffices

### 3. Role-Aware Navigation
- ✅ Show only modules user has access to
- ✅ Default to role-specific workspace
- ✅ Personalize quick actions based on role
- ❌ Avoid showing disabled/inaccessible features

### 4. Fast Daily Workflows
- ✅ Keyboard shortcuts for common actions
- ✅ Predictable, consistent patterns
- ✅ Optimized for repeated tasks
- ❌ Avoid requiring mouse for every action

---

## Technical Implementation

### Role Detection

```typescript
// Get user role from auth context
const { user } = useAuth();
const userRole = user?.user_metadata?.role as UserRole;

// Map role to workspace component
const WorkspaceComponent = roleWorkspaceMap[userRole];
```

### Route Structure

```
/                              → Role-aware workspace (Dashboard)
/patient-new                   → Patient list
/patient-new/:patientId        → Patient details
/admissions                    → Admissions list
/scheduling                    → Scheduling
/hospice                       → Hospice module
/admin/platform-config         → Admin configuration
/design-system                 → Design system showcase
```

### Workspace Routing

All workspaces are accessible via `/` (home route). The system detects the user's role and displays the appropriate workspace.

**Demo Mode:** If no role is assigned, users see a role selector to choose a workspace.

**Production Mode:** Role is read from `user.user_metadata.role` in Supabase auth.

---

## Future Enhancements

1. **Saved Views** - Save filtered/sorted views of work queues
2. **Custom Dashboards** - Build custom metric dashboards
3. **Mobile Optimization** - Native mobile app with offline support
4. **Voice Commands** - Voice-activated commands for hands-free operation
5. **Smart Routing** - AI-suggested next actions based on workflow patterns
6. **Cross-Module Workflows** - Guided workflows that span multiple modules
7. **Collaboration Tools** - Real-time collaboration indicators and messaging

---

## Comparison to Legacy Systems

| Feature | Legacy Healthcare Software | This Platform |
|---------|---------------------------|---------------|
| **Navigation** | Deep menu hierarchies | Flat, role-aware workspaces |
| **Search** | Separate search page | Global search always available |
| **Context** | Lost on page change | Persistent context header |
| **Quick Actions** | 5+ clicks to common tasks | 1-2 clicks via command palette |
| **Role Awareness** | Same interface for all roles | Personalized for each role |
| **Keyboard Support** | Mouse-required | Full keyboard navigation |
| **Information Density** | Sparse, lots of whitespace | High density, optimized for experts |
| **Patient Context** | Re-search patient on each page | Always visible, never lost |

---

## Testing the Navigation System

1. **Access Role Selector:** Navigate to `/` without a role assigned
2. **Test Each Workspace:** Select each role to view its personalized workspace
3. **Test Command Palette:** Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
4. **Test Global Search:** Click search bar in top navigation
5. **Test Patient Context:** Select a patient to see persistent context header
6. **Test Quick Actions:** Use quick action buttons from workspace

---

## Documentation Files

- `/NAVIGATION_MODEL.md` - This file (navigation architecture)
- `/DESIGN_SYSTEM.md` - Design system documentation
- `/DESIGN_SYSTEM_QUICK_REF.md` - Design system quick reference
- `/ARCHITECTURE.md` - Overall system architecture

---

## Component Reference

**Workspaces:**
- `/src/app/pages/workspaces/IntakeAdmissionsWorkspace.tsx`
- `/src/app/pages/workspaces/SchedulerWorkspace.tsx`
- `/src/app/pages/workspaces/ClinicianWorkspace.tsx`
- `/src/app/pages/workspaces/QAWorkspace.tsx`
- `/src/app/pages/workspaces/BillingWorkspace.tsx`
- `/src/app/pages/workspaces/HospiceMedicalDirectorWorkspace.tsx`
- `/src/app/pages/workspaces/RoleAwareWorkspace.tsx`

**Productivity Components:**
- `/src/app/components/design-system/CommandPalette.tsx`
- `/src/app/components/design-system/GlobalSearch.tsx`
- `/src/app/components/design-system/PatientContextHeader.tsx`

**Layout Components:**
- `/src/app/components/design-system/WorkspaceLayout.tsx`
- `/src/app/components/design-system/SplitViewLayout.tsx`
