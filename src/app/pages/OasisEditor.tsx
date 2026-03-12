/**
 * OASIS EDITOR
 * 
 * Production-grade OASIS assessment editor with real M-item sections
 * Demonstrates large-form UX with section-based navigation
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { OasisEditorLayout } from '../components/oasis/OasisEditorLayout';
import { OasisSummaryView } from '../components/oasis/OasisSummaryView';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import type { OasisAssessment, OasisSection } from '../types/oasis';

export default function OasisEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('patient-tracking');
  const [showSummary, setShowSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Mock OASIS assessment data
  const [assessment] = useState<OasisAssessment>({
    id: id || 'oasis-demo-001',
    patientId: 'PT-1001',
    patientName: 'Margaret Anderson',
    episodeId: 'EP-2024-001',
    timepoint: 'start-of-care',
    oasisVersion: 'E1',
    assessmentDate: '2024-03-12',
    status: 'in-progress',
    createdAt: '2024-03-12T09:00:00',
    createdBy: 'Sarah Chen, RN',
    updatedAt: '2024-03-12T11:30:00',
    updatedBy: 'Sarah Chen, RN',
    percentComplete: 55,
    sections: [
      {
        id: 'patient-tracking',
        title: 'Patient Tracking & Demographics',
        subtitle: 'Patient information and clinical record items',
        order: 1,
        estimatedTime: '5 min',
        itemCount: 15,
        requiredItems: 12,
        completedItems: 12,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: true,
        isRequired: true,
        mItemRange: 'M1000-M1036',
      },
      {
        id: 'clinical-record',
        title: 'Clinical Record Items',
        subtitle: 'Diagnoses, medical history, and clinical information',
        order: 2,
        estimatedTime: '8 min',
        itemCount: 18,
        requiredItems: 15,
        completedItems: 14,
        validationErrors: 1,
        validationWarnings: 0,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M1000-M1041',
      },
      {
        id: 'living-arrangements',
        title: 'Living Arrangements & Sensory Status',
        subtitle: 'Home situation, support systems, vision, hearing',
        order: 3,
        estimatedTime: '6 min',
        itemCount: 12,
        requiredItems: 10,
        completedItems: 10,
        validationErrors: 0,
        validationWarnings: 1,
        isComplete: true,
        isRequired: true,
        mItemRange: 'M1100-M1242',
      },
      {
        id: 'integumentary',
        title: 'Integumentary Status',
        subtitle: 'Skin integrity, pressure injuries, wounds',
        order: 4,
        estimatedTime: '10 min',
        itemCount: 24,
        requiredItems: 20,
        completedItems: 15,
        validationErrors: 0,
        validationWarnings: 2,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M1300-M1342',
      },
      {
        id: 'respiratory',
        title: 'Respiratory Status',
        subtitle: 'Breathing, oxygen use, dyspnea',
        order: 5,
        estimatedTime: '5 min',
        itemCount: 8,
        requiredItems: 6,
        completedItems: 6,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: true,
        isRequired: true,
        mItemRange: 'M1400-M1410',
      },
      {
        id: 'cardiac',
        title: 'Cardiac Status',
        subtitle: 'Heart rate, edema, symptoms',
        order: 6,
        estimatedTime: '4 min',
        itemCount: 6,
        requiredItems: 4,
        completedItems: 0,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M1500-M1511',
      },
      {
        id: 'elimination',
        title: 'Elimination Status',
        subtitle: 'Urinary and bowel function',
        order: 7,
        estimatedTime: '6 min',
        itemCount: 10,
        requiredItems: 8,
        completedItems: 0,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M1600-M1630',
      },
      {
        id: 'neuro-emotional',
        title: 'Neuro/Emotional/Behavioral Status',
        subtitle: 'Cognition, mood, behavior, pain',
        order: 8,
        estimatedTime: '8 min',
        itemCount: 16,
        requiredItems: 12,
        completedItems: 0,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M1700-M1745',
      },
      {
        id: 'adls',
        title: 'Activities of Daily Living (ADLs)',
        subtitle: 'Grooming, bathing, dressing, toileting, eating, ambulation',
        order: 9,
        estimatedTime: '10 min',
        itemCount: 20,
        requiredItems: 18,
        completedItems: 0,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M1800-M1870',
      },
      {
        id: 'iadls',
        title: 'Instrumental ADLs (IADLs)',
        subtitle: 'Meal prep, phone use, medications, shopping, transportation',
        order: 10,
        estimatedTime: '7 min',
        itemCount: 14,
        requiredItems: 12,
        completedItems: 0,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M2000-M2102',
      },
      {
        id: 'medications',
        title: 'Medications',
        subtitle: 'Current medications, high-risk drugs, management',
        order: 11,
        estimatedTime: '6 min',
        itemCount: 12,
        requiredItems: 10,
        completedItems: 0,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M2001-M2020',
      },
      {
        id: 'therapy-need',
        title: 'Therapy Need & Plan of Care',
        subtitle: 'Therapy services, goals, discharge planning',
        order: 12,
        estimatedTime: '8 min',
        itemCount: 16,
        requiredItems: 12,
        completedItems: 0,
        validationErrors: 0,
        validationWarnings: 0,
        isComplete: false,
        isRequired: true,
        mItemRange: 'M2200-M2420',
      },
    ],
    validationIssues: [
      {
        id: 'v1',
        mItem: 'M1021',
        mItemTitle: 'Primary Diagnosis',
        section: 'clinical-record',
        severity: 'error',
        message: 'ICD-10 code is required and must be valid',
        autoFixable: false,
      },
    ],
    isValid: false,
    data: {},
    autoSaveEnabled: true,
    lastAutoSave: '2024-03-12T11:30:00',
    isOverdue: false,
    flags: [],
  });

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      toast.success('OASIS assessment saved');
    }, 1000);
  };

  const handleValidate = () => {
    toast.info('Running validation...');
    setTimeout(() => {
      toast.success('Validation complete - 1 error found');
    }, 1500);
  };

  const handleSubmitSignature = () => {
    if (!assessment.isValid) {
      toast.error('Please resolve all validation errors before submitting');
      return;
    }
    toast.success('Ready for signature workflow');
  };

  const handlePrint = () => {
    setShowSummary(true);
  };

  if (showSummary) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <OasisSummaryView
          assessment={assessment}
          sections={assessment.sections}
          onEdit={() => setShowSummary(false)}
        />
      </div>
    );
  }

  return (
    <OasisEditorLayout
      assessment={assessment}
      sections={assessment.sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onSave={handleSave}
      onValidate={handleValidate}
      onSubmitSignature={handleSubmitSignature}
      onPrint={handlePrint}
      onClose={() => navigate('/oasis-workspace')}
      saveStatus={saveStatus}
    >
      <SectionContent sectionId={activeSection} />
    </OasisEditorLayout>
  );
}

// Section content renderer
function SectionContent({ sectionId }: { sectionId: string }) {
  switch (sectionId) {
    case 'patient-tracking':
      return <PatientTrackingSection />;
    case 'clinical-record':
      return <ClinicalRecordSection />;
    case 'living-arrangements':
      return <LivingArrangementsSection />;
    case 'integumentary':
      return <IntegumentarySection />;
    case 'respiratory':
      return <RespiratorySection />;
    case 'cardiac':
      return <CardiacSection />;
    case 'elimination':
      return <EliminationSection />;
    case 'neuro-emotional':
      return <NeuroEmotionalSection />;
    case 'adls':
      return <ADLsSection />;
    case 'iadls':
      return <IADLsSection />;
    case 'medications':
      return <MedicationsSection />;
    case 'therapy-need':
      return <TherapyNeedSection />;
    default:
      return <div>Section content</div>;
  }
}

// M1000-M1036: Patient Tracking
function PatientTrackingSection() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">M1000-M1036: Patient Tracking</h3>
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-900">
              M1000: DC Transaction (Intake/Transfer) Date <span className="text-red-600">*</span>
            </Label>
            <Input type="date" className="mt-2" defaultValue="2024-03-12" />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              M1005: Medicare ID <span className="text-red-600">*</span>
            </Label>
            <Input placeholder="Enter Medicare ID" className="mt-2" defaultValue="1AB2CD3EF45" />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              M1010: Medicaid ID
            </Label>
            <Input placeholder="Enter Medicaid ID (if applicable)" className="mt-2" />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              M1016: Physician Information <span className="text-red-600">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Input placeholder="Physician Name" defaultValue="Dr. James Wilson" />
              <Input placeholder="NPI Number" defaultValue="1234567890" />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              M1018: Discipline of Person Completing Assessment <span className="text-red-600">*</span>
            </Label>
            <Select defaultValue="rn">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rn">RN - Registered Nurse</SelectItem>
                <SelectItem value="pt">PT - Physical Therapist</SelectItem>
                <SelectItem value="slp">SLP - Speech-Language Pathologist</SelectItem>
                <SelectItem value="ot">OT - Occupational Therapist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              M1021: Primary Diagnosis <span className="text-red-600">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Input placeholder="ICD-10 Code" defaultValue="I50.9" />
              <Input placeholder="Description" defaultValue="Heart failure, unspecified" />
            </div>
            <p className="text-xs text-red-600 mt-1">⚠ Validation error: ICD-10 code must be verified</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              M1023: Other Diagnoses
            </Label>
            <Textarea
              rows={4}
              placeholder="List other relevant diagnoses with ICD-10 codes"
              className="mt-2"
              defaultValue="I10 - Essential hypertension&#10;E11.9 - Type 2 diabetes mellitus&#10;M81.0 - Age-related osteoporosis"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              M1033: Risk for Hospitalization <span className="text-red-600">*</span>
            </Label>
            <RadioGroup defaultValue="2" className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="risk-0" />
                <Label htmlFor="risk-0" className="font-normal">
                  0 - No risk factors identified
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="risk-1" />
                <Label htmlFor="risk-1" className="font-normal">
                  1 - One risk factor identified
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="risk-2" />
                <Label htmlFor="risk-2" className="font-normal">
                  2 - Two risk factors identified
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="risk-3" />
                <Label htmlFor="risk-3" className="font-normal">
                  3 - Three or more risk factors identified
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}

// M1000-M1041: Clinical Record
function ClinicalRecordSection() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Clinical Record Items</h3>
      
      <div>
        <Label className="text-sm font-medium text-gray-900">
          M1028: Active Diagnoses - Comorbidities
        </Label>
        <div className="mt-2 space-y-2">
          {[
            'Peripheral Vascular Disease (PVD)',
            'Diabetes Mellitus (DM)',
            'COPD',
            'Obesity',
            'Orthopedic Conditions',
          ].map((condition) => (
            <div key={condition} className="flex items-center space-x-2">
              <Checkbox id={condition} />
              <Label htmlFor={condition} className="font-normal">
                {condition}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-900">
          M1030: Therapies Received at Home <span className="text-red-600">*</span>
        </Label>
        <div className="mt-2 space-y-2">
          {['IV/Infusion', 'Parenteral Nutrition', 'Enteral Nutrition', 'None of the Above'].map(
            (therapy) => (
              <div key={therapy} className="flex items-center space-x-2">
                <Checkbox id={therapy} />
                <Label htmlFor={therapy} className="font-normal">
                  {therapy}
                </Label>
              </div>
            )
          )}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-900">
          M1041: Influenza Vaccine Received
        </Label>
        <RadioGroup className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="flu-1" />
            <Label htmlFor="flu-1" className="font-normal">
              Yes, received this season
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="flu-0" />
            <Label htmlFor="flu-0" className="font-normal">
              No, not received
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="flu-2" />
            <Label htmlFor="flu-2" className="font-normal">
              Declined
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

// M1100-M1242: Living Arrangements & Sensory
function LivingArrangementsSection() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Living Arrangements & Sensory Status</h3>
      
      <div>
        <Label className="text-sm font-medium text-gray-900">
          M1100: Patient Living Situation <span className="text-red-600">*</span>
        </Label>
        <Select defaultValue="alone">
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alone">Lives alone</SelectItem>
            <SelectItem value="family">Lives with family/caregivers</SelectItem>
            <SelectItem value="assisted">Assisted living facility</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-900">
          M1200: Vision (with corrective lenses if used) <span className="text-red-600">*</span>
        </Label>
        <RadioGroup defaultValue="0" className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="vision-0" />
            <Label htmlFor="vision-0" className="font-normal">
              0 - Normal vision
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="vision-1" />
            <Label htmlFor="vision-1" className="font-normal">
              1 - Partially impaired
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="vision-2" />
            <Label htmlFor="vision-2" className="font-normal">
              2 - Severely impaired
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-900">
          M1242: Hearing <span className="text-red-600">*</span>
        </Label>
        <RadioGroup defaultValue="0" className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="hear-0" />
            <Label htmlFor="hear-0" className="font-normal">
              0 - Adequate
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="hear-1" />
            <Label htmlFor="hear-1" className="font-normal">
              1 - Minimal difficulty
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="hear-2" />
            <Label htmlFor="hear-2" className="font-normal">
              2 - Moderate to severe impairment
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

// Simplified placeholder sections for remaining sections
function IntegumentarySection() {
  return <div className="text-gray-600">Integumentary section content (M1300-M1342: Skin integrity, pressure injuries, wounds...)</div>;
}

function RespiratorySection() {
  return <div className="text-gray-600">Respiratory section content (M1400-M1410: Dyspnea, oxygen therapy...)</div>;
}

function CardiacSection() {
  return <div className="text-gray-600">Cardiac section content (M1500-M1511: Edema, symptoms...)</div>;
}

function EliminationSection() {
  return <div className="text-gray-600">Elimination section content (M1600-M1630: Urinary, bowel function...)</div>;
}

function NeuroEmotionalSection() {
  return <div className="text-gray-600">Neuro/Emotional section content (M1700-M1745: Cognition, mood, behavior, pain...)</div>;
}

function ADLsSection() {
  return <div className="text-gray-600">ADLs section content (M1800-M1870: Grooming, bathing, dressing, toileting, eating, ambulation...)</div>;
}

function IADLsSection() {
  return <div className="text-gray-600">IADLs section content (M2000-M2102: Meal prep, phone, medications, shopping, transportation...)</div>;
}

function MedicationsSection() {
  return <div className="text-gray-600">Medications section content (M2001-M2020: Current medications, high-risk drugs, management...)</div>;
}

function TherapyNeedSection() {
  return <div className="text-gray-600">Therapy & Plan of Care content (M2200-M2420: Therapy services, goals, discharge planning...)</div>;
}
