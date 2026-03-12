/**
 * DEMO ASSESSMENT EDITOR
 * 
 * Interactive demo showing the assessment editor layout in action
 * Demonstrates all features: navigation, validation, autosave, signature
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AssessmentEditorLayout } from '../components/assessment/AssessmentEditorLayout';
import { AssessmentSignaturePanel } from '../components/assessment/AssessmentSignaturePanel';
import { AssessmentHistoryPanel } from '../components/assessment/AssessmentHistoryPanel';
import { AssessmentCompareView } from '../components/assessment/AssessmentCompareView';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import type { Assessment, AssessmentSection, AssessmentSignature, AssessmentVersion } from '../types/assessment';

export default function DemoAssessmentEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('demographics');
  const [showSignature, setShowSignature] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Mock assessment data
  const [assessment] = useState<Assessment>({
    id: id || 'demo-001',
    type: 'physical-therapy',
    patientId: 'PT-1001',
    patientName: 'Margaret Anderson',
    episodeId: 'EP-2024-001',
    status: 'in-progress',
    createdAt: '2024-03-12T10:00:00',
    createdBy: 'Dr. Sarah Chen, PT',
    updatedAt: '2024-03-12T11:30:00',
    updatedBy: 'Dr. Sarah Chen, PT',
    percentComplete: 75,
    sections: [
      {
        id: 'demographics',
        title: 'Demographics & History',
        subtitle: 'Patient information and medical history',
        order: 1,
        required: true,
        estimatedTime: '5 min',
        completionStatus: 'complete',
        validationErrors: 0,
        fieldCount: 12,
      },
      {
        id: 'rom-assessment',
        title: 'Range of Motion Assessment',
        subtitle: 'Joint ROM measurements',
        order: 2,
        required: true,
        estimatedTime: '10 min',
        completionStatus: 'in-progress',
        validationErrors: 1,
        fieldCount: 24,
      },
      {
        id: 'strength',
        title: 'Strength Testing',
        subtitle: 'Manual muscle testing',
        order: 3,
        required: true,
        estimatedTime: '8 min',
        completionStatus: 'in-progress',
        validationErrors: 0,
        fieldCount: 18,
      },
      {
        id: 'gait-balance',
        title: 'Gait & Balance',
        subtitle: 'Mobility and balance assessment',
        order: 4,
        required: true,
        estimatedTime: '10 min',
        completionStatus: 'not-started',
        validationErrors: 0,
        fieldCount: 15,
      },
      {
        id: 'functional',
        title: 'Functional Mobility',
        subtitle: 'ADL and transfer assessment',
        order: 5,
        required: true,
        estimatedTime: '8 min',
        completionStatus: 'not-started',
        validationErrors: 0,
        fieldCount: 12,
      },
      {
        id: 'goals',
        title: 'Goals & Plan of Care',
        subtitle: 'Treatment goals and plan',
        order: 6,
        required: true,
        estimatedTime: '5 min',
        completionStatus: 'not-started',
        validationErrors: 0,
        fieldCount: 8,
      },
    ],
    validationIssues: [
      {
        id: 'v1',
        severity: 'error',
        field: 'Right Shoulder Flexion',
        section: 'ROM Assessment',
        message: 'ROM value must be between 0-180 degrees',
        autoFixable: false,
      },
    ],
    isValid: false,
    currentVersion: 3,
    versions: [
      {
        versionNumber: 1,
        createdAt: '2024-03-12T10:00:00',
        createdBy: 'Dr. Sarah Chen, PT',
        status: 'draft',
        changesSummary: 'Initial assessment creation',
        data: { demographics: 'initial data' },
      },
      {
        versionNumber: 2,
        createdAt: '2024-03-12T10:30:00',
        createdBy: 'Dr. Sarah Chen, PT',
        status: 'in-progress',
        changesSummary: 'Completed demographics and started ROM assessment',
        data: { demographics: 'updated', rom: 'partial' },
      },
      {
        versionNumber: 3,
        createdAt: '2024-03-12T11:30:00',
        createdBy: 'Dr. Sarah Chen, PT',
        status: 'in-progress',
        changesSummary: 'Completed ROM, started strength testing',
        data: { demographics: 'final', rom: 'complete', strength: 'partial' },
      },
    ],
    data: {},
    lastAutoSave: '2024-03-12T11:30:00',
    autoSaveEnabled: true,
  });

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      toast.success('Assessment saved successfully');
    }, 1000);
  };

  const handleSubmitSignature = () => {
    if (!assessment.isValid) {
      toast.error('Please resolve all validation issues before submitting for signature');
      return;
    }
    setShowSignature(true);
  };

  const handleSign = (signature: Omit<AssessmentSignature, 'id'>) => {
    toast.success('Assessment signed successfully');
    setShowSignature(false);
    navigate('/assessment-workspace');
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleCompareVersions = (v1: number, v2: number) => {
    setShowHistory(false);
    setShowCompare(true);
  };

  // Render different views
  if (showSignature) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AssessmentSignaturePanel
          assessment={assessment}
          onSign={handleSign}
          onCancel={() => setShowSignature(false)}
        />
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AssessmentHistoryPanel
          versions={assessment.versions}
          currentVersion={assessment.currentVersion}
          onViewVersion={(v) => toast.info(`Viewing version ${v}`)}
          onCompareVersions={handleCompareVersions}
        />
      </div>
    );
  }

  if (showCompare && assessment.versions.length >= 2) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AssessmentCompareView
          version1={assessment.versions[0]}
          version2={assessment.versions[1]}
          onClose={() => setShowCompare(false)}
        />
      </div>
    );
  }

  return (
    <AssessmentEditorLayout
      assessment={assessment}
      sections={assessment.sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onSave={handleSave}
      onSubmitSignature={handleSubmitSignature}
      onViewHistory={handleViewHistory}
      onClose={() => navigate('/assessment-workspace')}
      saveStatus={saveStatus}
    >
      {/* Form content based on active section */}
      <SectionContent sectionId={activeSection} />
    </AssessmentEditorLayout>
  );
}

// Section content renderer
function SectionContent({ sectionId }: { sectionId: string }) {
  switch (sectionId) {
    case 'demographics':
      return <DemographicsSection />;
    case 'rom-assessment':
      return <ROMSection />;
    case 'strength':
      return <StrengthSection />;
    case 'gait-balance':
      return <GaitBalanceSection />;
    case 'functional':
      return <FunctionalSection />;
    case 'goals':
      return <GoalsSection />;
    default:
      return <div>Section content</div>;
  }
}

function DemographicsSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Age <span className="text-red-600">*</span>
          </label>
          <Input type="number" placeholder="Enter age" defaultValue="68" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Gender <span className="text-red-600">*</span>
          </label>
          <Select defaultValue="female">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Primary Diagnosis <span className="text-red-600">*</span>
        </label>
        <Input placeholder="Enter diagnosis" defaultValue="Status post right hip arthroplasty" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Medical History
        </label>
        <Textarea
          rows={4}
          placeholder="Enter relevant medical history"
          defaultValue="Hypertension, Type 2 Diabetes, Osteoarthritis"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="fall-risk" defaultChecked />
        <label htmlFor="fall-risk" className="text-sm text-gray-700 cursor-pointer">
          Patient identified as fall risk
        </label>
      </div>
    </div>
  );
}

function ROMSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Right Hip</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Flexion <span className="text-red-600">*</span>
            </label>
            <Input type="number" placeholder="0-120" defaultValue="85" />
            <p className="text-xs text-gray-600 mt-1">Normal: 0-120°</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Extension <span className="text-red-600">*</span>
            </label>
            <Input type="number" placeholder="0-30" defaultValue="15" />
            <p className="text-xs text-gray-600 mt-1">Normal: 0-30°</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Abduction <span className="text-red-600">*</span>
            </label>
            <Input type="number" placeholder="0-45" defaultValue="30" />
            <p className="text-xs text-gray-600 mt-1">Normal: 0-45°</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          ROM Limitations
        </label>
        <Textarea
          rows={3}
          placeholder="Describe any ROM limitations or pain"
          defaultValue="Patient experiences moderate pain with hip flexion beyond 85 degrees. Post-surgical precautions in place."
        />
      </div>
    </div>
  );
}

function StrengthSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Manual Muscle Testing (0-5 scale)</h3>
        <div className="space-y-3">
          {['Hip Flexors', 'Hip Extensors', 'Hip Abductors', 'Knee Extensors', 'Ankle Dorsiflexors'].map(
            (muscle) => (
              <div key={muscle} className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-900">{muscle}</label>
                <Select defaultValue="4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - No contraction</SelectItem>
                    <SelectItem value="1">1 - Trace</SelectItem>
                    <SelectItem value="2">2 - Poor</SelectItem>
                    <SelectItem value="3">3 - Fair</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Normal</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Notes" />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function GaitBalanceSection() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Assistive Device
        </label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="cane">Cane</SelectItem>
            <SelectItem value="walker">Walker</SelectItem>
            <SelectItem value="crutches">Crutches</SelectItem>
            <SelectItem value="wheelchair">Wheelchair</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Gait Pattern
        </label>
        <Textarea rows={3} placeholder="Describe gait pattern" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Berg Balance Scale Score
        </label>
        <Input type="number" placeholder="0-56" />
        <p className="text-xs text-gray-600 mt-1">Score: 0-20 (High fall risk), 21-40 (Medium risk), 41-56 (Low risk)</p>
      </div>
    </div>
  );
}

function FunctionalSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Functional Mobility</h3>
        <div className="space-y-3">
          {[
            'Bed Mobility',
            'Transfers (sit to stand)',
            'Toilet Transfer',
            'Shower Transfer',
            'Stair Climbing',
          ].map((activity) => (
            <div key={activity} className="grid grid-cols-3 gap-4 items-center">
              <label className="text-sm font-medium text-gray-900">{activity}</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent</SelectItem>
                  <SelectItem value="modified-independent">Modified Independent</SelectItem>
                  <SelectItem value="supervision">Supervision</SelectItem>
                  <SelectItem value="minimal-assist">Minimal Assist</SelectItem>
                  <SelectItem value="moderate-assist">Moderate Assist</SelectItem>
                  <SelectItem value="maximal-assist">Maximal Assist</SelectItem>
                  <SelectItem value="dependent">Dependent</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Notes" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoalsSection() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Short-Term Goals (2-4 weeks)
        </label>
        <Textarea
          rows={4}
          placeholder="Enter short-term goals"
          defaultValue="1. Patient will increase right hip flexion ROM to 100 degrees\n2. Patient will ambulate 50 feet with walker independently\n3. Patient will demonstrate safe transfer techniques"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Long-Term Goals (8-12 weeks)
        </label>
        <Textarea
          rows={4}
          placeholder="Enter long-term goals"
          defaultValue="1. Patient will return to independent community ambulation\n2. Patient will resume all ADLs without assistive devices\n3. Patient will return to baseline functional status"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Treatment Plan
        </label>
        <Textarea
          rows={5}
          placeholder="Enter treatment plan"
          defaultValue="Frequency: 3x/week for 4 weeks\nDuration: 45 minutes per session\nInterventions: Therapeutic exercise, gait training, functional mobility training, patient education"
        />
      </div>
    </div>
  );
}
