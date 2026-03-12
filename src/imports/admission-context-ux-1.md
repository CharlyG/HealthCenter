Improve the UX of the healthcare platform by introducing a clear Admission Context system.

Most clinical workflows are based on the patient's current admission rather than the patient record itself.

Design the interface so that when a user opens a patient chart, they must clearly see and select the active admission.

Patient Context Header

Continue displaying the patient header with:

Patient name
DOB / age
MRN
Office
Alerts
Quick actions

Admission Context Bar

Below the patient header, add a dedicated Admission Context Bar.

The bar should display:

Admission start date
Admission status
Primary payer
Disciplines involved
Case manager
Authorization status

Admission Switcher

If the patient has multiple admissions, include a dropdown allowing users to switch the active admission.

Switching the admission must automatically update all admission-based modules.

Admission-Based Modules

The following modules must automatically filter data based on the selected admission:

Visits
Clinical documentation
Assessments (OASIS / HOPE)
Plans of care
Verbal orders
Authorizations
Billing records
Scheduling
Care team assignments

Patient-Level Modules

These modules remain patient-level and should not change when switching admissions:

Demographics
Alternate locations
Patient document library
Referral history
Patient alerts

Visual Indicators

Use clear labels and tags to distinguish admission-level data from patient-level data.

Example labels:

Admission Document
Patient Document
Admission Visit
Patient Note

The goal is to eliminate confusion about which admission users are working with.