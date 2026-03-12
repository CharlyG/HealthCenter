Create the Platform Configuration section for administrators.

This section must support configuring modules, features, and vendor integrations.

Modules
Create a module catalog and allow enabling or disabling modules per organization.

Modules include:
Patients
Admissions
Scheduling
CareConnect
Monitor
Clinical
Billing
Hospice
Reports
Notifications
Integrations

Feature Flags
Allow enabling/disabling specific features inside modules.

Examples:
- Open Shift Notifications
- Delayed Visit Notifications
- EVV Transmission
- Voice Signature
- Offline Visits
- IDG Center
- HOPE Assessments

Integrations
Define integration categories:

EVV
SMS
Email
Push Notifications
Medication Services
Fax
Maps / Travel

Each category must allow selecting an active vendor from a catalog.

Example vendors:

EVV
- HHAeXchange
- Sandata
- Netsmart
- Mock

SMS
- Twilio
- Plivo
- Mock

Medication
- Medispan
- BetterRx
- None

Each integration must support states:
Disabled
Mock Mode
Live Mode

Include fields for vendor credentials and connection test.

All integration activity must be logged in an ExternalOperationLog table.