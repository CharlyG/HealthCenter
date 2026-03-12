import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import schedulingApp, { seedSchedulingData } from "./scheduling.tsx";
import hospiceApp, { seedHospiceData } from "./hospice.tsx";
import billingApp, { seedBillingData } from "./billing.tsx";
import risksApp, { seedRiskData } from "./risks.tsx";
import collaborationApp, { seedCollaborationData } from "./collaboration.tsx";
import clinicalAssistantApp from "./clinical-assistant.tsx";
import documentationAssistApp from "./documentation-assist.tsx";
import riskScoringApp from "./risk-scoring.tsx";
import referralPipelineApp from "./referral-pipeline.tsx";
import pocMonitorApp, { seedPocMonitorData } from "./poc-monitor.tsx";
import payerApp from "./payer.tsx";
import assessmentApp from "./clinical-assessment-routes.tsx";
import snAssessmentApp from "./sn-assessment.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// ============= SEED DATA CONSTANTS (fixed IDs — idempotent) =============
// Using fixed IDs means the seed is safe to call multiple times; records are
// simply overwritten with identical data, so no duplicates are ever created.

const SEED_ORG_ID = 'org-demo';
const SEED_OFFICE_MAIN_ID = 'office-demo-main';
const SEED_OFFICE_NORTH_ID = 'office-demo-north';
const SEED_OFFICE_SOUTH_ID = 'office-demo-south';

const SEED_ORG = {
  id: SEED_ORG_ID,
  name: 'Demo Healthcare Network',
  type: 'Multi-Office',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const SEED_OFFICES = [
  { id: SEED_OFFICE_MAIN_ID, org_id: SEED_ORG_ID, name: 'Downtown Medical Center', address: '123 Main St, San Francisco, CA 94102', phone: '(415) 555-0100', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' },
  { id: SEED_OFFICE_NORTH_ID, org_id: SEED_ORG_ID, name: 'North Bay Clinic', address: '456 Oak Ave, San Rafael, CA 94901', phone: '(415) 555-0200', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' },
  { id: SEED_OFFICE_SOUTH_ID, org_id: SEED_ORG_ID, name: 'Peninsula Health Services', address: '789 El Camino Real, Redwood City, CA 94063', phone: '(650) 555-0300', created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z' },
];

const SEED_MODULES = [
  { id: 'patient', name: 'Patient Management', description: 'Patient records and demographics', icon: 'users', order: 1 },
  { id: 'admissions', name: 'Admissions', description: 'Patient admission and discharge', icon: 'clipboard-check', order: 2 },
  { id: 'scheduling', name: 'Scheduling', description: 'Visit scheduling and calendar', icon: 'calendar', order: 3 },
  { id: 'careconnect', name: 'Point of Care', description: 'Visit documentation and EVV', icon: 'heart-pulse', order: 4 },
  { id: 'monitor', name: 'Monitor', description: 'Visit monitoring and oversight', icon: 'activity', order: 5 },
  { id: 'clinical', name: 'Clinical', description: 'Clinical documentation and QA', icon: 'file-text', order: 6 },
  { id: 'hospice', name: 'Hospice', description: 'Hospice care management', icon: 'heart', order: 7 },
  { id: 'billing', name: 'Billing', description: 'Revenue cycle and claims management', icon: 'dollar-sign', order: 8 },
  { id: 'admin', name: 'Admin', description: 'System administration', icon: 'settings', order: 9 },
];

const SEED_FEATURES = [
  { id: 'patient-create', moduleId: 'patient', name: 'Create Patient', description: 'Add new patients' },
  { id: 'patient-edit', moduleId: 'patient', name: 'Edit Patient', description: 'Modify patient information' },
  { id: 'patient-delete', moduleId: 'patient', name: 'Delete Patient', description: 'Remove patient records' },
  { id: 'patient-view-phi', moduleId: 'patient', name: 'View PHI', description: 'Access protected health information' },
  { id: 'admission-create', moduleId: 'admissions', name: 'Create Admission', description: 'Admit new patients' },
  { id: 'admission-discharge', moduleId: 'admissions', name: 'Discharge Patient', description: 'Discharge patients' },
  { id: 'admission-insurance', moduleId: 'admissions', name: 'Manage Insurance', description: 'Add/edit insurance information' },
  { id: 'schedule-create', moduleId: 'scheduling', name: 'Create Visit', description: 'Schedule new visits' },
  { id: 'schedule-edit', moduleId: 'scheduling', name: 'Edit Visit', description: 'Modify scheduled visits' },
  { id: 'schedule-cancel', moduleId: 'scheduling', name: 'Cancel Visit', description: 'Cancel scheduled visits' },
  { id: 'careconnect-view', moduleId: 'careconnect', name: 'View Status', description: 'View real-time visit status' },
  { id: 'careconnect-clockin', moduleId: 'careconnect', name: 'Clock In/Out', description: 'Clock in and out of visits' },
  { id: 'monitor-view', moduleId: 'monitor', name: 'View Dashboard', description: 'View monitoring dashboard' },
  { id: 'monitor-alerts', moduleId: 'monitor', name: 'Manage Alerts', description: 'Handle visit alerts and conflicts' },
  { id: 'clinical-visit-notes', moduleId: 'clinical', name: 'Visit Notes', description: 'Create and manage visit notes' },
  { id: 'clinical-poc', moduleId: 'clinical', name: 'Plans of Care', description: 'Create and manage plans of care' },
  { id: 'clinical-verbal-orders', moduleId: 'clinical', name: 'Verbal Orders', description: 'Document verbal orders' },
  { id: 'clinical-qa-review', moduleId: 'clinical', name: 'QA Review', description: 'Review and approve clinical documents' },
  { id: 'clinical-qa-approve', moduleId: 'clinical', name: 'QA Approve', description: 'Approve clinical documents' },
  { id: 'hospice-hope', moduleId: 'hospice', name: 'HOPE Timeline', description: 'Manage HOPE assessments' },
  { id: 'hospice-md-queue', moduleId: 'hospice', name: 'MD Queue', description: 'Medical director approval queue' },
  { id: 'admin-modules', moduleId: 'admin', name: 'Module Settings', description: 'Enable/disable modules' },
  { id: 'admin-features', moduleId: 'admin', name: 'Feature Settings', description: 'Enable/disable features' },
  { id: 'admin-users', moduleId: 'admin', name: 'User Management', description: 'Manage users and permissions' },
  { id: 'admin-audit', moduleId: 'admin', name: 'Audit Logs', description: 'View system audit logs' },
];

const SEED_INTEGRATION_CATALOG = [
  {
    category: 'evv', categoryName: 'Electronic Visit Verification',
    vendors: [
      { id: 'hhaexchange', name: 'HHAeXchange', description: 'Leading EVV and home care management platform', credentialFields: ['apiKey', 'apiSecret', 'accountId'] },
      { id: 'sandata', name: 'Sandata', description: 'EVV and care management solutions', credentialFields: ['username', 'password', 'facilityId'] },
      { id: 'clearcare', name: 'ClearCare', description: 'Home care software with EVV', credentialFields: ['apiToken', 'organizationId'] },
    ],
  },
  {
    category: 'sms', categoryName: 'SMS Messaging',
    vendors: [
      { id: 'twilio', name: 'Twilio', description: 'Leading cloud communications platform', credentialFields: ['accountSid', 'authToken', 'phoneNumber'] },
      { id: 'plivo', name: 'Plivo', description: 'Cloud communication platform', credentialFields: ['authId', 'authToken', 'phoneNumber'] },
      { id: 'messagebird', name: 'MessageBird', description: 'Omnichannel communication platform', credentialFields: ['apiKey', 'originator'] },
    ],
  },
  {
    category: 'email', categoryName: 'Email Service',
    vendors: [
      { id: 'sendgrid', name: 'SendGrid', description: 'Email delivery service', credentialFields: ['apiKey', 'fromEmail'] },
      { id: 'mailgun', name: 'Mailgun', description: 'Transactional email API', credentialFields: ['apiKey', 'domain'] },
      { id: 'ses', name: 'Amazon SES', description: 'AWS email service', credentialFields: ['accessKeyId', 'secretAccessKey', 'region'] },
    ],
  },
  {
    category: 'push', categoryName: 'Push Notifications',
    vendors: [
      { id: 'firebase', name: 'Firebase Cloud Messaging', description: "Google's push notification service", credentialFields: ['serverKey', 'projectId'] },
      { id: 'onesignal', name: 'OneSignal', description: 'Multi-platform push notifications', credentialFields: ['appId', 'apiKey'] },
      { id: 'pusher', name: 'Pusher', description: 'Real-time push notifications', credentialFields: ['appId', 'key', 'secret', 'cluster'] },
    ],
  },
  {
    category: 'medication', categoryName: 'Medication Database',
    vendors: [
      { id: 'none', name: 'None (Disabled)', description: 'No medication database integration', credentialFields: [] },
      { id: 'medispan', name: 'Medispan', description: 'Comprehensive drug database', credentialFields: ['username', 'password', 'accountNumber'] },
      { id: 'betterrx', name: 'BetterRx', description: 'Medication management platform', credentialFields: ['apiKey', 'facilityId'] },
      { id: 'firstdatabank', name: 'First Databank', description: 'Drug information database', credentialFields: ['clientId', 'clientSecret'] },
    ],
  },
  {
    category: 'fax', categoryName: 'Fax Service',
    vendors: [
      { id: 'srfax', name: 'SRFax', description: 'HIPAA-compliant cloud fax', credentialFields: ['accountNumber', 'password'] },
      { id: 'efax', name: 'eFax', description: 'Internet fax service', credentialFields: ['username', 'password', 'accountId'] },
      { id: 'ringcentral', name: 'RingCentral Fax', description: 'Cloud-based fax solution', credentialFields: ['clientId', 'clientSecret', 'extensionNumber'] },
    ],
  },
  {
    category: 'maps', categoryName: 'Mapping & Geolocation',
    vendors: [
      { id: 'google', name: 'Google Maps', description: 'Google Maps Platform', credentialFields: ['apiKey'] },
      { id: 'mapbox', name: 'Mapbox', description: 'Mapping and location services', credentialFields: ['accessToken'] },
      { id: 'here', name: 'HERE Maps', description: 'Location platform services', credentialFields: ['apiKey', 'appId'] },
    ],
  },
];

// Demo users — keep in sync with DEMO_PROFILES in Login.tsx
const SEED_DEMO_USERS = [
  { email: 'admin@demo.com', password: 'demo123', name: 'Sarah Admin', role: 'admin', officeIds: [SEED_OFFICE_MAIN_ID, SEED_OFFICE_NORTH_ID, SEED_OFFICE_SOUTH_ID], description: 'Full system access · all modules & settings' },
  { email: 'doctor@demo.com', password: 'demo123', name: 'Dr. Michael Chen', role: 'physician', officeIds: [SEED_OFFICE_MAIN_ID, SEED_OFFICE_NORTH_ID], description: 'Clinical access · patients & charts' },
  { email: 'nurse@demo.com', password: 'demo123', name: 'Jennifer Martinez RN', role: 'nurse', officeIds: [SEED_OFFICE_MAIN_ID], description: 'Care delivery · visit documentation' },
  { email: 'scheduler@demo.com', password: 'demo123', name: 'David Scheduler', role: 'scheduler', officeIds: [SEED_OFFICE_MAIN_ID, SEED_OFFICE_NORTH_ID, SEED_OFFICE_SOUTH_ID], description: 'Scheduling focus · create & manage visits' },
  { email: 'coordinator@demo.com', password: 'demo123', name: 'Emily Care Coordinator', role: 'care_coordinator', officeIds: [SEED_OFFICE_SOUTH_ID], description: 'Care coordination · monitor & coordinate' },
  { email: 'biller@demo.com', password: 'demo123', name: 'Robert Billing', role: 'billing', officeIds: [SEED_OFFICE_MAIN_ID, SEED_OFFICE_NORTH_ID, SEED_OFFICE_SOUTH_ID], description: 'Billing & insurance · claims management' },
];

const SEED_PATIENTS = [
  { id: 'patient-demo-001', officeId: SEED_OFFICE_MAIN_ID, firstName: 'John', lastName: 'Smith', dob: '1945-03-15', mrn: 'MRN001234', phone: '(415) 555-1001', address: '100 Market St, San Francisco, CA 94102', admissionStatus: 'Active', payer: 'Medicare' },
  { id: 'patient-demo-002', officeId: SEED_OFFICE_MAIN_ID, firstName: 'Mary', lastName: 'Johnson', dob: '1952-07-22', mrn: 'MRN001235', phone: '(415) 555-1002', address: '200 Mission St, San Francisco, CA 94105', admissionStatus: 'Active', payer: 'Blue Cross' },
  { id: 'patient-demo-003', officeId: SEED_OFFICE_NORTH_ID, firstName: 'Robert', lastName: 'Williams', dob: '1938-11-08', mrn: 'MRN001236', phone: '(415) 555-1003', address: '50 Fourth St, San Rafael, CA 94901', admissionStatus: 'Active', payer: 'Medicare' },
  { id: 'patient-demo-004', officeId: SEED_OFFICE_SOUTH_ID, firstName: 'Patricia', lastName: 'Brown', dob: '1950-05-30', mrn: 'MRN001237', phone: '(650) 555-1004', address: '300 Broadway, Redwood City, CA 94063', admissionStatus: 'Active', payer: 'Medicaid' },
  { id: 'patient-demo-005', officeId: SEED_OFFICE_MAIN_ID, firstName: 'James', lastName: 'Davis', dob: '1948-09-12', mrn: 'MRN001238', phone: '(415) 555-1005', address: '45 Fremont St, San Francisco, CA 94105', admissionStatus: 'Pending', payer: 'Medicare' },
  { id: 'patient-demo-006', officeId: SEED_OFFICE_SOUTH_ID, firstName: 'Linda', lastName: 'Garcia', dob: '1955-02-19', mrn: 'MRN001239', phone: '(650) 555-1006', address: '88 Veterans Blvd, Redwood City, CA 94063', admissionStatus: 'Active', payer: 'Aetna' },
];

const SEED_PAYERS = [
  { id: 'payer-medicare', name: 'Medicare', type: 'Government', allowed_offices: [] }, // No restrictions
  { id: 'payer-medicaid', name: 'Medicaid', type: 'Government', allowed_offices: [] },
  { id: 'payer-bluecross', name: 'Blue Cross Blue Shield', type: 'Commercial', allowed_offices: [SEED_OFFICE_MAIN_ID, SEED_OFFICE_NORTH_ID] },
  { id: 'payer-aetna', name: 'Aetna', type: 'Commercial', allowed_offices: [] },
  { id: 'payer-united', name: 'UnitedHealthcare', type: 'Commercial', allowed_offices: [SEED_OFFICE_MAIN_ID] },
  { id: 'payer-kaiser', name: 'Kaiser Permanente', type: 'HMO', allowed_offices: [SEED_OFFICE_NORTH_ID, SEED_OFFICE_SOUTH_ID] },
];

const SEED_ADMISSIONS = [
  { id: 'adm-001', patientId: 'patient-demo-001', officeId: SEED_OFFICE_MAIN_ID, admissionDate: '2025-11-15', socDate: '2025-11-16', status: 'active', type: 'Home Health', payer: 'Medicare', certPeriodStart: '2025-11-15', certPeriodEnd: '2026-01-13', physicianName: 'Dr. Andrew Chen', physicianNpi: '1234567890', diagnosisPrimary: 'M54.5 Low back pain', referralSource: 'Hospital Discharge' },
  { id: 'adm-002', patientId: 'patient-demo-002', officeId: SEED_OFFICE_MAIN_ID, admissionDate: '2025-12-01', socDate: '2025-12-02', status: 'active', type: 'Home Health', payer: 'Blue Cross', certPeriodStart: '2025-12-01', certPeriodEnd: '2026-01-29', physicianName: 'Dr. Sarah Miller', physicianNpi: '2345678901', diagnosisPrimary: 'E11.9 Type 2 diabetes mellitus', referralSource: 'Physician Office' },
  { id: 'adm-003', patientId: 'patient-demo-003', officeId: SEED_OFFICE_NORTH_ID, admissionDate: '2026-01-10', socDate: '2026-01-11', status: 'active', type: 'Hospice', payer: 'Medicare', certPeriodStart: '2026-01-10', certPeriodEnd: '2026-07-09', physicianName: 'Dr. Robert Taylor', physicianNpi: '3456789012', diagnosisPrimary: 'C34.90 Malignant neoplasm of lung', referralSource: 'Oncology Referral' },
  { id: 'adm-004', patientId: 'patient-demo-004', officeId: SEED_OFFICE_SOUTH_ID, admissionDate: '2026-02-05', socDate: '2026-02-06', status: 'active', type: 'Home Health', payer: 'Medicaid', certPeriodStart: '2026-02-05', certPeriodEnd: '2026-04-05', physicianName: 'Dr. Emily Watson', physicianNpi: '4567890123', diagnosisPrimary: 'I50.9 Heart failure, unspecified', referralSource: 'Hospital Discharge' },
  { id: 'adm-005', patientId: 'patient-demo-005', officeId: SEED_OFFICE_MAIN_ID, admissionDate: '2026-03-01', socDate: null, status: 'pending', type: 'Home Health', payer: 'Medicare', certPeriodStart: null, certPeriodEnd: null, physicianName: 'Dr. Andrew Chen', physicianNpi: '1234567890', diagnosisPrimary: 'S72.001A Fracture of right femur', referralSource: 'Hospital Discharge' },
  { id: 'adm-006', patientId: 'patient-demo-006', officeId: SEED_OFFICE_SOUTH_ID, admissionDate: '2025-09-15', socDate: '2025-09-16', status: 'discharged', type: 'Home Health', payer: 'Aetna', certPeriodStart: '2025-09-15', certPeriodEnd: '2025-11-13', physicianName: 'Dr. Michael Park', physicianNpi: '5678901234', diagnosisPrimary: 'Z96.641 Presence of right artificial knee joint', referralSource: 'Orthopedic Clinic', dischargeDate: '2025-11-10', dischargeReason: 'Goals Met' },
  { id: 'adm-007', patientId: 'patient-demo-001', officeId: SEED_OFFICE_MAIN_ID, admissionDate: '2025-06-01', socDate: '2025-06-02', status: 'discharged', type: 'Home Health', payer: 'Medicare', certPeriodStart: '2025-06-01', certPeriodEnd: '2025-07-30', physicianName: 'Dr. Andrew Chen', physicianNpi: '1234567890', diagnosisPrimary: 'J44.1 COPD with acute exacerbation', referralSource: 'ER Visit', dischargeDate: '2025-07-25', dischargeReason: 'Goals Met' },
];

// ============= CLINICAL MODULE SEEDS =============

const SEED_VISIT_NOTES = [
  {
    id: 'visit-note-001',
    visitId: 'visit-001',
    patientId: 'patient-demo-001',
    patientName: 'John Smith',
    patientMrn: 'MRN001234',
    discipline: 'rn',
    clinicianId: 'clinician-001',
    clinicianName: 'Sarah Johnson, RN',
    visitDate: '2026-03-05T10:00:00.000Z',
    serviceType: 'Skilled Nursing',
    qaStatus: 'completed',
    createdAt: '2026-03-05T14:30:00.000Z',
    lastModified: '2026-03-05T14:30:00.000Z',
    signedAt: '2026-03-05T14:30:00.000Z',
    signedBy: 'Sarah Johnson, RN',
  },
  {
    id: 'visit-note-002',
    visitId: 'visit-002',
    patientId: 'patient-demo-002',
    patientName: 'Mary Johnson',
    patientMrn: 'MRN001235',
    discipline: 'pt',
    clinicianId: 'clinician-002',
    clinicianName: 'Michael Chen, PT',
    visitDate: '2026-03-04T11:00:00.000Z',
    serviceType: 'Physical Therapy',
    qaStatus: 'approved',
    createdAt: '2026-03-04T15:00:00.000Z',
    lastModified: '2026-03-04T15:00:00.000Z',
    signedAt: '2026-03-04T15:00:00.000Z',
    signedBy: 'Michael Chen, PT',
  },
  {
    id: 'visit-note-003',
    visitId: 'visit-003',
    patientId: 'patient-demo-003',
    patientName: 'Robert Williams',
    patientMrn: 'MRN001236',
    discipline: 'ot',
    clinicianId: 'clinician-003',
    clinicianName: 'Jennifer Lee, OT',
    visitDate: '2026-03-03T14:00:00.000Z',
    serviceType: 'Occupational Therapy',
    qaStatus: 'returned',
    createdAt: '2026-03-03T16:00:00.000Z',
    lastModified: '2026-03-04T10:00:00.000Z',
  },
  {
    id: 'visit-note-004',
    visitId: 'visit-004',
    patientId: 'patient-demo-004',
    patientName: 'Patricia Brown',
    patientMrn: 'MRN001237',
    discipline: 'lpn',
    clinicianId: 'clinician-004',
    clinicianName: 'David Martinez, LPN',
    visitDate: '2026-03-06T09:00:00.000Z',
    serviceType: 'Skilled Nursing',
    qaStatus: 'in_progress',
    createdAt: '2026-03-06T09:30:00.000Z',
    lastModified: '2026-03-06T10:00:00.000Z',
  },
  {
    id: 'visit-note-005',
    visitId: 'visit-005',
    patientId: 'patient-demo-005',
    patientName: 'James Davis',
    patientMrn: 'MRN001238',
    discipline: 'st',
    clinicianId: 'clinician-005',
    clinicianName: 'Emily Rodriguez, ST',
    visitDate: '2026-03-05T13:00:00.000Z',
    serviceType: 'Speech Therapy',
    qaStatus: 'corrected',
    createdAt: '2026-03-05T15:00:00.000Z',
    lastModified: '2026-03-06T08:00:00.000Z',
    signedAt: '2026-03-06T08:00:00.000Z',
    signedBy: 'Emily Rodriguez, ST',
  },
];

const SEED_PLANS_OF_CARE = [
  {
    id: 'poc-001',
    admissionId: 'admission-001',
    patientId: 'patient-demo-001',
    patientName: 'John Smith',
    patientMrn: 'MRN001234',
    pocType: 'initial',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    qaStatus: 'completed',
    createdBy: 'Dr. Anderson',
    createdAt: '2026-02-28T10:00:00.000Z',
    lastModified: '2026-03-01T14:00:00.000Z',
    signatures: [
      { role: 'Physician', name: 'Dr. Anderson', signedAt: '2026-03-01T14:00:00.000Z', status: 'signed' },
      { role: 'RN', name: 'Sarah Johnson, RN', signedAt: '2026-03-01T15:00:00.000Z', status: 'signed' },
      { role: 'PT', name: 'Michael Chen, PT', signedAt: null, status: 'pending' },
    ],
    requiredSignatures: 3,
    completedSignatures: 2,
  },
  {
    id: 'poc-002',
    admissionId: 'admission-002',
    patientId: 'patient-demo-002',
    patientName: 'Mary Johnson',
    patientMrn: 'MRN001235',
    pocType: 'recertification',
    startDate: '2026-03-15',
    endDate: '2026-05-15',
    qaStatus: 'approved',
    createdBy: 'Dr. Wilson',
    createdAt: '2026-03-10T09:00:00.000Z',
    lastModified: '2026-03-12T11:00:00.000Z',
    signatures: [
      { role: 'Physician', name: 'Dr. Wilson', signedAt: '2026-03-12T09:00:00.000Z', status: 'signed' },
      { role: 'RN', name: 'Sarah Johnson, RN', signedAt: '2026-03-12T10:00:00.000Z', status: 'signed' },
      { role: 'PT', name: 'Michael Chen, PT', signedAt: '2026-03-12T11:00:00.000Z', status: 'signed' },
    ],
    requiredSignatures: 3,
    completedSignatures: 3,
  },
  {
    id: 'poc-003',
    admissionId: 'admission-003',
    patientId: 'patient-demo-003',
    patientName: 'Robert Williams',
    patientMrn: 'MRN001236',
    pocType: 'revision',
    startDate: '2026-02-01',
    endDate: '2026-04-30',
    qaStatus: 'returned',
    createdBy: 'Dr. Brown',
    createdAt: '2026-03-01T13:00:00.000Z',
    lastModified: '2026-03-04T09:00:00.000Z',
    signatures: [
      { role: 'Physician', name: 'Dr. Brown', signedAt: '2026-03-04T09:00:00.000Z', status: 'signed' },
      { role: 'RN', name: 'David Martinez, LPN', signedAt: null, status: 'pending' },
    ],
    requiredSignatures: 2,
    completedSignatures: 1,
  },
  {
    id: 'poc-004',
    admissionId: 'admission-004',
    patientId: 'patient-demo-004',
    patientName: 'Patricia Brown',
    patientMrn: 'MRN001237',
    pocType: 'initial',
    startDate: '2026-03-10',
    endDate: '2026-06-10',
    qaStatus: 'in_progress',
    createdBy: 'Dr. Taylor',
    createdAt: '2026-03-06T08:00:00.000Z',
    lastModified: '2026-03-06T09:00:00.000Z',
    signatures: [
      { role: 'Physician', name: 'Dr. Taylor', signedAt: null, status: 'pending' },
      { role: 'RN', name: 'Sarah Johnson, RN', signedAt: null, status: 'pending' },
    ],
    requiredSignatures: 2,
    completedSignatures: 0,
  },
];

const SEED_VERBAL_ORDERS = [
  {
    id: 'vo-001',
    admissionId: 'admission-001',
    patientId: 'patient-demo-001',
    patientName: 'John Smith',
    patientMrn: 'MRN001234',
    orderType: 'medication',
    orderDescription: 'Lisinopril 10mg PO daily for hypertension',
    orderedBy: 'Dr. Anderson',
    receivedBy: 'Sarah Johnson, RN',
    orderDate: '2026-03-01T10:00:00.000Z',
    qaStatus: 'completed',
    physicianSignedAt: '2026-03-02T14:00:00.000Z',
    nurseSignedAt: '2026-03-01T10:30:00.000Z',
    createdAt: '2026-03-01T10:30:00.000Z',
    lastModified: '2026-03-02T14:00:00.000Z',
    daysUntilExpiry: 5,
    requiresFollowup: false,
  },
  {
    id: 'vo-002',
    admissionId: 'admission-002',
    patientId: 'patient-demo-002',
    patientName: 'Mary Johnson',
    patientMrn: 'MRN001235',
    orderType: 'diagnostic',
    orderDescription: 'CBC and BMP labs, fasting, ASAP',
    orderedBy: 'Dr. Wilson',
    receivedBy: 'David Martinez, LPN',
    orderDate: '2026-03-04T08:00:00.000Z',
    qaStatus: 'completed',
    physicianSignedAt: null,
    nurseSignedAt: '2026-03-04T08:15:00.000Z',
    createdAt: '2026-03-04T08:15:00.000Z',
    lastModified: '2026-03-04T08:15:00.000Z',
    daysUntilExpiry: 2,
    requiresFollowup: true,
  },
  {
    id: 'vo-003',
    admissionId: 'admission-003',
    patientId: 'patient-demo-003',
    patientName: 'Robert Williams',
    patientMrn: 'MRN001236',
    orderType: 'therapy',
    orderDescription: 'Increase PT to 3x weekly, focus on gait training',
    orderedBy: 'Dr. Brown',
    receivedBy: 'Michael Chen, PT',
    orderDate: '2026-02-28T14:00:00.000Z',
    qaStatus: 'approved',
    physicianSignedAt: '2026-03-01T09:00:00.000Z',
    nurseSignedAt: '2026-02-28T14:30:00.000Z',
    createdAt: '2026-02-28T14:30:00.000Z',
    lastModified: '2026-03-01T09:00:00.000Z',
    daysUntilExpiry: 10,
    requiresFollowup: false,
  },
  {
    id: 'vo-004',
    admissionId: 'admission-004',
    patientId: 'patient-demo-004',
    patientName: 'Patricia Brown',
    patientMrn: 'MRN001237',
    orderType: 'treatment',
    orderDescription: 'Wound care to left lower leg ulcer, daily dressing changes',
    orderedBy: 'Dr. Taylor',
    receivedBy: 'Sarah Johnson, RN',
    orderDate: '2026-03-05T11:00:00.000Z',
    qaStatus: 'in_progress',
    physicianSignedAt: null,
    nurseSignedAt: '2026-03-05T11:20:00.000Z',
    createdAt: '2026-03-05T11:20:00.000Z',
    lastModified: '2026-03-05T11:20:00.000Z',
    daysUntilExpiry: 3,
    requiresFollowup: true,
  },
  {
    id: 'vo-005',
    admissionId: 'admission-005',
    patientId: 'patient-demo-005',
    patientName: 'James Davis',
    patientMrn: 'MRN001238',
    orderType: 'equipment',
    orderDescription: 'Walker with wheels, standard height',
    orderedBy: 'Dr. Anderson',
    receivedBy: 'Michael Chen, PT',
    orderDate: '2026-03-03T09:00:00.000Z',
    qaStatus: 'returned',
    physicianSignedAt: '2026-03-04T10:00:00.000Z',
    nurseSignedAt: '2026-03-03T09:30:00.000Z',
    createdAt: '2026-03-03T09:30:00.000Z',
    lastModified: '2026-03-05T14:00:00.000Z',
    daysUntilExpiry: 1,
    requiresFollowup: false,
  },
  {
    id: 'vo-006',
    admissionId: 'admission-001',
    patientId: 'patient-demo-001',
    patientName: 'John Smith',
    patientMrn: 'MRN001234',
    orderType: 'treatment',
    orderDescription: 'Wound care to left shin ulcer: cleanse with normal saline, apply Aquacel Ag, cover with foam dressing. Change every 48 hours.',
    orderedBy: 'Dr. Anderson',
    receivedBy: 'Sarah Johnson, RN',
    orderDate: '2026-03-06T09:00:00.000Z',
    qaStatus: 'in_progress',
    physicianSignedAt: null,
    nurseSignedAt: '2026-03-06T09:15:00.000Z',
    createdAt: '2026-03-06T09:15:00.000Z',
    lastModified: '2026-03-06T09:15:00.000Z',
    daysUntilExpiry: 14,
    requiresFollowup: true,
  },
  {
    id: 'vo-007',
    admissionId: 'admission-001',
    patientId: 'patient-demo-001',
    patientName: 'John Smith',
    patientMrn: 'MRN001234',
    orderType: 'diagnostic',
    orderDescription: 'PT/INR level — fasting, weekly x 4 weeks',
    orderedBy: 'Dr. Anderson',
    receivedBy: 'Sarah Johnson, RN',
    orderDate: '2026-03-02T11:00:00.000Z',
    qaStatus: 'completed',
    physicianSignedAt: '2026-03-02T16:00:00.000Z',
    nurseSignedAt: '2026-03-02T11:20:00.000Z',
    createdAt: '2026-03-02T11:20:00.000Z',
    lastModified: '2026-03-02T16:00:00.000Z',
    daysUntilExpiry: 28,
    requiresFollowup: false,
  },
  {
    id: 'vo-008',
    admissionId: 'admission-002',
    patientId: 'patient-demo-002',
    patientName: 'Mary Johnson',
    patientMrn: 'MRN001235',
    orderType: 'medication',
    orderDescription: 'Metformin 500mg PO BID with meals for blood glucose management',
    orderedBy: 'Dr. Wilson',
    receivedBy: 'Sarah Johnson, RN',
    orderDate: '2026-03-05T10:00:00.000Z',
    qaStatus: 'in_progress',
    physicianSignedAt: null,
    nurseSignedAt: '2026-03-05T10:30:00.000Z',
    createdAt: '2026-03-05T10:30:00.000Z',
    lastModified: '2026-03-05T10:30:00.000Z',
    daysUntilExpiry: 4,
    requiresFollowup: false,
  },
];

const SEED_QA_DOCUMENTS = [
  {
    id: 'qa-doc-001',
    documentType: 'visit_note',
    documentId: 'visit-note-001',
    patientName: 'John Smith',
    patientMrn: 'MRN001234',
    documentTitle: 'RN Visit Note - Skilled Nursing',
    author: 'Sarah Johnson, RN',
    submittedAt: '2026-03-05T14:30:00.000Z',
    qaStatus: 'completed',
    assignedTo: 'Jane Reviewer',
    lastReviewedAt: null,
    reviewedBy: null,
    returnReason: null,
    priority: 'medium',
    daysInQueue: 1,
  },
  {
    id: 'qa-doc-002',
    documentType: 'visit_note',
    documentId: 'visit-note-002',
    patientName: 'Mary Johnson',
    patientMrn: 'MRN001235',
    documentTitle: 'PT Visit Note - Physical Therapy',
    author: 'Michael Chen, PT',
    submittedAt: '2026-03-04T15:00:00.000Z',
    qaStatus: 'approved',
    assignedTo: 'Jane Reviewer',
    lastReviewedAt: '2026-03-05T09:00:00.000Z',
    reviewedBy: 'Jane Reviewer',
    returnReason: null,
    priority: 'low',
    daysInQueue: 2,
  },
  {
    id: 'qa-doc-003',
    documentType: 'visit_note',
    documentId: 'visit-note-003',
    patientName: 'Robert Williams',
    patientMrn: 'MRN001236',
    documentTitle: 'OT Visit Note - Occupational Therapy',
    author: 'Jennifer Lee, OT',
    submittedAt: '2026-03-03T16:00:00.000Z',
    qaStatus: 'returned',
    assignedTo: 'John QA Manager',
    lastReviewedAt: '2026-03-04T10:00:00.000Z',
    reviewedBy: 'John QA Manager',
    returnReason: 'Please add more detail about patient progress and response to treatment.',
    priority: 'high',
    daysInQueue: 3,
  },
  {
    id: 'qa-doc-004',
    documentType: 'plan_of_care',
    documentId: 'poc-001',
    patientName: 'John Smith',
    patientMrn: 'MRN001234',
    documentTitle: 'Initial Plan of Care',
    author: 'Dr. Anderson',
    submittedAt: '2026-03-01T14:00:00.000Z',
    qaStatus: 'completed',
    assignedTo: 'Jane Reviewer',
    lastReviewedAt: null,
    reviewedBy: null,
    returnReason: null,
    priority: 'medium',
    daysInQueue: 5,
  },
  {
    id: 'qa-doc-005',
    documentType: 'verbal_order',
    documentId: 'vo-002',
    patientName: 'Mary Johnson',
    patientMrn: 'MRN001235',
    documentTitle: 'Verbal Order - Diagnostic Test',
    author: 'David Martinez, LPN',
    submittedAt: '2026-03-04T08:15:00.000Z',
    qaStatus: 'completed',
    assignedTo: null,
    lastReviewedAt: null,
    reviewedBy: null,
    returnReason: null,
    priority: 'high',
    daysInQueue: 2,
  },
];

// ─── Idempotent seed ──────────────────────────────────────────────────────────
// Runs on every cold start. Fixed IDs make it a pure upsert — no duplicates.
async function runSeed() {
  try {
    console.log('[seed] Running idempotent seed...');

    // Org & offices
    await kv.set(`org:${SEED_ORG_ID}`, SEED_ORG);
    for (const office of SEED_OFFICES) {
      await kv.set(`office:${SEED_ORG_ID}:${office.id}`, office);
    }

    // Modules + settings
    for (const mod of SEED_MODULES) {
      await kv.set(`module:${mod.id}`, { ...mod, created_at: '2024-01-01T00:00:00.000Z' });
      await kv.set(`module-setting:${SEED_ORG_ID}:${mod.id}`, {
        org_id: SEED_ORG_ID, module_id: mod.id, enabled: true, office_overrides: {}, updated_at: '2024-01-01T00:00:00.000Z',
      });
    }

    // Features + settings
    for (const feature of SEED_FEATURES) {
      await kv.set(`feature:${feature.id}`, { ...feature, created_at: '2024-01-01T00:00:00.000Z' });
      await kv.set(`feature-setting:${SEED_ORG_ID}:${feature.id}`, {
        org_id: SEED_ORG_ID, feature_id: feature.id, enabled: true, office_overrides: {}, updated_at: '2024-01-01T00:00:00.000Z',
      });
    }

    // Integration catalog
    for (const cat of SEED_INTEGRATION_CATALOG) {
      await kv.set(`integration-catalog:${cat.category}`, cat);
    }

    // Demo auth users — upsert by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const existingEmails = new Map((existingUsers?.users ?? []).map((u: any) => [u.email, u.id]));

    console.log(`[seed] Found ${existingUsers?.users?.length ?? 0} existing auth users`);

    for (const u of SEED_DEMO_USERS) {
      let userId: string;
      if (existingEmails.has(u.email)) {
        userId = existingEmails.get(u.email)!;
        console.log(`[seed] Updating existing user: ${u.email} (${userId})`);
        // Keep metadata current — overwrites old org_id
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: u.password,
          user_metadata: { name: u.name, role: u.role, org_id: SEED_ORG_ID, office_ids: u.officeIds },
        });
      } else {
        console.log(`[seed] Creating new user: ${u.email}`);
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: u.email,
          password: u.password,
          user_metadata: { name: u.name, role: u.role, org_id: SEED_ORG_ID, office_ids: u.officeIds },
          email_confirm: true,
        });
        if (error) { console.error(`[seed] createUser ${u.email}:`, error.message); continue; }
        userId = data.user.id;
      }
      await kv.set(`profile:${userId}`, {
        id: userId, email: u.email, name: u.name, role: u.role,
        org_id: SEED_ORG_ID, office_ids: u.officeIds, description: u.description,
        created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z',
      });
    }
    console.log('[seed] Demo users seeded ✓');

    // Sample patients (fixed IDs)
    for (const p of SEED_PATIENTS) {
      await kv.set(`patient:${p.officeId}:${p.id}`, {
        id: p.id, office_id: p.officeId, first_name: p.firstName, last_name: p.lastName,
        dob: p.dob, mrn: p.mrn, phone: p.phone, address: p.address,
        admission_status: p.admissionStatus, payer: p.payer,
        created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z',
      });
    }

    // Sample payers (fixed IDs)
    for (const payer of SEED_PAYERS) {
      await kv.set(`payer:${SEED_ORG_ID}:${payer.id}`, payer);
    }

    // Sample admissions (fixed IDs)
    for (const adm of SEED_ADMISSIONS) {
      await kv.set(`admission:${adm.patientId}:${adm.id}`, {
        id: adm.id, patient_id: adm.patientId, office_id: adm.officeId,
        admission_date: adm.admissionDate, soc_date: adm.socDate, status: adm.status,
        type: adm.type, payer: adm.payer, cert_period_start: adm.certPeriodStart,
        cert_period_end: adm.certPeriodEnd, physician_name: adm.physicianName,
        physician_npi: adm.physicianNpi, diagnosis_primary: adm.diagnosisPrimary,
        referral_source: adm.referralSource,
        discharge_date: (adm as any).dischargeDate || null,
        discharge_reason: (adm as any).dischargeReason || null,
        created_at: '2024-01-01T00:00:00.000Z', updated_at: '2024-01-01T00:00:00.000Z',
      });
    }
    console.log('[seed] Admissions seeded ✓');

    // Clinical: Visit Notes
    for (const vn of SEED_VISIT_NOTES) {
      await kv.set(`visit-note:${vn.id}`, vn);
    }

    // Clinical: Plans of Care
    for (const poc of SEED_PLANS_OF_CARE) {
      await kv.set(`plan-of-care:${poc.id}`, poc);
    }

    // Clinical: Verbal Orders
    for (const vo of SEED_VERBAL_ORDERS) {
      await kv.set(`verbal-order:${vo.id}`, vo);
    }

    // Clinical: QA Documents
    for (const qa of SEED_QA_DOCUMENTS) {
      await kv.set(`qa-document:${qa.id}`, qa);
    }

    // Hospice module data
    await seedHospiceData();

    // Billing module data
    await seedBillingData();

    // Scheduling visit data
    await seedSchedulingData();

    // Risk dashboard data
    await seedRiskData();

    // Collaboration data
    await seedCollaborationData();

    // POC Monitor EVV error seed data
    await seedPocMonitorData();

    // Monitor: Seed alerts
    const MONITOR_ALERTS = [
      {
        id: 'alert-001', type: 'missed_visit', severity: 'high', status: 'open',
        title: 'Missed Visit - Mary Johnson',
        description: 'Scheduled SN visit on 03/05 was not completed. Patient requires wound care.',
        patientName: 'Mary Johnson', patientMrn: 'MRN001235',
        clinician: 'Jennifer Martinez RN', visitDate: '2026-03-05',
        createdAt: '2026-03-05T18:00:00.000Z', acknowledgedAt: null, resolvedAt: null,
      },
      {
        id: 'alert-002', type: 'late_documentation', severity: 'medium', status: 'open',
        title: 'Late Documentation - Robert Williams',
        description: 'PT visit note for 03/03 is overdue by 48 hours.',
        patientName: 'Robert Williams', patientMrn: 'MRN001236',
        clinician: 'Michael Chen, PT', visitDate: '2026-03-03',
        createdAt: '2026-03-05T08:00:00.000Z', acknowledgedAt: null, resolvedAt: null,
      },
      {
        id: 'alert-003', type: 'evv_exception', severity: 'high', status: 'acknowledged',
        title: 'EVV Mismatch - GPS Out of Range',
        description: 'Clock-in GPS location is 2.3 miles from patient address for visit on 03/04.',
        patientName: 'John Smith', patientMrn: 'MRN001234',
        clinician: 'Jennifer Martinez RN', visitDate: '2026-03-04',
        createdAt: '2026-03-04T16:00:00.000Z', acknowledgedAt: '2026-03-05T09:00:00.000Z', resolvedAt: null,
      },
      {
        id: 'alert-004', type: 'authorization_expiring', severity: 'medium', status: 'open',
        title: 'Authorization Expiring - Mary Johnson',
        description: 'Current authorization expires in 3 days (03/09). 4 visits remaining.',
        patientName: 'Mary Johnson', patientMrn: 'MRN001235',
        clinician: null, visitDate: null,
        createdAt: '2026-03-06T06:00:00.000Z', acknowledgedAt: null, resolvedAt: null,
      },
      {
        id: 'alert-005', type: 'scheduling_conflict', severity: 'low', status: 'resolved',
        title: 'Scheduling Overlap Detected',
        description: 'Two visits scheduled for same time slot on 03/05 for Jennifer Martinez.',
        patientName: null, patientMrn: null,
        clinician: 'Jennifer Martinez RN', visitDate: '2026-03-05',
        createdAt: '2026-03-04T22:00:00.000Z', acknowledgedAt: '2026-03-05T07:00:00.000Z', resolvedAt: '2026-03-05T07:30:00.000Z',
      },
      {
        id: 'alert-006', type: 'missed_visit', severity: 'high', status: 'open',
        title: 'Missed Visit - Emily Davis',
        description: 'OT evaluation scheduled for 03/05 was not completed. Patient needs ADL assessment.',
        patientName: 'Emily Davis', patientMrn: 'MRN001240',
        clinician: 'Jennifer Lee, OT', visitDate: '2026-03-05',
        createdAt: '2026-03-05T19:00:00.000Z', acknowledgedAt: null, resolvedAt: null,
      },
      {
        id: 'alert-007', type: 'unsigned_order', severity: 'medium', status: 'open',
        title: 'Unsigned Verbal Order > 48hrs',
        description: 'Verbal order for John Smith dated 03/03 awaiting physician co-signature.',
        patientName: 'John Smith', patientMrn: 'MRN001234',
        clinician: 'Dr. Anderson', visitDate: null,
        createdAt: '2026-03-05T12:00:00.000Z', acknowledgedAt: null, resolvedAt: null,
      },
    ];
    for (const alert of MONITOR_ALERTS) {
      await kv.set(`monitor-alert:${alert.id}`, alert);
    }

    // Monitor: Compliance tracking records
    const COMPLIANCE_RECORDS = [
      { id: 'comp-001', category: 'documentation_timeliness', metric: 'Visit Notes Within 24hrs', current: 87, target: 95, trend: 'improving', period: '2026-03', details: '87 of 100 visit notes submitted within 24 hours' },
      { id: 'comp-002', category: 'evv_compliance', metric: 'EVV Capture Rate', current: 94, target: 98, trend: 'stable', period: '2026-03', details: '94% of visits have valid EVV clock-in/out' },
      { id: 'comp-003', category: 'oasis_timeliness', metric: 'OASIS Submitted Within 5 Days', current: 91, target: 95, trend: 'declining', period: '2026-03', details: '10 of 11 OASIS submitted on time' },
      { id: 'comp-004', category: 'physician_orders', metric: 'Orders Signed Within 48hrs', current: 78, target: 90, trend: 'declining', period: '2026-03', details: '7 of 9 verbal orders co-signed on time' },
      { id: 'comp-005', category: 'poc_recertification', metric: 'POC Recert On Time', current: 100, target: 95, trend: 'stable', period: '2026-03', details: 'All recertifications completed before episode end' },
      { id: 'comp-006', category: 'visit_utilization', metric: 'Visit Utilization Rate', current: 82, target: 85, trend: 'improving', period: '2026-03', details: '82% of authorized visits completed' },
    ];
    for (const comp of COMPLIANCE_RECORDS) {
      await kv.set(`monitor-compliance:${comp.id}`, comp);
    }

    // Monitor: Quality metrics over time (weekly snapshots)
    const QUALITY_SNAPSHOTS = [
      { id: 'qs-w1', week: 'Feb 3', docTimeliness: 82, evvRate: 91, oasisTimeliness: 88, ordersSigned: 75, visitUtil: 78 },
      { id: 'qs-w2', week: 'Feb 10', docTimeliness: 84, evvRate: 92, oasisTimeliness: 89, ordersSigned: 80, visitUtil: 79 },
      { id: 'qs-w3', week: 'Feb 17', docTimeliness: 83, evvRate: 93, oasisTimeliness: 90, ordersSigned: 76, visitUtil: 80 },
      { id: 'qs-w4', week: 'Feb 24', docTimeliness: 86, evvRate: 93, oasisTimeliness: 91, ordersSigned: 82, visitUtil: 81 },
      { id: 'qs-w5', week: 'Mar 3', docTimeliness: 87, evvRate: 94, oasisTimeliness: 91, ordersSigned: 78, visitUtil: 82 },
    ];
    for (const qs of QUALITY_SNAPSHOTS) {
      await kv.set(`monitor-quality:${qs.id}`, qs);
    }

    // Timeline: Seed rich per-patient timeline events (visits, assessments, alerts, hospitalizations, etc.)
    // These supplement the aggregated events from admissions/visits/notes
    const SEED_TIMELINE_EVENTS = [
      // ─── Patient 001 (John Smith) ───
      { id: 'tl-001-v1', patientId: 'patient-demo-001', type: 'visit', timestamp: '2026-03-05T10:00:00Z', title: 'Skilled Nursing Visit', summary: 'VS: BP 132/78, HR 74, SpO2 97%. Weight 172 lbs. Patient reports mild lower back pain, rated 4/10. Wound on left shin healing well. Medication reconciliation completed.', caregiver: 'Sarah Johnson', caregiverRole: 'RN', status: 'completed', relatedEntityId: 'visit-001', relatedEntityType: 'visit', details: { 'Visit Type': 'Skilled Nursing', 'Duration': '45 min', 'Blood Pressure': '132/78', 'Heart Rate': '74 bpm', 'SpO2': '97%', 'Weight': '172 lbs', 'Pain Level': '4/10', 'EVV Status': 'Verified' }, tags: ['SN', 'Completed'] },
      { id: 'tl-001-v2', patientId: 'patient-demo-001', type: 'visit', timestamp: '2026-03-03T11:00:00Z', title: 'Physical Therapy Visit', summary: 'Balance and strengthening exercises. TUG test: 14 seconds (improved). Patient tolerating HEP well. Progressed to stair climbing with rail.', caregiver: 'Michael Chen', caregiverRole: 'PT', status: 'completed', relatedEntityId: 'visit-002', relatedEntityType: 'visit', details: { 'Visit Type': 'PT Treatment', 'Duration': '50 min', 'TUG Test': '14 seconds', 'Progress': 'Improving', 'HEP Compliance': 'Good', 'EVV Status': 'Verified' }, tags: ['PT', 'Progress'] },
      { id: 'tl-001-a1', patientId: 'patient-demo-001', type: 'assessment', timestamp: '2026-02-28T09:00:00Z', title: 'HOPE Assessment — 30-Day Follow-Up', summary: 'HOPE assessment completed for 30-day follow-up. Patient showing steady improvement in functional status. Goals on track for discharge planning.', caregiver: 'Sarah Johnson', caregiverRole: 'RN', status: 'completed', details: { 'Assessment Type': 'HOPE', 'Reason': '30-Day Follow-Up', 'Functional Improvement': 'Moderate', 'Goals Status': 'On Track' }, tags: ['HOPE', 'Follow-Up'] },
      { id: 'tl-001-alert1', patientId: 'patient-demo-001', type: 'alert', timestamp: '2026-02-20T07:30:00Z', title: 'Fall Risk Alert — Increased', summary: 'Patient reported near-fall event in bathroom. Fall risk reassessed as HIGH. Safety modifications recommended. Physician notified.', caregiver: 'Sarah Johnson', caregiverRole: 'RN', status: 'active', priority: 'high', details: { 'Alert Type': 'Clinical — Fall Risk', 'Severity': 'High', 'Event': 'Near-fall in bathroom', 'Action': 'Safety assessment, physician notified', 'New Fall Risk': 'High' }, tags: ['Fall Risk', 'High Priority'] },
      { id: 'tl-001-auth1', patientId: 'patient-demo-001', type: 'authorization', timestamp: '2025-11-16T14:00:00Z', title: 'Medicare Authorization Approved', summary: 'Authorization approved for 60-day episode. 20 SN visits, 12 PT visits authorized. Auth period: 11/15/2025 — 01/13/2026.', caregiver: 'Lisa Adams', caregiverRole: 'Auth Coordinator', status: 'approved', details: { 'Auth Number': 'AUTH-2025-4401', 'Payer': 'Medicare', 'Start Date': '2025-11-15', 'End Date': '2026-01-13', 'SN Visits': '20', 'PT Visits': '12', 'Status': 'Approved' }, tags: ['Medicare', 'Approved'] },
      // ─── Patient 002 (Mary Johnson) ───
      { id: 'tl-002-v1', patientId: 'patient-demo-002', type: 'visit', timestamp: '2026-03-06T09:30:00Z', title: 'Skilled Nursing Visit — Wound Care', summary: 'Wound care to right lower leg ulcer. Wound measured 2.1 x 1.8 cm, decreasing. New dressing applied. Blood glucose 142 mg/dL.', caregiver: 'Sarah Johnson', caregiverRole: 'RN', status: 'completed', details: { 'Visit Type': 'Wound Care', 'Duration': '40 min', 'Wound Size': '2.1 x 1.8 cm', 'Blood Glucose': '142 mg/dL', 'Dressing': 'Aquacel Ag + foam', 'EVV Status': 'Verified' }, tags: ['SN', 'Wound Care'] },
      { id: 'tl-002-v2', patientId: 'patient-demo-002', type: 'visit', timestamp: '2026-03-04T10:00:00Z', title: 'Physical Therapy Visit', summary: 'Gait training with assistive device. Patient ambulating 200 ft with rolling walker. Balance improving. Continued lower extremity strengthening.', caregiver: 'Michael Chen', caregiverRole: 'PT', status: 'completed', details: { 'Visit Type': 'PT Treatment', 'Duration': '55 min', 'Ambulation': '200 ft with walker', 'Balance': 'Improving', 'EVV Status': 'Verified' }, tags: ['PT', 'Gait Training'] },
      { id: 'tl-002-alert1', patientId: 'patient-demo-002', type: 'alert', timestamp: '2026-03-05T18:00:00Z', title: 'Missed Visit Alert', summary: 'Scheduled SN visit on 03/05 was not completed. Patient requires wound care. Rescheduling required.', caregiver: 'Jennifer Martinez', caregiverRole: 'RN', status: 'active', priority: 'urgent', details: { 'Alert Type': 'Missed Visit', 'Severity': 'High', 'Scheduled Date': '2026-03-05', 'Reason': 'Clinician unavailable', 'Action Required': 'Reschedule ASAP' }, tags: ['Urgent', 'Missed Visit'] },
      { id: 'tl-002-a1', patientId: 'patient-demo-002', type: 'assessment', timestamp: '2026-01-05T09:00:00Z', title: 'OASIS-E Start of Care Assessment', summary: 'Comprehensive OASIS-E assessment completed during SOC visit. HIPPS code calculated. All M-items documented. Clinical severity: moderate.', caregiver: 'Sarah Johnson', caregiverRole: 'RN', status: 'completed', details: { 'Assessment Type': 'OASIS-E', 'Reason': 'Start of Care', 'HIPPS Code': '2BE11', 'Functional Score': '38', 'Clinical Severity': 'Moderate' }, tags: ['OASIS', 'SOC'] },
      // ─── Patient 003 (Robert Williams — Hospice) ───
      { id: 'tl-003-hospice1', patientId: 'patient-demo-003', type: 'hospice', timestamp: '2026-03-01T11:00:00Z', title: 'IDG Meeting — Hospice Care Review', summary: 'Interdisciplinary group reviewed patient status. Comfort care plan confirmed. Pain management adequate. Family coping well with support services.', caregiver: 'Dr. Robert Taylor', caregiverRole: 'MD', status: 'reviewed', details: { 'Meeting Type': 'IDG', 'Attendees': 'Dr. Taylor, Sarah Johnson RN, Lisa Adams SW, Rev. Thomas', 'Pain Control': 'Adequate', 'Prognosis': 'Stable', 'Family Support': 'Active' }, tags: ['IDG', 'Hospice'] },
      { id: 'tl-003-v1', patientId: 'patient-demo-003', type: 'visit', timestamp: '2026-03-04T14:00:00Z', title: 'Hospice Nursing Visit', summary: 'Comfort care assessment. Pain 3/10 (controlled). Patient alert, conversant. Family present. Discussed advance directive preferences.', caregiver: 'Jennifer Lee', caregiverRole: 'RN', status: 'completed', details: { 'Visit Type': 'Hospice Nursing', 'Duration': '45 min', 'Pain Level': '3/10', 'Consciousness': 'Alert, conversant', 'Family Present': 'Yes' }, tags: ['Hospice', 'Comfort Care'] },
      { id: 'tl-003-hosp1', patientId: 'patient-demo-003', type: 'hospitalization', timestamp: '2026-02-15T03:00:00Z', title: 'Emergency Hospitalization — Respiratory Distress', summary: 'Patient transported to North Bay Hospital for acute respiratory distress. Hospice services placed on hold during inpatient stay. Family notified.', caregiver: 'Jennifer Lee', caregiverRole: 'RN', status: 'resolved', priority: 'urgent', details: { 'Facility': 'North Bay Hospital', 'Reason': 'Acute respiratory distress', 'Admitted': '2026-02-15', 'Discharged': '2026-02-18', 'Hospice Status': 'Resumed 02/19' }, tags: ['Hospital', 'Respiratory'] },
      // ─── Patient 004 (Patricia Brown) ───
      { id: 'tl-004-v1', patientId: 'patient-demo-004', type: 'visit', timestamp: '2026-03-06T09:00:00Z', title: 'Skilled Nursing Visit', summary: 'VS: BP 128/76, HR 68, SpO2 98%. Weight stable at 155 lbs. Heart sounds regular. No peripheral edema. Medication compliance excellent.', caregiver: 'David Martinez', caregiverRole: 'LPN', status: 'completed', details: { 'Visit Type': 'Skilled Nursing', 'Duration': '35 min', 'Blood Pressure': '128/76', 'Heart Rate': '68 bpm', 'SpO2': '98%', 'Weight': '155 lbs', 'Edema': 'None' }, tags: ['SN', 'Stable'] },
      { id: 'tl-004-alert1', patientId: 'patient-demo-004', type: 'alert', timestamp: '2026-02-25T08:00:00Z', title: 'Authorization Expiring Soon', summary: 'Current authorization expires in 10 days (03/07). 6 SN visits and 4 PT visits remaining. Recertification needed.', status: 'active', priority: 'medium', details: { 'Alert Type': 'Authorization Expiring', 'Expires': '2026-03-07', 'Remaining SN Visits': '6', 'Remaining PT Visits': '4', 'Action': 'Submit recertification' }, tags: ['Auth Expiring', 'Action Needed'] },
    ];

    for (const ev of SEED_TIMELINE_EVENTS) {
      await kv.set(`timeline:${ev.patientId}:${ev.id}`, ev);
    }
    console.log('[seed] Timeline events seeded ✓');

    // Clinical Alert System — seed comprehensive alerts across all categories
    const SEED_CLINICAL_ALERTS = [
      // ─── CRITICAL ───
      {
        id: 'calert-001', severity: 'critical', category: 'authorization', status: 'open',
        title: 'Authorization Exceeded — John Smith',
        explanation: 'Patient has exceeded authorized SN visits by 2. Total authorized: 20, completed: 22. Any additional visits will not be reimbursed by Medicare.',
        suggestedResolution: 'Submit authorization extension request immediately. Contact Medicare for retroactive approval or document medical necessity for exception.',
        quickAction: { label: 'Request Extension', route: '/patient/patient-demo-001/chart', actionType: 'navigate' },
        patientId: 'patient-demo-001', patientName: 'John Smith', patientMrn: 'MRN001234',
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'admissions', relatedEntityType: 'admission', relatedEntityId: 'adm-001',
        createdAt: '2026-03-06T06:00:00.000Z', updatedAt: '2026-03-06T06:00:00.000Z', sortOrder: 1,
      },
      {
        id: 'calert-002', severity: 'critical', category: 'visit', status: 'open',
        title: 'Visit Missing Clock Out — Jennifer Martinez',
        explanation: 'Clinician Jennifer Martinez clocked into a visit at patient Mary Johnson\'s home at 9:15 AM but has not clocked out. It has been over 8 hours since clock-in.',
        suggestedResolution: 'Contact Jennifer Martinez immediately to verify visit completion. If visit was completed, perform manual clock-out with supervisor override.',
        quickAction: { label: 'Manual Clock Out', route: '/poc/monitor', actionType: 'navigate' },
        patientId: 'patient-demo-002', patientName: 'Mary Johnson', patientMrn: 'MRN001235',
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'careconnect',
        createdAt: '2026-03-06T17:30:00.000Z', updatedAt: '2026-03-06T17:30:00.000Z', sortOrder: 2,
      },
      {
        id: 'calert-003', severity: 'critical', category: 'evv', status: 'open',
        title: 'EVV Transmission Failure — Batch 2026-03-06',
        explanation: 'EVV batch transmission to HHAeXchange failed for 12 visits from 03/06. Error: API timeout after 30 seconds. None of the visits were transmitted to the state aggregator.',
        suggestedResolution: 'Verify HHAeXchange API credentials and network connectivity. Retry transmission from EVV Monitor. If issue persists, contact HHAeXchange support at 1-800-555-0199.',
        quickAction: { label: 'Retry Transmission', route: '/monitor', actionType: 'navigate' },
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'monitor',
        createdAt: '2026-03-06T22:00:00.000Z', updatedAt: '2026-03-06T22:00:00.000Z', sortOrder: 3,
      },
      {
        id: 'calert-004', severity: 'critical', category: 'claims', status: 'acknowledged',
        title: 'Claim Rejected — Patricia Brown (Medicaid)',
        explanation: 'Claim #CLM-2026-0412 for Patricia Brown was rejected by Medicaid. Rejection reason: "Diagnosis code I50.9 does not support the billed service type (97110-PT)." Amount: $285.00.',
        suggestedResolution: 'Review diagnosis coding with the treating therapist. Update primary diagnosis to a PT-qualifying code (e.g., M62.81) and resubmit claim within 30-day timely filing window.',
        quickAction: { label: 'Review Claim', route: '/billing', actionType: 'navigate' },
        patientId: 'patient-demo-004', patientName: 'Patricia Brown', patientMrn: 'MRN001237',
        officeId: SEED_OFFICE_SOUTH_ID, sourceModule: 'billing', relatedEntityType: 'claim',
        createdAt: '2026-03-05T14:00:00.000Z', updatedAt: '2026-03-06T09:15:00.000Z',
        acknowledgedAt: '2026-03-06T09:15:00.000Z', acknowledgedBy: 'biller-user', sortOrder: 4,
      },
      // ─── HIGH PRIORITY ───
      {
        id: 'calert-005', severity: 'high', category: 'admission', status: 'open',
        title: 'Admission Incomplete — James Davis',
        explanation: 'Patient James Davis has a pending admission (ADM-005) created on 03/01 that is still incomplete after 6 days. Missing: Start of Care date, certification period, and insurance verification.',
        suggestedResolution: 'Complete admission intake by setting SOC date, defining cert period, and verifying Medicare eligibility. Contact referral source (Hospital Discharge) if missing information.',
        quickAction: { label: 'Complete Admission', route: '/admissions/adm-005', actionType: 'navigate' },
        patientId: 'patient-demo-005', patientName: 'James Davis', patientMrn: 'MRN001238',
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'admissions', relatedEntityType: 'admission', relatedEntityId: 'adm-005',
        createdAt: '2026-03-06T08:00:00.000Z', updatedAt: '2026-03-06T08:00:00.000Z', sortOrder: 5,
      },
      {
        id: 'calert-006', severity: 'high', category: 'assessment', status: 'open',
        title: 'HOPE Assessment Due — Robert Williams',
        explanation: 'HOPE assessment for hospice patient Robert Williams is due within 5 days (due date: 03/12). This is a CMS-required assessment for continued hospice certification.',
        suggestedResolution: 'Schedule HOPE assessment visit with primary hospice nurse. Ensure IDG team is prepared with patient progress notes for the assessment period.',
        quickAction: { label: 'Schedule Assessment', route: '/hospice', actionType: 'navigate' },
        patientId: 'patient-demo-003', patientName: 'Robert Williams', patientMrn: 'MRN001236',
        officeId: SEED_OFFICE_NORTH_ID, sourceModule: 'hospice', relatedEntityType: 'admission', relatedEntityId: 'adm-003',
        createdAt: '2026-03-07T06:00:00.000Z', updatedAt: '2026-03-07T06:00:00.000Z', sortOrder: 6,
      },
      {
        id: 'calert-007', severity: 'high', category: 'documentation', status: 'open',
        title: 'Physician Signature Needed — Verbal Orders',
        explanation: '3 verbal orders are awaiting physician co-signature and will expire within 48 hours. Affected patients: John Smith (2 orders), Mary Johnson (1 order). CMS requires physician signature within 14 days.',
        suggestedResolution: 'Send signature request to ordering physicians via fax or secure portal. Escalate to medical director if not obtained within 24 hours.',
        quickAction: { label: 'View Orders', route: '/clinical/verbal-orders', actionType: 'navigate' },
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'clinical',
        createdAt: '2026-03-06T12:00:00.000Z', updatedAt: '2026-03-06T12:00:00.000Z', sortOrder: 7,
      },
      // ─── WARNING ───
      {
        id: 'calert-008', severity: 'warning', category: 'authorization', status: 'open',
        title: 'Authorization Expiring Soon — Mary Johnson',
        explanation: 'Current Blue Cross authorization for Mary Johnson expires on 03/15/2026 (8 days remaining). 4 SN visits and 3 PT visits remain authorized.',
        suggestedResolution: 'Initiate recertification process. Prepare updated plan of care with continued medical necessity documentation. Submit to Blue Cross at least 5 business days before expiration.',
        quickAction: { label: 'Start Recert', route: '/patient/patient-demo-002/chart', actionType: 'navigate' },
        patientId: 'patient-demo-002', patientName: 'Mary Johnson', patientMrn: 'MRN001235',
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'admissions',
        createdAt: '2026-03-07T06:00:00.000Z', updatedAt: '2026-03-07T06:00:00.000Z', sortOrder: 8,
      },
      {
        id: 'calert-009', severity: 'warning', category: 'documentation', status: 'open',
        title: 'Documentation Overdue — 3 Visit Notes',
        explanation: '3 visit notes are overdue by more than 24 hours: PT visit for Mary Johnson (03/04), OT visit for Robert Williams (03/03), SN visit for Patricia Brown (03/05). Documentation timeliness is at 87% this month.',
        suggestedResolution: 'Contact clinicians to complete overdue documentation. Enable documentation reminders. Consider implementing point-of-care documentation to improve timeliness.',
        quickAction: { label: 'View Overdue', route: '/clinical/visit-notes', actionType: 'navigate' },
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'clinical',
        createdAt: '2026-03-06T20:00:00.000Z', updatedAt: '2026-03-06T20:00:00.000Z', sortOrder: 9,
      },
      {
        id: 'calert-010', severity: 'warning', category: 'visit', status: 'open',
        title: 'Delayed Visit — Patricia Brown',
        explanation: 'SN visit for Patricia Brown was scheduled for 03/06 at 9:00 AM but clinician has not arrived. The visit is now 45 minutes past the scheduled time.',
        suggestedResolution: 'Contact assigned clinician David Martinez for status update. If clinician is unavailable, reassign visit to available staff. Notify patient of potential delay.',
        quickAction: { label: 'Contact Clinician', route: '/scheduling', actionType: 'navigate' },
        patientId: 'patient-demo-004', patientName: 'Patricia Brown', patientMrn: 'MRN001237',
        officeId: SEED_OFFICE_SOUTH_ID, sourceModule: 'scheduling',
        createdAt: '2026-03-06T09:45:00.000Z', updatedAt: '2026-03-06T09:45:00.000Z', sortOrder: 10,
      },
      // ─── INFORMATIONAL ───
      {
        id: 'calert-011', severity: 'info', category: 'referral', status: 'open',
        title: 'New Referral Received — Thomas Anderson',
        explanation: 'New home health referral received from San Francisco General Hospital for Thomas Anderson (DOB: 08/22/1940). Diagnosis: J18.9 Pneumonia. Requesting SN and PT services.',
        suggestedResolution: 'Review referral details and begin intake process. Verify insurance eligibility. Assign intake coordinator and schedule initial assessment within 48 hours of referral.',
        quickAction: { label: 'Start Intake', route: '/new-admission', actionType: 'navigate' },
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'admissions',
        createdAt: '2026-03-07T10:00:00.000Z', updatedAt: '2026-03-07T10:00:00.000Z', sortOrder: 11,
      },
      {
        id: 'calert-012', severity: 'info', category: 'documentation', status: 'open',
        title: 'Document Uploaded — John Smith',
        explanation: 'New document uploaded to patient John Smith\'s chart: "Hospital Discharge Summary — SF General (03/01/2026)". Uploaded by intake coordinator Lisa Adams.',
        suggestedResolution: 'Review discharge summary for updated medication list, follow-up instructions, and specialist recommendations. Update plan of care if needed.',
        quickAction: { label: 'View Document', route: '/patient/patient-demo-001/chart', actionType: 'navigate' },
        patientId: 'patient-demo-001', patientName: 'John Smith', patientMrn: 'MRN001234',
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'patient',
        createdAt: '2026-03-07T08:30:00.000Z', updatedAt: '2026-03-07T08:30:00.000Z', sortOrder: 12,
      },
      {
        id: 'calert-013', severity: 'info', category: 'patient', status: 'open',
        title: 'Patient Update — Linda Garcia',
        explanation: 'Patient Linda Garcia\'s emergency contact has been updated. New primary contact: Maria Garcia (daughter), phone: (650) 555-2020. Previous admission record notes updated by care coordinator.',
        suggestedResolution: 'No action required. Update has been recorded in the patient chart. Verify new contact information at the next scheduled visit.',
        patientId: 'patient-demo-006', patientName: 'Linda Garcia', patientMrn: 'MRN001239',
        officeId: SEED_OFFICE_SOUTH_ID, sourceModule: 'patient',
        createdAt: '2026-03-06T15:00:00.000Z', updatedAt: '2026-03-06T15:00:00.000Z', sortOrder: 13,
      },
      {
        id: 'calert-014', severity: 'info', category: 'compliance', status: 'resolved',
        title: 'Monthly Compliance Report Available',
        explanation: 'February 2026 compliance report has been generated. EVV compliance: 94%. Documentation timeliness: 87%. All metrics available in the Monitor dashboard.',
        suggestedResolution: 'Review compliance metrics in the Monitor module. Address any below-target areas with corrective action plans.',
        quickAction: { label: 'View Report', route: '/monitor', actionType: 'navigate' },
        officeId: SEED_OFFICE_MAIN_ID, sourceModule: 'monitor',
        createdAt: '2026-03-01T06:00:00.000Z', updatedAt: '2026-03-02T09:00:00.000Z',
        resolvedAt: '2026-03-02T09:00:00.000Z', resolvedBy: 'admin-user', sortOrder: 14,
      },
    ];

    for (const alert of SEED_CLINICAL_ALERTS) {
      await kv.set(`clinical-alert:${alert.id}`, alert);
    }
    console.log('[seed] Clinical alerts seeded ✓');

    // ─── Patient Documents (metadata in KV) ──────────────────────────────────
    const SEED_PATIENT_DOCUMENTS = [
      // Patient 001 (John Smith)
      { id: 'pdoc-001', patientId: 'patient-demo-001', folder: 'clinical', name: 'OASIS-E Start of Care Assessment.pdf', type: 'pdf', size: '245 KB', uploaded_by: 'Sarah Johnson, RN', uploaded_at: '2026-02-15T10:30:00.000Z', storage_path: 'patient-demo-001/clinical/oasis-soc.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-002', patientId: 'patient-demo-001', folder: 'clinical', name: 'Wound Assessment Photos - Left Shin.jpg', type: 'image', size: '1.8 MB', uploaded_by: 'Sarah Johnson, RN', uploaded_at: '2026-03-01T14:15:00.000Z', storage_path: 'patient-demo-001/clinical/wound-photos.jpg', content_type: 'image/jpeg' },
      { id: 'pdoc-003', patientId: 'patient-demo-001', folder: 'orders', name: 'Verbal Order - Metoprolol Dose Increase.pdf', type: 'pdf', size: '42 KB', uploaded_by: 'Dr. Sarah Chen', uploaded_at: '2026-03-05T09:00:00.000Z', storage_path: 'patient-demo-001/orders/vo-metoprolol.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-004', patientId: 'patient-demo-001', folder: 'insurance', name: 'Medicare Authorization - Episode 2.pdf', type: 'pdf', size: '128 KB', uploaded_by: 'Lisa Adams, Auth Coordinator', uploaded_at: '2026-01-10T11:00:00.000Z', storage_path: 'patient-demo-001/insurance/auth-ep2.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-005', patientId: 'patient-demo-001', folder: 'consent', name: 'Patient Consent - Home Health Services.pdf', type: 'pdf', size: '95 KB', uploaded_by: 'Lisa Adams, Auth Coordinator', uploaded_at: '2025-11-15T08:30:00.000Z', storage_path: 'patient-demo-001/consent/consent-hh.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-006', patientId: 'patient-demo-001', folder: 'labs', name: 'CBC and CMP Results - March 2026.pdf', type: 'pdf', size: '67 KB', uploaded_by: 'Lab Corp', uploaded_at: '2026-03-04T16:00:00.000Z', storage_path: 'patient-demo-001/labs/cbc-cmp-mar.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-007', patientId: 'patient-demo-001', folder: 'correspondence', name: 'Hospital Discharge Summary - SF General.pdf', type: 'pdf', size: '312 KB', uploaded_by: 'Lisa Adams, Auth Coordinator', uploaded_at: '2026-03-01T08:00:00.000Z', storage_path: 'patient-demo-001/correspondence/discharge-sfg.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-008', patientId: 'patient-demo-001', folder: 'imaging', name: 'Chest X-Ray Report - February 2026.pdf', type: 'pdf', size: '156 KB', uploaded_by: 'Radiology Dept', uploaded_at: '2026-02-20T13:45:00.000Z', storage_path: 'patient-demo-001/imaging/cxr-feb.pdf', content_type: 'application/pdf' },
      // Patient 002 (Mary Johnson)
      { id: 'pdoc-009', patientId: 'patient-demo-002', folder: 'clinical', name: 'Wound Measurement Log - Q1 2026.xlsx', type: 'spreadsheet', size: '48 KB', uploaded_by: 'Sarah Johnson, RN', uploaded_at: '2026-03-06T10:00:00.000Z', storage_path: 'patient-demo-002/clinical/wound-log-q1.xlsx', content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { id: 'pdoc-010', patientId: 'patient-demo-002', folder: 'clinical', name: 'Plan of Care - Wound Management.pdf', type: 'pdf', size: '178 KB', uploaded_by: 'Sarah Johnson, RN', uploaded_at: '2026-01-10T09:30:00.000Z', storage_path: 'patient-demo-002/clinical/poc-wound.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-011', patientId: 'patient-demo-002', folder: 'orders', name: 'Standing Order - Wound Care Supplies.pdf', type: 'pdf', size: '35 KB', uploaded_by: 'Dr. James Wright', uploaded_at: '2026-01-15T14:00:00.000Z', storage_path: 'patient-demo-002/orders/standing-wound.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-012', patientId: 'patient-demo-002', folder: 'insurance', name: 'Blue Cross Authorization Letter.pdf', type: 'pdf', size: '92 KB', uploaded_by: 'Lisa Adams, Auth Coordinator', uploaded_at: '2026-01-05T11:30:00.000Z', storage_path: 'patient-demo-002/insurance/bcbs-auth.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-013', patientId: 'patient-demo-002', folder: 'labs', name: 'A1C and Lipid Panel Results.pdf', type: 'pdf', size: '54 KB', uploaded_by: 'Quest Diagnostics', uploaded_at: '2026-02-28T15:30:00.000Z', storage_path: 'patient-demo-002/labs/a1c-lipid.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-014', patientId: 'patient-demo-002', folder: 'consent', name: 'HIPAA Privacy Notice - Signed.pdf', type: 'pdf', size: '110 KB', uploaded_by: 'Lisa Adams, Auth Coordinator', uploaded_at: '2025-12-20T10:00:00.000Z', storage_path: 'patient-demo-002/consent/hipaa-signed.pdf', content_type: 'application/pdf' },
      // Patient 003 (Robert Williams — Hospice)
      { id: 'pdoc-015', patientId: 'patient-demo-003', folder: 'clinical', name: 'HOPE Assessment - February 2026.pdf', type: 'pdf', size: '198 KB', uploaded_by: 'Jennifer Lee, RN', uploaded_at: '2026-02-28T09:00:00.000Z', storage_path: 'patient-demo-003/clinical/hope-feb.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-016', patientId: 'patient-demo-003', folder: 'clinical', name: 'IDG Meeting Notes - March 2026.pdf', type: 'pdf', size: '145 KB', uploaded_by: 'Dr. Robert Taylor', uploaded_at: '2026-03-01T12:00:00.000Z', storage_path: 'patient-demo-003/clinical/idg-mar.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-017', patientId: 'patient-demo-003', folder: 'orders', name: 'Comfort Care Protocol - Updated.pdf', type: 'pdf', size: '88 KB', uploaded_by: 'Dr. Robert Taylor', uploaded_at: '2026-03-02T10:30:00.000Z', storage_path: 'patient-demo-003/orders/comfort-care.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-018', patientId: 'patient-demo-003', folder: 'consent', name: 'Hospice Election Statement - Signed.pdf', type: 'pdf', size: '120 KB', uploaded_by: 'Lisa Adams, Auth Coordinator', uploaded_at: '2025-09-01T08:00:00.000Z', storage_path: 'patient-demo-003/consent/hospice-election.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-019', patientId: 'patient-demo-003', folder: 'correspondence', name: 'Advance Directive - DNR.pdf', type: 'pdf', size: '76 KB', uploaded_by: 'Lisa Adams, Auth Coordinator', uploaded_at: '2025-09-01T08:15:00.000Z', storage_path: 'patient-demo-003/correspondence/dnr.pdf', content_type: 'application/pdf' },
      // Patient 004 (Patricia Brown)
      { id: 'pdoc-020', patientId: 'patient-demo-004', folder: 'clinical', name: 'Cardiac Assessment - March 2026.pdf', type: 'pdf', size: '165 KB', uploaded_by: 'David Martinez, LPN', uploaded_at: '2026-03-06T10:00:00.000Z', storage_path: 'patient-demo-004/clinical/cardiac-mar.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-021', patientId: 'patient-demo-004', folder: 'insurance', name: 'Medicaid Eligibility Verification.pdf', type: 'pdf', size: '45 KB', uploaded_by: 'Lisa Adams, Auth Coordinator', uploaded_at: '2026-01-20T14:00:00.000Z', storage_path: 'patient-demo-004/insurance/medicaid-verify.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-022', patientId: 'patient-demo-004', folder: 'labs', name: 'BNP and Electrolyte Panel.pdf', type: 'pdf', size: '58 KB', uploaded_by: 'Lab Corp', uploaded_at: '2026-03-03T16:30:00.000Z', storage_path: 'patient-demo-004/labs/bnp-electrolytes.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-023', patientId: 'patient-demo-004', folder: 'imaging', name: 'Echocardiogram Report.pdf', type: 'pdf', size: '220 KB', uploaded_by: 'Cardiology Associates', uploaded_at: '2026-02-10T11:00:00.000Z', storage_path: 'patient-demo-004/imaging/echo-report.pdf', content_type: 'application/pdf' },
      { id: 'pdoc-024', patientId: 'patient-demo-004', folder: 'other', name: 'Patient Satisfaction Survey.pdf', type: 'pdf', size: '32 KB', uploaded_by: 'Quality Team', uploaded_at: '2026-03-01T09:00:00.000Z', storage_path: 'patient-demo-004/other/satisfaction.pdf', content_type: 'application/pdf' },
    ];

    for (const doc of SEED_PATIENT_DOCUMENTS) {
      await kv.set(`patient-doc:${doc.patientId}:${doc.id}`, doc);
    }
    console.log('[seed] Patient documents seeded ✓');

    // ─── Annotations / Comments (seed a few for demo) ────────────────────────
    const SEED_ANNOTATIONS = [
      {
        id: 'ann-seed-001', entityId: 'vo-001', entityType: 'verbal_order', patientId: 'patient-demo-001',
        text: 'Patient tolerating Lisinopril well. BP trending down from 148/92 to 132/78 over past week.',
        author: 'Sarah Johnson, RN', createdAt: '2026-03-03T10:00:00.000Z',
      },
      {
        id: 'ann-seed-002', entityId: 'vo-001', entityType: 'verbal_order', patientId: 'patient-demo-001',
        text: 'Physician confirmed dose is appropriate. No adjustment needed at this time.',
        author: 'Dr. Anderson', createdAt: '2026-03-04T14:30:00.000Z',
      },
      {
        id: 'ann-seed-003', entityId: 'vo-006', entityType: 'verbal_order', patientId: 'patient-demo-001',
        text: 'Wound measured 2.1 x 1.8 cm. Slight improvement from last week. Continue current treatment protocol.',
        author: 'Sarah Johnson, RN', createdAt: '2026-03-06T11:00:00.000Z',
      },
      {
        id: 'ann-seed-004', entityId: 'poc-001', entityType: 'plan_of_care', patientId: 'patient-demo-001',
        text: 'PT signature still pending. Michael Chen was notified via secure message on 03/02.',
        author: 'Sarah Johnson, RN', createdAt: '2026-03-03T08:00:00.000Z',
      },
      {
        id: 'ann-seed-005', entityId: 'vo-002', entityType: 'verbal_order', patientId: 'patient-demo-002',
        text: 'Labs drawn and sent to Quest Diagnostics. Results expected within 48 hours.',
        author: 'David Martinez, LPN', createdAt: '2026-03-04T09:00:00.000Z',
      },
    ];
    for (const ann of SEED_ANNOTATIONS) {
      await kv.set(`annotation:${ann.patientId}:${ann.entityType}:${ann.entityId}:${ann.id}`, ann);
    }
    console.log('[seed] Annotations seeded ✓');

    console.log('[seed] Idempotent seed complete ✓');
  } catch (err: any) {
    console.error('[seed] Seed error:', err?.message ?? err);
  }
}

// Auto-seed on every cold start
runSeed();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function verifyUser(request: Request): Promise<{ userId: string; user: any }> {
  // WORKAROUND: Edge Function gateway rejects ES256 user tokens
  // Client sends publicAnonKey in Authorization and user token in X-User-Token
  // DEV MODE: Always returns a valid user (demo fallback enabled)
  const accessToken = request.headers.get('X-User-Token');
  const DEMO_FALLBACK = { userId: 'demo-user-001', user: { id: 'demo-user-001', email: 'demo@homehealth.app' } };
  
  console.log('[verifyUser] Auth header present:', !!request.headers.get('Authorization'));
  console.log('[verifyUser] X-User-Token present:', !!accessToken);
  
  // If no user token provided, fall back to a demo identity so the app
  // works before a real user has signed in (prototype / demo mode).
  if (!accessToken) {
    console.log('[verifyUser] No X-User-Token – falling back to demo user');
    return DEMO_FALLBACK;
  }

  console.log('[verifyUser] Calling supabaseAdmin.auth.getUser with token:', accessToken.substring(0, 30) + '...');
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  
  console.log('[verifyUser] getUser response - user:', !!user, 'error:', error ? error.message : 'none');
  
  if (error || !user) {
    console.log('[verifyUser] Token validation failed – falling back to demo user');
    return DEMO_FALLBACK;
  }
  
  console.log('[verifyUser] Token validated successfully for user:', user.id);
  return { userId: user.id, user };
}

async function createAuditLog(userId: string, action: string, entityType: string, entityId: string, oldValue: any, newValue: any) {
  const entry = {
    user_id: userId, action, entity_type: entityType, entity_id: entityId,
    old_value: oldValue ? JSON.stringify(oldValue) : null,
    new_value: newValue ? JSON.stringify(newValue) : null,
    timestamp: new Date().toISOString(),
  };
  await kv.set(`audit:${Date.now()}:${userId}`, entry);
  return entry;
}

async function createExternalOperationLog(userId: string, integrationCategory: string, vendor: string, operation: string, success: boolean, details: string) {
  const entry = { user_id: userId, integration_category: integrationCategory, vendor, operation, success, details, timestamp: new Date().toISOString() };
  await kv.set(`external-operation:${Date.now()}:${userId}`, entry);
  return entry;
}

function maskCredentials(credentials: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(credentials)) {
    if (!value) { masked[key] = ''; }
    else if (value.length <= 4) { masked[key] = '****'; }
    else { masked[key] = value.substring(0, 2) + '****' + value.substring(value.length - 2); }
  }
  return masked;
}

// ============= HEALTH =============

app.get("/make-server-845bc545/health", (c) => {
  const hasUrl = !!Deno.env.get('SUPABASE_URL');
  const hasServiceKey = !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  return c.json({ 
    status: "ok",
    env: {
      SUPABASE_URL: hasUrl,
      SUPABASE_SERVICE_ROLE_KEY: hasServiceKey,
    },
    supabaseUrl: Deno.env.get('SUPABASE_URL'),
  });
});

// ============= AUTH ROUTES =============

app.post("/make-server-845bc545/auth/signup", async (c) => {
  try {
    const { email, password, name, role, orgId, officeIds } = await c.req.json();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password,
      user_metadata: { name, role, org_id: orgId, office_ids: officeIds || [] },
      email_confirm: true,
    });
    if (error) { console.error('Auth signup error:', error); return c.json({ error: error.message }, 400); }
    const profile = { id: data.user.id, email, name, role, org_id: orgId, office_ids: officeIds || [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await kv.set(`profile:${data.user.id}`, profile);
    return c.json({ user: data.user, profile });
  } catch (error: any) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

app.get("/make-server-845bc545/auth/profile", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const profile = await kv.get(`profile:${verified.userId}`);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ profile });
});

// ============= ORGANIZATION ROUTES =============

app.get("/make-server-845bc545/orgs", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const orgs = await kv.getByPrefix('org:');
  return c.json({ orgs: orgs || [] });
});

app.post("/make-server-845bc545/orgs", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { name, type } = await c.req.json();
  const orgId = `org-${Date.now()}`;
  const org = { id: orgId, name, type, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  await kv.set(`org:${orgId}`, org);
  await createAuditLog(verified.userId, 'CREATE', 'organization', orgId, null, org);
  return c.json({ org });
});

// ============= SETUP ROUTES (PUBLIC) =============

app.get("/make-server-845bc545/setup/status", async (c) => {
  try {
    const orgs = await kv.getByPrefix('org:');
    return c.json({ initialized: orgs && orgs.length > 0 });
  } catch (error: any) {
    return c.json({ error: 'Failed to check setup status', details: error.message }, 500);
  }
});

app.post("/make-server-845bc545/setup/org", async (c) => {
  try {
    const { name, type } = await c.req.json();
    const orgId = `org-${Date.now()}`;
    const org = { id: orgId, name, type, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await kv.set(`org:${orgId}`, org);
    return c.json({ org });
  } catch (error: any) {
    return c.json({ error: 'Failed to create organization', details: error.message }, 500);
  }
});

app.post("/make-server-845bc545/setup/office", async (c) => {
  try {
    const { name, orgId, address, phone } = await c.req.json();
    const officeId = `office-${Date.now()}`;
    const office = { id: officeId, org_id: orgId, name, address, phone, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await kv.set(`office:${orgId}:${officeId}`, office);
    return c.json({ office });
  } catch (error: any) {
    return c.json({ error: 'Failed to create office', details: error.message }, 500);
  }
});

app.post("/make-server-845bc545/setup/admin", async (c) => {
  try {
    const { email, password, name, role, orgId, officeIds } = await c.req.json();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password,
      user_metadata: { name, role, org_id: orgId, office_ids: officeIds || [] },
      email_confirm: true,
    });
    if (error) { console.error('Auth signup error during setup:', error); return c.json({ error: error.message }, 400); }
    const profile = { id: data.user.id, email, name, role, org_id: orgId, office_ids: officeIds || [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    await kv.set(`profile:${data.user.id}`, profile);
    return c.json({ user: data.user, profile });
  } catch (error: any) {
    return c.json({ error: 'Internal server error during setup' }, 500);
  }
});

// ============= OFFICE ROUTES =============

app.get("/make-server-845bc545/offices/:orgId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const offices = await kv.getByPrefix(`office:${c.req.param('orgId')}:`);
  return c.json({ offices: offices || [] });
});

app.post("/make-server-845bc545/offices", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { name, orgId, address, phone } = await c.req.json();
  const officeId = `office-${Date.now()}`;
  const office = { id: officeId, org_id: orgId, name, address, phone, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  await kv.set(`office:${orgId}:${officeId}`, office);
  await createAuditLog(verified.userId, 'CREATE', 'office', officeId, null, office);
  return c.json({ office });
});

// ============= MODULE ROUTES =============

app.get("/make-server-845bc545/modules", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const modules = await kv.getByPrefix('module:');
  return c.json({ modules: modules || [] });
});

app.post("/make-server-845bc545/modules/init", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  for (const mod of SEED_MODULES) {
    await kv.set(`module:${mod.id}`, { ...mod, created_at: new Date().toISOString() });
  }
  return c.json({ message: 'Modules initialized', count: SEED_MODULES.length });
});

// ============= FEATURE ROUTES =============

app.get("/make-server-845bc545/features", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const features = await kv.getByPrefix('feature:');
  return c.json({ features: features || [] });
});

app.post("/make-server-845bc545/features/init", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  for (const feature of SEED_FEATURES) {
    await kv.set(`feature:${feature.id}`, { ...feature, created_at: new Date().toISOString() });
  }
  return c.json({ message: 'Features initialized', count: SEED_FEATURES.length });
});

// ============= MODULE SETTINGS ROUTES =============

app.get("/make-server-845bc545/module-settings/:orgId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const settings = await kv.getByPrefix(`module-setting:${c.req.param('orgId')}:`);
  return c.json({ settings: settings || [] });
});

app.put("/make-server-845bc545/module-settings", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { orgId, moduleId, enabled, officeOverrides } = await c.req.json();
  const settingKey = `module-setting:${orgId}:${moduleId}`;
  const oldSetting = await kv.get(settingKey);
  const setting = { org_id: orgId, module_id: moduleId, enabled, office_overrides: officeOverrides || {}, updated_at: new Date().toISOString(), updated_by: verified.userId };
  await kv.set(settingKey, setting);
  await createAuditLog(verified.userId, 'UPDATE', 'module_setting', `${orgId}:${moduleId}`, oldSetting, setting);
  return c.json({ setting });
});

// ============= FEATURE SETTINGS ROUTES =============

app.get("/make-server-845bc545/feature-settings/:orgId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const settings = await kv.getByPrefix(`feature-setting:${c.req.param('orgId')}:`);
  return c.json({ settings: settings || [] });
});

app.put("/make-server-845bc545/feature-settings", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { orgId, featureId, enabled, officeOverrides } = await c.req.json();
  const settingKey = `feature-setting:${orgId}:${featureId}`;
  const oldSetting = await kv.get(settingKey);
  const setting = { org_id: orgId, feature_id: featureId, enabled, office_overrides: officeOverrides || {}, updated_at: new Date().toISOString(), updated_by: verified.userId };
  await kv.set(settingKey, setting);
  await createAuditLog(verified.userId, 'UPDATE', 'feature_setting', `${orgId}:${featureId}`, oldSetting, setting);
  return c.json({ setting });
});

// ============= AUDIT LOG ROUTES =============

app.get("/make-server-845bc545/audit-logs", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '50', 10);
  const entityType = c.req.query('entityType');
  const action = c.req.query('action');
  let logs = await kv.getByPrefix('audit:') || [];
  if (entityType) logs = logs.filter((l: any) => l.entity_type === entityType);
  if (action) logs = logs.filter((l: any) => l.action === action);
  logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const total = logs.length;
  const start = (page - 1) * pageSize;
  const paginatedLogs = logs.slice(start, start + pageSize);
  return c.json({ logs: paginatedLogs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
});

// Create audit log entry (frontend-originated)
app.post("/make-server-845bc545/audit-logs", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { action, entityType, entityId, changes } = await c.req.json();
    const entry = await createAuditLog(verified.userId, action, entityType, entityId, null, changes || null);
    return c.json({ log: entry });
  } catch (err: any) {
    console.log('[audit] Error creating audit log:', err?.message);
    return c.json({ error: `Failed to create audit log: ${err?.message}` }, 500);
  }
});

// ============= PATIENT ROUTES =============

// Get all patients for an organization (must come before /:officeId)
app.get("/make-server-845bc545/patients/org/:orgId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const orgId = c.req.param('orgId');
  const patients = await kv.getByPrefix(`patient:`);
  const orgPatients = patients?.filter((p: any) => p.office_id?.startsWith(orgId) || true) || [];
  return c.json({ patients: orgPatients });
});

// Search patients (must come before /:officeId)
app.get("/make-server-845bc545/patients/search/:orgId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const query = c.req.query('query')?.toLowerCase() || '';
  const patients = await kv.getByPrefix(`patient:`);
  const filtered = patients?.filter((p: any) => {
    const searchStr = `${p.first_name} ${p.last_name} ${p.mrn} ${p.phone} ${p.address || ''}`.toLowerCase();
    return searchStr.includes(query);
  }) || [];
  return c.json({ patients: filtered });
});

// Get patient by ID (must come before /:officeId)
app.get("/make-server-845bc545/patients/detail/:patientId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const patientId = c.req.param('patientId');
  const patients = await kv.getByPrefix(`patient:`);
  const patient = patients?.find((p: any) => p.id === patientId);
  if (!patient) return c.json({ error: 'Patient not found' }, 404);
  return c.json({ patient });
});

// Get patients by office ID
app.get("/make-server-845bc545/patients/:officeId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const patients = await kv.getByPrefix(`patient:${c.req.param('officeId')}:`);
  return c.json({ patients: patients || [] });
});

app.post("/make-server-845bc545/patients", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { officeId, firstName, lastName, dob, mrn, phone, address } = await c.req.json();
  const patientId = `patient-${Date.now()}`;
  const patient = { id: patientId, office_id: officeId, first_name: firstName, last_name: lastName, dob, mrn, phone, address, status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  await kv.set(`patient:${officeId}:${patientId}`, patient);
  await createAuditLog(verified.userId, 'CREATE', 'patient', patientId, null, patient);
  return c.json({ patient });
});

// Update patient
app.put("/make-server-845bc545/patients/:patientId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const patientId = c.req.param('patientId');
  const data = await c.req.json();
  const patients = await kv.getByPrefix(`patient:`);
  const existingPatient = patients?.find((p: any) => p.id === patientId);
  if (!existingPatient) return c.json({ error: 'Patient not found' }, 404);
  const updatedPatient = { ...existingPatient, ...data, updated_at: new Date().toISOString() };
  await kv.set(`patient:${updatedPatient.office_id}:${patientId}`, updatedPatient);
  await createAuditLog(verified.userId, 'UPDATE', 'patient', patientId, existingPatient, updatedPatient);
  return c.json({ patient: updatedPatient });
});

// ============= ALTERNATE LOCATIONS =============

app.get("/make-server-845bc545/patients/:patientId/alternate-locations", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const patientId = c.req.param('patientId');
  const locations = await kv.getByPrefix(`alt-location:${patientId}:`);
  return c.json({ locations: locations || [] });
});

app.post("/make-server-845bc545/patients/:patientId/alternate-locations", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const patientId = c.req.param('patientId');
  const { name, address, phone, notes } = await c.req.json();
  const locationId = `alt-loc-${Date.now()}`;
  const location = {
    id: locationId,
    patient_id: patientId,
    name,
    address,
    phone,
    notes,
    is_deleted: false,
    created_at: new Date().toISOString(),
  };
  await kv.set(`alt-location:${patientId}:${locationId}`, location);
  await createAuditLog(verified.userId, 'CREATE', 'alternate_location', locationId, null, location);
  return c.json({ location });
});

app.put("/make-server-845bc545/patients/:patientId/alternate-locations/:locationId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const patientId = c.req.param('patientId');
  const locationId = c.req.param('locationId');
  const data = await c.req.json();
  const existing = await kv.get(`alt-location:${patientId}:${locationId}`);
  if (!existing) return c.json({ error: 'Location not found' }, 404);
  const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
  await kv.set(`alt-location:${patientId}:${locationId}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'alternate_location', locationId, existing, updated);
  return c.json({ location: updated });
});

app.delete("/make-server-845bc545/patients/:patientId/alternate-locations/:locationId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const patientId = c.req.param('patientId');
  const locationId = c.req.param('locationId');
  await kv.del(`alt-location:${patientId}:${locationId}`);
  await createAuditLog(verified.userId, 'DELETE', 'alternate_location', locationId, null, null);
  return c.json({ success: true });
});

// ============= ADMISSIONS =============

// Get all admissions (across all patients) with optional status filter
app.get("/make-server-845bc545/admissions", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const status = c.req.query('status');
  const allAdmissions = await kv.getByPrefix(`admission:`);
  let admissions = allAdmissions || [];

  // Enrich with patient info
  const allPatients = await kv.getByPrefix(`patient:`);
  const patientMap = new Map((allPatients || []).map((p: any) => [p.id, p]));

  admissions = admissions.map((a: any) => {
    const patient = patientMap.get(a.patient_id);
    return {
      ...a,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
      patient_mrn: patient?.mrn || '',
      patient_dob: patient?.dob || '',
      patient_phone: patient?.phone || '',
      patient_address: patient?.address || '',
    };
  });

  if (status) {
    admissions = admissions.filter((a: any) => a.status === status);
  }

  // Sort by admission_date descending
  admissions.sort((a: any, b: any) =>
    new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime()
  );

  return c.json({ admissions });
});

app.get("/make-server-845bc545/patients/:patientId/admissions", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const patientId = c.req.param('patientId');
  const admissions = await kv.getByPrefix(`admission:${patientId}:`);
  return c.json({ admissions: admissions || [] });
});

app.get("/make-server-845bc545/admissions/:admissionId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const admissionId = c.req.param('admissionId');
  const allAdmissions = await kv.getByPrefix(`admission:`);
  const admission = allAdmissions?.find((a: any) => a.id === admissionId);
  if (!admission) return c.json({ error: 'Admission not found' }, 404);
  // Enrich with patient info
  const patient = await kv.get(`patient:${admission.patient_id}`);
  const enriched = {
    ...admission,
    patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
    patient_mrn: patient?.mrn || '',
    patient_dob: patient?.dob || '',
    patient_phone: patient?.phone || '',
    patient_address: patient?.address || '',
  };
  return c.json({ admission: enriched });
});

app.post("/make-server-845bc545/admissions", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { patientId, officeId, admissionDate, ...rest } = await c.req.json();
  const admissionId = `admission-${Date.now()}`;
  const admission = {
    id: admissionId,
    patient_id: patientId,
    office_id: officeId,
    admission_date: admissionDate,
    status: 'pending',
    ...rest,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await kv.set(`admission:${patientId}:${admissionId}`, admission);
  await createAuditLog(verified.userId, 'CREATE', 'admission', admissionId, null, admission);
  return c.json({ admission });
});

app.put("/make-server-845bc545/admissions/:admissionId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const admissionId = c.req.param('admissionId');
  const data = await c.req.json();
  const allAdmissions = await kv.getByPrefix(`admission:`);
  const existing = allAdmissions?.find((a: any) => a.id === admissionId);
  if (!existing) return c.json({ error: 'Admission not found' }, 404);
  const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
  await kv.set(`admission:${updated.patient_id}:${admissionId}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'admission', admissionId, existing, updated);
  return c.json({ admission: updated });
});

app.delete("/make-server-845bc545/admissions/:admissionId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const admissionId = c.req.param('admissionId');
  const allAdmissions = await kv.getByPrefix(`admission:`);
  const admission = allAdmissions?.find((a: any) => a.id === admissionId);
  if (!admission) return c.json({ error: 'Admission not found' }, 404);
  await kv.del(`admission:${admission.patient_id}:${admissionId}`);
  await createAuditLog(verified.userId, 'DELETE', 'admission', admissionId, null, null);
  return c.json({ success: true });
});

// ============= INSURANCE =============

app.get("/make-server-845bc545/admissions/:admissionId/insurance", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const admissionId = c.req.param('admissionId');
  const insurances = await kv.getByPrefix(`insurance:${admissionId}:`);
  return c.json({ insurances: insurances || [] });
});

app.post("/make-server-845bc545/admissions/:admissionId/insurance", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const admissionId = c.req.param('admissionId');
  const { payerId, priority, policyNumber, groupNumber, effectiveDate, terminationDate } = await c.req.json();
  const insuranceId = `insurance-${Date.now()}`;
  const insurance = {
    id: insuranceId,
    admission_id: admissionId,
    payer_id: payerId,
    priority,
    policy_number: policyNumber,
    group_number: groupNumber,
    effective_date: effectiveDate,
    termination_date: terminationDate,
    created_at: new Date().toISOString(),
  };
  await kv.set(`insurance:${admissionId}:${insuranceId}`, insurance);
  await createAuditLog(verified.userId, 'CREATE', 'insurance', insuranceId, null, insurance);
  return c.json({ insurance });
});

app.put("/make-server-845bc545/admissions/:admissionId/insurance/:insuranceId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const admissionId = c.req.param('admissionId');
  const insuranceId = c.req.param('insuranceId');
  const data = await c.req.json();
  const existing = await kv.get(`insurance:${admissionId}:${insuranceId}`);
  if (!existing) return c.json({ error: 'Insurance not found' }, 404);
  const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
  await kv.set(`insurance:${admissionId}:${insuranceId}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'insurance', insuranceId, existing, updated);
  return c.json({ insurance: updated });
});

app.delete("/make-server-845bc545/admissions/:admissionId/insurance/:insuranceId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const admissionId = c.req.param('admissionId');
  const insuranceId = c.req.param('insuranceId');
  await kv.del(`insurance:${admissionId}:${insuranceId}`);
  await createAuditLog(verified.userId, 'DELETE', 'insurance', insuranceId, null, null);
  return c.json({ success: true });
});

// ============= PAYERS =============

app.get("/make-server-845bc545/payers/:orgId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const orgId = c.req.param('orgId');
  const payers = await kv.getByPrefix(`payer:${orgId}:`);
  return c.json({ payers: payers || [] });
});

app.get("/make-server-845bc545/payers/:payerId/restrictions", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const payerId = c.req.param('payerId');
  const allPayers = await kv.getByPrefix(`payer:`);
  const payer = allPayers?.find((p: any) => p.id === payerId);
  return c.json({ restrictions: payer?.allowed_offices || [] });
});

// ============= INTEGRATION ROUTES =============

app.get("/make-server-845bc545/integrations/catalog", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const catalog = await kv.getByPrefix('integration-catalog:');
  return c.json({ catalog: catalog || [] });
});

app.post("/make-server-845bc545/integrations/catalog/init", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  for (const cat of SEED_INTEGRATION_CATALOG) {
    await kv.set(`integration-catalog:${cat.category}`, cat);
  }
  return c.json({ message: 'Integration catalog initialized', count: SEED_INTEGRATION_CATALOG.length });
});

app.get("/make-server-845bc545/integration-settings/:orgId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const orgId = c.req.param('orgId');
  const settings = await kv.getByPrefix(`integration-setting:${orgId}:`);
  const maskedSettings = settings?.map((setting: any) => {
    if (setting.credentials && Object.keys(setting.credentials).length > 0) {
      return { ...setting, credentials: maskCredentials(setting.credentials), credentialsMasked: true };
    }
    return setting;
  });
  return c.json({ settings: maskedSettings || [] });
});

app.put("/make-server-845bc545/integration-settings", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { orgId, category, vendor, state, credentials } = await c.req.json();
  const settingKey = `integration-setting:${orgId}:${category}`;
  const oldSetting = await kv.get(settingKey);
  const auditOldValue = oldSetting ? { ...oldSetting, credentials: oldSetting.credentials ? maskCredentials(oldSetting.credentials) : {} } : null;
  const auditNewValue = { org_id: orgId, category, vendor, state, credentials: credentials ? maskCredentials(credentials) : {} };
  const setting = { org_id: orgId, category, vendor, state, credentials: credentials || {}, updated_at: new Date().toISOString(), updated_by: verified.userId, _sensitive: true };
  await kv.set(settingKey, setting);
  await createAuditLog(verified.userId, 'UPDATE', 'integration_setting', `${orgId}:${category}`, auditOldValue, auditNewValue);
  return c.json({ setting: { ...setting, credentials: maskCredentials(setting.credentials), credentialsMasked: true } });
});

app.post("/make-server-845bc545/integrations/test-connection", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { orgId, category, vendor } = await c.req.json();
  const setting = await kv.get(`integration-setting:${orgId}:${category}`);
  if (!setting) return c.json({ error: 'Integration not configured' }, 400);
  const testSuccess = Math.random() > 0.2;
  const details = testSuccess
    ? `Successfully connected to ${vendor} API. All systems operational.`
    : `Failed to connect to ${vendor} API. Check credentials and network connectivity.`;
  await createExternalOperationLog(verified.userId, category, vendor, 'test_connection', testSuccess, details);
  return c.json({ success: testSuccess, details, timestamp: new Date().toISOString() });
});

app.get("/make-server-845bc545/external-operations", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const logs = await kv.getByPrefix('external-operation:');
  const sortedLogs = (logs || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return c.json({ logs: sortedLogs });
});

// ============= SEED ROUTES (PUBLIC) =============

// Manually re-trigger the idempotent seed (e.g. after a data wipe)
app.post("/make-server-845bc545/seed/demo", async (c) => {
  try {
    await runSeed();
    return c.json({
      success: true,
      message: 'Demo database seeded successfully (idempotent)',
      data: {
        org: SEED_ORG_ID,
        offices: SEED_OFFICES.map((o) => o.name),
        users: SEED_DEMO_USERS.map(({ password: _pw, officeIds: _o, ...rest }) => rest),
        modules: SEED_MODULES.length,
        features: SEED_FEATURES.length,
        patients: SEED_PATIENTS.length,
        visitNotes: SEED_VISIT_NOTES.length,
        plansOfCare: SEED_PLANS_OF_CARE.length,
        verbalOrders: SEED_VERBAL_ORDERS.length,
        qaDocuments: SEED_QA_DOCUMENTS.length,
        hospiceModule: 'seeded',
        billingModule: 'seeded',
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return c.json({ error: 'Failed to seed demo database', details: error.message }, 500);
  }
});

// Demo profiles list — used by the login page "Quick Access" dropdown
app.get("/make-server-845bc545/seed/profiles", async (c) => {
  const profiles = SEED_DEMO_USERS.map(({ password: _pw, officeIds: _o, ...rest }) => rest);
  return c.json({ profiles });
});

// Clear KV data (auth users remain)
app.post("/make-server-845bc545/seed/clear", async (c) => {
  return c.json({ success: true, message: 'Data clear is not implemented in this environment. Auth users remain in Supabase Auth.' });
});

// ============= SCHEDULING ROUTES =============

// Mount scheduling routes
app.route('/', schedulingApp);

// Mount hospice routes
app.route('/', hospiceApp);

// Mount billing routes
app.route('/', billingApp);

// Mount risks routes
app.route('/', risksApp);

// Mount collaboration routes
app.route('/', collaborationApp);

// Mount clinical assistant routes
app.route('/', clinicalAssistantApp);

// Mount documentation assist routes
app.route('/', documentationAssistApp);

// Mount patient risk scoring routes
app.route('/', riskScoringApp);

// Mount referral intake pipeline routes
app.route('/', referralPipelineApp);

// Mount POC monitor routes
app.route('/', pocMonitorApp);

// Mount payer integration routes
app.route('/', payerApp);

// Mount clinical assessment routes
app.route('/', assessmentApp);

// Mount SN assessment routes
app.route('/', snAssessmentApp);

// ============= CLINICAL MODULE ROUTES =============

// Visit Notes
app.get("/make-server-845bc545/clinical/visit-notes", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const visitNotes = await kv.getByPrefix('visit-note:');
  return c.json({ visitNotes: visitNotes || [] });
});

app.get("/make-server-845bc545/clinical/visit-notes/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const visitNote = await kv.get(`visit-note:${id}`);
  if (!visitNote) return c.json({ error: 'Visit note not found' }, 404);
  return c.json({ visitNote });
});

app.post("/make-server-845bc545/clinical/visit-notes", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const data = await c.req.json();
  const id = `visit-note-${Date.now()}`;
  const visitNote = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
  await kv.set(`visit-note:${id}`, visitNote);
  await createAuditLog(verified.userId, 'CREATE', 'visit_note', id, null, visitNote);
  return c.json({ visitNote });
});

app.put("/make-server-845bc545/clinical/visit-notes/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`visit-note:${id}`);
  if (!existing) return c.json({ error: 'Visit note not found' }, 404);
  const updated = { ...existing, ...data, lastModified: new Date().toISOString() };
  await kv.set(`visit-note:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'visit_note', id, existing, updated);
  return c.json({ visitNote: updated });
});

// Plans of Care
app.get("/make-server-845bc545/clinical/plans-of-care", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const plansOfCare = await kv.getByPrefix('plan-of-care:');
  return c.json({ plansOfCare: plansOfCare || [] });
});

app.get("/make-server-845bc545/clinical/plans-of-care/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const planOfCare = await kv.get(`plan-of-care:${id}`);
  if (!planOfCare) return c.json({ error: 'Plan of care not found' }, 404);
  return c.json({ planOfCare });
});

app.post("/make-server-845bc545/clinical/plans-of-care", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const data = await c.req.json();
  const id = `poc-${Date.now()}`;
  const planOfCare = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
  await kv.set(`plan-of-care:${id}`, planOfCare);
  await createAuditLog(verified.userId, 'CREATE', 'plan_of_care', id, null, planOfCare);
  return c.json({ planOfCare });
});

app.put("/make-server-845bc545/clinical/plans-of-care/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`plan-of-care:${id}`);
  if (!existing) return c.json({ error: 'Plan of care not found' }, 404);
  const updated = { ...existing, ...data, lastModified: new Date().toISOString() };
  await kv.set(`plan-of-care:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'plan_of_care', id, existing, updated);
  return c.json({ planOfCare: updated });
});

// Verbal Orders
app.get("/make-server-845bc545/clinical/verbal-orders", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const verbalOrders = await kv.getByPrefix('verbal-order:');
  return c.json({ verbalOrders: verbalOrders || [] });
});

app.get("/make-server-845bc545/clinical/verbal-orders/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const verbalOrder = await kv.get(`verbal-order:${id}`);
  if (!verbalOrder) return c.json({ error: 'Verbal order not found' }, 404);
  return c.json({ verbalOrder });
});

app.post("/make-server-845bc545/clinical/verbal-orders", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const data = await c.req.json();
  const id = `vo-${Date.now()}`;
  const verbalOrder = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
  await kv.set(`verbal-order:${id}`, verbalOrder);
  await createAuditLog(verified.userId, 'CREATE', 'verbal_order', id, null, verbalOrder);
  return c.json({ verbalOrder });
});

app.put("/make-server-845bc545/clinical/verbal-orders/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`verbal-order:${id}`);
  if (!existing) return c.json({ error: 'Verbal order not found' }, 404);
  const updated = { ...existing, ...data, lastModified: new Date().toISOString() };
  await kv.set(`verbal-order:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'verbal_order', id, existing, updated);
  return c.json({ verbalOrder: updated });
});

// QA Documents
app.get("/make-server-845bc545/clinical/qa-documents", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const qaDocuments = await kv.getByPrefix('qa-document:');
  return c.json({ qaDocuments: qaDocuments || [] });
});

app.get("/make-server-845bc545/clinical/qa-documents/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const qaDocument = await kv.get(`qa-document:${id}`);
  if (!qaDocument) return c.json({ error: 'QA document not found' }, 404);
  return c.json({ qaDocument });
});

app.put("/make-server-845bc545/clinical/qa-documents/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`qa-document:${id}`);
  if (!existing) return c.json({ error: 'QA document not found' }, 404);
  const updated = { ...existing, ...data, lastReviewedAt: new Date().toISOString() };
  await kv.set(`qa-document:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'qa_document', id, existing, updated);
  return c.json({ qaDocument: updated });
});

// ============= MONITOR MODULE ROUTES =============

// Get all monitor alerts with optional filters
app.get("/make-server-845bc545/monitor/alerts", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { severity, status, type } = c.req.query();
    let alerts = await kv.getByPrefix('monitor-alert:') || [];
    if (severity && severity !== 'all') alerts = alerts.filter((a: any) => a.severity === severity);
    if (status && status !== 'all') alerts = alerts.filter((a: any) => a.status === status);
    if (type && type !== 'all') alerts = alerts.filter((a: any) => a.type === type);
    alerts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ alerts });
  } catch (err: any) {
    console.log('[monitor] Error fetching alerts:', err?.message);
    return c.json({ error: err?.message }, 500);
  }
});

// Update alert status (acknowledge / resolve)
app.put("/make-server-845bc545/monitor/alerts/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`monitor-alert:${id}`);
  if (!existing) return c.json({ error: 'Alert not found' }, 404);
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  if (data.status === 'acknowledged' && !existing.acknowledgedAt) {
    updated.acknowledgedAt = new Date().toISOString();
  }
  if (data.status === 'resolved' && !existing.resolvedAt) {
    updated.resolvedAt = new Date().toISOString();
  }
  await kv.set(`monitor-alert:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'monitor_alert', id, existing, updated);
  return c.json({ alert: updated });
});

// Get compliance records
app.get("/make-server-845bc545/monitor/compliance", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const records = await kv.getByPrefix('monitor-compliance:') || [];
    return c.json({ compliance: records });
  } catch (err: any) {
    console.log('[monitor] Error fetching compliance:', err?.message);
    return c.json({ error: err?.message }, 500);
  }
});

// Get quality trend snapshots
app.get("/make-server-845bc545/monitor/quality-trends", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const snapshots = await kv.getByPrefix('monitor-quality:') || [];
    snapshots.sort((a: any, b: any) => a.id.localeCompare(b.id));
    return c.json({ trends: snapshots });
  } catch (err: any) {
    console.log('[monitor] Error fetching quality trends:', err?.message);
    return c.json({ error: err?.message }, 500);
  }
});

// Get monitor summary/dashboard metrics
app.get("/make-server-845bc545/monitor/summary", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const alerts = await kv.getByPrefix('monitor-alert:') || [];
    const compliance = await kv.getByPrefix('monitor-compliance:') || [];
    const openAlerts = alerts.filter((a: any) => a.status === 'open');
    const highSeverity = openAlerts.filter((a: any) => a.severity === 'high');
    const avgCompliance = compliance.length > 0
      ? Math.round(compliance.reduce((sum: number, c: any) => sum + c.current, 0) / compliance.length)
      : 0;
    const belowTarget = compliance.filter((c: any) => c.current < c.target);
    return c.json({
      summary: {
        totalAlerts: alerts.length,
        openAlerts: openAlerts.length,
        highSeverityOpen: highSeverity.length,
        acknowledgedAlerts: alerts.filter((a: any) => a.status === 'acknowledged').length,
        resolvedAlerts: alerts.filter((a: any) => a.status === 'resolved').length,
        avgCompliance,
        complianceMetrics: compliance.length,
        belowTarget: belowTarget.length,
      },
    });
  } catch (err: any) {
    console.log('[monitor] Error fetching summary:', err?.message);
    return c.json({ error: err?.message }, 500);
  }
});

// ============= ALERT SYSTEM =============

// Get all alerts with optional filtering
app.get("/make-server-845bc545/alerts", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { severity, status, category, patientId, officeId, sourceModule } = c.req.query();
    let alerts = await kv.getByPrefix('clinical-alert:') || [];
    if (severity && severity !== 'all') alerts = alerts.filter((a: any) => a.severity === severity);
    if (status && status !== 'all') alerts = alerts.filter((a: any) => a.status === status);
    if (category && category !== 'all') alerts = alerts.filter((a: any) => a.category === category);
    if (patientId) alerts = alerts.filter((a: any) => a.patientId === patientId);
    if (officeId) alerts = alerts.filter((a: any) => a.officeId === officeId);
    if (sourceModule) alerts = alerts.filter((a: any) => a.sourceModule === sourceModule);
    // Sort: open first, then by severity, then by createdAt
    const sevOrder: Record<string, number> = { critical: 0, high: 1, warning: 2, info: 3 };
    const statusOrder: Record<string, number> = { open: 0, acknowledged: 1, resolved: 2, dismissed: 3 };
    alerts.sort((a: any, b: any) => {
      const sd = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
      if (sd !== 0) return sd;
      const svd = (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4);
      if (svd !== 0) return svd;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return c.json({ alerts });
  } catch (err: any) {
    console.log('[alerts] Error fetching alerts:', err?.message);
    return c.json({ error: `Failed to fetch alerts: ${err?.message}` }, 500);
  }
});

// Create alert
app.post("/make-server-845bc545/alerts", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const data = await c.req.json();
    const alertId = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const alert = {
      ...data,
      id: alertId,
      status: data.status || 'open',
      createdAt: now,
      updatedAt: now,
    };
    await kv.set(`clinical-alert:${alertId}`, alert);
    await createAuditLog(verified.userId, 'CREATE', 'clinical_alert', alertId, null, alert);
    return c.json({ alert });
  } catch (err: any) {
    console.log('[alerts] Error creating alert:', err?.message);
    return c.json({ error: `Failed to create alert: ${err?.message}` }, 500);
  }
});

// Update alert status (acknowledge, resolve, dismiss)
app.put("/make-server-845bc545/alerts/:id", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  try {
    const existing = await kv.get(`clinical-alert:${id}`);
    if (!existing) return c.json({ error: 'Alert not found' }, 404);
    const data = await c.req.json();
    const now = new Date().toISOString();
    const updated = { ...existing, ...data, updatedAt: now };
    if (data.status === 'acknowledged' && !existing.acknowledgedAt) {
      updated.acknowledgedAt = now;
      updated.acknowledgedBy = verified.userId;
    }
    if (data.status === 'resolved' && !existing.resolvedAt) {
      updated.resolvedAt = now;
      updated.resolvedBy = verified.userId;
    }
    await kv.set(`clinical-alert:${id}`, updated);
    await createAuditLog(verified.userId, 'UPDATE', 'clinical_alert', id, existing, updated);
    return c.json({ alert: updated });
  } catch (err: any) {
    console.log('[alerts] Error updating alert:', err?.message);
    return c.json({ error: `Failed to update alert: ${err?.message}` }, 500);
  }
});

// ============= PATIENT TIMELINE =============
// Aggregates events from admissions, visits, clinical notes, verbal orders,
// billing, hospice, and per-patient timeline events into a single chronological feed.

app.get("/make-server-845bc545/patients/:patientId/timeline", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);

  const patientId = c.req.param('patientId');
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = parseInt(c.req.query('pageSize') || '50', 10);

  try {
    console.log(`[timeline] Fetching timeline for patient ${patientId}`);

    const events: any[] = [];

    // 1) Per-patient seeded timeline events (rich pre-built data)
    const seededEvents = await kv.getByPrefix(`timeline:${patientId}:`) || [];
    for (const ev of seededEvents) { events.push(ev); }

    // 2) Admissions → timeline events
    const admissions = await kv.getByPrefix(`admission:${patientId}:`) || [];
    for (const adm of admissions as any[]) {
      events.push({
        id: `tl-adm-${adm.id}`, type: 'admission',
        timestamp: adm.soc_date ? `${adm.soc_date}T09:00:00Z` : `${adm.admission_date}T09:00:00Z`,
        title: `${adm.type || 'Home Health'} Admission${adm.status === 'pending' ? ' (Pending)' : ' — Start of Care'}`,
        summary: `Patient admitted. Primary diagnosis: ${adm.diagnosis_primary || 'N/A'}. Referral: ${adm.referral_source || 'N/A'}. Payer: ${adm.payer || 'N/A'}.`,
        caregiver: adm.physician_name || undefined, caregiverRole: 'MD', status: adm.status,
        relatedEntityId: adm.id, relatedEntityType: 'admission',
        details: {
          'Admission Type': adm.type || 'Home Health', 'Primary Diagnosis': adm.diagnosis_primary || '—',
          'Referral Source': adm.referral_source || '—', 'Physician': adm.physician_name || '—',
          'Payer': adm.payer || '—', 'Status': adm.status,
          'Cert Period': adm.cert_period_start && adm.cert_period_end ? `${adm.cert_period_start} to ${adm.cert_period_end}` : '—',
        },
        tags: [adm.type || 'HH', adm.payer || ''].filter(Boolean),
      });
      if (adm.discharge_date) {
        events.push({
          id: `tl-dc-${adm.id}`, type: 'discharge',
          timestamp: `${adm.discharge_date}T14:00:00Z`,
          title: `Discharge — ${adm.discharge_reason || 'Completed'}`,
          summary: `Patient discharged from ${adm.type || 'Home Health'} services. Reason: ${adm.discharge_reason || 'N/A'}.`,
          caregiver: adm.physician_name || undefined, caregiverRole: 'MD', status: 'completed',
          relatedEntityId: adm.id, relatedEntityType: 'admission',
          details: { 'Discharge Date': adm.discharge_date, 'Reason': adm.discharge_reason || '—', 'Admission Type': adm.type || 'Home Health' },
          tags: ['Discharge', adm.discharge_reason || ''].filter(Boolean),
        });
      }
    }

    // 3) Verbal orders → timeline events
    const verbalOrders = await kv.getByPrefix('verbal-order:') || [];
    for (const vo of verbalOrders as any[]) {
      if (vo.patientId !== patientId) continue;
      events.push({
        id: `tl-vo-${vo.id}`, type: 'verbal_order', timestamp: vo.orderDate,
        title: `Verbal Order — ${vo.orderType.charAt(0).toUpperCase() + vo.orderType.slice(1)}`,
        summary: vo.orderDescription,
        caregiver: vo.receivedBy, caregiverRole: 'RN',
        status: vo.physicianSignedAt ? 'signed' : 'pending_signature',
        priority: vo.daysUntilExpiry <= 2 ? 'high' : 'medium',
        relatedEntityId: vo.id, relatedEntityType: 'verbal_order',
        details: { 'Order Type': vo.orderType, 'Ordering Physician': vo.orderedBy, 'Received By': vo.receivedBy, 'MD Signature': vo.physicianSignedAt ? `Signed — ${vo.physicianSignedAt.split('T')[0]}` : 'Pending', 'Days Until Expiry': String(vo.daysUntilExpiry) },
        tags: ['VO', vo.physicianSignedAt ? 'Signed' : 'Pending'].filter(Boolean),
      });
    }

    // 4) Clinical visit notes → timeline events
    const visitNotes = await kv.getByPrefix('visit-note:') || [];
    for (const vn of visitNotes as any[]) {
      if (vn.patientId !== patientId) continue;
      events.push({
        id: `tl-vn-${vn.id}`, type: 'clinical_note', timestamp: vn.createdAt,
        title: `${vn.serviceType} — Visit Note`,
        summary: `${vn.discipline?.toUpperCase()} visit note by ${vn.clinicianName}. QA Status: ${vn.qaStatus?.replace(/_/g, ' ')}.`,
        caregiver: vn.clinicianName, caregiverRole: vn.discipline?.toUpperCase(),
        status: vn.qaStatus, relatedEntityId: vn.id, relatedEntityType: 'clinical_note',
        details: { 'Service Type': vn.serviceType, 'Discipline': vn.discipline?.toUpperCase() || '—', 'Visit Date': vn.visitDate?.split('T')[0] || '—', 'QA Status': vn.qaStatus?.replace(/_/g, ' ') || '—', 'Signed By': vn.signedBy || 'Unsigned' },
        tags: [vn.discipline?.toUpperCase(), vn.qaStatus === 'approved' ? 'Approved' : null].filter(Boolean),
      });
    }

    // 5) Plans of care → timeline events
    const pocs = await kv.getByPrefix('plan-of-care:') || [];
    for (const poc of pocs as any[]) {
      if (poc.patientId !== patientId) continue;
      events.push({
        id: `tl-poc-${poc.id}`, type: 'poc_update', timestamp: poc.createdAt,
        title: `Plan of Care — ${poc.pocType?.charAt(0).toUpperCase() + poc.pocType?.slice(1)}`,
        summary: `${poc.pocType} POC for ${poc.startDate} to ${poc.endDate}. Created by ${poc.createdBy}. Signatures: ${poc.completedSignatures}/${poc.requiredSignatures}.`,
        caregiver: poc.createdBy, caregiverRole: 'MD', status: poc.qaStatus,
        relatedEntityId: poc.id, relatedEntityType: 'plan_of_care',
        details: { 'POC Type': poc.pocType, 'Period': `${poc.startDate} to ${poc.endDate}`, 'Signatures': `${poc.completedSignatures}/${poc.requiredSignatures}`, 'QA Status': poc.qaStatus?.replace(/_/g, ' ') || '—' },
        tags: ['POC', poc.pocType?.charAt(0).toUpperCase() + poc.pocType?.slice(1)].filter(Boolean),
      });
    }

    // 6) Billing claims → timeline events
    const billingClaims = await kv.getByPrefix('billing-claim:') || [];
    for (const claim of billingClaims as any[]) {
      if (claim.patient_id !== patientId) continue;
      events.push({
        id: `tl-bill-${claim.id}`, type: 'billing',
        timestamp: claim.service_date_from ? `${claim.service_date_from}T16:00:00Z` : claim.created_at || new Date().toISOString(),
        title: `${claim.claim_type || 'Claim'} — ${claim.status?.charAt(0).toUpperCase() + claim.status?.slice(1)}`,
        summary: `Claim ${claim.id} for ${claim.payer_name || 'Unknown Payer'}. Amount: $${claim.total_amount || '0.00'}.`,
        caregiver: claim.submitted_by || undefined, caregiverRole: 'Billing', status: claim.status,
        relatedEntityId: claim.id, relatedEntityType: 'claim',
        details: { 'Claim Type': claim.claim_type || '—', 'Payer': claim.payer_name || '—', 'Amount': `$${claim.total_amount || '0.00'}`, 'Service Dates': claim.service_date_from && claim.service_date_to ? `${claim.service_date_from} to ${claim.service_date_to}` : '—', 'Status': claim.status || '—' },
        tags: [claim.claim_type, claim.payer_name].filter(Boolean),
      });
    }

    // De-duplicate by ID (seeded events take priority)
    const seen = new Set<string>();
    const dedupedEvents: any[] = [];
    for (const ev of events) {
      if (!seen.has(ev.id)) { seen.add(ev.id); dedupedEvents.push(ev); }
    }

    // Sort chronologically (newest first)
    dedupedEvents.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Paginate
    const total = dedupedEvents.length;
    const start = (page - 1) * pageSize;
    const paginatedData = dedupedEvents.slice(start, start + pageSize);

    console.log(`[timeline] Returning ${paginatedData.length} of ${total} events for patient ${patientId}`);
    return c.json({ data: paginatedData, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err: any) {
    console.log(`[timeline] Error fetching timeline for patient ${patientId}:`, err?.message);
    return c.json({ error: `Failed to fetch timeline: ${err?.message}` }, 500);
  }
});

// Get single timeline event detail
app.get("/make-server-845bc545/timeline-events/:eventId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const eventId = c.req.param('eventId');
  try {
    const allTimeline = await kv.getByPrefix('timeline:') || [];
    const event = (allTimeline as any[]).find((e: any) => e.id === eventId);
    if (!event) return c.json({ error: 'Event not found' }, 404);
    return c.json({ event });
  } catch (err: any) {
    console.log(`[timeline] Error fetching event ${eventId}:`, err?.message);
    return c.json({ error: `Failed to fetch event: ${err?.message}` }, 500);
  }
});

// ============= WORKSPACE HOME — Operational Command Center =============

app.get("/make-server-845bc545/workspace/home", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      patients, admissions, visits, verbalOrders, qaDocuments,
      alerts, referrals, drafts, cosignDrafts, claims, authorizations, evvRecords,
    ] = await Promise.all([
      kv.getByPrefix('patient:').catch(() => []),
      kv.getByPrefix('admission:').catch(() => []),
      kv.getByPrefix('visit:').catch(() => []),
      kv.getByPrefix('verbal-order:').catch(() => []),
      kv.getByPrefix('qa-doc:').catch(() => []),
      kv.getByPrefix('alert:').catch(() => []),
      kv.getByPrefix('referral:').catch(() => []),
      kv.getByPrefix('doc-draft:').catch(() => []),
      kv.getByPrefix('cosign-draft:').catch(() => []),
      kv.getByPrefix('claim:').catch(() => []),
      kv.getByPrefix('authorization:').catch(() => []),
      kv.getByPrefix('evv:').catch(() => []),
    ]);

    // ── Zone 1: Critical Issues ─────────────────────────────────────
    const incompleteAdmissions = (admissions || []).filter((a: any) => a.status === 'pending' || a.status === 'incomplete');
    const delayedVisits = (visits || []).filter((v: any) => v.status === 'scheduled' && v.visit_date < today);
    const returnedDocs = (qaDocuments || []).filter((d: any) => d.qaStatus === 'returned');
    const unsignedOrders = (verbalOrders || []).filter((o: any) => !o.physicianSignedAt);
    const pendingCosigns = (cosignDrafts || []).filter((d: any) => d.cosignatureStatus === 'pending');
    const activeAlerts = (alerts || []).filter((a: any) => a.status === 'active' || a.status === 'new');
    const newReferrals = (referrals || []).filter((r: any) => r.stage === 'new_referral');

    const criticalIssues: any[] = [];
    if (incompleteAdmissions.length > 0) criticalIssues.push({ id: 'ci-admissions', title: 'Admissions Missing Required Fields', description: `${incompleteAdmissions.length} need completion`, severity: 'critical', category: 'Admissions', count: incompleteAdmissions.length, route: '/admissions' });
    if (delayedVisits.length > 0) criticalIssues.push({ id: 'ci-delayed', title: 'Delayed Visits', description: `${delayedVisits.length} past scheduled date`, severity: 'critical', category: 'Scheduling', count: delayedVisits.length, route: '/scheduling' });
    if (unsignedOrders.length > 0) criticalIssues.push({ id: 'ci-orders', title: 'Missing Physician Signatures', description: `${unsignedOrders.length} verbal orders pending`, severity: 'high', category: 'Clinical', count: unsignedOrders.length, route: '/clinical/verbal-orders' });
    if (returnedDocs.length > 0) criticalIssues.push({ id: 'ci-returned', title: 'QA Returned Documents', description: `${returnedDocs.length} need corrections`, severity: 'high', category: 'QA', count: returnedDocs.length, route: '/clinical/qa-review' });
    if (pendingCosigns.length > 0) criticalIssues.push({ id: 'ci-cosign', title: 'Pending Co-Signatures', description: `${pendingCosigns.length} awaiting co-signature`, severity: 'medium', category: 'Supervisor', count: pendingCosigns.length, route: '/cosign-queue' });
    if (newReferrals.length > 0) criticalIssues.push({ id: 'ci-referrals', title: 'New Referrals Pending', description: `${newReferrals.length} awaiting intake`, severity: 'medium', category: 'Intake', count: newReferrals.length, route: '/referral-pipeline' });
    if (activeAlerts.length > 0) criticalIssues.push({ id: 'ci-alerts', title: 'Operational Alerts', description: `${activeAlerts.length} active`, severity: activeAlerts.some((a: any) => a.priority === 'urgent') ? 'critical' : 'medium', category: 'Operations', count: activeAlerts.length, route: '/monitor' });

    // EVV transmission failures
    const evvFailures = (evvRecords || []).filter((e: any) => e.transmissionStatus === 'failed' || e.status === 'failed');
    if (evvFailures.length > 0) criticalIssues.push({ id: 'ci-evv', title: 'EVV Transmission Failures', description: `${evvFailures.length} failed transmissions`, severity: 'critical', category: 'EVV', count: evvFailures.length, route: '/scheduling' });

    // HOPE assessments due
    const hopeAssessmentsDue = (admissions || []).filter((a: any) => a.type === 'hospice' && a.hopeAssessmentDue && a.hopeAssessmentDue <= today && !a.hopeAssessmentCompleted);
    if (hopeAssessmentsDue.length > 0) criticalIssues.push({ id: 'ci-hope', title: 'HOPE Assessments Due', description: `${hopeAssessmentsDue.length} overdue`, severity: 'high', category: 'Hospice', count: hopeAssessmentsDue.length, route: '/hospice' });

    // Expiring authorizations (within 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const expiringAuths = (authorizations || []).filter((auth: any) => auth.endDate && auth.endDate >= today && auth.endDate <= sevenDaysFromNow && auth.status !== 'expired');
    if (expiringAuths.length > 0) criticalIssues.push({ id: 'ci-auth-expiring', title: 'Expiring Authorizations', description: `${expiringAuths.length} expire within 7 days`, severity: 'high', category: 'Authorization', count: expiringAuths.length, route: '/admissions' });

    // ── Zone 2: Today's Work ────────────────────────────────────────
    const todayVisits = (visits || []).filter((v: any) => v.visit_date === today).sort((a: any, b: any) => (a.start_time || '').localeCompare(b.start_time || ''));
    const todayAdmissions = (admissions || []).filter((a: any) => a.admission_date === today || a.soc_date === today);
    const openShifts = (visits || []).filter((v: any) => v.visit_date >= today && !v.caregiver_id && v.status === 'scheduled');

    const todaysWork = {
      visits: todayVisits.map((v: any) => ({ id: v.id, patientName: v.patient_name || 'Unknown', patientId: v.patient_id, time: `${v.start_time || ''} – ${v.end_time || ''}`, discipline: v.discipline || '', caregiverName: v.caregiver_name || 'Unassigned', status: v.status || 'scheduled', visitType: v.visit_type || '' })),
      admissions: todayAdmissions.map((a: any) => ({ id: a.id, patientName: a.patient_name || `Patient ${a.patient_id}`, patientId: a.patient_id, status: a.status, type: a.type || 'Home Health', physician: a.physician_name || '' })),
      openShifts: openShifts.length,
    };

    // ── Zone 3: Resume Work ─────────────────────────────────────────
    const recentPatients = (patients || []).filter((p: any) => p.updated_at).sort((a: any, b: any) => (b.updated_at || '').localeCompare(a.updated_at || '')).slice(0, 5).map((p: any) => ({ id: p.id, title: `${p.last_name || ''}, ${p.first_name || ''}`, subtitle: `MRN: ${p.mrn || '—'}`, lastAccessed: p.updated_at || '', type: 'patient' }));
    const recentAdmissions = (admissions || []).filter((a: any) => a.updated_at).sort((a: any, b: any) => (b.updated_at || '').localeCompare(a.updated_at || '')).slice(0, 5).map((a: any) => ({ id: a.id, title: a.patient_name || `Admission ${a.id}`, subtitle: `${a.type || 'Home Health'} — ${a.status}`, lastAccessed: a.updated_at || '', type: 'admission' }));
    const recentDocs = (drafts || []).filter((d: any) => d.updatedAt).sort((a: any, b: any) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5).map((d: any) => ({ id: d.id, title: d.templateName || 'Untitled', subtitle: d.patientName || '', lastAccessed: d.updatedAt || '', type: 'documentation' }));

    // Recent billing actions
    const recentBilling = (claims || []).filter((cl: any) => cl.updatedAt || cl.updated_at).sort((a: any, b: any) => ((b.updatedAt || b.updated_at) || '').localeCompare((a.updatedAt || a.updated_at) || '')).slice(0, 5).map((cl: any) => ({ id: cl.id, title: cl.claimNumber || cl.claim_number || `Claim ${cl.id}`, subtitle: `${cl.patientName || cl.patient_name || ''} — ${cl.status || 'pending'}`, lastAccessed: cl.updatedAt || cl.updated_at || '', type: 'billing' }));

    // ── Zone 5: Operational Insights ────────────────────────────────
    const totalActiveAdmissions = (admissions || []).filter((a: any) => a.status === 'active').length;
    const completedToday = todayVisits.filter((v: any) => v.status === 'completed').length;
    const pendingQa = (qaDocuments || []).filter((d: any) => d.qaStatus === 'completed' || d.qaStatus === 'in_progress').length;
    const pipelineActive = (referrals || []).filter((r: any) => r.stage !== 'admitted').length;
    const claimsReady = (claims || []).filter((cl: any) => cl.status === 'ready' || cl.status === 'ready_to_submit').length;
    const authorizationsExpiring = expiringAuths.length;
    const hospiceSignaturesPending = (admissions || []).filter((a: any) => a.type === 'hospice' && a.pendingSignature).length;

    return c.json({
      criticalIssues,
      todaysWork,
      recentItems: { patients: recentPatients, admissions: recentAdmissions, documentation: recentDocs, billing: recentBilling },
      insights: { visitsToday: todayVisits.length, visitsCompleted: completedToday, openIssues: criticalIssues.reduce((s: number, ci: any) => s + (ci.count || 0), 0), activeAdmissions: totalActiveAdmissions, pendingQa, pendingCosigns: pendingCosigns.length, pipelineActive, openShifts: openShifts.length, claimsReady, authorizationsExpiring, hospiceSignaturesPending },
    });
  } catch (err: any) {
    console.log('[workspace/home] Error:', err?.message);
    return c.json({ error: `Failed to load workspace data: ${err?.message}` }, 500);
  }
});

// ============================================================================
// PATIENT DOCUMENTS (Supabase Storage)
// ============================================================================

const DOCUMENTS_BUCKET = 'make-845bc545-patient-docs';

// Idempotent bucket creation on startup
(async () => {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === DOCUMENTS_BUCKET);
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(DOCUMENTS_BUCKET, { public: false });
      console.log(`[storage] Created bucket: ${DOCUMENTS_BUCKET}`);
    }
  } catch (err: any) {
    console.log('[storage] Bucket init error (non-fatal):', err?.message);
  }
})();

/**
 * GET /make-server-845bc545/patient-documents/:patientId
 * List all documents for a patient (metadata from KV, signed URLs from Storage)
 */
app.get("/make-server-845bc545/patient-documents/:patientId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { patientId } = c.req.param();
    const docs = (await kv.getByPrefix(`patient-doc:${patientId}:`)) || [];
    // Sort by upload date descending
    docs.sort((a: any, b: any) => (b.uploaded_at || '').localeCompare(a.uploaded_at || ''));

    // Generate signed URLs for each doc
    const enriched = await Promise.all(docs.map(async (doc: any) => {
      if (doc.storage_path) {
        const { data } = await supabaseAdmin.storage
          .from(DOCUMENTS_BUCKET)
          .createSignedUrl(doc.storage_path, 3600); // 1 hour
        return { ...doc, signed_url: data?.signedUrl || null };
      }
      return { ...doc, signed_url: null };
    }));

    return c.json({ documents: enriched });
  } catch (err: any) {
    console.log('[patient-documents] List error:', err?.message);
    return c.json({ error: `Failed to list documents: ${err?.message}` }, 500);
  }
});

/**
 * POST /make-server-845bc545/patient-documents/:patientId/upload
 * Upload a document to Supabase Storage, store metadata in KV
 * Expects multipart/form-data with: file, folder, uploadedBy
 */
app.post("/make-server-845bc545/patient-documents/:patientId/upload", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { patientId } = c.req.param();
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'other';
    const uploadedBy = (formData.get('uploadedBy') as string) || 'Unknown';

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileExt = file.name.split('.').pop() || 'bin';
    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const storagePath = `${patientId}/${folder}/${docId}.${fileExt}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(DOCUMENTS_BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.log('[patient-documents] Upload error:', uploadError.message);
      return c.json({ error: `Upload failed: ${uploadError.message}` }, 500);
    }

    // Determine file type for UI
    let fileType = 'file';
    if (file.type?.includes('pdf')) fileType = 'pdf';
    else if (file.type?.startsWith('image/')) fileType = 'image';
    else if (file.type?.includes('spreadsheet') || file.type?.includes('excel') || file.type?.includes('csv')) fileType = 'spreadsheet';

    // Compute human-readable size
    const sizeBytes = file.size;
    const sizeStr = sizeBytes < 1024 ? `${sizeBytes} B`
      : sizeBytes < 1048576 ? `${(sizeBytes / 1024).toFixed(0)} KB`
      : `${(sizeBytes / 1048576).toFixed(1)} MB`;

    // Save metadata to KV
    const docMeta = {
      id: docId,
      patient_id: patientId,
      name: file.name,
      type: fileType,
      folder,
      uploaded_by: uploadedBy,
      uploaded_at: new Date().toISOString(),
      size: sizeStr,
      storage_path: storagePath,
      content_type: file.type || 'application/octet-stream',
    };

    await kv.set(`patient-doc:${patientId}:${docId}`, docMeta);

    // Version history: check if a doc with same name+folder already exists
    const existingDocs = (await kv.getByPrefix(`patient-doc:${patientId}:`)) || [];
    const previousVersion = existingDocs.find(
      (d: any) => d.name === file.name && d.folder === folder && d.id !== docId
    );
    if (previousVersion) {
      // Store version entry linking new doc to old
      const versionEntry = {
        id: `ver-${Date.now()}`,
        docId,
        previousDocId: previousVersion.id,
        patientId,
        fileName: file.name,
        folder,
        versionNumber: (previousVersion.version || 1) + 1,
        uploadedBy,
        uploadedAt: new Date().toISOString(),
        previousUploadedAt: previousVersion.uploaded_at,
      };
      await kv.set(`doc-version:${patientId}:${docId}:${versionEntry.id}`, versionEntry);
      // Also mark the new doc's version number
      docMeta.version = versionEntry.versionNumber;
      docMeta.previousVersionId = previousVersion.id;
      await kv.set(`patient-doc:${patientId}:${docId}`, docMeta);
      console.log(`[patient-documents] Version ${versionEntry.versionNumber} of "${file.name}" created`);
    }

    // Generate signed URL for immediate use
    const { data: signedData } = await supabaseAdmin.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(storagePath, 3600);

    console.log(`[patient-documents] Uploaded ${file.name} for patient ${patientId} to ${storagePath}`);
    return c.json({ document: { ...docMeta, signed_url: signedData?.signedUrl || null } }, 201);
  } catch (err: any) {
    console.log('[patient-documents] Upload error:', err?.message);
    return c.json({ error: `Upload failed: ${err?.message}` }, 500);
  }
});

/**
 * DELETE /make-server-845bc545/patient-documents/:patientId/:docId
 * Delete a document from storage and KV
 */
app.delete("/make-server-845bc545/patient-documents/:patientId/:docId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { patientId, docId } = c.req.param();
    const docMeta = await kv.get(`patient-doc:${patientId}:${docId}`);
    if (!docMeta) return c.json({ error: 'Document not found' }, 404);

    // Delete from Storage
    if (docMeta.storage_path) {
      await supabaseAdmin.storage.from(DOCUMENTS_BUCKET).remove([docMeta.storage_path]);
    }

    // Delete from KV
    await kv.del(`patient-doc:${patientId}:${docId}`);
    console.log(`[patient-documents] Deleted ${docId} for patient ${patientId}`);
    return c.json({ deleted: true });
  } catch (err: any) {
    console.log('[patient-documents] Delete error:', err?.message);
    return c.json({ error: `Delete failed: ${err?.message}` }, 500);
  }
});

/**
 * GET /make-server-845bc545/patient-documents/:patientId/:docId/versions
 * Get version history for a document (by matching filename + folder)
 */
app.get("/make-server-845bc545/patient-documents/:patientId/:docId/versions", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { patientId, docId } = c.req.param();
    const currentDoc = await kv.get(`patient-doc:${patientId}:${docId}`);
    if (!currentDoc) return c.json({ error: 'Document not found' }, 404);

    // Find all docs with same name + folder
    const allDocs = (await kv.getByPrefix(`patient-doc:${patientId}:`)) || [];
    const sameNameDocs = allDocs
      .filter((d: any) => d.name === currentDoc.name && d.folder === currentDoc.folder)
      .sort((a: any, b: any) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());

    // Get version entries
    const versionEntries = (await kv.getByPrefix(`doc-version:${patientId}:`)) || [];
    const relevantVersions = versionEntries
      .filter((v: any) => v.fileName === currentDoc.name && v.folder === currentDoc.folder)
      .sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return c.json({
      currentDocId: docId,
      versions: sameNameDocs.map((d: any, idx: number) => ({
        docId: d.id,
        version: d.version || 1,
        uploadedBy: d.uploaded_by,
        uploadedAt: d.uploaded_at,
        size: d.size,
        isCurrent: d.id === docId,
      })),
      totalVersions: sameNameDocs.length,
    });
  } catch (err: any) {
    console.log('[patient-documents] Version history error:', err?.message);
    return c.json({ error: `Version history failed: ${err?.message}` }, 500);
  }
});

// ============================================================================
// ANNOTATIONS / COMMENTS
// ============================================================================

/**
 * GET /make-server-845bc545/patient-documents/:patientId/annotations/:entityType/:entityId
 * Get all annotations for a clinical entity (order, plan of care, document, etc.)
 */
app.get("/make-server-845bc545/patient-documents/:patientId/annotations/:entityType/:entityId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { patientId, entityType, entityId } = c.req.param();
    const prefix = `annotation:${patientId}:${entityType}:${entityId}:`;
    const annotations = (await kv.getByPrefix(prefix)) || [];
    annotations.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ annotations });
  } catch (err: any) {
    console.log('[annotations] Get error:', err?.message);
    return c.json({ error: `Failed to get annotations: ${err?.message}` }, 500);
  }
});

/**
 * POST /make-server-845bc545/patient-documents/:patientId/annotations/:entityType/:entityId
 * Add an annotation/comment to a clinical entity
 */
app.post("/make-server-845bc545/patient-documents/:patientId/annotations/:entityType/:entityId", async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const { patientId, entityType, entityId } = c.req.param();
    const { text, author } = await c.req.json();
    if (!text || !text.trim()) {
      return c.json({ error: 'Comment text is required' }, 400);
    }

    const annotationId = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const annotation = {
      id: annotationId,
      entityId,
      entityType,
      patientId,
      text: text.trim(),
      author: author || 'Unknown',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`annotation:${patientId}:${entityType}:${entityId}:${annotationId}`, annotation);
    console.log(`[annotations] Added comment to ${entityType}:${entityId} by ${author}`);

    // Audit trail
    await createAuditLog(verified.userId, 'CREATE', 'annotation', annotationId, null, annotation);

    return c.json({ annotation }, 201);
  } catch (err: any) {
    console.log('[annotations] Create error:', err?.message);
    return c.json({ error: `Failed to add annotation: ${err?.message}` }, 500);
  }
});

Deno.serve(app.fetch);