# Offline Mode System - Visual Guide

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLINICIAN WORKFLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. CREATE DOCUMENTATION                                     │
│     ├─ Visit notes                                          │
│     ├─ Vital signs                                          │
│     ├─ Medications                                          │
│     └─ Assessments                                          │
│                          │                                   │
│                          ▼                                   │
│  2. SAVE/SUBMIT                                             │
│     └─ Add to sync queue                                    │
│                          │                                   │
│                          ▼                                   │
│  3. SYNC QUEUE                                              │
│     ├─ If ONLINE: Sync immediately                          │
│     └─ If OFFLINE: Store locally                            │
│                          │                                   │
│                          ▼                                   │
│  4. AUTO-SYNC                                               │
│     └─ When connection restored                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📱 User Interface Components

### 1. Top Banner (When Offline or Has Unsynced)
```
╔═══════════════════════════════════════════════════════════╗
║ 🚫 You're working offline                                 ║
║ 5 records waiting to sync                   [View Queue] ║
╚═══════════════════════════════════════════════════════════╝
```

**States:**
- 🔴 **RED** - Offline with pending records
- 🟡 **YELLOW** - Online but syncing in progress
- 🟢 **Hidden** - Online and all synced

### 2. Floating Status Badge (Always Visible)
```
                                    ┌───────────────┐
                                    │   🌐 Offline  │
                                    │   3 pending ③ │
                                    └───────────────┘
```

**Click to open:** Full sync queue modal

**Badge Colors:**
- 🔴 Red: Offline
- 🟡 Yellow: Online but unsynced items
- 🟢 Green: Online and all synced

### 3. Sync Queue Modal (Full Management)

```
╔═══════════════════════════════════════════════════════════════╗
║  🔄 Sync Queue                                           [X]  ║
╠═══════════════════════════════════════════════════════════════╣
║  🌐 Connected                                                 ║
║  Last sync: 2:45 PM                          [Sync Now]      ║
╠═══════════════════════════════════════════════════════════════╣
║  📊 SYNC PROGRESS                                             ║
║  Syncing record 2 of 5                                  40%  ║
║  ▓▓▓▓▓▓▓▓░░░░░░░░░░                                          ║
╠═══════════════════════════════════════════════════════════════╣
║  📈 STATISTICS                                                ║
║  ┌─────────┬──────────┬─────────┬─────────┐                 ║
║  │ Total   │ Pending  │ Failed  │ Synced  │                 ║
║  │   8     │    3     │   1     │   4     │                 ║
║  └─────────┴──────────┴─────────┴─────────┘                 ║
╠═══════════════════════════════════════════════════════════════╣
║  📋 QUEUE ITEMS                                               ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────┐    ║
║  │ 📄 Mary Johnson - Visit Documentation        [✓]     │    ║
║  │    Section: Patient Status                           │    ║
║  │    Created: 2:30 PM                    [Synced] [×] │    ║
║  │    ▼ Show Data                                       │    ║
║  └──────────────────────────────────────────────────────┘    ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────┐    ║
║  │ ❤️ John Smith - Vital Signs                  [⏳]    │    ║
║  │    BP: 120/80, HR: 72, Temp: 98.6°F                 │    ║
║  │    Created: 2:35 PM                    [Pending]     │    ║
║  └──────────────────────────────────────────────────────┘    ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────┐    ║
║  │ 💊 Robert Davis - Medication             [❌]        │    ║
║  │    Lisinopril 10mg, Oral                             │    ║
║  │    Error: Network timeout                            │    ║
║  │    Retry attempts: 2/3            [Retry] [×]        │    ║
║  └──────────────────────────────────────────────────────┘    ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────┐    ║
║  │ 👤 Sarah Wilson - Assessment              [⏳]       │    ║
║  │    Pain Assessment, Level 5/10                       │    ║
║  │    Created: 2:40 PM                    [Pending]     │    ║
║  └──────────────────────────────────────────────────────┘    ║
╠═══════════════════════════════════════════════════════════════╣
║  ℹ️ Records are stored securely on your device               ║
║                                              [Clear All]      ║
╚═══════════════════════════════════════════════════════════════╝
```

## 🔄 Sync Flow Diagram

```
                    USER ACTION
                        │
                        ▼
              ┌─────────────────┐
              │  Create/Edit    │
              │  Documentation  │
              └─────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   Save/Submit   │
              └─────────────────┘
                        │
                        ▼
         ┌──────────────┴──────────────┐
         │                              │
    [ONLINE]                      [OFFLINE]
         │                              │
         ▼                              ▼
┌─────────────────┐          ┌─────────────────┐
│  Add to Queue   │          │  Add to Queue   │
│  Sync Immediately│         │  Store Locally  │
└─────────────────┘          └─────────────────┘
         │                              │
         ▼                              │
┌─────────────────┐                    │
│  API Request    │                    │
└─────────────────┘                    │
         │                              │
    ┌────┴────┐                        │
    │         │                        │
[SUCCESS] [FAILURE]                    │
    │         │                        │
    ▼         ▼                        │
  Remove   Add to                      │
  from     Failed                      │
  Queue    Queue                       │
           (Retry)                     │
                                       │
            CONNECTION RESTORED ───────┘
                        │
                        ▼
              ┌─────────────────┐
              │   Auto-Sync     │
              │   All Pending   │
              └─────────────────┘
```

## 📊 Item Status States

```
┌──────────┬───────────────────────────────────────────────┐
│  Status  │  Description                                  │
├──────────┼───────────────────────────────────────────────┤
│ PENDING  │  Waiting to be synced                         │
│          │  Color: Gray                                  │
│          │  Icon: ⏳                                      │
├──────────┼───────────────────────────────────────────────┤
│ SYNCING  │  Currently syncing to server                  │
│          │  Color: Blue                                  │
│          │  Icon: 🔄 (spinning)                          │
├──────────┼───────────────────────────────────────────────┤
│ FAILED   │  Sync failed, will retry                      │
│          │  Color: Red                                   │
│          │  Icon: ❌                                      │
│          │  Actions: [Retry] [Delete]                    │
├──────────┼───────────────────────────────────────────────┤
│ SYNCED   │  Successfully synced, will be removed         │
│          │  Color: Green                                 │
│          │  Icon: ✓                                       │
│          │  Auto-removes after 2 seconds                 │
└──────────┴───────────────────────────────────────────────┘
```

## 🎨 Color Coding System

### Banner Colors
```
🔴 RED BANNER
┌────────────────────────────────────┐
│ 🚫 OFFLINE                         │
│ You're working offline             │
└────────────────────────────────────┘
Used when: Device is offline

🟡 YELLOW BANNER
┌────────────────────────────────────┐
│ ⚠️ SYNCING                         │
│ 3 records waiting to sync          │
└────────────────────────────────────┘
Used when: Online but unsynced items

🟢 GREEN (NO BANNER)
Used when: Online and all synced
```

### Badge Colors
```
🔴 RED BADGE              🟡 YELLOW BADGE           🟢 GREEN BADGE
┌───────────┐            ┌───────────┐            ┌───────────┐
│  Offline  │            │  Online   │            │  Online   │
│ 3 pending │            │ 2 pending │            │ All synced│
└───────────┘            └───────────┘            └───────────┘
```

### Item Cards
```
🟢 GREEN CARD (Synced)
┌────────────────────────────────────┐
│ ✓ Mary Johnson                     │
│   Visit Documentation - Synced     │
└────────────────────────────────────┘

🔵 BLUE CARD (Syncing)
┌────────────────────────────────────┐
│ 🔄 John Smith                      │
│   Vital Signs - Syncing...         │
└────────────────────────────────────┘

🟡 GRAY CARD (Pending)
┌────────────────────────────────────┐
│ ⏳ Sarah Wilson                    │
│   Assessment - Pending             │
└────────────────────────────────────┘

🔴 RED CARD (Failed)
┌────────────────────────────────────┐
│ ❌ Robert Davis                    │
│   Medication - Failed              │
│   Error: Network timeout [Retry]   │
└────────────────────────────────────┘
```

## 🔔 Notification System

### Success Notification
```
┌─────────────────────────────────────┐
│ ✓ Documentation Submitted           │
│   Successfully synced to server     │
└─────────────────────────────────────┘
Duration: 2 seconds
Color: Green
```

### Offline Save Notification
```
┌─────────────────────────────────────┐
│ 💾 Saved Offline                    │
│   Will sync when connection returns │
└─────────────────────────────────────┘
Duration: 3 seconds
Color: Blue
```

### Auto-Sync Notification
```
┌─────────────────────────────────────┐
│ 🔄 Connection Restored              │
│   Syncing 5 pending records...      │
└─────────────────────────────────────┘
Duration: Until sync complete
Color: Yellow → Green
```

## 🧪 Testing Scenarios

### Scenario 1: Normal Online Work
```
1. Clinician creates documentation
2. Click "Submit"
3. Immediately syncs (1 second)
4. Success notification
5. Record disappears from queue
```

### Scenario 2: Go Offline Mid-Work
```
1. Clinician working on documentation
2. Connection drops
3. 🔴 Red banner appears: "You're working offline"
4. Continue working normally
5. Click "Submit"
6. 💾 Blue notification: "Saved Offline"
7. Item added to queue (status: PENDING)
8. Badge shows "3 pending"
```

### Scenario 3: Connection Restored
```
1. Device was offline with 3 pending records
2. Connection returns
3. 🔄 Auto-sync starts automatically
4. Banner changes: "Syncing 3 records..."
5. Progress bar: "Syncing record 1 of 3... 33%"
6. Each item syncs one by one
7. Success: Items turn green ✓
8. Banner disappears
9. Badge shows "Online - All synced"
```

### Scenario 4: Sync Failure
```
1. Item attempts to sync
2. Network timeout occurs
3. Item status: FAILED ❌
4. Red card with error message
5. Auto-retry attempt 1 (after 5 sec)
6. Auto-retry attempt 2 (after 10 sec)
7. Auto-retry attempt 3 (after 20 sec)
8. If still fails: Manual [Retry] button available
9. Clinician can click [Retry] or [Delete]
```

## 🎯 Key Features Summary

### ✅ Work Without Interruption
- Clinicians can document even when offline
- No error messages blocking work
- Smooth offline → online transition

### ✅ Clear Status Indication
- Color-coded indicators (red/yellow/green)
- Visual badge always visible
- Banner when attention needed

### ✅ Automatic Synchronization
- Auto-sync when connection restored
- No manual intervention required
- Progress tracking

### ✅ Manual Control
- Manual sync button
- Retry failed items
- Delete unwanted items
- Clear entire queue

### ✅ Data Persistence
- Local storage (survives page refresh)
- Secure storage on device
- Cleared after successful sync

### ✅ Error Handling
- Automatic retry (up to 3 times)
- Error messages displayed
- Manual retry option
- Delete option for stuck items

## 📱 Mobile Optimization

```
MOBILE VIEW (Portrait)
┌─────────────────────┐
│ 🚫 Offline          │
│ 3 pending [View]    │
├─────────────────────┤
│                     │
│   Content Area      │
│                     │
│                     │
└─────────────────────┘
         │
         │  Badge
         ▼
    ┌─────────┐
    │Offline 3│
    └─────────┘
```

### Mobile Sync Queue
```
┌───────────────────────┐
│ Sync Queue       [X] │
├───────────────────────┤
│ 🌐 Connected          │
│ [Sync Now]            │
├───────────────────────┤
│ Total: 3  Pending: 2 │
├───────────────────────┤
│                       │
│ 📄 Mary Johnson       │
│ Visit Doc [Pending]   │
│                       │
│ ❤️ John Smith        │
│ Vitals [Syncing]      │
│                       │
│ 💊 Robert Davis       │
│ Medication [Failed]   │
│ [Retry]               │
│                       │
└───────────────────────┘
```

## 🚀 Performance

- **Storage**: LocalStorage (5-10MB typical browser limit)
- **Queue Size**: No hard limit, but recommend < 100 items
- **Sync Speed**: ~1 second per item
- **Batch Sync**: Processes items sequentially
- **Memory**: Minimal impact (<5MB RAM)

## 🔐 Security

- Data stored only on device
- Cleared after successful sync
- No sensitive data in memory after sync
- HIPAA-compliant when properly configured
- SSL/TLS for all API calls
