/**
 * Discharge Summary Documentation Module
 * 
 * Comprehensive discharge documentation for home health episode completion
 * Includes patient condition, goals achieved, remaining needs, education, and follow-up
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
  CheckCircle2,
  AlertCircle,
  Target,
  Activity,
  GraduationCap,
  Stethoscope,
  CalendarCheck,
  Heart,
  Home,
  TrendingUp,
  Users,
  Pill,
  Shield,
  BookOpen,
  Phone,
  Download,
  Eye,
  Edit,
  PenTool,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type DischargeReason = 
  | 'goals_achieved'
  | 'patient_decline'
  | 'patient_deceased'
  | 'patient_request'
  | 'physician_order'
  | 'non_compliant'
  | 'hospitalized'
  | 'transferred_facility'
  | 'no_longer_homebound'
  | 'other';

type GoalAchievement = 'fully_achieved' | 'partially_achieved' | 'not_achieved' | 'in_progress';

interface DischargeGoal {
  goalId: string;
  goalStatement: string;
  discipline: string;
  achievementStatus: GoalAchievement;
  outcomeDescription: string;
}

interface FunctionalStatusAtDischarge {
  category: string;
  admissionStatus: string;
  dischargeStatus: string;
  improvement: 'improved' | 'stable' | 'declined';
}

interface EducationProvided {
  topic: string;
  methodOfInstruction: string;
  materialProvided: string;
  learningBarriers?: string;
  comprehensionLevel: 'full' | 'partial' | 'minimal';
  demonstrationPerformed: boolean;
  reinforcementNeeded: boolean;
}

interface FollowUpRecommendation {
  category: string;
  recommendation: string;
  frequency?: string;
  referralMade: boolean;
  contactInfo?: string;
}

interface DischargeSummary {
  id: string;
  status: 'draft' | 'in_progress' | 'completed' | 'submitted';
  documentStatus: DocumentStatus;
  
  // Patient & Episode Info
  patientId: string;
  admissionId: string;
  episodeId: string;
  admissionDate: string;
  dischargeDate: string;
  lengthOfStay: number;
  totalVisits: number;
  
  // Discharge Information
  dischargeReason: DischargeReason;
  dischargeReasonDetail: string;
  dischargeDestination: string;
  
  // Patient Condition at Discharge
  primaryDiagnosisAtDischarge: string;
  secondaryDiagnosesAtDischarge: string[];
  functionalStatusAtDischarge: FunctionalStatusAtDischarge[];
  cognitiveStatus: string;
  mentalStatus: string;
  mobilityStatus: string;
  adlStatus: string;
  painStatus: string;
  vitalSignsAtDischarge: string;
  woundStatus?: string;
  
  // Clinical Summary
  servicesProvided: string[];
  disciplinesInvolved: string[];
  overallProgressSummary: string;
  clinicalHighlights: string;
  complicationsDuringCare: string;
  
  // Goals Achieved
  goalsAchievement: DischargeGoal[];
  overallGoalsSummary: string;
  
  // Remaining Care Needs
  ongoingCareNeeds: string;
  equipmentNeeds: string[];
  dmeAtDischarge: string[];
  medicationsAtDischarge: {
    medicationName: string;
    dosage: string;
    frequency: string;
    instructions: string;
  }[];
  dietRestrictions: string;
  activityRestrictions: string;
  precautions: string[];
  
  // Patient Education
  educationProvided: EducationProvided[];
  educationSummary: string;
  caregiverEducation: string;
  caregiverCompetency: string;
  
  // Follow-Up Recommendations
  followUpRecommendations: FollowUpRecommendation[];
  primaryCarePhysician: string;
  pcpNotificationDate: string;
  pcpFollowUpScheduled: boolean;
  pcpFollowUpDate?: string;
  specialistFollowUp: string;
  emergencyContactPlan: string;
  
  // Discharge Planning
  dischargeSupport: string;
  communityResourcesProvided: string[];
  transportationArrangements: string;
  homeEnvironmentSafety: string;
  caregiverAvailability: string;
  
  // Additional Information
  patientFamilySatisfaction: string;
  dischargeReadiness: string;
  additionalComments: string;
  
  // Signatures
  clinicianSignature?: string;
  clinicianSignatureDate?: string;
  clinicianCredentials?: string;
  
  supervisorSignature?: string;
  supervisorSignatureDate?: string;
  
  signatureStatus: 'unsigned' | 'clinician_signed' | 'supervisor_signed' | 'fully_signed';
  
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

const MOCK_DISCHARGES: DischargeSummary[] = [
  {
    id: 'dc-001',
    status: 'completed',
    documentStatus: 'signed',
    patientId: 'pat-99888',
    admissionId: 'adm-55443',
    episodeId: 'ep-2024-001',
    admissionDate: '2026-03-01',
    dischargeDate: '2026-05-15',
    lengthOfStay: 75,
    totalVisits: 54,
    dischargeReason: 'goals_achieved',
    dischargeReasonDetail: 'Patient achieved all established goals. Pressure ulcer completely healed, independent with mobility and ADLs. Patient and caregiver educated and confident in managing ongoing care needs.',
    dischargeDestination: 'Home with family support',
    primaryDiagnosisAtDischarge: 'L89.600 - Pressure ulcer of left heel, healed',
    secondaryDiagnosesAtDischarge: [
      'E11.9 - Type 2 diabetes mellitus (stable, well-controlled)',
      'I10 - Essential hypertension (controlled)',
      'M62.81 - Muscle weakness (resolved)',
    ],
    functionalStatusAtDischarge: [
      {
        category: 'Ambulation',
        admissionStatus: 'Bedbound, total assistance required',
        dischargeStatus: 'Independent with walker, household distances',
        improvement: 'improved',
      },
      {
        category: 'Transfers',
        admissionStatus: 'Moderate assistance required',
        dischargeStatus: 'Independent with all transfers',
        improvement: 'improved',
      },
      {
        category: 'Bathing',
        admissionStatus: 'Total assistance required',
        dischargeStatus: 'Independent with adaptive equipment',
        improvement: 'improved',
      },
      {
        category: 'Dressing',
        admissionStatus: 'Total assistance required',
        dischargeStatus: 'Independent',
        improvement: 'improved',
      },
      {
        category: 'Wound Care',
        admissionStatus: 'Stage 3 pressure ulcer, 4.2 x 3.5 x 1.2 cm',
        dischargeStatus: 'Completely healed, intact skin',
        improvement: 'improved',
      },
    ],
    cognitiveStatus: 'Alert and oriented x4. Mild short-term memory impairment, compensates with written reminders and caregiver support.',
    mentalStatus: 'Appropriate affect, good mood. No signs of depression or anxiety.',
    mobilityStatus: 'Independent ambulation with walker for household distances. Able to navigate stairs with handrail. No assistive device needed for short distances inside home.',
    adlStatus: 'Independent in all ADLs including bathing, dressing, grooming, and toileting. Uses adaptive equipment (shower chair, grab bars) as needed.',
    painStatus: 'Pain well-controlled. Reports 0-1/10 pain, no longer requires pain medication.',
    vitalSignsAtDischarge: 'BP: 128/78, HR: 72, RR: 16, Temp: 98.4°F, SpO2: 97% on room air. All vital signs within normal limits.',
    woundStatus: 'Pressure ulcer completely healed with intact, non-fragile skin. No signs of breakdown. Patient and caregiver educated on prevention strategies.',
    servicesProvided: [
      'Skilled wound care and management',
      'Medication management and education',
      'Physical therapy for gait and strengthening',
      'Occupational therapy for ADL training',
      'Patient and caregiver education',
      'Fall prevention training',
      'Diabetes management education',
    ],
    disciplinesInvolved: ['SN', 'PT', 'OT'],
    overallProgressSummary: 'Patient made excellent progress throughout the 75-day home health episode. Primary goal of complete wound healing was achieved with full epithelialization and no signs of breakdown. Patient progressed from bedbound to independent ambulation with walker. All ADLs now performed independently. Patient and daughter demonstrate excellent understanding of ongoing care needs and prevention strategies. Ready for discharge with appropriate follow-up care in place.',
    clinicalHighlights: 'Stage 3 pressure ulcer healed completely over 10 weeks. Mobility improved dramatically from bedbound to independent household ambulation. All functional goals achieved or exceeded. Blood glucose levels stable and well-controlled. No hospitalizations or complications during episode.',
    complicationsDuringCare: 'None. Patient had no infections, no hospitalizations, no emergency department visits, and no adverse events during the episode of care.',
    goalsAchievement: [
      {
        goalId: 'goal-001',
        goalStatement: 'Pressure ulcer will be completely healed within 60 days',
        discipline: 'SN',
        achievementStatus: 'fully_achieved',
        outcomeDescription: 'Goal exceeded. Wound completely healed by day 70 with intact, healthy skin.',
      },
      {
        goalId: 'goal-002',
        goalStatement: 'Patient will ambulate independently with walker for household distances',
        discipline: 'PT',
        achievementStatus: 'fully_achieved',
        outcomeDescription: 'Goal fully achieved. Patient ambulates 150+ feet with walker independently.',
      },
      {
        goalId: 'goal-003',
        goalStatement: 'Patient will be independent in all ADLs',
        discipline: 'OT',
        achievementStatus: 'fully_achieved',
        outcomeDescription: 'Goal fully achieved. Patient performs all ADLs independently with adaptive equipment.',
      },
      {
        goalId: 'goal-004',
        goalStatement: 'Blood glucose levels will be maintained within target range',
        discipline: 'SN',
        achievementStatus: 'fully_achieved',
        outcomeDescription: 'Goal achieved. Average blood glucose 110-140 mg/dL, HbA1c 6.8%.',
      },
    ],
    overallGoalsSummary: 'All 4 established goals were fully achieved. Patient exceeded expectations in functional recovery and wound healing. Both patient and daughter express satisfaction with care received and confidence in managing ongoing health needs.',
    ongoingCareNeeds: 'Patient requires continued monitoring of diabetes and blood pressure by primary care physician. Routine skin assessments for pressure injury prevention. Continued use of pressure relief mattress and repositioning schedule. Regular exercise program to maintain strength and mobility.',
    equipmentNeeds: ['Walker', 'Shower chair', 'Grab bars', 'Pressure relief mattress'],
    dmeAtDischarge: [
      'Walker with wheels - Patient owns',
      'Shower chair - Patient owns',
      'Grab bars - Installed in bathroom',
      'Pressure relief mattress - Patient owns',
    ],
    medicationsAtDischarge: [
      {
        medicationName: 'Metformin',
        dosage: '500 mg',
        frequency: 'Twice daily',
        instructions: 'Take with meals for diabetes control',
      },
      {
        medicationName: 'Lisinopril',
        dosage: '10 mg',
        frequency: 'Once daily',
        instructions: 'Take in morning for blood pressure control',
      },
      {
        medicationName: 'Insulin Glargine',
        dosage: '20 units',
        frequency: 'Once daily at bedtime',
        instructions: 'Subcutaneous injection for blood glucose control',
      },
      {
        medicationName: 'Aspirin',
        dosage: '81 mg',
        frequency: 'Once daily',
        instructions: 'Take with food',
      },
    ],
    dietRestrictions: 'Diabetic diet - carbohydrate controlled. Low sodium diet for blood pressure management. Adequate protein intake for continued healing. Patient educated and following recommended diet.',
    activityRestrictions: 'No restrictions. Patient encouraged to maintain daily exercise routine including walking and strengthening exercises. Avoid prolonged periods of immobility.',
    precautions: [
      'Fall precautions - continue use of walker for distances',
      'Skin monitoring for pressure injury prevention',
      'Blood glucose monitoring as prescribed',
      'Proper foot care due to diabetes',
    ],
    educationProvided: [
      {
        topic: 'Wound Care and Pressure Injury Prevention',
        methodOfInstruction: 'Demonstration and teach-back',
        materialProvided: 'Written instructions with illustrations',
        comprehensionLevel: 'full',
        demonstrationPerformed: true,
        reinforcementNeeded: false,
      },
      {
        topic: 'Diabetes Management',
        methodOfInstruction: 'Discussion, demonstration, teach-back',
        materialProvided: 'Diabetes care booklet, blood glucose log',
        comprehensionLevel: 'full',
        demonstrationPerformed: true,
        reinforcementNeeded: false,
      },
      {
        topic: 'Medication Management',
        methodOfInstruction: 'Medication review and teach-back',
        materialProvided: 'Medication list with instructions',
        comprehensionLevel: 'full',
        demonstrationPerformed: true,
        reinforcementNeeded: false,
      },
      {
        topic: 'Fall Prevention',
        methodOfInstruction: 'Discussion and home safety assessment',
        materialProvided: 'Fall prevention checklist',
        comprehensionLevel: 'full',
        demonstrationPerformed: true,
        reinforcementNeeded: false,
      },
      {
        topic: 'Signs and Symptoms to Report',
        methodOfInstruction: 'Verbal instruction with written list',
        materialProvided: 'Warning signs list with emergency contacts',
        comprehensionLevel: 'full',
        demonstrationPerformed: false,
        reinforcementNeeded: false,
      },
    ],
    educationSummary: 'Comprehensive education provided throughout episode on wound care, pressure injury prevention, diabetes management, medication administration, fall prevention, and recognition of warning signs. Patient and daughter demonstrate excellent understanding and competency. All education materials provided in written format.',
    caregiverEducation: 'Daughter (primary caregiver) educated on all aspects of care including pressure relief techniques, medication reminders, blood glucose monitoring assistance, fall prevention, and emergency response. Daughter demonstrates competency and confidence.',
    caregiverCompetency: 'Daughter demonstrates full competency in assisting patient with care needs. Able to identify warning signs and knows when to seek medical attention. Confident in supporting patient\'s ongoing care.',
    followUpRecommendations: [
      {
        category: 'Primary Care',
        recommendation: 'Follow-up with Dr. Martinez within 2 weeks of discharge for routine diabetes and blood pressure monitoring',
        frequency: 'Monthly',
        referralMade: true,
        contactInfo: 'Dr. Robert Martinez, (555) 123-4567',
      },
      {
        category: 'Laboratory',
        recommendation: 'HbA1c and lipid panel in 3 months',
        referralMade: true,
      },
      {
        category: 'Podiatry',
        recommendation: 'Establish care with podiatrist for diabetic foot care',
        frequency: 'Every 3 months',
        referralMade: true,
        contactInfo: 'Diabetes Foot Care Clinic, (555) 987-6543',
      },
      {
        category: 'Outpatient PT',
        recommendation: 'Continue strengthening exercises at home. Outpatient PT available if needed',
        referralMade: false,
      },
    ],
    primaryCarePhysician: 'Dr. Robert Martinez, MD',
    pcpNotificationDate: '2026-05-15',
    pcpFollowUpScheduled: true,
    pcpFollowUpDate: '2026-05-28',
    specialistFollowUp: 'Podiatry appointment scheduled for 6/15/2026 for diabetic foot care.',
    emergencyContactPlan: 'Patient and daughter instructed to call 911 for emergencies. Contact PCP office during business hours for non-urgent concerns. Contact number: (555) 123-4567. After hours: Call answering service at (555) 123-4500.',
    dischargeSupport: 'Patient lives with daughter who provides excellent support. Daughter available to assist with transportation, medication reminders, and ongoing monitoring. No additional home health services needed at this time.',
    communityResourcesProvided: [
      'Senior center information for social activities',
      'Area Agency on Aging contact information',
      'Diabetes support group information',
      'Meals on Wheels information (for future if needed)',
    ],
    transportationArrangements: 'Daughter provides transportation to all medical appointments. Patient also has access to senior transportation service through local agency.',
    homeEnvironmentSafety: 'Home environment assessed and optimized for safety. All trip hazards removed. Grab bars installed in bathroom. Adequate lighting throughout home. Patient uses walker appropriately.',
    caregiverAvailability: 'Daughter lives in home and is available 24/7. Additional family support available on weekends. No concerns regarding caregiver burden or availability.',
    patientFamilySatisfaction: 'Patient and daughter express high satisfaction with home health services. State that care exceeded expectations and they feel well-prepared for ongoing care.',
    dischargeReadiness: 'Patient is ready for discharge. All goals achieved, education complete, follow-up care arranged, home environment safe, and caregiver support excellent.',
    additionalComments: 'It has been a pleasure caring for this patient and family. Their dedication to the care plan and excellent participation in therapy contributed significantly to the outstanding outcomes achieved.',
    clinicianSignature: 'Maria Santos, RN, BSN',
    clinicianSignatureDate: '2026-05-15T16:30:00Z',
    clinicianCredentials: 'RN, BSN',
    supervisorSignature: 'Jennifer Adams, RN, MSN',
    supervisorSignatureDate: '2026-05-15T17:00:00Z',
    signatureStatus: 'fully_signed',
    createdBy: 'Maria Santos, RN',
    createdDate: '2026-05-15T14:00:00Z',
    submittedDate: '2026-05-15T17:00:00Z',
    lastModifiedBy: 'Maria Santos, RN',
    lastModifiedDate: '2026-05-15T16:30:00Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DischargeSummaryModule() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedDischarge, setSelectedDischarge] = useState<DischargeSummary | null>(null);

  const handleViewDischarge = (discharge: DischargeSummary) => {
    setSelectedDischarge(discharge);
    setSelectedView('detail');
  };

  const handleEditDischarge = (discharge: DischargeSummary) => {
    setSelectedDischarge(discharge);
    setSelectedView('edit');
  };

  const handleNewDischarge = () => {
    setSelectedDischarge(null);
    setSelectedView('edit');
  };

  const handleBackToList = () => {
    setSelectedView('list');
    setSelectedDischarge(null);
  };

  if (selectedView === 'list') {
    return (
      <DischargeSummaryListView
        discharges={MOCK_DISCHARGES}
        onViewDischarge={handleViewDischarge}
        onEditDischarge={handleEditDischarge}
        onNewDischarge={handleNewDischarge}
        onClose={() => navigate(-1)}
      />
    );
  }

  if (selectedView === 'detail' && selectedDischarge) {
    return (
      <DischargeSummaryDetailView
        discharge={selectedDischarge}
        onBack={handleBackToList}
        onEdit={() => handleEditDischarge(selectedDischarge)}
      />
    );
  }

  if (selectedView === 'edit') {
    return (
      <DischargeSummaryEditor
        discharge={selectedDischarge}
        onClose={handleBackToList}
      />
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCHARGE SUMMARY LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface DischargeSummaryListViewProps {
  discharges: DischargeSummary[];
  onViewDischarge: (discharge: DischargeSummary) => void;
  onEditDischarge: (discharge: DischargeSummary) => void;
  onNewDischarge: () => void;
  onClose: () => void;
}

function DischargeSummaryListView({ discharges, onViewDischarge, onEditDischarge, onNewDischarge, onClose }: DischargeSummaryListViewProps) {
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
                    Discharge Summaries
                  </h1>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    Discharge
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>MRN: {MOCK_PATIENT.mrn}</span>
                  <span>•</span>
                  <span>{discharges.length} {discharges.length === 1 ? 'Discharge' : 'Discharges'}</span>
                </div>
              </div>
            </div>

            <Button size="sm" onClick={onNewDischarge}>
              <FileText className="w-4 h-4 mr-2" />
              New Discharge Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {discharges.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Discharge Summaries
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  No discharge documentation has been created
                </p>
                <Button onClick={onNewDischarge}>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Discharge Summary
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {discharges.map(discharge => (
                <DischargeSummaryCard
                  key={discharge.id}
                  discharge={discharge}
                  onView={() => onViewDischarge(discharge)}
                  onEdit={() => onEditDischarge(discharge)}
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
// DISCHARGE SUMMARY CARD
// ═══════════════════════════════════════════════════════════════════════════

interface DischargeSummaryCardProps {
  discharge: DischargeSummary;
  onView: () => void;
  onEdit: () => void;
}

function DischargeSummaryCard({ discharge, onView, onEdit }: DischargeSummaryCardProps) {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-300' },
    submitted: { label: 'Submitted', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  };

  const reasonLabels: Record<DischargeReason, string> = {
    goals_achieved: 'Goals Achieved',
    patient_decline: 'Patient Decline',
    patient_deceased: 'Patient Deceased',
    patient_request: 'Patient Request',
    physician_order: 'Physician Order',
    non_compliant: 'Non-Compliant',
    hospitalized: 'Hospitalized',
    transferred_facility: 'Transferred to Facility',
    no_longer_homebound: 'No Longer Homebound',
    other: 'Other',
  };

  const signatureConfig = {
    unsigned: { label: 'Unsigned', icon: AlertCircle, color: 'text-red-600' },
    clinician_signed: { label: 'Clinician Signed', icon: Clock, color: 'text-amber-600' },
    supervisor_signed: { label: 'Supervisor Signed', icon: Clock, color: 'text-amber-600' },
    fully_signed: { label: 'Fully Signed', icon: CheckCircle2, color: 'text-green-600' },
  };

  const signatureInfo = signatureConfig[discharge.signatureStatus];
  const SignatureIcon = signatureInfo.icon;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Discharge Summary
            </h3>
            <Badge className={cn('border', statusConfig[discharge.status].color)}>
              {statusConfig[discharge.status].label}
            </Badge>
            <Badge variant="outline">
              {reasonLabels[discharge.dischargeReason]}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            <div>Admission: {new Date(discharge.admissionDate).toLocaleDateString()} • Discharge: {new Date(discharge.dischargeDate).toLocaleDateString()}</div>
            <div>Length of Stay: {discharge.lengthOfStay} days • Total Visits: {discharge.totalVisits}</div>
          </div>
        </div>

        <div className={cn('flex items-center gap-2', signatureInfo.color)}>
          <SignatureIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{signatureInfo.label}</span>
        </div>
      </div>

      {/* Progress Summary */}
      {discharge.overallProgressSummary && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-1">Progress Summary</div>
          <div className="text-sm text-gray-700 line-clamp-2">
            {discharge.overallProgressSummary}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500">Goals</div>
          <div className="font-semibold text-gray-900">{discharge.goalsAchievement.length}</div>
          <div className="text-xs text-emerald-600">
            {discharge.goalsAchievement.filter(g => g.achievementStatus === 'fully_achieved').length} Achieved
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Functional Areas</div>
          <div className="font-semibold text-gray-900">{discharge.functionalStatusAtDischarge.length}</div>
          <div className="text-xs text-emerald-600">
            {discharge.functionalStatusAtDischarge.filter(f => f.improvement === 'improved').length} Improved
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Education Topics</div>
          <div className="font-semibold text-gray-900">{discharge.educationProvided.length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Follow-Ups</div>
          <div className="font-semibold text-gray-900">{discharge.followUpRecommendations.length}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Disciplines</div>
          <div className="font-semibold text-gray-900">{discharge.disciplinesInvolved.length}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t">
        <Button size="sm" onClick={onView}>
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        {discharge.status !== 'submitted' && (
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
// DISCHARGE SUMMARY DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface DischargeSummaryDetailViewProps {
  discharge: DischargeSummary;
  onBack: () => void;
  onEdit: () => void;
}

function DischargeSummaryDetailView({ discharge, onBack, onEdit }: DischargeSummaryDetailViewProps) {
  const reasonLabels: Record<DischargeReason, string> = {
    goals_achieved: 'Goals Achieved',
    patient_decline: 'Patient Decline',
    patient_deceased: 'Patient Deceased',
    patient_request: 'Patient Request',
    physician_order: 'Physician Order',
    non_compliant: 'Non-Compliant',
    hospitalized: 'Hospitalized',
    transferred_facility: 'Transferred to Facility',
    no_longer_homebound: 'No Longer Homebound',
    other: 'Other',
  };

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
                  Discharge Summary
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>Discharged: {new Date(discharge.dischargeDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              {discharge.status !== 'submitted' && (
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
            {/* Episode Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-600" />
                Episode Summary
              </h2>
              
              <div className="grid grid-cols-4 gap-6 mb-4">
                <div>
                  <Label className="text-gray-500">Admission Date</Label>
                  <div className="font-medium mt-1">
                    {new Date(discharge.admissionDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Discharge Date</Label>
                  <div className="font-medium mt-1">
                    {new Date(discharge.dischargeDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Length of Stay</Label>
                  <div className="font-medium mt-1">{discharge.lengthOfStay} days</div>
                </div>
                <div>
                  <Label className="text-gray-500">Total Visits</Label>
                  <div className="font-medium mt-1">{discharge.totalVisits} visits</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-gray-500">Discharge Reason</Label>
                  <div className="mt-1">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      {reasonLabels[discharge.dischargeReason]}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Discharge Destination</Label>
                  <div className="font-medium mt-1">{discharge.dischargeDestination}</div>
                </div>
              </div>

              {discharge.dischargeReasonDetail && (
                <div className="mt-4">
                  <Label className="text-gray-500">Discharge Reason Detail</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    {discharge.dischargeReasonDetail}
                  </div>
                </div>
              )}
            </Card>

            {/* Patient Condition at Discharge */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                Patient Condition at Discharge
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Primary Diagnosis</Label>
                  <div className="font-medium mt-1">{discharge.primaryDiagnosisAtDischarge}</div>
                </div>

                <div>
                  <Label className="text-gray-500">Secondary Diagnoses</Label>
                  <div className="mt-2 space-y-1">
                    {discharge.secondaryDiagnosesAtDischarge.map((dx, index) => (
                      <div key={index} className="text-sm">{dx}</div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Cognitive Status</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.cognitiveStatus}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Mental Status</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.mentalStatus}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Mobility Status</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {discharge.mobilityStatus}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">ADL Status</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {discharge.adlStatus}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Pain Status</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.painStatus}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Vital Signs at Discharge</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.vitalSignsAtDischarge}
                    </div>
                  </div>
                </div>

                {discharge.woundStatus && (
                  <div>
                    <Label className="text-gray-500">Wound Status</Label>
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm">
                      {discharge.woundStatus}
                    </div>
                  </div>
                )}
              </div>

              {/* Functional Status Comparison */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Functional Status Comparison</h3>
                <div className="space-y-3">
                  {discharge.functionalStatusAtDischarge.map((status, index) => (
                    <FunctionalComparisonCard key={index} comparison={status} />
                  ))}
                </div>
              </div>
            </Card>

            {/* Clinical Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Clinical Summary
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Overall Progress Summary</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {discharge.overallProgressSummary}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Clinical Highlights</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {discharge.clinicalHighlights}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Services Provided</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {discharge.servicesProvided.map((service, index) => (
                      <Badge key={index} variant="secondary">{service}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Disciplines Involved</Label>
                    <div className="flex gap-2 mt-2">
                      {discharge.disciplinesInvolved.map((disc, index) => (
                        <Badge key={index} variant="outline">{disc}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Complications During Care</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.complicationsDuringCare}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Goals Achieved */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Goals Achievement
              </h2>

              <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Label className="text-emerald-700 text-sm">Overall Goals Summary</Label>
                <div className="mt-2 text-sm text-emerald-900">
                  {discharge.overallGoalsSummary}
                </div>
              </div>

              <div className="space-y-3">
                {discharge.goalsAchievement.map(goal => (
                  <GoalAchievementCard key={goal.goalId} goal={goal} />
                ))}
              </div>
            </Card>

            {/* Remaining Care Needs */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Remaining Care Needs
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Ongoing Care Needs</Label>
                  <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    {discharge.ongoingCareNeeds}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">DME at Discharge</Label>
                  <div className="mt-2 space-y-1">
                    {discharge.dmeAtDischarge.map((dme, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{dme}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Medications at Discharge</Label>
                  <div className="mt-2 space-y-2">
                    {discharge.medicationsAtDischarge.map((med, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm mb-1">
                          {med.medicationName} {med.dosage}
                        </div>
                        <div className="text-xs text-gray-600">
                          {med.frequency} - {med.instructions}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Diet Restrictions</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.dietRestrictions}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Activity Restrictions</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.activityRestrictions}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Precautions</Label>
                  <div className="mt-2 space-y-1">
                    {discharge.precautions.map((precaution, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>{precaution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Patient Education */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Patient Education Provided
              </h2>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <Label className="text-gray-500">Education Summary</Label>
                <div className="mt-2 text-sm text-gray-700">
                  {discharge.educationSummary}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {discharge.educationProvided.map((edu, index) => (
                  <EducationCard key={index} education={edu} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Caregiver Education</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {discharge.caregiverEducation}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Caregiver Competency</Label>
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm">
                    {discharge.caregiverCompetency}
                  </div>
                </div>
              </div>
            </Card>

            {/* Follow-Up Recommendations */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                Follow-Up Recommendations
              </h2>

              <div className="space-y-3 mb-4">
                {discharge.followUpRecommendations.map((followUp, index) => (
                  <FollowUpCard key={index} followUp={followUp} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-gray-500">Primary Care Physician</Label>
                  <div className="font-medium mt-1">{discharge.primaryCarePhysician}</div>
                </div>
                <div>
                  <Label className="text-gray-500">PCP Notification Date</Label>
                  <div className="font-medium mt-1">
                    {new Date(discharge.pcpNotificationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {discharge.pcpFollowUpScheduled && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      PCP Follow-up scheduled for {discharge.pcpFollowUpDate && new Date(discharge.pcpFollowUpDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {discharge.specialistFollowUp && (
                <div className="mb-4">
                  <Label className="text-gray-500">Specialist Follow-Up</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {discharge.specialistFollowUp}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-gray-500">Emergency Contact Plan</Label>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                  {discharge.emergencyContactPlan}
                </div>
              </div>
            </Card>

            {/* Discharge Planning */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600" />
                Discharge Planning & Support
              </h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Discharge Support</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {discharge.dischargeSupport}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Community Resources Provided</Label>
                  <div className="mt-2 space-y-1">
                    {discharge.communityResourcesProvided.map((resource, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Transportation Arrangements</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.transportationArrangements}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Caregiver Availability</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {discharge.caregiverAvailability}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Home Environment Safety</Label>
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm">
                    {discharge.homeEnvironmentSafety}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Patient/Family Satisfaction</Label>
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm">
                    {discharge.patientFamilySatisfaction}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Discharge Readiness</Label>
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded text-sm font-medium">
                    {discharge.dischargeReadiness}
                  </div>
                </div>

                {discharge.additionalComments && (
                  <div>
                    <Label className="text-gray-500">Additional Comments</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm italic">
                      {discharge.additionalComments}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Signatures */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-emerald-600" />
                Signatures
              </h2>

              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">Clinician Signature</div>
                    {discharge.clinicianSignature ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{discharge.clinicianSignature}</span>
                        </div>
                        <div className="text-xs">
                          Signed: {new Date(discharge.clinicianSignatureDate!).toLocaleString()}
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
                    <div className="font-medium text-gray-900 mb-1">Supervisor Signature</div>
                    {discharge.supervisorSignature ? (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{discharge.supervisorSignature}</span>
                        </div>
                        <div className="text-xs">
                          Signed: {new Date(discharge.supervisorSignatureDate!).toLocaleString()}
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

function FunctionalComparisonCard({ comparison }: { comparison: FunctionalStatusAtDischarge }) {
  const improvementConfig = {
    improved: { label: 'Improved', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: TrendingUp },
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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Admission Status</div>
          <div className="text-sm text-gray-700">{comparison.admissionStatus}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Discharge Status</div>
          <div className="text-sm text-gray-900 font-medium">{comparison.dischargeStatus}</div>
        </div>
      </div>
    </div>
  );
}

function GoalAchievementCard({ goal }: { goal: DischargeGoal }) {
  const achievementConfig = {
    fully_achieved: { label: 'Fully Achieved', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle2 },
    partially_achieved: { label: 'Partially Achieved', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Activity },
    not_achieved: { label: 'Not Achieved', color: 'bg-red-100 text-red-700 border-red-300', icon: AlertCircle },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock },
  };

  const achievementInfo = achievementConfig[goal.achievementStatus];
  const AchievementIcon = achievementInfo.icon;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-gray-900 mb-1">{goal.goalStatement}</div>
          <div className="text-xs text-gray-600">Discipline: {goal.discipline}</div>
        </div>
        <Badge className={cn('border flex items-center gap-1', achievementInfo.color)}>
          <AchievementIcon className="w-3 h-3" />
          {achievementInfo.label}
        </Badge>
      </div>
      <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
        {goal.outcomeDescription}
      </div>
    </div>
  );
}

function EducationCard({ education }: { education: EducationProvided }) {
  const comprehensionConfig = {
    full: { label: 'Full Understanding', color: 'text-emerald-700' },
    partial: { label: 'Partial Understanding', color: 'text-amber-700' },
    minimal: { label: 'Minimal Understanding', color: 'text-red-700' },
  };

  const comprehensionInfo = comprehensionConfig[education.comprehensionLevel];

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-gray-900">{education.topic}</div>
        <span className={cn('text-xs font-medium', comprehensionInfo.color)}>
          {comprehensionInfo.label}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs mb-2">
        <div>
          <span className="text-gray-500">Method:</span> {education.methodOfInstruction}
        </div>
        <div>
          <span className="text-gray-500">Materials:</span> {education.materialProvided}
        </div>
      </div>

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          {education.demonstrationPerformed ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ) : (
            <AlertCircle className="w-3 h-3 text-gray-400" />
          )}
          <span>Demonstration</span>
        </div>
        {education.reinforcementNeeded && (
          <div className="flex items-center gap-1 text-amber-700">
            <AlertCircle className="w-3 h-3" />
            <span>Reinforcement Needed</span>
          </div>
        )}
      </div>

      {education.learningBarriers && (
        <div className="mt-2 text-xs text-gray-600 italic">
          Barriers: {education.learningBarriers}
        </div>
      )}
    </div>
  );
}

function FollowUpCard({ followUp }: { followUp: FollowUpRecommendation }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium text-gray-900 mb-1">{followUp.category}</div>
          <div className="text-sm text-gray-700">{followUp.recommendation}</div>
        </div>
        {followUp.referralMade && (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
            Referral Made
          </Badge>
        )}
      </div>
      
      <div className="flex gap-4 text-xs text-gray-600 mt-2">
        {followUp.frequency && (
          <div>
            <span className="font-medium">Frequency:</span> {followUp.frequency}
          </div>
        )}
        {followUp.contactInfo && (
          <div>
            <span className="font-medium">Contact:</span> {followUp.contactInfo}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCHARGE SUMMARY EDITOR
// ═══════════════════════════════════════════════════════════════════════════

interface DischargeSummaryEditorProps {
  discharge: DischargeSummary | null;
  onClose: () => void;
}

function DischargeSummaryEditor({ discharge, onClose }: DischargeSummaryEditorProps) {
  const [activeSection, setActiveSection] = useState('condition');
  const [showValidation, setShowValidation] = useState(false);
  
  const [values, setValues] = useState<Partial<DischargeSummary>>(
    discharge || {
      documentStatus: 'draft',
      signatureStatus: 'unsigned',
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
      const value = values[rule.fieldId as keyof DischargeSummary];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, [values, validationRules]);

  const handleSubmit = () => {
    if (!validationResult.canSubmit) {
      setShowValidation(true);
      alert(`Cannot submit: ${validationResult.errorCount} validation errors must be fixed.`);
      return;
    }
    console.log('Submitting discharge summary...', values);
    alert('Discharge summary saved successfully!');
    onClose();
  };

  const sections = [
    { id: 'condition', label: 'Patient Condition', icon: Heart },
    { id: 'goals', label: 'Goals Achieved', icon: Target },
    { id: 'care_needs', label: 'Remaining Care Needs', icon: Shield },
    { id: 'education', label: 'Patient Education', icon: GraduationCap },
    { id: 'followup', label: 'Follow-Up', icon: Phone },
    { id: 'planning', label: 'Discharge Planning', icon: Home },
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
                  {discharge ? 'Edit Discharge Summary' : 'New Discharge Summary'}
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
              Discharge Sections
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
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
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
                  Form content for {activeSection} section would be rendered here with all required fields and validation...
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
      fieldId: 'dischargeReason',
      fieldLabel: 'Discharge Reason',
      sectionId: 'condition',
      sectionTitle: 'Patient Condition',
      required: true,
    },
    {
      fieldId: 'overallProgressSummary',
      fieldLabel: 'Overall Progress Summary',
      sectionId: 'condition',
      sectionTitle: 'Patient Condition',
      required: true,
      minLength: 50,
    },
    {
      fieldId: 'overallGoalsSummary',
      fieldLabel: 'Overall Goals Summary',
      sectionId: 'goals',
      sectionTitle: 'Goals Achieved',
      required: true,
    },
    {
      fieldId: 'ongoingCareNeeds',
      fieldLabel: 'Ongoing Care Needs',
      sectionId: 'care_needs',
      sectionTitle: 'Remaining Care Needs',
      required: true,
    },
    {
      fieldId: 'educationSummary',
      fieldLabel: 'Education Summary',
      sectionId: 'education',
      sectionTitle: 'Patient Education',
      required: true,
    },
  ];
}
