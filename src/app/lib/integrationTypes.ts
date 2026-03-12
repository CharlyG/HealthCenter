/**
 * Integration Architecture Types
 * 
 * Type definitions for configurable external vendor integrations
 * supporting EVV, Medication, Communication, and other categories.
 */

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════

export type IntegrationCategory =
  | 'evv'
  | 'medication'
  | 'sms'
  | 'email'
  | 'fax'
  | 'push-notifications'
  | 'maps-routing'
  | 'electronic-signatures'
  | 'claims-clearinghouse'
  | 'ehr'
  | 'lab-interface'
  | 'pharmacy';

export interface IntegrationCategoryConfig {
  id: IntegrationCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  required: boolean;
  allowMultiple: boolean; // Can have multiple vendors active simultaneously
}

export const INTEGRATION_CATEGORIES: Record<IntegrationCategory, IntegrationCategoryConfig> = {
  evv: {
    id: 'evv',
    label: 'Electronic Visit Verification (EVV)',
    description: 'Visit verification and tracking systems',
    icon: '📍',
    color: 'blue',
    required: true,
    allowMultiple: false,
  },
  medication: {
    id: 'medication',
    label: 'Medication Database',
    description: 'Drug information and interaction checking',
    icon: '💊',
    color: 'purple',
    required: true,
    allowMultiple: false,
  },
  sms: {
    id: 'sms',
    label: 'SMS Messaging',
    description: 'Text message delivery service',
    icon: '📱',
    color: 'green',
    required: false,
    allowMultiple: true,
  },
  email: {
    id: 'email',
    label: 'Email Service',
    description: 'Transactional and notification emails',
    icon: '📧',
    color: 'red',
    required: true,
    allowMultiple: true,
  },
  fax: {
    id: 'fax',
    label: 'eFax Service',
    description: 'Electronic fax sending and receiving',
    icon: '📠',
    color: 'amber',
    required: false,
    allowMultiple: false,
  },
  'push-notifications': {
    id: 'push-notifications',
    label: 'Push Notifications',
    description: 'Mobile app push notifications',
    icon: '🔔',
    color: 'orange',
    required: false,
    allowMultiple: false,
  },
  'maps-routing': {
    id: 'maps-routing',
    label: 'Maps & Routing',
    description: 'Geocoding and route optimization',
    icon: '🗺️',
    color: 'teal',
    required: false,
    allowMultiple: false,
  },
  'electronic-signatures': {
    id: 'electronic-signatures',
    label: 'Electronic Signatures',
    description: 'Digital signature collection',
    icon: '✍️',
    color: 'indigo',
    required: true,
    allowMultiple: false,
  },
  'claims-clearinghouse': {
    id: 'claims-clearinghouse',
    label: 'Claims Clearinghouse',
    description: 'Insurance claims submission',
    icon: '💳',
    color: 'pink',
    required: false,
    allowMultiple: false,
  },
  ehr: {
    id: 'ehr',
    label: 'EHR Integration',
    description: 'Electronic health record systems',
    icon: '🏥',
    color: 'cyan',
    required: false,
    allowMultiple: true,
  },
  'lab-interface': {
    id: 'lab-interface',
    label: 'Laboratory Interface',
    description: 'Lab orders and results',
    icon: '🔬',
    color: 'violet',
    required: false,
    allowMultiple: true,
  },
  pharmacy: {
    id: 'pharmacy',
    label: 'Pharmacy Integration',
    description: 'Prescription ordering systems',
    icon: '💉',
    color: 'rose',
    required: false,
    allowMultiple: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// VENDOR DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type VendorId =
  | 'hhax'
  | 'sandata'
  | 'wellsky'
  | 'medispan'
  | 'firstdatabank'
  | 'twilio'
  | 'plivo'
  | 'vonage'
  | 'sendgrid'
  | 'mailgun'
  | 'ses'
  | 'srfax'
  | 'efax'
  | 'firebase'
  | 'onesignal'
  | 'google-maps'
  | 'mapbox'
  | 'docusign'
  | 'adobesign'
  | 'hellosign'
  | 'availity'
  | 'change-healthcare'
  | 'epic'
  | 'cerner'
  | 'allscripts';

export interface Vendor {
  id: VendorId;
  name: string;
  description: string;
  logoUrl?: string;
  website: string;
  categories: IntegrationCategory[];
  tier: 'enterprise' | 'standard' | 'basic';
  popularity: number; // 1-5 stars
  requiresContract: boolean;
  estimatedSetupTime: string; // e.g., "2-4 weeks"
  supportedFeatures: string[];
  documentation: string;
}

export const VENDORS: Record<VendorId, Vendor> = {
  hhax: {
    id: 'hhax',
    name: 'HHAeXchange',
    description: 'Leading home health EVV and billing platform',
    website: 'https://hhaexchange.com',
    categories: ['evv'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '4-6 weeks',
    supportedFeatures: ['Visit Verification', 'GPS Tracking', 'Mobile App', 'Real-time Updates'],
    documentation: 'https://docs.hhaexchange.com',
  },
  sandata: {
    id: 'sandata',
    name: 'Sandata',
    description: 'EVV and compliance platform for home care',
    website: 'https://sandata.com',
    categories: ['evv'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '4-6 weeks',
    supportedFeatures: ['EVV', 'Scheduling', 'Compliance', 'Billing Integration'],
    documentation: 'https://docs.sandata.com',
  },
  wellsky: {
    id: 'wellsky',
    name: 'WellSky',
    description: 'Comprehensive home health software suite',
    website: 'https://wellsky.com',
    categories: ['evv', 'ehr'],
    tier: 'enterprise',
    popularity: 4,
    requiresContract: true,
    estimatedSetupTime: '6-8 weeks',
    supportedFeatures: ['EVV', 'Clinical Documentation', 'Scheduling', 'Billing'],
    documentation: 'https://docs.wellsky.com',
  },
  medispan: {
    id: 'medispan',
    name: 'Medispan',
    description: 'Comprehensive drug database and clinical decision support',
    website: 'https://www.wolterskluwer.com/en/solutions/medi-span',
    categories: ['medication'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '2-3 weeks',
    supportedFeatures: ['Drug Database', 'Interaction Checking', 'Pricing', 'Formulary'],
    documentation: 'https://docs.medispan.com',
  },
  firstdatabank: {
    id: 'firstdatabank',
    name: 'First Databank',
    description: 'Clinical drug information and decision support',
    website: 'https://www.fdbhealth.com',
    categories: ['medication'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '2-3 weeks',
    supportedFeatures: ['Drug Monographs', 'Interactions', 'Alerts', 'Clinical Support'],
    documentation: 'https://docs.fdbhealth.com',
  },
  twilio: {
    id: 'twilio',
    name: 'Twilio',
    description: 'Cloud communications platform',
    website: 'https://www.twilio.com',
    categories: ['sms', 'push-notifications'],
    tier: 'standard',
    popularity: 5,
    requiresContract: false,
    estimatedSetupTime: '1-2 days',
    supportedFeatures: ['SMS', 'Voice', 'Video', 'Push', 'Programmable API'],
    documentation: 'https://www.twilio.com/docs',
  },
  plivo: {
    id: 'plivo',
    name: 'Plivo',
    description: 'Cloud communication platform for SMS and voice',
    website: 'https://www.plivo.com',
    categories: ['sms'],
    tier: 'standard',
    popularity: 4,
    requiresContract: false,
    estimatedSetupTime: '1-2 days',
    supportedFeatures: ['SMS', 'Voice', 'MMS', 'Number Portability'],
    documentation: 'https://www.plivo.com/docs',
  },
  vonage: {
    id: 'vonage',
    name: 'Vonage',
    description: 'Unified communications platform',
    website: 'https://www.vonage.com',
    categories: ['sms'],
    tier: 'standard',
    popularity: 4,
    requiresContract: false,
    estimatedSetupTime: '1-2 days',
    supportedFeatures: ['SMS', 'Voice', 'Video', 'Messaging API'],
    documentation: 'https://developer.vonage.com',
  },
  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing platform',
    website: 'https://sendgrid.com',
    categories: ['email'],
    tier: 'standard',
    popularity: 5,
    requiresContract: false,
    estimatedSetupTime: '1 day',
    supportedFeatures: ['Transactional Email', 'Templates', 'Analytics', 'Webhooks'],
    documentation: 'https://docs.sendgrid.com',
  },
  mailgun: {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Email automation for developers',
    website: 'https://www.mailgun.com',
    categories: ['email'],
    tier: 'standard',
    popularity: 4,
    requiresContract: false,
    estimatedSetupTime: '1 day',
    supportedFeatures: ['Email API', 'Validation', 'Analytics', 'Templates'],
    documentation: 'https://documentation.mailgun.com',
  },
  ses: {
    id: 'ses',
    name: 'Amazon SES',
    description: 'AWS email sending service',
    website: 'https://aws.amazon.com/ses',
    categories: ['email'],
    tier: 'basic',
    popularity: 4,
    requiresContract: false,
    estimatedSetupTime: '1-2 days',
    supportedFeatures: ['Bulk Email', 'Transactional', 'High Deliverability', 'Cost-effective'],
    documentation: 'https://docs.aws.amazon.com/ses',
  },
  srfax: {
    id: 'srfax',
    name: 'SRFax',
    description: 'HIPAA-compliant fax API',
    website: 'https://www.srfax.com',
    categories: ['fax'],
    tier: 'standard',
    popularity: 4,
    requiresContract: false,
    estimatedSetupTime: '1-2 days',
    supportedFeatures: ['Send/Receive Fax', 'HIPAA Compliance', 'API Access', 'Notifications'],
    documentation: 'https://www.srfax.com/api',
  },
  efax: {
    id: 'efax',
    name: 'eFax Corporate',
    description: 'Enterprise fax solution',
    website: 'https://www.efax.com',
    categories: ['fax'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '1 week',
    supportedFeatures: ['Fax API', 'Dedicated Numbers', 'Security', 'Integration'],
    documentation: 'https://www.efax.com/developers',
  },
  firebase: {
    id: 'firebase',
    name: 'Firebase Cloud Messaging',
    description: 'Google push notification service',
    website: 'https://firebase.google.com/products/cloud-messaging',
    categories: ['push-notifications'],
    tier: 'basic',
    popularity: 5,
    requiresContract: false,
    estimatedSetupTime: '1-2 days',
    supportedFeatures: ['Push Notifications', 'Analytics', 'A/B Testing', 'Targeting'],
    documentation: 'https://firebase.google.com/docs/cloud-messaging',
  },
  onesignal: {
    id: 'onesignal',
    name: 'OneSignal',
    description: 'Omnichannel customer engagement platform',
    website: 'https://onesignal.com',
    categories: ['push-notifications', 'sms', 'email'],
    tier: 'standard',
    popularity: 5,
    requiresContract: false,
    estimatedSetupTime: '1 day',
    supportedFeatures: ['Push', 'In-App', 'SMS', 'Email', 'Segmentation'],
    documentation: 'https://documentation.onesignal.com',
  },
  'google-maps': {
    id: 'google-maps',
    name: 'Google Maps Platform',
    description: 'Maps, geocoding, and routing services',
    website: 'https://cloud.google.com/maps-platform',
    categories: ['maps-routing'],
    tier: 'standard',
    popularity: 5,
    requiresContract: false,
    estimatedSetupTime: '1 day',
    supportedFeatures: ['Geocoding', 'Directions', 'Distance Matrix', 'Places API'],
    documentation: 'https://developers.google.com/maps/documentation',
  },
  mapbox: {
    id: 'mapbox',
    name: 'Mapbox',
    description: 'Location data and mapping platform',
    website: 'https://www.mapbox.com',
    categories: ['maps-routing'],
    tier: 'standard',
    popularity: 4,
    requiresContract: false,
    estimatedSetupTime: '1 day',
    supportedFeatures: ['Maps', 'Navigation', 'Geocoding', 'Optimization'],
    documentation: 'https://docs.mapbox.com',
  },
  docusign: {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Leading eSignature solution',
    website: 'https://www.docusign.com',
    categories: ['electronic-signatures'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '1-2 weeks',
    supportedFeatures: ['eSignature', 'Workflows', 'Templates', 'Mobile', 'Compliance'],
    documentation: 'https://developers.docusign.com',
  },
  adobesign: {
    id: 'adobesign',
    name: 'Adobe Sign',
    description: 'Adobe electronic signature service',
    website: 'https://www.adobe.com/sign',
    categories: ['electronic-signatures'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '1-2 weeks',
    supportedFeatures: ['eSignature', 'Document Workflows', 'Templates', 'Mobile'],
    documentation: 'https://www.adobe.com/devnet/adobesign.html',
  },
  hellosign: {
    id: 'hellosign',
    name: 'Dropbox Sign (HelloSign)',
    description: 'Simple eSignature API',
    website: 'https://www.hellosign.com',
    categories: ['electronic-signatures'],
    tier: 'standard',
    popularity: 4,
    requiresContract: false,
    estimatedSetupTime: '3-5 days',
    supportedFeatures: ['API-first', 'Templates', 'Embedded Signing', 'Mobile'],
    documentation: 'https://developers.hellosign.com',
  },
  availity: {
    id: 'availity',
    name: 'Availity',
    description: 'Healthcare clearinghouse network',
    website: 'https://www.availity.com',
    categories: ['claims-clearinghouse'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '3-4 weeks',
    supportedFeatures: ['Claims Submission', 'Eligibility', 'Prior Auth', 'Remittance'],
    documentation: 'https://www.availity.com/developers',
  },
  'change-healthcare': {
    id: 'change-healthcare',
    name: 'Change Healthcare',
    description: 'Healthcare technology and clearinghouse',
    website: 'https://www.changehealthcare.com',
    categories: ['claims-clearinghouse'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '3-4 weeks',
    supportedFeatures: ['Claims', 'Eligibility', 'Revenue Cycle', 'Analytics'],
    documentation: 'https://developers.changehealthcare.com',
  },
  epic: {
    id: 'epic',
    name: 'Epic',
    description: 'Leading EHR system',
    website: 'https://www.epic.com',
    categories: ['ehr'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '8-12 weeks',
    supportedFeatures: ['FHIR API', 'Patient Data', 'Scheduling', 'Orders'],
    documentation: 'https://fhir.epic.com',
  },
  cerner: {
    id: 'cerner',
    name: 'Oracle Cerner',
    description: 'Healthcare information technology',
    website: 'https://www.cerner.com',
    categories: ['ehr'],
    tier: 'enterprise',
    popularity: 5,
    requiresContract: true,
    estimatedSetupTime: '8-12 weeks',
    supportedFeatures: ['FHIR API', 'HL7', 'Clinical Data', 'Interoperability'],
    documentation: 'https://fhir.cerner.com',
  },
  allscripts: {
    id: 'allscripts',
    name: 'Allscripts',
    description: 'Healthcare IT solutions',
    website: 'https://www.allscripts.com',
    categories: ['ehr'],
    tier: 'enterprise',
    popularity: 4,
    requiresContract: true,
    estimatedSetupTime: '6-8 weeks',
    supportedFeatures: ['EHR Integration', 'Practice Management', 'Revenue Cycle'],
    documentation: 'https://developer.allscripts.com',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export type IntegrationStatus = 'active' | 'inactive' | 'testing' | 'error' | 'pending-setup';

export type AuthType = 'api-key' | 'oauth2' | 'basic-auth' | 'jwt' | 'certificate';

export interface IntegrationConfig {
  id: string;
  category: IntegrationCategory;
  vendorId: VendorId;
  name: string; // Custom name for this integration instance
  status: IntegrationStatus;
  authType: AuthType;
  credentials: Record<string, string>; // Encrypted in production
  endpoints: Record<string, string>;
  settings: Record<string, any>;
  isDefault: boolean; // For categories that allow multiple vendors
  priority: number; // For failover/load balancing
  createdAt: string;
  updatedAt: string;
  lastTestedAt?: string;
  lastTestResult?: IntegrationTestResult;
  createdBy: string;
  updatedBy: string;
  notes?: string;
}

export interface IntegrationTestResult {
  success: boolean;
  timestamp: string;
  responseTime: number; // milliseconds
  statusCode?: number;
  message: string;
  details?: Record<string, any>;
  errors?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION HEALTH & MONITORING
// ═══════════════════════════════════════════════════════════════════════════

export interface IntegrationHealth {
  configId: string;
  category: IntegrationCategory;
  vendorId: VendorId;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // percentage
  last24Hours: {
    requests: number;
    successes: number;
    failures: number;
    averageResponseTime: number;
  };
  lastCheck: string;
  issues: IntegrationIssue[];
}

export interface IntegrationIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  occurredAt: string;
  resolvedAt?: string;
  affectedEndpoints: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// VENDOR ABSTRACTION INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

// Example abstraction interfaces that vendors must implement

export interface IEVVProvider {
  verifyVisit(visitId: string, location: { lat: number; lng: number }): Promise<boolean>;
  startVisit(visitId: string, caregiverId: string): Promise<void>;
  endVisit(visitId: string): Promise<void>;
  getVisitStatus(visitId: string): Promise<string>;
}

export interface IMedicationProvider {
  searchDrugs(query: string): Promise<any[]>;
  getDrugDetails(drugId: string): Promise<any>;
  checkInteractions(drugIds: string[]): Promise<any[]>;
  getAlternatives(drugId: string): Promise<any[]>;
}

export interface ISMSProvider {
  sendSMS(to: string, message: string): Promise<{ messageId: string; status: string }>;
  getDeliveryStatus(messageId: string): Promise<string>;
}

export interface IEmailProvider {
  sendEmail(to: string, subject: string, html: string): Promise<{ messageId: string }>;
  sendTemplateEmail(to: string, templateId: string, variables: Record<string, any>): Promise<{ messageId: string }>;
}
