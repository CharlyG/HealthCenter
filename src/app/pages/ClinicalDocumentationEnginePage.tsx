/**
 * Configurable Clinical Documentation Engine
 * 
 * A flexible, configuration-driven system for creating any clinical document type
 * Supports reusable sections, field types, validation, workflows, and signatures
 */

import { useState, useMemo } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  FileText,
  Settings,
  CheckCircle2,
  AlertCircle,
  Code,
  Layers,
  Workflow,
  PenTool,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES - ENGINE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Field Types - All possible field types in the system
 */
type FieldType = 
  | 'text'           // Short text input
  | 'textarea'       // Long text/narrative
  | 'number'         // Numeric input
  | 'date'           // Date picker
  | 'time'           // Time picker
  | 'datetime'       // Date + time
  | 'select'         // Single select dropdown
  | 'multiselect'    // Multiple select
  | 'radio'          // Radio buttons
  | 'checkbox'       // Single checkbox
  | 'checkboxGroup'  // Multiple checkboxes
  | 'signature'      // Signature capture
  | 'vitals'         // Structured vitals input
  | 'medication'     // Medication list
  | 'icd10'          // Diagnosis code lookup
  | 'scale'          // Numeric scale (e.g., pain 0-10)
  | 'file'           // File upload
  | 'photo'          // Photo upload
  | 'custom';        // Custom component

/**
 * Validation Types - All validation rules
 */
interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any, allValues: Record<string, any>) => boolean;
}

/**
 * Conditional Logic - Show/hide fields based on other field values
 */
interface ConditionalLogic {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}

/**
 * Field Definition - Individual field configuration
 */
interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  
  // Validation
  validation?: ValidationRule[];
  required?: boolean;
  
  // For select/radio/checkbox fields
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  
  // Conditional logic
  conditionalLogic?: ConditionalLogic[];
  
  // Layout
  width?: 'full' | 'half' | 'third' | 'quarter';
  colspan?: number;
  
  // Custom rendering
  customComponent?: React.ComponentType<any>;
  customProps?: Record<string, any>;
}

/**
 * Section Definition - Reusable document sections
 */
interface SectionDefinition {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  
  // Fields in this section
  fields: FieldDefinition[];
  
  // Section-level validation
  sectionValidation?: (values: Record<string, any>) => string | null;
  
  // Conditional section visibility
  conditionalLogic?: ConditionalLogic[];
  
  // Layout
  layout?: 'single-column' | 'two-column' | 'grid' | 'custom';
  columns?: number;
  
  // Section behavior
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  repeatable?: boolean; // Can add multiple instances (e.g., multiple medications)
}

/**
 * Document Status Workflow
 */
interface StatusWorkflowStep {
  status: string;
  label: string;
  color: string;
  allowedTransitions: string[];
  requiredActions?: string[];
  notificationTriggers?: string[];
}

/**
 * Signature Requirement
 */
interface SignatureRequirement {
  id: string;
  role: string;
  label: string;
  required: boolean;
  order: number; // 1 = must sign first, 2 = can sign after 1, etc.
  requiredStatuses?: string[]; // Only required when document in these statuses
}

/**
 * Document Type Configuration - The core configuration for any document
 */
interface DocumentTypeConfiguration {
  // Identification
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'visit' | 'assessment' | 'order' | 'plan' | 'discharge' | 'other';
  
  // Sections - ordered array of section IDs from section library
  sections: string[];
  
  // Custom sections specific to this document (not in library)
  customSections?: SectionDefinition[];
  
  // Workflow
  statusWorkflow: StatusWorkflowStep[];
  initialStatus: string;
  
  // Signatures
  signatureRequirements: SignatureRequirement[];
  
  // Permissions
  allowedRoles: string[];
  editableStatuses: string[];
  
  // Behavior
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
  
  // Submission
  submissionValidation?: (values: Record<string, any>) => string[];
  onSubmit?: (values: Record<string, any>) => Promise<void>;
  
  // Metadata
  createdDate: string;
  createdBy: string;
  lastModified?: string;
  lastModifiedBy?: string;
}

/**
 * Section Library - Reusable sections that can be used across documents
 */
interface SectionLibrary {
  [sectionId: string]: SectionDefinition;
}

/**
 * Document Instance - Actual document data
 */
interface DocumentInstance {
  id: string;
  documentTypeId: string;
  
  // Patient context
  patientId: string;
  admissionId?: string;
  episodeId?: string;
  
  // Status
  status: string;
  
  // Field values
  values: Record<string, any>;
  
  // Signatures
  signatures: Array<{
    signatureId: string;
    signedBy: string;
    signedByRole: string;
    signedDate: string;
    signatureData?: string; // Base64 signature image
  }>;
  
  // Metadata
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  submittedDate?: string;
  
  // Audit trail
  history: Array<{
    action: string;
    timestamp: string;
    userId: string;
    changes?: Record<string, any>;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION LIBRARY - REUSABLE SECTIONS
// ═══════════════════════════════════════════════════════════════════════════

const SECTION_LIBRARY: SectionLibrary = {
  // ──────────────────────────────────────────────────────────────────────────
  // PATIENT DEMOGRAPHICS
  // ──────────────────────────────────────────────────────────────────────────
  'patient-demographics': {
    id: 'patient-demographics',
    title: 'Patient Demographics',
    description: 'Basic patient identification and contact information',
    layout: 'two-column',
    fields: [
      {
        id: 'firstName',
        type: 'text',
        label: 'First Name',
        required: true,
        width: 'half',
        validation: [
          { type: 'required', message: 'First name is required' },
          { type: 'minLength', value: 2, message: 'Minimum 2 characters' },
        ],
      },
      {
        id: 'lastName',
        type: 'text',
        label: 'Last Name',
        required: true,
        width: 'half',
        validation: [
          { type: 'required', message: 'Last name is required' },
        ],
      },
      {
        id: 'dateOfBirth',
        type: 'date',
        label: 'Date of Birth',
        required: true,
        width: 'half',
      },
      {
        id: 'mrn',
        type: 'text',
        label: 'Medical Record Number',
        required: true,
        width: 'half',
      },
    ],
  },
  
  // ──────────────────────────────────────────────────────────────────────────
  // VITAL SIGNS
  // ──────────────────────────────────────────────────────────────────────────
  'vital-signs': {
    id: 'vital-signs',
    title: 'Vital Signs',
    description: 'Patient vital signs measurement',
    layout: 'grid',
    columns: 3,
    fields: [
      {
        id: 'bloodPressureSystolic',
        type: 'number',
        label: 'Blood Pressure (Systolic)',
        placeholder: '120',
        required: true,
        validation: [
          { type: 'min', value: 40, message: 'Invalid BP systolic' },
          { type: 'max', value: 300, message: 'Invalid BP systolic' },
        ],
      },
      {
        id: 'bloodPressureDiastolic',
        type: 'number',
        label: 'Blood Pressure (Diastolic)',
        placeholder: '80',
        required: true,
        validation: [
          { type: 'min', value: 20, message: 'Invalid BP diastolic' },
          { type: 'max', value: 200, message: 'Invalid BP diastolic' },
        ],
      },
      {
        id: 'heartRate',
        type: 'number',
        label: 'Heart Rate (bpm)',
        placeholder: '72',
        required: true,
        validation: [
          { type: 'min', value: 30, message: 'Invalid heart rate' },
          { type: 'max', value: 250, message: 'Invalid heart rate' },
        ],
      },
      {
        id: 'respiratoryRate',
        type: 'number',
        label: 'Respiratory Rate',
        placeholder: '16',
        required: true,
        validation: [
          { type: 'min', value: 8, message: 'Invalid respiratory rate' },
          { type: 'max', value: 60, message: 'Invalid respiratory rate' },
        ],
      },
      {
        id: 'temperature',
        type: 'number',
        label: 'Temperature (°F)',
        placeholder: '98.6',
        required: true,
        validation: [
          { type: 'min', value: 90, message: 'Invalid temperature' },
          { type: 'max', value: 110, message: 'Invalid temperature' },
        ],
      },
      {
        id: 'oxygenSaturation',
        type: 'number',
        label: 'O2 Saturation (%)',
        placeholder: '98',
        required: true,
        validation: [
          { type: 'min', value: 50, message: 'Invalid O2 saturation' },
          { type: 'max', value: 100, message: 'Invalid O2 saturation' },
        ],
      },
    ],
  },
  
  // ──────────────────────────────────────────────────────────────────────────
  // PAIN ASSESSMENT
  // ──────────────────────────────────────────────────────────────────────────
  'pain-assessment': {
    id: 'pain-assessment',
    title: 'Pain Assessment',
    description: 'Comprehensive pain evaluation',
    layout: 'single-column',
    fields: [
      {
        id: 'painLevel',
        type: 'scale',
        label: 'Pain Level (0-10)',
        required: true,
        helpText: '0 = No pain, 10 = Worst pain imaginable',
        validation: [
          { type: 'min', value: 0, message: 'Pain level must be 0-10' },
          { type: 'max', value: 10, message: 'Pain level must be 0-10' },
        ],
      },
      {
        id: 'painLocation',
        type: 'text',
        label: 'Pain Location',
        placeholder: 'e.g., Lower back, right knee',
        conditionalLogic: [
          {
            fieldId: 'painLevel',
            operator: 'greaterThan',
            value: 0,
            action: 'require',
          },
        ],
      },
      {
        id: 'painQuality',
        type: 'checkboxGroup',
        label: 'Pain Quality',
        options: [
          { value: 'sharp', label: 'Sharp' },
          { value: 'dull', label: 'Dull' },
          { value: 'aching', label: 'Aching' },
          { value: 'burning', label: 'Burning' },
          { value: 'stabbing', label: 'Stabbing' },
          { value: 'throbbing', label: 'Throbbing' },
        ],
        conditionalLogic: [
          {
            fieldId: 'painLevel',
            operator: 'greaterThan',
            value: 0,
            action: 'show',
          },
        ],
      },
      {
        id: 'painNotes',
        type: 'textarea',
        label: 'Pain Assessment Notes',
        placeholder: 'Additional details about pain...',
        conditionalLogic: [
          {
            fieldId: 'painLevel',
            operator: 'greaterThan',
            value: 0,
            action: 'show',
          },
        ],
      },
    ],
  },
  
  // ──────────────────────────────────────────────────────────────────────────
  // MEDICATION REVIEW
  // ──────────────────────────────────────────────────────────────────────────
  'medication-review': {
    id: 'medication-review',
    title: 'Medication Review',
    description: 'Current medications and compliance',
    layout: 'single-column',
    repeatable: true,
    fields: [
      {
        id: 'medicationCompliance',
        type: 'radio',
        label: 'Medication Compliance',
        required: true,
        options: [
          { value: 'compliant', label: 'Compliant - Taking as prescribed' },
          { value: 'partial', label: 'Partially Compliant - Missing some doses' },
          { value: 'non_compliant', label: 'Non-Compliant - Not taking medications' },
        ],
      },
      {
        id: 'medicationChanges',
        type: 'textarea',
        label: 'Medication Changes',
        placeholder: 'Document any medication changes, new prescriptions, discontinued medications...',
      },
      {
        id: 'adverseReactions',
        type: 'textarea',
        label: 'Adverse Reactions',
        placeholder: 'Document any adverse reactions or side effects...',
      },
    ],
  },
  
  // ──────────────────────────────────────────────────────────────────────────
  // CLINICAL ASSESSMENT
  // ──────────────────────────────────────────────────────────────────────────
  'clinical-assessment': {
    id: 'clinical-assessment',
    title: 'Clinical Assessment',
    description: 'Comprehensive clinical evaluation',
    layout: 'single-column',
    fields: [
      {
        id: 'generalAppearance',
        type: 'select',
        label: 'General Appearance',
        required: true,
        options: [
          { value: 'well_appearing', label: 'Well-appearing' },
          { value: 'ill_appearing', label: 'Ill-appearing' },
          { value: 'distressed', label: 'In distress' },
          { value: 'lethargic', label: 'Lethargic' },
        ],
      },
      {
        id: 'cardiovascular',
        type: 'textarea',
        label: 'Cardiovascular Assessment',
        placeholder: 'Heart sounds, peripheral pulses, edema...',
      },
      {
        id: 'respiratory',
        type: 'textarea',
        label: 'Respiratory Assessment',
        placeholder: 'Breath sounds, respiratory effort, cough...',
      },
      {
        id: 'neurological',
        type: 'textarea',
        label: 'Neurological Assessment',
        placeholder: 'Mental status, orientation, strength, sensation...',
      },
      {
        id: 'gastrointestinal',
        type: 'textarea',
        label: 'Gastrointestinal Assessment',
        placeholder: 'Appetite, bowel function, abdomen...',
      },
      {
        id: 'integumentary',
        type: 'textarea',
        label: 'Skin/Integumentary Assessment',
        placeholder: 'Skin condition, wounds, pressure areas...',
      },
    ],
  },
  
  // ──────────────────────────────────────────────────────────────────────────
  // PATIENT EDUCATION
  // ──────────────────────────────────────────────────────────────────────────
  'patient-education': {
    id: 'patient-education',
    title: 'Patient/Caregiver Education',
    description: 'Education provided and comprehension',
    layout: 'single-column',
    fields: [
      {
        id: 'educationTopics',
        type: 'checkboxGroup',
        label: 'Education Topics Covered',
        options: [
          { value: 'disease_process', label: 'Disease Process' },
          { value: 'medications', label: 'Medications' },
          { value: 'wound_care', label: 'Wound Care' },
          { value: 'fall_prevention', label: 'Fall Prevention' },
          { value: 'diet', label: 'Diet/Nutrition' },
          { value: 'exercise', label: 'Exercise/Activity' },
          { value: 'emergency_signs', label: 'Emergency Warning Signs' },
        ],
      },
      {
        id: 'educationMethod',
        type: 'select',
        label: 'Method of Instruction',
        options: [
          { value: 'verbal', label: 'Verbal instruction' },
          { value: 'demonstration', label: 'Demonstration/teach-back' },
          { value: 'written', label: 'Written materials' },
          { value: 'video', label: 'Video instruction' },
          { value: 'combined', label: 'Combined methods' },
        ],
      },
      {
        id: 'comprehensionLevel',
        type: 'radio',
        label: 'Patient/Caregiver Comprehension',
        required: true,
        options: [
          { value: 'full', label: 'Full Understanding - Able to teach back accurately' },
          { value: 'partial', label: 'Partial Understanding - Some clarification needed' },
          { value: 'minimal', label: 'Minimal Understanding - Requires reinforcement' },
        ],
      },
      {
        id: 'educationNotes',
        type: 'textarea',
        label: 'Education Notes',
        placeholder: 'Additional details about education provided...',
      },
    ],
  },
  
  // ──────────────────────────────────────────────────────────────────────────
  // SIGNATURE
  // ──────────────────────────────────────────────────────────────────────────
  'signatures': {
    id: 'signatures',
    title: 'Signatures',
    description: 'Document signatures and attestation',
    layout: 'single-column',
    fields: [
      {
        id: 'clinicianAttestation',
        type: 'checkbox',
        label: 'I attest that the information documented is accurate and complete',
        required: true,
      },
      {
        id: 'clinicianSignature',
        type: 'signature',
        label: 'Clinician Signature',
        required: true,
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE DOCUMENT TYPE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const SKILLED_NURSING_VISIT_NOTE: DocumentTypeConfiguration = {
  id: 'sn-visit-note',
  name: 'Skilled Nursing Visit Note',
  description: 'Standard skilled nursing visit documentation',
  version: '1.0.0',
  category: 'visit',
  
  // Use sections from library
  sections: [
    'vital-signs',
    'pain-assessment',
    'medication-review',
    'clinical-assessment',
    'patient-education',
    'signatures',
  ],
  
  // Custom section for visit-specific info
  customSections: [
    {
      id: 'visit-information',
      title: 'Visit Information',
      layout: 'two-column',
      fields: [
        {
          id: 'visitDate',
          type: 'date',
          label: 'Visit Date',
          required: true,
          defaultValue: new Date().toISOString().split('T')[0],
          width: 'half',
        },
        {
          id: 'visitTime',
          type: 'time',
          label: 'Visit Time',
          required: true,
          width: 'half',
        },
        {
          id: 'visitDuration',
          type: 'number',
          label: 'Visit Duration (minutes)',
          required: true,
          width: 'half',
        },
        {
          id: 'visitType',
          type: 'select',
          label: 'Visit Type',
          required: true,
          width: 'half',
          options: [
            { value: 'routine', label: 'Routine Visit' },
            { value: 'soc', label: 'Start of Care' },
            { value: 'roc', label: 'Resumption of Care' },
            { value: 'prn', label: 'PRN Visit' },
          ],
        },
      ],
    },
  ],
  
  // Status workflow
  statusWorkflow: [
    {
      status: 'draft',
      label: 'Draft',
      color: 'gray',
      allowedTransitions: ['in_progress', 'completed'],
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      color: 'blue',
      allowedTransitions: ['completed', 'draft'],
    },
    {
      status: 'completed',
      label: 'Completed',
      color: 'green',
      allowedTransitions: ['submitted'],
      requiredActions: ['validate_all_required_fields'],
    },
    {
      status: 'submitted',
      label: 'Submitted',
      color: 'purple',
      allowedTransitions: ['approved'],
      notificationTriggers: ['notify_supervisor'],
    },
    {
      status: 'approved',
      label: 'Approved',
      color: 'emerald',
      allowedTransitions: [],
    },
  ],
  initialStatus: 'draft',
  
  // Signature requirements
  signatureRequirements: [
    {
      id: 'clinician',
      role: 'RN',
      label: 'Clinician Signature',
      required: true,
      order: 1,
      requiredStatuses: ['completed', 'submitted'],
    },
    {
      id: 'supervisor',
      role: 'Supervisor',
      label: 'Supervisor Signature',
      required: false,
      order: 2,
      requiredStatuses: ['submitted'],
    },
  ],
  
  // Permissions
  allowedRoles: ['RN', 'LPN', 'Supervisor'],
  editableStatuses: ['draft', 'in_progress'],
  
  // Behavior
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  
  // Metadata
  createdDate: '2024-01-01',
  createdBy: 'System',
};

const PHYSICAL_THERAPY_EVALUATION: DocumentTypeConfiguration = {
  id: 'pt-evaluation',
  name: 'Physical Therapy Evaluation',
  description: 'Initial PT evaluation and assessment',
  version: '1.0.0',
  category: 'assessment',
  
  sections: [
    'vital-signs',
    'pain-assessment',
    'signatures',
  ],
  
  customSections: [
    {
      id: 'pt-evaluation',
      title: 'PT Evaluation',
      layout: 'single-column',
      fields: [
        {
          id: 'chiefComplaint',
          type: 'textarea',
          label: 'Chief Complaint',
          required: true,
          placeholder: 'Patient\'s primary complaint and reason for PT...',
        },
        {
          id: 'priorLevelOfFunction',
          type: 'textarea',
          label: 'Prior Level of Function',
          required: true,
          placeholder: 'Describe patient\'s functional status prior to current episode...',
        },
        {
          id: 'rangeOfMotion',
          type: 'textarea',
          label: 'Range of Motion Assessment',
          required: true,
          placeholder: 'Document ROM measurements...',
        },
        {
          id: 'strength',
          type: 'textarea',
          label: 'Strength Assessment (MMT)',
          required: true,
          placeholder: 'Manual muscle testing results...',
        },
        {
          id: 'gait',
          type: 'textarea',
          label: 'Gait Assessment',
          required: true,
          placeholder: 'Gait pattern, assistive devices, distance...',
        },
        {
          id: 'balance',
          type: 'textarea',
          label: 'Balance Assessment',
          required: true,
          placeholder: 'Static and dynamic balance, fall risk...',
        },
        {
          id: 'functionalLimitations',
          type: 'checkboxGroup',
          label: 'Functional Limitations',
          options: [
            { value: 'ambulation', label: 'Ambulation' },
            { value: 'transfers', label: 'Transfers' },
            { value: 'stairs', label: 'Stair Climbing' },
            { value: 'adls', label: 'ADLs' },
            { value: 'balance', label: 'Balance' },
            { value: 'endurance', label: 'Endurance' },
          ],
        },
        {
          id: 'treatmentPlan',
          type: 'textarea',
          label: 'Treatment Plan',
          required: true,
          placeholder: 'Proposed interventions, frequency, duration...',
        },
      ],
    },
  ],
  
  statusWorkflow: [
    {
      status: 'draft',
      label: 'Draft',
      color: 'gray',
      allowedTransitions: ['completed'],
    },
    {
      status: 'completed',
      label: 'Completed',
      color: 'green',
      allowedTransitions: ['signed'],
    },
    {
      status: 'signed',
      label: 'Signed',
      color: 'emerald',
      allowedTransitions: [],
    },
  ],
  initialStatus: 'draft',
  
  signatureRequirements: [
    {
      id: 'therapist',
      role: 'PT',
      label: 'Physical Therapist Signature',
      required: true,
      order: 1,
    },
  ],
  
  allowedRoles: ['PT', 'PTA'],
  editableStatuses: ['draft'],
  
  createdDate: '2024-01-01',
  createdBy: 'System',
};

// ═══════════════════════════════════════════════════════════════════════════
// DEMO COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ClinicalDocumentationEnginePage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'library' | 'documents' | 'workflow'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Clinical Documentation Engine
            </h1>
          </div>
          <p className="text-gray-600">
            A configurable, section-based documentation system that powers all clinical documents
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              <button
                onClick={() => setSelectedTab('overview')}
                className={cn(
                  'px-4 py-3 font-medium border-b-2 transition-colors',
                  selectedTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('library')}
                className={cn(
                  'px-4 py-3 font-medium border-b-2 transition-colors',
                  selectedTab === 'library'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                Section Library
              </button>
              <button
                onClick={() => setSelectedTab('documents')}
                className={cn(
                  'px-4 py-3 font-medium border-b-2 transition-colors',
                  selectedTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                Document Types
              </button>
              <button
                onClick={() => setSelectedTab('workflow')}
                className={cn(
                  'px-4 py-3 font-medium border-b-2 transition-colors',
                  selectedTab === 'workflow'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                Workflows
              </button>
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && <OverviewTab />}
            {selectedTab === 'library' && <SectionLibraryTab />}
            {selectedTab === 'documents' && <DocumentTypesTab />}
            {selectedTab === 'workflow' && <WorkflowTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function OverviewTab() {
  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Code className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Configuration-Driven Architecture</AlertTitle>
        <AlertDescription className="text-blue-800 text-sm">
          The Clinical Documentation Engine is a meta-system that powers all clinical documents through JSON configuration.
          No code changes needed to create new document types.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Layers className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Section-Based Architecture</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Documents are composed of reusable sections from a central library. Sections contain structured fields with validation rules.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Reusable across document types</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Consistent user experience</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Easy maintenance and updates</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Workflow className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Flexible Workflows</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configurable status workflows with transitions, validations, and signature requirements for each document type.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Custom status definitions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Role-based signature flows</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Conditional requirements</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Advanced Validation</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Comprehensive validation system with field-level rules, conditional logic, and cross-field validation.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Real-time validation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Conditional field visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Custom validation functions</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">16+ Field Types</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Rich set of field types for any clinical data including structured data, narratives, scales, and media uploads.
          </p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>• Text & Textarea</div>
            <div>• Select & Multi-select</div>
            <div>• Number & Scale</div>
            <div>• Date & Time</div>
            <div>• Radio & Checkboxes</div>
            <div>• File & Photo Upload</div>
            <div>• Signature Capture</div>
            <div>• Custom Components</div>
          </div>
        </Card>
      </div>

      {/* Architecture Diagram */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Architecture</h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <pre className="text-xs text-gray-700 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                    Document Type Registry                        │
│  - Skilled Nursing Visit Note                                    │
│  - Physical Therapy Evaluation                                   │
│  - OASIS Assessment                                              │
│  - Discharge Summary                                             │
│  - ... (any clinical document)                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Section Library                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Vital Signs     │  │ Pain Assessment │  │ Clinical Assess │ │
│  │ - BP Systolic   │  │ - Pain Level    │  │ - Cardiovascular│ │
│  │ - BP Diastolic  │  │ - Pain Location │  │ - Respiratory   │ │
│  │ - Heart Rate    │  │ - Pain Quality  │  │ - Neurological  │ │
│  │ - Temperature   │  │ - Pain Notes    │  │ - GI            │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Field Type System                            │
│  Text | Textarea | Number | Date | Time | Select | Radio        │
│  Checkbox | Scale | Signature | File | Photo | Custom           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Validation Engine                             │
│  - Required fields                                               │
│  - Min/max length/value                                          │
│  - Pattern matching                                              │
│  - Conditional logic                                             │
│  - Custom validators                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Workflow & Status Manager                       │
│  Draft → In Progress → Completed → Submitted → Approved          │
│  - Status transitions                                            │
│  - Required actions                                              │
│  - Notifications                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Signature Workflow                             │
│  - Role-based requirements                                       │
│  - Sequential signing                                            │
│  - Conditional signatures                                        │
│  - Audit trail                                                   │
└─────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </Card>
    </div>
  );
}

function SectionLibraryTab() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Section Library</h3>
        <p className="text-sm text-gray-600">
          Reusable sections that can be composed into any document type. Each section contains structured fields with validation.
        </p>
      </div>

      {Object.entries(SECTION_LIBRARY).map(([key, section]) => (
        <Card key={key} className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">{section.title}</h4>
              <p className="text-sm text-gray-600">{section.description}</p>
            </div>
            <Badge variant="outline">{section.fields.length} fields</Badge>
          </div>

          <div className="space-y-2">
            {section.fields.map(field => (
              <div key={field.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded text-sm">
                <Badge className="text-xs">{field.type}</Badge>
                <span className="font-medium">{field.label}</span>
                {field.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
                {field.conditionalLogic && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs">Conditional</Badge>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
            <div className="flex gap-4">
              <span>Layout: {section.layout}</span>
              {section.repeatable && <span className="text-blue-600">Repeatable</span>}
              {section.collapsible && <span className="text-purple-600">Collapsible</span>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function DocumentTypesTab() {
  const documents = [SKILLED_NURSING_VISIT_NOTE, PHYSICAL_THERAPY_EVALUATION];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Type Configurations</h3>
        <p className="text-sm text-gray-600">
          Example document types composed from section library. Any clinical document can be configured this way.
        </p>
      </div>

      {documents.map(doc => (
        <Card key={doc.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-semibold text-gray-900">{doc.name}</h4>
                <Badge variant="outline">v{doc.version}</Badge>
                <Badge>{doc.category}</Badge>
              </div>
              <p className="text-sm text-gray-600">{doc.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <Label className="text-gray-700 mb-2 block">Sections ({doc.sections.length + (doc.customSections?.length || 0)})</Label>
              <div className="space-y-1">
                {doc.customSections?.map(section => (
                  <div key={section.id} className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{section.title}</span>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Custom</Badge>
                  </div>
                ))}
                {doc.sections.map(sectionId => {
                  const section = SECTION_LIBRARY[sectionId];
                  return section ? (
                    <div key={sectionId} className="text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-gray-600" />
                      <span>{section.title}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">Workflow ({doc.statusWorkflow.length} statuses)</Label>
              <div className="flex items-center gap-2">
                {doc.statusWorkflow.map((status, index) => (
                  <div key={status.status} className="flex items-center">
                    <Badge className={`bg-${status.color}-100 text-${status.color}-700`}>
                      {status.label}
                    </Badge>
                    {index < doc.statusWorkflow.length - 1 && (
                      <span className="mx-1 text-gray-400">→</span>
                    )}
                  </div>
                ))}
              </div>

              <Label className="text-gray-700 mt-4 mb-2 block">Signatures ({doc.signatureRequirements.length})</Label>
              <div className="space-y-1">
                {doc.signatureRequirements.map(sig => (
                  <div key={sig.id} className="text-sm flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-gray-600" />
                    <span>{sig.label}</span>
                    {sig.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    <span className="text-xs text-gray-500">Order: {sig.order}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex gap-4 text-xs text-gray-600">
              <span>Roles: {doc.allowedRoles.join(', ')}</span>
              <span>•</span>
              <span>Editable: {doc.editableStatuses.join(', ')}</span>
              {doc.autoSave && (
                <>
                  <span>•</span>
                  <span className="text-green-600">Auto-save: {doc.autoSaveInterval! / 1000}s</span>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}

      <Alert className="border-blue-200 bg-blue-50">
        <Code className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">JSON Configuration</AlertTitle>
        <AlertDescription className="text-blue-800 text-sm">
          Each document type is defined by a JSON configuration object. New document types can be added without writing any code—just define the configuration.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function WorkflowTab() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow & Status Management</h3>
        <p className="text-sm text-gray-600">
          Configurable workflows with status transitions, validations, and automated actions.
        </p>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Example: Skilled Nursing Visit Note Workflow</h4>
        
        <div className="space-y-4">
          {SKILLED_NURSING_VISIT_NOTE.statusWorkflow.map((status, index) => (
            <div key={status.status} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    'bg-blue-100 text-blue-700 font-semibold'
                  )}>
                    {index + 1}
                  </div>
                  {index < SKILLED_NURSING_VISIT_NOTE.statusWorkflow.length - 1 && (
                    <div className="w-0.5 h-16 bg-gray-300 my-2" />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-semibold text-gray-900">{status.label}</h5>
                    <Badge className={`bg-${status.color}-100 text-${status.color}-700`}>
                      {status.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Allowed transitions:</span>
                      <div className="flex gap-2 mt-1">
                        {status.allowedTransitions.map(trans => (
                          <Badge key={trans} variant="outline">{trans}</Badge>
                        ))}
                      </div>
                    </div>

                    {status.requiredActions && (
                      <div>
                        <span className="text-gray-600">Required actions:</span>
                        <div className="flex gap-2 mt-1">
                          {status.requiredActions.map(action => (
                            <Badge key={action} className="bg-amber-100 text-amber-700">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {status.notificationTriggers && (
                      <div>
                        <span className="text-gray-600">Notification triggers:</span>
                        <div className="flex gap-2 mt-1">
                          {status.notificationTriggers.map(trigger => (
                            <Badge key={trigger} className="bg-purple-100 text-purple-700">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Signature Workflow</h4>
        
        <div className="space-y-3">
          {SKILLED_NURSING_VISIT_NOTE.signatureRequirements.map(sig => (
            <div key={sig.id} className="flex items-start gap-3 p-4 border rounded-lg">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                'bg-indigo-100 text-indigo-700 font-semibold'
              )}>
                {sig.order}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{sig.label}</span>
                  {sig.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">{sig.role}</Badge>
                </div>
                {sig.requiredStatuses && (
                  <div className="text-sm text-gray-600">
                    Required in: {sig.requiredStatuses.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Alert className="mt-4 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 text-sm">
            Sequential signature workflow ensures proper order: Clinician must sign before supervisor can review and sign.
          </AlertDescription>
        </Alert>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-3">Workflow Features</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Status Transitions</div>
              <div className="text-gray-600">Define allowed paths between statuses</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Conditional Requirements</div>
              <div className="text-gray-600">Status-specific signature requirements</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Automated Actions</div>
              <div className="text-gray-600">Trigger notifications and validations</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Role-Based Permissions</div>
              <div className="text-gray-600">Control who can edit and sign</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
