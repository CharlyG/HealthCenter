# Operational Workspace Architecture

## Overview

The Operational Workspace System provides role-aware, task-oriented interfaces that adapt based on user responsibilities. Unlike traditional static dashboards, workspaces focus on **actionable tasks** with one-click access to operational workflows.

---

## Philosophy

### Task-Oriented vs Dashboard-Oriented

**❌ Traditional Dashboard Approach:**
```
┌─────────────────────────┐
│ Total Patients: 150     │  ← Static metric
│ Visits Today: 48        │  ← No action
│ Documentation: 92%      │  ← Passive display
└─────────────────────────┘
```

**✅ Operational Workspace Approach:**
```
┌────────────────────────────────────────┐
│ ⚠️ Late Visit Documentation            │
│ Visit completed 3h ago - Document Now  │
│                    [Complete Now →]    │  ← Clear action
└────────────────────────────────────────┘
```

### Key Principles

1. **Every Item is Actionable** - No passive displays
2. **Role-Aware** - Content adapts to user's responsibilities
3. **Priority-Driven** - Most urgent items surface first
4. **One-Click Access** - Direct navigation to tasks
5. **Real-Time Updates** - Dynamic content that changes as work progresses

---

## Five Workspace Zones

```
┌─────────────────────────────────────────────────────────┐
│ ZONE 1: CRITICAL ISSUES (Full Width)                   │
│ ─────────────────────────────────────────────────────  │
│ Items requiring IMMEDIATE attention with clear actions │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌─────────────────────────┐
│ ZONE 2: TODAY'S WORK     │  │ ZONE 3: RESUME WORK     │
│ (2/3 width - Left)       │  │ (1/3 width - Right)     │
│ ──────────────────────── │  │ ─────────────────────── │
│ Tasks scheduled for day  │  │ Recently accessed items │
│                          │  │                         │
│ ZONE 4: QUICK ACTIONS    │  │                         │
│ ──────────────────────── │  │                         │
│ Common role actions      │  │                         │
└──────────────────────────┘  └─────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ZONE 5: OPERATIONAL INSIGHTS (Full Width)               │
│ ─────────────────────────────────────────────────────  │
│ High-level metrics with trends and targets              │
└─────────────────────────────────────────────────────────┘
```

---

## Zone 1: Critical Issues

### Purpose
Surface items requiring **immediate attention** with clear urgency indicators.

### Visual Design

```
┌────────────────────────────────────────────────────┐
│ ⚠️ Critical Issues                            [3]  │
├────────────────────────────────────────────────────┤
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🔴 URGENT                                    │ │
│ │ Late Visit - Requires Documentation          │ │
│ │ Visit with Mary Johnson completed 3h ago     │ │
│ │ 👤 Johnson, Mary • ADM-2024-001             │ │
│ │ 🕐 Due: Today at 5:00 PM                    │ │
│ │                                              │ │
│ │ [Complete Documentation →]  [Dismiss]       │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🟡 WARNING                                   │ │
│ │ OASIS Due Tomorrow                           │ │
│ │ Recertification assessment needs completion  │ │
│ │ 👤 Smith, Robert • ADM-2024-015             │ │
│ │                                              │ │
│ │ [Start Assessment →]  [Dismiss]             │ │
│ └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### Issue Types

#### **Urgent (Red)**
- Immediate action required
- Compliance deadlines today
- Patient safety issues
- Critical errors

#### **Error (Orange)**
- System errors
- Missing required data
- Failed processes
- Authorization issues

#### **Warning (Amber)**
- Tasks due soon (24-48h)
- Missing documentation
- Pending approvals
- Frequency violations

### Features

1. **Dismissable** - Users can dismiss non-applicable issues
2. **Patient-Linked** - Shows patient name and admission ID
3. **Due Dates** - Clear deadline visibility
4. **Action Button** - Direct navigation to resolution
5. **All Clear State** - Green checkmark when no issues

---

## Zone 2: Today's Work

### Purpose
Display tasks **scheduled for today** with status tracking and priority.

### Visual Design

```
┌────────────────────────────────────────────────────┐
│ 📅 Today's Work                    [4 pending]    │
├────────────────────────────────────────────────────┤
│                                                    │
│ ▼ IN PROGRESS                                      │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🩺  Skilled Nursing Visit                 HIGH│ │
│ │     Johnson, Mary                            │ │
│ │     🕐 9:00 AM                               │ │
│ │     [Start Visit →]  [✓ Complete]           │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ▼ PENDING                                          │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ 📋  OASIS SOC Assessment              MEDIUM │ │
│ │     Thompson, Sarah                          │ │
│ │     🕐 2:00 PM                               │ │
│ │     [Begin OASIS →]  [✓ Complete]           │ │
│ └──────────────────────────────────────────────┘ │
│                                                    │
│ ▼ COMPLETED                                        │
│                                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ ✓ Visit Documentation                        │ │
│ │   Williams, David • PT                       │ │
│ │   Completed at 10:30 AM                      │ │
│ └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### Task Types

- **Visit** 🩺 - Patient visits (RN, PT, OT, etc.)
- **Assessment** 📋 - OASIS, evaluations
- **Call** 📞 - Phone calls to patients/physicians
- **Documentation** 📄 - Notes, reports
- **Billing** 💰 - Billing tasks
- **Meeting** 👥 - IDG, team meetings

### Task Status

- **Pending** - Not started (gray border)
- **In Progress** - Currently working (blue border + highlight)
- **Completed** - Finished (green checkmark + opacity)

### Priority Levels

- **High** 🔴 - Red badge
- **Medium** 🟡 - Amber badge
- **Low** 🔵 - Blue badge

---

## Zone 3: Resume Work

### Purpose
Provide **quick access** to recently viewed patients, admissions, and documents.

### Visual Design

```
┌────────────────────────────────────┐
│ 🔄 Resume Work                     │
├────────────────────────────────────┤
│                                    │
│ ┌────────────────────────────────┐│
│ │ 👤  Johnson, Mary              ││
│ │     CHF, Diabetes • Active  [1]││
│ │     🕐 30m ago                  ││
│ │                             ›  ││
│ └────────────────────────────────┘│
│                                    │
│ ┌────────────────────────────────┐│
│ │ 💼  ADM-2024-015               ││
│ │     Williams, David            ││
│ │     🕐 1h ago                   ││
│ │                             ›  ││
│ └────────────────────────────────┘│
│                                    │
│ ┌────────────────────────────────┐│
│ │ 📄  Plan of Care               ││
│ │     Smith, Robert              ││
│ │     🕐 2h ago                   ││
│ │                             ›  ││
│ └────────────────────────────────┘│
└────────────────────────────────────┘
```

### Item Types

- **Patient** 👤 - Patient charts
- **Admission** 💼 - Admission details
- **Visit** 🩺 - Visit records
- **Document** 📄 - Documentation

### Features

1. **Time Stamps** - Show recency (30m ago, 2h ago, 1d ago)
2. **Alert Badges** - Show pending alerts count
3. **Clickable Cards** - One-click to resume
4. **Metadata** - Status, diagnoses, etc.

---

## Zone 4: Quick Actions

### Purpose
**One-click access** to common tasks for the role.

### Visual Design

```
┌─────────────────────────────────────────────────────┐
│ ⚡ Quick Actions                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│ │  🩺        │  │  📋        │  │  📄        │   │
│ │ Start      │  │ OASIS      │  │ Visit      │   │
│ │ Visit      │  │ Assessment │  │ Notes      │   │
│ │            │  │            │  │            │   │
│ │ Begin      │  │ Start      │  │ Document   │   │
│ │ patient    │  │ assessment │  │ visit      │   │
│ │ visit      │  │            │  │            │   │
│ └────────────┘  └────────────┘  └────────────┘   │
│                                                     │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│ │  📅        │  │  👥        │  │  📞        │   │
│ │ View       │  │ Care       │  │ MD Call    │   │
│ │ Schedule   │  │ Team       │  │            │   │
│ │            │  │            │  │            │   │
│ │ Today's    │  │ Team       │  │ Contact    │   │
│ │ visits     │  │ coordination│  │ physician  │   │
│ └────────────┘  └────────────┘  └────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Action Configuration

```typescript
{
  id: 'start-visit',
  label: 'Start Visit',
  description: 'Begin patient visit',
  icon: Stethoscope,
  path: '/poc/caregiver-field-app',
  color: 'blue',
}
```

### Color Coding

- **Blue** - Clinical actions
- **Green** - Approval/completion actions
- **Purple** - Documentation actions
- **Orange** - Scheduling actions
- **Red** - Urgent actions
- **Indigo** - Administrative actions

---

## Zone 5: Operational Insights

### Purpose
Display **high-level metrics** with trends and targets for operational awareness.

### Visual Design

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Operational Insights                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│ │  🩺          │  │  ✓           │  │  📄          │ │
│ │              │  │              │  │              │ │
│ │     4        │  │    92%       │  │     2        │ │
│ │   visits     │  │              │  │              │ │
│ │              │  │ ↑ +5%        │  │ ↓ -1         │ │
│ │ Visits Today │  │ Documentation│  │ Pending      │ │
│ │              │  │ Rate         │  │ Notes        │ │
│ │ ████░░ 67%   │  │              │  │              │ │
│ │ Target: 6    │  │              │  │              │ │
│ └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│ │  💰          │  │  📈          │  │  ⏱️          │ │
│ │              │  │              │  │              │ │
│ │   $45K       │  │    94%       │  │    3.2       │ │
│ │              │  │              │  │   days       │ │
│ │ ↓ -12%       │  │ ↑ +2%        │  │ ↓ -0.5       │ │
│ │ Revenue at   │  │ Clean Claim  │  │ Avg Days to  │ │
│ │ Risk         │  │ Rate         │  │ Bill         │ │
│ └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Metric Components

1. **Icon** - Visual identifier
2. **Value** - Primary metric (number or percentage)
3. **Trend** - Change direction and percentage
4. **Label** - Metric description
5. **Progress Bar** (optional) - Target visualization
6. **Color Coding** - Status indication

### Trend Indicators

- **↑ Green** - Positive change (good)
- **↑ Red** - Increase (bad metric like errors)
- **↓ Green** - Decrease (good for negative metrics)
- **↓ Red** - Negative change

---

## Role-Aware Configurations

### Clinician Workspace

**Primary Focus:** Visit execution and documentation

**Critical Issues:**
- Late visit documentation
- OASIS assessments due
- Missing signatures

**Today's Work:**
- Scheduled visits (RN, PT, OT)
- Assessments (OASIS, functional)
- MD calls

**Quick Actions:**
- Start Visit
- OASIS Assessment
- Visit Notes
- View Schedule

**Metrics:**
- Visits Today (4/6)
- Documentation Rate (92%)
- Pending Notes (2)
- Productivity (95%)

---

### Billing Specialist Workspace

**Primary Focus:** Claims and billing preparation

**Critical Issues:**
- Claim rejections
- Missing authorizations
- Episodes ending soon

**Today's Work:**
- Episode reviews
- Claim submissions
- Documentation hold resolution

**Quick Actions:**
- Ready for Billing Queue
- Holds Queue
- Claims Status
- Authorizations

**Metrics:**
- Ready for Billing (24)
- Clean Claim Rate (94%)
- Avg Days to Bill (3.2)
- Revenue at Risk ($45K)

---

### Scheduler Workspace

**Primary Focus:** Visit scheduling and optimization

**Critical Issues:**
- Unassigned visits today
- Frequency violations
- Clinician conflicts

**Today's Work:**
- Confirm visits
- Build next week schedule
- Weekly scheduling meeting

**Quick Actions:**
- Schedule Visit
- View Calendar
- Clinician Availability
- Auto-Schedule

**Metrics:**
- Scheduled Today (48/50)
- Unassigned (3)
- Fill Rate (96%)
- Avg Drive Time (18min)

---

### Case Manager Workspace

**Primary Focus:** Care coordination and oversight

**Critical Issues:**
- Patient deteriorating
- Recertifications due
- Hospitalization risks

**Today's Work:**
- Weekly patient check-ins
- IDG meetings
- Care plan reviews

**Quick Actions:**
- CareConnect
- My Patients
- Care Plans
- Team Messages

**Metrics:**
- Active Patients (32/35)
- High Risk (4)
- Care Plan Compliance (98%)
- Recerts This Week (3)

---

### Intake Coordinator Workspace

**Primary Focus:** Referrals and new admissions

**Critical Issues:**
- New referrals requiring response
- SOC visits not scheduled
- Pending insurance verifications

**Today's Work:**
- Verify insurance
- Complete admission packets
- Call referral sources

**Quick Actions:**
- New Referral
- Referral Pipeline
- New Admission
- Schedule SOC

**Metrics:**
- Active Referrals (12)
- Conversion Rate (78%)
- Avg Response Time (2.3hrs)
- Pending Approvals (5)

---

## Component API

### Complete Workspace

```tsx
import { OperationalWorkspace } from '@/components/workspace/OperationalWorkspace';
import { getWorkspaceConfig } from '@/components/workspace/workspaceConfigs';

const config = getWorkspaceConfig('clinician');

<OperationalWorkspace
  config={config}
  onDismissIssue={(id) => handleDismiss(id)}
  onCompleteTask={(id) => handleComplete(id)}
/>
```

### Individual Zones

```tsx
import {
  CriticalIssuesZone,
  TodayWorkZone,
  ResumeWorkZone,
  QuickActionsZone,
  OperationalInsightsZone,
} from '@/components/workspace/OperationalWorkspace';

<CriticalIssuesZone 
  issues={issues} 
  onDismiss={handleDismiss} 
/>

<TodayWorkZone 
  tasks={tasks} 
  onComplete={handleComplete} 
/>

<ResumeWorkZone items={recentItems} />

<QuickActionsZone actions={quickActions} />

<OperationalInsightsZone metrics={metrics} />
```

---

## Custom Workspace Configuration

### Creating a New Role Configuration

```typescript
import type { WorkspaceConfig } from './OperationalWorkspace';

export const myRoleWorkspace: WorkspaceConfig = {
  role: 'my_role',
  displayName: 'My Role Workspace',
  
  criticalIssues: [
    {
      id: 'issue1',
      type: 'urgent',
      title: 'Critical Item',
      description: 'Description of the issue',
      patientName: 'Patient Name',
      admissionId: 'ADM-12345',
      dueDate: new Date().toISOString(),
      action: {
        label: 'Take Action',
        path: '/path/to/resolution',
      },
      icon: AlertCircle,
    },
  ],
  
  todayTasks: [
    {
      id: 'task1',
      type: 'visit',
      title: 'Task Title',
      patientName: 'Patient Name',
      scheduledTime: '9:00 AM',
      status: 'pending',
      priority: 'high',
      action: {
        label: 'Start Task',
        path: '/path/to/task',
      },
    },
  ],
  
  recentItems: [
    {
      id: 'recent1',
      type: 'patient',
      title: 'Patient Name',
      subtitle: 'Additional info',
      lastAccessed: new Date().toISOString(),
      path: '/patient/123',
      metadata: { status: 'active', alerts: 2 },
    },
  ],
  
  quickActions: [
    {
      id: 'action1',
      label: 'Action Name',
      description: 'What this does',
      icon: Zap,
      path: '/path/to/action',
      color: 'blue',
    },
  ],
  
  metrics: [
    {
      id: 'metric1',
      label: 'Metric Name',
      value: 42,
      unit: 'items',
      change: {
        value: 5,
        direction: 'up',
        isPositive: true,
      },
      target: 50,
      icon: Activity,
      color: 'blue',
    },
  ],
};
```

---

## Best Practices

### ✅ DO

- Keep critical issues under 5 items
- Provide clear action labels ("Complete Now", not "View")
- Use patient context when relevant
- Show time remaining/elapsed for deadlines
- Color-code by urgency, not aesthetics
- Update status in real-time as tasks complete
- Provide dismiss option for non-applicable items
- Use descriptive metric labels
- Show trends with context (up/down + good/bad)

### ❌ DON'T

- Create passive "info cards" without actions
- Overload with too many metrics
- Use vague action labels ("Go", "See More")
- Hide urgent items below the fold
- Mix multiple role configs on one workspace
- Show stale data
- Use color without meaning
- Create actions that require multiple clicks

---

## Responsive Behavior

### Desktop (≥ 1024px)
```
┌────────────────────────────────────┐
│ Critical Issues (Full Width)       │
├──────────────────────┬─────────────┤
│ Today's Work (2/3)   │ Resume (1/3)│
│                      │             │
│ Quick Actions        │             │
├──────────────────────┴─────────────┤
│ Operational Insights (Full Width)  │
└────────────────────────────────────┘
```

### Tablet (768-1023px)
```
┌────────────────────────────────────┐
│ Critical Issues                    │
├────────────────────────────────────┤
│ Today's Work                       │
├────────────────────────────────────┤
│ Resume Work                        │
├────────────────────────────────────┤
│ Quick Actions                      │
├────────────────────────────────────┤
│ Operational Insights               │
└────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌──────────────┐
│ Critical     │
│ Issues       │
├──────────────┤
│ Today's Work │
├──────────────┤
│ Resume Work  │
├──────────────┤
│ Quick Actions│
│ (2 columns)  │
├──────────────┤
│ Metrics      │
│ (2 columns)  │
└──────────────┘
```

---

## Performance Optimization

### Data Loading Strategy

```typescript
// Load critical data immediately
const criticalIssues = await fetchCriticalIssues(userId);

// Load secondary data in parallel
Promise.all([
  fetchTodayTasks(userId),
  fetchRecentItems(userId),
  fetchMetrics(userId),
]);

// Quick actions are static config (no fetch needed)
```

### Update Strategy

- **Critical Issues:** Poll every 30 seconds
- **Today's Work:** Poll every 60 seconds
- **Resume Work:** Update on user navigation
- **Quick Actions:** Static (no updates)
- **Metrics:** Poll every 5 minutes

### Optimistic Updates

```typescript
// Mark task as completed immediately
onCompleteTask(taskId);

// Update UI optimistically
setTasks(tasks.map(t => 
  t.id === taskId ? { ...t, status: 'completed' } : t
));

// Sync with server in background
api.completeTask(taskId).catch(handleError);
```

---

## Summary

The Operational Workspace System provides:

✅ **5 Distinct Zones** for organized task management  
✅ **Role-Aware Configs** for 5+ healthcare roles  
✅ **Action-Oriented Design** with one-click access  
✅ **Real-Time Updates** as work progresses  
✅ **Priority Management** surfacing urgent items first  
✅ **Quick Access** to recent patients/admissions  
✅ **Operational Metrics** with trends and targets  
✅ **Responsive Layout** for all devices  
✅ **Customizable** for new roles  
✅ **Production-Ready** implementation  

**Result:** Healthcare staff land on a workspace tailored to their role with immediate visibility into what requires attention and one-click access to take action—dramatically reducing navigation time and improving operational efficiency.
