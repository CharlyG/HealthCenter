# Navigation Menu - Visual Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                      HEALTHCARE SYSTEM                           │
│                       Left Sidebar Menu                          │
└─────────────────────────────────────────────────────────────────┘

  BEFORE (Old)                          AFTER (New)
  ────────────────────────────────────────────────────────────────

  ┌─────────────────┐                   ┌─────────────────┐
  │ 👥 Patients     │                   │ 👥 Patients     │
  └─────────────────┘                   └─────────────────┘
           ↓                                     ↓
  ┌─────────────────┐                   ┌─────────────────┐
  │ 📋 Admissions   │                   │ 📋 Admissions   │
  └─────────────────┘                   └─────────────────┘
           ↓                                     ↓
  ┌─────────────────┐                   ┌─────────────────┐
  │ 📅 Scheduling   │                   │ 📅 Scheduling   │
  └─────────────────┘                   └─────────────────┘
           ↓                                     ↓
  ┌─────────────────┐                   ┌─────────────────┐
  │ 💓 CareConnect  │  ─────────▶       │ 💓 Point of Care│ ✨
  │ Care coordination│                  │ Visit docs & EVV│
  └─────────────────┘                   └─────────────────┘
           ↓                                     ↓
  ┌─────────────────┐                   ┌─────────────────┐
  │ 📊 Monitor / EVV│                   │ 📊 Monitor / EVV│
  └─────────────────┘                   └─────────────────┘
           ↓                                     ↓
  ┌─────────────────┐                   ┌─────────────────┐
  │ ❤️  Hospice     │                   │ ❤️  Hospice     │
  └─────────────────┘                   └─────────────────┘
           ↓                                     ↓
  ┌─────────────────┐                   ┌─────────────────┐
  │ ⚙️  Admin       │                   │ ⚙️  Admin       │
  └─────────────────┘                   └─────────────────┘


═══════════════════════════════════════════════════════════════════
POINT OF CARE - EXPANDED VIEW
═══════════════════════════════════════════════════════════════════

┌───────────────────────────────────────────────────────────────────┐
│  💓 Point of Care                                                 │
│  Visit documentation and Electronic Visit Verification            │
└───────────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        │                   │                   │
    ┌───▼────┐         ┌────▼────┐        ┌────▼────┐
    │/poc    │         │/poc/    │        │/poc/    │
    │        │         │visit/:id│        │monitor  │
    │My Visits│        │         │        │         │
    │        │         │Visit    │        │Supervisor│
    │Caregiver│        │Detail   │        │Dashboard │
    │Workspace│        │         │        │         │
    └────────┘         └─────────┘        └─────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ View visits  │    │ Clock in/out │    │ Monitor EVV  │
│ By date      │    │ Document     │    │ Conflicts    │
│ Start visits │    │ Capture sig  │    │ Transmissions│
│ Create manual│    │ GPS verify   │    │ Exceptions   │
└──────────────┘    └──────────────┘    └──────────────┘


═══════════════════════════════════════════════════════════════════
USER JOURNEY COMPARISON
═══════════════════════════════════════════════════════════════════

OLD MENTAL MODEL:
  User clicks "CareConnect"
    ↓
  Expects: Care coordination tools
    ↓
  Sees: Placeholder page
    ↓
  Confused: Where are my visits?

NEW MENTAL MODEL:
  User clicks "Point of Care"
    ↓
  Expects: Clinical documentation
    ↓
  Clicks → Goes to /poc
    ↓
  Sees: My Visits workspace
    ↓
  Clear: This is where I document visits!


═══════════════════════════════════════════════════════════════════
MODULE RELATIONSHIPS
═══════════════════════════════════════════════════════════════════

                    ┌─────────────────┐
                    │   ADMISSIONS    │
                    │  (Office staff) │
                    └────────┬────────┘
                             │
                             ▼ Patient admitted
                    ┌─────────────────┐
                    │   SCHEDULING    │
                    │  (Coordinators) │
                    └────────┬────────┘
                             │
                             ▼ Visits scheduled
                    ┌─────────────────┐
                    │ POINT OF CARE   │ ✨
                    │  (Caregivers)   │
                    │                 │
                    │ • View visits   │
                    │ • Clock in/out  │
                    │ • Document      │
                    │ • Capture sig   │
                    └────────┬────────┘
                             │
                             ▼ Visits completed
                    ┌─────────────────┐
                    │  MONITOR / EVV  │
                    │ (Supervisors)   │
                    │                 │
                    │ • Review visits │
                    │ • Transmit EVV  │
                    │ • Handle errors │
                    └─────────────────┘


═══════════════════════════════════════════════════════════════════
TERMINOLOGY ALIGNMENT
═══════════════════════════════════════════════════════════════════

Industry Standard Terms:

✅ Point of Care (POC)
   - Widely recognized in healthcare
   - Refers to where care is delivered
   - Associated with clinical documentation

✅ Electronic Visit Verification (EVV)
   - Medicaid requirement
   - Federal mandate
   - Industry standard term

❌ CareConnect
   - Generic term
   - Not healthcare-specific
   - Unclear purpose


═══════════════════════════════════════════════════════════════════
NAVIGATION BREADCRUMBS
═══════════════════════════════════════════════════════════════════

OLD:
  Home > CareConnect
  Home > Point of Care > My Visits
  Home > Point of Care > Visit Detail

NEW:
  Home > Point of Care
  Home > Point of Care > My Visits
  Home > Point of Care > Visit Detail
  Home > Point of Care > Monitor


═══════════════════════════════════════════════════════════════════
MOBILE VIEW
═══════════════════════════════════════════════════════════════════

  ┌─────────────┐
  │ ☰  Menu     │
  └─────────────┘
        │
        ▼ (Tap to expand)
  ┌─────────────┐
  │ 👥 Patients │
  ├─────────────┤
  │ 📋 Admissions│
  ├─────────────┤
  │ 📅 Scheduling│
  ├─────────────┤
  │ 💓 Point of │
  │    Care  ✨ │ ◀── Updated
  ├─────────────┤
  │ 📊 Monitor  │
  ├─────────────┤
  │ ❤️  Hospice │
  ├─────────────┤
  │ ⚙️  Admin   │
  └─────────────┘


═══════════════════════════════════════════════════════════════════
PERMISSION MATRIX
═══════════════════════════════════════════════════════════════════

Module: Point of Care (careconnect)

Role            | View POC | Access /poc | Clock In/Out | Monitor
─────────────────────────────────────────────────────────────────
Admin           |    ✅    |     ✅      |      ✅      |   ✅
Supervisor      |    ✅    |     ✅      |      ✅      |   ✅
Clinician       |    ✅    |     ✅      |      ✅      |   ❌
Office Staff    |    ✅    |     ❌      |      ❌      |   ❌

Note: Module name change does NOT affect permissions


═══════════════════════════════════════════════════════════════════
SEARCH & HELP
═══════════════════════════════════════════════════════════════════

User searches for:            System suggests:
──────────────────────────────────────────────────────────────────
"careconnect"          →      Point of Care
"visits"               →      Point of Care > My Visits
"clock in"             →      Point of Care > My Visits
"evv"                  →      Point of Care Monitor
"document visit"       →      Point of Care > Visit Detail
"point of care"        →      Point of Care ✨

Auto-redirect:
  /careconnect  →  Shows "Point of Care" placeholder
  /poc          →  Shows "My Visits" workspace


═══════════════════════════════════════════════════════════════════
ICON LEGEND
═══════════════════════════════════════════════════════════════════

💓 HeartPulse   - Point of Care (clinical care delivery)
👥 Users        - Patients (people management)
📋 ClipboardCheck - Admissions (intake process)
📅 Calendar     - Scheduling (time management)
📊 Activity     - Monitor (oversight & metrics)
❤️  Heart       - Hospice (compassionate care)
⚙️  Settings    - Admin (system configuration)
```
