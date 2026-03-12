/**
 * Gateway Layer - Central Export
 * 
 * All data access and integrations flow through these gateways.
 * UI components should import from here and never call Supabase or vendor APIs directly.
 * 
 * Usage:
 * import { patientGateway, smsGateway } from '@/lib';
 */

// Data Gateway - Database operations
export {
  supabase,
  setAuthErrorHandler,
  triggerAuthError,
  patientGateway,
  admissionGateway,
  visitGateway,
  configGateway,
  auditGateway,
  userGateway,
  timelineGateway,
} from './dataGateway';

// Data Gateway - Types
export type {
  Patient,
  Admission,
  Visit,
  User,
  ModuleToggle,
  FeatureFlag,
  VendorConfig,
  AuditLog,
  PaginationParams,
  SortParams,
  FilterParams,
  PaginatedResponse,
  TimelineEventData,
  TimelineEventType,
  TimelineFilterCategory,
} from './dataGateway';

// Integration Gateway - External vendors
export {
  evvGateway,
  smsGateway,
  faxGateway,
  emailGateway,
  medicationGateway,
  testVendorConnection,
} from './integrationGateway';

// Integration Gateway - Types
export type {
  IntegrationResult,
  EVVClockIn,
  EVVClockOut,
  EVVVerification,
  SMSMessage,
  SMSResult,
  FaxDocument,
  FaxResult,
  EmailMessage,
  EmailAttachment,
  EmailResult,
  MedicationVerification,
  MedicationResult,
} from './integrationGateway';