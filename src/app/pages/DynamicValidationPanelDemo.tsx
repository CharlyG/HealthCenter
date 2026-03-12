/**
 * Dynamic Validation Panel for Clinical Assessments
 * 
 * Features:
 * - Real-time validation as users complete assessments
 * - Separate display for errors vs warnings
 * - Click to navigate to problematic questions
 * - Built-in validators for common clinical scenarios
 * - Visual severity indicators
 * - Validation progress tracking
 * - Collapsible sections for better organization
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Info,
  XCircle,
  Shield,
  FileWarning,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ValidationSeverity = 'error' | 'warning' | 'info';

interface ValidationIssue {
  id: string;
  questionId: string;
  sectionId: string;
  severity: ValidationSeverity;
  message: string;
  description: string;
  validatorType: string;
  fieldLabel?: string;
}

interface Question {
  id: string;
  sectionId: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'radio' | 'checkbox' | 'select';
  label: string;
  required?: boolean;
  validators?: Validator[];
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  helpText?: string;
  dependencies?: string[]; // Questions that affect this question's validation
}

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface Validator {
  type: string;
  message: string;
  severity: ValidationSeverity;
  validate: (value: any, allValues: Record<string, any>) => boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// BUILT-IN VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════

const VALIDATORS = {
  required: (message = 'This field is required'): Validator => ({
    type: 'required',
    message,
    severity: 'error',
    validate: (value) => {
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    },
  }),

  minLength: (min: number, message?: string): Validator => ({
    type: 'minLength',
    message: message || `Must be at least ${min} characters`,
    severity: 'error',
    validate: (value) => {
      if (!value) return true; // Let required validator handle empty
      return String(value).length >= min;
    },
  }),

  maxLength: (max: number, message?: string): Validator => ({
    type: 'maxLength',
    message: message || `Must be no more than ${max} characters`,
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      return String(value).length <= max;
    },
  }),

  pattern: (regex: RegExp, message: string): Validator => ({
    type: 'pattern',
    message,
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      return regex.test(String(value));
    },
  }),

  icdCode: (): Validator => ({
    type: 'icdCode',
    message: 'Must be a valid ICD-10 code format (e.g., Z47.1)',
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      return /^[A-Z]\d{2}(\.\d{1,2})?$/.test(String(value));
    },
  }),

  medicareNumber: (): Validator => ({
    type: 'medicareNumber',
    message: 'Must be a valid Medicare number format',
    severity: 'warning',
    validate: (value) => {
      if (!value) return true;
      return /^[0-9]{1}[A-Z]{2}[0-9]{1}[A-Z]{2}[0-9]{1}[A-Z]{2}[0-9]{2}$/.test(String(value).replace(/[\s-]/g, ''));
    },
  }),

  zipCode: (): Validator => ({
    type: 'zipCode',
    message: 'Must be a valid 5-digit ZIP code',
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      return /^\d{5}$/.test(String(value));
    },
  }),

  phoneNumber: (): Validator => ({
    type: 'phoneNumber',
    message: 'Must be a valid phone number',
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      const cleaned = String(value).replace(/\D/g, '');
      return cleaned.length === 10;
    },
  }),

  dateInPast: (message = 'Date must be in the past'): Validator => ({
    type: 'dateInPast',
    message,
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate < today;
    },
  }),

  dateNotFuture: (message = 'Date cannot be in the future'): Validator => ({
    type: 'dateNotFuture',
    message,
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return inputDate <= today;
    },
  }),

  minValue: (min: number, message?: string): Validator => ({
    type: 'minValue',
    message: message || `Must be at least ${min}`,
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      return Number(value) >= min;
    },
  }),

  maxValue: (max: number, message?: string): Validator => ({
    type: 'maxValue',
    message: message || `Must be no more than ${max}`,
    severity: 'error',
    validate: (value) => {
      if (!value) return true;
      return Number(value) <= max;
    },
  }),

  conditionalRequired: (
    dependsOn: string,
    condition: any,
    message = 'This field is required based on your previous answer'
  ): Validator => ({
    type: 'conditionalRequired',
    message,
    severity: 'error',
    validate: (value, allValues) => {
      // If dependency not met, validation passes
      if (allValues[dependsOn] !== condition) return true;
      // If dependency met, check if field has value
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    },
  }),

  clinicalLogic: (
    checker: (value: any, allValues: Record<string, any>) => boolean,
    message: string,
    severity: ValidationSeverity = 'warning'
  ): Validator => ({
    type: 'clinicalLogic',
    message,
    severity,
    validate: checker,
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
// DEMO ASSESSMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DEMO_SECTIONS: Section[] = [
  {
    id: 'patient-demographics',
    title: 'Patient Demographics',
    description: 'Basic patient information',
    questions: [
      {
        id: 'firstName',
        sectionId: 'patient-demographics',
        type: 'text',
        label: 'First Name',
        required: true,
        validators: [
          VALIDATORS.required('First name is required'),
          VALIDATORS.minLength(2, 'First name must be at least 2 characters'),
        ],
      },
      {
        id: 'lastName',
        sectionId: 'patient-demographics',
        type: 'text',
        label: 'Last Name',
        required: true,
        validators: [
          VALIDATORS.required('Last name is required'),
          VALIDATORS.minLength(2, 'Last name must be at least 2 characters'),
        ],
      },
      {
        id: 'dateOfBirth',
        sectionId: 'patient-demographics',
        type: 'date',
        label: 'Date of Birth',
        required: true,
        validators: [
          VALIDATORS.required('Date of birth is required'),
          VALIDATORS.dateInPast('Date of birth must be in the past'),
        ],
      },
      {
        id: 'medicare',
        sectionId: 'patient-demographics',
        type: 'text',
        label: 'Medicare Number',
        helpText: 'Format: 1AA2BB3CC44',
        validators: [
          VALIDATORS.medicareNumber(),
        ],
      },
      {
        id: 'zipCode',
        sectionId: 'patient-demographics',
        type: 'text',
        label: 'ZIP Code',
        required: true,
        validators: [
          VALIDATORS.required('ZIP code is required'),
          VALIDATORS.zipCode(),
        ],
      },
      {
        id: 'phone',
        sectionId: 'patient-demographics',
        type: 'text',
        label: 'Phone Number',
        required: true,
        placeholder: '(555) 123-4567',
        validators: [
          VALIDATORS.required('Phone number is required'),
          VALIDATORS.phoneNumber(),
        ],
      },
    ],
  },
  {
    id: 'clinical-assessment',
    title: 'Clinical Assessment',
    description: 'Clinical information and diagnoses',
    questions: [
      {
        id: 'primaryDiagnosis',
        sectionId: 'clinical-assessment',
        type: 'text',
        label: 'Primary Diagnosis (ICD-10 Code)',
        required: true,
        helpText: 'e.g., Z47.1',
        validators: [
          VALIDATORS.required('Primary diagnosis is required'),
          VALIDATORS.icdCode(),
        ],
      },
      {
        id: 'hasInpatientStay',
        sectionId: 'clinical-assessment',
        type: 'radio',
        label: 'Recent Inpatient Stay?',
        required: true,
        options: [
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
        ],
        validators: [
          VALIDATORS.required('Please indicate if there was an inpatient stay'),
        ],
      },
      {
        id: 'dischargeDate',
        sectionId: 'clinical-assessment',
        type: 'date',
        label: 'Discharge Date',
        dependencies: ['hasInpatientStay'],
        validators: [
          VALIDATORS.conditionalRequired('hasInpatientStay', 'yes', 'Discharge date is required when there was an inpatient stay'),
          VALIDATORS.dateNotFuture('Discharge date cannot be in the future'),
          VALIDATORS.clinicalLogic(
            (value, allValues) => {
              if (!value || allValues.hasInpatientStay !== 'yes') return true;
              const discharge = new Date(value);
              const today = new Date();
              const daysDiff = Math.floor((today.getTime() - discharge.getTime()) / (1000 * 60 * 60 * 24));
              return daysDiff <= 14;
            },
            'Discharge date is more than 14 days ago - verify this is a recent stay',
            'warning'
          ),
        ],
      },
      {
        id: 'fallRiskScore',
        sectionId: 'clinical-assessment',
        type: 'number',
        label: 'Fall Risk Score (0-100)',
        required: true,
        validators: [
          VALIDATORS.required('Fall risk score is required'),
          VALIDATORS.minValue(0, 'Score must be between 0 and 100'),
          VALIDATORS.maxValue(100, 'Score must be between 0 and 100'),
          VALIDATORS.clinicalLogic(
            (value) => {
              if (!value) return true;
              const score = Number(value);
              return score < 70;
            },
            'High fall risk detected (≥70) - ensure fall prevention interventions are documented',
            'warning'
          ),
        ],
      },
      {
        id: 'medications',
        sectionId: 'clinical-assessment',
        type: 'textarea',
        label: 'Current Medications',
        required: true,
        placeholder: 'List all current medications...',
        validators: [
          VALIDATORS.required('Current medications must be documented'),
          VALIDATORS.minLength(10, 'Please provide more detail about medications'),
          VALIDATORS.clinicalLogic(
            (value) => {
              if (!value) return true;
              const text = String(value).toLowerCase();
              return !text.includes('warfarin') || text.includes('inr');
            },
            'Warfarin detected - ensure INR monitoring is documented',
            'warning'
          ),
        ],
      },
    ],
  },
  {
    id: 'care-plan',
    title: 'Plan of Care',
    description: 'Treatment plan and goals',
    questions: [
      {
        id: 'disciplines',
        sectionId: 'care-plan',
        type: 'checkbox',
        label: 'Disciplines Involved',
        required: true,
        options: [
          { value: 'sn', label: 'Skilled Nursing' },
          { value: 'pt', label: 'Physical Therapy' },
          { value: 'ot', label: 'Occupational Therapy' },
          { value: 'st', label: 'Speech Therapy' },
        ],
        validators: [
          VALIDATORS.required('At least one discipline must be selected'),
        ],
      },
      {
        id: 'goal1',
        sectionId: 'care-plan',
        type: 'textarea',
        label: 'Primary Goal',
        required: true,
        placeholder: 'Patient will...',
        validators: [
          VALIDATORS.required('Primary goal is required'),
          VALIDATORS.minLength(20, 'Goal should be specific and detailed (at least 20 characters)'),
          VALIDATORS.clinicalLogic(
            (value) => {
              if (!value) return true;
              const text = String(value).toLowerCase();
              const hasTimeframe = /\d+\s*(day|week|month|visit)/i.test(text);
              return hasTimeframe;
            },
            'Goal should include a specific timeframe (e.g., "within 30 days")',
            'warning'
          ),
        ],
      },
      {
        id: 'planDuration',
        sectionId: 'care-plan',
        type: 'select',
        label: 'Plan Duration',
        required: true,
        options: [
          { value: '30', label: '30 days' },
          { value: '60', label: '60 days' },
          { value: '90', label: '90 days' },
        ],
        validators: [
          VALIDATORS.required('Plan duration must be selected'),
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function validateQuestion(
  question: Question,
  value: any,
  allValues: Record<string, any>
): ValidationIssue[] {
  if (!question.validators) return [];

  const issues: ValidationIssue[] = [];

  question.validators.forEach(validator => {
    const isValid = validator.validate(value, allValues);
    if (!isValid) {
      issues.push({
        id: `${question.id}-${validator.type}`,
        questionId: question.id,
        sectionId: question.sectionId,
        severity: validator.severity,
        message: validator.message,
        description: `${question.label}: ${validator.message}`,
        validatorType: validator.type,
        fieldLabel: question.label,
      });
    }
  });

  return issues;
}

function validateAllQuestions(
  sections: Section[],
  values: Record<string, any>
): ValidationIssue[] {
  const allIssues: ValidationIssue[] = [];

  sections.forEach(section => {
    section.questions.forEach(question => {
      const issues = validateQuestion(question, values[question.id], values);
      allIssues.push(...issues);
    });
  });

  return allIssues;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DynamicValidationPanelDemo() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('patient-demographics');
  const [values, setValues] = useState<Record<string, any>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Validate all questions
  const allValidationIssues = useMemo(() => {
    return validateAllQuestions(DEMO_SECTIONS, values);
  }, [values]);

  // Only show issues for touched fields (for better UX)
  const visibleIssues = useMemo(() => {
    return allValidationIssues.filter(issue => touchedFields.has(issue.questionId));
  }, [allValidationIssues, touchedFields]);

  // Group issues by severity
  const issuesBySeverity = useMemo(() => {
    return {
      error: visibleIssues.filter(i => i.severity === 'error'),
      warning: visibleIssues.filter(i => i.severity === 'warning'),
      info: visibleIssues.filter(i => i.severity === 'info'),
    };
  }, [visibleIssues]);

  // Calculate validation progress
  const validationProgress = useMemo(() => {
    const totalQuestions = DEMO_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
    const validQuestions = totalQuestions - allValidationIssues.length;
    return Math.round((validQuestions / totalQuestions) * 100);
  }, [allValidationIssues]);

  const handleValueChange = (questionId: string, value: any) => {
    setValues(prev => ({ ...prev, [questionId]: value }));
    setTouchedFields(prev => new Set(prev).add(questionId));
  };

  const handleNavigateToQuestion = (questionId: string, sectionId: string) => {
    setActiveSection(sectionId);
    // Scroll to question after navigation
    setTimeout(() => {
      const element = document.getElementById(`question-${questionId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleValidateAll = () => {
    // Mark all fields as touched to show all validation issues
    const allQuestionIds = DEMO_SECTIONS.flatMap(s => s.questions.map(q => q.id));
    setTouchedFields(new Set(allQuestionIds));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Dynamic Validation Panel Demo
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Real-time validation with error tracking
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleValidateAll}>
                <Shield className="w-4 h-4 mr-2" />
                Validate All
              </Button>
              {visibleIssues.length === 0 && touchedFields.size > 0 && (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  All Valid
                </Badge>
              )}
            </div>
          </div>

          {/* Validation Summary */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Validation Status</span>
                <span className="font-semibold text-gray-900">{validationProgress}% Valid</span>
              </div>
              <Progress value={validationProgress} className="h-2" />
            </div>
            {visibleIssues.length > 0 && (
              <div className="flex items-center gap-3">
                {issuesBySeverity.error.length > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    {issuesBySeverity.error.length} {issuesBySeverity.error.length === 1 ? 'Error' : 'Errors'}
                  </Badge>
                )}
                {issuesBySeverity.warning.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                    {issuesBySeverity.warning.length} {issuesBySeverity.warning.length === 1 ? 'Warning' : 'Warnings'}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Assessment Form */}
          <div className="col-span-7">
            <Alert className="border-blue-200 bg-blue-50 mb-6">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                <strong>Interactive Demo:</strong> Fill out the form to see real-time validation. 
                The validation panel on the right updates as you type.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              {DEMO_SECTIONS.map(section => (
                <AssessmentSection
                  key={section.id}
                  section={section}
                  values={values}
                  touchedFields={touchedFields}
                  validationIssues={visibleIssues}
                  isActive={activeSection === section.id}
                  onValueChange={handleValueChange}
                  onSectionClick={() => setActiveSection(section.id)}
                />
              ))}
            </div>
          </div>

          {/* Validation Panel */}
          <div className="col-span-5">
            <div className="sticky top-24">
              <ValidationPanel
                issues={visibleIssues}
                allIssues={allValidationIssues}
                touchedCount={touchedFields.size}
                totalCount={DEMO_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0)}
                onNavigateToQuestion={handleNavigateToQuestion}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface AssessmentSectionProps {
  section: Section;
  values: Record<string, any>;
  touchedFields: Set<string>;
  validationIssues: ValidationIssue[];
  isActive: boolean;
  onValueChange: (questionId: string, value: any) => void;
  onSectionClick: () => void;
}

function AssessmentSection({
  section,
  values,
  touchedFields,
  validationIssues,
  isActive,
  onValueChange,
  onSectionClick,
}: AssessmentSectionProps) {
  const sectionIssues = validationIssues.filter(i => i.sectionId === section.id);
  const hasErrors = sectionIssues.some(i => i.severity === 'error');
  const hasWarnings = sectionIssues.some(i => i.severity === 'warning');

  return (
    <Card className={cn(
      'transition-all',
      isActive && 'ring-2 ring-blue-500'
    )}>
      <button
        onClick={onSectionClick}
        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasErrors && (
              <Badge className="bg-red-100 text-red-700 border-red-300">
                <XCircle className="w-3 h-3 mr-1" />
                {sectionIssues.filter(i => i.severity === 'error').length}
              </Badge>
            )}
            {hasWarnings && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {sectionIssues.filter(i => i.severity === 'warning').length}
              </Badge>
            )}
            {!hasErrors && !hasWarnings && touchedFields.size > 0 && (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            )}
          </div>
        </div>
      </button>

      <Separator />

      <div className="p-6 space-y-6">
        {section.questions.map(question => (
          <QuestionField
            key={question.id}
            question={question}
            value={values[question.id]}
            touched={touchedFields.has(question.id)}
            issues={validationIssues.filter(i => i.questionId === question.id)}
            onChange={(value) => onValueChange(question.id, value)}
          />
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUESTION FIELD
// ═══════════════════════════════════════════════════════════════════════════

interface QuestionFieldProps {
  question: Question;
  value: any;
  touched: boolean;
  issues: ValidationIssue[];
  onChange: (value: any) => void;
}

function QuestionField({ question, value, touched, issues, onChange }: QuestionFieldProps) {
  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');

  return (
    <div id={`question-${question.id}`} className={cn(
      'p-4 border-2 rounded-lg transition-all scroll-mt-24',
      hasErrors && touched && 'border-red-300 bg-red-50',
      hasWarnings && !hasErrors && touched && 'border-amber-300 bg-amber-50',
      !hasErrors && !hasWarnings && 'border-gray-200'
    )}>
      <Label className="text-sm font-semibold text-gray-900 mb-2 block">
        {question.label}
        {question.required && <span className="text-red-600 ml-1">*</span>}
      </Label>

      {question.helpText && (
        <p className="text-xs text-gray-600 mb-3">{question.helpText}</p>
      )}

      {/* Input based on type */}
      {question.type === 'text' && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
        />
      )}

      {question.type === 'textarea' && (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={3}
        />
      )}

      {question.type === 'number' && (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
        />
      )}

      {question.type === 'date' && (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === 'radio' && question.options && (
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-2">
            {question.options.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {question.type === 'checkbox' && question.options && (
        <div className="space-y-2">
          {question.options.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${option.value}`}
                checked={Array.isArray(value) && value.includes(option.value)}
                onCheckedChange={(checked) => {
                  const currentValues = Array.isArray(value) ? value : [];
                  if (checked) {
                    onChange([...currentValues, option.value]);
                  } else {
                    onChange(currentValues.filter((v: string) => v !== option.value));
                  }
                }}
              />
              <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      )}

      {question.type === 'select' && question.options && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Show validation issues */}
      {touched && issues.length > 0 && (
        <div className="mt-3 space-y-2">
          {issues.map(issue => (
            <div
              key={issue.id}
              className={cn(
                'flex items-start gap-2 p-2 rounded text-xs',
                issue.severity === 'error' && 'bg-red-100 text-red-900',
                issue.severity === 'warning' && 'bg-amber-100 text-amber-900',
                issue.severity === 'info' && 'bg-blue-100 text-blue-900'
              )}
            >
              {issue.severity === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              {issue.severity === 'warning' && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              {issue.severity === 'info' && <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationPanelProps {
  issues: ValidationIssue[];
  allIssues: ValidationIssue[];
  touchedCount: number;
  totalCount: number;
  onNavigateToQuestion: (questionId: string, sectionId: string) => void;
}

function ValidationPanel({
  issues,
  allIssues,
  touchedCount,
  totalCount,
  onNavigateToQuestion,
}: ValidationPanelProps) {
  const [expandedSeverity, setExpandedSeverity] = useState<Set<ValidationSeverity>>(
    new Set(['error', 'warning'])
  );

  const toggleSeverity = (severity: ValidationSeverity) => {
    setExpandedSeverity(prev => {
      const newSet = new Set(prev);
      if (newSet.has(severity)) {
        newSet.delete(severity);
      } else {
        newSet.add(severity);
      }
      return newSet;
    });
  };

  const errorIssues = issues.filter(i => i.severity === 'error');
  const warningIssues = issues.filter(i => i.severity === 'warning');
  const infoIssues = issues.filter(i => i.severity === 'info');

  const allErrors = allIssues.filter(i => i.severity === 'error');
  const allWarnings = allIssues.filter(i => i.severity === 'warning');

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2 mb-2">
          <FileWarning className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Validation Panel</h3>
        </div>
        <p className="text-xs text-gray-600">
          Real-time validation as you complete the assessment
        </p>
      </div>

      {/* Stats */}
      <div className="p-4 border-b bg-white">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-600 mb-1">Fields Completed</div>
            <div className="text-xl font-bold text-gray-900">
              {touchedCount}/{totalCount}
            </div>
          </div>
          <div className={cn(
            'p-3 rounded-lg border',
            issues.length === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          )}>
            <div className={cn(
              'text-xs mb-1',
              issues.length === 0 ? 'text-green-700' : 'text-red-700'
            )}>
              {issues.length === 0 ? 'All Valid' : 'Issues Found'}
            </div>
            <div className={cn(
              'text-xl font-bold',
              issues.length === 0 ? 'text-green-900' : 'text-red-900'
            )}>
              {issues.length === 0 ? '✓' : issues.length}
            </div>
          </div>
        </div>

        {/* Hidden issues alert */}
        {allErrors.length > errorIssues.length && (
          <Alert className="mt-3 border-gray-200 bg-gray-50">
            <Info className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-xs text-gray-700">
              {allErrors.length - errorIssues.length} additional error(s) in untouched fields
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Issues List */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="p-4 space-y-3">
          {issues.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <div className="text-sm font-medium text-gray-900 mb-1">
                {touchedCount === 0 ? 'Start filling out the form' : 'All fields are valid!'}
              </div>
              <div className="text-xs text-gray-600">
                {touchedCount === 0 
                  ? 'Validation issues will appear here as you complete the assessment' 
                  : 'No validation errors or warnings detected'
                }
              </div>
            </div>
          ) : (
            <>
              {/* Errors */}
              {errorIssues.length > 0 && (
                <IssueGroup
                  severity="error"
                  title="Errors"
                  count={errorIssues.length}
                  issues={errorIssues}
                  expanded={expandedSeverity.has('error')}
                  onToggle={() => toggleSeverity('error')}
                  onNavigate={onNavigateToQuestion}
                />
              )}

              {/* Warnings */}
              {warningIssues.length > 0 && (
                <IssueGroup
                  severity="warning"
                  title="Warnings"
                  count={warningIssues.length}
                  issues={warningIssues}
                  expanded={expandedSeverity.has('warning')}
                  onToggle={() => toggleSeverity('warning')}
                  onNavigate={onNavigateToQuestion}
                />
              )}

              {/* Info */}
              {infoIssues.length > 0 && (
                <IssueGroup
                  severity="info"
                  title="Information"
                  count={infoIssues.length}
                  issues={infoIssues}
                  expanded={expandedSeverity.has('info')}
                  onToggle={() => toggleSeverity('info')}
                  onNavigate={onNavigateToQuestion}
                />
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE GROUP
// ═══════════════════════════════════════════════════════════════════════════

interface IssueGroupProps {
  severity: ValidationSeverity;
  title: string;
  count: number;
  issues: ValidationIssue[];
  expanded: boolean;
  onToggle: () => void;
  onNavigate: (questionId: string, sectionId: string) => void;
}

function IssueGroup({
  severity,
  title,
  count,
  issues,
  expanded,
  onToggle,
  onNavigate,
}: IssueGroupProps) {
  const severityConfig = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      badgeColor: 'bg-red-100 text-red-700 border-red-300',
      icon: XCircle,
    },
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
      icon: AlertTriangle,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: Info,
    },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={cn('border-2 rounded-lg overflow-hidden', config.borderColor)}>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between p-3 transition-colors',
          config.bgColor,
          'hover:opacity-80'
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn('w-5 h-5', config.textColor)} />
          <span className={cn('font-semibold text-sm', config.textColor)}>
            {title}
          </span>
          <Badge className={cn('border', config.badgeColor)}>
            {count}
          </Badge>
        </div>
        {expanded ? (
          <ChevronDown className={cn('w-4 h-4', config.textColor)} />
        ) : (
          <ChevronRight className={cn('w-4 h-4', config.textColor)} />
        )}
      </button>

      {expanded && (
        <div className="p-2 space-y-2 bg-white">
          {issues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onNavigate={() => onNavigate(issue.questionId, issue.sectionId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE CARD
// ═══════════════════════════════════════════════════════════════════════════

interface IssueCardProps {
  issue: ValidationIssue;
  onNavigate: () => void;
}

function IssueCard({ issue, onNavigate }: IssueCardProps) {
  const severityConfig = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      labelColor: 'text-red-700',
    },
    warning: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      labelColor: 'text-amber-700',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      labelColor: 'text-blue-700',
    },
  };

  const config = severityConfig[issue.severity];

  return (
    <button
      onClick={onNavigate}
      className={cn(
        'w-full text-left p-3 border-2 rounded-lg transition-all hover:shadow-md',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={cn('text-xs font-semibold', config.labelColor)}>
          {issue.fieldLabel}
        </div>
        <ExternalLink className={cn('w-3 h-3 flex-shrink-0', config.textColor)} />
      </div>
      
      <div className={cn('text-sm mb-2', config.textColor)}>
        {issue.message}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Badge variant="outline" className="text-xs">
          {issue.validatorType}
        </Badge>
        <span>•</span>
        <span className="truncate">{issue.questionId}</span>
      </div>
    </button>
  );
}
