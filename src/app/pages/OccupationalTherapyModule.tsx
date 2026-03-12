/**
 * Occupational Therapy (OT) Clinical Documentation Module
 * 
 * Comprehensive documentation system for occupational therapy services
 * Supports 4 document types with OT-specific assessments and interventions
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
  Hand,
  Brain,
  Home,
  Target,
  TrendingUp,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Heart,
  Lightbulb,
  Users,
  ShoppingBag,
  Utensils,
  Shirt,
  Droplet,
  Scale,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type OTDocumentType = 
  | 'ot_evaluation'
  | 'ot_visit_note'
  | 'ot_progress_note'
  | 'ot_discharge_summary';

interface OTFormValues {
  // Document metadata
  documentType: OTDocumentType;
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

  // Functional Assessment
  priorFunctionalLevel: string;
  currentFunctionalLevel: string;
  functionalLimitations: string;
  safetyAwareness: string;
  homeEnvironment: string;
  functionalNarrative: string;

  // Activities of Daily Living (ADLs)
  adlBathing: string;
  adlDressing: string;
  adlGrooming: string;
  adlToileting: string;
  adlFeeding: string;
  adlTransfers: string;
  adlMobility: string;
  adlAssistanceLevel: string;
  adlNarrative: string;

  // Instrumental ADLs (IADLs)
  iadlMealPrep: string;
  iadlHousework: string;
  iadlLaundry: string;
  iadlShopping: string;
  iadlMedManagement: string;
  iadlFinancialManagement: string;
  iadlPhone: string;
  iadlTransportation: string;
  iadlNarrative: string;

  // Upper Extremity Function
  ueRightShoulderROM: string;
  ueRightElbowROM: string;
  ueRightWristROM: string;
  ueRightHandROM: string;
  ueLeftShoulderROM: string;
  ueLeftElbowROM: string;
  ueLeftWristROM: string;
  ueLeftHandROM: string;
  ueRightStrength: string;
  ueLeftStrength: string;
  ueCoordination: string;
  ueFineMotorSkills: string;
  ueGripStrength: string;
  uePinchStrength: string;
  ueSensation: string;
  ueEdema: string;
  ueNarrative: string;

  // Cognitive Status
  cognitionOrientation: string;
  cognitionMemory: string;
  cognitionAttention: string;
  cognitionProblemSolving: string;
  cognitionSequencing: string;
  cognitionSafetyJudgment: string;
  cognitionImpairments: string;
  cognitionNarrative: string;

  // Therapy Goals
  goal1Description: string;
  goal1TargetDate: string;
  goal1Status: string;
  goal2Description: string;
  goal2TargetDate: string;
  goal2Status: string;
  goal3Description: string;
  goal3TargetDate: string;
  goal3Status: string;
  goalsNarrative: string;

  // Interventions (for Visit Note)
  interventionTherapeuticExercise: boolean;
  interventionTherapeuticActivities: boolean;
  interventionADLTraining: boolean;
  interventionFineMotorTraining: boolean;
  interventionCognitiveRetraining: boolean;
  interventionAdaptiveEquipment: boolean;
  interventionHomeAssessment: boolean;
  interventionCaregiverTraining: boolean;
  interventionEnergyConservation: boolean;
  interventionJointProtection: boolean;
  interventionOther: boolean;
  interventionOtherDescription: string;
  interventionsNarrative: string;

  // Patient Response
  patientTolerance: string;
  patientEngagement: string;
  patientUnderstanding: string;
  patientBarriers: string;
  responseNarrative: string;

  // Progress Tracking
  progressTowardGoals: string;
  functionalGains: string;
  regressionConcerns: string;
  planModifications: string;
  nextSessionPlan: string;
  progressNarrative: string;

  // Adaptive Equipment
  equipmentRecommended: string;
  equipmentProvided: string;
  equipmentTraining: string;
  equipmentNarrative: string;

  // Home Safety
  homeSafetyAssessed: string;
  homeSafetyConcerns: string;
  homeSafetyRecommendations: string;
  fallRiskAssessment: string;

  // Caregiver Education
  caregiverPresent: string;
  caregiverEducationTopics: string;
  caregiverUnderstanding: string;
  caregiverNarrative: string;

  // Discharge (for discharge summary)
  dischargeReason: string;
  dischargeDisposition: string;
  goalsMet: string;
  functionalOutcomes: string;
  dischargeRecommendations: string;
  dischargeNarrative: string;

  // Progress Note Specific
  progressNotePeriod: string;
  progressNoteFrequency: string;
  progressNoteCompliance: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT TYPE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const DOCUMENT_TYPES = {
  ot_evaluation: {
    id: 'ot_evaluation',
    label: 'OT Evaluation',
    description: 'Comprehensive initial occupational therapy evaluation',
    icon: ClipboardList,
    sections: [
      'visit_information',
      'functional_assessment',
      'activities_daily_living',
      'instrumental_adls',
      'upper_extremity',
      'cognitive_status',
      'home_safety',
      'adaptive_equipment',
      'therapy_goals',
    ],
  },
  ot_visit_note: {
    id: 'ot_visit_note',
    label: 'OT Visit Note',
    description: 'Standard occupational therapy visit documentation',
    icon: FileText,
    sections: [
      'visit_information',
      'interventions',
      'patient_response',
      'progress_tracking',
      'plan_updates',
    ],
  },
  ot_progress_note: {
    id: 'ot_progress_note',
    label: 'OT Progress Note',
    description: 'Periodic progress assessment and goal review',
    icon: TrendingUp,
    sections: [
      'visit_information',
      'progress_note_details',
      'functional_assessment',
      'activities_daily_living',
      'upper_extremity',
      'therapy_goals',
      'plan_updates',
    ],
  },
  ot_discharge_summary: {
    id: 'ot_discharge_summary',
    label: 'OT Discharge Summary',
    description: 'Final occupational therapy discharge summary',
    icon: CheckCircle2,
    sections: [
      'visit_information',
      'functional_assessment',
      'activities_daily_living',
      'therapy_goals',
      'discharge_details',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function OccupationalTherapyModule() {
  const navigate = useNavigate();
  const [selectedDocType, setSelectedDocType] = useState<OTDocumentType | null>(null);
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
    <OTDocumentEditor
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
  onSelect: (type: OTDocumentType) => void;
  onCancel: () => void;
}

function DocumentTypeSelector({ onSelect, onCancel }: DocumentTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Card className="max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hand className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Occupational Therapy Documentation
          </h1>
          <p className="text-gray-600">
            Select the type of OT document you want to create
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(DOCUMENT_TYPES).map(docType => {
            const Icon = docType.icon;
            return (
              <button
                key={docType.id}
                onClick={() => onSelect(docType.id as OTDocumentType)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-pink-600" />
                  <Badge variant="outline" className="text-xs">
                    {docType.sections.length} sections
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{docType.label}</h3>
                <p className="text-sm text-gray-600">{docType.description}</p>
              </button>
            );
          })}
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

interface OTDocumentEditorProps {
  documentType: OTDocumentType;
  onClose: () => void;
}

function OTDocumentEditor({ documentType, onClose }: OTDocumentEditorProps) {
  const navigate = useNavigate();
  const docConfig = DOCUMENT_TYPES[documentType];

  // Form state
  const [values, setValues] = useState<Partial<OTFormValues>>({
    documentType,
    documentStatus: 'draft',
    patientId: 'pat-99888',
    patientName: 'Dorothy Williams',
    admissionId: 'adm-55443',
    visitDate: new Date().toISOString().split('T')[0],
    timeIn: '10:00',
    timeOut: '11:00',
    clinicianName: 'Sarah Johnson',
    clinicianCredentials: 'OT, MOT',
  });

  const [activeSection, setActiveSection] = useState(docConfig.sections[0]);
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
      const value = values[rule.fieldId as keyof OTFormValues];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, [values, validationRules]);

  const handleFieldChange = (fieldId: keyof OTFormValues, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    console.log('Saving OT document...', values);
    alert('OT document saved successfully!');
  };

  const handleSubmit = () => {
    if (!validationResult.canSubmit) {
      setShowValidation(true);
      alert(`Cannot submit: ${validationResult.errorCount} validation errors must be fixed.`);
      return;
    }
    console.log('Submitting OT document...', values);
    alert('OT document submitted successfully!');
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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">
                    {docConfig.label}
                  </h1>
                  <Badge className="bg-pink-100 text-pink-700 border-pink-300">
                    OT
                  </Badge>
                </div>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowValidation(!showValidation)}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {validationResult.errorCount > 0 ? (
                  <span className="text-red-600">{validationResult.errorCount} Errors</span>
                ) : (
                  'Validation'
                )}
              </Button>
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
                  const v = values[r.fieldId as keyof OTFormValues];
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
                        ? 'bg-pink-50 text-pink-700 font-medium'
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
  },
  functional_assessment: {
    id: 'functional_assessment',
    title: 'Functional Assessment',
    icon: Activity,
  },
  activities_daily_living: {
    id: 'activities_daily_living',
    title: 'Activities of Daily Living',
    icon: Home,
  },
  instrumental_adls: {
    id: 'instrumental_adls',
    title: 'Instrumental ADLs',
    icon: ShoppingBag,
  },
  upper_extremity: {
    id: 'upper_extremity',
    title: 'Upper Extremity Function',
    icon: Hand,
  },
  cognitive_status: {
    id: 'cognitive_status',
    title: 'Cognitive Status',
    icon: Brain,
  },
  home_safety: {
    id: 'home_safety',
    title: 'Home Safety',
    icon: Home,
  },
  adaptive_equipment: {
    id: 'adaptive_equipment',
    title: 'Adaptive Equipment',
    icon: Lightbulb,
  },
  therapy_goals: {
    id: 'therapy_goals',
    title: 'Therapy Goals',
    icon: Target,
  },
  interventions: {
    id: 'interventions',
    title: 'Interventions Performed',
    icon: CheckCircle2,
  },
  patient_response: {
    id: 'patient_response',
    title: 'Patient Response',
    icon: User,
  },
  progress_tracking: {
    id: 'progress_tracking',
    title: 'Progress Tracking',
    icon: TrendingUp,
  },
  plan_updates: {
    id: 'plan_updates',
    title: 'Plan Updates',
    icon: FileText,
  },
  discharge_details: {
    id: 'discharge_details',
    title: 'Discharge Details',
    icon: CheckCircle2,
  },
  progress_note_details: {
    id: 'progress_note_details',
    title: 'Progress Note Details',
    icon: TrendingUp,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface SectionProps {
  values: Partial<OTFormValues>;
  onChange: (fieldId: keyof OTFormValues, value: any) => void;
  validationResult: ValidationResult;
}

function VisitInformationSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-pink-600" />
        Visit Information
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField id="visitDate" label="Visit Date" required>
          <Input
            type="date"
            value={values.visitDate || ''}
            onChange={(e) => onChange('visitDate', e.target.value)}
          />
        </FormField>

        <FormField id="visitType" label="Visit Type" required>
          <Select value={values.visitType || ''} onValueChange={(v) => onChange('visitType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="evaluation">Initial Evaluation</SelectItem>
              <SelectItem value="routine">Routine Visit</SelectItem>
              <SelectItem value="progress">Progress Note Visit</SelectItem>
              <SelectItem value="discharge">Discharge Visit</SelectItem>
              <SelectItem value="reassessment">Reassessment</SelectItem>
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
            placeholder="e.g., Visit 3 of 12"
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

function FunctionalAssessmentSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-pink-600" />
        Functional Assessment
      </h2>
      
      <div className="space-y-4">
        <FormField id="priorFunctionalLevel" label="Prior Level of Function" required>
          <Select
            value={values.priorFunctionalLevel || ''}
            onValueChange={(v) => onChange('priorFunctionalLevel', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="independent">Independent - All ADLs</SelectItem>
              <SelectItem value="modified_independent">Modified Independent - Uses devices</SelectItem>
              <SelectItem value="supervision">Supervision Required</SelectItem>
              <SelectItem value="minimal_assist">Minimal Assistance (25%)</SelectItem>
              <SelectItem value="moderate_assist">Moderate Assistance (50%)</SelectItem>
              <SelectItem value="maximal_assist">Maximal Assistance (75%)</SelectItem>
              <SelectItem value="total_assist">Total Assistance</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="currentFunctionalLevel" label="Current Level of Function" required>
          <Select
            value={values.currentFunctionalLevel || ''}
            onValueChange={(v) => onChange('currentFunctionalLevel', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="independent">Independent - All ADLs</SelectItem>
              <SelectItem value="modified_independent">Modified Independent - Uses devices</SelectItem>
              <SelectItem value="supervision">Supervision Required</SelectItem>
              <SelectItem value="minimal_assist">Minimal Assistance (25%)</SelectItem>
              <SelectItem value="moderate_assist">Moderate Assistance (50%)</SelectItem>
              <SelectItem value="maximal_assist">Maximal Assistance (75%)</SelectItem>
              <SelectItem value="total_assist">Total Assistance</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="functionalLimitations" label="Functional Limitations" required>
          <Textarea
            value={values.functionalLimitations || ''}
            onChange={(e) => onChange('functionalLimitations', e.target.value)}
            rows={4}
            placeholder="Describe specific functional limitations affecting daily activities..."
          />
        </FormField>

        <FormField id="safetyAwareness" label="Safety Awareness">
          <Select
            value={values.safetyAwareness || ''}
            onValueChange={(v) => onChange('safetyAwareness', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent - Fully aware of limitations</SelectItem>
              <SelectItem value="good">Good - Generally safe</SelectItem>
              <SelectItem value="fair">Fair - Some safety concerns</SelectItem>
              <SelectItem value="poor">Poor - Significant safety concerns</SelectItem>
              <SelectItem value="impaired">Impaired - Lacks safety awareness</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="homeEnvironment" label="Home Environment Assessment">
          <Textarea
            value={values.homeEnvironment || ''}
            onChange={(e) => onChange('homeEnvironment', e.target.value)}
            rows={3}
            placeholder="Describe home environment, accessibility, barriers, etc..."
          />
        </FormField>

        <FormField id="functionalNarrative" label="Additional Assessment Notes">
          <Textarea
            value={values.functionalNarrative || ''}
            onChange={(e) => onChange('functionalNarrative', e.target.value)}
            rows={4}
            placeholder="Additional functional assessment observations..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function ActivitiesOfDailyLivingSection({ values, onChange }: SectionProps) {
  const adlOptions = [
    { value: 'independent', label: 'Independent' },
    { value: 'modified_independent', label: 'Modified Independent' },
    { value: 'supervision', label: 'Supervision' },
    { value: 'minimal_assist', label: 'Minimal Assist (25%)' },
    { value: 'moderate_assist', label: 'Moderate Assist (50%)' },
    { value: 'maximal_assist', label: 'Maximal Assist (75%)' },
    { value: 'total_assist', label: 'Total Assist' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Home className="w-5 h-5 text-pink-600" />
        Activities of Daily Living (ADLs)
      </h2>
      
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Assessment Scale</AlertTitle>
        <AlertDescription className="text-xs">
          Independent (100%) | Modified Independent (device) | Supervision | Minimal (25%) | Moderate (50%) | Maximal (75%) | Total Assist
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="adlBathing" label="Bathing" required>
            <Select
              value={values.adlBathing || ''}
              onValueChange={(v) => onChange('adlBathing', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {adlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adlDressing" label="Dressing" required>
            <Select
              value={values.adlDressing || ''}
              onValueChange={(v) => onChange('adlDressing', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {adlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adlGrooming" label="Grooming" required>
            <Select
              value={values.adlGrooming || ''}
              onValueChange={(v) => onChange('adlGrooming', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {adlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adlToileting" label="Toileting" required>
            <Select
              value={values.adlToileting || ''}
              onValueChange={(v) => onChange('adlToileting', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {adlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adlFeeding" label="Feeding" required>
            <Select
              value={values.adlFeeding || ''}
              onValueChange={(v) => onChange('adlFeeding', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {adlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adlTransfers" label="Transfers" required>
            <Select
              value={values.adlTransfers || ''}
              onValueChange={(v) => onChange('adlTransfers', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {adlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adlMobility" label="Functional Mobility">
            <Select
              value={values.adlMobility || ''}
              onValueChange={(v) => onChange('adlMobility', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {adlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adlAssistanceLevel" label="Overall Assistance Level">
            <Select
              value={values.adlAssistanceLevel || ''}
              onValueChange={(v) => onChange('adlAssistanceLevel', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {adlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="adlNarrative" label="ADL Narrative Assessment" required>
          <Textarea
            value={values.adlNarrative || ''}
            onChange={(e) => onChange('adlNarrative', e.target.value)}
            rows={5}
            placeholder="Provide detailed narrative of ADL performance, specific deficits, compensatory strategies used, and caregiver assistance required..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function InstrumentalADLsSection({ values, onChange }: SectionProps) {
  const iadlOptions = [
    { value: 'independent', label: 'Independent' },
    { value: 'modified_independent', label: 'Modified Independent' },
    { value: 'supervision', label: 'Supervision' },
    { value: 'minimal_assist', label: 'Minimal Assist' },
    { value: 'moderate_assist', label: 'Moderate Assist' },
    { value: 'maximal_assist', label: 'Maximal Assist' },
    { value: 'unable', label: 'Unable' },
    { value: 'not_assessed', label: 'Not Assessed' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-pink-600" />
        Instrumental Activities of Daily Living (IADLs)
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="iadlMealPrep" label="Meal Preparation">
            <Select
              value={values.iadlMealPrep || ''}
              onValueChange={(v) => onChange('iadlMealPrep', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {iadlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="iadlHousework" label="Housework/Light Cleaning">
            <Select
              value={values.iadlHousework || ''}
              onValueChange={(v) => onChange('iadlHousework', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {iadlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="iadlLaundry" label="Laundry">
            <Select
              value={values.iadlLaundry || ''}
              onValueChange={(v) => onChange('iadlLaundry', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {iadlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="iadlShopping" label="Shopping">
            <Select
              value={values.iadlShopping || ''}
              onValueChange={(v) => onChange('iadlShopping', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {iadlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="iadlMedManagement" label="Medication Management" required>
            <Select
              value={values.iadlMedManagement || ''}
              onValueChange={(v) => onChange('iadlMedManagement', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {iadlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="iadlFinancialManagement" label="Financial Management">
            <Select
              value={values.iadlFinancialManagement || ''}
              onValueChange={(v) => onChange('iadlFinancialManagement', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {iadlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="iadlPhone" label="Telephone Use">
            <Select
              value={values.iadlPhone || ''}
              onValueChange={(v) => onChange('iadlPhone', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {iadlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="iadlTransportation" label="Transportation">
            <Select
              value={values.iadlTransportation || ''}
              onValueChange={(v) => onChange('iadlTransportation', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {iadlOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="iadlNarrative" label="IADL Narrative Assessment">
          <Textarea
            value={values.iadlNarrative || ''}
            onChange={(e) => onChange('iadlNarrative', e.target.value)}
            rows={4}
            placeholder="Describe IADL performance, barriers to independence, and impact on daily function..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function UpperExtremitySection({ values, onChange }: SectionProps) {
  const romOptions = [
    { value: 'wfl', label: 'Within Functional Limits' },
    { value: 'mild', label: 'Mild Limitation' },
    { value: 'moderate', label: 'Moderate Limitation' },
    { value: 'severe', label: 'Severe Limitation' },
  ];

  const strengthOptions = [
    { value: '5/5', label: '5/5 - Normal' },
    { value: '4/5', label: '4/5 - Good' },
    { value: '3/5', label: '3/5 - Fair' },
    { value: '2/5', label: '2/5 - Poor' },
    { value: '1/5', label: '1/5 - Trace' },
    { value: '0/5', label: '0/5 - None' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Hand className="w-5 h-5 text-pink-600" />
        Upper Extremity Function
      </h2>
      
      <div className="space-y-6">
        {/* Range of Motion */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Range of Motion (ROM)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Right Upper Extremity</h4>
              <FormField id="ueRightShoulderROM" label="Shoulder">
                <Select
                  value={values.ueRightShoulderROM || ''}
                  onValueChange={(v) => onChange('ueRightShoulderROM', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {romOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="ueRightElbowROM" label="Elbow">
                <Select
                  value={values.ueRightElbowROM || ''}
                  onValueChange={(v) => onChange('ueRightElbowROM', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {romOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="ueRightWristROM" label="Wrist">
                <Select
                  value={values.ueRightWristROM || ''}
                  onValueChange={(v) => onChange('ueRightWristROM', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {romOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="ueRightHandROM" label="Hand/Fingers">
                <Select
                  value={values.ueRightHandROM || ''}
                  onValueChange={(v) => onChange('ueRightHandROM', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {romOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Left Upper Extremity</h4>
              <FormField id="ueLeftShoulderROM" label="Shoulder">
                <Select
                  value={values.ueLeftShoulderROM || ''}
                  onValueChange={(v) => onChange('ueLeftShoulderROM', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {romOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="ueLeftElbowROM" label="Elbow">
                <Select
                  value={values.ueLeftElbowROM || ''}
                  onValueChange={(v) => onChange('ueLeftElbowROM', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {romOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="ueLeftWristROM" label="Wrist">
                <Select
                  value={values.ueLeftWristROM || ''}
                  onValueChange={(v) => onChange('ueLeftWristROM', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {romOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="ueLeftHandROM" label="Hand/Fingers">
                <Select
                  value={values.ueLeftHandROM || ''}
                  onValueChange={(v) => onChange('ueLeftHandROM', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {romOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        </div>

        {/* Strength */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Muscle Strength (Manual Muscle Testing)</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField id="ueRightStrength" label="Right UE Overall Strength" required>
              <Select
                value={values.ueRightStrength || ''}
                onValueChange={(v) => onChange('ueRightStrength', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select strength" />
                </SelectTrigger>
                <SelectContent>
                  {strengthOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="ueLeftStrength" label="Left UE Overall Strength" required>
              <Select
                value={values.ueLeftStrength || ''}
                onValueChange={(v) => onChange('ueLeftStrength', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select strength" />
                </SelectTrigger>
                <SelectContent>
                  {strengthOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>

        {/* Coordination & Fine Motor */}
        <div className="grid grid-cols-2 gap-4">
          <FormField id="ueCoordination" label="Coordination" required>
            <Select
              value={values.ueCoordination || ''}
              onValueChange={(v) => onChange('ueCoordination', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="mildly_impaired">Mildly Impaired</SelectItem>
                <SelectItem value="moderately_impaired">Moderately Impaired</SelectItem>
                <SelectItem value="severely_impaired">Severely Impaired</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="ueFineMotorSkills" label="Fine Motor Skills" required>
            <Select
              value={values.ueFineMotorSkills || ''}
              onValueChange={(v) => onChange('ueFineMotorSkills', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="mildly_impaired">Mildly Impaired</SelectItem>
                <SelectItem value="moderately_impaired">Moderately Impaired</SelectItem>
                <SelectItem value="severely_impaired">Severely Impaired</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="ueGripStrength" label="Grip Strength">
            <Input
              value={values.ueGripStrength || ''}
              onChange={(e) => onChange('ueGripStrength', e.target.value)}
              placeholder="e.g., R: 15 lbs, L: 20 lbs"
            />
          </FormField>

          <FormField id="uePinchStrength" label="Pinch Strength">
            <Input
              value={values.uePinchStrength || ''}
              onChange={(e) => onChange('uePinchStrength', e.target.value)}
              placeholder="e.g., R: 5 lbs, L: 7 lbs"
            />
          </FormField>

          <FormField id="ueSensation" label="Sensation">
            <Select
              value={values.ueSensation || ''}
              onValueChange={(v) => onChange('ueSensation', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="diminished">Diminished</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="hyperesthetic">Hyperesthetic</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="ueEdema" label="Edema">
            <Select
              value={values.ueEdema || ''}
              onValueChange={(v) => onChange('ueEdema', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="mild">Mild (1+)</SelectItem>
                <SelectItem value="moderate">Moderate (2+)</SelectItem>
                <SelectItem value="severe">Severe (3+)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="ueNarrative" label="Upper Extremity Narrative Assessment" required>
          <Textarea
            value={values.ueNarrative || ''}
            onChange={(e) => onChange('ueNarrative', e.target.value)}
            rows={5}
            placeholder="Provide detailed narrative of upper extremity function, specific impairments, functional impact, and relationship to ADL performance..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function CognitiveStatusSection({ values, onChange }: SectionProps) {
  const cogOptions = [
    { value: 'intact', label: 'Intact' },
    { value: 'mildly_impaired', label: 'Mildly Impaired' },
    { value: 'moderately_impaired', label: 'Moderately Impaired' },
    { value: 'severely_impaired', label: 'Severely Impaired' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-pink-600" />
        Cognitive Status
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="cognitionOrientation" label="Orientation" required>
            <Select
              value={values.cognitionOrientation || ''}
              onValueChange={(v) => onChange('cognitionOrientation', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oriented_x4">Oriented x 4</SelectItem>
                <SelectItem value="oriented_x3">Oriented x 3</SelectItem>
                <SelectItem value="oriented_x2">Oriented x 2</SelectItem>
                <SelectItem value="oriented_x1">Oriented x 1</SelectItem>
                <SelectItem value="disoriented">Disoriented</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="cognitionMemory" label="Memory" required>
            <Select
              value={values.cognitionMemory || ''}
              onValueChange={(v) => onChange('cognitionMemory', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {cogOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="cognitionAttention" label="Attention/Concentration" required>
            <Select
              value={values.cognitionAttention || ''}
              onValueChange={(v) => onChange('cognitionAttention', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {cogOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="cognitionProblemSolving" label="Problem Solving" required>
            <Select
              value={values.cognitionProblemSolving || ''}
              onValueChange={(v) => onChange('cognitionProblemSolving', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {cogOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="cognitionSequencing" label="Sequencing/Executive Function">
            <Select
              value={values.cognitionSequencing || ''}
              onValueChange={(v) => onChange('cognitionSequencing', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {cogOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="cognitionSafetyJudgment" label="Safety Judgment" required>
            <Select
              value={values.cognitionSafetyJudgment || ''}
              onValueChange={(v) => onChange('cognitionSafetyJudgment', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {cogOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="cognitionImpairments" label="Specific Cognitive Impairments">
          <Textarea
            value={values.cognitionImpairments || ''}
            onChange={(e) => onChange('cognitionImpairments', e.target.value)}
            rows={3}
            placeholder="Describe specific cognitive deficits observed..."
          />
        </FormField>

        <FormField id="cognitionNarrative" label="Cognitive Assessment Narrative" required>
          <Textarea
            value={values.cognitionNarrative || ''}
            onChange={(e) => onChange('cognitionNarrative', e.target.value)}
            rows={5}
            placeholder="Provide comprehensive narrative of cognitive status, functional impact on ADLs/IADLs, safety concerns, and recommendations..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function TherapyGoalsSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-pink-600" />
        Therapy Goals
      </h2>
      
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Goal Format</AlertTitle>
        <AlertDescription className="text-xs">
          Goals should be specific, measurable, achievable, relevant, and time-bound (SMART). Include functional outcomes related to ADLs/IADLs.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Goal 1 */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Goal 1</h3>
          <div className="space-y-3">
            <FormField id="goal1Description" label="Goal Description" required>
              <Textarea
                value={values.goal1Description || ''}
                onChange={(e) => onChange('goal1Description', e.target.value)}
                rows={3}
                placeholder="e.g., Patient will dress upper body independently using adaptive equipment within 2 weeks..."
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField id="goal1TargetDate" label="Target Date" required>
                <Input
                  type="date"
                  value={values.goal1TargetDate || ''}
                  onChange={(e) => onChange('goal1TargetDate', e.target.value)}
                />
              </FormField>
              <FormField id="goal1Status" label="Status">
                <Select
                  value={values.goal1Status || ''}
                  onValueChange={(v) => onChange('goal1Status', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="met">Goal Met</SelectItem>
                    <SelectItem value="partially_met">Partially Met</SelectItem>
                    <SelectItem value="not_met">Not Met</SelectItem>
                    <SelectItem value="modified">Modified</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        </div>

        {/* Goal 2 */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Goal 2</h3>
          <div className="space-y-3">
            <FormField id="goal2Description" label="Goal Description" required>
              <Textarea
                value={values.goal2Description || ''}
                onChange={(e) => onChange('goal2Description', e.target.value)}
                rows={3}
                placeholder="e.g., Patient will prepare simple meals safely with supervision within 3 weeks..."
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField id="goal2TargetDate" label="Target Date" required>
                <Input
                  type="date"
                  value={values.goal2TargetDate || ''}
                  onChange={(e) => onChange('goal2TargetDate', e.target.value)}
                />
              </FormField>
              <FormField id="goal2Status" label="Status">
                <Select
                  value={values.goal2Status || ''}
                  onValueChange={(v) => onChange('goal2Status', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="met">Goal Met</SelectItem>
                    <SelectItem value="partially_met">Partially Met</SelectItem>
                    <SelectItem value="not_met">Not Met</SelectItem>
                    <SelectItem value="modified">Modified</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        </div>

        {/* Goal 3 */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Goal 3</h3>
          <div className="space-y-3">
            <FormField id="goal3Description" label="Goal Description">
              <Textarea
                value={values.goal3Description || ''}
                onChange={(e) => onChange('goal3Description', e.target.value)}
                rows={3}
                placeholder="e.g., Patient will manage medications independently using pill organizer within 4 weeks..."
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField id="goal3TargetDate" label="Target Date">
                <Input
                  type="date"
                  value={values.goal3TargetDate || ''}
                  onChange={(e) => onChange('goal3TargetDate', e.target.value)}
                />
              </FormField>
              <FormField id="goal3Status" label="Status">
                <Select
                  value={values.goal3Status || ''}
                  onValueChange={(v) => onChange('goal3Status', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="met">Goal Met</SelectItem>
                    <SelectItem value="partially_met">Partially Met</SelectItem>
                    <SelectItem value="not_met">Not Met</SelectItem>
                    <SelectItem value="modified">Modified</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        </div>

        <FormField id="goalsNarrative" label="Goals Summary & Rationale">
          <Textarea
            value={values.goalsNarrative || ''}
            onChange={(e) => onChange('goalsNarrative', e.target.value)}
            rows={4}
            placeholder="Provide rationale for therapy goals and expected functional outcomes..."
          />
        </FormField>
      </div>
    </Card>
  );
}

// Continue with additional sections...
const SECTION_COMPONENTS = {
  visit_information: VisitInformationSection,
  functional_assessment: FunctionalAssessmentSection,
  activities_daily_living: ActivitiesOfDailyLivingSection,
  instrumental_adls: InstrumentalADLsSection,
  upper_extremity: UpperExtremitySection,
  cognitive_status: CognitiveStatusSection,
  home_safety: HomeSafetySection,
  adaptive_equipment: AdaptiveEquipmentSection,
  therapy_goals: TherapyGoalsSection,
  interventions: InterventionsSection,
  patient_response: PatientResponseSection,
  progress_tracking: ProgressTrackingSection,
  plan_updates: PlanUpdatesSection,
  discharge_details: DischargeDetailsSection,
  progress_note_details: ProgressNoteDetailsSection,
};

// Additional section components
function HomeSafetySection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Home className="w-5 h-5 text-pink-600" />
        Home Safety Assessment
      </h2>
      
      <div className="space-y-4">
        <FormField id="homeSafetyAssessed" label="Home Safety Assessed">
          <RadioGroup
            value={values.homeSafetyAssessed || ''}
            onValueChange={(v) => onChange('homeSafetyAssessed', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="safety-yes" />
                <Label htmlFor="safety-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="safety-no" />
                <Label htmlFor="safety-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        {values.homeSafetyAssessed === 'yes' && (
          <>
            <FormField id="fallRiskAssessment" label="Fall Risk Assessment" required>
              <Select
                value={values.fallRiskAssessment || ''}
                onValueChange={(v) => onChange('fallRiskAssessment', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="moderate">Moderate Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="homeSafetyConcerns" label="Safety Concerns Identified" required>
              <Textarea
                value={values.homeSafetyConcerns || ''}
                onChange={(e) => onChange('homeSafetyConcerns', e.target.value)}
                rows={4}
                placeholder="Document specific safety hazards (loose rugs, poor lighting, bathroom accessibility, etc)..."
              />
            </FormField>

            <FormField id="homeSafetyRecommendations" label="Safety Recommendations" required>
              <Textarea
                value={values.homeSafetyRecommendations || ''}
                onChange={(e) => onChange('homeSafetyRecommendations', e.target.value)}
                rows={4}
                placeholder="Recommendations for improving home safety (grab bars, remove obstacles, improve lighting, etc)..."
              />
            </FormField>
          </>
        )}
      </div>
    </Card>
  );
}

function AdaptiveEquipmentSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-pink-600" />
        Adaptive Equipment
      </h2>
      
      <div className="space-y-4">
        <FormField id="equipmentRecommended" label="Equipment Recommended">
          <Textarea
            value={values.equipmentRecommended || ''}
            onChange={(e) => onChange('equipmentRecommended', e.target.value)}
            rows={3}
            placeholder="List adaptive equipment recommended (reacher, sock aid, button hook, shower chair, etc)..."
          />
        </FormField>

        <FormField id="equipmentProvided" label="Equipment Provided">
          <Textarea
            value={values.equipmentProvided || ''}
            onChange={(e) => onChange('equipmentProvided', e.target.value)}
            rows={3}
            placeholder="List adaptive equipment provided during visit..."
          />
        </FormField>

        <FormField id="equipmentTraining" label="Training Provided">
          <Textarea
            value={values.equipmentTraining || ''}
            onChange={(e) => onChange('equipmentTraining', e.target.value)}
            rows={3}
            placeholder="Describe training provided on equipment use..."
          />
        </FormField>

        <FormField id="equipmentNarrative" label="Additional Notes">
          <Textarea
            value={values.equipmentNarrative || ''}
            onChange={(e) => onChange('equipmentNarrative', e.target.value)}
            rows={3}
            placeholder="Additional equipment notes..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function InterventionsSection({ values, onChange }: SectionProps) {
  const interventions = [
    { id: 'interventionTherapeuticExercise', label: 'Therapeutic Exercise' },
    { id: 'interventionTherapeuticActivities', label: 'Therapeutic Activities' },
    { id: 'interventionADLTraining', label: 'ADL Training' },
    { id: 'interventionFineMotorTraining', label: 'Fine Motor Training' },
    { id: 'interventionCognitiveRetraining', label: 'Cognitive Retraining' },
    { id: 'interventionAdaptiveEquipment', label: 'Adaptive Equipment Training' },
    { id: 'interventionHomeAssessment', label: 'Home Safety Assessment' },
    { id: 'interventionCaregiverTraining', label: 'Caregiver Training' },
    { id: 'interventionEnergyConservation', label: 'Energy Conservation Techniques' },
    { id: 'interventionJointProtection', label: 'Joint Protection Education' },
    { id: 'interventionOther', label: 'Other' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-pink-600" />
        Interventions Performed
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Select all interventions performed:</Label>
          {interventions.map(intervention => (
            <div key={intervention.id} className="flex items-center space-x-2">
              <Checkbox
                id={intervention.id}
                checked={values[intervention.id as keyof OTFormValues] as boolean || false}
                onCheckedChange={(checked) => onChange(intervention.id as keyof OTFormValues, checked)}
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

        <FormField id="interventionsNarrative" label="Detailed Intervention Narrative" required>
          <Textarea
            value={values.interventionsNarrative || ''}
            onChange={(e) => onChange('interventionsNarrative', e.target.value)}
            rows={6}
            placeholder="Provide detailed description of all OT interventions performed, techniques used, duration, and specific activities completed..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function PatientResponseSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-pink-600" />
        Patient Response
      </h2>
      
      <div className="space-y-4">
        <FormField id="patientTolerance" label="Tolerance to Treatment" required>
          <Select
            value={values.patientTolerance || ''}
            onValueChange={(v) => onChange('patientTolerance', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tolerance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent - No complaints</SelectItem>
              <SelectItem value="good">Good - Minimal complaints</SelectItem>
              <SelectItem value="fair">Fair - Some difficulty</SelectItem>
              <SelectItem value="poor">Poor - Significant difficulty</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="patientEngagement" label="Patient Engagement" required>
          <Select
            value={values.patientEngagement || ''}
            onValueChange={(v) => onChange('patientEngagement', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select engagement level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highly_engaged">Highly Engaged</SelectItem>
              <SelectItem value="engaged">Engaged</SelectItem>
              <SelectItem value="moderately_engaged">Moderately Engaged</SelectItem>
              <SelectItem value="minimally_engaged">Minimally Engaged</SelectItem>
              <SelectItem value="resistant">Resistant</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

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
              <SelectItem value="good">Good - Understands instructions</SelectItem>
              <SelectItem value="fair">Fair - Needs reinforcement</SelectItem>
              <SelectItem value="poor">Poor - Significant barriers</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="patientBarriers" label="Barriers to Progress">
          <Textarea
            value={values.patientBarriers || ''}
            onChange={(e) => onChange('patientBarriers', e.target.value)}
            rows={3}
            placeholder="Document any barriers (pain, fatigue, cognitive deficits, motivation, etc)..."
          />
        </FormField>

        <FormField id="responseNarrative" label="Response Narrative" required>
          <Textarea
            value={values.responseNarrative || ''}
            onChange={(e) => onChange('responseNarrative', e.target.value)}
            rows={5}
            placeholder="Provide detailed narrative of patient's response to treatment, observations, and clinical judgment..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function ProgressTrackingSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-pink-600" />
        Progress Toward Therapy Goals
      </h2>
      
      <div className="space-y-4">
        <FormField id="progressTowardGoals" label="Progress Toward Goals" required>
          <Textarea
            value={values.progressTowardGoals || ''}
            onChange={(e) => onChange('progressTowardGoals', e.target.value)}
            rows={5}
            placeholder="Document patient's progress toward established therapy goals, including specific functional gains..."
          />
        </FormField>

        <FormField id="functionalGains" label="Functional Gains Achieved">
          <Textarea
            value={values.functionalGains || ''}
            onChange={(e) => onChange('functionalGains', e.target.value)}
            rows={4}
            placeholder="Document specific functional improvements in ADLs, IADLs, or mobility..."
          />
        </FormField>

        <FormField id="regressionConcerns" label="Regression or Concerns">
          <Textarea
            value={values.regressionConcerns || ''}
            onChange={(e) => onChange('regressionConcerns', e.target.value)}
            rows={3}
            placeholder="Document any regression, plateau, or concerns about progress..."
          />
        </FormField>

        <FormField id="progressNarrative" label="Additional Progress Notes">
          <Textarea
            value={values.progressNarrative || ''}
            onChange={(e) => onChange('progressNarrative', e.target.value)}
            rows={4}
            placeholder="Additional progress observations..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function PlanUpdatesSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-pink-600" />
        Plan Updates
      </h2>
      
      <div className="space-y-4">
        <FormField id="planModifications" label="Treatment Plan Modifications">
          <Textarea
            value={values.planModifications || ''}
            onChange={(e) => onChange('planModifications', e.target.value)}
            rows={4}
            placeholder="Document any modifications to the treatment plan or therapy goals..."
          />
        </FormField>

        <FormField id="nextSessionPlan" label="Plan for Next Session" required>
          <Textarea
            value={values.nextSessionPlan || ''}
            onChange={(e) => onChange('nextSessionPlan', e.target.value)}
            rows={4}
            placeholder="Describe planned interventions and activities for next OT session..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function DischargeDetailsSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-pink-600" />
        Discharge Details
      </h2>
      
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
              <SelectItem value="plateau">Plateau in Progress</SelectItem>
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
            placeholder="Document which therapy goals were met and functional outcomes achieved..."
          />
        </FormField>

        <FormField id="functionalOutcomes" label="Functional Outcomes" required>
          <Textarea
            value={values.functionalOutcomes || ''}
            onChange={(e) => onChange('functionalOutcomes', e.target.value)}
            rows={4}
            placeholder="Document final functional status and comparison to initial evaluation..."
          />
        </FormField>

        <FormField id="dischargeRecommendations" label="Discharge Recommendations" required>
          <Textarea
            value={values.dischargeRecommendations || ''}
            onChange={(e) => onChange('dischargeRecommendations', e.target.value)}
            rows={4}
            placeholder="Recommendations for ongoing activities, exercise program, safety precautions, follow-up services..."
          />
        </FormField>

        <FormField id="dischargeNarrative" label="Additional Discharge Notes">
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

function ProgressNoteDetailsSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-pink-600" />
        Progress Note Details
      </h2>
      
      <div className="space-y-4">
        <FormField id="progressNotePeriod" label="Progress Note Period" required>
          <Input
            value={values.progressNotePeriod || ''}
            onChange={(e) => onChange('progressNotePeriod', e.target.value)}
            placeholder="e.g., 01/15/2026 - 02/15/2026"
          />
        </FormField>

        <FormField id="progressNoteFrequency" label="Therapy Frequency" required>
          <Input
            value={values.progressNoteFrequency || ''}
            onChange={(e) => onChange('progressNoteFrequency', e.target.value)}
            placeholder="e.g., 2x/week for 4 weeks"
          />
        </FormField>

        <FormField id="progressNoteCompliance" label="Patient Compliance" required>
          <Select
            value={values.progressNoteCompliance || ''}
            onValueChange={(v) => onChange('progressNoteCompliance', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select compliance level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
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

function createValidationRules(documentType: OTDocumentType): FieldValidationRule[] {
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
  ];

  // Add document-specific rules
  if (documentType === 'ot_evaluation') {
    commonRules.push(
      {
        fieldId: 'priorFunctionalLevel',
        fieldLabel: 'Prior Level of Function',
        sectionId: 'functional_assessment',
        sectionTitle: 'Functional Assessment',
        required: true,
      },
      {
        fieldId: 'currentFunctionalLevel',
        fieldLabel: 'Current Level of Function',
        sectionId: 'functional_assessment',
        sectionTitle: 'Functional Assessment',
        required: true,
      },
      {
        fieldId: 'functionalLimitations',
        fieldLabel: 'Functional Limitations',
        sectionId: 'functional_assessment',
        sectionTitle: 'Functional Assessment',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'adlBathing',
        fieldLabel: 'Bathing',
        sectionId: 'activities_daily_living',
        sectionTitle: 'Activities of Daily Living',
        required: true,
      },
      {
        fieldId: 'adlDressing',
        fieldLabel: 'Dressing',
        sectionId: 'activities_daily_living',
        sectionTitle: 'Activities of Daily Living',
        required: true,
      },
      {
        fieldId: 'adlGrooming',
        fieldLabel: 'Grooming',
        sectionId: 'activities_daily_living',
        sectionTitle: 'Activities of Daily Living',
        required: true,
      },
      {
        fieldId: 'adlToileting',
        fieldLabel: 'Toileting',
        sectionId: 'activities_daily_living',
        sectionTitle: 'Activities of Daily Living',
        required: true,
      },
      {
        fieldId: 'adlFeeding',
        fieldLabel: 'Feeding',
        sectionId: 'activities_daily_living',
        sectionTitle: 'Activities of Daily Living',
        required: true,
      },
      {
        fieldId: 'adlTransfers',
        fieldLabel: 'Transfers',
        sectionId: 'activities_daily_living',
        sectionTitle: 'Activities of Daily Living',
        required: true,
      },
      {
        fieldId: 'adlNarrative',
        fieldLabel: 'ADL Narrative',
        sectionId: 'activities_daily_living',
        sectionTitle: 'Activities of Daily Living',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'iadlMedManagement',
        fieldLabel: 'Medication Management',
        sectionId: 'instrumental_adls',
        sectionTitle: 'Instrumental ADLs',
        required: true,
      },
      {
        fieldId: 'ueRightStrength',
        fieldLabel: 'Right UE Strength',
        sectionId: 'upper_extremity',
        sectionTitle: 'Upper Extremity Function',
        required: true,
      },
      {
        fieldId: 'ueLeftStrength',
        fieldLabel: 'Left UE Strength',
        sectionId: 'upper_extremity',
        sectionTitle: 'Upper Extremity Function',
        required: true,
      },
      {
        fieldId: 'ueCoordination',
        fieldLabel: 'Coordination',
        sectionId: 'upper_extremity',
        sectionTitle: 'Upper Extremity Function',
        required: true,
      },
      {
        fieldId: 'ueFineMotorSkills',
        fieldLabel: 'Fine Motor Skills',
        sectionId: 'upper_extremity',
        sectionTitle: 'Upper Extremity Function',
        required: true,
      },
      {
        fieldId: 'ueNarrative',
        fieldLabel: 'Upper Extremity Narrative',
        sectionId: 'upper_extremity',
        sectionTitle: 'Upper Extremity Function',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'cognitionOrientation',
        fieldLabel: 'Orientation',
        sectionId: 'cognitive_status',
        sectionTitle: 'Cognitive Status',
        required: true,
      },
      {
        fieldId: 'cognitionMemory',
        fieldLabel: 'Memory',
        sectionId: 'cognitive_status',
        sectionTitle: 'Cognitive Status',
        required: true,
      },
      {
        fieldId: 'cognitionAttention',
        fieldLabel: 'Attention',
        sectionId: 'cognitive_status',
        sectionTitle: 'Cognitive Status',
        required: true,
      },
      {
        fieldId: 'cognitionProblemSolving',
        fieldLabel: 'Problem Solving',
        sectionId: 'cognitive_status',
        sectionTitle: 'Cognitive Status',
        required: true,
      },
      {
        fieldId: 'cognitionSafetyJudgment',
        fieldLabel: 'Safety Judgment',
        sectionId: 'cognitive_status',
        sectionTitle: 'Cognitive Status',
        required: true,
      },
      {
        fieldId: 'cognitionNarrative',
        fieldLabel: 'Cognitive Narrative',
        sectionId: 'cognitive_status',
        sectionTitle: 'Cognitive Status',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'goal1Description',
        fieldLabel: 'Goal 1 Description',
        sectionId: 'therapy_goals',
        sectionTitle: 'Therapy Goals',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'goal1TargetDate',
        fieldLabel: 'Goal 1 Target Date',
        sectionId: 'therapy_goals',
        sectionTitle: 'Therapy Goals',
        required: true,
      },
      {
        fieldId: 'goal2Description',
        fieldLabel: 'Goal 2 Description',
        sectionId: 'therapy_goals',
        sectionTitle: 'Therapy Goals',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'goal2TargetDate',
        fieldLabel: 'Goal 2 Target Date',
        sectionId: 'therapy_goals',
        sectionTitle: 'Therapy Goals',
        required: true,
      }
    );
  } else if (documentType === 'ot_visit_note') {
    commonRules.push(
      {
        fieldId: 'interventionsNarrative',
        fieldLabel: 'Interventions Narrative',
        sectionId: 'interventions',
        sectionTitle: 'Interventions Performed',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'patientTolerance',
        fieldLabel: 'Tolerance to Treatment',
        sectionId: 'patient_response',
        sectionTitle: 'Patient Response',
        required: true,
      },
      {
        fieldId: 'patientEngagement',
        fieldLabel: 'Patient Engagement',
        sectionId: 'patient_response',
        sectionTitle: 'Patient Response',
        required: true,
      },
      {
        fieldId: 'patientUnderstanding',
        fieldLabel: 'Patient Understanding',
        sectionId: 'patient_response',
        sectionTitle: 'Patient Response',
        required: true,
      },
      {
        fieldId: 'responseNarrative',
        fieldLabel: 'Response Narrative',
        sectionId: 'patient_response',
        sectionTitle: 'Patient Response',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'progressTowardGoals',
        fieldLabel: 'Progress Toward Goals',
        sectionId: 'progress_tracking',
        sectionTitle: 'Progress Tracking',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'nextSessionPlan',
        fieldLabel: 'Plan for Next Session',
        sectionId: 'plan_updates',
        sectionTitle: 'Plan Updates',
        required: true,
        minLength: 15,
      }
    );
  }

  return commonRules;
}
