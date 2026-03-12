/**
 * Plan of Care Documentation Module
 * 
 * Comprehensive care planning system for home health
 * Includes patient diagnoses, care goals, interventions, disciplines, and visit frequency
 * Tracks physician signatures and care plan updates
 */

import { useState, useMemo } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Plus,
  Target,
  Stethoscope,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  PenTool,
  Eye,
  Edit,
  History,
  Download,
  ClipboardList,
  Activity,
  TrendingUp,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type PlanOfCareStatus = 'draft' | 'pending_approval' | 'active' | 'revised' | 'expired' | 'discontinued';

type GoalStatus = 'not_started' | 'in_progress' | 'partially_met' | 'met' | 'not_met';

interface Diagnosis {
  id: string;
  icdCode: string;
  description: string;
  isPrimary: boolean;
  diagnosisDate: string;
}

interface CareGoal {
  id: string;
  goalType: 'short_term' | 'long_term';
  goalStatement: string;
  targetDate: string;
  discipline: string;
  status: GoalStatus;
  progressNotes?: string;
  dateAchieved?: string;
}

interface Intervention {
  id: string;
  discipline: string;
  interventionCategory: string;
  interventionDescription: string;
  frequency: string;
  duration: string;
}

interface DisciplineService {
  discipline: string;
  disciplineName: string;
  frequency: string;
  duration: string;
  totalVisits: number;
  specificServices: string[];
}

interface PlanOfCare {
  id: string;
  version: number;
  status: PlanOfCareStatus;
  
  // Patient Info
  patientId: string;
  admissionId: string;
  episodeId: string;
  
  // Dates
  certificationPeriodStart: string;
  certificationPeriodEnd: string;
  createdDate: string;
  effectiveDate: string;
  expirationDate?: string;
  
  // Clinical Information
  diagnoses: Diagnosis[];
  primaryDiagnosis: string;
  functionalLimitations: string[];
  safetyMeasures: string[];
  
  // Care Goals
  goals: CareGoal[];
  
  // Interventions
  interventions: Intervention[];
  
  // Disciplines & Frequency
  disciplines: DisciplineService[];
  
  // DME & Supplies
  dmeSupplies?: string[];
  
  // Orders
  ordersNeeded?: string[];
  
  // Physician Information
  orderingPhysician: string;
  physicianNPI?: string;
  physicianPhone?: string;
  physicianAddress?: string;
  
  // Signature Tracking
  clinicianSignature?: string;
  clinicianSignatureDate?: string;
  clinicianCredentials?: string;
  
  physicianSignature?: string;
  physicianSignatureDate?: string;
  physicianSignatureMethod?: 'electronic' | 'wet_signature' | 'verbal' | 'fax';
  
  signatureStatus: 'unsigned' | 'clinician_signed' | 'physician_signed' | 'fully_signed';
  
  // Updates & Revisions
  revisionReason?: string;
  revisedFrom?: string; // ID of previous version
  updatedBy?: string;
  lastModifiedDate?: string;
  
  // Notes
  additionalNotes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_PATIENT = {
  id: 'pat-99888',
  name: 'Dorothy Williams',
  mrn: 'MRN-778899',
  dob: '1945-06-15',
  admissionId: 'adm-55443',
};

const MOCK_PLANS: PlanOfCare[] = [
  {
    id: 'poc-001',
    version: 2,
    status: 'active',
    patientId: 'pat-99888',
    admissionId: 'adm-55443',
    episodeId: 'ep-2024-001',
    certificationPeriodStart: '2026-03-01',
    certificationPeriodEnd: '2026-04-30',
    createdDate: '2026-03-08T10:00:00Z',
    effectiveDate: '2026-03-08',
    diagnoses: [
      {
        id: 'dx-001',
        icdCode: 'L89.623',
        description: 'Pressure ulcer of left heel, stage 3',
        isPrimary: true,
        diagnosisDate: '2026-02-15',
      },
      {
        id: 'dx-002',
        icdCode: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        isPrimary: false,
        diagnosisDate: '2024-05-10',
      },
      {
        id: 'dx-003',
        icdCode: 'I10',
        description: 'Essential (primary) hypertension',
        isPrimary: false,
        diagnosisDate: '2023-08-20',
      },
      {
        id: 'dx-004',
        icdCode: 'M62.81',
        description: 'Muscle weakness (generalized)',
        isPrimary: false,
        diagnosisDate: '2026-02-15',
      },
    ],
    primaryDiagnosis: 'Pressure ulcer of left heel, stage 3',
    functionalLimitations: [
      'Ambulation',
      'Transferring',
      'Dressing',
      'Bathing',
    ],
    safetyMeasures: [
      'Fall precautions',
      'Pressure relief',
      'Glucose monitoring',
    ],
    goals: [
      {
        id: 'goal-001',
        goalType: 'short_term',
        goalStatement: 'Pressure ulcer will show signs of healing with 50% granulation tissue within 2 weeks',
        targetDate: '2026-03-22',
        discipline: 'SN',
        status: 'in_progress',
        progressNotes: 'Currently at 40% granulation, trending positive',
      },
      {
        id: 'goal-002',
        goalType: 'short_term',
        goalStatement: 'Patient will ambulate 50 feet with walker and minimal assistance within 3 weeks',
        targetDate: '2026-03-29',
        discipline: 'PT',
        status: 'in_progress',
        progressNotes: 'Currently ambulating 30 feet with moderate assistance',
      },
      {
        id: 'goal-003',
        goalType: 'short_term',
        goalStatement: 'Patient will perform upper body dressing independently within 2 weeks',
        targetDate: '2026-03-22',
        discipline: 'OT',
        status: 'in_progress',
      },
      {
        id: 'goal-004',
        goalType: 'long_term',
        goalStatement: 'Pressure ulcer will be completely healed within 60 days',
        targetDate: '2026-04-30',
        discipline: 'SN',
        status: 'in_progress',
      },
      {
        id: 'goal-005',
        goalType: 'long_term',
        goalStatement: 'Patient will ambulate independently with walker for household distances within 60 days',
        targetDate: '2026-04-30',
        discipline: 'PT',
        status: 'in_progress',
      },
    ],
    interventions: [
      {
        id: 'int-001',
        discipline: 'SN',
        interventionCategory: 'Wound Care',
        interventionDescription: 'Assess and treat stage 3 pressure ulcer. Cleanse with normal saline, apply foam dressing, secure with tape. Document size, drainage, and healing progress.',
        frequency: 'Daily',
        duration: '60 days',
      },
      {
        id: 'int-002',
        discipline: 'SN',
        interventionCategory: 'Medication Management',
        interventionDescription: 'Monitor blood glucose levels, assess medication compliance, educate on insulin administration and diabetes management.',
        frequency: '3x per week',
        duration: '60 days',
      },
      {
        id: 'int-003',
        discipline: 'SN',
        interventionCategory: 'Vital Signs',
        interventionDescription: 'Monitor vital signs including blood pressure, heart rate, temperature. Report abnormal findings to physician.',
        frequency: 'Each visit',
        duration: '60 days',
      },
      {
        id: 'int-004',
        discipline: 'PT',
        interventionCategory: 'Gait Training',
        interventionDescription: 'Provide gait training with walker, strengthen lower extremities, improve balance and endurance.',
        frequency: '2x per week',
        duration: '60 days',
      },
      {
        id: 'int-005',
        discipline: 'PT',
        interventionCategory: 'Therapeutic Exercise',
        interventionDescription: 'Implement strengthening exercises for lower extremities, focus on hip and knee flexors/extensors.',
        frequency: '2x per week',
        duration: '60 days',
      },
      {
        id: 'int-006',
        discipline: 'OT',
        interventionCategory: 'ADL Training',
        interventionDescription: 'Provide training in dressing, grooming, and bathing techniques. Recommend adaptive equipment as needed.',
        frequency: '2x per week',
        duration: '60 days',
      },
    ],
    disciplines: [
      {
        discipline: 'SN',
        disciplineName: 'Skilled Nursing',
        frequency: 'Daily for 2 weeks, then 3x/week',
        duration: '60 days',
        totalVisits: 37,
        specificServices: [
          'Wound care and assessment',
          'Medication management',
          'Vital signs monitoring',
          'Patient/caregiver education',
        ],
      },
      {
        discipline: 'PT',
        disciplineName: 'Physical Therapy',
        frequency: '2x per week',
        duration: '60 days',
        totalVisits: 17,
        specificServices: [
          'Gait training',
          'Strengthening exercises',
          'Balance training',
          'Mobility assessment',
        ],
      },
      {
        discipline: 'OT',
        disciplineName: 'Occupational Therapy',
        frequency: '2x per week',
        duration: '30 days',
        totalVisits: 8,
        specificServices: [
          'ADL training',
          'Upper extremity strengthening',
          'Adaptive equipment assessment',
          'Home safety evaluation',
        ],
      },
    ],
    dmeSupplies: [
      'Pressure relief mattress',
      'Walker with wheels',
      'Wound care supplies (foam dressings, tape, saline)',
      'Blood glucose monitor and test strips',
    ],
    ordersNeeded: [
      'Continue current wound care protocol',
      'Monitor blood glucose daily',
      'PT/OT evaluations',
    ],
    orderingPhysician: 'Dr. Robert Martinez, MD',
    physicianNPI: '1234567890',
    physicianPhone: '(555) 123-4567',
    physicianAddress: '123 Medical Plaza, Suite 200, Springfield, IL 62701',
    clinicianSignature: 'Maria Santos, RN, BSN',
    clinicianSignatureDate: '2026-03-08T11:00:00Z',
    clinicianCredentials: 'RN, BSN',
    physicianSignature: 'Dr. Robert Martinez, MD',
    physicianSignatureDate: '2026-03-08T15:30:00Z',
    physicianSignatureMethod: 'electronic',
    signatureStatus: 'fully_signed',
    revisionReason: 'Added OT services due to decreased ADL independence',
    revisedFrom: 'poc-000',
    updatedBy: 'Maria Santos, RN',
    lastModifiedDate: '2026-03-08T10:00:00Z',
  },
  {
    id: 'poc-000',
    version: 1,
    status: 'revised',
    patientId: 'pat-99888',
    admissionId: 'adm-55443',
    episodeId: 'ep-2024-001',
    certificationPeriodStart: '2026-03-01',
    certificationPeriodEnd: '2026-04-30',
    createdDate: '2026-03-01T10:00:00Z',
    effectiveDate: '2026-03-01',
    expirationDate: '2026-03-08',
    diagnoses: [
      {
        id: 'dx-001',
        icdCode: 'L89.623',
        description: 'Pressure ulcer of left heel, stage 3',
        isPrimary: true,
        diagnosisDate: '2026-02-15',
      },
      {
        id: 'dx-002',
        icdCode: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        isPrimary: false,
        diagnosisDate: '2024-05-10',
      },
    ],
    primaryDiagnosis: 'Pressure ulcer of left heel, stage 3',
    functionalLimitations: ['Ambulation', 'Transferring'],
    safetyMeasures: ['Fall precautions', 'Pressure relief'],
    goals: [
      {
        id: 'goal-old-001',
        goalType: 'short_term',
        goalStatement: 'Pressure ulcer will show signs of healing within 2 weeks',
        targetDate: '2026-03-15',
        discipline: 'SN',
        status: 'in_progress',
      },
    ],
    interventions: [
      {
        id: 'int-old-001',
        discipline: 'SN',
        interventionCategory: 'Wound Care',
        interventionDescription: 'Assess and treat stage 3 pressure ulcer',
        frequency: '3x per week',
        duration: '60 days',
      },
    ],
    disciplines: [
      {
        discipline: 'SN',
        disciplineName: 'Skilled Nursing',
        frequency: '3x per week',
        duration: '60 days',
        totalVisits: 26,
        specificServices: ['Wound care', 'Medication management'],
      },
      {
        discipline: 'PT',
        disciplineName: 'Physical Therapy',
        frequency: '2x per week',
        duration: '60 days',
        totalVisits: 17,
        specificServices: ['Gait training', 'Strengthening'],
      },
    ],
    orderingPhysician: 'Dr. Robert Martinez, MD',
    physicianNPI: '1234567890',
    clinicianSignature: 'Maria Santos, RN, BSN',
    clinicianSignatureDate: '2026-03-01T14:00:00Z',
    physicianSignature: 'Dr. Robert Martinez, MD',
    physicianSignatureDate: '2026-03-01T10:30:00Z',
    physicianSignatureMethod: 'electronic',
    signatureStatus: 'fully_signed',
    updatedBy: 'Maria Santos, RN',
    lastModifiedDate: '2026-03-01T10:00:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function PlanOfCareModule() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedPlan, setSelectedPlan] = useState<PlanOfCare | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const handleViewPlan = (plan: PlanOfCare) => {
    setSelectedPlan(plan);
    setSelectedView('detail');
  };

  const handleEditPlan = (plan: PlanOfCare) => {
    setSelectedPlan(plan);
    setSelectedView('edit');
  };

  const handleNewPlan = () => {
    setSelectedPlan(null);
    setSelectedView('edit');
  };

  const handleBackToList = () => {
    setSelectedView('list');
    setSelectedPlan(null);
  };

  if (selectedView === 'list') {
    return (
      <PlanOfCareListView
        plans={MOCK_PLANS}
        onViewPlan={handleViewPlan}
        onEditPlan={handleEditPlan}
        onNewPlan={handleNewPlan}
        onClose={() => navigate(-1)}
      />
    );
  }

  if (selectedView === 'detail' && selectedPlan) {
    return (
      <PlanOfCareDetailView
        plan={selectedPlan}
        onBack={handleBackToList}
        onEdit={() => handleEditPlan(selectedPlan)}
        onViewHistory={() => setShowVersionHistory(true)}
      />
    );
  }

  if (selectedView === 'edit') {
    return (
      <PlanOfCareEditor
        plan={selectedPlan}
        onClose={handleBackToList}
      />
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN OF CARE LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface PlanOfCareListViewProps {
  plans: PlanOfCare[];
  onViewPlan: (plan: PlanOfCare) => void;
  onEditPlan: (plan: PlanOfCare) => void;
  onNewPlan: () => void;
  onClose: () => void;
}

function PlanOfCareListView({ plans, onViewPlan, onEditPlan, onNewPlan, onClose }: PlanOfCareListViewProps) {
  const activePlan = plans.find(p => p.status === 'active');
  const historicalPlans = plans.filter(p => p.status !== 'active').sort((a, b) => b.version - a.version);

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
                    Plan of Care
                  </h1>
                  <Badge className="bg-teal-100 text-teal-700 border-teal-300">
                    Care Planning
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>MRN: {MOCK_PATIENT.mrn}</span>
                  <span>•</span>
                  <span>DOB: {new Date(MOCK_PATIENT.dob).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Button size="sm" onClick={onNewPlan}>
              <Plus className="w-4 h-4 mr-2" />
              New Plan of Care
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Active Plan */}
          {activePlan && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Active Plan of Care
              </h2>
              <PlanOfCareCard
                plan={activePlan}
                onView={() => onViewPlan(activePlan)}
                onEdit={() => onEditPlan(activePlan)}
              />
            </div>
          )}

          {/* Historical Plans */}
          {historicalPlans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-600" />
                Plan History ({historicalPlans.length})
              </h2>
              <div className="space-y-3">
                {historicalPlans.map(plan => (
                  <PlanOfCareCard
                    key={plan.id}
                    plan={plan}
                    onView={() => onViewPlan(plan)}
                    onEdit={() => onEditPlan(plan)}
                  />
                ))}
              </div>
            </div>
          )}

          {plans.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Plan of Care
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  No care plan has been created for this patient
                </p>
                <Button onClick={onNewPlan}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan of Care
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN OF CARE CARD
// ═══════════════════════════════════════════════════════════════════════════

interface PlanOfCareCardProps {
  plan: PlanOfCare;
  onView: () => void;
  onEdit: () => void;
}

function PlanOfCareCard({ plan, onView, onEdit }: PlanOfCareCardProps) {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-300' },
    revised: { label: 'Revised', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-300' },
    discontinued: { label: 'Discontinued', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  };

  const signatureConfig = {
    unsigned: { label: 'Unsigned', icon: AlertCircle, color: 'text-red-600' },
    clinician_signed: { label: 'Clinician Signed', icon: Clock, color: 'text-amber-600' },
    physician_signed: { label: 'Physician Signed', icon: Clock, color: 'text-amber-600' },
    fully_signed: { label: 'Fully Signed', icon: CheckCircle2, color: 'text-green-600' },
  };

  const signatureInfo = signatureConfig[plan.signatureStatus];
  const SignatureIcon = signatureInfo.icon;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Plan of Care - Version {plan.version}
            </h3>
            <Badge className={cn('border', statusConfig[plan.status].color)}>
              {statusConfig[plan.status].label}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            <div>Certification Period: {new Date(plan.certificationPeriodStart).toLocaleDateString()} - {new Date(plan.certificationPeriodEnd).toLocaleDateString()}</div>
            <div>Created: {new Date(plan.createdDate).toLocaleDateString()}</div>
          </div>
        </div>

        <div className={cn('flex items-center gap-2', signatureInfo.color)}>
          <SignatureIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{signatureInfo.label}</span>
        </div>
      </div>

      {/* Primary Diagnosis */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500 mb-1">Primary Diagnosis</div>
        <div className="font-medium text-gray-900">{plan.primaryDiagnosis}</div>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500">Disciplines</div>
          <div className="font-semibold text-gray-900">{plan.disciplines.length}</div>
          <div className="text-xs text-gray-600">
            {plan.disciplines.map(d => d.discipline).join(', ')}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Goals</div>
          <div className="font-semibold text-gray-900">{plan.goals.length}</div>
          <div className="text-xs text-gray-600">
            {plan.goals.filter(g => g.status === 'met').length} Met
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Interventions</div>
          <div className="font-semibold text-gray-900">{plan.interventions.length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Physician</div>
          <div className="font-medium text-gray-900 text-xs truncate">
            {plan.orderingPhysician}
          </div>
        </div>
      </div>

      {plan.revisionReason && (
        <Alert className="mb-4 border-blue-300 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 text-sm">Plan Updated</AlertTitle>
          <AlertDescription className="text-xs text-blue-700">
            {plan.revisionReason}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Button size="sm" onClick={onView}>
          <Eye className="w-4 h-4 mr-1" />
          View Plan
        </Button>
        {plan.status === 'active' && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" />
            Update Plan
          </Button>
        )}
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          Export PDF
        </Button>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN OF CARE DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface PlanOfCareDetailViewProps {
  plan: PlanOfCare;
  onBack: () => void;
  onEdit: () => void;
  onViewHistory: () => void;
}

function PlanOfCareDetailView({ plan, onBack, onEdit, onViewHistory }: PlanOfCareDetailViewProps) {
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
                  Plan of Care - Version {plan.version}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>
                    {new Date(plan.certificationPeriodStart).toLocaleDateString()} - {new Date(plan.certificationPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {plan.version > 1 && (
                <Button variant="outline" size="sm" onClick={onViewHistory}>
                  <History className="w-4 h-4 mr-2" />
                  Version History
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              {plan.status === 'active' && (
                <Button size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Plan
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
            {/* Header Info */}
            <Card className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-gray-500">Certification Period</Label>
                  <div className="font-medium mt-1">
                    {new Date(plan.certificationPeriodStart).toLocaleDateString()} - {new Date(plan.certificationPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Effective Date</Label>
                  <div className="font-medium mt-1">
                    {new Date(plan.effectiveDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge>{plan.status}</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Diagnoses */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Diagnoses
              </h2>
              
              <div className="space-y-3">
                {plan.diagnoses.map(dx => (
                  <div key={dx.id} className={cn(
                    'p-4 rounded-lg border-2',
                    dx.isPrimary ? 'border-teal-300 bg-teal-50' : 'border-gray-200 bg-white'
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {dx.icdCode}
                          </span>
                          {dx.isPrimary && (
                            <Badge className="bg-teal-100 text-teal-700 border-teal-300">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="text-gray-900">{dx.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Diagnosis Date: {new Date(dx.diagnosisDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Functional Limitations & Safety */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Functional Limitations</h3>
                <div className="space-y-2">
                  {plan.functionalLimitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{limitation}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Safety Measures</h3>
                <div className="space-y-2">
                  {plan.safetyMeasures.map((measure, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>{measure}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Goals */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                Care Goals
              </h2>

              <Tabs defaultValue="short_term">
                <TabsList>
                  <TabsTrigger value="short_term">
                    Short-Term Goals ({plan.goals.filter(g => g.goalType === 'short_term').length})
                  </TabsTrigger>
                  <TabsTrigger value="long_term">
                    Long-Term Goals ({plan.goals.filter(g => g.goalType === 'long_term').length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="short_term" className="mt-4">
                  <div className="space-y-3">
                    {plan.goals.filter(g => g.goalType === 'short_term').map(goal => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="long_term" className="mt-4">
                  <div className="space-y-3">
                    {plan.goals.filter(g => g.goalType === 'long_term').map(goal => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Interventions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Interventions
              </h2>

              <div className="space-y-4">
                {plan.disciplines.map(discipline => {
                  const disciplineInterventions = plan.interventions.filter(
                    i => i.discipline === discipline.discipline
                  );

                  return (
                    <div key={discipline.discipline} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{discipline.disciplineName}</h3>
                        <Badge variant="outline">{discipline.discipline}</Badge>
                      </div>

                      <div className="space-y-3">
                        {disciplineInterventions.map(intervention => (
                          <div key={intervention.id} className="pl-4 border-l-2 border-teal-300">
                            <div className="font-medium text-sm text-gray-900 mb-1">
                              {intervention.interventionCategory}
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              {intervention.interventionDescription}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>Frequency: {intervention.frequency}</span>
                              <span>•</span>
                              <span>Duration: {intervention.duration}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Disciplines & Visit Frequency */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Disciplines & Visit Frequency
              </h2>

              <div className="space-y-4">
                {plan.disciplines.map(discipline => (
                  <div key={discipline.discipline} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{discipline.disciplineName}</div>
                        <Badge variant="outline" className="mt-1">{discipline.discipline}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-600">{discipline.totalVisits}</div>
                        <div className="text-xs text-gray-500">Total Visits</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-500">Frequency</div>
                        <div className="font-medium text-sm">{discipline.frequency}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Duration</div>
                        <div className="font-medium text-sm">{discipline.duration}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-2">Services</div>
                      <div className="flex flex-wrap gap-2">
                        {discipline.specificServices.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* DME & Supplies */}
            {plan.dmeSupplies && plan.dmeSupplies.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">DME & Supplies</h3>
                <div className="space-y-2">
                  {plan.dmeSupplies.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Physician Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Ordering Physician
              </h2>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <Label className="text-gray-500">Physician Name</Label>
                  <div className="font-medium mt-1">{plan.orderingPhysician}</div>
                </div>
                {plan.physicianNPI && (
                  <div>
                    <Label className="text-gray-500">NPI</Label>
                    <div className="font-medium mt-1">{plan.physicianNPI}</div>
                  </div>
                )}
                {plan.physicianPhone && (
                  <div>
                    <Label className="text-gray-500">Phone</Label>
                    <div className="font-medium mt-1">{plan.physicianPhone}</div>
                  </div>
                )}
              </div>

              {plan.physicianAddress && (
                <div>
                  <Label className="text-gray-500">Address</Label>
                  <div className="mt-1">{plan.physicianAddress}</div>
                </div>
              )}
            </Card>

            {/* Signatures */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-teal-600" />
                Signatures
              </h2>

              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">Clinician Signature</div>
                    {plan.clinicianSignature ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{plan.clinicianSignature}</span>
                        </div>
                        <div className="text-xs">
                          Signed: {new Date(plan.clinicianSignatureDate!).toLocaleString()}
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
                    {plan.physicianSignature ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{plan.physicianSignature}</span>
                        </div>
                        <div className="text-xs">
                          Signed: {new Date(plan.physicianSignatureDate!).toLocaleString()}
                        </div>
                        <div className="text-xs">
                          Method: {plan.physicianSignatureMethod}
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
// GOAL CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function GoalCard({ goal }: { goal: CareGoal }) {
  const statusConfig = {
    not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700 border-gray-300', progress: 0 },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300', progress: 50 },
    partially_met: { label: 'Partially Met', color: 'bg-amber-100 text-amber-700 border-amber-300', progress: 75 },
    met: { label: 'Met', color: 'bg-green-100 text-green-700 border-green-300', progress: 100 },
    not_met: { label: 'Not Met', color: 'bg-red-100 text-red-700 border-red-300', progress: 0 },
  };

  const statusInfo = statusConfig[goal.status];

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">{goal.goalStatement}</div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
            <span>•</span>
            <span>Discipline: {goal.discipline}</span>
          </div>
        </div>
        <Badge className={cn('border', statusInfo.color)}>
          {statusInfo.label}
        </Badge>
      </div>

      <Progress value={statusInfo.progress} className="h-2 mb-3" />

      {goal.progressNotes && (
        <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
          <div className="text-xs text-gray-500 mb-1">Progress Notes:</div>
          {goal.progressNotes}
        </div>
      )}

      {goal.dateAchieved && (
        <div className="text-xs text-green-600 mt-2">
          ✓ Achieved: {new Date(goal.dateAchieved).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN OF CARE EDITOR
// ═══════════════════════════════════════════════════════════════════════════

interface PlanOfCareEditorProps {
  plan: PlanOfCare | null;
  onClose: () => void;
}

function PlanOfCareEditor({ plan, onClose }: PlanOfCareEditorProps) {
  const [activeSection, setActiveSection] = useState('basic');

  const handleSave = () => {
    console.log('Saving plan of care...');
    alert('Plan of Care saved successfully!');
    onClose();
  };

  const sections = [
    { id: 'basic', label: 'Basic Information', icon: FileText },
    { id: 'diagnoses', label: 'Diagnoses', icon: Stethoscope },
    { id: 'goals', label: 'Care Goals', icon: Target },
    { id: 'interventions', label: 'Interventions', icon: Activity },
    { id: 'disciplines', label: 'Disciplines & Frequency', icon: Users },
    { id: 'physician', label: 'Physician Information', icon: Stethoscope },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {plan ? `Update Plan of Care - Version ${plan.version + 1}` : 'New Plan of Care'}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Plan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Plan Sections
            </h3>
            <nav className="space-y-1">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                      activeSection === section.id
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Form Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {sections.find(s => s.id === activeSection)?.label}
              </h2>
              
              <div className="text-gray-600">
                Form fields for {activeSection} would go here...
              </div>

              {activeSection === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Certification Period Start" required>
                      <Input type="date" />
                    </FormField>
                    <FormField label="Certification Period End" required>
                      <Input type="date" />
                    </FormField>
                  </div>

                  {plan && (
                    <FormField label="Reason for Update" required>
                      <Textarea
                        rows={3}
                        placeholder="Describe why the care plan is being updated..."
                      />
                    </FormField>
                  )}
                </div>
              )}
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
