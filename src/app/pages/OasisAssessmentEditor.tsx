/**
 * OASIS-E Assessment Editor
 * 
 * Interactive interface for completing OASIS-E assessments
 * Features:
 * - Section-based navigation
 * - Progress tracking
 * - Real-time validation
 * - Auto-save functionality
 * - Guided workflow
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
import {
  ArrowLeft,
  ArrowRight,
  User,
  FileText,
  Home,
  Activity,
  Brain,
  Pill,
  Stethoscope,
  ClipboardList,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  HelpCircle,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  fieldCount: number;
  requiredCount: number;
}

interface ValidationError {
  fieldId: string;
  sectionId: string;
  message: string;
  severity: 'error' | 'warning';
}

interface OasisAssessment {
  id: string;
  status: 'draft' | 'in_progress' | 'completed';
  
  // Values
  values: Record<string, any>;
  
  // Metadata
  lastSaved?: string;
  completedSections: string[];
  validationErrors: ValidationError[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const SECTIONS: Section[] = [
  {
    id: 'patient-info',
    title: 'Patient Information',
    icon: User,
    description: 'Demographics and identification',
    fieldCount: 12,
    requiredCount: 8,
  },
  {
    id: 'clinical-record',
    title: 'Clinical Record Items',
    icon: FileText,
    description: 'Assessment details and tracking',
    fieldCount: 10,
    requiredCount: 6,
  },
  {
    id: 'living-arrangements',
    title: 'Living Arrangements',
    icon: Home,
    description: 'Home environment and support',
    fieldCount: 6,
    requiredCount: 3,
  },
  {
    id: 'functional-status',
    title: 'Functional Status',
    icon: Activity,
    description: 'Mobility and ADL assessment',
    fieldCount: 15,
    requiredCount: 12,
  },
  {
    id: 'cognitive-status',
    title: 'Cognitive Status',
    icon: Brain,
    description: 'Mental status and communication',
    fieldCount: 8,
    requiredCount: 6,
  },
  {
    id: 'medications',
    title: 'Medications',
    icon: Pill,
    description: 'Current medications and allergies',
    fieldCount: 5,
    requiredCount: 2,
  },
  {
    id: 'diagnoses',
    title: 'Diagnoses',
    icon: Stethoscope,
    description: 'Medical diagnoses and history',
    fieldCount: 8,
    requiredCount: 3,
  },
  {
    id: 'care-plan',
    title: 'Care Plan',
    icon: ClipboardList,
    description: 'Goals and interventions',
    fieldCount: 10,
    requiredCount: 5,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function OasisAssessmentEditor() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('patient-info');
  const [values, setValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);

  // Calculate progress
  const progress = useMemo(() => {
    const totalFields = SECTIONS.reduce((sum, section) => sum + section.requiredCount, 0);
    const completedFields = Object.keys(values).filter(key => values[key] !== undefined && values[key] !== '').length;
    return Math.min(Math.round((completedFields / totalFields) * 100), 100);
  }, [values]);

  // Calculate section completion
  const sectionCompletion = useMemo(() => {
    const completion: Record<string, { completed: number; total: number }> = {};
    
    SECTIONS.forEach(section => {
      // Mock calculation - in real app, would check actual fields
      const sectionFields = getSectionFieldIds(section.id);
      const completedCount = sectionFields.filter(fieldId => values[fieldId]).length;
      completion[section.id] = {
        completed: completedCount,
        total: section.requiredCount,
      };
    });
    
    return completion;
  }, [values]);

  // Validate current section
  useEffect(() => {
    const errors = validateSection(activeSection, values);
    setValidationErrors(errors);
  }, [activeSection, values]);

  // Auto-save (mock)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(values).length > 0) {
        setLastSaved(new Date());
        console.log('Auto-saved assessment');
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [values]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleNextSection = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
    if (currentIndex < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[currentIndex + 1].id);
    }
  };

  const handlePreviousSection = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(SECTIONS[currentIndex - 1].id);
    }
  };

  const handleSave = () => {
    setLastSaved(new Date());
    alert('Assessment saved successfully');
  };

  const handleSubmit = () => {
    // Validate all sections
    const allErrors: ValidationError[] = [];
    SECTIONS.forEach(section => {
      const errors = validateSection(section.id, values);
      allErrors.push(...errors);
    });

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      setShowValidationPanel(true);
      alert(`Cannot submit: ${allErrors.length} validation errors found`);
      return;
    }

    alert('Assessment submitted successfully!');
    navigate('/assessment-workspace');
  };

  const currentSectionIndex = SECTIONS.findIndex(s => s.id === activeSection);
  const currentSection = SECTIONS[currentSectionIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  OASIS-E Assessment - Start of Care
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>Margaret Johnson</span>
                  <span>•</span>
                  <span>MRN: MRN-334455</span>
                  <span>•</span>
                  <Calendar className="w-4 h-4" />
                  <span>Assessment Date: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              {validationErrors.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowValidationPanel(!showValidationPanel)}
                  className="text-red-600"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {validationErrors.length} {validationErrors.length === 1 ? 'Error' : 'Errors'}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
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
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold text-gray-900">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-gray-500">
              Section {currentSectionIndex + 1} of {SECTIONS.length}: {currentSection.title}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-72 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Assessment Sections
            </h3>
            <nav className="space-y-1">
              {SECTIONS.map((section, index) => {
                const Icon = section.icon;
                const completion = sectionCompletion[section.id] || { completed: 0, total: section.requiredCount };
                const isComplete = completion.completed >= completion.total;
                const sectionErrors = validationErrors.filter(e => e.sectionId === section.id);
                const hasErrors = sectionErrors.length > 0;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all',
                      activeSection === section.id
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'border-2 border-transparent hover:bg-gray-50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      activeSection === section.id
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        activeSection === section.id ? 'text-blue-600' : 'text-gray-600'
                      )} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'text-xs font-medium',
                          activeSection === section.id ? 'text-blue-900' : 'text-gray-500'
                        )}>
                          Section {index + 1}
                        </span>
                        {isComplete && !hasErrors && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {hasErrors && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className={cn(
                        'font-semibold text-sm mb-1',
                        activeSection === section.id ? 'text-blue-900' : 'text-gray-900'
                      )}>
                        {section.title}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {section.description}
                      </div>
                      
                      {/* Progress for section */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full transition-all',
                              isComplete ? 'bg-green-600' : 'bg-blue-600'
                            )}
                            style={{ width: `${(completion.completed / completion.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {completion.completed}/{completion.total}
                        </span>
                      </div>
                    </div>

                    {/* Arrow for active */}
                    {activeSection === section.id && (
                      <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Form Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    {React.createElement(currentSection.icon, {
                      className: 'w-6 h-6 text-blue-600'
                    })}
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentSection.title}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    {currentSection.description}
                  </p>
                </div>

                {/* Section-specific validation alerts */}
                {validationErrors.filter(e => e.sectionId === activeSection).length > 0 && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-900 text-sm">
                      <strong>Validation Issues:</strong> This section has {validationErrors.filter(e => e.sectionId === activeSection).length} incomplete or invalid field(s)
                    </AlertDescription>
                  </Alert>
                )}

                {/* Section Content */}
                {activeSection === 'patient-info' && (
                  <PatientInfoSection values={values} onChange={handleFieldChange} errors={validationErrors} />
                )}
                {activeSection === 'clinical-record' && (
                  <ClinicalRecordSection values={values} onChange={handleFieldChange} errors={validationErrors} />
                )}
                {activeSection === 'living-arrangements' && (
                  <LivingArrangementsSection values={values} onChange={handleFieldChange} errors={validationErrors} />
                )}
                {activeSection === 'functional-status' && (
                  <FunctionalStatusSection values={values} onChange={handleFieldChange} errors={validationErrors} />
                )}
                {activeSection === 'cognitive-status' && (
                  <CognitiveStatusSection values={values} onChange={handleFieldChange} errors={validationErrors} />
                )}
                {activeSection === 'medications' && (
                  <MedicationsSection values={values} onChange={handleFieldChange} errors={validationErrors} />
                )}
                {activeSection === 'diagnoses' && (
                  <DiagnosesSection values={values} onChange={handleFieldChange} errors={validationErrors} />
                )}
                {activeSection === 'care-plan' && (
                  <CarePlanSection values={values} onChange={handleFieldChange} errors={validationErrors} />
                )}
              </Card>
            </div>
          </ScrollArea>

          {/* Navigation Footer */}
          <div className="bg-white border-t p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousSection}
                disabled={currentSectionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Section
              </Button>

              <div className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {SECTIONS.length}
              </div>

              <Button
                onClick={handleNextSection}
                disabled={currentSectionIndex === SECTIONS.length - 1}
              >
                Next Section
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Validation Panel (if shown) */}
        {showValidationPanel && (
          <div className="w-80 bg-white border-l overflow-y-auto">
            <ValidationPanel
              errors={validationErrors}
              onClose={() => setShowValidationPanel(false)}
              onNavigate={(fieldId, sectionId) => {
                setActiveSection(sectionId);
                setShowValidationPanel(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface SectionProps {
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors: ValidationError[];
}

function PatientInfoSection({ values, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        id="firstName"
        label="First Name"
        required
        helpText="Patient's legal first name"
        value={values.firstName}
        onChange={onChange}
        error={errors.find(e => e.fieldId === 'firstName')}
      >
        <Input
          value={values.firstName || ''}
          onChange={(e) => onChange('firstName', e.target.value)}
          placeholder="Enter first name"
        />
      </FormField>

      <FormField
        id="lastName"
        label="Last Name"
        required
        value={values.lastName}
        onChange={onChange}
        error={errors.find(e => e.fieldId === 'lastName')}
      >
        <Input
          value={values.lastName || ''}
          onChange={(e) => onChange('lastName', e.target.value)}
          placeholder="Enter last name"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          id="dateOfBirth"
          label="Date of Birth"
          required
          value={values.dateOfBirth}
          onChange={onChange}
          error={errors.find(e => e.fieldId === 'dateOfBirth')}
        >
          <Input
            type="date"
            value={values.dateOfBirth || ''}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
          />
        </FormField>

        <FormField
          id="gender"
          label="Gender (M0069)"
          required
          helpText="CMS required field"
          value={values.gender}
          onChange={onChange}
          error={errors.find(e => e.fieldId === 'gender')}
        >
          <RadioGroup
            value={values.gender}
            onValueChange={(value) => onChange('gender', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="male" />
              <Label htmlFor="male">1 - Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="female" />
              <Label htmlFor="female">2 - Female</Label>
            </div>
          </RadioGroup>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          id="medicare"
          label="Medicare Number (M0063)"
          helpText="Include suffix"
          value={values.medicare}
          onChange={onChange}
        >
          <Input
            value={values.medicare || ''}
            onChange={(e) => onChange('medicare', e.target.value)}
            placeholder="1AA2BB3CC44"
          />
        </FormField>

        <FormField
          id="medicaid"
          label="Medicaid Number (M0065)"
          value={values.medicaid}
          onChange={onChange}
        >
          <Input
            value={values.medicaid || ''}
            onChange={(e) => onChange('medicaid', e.target.value)}
            placeholder="Enter Medicaid number"
          />
        </FormField>
      </div>

      <FormField
        id="address"
        label="Street Address"
        required
        value={values.address}
        onChange={onChange}
      >
        <Input
          value={values.address || ''}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="Street address"
        />
      </FormField>

      <div className="grid grid-cols-3 gap-6">
        <FormField
          id="city"
          label="City"
          required
          value={values.city}
          onChange={onChange}
        >
          <Input
            value={values.city || ''}
            onChange={(e) => onChange('city', e.target.value)}
          />
        </FormField>

        <FormField
          id="state"
          label="State (M0060)"
          required
          value={values.state}
          onChange={onChange}
        >
          <Select value={values.state} onValueChange={(v) => onChange('state', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="TX">Texas</SelectItem>
              <SelectItem value="FL">Florida</SelectItem>
              <SelectItem value="NY">New York</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id="zipCode"
          label="ZIP Code"
          required
          value={values.zipCode}
          onChange={onChange}
        >
          <Input
            value={values.zipCode || ''}
            onChange={(e) => onChange('zipCode', e.target.value)}
            placeholder="94102"
          />
        </FormField>
      </div>
    </div>
  );
}

function ClinicalRecordSection({ values, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        id="M0100"
        label="M0100 - Reason for Assessment"
        required
        helpText="Select the primary reason for this OASIS assessment"
        value={values.M0100}
        onChange={onChange}
        error={errors.find(e => e.fieldId === 'M0100')}
      >
        <RadioGroup
          value={values.M0100}
          onValueChange={(value) => onChange('M0100', value)}
        >
          <div className="space-y-3">
            <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="01" id="soc" />
              <Label htmlFor="soc" className="cursor-pointer flex-1">
                <div className="font-medium">01 - Start of care</div>
                <div className="text-xs text-gray-600">Further visits planned</div>
              </Label>
            </div>
            <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="03" id="roc" />
              <Label htmlFor="roc" className="cursor-pointer flex-1">
                <div className="font-medium">03 - Resumption of care</div>
                <div className="text-xs text-gray-600">After inpatient stay</div>
              </Label>
            </div>
            <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="04" id="recert" />
              <Label htmlFor="recert" className="cursor-pointer flex-1">
                <div className="font-medium">04 - Recertification (follow-up)</div>
                <div className="text-xs text-gray-600">60-day reassessment</div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          id="M0030"
          label="M0030 - Start of Care Date"
          required
          helpText="First billable visit date"
          value={values.M0030}
          onChange={onChange}
        >
          <Input
            type="date"
            value={values.M0030 || ''}
            onChange={(e) => onChange('M0030', e.target.value)}
          />
        </FormField>

        <FormField
          id="M0110"
          label="M0110 - Assessment Completion Date"
          required
          value={values.M0110}
          onChange={onChange}
        >
          <Input
            type="date"
            value={values.M0110 || ''}
            onChange={(e) => onChange('M0110', e.target.value)}
          />
        </FormField>
      </div>

      <FormField
        id="M1000"
        label="M1000 - Inpatient Facility Admission"
        required
        helpText="Has the patient been admitted to an inpatient facility?"
        value={values.M1000}
        onChange={onChange}
      >
        <RadioGroup
          value={values.M1000}
          onValueChange={(value) => onChange('M1000', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="no-inpatient" />
            <Label htmlFor="no-inpatient">0 - No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="yes-inpatient" />
            <Label htmlFor="yes-inpatient">1 - Yes</Label>
          </div>
        </RadioGroup>
      </FormField>

      {values.M1000 === '1' && (
        <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-4">
          <FormField
            id="inpatientFacility"
            label="Inpatient Facility Name"
            required
            value={values.inpatientFacility}
            onChange={onChange}
          >
            <Input
              value={values.inpatientFacility || ''}
              onChange={(e) => onChange('inpatientFacility', e.target.value)}
              placeholder="Enter facility name"
            />
          </FormField>

          <FormField
            id="M1011"
            label="M1011 - Inpatient Discharge Date"
            required
            value={values.M1011}
            onChange={onChange}
          >
            <Input
              type="date"
              value={values.M1011 || ''}
              onChange={(e) => onChange('M1011', e.target.value)}
            />
          </FormField>
        </div>
      )}
    </div>
  );
}

function LivingArrangementsSection({ values, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        id="M1100"
        label="M1100 - Patient Living Situation"
        required
        helpText="Current living arrangement"
        value={values.M1100}
        onChange={onChange}
      >
        <RadioGroup
          value={values.M1100}
          onValueChange={(value) => onChange('M1100', value)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="01" id="lives-alone" />
              <Label htmlFor="lives-alone">01 - Patient lives alone</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="02" id="lives-with-others" />
              <Label htmlFor="lives-with-others">02 - Patient lives with other person(s) in the home</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="03" id="congregate" />
              <Label htmlFor="congregate">03 - Patient lives in congregate situation</Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      {values.M1100 === '02' && (
        <FormField
          id="householdMembers"
          label="Household Members"
          helpText="List all persons living in the home"
          value={values.householdMembers}
          onChange={onChange}
        >
          <Textarea
            value={values.householdMembers || ''}
            onChange={(e) => onChange('householdMembers', e.target.value)}
            placeholder="e.g., Daughter (Sarah), Son-in-law (Michael), Two grandchildren"
            rows={3}
          />
        </FormField>
      )}

      <FormField
        id="primaryCaregiver"
        label="Primary Caregiver"
        value={values.primaryCaregiver}
        onChange={onChange}
      >
        <Input
          value={values.primaryCaregiver || ''}
          onChange={(e) => onChange('primaryCaregiver', e.target.value)}
          placeholder="Name and relationship"
        />
      </FormField>

      <FormField
        id="homeEnvironment"
        label="Home Environment Assessment"
        helpText="Describe home type, accessibility features, safety hazards"
        value={values.homeEnvironment}
        onChange={onChange}
      >
        <Textarea
          value={values.homeEnvironment || ''}
          onChange={(e) => onChange('homeEnvironment', e.target.value)}
          placeholder="Describe the home environment..."
          rows={4}
          />
      </FormField>
    </div>
  );
}

function FunctionalStatusSection({ values, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        id="M1200"
        label="M1200 - Vision"
        required
        helpText="Current ability to see (with corrective lenses if used)"
        value={values.M1200}
        onChange={onChange}
      >
        <RadioGroup
          value={values.M1200}
          onValueChange={(value) => onChange('M1200', value)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="vision-0" />
              <Label htmlFor="vision-0">0 - Normal - sees adequately in most situations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="vision-1" />
              <Label htmlFor="vision-1">1 - Partially impaired - can see but not clearly</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="vision-2" />
              <Label htmlFor="vision-2">2 - Severely impaired - large objects only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="vision-3" />
              <Label htmlFor="vision-3">3 - Blind - no useful vision</Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      <FormField
        id="ambulation"
        label="Ambulation Status"
        required
        helpText="Describe current ambulation ability and assistive devices"
        value={values.ambulation}
        onChange={onChange}
      >
        <Textarea
          value={values.ambulation || ''}
          onChange={(e) => onChange('ambulation', e.target.value)}
          placeholder="Describe ambulation status, distance, devices used..."
          rows={3}
        />
      </FormField>

      <FormField
        id="fallRisk"
        label="Fall Risk Assessment"
        required
        value={values.fallRisk}
        onChange={onChange}
      >
        <RadioGroup
          value={values.fallRisk}
          onValueChange={(value) => onChange('fallRisk', value)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="low" id="fall-low" />
              <Label htmlFor="fall-low" className="flex-1 cursor-pointer">
                <div className="font-medium">Low Risk</div>
                <div className="text-xs text-gray-600">No fall history, stable gait</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="moderate" id="fall-moderate" />
              <Label htmlFor="fall-moderate" className="flex-1 cursor-pointer">
                <div className="font-medium">Moderate Risk</div>
                <div className="text-xs text-gray-600">Some risk factors present</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="high" id="fall-high" />
              <Label htmlFor="fall-high" className="flex-1 cursor-pointer">
                <div className="font-medium">High Risk</div>
                <div className="text-xs text-gray-600">Multiple risk factors or recent falls</div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      <div className="p-4 border-2 rounded-lg bg-gray-50">
        <h4 className="font-semibold mb-3">Activities of Daily Living (ADLs)</h4>
        <div className="space-y-4">
          {['Bathing', 'Dressing', 'Toileting', 'Eating'].map(adl => (
            <FormField
              key={adl.toLowerCase()}
              id={`adl_${adl.toLowerCase()}`}
              label={adl}
              value={values[`adl_${adl.toLowerCase()}`]}
              onChange={onChange}
            >
              <Select
                value={values[`adl_${adl.toLowerCase()}`]}
                onValueChange={(v) => onChange(`adl_${adl.toLowerCase()}`, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level of assistance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent</SelectItem>
                  <SelectItem value="supervision">Supervision needed</SelectItem>
                  <SelectItem value="minimal">Minimal assistance</SelectItem>
                  <SelectItem value="moderate">Moderate assistance</SelectItem>
                  <SelectItem value="total">Total assistance</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          ))}
        </div>
      </div>
    </div>
  );
}

function CognitiveStatusSection({ values, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        id="M1700"
        label="M1700 - Cognitive Functioning"
        required
        helpText="Patient's current level of alertness and orientation"
        value={values.M1700}
        onChange={onChange}
      >
        <RadioGroup
          value={values.M1700}
          onValueChange={(value) => onChange('M1700', value)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="cog-0" />
              <Label htmlFor="cog-0">0 - Alert/oriented, able to focus and shift attention</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="cog-1" />
              <Label htmlFor="cog-1">1 - Requires prompting</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="cog-2" />
              <Label htmlFor="cog-2">2 - Requires assistance and some direction</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="cog-3" />
              <Label htmlFor="cog-3">3 - Requires considerable assistance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="cog-4" />
              <Label htmlFor="cog-4">4 - Totally dependent</Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>

      <div className="p-4 border-2 rounded-lg bg-gray-50">
        <h4 className="font-semibold mb-3">Orientation</h4>
        <div className="space-y-3">
          {[
            { id: 'oriented_person', label: 'Oriented to Person' },
            { id: 'oriented_place', label: 'Oriented to Place' },
            { id: 'oriented_time', label: 'Oriented to Time' },
            { id: 'oriented_situation', label: 'Oriented to Situation' },
          ].map(item => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={values[item.id] || false}
                onCheckedChange={(checked) => onChange(item.id, checked)}
              />
              <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <FormField
        id="memory"
        label="Memory Assessment"
        helpText="Describe short-term and long-term memory function"
        value={values.memory}
        onChange={onChange}
      >
        <Textarea
          value={values.memory || ''}
          onChange={(e) => onChange('memory', e.target.value)}
          placeholder="Document memory assessment..."
          rows={3}
        />
      </FormField>

      <FormField
        id="M1220"
        label="M1220 - Understanding of Verbal Content"
        required
        value={values.M1220}
        onChange={onChange}
      >
        <RadioGroup
          value={values.M1220}
          onValueChange={(value) => onChange('M1220', value)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="understand-0" />
              <Label htmlFor="understand-0">0 - Understands - clear comprehension</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="understand-1" />
              <Label htmlFor="understand-1">1 - Usually understands</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="understand-2" />
              <Label htmlFor="understand-2">2 - Sometimes understands</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="understand-3" />
              <Label htmlFor="understand-3">3 - Rarely understands</Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>
    </div>
  );
}

function MedicationsSection({ values, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          List all current medications including prescription, over-the-counter, and supplements.
        </AlertDescription>
      </Alert>

      <FormField
        id="medicationList"
        label="Current Medications"
        required
        helpText="List all medications with dosage and frequency"
        value={values.medicationList}
        onChange={onChange}
      >
        <Textarea
          value={values.medicationList || ''}
          onChange={(e) => onChange('medicationList', e.target.value)}
          placeholder="Medication Name | Dosage | Frequency | Route&#10;Example: Lisinopril 10mg | Once daily | Oral"
          rows={8}
        />
      </FormField>

      <FormField
        id="drugAllergies"
        label="Drug Allergies"
        helpText="List all known drug allergies and reactions"
        value={values.drugAllergies}
        onChange={onChange}
      >
        <Textarea
          value={values.drugAllergies || ''}
          onChange={(e) => onChange('drugAllergies', e.target.value)}
          placeholder="Allergen | Reaction | Severity&#10;Example: Penicillin | Rash, hives | Moderate"
          rows={4}
        />
      </FormField>

      <FormField
        id="medicationCompliance"
        label="Medication Compliance"
        required
        value={values.medicationCompliance}
        onChange={onChange}
      >
        <RadioGroup
          value={values.medicationCompliance}
          onValueChange={(value) => onChange('medicationCompliance', value)}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compliant" id="med-compliant" />
              <Label htmlFor="med-compliant">Compliant - Taking as prescribed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partial" id="med-partial" />
              <Label htmlFor="med-partial">Partially Compliant - Missing some doses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="non-compliant" id="med-non" />
              <Label htmlFor="med-non">Non-Compliant - Not taking medications</Label>
            </div>
          </div>
        </RadioGroup>
      </FormField>
    </div>
  );
}

function DiagnosesSection({ values, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        id="M1021"
        label="M1021 - Primary Diagnosis"
        required
        helpText="ICD-10 code most related to current plan of care"
        value={values.M1021}
        onChange={onChange}
        error={errors.find(e => e.fieldId === 'M1021')}
      >
        <div className="space-y-2">
          <Input
            value={values.M1021 || ''}
            onChange={(e) => onChange('M1021', e.target.value)}
            placeholder="ICD-10 Code (e.g., Z47.1)"
          />
          <Input
            value={values.M1021_description || ''}
            onChange={(e) => onChange('M1021_description', e.target.value)}
            placeholder="Diagnosis description"
          />
        </div>
      </FormField>

      {[1, 2, 3, 4].map(num => (
        <FormField
          key={`M102${num + 2}`}
          id={`M102${num + 2}`}
          label={`M102${num + 2} - Other Diagnosis #${num}`}
          helpText="ICD-10 code for other pertinent diagnoses"
          value={values[`M102${num + 2}`]}
          onChange={onChange}
        >
          <div className="space-y-2">
            <Input
              value={values[`M102${num + 2}`] || ''}
              onChange={(e) => onChange(`M102${num + 2}`, e.target.value)}
              placeholder="ICD-10 Code"
            />
            <Input
              value={values[`M102${num + 2}_description`] || ''}
              onChange={(e) => onChange(`M102${num + 2}_description`, e.target.value)}
              placeholder="Diagnosis description"
            />
          </div>
        </FormField>
      ))}

      <FormField
        id="surgicalHistory"
        label="Surgical History"
        helpText="Recent surgical procedures relevant to current care"
        value={values.surgicalHistory}
        onChange={onChange}
      >
        <Textarea
          value={values.surgicalHistory || ''}
          onChange={(e) => onChange('surgicalHistory', e.target.value)}
          placeholder="Procedure | Date&#10;Example: Right total hip arthroplasty | 02/25/2026"
          rows={4}
        />
      </FormField>
    </div>
  );
}

function CarePlanSection({ values, onChange, errors }: SectionProps) {
  return (
    <div className="space-y-6">
      <Alert className="border-green-200 bg-green-50">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900 text-sm">
          Document patient-centered goals with specific, measurable outcomes and timeframes.
        </AlertDescription>
      </Alert>

      <FormField
        id="goal1"
        label="Goal #1"
        required
        helpText="Specific, measurable goal with timeframe"
        value={values.goal1}
        onChange={onChange}
      >
        <Textarea
          value={values.goal1 || ''}
          onChange={(e) => onChange('goal1', e.target.value)}
          placeholder="Goal statement | Discipline | Timeframe | Target Date&#10;Example: Patient will ambulate independently with walker for 150+ feet | PT | 60 days | 05/01/2026"
          rows={3}
        />
      </FormField>

      <FormField
        id="goal2"
        label="Goal #2"
        required
        value={values.goal2}
        onChange={onChange}
      >
        <Textarea
          value={values.goal2 || ''}
          onChange={(e) => onChange('goal2', e.target.value)}
          placeholder="Goal statement | Discipline | Timeframe | Target Date"
          rows={3}
        />
      </FormField>

      <FormField
        id="goal3"
        label="Goal #3"
        value={values.goal3}
        onChange={onChange}
      >
        <Textarea
          value={values.goal3 || ''}
          onChange={(e) => onChange('goal3', e.target.value)}
          placeholder="Goal statement | Discipline | Timeframe | Target Date"
          rows={3}
        />
      </FormField>

      <div className="p-4 border-2 rounded-lg bg-gray-50">
        <h4 className="font-semibold mb-3">Disciplines Involved</h4>
        <div className="space-y-2">
          {[
            { id: 'sn', label: 'Skilled Nursing (SN)' },
            { id: 'pt', label: 'Physical Therapy (PT)' },
            { id: 'ot', label: 'Occupational Therapy (OT)' },
            { id: 'st', label: 'Speech Therapy (ST)' },
            { id: 'msw', label: 'Medical Social Work (MSW)' },
            { id: 'hha', label: 'Home Health Aide (HHA)' },
          ].map(disc => (
            <div key={disc.id} className="flex items-center space-x-2">
              <Checkbox
                id={`discipline_${disc.id}`}
                checked={values[`discipline_${disc.id}`] || false}
                onCheckedChange={(checked) => onChange(`discipline_${disc.id}`, checked)}
              />
              <Label htmlFor={`discipline_${disc.id}`} className="cursor-pointer">{disc.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <FormField
        id="planDuration"
        label="Plan Duration"
        required
        value={values.planDuration}
        onChange={onChange}
      >
        <Select value={values.planDuration} onValueChange={(v) => onChange('planDuration', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="60">60 days (2 months)</SelectItem>
            <SelectItem value="90">90 days (3 months)</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        id="specialInstructions"
        label="Special Instructions"
        helpText="Any special considerations or safety precautions"
        value={values.specialInstructions}
        onChange={onChange}
      >
        <Textarea
          value={values.specialInstructions || ''}
          onChange={(e) => onChange('specialInstructions', e.target.value)}
          placeholder="Document special instructions, precautions, or considerations..."
          rows={4}
        />
      </FormField>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FORM FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  helpText?: string;
  value: any;
  onChange: (fieldId: string, value: any) => void;
  error?: ValidationError;
  children: React.ReactNode;
}

function FormField({ id, label, required, helpText, error, children }: FormFieldProps) {
  return (
    <div className={cn(
      'space-y-2 p-4 rounded-lg border-2 transition-colors',
      error ? 'border-red-300 bg-red-50' : 'border-transparent'
    )}>
      <div className="flex items-start justify-between">
        <Label htmlFor={id} className="text-sm font-semibold text-gray-900">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </Label>
        {helpText && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <HelpCircle className="w-3 h-3" />
            <span>{helpText}</span>
          </div>
        )}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-700">
          <AlertCircle className="w-3 h-3" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationPanelProps {
  errors: ValidationError[];
  onClose: () => void;
  onNavigate: (fieldId: string, sectionId: string) => void;
}

function ValidationPanel({ errors, onClose, onNavigate }: ValidationPanelProps) {
  const errorsBySeverity = useMemo(() => {
    const grouped = {
      error: errors.filter(e => e.severity === 'error'),
      warning: errors.filter(e => e.severity === 'warning'),
    };
    return grouped;
  }, [errors]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Validation Issues</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {errorsBySeverity.error.length} errors, {errorsBySeverity.warning.length} warnings
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {errorsBySeverity.error.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-900 mb-2">Errors</h4>
              <div className="space-y-2">
                {errorsBySeverity.error.map((error, index) => (
                  <button
                    key={index}
                    onClick={() => onNavigate(error.fieldId, error.sectionId)}
                    className="w-full text-left p-3 border-2 border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-red-900">{error.fieldId}</div>
                        <div className="text-xs text-red-700">{error.message}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-red-600 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorsBySeverity.warning.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-900 mb-2">Warnings</h4>
              <div className="space-y-2">
                {errorsBySeverity.warning.map((error, index) => (
                  <button
                    key={index}
                    onClick={() => onNavigate(error.fieldId, error.sectionId)}
                    className="w-full text-left p-3 border-2 border-amber-200 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-amber-900">{error.fieldId}</div>
                        <div className="text-xs text-amber-700">{error.message}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getSectionFieldIds(sectionId: string): string[] {
  // Mock function - in real app, would return actual field IDs for section
  const fieldMappings: Record<string, string[]> = {
    'patient-info': ['firstName', 'lastName', 'dateOfBirth', 'gender', 'address', 'city', 'state', 'zipCode'],
    'clinical-record': ['M0100', 'M0030', 'M0110', 'M1000'],
    'living-arrangements': ['M1100', 'primaryCaregiver'],
    'functional-status': ['M1200', 'ambulation', 'fallRisk'],
    'cognitive-status': ['M1700', 'memory', 'M1220'],
    'medications': ['medicationList', 'medicationCompliance'],
    'diagnoses': ['M1021'],
    'care-plan': ['goal1', 'goal2', 'planDuration'],
  };
  
  return fieldMappings[sectionId] || [];
}

function validateSection(sectionId: string, values: Record<string, any>): ValidationError[] {
  const errors: ValidationError[] = [];
  const fieldIds = getSectionFieldIds(sectionId);

  // Mock validation - in real app, would use actual validation rules
  fieldIds.forEach(fieldId => {
    if (!values[fieldId] || values[fieldId] === '') {
      errors.push({
        fieldId,
        sectionId,
        message: 'This field is required',
        severity: 'error',
      });
    }
  });

  // Additional validation examples
  if (sectionId === 'patient-info' && values.zipCode && !/^\d{5}$/.test(values.zipCode)) {
    errors.push({
      fieldId: 'zipCode',
      sectionId: 'patient-info',
      message: 'ZIP code must be 5 digits',
      severity: 'error',
    });
  }

  if (sectionId === 'diagnoses' && values.M1021 && !/^[A-Z]\d{2}/.test(values.M1021)) {
    errors.push({
      fieldId: 'M1021',
      sectionId: 'diagnoses',
      message: 'Must be valid ICD-10 format (e.g., Z47.1)',
      severity: 'error',
    });
  }

  return errors;
}
