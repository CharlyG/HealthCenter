# Clinical Module - Visual Reference

```
═══════════════════════════════════════════════════════════════════════════════
CLINICAL MODULE NAVIGATION
═══════════════════════════════════════════════════════════════════════════════

Main Menu → Clinical → Dashboard
                        ├── Visit Notes
                        ├── Plans of Care
                        ├── Verbal Orders
                        └── QA Review


═══════════════════════════════════════════════════════════════════════════════
CLINICAL DASHBOARD (/clinical)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  📄 Clinical Documentation                                                   │
│  Visit notes, plans of care, and quality assurance                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Documents    │ Pending      │ In QA Review │ Completed    │
│ In Progress  │ Signatures   │              │ This Week    │
│     0        │     0        │     0        │     0        │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────┬─────────────────────────────────┐
│  📄 Visit Notes                 │  📋 Plans of Care               │
│  Discipline-specific clinical   │  POC creation, updates, and     │
│  visit documentation            │  signature tracking             │
│                                 │                                 │
│  Total: 0    Pending: 0        │  Total: 0    Pending: 0        │
│  [Open Visit Notes →]          │  [Open Plans of Care →]        │
└─────────────────────────────────┴─────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────┐
│  ✍️ Verbal Orders                │  ✅ QA Review                    │
│  Track verbal orders and        │  Quality assurance and          │
│  physician signatures           │  document review workflow       │
│                                 │                                 │
│  Total: 0    Pending: 0        │  Total: 0    Pending: 0        │
│  [Open Verbal Orders →]        │  [Open QA Review →]            │
└─────────────────────────────────┴─────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
VISIT NOTES (/clinical/visit-notes)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back    📄 Visit Notes                          [+ New Visit Note]       │
│            Discipline-specific clinical visit documentation                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ In Progress  │ Completed    │ Returned     │ Approved     │
│     0        │     0        │     0        │     0        │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌───────────────────────────┬────────────┬────────────┬────────────┐
│ 🔍 Search patient...      │ [All       │ [All       │            │
│                           │  Disciplines]│ Statuses]  │            │
└───────────────────────────┴────────────┴────────────┴────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Visit Notes (0)                                                            │
│  No visit notes found                                                       │
│                                                                             │
│  📄                                                                          │
│  No visit notes yet                                                         │
│  Create your first visit note to start documenting patient care            │
│                                                                             │
│  [+ Create Visit Note]                                                      │
└─────────────────────────────────────────────────────────────────────────────┘

DISCIPLINES SUPPORTED:
┌────────────────────────────────────────┐
│  • RN  - Registered Nurse              │
│  • LPN - Licensed Practical Nurse      │
│  • PT  - Physical Therapy              │
│  • OT  - Occupational Therapy          │
│  • ST  - Speech Therapy                │
│  • MSW - Medical Social Worker         │
│  • HHA - Home Health Aide              │
│  • CNA - Certified Nursing Assistant   │
└────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
PLANS OF CARE (/clinical/plans-of-care)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back    📋 Plans of Care                        [+ New Plan of Care]     │
│            POC creation, updates, and signature tracking                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ In Progress  │ Pending      │ Returned     │ Approved     │
│              │ Signatures   │              │              │
│     0        │     0        │     0        │     0        │
└──────────────┴──────────────┴──────────────┴──────────────┘

POC TYPES:
┌─────────────────────────────────────┐
│  • Initial POC                      │
│  • Recertification                  │
│  • Revision                         │
│  • Discharge Summary                │
└─────────────────────────────────────┘

SIGNATURE TRACKING:
┌────────────────────────────────────────────────────┐
│  Each POC tracks:                                  │
│  • Required signatures (Physician, RN, PT, etc.)  │
│  • Completed signatures                           │
│  • Pending signatures                             │
│  • Signature date/time                            │
│  • Signer name and role                           │
│                                                    │
│  Example: Signatures: 2/4 ✍️                       │
│  ✅ Physician - Dr. Smith (3/5/2026)              │
│  ✅ RN - Jane Doe (3/5/2026)                       │
│  ⏳ PT - Pending                                   │
│  ⏳ OT - Pending                                   │
└────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
VERBAL ORDERS (/clinical/verbal-orders)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back    ✍️ Verbal Orders                         [+ New Verbal Order]     │
│            Track verbal orders and physician signatures                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Pending      │ Pending      │ Expiring     │ Approved     │
│ Physician    │ Nurse        │ Soon         │              │
│ Signature    │ Signature    │ (≤ 3 days)   │              │
│     0        │     0        │     0        │     0        │
└──────────────┴──────────────┴──────────────┴──────────────┘

ORDER TYPES:
┌─────────────────────────────────────┐
│  • Medication Order                 │
│  • Treatment Order                  │
│  • Diagnostic Test                  │
│  • Therapy Order                    │
│  • Equipment Order                  │
│  • Other                            │
└─────────────────────────────────────┘

DUAL SIGNATURE REQUIREMENT:
┌────────────────────────────────────────────────────┐
│  Every verbal order requires:                      │
│                                                    │
│  1. Nurse Signature (Receiver)                    │
│     • Who received the order                      │
│     • Date/time documented                        │
│                                                    │
│  2. Physician Signature (Ordering Provider)       │
│     • Who gave the order                          │
│     • Verification signature                      │
│                                                    │
│  Status indicators:                               │
│  ✅ Physician: ✓ Signed                           │
│  ⏳ Nurse: Pending                                │
└────────────────────────────────────────────────────┘

EXPIRATION TRACKING:
┌────────────────────────────────────────────────────┐
│  🚨 ALERT: Expires in 2 days                       │
│                                                    │
│  Verbal orders must be signed within regulatory   │
│  timeframe (typically 7-14 days).                 │
│                                                    │
│  System tracks:                                   │
│  • Days until expiration                          │
│  • Visual alerts when ≤ 3 days                    │
│  • Dashboard count of expiring orders             │
└────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
QA REVIEW (/clinical/qa-review)
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back    ✅ QA Review                                                      │
│            Quality assurance and document review workflow                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ In Queue     │ In Review    │ Returned     │ Approved     │
│              │ (assigned)   │              │ Today        │
│     0        │     0        │     0        │     0        │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────┬────────────┬────────────┬────────────┐
│ 🔍 Search│ [All Types]│ [All       │ [All       │
│         │            │  Statuses] │ Priorities]│
└─────────┴────────────┴────────────┴────────────┘

DOCUMENT TYPES IN QUEUE:
┌────────────────────────────────────────┐
│  📄 Visit Notes                        │
│  📋 Plans of Care                      │
│  ✍️ Verbal Orders                      │
└────────────────────────────────────────┘

PRIORITY LEVELS:
┌────────────────────────────────────────┐
│  🔴 HIGH    - Urgent review needed     │
│  🟡 MEDIUM  - Standard timeline        │
│  🟢 LOW     - Non-urgent               │
└────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
QA WORKFLOW - VISUAL DIAGRAM
═══════════════════════════════════════════════════════════════════════════════

Clinician creates document
         │
         ▼
   In Progress
   (Draft state)
         │
         ▼
  Clinician completes
         │
         ▼
    Completed
  (Submitted for QA)
         │
         ▼
┌────────────────────┐
│   QA Review Queue  │
│                    │
│  • Assigned to QA  │
│  • In Review       │
│  • Days in queue   │
└────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│    QA Reviewer Decision        │
├────────────────────────────────┤
│                                │
│  Option 1: APPROVE             │
│  Option 2: RETURN              │
│                                │
└────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Approved   Returned
  (Final)   (w/ reason)
              │
              ▼
      Clinician corrects
              │
              ▼
         Corrected
       (Resubmitted)
              │
              ▼
   Back to QA Queue
      (Step 4)


═══════════════════════════════════════════════════════════════════════════════
QA STATUS INDICATORS
═══════════════════════════════════════════════════════════════════════════════

⏰  In Progress         [Gray]     Author working on document
📤  Completed           [Blue]     Submitted, awaiting QA
⚠️  Returned            [Red]      Sent back for corrections
✏️  Corrected           [Amber]    Fixed and resubmitted
✅  Approved            [Green]    Passed QA review


═══════════════════════════════════════════════════════════════════════════════
EXAMPLE DOCUMENT CARD
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│  ⏰  Johnson, Mary                [MRN-12345]  [RN Visit Note]              │
│                                                                             │
│  Visit: 3/5/2026  Clinician: Jane Doe, RN  Service: Skilled Nursing       │
│  Modified: 3/5/2026 10:30 AM  • Signed: 3/5/2026 2:15 PM                  │
│                                                                             │
│  [In Progress]                                                        →    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  📋  Smith, John                  [MRN-67890]  [Initial POC]               │
│                                                                             │
│  Period: 3/1/2026 - 5/30/2026  Created by: Dr. Anderson                   │
│  Modified: 3/4/2026 4:45 PM  • ✍️ Signatures: 2/4                          │
│                                                                             │
│  [Completed]  [Pending Signatures]                                    →    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚠️  Davis, Robert                [MRN-11223]  [Medication Order]          │
│                                                                             │
│  Digoxin 0.25mg daily PO                                                   │
│  Ordered by: Dr. Wilson  Received by: Sarah Lee, RN  Date: 2/28/2026      │
│  ✓ Physician: ✓ Signed  ✓ Nurse: ✓ Signed                                 │
│                                                                             │
│  [Returned for Correction]  🚨 Expires in 2 days                      →    │
│                                                                             │
│  Return reason: Please clarify dosing schedule and duration               │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
MOBILE VIEW
═══════════════════════════════════════════════════════════════════════════════

  ┌─────────────────┐
  │ 📄 Clinical     │
  ├─────────────────┤
  │                 │
  │ [0] In Progress │
  │ [0] Pending Sig │
  │ [0] In QA       │
  │ [0] Completed   │
  │                 │
  ├─────────────────┤
  │                 │
  │ 📄 Visit Notes  │
  │ Discipline docs │
  │ [Open →]        │
  │                 │
  ├─────────────────┤
  │                 │
  │ 📋 Plans of Care│
  │ POC + signatures│
  │ [Open →]        │
  │                 │
  ├─────────────────┤
  │                 │
  │ ✍️ Verbal Orders│
  │ Track orders    │
  │ [Open →]        │
  │                 │
  ├─────────────────┤
  │                 │
  │ ✅ QA Review    │
  │ Doc workflow    │
  │ [Open →]        │
  │                 │
  └─────────────────┘


═══════════════════════════════════════════════════════════════════════════════
INTEGRATION POINTS
═══════════════════════════════════════════════════════════════════════════════

Clinical Module integrates with:

1. PATIENT MODULE
   ├─ Patient demographics
   ├─ Patient MRN
   └─ Patient chart access

2. ADMISSIONS MODULE
   ├─ Admission linkage
   ├─ Diagnosis codes
   └─ Insurance information

3. SCHEDULING MODULE
   ├─ Scheduled visits
   ├─ Visit completion status
   └─ Clinician assignments

4. POINT OF CARE MODULE
   ├─ Visit clock in/out
   ├─ Visit location data
   └─ EVV verification

5. MONITOR MODULE
   ├─ Document completion tracking
   ├─ Compliance reporting
   └─ Quality metrics

Future integrations:
6. Electronic Signature Providers
7. Document Management Systems
8. Billing/Claims Systems
9. State Reporting Systems


═══════════════════════════════════════════════════════════════════════════════
KEYBOARD SHORTCUTS (Future)
═══════════════════════════════════════════════════════════════════════════════

Global:
  Ctrl/Cmd + K       → Quick search
  Ctrl/Cmd + N       → New document
  Esc                → Close modal/dialog

Visit Notes:
  Ctrl/Cmd + S       → Save draft
  Ctrl/Cmd + Enter   → Submit for QA
  Ctrl/Cmd + D       → Duplicate previous note

QA Review:
  A                  → Approve document
  R                  → Return document
  N                  → Next document
  P                  → Previous document
```
