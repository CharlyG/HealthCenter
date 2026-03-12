/**
 * Medical Social Work (MSW) Clinical Documentation Module
 * 
 * Comprehensive documentation system for medical social work services
 * Supports 3 document types with psychosocial assessments and resource coordination
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
import { DocumentValidator, ValidationResult, FieldValidationRule } from '../lib/documentValidation';
import { ValidationPanel } from '../components/documentation/ValidationPanel';
import { DocumentStatusBadge } from '../components/documentation/DocumentStatusComponents';
import { DocumentStatus } from '../lib/documentStatusSystem';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Users,
  Heart,
  DollarSign,
  Building,
  Phone,
  Target,
  MessageCircle,
  Home,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Shield,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Baby,
  Pill,
  HeartPulse,
  MapPin,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type MSWDocumentType = 
  | 'msw_evaluation'
  | 'msw_visit_note'
  | 'msw_discharge_summary';

interface MSWFormValues {
  // Document metadata
  documentType: MSWDocumentType;
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
  visitLocation: string;

  // Psychosocial Assessment
  livingArrangement: string;
  maritalStatus: string;
  primaryLanguage: string;
  educationLevel: string;
  employmentStatus: string;
  religiousSpiritual: string;
  culturalConsiderations: string;
  emotionalStatus: string;
  copingMechanisms: string;
  stressors: string;
  mentalHealthHistory: string;
  substanceUseHistory: string;
  abuseNeglectConcerns: string;
  advancedDirectives: string;
  psychosocialNarrative: string;

  // Support System
  primaryCaregiver: string;
  caregiverRelationship: string;
  caregiverAvailability: string;
  caregiverCapability: string;
  caregiverStress: string;
  additionalSupports: string;
  familyDynamics: string;
  socialIsolation: string;
  petCompanionship: string;
  supportNarrative: string;

  // Financial Resources
  insurancePrimary: string;
  insuranceSecondary: string;
  medicareStatus: string;
  medicaidStatus: string;
  incomeSource: string;
  financialConcerns: string;
  affordabilityIssues: string;
  prescriptionCoverage: string;
  transportationAccess: string;
  housingStability: string;
  utilityAssistanceNeeds: string;
  foodInsecurity: string;
  financialNarrative: string;

  // Community Resources
  homeHealthServices: string;
  mealServices: string;
  transportationServices: string;
  medicalEquipment: string;
  counselingServices: string;
  supportGroups: string;
  respiteCare: string;
  adultDayCare: string;
  hospicePalliative: string;
  legalServices: string;
  housingAssistance: string;
  benefitsAssistance: string;
  resourcesNarrative: string;

  // Care Coordination
  physicianCommunication: string;
  familyConferences: string;
  multidisciplinaryCoordination: string;
  dischargeTransitionPlanning: string;
  advocacyActivities: string;
  barriersToCare: string;
  coordinationNarrative: string;

  // Interventions (for Visit Note)
  interventionCounseling: boolean;
  interventionCrisisBrief: boolean;
  interventionGriefSupport: boolean;
  interventionFamilyConference: boolean;
  interventionResourceReferral: boolean;
  interventionAdvocacy: boolean;
  interventionCareCoordination: boolean;
  interventionFinancialAssistance: boolean;
  interventionDischargePlanning: boolean;
  interventionCommunityLinkage: boolean;
  interventionOther: boolean;
  interventionOtherDescription: string;
  interventionsNarrative: string;

  // Counseling
  counselingTopics: string[];
  counselingTechniques: string;
  patientResponse: string;
  familyInvolvement: string;
  counselingGoals: string;
  counselingNarrative: string;

  // Referrals Made
  referralsMade: string[];
  referralDetails: string;
  referralFollowUp: string;
  referralNarrative: string;

  // Goals and Planning
  goal1Description: string;
  goal1Status: string;
  goal2Description: string;
  goal2Status: string;
  goal3Description: string;
  goal3Status: string;
  nextSessionPlan: string;
  goalsNarrative: string;

  // Discharge (for discharge summary)
  dischargeReason: string;
  dischargeDisposition: string;
  goalsMet: string;
  psychosocialOutcomes: string;
  resourcesEstablished: string;
  dischargeRecommendations: string;
  followUpNeeds: string;
  dischargeNarrative: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT TYPE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const DOCUMENT_TYPES = {
  msw_evaluation: {
    id: 'msw_evaluation',
    label: 'MSW Evaluation',
    description: 'Comprehensive psychosocial evaluation',
    icon: Users,
    sections: [
      'visit_information',
      'psychosocial_assessment',
      'support_system',
      'financial_resources',
      'community_resources',
      'care_coordination',
      'goals_planning',
    ],
  },
  msw_visit_note: {
    id: 'msw_visit_note',
    label: 'MSW Visit Note',
    description: 'Standard medical social work visit documentation',
    icon: FileText,
    sections: [
      'visit_information',
      'interventions',
      'counseling',
      'care_coordination',
      'referrals',
      'goals_planning',
    ],
  },
  msw_discharge_summary: {
    id: 'msw_discharge_summary',
    label: 'MSW Discharge Summary',
    description: 'Final psychosocial discharge summary',
    icon: CheckCircle2,
    sections: [
      'visit_information',
      'psychosocial_assessment',
      'support_system',
      'community_resources',
      'discharge_details',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MedicalSocialWorkModule() {
  const navigate = useNavigate();
  const [selectedDocType, setSelectedDocType] = useState<MSWDocumentType | null>(null);
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
    <MSWDocumentEditor
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
  onSelect: (type: MSWDocumentType) => void;
  onCancel: () => void;
}

function DocumentTypeSelector({ onSelect, onCancel }: DocumentTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <Card className="max-w-3xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical Social Work Documentation
          </h1>
          <p className="text-gray-600">
            Select the type of MSW document you want to create
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(DOCUMENT_TYPES).map(docType => {
            const Icon = docType.icon;
            return (
              <button
                key={docType.id}
                onClick={() => onSelect(docType.id as MSWDocumentType)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-amber-600" />
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

interface MSWDocumentEditorProps {
  documentType: MSWDocumentType;
  onClose: () => void;
}

function MSWDocumentEditor({ documentType, onClose }: MSWDocumentEditorProps) {
  const navigate = useNavigate();
  const docConfig = DOCUMENT_TYPES[documentType];

  // Form state
  const [values, setValues] = useState<Partial<MSWFormValues>>({
    documentType,
    documentStatus: 'draft',
    patientId: 'pat-99888',
    patientName: 'Dorothy Williams',
    admissionId: 'adm-55443',
    visitDate: new Date().toISOString().split('T')[0],
    timeIn: '14:00',
    timeOut: '15:30',
    clinicianName: 'David Kim',
    clinicianCredentials: 'MSW, LCSW',
    counselingTopics: [],
    referralsMade: [],
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
      const value = values[rule.fieldId as keyof MSWFormValues];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, [values, validationRules]);

  const handleFieldChange = (fieldId: keyof MSWFormValues, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    console.log('Saving MSW document...', values);
    alert('MSW document saved successfully!');
  };

  const handleSubmit = () => {
    if (!validationResult.canSubmit) {
      setShowValidation(true);
      alert(`Cannot submit: ${validationResult.errorCount} validation errors must be fixed.`);
      return;
    }
    console.log('Submitting MSW document...', values);
    alert('MSW document submitted successfully!');
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
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                    MSW
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
                  const v = values[r.fieldId as keyof MSWFormValues];
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
                        ? 'bg-amber-50 text-amber-700 font-medium'
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
  psychosocial_assessment: {
    id: 'psychosocial_assessment',
    title: 'Psychosocial Assessment',
    icon: Heart,
  },
  support_system: {
    id: 'support_system',
    title: 'Support System',
    icon: Users,
  },
  financial_resources: {
    id: 'financial_resources',
    title: 'Financial Resources',
    icon: DollarSign,
  },
  community_resources: {
    id: 'community_resources',
    title: 'Community Resources',
    icon: Building,
  },
  care_coordination: {
    id: 'care_coordination',
    title: 'Care Coordination',
    icon: Target,
  },
  interventions: {
    id: 'interventions',
    title: 'Interventions',
    icon: CheckCircle2,
  },
  counseling: {
    id: 'counseling',
    title: 'Counseling',
    icon: MessageCircle,
  },
  referrals: {
    id: 'referrals',
    title: 'Referrals',
    icon: Phone,
  },
  goals_planning: {
    id: 'goals_planning',
    title: 'Goals & Planning',
    icon: Target,
  },
  discharge_details: {
    id: 'discharge_details',
    title: 'Discharge Details',
    icon: CheckCircle2,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface SectionProps {
  values: Partial<MSWFormValues>;
  onChange: (fieldId: keyof MSWFormValues, value: any) => void;
  validationResult: ValidationResult;
}

function VisitInformationSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-amber-600" />
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
              <SelectItem value="initial_evaluation">Initial Evaluation</SelectItem>
              <SelectItem value="follow_up">Follow-Up Visit</SelectItem>
              <SelectItem value="crisis_intervention">Crisis Intervention</SelectItem>
              <SelectItem value="family_conference">Family Conference</SelectItem>
              <SelectItem value="discharge_visit">Discharge Visit</SelectItem>
              <SelectItem value="telephone_contact">Telephone Contact</SelectItem>
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
            placeholder="e.g., Visit 2 of 4"
          />
        </FormField>

        <FormField id="visitLocation" label="Visit Location" required>
          <Select value={values.visitLocation || ''} onValueChange={(v) => onChange('visitLocation', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient_home">Patient's Home</SelectItem>
              <SelectItem value="facility">Facility</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="telephone">Telephone</SelectItem>
              <SelectItem value="video">Video Conference</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </Card>
  );
}

function PsychosocialAssessmentSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-amber-600" />
        Psychosocial Assessment
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="livingArrangement" label="Living Arrangement" required>
            <Select
              value={values.livingArrangement || ''}
              onValueChange={(v) => onChange('livingArrangement', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select arrangement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lives_alone">Lives Alone</SelectItem>
                <SelectItem value="lives_with_spouse">Lives with Spouse/Partner</SelectItem>
                <SelectItem value="lives_with_family">Lives with Family</SelectItem>
                <SelectItem value="lives_with_caregiver">Lives with Caregiver</SelectItem>
                <SelectItem value="assisted_living">Assisted Living</SelectItem>
                <SelectItem value="nursing_home">Nursing Home</SelectItem>
                <SelectItem value="homeless">Homeless</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="maritalStatus" label="Marital Status" required>
            <Select
              value={values.maritalStatus || ''}
              onValueChange={(v) => onChange('maritalStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="partnered">Partnered</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="separated">Separated</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="primaryLanguage" label="Primary Language" required>
            <Input
              value={values.primaryLanguage || ''}
              onChange={(e) => onChange('primaryLanguage', e.target.value)}
              placeholder="e.g., English, Spanish"
            />
          </FormField>

          <FormField id="educationLevel" label="Education Level">
            <Select
              value={values.educationLevel || ''}
              onValueChange={(v) => onChange('educationLevel', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less_than_hs">Less than High School</SelectItem>
                <SelectItem value="high_school">High School/GED</SelectItem>
                <SelectItem value="some_college">Some College</SelectItem>
                <SelectItem value="associates">Associate's Degree</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="graduate">Graduate Degree</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="employmentStatus" label="Employment Status">
            <Select
              value={values.employmentStatus || ''}
              onValueChange={(v) => onChange('employmentStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employed_full">Employed Full-Time</SelectItem>
                <SelectItem value="employed_part">Employed Part-Time</SelectItem>
                <SelectItem value="self_employed">Self-Employed</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="religiousSpiritual" label="Religious/Spiritual Affiliation">
            <Input
              value={values.religiousSpiritual || ''}
              onChange={(e) => onChange('religiousSpiritual', e.target.value)}
              placeholder="e.g., Catholic, None, Prefers not to say"
            />
          </FormField>
        </div>

        <FormField id="culturalConsiderations" label="Cultural Considerations">
          <Textarea
            value={values.culturalConsiderations || ''}
            onChange={(e) => onChange('culturalConsiderations', e.target.value)}
            rows={3}
            placeholder="Document cultural, ethnic, or religious considerations relevant to care..."
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="emotionalStatus" label="Current Emotional Status" required>
            <Select
              value={values.emotionalStatus || ''}
              onValueChange={(v) => onChange('emotionalStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="anxious">Anxious</SelectItem>
                <SelectItem value="depressed">Depressed</SelectItem>
                <SelectItem value="fearful">Fearful</SelectItem>
                <SelectItem value="angry">Angry/Agitated</SelectItem>
                <SelectItem value="grief">Grieving</SelectItem>
                <SelectItem value="crisis">In Crisis</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="copingMechanisms" label="Coping Mechanisms">
            <Input
              value={values.copingMechanisms || ''}
              onChange={(e) => onChange('copingMechanisms', e.target.value)}
              placeholder="e.g., Prayer, exercise, support from family"
            />
          </FormField>
        </div>

        <FormField id="stressors" label="Current Stressors" required>
          <Textarea
            value={values.stressors || ''}
            onChange={(e) => onChange('stressors', e.target.value)}
            rows={3}
            placeholder="Document identified stressors (illness, finances, relationships, etc)..."
          />
        </FormField>

        <FormField id="mentalHealthHistory" label="Mental Health History">
          <Textarea
            value={values.mentalHealthHistory || ''}
            onChange={(e) => onChange('mentalHealthHistory', e.target.value)}
            rows={3}
            placeholder="Previous mental health diagnoses, treatment history, current medications..."
          />
        </FormField>

        <FormField id="substanceUseHistory" label="Substance Use History">
          <Textarea
            value={values.substanceUseHistory || ''}
            onChange={(e) => onChange('substanceUseHistory', e.target.value)}
            rows={3}
            placeholder="Alcohol, tobacco, or drug use history..."
          />
        </FormField>

        <FormField id="abuseNeglectConcerns" label="Abuse/Neglect Concerns">
          <Textarea
            value={values.abuseNeglectConcerns || ''}
            onChange={(e) => onChange('abuseNeglectConcerns', e.target.value)}
            rows={3}
            placeholder="Any concerns about abuse, neglect, or exploitation..."
          />
        </FormField>

        <FormField id="advancedDirectives" label="Advanced Directives Status" required>
          <Select
            value={values.advancedDirectives || ''}
            onValueChange={(v) => onChange('advancedDirectives', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="declined">Patient Declined</SelectItem>
              <SelectItem value="not_addressed">Not Yet Addressed</SelectItem>
              <SelectItem value="needs_update">Needs Update</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="psychosocialNarrative" label="Psychosocial Assessment Narrative" required>
          <Textarea
            value={values.psychosocialNarrative || ''}
            onChange={(e) => onChange('psychosocialNarrative', e.target.value)}
            rows={6}
            placeholder="Comprehensive narrative of psychosocial assessment, patient's adjustment to illness, coping abilities, and social work recommendations..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function SupportSystemSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-amber-600" />
        Support System
      </h2>
      
      <div className="space-y-4">
        <FormField id="primaryCaregiver" label="Primary Caregiver" required>
          <Input
            value={values.primaryCaregiver || ''}
            onChange={(e) => onChange('primaryCaregiver', e.target.value)}
            placeholder="Name of primary caregiver"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="caregiverRelationship" label="Relationship to Patient" required>
            <Select
              value={values.caregiverRelationship || ''}
              onValueChange={(v) => onChange('caregiverRelationship', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spouse">Spouse/Partner</SelectItem>
                <SelectItem value="adult_child">Adult Child</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="sibling">Sibling</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
                <SelectItem value="paid_caregiver">Paid Caregiver</SelectItem>
                <SelectItem value="other_relative">Other Relative</SelectItem>
                <SelectItem value="none">No Primary Caregiver</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="caregiverAvailability" label="Caregiver Availability" required>
            <Select
              value={values.caregiverAvailability || ''}
              onValueChange={(v) => onChange('caregiverAvailability', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24_7">24/7 Available</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="several_week">Several Times per Week</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="occasional">Occasional</SelectItem>
                <SelectItem value="limited">Very Limited</SelectItem>
                <SelectItem value="none">No Availability</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="caregiverCapability" label="Caregiver Capability" required>
            <Select
              value={values.caregiverCapability || ''}
              onValueChange={(v) => onChange('caregiverCapability', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select capability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fully_capable">Fully Capable</SelectItem>
                <SelectItem value="capable">Capable with Support</SelectItem>
                <SelectItem value="limited">Limited Capability</SelectItem>
                <SelectItem value="unable">Unable to Provide Care</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="caregiverStress" label="Caregiver Stress Level" required>
            <Select
              value={values.caregiverStress || ''}
              onValueChange={(v) => onChange('caregiverStress', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stress level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal Stress</SelectItem>
                <SelectItem value="moderate">Moderate Stress</SelectItem>
                <SelectItem value="high">High Stress</SelectItem>
                <SelectItem value="burnout">Caregiver Burnout</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="additionalSupports" label="Additional Support Persons">
          <Textarea
            value={values.additionalSupports || ''}
            onChange={(e) => onChange('additionalSupports', e.target.value)}
            rows={3}
            placeholder="List other family members, friends, or supports involved in patient's care..."
          />
        </FormField>

        <FormField id="familyDynamics" label="Family Dynamics">
          <Textarea
            value={values.familyDynamics || ''}
            onChange={(e) => onChange('familyDynamics', e.target.value)}
            rows={3}
            placeholder="Describe family relationships, conflicts, communication patterns..."
          />
        </FormField>

        <FormField id="socialIsolation" label="Social Isolation Assessment" required>
          <Select
            value={values.socialIsolation || ''}
            onValueChange={(v) => onChange('socialIsolation', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="well_connected">Well Connected</SelectItem>
              <SelectItem value="moderate_isolation">Moderately Isolated</SelectItem>
              <SelectItem value="high_isolation">Highly Isolated</SelectItem>
              <SelectItem value="complete_isolation">Completely Isolated</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="petCompanionship" label="Pet Companionship">
          <Input
            value={values.petCompanionship || ''}
            onChange={(e) => onChange('petCompanionship', e.target.value)}
            placeholder="e.g., Dog (provides companionship and motivation)"
          />
        </FormField>

        <FormField id="supportNarrative" label="Support System Narrative" required>
          <Textarea
            value={values.supportNarrative || ''}
            onChange={(e) => onChange('supportNarrative', e.target.value)}
            rows={5}
            placeholder="Comprehensive narrative of patient's support system, strengths, gaps, and recommendations for support enhancement..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function FinancialResourcesSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-amber-600" />
        Financial Resources
      </h2>
      
      <Alert className="mb-4">
        <Shield className="h-4 w-4" />
        <AlertTitle>Confidential Financial Information</AlertTitle>
        <AlertDescription className="text-xs">
          Financial information is protected. Document only what is relevant to care planning and resource allocation.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="insurancePrimary" label="Primary Insurance" required>
            <Input
              value={values.insurancePrimary || ''}
              onChange={(e) => onChange('insurancePrimary', e.target.value)}
              placeholder="e.g., Medicare, Blue Cross"
            />
          </FormField>

          <FormField id="insuranceSecondary" label="Secondary Insurance">
            <Input
              value={values.insuranceSecondary || ''}
              onChange={(e) => onChange('insuranceSecondary', e.target.value)}
              placeholder="e.g., Medicaid, Supplemental"
            />
          </FormField>

          <FormField id="medicareStatus" label="Medicare Status" required>
            <Select
              value={values.medicareStatus || ''}
              onValueChange={(v) => onChange('medicareStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="part_a">Part A Only</SelectItem>
                <SelectItem value="part_b">Part B Only</SelectItem>
                <SelectItem value="parts_ab">Parts A & B</SelectItem>
                <SelectItem value="advantage">Medicare Advantage</SelectItem>
                <SelectItem value="not_eligible">Not Eligible</SelectItem>
                <SelectItem value="pending">Pending Application</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="medicaidStatus" label="Medicaid Status">
            <Select
              value={values.medicaidStatus || ''}
              onValueChange={(v) => onChange('medicaidStatus', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending Application</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="not_eligible">Not Eligible</SelectItem>
                <SelectItem value="not_applied">Not Applied</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="incomeSource" label="Primary Income Source" required>
          <Select
            value={values.incomeSource || ''}
            onValueChange={(v) => onChange('incomeSource', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employment">Employment Income</SelectItem>
              <SelectItem value="social_security">Social Security</SelectItem>
              <SelectItem value="disability">Disability Benefits</SelectItem>
              <SelectItem value="pension">Pension/Retirement</SelectItem>
              <SelectItem value="ssi">SSI</SelectItem>
              <SelectItem value="family_support">Family Support</SelectItem>
              <SelectItem value="savings">Savings/Investments</SelectItem>
              <SelectItem value="none">No Income</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="financialConcerns" label="Financial Concerns" required>
          <Textarea
            value={values.financialConcerns || ''}
            onChange={(e) => onChange('financialConcerns', e.target.value)}
            rows={3}
            placeholder="Document financial stressors, concerns about affording care, medications, etc..."
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="affordabilityIssues" label="Affordability Issues" required>
            <Select
              value={values.affordabilityIssues || ''}
              onValueChange={(v) => onChange('affordabilityIssues', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Issues</SelectItem>
                <SelectItem value="minor">Minor Concerns</SelectItem>
                <SelectItem value="moderate">Moderate Difficulty</SelectItem>
                <SelectItem value="severe">Severe Financial Hardship</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="prescriptionCoverage" label="Prescription Coverage">
            <Select
              value={values.prescriptionCoverage || ''}
              onValueChange={(v) => onChange('prescriptionCoverage', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select coverage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adequate">Adequate Coverage</SelectItem>
                <SelectItem value="limited">Limited Coverage</SelectItem>
                <SelectItem value="none">No Coverage</SelectItem>
                <SelectItem value="assistance_needed">Assistance Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="transportationAccess" label="Transportation Access" required>
            <Select
              value={values.transportationAccess || ''}
              onValueChange={(v) => onChange('transportationAccess', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="own_vehicle">Own Vehicle</SelectItem>
                <SelectItem value="family_transport">Family Provides</SelectItem>
                <SelectItem value="public_transit">Public Transit</SelectItem>
                <SelectItem value="medical_transport">Medical Transport</SelectItem>
                <SelectItem value="limited">Limited Access</SelectItem>
                <SelectItem value="none">No Access</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="housingStability" label="Housing Stability" required>
            <Select
              value={values.housingStability || ''}
              onValueChange={(v) => onChange('housingStability', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="unstable">Unstable</SelectItem>
                <SelectItem value="homeless">Homeless</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="utilityAssistanceNeeds" label="Utility Assistance Needs">
          <Textarea
            value={values.utilityAssistanceNeeds || ''}
            onChange={(e) => onChange('utilityAssistanceNeeds', e.target.value)}
            rows={2}
            placeholder="Needs for help with electric, gas, water bills..."
          />
        </FormField>

        <FormField id="foodInsecurity" label="Food Insecurity Assessment">
          <Select
            value={values.foodInsecurity || ''}
            onValueChange={(v) => onChange('foodInsecurity', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food_secure">Food Secure</SelectItem>
              <SelectItem value="marginally_secure">Marginally Secure</SelectItem>
              <SelectItem value="food_insecure">Food Insecure</SelectItem>
              <SelectItem value="very_insecure">Very Food Insecure</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="financialNarrative" label="Financial Resources Narrative" required>
          <Textarea
            value={values.financialNarrative || ''}
            onChange={(e) => onChange('financialNarrative', e.target.value)}
            rows={5}
            placeholder="Comprehensive narrative of financial situation, impact on care, benefits applied for, assistance programs identified..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function CommunityResourcesSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Building className="w-5 h-5 text-amber-600" />
        Community Resources
      </h2>
      
      <Alert className="mb-4">
        <MapPin className="h-4 w-4" />
        <AlertTitle>Resource Assessment</AlertTitle>
        <AlertDescription className="text-xs">
          Document current services and additional resources needed. Include contact information for referred services.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="homeHealthServices" label="Home Health Services">
            <Select
              value={values.homeHealthServices || ''}
              onValueChange={(v) => onChange('homeHealthServices', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Patient Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="mealServices" label="Meal Services">
            <Select
              value={values.mealServices || ''}
              onValueChange={(v) => onChange('mealServices', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Patient Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="transportationServices" label="Transportation Services">
            <Select
              value={values.transportationServices || ''}
              onValueChange={(v) => onChange('transportationServices', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Patient Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="medicalEquipment" label="Medical Equipment/DME">
            <Select
              value={values.medicalEquipment || ''}
              onValueChange={(v) => onChange('medicalEquipment', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Patient Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="counselingServices" label="Counseling Services">
            <Select
              value={values.counselingServices || ''}
              onValueChange={(v) => onChange('counselingServices', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Patient Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="supportGroups" label="Support Groups">
            <Select
              value={values.supportGroups || ''}
              onValueChange={(v) => onChange('supportGroups', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">Participating</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Patient Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="respiteCare" label="Respite Care">
            <Select
              value={values.respiteCare || ''}
              onValueChange={(v) => onChange('respiteCare', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adultDayCare" label="Adult Day Care">
            <Select
              value={values.adultDayCare || ''}
              onValueChange={(v) => onChange('adultDayCare', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="hospicePalliative" label="Hospice/Palliative Care">
            <Select
              value={values.hospicePalliative || ''}
              onValueChange={(v) => onChange('hospicePalliative', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="legalServices" label="Legal Services">
            <Select
              value={values.legalServices || ''}
              onValueChange={(v) => onChange('legalServices', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="housingAssistance" label="Housing Assistance">
            <Select
              value={values.housingAssistance || ''}
              onValueChange={(v) => onChange('housingAssistance', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="benefitsAssistance" label="Benefits Assistance (SNAP, etc)">
            <Select
              value={values.benefitsAssistance || ''}
              onValueChange={(v) => onChange('benefitsAssistance', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_place">In Place</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="needed">Needed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField id="resourcesNarrative" label="Community Resources Narrative" required>
          <Textarea
            value={values.resourcesNarrative || ''}
            onChange={(e) => onChange('resourcesNarrative', e.target.value)}
            rows={6}
            placeholder="Detailed narrative of community resources assessed, referrals made, contact information for services, barriers to accessing resources, and follow-up plans..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function CareCoordinationSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-amber-600" />
        Care Coordination
      </h2>
      
      <div className="space-y-4">
        <FormField id="physicianCommunication" label="Physician Communication">
          <Textarea
            value={values.physicianCommunication || ''}
            onChange={(e) => onChange('physicianCommunication', e.target.value)}
            rows={3}
            placeholder="Document communications with physician regarding psychosocial issues, care planning..."
          />
        </FormField>

        <FormField id="familyConferences" label="Family Conferences">
          <Textarea
            value={values.familyConferences || ''}
            onChange={(e) => onChange('familyConferences', e.target.value)}
            rows={3}
            placeholder="Family meetings held, participants, topics discussed, outcomes..."
          />
        </FormField>

        <FormField id="multidisciplinaryCoordination" label="Multidisciplinary Team Coordination" required>
          <Textarea
            value={values.multidisciplinaryCoordination || ''}
            onChange={(e) => onChange('multidisciplinaryCoordination', e.target.value)}
            rows={4}
            placeholder="Coordination with nursing, therapy, home health aide, and other team members..."
          />
        </FormField>

        <FormField id="dischargeTransitionPlanning" label="Discharge/Transition Planning">
          <Textarea
            value={values.dischargeTransitionPlanning || ''}
            onChange={(e) => onChange('dischargeTransitionPlanning', e.target.value)}
            rows={3}
            placeholder="Discharge planning activities, transitions of care, placement considerations..."
          />
        </FormField>

        <FormField id="advocacyActivities" label="Advocacy Activities">
          <Textarea
            value={values.advocacyActivities || ''}
            onChange={(e) => onChange('advocacyActivities', e.target.value)}
            rows={3}
            placeholder="Advocacy on behalf of patient/family (insurance appeals, benefits, care access)..."
          />
        </FormField>

        <FormField id="barriersToCare" label="Identified Barriers to Care" required>
          <Textarea
            value={values.barriersToCare || ''}
            onChange={(e) => onChange('barriersToCare', e.target.value)}
            rows={3}
            placeholder="Document barriers (financial, transportation, caregiver availability, etc) and interventions..."
          />
        </FormField>

        <FormField id="coordinationNarrative" label="Care Coordination Narrative" required>
          <Textarea
            value={values.coordinationNarrative || ''}
            onChange={(e) => onChange('coordinationNarrative', e.target.value)}
            rows={5}
            placeholder="Comprehensive narrative of care coordination activities, communications, advocacy efforts, and ongoing coordination needs..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function InterventionsSection({ values, onChange }: SectionProps) {
  const interventions = [
    { id: 'interventionCounseling', label: 'Individual/Family Counseling' },
    { id: 'interventionCrisisBrief', label: 'Crisis Intervention' },
    { id: 'interventionGriefSupport', label: 'Grief/Bereavement Support' },
    { id: 'interventionFamilyConference', label: 'Family Conference' },
    { id: 'interventionResourceReferral', label: 'Resource Referral' },
    { id: 'interventionAdvocacy', label: 'Patient/Family Advocacy' },
    { id: 'interventionCareCoordination', label: 'Care Coordination' },
    { id: 'interventionFinancialAssistance', label: 'Financial Assistance Application' },
    { id: 'interventionDischargePlanning', label: 'Discharge/Transition Planning' },
    { id: 'interventionCommunityLinkage', label: 'Community Resource Linkage' },
    { id: 'interventionOther', label: 'Other' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-amber-600" />
        MSW Interventions
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Select all interventions provided:</Label>
          {interventions.map(intervention => (
            <div key={intervention.id} className="flex items-center space-x-2">
              <Checkbox
                id={intervention.id}
                checked={values[intervention.id as keyof MSWFormValues] as boolean || false}
                onCheckedChange={(checked) => onChange(intervention.id as keyof MSWFormValues, checked)}
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

        <FormField id="interventionsNarrative" label="Interventions Narrative" required>
          <Textarea
            value={values.interventionsNarrative || ''}
            onChange={(e) => onChange('interventionsNarrative', e.target.value)}
            rows={6}
            placeholder="Provide detailed description of all MSW interventions provided, therapeutic techniques used, duration, and patient/family response..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function CounselingSection({ values, onChange }: SectionProps) {
  const counselingTopicsList = [
    'Adjustment to Illness',
    'Coping with Diagnosis',
    'End of Life Issues',
    'Grief/Loss',
    'Family Conflict',
    'Caregiver Stress',
    'Depression/Anxiety',
    'Financial Stress',
    'Advance Directives',
    'Placement Decisions',
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-amber-600" />
        Patient and Family Counseling
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Counseling Topics Addressed:</Label>
          {counselingTopicsList.map(topic => (
            <div key={topic} className="flex items-center space-x-2">
              <Checkbox
                id={`topic-${topic}`}
                checked={values.counselingTopics?.includes(topic) || false}
                onCheckedChange={(checked) => {
                  const current = values.counselingTopics || [];
                  const updated = checked
                    ? [...current, topic]
                    : current.filter(t => t !== topic);
                  onChange('counselingTopics', updated);
                }}
              />
              <label
                htmlFor={`topic-${topic}`}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {topic}
              </label>
            </div>
          ))}
        </div>

        <FormField id="counselingTechniques" label="Counseling Techniques Used">
          <Textarea
            value={values.counselingTechniques || ''}
            onChange={(e) => onChange('counselingTechniques', e.target.value)}
            rows={3}
            placeholder="Therapeutic approaches used (supportive counseling, CBT techniques, motivational interviewing, etc)..."
          />
        </FormField>

        <FormField id="patientResponse" label="Patient/Family Response" required>
          <Select
            value={values.patientResponse || ''}
            onValueChange={(v) => onChange('patientResponse', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select response" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent - Very Receptive</SelectItem>
              <SelectItem value="good">Good - Engaged</SelectItem>
              <SelectItem value="fair">Fair - Some Resistance</SelectItem>
              <SelectItem value="poor">Poor - Resistant/Guarded</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="familyInvolvement" label="Family Involvement in Counseling">
          <Textarea
            value={values.familyInvolvement || ''}
            onChange={(e) => onChange('familyInvolvement', e.target.value)}
            rows={3}
            placeholder="Family members involved, their engagement level, family dynamics observed..."
          />
        </FormField>

        <FormField id="counselingGoals" label="Counseling Goals">
          <Textarea
            value={values.counselingGoals || ''}
            onChange={(e) => onChange('counselingGoals', e.target.value)}
            rows={3}
            placeholder="Short-term and long-term counseling goals..."
          />
        </FormField>

        <FormField id="counselingNarrative" label="Counseling Narrative" required>
          <Textarea
            value={values.counselingNarrative || ''}
            onChange={(e) => onChange('counselingNarrative', e.target.value)}
            rows={6}
            placeholder="Detailed narrative of counseling session(s), issues discussed, interventions provided, patient/family insights, and treatment recommendations..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function ReferralsSection({ values, onChange }: SectionProps) {
  const referralTypesList = [
    'Mental Health Services',
    'Substance Abuse Treatment',
    'Support Groups',
    'Meal Delivery Services',
    'Transportation Services',
    'Financial Assistance Programs',
    'Housing Services',
    'Legal Services',
    'Hospice Services',
    'Respite Care',
    'Adult Day Care',
    'Home Health Aide',
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Phone className="w-5 h-5 text-amber-600" />
        Community Resource Referrals
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Label>Referrals Made:</Label>
          {referralTypesList.map(referral => (
            <div key={referral} className="flex items-center space-x-2">
              <Checkbox
                id={`referral-${referral}`}
                checked={values.referralsMade?.includes(referral) || false}
                onCheckedChange={(checked) => {
                  const current = values.referralsMade || [];
                  const updated = checked
                    ? [...current, referral]
                    : current.filter(r => r !== referral);
                  onChange('referralsMade', updated);
                }}
              />
              <label
                htmlFor={`referral-${referral}`}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {referral}
              </label>
            </div>
          ))}
        </div>

        <FormField id="referralDetails" label="Referral Details" required>
          <Textarea
            value={values.referralDetails || ''}
            onChange={(e) => onChange('referralDetails', e.target.value)}
            rows={5}
            placeholder="For each referral made, document: Agency name, contact information, services provided, eligibility requirements, application status..."
          />
        </FormField>

        <FormField id="referralFollowUp" label="Follow-Up Plan" required>
          <Textarea
            value={values.referralFollowUp || ''}
            onChange={(e) => onChange('referralFollowUp', e.target.value)}
            rows={3}
            placeholder="Plan for following up on referrals, timeline for checking status, assistance needed..."
          />
        </FormField>

        <FormField id="referralNarrative" label="Referral Narrative">
          <Textarea
            value={values.referralNarrative || ''}
            onChange={(e) => onChange('referralNarrative', e.target.value)}
            rows={4}
            placeholder="Additional narrative about referral process, barriers encountered, next steps..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function GoalsPlanningSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-amber-600" />
        Psychosocial Goals & Planning
      </h2>
      
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Goal Setting</AlertTitle>
        <AlertDescription className="text-xs">
          Goals should focus on psychosocial outcomes (coping, support, resource access, caregiver wellness, etc).
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
                placeholder="e.g., Patient will identify and utilize two healthy coping strategies when experiencing anxiety related to illness..."
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

        {/* Goal 2 */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Goal 2</h3>
          <div className="space-y-3">
            <FormField id="goal2Description" label="Goal Description" required>
              <Textarea
                value={values.goal2Description || ''}
                onChange={(e) => onChange('goal2Description', e.target.value)}
                rows={3}
                placeholder="e.g., Family will access respite care services to reduce caregiver burden and stress..."
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

        {/* Goal 3 */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Goal 3</h3>
          <div className="space-y-3">
            <FormField id="goal3Description" label="Goal Description">
              <Textarea
                value={values.goal3Description || ''}
                onChange={(e) => onChange('goal3Description', e.target.value)}
                rows={3}
                placeholder="e.g., Patient will complete advance directives and communicate wishes to family and healthcare team..."
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

        <FormField id="nextSessionPlan" label="Plan for Next Session" required>
          <Textarea
            value={values.nextSessionPlan || ''}
            onChange={(e) => onChange('nextSessionPlan', e.target.value)}
            rows={4}
            placeholder="Plan for next MSW visit, interventions to provide, follow-up activities..."
          />
        </FormField>

        <FormField id="goalsNarrative" label="Goals & Planning Narrative">
          <Textarea
            value={values.goalsNarrative || ''}
            onChange={(e) => onChange('goalsNarrative', e.target.value)}
            rows={4}
            placeholder="Additional narrative about goal progress, barriers, modifications needed..."
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
        <CheckCircle2 className="w-5 h-5 text-amber-600" />
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
              <SelectItem value="patient_stable">Patient Psychosocially Stable</SelectItem>
              <SelectItem value="patient_declined">Patient Declined Services</SelectItem>
              <SelectItem value="transferred_care">Transferred to Another Level of Care</SelectItem>
              <SelectItem value="hospitalized">Patient Hospitalized</SelectItem>
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
              <SelectItem value="hospice">Hospice Care</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="goalsMet" label="Psychosocial Goals Met" required>
          <Textarea
            value={values.goalsMet || ''}
            onChange={(e) => onChange('goalsMet', e.target.value)}
            rows={4}
            placeholder="Document which psychosocial goals were met and outcomes achieved..."
          />
        </FormField>

        <FormField id="psychosocialOutcomes" label="Psychosocial Outcomes at Discharge" required>
          <Textarea
            value={values.psychosocialOutcomes || ''}
            onChange={(e) => onChange('psychosocialOutcomes', e.target.value)}
            rows={4}
            placeholder="Final psychosocial status, coping abilities, support system, resource connections, comparison to admission..."
          />
        </FormField>

        <FormField id="resourcesEstablished" label="Resources Established" required>
          <Textarea
            value={values.resourcesEstablished || ''}
            onChange={(e) => onChange('resourcesEstablished', e.target.value)}
            rows={4}
            placeholder="List all community resources connected, services in place at discharge..."
          />
        </FormField>

        <FormField id="dischargeRecommendations" label="Discharge Recommendations" required>
          <Textarea
            value={values.dischargeRecommendations || ''}
            onChange={(e) => onChange('dischargeRecommendations', e.target.value)}
            rows={4}
            placeholder="Recommendations for ongoing psychosocial support, counseling referrals, resource utilization..."
          />
        </FormField>

        <FormField id="followUpNeeds" label="Follow-Up Needs">
          <Textarea
            value={values.followUpNeeds || ''}
            onChange={(e) => onChange('followUpNeeds', e.target.value)}
            rows={3}
            placeholder="Any ongoing needs, referrals pending, follow-up activities required..."
          />
        </FormField>

        <FormField id="dischargeNarrative" label="Discharge Narrative">
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

const SECTION_COMPONENTS = {
  visit_information: VisitInformationSection,
  psychosocial_assessment: PsychosocialAssessmentSection,
  support_system: SupportSystemSection,
  financial_resources: FinancialResourcesSection,
  community_resources: CommunityResourcesSection,
  care_coordination: CareCoordinationSection,
  interventions: InterventionsSection,
  counseling: CounselingSection,
  referrals: ReferralsSection,
  goals_planning: GoalsPlanningSection,
  discharge_details: DischargeDetailsSection,
};

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

function createValidationRules(documentType: MSWDocumentType): FieldValidationRule[] {
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
      fieldId: 'visitLocation',
      fieldLabel: 'Visit Location',
      sectionId: 'visit_information',
      sectionTitle: 'Visit Information',
      required: true,
    },
  ];

  // Add document-specific rules
  if (documentType === 'msw_evaluation') {
    commonRules.push(
      {
        fieldId: 'livingArrangement',
        fieldLabel: 'Living Arrangement',
        sectionId: 'psychosocial_assessment',
        sectionTitle: 'Psychosocial Assessment',
        required: true,
      },
      {
        fieldId: 'maritalStatus',
        fieldLabel: 'Marital Status',
        sectionId: 'psychosocial_assessment',
        sectionTitle: 'Psychosocial Assessment',
        required: true,
      },
      {
        fieldId: 'primaryLanguage',
        fieldLabel: 'Primary Language',
        sectionId: 'psychosocial_assessment',
        sectionTitle: 'Psychosocial Assessment',
        required: true,
      },
      {
        fieldId: 'emotionalStatus',
        fieldLabel: 'Emotional Status',
        sectionId: 'psychosocial_assessment',
        sectionTitle: 'Psychosocial Assessment',
        required: true,
      },
      {
        fieldId: 'stressors',
        fieldLabel: 'Current Stressors',
        sectionId: 'psychosocial_assessment',
        sectionTitle: 'Psychosocial Assessment',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'advancedDirectives',
        fieldLabel: 'Advanced Directives',
        sectionId: 'psychosocial_assessment',
        sectionTitle: 'Psychosocial Assessment',
        required: true,
      },
      {
        fieldId: 'psychosocialNarrative',
        fieldLabel: 'Psychosocial Narrative',
        sectionId: 'psychosocial_assessment',
        sectionTitle: 'Psychosocial Assessment',
        required: true,
        minLength: 50,
      },
      {
        fieldId: 'primaryCaregiver',
        fieldLabel: 'Primary Caregiver',
        sectionId: 'support_system',
        sectionTitle: 'Support System',
        required: true,
      },
      {
        fieldId: 'caregiverRelationship',
        fieldLabel: 'Caregiver Relationship',
        sectionId: 'support_system',
        sectionTitle: 'Support System',
        required: true,
      },
      {
        fieldId: 'caregiverAvailability',
        fieldLabel: 'Caregiver Availability',
        sectionId: 'support_system',
        sectionTitle: 'Support System',
        required: true,
      },
      {
        fieldId: 'caregiverCapability',
        fieldLabel: 'Caregiver Capability',
        sectionId: 'support_system',
        sectionTitle: 'Support System',
        required: true,
      },
      {
        fieldId: 'caregiverStress',
        fieldLabel: 'Caregiver Stress',
        sectionId: 'support_system',
        sectionTitle: 'Support System',
        required: true,
      },
      {
        fieldId: 'socialIsolation',
        fieldLabel: 'Social Isolation',
        sectionId: 'support_system',
        sectionTitle: 'Support System',
        required: true,
      },
      {
        fieldId: 'supportNarrative',
        fieldLabel: 'Support System Narrative',
        sectionId: 'support_system',
        sectionTitle: 'Support System',
        required: true,
        minLength: 40,
      },
      {
        fieldId: 'insurancePrimary',
        fieldLabel: 'Primary Insurance',
        sectionId: 'financial_resources',
        sectionTitle: 'Financial Resources',
        required: true,
      },
      {
        fieldId: 'medicareStatus',
        fieldLabel: 'Medicare Status',
        sectionId: 'financial_resources',
        sectionTitle: 'Financial Resources',
        required: true,
      },
      {
        fieldId: 'incomeSource',
        fieldLabel: 'Income Source',
        sectionId: 'financial_resources',
        sectionTitle: 'Financial Resources',
        required: true,
      },
      {
        fieldId: 'financialConcerns',
        fieldLabel: 'Financial Concerns',
        sectionId: 'financial_resources',
        sectionTitle: 'Financial Resources',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'affordabilityIssues',
        fieldLabel: 'Affordability Issues',
        sectionId: 'financial_resources',
        sectionTitle: 'Financial Resources',
        required: true,
      },
      {
        fieldId: 'transportationAccess',
        fieldLabel: 'Transportation Access',
        sectionId: 'financial_resources',
        sectionTitle: 'Financial Resources',
        required: true,
      },
      {
        fieldId: 'housingStability',
        fieldLabel: 'Housing Stability',
        sectionId: 'financial_resources',
        sectionTitle: 'Financial Resources',
        required: true,
      },
      {
        fieldId: 'financialNarrative',
        fieldLabel: 'Financial Narrative',
        sectionId: 'financial_resources',
        sectionTitle: 'Financial Resources',
        required: true,
        minLength: 40,
      },
      {
        fieldId: 'resourcesNarrative',
        fieldLabel: 'Resources Narrative',
        sectionId: 'community_resources',
        sectionTitle: 'Community Resources',
        required: true,
        minLength: 40,
      },
      {
        fieldId: 'multidisciplinaryCoordination',
        fieldLabel: 'Multidisciplinary Coordination',
        sectionId: 'care_coordination',
        sectionTitle: 'Care Coordination',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'barriersToCare',
        fieldLabel: 'Barriers to Care',
        sectionId: 'care_coordination',
        sectionTitle: 'Care Coordination',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'coordinationNarrative',
        fieldLabel: 'Coordination Narrative',
        sectionId: 'care_coordination',
        sectionTitle: 'Care Coordination',
        required: true,
        minLength: 40,
      },
      {
        fieldId: 'goal1Description',
        fieldLabel: 'Goal 1 Description',
        sectionId: 'goals_planning',
        sectionTitle: 'Goals & Planning',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'goal2Description',
        fieldLabel: 'Goal 2 Description',
        sectionId: 'goals_planning',
        sectionTitle: 'Goals & Planning',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'nextSessionPlan',
        fieldLabel: 'Next Session Plan',
        sectionId: 'goals_planning',
        sectionTitle: 'Goals & Planning',
        required: true,
        minLength: 20,
      }
    );
  } else if (documentType === 'msw_visit_note') {
    commonRules.push(
      {
        fieldId: 'interventionsNarrative',
        fieldLabel: 'Interventions Narrative',
        sectionId: 'interventions',
        sectionTitle: 'Interventions',
        required: true,
        minLength: 40,
      },
      {
        fieldId: 'patientResponse',
        fieldLabel: 'Patient Response',
        sectionId: 'counseling',
        sectionTitle: 'Counseling',
        required: true,
      },
      {
        fieldId: 'counselingNarrative',
        fieldLabel: 'Counseling Narrative',
        sectionId: 'counseling',
        sectionTitle: 'Counseling',
        required: true,
        minLength: 40,
      },
      {
        fieldId: 'multidisciplinaryCoordination',
        fieldLabel: 'Multidisciplinary Coordination',
        sectionId: 'care_coordination',
        sectionTitle: 'Care Coordination',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'barriersToCare',
        fieldLabel: 'Barriers to Care',
        sectionId: 'care_coordination',
        sectionTitle: 'Care Coordination',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'coordinationNarrative',
        fieldLabel: 'Coordination Narrative',
        sectionId: 'care_coordination',
        sectionTitle: 'Care Coordination',
        required: true,
        minLength: 40,
      },
      {
        fieldId: 'referralDetails',
        fieldLabel: 'Referral Details',
        sectionId: 'referrals',
        sectionTitle: 'Referrals',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'referralFollowUp',
        fieldLabel: 'Follow-Up Plan',
        sectionId: 'referrals',
        sectionTitle: 'Referrals',
        required: true,
        minLength: 20,
      },
      {
        fieldId: 'goal1Description',
        fieldLabel: 'Goal 1 Description',
        sectionId: 'goals_planning',
        sectionTitle: 'Goals & Planning',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'goal2Description',
        fieldLabel: 'Goal 2 Description',
        sectionId: 'goals_planning',
        sectionTitle: 'Goals & Planning',
        required: true,
        minLength: 30,
      },
      {
        fieldId: 'nextSessionPlan',
        fieldLabel: 'Next Session Plan',
        sectionId: 'goals_planning',
        sectionTitle: 'Goals & Planning',
        required: true,
        minLength: 20,
      }
    );
  }

  return commonRules;
}
