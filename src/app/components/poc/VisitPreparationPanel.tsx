/**
 * Visit Preparation Panel
 * 
 * Comprehensive panel to help clinicians prepare for patient visits.
 * Displays critical patient information and visit-specific tasks.
 * 
 * Features:
 * - Patient summary with key demographics
 * - Primary diagnosis and care plan
 * - Medication list with allergy warnings
 * - Recent clinical notes and alerts
 * - Visit tasks checklist (observations, interventions, education, documentation)
 * - Quick-scan format for pre-visit review
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  User,
  Heart,
  AlertTriangle,
  FileText,
  Pill,
  ClipboardList,
  Activity,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Stethoscope,
  Syringe,
  GraduationCap,
  FileSignature,
  Phone,
  Calendar,
  MapPin,
  Info,
  TrendingUp,
  Eye,
  ChevronRight,
  AlertOctagon,
  ShieldAlert,
} from 'lucide-react';

interface VisitPreparationPanelProps {
  visitId: string;
  patientId: string;
  onStartVisit?: () => void;
}

interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  admissionDate: string;
  primaryPayer: string;
}

interface Diagnosis {
  code: string;
  description: string;
  isPrimary: boolean;
  onsetDate: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  prescriber: string;
  startDate: string;
  purpose?: string;
}

interface Allergy {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  verifiedDate: string;
}

interface ClinicalNote {
  id: string;
  date: string;
  type: string;
  author: string;
  summary: string;
}

interface Alert {
  id: string;
  type: 'clinical' | 'safety' | 'administrative';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  date: string;
}

interface VisitTask {
  id: string;
  category: 'observation' | 'intervention' | 'education' | 'documentation';
  description: string;
  required: boolean;
  completed: boolean;
  notes?: string;
}

export default function VisitPreparationPanel({
  visitId,
  patientId,
  onStartVisit,
}: VisitPreparationPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    medications: true,
    allergies: true,
    alerts: true,
    carePlan: true,
  });

  const [tasks, setTasks] = useState<VisitTask[]>([]);

  // Mock patient data - In production, fetch from dataGateway
  const patientSummary: PatientSummary = useMemo(() => ({
    id: patientId,
    name: 'Margaret Thompson',
    age: 78,
    gender: 'Female',
    phone: '(555) 123-4567',
    address: '1234 Oak Street, Springfield, IL 62701',
    emergencyContact: 'John Thompson (Son)',
    emergencyPhone: '(555) 987-6543',
    admissionDate: '2026-02-15',
    primaryPayer: 'Medicare Part A',
  }), [patientId]);

  const diagnoses: Diagnosis[] = useMemo(() => [
    {
      code: 'I50.9',
      description: 'Congestive Heart Failure',
      isPrimary: true,
      onsetDate: '2025-12-10',
    },
    {
      code: 'E11.9',
      description: 'Type 2 Diabetes Mellitus',
      isPrimary: false,
      onsetDate: '2020-03-15',
    },
    {
      code: 'I10',
      description: 'Essential Hypertension',
      isPrimary: false,
      onsetDate: '2019-06-20',
    },
  ], []);

  const medications: Medication[] = useMemo(() => [
    {
      name: 'Furosemide',
      dosage: '40mg',
      frequency: 'Once daily',
      route: 'Oral',
      prescriber: 'Dr. Sarah Johnson',
      startDate: '2026-02-15',
      purpose: 'CHF management - diuretic',
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      route: 'Oral',
      prescriber: 'Dr. Sarah Johnson',
      startDate: '2020-03-15',
      purpose: 'Diabetes management',
    },
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      route: 'Oral',
      prescriber: 'Dr. Sarah Johnson',
      startDate: '2019-06-20',
      purpose: 'Blood pressure control',
    },
    {
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Once daily',
      route: 'Oral',
      prescriber: 'Dr. Sarah Johnson',
      startDate: '2019-06-20',
      purpose: 'Cardiovascular protection',
    },
  ], []);

  const allergies: Allergy[] = useMemo(() => [
    {
      allergen: 'Penicillin',
      reaction: 'Severe rash, difficulty breathing',
      severity: 'severe',
      verifiedDate: '2010-05-12',
    },
    {
      allergen: 'Sulfa drugs',
      reaction: 'Hives, itching',
      severity: 'moderate',
      verifiedDate: '2015-08-20',
    },
  ], []);

  const recentNotes: ClinicalNote[] = useMemo(() => [
    {
      id: 'note-1',
      date: '2026-03-06',
      type: 'Skilled Nursing Visit',
      author: 'RN Jane Smith',
      summary: 'Patient reports increased shortness of breath. Weight up 3 lbs since last visit. Lung sounds reveal bilateral crackles. Instructed on fluid restriction and daily weights. Notified physician.',
    },
    {
      id: 'note-2',
      date: '2026-03-04',
      type: 'Physical Therapy Evaluation',
      author: 'PT Michael Chen',
      summary: 'Initial PT eval completed. Patient demonstrates decreased endurance and balance deficits. Gait unsteady with walker. Initiated therapeutic exercise program focusing on strengthening and balance.',
    },
  ], []);

  const alerts: Alert[] = useMemo(() => [
    {
      id: 'alert-1',
      type: 'clinical',
      severity: 'high',
      message: 'CHF exacerbation - monitor weight daily, assess for edema and SOB',
      date: '2026-03-06',
    },
    {
      id: 'alert-2',
      type: 'safety',
      severity: 'critical',
      message: 'FALL RISK - Patient fell 2 weeks ago. Use gait belt, assess home safety',
      date: '2026-02-22',
    },
    {
      id: 'alert-3',
      type: 'administrative',
      severity: 'medium',
      message: 'Authorization expires in 12 days - discuss continued care needs',
      date: '2026-03-07',
    },
  ], []);

  const carePlanGoals = useMemo(() => [
    'Patient will maintain stable weight within 2 lbs of baseline',
    'Patient will demonstrate compliance with medication regimen',
    'Patient will ambulate 50 feet with walker independently and safely',
    'Patient will verbalize understanding of CHF symptoms requiring MD notification',
  ], []);

  // Visit tasks - initialized with common tasks
  useMemo(() => {
    setTasks([
      // Clinical Observations
      {
        id: 'obs-1',
        category: 'observation',
        description: 'Obtain vital signs (BP, HR, RR, Temp, O2 sat)',
        required: true,
        completed: false,
      },
      {
        id: 'obs-2',
        category: 'observation',
        description: 'Assess lung sounds and respiratory effort',
        required: true,
        completed: false,
      },
      {
        id: 'obs-3',
        category: 'observation',
        description: 'Check for peripheral edema (lower extremities)',
        required: true,
        completed: false,
      },
      {
        id: 'obs-4',
        category: 'observation',
        description: 'Obtain daily weight',
        required: true,
        completed: false,
      },
      {
        id: 'obs-5',
        category: 'observation',
        description: 'Assess pain level (0-10 scale)',
        required: true,
        completed: false,
      },
      // Interventions
      {
        id: 'int-1',
        category: 'intervention',
        description: 'Medication reconciliation and compliance review',
        required: true,
        completed: false,
      },
      {
        id: 'int-2',
        category: 'intervention',
        description: 'Review blood glucose log (if diabetic)',
        required: true,
        completed: false,
      },
      {
        id: 'int-3',
        category: 'intervention',
        description: 'Assess home safety and fall prevention',
        required: true,
        completed: false,
      },
      {
        id: 'int-4',
        category: 'intervention',
        description: 'Wound care (if applicable)',
        required: false,
        completed: false,
      },
      // Patient Education
      {
        id: 'edu-1',
        category: 'education',
        description: 'CHF symptom recognition and when to call MD',
        required: true,
        completed: false,
      },
      {
        id: 'edu-2',
        category: 'education',
        description: 'Fluid restriction and sodium intake guidelines',
        required: true,
        completed: false,
      },
      {
        id: 'edu-3',
        category: 'education',
        description: 'Proper use of assistive devices (walker)',
        required: true,
        completed: false,
      },
      {
        id: 'edu-4',
        category: 'education',
        description: 'Medication purpose and side effects',
        required: false,
        completed: false,
      },
      // Documentation
      {
        id: 'doc-1',
        category: 'documentation',
        description: 'Complete skilled nursing visit note',
        required: true,
        completed: false,
      },
      {
        id: 'doc-2',
        category: 'documentation',
        description: 'Document patient/caregiver education',
        required: true,
        completed: false,
      },
      {
        id: 'doc-3',
        category: 'documentation',
        description: 'Update care plan if needed',
        required: false,
        completed: false,
      },
      {
        id: 'doc-4',
        category: 'documentation',
        description: 'Obtain patient signature',
        required: true,
        completed: false,
      },
    ]);
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'life-threatening':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'high':
      case 'severe':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'medium':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'life-threatening':
        return <AlertOctagon className="size-5 text-red-600" />;
      case 'high':
      case 'severe':
        return <AlertTriangle className="size-5 text-orange-600" />;
      case 'medium':
      case 'moderate':
        return <AlertCircle className="size-5 text-yellow-600" />;
      default:
        return <Info className="size-4 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'observation':
        return <Stethoscope className="size-4 text-blue-600" />;
      case 'intervention':
        return <Syringe className="size-4 text-purple-600" />;
      case 'education':
        return <GraduationCap className="size-4 text-green-600" />;
      case 'documentation':
        return <FileSignature className="size-4 text-orange-600" />;
      default:
        return <ClipboardList className="size-4 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'observation':
        return 'text-blue-700';
      case 'intervention':
        return 'text-purple-700';
      case 'education':
        return 'text-green-700';
      case 'documentation':
        return 'text-orange-700';
      default:
        return 'text-gray-700';
    }
  };

  const tasksByCategory = useMemo(() => {
    return {
      observation: tasks.filter(t => t.category === 'observation'),
      intervention: tasks.filter(t => t.category === 'intervention'),
      education: tasks.filter(t => t.category === 'education'),
      documentation: tasks.filter(t => t.category === 'documentation'),
    };
  }, [tasks]);

  const completedCount = tasks.filter(t => t.completed).length;
  const requiredCount = tasks.filter(t => t.required).length;
  const requiredCompletedCount = tasks.filter(t => t.required && t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-blue-600 rounded-full flex items-center justify-center">
                <ClipboardList className="size-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Visit Preparation</h2>
                <p className="text-sm text-gray-600">Review patient information before starting visit</p>
              </div>
            </div>
            {onStartVisit && (
              <Button onClick={onStartVisit} size="lg" className="gap-2">
                <Clock className="size-5" />
                Start Visit
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="size-5 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">
                  Visit Tasks: {completedCount} of {tasks.length} completed
                </p>
                <p className="text-xs text-gray-600">
                  {requiredCompletedCount} of {requiredCount} required tasks completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                {completedCount} Done
              </Badge>
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                {tasks.length - completedCount} Remaining
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Patient Overview</TabsTrigger>
          <TabsTrigger value="tasks">Visit Tasks</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Patient Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5 text-blue-600" />
                  Patient Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{patientSummary.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{patientSummary.age} years old</Badge>
                    <Badge variant="outline">{patientSummary.gender}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Phone className="size-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{patientSummary.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Address</p>
                      <p className="font-semibold text-gray-900">{patientSummary.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Emergency Contact</p>
                      <p className="font-semibold text-gray-900">{patientSummary.emergencyContact}</p>
                      <p className="text-gray-600">{patientSummary.emergencyPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="size-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Admission Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(patientSummary.admissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Diagnosis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="size-5 text-red-600" />
                  Diagnoses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {diagnoses.map((dx, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${
                      dx.isPrimary
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-900">{dx.description}</p>
                      {dx.isPrimary && (
                        <Badge className="bg-red-600 text-white text-xs">Primary</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="font-mono">{dx.code}</span>
                      <span>•</span>
                      <span>Onset: {new Date(dx.onsetDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-orange-600" />
                  Active Alerts
                  <Badge className="bg-orange-600 text-white">{alerts.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] capitalize bg-white/50"
                        >
                          {alert.type}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {new Date(alert.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold text-sm">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Allergies Warning */}
          {allergies.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-red-600" />
                  ALLERGIES
                  <Badge className="bg-red-600 text-white">{allergies.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {allergies.map((allergy, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg ${getSeverityColor(
                      allergy.severity
                    )}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-lg font-bold text-gray-900">{allergy.allergen}</p>
                      <Badge
                        className={`capitalize ${
                          allergy.severity === 'life-threatening' || allergy.severity === 'severe'
                            ? 'bg-red-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        {allergy.severity}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      Reaction: {allergy.reaction}
                    </p>
                    <p className="text-xs text-gray-600">
                      Verified: {new Date(allergy.verifiedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="size-5 text-purple-600" />
                Current Medications
                <Badge variant="outline">{medications.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medications.map((med, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{med.name}</p>
                        <p className="text-sm text-gray-700">
                          {med.dosage} - {med.frequency} ({med.route})
                        </p>
                      </div>
                    </div>
                    {med.purpose && (
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-semibold">Purpose:</span> {med.purpose}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Prescriber: {med.prescriber}</span>
                      <span>•</span>
                      <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Care Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-green-600" />
                Care Plan Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {carePlanGoals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="size-5 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-900">{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent Clinical Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-gray-600" />
                Recent Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentNotes.map(note => (
                <div key={note.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {note.type}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600">{note.author}</span>
                  </div>
                  <p className="text-sm text-gray-900">{note.summary}</p>
                  <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                    <Eye className="size-3 mr-1" />
                    View Full Note
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visit Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          {/* Clinical Observations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="size-5 text-blue-600" />
                Clinical Observations
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {tasksByCategory.observation.filter(t => t.completed).length} /{' '}
                  {tasksByCategory.observation.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByCategory.observation.map(task => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {task.description}
                    </p>
                    {task.required && !task.completed && (
                      <Badge variant="outline" className="mt-1 text-[10px] bg-red-50 text-red-700 border-red-200">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Interventions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="size-5 text-purple-600" />
                Interventions
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {tasksByCategory.intervention.filter(t => t.completed).length} /{' '}
                  {tasksByCategory.intervention.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByCategory.intervention.map(task => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {task.description}
                    </p>
                    {task.required && !task.completed && (
                      <Badge variant="outline" className="mt-1 text-[10px] bg-red-50 text-red-700 border-red-200">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Patient Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5 text-green-600" />
                Patient Education
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {tasksByCategory.education.filter(t => t.completed).length} /{' '}
                  {tasksByCategory.education.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByCategory.education.map(task => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {task.description}
                    </p>
                    {task.required && !task.completed && (
                      <Badge variant="outline" className="mt-1 text-[10px] bg-red-50 text-red-700 border-red-200">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Documentation Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="size-5 text-orange-600" />
                Documentation Requirements
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  {tasksByCategory.documentation.filter(t => t.completed).length} /{' '}
                  {tasksByCategory.documentation.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByCategory.documentation.map(task => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {task.description}
                    </p>
                    {task.required && !task.completed && (
                      <Badge variant="outline" className="mt-1 text-[10px] bg-red-50 text-red-700 border-red-200">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Details Tab */}
        <TabsContent value="clinical" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Detailed Diagnosis Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="size-5 text-red-600" />
                  Diagnosis Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diagnoses.map((dx, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{dx.description}</p>
                          <p className="text-xs text-gray-600 font-mono mt-1">ICD-10: {dx.code}</p>
                        </div>
                        {dx.isPrimary && (
                          <Badge className="bg-red-600 text-white">Primary</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">
                        Onset Date: {new Date(dx.onsetDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Medication Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="size-5 text-purple-600" />
                  Medication Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {medications.map((med, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-bold text-gray-900 mb-1">{med.name}</p>
                        <div className="space-y-1 text-xs text-gray-700">
                          <p>
                            <span className="font-semibold">Dose:</span> {med.dosage}
                          </p>
                          <p>
                            <span className="font-semibold">Frequency:</span> {med.frequency}
                          </p>
                          <p>
                            <span className="font-semibold">Route:</span> {med.route}
                          </p>
                          {med.purpose && (
                            <p>
                              <span className="font-semibold">Purpose:</span> {med.purpose}
                            </p>
                          )}
                          <p className="text-gray-600 mt-1">
                            Prescriber: {med.prescriber}
                          </p>
                          <p className="text-gray-600">
                            Start: {new Date(med.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Full Clinical Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-gray-600" />
                Clinical Notes History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotes.map(note => (
                  <div key={note.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{note.type}</Badge>
                        <span className="text-sm font-semibold text-gray-900">{note.author}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 leading-relaxed">{note.summary}</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Eye className="size-4 mr-2" />
                        View Full
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="size-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Action Footer */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Ready to begin visit?</p>
                <p className="text-xs text-gray-600">
                  Review checklist: {requiredCompletedCount}/{requiredCount} required items reviewed
                </p>
              </div>
            </div>
            {onStartVisit && (
              <Button onClick={onStartVisit} size="lg" className="gap-2">
                <Clock className="size-5" />
                Clock In & Start Visit
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
