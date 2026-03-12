/**
 * Admission Setup Wizard
 * 
 * Multi-step wizard to guide staff through admission creation process.
 * 
 * Steps:
 * 1. Patient Information
 * 2. Insurance
 * 3. Physician Assignment
 * 4. Diagnoses
 * 5. Disciplines
 * 6. Authorization
 * 
 * Features:
 * - Progress indicator
 * - Validation per step
 * - Save draft functionality
 * - Resume from saved draft
 * - Integration with admission readiness
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  X,
  FileText,
  Shield,
  Stethoscope,
  Activity,
  Users,
  FileCheck,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

// Import step components
import PatientInfoStep from './wizard-steps/PatientInfoStep';
import InsuranceStep from './wizard-steps/InsuranceStep';
import PhysicianStep from './wizard-steps/PhysicianStep';
import DiagnosesStep from './wizard-steps/DiagnosesStep';
import DisciplinesStep from './wizard-steps/DisciplinesStep';
import AuthorizationStep from './wizard-steps/AuthorizationStep';

// ==================== TYPE DEFINITIONS ====================

export interface WizardStep {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<WizardStepProps>;
  isComplete: boolean;
  isValid: boolean;
  hasErrors: boolean;
}

export interface WizardStepProps {
  data: AdmissionWizardData;
  onChange: (data: Partial<AdmissionWizardData>) => void;
  onValidationChange: (isValid: boolean) => void;
  onNext?: () => void;
}

export interface AdmissionWizardData {
  // Step 1: Patient Information
  patient_id?: string;
  patient_search?: string;
  selected_patient?: any;
  admission_date: string;
  start_of_care_date: string;
  service_type: 'Home Health' | 'Hospice' | '';
  referral_source: string;
  referral_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  
  // Step 2: Insurance
  primary_payer_id: string;
  primary_payer_name: string;
  primary_policy_number: string;
  primary_group_number: string;
  secondary_payer_id: string;
  secondary_payer_name: string;
  secondary_policy_number: string;
  secondary_group_number: string;
  
  // Step 3: Physician
  attending_physician_id: string;
  attending_physician_name: string;
  physician_npi: string;
  physician_phone: string;
  referring_physician_id: string;
  referring_physician_name: string;
  
  // Step 4: Diagnoses
  primary_diagnosis_code: string;
  primary_diagnosis_description: string;
  secondary_diagnoses: Array<{
    code: string;
    description: string;
  }>;
  
  // Step 5: Disciplines
  disciplines: Array<{
    discipline: string;
    frequency: string;
    duration: string;
    visits_per_week: number;
  }>;
  
  // Step 6: Authorization
  authorization_required: boolean;
  authorization_number: string;
  authorization_start_date: string;
  authorization_end_date: string;
  authorized_visits: number;
  authorization_status: 'pending' | 'approved' | 'denied' | 'not_required';
  
  // Metadata
  draft_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// ==================== STEP CONFIGURATIONS ====================

const WIZARD_STEPS: Omit<WizardStep, 'isComplete' | 'isValid' | 'hasErrors'>[] = [
  {
    id: 'patient_info',
    number: 1,
    title: 'Patient Information',
    shortTitle: 'Patient',
    icon: FileText,
    component: PatientInfoStep,
  },
  {
    id: 'insurance',
    number: 2,
    title: 'Insurance Information',
    shortTitle: 'Insurance',
    icon: Shield,
    component: InsuranceStep,
  },
  {
    id: 'physician',
    number: 3,
    title: 'Physician Assignment',
    shortTitle: 'Physician',
    icon: Stethoscope,
    component: PhysicianStep,
  },
  {
    id: 'diagnoses',
    number: 4,
    title: 'Diagnoses',
    shortTitle: 'Diagnoses',
    icon: Activity,
    component: DiagnosesStep,
  },
  {
    id: 'disciplines',
    number: 5,
    title: 'Disciplines & Frequencies',
    shortTitle: 'Disciplines',
    icon: Users,
    component: DisciplinesStep,
  },
  {
    id: 'authorization',
    number: 6,
    title: 'Authorization',
    shortTitle: 'Authorization',
    icon: FileCheck,
    component: AuthorizationStep,
  },
];

// ==================== INITIAL DATA ====================

const getInitialData = (): AdmissionWizardData => ({
  admission_date: new Date().toISOString().split('T')[0],
  start_of_care_date: new Date().toISOString().split('T')[0],
  service_type: '',
  referral_source: '',
  referral_date: new Date().toISOString().split('T')[0],
  emergency_contact_name: '',
  emergency_contact_phone: '',
  primary_payer_id: '',
  primary_payer_name: '',
  primary_policy_number: '',
  primary_group_number: '',
  secondary_payer_id: '',
  secondary_payer_name: '',
  secondary_policy_number: '',
  secondary_group_number: '',
  attending_physician_id: '',
  attending_physician_name: '',
  physician_npi: '',
  physician_phone: '',
  referring_physician_id: '',
  referring_physician_name: '',
  primary_diagnosis_code: '',
  primary_diagnosis_description: '',
  secondary_diagnoses: [],
  disciplines: [],
  authorization_required: true,
  authorization_number: '',
  authorization_start_date: '',
  authorization_end_date: '',
  authorized_visits: 0,
  authorization_status: 'pending',
});

// ==================== MAIN WIZARD COMPONENT ====================

interface AdmissionSetupWizardProps {
  draftId?: string;
  onComplete?: (admission: any) => void;
  onCancel?: () => void;
}

export default function AdmissionSetupWizard({
  draftId,
  onComplete,
  onCancel,
}: AdmissionSetupWizardProps) {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<AdmissionWizardData>(getInitialData());
  const [stepValidation, setStepValidation] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load draft on mount if draftId provided
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId);
    }
  }, [draftId]);

  const loadDraft = async (id: string) => {
    try {
      setLoading(true);
      // TODO: Load from dataGateway
      // const draft = await dataGateway.loadAdmissionDraft(id);
      // setWizardData(draft);
      toast.success('Draft loaded successfully');
    } catch (error) {
      console.error('Error loading draft:', error);
      toast.error('Failed to load draft');
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = useCallback((updates: Partial<AdmissionWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  }, []);

  const handleValidationChange = useCallback((stepId: string, isValid: boolean) => {
    setStepValidation(prev => ({ ...prev, [stepId]: isValid }));
  }, []);

  const isCurrentStepValid = () => {
    const step = WIZARD_STEPS[currentStep];
    return stepValidation[step.id] !== false; // Default to true if not set
  };

  const handleNext = () => {
    if (!isCurrentStepValid()) {
      toast.error('Please complete all required fields before continuing');
      return;
    }

    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to previous steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      
      // TODO: Save to dataGateway
      // const draftId = await dataGateway.saveAdmissionDraft(wizardData);
      
      setHasUnsavedChanges(false);
      toast.success('Draft saved successfully', {
        description: 'You can continue later from where you left off.',
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!isCurrentStepValid()) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Create admission via dataGateway
      // const admission = await dataGateway.createAdmission(wizardData);
      
      toast.success('Admission created successfully!', {
        description: 'The admission has been added to the system.',
      });
      
      setHasUnsavedChanges(false);
      
      if (onComplete) {
        onComplete(wizardData);
      } else {
        navigate('/admission-pipeline');
      }
    } catch (error) {
      console.error('Error creating admission:', error);
      toast.error('Failed to create admission');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      if (onCancel) {
        onCancel();
      } else {
        navigate('/admission-pipeline');
      }
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    if (onCancel) {
      onCancel();
    } else {
      navigate('/admission-pipeline');
    }
  };

  // Calculate progress
  const completedSteps = Object.values(stepValidation).filter(v => v).length;
  const progressPercentage = Math.round((completedSteps / WIZARD_STEPS.length) * 100);

  // Get current step component
  const CurrentStepComponent = WIZARD_STEPS[currentStep].component;
  const currentStepConfig = WIZARD_STEPS[currentStep];

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Admission Setup</h1>
              <p className="text-sm text-gray-600 mt-1">
                Complete all steps to create a new admission
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="size-3" />
                  Unsaved Changes
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={savingDraft || !hasUnsavedChanges}
                className="gap-2"
              >
                {savingDraft ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Draft
              </Button>
              <Button variant="ghost" onClick={handleCancel}>
                <X className="size-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                Step {currentStep + 1} of {WIZARD_STEPS.length}
              </span>
              <span className="text-gray-600">
                {completedSteps} of {WIZARD_STEPS.length} complete ({progressPercentage}%)
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Step Navigation */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              {WIZARD_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isComplete = stepValidation[step.id] === true;
                const isPast = index < currentStep;
                const isFuture = index > currentStep;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <button
                      onClick={() => handleStepClick(index)}
                      disabled={isFuture}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all flex-1 ${
                        isActive
                          ? 'bg-blue-50 border-2 border-blue-300'
                          : isPast
                          ? 'hover:bg-gray-100 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`size-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isComplete
                            ? 'bg-green-500 text-white'
                            : isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {isComplete ? (
                          <Check className="size-4" />
                        ) : (
                          <span className="text-sm font-semibold">{step.number}</span>
                        )}
                      </div>
                      <div className="text-left hidden md:block">
                        <p
                          className={`text-xs font-medium ${
                            isActive ? 'text-blue-900' : 'text-gray-700'
                          }`}
                        >
                          {step.shortTitle}
                        </p>
                      </div>
                    </button>
                    {index < WIZARD_STEPS.length - 1 && (
                      <ChevronRight className="size-4 text-gray-400 flex-shrink-0 mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <Card>
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center gap-3">
              {React.createElement(currentStepConfig.icon, {
                className: 'size-6 text-blue-600',
              })}
              <div>
                <CardTitle className="text-lg">{currentStepConfig.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Step {currentStep + 1} of {WIZARD_STEPS.length}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <CurrentStepComponent
                data={wizardData}
                onChange={handleDataChange}
                onValidationChange={(isValid) =>
                  handleValidationChange(currentStepConfig.id, isValid)
                }
                onNext={currentStep < WIZARD_STEPS.length - 1 ? handleNext : undefined}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
          >
            <ChevronLeft className="size-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={loading || !isCurrentStepValid()}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                Complete Admission
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={loading || !isCurrentStepValid()}
              >
                Next
                <ChevronRight className="size-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Validation Alert */}
        {!isCurrentStepValid() && (
          <Card className="mt-4 border-amber-300 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">Incomplete Step</p>
                  <p className="mt-1 text-amber-800">
                    Please complete all required fields before proceeding to the next step.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save your progress as a draft before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <Button variant="outline" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-600 hover:bg-red-700">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
