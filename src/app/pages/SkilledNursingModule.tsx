/**
 * Skilled Nursing (SN) Clinical Documentation Module
 * 
 * Comprehensive documentation system for skilled nursing services
 * Supports 4 document types with structured fields and validation
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { DocumentValidator, ValidationResult, FieldValidationRule } from '../lib/documentValidation';
import { ValidationPanel } from '../components/documentation/ValidationPanel';
import { DocumentStatusBadge } from '../components/documentation/DocumentStatusComponents';
import { DocumentStatus } from '../lib/documentStatusSystem';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Activity,
  Heart,
  Thermometer,
  Droplet,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Stethoscope,
  ClipboardList,
  TrendingUp,
  Edit,
  Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type SNDocumentType = 
  | 'sn_admission_assessment'
  | 'sn_visit_note'
  | 'sn_recertification'
  | 'sn_discharge_summary';

interface SNFormValues {
  // Document metadata
  documentType: SNDocumentType;
  documentStatus: DocumentStatus;
  patientId: string;
  patientName: string;
  admissionId: string;
  visitDate: string;
  timeIn: string;
  timeOut: string;
  clinicianName: string;
  clinicianCredentials: string;

  // Visit Information
  visitType: string;
  visitNumber: string;
  accompaniedBy: string;

  // Patient Condition
  generalCondition: string;
  alertOriented: string;
  cardiovascularStatus: string;
  respiratoryStatus: string;
  gastrointestinalStatus: string;
  genitourinaryStatus: string;
  musculoskeletalStatus: string;
  neurologicalStatus: string;
  integumentaryStatus: string;
  conditionNarrative: string;

  // Vital Signs
  temperature: string;
  temperatureUnit: 'F' | 'C';
  pulse: string;
  respirations: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  oxygenSaturation: string;
  weight: string;
  weightUnit: 'lbs' | 'kg';
  bloodGlucose: string;

  // Pain Assessment
  hasPain: string;
  painLocation: string;
  painIntensity: string;
  painCharacter: string;
  painFrequency: string;
  painInterventions: string;
  painReassessmentScore: string;

  // Medication Review
  medicationsReviewed: string;
  medicationChanges: string;
  medicationComplianceIssues: string;
  medicationEducationProvided: string;
  medicationNarrative: string;

  // Wound Care
  hasWound: string;
  woundLocation: string;
  woundType: string;
  woundSize: string;
  woundDepth: string;
  woundDrainage: string;
  woundOdor: string;
  woundTreatment: string;
  woundPhotosDocumented: string;

  // Interventions Performed
  interventionSkillAssessment: boolean;
  interventionMedManagement: boolean;
  interventionWoundCare: boolean;
  interventionIVTherapy: boolean;
  interventionCatheterCare: boolean;
  interventionPatientEducation: boolean;
  interventionCaregiversupport: boolean;
  interventionVitalsMonitoring: boolean;
  interventionOther: boolean;
  interventionOtherDescription: string;
  interventionsNarrative: string;

  // Patient Education
  educationTopics: string[];
  educationMethods: string[];
  patientUnderstanding: string;
  educationBarriers: string;
  educationNarrative: string;

  // Care Plan Updates
  progressTowardGoals: string;
  needsIdentified: string;
  planModifications: string;
  nextVisitPlan: string;
  carePlanNarrative: string;

  // Discharge (for discharge summary)
  dischargeReason: string;
  dischargeDisposition: string;
  goalsMet: string;
  dischargeInstructions: string;
  followUpArrangements: string;
  dischargeNarrative: string;

  // Recertification (for recertification)
  certificationPeriod: string;
  continuedNeed: string;
  functionalStatus: string;
  recertificationNarrative: string;
}

// ═══════════════════════════════════════════════════════════════════════��═══
// DOCUMENT TYPE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const DOCUMENT_TYPES = {
  sn_admission_assessment: {
    id: 'sn_admission_assessment',
    label: 'SN Admission Assessment',
    description: 'Comprehensive initial assessment at start of care',
    sections: [
      'visit_information',
      'patient_condition',
      'vital_signs',
      'pain_assessment',
      'medication_review',
      'wound_care',
      'interventions',
      'patient_education',
      'care_plan',
    ],
  },
  sn_visit_note: {
    id: 'sn_visit_note',
    label: 'SN Visit Note',
    description: 'Standard skilled nursing visit documentation',
    sections: [
      'visit_information',
      'patient_condition',
      'vital_signs',
      'pain_assessment',
      'medication_review',
      'wound_care',
      'interventions',
      'patient_education',
      'care_plan',
    ],
  },
  sn_recertification: {
    id: 'sn_recertification',
    label: 'SN Recertification',
    description: 'Recertification assessment for continued services',
    sections: [
      'visit_information',
      'patient_condition',
      'vital_signs',
      'medication_review',
      'recertification_details',
      'care_plan',
    ],
  },
  sn_discharge_summary: {
    id: 'sn_discharge_summary',
    label: 'SN Discharge Summary',
    description: 'Final summary at discharge from services',
    sections: [
      'visit_information',
      'patient_condition',
      'vital_signs',
      'discharge_details',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SkilledNursingModule() {
  const navigate = useNavigate();
  const [selectedDocType, setSelectedDocType] = useState<SNDocumentType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(true);

  if (showTypeSelector || !selectedDocType) {
    return (
      <DocumentTypeSelector
        onSelect={(type) => {
          setSelectedDocType(type);
          setShowTypeSelector(false);
        }}
        onCancel={() => navigate(-1)}
      />
    );
  }

  return (
    <SNDocumentEditor
      documentType={selectedDocType}
      onClose={() => {
        setShowTypeSelector(true);
        setSelectedDocType(null);
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT TYPE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentTypeSelectorProps {
  onSelect: (type: SNDocumentType) => void;
  onCancel: () => void;
}

function DocumentTypeSelector({ onSelect, onCancel }: DocumentTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Card className="max-w-3xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skilled Nursing Documentation
          </h1>
          <p className="text-gray-600">
            Select the type of document you want to create
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(DOCUMENT_TYPES).map(docType => (
            <button
              key={docType.id}
              onClick={() => onSelect(docType.id as SNDocumentType)}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                <Badge variant="outline" className="text-xs">
                  {docType.sections.length} sections
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{docType.label}</h3>
              <p className="text-sm text-gray-600">{docType.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT EDITOR
// ═══════════════════════════════════════════════════════════════════════════

interface SNDocumentEditorProps {
  documentType: SNDocumentType;
  onClose: () => void;
}

function SNDocumentEditor({ documentType, onClose }: SNDocumentEditorProps) {
  const navigate = useNavigate();
  const docConfig = DOCUMENT_TYPES[documentType];

  // Form state
  const [values, setValues] = useState<Partial<SNFormValues>>({
    documentType,
    documentStatus: 'draft',
    patientId: 'pat-99888',
    patientName: 'Dorothy Williams',
    admissionId: 'adm-55443',
    visitDate: new Date().toISOString().split('T')[0],
    timeIn: '09:00',
    timeOut: '10:30',
    clinicianName: 'Maria Santos',
    clinicianCredentials: 'RN, BSN',
    temperatureUnit: 'F',
    weightUnit: 'lbs',
    hasPain: '',
    hasWound: '',
  });

  const [activeSection, setActiveSection] = useState('visit_information');
  const [showValidation, setShowValidation] = useState(false);

  // Validation
  const validationRules = useMemo(() => createValidationRules(documentType), [documentType]);
  const validator = useMemo(() => new DocumentValidator(validationRules), [validationRules]);
  const [validationResult, setValidationResult] = useState<ValidationResult>(
    validator.validate(values)
  );

  useEffect(() => {
    setValidationResult(validator.validate(values));
  }, [values, validator]);

  // Progress calculation
  const progress = useMemo(() => {
    const totalFields = validationRules.length;
    const completedFields = validationRules.filter(rule => {
      const value = values[rule.fieldId as keyof SNFormValues];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, [values, validationRules]);

  const handleFieldChange = (fieldId: keyof SNFormValues, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    console.log('Saving document...', values);
    alert('Document saved successfully!');
  };

  const handleSubmit = () => {
    if (!validationResult.canSubmit) {
      setShowValidation(true);
      alert(`Cannot submit: ${validationResult.errorCount} validation errors must be fixed.`);
      return;
    }
    console.log('Submitting document...', values);
    alert('Document submitted successfully!');
    navigate(-1);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {docConfig.label}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{values.patientName}</span>
                  <span>•</span>
                  <span>{new Date(values.visitDate || '').toLocaleDateString()}</span>
                  <span>•</span>
                  <DocumentStatusBadge status={values.documentStatus || 'draft'} size="sm" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Documentation Progress</span>
              <span className="font-semibold text-gray-900">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {validationRules.filter(r => {
                  const v = values[r.fieldId as keyof SNFormValues];
                  return v !== undefined && v !== '' && v !== null;
                }).length} of {validationRules.length} fields completed
              </span>
              {validationResult.errorCount > 0 && (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationResult.errorCount} validation {validationResult.errorCount === 1 ? 'error' : 'errors'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sections
            </h3>
            <nav className="space-y-1">
              {docConfig.sections.map(sectionId => {
                const section = SECTION_CONFIGS[sectionId as keyof typeof SECTION_CONFIGS];
                if (!section) return null;

                const sectionErrors = validationResult.errors.filter(
                  e => e.sectionId === sectionId
                ).length;

                return (
                  <button
                    key={sectionId}
                    onClick={() => setActiveSection(sectionId)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                      activeSection === sectionId
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="w-4 h-4" />
                      <span>{section.title}</span>
                    </div>
                    {sectionErrors > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {sectionErrors}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl">
              {docConfig.sections.map(sectionId => {
                if (activeSection !== sectionId) return null;

                const SectionComponent = SECTION_COMPONENTS[sectionId as keyof typeof SECTION_COMPONENTS];
                if (!SectionComponent) return null;

                return (
                  <SectionComponent
                    key={sectionId}
                    values={values}
                    onChange={handleFieldChange}
                    validationResult={validationResult}
                  />
                );
              })}
            </div>
          </ScrollArea>

          {/* Validation Panel */}
          {showValidation && (
            <div className="w-96 border-l bg-white">
              <ValidationPanel
                validationResult={validationResult}
                onNavigateToField={(fieldId, sectionId) => {
                  setActiveSection(sectionId);
                  setTimeout(() => {
                    const element = document.getElementById(fieldId);
                    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element?.focus();
                  }, 100);
                }}
                showWarnings={true}
                compact={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const SECTION_CONFIGS = {
  visit_information: {
    id: 'visit_information',
    title: 'Visit Information',
    icon: Calendar,
    description: 'Basic visit details and timing',
  },
  patient_condition: {
    id: 'patient_condition',
    title: 'Patient Condition',
    icon: Activity,
    description: 'Overall patient assessment',
  },
  vital_signs: {
    id: 'vital_signs',
    title: 'Vital Signs',
    icon: Heart,
    description: 'Vital signs measurements',
  },
  pain_assessment: {
    id: 'pain_assessment',
    title: 'Pain Assessment',
    icon: AlertCircle,
    description: 'Pain evaluation and management',
  },
  medication_review: {
    id: 'medication_review',
    title: 'Medication Review',
    icon: ClipboardList,
    description: 'Medication reconciliation',
  },
  wound_care: {
    id: 'wound_care',
    title: 'Wound Care',
    icon: Activity,
    description: 'Wound assessment and treatment',
  },
  interventions: {
    id: 'interventions',
    title: 'Interventions',
    icon: CheckCircle2,
    description: 'Nursing interventions performed',
  },
  patient_education: {
    id: 'patient_education',
    title: 'Patient Education',
    icon: User,
    description: 'Education provided',
  },
  care_plan: {
    id: 'care_plan',
    title: 'Care Plan Updates',
    icon: TrendingUp,
    description: 'Progress and plan modifications',
  },
  discharge_details: {
    id: 'discharge_details',
    title: 'Discharge Details',
    icon: FileText,
    description: 'Discharge information',
  },
  recertification_details: {
    id: 'recertification_details',
    title: 'Recertification',
    icon: FileText,
    description: 'Recertification assessment',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface SectionProps {
  values: Partial<SNFormValues>;
  onChange: (fieldId: keyof SNFormValues, value: any) => void;
  validationResult: ValidationResult;
}

function VisitInformationSection({ values, onChange, validationResult }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Information</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="visitDate"
          label="Visit Date"
          required
          error={validationResult.errors.find(e => e.fieldId === 'visitDate')}
        >
          <Input
            type="date"
            value={values.visitDate || ''}
            onChange={(e) => onChange('visitDate', e.target.value)}
          />
        </FormField>

        <FormField
          id="visitType"
          label="Visit Type"
          required
          error={validationResult.errors.find(e => e.fieldId === 'visitType')}
        >
          <Select value={values.visitType || ''} onValueChange={(v) => onChange('visitType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="routine">Routine Visit</SelectItem>
              <SelectItem value="admission">Admission Visit</SelectItem>
              <SelectItem value="recertification">Recertification Visit</SelectItem>
              <SelectItem value="discharge">Discharge Visit</SelectItem>
              <SelectItem value="prn">PRN Visit</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="timeIn" label="Time In" required>
          <Input
            type="time"
            value={values.timeIn || ''}
            onChange={(e) => onChange('timeIn', e.target.value)}
          />
        </FormField>

        <FormField id="timeOut" label="Time Out" required>
          <Input
            type="time"
            value={values.timeOut || ''}
            onChange={(e) => onChange('timeOut', e.target.value)}
          />
        </FormField>

        <FormField id="visitNumber" label="Visit Number">
          <Input
            value={values.visitNumber || ''}
            onChange={(e) => onChange('visitNumber', e.target.value)}
            placeholder="e.g., Visit 5 of 20"
          />
        </FormField>

        <FormField id="accompaniedBy" label="Accompanied By">
          <Input
            value={values.accompaniedBy || ''}
            onChange={(e) => onChange('accompaniedBy', e.target.value)}
            placeholder="e.g., Family member, Caregiver"
          />
        </FormField>
      </div>
    </Card>
  );
}

function PatientConditionSection({ values, onChange, validationResult }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Condition</h2>
      
      <div className="space-y-4">
        <FormField id="generalCondition" label="General Condition" required>
          <Select
            value={values.generalCondition || ''}
            onValueChange={(v) => onChange('generalCondition', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stable">Stable</SelectItem>
              <SelectItem value="improved">Improved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="alertOriented" label="Alert & Oriented" required>
          <Select
            value={values.alertOriented || ''}
            onValueChange={(v) => onChange('alertOriented', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a_o_x4">Alert & Oriented x 4</SelectItem>
              <SelectItem value="a_o_x3">Alert & Oriented x 3</SelectItem>
              <SelectItem value="a_o_x2">Alert & Oriented x 2</SelectItem>
              <SelectItem value="a_o_x1">Alert & Oriented x 1</SelectItem>
              <SelectItem value="confused">Confused</SelectItem>
              <SelectItem value="lethargic">Lethargic</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="cardiovascularStatus" label="Cardiovascular">
            <Select
              value={values.cardiovascularStatus || ''}
              onValueChange={(v) => onChange('cardiovascularStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wnl">Within Normal Limits</SelectItem>
                <SelectItem value="irregular">Irregular</SelectItem>
                <SelectItem value="tachycardia">Tachycardia</SelectItem>
                <SelectItem value="bradycardia">Bradycardia</SelectItem>
                <SelectItem value="edema">Edema Present</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="respiratoryStatus" label="Respiratory">
            <Select
              value={values.respiratoryStatus || ''}
              onValueChange={(v) => onChange('respiratoryStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wnl">Within Normal Limits</SelectItem>
                <SelectItem value="sob">Shortness of Breath</SelectItem>
                <SelectItem value="labored">Labored Breathing</SelectItem>
                <SelectItem value="wheezing">Wheezing</SelectItem>
                <SelectItem value="cough">Cough Present</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="gastrointestinalStatus" label="Gastrointestinal">
            <Select
              value={values.gastrointestinalStatus || ''}
              onValueChange={(v) => onChange('gastrointestinalStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wnl">Within Normal Limits</SelectItem>
                <SelectItem value="nausea">Nausea</SelectItem>
                <SelectItem value="vomiting">Vomiting</SelectItem>
                <SelectItem value="constipation">Constipation</SelectItem>
                <SelectItem value="diarrhea">Diarrhea</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="genitourinaryStatus" label="Genitourinary">
            <Select
              value={values.genitourinaryStatus || ''}
              onValueChange={(v) => onChange('genitourinaryStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wnl">Within Normal Limits</SelectItem>
                <SelectItem value="catheter">Catheter in place</SelectItem>
                <SelectItem value="incontinence">Incontinence</SelectItem>
                <SelectItem value="retention">Urinary Retention</SelectItem>
                <SelectItem value="uti_symptoms">UTI Symptoms</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="conditionNarrative" label="Narrative Notes">
          <Textarea
            value={values.conditionNarrative || ''}
            onChange={(e) => onChange('conditionNarrative', e.target.value)}
            rows={4}
            placeholder="Detailed narrative of patient's overall condition..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function VitalSignsSection({ values, onChange, validationResult }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500" />
        Vital Signs
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField id="temperature" label="Temperature" required>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              value={values.temperature || ''}
              onChange={(e) => onChange('temperature', e.target.value)}
              placeholder="98.6"
            />
            <Select
              value={values.temperatureUnit || 'F'}
              onValueChange={(v) => onChange('temperatureUnit', v as 'F' | 'C')}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F">°F</SelectItem>
                <SelectItem value="C">°C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormField>

        <FormField id="pulse" label="Pulse (bpm)" required>
          <Input
            type="number"
            value={values.pulse || ''}
            onChange={(e) => onChange('pulse', e.target.value)}
            placeholder="72"
          />
        </FormField>

        <FormField id="respirations" label="Respirations (per min)" required>
          <Input
            type="number"
            value={values.respirations || ''}
            onChange={(e) => onChange('respirations', e.target.value)}
            placeholder="16"
          />
        </FormField>

        <FormField id="bloodPressure" label="Blood Pressure (mmHg)" required>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={values.bloodPressureSystolic || ''}
              onChange={(e) => onChange('bloodPressureSystolic', e.target.value)}
              placeholder="120"
            />
            <span className="text-gray-500">/</span>
            <Input
              type="number"
              value={values.bloodPressureDiastolic || ''}
              onChange={(e) => onChange('bloodPressureDiastolic', e.target.value)}
              placeholder="80"
            />
          </div>
        </FormField>

        <FormField id="oxygenSaturation" label="O₂ Saturation (%)" required>
          <Input
            type="number"
            value={values.oxygenSaturation || ''}
            onChange={(e) => onChange('oxygenSaturation', e.target.value)}
            placeholder="97"
          />
        </FormField>

        <FormField id="weight" label="Weight">
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.1"
              value={values.weight || ''}
              onChange={(e) => onChange('weight', e.target.value)}
              placeholder="150"
            />
            <Select
              value={values.weightUnit || 'lbs'}
              onValueChange={(v) => onChange('weightUnit', v as 'lbs' | 'kg')}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lbs">lbs</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormField>

        <FormField id="bloodGlucose" label="Blood Glucose (mg/dL)">
          <Input
            type="number"
            value={values.bloodGlucose || ''}
            onChange={(e) => onChange('bloodGlucose', e.target.value)}
            placeholder="110"
          />
        </FormField>
      </div>

      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Critical Values</AlertTitle>
        <AlertDescription>
          Document immediately if vital signs fall outside normal ranges and notify physician per protocol.
        </AlertDescription>
      </Alert>
    </Card>
  );
}

function PainAssessmentSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Pain Assessment</h2>
      
      <div className="space-y-4">
        <FormField id="hasPain" label="Patient Reports Pain" required>
          <RadioGroup
            value={values.hasPain || ''}
            onValueChange={(v) => onChange('hasPain', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="pain-yes" />
                <Label htmlFor="pain-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="pain-no" />
                <Label htmlFor="pain-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        {values.hasPain === 'yes' && (
          <>
            <FormField id="painLocation" label="Pain Location" required>
              <Input
                value={values.painLocation || ''}
                onChange={(e) => onChange('painLocation', e.target.value)}
                placeholder="e.g., Lower back, right knee"
              />
            </FormField>

            <FormField id="painIntensity" label="Pain Intensity (0-10 scale)" required>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={values.painIntensity || ''}
                  onChange={(e) => onChange('painIntensity', e.target.value)}
                  className="w-24"
                />
                <div className="flex-1 flex items-center gap-2 text-sm text-gray-600">
                  <span>0 = No pain</span>
                  <span>•</span>
                  <span>10 = Worst pain</span>
                </div>
              </div>
            </FormField>

            <FormField id="painCharacter" label="Pain Character">
              <Select
                value={values.painCharacter || ''}
                onValueChange={(v) => onChange('painCharacter', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select character" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharp">Sharp</SelectItem>
                  <SelectItem value="dull">Dull</SelectItem>
                  <SelectItem value="aching">Aching</SelectItem>
                  <SelectItem value="burning">Burning</SelectItem>
                  <SelectItem value="stabbing">Stabbing</SelectItem>
                  <SelectItem value="throbbing">Throbbing</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="painFrequency" label="Pain Frequency">
              <Select
                value={values.painFrequency || ''}
                onValueChange={(v) => onChange('painFrequency', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="constant">Constant</SelectItem>
                  <SelectItem value="intermittent">Intermittent</SelectItem>
                  <SelectItem value="occasional">Occasional</SelectItem>
                  <SelectItem value="activity_related">Activity Related</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="painInterventions" label="Pain Interventions">
              <Textarea
                value={values.painInterventions || ''}
                onChange={(e) => onChange('painInterventions', e.target.value)}
                rows={3}
                placeholder="Document pain management interventions provided..."
              />
            </FormField>

            <FormField id="painReassessmentScore" label="Pain Reassessment Score (after intervention)">
              <Input
                type="number"
                min="0"
                max="10"
                value={values.painReassessmentScore || ''}
                onChange={(e) => onChange('painReassessmentScore', e.target.value)}
                className="w-24"
              />
            </FormField>
          </>
        )}
      </div>
    </Card>
  );
}

// Continue with remaining section components...
// Due to length constraints, I'll create the remaining sections in a helper file

const SECTION_COMPONENTS = {
  visit_information: VisitInformationSection,
  patient_condition: PatientConditionSection,
  vital_signs: VitalSignsSection,
  pain_assessment: PainAssessmentSection,
  medication_review: MedicationReviewSection,
  wound_care: WoundCareSection,
  interventions: InterventionsSection,
  patient_education: PatientEducationSection,
  care_plan: CarePlanSection,
  discharge_details: DischargeDetailsSection,
  recertification_details: RecertificationDetailsSection,
};

// Placeholder components for remaining sections
function MedicationReviewSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Medication Review</h2>
      <div className="space-y-4">
        <FormField id="medicationsReviewed" label="Medications Reviewed" required>
          <RadioGroup
            value={values.medicationsReviewed || ''}
            onValueChange={(v) => onChange('medicationsReviewed', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="med-yes" />
                <Label htmlFor="med-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="med-no" />
                <Label htmlFor="med-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        <FormField id="medicationChanges" label="Medication Changes">
          <Textarea
            value={values.medicationChanges || ''}
            onChange={(e) => onChange('medicationChanges', e.target.value)}
            rows={3}
            placeholder="Document any medication changes, additions, or discontinuations..."
          />
        </FormField>

        <FormField id="medicationComplianceIssues" label="Compliance Issues Identified">
          <Textarea
            value={values.medicationComplianceIssues || ''}
            onChange={(e) => onChange('medicationComplianceIssues', e.target.value)}
            rows={3}
            placeholder="Document any medication compliance issues..."
          />
        </FormField>

        <FormField id="medicationEducationProvided" label="Education Provided">
          <Textarea
            value={values.medicationEducationProvided || ''}
            onChange={(e) => onChange('medicationEducationProvided', e.target.value)}
            rows={3}
            placeholder="Document medication education provided to patient/caregiver..."
          />
        </FormField>

        <FormField id="medicationNarrative" label="Additional Notes">
          <Textarea
            value={values.medicationNarrative || ''}
            onChange={(e) => onChange('medicationNarrative', e.target.value)}
            rows={4}
            placeholder="Additional medication-related observations or concerns..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function WoundCareSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Wound Care</h2>
      <div className="space-y-4">
        <FormField id="hasWound" label="Wound Present" required>
          <RadioGroup
            value={values.hasWound || ''}
            onValueChange={(v) => onChange('hasWound', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="wound-yes" />
                <Label htmlFor="wound-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="wound-no" />
                <Label htmlFor="wound-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        {values.hasWound === 'yes' && (
          <>
            <FormField id="woundLocation" label="Wound Location" required>
              <Input
                value={values.woundLocation || ''}
                onChange={(e) => onChange('woundLocation', e.target.value)}
                placeholder="e.g., Right heel, sacrum"
              />
            </FormField>

            <FormField id="woundType" label="Wound Type" required>
              <Select
                value={values.woundType || ''}
                onValueChange={(v) => onChange('woundType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pressure_injury">Pressure Injury/Ulcer</SelectItem>
                  <SelectItem value="surgical">Surgical Wound</SelectItem>
                  <SelectItem value="traumatic">Traumatic Wound</SelectItem>
                  <SelectItem value="venous_stasis">Venous Stasis Ulcer</SelectItem>
                  <SelectItem value="arterial">Arterial Ulcer</SelectItem>
                  <SelectItem value="diabetic">Diabetic Ulcer</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <FormField id="woundSize" label="Size (L x W cm)">
                <Input
                  value={values.woundSize || ''}
                  onChange={(e) => onChange('woundSize', e.target.value)}
                  placeholder="e.g., 2.5 x 1.5"
                />
              </FormField>

              <FormField id="woundDepth" label="Depth (cm)">
                <Input
                  value={values.woundDepth || ''}
                  onChange={(e) => onChange('woundDepth', e.target.value)}
                  placeholder="e.g., 0.5"
                />
              </FormField>

              <FormField id="woundDrainage" label="Drainage">
                <Select
                  value={values.woundDrainage || ''}
                  onValueChange={(v) => onChange('woundDrainage', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="copious">Copious</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField id="woundTreatment" label="Treatment Provided" required>
              <Textarea
                value={values.woundTreatment || ''}
                onChange={(e) => onChange('woundTreatment', e.target.value)}
                rows={4}
                placeholder="Describe wound care treatment provided, dressing changes, etc..."
              />
            </FormField>

            <FormField id="woundPhotosDocumented" label="Photos Documented">
              <RadioGroup
                value={values.woundPhotosDocumented || ''}
                onValueChange={(v) => onChange('woundPhotosDocumented', v)}
              >
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="photos-yes" />
                    <Label htmlFor="photos-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="photos-no" />
                    <Label htmlFor="photos-no">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </FormField>
          </>
        )}
      </div>
    </Card>
  );
}

function InterventionsSection({ values, onChange }: SectionProps) {
  const interventions = [
    { id: 'interventionSkillAssessment', label: 'Skilled Assessment' },
    { id: 'interventionMedManagement', label: 'Medication Management' },
    { id: 'interventionWoundCare', label: 'Wound Care' },
    { id: 'interventionIVTherapy', label: 'IV Therapy' },
    { id: 'interventionCatheterCare', label: 'Catheter Care' },
    { id: 'interventionPatientEducation', label: 'Patient Education' },
    { id: 'interventionCaregiversupport', label: 'Caregiver Support' },
    { id: 'interventionVitalsMonitoring', label: 'Vitals Monitoring' },
    { id: 'interventionOther', label: 'Other' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Interventions Performed</h2>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Select all interventions performed:</Label>
          {interventions.map(intervention => (
            <div key={intervention.id} className="flex items-center space-x-2">
              <Checkbox
                id={intervention.id}
                checked={values[intervention.id as keyof SNFormValues] as boolean || false}
                onCheckedChange={(checked) => onChange(intervention.id as keyof SNFormValues, checked)}
              />
              <label
                htmlFor={intervention.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {intervention.label}
              </label>
            </div>
          ))}
        </div>

        {values.interventionOther && (
          <FormField id="interventionOtherDescription" label="Other Intervention Description">
            <Input
              value={values.interventionOtherDescription || ''}
              onChange={(e) => onChange('interventionOtherDescription', e.target.value)}
              placeholder="Describe other intervention..."
            />
          </FormField>
        )}

        <FormField id="interventionsNarrative" label="Detailed Narrative" required>
          <Textarea
            value={values.interventionsNarrative || ''}
            onChange={(e) => onChange('interventionsNarrative', e.target.value)}
            rows={6}
            placeholder="Provide detailed description of all interventions performed, patient response, and outcomes..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function PatientEducationSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Education</h2>
      
      <div className="space-y-4">
        <FormField id="patientUnderstanding" label="Patient Understanding" required>
          <Select
            value={values.patientUnderstanding || ''}
            onValueChange={(v) => onChange('patientUnderstanding', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent - Able to teach back</SelectItem>
              <SelectItem value="good">Good - Understands most concepts</SelectItem>
              <SelectItem value="fair">Fair - Needs reinforcement</SelectItem>
              <SelectItem value="poor">Poor - Significant barriers</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="educationBarriers" label="Learning Barriers">
          <Textarea
            value={values.educationBarriers || ''}
            onChange={(e) => onChange('educationBarriers', e.target.value)}
            rows={3}
            placeholder="Document any barriers to learning (cognitive, language, vision, etc)..."
          />
        </FormField>

        <FormField id="educationNarrative" label="Education Provided" required>
          <Textarea
            value={values.educationNarrative || ''}
            onChange={(e) => onChange('educationNarrative', e.target.value)}
            rows={6}
            placeholder="Document all education topics covered, methods used, and patient/caregiver response..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function CarePlanSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Care Plan Updates</h2>
      
      <div className="space-y-4">
        <FormField id="progressTowardGoals" label="Progress Toward Goals" required>
          <Textarea
            value={values.progressTowardGoals || ''}
            onChange={(e) => onChange('progressTowardGoals', e.target.value)}
            rows={4}
            placeholder="Document patient's progress toward established care plan goals..."
          />
        </FormField>

        <FormField id="needsIdentified" label="New Needs Identified">
          <Textarea
            value={values.needsIdentified || ''}
            onChange={(e) => onChange('needsIdentified', e.target.value)}
            rows={3}
            placeholder="Document any new patient needs or concerns identified..."
          />
        </FormField>

        <FormField id="planModifications" label="Care Plan Modifications">
          <Textarea
            value={values.planModifications || ''}
            onChange={(e) => onChange('planModifications', e.target.value)}
            rows={3}
            placeholder="Document any modifications to the care plan..."
          />
        </FormField>

        <FormField id="nextVisitPlan" label="Plan for Next Visit" required>
          <Textarea
            value={values.nextVisitPlan || ''}
            onChange={(e) => onChange('nextVisitPlan', e.target.value)}
            rows={3}
            placeholder="Document planned interventions for next visit..."
          />
        </FormField>

        <FormField id="carePlanNarrative" label="Additional Notes">
          <Textarea
            value={values.carePlanNarrative || ''}
            onChange={(e) => onChange('carePlanNarrative', e.target.value)}
            rows={4}
            placeholder="Additional care plan notes..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function DischargeDetailsSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Discharge Details</h2>
      
      <div className="space-y-4">
        <FormField id="dischargeReason" label="Discharge Reason" required>
          <Select
            value={values.dischargeReason || ''}
            onValueChange={(v) => onChange('dischargeReason', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goals_met">Goals Met</SelectItem>
              <SelectItem value="patient_declined">Patient Declined Services</SelectItem>
              <SelectItem value="hospitalized">Transferred to Hospital</SelectItem>
              <SelectItem value="expired">Patient Expired</SelectItem>
              <SelectItem value="moved">Moved Out of Service Area</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="dischargeDisposition" label="Discharge Disposition" required>
          <Select
            value={values.dischargeDisposition || ''}
            onValueChange={(v) => onChange('dischargeDisposition', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select disposition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Remains at Home</SelectItem>
              <SelectItem value="assisted_living">Assisted Living</SelectItem>
              <SelectItem value="nursing_home">Nursing Home</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="goalsMet" label="Goals Met" required>
          <Textarea
            value={values.goalsMet || ''}
            onChange={(e) => onChange('goalsMet', e.target.value)}
            rows={4}
            placeholder="Document which goals were met and patient outcomes..."
          />
        </FormField>

        <FormField id="dischargeInstructions" label="Discharge Instructions" required>
          <Textarea
            value={values.dischargeInstructions || ''}
            onChange={(e) => onChange('dischargeInstructions', e.target.value)}
            rows={4}
            placeholder="Document instructions provided to patient/caregiver..."
          />
        </FormField>

        <FormField id="followUpArrangements" label="Follow-Up Arrangements">
          <Textarea
            value={values.followUpArrangements || ''}
            onChange={(e) => onChange('followUpArrangements', e.target.value)}
            rows={3}
            placeholder="Document any follow-up appointments or services arranged..."
          />
        </FormField>

        <FormField id="dischargeNarrative" label="Additional Notes">
          <Textarea
            value={values.dischargeNarrative || ''}
            onChange={(e) => onChange('dischargeNarrative', e.target.value)}
            rows={4}
            placeholder="Additional discharge notes..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function RecertificationDetailsSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recertification Assessment</h2>
      
      <div className="space-y-4">
        <FormField id="certificationPeriod" label="Certification Period" required>
          <Input
            value={values.certificationPeriod || ''}
            onChange={(e) => onChange('certificationPeriod', e.target.value)}
            placeholder="e.g., 03/01/2026 - 04/29/2026"
          />
        </FormField>

        <FormField id="continuedNeed" label="Continued Need for Services" required>
          <Textarea
            value={values.continuedNeed || ''}
            onChange={(e) => onChange('continuedNeed', e.target.value)}
            rows={6}
            placeholder="Document medical necessity and rationale for continued skilled nursing services..."
          />
        </FormField>

        <FormField id="functionalStatus" label="Functional Status Assessment" required>
          <Textarea
            value={values.functionalStatus || ''}
            onChange={(e) => onChange('functionalStatus', e.target.value)}
            rows={4}
            placeholder="Document current functional status and any changes since SOC..."
          />
        </FormField>

        <FormField id="recertificationNarrative" label="Additional Assessment">
          <Textarea
            value={values.recertificationNarrative || ''}
            onChange={(e) => onChange('recertificationNarrative', e.target.value)}
            rows={4}
            placeholder="Additional recertification assessment notes..."
          />
        </FormField>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FORM FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: any;
  children: React.ReactNode;
}

function FormField({ id, label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div id={id}>{children}</div>
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

function createValidationRules(documentType: SNDocumentType): FieldValidationRule[] {
  const commonRules: FieldValidationRule[] = [
    {
      fieldId: 'visitDate',
      fieldLabel: 'Visit Date',
      sectionId: 'visit_information',
      sectionTitle: 'Visit Information',
      required: true,
    },
    {
      fieldId: 'visitType',
      fieldLabel: 'Visit Type',
      sectionId: 'visit_information',
      sectionTitle: 'Visit Information',
      required: true,
    },
    {
      fieldId: 'timeIn',
      fieldLabel: 'Time In',
      sectionId: 'visit_information',
      sectionTitle: 'Visit Information',
      required: true,
    },
    {
      fieldId: 'timeOut',
      fieldLabel: 'Time Out',
      sectionId: 'visit_information',
      sectionTitle: 'Visit Information',
      required: true,
    },
    {
      fieldId: 'generalCondition',
      fieldLabel: 'General Condition',
      sectionId: 'patient_condition',
      sectionTitle: 'Patient Condition',
      required: true,
    },
    {
      fieldId: 'alertOriented',
      fieldLabel: 'Alert & Oriented',
      sectionId: 'patient_condition',
      sectionTitle: 'Patient Condition',
      required: true,
    },
    {
      fieldId: 'temperature',
      fieldLabel: 'Temperature',
      sectionId: 'vital_signs',
      sectionTitle: 'Vital Signs',
      required: true,
    },
    {
      fieldId: 'pulse',
      fieldLabel: 'Pulse',
      sectionId: 'vital_signs',
      sectionTitle: 'Vital Signs',
      required: true,
      min: 30,
      max: 250,
    },
    {
      fieldId: 'respirations',
      fieldLabel: 'Respirations',
      sectionId: 'vital_signs',
      sectionTitle: 'Vital Signs',
      required: true,
      min: 8,
      max: 60,
    },
    {
      fieldId: 'bloodPressureSystolic',
      fieldLabel: 'Blood Pressure Systolic',
      sectionId: 'vital_signs',
      sectionTitle: 'Vital Signs',
      required: true,
      min: 70,
      max: 250,
    },
    {
      fieldId: 'bloodPressureDiastolic',
      fieldLabel: 'Blood Pressure Diastolic',
      sectionId: 'vital_signs',
      sectionTitle: 'Vital Signs',
      required: true,
      min: 40,
      max: 150,
    },
    {
      fieldId: 'oxygenSaturation',
      fieldLabel: 'Oxygen Saturation',
      sectionId: 'vital_signs',
      sectionTitle: 'Vital Signs',
      required: true,
      min: 70,
      max: 100,
    },
  ];

  // Add document-specific rules
  if (documentType === 'sn_visit_note') {
    commonRules.push(
      {
        fieldId: 'hasPain',
        fieldLabel: 'Pain Assessment',
        sectionId: 'pain_assessment',
        sectionTitle: 'Pain Assessment',
        required: true,
      },
      {
        fieldId: 'medicationsReviewed',
        fieldLabel: 'Medications Reviewed',
        sectionId: 'medication_review',
        sectionTitle: 'Medication Review',
        required: true,
      },
      {
        fieldId: 'hasWound',
        fieldLabel: 'Wound Present',
        sectionId: 'wound_care',
        sectionTitle: 'Wound Care',
        required: true,
      },
      {
        fieldId: 'interventionsNarrative',
        fieldLabel: 'Interventions Narrative',
        sectionId: 'interventions',
        sectionTitle: 'Interventions',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'educationNarrative',
        fieldLabel: 'Education Provided',
        sectionId: 'patient_education',
        sectionTitle: 'Patient Education',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'progressTowardGoals',
        fieldLabel: 'Progress Toward Goals',
        sectionId: 'care_plan',
        sectionTitle: 'Care Plan Updates',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'nextVisitPlan',
        fieldLabel: 'Plan for Next Visit',
        sectionId: 'care_plan',
        sectionTitle: 'Care Plan Updates',
        required: true,
        minLength: 10,
      }
    );
  }

  return commonRules;
}
