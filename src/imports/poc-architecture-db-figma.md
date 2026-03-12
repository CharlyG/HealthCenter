1) POC Architecture Rules (so migration to .NET 8 is painless)
Rule A — UI talks to a single “Data Gateway”

In the React project, all reads/writes go through a thin layer:

dataGateway.* for DB CRUD (Supabase today, .NET API tomorrow)

integrationGateway.* for vendor-like actions (EVV transmit, SMS send, etc.) — mocked in POC

Outcome: when you migrate, you swap implementations without touching screens.

Rule B — Keep auth + permissions abstract

Use Supabase Auth now, but build UI permissions around:

Roles

Module toggles

Feature toggles

Office scope

Outcome: later, .NET issues JWTs/claims; UI stays identical.

Rule C — External services are “configurable connectors” even in mock mode

Every integration action writes to an External Operation Log table so the POC behaves like a real system.

2) Minimum Database Model for a “Real” POC (Supabase Postgres)

This is the smallest set that supports your goals (modules on/off, vendor selection, real CRUD, and mocked integrations):

Platform / Config

orgs

offices

modules (catalog)

org_module_settings (enabled/disabled per org/office)

integration_categories (EVV, SMS, Email, Push, Medication, Fax, Maps)

integration_vendors (Twilio, Plivo, HHAeXchange, Sandata, None/Mock, etc.)

org_integration_settings (active vendor + environment + per-office overrides)

audit_log (admin changes)

Users / Permissions

profiles (supabase user -> app profile)

roles

permissions (by area + access level)

user_offices

Core clinical workflow (POC hero flows)

patients

patient_locations (alternate locations + logical delete)

admissions

admission_insurances

visits (scheduled)

visit_events (clock-in/out, signature captured)

careconnect_status (derived or materialized)

Integration simulation

external_operations (category, operation, request, response, status, timestamps)

notification_queue

notification_attempts

evv_transmissions + evv_resolution_items

This schema is intentionally compatible with a later .NET API: it’s clean, normalized, and UI-driven.

3) Figma Make build plan (what you should generate first)

For a 10-day POC, don’t try to build everything. Build 3 fully-working “demo journeys”:

Journey 1 — Admission → Visit → CareConnect → Monitor

Patient CRUD + Admission CRUD

Scheduler (basic)

Clock-in/out + signature capture (simple)

Monitor list with statuses + conflicts (basic rules)

Journey 2 — Hospice spotlight (HOPE + Medical Director queue)

HOPE timeline widget (due/complete)

Medical Director “Signature Needed” queue (accept/reject)

Journey 3 — Platform Config (your differentiator)

Modules toggles

Vendor registry (EVV vendor, SMS vendor, etc.)

Test connection (mock)

Integration badge: Mock/Live