Design the navigation and workspace system for the healthcare platform.

Primary navigation must include:

Home / Workspace
Patients
Admissions
Scheduling
CareConnect
Monitor / EVV
Clinical
Billing / A/R
Hospice
Reports
Admin / Platform

Navigation must use a persistent sidebar with expandable groups.

Workspace Behavior
The home screen must be role-aware and display operational work queues rather than analytics dashboards.

Define role-based workspaces for:

Intake / Admissions
Scheduler / Coordinator
Clinician
QA Reviewer
Billing / A/R
Hospice / Medical Director
Administrator

Each workspace must include:

Need Attention Now
- admissions incomplete
- delayed visits
- EVV errors
- missing signatures
- QA returns
- HOPE due

Today
- today's visits
- open shifts
- auth expiring
- certifications due

Resume Work
- recently opened patients
- recent admissions
- recent documents

Quick Actions
- create patient
- create admission
- schedule visit
- post open shift
- open EVV monitor
- upload document

Global productivity features
- global search
- command palette
- quick patient switch
- quick admission switch
- notification center

Patient Context
When a patient or admission is selected, display a sticky PatientContextHeader showing:
- patient name
- DOB / age
- MRN
- office
- admission status
- payer tags
- discipline tags
- alerts
- quick actions

Ensure navigation minimizes context switching and supports fast operational workflows.