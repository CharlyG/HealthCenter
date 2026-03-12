/**
 * Recertification Documentation Module
 * 
 * Comprehensive recertification system for home health care continuation
 * Required every 60 days per Medicare guidelines
 * Includes patient progress, clinical status, justification, and updated plan
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
  TrendingUp,
  Activity,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  PenTool,
  Stethoscope,
  Calendar,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Plus,
  X,
  History,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type RecertificationStatus = 'draft' | 'in_progress' | 'pending_approval' | 'approved' | 'submitted';

interface GoalOutcome {
  goalId: string;
  goalStatement: string;
  targetDate: string;
  status: 'met' | 'partially_met' | 'not_met' | 'in_progress';
  outcomeNotes: string;
}

interface FunctionalStatusComparison {
  category: string;
  admissionStatus: string;
  currentStatus: string;
  improvement: 'improved' | 'stable' | 'declined';
  notes: string;
}

interface ClinicalUpdate {
  area: string;
  priorStatus: string;
  currentStatus: string;
  changeDescription: string;
}

interface UpdatedGoal {
  id: string;
  goalType: 'short_term' | 'long_term';
  goalStatement: string;
  targetDate: string;
  discipline: string;
}

interface UpdatedIntervention {
  id: string;
  discipline: string;
  interventionCategory: string;
  interventionDescription: string;
  frequency: string;
  reasonForChange?: string;
}

interface RecertificationDocument {
  id: string;
  status: RecertificationStatus;
  documentStatus: DocumentStatus;
  
  // Patient Info
  patientId: string;
  admissionId: string;
  episodeId: string;
  
  // Certification Periods
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextPeriodStart: string;
  nextPeriodEnd: string;
  recertificationNumber: number;
  
  // Progress Summary
  overallProgressSummary: string;
  goalsReview: GoalOutcome[];
  functionalStatusComparison: FunctionalStatusComparison[];
  
  // Clinical Status
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  vitalSignsTrends: string;
  medicationChanges: string;
  clinicalUpdates: ClinicalUpdate[];
  recentHospitalizations: string;
  recentERVisits: string;
  complications: string;
  
  // Continuation of Care Justification
  medicalNecessity: string;
  skilledNeedJustification: string;
  homebound_status: string;
  homeboundJustification: string;
  expectedOutcomes: string;
  anticipatedDischargeDate: string;
  barriersTOProgress: string;
  interventionsForBarriers: string;
  
  // Updated Plan of Care
  updatedGoals: UpdatedGoal[];
  updatedInterventions: UpdatedIntervention[];
  disciplineContinuation: {
    discipline: string;
    continue: boolean;
    frequency: string;
    totalVisits: number;
    justification: string;
  }[];
  dmeChanges: string;
  
  // Additional Information
  patientFamilyEducation: string;
  caregiverStatus: string;
  safetyAssessmentUpdates: string;
  additionalComments: string;
  
  // Physician Information
  orderingPhysician: string;
  physicianNotificationDate: string;
  physicianNPI?: string;
  physicianPhone?: string;
  
  // Signature Tracking
  clinicianSignature?: string;
  clinicianSignatureDate?: string;
  clinicianCredentials?: string;
  
  physicianSignature?: string;
  physicianSignatureDate?: string;
  physicianSignatureMethod?: 'electronic' | 'wet_signature' | 'fax';
  
  signatureStatus: 'unsigned' | 'clinician_signed' | 'physician_signed' | 'fully_signed';
  
  // Metadata
  createdBy: string;
  createdDate: string;
  submittedDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_PATIENT = {
  id: 'pat-99888',
  name: 'Dorothy Williams',
  mrn: 'MRN-778899',
  admissionId: 'adm-55443',
};

const MOCK_RECERTIFICATIONS: RecertificationDocument[] = [
  {
    id: 'recert-001',
    status: 'in_progress',
    documentStatus: 'in_progress',
    patientId: 'pat-99888',
    admissionId: 'adm-55443',
    episodeId: 'ep-2024-001',
    currentPeriodStart: '2026-03-01',
    currentPeriodEnd: '2026-04-30',
    nextPeriodStart: '2026-05-01',
    nextPeriodEnd: '2026-06-30',
    recertificationNumber: 1,
    overallProgressSummary: 'Patient has demonstrated significant progress in wound healing and mobility over the current certification period. Pressure ulcer has decreased from stage 3 to stage 2 with 80% granulation tissue. Ambulation distance increased from 10 feet to 75 feet with walker. Patient remains homebound due to mobility limitations and wound care needs. Continued skilled nursing and therapy services are medically necessary to achieve complete wound healing and functional independence.',
    goalsReview: [
      {
        goalId: 'goal-001',
        goalStatement: 'Pressure ulcer will show signs of healing with 50% granulation tissue within 2 weeks',
        targetDate: '2026-03-22',
        status: 'met',
        outcomeNotes: 'Goal exceeded. Currently at 80% granulation tissue with significant size reduction.',
      },
      {
        goalId: 'goal-002',
        goalStatement: 'Patient will ambulate 50 feet with walker and minimal assistance within 3 weeks',
        targetDate: '2026-03-29',
        status: 'met',
        outcomeNotes: 'Goal achieved. Patient now ambulates 75 feet with walker and contact guard assistance.',
      },
      {
        goalId: 'goal-003',
        goalStatement: 'Patient will perform upper body dressing independently within 2 weeks',
        targetDate: '2026-03-22',
        status: 'met',
        outcomeNotes: 'Goal achieved. Patient dresses upper body independently.',
      },
    ],
    functionalStatusComparison: [
      {
        category: 'Ambulation',
        admissionStatus: 'Bedbound, total assistance required',
        currentStatus: 'Ambulates 75 feet with walker, contact guard',
        improvement: 'improved',
        notes: 'Significant improvement in mobility and endurance',
      },
      {
        category: 'Transfers',
        admissionStatus: 'Moderate assistance with all transfers',
        currentStatus: 'Minimal assistance with bed to chair',
        improvement: 'improved',
        notes: 'Improved strength and confidence with transfers',
      },
      {
        category: 'Dressing',
        admissionStatus: 'Total assistance required',
        currentStatus: 'Independent upper body, minimal assist lower body',
        improvement: 'improved',
        notes: 'Significant ADL progress',
      },
      {
        category: 'Wound Status',
        admissionStatus: 'Stage 3 pressure ulcer, 4.2 x 3.5 x 1.2 cm',
        currentStatus: 'Stage 2 pressure ulcer, 2.1 x 1.8 x 0.3 cm',
        improvement: 'improved',
        notes: 'Excellent wound healing progression',
      },
    ],
    clinicalUpdates: [
      {
        area: 'Wound Care',
        priorStatus: 'Stage 3 pressure ulcer with moderate drainage',
        currentStatus: 'Stage 2 pressure ulcer with minimal drainage',
        changeDescription: 'Wound has reduced in size by 60%, increased granulation tissue, decreased depth',
      },
      {
        area: 'Pain Management',
        priorStatus: 'Pain level 5-6/10 with dressing changes',
        currentStatus: 'Pain level 2-3/10 with dressing changes',
        changeDescription: 'Significant reduction in wound-related pain',
      },
    ],
    primaryDiagnosis: 'L89.622 - Pressure ulcer of left heel, stage 2',
    secondaryDiagnoses: [
      'E11.9 - Type 2 diabetes mellitus',
      'I10 - Essential hypertension',
      'M62.81 - Muscle weakness',
    ],
    vitalSignsTrends: 'Blood pressure stable, averaging 130/80. Blood glucose well-controlled with current regimen, averaging 110-140 mg/dL. No fever or signs of infection throughout certification period.',
    medicationChanges: 'No medication changes this period. Patient demonstrates good compliance with all prescribed medications including insulin, antihypertensive, and wound care products.',
    recentHospitalizations: 'None',
    recentERVisits: 'None',
    complications: 'None. No infections, no adverse events.',
    medicalNecessity: 'Patient continues to require skilled nursing services for complex wound care management of healing stage 2 pressure ulcer. Wound requires skilled assessment, advanced dressing application, and monitoring for complications. Physical therapy is medically necessary to continue strengthening and mobility training to prevent recurrence of pressure ulcer and achieve safe functional mobility. Occupational therapy needed to complete ADL training for lower body dressing to achieve independence.',
    skilledNeedJustification: 'Skilled nursing required for wound assessment, debridement as needed, application of specialized dressings, and monitoring for signs of infection or complications. Patient\'s diabetes increases infection risk requiring skilled monitoring. PT requires skilled assessment of gait, balance training, and therapeutic exercises that cannot be performed by non-skilled personnel. OT requires skilled assessment and training for safe ADL performance.',
    homebound_status: 'yes',
    homeboundJustification: 'Patient remains homebound due to significant mobility limitations. Requires walker and contact guard assistance for all ambulation. Cannot safely navigate stairs. Leaving home requires considerable and taxing effort and is contraindicated due to healing wound and fall risk. Patient only leaves home for medical appointments with transportation assistance.',
    expectedOutcomes: 'Complete wound healing within next 60 days, independent ambulation with walker for household distances, complete independence in all ADLs, safe discharge from home health services.',
    anticipatedDischargeDate: '2026-06-15',
    barriersTOProgress: 'Mild cognitive impairment affecting safety awareness, limited caregiver availability during weekdays, small apartment size limiting ambulation practice space.',
    interventionsForBarriers: 'Increased patient and caregiver education on safety, weekend caregiver training sessions scheduled, home safety modifications implemented including removal of trip hazards, strategically placed furniture for support during ambulation practice.',
    updatedGoals: [
      {
        id: 'new-goal-001',
        goalType: 'short_term',
        goalStatement: 'Pressure ulcer will achieve 100% epithelialization within 4 weeks',
        targetDate: '2026-05-29',
        discipline: 'SN',
      },
      {
        id: 'new-goal-002',
        goalType: 'short_term',
        goalStatement: 'Patient will ambulate 100 feet with walker and supervision only within 4 weeks',
        targetDate: '2026-05-29',
        discipline: 'PT',
      },
      {
        id: 'new-goal-003',
        goalType: 'long_term',
        goalStatement: 'Wound will be completely healed with no breakdown within 60 days',
        targetDate: '2026-06-30',
        discipline: 'SN',
      },
    ],
    updatedInterventions: [
      {
        id: 'new-int-001',
        discipline: 'SN',
        interventionCategory: 'Wound Care',
        interventionDescription: 'Continue wound assessment and treatment. Transition to less frequent dressing changes as healing progresses. Monitor for complete closure.',
        frequency: '3x per week',
        reasonForChange: 'Decreased from daily due to improved healing',
      },
      {
        id: 'new-int-002',
        discipline: 'PT',
        interventionCategory: 'Gait Training',
        interventionDescription: 'Progress gait training to longer distances, varied surfaces, and stairs if appropriate. Continue strengthening program.',
        frequency: '2x per week',
      },
    ],
    disciplineContinuation: [
      {
        discipline: 'SN',
        continue: true,
        frequency: '3x per week',
        totalVisits: 26,
        justification: 'Continued skilled wound care, medication management, and patient education required for complete healing',
      },
      {
        discipline: 'PT',
        continue: true,
        frequency: '2x per week',
        totalVisits: 17,
        justification: 'Continued therapy needed to achieve independent functional mobility and prevent pressure ulcer recurrence',
      },
      {
        discipline: 'OT',
        continue: false,
        frequency: 'Discontinued',
        totalVisits: 0,
        justification: 'Goals achieved, patient independent in all upper body ADLs, minimal assistance only for lower body dressing which caregiver can provide',
      },
    ],
    dmeChanges: 'No changes. Continue pressure relief mattress and walker.',
    patientFamilyEducation: 'Patient and daughter educated on continued pressure relief techniques, proper wound monitoring, signs of infection, medication management, fall prevention strategies, and proper use of assistive devices. Both verbalize understanding.',
    caregiverStatus: 'Daughter visits 3x per week, provides assistance with meals, medication reminders, and transportation to appointments. Demonstrates good understanding of care plan.',
    safetyAssessmentUpdates: 'Home remains safe with previously implemented modifications. No new hazards identified. Patient demonstrates improved safety awareness.',
    additionalComments: 'Patient highly motivated and compliant with treatment plan. Prognosis for complete healing and safe discharge is excellent.',
    orderingPhysician: 'Dr. Robert Martinez, MD',
    physicianNotificationDate: '2026-04-20',
    physicianNPI: '1234567890',
    physicianPhone: '(555) 123-4567',
    clinicianSignature: 'Maria Santos, RN, BSN',
    clinicianSignatureDate: '2026-04-25T14:30:00Z',
    clinicianCredentials: 'RN, BSN',
    signatureStatus: 'clinician_signed',
    createdBy: 'Maria Santos, RN',
    createdDate: '2026-04-20T10:00:00Z',
    lastModifiedBy: 'Maria Santos, RN',
    lastModifiedDate: '2026-04-25T14:30:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function RecertificationModule() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedRecert, setSelectedRecert] = useState<RecertificationDocument | null>(null);

  const handleViewRecert = (recert: RecertificationDocument) => {
    setSelectedRecert(recert);
    setSelectedView('detail');
  };

  const handleEditRecert = (recert: RecertificationDocument) => {
    setSelectedRecert(recert);
    setSelectedView('edit');
  };

  const handleNewRecert = () => {
    setSelectedRecert(null);
    setSelectedView('edit');
  };

  const handleBackToList = () => {
    setSelectedView('list');
    setSelectedRecert(null);
  };

  if (selectedView === 'list') {
    return (
      <RecertificationListView
        recertifications={MOCK_RECERTIFICATIONS}
        onViewRecert={handleViewRecert}
        onEditRecert={handleEditRecert}
        onNewRecert={handleNewRecert}
        onClose={() => navigate(-1)}
      />
    );
  }

  if (selectedView === 'detail' && selectedRecert) {
    return (
      <RecertificationDetailView
        recertification={selectedRecert}
        onBack={handleBackToList}
        onEdit={() => handleEditRecert(selectedRecert)}
      />
    );
  }

  if (selectedView === 'edit') {
    return (
      <RecertificationEditor
        recertification={selectedRecert}
        onClose={handleBackToList}
      />
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// RECERTIFICATION LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationListViewProps {
  recertifications: RecertificationDocument[];
  onViewRecert: (recert: RecertificationDocument) => void;
  onEditRecert: (recert: RecertificationDocument) => void;
  onNewRecert: () => void;
  onClose: () => void;
}

function RecertificationListView({ recertifications, onViewRecert, onEditRecert, onNewRecert, onClose }: RecertificationListViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Recertification Documents
                  </h1>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    Recertification
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>MRN: {MOCK_PATIENT.mrn}</span>
                  <span>•</span>
                  <span>{recertifications.length} {recertifications.length === 1 ? 'Recertification' : 'Recertifications'}</span>
                </div>
              </div>
            </div>

            <Button size="sm" onClick={onNewRecert}>
              <Plus className="w-4 h-4 mr-2" />
              New Recertification
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {recertifications.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Recertifications
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  No recertification documents have been created
                </p>
                <Button onClick={onNewRecert}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Recertification
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {recertifications.map(recert => (
                <RecertificationCard
                  key={recert.id}
                  recertification={recert}
                  onView={() => onViewRecert(recert)}
                  onEdit={() => onEditRecert(recert)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECERTIFICATION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationCardProps {
  recertification: RecertificationDocument;
  onView: () => void;
  onEdit: () => void;
}

function RecertificationCard({ recertification, onView, onEdit }: RecertificationCardProps) {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-300' },
    submitted: { label: 'Submitted', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  };

  const signatureConfig = {
    unsigned: { label: 'Unsigned', icon: AlertCircle, color: 'text-red-600' },
    clinician_signed: { label: 'Clinician Signed', icon: Clock, color: 'text-amber-600' },
    physician_signed: { label: 'Physician Signed', icon: Clock, color: 'text-amber-600' },
    fully_signed: { label: 'Fully Signed', icon: CheckCircle2, color: 'text-green-600' },
  };

  const signatureInfo = signatureConfig[recertification.signatureStatus];
  const SignatureIcon = signatureInfo.icon;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Recertification #{recertification.recertificationNumber}
            </h3>
            <Badge className={cn('border', statusConfig[recertification.status].color)}>
              {statusConfig[recertification.status].label}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            <div>Current Period: {new Date(recertification.currentPeriodStart).toLocaleDateString()} - {new Date(recertification.currentPeriodEnd).toLocaleDateString()}</div>
            <div>Next Period: {new Date(recertification.nextPeriodStart).toLocaleDateString()} - {new Date(recertification.nextPeriodEnd).toLocaleDateString()}</div>
          </div>
        </div>

        <div className={cn('flex items-center gap-2', signatureInfo.color)}>
          <SignatureIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{signatureInfo.label}</span>
        </div>
      </div>

      {/* Progress Summary Preview */}
      {recertification.overallProgressSummary && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Progress Summary</div>
          <div className="text-sm text-gray-700 line-clamp-2">
            {recertification.overallProgressSummary}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500">Goals Reviewed</div>
          <div className="font-semibold text-gray-900">{recertification.goalsReview.length}</div>
          <div className="text-xs text-gray-600">
            {recertification.goalsReview.filter(g => g.status === 'met').length} Met
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Functional Areas</div>
          <div className="font-semibold text-gray-900">{recertification.functionalStatusComparison.length}</div>
          <div className="text-xs text-gray-600">
            {recertification.functionalStatusComparison.filter(f => f.improvement === 'improved').length} Improved
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Updated Goals</div>
          <div className="font-semibold text-gray-900">{recertification.updatedGoals.length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Created</div>
          <div className="font-medium text-gray-900 text-xs">
            {new Date(recertification.createdDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Button size="sm" onClick={onView}>
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        {recertification.status !== 'submitted' && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECERTIFICATION DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationDetailViewProps {
  recertification: RecertificationDocument;
  onBack: () => void;
  onEdit: () => void;
}

function RecertificationDetailView({ recertification, onBack, onEdit }: RecertificationDetailViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Recertification #{recertification.recertificationNumber}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>Period: {new Date(recertification.nextPeriodStart).toLocaleDateString()} - {new Date(recertification.nextPeriodEnd).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              {recertification.status !== 'submitted' && (
                <Button size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Certification Periods */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Certification Periods
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-gray-500 mb-2">Current Period (Ending)</div>
                  <div className="text-lg font-bold text-gray-900">
                    {new Date(recertification.currentPeriodStart).toLocaleDateString()} - {new Date(recertification.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-purple-50 border-purple-300">
                  <div className="text-sm font-medium text-purple-700 mb-2">Next Period (Requesting)</div>
                  <div className="text-lg font-bold text-purple-900">
                    {new Date(recertification.nextPeriodStart).toLocaleDateString()} - {new Date(recertification.nextPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Overall Progress Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Overall Progress Summary
              </h2>
              
              <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {recertification.overallProgressSummary}
              </div>
            </Card>

            {/* Goals Review */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Goals Review - Current Period
              </h2>

              <div className="space-y-3">
                {recertification.goalsReview.map(goal => (
                  <GoalOutcomeCard key={goal.goalId} goal={goal} />
                ))}
              </div>
            </Card>

            {/* Functional Status Comparison */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Functional Status Comparison
              </h2>

              <div className="space-y-3">
                {recertification.functionalStatusComparison.map((comparison, index) => (
                  <FunctionalComparisonCard key={index} comparison={comparison} />
                ))}
              </div>
            </Card>

            {/* Clinical Status */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                Clinical Status
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Primary Diagnosis</Label>
                  <div className="mt-1 font-medium">{recertification.primaryDiagnosis}</div>
                </div>

                <div>
                  <Label className="text-gray-500">Secondary Diagnoses</Label>
                  <div className="mt-2 space-y-1">
                    {recertification.secondaryDiagnoses.map((dx, index) => (
                      <div key={index} className="text-sm">{dx}</div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Vital Signs Trends</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {recertification.vitalSignsTrends}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Medication Changes</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {recertification.medicationChanges}
                    </div>
                  </div>
                </div>

                {recertification.clinicalUpdates.length > 0 && (
                  <div>
                    <Label className="text-gray-500 mb-2 block">Clinical Updates</Label>
                    {recertification.clinicalUpdates.map((update, index) => (
                      <div key={index} className="mb-3 p-3 border rounded-lg">
                        <div className="font-medium text-sm mb-1">{update.area}</div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500">Prior:</span> {update.priorStatus}
                          </div>
                          <div>
                            <span className="text-gray-500">Current:</span> {update.currentStatus}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">{update.changeDescription}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-500">Recent Hospitalizations</Label>
                    <div className="mt-1">{recertification.recentHospitalizations}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Recent ER Visits</Label>
                    <div className="mt-1">{recertification.recentERVisits}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Complications</Label>
                    <div className="mt-1">{recertification.complications}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Continuation of Care Justification */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                Continuation of Care Justification
              </h2>

              <Alert className="mb-4 border-purple-300 bg-purple-50">
                <AlertTriangle className="h-4 w-4 text-purple-600" />
                <AlertTitle className="text-purple-800">Medicare Requirement</AlertTitle>
                <AlertDescription className="text-xs text-purple-700">
                  Detailed medical necessity and homebound justification required for recertification approval
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Medical Necessity</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {recertification.medicalNecessity}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Skilled Need Justification</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {recertification.skilledNeedJustification}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Homebound Status</Label>
                  <div className="mt-2">
                    <Badge className={cn(
                      recertification.homebound_status === 'yes' 
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    )}>
                      {recertification.homebound_status === 'yes' ? 'Homebound' : 'Not Homebound'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Homebound Justification</Label>
                  <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg whitespace-pre-wrap">
                    {recertification.homeboundJustification}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Expected Outcomes</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {recertification.expectedOutcomes}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Anticipated Discharge Date</Label>
                    <div className="mt-2 font-medium">
                      {new Date(recertification.anticipatedDischargeDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Barriers to Progress</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {recertification.barriersTOProgress}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Interventions for Barriers</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {recertification.interventionsForBarriers}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Updated Plan of Care */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Updated Plan of Care - Next Period
              </h2>

              {/* Updated Goals */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Updated Goals</h3>
                <div className="space-y-2">
                  {recertification.updatedGoals.map(goal => (
                    <div key={goal.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{goal.goalStatement}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            Target: {new Date(goal.targetDate).toLocaleDateString()} • Discipline: {goal.discipline}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {goal.goalType === 'short_term' ? 'Short-Term' : 'Long-Term'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Updated Interventions */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Updated Interventions</h3>
                <div className="space-y-2">
                  {recertification.updatedInterventions.map(intervention => (
                    <div key={intervention.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="outline" className="mb-1">{intervention.discipline}</Badge>
                          <div className="font-medium text-sm">{intervention.interventionCategory}</div>
                        </div>
                        <div className="text-xs text-gray-600">{intervention.frequency}</div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {intervention.interventionDescription}
                      </div>
                      {intervention.reasonForChange && (
                        <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                          Change: {intervention.reasonForChange}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Discipline Continuation */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Discipline Continuation</h3>
                <div className="space-y-3">
                  {recertification.disciplineContinuation.map((disc, index) => (
                    <div key={index} className={cn(
                      'p-4 rounded-lg border-2',
                      disc.continue 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-gray-50 border-gray-300'
                    )}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">{disc.discipline}</div>
                          <div className="text-sm text-gray-600">
                            {disc.continue ? (
                              <>Frequency: {disc.frequency} • Total Visits: {disc.totalVisits}</>
                            ) : (
                              <span className="text-red-600">Discontinued</span>
                            )}
                          </div>
                        </div>
                        <Badge className={cn(
                          disc.continue 
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        )}>
                          {disc.continue ? 'Continue' : 'Discontinue'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700">
                        {disc.justification}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {recertification.dmeChanges && (
                <div className="mt-6">
                  <Label className="text-gray-500">DME Changes</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    {recertification.dmeChanges}
                  </div>
                </div>
              )}
            </Card>

            {/* Additional Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Patient/Family Education</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {recertification.patientFamilyEducation}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Caregiver Status</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {recertification.caregiverStatus}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Safety Assessment Updates</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {recertification.safetyAssessmentUpdates}
                    </div>
                  </div>
                </div>

                {recertification.additionalComments && (
                  <div>
                    <Label className="text-gray-500">Additional Comments</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {recertification.additionalComments}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Signatures */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-purple-600" />
                Signatures
              </h2>

              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">Clinician Signature</div>
                    {recertification.clinicianSignature ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{recertification.clinicianSignature}</span>
                        </div>
                        <div className="text-xs">
                          Signed: {new Date(recertification.clinicianSignatureDate!).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Clock className="w-4 h-4" />
                        <span>Pending signature</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">Physician Signature</div>
                    {recertification.physicianSignature ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{recertification.physicianSignature}</span>
                        </div>
                        <div className="text-xs">
                          Signed: {new Date(recertification.physicianSignatureDate!).toLocaleString()}
                        </div>
                        <div className="text-xs">
                          Method: {recertification.physicianSignatureMethod}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <Clock className="w-4 h-4" />
                        <span>Pending signature</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function GoalOutcomeCard({ goal }: { goal: GoalOutcome }) {
  const statusConfig = {
    met: { label: 'Met', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle2 },
    partially_met: { label: 'Partially Met', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Clock },
    not_met: { label: 'Not Met', color: 'bg-red-100 text-red-700 border-red-300', icon: X },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: TrendingUp },
  };

  const statusInfo = statusConfig[goal.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">{goal.goalStatement}</div>
          <div className="text-xs text-gray-600">
            Target: {new Date(goal.targetDate).toLocaleDateString()}
          </div>
        </div>
        <Badge className={cn('border flex items-center gap-1', statusInfo.color)}>
          <StatusIcon className="w-3 h-3" />
          {statusInfo.label}
        </Badge>
      </div>
      <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
        {goal.outcomeNotes}
      </div>
    </div>
  );
}

function FunctionalComparisonCard({ comparison }: { comparison: FunctionalStatusComparison }) {
  const improvementConfig = {
    improved: { label: 'Improved', color: 'bg-green-100 text-green-700 border-green-300', icon: TrendingUp },
    stable: { label: 'Stable', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Activity },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle },
  };

  const improvementInfo = improvementConfig[comparison.improvement];
  const ImprovementIcon = improvementInfo.icon;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="font-semibold text-gray-900">{comparison.category}</div>
        <Badge className={cn('border flex items-center gap-1', improvementInfo.color)}>
          <ImprovementIcon className="w-3 h-3" />
          {improvementInfo.label}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <div className="text-xs text-gray-500 mb-1">Admission Status</div>
          <div className="text-sm text-gray-700">{comparison.admissionStatus}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Current Status</div>
          <div className="text-sm text-gray-700 font-medium">{comparison.currentStatus}</div>
        </div>
      </div>

      <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 mt-2">
        {comparison.notes}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RECERTIFICATION EDITOR
// ═══════════════════════════════════════════════════════════════════════════

interface RecertificationEditorProps {
  recertification: RecertificationDocument | null;
  onClose: () => void;
}

function RecertificationEditor({ recertification, onClose }: RecertificationEditorProps) {
  const [activeSection, setActiveSection] = useState('progress');
  const [showValidation, setShowValidation] = useState(false);
  
  const [values, setValues] = useState<Partial<RecertificationDocument>>(
    recertification || {
      documentStatus: 'draft',
      signatureStatus: 'unsigned',
      recertificationNumber: 1,
    }
  );

  const validationRules = useMemo(() => createValidationRules(), []);
  const validator = useMemo(() => new DocumentValidator(validationRules), [validationRules]);
  const [validationResult, setValidationResult] = useState<ValidationResult>(
    validator.validate(values)
  );

  useEffect(() => {
    setValidationResult(validator.validate(values));
  }, [values, validator]);

  const progress = useMemo(() => {
    const totalFields = validationRules.filter(r => r.required).length;
    const completedFields = validationRules.filter(rule => {
      if (!rule.required) return true;
      const value = values[rule.fieldId as keyof RecertificationDocument];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, [values, validationRules]);

  const handleFieldChange = (fieldId: keyof RecertificationDocument, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = () => {
    if (!validationResult.canSubmit) {
      setShowValidation(true);
      alert(`Cannot submit: ${validationResult.errorCount} validation errors must be fixed.`);
      return;
    }
    console.log('Submitting recertification...', values);
    alert('Recertification saved successfully!');
    onClose();
  };

  const sections = [
    { id: 'progress', label: 'Patient Progress', icon: TrendingUp },
    { id: 'clinical', label: 'Clinical Status', icon: Stethoscope },
    { id: 'justification', label: 'Continuation Justification', icon: AlertCircle },
    { id: 'updated_plan', label: 'Updated Plan of Care', icon: FileText },
    { id: 'additional', label: 'Additional Information', icon: FileText },
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
                Cancel
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {recertification ? `Edit Recertification #${recertification.recertificationNumber}` : 'New Recertification'}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
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
              <Button variant="outline" size="sm">
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
              <span className="text-gray-600">Completion Progress</span>
              <span className="font-semibold text-gray-900">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recert Sections
            </h3>
            <nav className="space-y-1">
              {sections.map(section => {
                const Icon = section.icon;
                const sectionErrors = validationResult.errors.filter(
                  e => e.sectionId === section.id
                ).length;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                      activeSection === section.id
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{section.label}</span>
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
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                
                <div className="text-sm text-gray-600">
                  Form content for {activeSection} section would be rendered here with all required fields, textareas, and validation...
                </div>
              </Card>
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
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

function createValidationRules(): FieldValidationRule[] {
  return [
    {
      fieldId: 'overallProgressSummary',
      fieldLabel: 'Overall Progress Summary',
      sectionId: 'progress',
      sectionTitle: 'Patient Progress',
      required: true,
      minLength: 100,
    },
    {
      fieldId: 'medicalNecessity',
      fieldLabel: 'Medical Necessity',
      sectionId: 'justification',
      sectionTitle: 'Continuation Justification',
      required: true,
      minLength: 50,
    },
    {
      fieldId: 'skilledNeedJustification',
      fieldLabel: 'Skilled Need Justification',
      sectionId: 'justification',
      sectionTitle: 'Continuation Justification',
      required: true,
      minLength: 50,
    },
    {
      fieldId: 'homebound_status',
      fieldLabel: 'Homebound Status',
      sectionId: 'justification',
      sectionTitle: 'Continuation Justification',
      required: true,
    },
    {
      fieldId: 'homeboundJustification',
      fieldLabel: 'Homebound Justification',
      sectionId: 'justification',
      sectionTitle: 'Continuation Justification',
      required: true,
      minLength: 50,
    },
    {
      fieldId: 'expectedOutcomes',
      fieldLabel: 'Expected Outcomes',
      sectionId: 'justification',
      sectionTitle: 'Continuation Justification',
      required: true,
    },
    {
      fieldId: 'anticipatedDischargeDate',
      fieldLabel: 'Anticipated Discharge Date',
      sectionId: 'justification',
      sectionTitle: 'Continuation Justification',
      required: true,
    },
  ];
}
