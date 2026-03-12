/**
 * Home Health Aide (HHA) Clinical Documentation Module
 * 
 * Streamlined documentation system for home health aides
 * Optimized for quick documentation using structured checklists
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
  Droplet,
  Footprints,
  Utensils,
  Eye,
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Home,
  Shirt,
  Bath,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface HHAFormValues {
  // Document metadata
  documentStatus: DocumentStatus;
  patientId: string;
  patientName: string;
  admissionId: string;
  visitDate: string;
  timeIn: string;
  timeOut: string;
  aideName: string;
  aideCredentials: string;
  supervisingNurse: string;

  // Visit Information
  visitType: string;
  accompaniedBy: string;

  // Personal Care Assistance
  careAssistBathing: boolean;
  careAssistShower: boolean;
  careAssistBedBath: boolean;
  careAssistSponge: boolean;
  careAssistHairWash: boolean;
  careAssistOralCare: boolean;
  careAssistShaving: boolean;
  careAssistNailCare: boolean;
  careAssistDressing: boolean;
  careAssistGrooming: boolean;
  careAssistToileting: boolean;
  careAssistIncontinenceCare: boolean;
  careAssistSkinCare: boolean;
  careAssistPositioning: boolean;
  careAssistOther: boolean;
  careAssistOtherDescription: string;
  careRefusedByPatient: string;
  careNotes: string;

  // Mobility Assistance
  mobilityBedToChair: boolean;
  mobilityAmbulation: boolean;
  mobilityStairs: boolean;
  mobilityWalker: boolean;
  mobilityWheelchair: boolean;
  mobilityExercises: boolean;
  mobilityFallPrecautions: boolean;
  mobilityOther: boolean;
  mobilityOtherDescription: string;
  mobilityPatientTolerance: string;
  mobilityNotes: string;

  // Meal Preparation
  mealBreakfastPrep: boolean;
  mealLunchPrep: boolean;
  mealDinnerPrep: boolean;
  mealSnackPrep: boolean;
  mealFeeding: boolean;
  mealFluidEncouragement: boolean;
  mealSpecialDiet: string;
  mealIntakeEstimated: string;
  mealRefusedFood: string;
  mealNotes: string;

  // Observation of Patient Condition
  observationGeneralAppearance: string;
  observationMentalStatus: string;
  observationSkinCondition: string;
  observationRespiratory: string;
  observationMobility: string;
  observationPainReported: string;
  observationPainLevel: string;
  observationPainLocation: string;
  observationVitalsChecked: string;
  observationChangesNoted: string;
  observationNurseNotified: string;
  observationNotes: string;

  // Patient Safety Observations
  safetyHomeEnvironment: string;
  safetyFallRisks: string;
  safetyMedicationVisible: string;
  safetyMedicationOrganized: string;
  safetyFoodAvailable: string;
  safetyUtilitiesWorking: string;
  safetyEmergencyNumbers: string;
  safetyConcernsIdentified: string;
  safetyConcernsDetails: string;
  safetyActionTaken: string;
  safetyNotes: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function HomeHealthAideModule() {
  const navigate = useNavigate();

  return (
    <HHADocumentEditor
      onClose={() => navigate(-1)}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT EDITOR
// ═══════════════════════════════════════════════════════════════════════════

interface HHADocumentEditorProps {
  onClose: () => void;
}

function HHADocumentEditor({ onClose }: HHADocumentEditorProps) {
  const navigate = useNavigate();

  // Form state
  const [values, setValues] = useState<Partial<HHAFormValues>>({
    documentStatus: 'draft',
    patientId: 'pat-99888',
    patientName: 'Dorothy Williams',
    admissionId: 'adm-55443',
    visitDate: new Date().toISOString().split('T')[0],
    timeIn: '08:00',
    timeOut: '09:30',
    aideName: 'Lisa Martinez',
    aideCredentials: 'HHA',
    supervisingNurse: 'Maria Santos, RN',
  });

  const [activeSection, setActiveSection] = useState('visit_information');
  const [showValidation, setShowValidation] = useState(false);

  // Validation
  const validationRules = useMemo(() => createValidationRules(), []);
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
      const value = values[rule.fieldId as keyof HHAFormValues];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, [values, validationRules]);

  const handleFieldChange = (fieldId: keyof HHAFormValues, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    console.log('Saving HHA document...', values);
    alert('HHA visit note saved successfully!');
  };

  const handleSubmit = () => {
    if (!validationResult.canSubmit) {
      setShowValidation(true);
      alert(`Cannot submit: ${validationResult.errorCount} validation errors must be fixed.`);
      return;
    }
    console.log('Submitting HHA document...', values);
    alert('HHA visit note submitted successfully!');
    navigate(-1);
  };

  const sections = [
    'visit_information',
    'personal_care',
    'mobility_assistance',
    'meal_preparation',
    'patient_observations',
    'safety_observations',
  ];

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
                    HHA Visit Note
                  </h1>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    HHA
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
                  const v = values[r.fieldId as keyof HHAFormValues];
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
              {sections.map(sectionId => {
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
                        ? 'bg-green-50 text-green-700 font-medium'
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
              {sections.map(sectionId => {
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
  personal_care: {
    id: 'personal_care',
    title: 'Personal Care',
    icon: Droplet,
  },
  mobility_assistance: {
    id: 'mobility_assistance',
    title: 'Mobility Assistance',
    icon: Footprints,
  },
  meal_preparation: {
    id: 'meal_preparation',
    title: 'Meal Preparation',
    icon: Utensils,
  },
  patient_observations: {
    id: 'patient_observations',
    title: 'Patient Observations',
    icon: Eye,
  },
  safety_observations: {
    id: 'safety_observations',
    title: 'Safety Observations',
    icon: ShieldAlert,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface SectionProps {
  values: Partial<HHAFormValues>;
  onChange: (fieldId: keyof HHAFormValues, value: any) => void;
  validationResult: ValidationResult;
}

function VisitInformationSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-green-600" />
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
              <SelectItem value="routine">Routine Visit</SelectItem>
              <SelectItem value="admission">Admission Visit</SelectItem>
              <SelectItem value="additional">Additional Visit</SelectItem>
              <SelectItem value="substitute">Substitute Aide</SelectItem>
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

        <FormField id="aideName" label="Aide Name" required>
          <Input
            value={values.aideName || ''}
            onChange={(e) => onChange('aideName', e.target.value)}
          />
        </FormField>

        <FormField id="supervisingNurse" label="Supervising Nurse" required>
          <Input
            value={values.supervisingNurse || ''}
            onChange={(e) => onChange('supervisingNurse', e.target.value)}
          />
        </FormField>

        <FormField id="accompaniedBy" label="Accompanied By">
          <Input
            value={values.accompaniedBy || ''}
            onChange={(e) => onChange('accompaniedBy', e.target.value)}
            placeholder="e.g., Family member, Nurse"
          />
        </FormField>
      </div>
    </Card>
  );
}

function PersonalCareSection({ values, onChange }: SectionProps) {
  const careActivities = [
    { id: 'careAssistBathing', label: 'Bathing Assistance', icon: Bath },
    { id: 'careAssistShower', label: 'Shower', icon: Droplet },
    { id: 'careAssistBedBath', label: 'Bed Bath', icon: Droplet },
    { id: 'careAssistSponge', label: 'Sponge Bath', icon: Droplet },
    { id: 'careAssistHairWash', label: 'Hair Washing', icon: Droplet },
    { id: 'careAssistOralCare', label: 'Oral Care/Dentures', icon: User },
    { id: 'careAssistShaving', label: 'Shaving', icon: User },
    { id: 'careAssistNailCare', label: 'Nail Care', icon: User },
    { id: 'careAssistDressing', label: 'Dressing/Undressing', icon: Shirt },
    { id: 'careAssistGrooming', label: 'Hair Grooming', icon: User },
    { id: 'careAssistToileting', label: 'Toileting Assistance', icon: Home },
    { id: 'careAssistIncontinenceCare', label: 'Incontinence Care', icon: Home },
    { id: 'careAssistSkinCare', label: 'Skin Care/Lotion', icon: User },
    { id: 'careAssistPositioning', label: 'Positioning in Bed', icon: Home },
    { id: 'careAssistOther', label: 'Other', icon: CheckCircle2 },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Droplet className="w-5 h-5 text-green-600" />
        Personal Care Assistance
      </h2>
      
      <Alert className="mb-4">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Care Activities</AlertTitle>
        <AlertDescription className="text-xs">
          Check all personal care activities provided during this visit.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {careActivities.map(activity => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={activity.id}
                  checked={values[activity.id as keyof HHAFormValues] as boolean || false}
                  onCheckedChange={(checked) => onChange(activity.id as keyof HHAFormValues, checked)}
                />
                <label
                  htmlFor={activity.id}
                  className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer flex-1"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  {activity.label}
                </label>
              </div>
            );
          })}
        </div>

        {values.careAssistOther && (
          <FormField id="careAssistOtherDescription" label="Other Care Description">
            <Input
              value={values.careAssistOtherDescription || ''}
              onChange={(e) => onChange('careAssistOtherDescription', e.target.value)}
              placeholder="Describe other care provided..."
            />
          </FormField>
        )}

        <FormField id="careRefusedByPatient" label="Care Refused by Patient">
          <Input
            value={values.careRefusedByPatient || ''}
            onChange={(e) => onChange('careRefusedByPatient', e.target.value)}
            placeholder="e.g., Patient refused shower"
          />
        </FormField>

        <FormField id="careNotes" label="Personal Care Notes">
          <Textarea
            value={values.careNotes || ''}
            onChange={(e) => onChange('careNotes', e.target.value)}
            rows={4}
            placeholder="Document any issues, patient response, or special observations during personal care..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function MobilityAssistanceSection({ values, onChange }: SectionProps) {
  const mobilityActivities = [
    { id: 'mobilityBedToChair', label: 'Bed to Chair Transfer' },
    { id: 'mobilityAmbulation', label: 'Ambulation Assistance' },
    { id: 'mobilityStairs', label: 'Stair Assistance' },
    { id: 'mobilityWalker', label: 'Walker Assistance' },
    { id: 'mobilityWheelchair', label: 'Wheelchair Assistance' },
    { id: 'mobilityExercises', label: 'Range of Motion Exercises' },
    { id: 'mobilityFallPrecautions', label: 'Fall Precautions Applied' },
    { id: 'mobilityOther', label: 'Other' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Footprints className="w-5 h-5 text-green-600" />
        Mobility Assistance
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {mobilityActivities.map(activity => (
            <div key={activity.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={activity.id}
                checked={values[activity.id as keyof HHAFormValues] as boolean || false}
                onCheckedChange={(checked) => onChange(activity.id as keyof HHAFormValues, checked)}
              />
              <label
                htmlFor={activity.id}
                className="text-sm font-medium leading-none cursor-pointer flex-1"
              >
                {activity.label}
              </label>
            </div>
          ))}
        </div>

        {values.mobilityOther && (
          <FormField id="mobilityOtherDescription" label="Other Mobility Description">
            <Input
              value={values.mobilityOtherDescription || ''}
              onChange={(e) => onChange('mobilityOtherDescription', e.target.value)}
              placeholder="Describe other mobility assistance..."
            />
          </FormField>
        )}

        <FormField id="mobilityPatientTolerance" label="Patient Tolerance" required>
          <Select
            value={values.mobilityPatientTolerance || ''}
            onValueChange={(v) => onChange('mobilityPatientTolerance', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tolerance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Good - No difficulty</SelectItem>
              <SelectItem value="fair">Fair - Some difficulty</SelectItem>
              <SelectItem value="poor">Poor - Significant difficulty</SelectItem>
              <SelectItem value="unable">Unable to tolerate</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="mobilityNotes" label="Mobility Notes">
          <Textarea
            value={values.mobilityNotes || ''}
            onChange={(e) => onChange('mobilityNotes', e.target.value)}
            rows={4}
            placeholder="Document patient's mobility, any difficulties, falls, or concerns..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function MealPreparationSection({ values, onChange }: SectionProps) {
  const mealActivities = [
    { id: 'mealBreakfastPrep', label: 'Breakfast Prepared' },
    { id: 'mealLunchPrep', label: 'Lunch Prepared' },
    { id: 'mealDinnerPrep', label: 'Dinner Prepared' },
    { id: 'mealSnackPrep', label: 'Snack Prepared' },
    { id: 'mealFeeding', label: 'Feeding Assistance' },
    { id: 'mealFluidEncouragement', label: 'Fluid Encouragement' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-green-600" />
        Meal Preparation & Assistance
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {mealActivities.map(activity => (
            <div key={activity.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <Checkbox
                id={activity.id}
                checked={values[activity.id as keyof HHAFormValues] as boolean || false}
                onCheckedChange={(checked) => onChange(activity.id as keyof HHAFormValues, checked)}
              />
              <label
                htmlFor={activity.id}
                className="text-sm font-medium leading-none cursor-pointer flex-1"
              >
                {activity.label}
              </label>
            </div>
          ))}
        </div>

        <FormField id="mealSpecialDiet" label="Special Diet">
          <Input
            value={values.mealSpecialDiet || ''}
            onChange={(e) => onChange('mealSpecialDiet', e.target.value)}
            placeholder="e.g., Diabetic, Low sodium, Pureed"
          />
        </FormField>

        <FormField id="mealIntakeEstimated" label="Food/Fluid Intake Estimated" required>
          <Select
            value={values.mealIntakeEstimated || ''}
            onValueChange={(v) => onChange('mealIntakeEstimated', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select intake" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="100">100% - All food/fluids consumed</SelectItem>
              <SelectItem value="75">75% - Most consumed</SelectItem>
              <SelectItem value="50">50% - Half consumed</SelectItem>
              <SelectItem value="25">25% - Small amount consumed</SelectItem>
              <SelectItem value="0">0% - Nothing consumed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="mealRefusedFood" label="Food/Fluid Refused">
          <Input
            value={values.mealRefusedFood || ''}
            onChange={(e) => onChange('mealRefusedFood', e.target.value)}
            placeholder="Document if patient refused food or fluids"
          />
        </FormField>

        <FormField id="mealNotes" label="Meal Preparation Notes">
          <Textarea
            value={values.mealNotes || ''}
            onChange={(e) => onChange('mealNotes', e.target.value)}
            rows={4}
            placeholder="Document meals prepared, patient's appetite, feeding assistance, concerns about nutrition..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function PatientObservationsSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-green-600" />
        Observation of Patient Condition
      </h2>
      
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription className="text-xs">
          Document any changes in patient condition. Report concerns to supervising nurse immediately.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <FormField id="observationGeneralAppearance" label="General Appearance" required>
          <Select
            value={values.observationGeneralAppearance || ''}
            onValueChange={(v) => onChange('observationGeneralAppearance', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select appearance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Good - Well groomed, alert</SelectItem>
              <SelectItem value="fair">Fair - Some concerns</SelectItem>
              <SelectItem value="poor">Poor - Appears unwell</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="observationMentalStatus" label="Mental Status" required>
          <Select
            value={values.observationMentalStatus || ''}
            onValueChange={(v) => onChange('observationMentalStatus', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mental status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alert">Alert & Oriented</SelectItem>
              <SelectItem value="confused">Confused</SelectItem>
              <SelectItem value="sleepy">Sleepy/Lethargic</SelectItem>
              <SelectItem value="agitated">Agitated/Upset</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="observationSkinCondition" label="Skin Condition" required>
          <Select
            value={values.observationSkinCondition || ''}
            onValueChange={(v) => onChange('observationSkinCondition', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select skin condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intact">Intact - No concerns</SelectItem>
              <SelectItem value="dry">Dry skin</SelectItem>
              <SelectItem value="redness">Redness noted</SelectItem>
              <SelectItem value="breakdown">Skin breakdown observed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="observationRespiratory" label="Respiratory Status" required>
          <Select
            value={values.observationRespiratory || ''}
            onValueChange={(v) => onChange('observationRespiratory', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select respiratory status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal - No difficulty</SelectItem>
              <SelectItem value="sob">Shortness of breath</SelectItem>
              <SelectItem value="cough">Coughing</SelectItem>
              <SelectItem value="wheezing">Wheezing heard</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="observationMobility" label="Mobility Observation" required>
          <Select
            value={values.observationMobility || ''}
            onValueChange={(v) => onChange('observationMobility', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select mobility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="steady">Steady - No concerns</SelectItem>
              <SelectItem value="unsteady">Unsteady gait</SelectItem>
              <SelectItem value="weakness">Weakness noted</SelectItem>
              <SelectItem value="bedbound">Bedbound</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="observationPainReported" label="Pain Reported" required>
          <RadioGroup
            value={values.observationPainReported || ''}
            onValueChange={(v) => onChange('observationPainReported', v)}
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

        {values.observationPainReported === 'yes' && (
          <>
            <FormField id="observationPainLevel" label="Pain Level (0-10)" required>
              <Input
                type="number"
                min="0"
                max="10"
                value={values.observationPainLevel || ''}
                onChange={(e) => onChange('observationPainLevel', e.target.value)}
                placeholder="0 = No pain, 10 = Worst pain"
              />
            </FormField>

            <FormField id="observationPainLocation" label="Pain Location" required>
              <Input
                value={values.observationPainLocation || ''}
                onChange={(e) => onChange('observationPainLocation', e.target.value)}
                placeholder="e.g., Back, knee, chest"
              />
            </FormField>
          </>
        )}

        <FormField id="observationVitalsChecked" label="Vitals Checked by Aide">
          <RadioGroup
            value={values.observationVitalsChecked || ''}
            onValueChange={(v) => onChange('observationVitalsChecked', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="vitals-yes" />
                <Label htmlFor="vitals-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="vitals-no" />
                <Label htmlFor="vitals-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        <FormField id="observationChangesNoted" label="Changes in Condition Noted" required>
          <RadioGroup
            value={values.observationChangesNoted || ''}
            onValueChange={(v) => onChange('observationChangesNoted', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="changes-yes" />
                <Label htmlFor="changes-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="changes-no" />
                <Label htmlFor="changes-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        {values.observationChangesNoted === 'yes' && (
          <FormField id="observationNurseNotified" label="Nurse Notified" required>
            <RadioGroup
              value={values.observationNurseNotified || ''}
              onValueChange={(v) => onChange('observationNurseNotified', v)}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="notify-yes" />
                  <Label htmlFor="notify-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="notify-no" />
                  <Label htmlFor="notify-no">No</Label>
                </div>
              </div>
            </RadioGroup>
          </FormField>
        )}

        <FormField id="observationNotes" label="Observation Notes" required>
          <Textarea
            value={values.observationNotes || ''}
            onChange={(e) => onChange('observationNotes', e.target.value)}
            rows={5}
            placeholder="Document any observations about patient's condition, changes noted, concerns, or anything unusual..."
          />
        </FormField>
      </div>
    </Card>
  );
}

function SafetyObservationsSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-green-600" />
        Patient Safety Observations
      </h2>
      
      <Alert className="mb-4 border-amber-300 bg-amber-50">
        <ShieldAlert className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Safety First</AlertTitle>
        <AlertDescription className="text-xs text-amber-700">
          Document safety observations and concerns. Report urgent safety issues to supervising nurse immediately.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <FormField id="safetyHomeEnvironment" label="Home Environment" required>
          <Select
            value={values.safetyHomeEnvironment || ''}
            onValueChange={(v) => onChange('safetyHomeEnvironment', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="safe">Safe - Clean and organized</SelectItem>
              <SelectItem value="cluttered">Cluttered</SelectItem>
              <SelectItem value="hazardous">Hazardous conditions noted</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="safetyFallRisks" label="Fall Risks Observed" required>
          <Select
            value={values.safetyFallRisks || ''}
            onValueChange={(v) => onChange('safetyFallRisks', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None observed</SelectItem>
              <SelectItem value="minor">Minor risks (loose rugs, clutter)</SelectItem>
              <SelectItem value="significant">Significant risks noted</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="safetyMedicationVisible" label="Medications Visible/Accessible" required>
          <RadioGroup
            value={values.safetyMedicationVisible || ''}
            onValueChange={(v) => onChange('safetyMedicationVisible', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="med-vis-yes" />
                <Label htmlFor="med-vis-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="med-vis-no" />
                <Label htmlFor="med-vis-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        {values.safetyMedicationVisible === 'yes' && (
          <FormField id="safetyMedicationOrganized" label="Medications Organized" required>
            <RadioGroup
              value={values.safetyMedicationOrganized || ''}
              onValueChange={(v) => onChange('safetyMedicationOrganized', v)}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="med-org-yes" />
                  <Label htmlFor="med-org-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="med-org-no" />
                  <Label htmlFor="med-org-no">No</Label>
                </div>
              </div>
            </RadioGroup>
          </FormField>
        )}

        <FormField id="safetyFoodAvailable" label="Adequate Food Available" required>
          <RadioGroup
            value={values.safetyFoodAvailable || ''}
            onValueChange={(v) => onChange('safetyFoodAvailable', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="food-yes" />
                <Label htmlFor="food-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="food-no" />
                <Label htmlFor="food-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        <FormField id="safetyUtilitiesWorking" label="Utilities Working (heat, water, electric)" required>
          <RadioGroup
            value={values.safetyUtilitiesWorking || ''}
            onValueChange={(v) => onChange('safetyUtilitiesWorking', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="util-yes" />
                <Label htmlFor="util-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="util-no" />
                <Label htmlFor="util-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        <FormField id="safetyEmergencyNumbers" label="Emergency Numbers Posted" required>
          <RadioGroup
            value={values.safetyEmergencyNumbers || ''}
            onValueChange={(v) => onChange('safetyEmergencyNumbers', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="emerg-yes" />
                <Label htmlFor="emerg-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="emerg-no" />
                <Label htmlFor="emerg-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        <FormField id="safetyConcernsIdentified" label="Safety Concerns Identified" required>
          <RadioGroup
            value={values.safetyConcernsIdentified || ''}
            onValueChange={(v) => onChange('safetyConcernsIdentified', v)}
          >
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="concern-yes" />
                <Label htmlFor="concern-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="concern-no" />
                <Label htmlFor="concern-no">No</Label>
              </div>
            </div>
          </RadioGroup>
        </FormField>

        {values.safetyConcernsIdentified === 'yes' && (
          <>
            <FormField id="safetyConcernsDetails" label="Safety Concerns Details" required>
              <Textarea
                value={values.safetyConcernsDetails || ''}
                onChange={(e) => onChange('safetyConcernsDetails', e.target.value)}
                rows={3}
                placeholder="Describe specific safety concerns observed..."
              />
            </FormField>

            <FormField id="safetyActionTaken" label="Action Taken" required>
              <Textarea
                value={values.safetyActionTaken || ''}
                onChange={(e) => onChange('safetyActionTaken', e.target.value)}
                rows={3}
                placeholder="Document action taken (e.g., notified nurse, moved hazard, educated patient)..."
              />
            </FormField>
          </>
        )}

        <FormField id="safetyNotes" label="Additional Safety Notes">
          <Textarea
            value={values.safetyNotes || ''}
            onChange={(e) => onChange('safetyNotes', e.target.value)}
            rows={4}
            placeholder="Document any additional safety observations, concerns, or recommendations..."
          />
        </FormField>
      </div>
    </Card>
  );
}

const SECTION_COMPONENTS = {
  visit_information: VisitInformationSection,
  personal_care: PersonalCareSection,
  mobility_assistance: MobilityAssistanceSection,
  meal_preparation: MealPreparationSection,
  patient_observations: PatientObservationsSection,
  safety_observations: SafetyObservationsSection,
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

function createValidationRules(): FieldValidationRule[] {
  return [
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
      fieldId: 'aideName',
      fieldLabel: 'Aide Name',
      sectionId: 'visit_information',
      sectionTitle: 'Visit Information',
      required: true,
    },
    {
      fieldId: 'supervisingNurse',
      fieldLabel: 'Supervising Nurse',
      sectionId: 'visit_information',
      sectionTitle: 'Visit Information',
      required: true,
    },
    {
      fieldId: 'mobilityPatientTolerance',
      fieldLabel: 'Patient Tolerance',
      sectionId: 'mobility_assistance',
      sectionTitle: 'Mobility Assistance',
      required: true,
    },
    {
      fieldId: 'mealIntakeEstimated',
      fieldLabel: 'Food/Fluid Intake',
      sectionId: 'meal_preparation',
      sectionTitle: 'Meal Preparation',
      required: true,
    },
    {
      fieldId: 'observationGeneralAppearance',
      fieldLabel: 'General Appearance',
      sectionId: 'patient_observations',
      sectionTitle: 'Patient Observations',
      required: true,
    },
    {
      fieldId: 'observationMentalStatus',
      fieldLabel: 'Mental Status',
      sectionId: 'patient_observations',
      sectionTitle: 'Patient Observations',
      required: true,
    },
    {
      fieldId: 'observationSkinCondition',
      fieldLabel: 'Skin Condition',
      sectionId: 'patient_observations',
      sectionTitle: 'Patient Observations',
      required: true,
    },
    {
      fieldId: 'observationRespiratory',
      fieldLabel: 'Respiratory Status',
      sectionId: 'patient_observations',
      sectionTitle: 'Patient Observations',
      required: true,
    },
    {
      fieldId: 'observationMobility',
      fieldLabel: 'Mobility Observation',
      sectionId: 'patient_observations',
      sectionTitle: 'Patient Observations',
      required: true,
    },
    {
      fieldId: 'observationPainReported',
      fieldLabel: 'Pain Reported',
      sectionId: 'patient_observations',
      sectionTitle: 'Patient Observations',
      required: true,
    },
    {
      fieldId: 'observationChangesNoted',
      fieldLabel: 'Changes in Condition',
      sectionId: 'patient_observations',
      sectionTitle: 'Patient Observations',
      required: true,
    },
    {
      fieldId: 'observationNotes',
      fieldLabel: 'Observation Notes',
      sectionId: 'patient_observations',
      sectionTitle: 'Patient Observations',
      required: true,
      minLength: 20,
    },
    {
      fieldId: 'safetyHomeEnvironment',
      fieldLabel: 'Home Environment',
      sectionId: 'safety_observations',
      sectionTitle: 'Safety Observations',
      required: true,
    },
    {
      fieldId: 'safetyFallRisks',
      fieldLabel: 'Fall Risks',
      sectionId: 'safety_observations',
      sectionTitle: 'Safety Observations',
      required: true,
    },
    {
      fieldId: 'safetyMedicationVisible',
      fieldLabel: 'Medications Visible',
      sectionId: 'safety_observations',
      sectionTitle: 'Safety Observations',
      required: true,
    },
    {
      fieldId: 'safetyFoodAvailable',
      fieldLabel: 'Food Available',
      sectionId: 'safety_observations',
      sectionTitle: 'Safety Observations',
      required: true,
    },
    {
      fieldId: 'safetyUtilitiesWorking',
      fieldLabel: 'Utilities Working',
      sectionId: 'safety_observations',
      sectionTitle: 'Safety Observations',
      required: true,
    },
    {
      fieldId: 'safetyEmergencyNumbers',
      fieldLabel: 'Emergency Numbers',
      sectionId: 'safety_observations',
      sectionTitle: 'Safety Observations',
      required: true,
    },
    {
      fieldId: 'safetyConcernsIdentified',
      fieldLabel: 'Safety Concerns',
      sectionId: 'safety_observations',
      sectionTitle: 'Safety Observations',
      required: true,
    },
  ];
}
