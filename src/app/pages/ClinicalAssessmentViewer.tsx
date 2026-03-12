/**
 * Clinical Assessment Viewer
 * 
 * Comprehensive view of a clinical assessment organized into sections:
 * - Patient Information
 * - Clinical Record Items
 * - Living Arrangements
 * - Functional Status
 * - Cognitive Status
 * - Medications
 * - Diagnoses
 * - Care Plan
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  User,
  FileText,
  Home,
  Activity,
  Brain,
  Pill,
  Stethoscope,
  ClipboardList,
  Calendar,
  CheckCircle2,
  Edit,
  Save,
  Send,
  Download,
  Eye,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Bed,
  Users,
  Heart,
  Droplet,
  Wind,
  Thermometer,
  Scale,
  Ruler,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Wheelchair,
  Utensils,
  Bath,
  Shirt,
  Move,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AssessmentData {
  // Patient Information
  patientInfo: {
    firstName: string;
    lastName: string;
    mrn: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    ssn?: string;
    medicare?: string;
    medicaid?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email?: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };

  // Clinical Record Items
  clinicalRecordItems: {
    admissionDate: string;
    assessmentDate: string;
    assessmentType: string;
    reason: string;
    clinician: string;
    clinicianRole: string;
    branch: string;
    certificationNumber: string;
    referralSource: string;
    physicianName: string;
    physicianPhone: string;
    inpatientStay: boolean;
    inpatientFacility?: string;
    inpatientDischargeDate?: string;
  };

  // Living Arrangements
  livingArrangements: {
    livingSituation: string;
    householdMembers: string[];
    primaryCaregiver?: string;
    caregiverRelationship?: string;
    caregiverAvailability: string;
    homeType: string;
    stairs: boolean;
    stairCount?: number;
    elevator: boolean;
    accessibilityFeatures: string[];
    safetyHazards: string[];
    environmentalConcerns: string;
  };

  // Functional Status
  functionalStatus: {
    mobility: {
      ambulation: string;
      assistiveDevices: string[];
      fallRisk: 'low' | 'moderate' | 'high';
      fallHistory: string;
      transfers: string;
      stairs: string;
    };
    adls: {
      bathing: string;
      dressing: string;
      toileting: string;
      grooming: string;
      eating: string;
      continence: string;
    };
    iadls: {
      cooking: string;
      shopping: string;
      housework: string;
      laundry: string;
      transportation: string;
      medications: string;
      finances: string;
    };
  };

  // Cognitive Status
  cognitiveStatus: {
    orientation: {
      person: boolean;
      place: boolean;
      time: boolean;
      situation: boolean;
    };
    memory: string;
    attention: string;
    problemSolving: string;
    communication: {
      understanding: string;
      expression: string;
      speech: string;
      language: string;
    };
    vision: string;
    hearing: string;
    mentalStatus: string;
    behavioralConcerns: string[];
  };

  // Medications
  medications: {
    currentMedications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      route: string;
      indication: string;
      prescriber: string;
      startDate: string;
    }>;
    allergies: Array<{
      allergen: string;
      reaction: string;
      severity: 'mild' | 'moderate' | 'severe';
    }>;
    compliance: string;
    managementAbility: string;
    pharmacyName?: string;
    pharmacyPhone?: string;
  };

  // Diagnoses
  diagnoses: {
    primaryDiagnosis: {
      code: string;
      description: string;
      onsetDate: string;
    };
    secondaryDiagnoses: Array<{
      code: string;
      description: string;
      onsetDate?: string;
    }>;
    comorbidities: string[];
    surgicalHistory: Array<{
      procedure: string;
      date: string;
    }>;
    hospitalizationHistory: string;
  };

  // Care Plan
  carePlan: {
    goals: Array<{
      id: string;
      goalStatement: string;
      discipline: string;
      timeframe: string;
      targetDate: string;
      interventions: string[];
      expectedOutcome: string;
    }>;
    disciplines: string[];
    frequency: {
      sn?: string;
      pt?: string;
      ot?: string;
      st?: string;
      msw?: string;
      hha?: string;
    };
    duration: string;
    specialInstructions: string;
    safetyConsiderations: string[];
  };

  // Metadata
  metadata: {
    status: 'draft' | 'in_progress' | 'completed' | 'submitted' | 'validated';
    progressPercentage: number;
    sectionsCompleted: number;
    totalSections: number;
    createdDate: string;
    lastModifiedDate: string;
    completedDate?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_ASSESSMENT: AssessmentData = {
  patientInfo: {
    firstName: 'Margaret',
    lastName: 'Johnson',
    mrn: 'MRN-334455',
    dateOfBirth: '1945-06-15',
    age: 80,
    gender: 'Female',
    ssn: '***-**-6789',
    medicare: '1AA2BB3CC44',
    medicaid: 'MC-567890',
    address: '1234 Oak Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    phone: '(555) 123-4567',
    email: 'margaret.j@email.com',
    emergencyContact: {
      name: 'Sarah Johnson',
      relationship: 'Daughter',
      phone: '(555) 987-6543',
    },
  },

  clinicalRecordItems: {
    admissionDate: '2026-03-01',
    assessmentDate: '2026-03-01',
    assessmentType: 'OASIS-E Start of Care',
    reason: 'Post-surgical care following hip replacement',
    clinician: 'Jennifer Martinez, RN, BSN',
    clinicianRole: 'RN Case Manager',
    branch: 'Main Office - San Francisco',
    certificationNumber: '111111',
    referralSource: 'San Francisco General Hospital',
    physicianName: 'Dr. Robert Chen, MD',
    physicianPhone: '(555) 234-5678',
    inpatientStay: true,
    inpatientFacility: 'San Francisco General Hospital',
    inpatientDischargeDate: '2026-02-28',
  },

  livingArrangements: {
    livingSituation: 'Lives with daughter in single-family home',
    householdMembers: ['Sarah Johnson (Daughter)', 'Michael Johnson (Son-in-law)', 'Two grandchildren (ages 10, 12)'],
    primaryCaregiver: 'Sarah Johnson',
    caregiverRelationship: 'Daughter',
    caregiverAvailability: 'Available 24/7, works from home',
    homeType: 'Single-family house, 2 stories',
    stairs: true,
    stairCount: 12,
    elevator: false,
    accessibilityFeatures: [
      'Grab bars installed in bathroom',
      'Shower chair available',
      'Raised toilet seat',
      'Walker available',
    ],
    safetyHazards: [
      'Area rugs in living room (to be removed)',
      'Poor lighting in hallway',
    ],
    environmentalConcerns: 'Patient bedroom currently on second floor. Planning to convert first-floor den to temporary bedroom during recovery.',
  },

  functionalStatus: {
    mobility: {
      ambulation: 'Requires walker for all ambulation. Can walk 50 feet with walker and minimal assistance.',
      assistiveDevices: ['Walker', 'Cane (backup)'],
      fallRisk: 'moderate',
      fallHistory: 'No falls in past 6 months prior to surgery. Post-surgical precautions in place.',
      transfers: 'Moderate assistance required for bed/chair transfers. Can sit to stand with minimal assistance and walker.',
      stairs: 'Unable to navigate stairs at this time. Requires full assistance.',
    },
    adls: {
      bathing: 'Moderate assistance required. Uses shower chair. Cannot reach lower extremities.',
      dressing: 'Moderate assistance with lower body dressing. Independent with upper body.',
      toileting: 'Setup assistance required. Can manage with raised toilet seat.',
      grooming: 'Independent with grooming tasks at sink.',
      eating: 'Independent. No swallowing difficulties.',
      continence: 'Continent of bowel and bladder. No assistance needed.',
    },
    iadls: {
      cooking: 'Unable at this time. Daughter preparing all meals.',
      shopping: 'Unable. Requires full assistance.',
      housework: 'Unable. Daughter managing household tasks.',
      laundry: 'Unable. Requires full assistance.',
      transportation: 'Unable to drive. Daughter provides transportation.',
      medications: 'Requires supervision. Daughter organizes medications in weekly pill box.',
      finances: 'Daughter assisting with bills and financial management during recovery.',
    },
  },

  cognitiveStatus: {
    orientation: {
      person: true,
      place: true,
      time: true,
      situation: true,
    },
    memory: 'Short-term memory intact. No deficits noted. Can recall recent events and instructions.',
    attention: 'Able to maintain attention during conversation. No difficulty following multi-step instructions.',
    problemSolving: 'Demonstrates good problem-solving skills. Makes appropriate decisions regarding care.',
    communication: {
      understanding: 'Understands normal conversation without difficulty',
      expression: 'Expresses ideas clearly. No aphasia.',
      speech: 'Speech clear and articulate.',
      language: 'English - primary language. No language barriers.',
    },
    vision: 'Wears corrective lenses. Vision adequate with glasses.',
    hearing: 'Hearing intact. No hearing aid required.',
    mentalStatus: 'Alert and oriented x4. Affect appropriate. Cooperative with care plan.',
    behavioralConcerns: [],
  },

  medications: {
    currentMedications: [
      {
        name: 'Enoxaparin (Lovenox)',
        dosage: '40 mg',
        frequency: 'Once daily',
        route: 'Subcutaneous injection',
        indication: 'DVT prophylaxis post-surgery',
        prescriber: 'Dr. Robert Chen',
        startDate: '2026-02-25',
      },
      {
        name: 'Oxycodone',
        dosage: '5 mg',
        frequency: 'Every 4-6 hours as needed',
        route: 'Oral',
        indication: 'Pain management',
        prescriber: 'Dr. Robert Chen',
        startDate: '2026-02-25',
      },
      {
        name: 'Docusate (Colace)',
        dosage: '100 mg',
        frequency: 'Twice daily',
        route: 'Oral',
        indication: 'Prevent constipation',
        prescriber: 'Dr. Robert Chen',
        startDate: '2026-02-25',
      },
      {
        name: 'Lisinopril',
        dosage: '10 mg',
        frequency: 'Once daily',
        route: 'Oral',
        indication: 'Hypertension',
        prescriber: 'Dr. Robert Chen',
        startDate: '2020-05-01',
      },
      {
        name: 'Metformin',
        dosage: '500 mg',
        frequency: 'Twice daily with meals',
        route: 'Oral',
        indication: 'Type 2 diabetes',
        prescriber: 'Dr. Robert Chen',
        startDate: '2018-03-15',
      },
      {
        name: 'Calcium + Vitamin D',
        dosage: '600 mg/400 IU',
        frequency: 'Once daily',
        route: 'Oral',
        indication: 'Bone health',
        prescriber: 'Dr. Robert Chen',
        startDate: '2026-02-25',
      },
    ],
    allergies: [
      {
        allergen: 'Penicillin',
        reaction: 'Rash, hives',
        severity: 'moderate',
      },
      {
        allergen: 'Codeine',
        reaction: 'Nausea, vomiting',
        severity: 'mild',
      },
    ],
    compliance: 'Good compliance. Patient motivated to take medications as prescribed.',
    managementAbility: 'Requires supervision due to complex medication schedule. Daughter fills weekly pill organizer and provides reminders.',
    pharmacyName: 'CVS Pharmacy',
    pharmacyPhone: '(555) 345-6789',
  },

  diagnoses: {
    primaryDiagnosis: {
      code: 'Z47.1',
      description: 'Aftercare following joint replacement surgery',
      onsetDate: '2026-02-25',
    },
    secondaryDiagnoses: [
      {
        code: 'M16.11',
        description: 'Unilateral primary osteoarthritis, right hip (resolved with surgery)',
        onsetDate: '2023-01-01',
      },
      {
        code: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        onsetDate: '2018-03-01',
      },
      {
        code: 'I10',
        description: 'Essential (primary) hypertension',
        onsetDate: '2020-05-01',
      },
      {
        code: 'M81.0',
        description: 'Age-related osteoporosis without current pathological fracture',
        onsetDate: '2022-06-01',
      },
    ],
    comorbidities: [
      'Type 2 Diabetes Mellitus (well-controlled)',
      'Hypertension (controlled)',
      'Osteoporosis',
    ],
    surgicalHistory: [
      {
        procedure: 'Right total hip arthroplasty',
        date: '2026-02-25',
      },
      {
        procedure: 'Cholecystectomy',
        date: '2015-08-10',
      },
    ],
    hospitalizationHistory: 'Recent hospitalization 2/23/26 - 2/28/26 for hip replacement surgery. No complications. Discharged to home health.',
  },

  carePlan: {
    goals: [
      {
        id: 'goal-001',
        goalStatement: 'Patient will ambulate independently with walker for household distances (150+ feet) within 60 days',
        discipline: 'PT',
        timeframe: '60 days',
        targetDate: '2026-05-01',
        interventions: [
          'Gait training 3x/week',
          'Progressive strengthening exercises',
          'Balance training',
          'Home exercise program',
        ],
        expectedOutcome: 'Independent household ambulation with walker',
      },
      {
        id: 'goal-002',
        goalStatement: 'Patient will be independent in all ADLs within 45 days',
        discipline: 'OT',
        timeframe: '45 days',
        targetDate: '2026-04-15',
        interventions: [
          'ADL training',
          'Adaptive equipment training',
          'Energy conservation techniques',
          'Home safety assessment',
        ],
        expectedOutcome: 'Independent in bathing, dressing, grooming, toileting',
      },
      {
        id: 'goal-003',
        goalStatement: 'Surgical incision will remain free of infection and demonstrate appropriate healing',
        discipline: 'SN',
        timeframe: 'Duration of care',
        targetDate: '2026-05-01',
        interventions: [
          'Wound assessment and monitoring',
          'Patient/caregiver education on incision care',
          'Infection prevention education',
          'Monitor for signs/symptoms of complications',
        ],
        expectedOutcome: 'Incision fully healed without complications',
      },
      {
        id: 'goal-004',
        goalStatement: 'Patient will demonstrate understanding of medication regimen and safety precautions',
        discipline: 'SN',
        timeframe: '30 days',
        targetDate: '2026-04-01',
        interventions: [
          'Medication education',
          'Pain management education',
          'DVT prophylaxis education',
          'Fall prevention education',
        ],
        expectedOutcome: 'Patient/caregiver verbalizes understanding and complies with regimen',
      },
    ],
    disciplines: ['SN', 'PT', 'OT'],
    frequency: {
      sn: '2x/week for 8 weeks',
      pt: '3x/week for 8 weeks',
      ot: '2x/week for 6 weeks',
    },
    duration: '60 days (2 months)',
    specialInstructions: 'Patient is highly motivated and has excellent family support. Daughter is engaged and capable caregiver. Focus on progressive mobility and return to baseline independence.',
    safetyConsiderations: [
      'Hip precautions - no hip flexion >90 degrees, no crossing legs, no internal rotation',
      'Fall risk - walker required for all ambulation',
      'DVT risk - continue anticoagulation as prescribed',
      'Infection risk - monitor surgical site',
    ],
  },

  metadata: {
    status: 'completed',
    progressPercentage: 100,
    sectionsCompleted: 8,
    totalSections: 8,
    createdDate: '2026-03-01T09:00:00Z',
    lastModifiedDate: '2026-03-01T16:30:00Z',
    completedDate: '2026-03-01T16:30:00Z',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ClinicalAssessmentViewer() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('patient-info');
  const assessment = MOCK_ASSESSMENT;

  const sections = [
    { id: 'patient-info', label: 'Patient Information', icon: User },
    { id: 'clinical-record', label: 'Clinical Record Items', icon: FileText },
    { id: 'living', label: 'Living Arrangements', icon: Home },
    { id: 'functional', label: 'Functional Status', icon: Activity },
    { id: 'cognitive', label: 'Cognitive Status', icon: Brain },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'diagnoses', label: 'Diagnoses', icon: Stethoscope },
    { id: 'care-plan', label: 'Care Plan', icon: ClipboardList },
  ];

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-300' },
    submitted: { label: 'Submitted', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    validated: { label: 'Validated', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  };

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
                  {assessment.clinicalRecordItems.assessmentType}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>{assessment.patientInfo.firstName} {assessment.patientInfo.lastName}</span>
                  <span>•</span>
                  <span>MRN: {assessment.patientInfo.mrn}</span>
                  <span>•</span>
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(assessment.clinicalRecordItems.assessmentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={cn('border', statusConfig[assessment.metadata.status].color)}>
                {statusConfig[assessment.metadata.status].label}
              </Badge>
              {assessment.metadata.status !== 'validated' && (
                <Button size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Progress */}
          {assessment.metadata.status !== 'validated' && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={assessment.metadata.progressPercentage} className="h-2" />
              </div>
              <div className="text-sm text-gray-600">
                {assessment.metadata.sectionsCompleted} of {assessment.metadata.totalSections} sections • {assessment.metadata.progressPercentage}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <nav className="p-4">
            <div className="space-y-1">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                    <CheckCircle2 className={cn(
                      'w-4 h-4 ml-auto',
                      'text-green-600'
                    )} />
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="max-w-5xl mx-auto">
              {activeSection === 'patient-info' && <PatientInformationSection data={assessment.patientInfo} />}
              {activeSection === 'clinical-record' && <ClinicalRecordItemsSection data={assessment.clinicalRecordItems} />}
              {activeSection === 'living' && <LivingArrangementsSection data={assessment.livingArrangements} />}
              {activeSection === 'functional' && <FunctionalStatusSection data={assessment.functionalStatus} />}
              {activeSection === 'cognitive' && <CognitiveStatusSection data={assessment.cognitiveStatus} />}
              {activeSection === 'medications' && <MedicationsSection data={assessment.medications} />}
              {activeSection === 'diagnoses' && <DiagnosesSection data={assessment.diagnoses} />}
              {activeSection === 'care-plan' && <CarePlanSection data={assessment.carePlan} />}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function PatientInformationSection({ data }: { data: AssessmentData['patientInfo'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Patient Information</h2>
        <p className="text-sm text-gray-600">Demographics and contact information</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Demographics</h3>
        <div className="grid grid-cols-3 gap-6">
          <InfoField label="First Name" value={data.firstName} />
          <InfoField label="Last Name" value={data.lastName} />
          <InfoField label="Medical Record Number" value={data.mrn} />
          <InfoField label="Date of Birth" value={new Date(data.dateOfBirth).toLocaleDateString()} />
          <InfoField label="Age" value={`${data.age} years`} />
          <InfoField label="Gender" value={data.gender} />
          {data.ssn && <InfoField label="SSN" value={data.ssn} />}
          {data.medicare && <InfoField label="Medicare" value={data.medicare} />}
          {data.medicaid && <InfoField label="Medicaid" value={data.medicaid} />}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          Address
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Street Address" value={data.address} />
          <InfoField label="City" value={data.city} />
          <InfoField label="State" value={data.state} />
          <InfoField label="ZIP Code" value={data.zipCode} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-gray-600" />
          Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Phone" value={data.phone} icon={Phone} />
          {data.email && <InfoField label="Email" value={data.email} icon={Mail} />}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          Emergency Contact
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <InfoField label="Name" value={data.emergencyContact.name} />
          <InfoField label="Relationship" value={data.emergencyContact.relationship} />
          <InfoField label="Phone" value={data.emergencyContact.phone} icon={Phone} />
        </div>
      </Card>
    </div>
  );
}

function ClinicalRecordItemsSection({ data }: { data: AssessmentData['clinicalRecordItems'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Clinical Record Items</h2>
        <p className="text-sm text-gray-600">Assessment and administrative details</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Assessment Details</h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Assessment Type" value={data.assessmentType} />
          <InfoField label="Assessment Date" value={new Date(data.assessmentDate).toLocaleDateString()} icon={Calendar} />
          <InfoField label="Admission Date" value={new Date(data.admissionDate).toLocaleDateString()} icon={Calendar} />
          <InfoField label="Reason for Assessment" value={data.reason} className="col-span-2" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Clinician Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Assessing Clinician" value={data.clinician} />
          <InfoField label="Role/Credentials" value={data.clinicianRole} />
          <InfoField label="Branch" value={data.branch} />
          <InfoField label="CMS Certification Number" value={data.certificationNumber} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Physician & Referral</h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Attending Physician" value={data.physicianName} />
          <InfoField label="Physician Phone" value={data.physicianPhone} icon={Phone} />
          <InfoField label="Referral Source" value={data.referralSource} />
        </div>
      </Card>

      {data.inpatientStay && (
        <Card className="p-6 border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="w-5 h-5 text-blue-600" />
            Recent Inpatient Stay
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <InfoField label="Facility" value={data.inpatientFacility || ''} />
            <InfoField label="Discharge Date" value={data.inpatientDischargeDate ? new Date(data.inpatientDischargeDate).toLocaleDateString() : ''} />
          </div>
        </Card>
      )}
    </div>
  );
}

function LivingArrangementsSection({ data }: { data: AssessmentData['livingArrangements'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Living Arrangements</h2>
        <p className="text-sm text-gray-600">Home environment and caregiver support</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-gray-600" />
          Living Situation
        </h3>
        <div className="space-y-4">
          <InfoField label="Current Living Situation" value={data.livingSituation} />
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Household Members</div>
            <ul className="list-disc list-inside space-y-1">
              {data.householdMembers.map((member, index) => (
                <li key={index} className="text-sm text-gray-600">{member}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Caregiver Support
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {data.primaryCaregiver && <InfoField label="Primary Caregiver" value={data.primaryCaregiver} />}
          {data.caregiverRelationship && <InfoField label="Relationship" value={data.caregiverRelationship} />}
          <InfoField label="Availability" value={data.caregiverAvailability} className="col-span-2" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Home Environment</h3>
        <div className="space-y-4">
          <InfoField label="Home Type" value={data.homeType} />
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Stairs</div>
              <div className="text-sm text-gray-900">
                {data.stairs ? `Yes (${data.stairCount} steps)` : 'No'}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Elevator</div>
              <div className="text-sm text-gray-900">{data.elevator ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Accessibility Features</div>
            <div className="flex flex-wrap gap-2">
              {data.accessibilityFeatures.map((feature, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {data.safetyHazards.length > 0 && (
            <div className="p-4 border-amber-200 bg-amber-50 rounded-lg">
              <div className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Safety Hazards Identified
              </div>
              <ul className="list-disc list-inside space-y-1">
                {data.safetyHazards.map((hazard, index) => (
                  <li key={index} className="text-sm text-amber-800">{hazard}</li>
                ))}
              </ul>
            </div>
          )}

          <InfoField label="Environmental Concerns" value={data.environmentalConcerns} />
        </div>
      </Card>
    </div>
  );
}

function FunctionalStatusSection({ data }: { data: AssessmentData['functionalStatus'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Functional Status</h2>
        <p className="text-sm text-gray-600">Mobility, ADLs, and IADLs assessment</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wheelchair className="w-5 h-5 text-gray-600" />
          Mobility
        </h3>
        <div className="space-y-4">
          <InfoField label="Ambulation" value={data.mobility.ambulation} />
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Assistive Devices</div>
            <div className="flex flex-wrap gap-2">
              {data.mobility.assistiveDevices.map((device, index) => (
                <Badge key={index} variant="outline">{device}</Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Fall Risk</div>
              <Badge className={cn(
                'border',
                data.mobility.fallRisk === 'high' && 'bg-red-100 text-red-700 border-red-300',
                data.mobility.fallRisk === 'moderate' && 'bg-amber-100 text-amber-700 border-amber-300',
                data.mobility.fallRisk === 'low' && 'bg-green-100 text-green-700 border-green-300'
              )}>
                {data.mobility.fallRisk.toUpperCase()}
              </Badge>
            </div>
          </div>
          <InfoField label="Fall History" value={data.mobility.fallHistory} />
          <InfoField label="Transfers" value={data.mobility.transfers} />
          <InfoField label="Stairs" value={data.mobility.stairs} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bath className="w-5 h-5 text-gray-600" />
          Activities of Daily Living (ADLs)
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Bathing" value={data.adls.bathing} icon={Bath} />
          <InfoField label="Dressing" value={data.adls.dressing} icon={Shirt} />
          <InfoField label="Toileting" value={data.adls.toileting} />
          <InfoField label="Grooming" value={data.adls.grooming} />
          <InfoField label="Eating" value={data.adls.eating} icon={Utensils} />
          <InfoField label="Continence" value={data.adls.continence} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-gray-600" />
          Instrumental Activities of Daily Living (IADLs)
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Cooking" value={data.iadls.cooking} />
          <InfoField label="Shopping" value={data.iadls.shopping} />
          <InfoField label="Housework" value={data.iadls.housework} />
          <InfoField label="Laundry" value={data.iadls.laundry} />
          <InfoField label="Transportation" value={data.iadls.transportation} />
          <InfoField label="Medication Management" value={data.iadls.medications} />
          <InfoField label="Financial Management" value={data.iadls.finances} />
        </div>
      </Card>
    </div>
  );
}

function CognitiveStatusSection({ data }: { data: AssessmentData['cognitiveStatus'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Cognitive Status</h2>
        <p className="text-sm text-gray-600">Mental status and communication assessment</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-gray-600" />
          Orientation
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <OrientationBadge label="Person" oriented={data.orientation.person} />
          <OrientationBadge label="Place" oriented={data.orientation.place} />
          <OrientationBadge label="Time" oriented={data.orientation.time} />
          <OrientationBadge label="Situation" oriented={data.orientation.situation} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Cognitive Function</h3>
        <div className="space-y-4">
          <InfoField label="Memory" value={data.memory} />
          <InfoField label="Attention" value={data.attention} />
          <InfoField label="Problem Solving" value={data.problemSolving} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Communication</h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Understanding" value={data.communication.understanding} />
          <InfoField label="Expression" value={data.communication.expression} />
          <InfoField label="Speech" value={data.communication.speech} />
          <InfoField label="Language" value={data.communication.language} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Sensory Function</h3>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Vision" value={data.vision} icon={Eye} />
          <InfoField label="Hearing" value={data.hearing} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Mental & Behavioral Status</h3>
        <div className="space-y-4">
          <InfoField label="Mental Status" value={data.mentalStatus} />
          {data.behavioralConcerns.length > 0 ? (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Behavioral Concerns</div>
              <ul className="list-disc list-inside space-y-1">
                {data.behavioralConcerns.map((concern, index) => (
                  <li key={index} className="text-sm text-gray-600">{concern}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              <span>No behavioral concerns noted</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function MedicationsSection({ data }: { data: AssessmentData['medications'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Medications</h2>
        <p className="text-sm text-gray-600">Current medications, allergies, and management</p>
      </div>

      {data.allergies.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Drug Allergies
          </h3>
          <div className="space-y-3">
            {data.allergies.map((allergy, index) => (
              <div key={index} className="flex items-start gap-4 p-3 bg-white rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{allergy.allergen}</div>
                  <div className="text-sm text-gray-600 mt-1">Reaction: {allergy.reaction}</div>
                </div>
                <Badge className={cn(
                  'border',
                  allergy.severity === 'severe' && 'bg-red-100 text-red-700 border-red-300',
                  allergy.severity === 'moderate' && 'bg-amber-100 text-amber-700 border-amber-300',
                  allergy.severity === 'mild' && 'bg-yellow-100 text-yellow-700 border-yellow-300'
                )}>
                  {allergy.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-gray-600" />
          Current Medications
        </h3>
        <div className="space-y-3">
          {data.currentMedications.map((med, index) => (
            <MedicationCard key={index} medication={med} />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Medication Management</h3>
        <div className="space-y-4">
          <InfoField label="Compliance" value={data.compliance} />
          <InfoField label="Management Ability" value={data.managementAbility} />
          {data.pharmacyName && (
            <div className="grid grid-cols-2 gap-6">
              <InfoField label="Pharmacy" value={data.pharmacyName} />
              <InfoField label="Pharmacy Phone" value={data.pharmacyPhone || ''} icon={Phone} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function DiagnosesSection({ data }: { data: AssessmentData['diagnoses'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Diagnoses</h2>
        <p className="text-sm text-gray-600">Medical diagnoses and history</p>
      </div>

      <Card className="p-6 border-blue-200 bg-blue-50">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          Primary Diagnosis
        </h3>
        <div className="p-4 bg-white rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="font-semibold text-gray-900 text-lg">{data.primaryDiagnosis.description}</div>
            <Badge variant="outline" className="font-mono">{data.primaryDiagnosis.code}</Badge>
          </div>
          <div className="text-sm text-gray-600">
            Onset: {new Date(data.primaryDiagnosis.onsetDate).toLocaleDateString()}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Secondary Diagnoses</h3>
        <div className="space-y-3">
          {data.secondaryDiagnoses.map((diagnosis, index) => (
            <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{diagnosis.description}</div>
                {diagnosis.onsetDate && (
                  <div className="text-xs text-gray-600 mt-1">
                    Onset: {new Date(diagnosis.onsetDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <Badge variant="outline" className="font-mono text-xs">{diagnosis.code}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Comorbidities</h3>
        <div className="space-y-2">
          {data.comorbidities.map((condition, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{condition}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Surgical History</h3>
        <div className="space-y-3">
          {data.surgicalHistory.map((surgery, index) => (
            <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">{surgery.procedure}</div>
              <div className="text-sm text-gray-600">{new Date(surgery.date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Hospitalization History</h3>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {data.hospitalizationHistory}
        </div>
      </Card>
    </div>
  );
}

function CarePlanSection({ data }: { data: AssessmentData['carePlan'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Care Plan</h2>
        <p className="text-sm text-gray-600">Goals, interventions, and care coordination</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-gray-600" />
          Patient Goals
        </h3>
        <div className="space-y-4">
          {data.goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Disciplines & Frequency</h3>
        <div className="space-y-3">
          {data.disciplines.map(discipline => (
            <div key={discipline} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Badge variant="outline">{discipline}</Badge>
              <span className="text-sm text-gray-700">{data.frequency[discipline.toLowerCase() as keyof typeof data.frequency]}</span>
            </div>
          ))}
          <Separator />
          <InfoField label="Plan Duration" value={data.duration} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Special Instructions</h3>
        <div className="text-sm text-gray-700 whitespace-pre-wrap p-4 bg-blue-50 rounded-lg">
          {data.specialInstructions}
        </div>
      </Card>

      <Card className="p-6 border-amber-200 bg-amber-50">
        <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Safety Considerations
        </h3>
        <div className="space-y-2">
          {data.safetyConsiderations.map((consideration, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-900">{consideration}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface InfoFieldProps {
  label: string;
  value: string;
  icon?: React.ComponentType<any>;
  className?: string;
}

function InfoField({ label, value, icon: Icon, className }: InfoFieldProps) {
  return (
    <div className={className}>
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <div className="text-sm text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function OrientationBadge({ label, oriented }: { label: string; oriented: boolean }) {
  return (
    <div className={cn(
      'p-3 rounded-lg border text-center',
      oriented 
        ? 'bg-green-50 border-green-300'
        : 'bg-gray-50 border-gray-300'
    )}>
      <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
      <div className={cn(
        'flex items-center justify-center gap-1',
        oriented ? 'text-green-700' : 'text-gray-500'
      )}>
        {oriented ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span className="text-sm font-semibold">{oriented ? 'Yes' : 'No'}</span>
      </div>
    </div>
  );
}

function MedicationCard({ medication }: { medication: AssessmentData['medications']['currentMedications'][0] }) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900">{medication.name}</div>
          <div className="text-sm text-gray-600 mt-1">
            {medication.dosage} • {medication.frequency} • {medication.route}
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date(medication.startDate).toLocaleDateString()}
        </Badge>
      </div>
      <div className="text-sm text-gray-600 mt-2">
        <div><strong>Indication:</strong> {medication.indication}</div>
        <div><strong>Prescriber:</strong> {medication.prescriber}</div>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: AssessmentData['carePlan']['goals'][0] }) {
  return (
    <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
      <div className="flex items-start justify-between mb-3">
        <Badge className="bg-blue-600 text-white">{goal.discipline}</Badge>
        <Badge variant="outline">
          Target: {new Date(goal.targetDate).toLocaleDateString()}
        </Badge>
      </div>
      
      <div className="font-semibold text-gray-900 mb-3">{goal.goalStatement}</div>
      
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Interventions:</div>
          <ul className="space-y-1">
            {goal.interventions.map((intervention, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{intervention}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-3 bg-white rounded border border-blue-200">
          <div className="text-xs font-medium text-gray-700 mb-1">Expected Outcome:</div>
          <div className="text-sm text-gray-900">{goal.expectedOutcome}</div>
        </div>
      </div>
    </div>
  );
}
