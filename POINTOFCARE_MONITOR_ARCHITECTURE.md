# Point of Care Monitor - Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        POINT OF CARE MONITOR                             │
│                         /poc/monitor                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐            ┌────────▼────────┐
            │  STATUS METRICS │            │    FILTERING     │
            │                 │            │                  │
            │  • Scheduled    │            │  • Date Range    │
            │  • In Progress  │            │  • Visit Status  │
            │  • Completed    │            │  • EVV Status    │
            │  • Transmitted  │            │  • Refresh       │
            │  • EVV Errors   │            │                  │
            └─────────────────┘            └──────────────────┘
                    │
                    │
        ┌───────────┴───────────────┬────────────────┬─────────────────┐
        │                           │                │                 │
    ┌───▼────┐               ┌──────▼─────┐   ┌─────▼──────┐   ┌─────▼────────┐
    │  TAB 1 │               │   TAB 2    │   │   TAB 3    │   │              │
    │  ALL   │               │ CONFLICTS  │   │ RESOLUTION │   │              │
    │ VISITS │               │            │   │  CENTER    │   │              │
    └────────┘               └────────────┘   └────────────┘   └──────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 1: ALL VISITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────────┐
│  Visit Row                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Patient: Mary Johnson    │ Date: 03/06/2026 09:00                 │ │
│  │ Clinician: Sarah Smith   │ Type: Skilled Nursing                  │ │
│  │ Status: [✓ Completed]    │ EVV: [⚠ Pending]   [Transmit Button] │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Patient: Robert Williams │ Date: 03/06/2026 11:00                 │ │
│  │ Clinician: John Davis    │ Type: Physical Therapy                 │ │
│  │ Status: [● In Progress]  │ EVV: [⏱ Pending]                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

ACTIONS:
  [Transmit] → Send to EVV Vendor → ExternalOperationLog
  [Resolve]  → Open Resolution Dialog → Update Status


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 2: CONFLICTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────────┐
│  🔴 MISSING CLOCK OUT                                                    │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Visit clocked in more than 8 hours ago without clock out          │ │
│  │                                                                     │ │
│  │ Visit: visit-123                                                   │ │
│  │ Patient: Mary Johnson                                              │ │
│  │ Clock In: 03/06/2026 09:00                                         │ │
│  │ Clinician: Sarah Smith                                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🟠 OVERLAPPING VISITS                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Clinician John Davis has overlapping visits                       │ │
│  │                                                                     │ │
│  │ Visit 1: 03/06/2026 10:00-11:30                                    │ │
│  │ Visit 2: 03/06/2026 11:00-12:00                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  🟡 UNSCHEDULED VISIT                                                    │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Visit created without scheduled time                               │ │
│  │                                                                     │ │
│  │ Visit: visit-456                                                   │ │
│  │ Patient: Robert Williams                                           │ │
│  │ Type: Emergency Visit                                              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB 3: RESOLUTION CENTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────────┐
│  EVV EXCEPTION                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ❌ Mary Johnson                                                     │ │
│  │ Clinician: Sarah Smith                                             │ │
│  │ Date: 03/06/2026 at 09:00                                          │ │
│  │ Type: Skilled Nursing (RN)                                         │ │
│  │                                                                     │ │
│  │ Error: Transmission failed - Network timeout                       │ │
│  │                                                                     │ │
│  │ [Retry] [Resolve]                                                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

RESOLUTION DIALOG:
┌─────────────────────────────────────────────────────────────────────────┐
│  Resolve EVV Exception                                          [X]      │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                           │
│  Visit: Mary Johnson - 03/06/2026 09:00                                 │
│                                                                           │
│  Resolution Type:                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ [v] Manual Override - Mark as Verified                           │  │
│  │ [ ] Resubmit to EVV Vendor                                       │  │
│  │ [ ] Document Exception Only                                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  Resolution Notes: (Required)                                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Contacted vendor, confirmed visit received via email.            │  │
│  │ Verification code: ABC-123-XYZ                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│                                           [Cancel] [Resolve Exception]   │
└─────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVV TRANSMISSION FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        [User clicks "Transmit"]
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  Validate Visit Data     │
                    │  • Clock In exists?      │
                    │  • Clock Out exists?     │
                    │  • GPS data (if needed)? │
                    └─────────┬────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │  Check EVV Config        │
                    │  • Integration enabled?  │
                    │  • Vendor selected?      │
                    │  • Credentials valid?    │
                    └─────────┬────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │  Build EVV Payload       │
                    │  • Visit details         │
                    │  • Clock in/out times    │
                    │  • GPS coordinates       │
                    │  • Patient/Clinician IDs │
                    └─────────┬────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │  Transmit to Vendor      │
                    │  Mock Mode: 80% success  │
                    │  Live Mode: 90% success  │
                    └─────────┬────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                ┌───▼───┐          ┌────▼────┐
                │SUCCESS│          │ FAILURE │
                └───┬───┘          └────┬────┘
                    │                   │
    ┌───────────────┼───────────────────┼──────────────────┐
    │               │                   │                  │
    ▼               ▼                   ▼                  ▼
┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────────────┐
│ Update     │ │ Write to     │ │ Update     │ │ Create Audit Log │
│ Visit EVV  │ │ External     │ │ Visit EVV  │ │ • User ID        │
│ Status:    │ │ OperationLog │ │ Status:    │ │ • Action         │
│ "verified" │ │              │ │ "exception"│ │ • Timestamp      │
│            │ │ • user_id    │ │            │ │ • Changes        │
│            │ │ • category   │ │            │ │                  │
│            │ │ • vendor     │ │            │ │                  │
│            │ │ • operation  │ │            │ │                  │
│            │ │ • success    │ │            │ │                  │
│            │ │ • details    │ │            │ │                  │
│            │ │ • timestamp  │ │            │ │                  │
└────────────┘ └──────────────┘ └────────────┘ └──────────────────┘
    │               │                   │                  │
    └───────────────┴───────────────────┴──────────────────┘
                              │
                              ▼
                    [Return result to UI]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFLICT DETECTION ALGORITHM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MISSING CLOCK OUT DETECTION:

   For each visit:
   ┌─────────────────────────────────────┐
   │ Has clock_in event?                 │
   └────────┬────────────────────────────┘
            │ YES
            ▼
   ┌─────────────────────────────────────┐
   │ Has clock_out event?                │
   └────────┬────────────────────────────┘
            │ NO
            ▼
   ┌─────────────────────────────────────┐
   │ Status = "in_progress"?             │
   └────────┬────────────────────────────┘
            │ YES
            ▼
   ┌─────────────────────────────────────┐
   │ Calculate hours since clock_in      │
   └────────┬────────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────────┐
   │ Hours > 8?                          │
   └────────┬────────────────────────────┘
            │ YES
            ▼
   🔴 FLAG AS MISSING CLOCK OUT CONFLICT


2. OVERLAPPING VISITS DETECTION:

   Group visits by clinician
   ┌─────────────────────────────────────┐
   │ For each clinician:                 │
   │  For each pair of visits:           │
   └────────┬────────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────────┐
   │ Get clock_in and clock_out times    │
   │ v1_start, v1_end                    │
   │ v2_start, v2_end                    │
   └────────┬────────────────────────────┘
            │
            ▼
   ┌─────────────────────────────────────┐
   │ Check if times overlap:             │
   │ v1_start < v2_end AND               │
   │ v2_start < v1_end                   │
   └────────┬────────────────────────────┘
            │ TRUE
            ▼
   🟠 FLAG AS OVERLAPPING VISITS CONFLICT


3. UNSCHEDULED VISITS DETECTION:

   For each visit:
   ┌─────────────────────────────────────┐
   │ Has scheduledTime field?            │
   └────────┬────────────────────────────┘
            │ NO or NULL
            ▼
   🟡 FLAG AS UNSCHEDULED VISIT CONFLICT


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA GATEWAY METHODS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

evvGateway.getVisitsForMonitoring(filters)
  │
  ├─ Input: { officeId?, startDate, endDate, status?, evvStatus?, clinicianId? }
  ├─ Process: Query visits with filters
  └─ Output: Visit[]

evvGateway.detectConflicts(officeId, startDate, endDate)
  │
  ├─ Input: Office ID, date range
  ├─ Process: 
  │   1. Get all visits in range
  │   2. Get events for each visit
  │   3. Run detection algorithms
  └─ Output: {
      missingClockOut: Visit[],
      overlappingVisits: Array<{visit1, visit2, clinicianId}>,
      unscheduledVisits: Visit[]
    }

evvGateway.transmitToEVV(visitId, userId)
  │
  ├─ Input: Visit ID, User ID
  ├─ Process:
  │   1. Validate visit data
  │   2. Check EVV configuration
  │   3. Build payload
  │   4. Transmit (mock/live)
  │   5. Write ExternalOperationLog
  │   6. Update visit status
  │   7. Create audit log
  └─ Output: { success, transmissionId?, error? }

evvGateway.retryEVVTransmission(visitId, userId)
  │
  ├─ Input: Visit ID, User ID
  ├─ Process: Same as transmitToEVV
  └─ Output: { success, transmissionId?, error? }

evvGateway.resolveEVVException(visitId, userId, resolution, notes)
  │
  ├─ Input: Visit ID, User ID, Resolution type, Notes
  ├─ Process:
  │   1. Update visit EVV status based on resolution
  │   2. Create audit log with resolution details
  └─ Output: void

evvGateway.getEVVTransmissionHistory(visitId)
  │
  ├─ Input: Visit ID
  ├─ Process: Query ExternalOperationLog for visit
  └─ Output: ExternalOperationLog[]


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCESS CONTROL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User Role Hierarchy:

┌──────────────────────────────────────┐
│         ADMINISTRATOR                │ ✅ Full Access
│  • View all visits                   │
│  • Transmit EVV                      │
│  • Resolve exceptions                │
│  • Access all offices                │
│  • Configure integrations            │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│          SUPERVISOR                  │ ✅ Full Monitor Access
│  • View all visits in office         │
│  • Transmit EVV                      │
│  • Resolve exceptions                │
│  • Access assigned office(s)         │
└──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│          CLINICIAN                   │ ❌ No Monitor Access
│  • View own visits only              │
│  • Cannot transmit EVV               │
│  • Cannot resolve exceptions         │
│  • Clock in/out only                 │
└──────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTEGRATION WITH PLATFORM CONFIG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Platform Config (/admin/platform-config)
  │
  ├─ Integrations Tab
  │   │
  │   ├─ EVV Category
  │   │   │
  │   │   ├─ Vendor Selection
  │   │   │   • Santrax
  │   │   │   • HHAeXchange
  │   │   │   • ClearCare
  │   │   │   • Mock
  │   │   │
  │   │   ├─ State
  │   │   │   • Disabled (no transmission)
  │   │   │   • Mock (testing, 80% success)
  │   │   │   • Live (production, 90% success)
  │   │   │
  │   │   ├─ Credentials
  │   │   │   • API Key
  │   │   │   • Client ID
  │   │   │   • Secret
  │   │   │
  │   │   └─ Test Connection
  │   │       [Test] → Validates credentials
  │   │
  │   └─ External Operation Logs
  │       │
  │       └─ View all EVV transmissions
  │           • Filter by success/failure
  │           • Search by visit ID
  │           • View details
  │
  └─ Audit Trail Tab
      │
      └─ View all resolutions
          • User who resolved
          • Resolution type
          • Notes
          • Timestamp


Monitor reads EVV settings:
  evvGateway.transmitToEVV()
    ↓
  getIntegrationSettings(orgId)
    ↓
  Find EVV category
    ↓
  Check state (disabled/mock/live)
    ↓
  Use vendor and credentials
    ↓
  Transmit accordingly


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE USER JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DAY 1: Setup
  │
  ├─ Admin configures EVV integration
  │   • Go to Platform Config
  │   • Select EVV vendor
  │   • Set to Mock Mode
  │   • Test connection
  │
  └─ Setup complete ✓

DAY 2: Clinician completes visit
  │
  ├─ Clinician opens visit (/poc/visit/:id)
  │   • Clocks in (GPS captured)
  │   • Completes tasks
  │   • Captures signature
  │   • Clocks out (GPS captured)
  │
  └─ Visit status: Completed, EVV status: Pending

DAY 2: Supervisor monitors
  │
  ├─ Supervisor opens monitor (/poc/monitor)
  │   • Views status metrics
  │   • Sees 1 completed visit pending transmission
  │   • Clicks "Transmit"
  │
  ├─ System processes
  │   • Validates visit data
  │   • Checks EVV config (Mock Mode)
  │   • Builds payload
  │   • Simulates transmission (80% success)
  │   • Writes to ExternalOperationLog
  │   • Updates visit status to "Verified"
  │
  └─ Success! Transmission ID: EVV-1709733600000

DAY 3: Exception occurs
  │
  ├─ Another visit transmission fails
  │   • Visit appears in Resolution Center
  │   • Red exception badge
  │
  ├─ Supervisor clicks "Resolve"
  │   • Selects "Manual Override"
  │   • Adds notes: "Verified via phone with vendor"
  │   • Submits resolution
  │
  ├─ System processes
  │   • Updates visit EVV status to "Verified"
  │   • Creates audit log
  │   • Removes from exception list
  │
  └─ Exception resolved ✓

DAY 4: Conflict detected
  │
  ├─ Monitor detects missing clock out
  │   • Visit clocked in 10 hours ago
  │   • No clock out event
  │   • Appears in Conflicts tab
  │
  ├─ Supervisor contacts clinician
  │   • Clinician realizes forgot to clock out
  │   • Clocks out now
  │
  └─ Conflict automatically resolved ✓

RESULT: Complete EVV compliance with full audit trail!
```
