# Episode of Care Architecture Documentation

## Overview

The **Episode of Care Dashboard** serves as the central operational hub for managing patient admissions in home health and hospice care. Each admission represents an episode of care with a defined start, certification period, and operational workflow.

The dashboard provides a **single-pane-of-glass view** of episode status, authorization, documentation, visits, care team, and alerts—enabling efficient episode management and proactive issue resolution.

---

## Core Concept

### Episode of Care Definition

An **Episode of Care** is:

- A distinct period of care under a single admission
- Typically 60 days for home health (Medicare)
- Has defined certification periods
- Contains all visits, documentation, and billing for that period
- Managed as a complete operational unit

```
┌─────────────────────────────────────────┐
│ EPISODE OF CARE                         │
│ ─────────────────────────────────────── │
│ Admission: ADM-2024-001                 │
│ Period: Day 1 → Day 60                  │
│                                         │
│ Contains:                               │
│ • All visits (RN, PT, OT, MSW, etc.)   │
│ • All clinical documentation           │
│ • Authorization tracking               │
│ • Care team assignments                │
│ • Billing preparation                  │
│ • Outcome measures                     │
└─────────────────────────────────────────┘
```

---

## Dashboard as Mission Control

The Episode Dashboard acts as **mission control** for an admission:

```
┌─────────────────────────────────────────────────────┐
│ EPISODE OF CARE DASHBOARD                           │
│ ───────────────────────────────────────────────────│
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ EPISODE STATUS HEADER                       │   │
│ │ • Day 42/60 • 18 days remaining            │   │
│ │ • Progress bar • Key dates                 │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ALERTS & WARNINGS                           │   │
│ │ Critical issues requiring immediate action  │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌───────────────┬───────────────┬─────────────┐   │
│ │ Authorization │ Documentation │ Care Team   │   │
│ │ Status & Usage│ Completion    │ Members     │   │
│ ├───────────────┴───────────────┤             │   │
│ │ Upcoming Visits                │             │   │
│ │ Next 7 days schedule           │             │   │
│ └────────────────────────────────┴─────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ QUICK ACTIONS                               │   │
│ │ [Schedule] [Document] [Orders] [Billing]   │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Six Core Components

### 1. Episode Status Header

**Purpose:** Real-time operational status of the episode

```
┌────────────────────────────────────────────────┐
│ ADM-2024-001              [● Active] [Ep 1]   │
│                                                │
│ Day 42 of 60 • 18 days remaining • Medicare   │
│                                                │
│ ████████████████░░░░░░░░ 70%                  │
│                                                │
│ ┌────────────────┐  ┌───────────────────────┐│
│ │ Diagnosis:     │  │ Started:              ││
│ │ CHF, Diabetes  │  │ 02/01/2024            ││
│ │                │  │ Cert: 04/01/2024      ││
│ └────────────────┘  └───────────────────────┘│
└────────────────────────────────────────────────┘
```

**Key Information:**
- Admission ID and episode number
- Status (Active/Pending/Discharged)
- Day in episode (X/60)
- Days remaining
- Progress bar visualization
- Primary payer
- Primary diagnosis
- Start date and certification date
- Patient name

**Visual Design:**
- Gradient background (blue-to-indigo)
- Large, bold admission ID
- Color-coded status badges
- Animated progress bar
- High-contrast text for readability

---

### 2. Alerts & Warnings Widget

**Purpose:** Surface critical issues requiring immediate attention

```
┌──────────────────────────────────────────┐
│ ⚠️ Alerts                           [3]  │
├──────────────────────────────────────────┤
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 🔴 CRITICAL                        │  │
│ │ Overdue OASIS Assessment           │  │
│ │ Recert OASIS due by end of day     │  │
│ │ Due: Today                          │  │
│ │                                     │  │
│ │ [Complete Assessment →] [Dismiss]  │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 🟡 WARNING                         │  │
│ │ Authorization Nearing Limit        │  │
│ │ 8 of 20 visits remaining           │  │
│ │                                     │  │
│ │ [Request Extension →]   [Dismiss]  │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 🟡 WARNING                         │  │
│ │ Physician Orders Expiring          │  │
│ │ 3 orders expire in 5 days          │  │
│ │ Due: 03/15/2024                    │  │
│ │                                     │  │
│ │ [Renew Orders →]        [Dismiss]  │  │
│ └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Alert Types:**
- **Critical (Red):** Immediate action required (overdue items, compliance issues)
- **Warning (Amber):** Action needed soon (approaching deadlines, capacity limits)
- **Info (Blue):** Informational (status changes, recommendations)

**Alert Categories:**
- **Authorization:** Auth expiration, visit limits, denials
- **Documentation:** Overdue notes, missing signatures, incomplete assessments
- **Clinical:** Orders expiring, medication changes, hospitalization risks
- **Billing:** Missing billing data, claim holds, payment issues
- **Scheduling:** Unassigned visits, frequency violations, gaps in care

**Features:**
- Action buttons for each alert
- Dismiss option for non-applicable alerts
- Due dates prominently displayed
- Color-coded severity
- Category icons
- "All Clear" state when no alerts

---

### 3. Authorization Tracker Widget

**Purpose:** Authorization status and visit usage tracking

```
┌──────────────────────────────────┐
│ 🛡️ Authorization                 │
├──────────────────────────────────┤
│                                  │
│ Status      [✓ Approved]        │
│ Auth #      AUTH-2024-12345      │
│ Valid       04/01/2024           │
│                                  │
│ Visits      12/20               │
│ ████████████░░░░░░░░ 60%        │
│                                  │
│ ⚠️ 8 visits remaining           │
│    Review frequency              │
│                                  │
│ [View Details →]                │
└──────────────────────────────────┘
```

**Key Information:**
- Authorization status (Approved/Pending/Expired/Denied)
- Authorization number
- Valid through date
- Visits authorized vs. used
- Visual progress bar
- Days remaining alert
- Inline warnings

**Status States:**
- ✓ **Approved** (Green) - Active authorization
- 🕐 **Pending** (Yellow) - Awaiting approval
- ❌ **Expired** (Red) - Authorization expired
- 🚫 **Denied** (Red) - Authorization denied

**Alerts:**
- Low visits remaining (< 5)
- Expiration approaching (< 7 days)
- Auth expired
- No auth on file

---

### 4. Documentation Completion Widget

**Purpose:** Track documentation completeness

```
┌──────────────────────────────────┐
│ 📄 Documentation                 │
├──────────────────────────────────┤
│                                  │
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │  20 │ │  3  │ │  2  │        │
│ │ ✓   │ │ ⏳  │ │ 🔴  │        │
│ │ Done│ │Pend │ │Over │        │
│ └─────┘ └─────┘ └─────┘        │
│                                  │
│ Completion Rate                  │
│ ████████████████░░ 80%          │
│                                  │
│ Visit Notes      12/15          │
│ Assessments       2/3           │
│ Care Plans        3/3 ✓         │
│                                  │
│ [View All Documentation →]      │
└──────────────────────────────────┘
```

**Key Information:**
- Completed count
- Pending count
- Overdue count
- Overall completion rate
- Breakdown by category:
  - Visit Notes
  - Assessments (OASIS, functional)
  - Care Plans
  - Orders
  - Physician documentation
  - Consents

**Visual Design:**
- Three-box summary (completed/pending/overdue)
- Color-coded (green/amber/red)
- Progress bar for completion rate
- Category breakdown
- Quick access to documentation module

---

### 5. Upcoming Visits Widget

**Purpose:** Preview of scheduled visits

```
┌──────────────────────────────────┐
│ 📅 Upcoming Visits           [3] │
├──────────────────────────────────┤
│                                  │
│ ┌──────────────────────────────┐│
│ │ [RN]  Today                  ││
│ │ Skilled Nursing Visit        ││
│ │ Sarah Thompson, RN           ││
│ │ 03/10 at 9:00 AM             ││
│ └──────────────────────────────┘│
│                                  │
│ ┌──────────────────────────────┐│
│ │ [PT]  In 2 days              ││
│ │ Physical Therapy             ││
│ │ Michael Chen, PT             ││
│ │ 03/12 at 2:00 PM             ││
│ └──────────────────────────────┘│
│                                  │
│ ┌──────────────────────────────┐│
│ │ [RN]  In 4 days              ││
│ │ Skilled Nursing Visit        ││
│ │ Sarah Thompson, RN           ││
│ │ 03/14 at 10:00 AM            ││
│ └──────────────────────────────┘│
│                                  │
│ [+ Schedule New Visit]           │
└──────────────────────────────────┘
```

**Key Information:**
- Next 7-14 days of visits
- Discipline badge (RN, PT, OT, MSW, HHA, SLP)
- Days until visit
- Visit type
- Clinician name
- Date and time
- Visit status (confirmed/unconfirmed)

**Discipline Colors:**
- **RN** - Blue
- **PT** - Green
- **OT** - Purple
- **MSW** - Orange
- **HHA** - Pink
- **SLP** - Indigo

**Empty State:**
- "No visits scheduled" message
- Direct button to schedule visit

---

### 6. Care Team Widget

**Purpose:** Quick access to care team members

```
┌──────────────────────────────────┐
│ 👥 Care Team                 [5] │
├──────────────────────────────────┤
│                                  │
│ ┌──────────────────────────────┐│
│ │ 🩺 Dr. Robert Williams       ││
│ │    Physician                 ││
│ │    📞 555-0123               ││
│ └──────────────────────────────┘│
│                                  │
│ ┌──────────────────────────────┐│
│ │ 🎯 Jessica Martinez [Primary]││
│ │    Case Manager              ││
│ │    📞 555-0124               ││
│ │    Last contact: 03/08       ││
│ └──────────────────────────────┘│
│                                  │
│ ┌──────────────────────────────┐│
│ │ 🩺 Sarah Thompson   [Primary]││
│ │    RN                        ││
│ │    📞 555-0125               ││
│ │    12 visits completed       ││
│ └──────────────────────────────┘│
│                                  │
│ [... 2 more members]             │
│                                  │
│ [Manage Team →]                 │
└──────────────────────────────────┘
```

**Key Information:**
- Team member name
- Role/discipline
- Primary indicator
- Phone number
- Visit count (for clinicians)
- Last contact date (for case managers)

**Roles:**
- Physician
- Case Manager
- RN (Primary/Secondary)
- PT/OT/SLP
- MSW
- HHA

**Features:**
- Clickable cards to view member details
- Primary designation badge
- Contact information readily accessible
- Visit counts for performance tracking
- Manage team button

---

## Quick Actions Component

**Purpose:** One-click access to common tasks

```
┌────────────────────────────────────────┐
│ ⚡ Quick Actions                       │
├────────────────────────────────────────┤
│                                        │
│ ┌──────┐  ┌──────┐  ┌──────┐  ┌────┐│
│ │  📅  │  │  📄  │  │  📋  │  │ 💰 ││
│ │      │  │      │  │      │  │    ││
│ │Sched │  │ Add  │  │Update│  │View││
│ │Visit │  │ Note │  │Orders│  │Bill││
│ └──────┘  └──────┘  └──────┘  └────┘│
└────────────────────────────────────────┘
```

**Common Actions:**
1. **Schedule Visit** - Open scheduling form
2. **Add Documentation** - Create new visit note
3. **Update Orders** - Modify physician orders
4. **View Billing** - Access billing status
5. **Request Authorization** - Submit auth request
6. **Contact Team** - Message care team
7. **Update Care Plan** - Modify plan of care
8. **Generate Report** - Create episode summary

---

## Dashboard Layout

### Desktop Layout (≥ 1024px)

```
┌────────────────────────────────────────────────────┐
│ EPISODE STATUS HEADER (Full Width)                │
├────────────────────────────────────────────────────┤
│ ALERTS & WARNINGS (Full Width)                     │
├──────────────────────────┬─────────────────────────┤
│                          │                         │
│ ┌──────────┬──────────┐  │ CARE TEAM              │
│ │ Auth     │ Docs     │  │                         │
│ └──────────┴──────────┘  │                         │
│                          │                         │
│ UPCOMING VISITS          │                         │
│                          │                         │
│ QUICK ACTIONS            │                         │
│                          │                         │
│ (2/3 width)              │ (1/3 width)             │
└──────────────────────────┴─────────────────────────┘
```

### Tablet Layout (768-1023px)

```
┌────────────────────────────┐
│ EPISODE STATUS HEADER      │
├────────────────────────────┤
│ ALERTS & WARNINGS          │
├────────────────────────────┤
│ ┌──────────┬──────────┐   │
│ │ Auth     │ Docs     │   │
│ └──────────┴──────────┘   │
├────────────────────────────┤
│ UPCOMING VISITS            │
├────────────────────────────┤
│ CARE TEAM                  │
├────────────────────────────┤
│ QUICK ACTIONS              │
└────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌──────────────┐
│ EPISODE      │
│ STATUS       │
├──────────────┤
│ ALERTS       │
├──────────────┤
│ AUTH         │
├──────────────┤
│ DOCS         │
├──────────────┤
│ VISITS       │
├──────────────┤
│ CARE TEAM    │
├──────────────┤
│ ACTIONS      │
└──────────────┘
```

---

## Use Cases

### Use Case 1: Case Manager Daily Review

**Scenario:** Case manager starts day by reviewing assigned episodes

```
Morning workflow:

1. Opens Episode Dashboard for first patient
   → Sees ADM-2024-001, Day 42/60, Active

2. Checks Alerts widget
   → 1 Critical: Overdue OASIS assessment
   → 2 Warnings: Auth nearing limit, orders expiring

3. Takes action on critical alert
   → Clicks "Complete Assessment"
   → Navigates to OASIS form

4. Reviews upcoming visits
   → RN visit today at 9 AM (confirmed)
   → PT visit in 2 days (scheduled)

5. Checks documentation completion
   → 80% complete, 2 items overdue
   → Assigns follow-up to RN

6. Verifies authorization
   → 12/20 visits used, valid through 4/1
   → Notes need for extension request

7. Reviews care team
   → Calls primary RN to discuss patient status

Time: ~2 minutes per episode
Result: Complete situational awareness with clear action items
```

---

### Use Case 2: Clinician Visit Preparation

**Scenario:** RN preparing for patient visit

```
Pre-visit workflow:

1. Opens Episode Dashboard 30 minutes before visit
   → ADM-2024-001, Day 42/60

2. Reviews episode status
   → Day 42 of 60-day episode
   → Medicare, CHF/Diabetes

3. Checks alerts
   → Physician orders expire in 5 days
   → Plans to discuss with MD

4. Reviews recent documentation
   → Clicks "View Details" on Documentation widget
   → Reads last PT note from 2 days ago

5. Verifies care team coordination
   → Notes OT also seeing patient
   → Plans collaborative care approach

6. Checks authorization
   → 12 visits used, 8 remaining
   → Adequate for planned frequency

7. After visit
   → Uses Quick Actions "Add Note"
   → Documents visit immediately

Result: Well-prepared visit with full episode context
```

---

### Use Case 3: Billing Specialist Episode Review

**Scenario:** Billing reviewing episode approaching completion

```
End-of-episode workflow:

1. Opens dashboard for episode nearing day 60
   → ADM-2024-001, Day 55/60

2. Reviews episode progress
   → 5 days remaining
   → Episode ending 03/15

3. Checks authorization status
   → 12/20 visits used
   → Auth valid through episode end ✓

4. Verifies documentation completion
   → 80% complete
   → Notes 3 pending items

5. Clicks "View Details" on Documentation
   → Identifies missing OASIS discharge
   → Assigns to case manager (urgent)

6. Reviews visit count
   → 12 completed visits
   → Adequate for billing

7. Checks for alerts
   → No critical billing blocks

8. Uses Quick Actions "View Billing"
   → Navigates to billing workspace
   → Marks episode for final claim

Result: Billing readiness confirmed 5 days before episode end
```

---

### Use Case 4: Multi-Episode Patient Management

**Scenario:** Patient with concurrent home health and hospice episodes

```
Workflow:

1. Patient has 2 active episodes:
   → ADM-2024-001 (Home Health, Day 42/60)
   → ADM-2024-050 (Hospice, Day 15)

2. Case manager opens HH episode dashboard
   → Reviews operational status
   → Notes stable, progressing well

3. Switches to Hospice episode dashboard
   → Different care team displayed
   → Different visit schedule
   → Hospice-specific alerts (LOC, IDG)

4. Coordinates care between teams
   → Views both care teams
   → Plans coordination meeting

Result: Seamless management of concurrent episodes
```

---

## Component API

### Complete Dashboard

```tsx
import { EpisodeOfCareDashboard } from '@/components/episode/EpisodeOfCareDashboard';

const episodeData: EpisodeData = {
  episode: { /* episode details */ },
  authorization: { /* auth status */ },
  documentation: { /* doc completion */ },
  upcomingVisits: [ /* visits */ ],
  careTeam: [ /* team members */ ],
  alerts: [ /* active alerts */ ],
};

<EpisodeOfCareDashboard
  data={episodeData}
  onNavigate={(path) => navigate(path)}
/>
```

### Individual Widgets

```tsx
import {
  EpisodeStatusHeader,
  AlertsWidget,
  AuthorizationWidget,
  DocumentationWidget,
  UpcomingVisitsWidget,
  CareTeamWidget,
  QuickActions,
} from '@/components/episode/EpisodeOfCareDashboard';

<EpisodeStatusHeader episode={episode} />

<AlertsWidget
  alerts={alerts}
  onDismiss={handleDismiss}
  onTakeAction={handleAction}
/>

<AuthorizationWidget
  authorization={authStatus}
  onViewDetails={() => navigate('/authorization-tracker')}
/>

<DocumentationWidget
  documentation={docStatus}
  onViewDetails={() => navigate('/documentation-tracker')}
/>

<UpcomingVisitsWidget
  visits={upcomingVisits}
  onScheduleVisit={() => navigate('/scheduling/new')}
  onViewVisit={(id) => navigate(`/poc/visit/${id}`)}
/>

<CareTeamWidget
  careTeam={teamMembers}
  onViewMember={(id) => console.log(id)}
  onManageTeam={() => navigate('/care-team')}
/>

<QuickActions
  admissionId={admissionId}
  onAction={(action) => handleQuickAction(action)}
/>
```

---

## Data Loading Strategy

```typescript
async function loadEpisodeDashboard(admissionId: string) {
  // Load all dashboard components in parallel
  const [
    episode,
    authorization,
    documentation,
    visits,
    careTeam,
    alerts,
  ] = await Promise.all([
    fetchEpisodeDetails(admissionId),
    fetchAuthorizationStatus(admissionId),
    fetchDocumentationStatus(admissionId),
    fetchUpcomingVisits(admissionId),
    fetchCareTeam(admissionId),
    fetchActiveAlerts(admissionId),
  ]);

  return {
    episode,
    authorization,
    documentation,
    upcomingVisits: visits,
    careTeam,
    alerts,
  };
}
```

### Real-Time Updates

```typescript
// Poll for critical updates
useInterval(() => {
  refreshAlerts();
  refreshUpcomingVisits();
}, 60000); // Every 60 seconds

// Refresh documentation on user action
const handleDocumentationComplete = () => {
  refreshDocumentationStatus();
  refreshAlerts(); // May clear related alerts
};
```

---

## Best Practices

### ✅ DO

- Load all dashboard components on initial page load
- Refresh alerts frequently (every 60 seconds)
- Provide clear action buttons for every alert
- Show episode progress prominently
- Color-code by severity and status
- Make care team contact info readily accessible
- Surface upcoming visits (next 7-14 days)
- Provide quick actions for common tasks
- Use visual progress indicators
- Dismiss irrelevant alerts

### ❌ DON'T

- Hide critical alerts
- Require multiple clicks to take action
- Show stale data
- Overload with too many metrics
- Use vague alert descriptions
- Hide authorization or documentation issues
- Show past visits in "Upcoming" section
- Bury quick actions
- Use color without meaning
- Make dashboard read-only

---

## Summary

The Episode of Care Dashboard provides:

✅ **Central Hub** - Single pane of glass for episode management  
✅ **6 Core Components** - Status, Alerts, Auth, Docs, Visits, Team  
✅ **Real-Time Status** - Episode progress and operational state  
✅ **Proactive Alerts** - Critical issues with action buttons  
✅ **Authorization Tracking** - Visit usage and expiration monitoring  
✅ **Documentation Monitor** - Completion tracking by category  
✅ **Visit Preview** - Upcoming schedule visibility  
✅ **Care Team Access** - Quick contact to team members  
✅ **Quick Actions** - One-click common tasks  
✅ **Responsive Design** - Works on all devices  
✅ **Action-Oriented** - Every widget has clear next steps  
✅ **Production-Ready** - Complete implementation  

**Result:** Healthcare staff have complete operational visibility into episode status with proactive alerts and one-click access to resolution workflows—enabling efficient episode management and preventing issues before they impact billing or patient care.
