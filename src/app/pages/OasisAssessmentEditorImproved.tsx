/**
 * OASIS-E Assessment Editor (Improved with Medication Context)
 * 
 * Enhanced version with medication context panel integration.
 * 
 * NEW FEATURES:
 * - Automatic medication context panel on medication-related sections
 * - Real-time medication data display
 * - Reduced context switching
 * - Quick access to medication profile
 * 
 * Extends original OASIS-E editor with contextual medication information.
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
  Sparkles,
  PanelRightClose,
  PanelRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import MedicationContextPanel, { type MedicationContextData } from '../components/MedicationContextPanel';

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
  hasMedicationContext?: boolean; // NEW: Flag for medication-related sections
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
  values: Record<string, any>;
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
    hasMedicationContext: true, // Enable medication context panel
  },
  {
    id: 'clinical-status',
    title: 'Clinical Status',
    icon: Stethoscope,
    description: 'Vital signs and clinical observations',
    fieldCount: 12,
    requiredCount: 8,
    hasMedicationContext: true, // Some clinical questions relate to meds
  },
  {
    id: 'care-management',
    title: 'Care Management',
    icon: ClipboardList,
    description: 'Care planning and interventions',
    fieldCount: 10,
    requiredCount: 5,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MOCK MEDICATION CONTEXT DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_MEDICATION_CONTEXT: MedicationContextData = {
  totalActiveMedications: 12,
  highRiskMedicationCount: 3,
  recentChangesCount: 5,
  reconciliationStatus: 'in-progress',
  reconciliationProgress: 75,
  lastReconciliationDate: '2024-03-01T10:00:00Z',
  activeCriticalAlerts: 2,
  
  highRiskMedications: [
    {
      id: 'med-001',
      name: 'Warfarin Sodium',
      strength: '7.5mg',
      dose: '1 tablet',
      frequency: 'Once daily at 5pm',
      riskCategory: 'anticoagulant',
      requiresMonitoring: true,
    },
    {
      id: 'med-002',
      name: 'Insulin Glargine',
      strength: '100 units/mL',
      dose: '20 units',
      frequency: 'Once daily at bedtime',
      riskCategory: 'insulin',
      requiresMonitoring: true,
    },
    {
      id: 'med-003',
      name: 'Oxycodone HCl',
      strength: '5mg',
      dose: '1-2 tablets',
      frequency: 'Every 4-6 hours PRN',
      riskCategory: 'opioid',
      requiresMonitoring: true,
    },
  ],
  
  recentChanges: [
    {
      id: 'change-001',
      medicationName: 'Warfarin Sodium',
      changeType: 'dose-changed',
      date: '2024-03-12T13:30:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
    {
      id: 'change-002',
      medicationName: 'Gabapentin',
      changeType: 'dose-changed',
      date: '2024-03-05T14:30:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
    {
      id: 'change-003',
      medicationName: 'Furosemide',
      changeType: 'frequency-changed',
      date: '2024-03-09T15:20:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
    {
      id: 'change-004',
      medicationName: 'Oxycodone HCl',
      changeType: 'discontinued',
      date: '2024-03-07T09:00:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
    {
      id: 'change-005',
      medicationName: 'Furosemide',
      changeType: 'added',
      date: '2024-03-08T10:45:00Z',
      changedBy: 'Dr. Sarah Johnson',
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function OasisAssessmentEditorImproved() {
  const navigate = useNavigate();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [assessment, setAssessment] = useState<OasisAssessment>({
    id: 'oasis-001',
    status: 'in_progress',
    values: {},
    completedSections: [],
    validationErrors: [],
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  
  // NEW: Medication context panel state
  const [showMedicationContext, setShowMedicationContext] = useState(true);
  const [medicationContextData] = useState<MedicationContextData>(MOCK_MEDICATION_CONTEXT);

  const currentSection = SECTIONS[currentSectionIndex];
  
  // NEW: Check if current section should show medication context
  const shouldShowMedicationContext = currentSection.hasMedicationContext && showMedicationContext;

  // Calculate progress
  const overallProgress = useMemo(() => {
    const totalFields = SECTIONS.reduce((sum, s) => sum + s.fieldCount, 0);
    const completedFields = assessment.completedSections.reduce((sum, sectionId) => {
      const section = SECTIONS.find(s => s.id === sectionId);
      return sum + (section?.fieldCount || 0);
    }, 0);
    return Math.round((completedFields / totalFields) * 100);
  }, [assessment.completedSections]);

  // Auto-save simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');
      setTimeout(() => {
        setAutoSaveStatus('saved');
        setAssessment(prev => ({ ...prev, lastSaved: new Date().toISOString() }));
      }, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [assessment.values]);

  const handleNext = () => {
    if (currentSectionIndex < SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const handleGoToSection = (index: number) => {
    setCurrentSectionIndex(index);
  };

  const handleSave = () => {
    console.log('Saving assessment...');
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
    }, 1000);
  };

  const handleSubmit = () => {
    console.log('Submitting assessment...');
    navigate('/assessment-submission-workflow');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OASIS-E Assessment</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • SOC Assessment
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-save indicator */}
              <div className="flex items-center gap-2 text-sm">
                {autoSaveStatus === 'saving' && (
                  <>
                    <Clock className="w-4 h-4 text-gray-400 animate-spin" />
                    <span className="text-gray-600">Saving...</span>
                  </>
                )}
                {autoSaveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">All changes saved</span>
                  </>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold text-gray-900">{overallProgress}% Complete</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Sections</h3>
            <div className="space-y-1">
              {SECTIONS.map((section, index) => {
                const isActive = index === currentSectionIndex;
                const isCompleted = assessment.completedSections.includes(section.id);
                const Icon = section.icon;

                return (
                  <button
                    key={section.id}
                    onClick={() => handleGoToSection(index)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left',
                      isActive
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded',
                      isActive ? 'bg-blue-100' : 'bg-gray-100'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        isActive ? 'text-blue-600' : 'text-gray-600'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          'font-medium text-sm',
                          isActive ? 'text-blue-900' : 'text-gray-900'
                        )}>
                          {section.title}
                        </span>
                        {section.hasMedicationContext && (
                          <Sparkles className="w-3 h-3 text-blue-500" title="Medication context available" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{section.description}</p>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                        )}
                        <span className="text-xs text-gray-500">
                          {section.requiredCount} required
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Assessment Form */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn(
            'mx-auto p-6',
            shouldShowMedicationContext ? 'max-w-4xl' : 'max-w-3xl'
          )}>
            {/* NEW: Medication Context Notice */}
            {currentSection.hasMedicationContext && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Medication context available</strong> — Patient medication information 
                      is displayed in the side panel to help answer medication-related questions.
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMedicationContext(!showMedicationContext)}
                      className="ml-4 flex-shrink-0"
                    >
                      {showMedicationContext ? (
                        <>
                          <PanelRightClose className="w-4 h-4 mr-2" />
                          Hide Panel
                        </>
                      ) : (
                        <>
                          <PanelRight className="w-4 h-4 mr-2" />
                          Show Panel
                        </>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const Icon = currentSection.icon;
                  return <Icon className="w-6 h-6 text-blue-600" />;
                })()}
                <h2 className="text-2xl font-bold text-gray-900">{currentSection.title}</h2>
              </div>
              <p className="text-gray-600">{currentSection.description}</p>
            </div>

            {/* Section Content (would be dynamic based on section) */}
            <Card className="p-6 mb-6">
              {currentSection.id === 'medications' && (
                <MedicationsSectionContent />
              )}
              {currentSection.id === 'clinical-status' && (
                <ClinicalStatusSectionContent />
              )}
              {currentSection.id !== 'medications' && currentSection.id !== 'clinical-status' && (
                <PlaceholderSectionContent section={currentSection} />
              )}
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSectionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Section
              </Button>

              {currentSectionIndex === SECTIONS.length - 1 ? (
                <Button onClick={handleSubmit}>
                  <Send className="w-4 h-4 mr-2" />
                  Review & Submit
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next Section
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* NEW: Medication Context Panel (conditionally rendered) */}
        {shouldShowMedicationContext && (
          <MedicationContextPanel
            data={medicationContextData}
            onRefresh={() => console.log('Refreshing medication data...')}
            onViewMedicationProfile={() => navigate('/patient-medication-profile-view')}
            onViewReconciliation={() => navigate('/medication-reconciliation-workflow')}
            onViewChange={(changeId) => console.log('Viewing change:', changeId)}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATIONS SECTION CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function MedicationsSectionContent() {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900">M2001. Drug Regimen Review</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">
            <span className="text-red-600">*</span> M2001a. Has the physician reviewed the patient's medication regimen since SOC/ROC?
          </Label>
          <RadioGroup>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="m2001a-0" />
              <Label htmlFor="m2001a-0">0 - No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="m2001a-1" />
              <Label htmlFor="m2001a-1">1 - Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="9" id="m2001a-9" />
              <Label htmlFor="m2001a-9">9 - Unknown</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="mb-2 block">
            <span className="text-red-600">*</span> M2001b. Does the patient/caregiver understand the medication regimen?
          </Label>
          <RadioGroup>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="0" id="m2001b-0" />
              <Label htmlFor="m2001b-0">0 - No</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="m2001b-1" />
              <Label htmlFor="m2001b-1">1 - Yes</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="mb-2 block">
            M2003. Medication Follow-up
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Select all that apply regarding medication follow-up:
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="m2003-1" />
              <Label htmlFor="m2003-1">Medication side effects reported</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="m2003-2" />
              <Label htmlFor="m2003-2">Patient/caregiver reported medication concerns</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="m2003-3" />
              <Label htmlFor="m2003-3">High-risk medications require monitoring</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="m2003-4" />
              <Label htmlFor="m2003-4">Medication teaching completed</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">
            M2020. Management of Oral Medications
          </Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select ability level..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Able to independently take correct medication(s) and proper dosage(s) at correct times</SelectItem>
              <SelectItem value="1">1 - Able to take medication(s) at correct times if individual dosages are prepared in advance</SelectItem>
              <SelectItem value="2">2 - Able to take medication(s) at correct times if given reminders</SelectItem>
              <SelectItem value="3">3 - Unable to take medication unless administered by another person</SelectItem>
              <SelectItem value="NA">NA - No oral medications prescribed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">
            M2030. Management of Injectable Medications
          </Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select ability level..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Able to independently take correct medication and proper dosage at correct times</SelectItem>
              <SelectItem value="1">1 - Able to take injectable medication at correct times if individual dosages are prepared in advance</SelectItem>
              <SelectItem value="2">2 - Able to take medication at correct times if given reminders</SelectItem>
              <SelectItem value="3">3 - Unable to take injectable medication unless administered by another person</SelectItem>
              <SelectItem value="NA">NA - No injectable medications prescribed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Additional Notes</Label>
          <Textarea
            placeholder="Enter any additional notes about medication management..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLINICAL STATUS SECTION CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function ClinicalStatusSectionContent() {
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Pill className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          Review patient medications in the side panel when answering questions about 
          pain management, symptom control, and medication effectiveness.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">
            <span className="text-red-600">*</span> J0510. Pain Effect on Sleep
          </Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Does not apply - no pain</SelectItem>
              <SelectItem value="1">1 - Rarely or not at all</SelectItem>
              <SelectItem value="2">2 - Occasionally</SelectItem>
              <SelectItem value="3">3 - Frequently</SelectItem>
              <SelectItem value="4">4 - Almost constantly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">
            <span className="text-red-600">*</span> M1033. Risk for Hospitalization
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Select all that increase risk for hospitalization:
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="m1033-1" />
              <Label htmlFor="m1033-1">History of falls (2 or more falls in past year)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="m1033-2" />
              <Label htmlFor="m1033-2">Unintentional weight loss</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="m1033-3" />
              <Label htmlFor="m1033-3">Multiple hospitalizations (2+ in past 6 months)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="m1033-4" />
              <Label htmlFor="m1033-4">Decline in mental, emotional, or behavioral status</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="m1033-5" />
              <Label htmlFor="m1033-5">Currently taking 5 or more medications</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Clinical Notes</Label>
          <Textarea
            placeholder="Document clinical observations, including response to medications..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLACEHOLDER SECTION CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function PlaceholderSectionContent({ section }: { section: Section }) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-3">
        {(() => {
          const Icon = section.icon;
          return <Icon className="w-12 h-12 mx-auto" />;
        })()}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{section.description}</p>
      <p className="text-sm text-gray-500">
        {section.fieldCount} total fields • {section.requiredCount} required
      </p>
    </div>
  );
}
