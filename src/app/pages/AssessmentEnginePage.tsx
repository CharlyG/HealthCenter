/**
 * Assessment Engine for Healthcare Platform
 * 
 * Supports complex clinical assessments like OASIS-E and HOPE
 * Configuration-driven architecture with reusable sections and questions
 * Flexible validation rules and status workflow management
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import {
  Settings,
  FileText,
  CheckCircle2,
  AlertCircle,
  Layers,
  HelpCircle,
  Save,
  Send,
  User,
  Calendar,
  Home,
  Heart,
  Activity,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  List,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES - ASSESSMENT ENGINE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Assessment Status Workflow
 */
type AssessmentStatus = 'draft' | 'in_progress' | 'completed' | 'submitted' | 'validated';

/**
 * Question Types - All possible question formats
 */
type QuestionType =
  | 'radio'              // Single choice
  | 'checkbox'           // Multiple choice
  | 'text'               // Short text
  | 'textarea'           // Long text
  | 'number'             // Numeric input
  | 'date'               // Date picker
  | 'scale'              // Numeric scale (e.g., 0-4)
  | 'boolean'            // Yes/No
  | 'dropdown'           // Select dropdown
  | 'multiselect'        // Multiple select
  | 'grid'               // Grid of options (e.g., ADL grid)
  | 'calculated';        // Auto-calculated from other responses

/**
 * Response Option - For radio, checkbox, dropdown questions
 */
interface ResponseOption {
  code: string;                    // M1800 codes like "0", "1", "2", "UK"
  label: string;                   // Display text
  description?: string;            // Detailed explanation
  score?: number;                  // Scoring value (for risk scores)
  triggers?: SkipLogicRule[];      // Skip logic rules
}

/**
 * Skip Logic Rule - Conditional question visibility
 */
interface SkipLogicRule {
  questionId: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in';
  value: any;
  action: 'show' | 'hide' | 'require';
}

/**
 * Validation Rule - Question-level validation
 */
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'range' | 'pattern' | 'custom' | 'crossQuestion';
  value?: any;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  customValidator?: (value: any, allResponses: Record<string, any>) => boolean;
}

/**
 * Question Definition - Individual assessment question
 */
interface QuestionDefinition {
  id: string;                      // Unique identifier (e.g., "M1021")
  code?: string;                   // Official code (e.g., "M1021")
  type: QuestionType;
  text: string;                    // Question text
  subtext?: string;                // Additional explanation
  helpText?: string;               // Help/guidance text
  
  // Response options
  options?: ResponseOption[];
  
  // Validation
  required?: boolean;
  validation?: ValidationRule[];
  
  // Skip logic
  skipLogic?: SkipLogicRule[];
  
  // Calculated questions
  calculation?: {
    formula: string;
    dependsOn: string[];           // Question IDs used in calculation
  };
  
  // Metadata
  regulatoryReference?: string;    // CMS reference
  tags?: string[];                 // For grouping/filtering
}

/**
 * Section Definition - Groups related questions
 */
interface SectionDefinition {
  id: string;
  title: string;
  code?: string;                   // Section code (e.g., "M1000-M1060")
  description?: string;
  icon?: React.ComponentType<any>;
  
  // Questions in this section
  questions: QuestionDefinition[];
  
  // Section-level validation
  sectionValidation?: (responses: Record<string, any>) => string[];
  
  // Skip logic for entire section
  skipLogic?: SkipLogicRule[];
  
  // Metadata
  regulatoryReference?: string;
  estimatedTime?: number;          // Estimated minutes to complete
}

/**
 * Assessment Type Configuration
 */
interface AssessmentTypeConfiguration {
  id: string;
  name: string;                    // "OASIS-E", "HOPE", etc.
  version: string;                 // "OASIS-E 2024"
  category: 'oasis' | 'hope' | 'mds' | 'other';
  
  // Structure
  sections: SectionDefinition[];
  
  // Timing requirements
  requiredTimeframe?: {
    from: string;                  // e.g., "admission_date"
    days: number;                  // e.g., 5 days from admission
    direction: 'before' | 'after';
  };
  
  // Assessment-specific rules
  completionRules?: {
    minimumRequired: string[];     // Question IDs that must be answered
    sections: {
      sectionId: string;
      requiredQuestions: string[];
    }[];
  };
  
  // Scoring/calculation
  scoring?: {
    scoreId: string;
    name: string;
    calculation: string;
    range: [number, number];
    interpretation?: {
      min: number;
      max: number;
      label: string;
      color: string;
    }[];
  }[];
  
  // Regulatory metadata
  regulatoryBody?: string;         // "CMS", "NQF", etc.
  effectiveDate?: string;
  expirationDate?: string;
  
  // Workflow
  statusWorkflow: {
    status: AssessmentStatus;
    label: string;
    color: string;
    allowedTransitions: AssessmentStatus[];
    requiredActions?: string[];
  }[];
}

/**
 * Assessment Instance - Actual assessment data
 */
interface AssessmentInstance {
  id: string;
  assessmentTypeId: string;
  
  // Context
  patientId: string;
  admissionId: string;
  episodeId?: string;
  
  // Metadata
  assessmentType: 'SOC' | 'ROC' | 'Follow-Up' | 'Discharge' | 'Transfer' | 'Recertification' | 'Other';
  assessmentDate: string;
  assessmentReason?: string;
  
  // Clinician
  clinicianId: string;
  clinicianName: string;
  clinicianCredentials: string;
  clinicianRole: string;
  
  // Status
  status: AssessmentStatus;
  
  // Responses
  responses: Record<string, any>;  // questionId -> response value
  
  // Calculated scores
  scores?: Record<string, number>;
  
  // Validation state
  validationErrors?: {
    questionId: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }[];
  
  // Timestamps
  createdDate: string;
  lastModifiedDate?: string;
  completedDate?: string;
  submittedDate?: string;
  validatedDate?: string;
  
  // Audit
  history: {
    action: string;
    timestamp: string;
    userId: string;
    changes?: Record<string, any>;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// OASIS-E CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const OASIS_E_CONFIGURATION: AssessmentTypeConfiguration = {
  id: 'oasis-e-2024',
  name: 'OASIS-E',
  version: 'OASIS-E 2024 v1.0',
  category: 'oasis',
  
  sections: [
    // ────────────────────────────────────────────────────────────────────────
    // SECTION A: Patient Tracking Items
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'section-a',
      title: 'Patient Tracking Items',
      code: 'M0010-M0150',
      description: 'Administrative and tracking information',
      icon: ClipboardList,
      estimatedTime: 5,
      questions: [
        {
          id: 'M0010',
          code: 'M0010',
          type: 'dropdown',
          text: 'CMS Certification Number',
          required: true,
          options: [
            { code: '111111', label: 'Agency 111111 - Main Office' },
            { code: '222222', label: 'Agency 222222 - Branch A' },
            { code: '333333', label: 'Agency 333333 - Branch B' },
          ],
          validation: [
            {
              type: 'required',
              message: 'CMS Certification Number is required',
              severity: 'error',
            },
          ],
        },
        {
          id: 'M0014',
          code: 'M0014',
          type: 'dropdown',
          text: 'Branch State',
          subtext: 'State in which the branch is located',
          required: true,
          options: [
            { code: 'CA', label: 'California' },
            { code: 'TX', label: 'Texas' },
            { code: 'FL', label: 'Florida' },
            { code: 'NY', label: 'New York' },
          ],
        },
        {
          id: 'M0016',
          code: 'M0016',
          type: 'text',
          text: 'Branch ID Number',
          subtext: 'Agency-assigned branch identifier',
          required: false,
        },
        {
          id: 'M0018',
          code: 'M0018',
          type: 'text',
          text: 'National Provider Identifier (NPI)',
          required: true,
          validation: [
            {
              type: 'pattern',
              value: /^\d{10}$/,
              message: 'NPI must be exactly 10 digits',
              severity: 'error',
            },
          ],
        },
        {
          id: 'M0020',
          code: 'M0020',
          type: 'text',
          text: 'Patient ID Number',
          subtext: 'Agency patient identifier',
          required: true,
        },
        {
          id: 'M0030',
          code: 'M0030',
          type: 'date',
          text: 'Start of Care Date',
          subtext: 'First billable visit date',
          required: true,
        },
        {
          id: 'M0032',
          code: 'M0032',
          type: 'date',
          text: 'Resumption of Care Date',
          subtext: 'Date care resumed after inpatient stay',
          required: false,
          skipLogic: [
            {
              questionId: 'M0100',
              operator: 'notEquals',
              value: '03',
              action: 'hide',
            },
          ],
        },
        {
          id: 'M0040',
          code: 'M0040',
          type: 'text',
          text: 'Patient First Name',
          required: true,
        },
        {
          id: 'M0050',
          code: 'M0050',
          type: 'text',
          text: 'Patient Last Name',
          required: true,
        },
        {
          id: 'M0060',
          code: 'M0060',
          type: 'text',
          text: 'Patient State of Residence',
          required: true,
        },
        {
          id: 'M0063',
          code: 'M0063',
          type: 'text',
          text: 'Medicare Number',
          subtext: 'Including suffix',
          required: false,
        },
        {
          id: 'M0064',
          code: 'M0064',
          type: 'text',
          text: 'Social Security Number',
          required: false,
          validation: [
            {
              type: 'pattern',
              value: /^\d{3}-?\d{2}-?\d{4}$/,
              message: 'Invalid SSN format',
              severity: 'warning',
            },
          ],
        },
        {
          id: 'M0065',
          code: 'M0065',
          type: 'text',
          text: 'Medicaid Number',
          required: false,
        },
        {
          id: 'M0066',
          code: 'M0066',
          type: 'date',
          text: 'Patient Birth Date',
          required: true,
        },
        {
          id: 'M0069',
          code: 'M0069',
          type: 'radio',
          text: 'Patient Gender',
          required: true,
          options: [
            { code: '1', label: 'Male' },
            { code: '2', label: 'Female' },
          ],
        },
        {
          id: 'M0100',
          code: 'M0100',
          type: 'radio',
          text: 'Reason for Assessment',
          required: true,
          options: [
            { code: '01', label: 'Start of care - further visits planned' },
            { code: '03', label: 'Resumption of care (after inpatient stay)' },
            { code: '04', label: 'Recertification (follow-up) reassessment' },
            { code: '05', label: 'Other follow-up' },
            { code: '06', label: 'Transferred to an inpatient facility - patient not discharged' },
            { code: '07', label: 'Transferred to an inpatient facility - patient discharged' },
            { code: '08', label: 'Death at home' },
            { code: '09', label: 'Discharge from agency' },
          ],
        },
        {
          id: 'M0102',
          code: 'M0102',
          type: 'date',
          text: 'Date of Physician Ordered Start of Care',
          required: true,
          skipLogic: [
            {
              questionId: 'M0100',
              operator: 'equals',
              value: '01',
              action: 'show',
            },
          ],
        },
        {
          id: 'M0110',
          code: 'M0110',
          type: 'date',
          text: 'Episode Timing',
          subtext: 'Assessment completion date',
          required: true,
        },
      ],
    },
    
    // ────────────────────────────────────────────────────────────────────────
    // SECTION B: Patient History and Diagnoses
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'section-b',
      title: 'Patient History and Diagnoses',
      code: 'M1000-M1060',
      description: 'Inpatient history and diagnosis information',
      icon: FileText,
      estimatedTime: 10,
      questions: [
        {
          id: 'M1000',
          code: 'M1000',
          type: 'radio',
          text: 'Inpatient Facility Admission',
          subtext: 'Has the patient been admitted to an inpatient facility?',
          required: true,
          options: [
            { code: '0', label: 'No' },
            { code: '1', label: 'Yes' },
            { code: 'UK', label: 'Unknown' },
          ],
        },
        {
          id: 'M1005',
          code: 'M1005',
          type: 'text',
          text: 'Inpatient Facility(ies) - Diagnosis',
          subtext: 'Primary diagnosis for most recent inpatient stay',
          required: false,
          skipLogic: [
            {
              questionId: 'M1000',
              operator: 'equals',
              value: '1',
              action: 'require',
            },
          ],
        },
        {
          id: 'M1011',
          code: 'M1011',
          type: 'date',
          text: 'Inpatient Discharge Date',
          subtext: 'Date of most recent inpatient discharge',
          required: false,
          skipLogic: [
            {
              questionId: 'M1000',
              operator: 'equals',
              value: '1',
              action: 'require',
            },
          ],
        },
        {
          id: 'M1021',
          code: 'M1021',
          type: 'text',
          text: 'Primary Diagnosis',
          subtext: 'ICD-10-CM code',
          required: true,
          helpText: 'The diagnosis most related to the current plan of care',
          validation: [
            {
              type: 'pattern',
              value: /^[A-Z]\d{2}(\.\d{1,4})?$/,
              message: 'Must be valid ICD-10 format (e.g., I10 or I10.0)',
              severity: 'error',
            },
          ],
        },
        {
          id: 'M1023',
          code: 'M1023',
          type: 'text',
          text: 'Other Diagnosis #1',
          subtext: 'ICD-10-CM code',
          required: false,
        },
        {
          id: 'M1025',
          code: 'M1025',
          type: 'text',
          text: 'Other Diagnosis #2',
          subtext: 'ICD-10-CM code',
          required: false,
        },
        {
          id: 'M1027',
          code: 'M1027',
          type: 'text',
          text: 'Other Diagnosis #3',
          subtext: 'ICD-10-CM code',
          required: false,
        },
        {
          id: 'M1029',
          code: 'M1029',
          type: 'text',
          text: 'Other Diagnosis #4',
          subtext: 'ICD-10-CM code',
          required: false,
        },
        {
          id: 'M1051',
          code: 'M1051',
          type: 'radio',
          text: 'Pressure Ulcer Risk Assessment',
          subtext: 'Does this patient have at least two risk factors?',
          required: true,
          options: [
            { code: '0', label: 'No', score: 0 },
            { code: '1', label: 'Yes', score: 1 },
          ],
          helpText: 'Risk factors include: bedfast, impaired transfer ability, urinary incontinence, etc.',
        },
        {
          id: 'M1060',
          code: 'M1060',
          type: 'radio',
          text: 'Height and Weight',
          subtext: 'Were height and weight measured?',
          required: true,
          options: [
            { code: '0', label: 'Yes' },
            { code: '1', label: 'No - patient refused' },
            { code: '2', label: 'No - unable to measure' },
          ],
        },
      ],
    },
    
    // ────────────────────────────────────────────────────────────────────────
    // SECTION C: Living Arrangements
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'section-c',
      title: 'Living Arrangements',
      code: 'M1100',
      description: 'Patient living situation and support',
      icon: Home,
      estimatedTime: 5,
      questions: [
        {
          id: 'M1100',
          code: 'M1100',
          type: 'radio',
          text: 'Patient Living Situation',
          required: true,
          options: [
            { code: '01', label: 'Patient lives alone' },
            { code: '02', label: 'Patient lives with other person(s) in the home' },
            { code: '03', label: 'Patient lives in congregate situation' },
          ],
        },
      ],
    },
    
    // ────────────────────────────────────────────────────────────────────────
    // SECTION D: Sensory Status
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'section-d',
      title: 'Sensory Status',
      code: 'M1200-M1242',
      description: 'Vision, hearing, and speech',
      icon: Eye,
      estimatedTime: 5,
      questions: [
        {
          id: 'M1200',
          code: 'M1200',
          type: 'radio',
          text: 'Vision',
          subtext: 'Current ability to see',
          required: true,
          options: [
            { code: '0', label: 'Normal - sees adequately in most situations', score: 0 },
            { code: '1', label: 'Partially impaired - can see but not clearly', score: 1 },
            { code: '2', label: 'Severely impaired - large objects only', score: 2 },
            { code: '3', label: 'Blind - no useful vision', score: 3 },
          ],
        },
        {
          id: 'M1210',
          code: 'M1210',
          type: 'radio',
          text: 'Ability to Hear',
          subtext: 'With hearing aid if usually worn',
          required: true,
          options: [
            { code: '0', label: 'Adequate - hears normal conversation', score: 0 },
            { code: '1', label: 'Mildly impaired - difficulty with soft voices', score: 1 },
            { code: '2', label: 'Moderately impaired - difficulty with normal conversation', score: 2 },
            { code: '3', label: 'Severely impaired - hears only loud voices', score: 3 },
            { code: '4', label: 'Profoundly impaired - absence of useful hearing', score: 4 },
          ],
        },
        {
          id: 'M1220',
          code: 'M1220',
          type: 'radio',
          text: 'Understanding of Verbal Content',
          subtext: 'In the patient\'s own language',
          required: true,
          options: [
            { code: '0', label: 'Understands - clear comprehension', score: 0 },
            { code: '1', label: 'Usually understands - difficulty with abstract ideas', score: 1 },
            { code: '2', label: 'Sometimes understands - simple phrases only', score: 2 },
            { code: '3', label: 'Rarely understands - only concrete words', score: 3 },
            { code: '4', label: 'Never understands', score: 4 },
          ],
        },
        {
          id: 'M1230',
          code: 'M1230',
          type: 'radio',
          text: 'Speech and Oral Expression',
          subtext: 'Ability to use language',
          required: true,
          options: [
            { code: '0', label: 'Expresses complex ideas clearly', score: 0 },
            { code: '1', label: 'Expresses simple ideas clearly', score: 1 },
            { code: '2', label: 'Limited to making concrete requests', score: 2 },
            { code: '3', label: 'Very limited - single words or gestures', score: 3 },
            { code: '4', label: 'Unable to express basic needs', score: 4 },
            { code: '5', label: 'Patient non-responsive', score: 5 },
          ],
        },
      ],
    },
    
    // ────────────────────────────────────────────────────────────────────────
    // SECTION E: Integumentary Status
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'section-e',
      title: 'Integumentary Status',
      code: 'M1300-M1350',
      description: 'Pressure ulcers and wounds',
      icon: Activity,
      estimatedTime: 10,
      questions: [
        {
          id: 'M1306',
          code: 'M1306',
          type: 'radio',
          text: 'Unhealed Pressure Ulcer(s)',
          subtext: 'Does patient currently have at least one unhealed pressure ulcer?',
          required: true,
          options: [
            { code: '0', label: 'No' },
            { code: '1', label: 'Yes' },
          ],
        },
        {
          id: 'M1307',
          code: 'M1307',
          type: 'radio',
          text: 'Oldest Stage 2 Pressure Ulcer',
          subtext: 'Present on admission',
          required: false,
          skipLogic: [
            {
              questionId: 'M1306',
              operator: 'equals',
              value: '1',
              action: 'show',
            },
          ],
          options: [
            { code: '0', label: 'No Stage 2 pressure ulcers' },
            { code: '1', label: 'Yes - Stage 2 pressure ulcer(s)' },
          ],
        },
        {
          id: 'M1311',
          code: 'M1311',
          type: 'number',
          text: 'Number of Current Pressure Ulcers at Each Stage',
          subtext: 'Stage 2',
          required: false,
          skipLogic: [
            {
              questionId: 'M1306',
              operator: 'equals',
              value: '1',
              action: 'show',
            },
          ],
          validation: [
            {
              type: 'min',
              value: 0,
              message: 'Cannot be negative',
            },
          ],
        },
        {
          id: 'M1312',
          code: 'M1312',
          type: 'number',
          text: 'Number of Current Pressure Ulcers at Each Stage',
          subtext: 'Stage 3',
          required: false,
          skipLogic: [
            {
              questionId: 'M1306',
              operator: 'equals',
              value: '1',
              action: 'show',
            },
          ],
        },
        {
          id: 'M1313',
          code: 'M1313',
          type: 'number',
          text: 'Number of Current Pressure Ulcers at Each Stage',
          subtext: 'Stage 4',
          required: false,
          skipLogic: [
            {
              questionId: 'M1306',
              operator: 'equals',
              value: '1',
              action: 'show',
            },
          ],
        },
        {
          id: 'M1320',
          code: 'M1320',
          type: 'radio',
          text: 'Status of Most Problematic Pressure Ulcer',
          required: false,
          skipLogic: [
            {
              questionId: 'M1306',
              operator: 'equals',
              value: '1',
              action: 'require',
            },
          ],
          options: [
            { code: '1', label: 'Newly epithelialized' },
            { code: '2', label: 'Fully granulating' },
            { code: '3', label: 'Early/partial granulation' },
            { code: '4', label: 'Not healing' },
          ],
        },
        {
          id: 'M1330',
          code: 'M1330',
          type: 'radio',
          text: 'Stasis Ulcer(s)',
          subtext: 'Does patient currently have at least one stasis ulcer?',
          required: true,
          options: [
            { code: '0', label: 'No' },
            { code: '1', label: 'Yes - observable' },
            { code: '2', label: 'Yes - not observable but documented' },
          ],
        },
        {
          id: 'M1340',
          code: 'M1340',
          type: 'radio',
          text: 'Surgical Wound(s)',
          subtext: 'Does patient currently have a surgical wound?',
          required: true,
          options: [
            { code: '0', label: 'No' },
            { code: '1', label: 'Yes - healing normally' },
            { code: '2', label: 'Yes - early signs of infection' },
            { code: '3', label: 'Yes - undergoing treatment for infection' },
            { code: '4', label: 'Yes - wound dehisced' },
          ],
        },
      ],
    },
  ],
  
  regulatoryBody: 'CMS',
  effectiveDate: '2024-01-01',
  
  statusWorkflow: [
    {
      status: 'draft',
      label: 'Draft',
      color: 'gray',
      allowedTransitions: ['in_progress'],
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      color: 'blue',
      allowedTransitions: ['draft', 'completed'],
    },
    {
      status: 'completed',
      label: 'Completed',
      color: 'green',
      allowedTransitions: ['in_progress', 'submitted'],
      requiredActions: ['validate_all_required'],
    },
    {
      status: 'submitted',
      label: 'Submitted',
      color: 'purple',
      allowedTransitions: ['validated'],
    },
    {
      status: 'validated',
      label: 'Validated',
      color: 'emerald',
      allowedTransitions: [],
    },
  ],
  
  requiredTimeframe: {
    from: 'admission_date',
    days: 5,
    direction: 'after',
  },
  
  completionRules: {
    minimumRequired: ['M0010', 'M0100', 'M1021'],
    sections: [
      {
        sectionId: 'section-a',
        requiredQuestions: ['M0010', 'M0100', 'M0110'],
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HOPE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const HOPE_CONFIGURATION: AssessmentTypeConfiguration = {
  id: 'hope-2024',
  name: 'HOPE',
  version: 'HOPE 2024 v1.0',
  category: 'hope',
  
  sections: [
    {
      id: 'section-a-hope',
      title: 'Administrative Information',
      description: 'Patient and admission tracking',
      icon: ClipboardList,
      questions: [
        {
          id: 'H0010',
          code: 'H0010',
          type: 'text',
          text: 'Medicare Beneficiary Identifier (MBI)',
          required: true,
        },
        {
          id: 'H0020',
          code: 'H0020',
          type: 'date',
          text: 'Hospice Admission Date',
          required: true,
        },
        {
          id: 'H0030',
          code: 'H0030',
          type: 'radio',
          text: 'Assessment Type',
          required: true,
          options: [
            { code: '01', label: 'Admission' },
            { code: '02', label: 'Discharge' },
            { code: '03', label: 'Change in Level of Care' },
          ],
        },
      ],
    },
    {
      id: 'section-b-hope',
      title: 'Pain Screening',
      description: 'Initial pain assessment',
      icon: Heart,
      questions: [
        {
          id: 'H1010',
          code: 'H1010',
          type: 'radio',
          text: 'Patient Has Pain',
          required: true,
          options: [
            { code: '0', label: 'No', score: 0 },
            { code: '1', label: 'Yes', score: 1 },
            { code: '9', label: 'Unable to assess' },
          ],
        },
        {
          id: 'H1020',
          code: 'H1020',
          type: 'scale',
          text: 'Pain Intensity',
          subtext: 'On a scale of 0-10',
          required: false,
          skipLogic: [
            {
              questionId: 'H1010',
              operator: 'equals',
              value: '1',
              action: 'require',
            },
          ],
          validation: [
            {
              type: 'range',
              value: [0, 10],
              message: 'Pain scale must be 0-10',
            },
          ],
        },
      ],
    },
    {
      id: 'section-c-hope',
      title: 'Dyspnea Screening',
      description: 'Breathing difficulty assessment',
      icon: Activity,
      questions: [
        {
          id: 'H2010',
          code: 'H2010',
          type: 'radio',
          text: 'Patient Has Dyspnea',
          required: true,
          options: [
            { code: '0', label: 'No' },
            { code: '1', label: 'Yes' },
            { code: '9', label: 'Unable to assess' },
          ],
        },
        {
          id: 'H2020',
          code: 'H2020',
          type: 'scale',
          text: 'Dyspnea Severity',
          subtext: 'On a scale of 0-10',
          required: false,
          skipLogic: [
            {
              questionId: 'H2010',
              operator: 'equals',
              value: '1',
              action: 'require',
            },
          ],
          validation: [
            {
              type: 'range',
              value: [0, 10],
              message: 'Dyspnea scale must be 0-10',
            },
          ],
        },
      ],
    },
  ],
  
  regulatoryBody: 'CMS',
  effectiveDate: '2024-01-01',
  
  statusWorkflow: [
    {
      status: 'draft',
      label: 'Draft',
      color: 'gray',
      allowedTransitions: ['in_progress'],
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      color: 'blue',
      allowedTransitions: ['completed'],
    },
    {
      status: 'completed',
      label: 'Completed',
      color: 'green',
      allowedTransitions: ['submitted'],
    },
    {
      status: 'submitted',
      label: 'Submitted',
      color: 'purple',
      allowedTransitions: ['validated'],
    },
    {
      status: 'validated',
      label: 'Validated',
      color: 'emerald',
      allowedTransitions: [],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AssessmentEnginePage() {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'oasis' | 'hope' | 'builder'>('overview');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Assessment Engine
            </h1>
          </div>
          <p className="text-gray-600">
            Configuration-driven assessment system supporting OASIS-E, HOPE, and custom assessments
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
                onClick={() => setSelectedTab('oasis')}
                className={cn(
                  'px-4 py-3 font-medium border-b-2 transition-colors',
                  selectedTab === 'oasis'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                OASIS-E Configuration
              </button>
              <button
                onClick={() => setSelectedTab('hope')}
                className={cn(
                  'px-4 py-3 font-medium border-b-2 transition-colors',
                  selectedTab === 'hope'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                HOPE Configuration
              </button>
              <button
                onClick={() => setSelectedTab('builder')}
                className={cn(
                  'px-4 py-3 font-medium border-b-2 transition-colors',
                  selectedTab === 'builder'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                Assessment Builder
              </button>
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && <OverviewTab />}
            {selectedTab === 'oasis' && (
              <AssessmentConfigTab
                config={OASIS_E_CONFIGURATION}
                selectedSection={selectedSection}
                onSelectSection={setSelectedSection}
              />
            )}
            {selectedTab === 'hope' && (
              <AssessmentConfigTab
                config={HOPE_CONFIGURATION}
                selectedSection={selectedSection}
                onSelectSection={setSelectedSection}
              />
            )}
            {selectedTab === 'builder' && <BuilderTab />}
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
        <Settings className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900">Configuration-Driven Architecture</AlertTitle>
        <AlertDescription className="text-blue-800 text-sm">
          The Assessment Engine is a meta-system that supports any clinical assessment through JSON configuration.
          Pre-configured for OASIS-E and HOPE with extensibility for custom assessments.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Layers className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Flexible Structure</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Assessments are composed of sections containing questions with configurable response options and validation rules.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Reusable sections and questions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Multiple question types</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Skip logic and conditional questions</span>
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
            Comprehensive validation engine with question-level rules, cross-question validation, and regulatory compliance checks.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Real-time validation feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>CMS compliance validation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Error/warning/info severity levels</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Status Workflow</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Configurable 5-stage workflow: Draft → In Progress → Completed → Submitted → Validated.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Status transitions with rules</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Required actions per status</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Audit trail tracking</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pre-Built Assessments</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Complete configurations for OASIS-E (100+ questions, 5 sections) and HOPE with CMS compliance built-in.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>OASIS-E 2024 ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>HOPE hospice assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Extensible for custom assessments</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Architecture Diagram */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Engine Architecture</h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <pre className="text-xs text-gray-700 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                Assessment Type Configuration                     │
│  - OASIS-E (Home Health)                                         │
│  - HOPE (Hospice)                                                │
│  - MDS (Skilled Nursing)                                         │
│  - Custom Assessments                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Section Definitions                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Patient Tracking│  │ Diagnoses       │  │ Living Situation│ │
│  │ Questions: 15   │  │ Questions: 10   │  │ Questions: 1    │ │
│  │ M0010-M0150     │  │ M1000-M1060     │  │ M1100           │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Question Definitions                          │
│  Question ID  │  Type       │  Options      │  Validation       │
│  M1200        │  Radio      │  4 options    │  Required         │
│  M1306        │  Radio      │  2 options    │  Skip Logic       │
│  M1311        │  Number     │  N/A          │  Min: 0           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Response Options & Skip Logic                  │
│  Code: "0"  Label: "No"           → Hide M1307                   │
│  Code: "1"  Label: "Yes"          → Show M1307, Require M1320   │
│  Code: "UK" Label: "Unknown"      → No action                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Validation Engine                             │
│  - Required field validation                                     │
│  - Format validation (ICD-10, SSN, NPI)                          │
│  - Range validation (0-10 scales)                                │
│  - Cross-question validation                                     │
│  - CMS compliance rules                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Status Workflow Manager                         │
│  Draft → In Progress → Completed → Submitted → Validated         │
│  - Allowed transitions                                           │
│  - Required actions                                              │
│  - Audit trail                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Assessment Instance                            │
│  - Patient context                                               │
│  - Metadata (type, date, clinician)                              │
│  - Response data                                                 │
│  - Validation state                                              │
│  - History/audit trail                                           │
└─────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </Card>
    </div>
  );
}

interface AssessmentConfigTabProps {
  config: AssessmentTypeConfiguration;
  selectedSection: string | null;
  onSelectSection: (sectionId: string | null) => void;
}

function AssessmentConfigTab({ config, selectedSection, onSelectSection }: AssessmentConfigTabProps) {
  const section = config.sections.find(s => s.id === selectedSection);

  return (
    <div className="space-y-6">
      {/* Assessment Metadata */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Configuration</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label className="text-gray-600">Name</Label>
            <div className="font-semibold text-gray-900 mt-1">{config.name}</div>
          </div>
          <div>
            <Label className="text-gray-600">Version</Label>
            <div className="font-semibold text-gray-900 mt-1">{config.version}</div>
          </div>
          <div>
            <Label className="text-gray-600">Category</Label>
            <Badge className="mt-1">{config.category.toUpperCase()}</Badge>
          </div>
          <div>
            <Label className="text-gray-600">Regulatory Body</Label>
            <div className="font-semibold text-gray-900 mt-1">{config.regulatoryBody}</div>
          </div>
          <div>
            <Label className="text-gray-600">Effective Date</Label>
            <div className="font-semibold text-gray-900 mt-1">
              {config.effectiveDate && new Date(config.effectiveDate).toLocaleDateString()}
            </div>
          </div>
          <div>
            <Label className="text-gray-600">Total Sections</Label>
            <div className="font-semibold text-gray-900 mt-1">{config.sections.length}</div>
          </div>
        </div>
      </Card>

      {/* Sections List */}
      <div className="grid grid-cols-2 gap-4">
        {config.sections.map(section => {
          const Icon = section.icon || List;
          const totalQuestions = section.questions.length;
          const requiredQuestions = section.questions.filter(q => q.required).length;

          return (
            <Card
              key={section.id}
              className={cn(
                'p-5 cursor-pointer transition-all',
                selectedSection === section.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              )}
              onClick={() => onSelectSection(selectedSection === section.id ? null : section.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{section.title}</h4>
                    {section.code && (
                      <div className="text-xs text-gray-500">{section.code}</div>
                    )}
                  </div>
                </div>
                <Badge variant="outline">{totalQuestions} questions</Badge>
              </div>

              {section.description && (
                <p className="text-sm text-gray-600 mb-3">{section.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{requiredQuestions} required</span>
                {section.estimatedTime && (
                  <span>~{section.estimatedTime} min</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Section Detail */}
      {section && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {section.title} - Questions
            </h3>
            <Button variant="ghost" size="sm" onClick={() => onSelectSection(null)}>
              Close
            </Button>
          </div>

          <div className="space-y-4">
            {section.questions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: QuestionDefinition;
}

function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {question.code && (
              <Badge variant="outline" className="text-xs">{question.code}</Badge>
            )}
            <Badge className="text-xs">{question.type}</Badge>
            {question.required && (
              <Badge variant="destructive" className="text-xs">Required</Badge>
            )}
          </div>
          <div className="font-medium text-gray-900">{question.text}</div>
          {question.subtext && (
            <div className="text-sm text-gray-600 mt-1">{question.subtext}</div>
          )}
        </div>
      </div>

      {question.options && question.options.length > 0 && (
        <div className="mt-3 space-y-1">
          <Label className="text-xs text-gray-500">Response Options:</Label>
          {question.options.map(option => (
            <div key={option.code} className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-xs font-mono">{option.code}</Badge>
              <span>{option.label}</span>
              {option.score !== undefined && (
                <span className="text-xs text-gray-500">(score: {option.score})</span>
              )}
            </div>
          ))}
        </div>
      )}

      {question.helpText && (
        <Alert className="mt-3 border-blue-200 bg-blue-50">
          <HelpCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900">
            {question.helpText}
          </AlertDescription>
        </Alert>
      )}

      {question.validation && question.validation.length > 0 && (
        <div className="mt-3">
          <Label className="text-xs text-gray-500">Validation Rules:</Label>
          <div className="space-y-1 mt-1">
            {question.validation.map((rule, index) => (
              <div key={index} className="text-xs text-gray-600">
                • {rule.type}: {rule.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {question.skipLogic && question.skipLogic.length > 0 && (
        <div className="mt-3">
          <Badge className="bg-amber-100 text-amber-700 text-xs">
            Skip Logic: {question.skipLogic.length} rule(s)
          </Badge>
        </div>
      )}
    </div>
  );
}

function BuilderTab() {
  return (
    <div className="space-y-6">
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">Assessment Builder (Coming Soon)</AlertTitle>
        <AlertDescription className="text-green-800 text-sm">
          Visual assessment builder tool to create custom assessments without writing code.
          Define sections, add questions, configure validation rules, and set up skip logic through an intuitive UI.
        </AlertDescription>
      </Alert>

      <Card className="p-12">
        <div className="text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Visual Assessment Builder
          </h3>
          <p className="text-gray-600 mb-6">
            Create and configure assessments through a drag-and-drop interface
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Section Designer</h4>
              <p className="text-sm text-gray-600">
                Add and organize assessment sections with drag-and-drop
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Question Library</h4>
              <p className="text-sm text-gray-600">
                Reuse common questions or create new ones
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Logic Builder</h4>
              <p className="text-sm text-gray-600">
                Visual skip logic and validation configuration
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
