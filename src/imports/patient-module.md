Implement the Patient module.

Features include:

Patient List
Searchable and filterable list with:
- name
- DOB
- MRN
- office
- status
- alerts

Patient Chart
Use a split layout:

Left navigation
Overview
Admissions
Visits
Clinical
Documents
Billing
Hospice
Activity

Main panel displays selected section.

Right drawer displays contextual information:
- alerts
- care team
- payer snapshot
- recent documents
- activity feed

Demographics
Fields include:
- name
- DOB
- gender
- address
- phone
- email

Alternate Locations
Patients can have multiple service addresses.
Locations support logical deletion so historical visits retain references.

Referrals
Track referral source and referral date.

Patient data must be stored in PostgreSQL and retrieved through the data gateway.