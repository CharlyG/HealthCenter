/**
 * Wound Care Documentation Module
 * 
 * Comprehensive wound care documentation system
 * Supports wound assessment, photo documentation, and progression tracking
 */

import { useState, useMemo, useEffect } from 'react';
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
  MapPin,
  Ruler,
  Droplets,
  Bandage,
  Camera,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Image as ImageIcon,
  Upload,
  Eye,
  X,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface WoundAssessment {
  id: string;
  assessmentDate: string;
  clinician: string;
  clinicianCredentials: string;
  
  // Wound identification
  woundId: string;
  woundName: string;
  
  // Location
  woundLocation: string;
  woundLocationDetail: string;
  bodySide: string;
  
  // Type & Classification
  woundType: string;
  pressureInjuryStage: string;
  woundEtiology: string;
  
  // Measurements
  woundLength: string;
  woundWidth: string;
  woundDepth: string;
  woundArea: string;
  undermining: string;
  underminingLocation: string;
  tunneling: string;
  tunnelingLocation: string;
  
  // Wound bed
  woundBedTissueType: string[];
  woundBedPercentages: string;
  granulationTissue: string;
  necroticTissue: string;
  slough: string;
  eschar: string;
  epithelialization: string;
  
  // Edges & Surrounding Skin
  woundEdges: string;
  periWoundSkin: string;
  periWoundEdema: string;
  periWoundErythema: string;
  periWoundInduration: string;
  periWoundTemperature: string;
  
  // Drainage
  drainageAmount: string;
  drainageType: string;
  drainageColor: string;
  drainageOdor: string;
  drainageConsistency: string;
  
  // Pain
  painLevel: string;
  painDescription: string;
  
  // Treatment
  cleansingAgent: string;
  debridement: string;
  debridementMethod: string;
  primaryDressing: string;
  secondaryDressing: string;
  secureMethod: string;
  frequency: string;
  
  // Photos
  photosDocumented: string;
  photoIds: string[];
  
  // Assessment notes
  progressNotes: string;
  healingStatus: string;
  barriersTOHealing: string;
  interventions: string;
  
  // Follow-up
  nextAssessmentDate: string;
  physicianNotified: string;
  
  documentStatus: DocumentStatus;
}

interface WoundPhoto {
  id: string;
  woundId: string;
  photoDate: string;
  photoUrl: string;
  clinician: string;
  notes: string;
}

interface WoundRecord {
  woundId: string;
  woundName: string;
  patientId: string;
  initialDate: string;
  currentStatus: 'active' | 'healing' | 'healed' | 'deteriorating';
  location: string;
  type: string;
  assessments: WoundAssessment[];
  photos: WoundPhoto[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_PATIENT = {
  id: 'pat-99888',
  name: 'Dorothy Williams',
  mrn: 'MRN-778899',
};

const MOCK_WOUNDS: WoundRecord[] = [
  {
    woundId: 'wound-001',
    woundName: 'Right Heel Pressure Injury',
    patientId: 'pat-99888',
    initialDate: '2026-02-15',
    currentStatus: 'healing',
    location: 'Right Heel',
    type: 'Pressure Injury',
    assessments: [
      {
        id: 'assess-001',
        assessmentDate: '2026-03-09',
        clinician: 'Maria Santos',
        clinicianCredentials: 'RN, BSN',
        woundId: 'wound-001',
        woundName: 'Right Heel Pressure Injury',
        woundLocation: 'heel',
        woundLocationDetail: 'Posterior aspect',
        bodySide: 'right',
        woundType: 'pressure_injury',
        pressureInjuryStage: 'stage_3',
        woundEtiology: 'Pressure',
        woundLength: '3.5',
        woundWidth: '2.8',
        woundDepth: '0.8',
        woundArea: '9.8',
        undermining: 'yes',
        underminingLocation: '2-4 o\'clock, 1.2 cm',
        tunneling: 'no',
        tunnelingLocation: '',
        woundBedTissueType: ['granulation', 'slough'],
        woundBedPercentages: 'Granulation 70%, Slough 30%',
        granulationTissue: '70',
        necroticTissue: '0',
        slough: '30',
        eschar: '0',
        epithelialization: '10',
        woundEdges: 'attached',
        periWoundSkin: 'intact',
        periWoundEdema: 'none',
        periWoundErythema: 'mild',
        periWoundInduration: 'none',
        periWoundTemperature: 'normal',
        drainageAmount: 'moderate',
        drainageType: 'serous',
        drainageColor: 'clear',
        drainageOdor: 'none',
        drainageConsistency: 'thin',
        painLevel: '3',
        painDescription: 'Mild pain with dressing change',
        cleansingAgent: 'Normal saline',
        debridement: 'yes',
        debridementMethod: 'mechanical',
        primaryDressing: 'Foam dressing',
        secondaryDressing: 'Gauze wrap',
        secureMethod: 'tape',
        frequency: 'Daily',
        photosDocumented: 'yes',
        photoIds: ['photo-001'],
        progressNotes: 'Wound showing signs of healing. Granulation tissue increased from 60% to 70% since last assessment. Slough decreased. Continue current treatment plan.',
        healingStatus: 'improving',
        barriersTOHealing: 'Patient mobility limitations',
        interventions: 'Pressure relief mattress in use, repositioning q2h, nutritional supplements',
        nextAssessmentDate: '2026-03-16',
        physicianNotified: 'no',
        documentStatus: 'signed',
      },
      {
        id: 'assess-002',
        assessmentDate: '2026-03-02',
        clinician: 'Maria Santos',
        clinicianCredentials: 'RN, BSN',
        woundId: 'wound-001',
        woundName: 'Right Heel Pressure Injury',
        woundLocation: 'heel',
        woundLocationDetail: 'Posterior aspect',
        bodySide: 'right',
        woundType: 'pressure_injury',
        pressureInjuryStage: 'stage_3',
        woundEtiology: 'Pressure',
        woundLength: '4.2',
        woundWidth: '3.5',
        woundDepth: '1.2',
        woundArea: '14.7',
        undermining: 'yes',
        underminingLocation: '2-5 o\'clock, 1.8 cm',
        tunneling: 'no',
        tunnelingLocation: '',
        woundBedTissueType: ['granulation', 'slough'],
        woundBedPercentages: 'Granulation 60%, Slough 40%',
        granulationTissue: '60',
        necroticTissue: '0',
        slough: '40',
        eschar: '0',
        epithelialization: '5',
        woundEdges: 'attached',
        periWoundSkin: 'intact',
        periWoundEdema: 'mild',
        periWoundErythema: 'moderate',
        periWoundInduration: 'mild',
        periWoundTemperature: 'warm',
        drainageAmount: 'moderate',
        drainageType: 'serosanguineous',
        drainageColor: 'pink',
        drainageOdor: 'none',
        drainageConsistency: 'thin',
        painLevel: '5',
        painDescription: 'Moderate pain, especially with movement',
        cleansingAgent: 'Normal saline',
        debridement: 'yes',
        debridementMethod: 'mechanical',
        primaryDressing: 'Foam dressing',
        secondaryDressing: 'Gauze wrap',
        secureMethod: 'tape',
        frequency: 'Daily',
        photosDocumented: 'yes',
        photoIds: ['photo-002'],
        progressNotes: 'Initial assessment. Stage 3 pressure injury noted. Treatment plan established with physician.',
        healingStatus: 'stable',
        barriersTOHealing: 'Limited mobility, poor nutrition',
        interventions: 'Pressure relief mattress ordered, nutrition consult completed, repositioning schedule implemented',
        nextAssessmentDate: '2026-03-09',
        physicianNotified: 'yes',
        documentStatus: 'signed',
      },
    ],
    photos: [
      {
        id: 'photo-001',
        woundId: 'wound-001',
        photoDate: '2026-03-09',
        photoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
        clinician: 'Maria Santos, RN',
        notes: 'Week 3 - Increased granulation tissue visible',
      },
      {
        id: 'photo-002',
        woundId: 'wound-001',
        photoDate: '2026-03-02',
        photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
        clinician: 'Maria Santos, RN',
        notes: 'Initial assessment - Stage 3 pressure injury',
      },
    ],
  },
  {
    woundId: 'wound-002',
    woundName: 'Left Shin Venous Ulcer',
    patientId: 'pat-99888',
    initialDate: '2026-01-20',
    currentStatus: 'healing',
    location: 'Left Shin',
    type: 'Venous Ulcer',
    assessments: [],
    photos: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function WoundCareModule() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState<'list' | 'assessment' | 'progression'>('list');
  const [selectedWound, setSelectedWound] = useState<WoundRecord | null>(null);
  const [showNewWoundForm, setShowNewWoundForm] = useState(false);

  const handleViewProgression = (wound: WoundRecord) => {
    setSelectedWound(wound);
    setSelectedView('progression');
  };

  const handleNewAssessment = (wound: WoundRecord) => {
    setSelectedWound(wound);
    setSelectedView('assessment');
  };

  const handleBackToList = () => {
    setSelectedView('list');
    setSelectedWound(null);
  };

  if (selectedView === 'list') {
    return (
      <WoundListView
        wounds={MOCK_WOUNDS}
        onViewProgression={handleViewProgression}
        onNewAssessment={handleNewAssessment}
        onNewWound={() => setShowNewWoundForm(true)}
        onClose={() => navigate(-1)}
      />
    );
  }

  if (selectedView === 'progression' && selectedWound) {
    return (
      <WoundProgressionView
        wound={selectedWound}
        onBack={handleBackToList}
        onNewAssessment={() => setSelectedView('assessment')}
      />
    );
  }

  if (selectedView === 'assessment' && selectedWound) {
    return (
      <WoundAssessmentEditor
        wound={selectedWound}
        onClose={handleBackToList}
      />
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// WOUND LIST VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface WoundListViewProps {
  wounds: WoundRecord[];
  onViewProgression: (wound: WoundRecord) => void;
  onNewAssessment: (wound: WoundRecord) => void;
  onNewWound: () => void;
  onClose: () => void;
}

function WoundListView({ wounds, onViewProgression, onNewAssessment, onNewWound, onClose }: WoundListViewProps) {
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
                    Wound Care Documentation
                  </h1>
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    Wound Care
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{MOCK_PATIENT.name}</span>
                  <span>•</span>
                  <span>MRN: {MOCK_PATIENT.mrn}</span>
                  <span>•</span>
                  <span>{wounds.length} Active {wounds.length === 1 ? 'Wound' : 'Wounds'}</span>
                </div>
              </div>
            </div>

            <Button size="sm" onClick={onNewWound}>
              <Plus className="w-4 h-4 mr-2" />
              New Wound
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {wounds.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Bandage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Active Wounds
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  No wounds currently documented for this patient
                </p>
                <Button onClick={onNewWound}>
                  <Plus className="w-4 h-4 mr-2" />
                  Document New Wound
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {wounds.map(wound => (
                <WoundCard
                  key={wound.woundId}
                  wound={wound}
                  onViewProgression={() => onViewProgression(wound)}
                  onNewAssessment={() => onNewAssessment(wound)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface WoundCardProps {
  wound: WoundRecord;
  onViewProgression: () => void;
  onNewAssessment: () => void;
}

function WoundCard({ wound, onViewProgression, onNewAssessment }: WoundCardProps) {
  const latestAssessment = wound.assessments[0];
  const daysSinceInitial = Math.floor(
    (new Date().getTime() - new Date(wound.initialDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusColors = {
    active: 'bg-blue-100 text-blue-700 border-blue-300',
    healing: 'bg-green-100 text-green-700 border-green-300',
    healed: 'bg-gray-100 text-gray-700 border-gray-300',
    deteriorating: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{wound.woundName}</h3>
            <Badge className={cn('border', statusColors[wound.currentStatus])}>
              {wound.currentStatus.charAt(0).toUpperCase() + wound.currentStatus.slice(1)}
            </Badge>
            {wound.assessments.length > 0 && (
              <Badge variant="outline">
                {wound.assessments.length} {wound.assessments.length === 1 ? 'Assessment' : 'Assessments'}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-500">Location:</span>
              <div className="font-medium text-gray-900">{wound.location}</div>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <div className="font-medium text-gray-900">{wound.type}</div>
            </div>
            <div>
              <span className="text-gray-500">Initial Date:</span>
              <div className="font-medium text-gray-900">
                {new Date(wound.initialDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Days Open:</span>
              <div className="font-medium text-gray-900">{daysSinceInitial} days</div>
            </div>
          </div>

          {latestAssessment && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">Latest Assessment</div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Size:</span>
                  <div className="font-medium">
                    {latestAssessment.woundLength} x {latestAssessment.woundWidth} x {latestAssessment.woundDepth} cm
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Drainage:</span>
                  <div className="font-medium">{latestAssessment.drainageAmount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <div className="font-medium">
                    {new Date(latestAssessment.assessmentDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Clinician:</span>
                  <div className="font-medium text-xs">
                    {latestAssessment.clinician}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Photos Preview */}
        {wound.photos.length > 0 && (
          <div className="flex gap-2">
            {wound.photos.slice(0, 2).map(photo => (
              <div key={photo.id} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={photo.photoUrl}
                  alt="Wound"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {wound.photos.length > 2 && (
              <div className="w-20 h-20 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">+{wound.photos.length - 2}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 pt-4 border-t">
        <Button size="sm" onClick={onNewAssessment}>
          <Plus className="w-4 h-4 mr-1" />
          New Assessment
        </Button>
        <Button variant="outline" size="sm" onClick={onViewProgression}>
          <TrendingUp className="w-4 h-4 mr-1" />
          View Progression
        </Button>
        {wound.photos.length > 0 && (
          <Button variant="outline" size="sm">
            <ImageIcon className="w-4 h-4 mr-1" />
            Photos ({wound.photos.length})
          </Button>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WOUND ASSESSMENT EDITOR
// ═══════════════════════════════════════════════════════════════════════════

interface WoundAssessmentEditorProps {
  wound: WoundRecord;
  onClose: () => void;
}

function WoundAssessmentEditor({ wound, onClose }: WoundAssessmentEditorProps) {
  const [values, setValues] = useState<Partial<WoundAssessment>>({
    woundId: wound.woundId,
    woundName: wound.woundName,
    assessmentDate: new Date().toISOString().split('T')[0],
    clinician: 'Maria Santos',
    clinicianCredentials: 'RN, BSN',
    documentStatus: 'draft',
    woundBedTissueType: [],
    photoIds: [],
  });

  const [activeSection, setActiveSection] = useState('identification');
  const [showValidation, setShowValidation] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Validation
  const validationRules = useMemo(() => createValidationRules(), []);
  const validator = useMemo(() => new DocumentValidator(validationRules), [validationRules]);
  const [validationResult, setValidationResult] = useState<ValidationResult>(
    validator.validate(values)
  );

  useEffect(() => {
    setValidationResult(validator.validate(values));
  }, [values, validator]);

  const progress = useMemo(() => {
    const totalFields = validationRules.length;
    const completedFields = validationRules.filter(rule => {
      const value = values[rule.fieldId as keyof WoundAssessment];
      return value !== undefined && value !== '' && value !== null;
    }).length;
    return Math.round((completedFields / totalFields) * 100);
  }, [values, validationRules]);

  const handleFieldChange = (fieldId: keyof WoundAssessment, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real implementation, upload to server and get URLs
      const newPhotos = Array.from(files).map((file, index) => 
        `https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&sig=${Date.now()}-${index}`
      );
      setUploadedPhotos(prev => [...prev, ...newPhotos]);
      handleFieldChange('photosDocumented', 'yes');
    }
  };

  const handleSubmit = () => {
    if (!validationResult.canSubmit) {
      setShowValidation(true);
      alert(`Cannot submit: ${validationResult.errorCount} validation errors must be fixed.`);
      return;
    }
    console.log('Submitting wound assessment...', values);
    alert('Wound assessment saved successfully!');
    onClose();
  };

  const sections = [
    'identification',
    'measurements',
    'wound_bed',
    'drainage',
    'surrounding_skin',
    'treatment',
    'photos',
    'progress',
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
                Back
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">
                    Wound Assessment
                  </h1>
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    Wound Care
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{wound.woundName}</span>
                  <span>•</span>
                  <span>{new Date(values.assessmentDate || '').toLocaleDateString()}</span>
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
              <span className="text-gray-600">Assessment Progress</span>
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
              Assessment Sections
            </h3>
            <nav className="space-y-1">
              {sections.map(sectionId => {
                const section = SECTION_CONFIGS[sectionId as keyof typeof SECTION_CONFIGS];
                if (!section) return null;

                const sectionErrors = validationResult.errors.filter(
                  e => e.sectionId === sectionId
                ).length;

                return (
                  <button
                    key={sectionId}
                    onClick={() => setActiveSection(sectionId)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                      activeSection === sectionId
                        ? 'bg-red-50 text-red-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <section.icon className="w-4 h-4" />
                      <span>{section.title}</span>
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
              {activeSection === 'identification' && (
                <IdentificationSection values={values} onChange={handleFieldChange} validationResult={validationResult} />
              )}
              {activeSection === 'measurements' && (
                <MeasurementsSection values={values} onChange={handleFieldChange} validationResult={validationResult} />
              )}
              {activeSection === 'wound_bed' && (
                <WoundBedSection values={values} onChange={handleFieldChange} validationResult={validationResult} />
              )}
              {activeSection === 'drainage' && (
                <DrainageSection values={values} onChange={handleFieldChange} validationResult={validationResult} />
              )}
              {activeSection === 'surrounding_skin' && (
                <SurroundingSkinSection values={values} onChange={handleFieldChange} validationResult={validationResult} />
              )}
              {activeSection === 'treatment' && (
                <TreatmentSection values={values} onChange={handleFieldChange} validationResult={validationResult} />
              )}
              {activeSection === 'photos' && (
                <PhotosSection
                  values={values}
                  onChange={handleFieldChange}
                  uploadedPhotos={uploadedPhotos}
                  onPhotoUpload={handlePhotoUpload}
                  onRemovePhoto={(photoUrl) => setUploadedPhotos(prev => prev.filter(p => p !== photoUrl))}
                />
              )}
              {activeSection === 'progress' && (
                <ProgressSection values={values} onChange={handleFieldChange} validationResult={validationResult} />
              )}
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
// SECTION CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const SECTION_CONFIGS = {
  identification: {
    id: 'identification',
    title: 'Identification',
    icon: MapPin,
  },
  measurements: {
    id: 'measurements',
    title: 'Measurements',
    icon: Ruler,
  },
  wound_bed: {
    id: 'wound_bed',
    title: 'Wound Bed',
    icon: Activity,
  },
  drainage: {
    id: 'drainage',
    title: 'Drainage',
    icon: Droplets,
  },
  surrounding_skin: {
    id: 'surrounding_skin',
    title: 'Surrounding Skin',
    icon: Eye,
  },
  treatment: {
    id: 'treatment',
    title: 'Treatment',
    icon: Bandage,
  },
  photos: {
    id: 'photos',
    title: 'Photos',
    icon: Camera,
  },
  progress: {
    id: 'progress',
    title: 'Progress Notes',
    icon: FileText,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface SectionProps {
  values: Partial<WoundAssessment>;
  onChange: (fieldId: keyof WoundAssessment, value: any) => void;
  validationResult: ValidationResult;
}

function IdentificationSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-red-600" />
        Wound Identification & Location
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="assessmentDate" label="Assessment Date" required>
            <Input
              type="date"
              value={values.assessmentDate || ''}
              onChange={(e) => onChange('assessmentDate', e.target.value)}
            />
          </FormField>

          <FormField id="woundName" label="Wound Name/ID" required>
            <Input
              value={values.woundName || ''}
              onChange={(e) => onChange('woundName', e.target.value)}
              placeholder="e.g., Right Heel Pressure Injury"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField id="woundLocation" label="Anatomical Location" required>
            <Select value={values.woundLocation || ''} onValueChange={(v) => onChange('woundLocation', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="head">Head</SelectItem>
                <SelectItem value="neck">Neck</SelectItem>
                <SelectItem value="shoulder">Shoulder</SelectItem>
                <SelectItem value="arm">Arm</SelectItem>
                <SelectItem value="elbow">Elbow</SelectItem>
                <SelectItem value="forearm">Forearm</SelectItem>
                <SelectItem value="wrist">Wrist</SelectItem>
                <SelectItem value="hand">Hand</SelectItem>
                <SelectItem value="chest">Chest</SelectItem>
                <SelectItem value="abdomen">Abdomen</SelectItem>
                <SelectItem value="back">Back</SelectItem>
                <SelectItem value="sacrum">Sacrum</SelectItem>
                <SelectItem value="coccyx">Coccyx</SelectItem>
                <SelectItem value="hip">Hip</SelectItem>
                <SelectItem value="buttock">Buttock</SelectItem>
                <SelectItem value="thigh">Thigh</SelectItem>
                <SelectItem value="knee">Knee</SelectItem>
                <SelectItem value="shin">Shin/Lower Leg</SelectItem>
                <SelectItem value="ankle">Ankle</SelectItem>
                <SelectItem value="heel">Heel</SelectItem>
                <SelectItem value="foot">Foot</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="bodySide" label="Body Side" required>
            <Select value={values.bodySide || ''} onValueChange={(v) => onChange('bodySide', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select side" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="bilateral">Bilateral</SelectItem>
                <SelectItem value="midline">Midline</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="woundLocationDetail" label="Specific Detail">
            <Input
              value={values.woundLocationDetail || ''}
              onChange={(e) => onChange('woundLocationDetail', e.target.value)}
              placeholder="e.g., Posterior aspect, Medial"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="woundType" label="Wound Type" required>
            <Select value={values.woundType || ''} onValueChange={(v) => onChange('woundType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pressure_injury">Pressure Injury/Ulcer</SelectItem>
                <SelectItem value="surgical">Surgical Wound</SelectItem>
                <SelectItem value="traumatic">Traumatic Wound</SelectItem>
                <SelectItem value="venous">Venous Stasis Ulcer</SelectItem>
                <SelectItem value="arterial">Arterial Ulcer</SelectItem>
                <SelectItem value="diabetic">Diabetic Ulcer</SelectItem>
                <SelectItem value="burn">Burn</SelectItem>
                <SelectItem value="abrasion">Abrasion</SelectItem>
                <SelectItem value="laceration">Laceration</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {values.woundType === 'pressure_injury' && (
            <FormField id="pressureInjuryStage" label="Pressure Injury Stage" required>
              <Select value={values.pressureInjuryStage || ''} onValueChange={(v) => onChange('pressureInjuryStage', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stage_1">Stage 1 - Non-blanchable erythema</SelectItem>
                  <SelectItem value="stage_2">Stage 2 - Partial thickness skin loss</SelectItem>
                  <SelectItem value="stage_3">Stage 3 - Full thickness skin loss</SelectItem>
                  <SelectItem value="stage_4">Stage 4 - Full thickness tissue loss</SelectItem>
                  <SelectItem value="unstageable">Unstageable - Obscured</SelectItem>
                  <SelectItem value="deep_tissue">Deep Tissue Pressure Injury</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}
        </div>

        <FormField id="woundEtiology" label="Wound Etiology">
          <Input
            value={values.woundEtiology || ''}
            onChange={(e) => onChange('woundEtiology', e.target.value)}
            placeholder="e.g., Pressure, Trauma, Surgical, Vascular insufficiency"
          />
        </FormField>
      </div>
    </Card>
  );
}

function MeasurementsSection({ values, onChange }: SectionProps) {
  const calculateArea = () => {
    const length = parseFloat(values.woundLength || '0');
    const width = parseFloat(values.woundWidth || '0');
    const area = (length * width).toFixed(2);
    onChange('woundArea', area);
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Ruler className="w-5 h-5 text-red-600" />
        Wound Measurements
      </h2>
      
      <Alert className="mb-4">
        <Ruler className="h-4 w-4" />
        <AlertTitle>Measurement Guidelines</AlertTitle>
        <AlertDescription className="text-xs">
          Measure length (head-to-toe), width (side-to-side), and depth at the deepest point. Use cm for all measurements.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <FormField id="woundLength" label="Length (cm)" required>
            <Input
              type="number"
              step="0.1"
              value={values.woundLength || ''}
              onChange={(e) => {
                onChange('woundLength', e.target.value);
                setTimeout(calculateArea, 0);
              }}
              placeholder="0.0"
            />
          </FormField>

          <FormField id="woundWidth" label="Width (cm)" required>
            <Input
              type="number"
              step="0.1"
              value={values.woundWidth || ''}
              onChange={(e) => {
                onChange('woundWidth', e.target.value);
                setTimeout(calculateArea, 0);
              }}
              placeholder="0.0"
            />
          </FormField>

          <FormField id="woundDepth" label="Depth (cm)" required>
            <Input
              type="number"
              step="0.1"
              value={values.woundDepth || ''}
              onChange={(e) => onChange('woundDepth', e.target.value)}
              placeholder="0.0"
            />
          </FormField>

          <FormField id="woundArea" label="Area (cm²)">
            <Input
              type="number"
              step="0.1"
              value={values.woundArea || ''}
              readOnly
              className="bg-gray-50"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormField id="undermining" label="Undermining Present" required>
              <RadioGroup
                value={values.undermining || ''}
                onValueChange={(v) => onChange('undermining', v)}
              >
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="undermining-yes" />
                    <Label htmlFor="undermining-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="undermining-no" />
                    <Label htmlFor="undermining-no">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </FormField>

            {values.undermining === 'yes' && (
              <FormField id="underminingLocation" label="Undermining Location & Depth" required>
                <Input
                  value={values.underminingLocation || ''}
                  onChange={(e) => onChange('underminingLocation', e.target.value)}
                  placeholder="e.g., 2-4 o'clock, 1.5 cm"
                />
              </FormField>
            )}
          </div>

          <div>
            <FormField id="tunneling" label="Tunneling Present" required>
              <RadioGroup
                value={values.tunneling || ''}
                onValueChange={(v) => onChange('tunneling', v)}
              >
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="tunneling-yes" />
                    <Label htmlFor="tunneling-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="tunneling-no" />
                    <Label htmlFor="tunneling-no">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </FormField>

            {values.tunneling === 'yes' && (
              <FormField id="tunnelingLocation" label="Tunneling Location & Depth" required>
                <Input
                  value={values.tunnelingLocation || ''}
                  onChange={(e) => onChange('tunnelingLocation', e.target.value)}
                  placeholder="e.g., 9 o'clock, 2.0 cm"
                />
              </FormField>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function WoundBedSection({ values, onChange }: SectionProps) {
  const tissueTypes = [
    { id: 'granulation', label: 'Granulation (red, healthy)' },
    { id: 'slough', label: 'Slough (yellow, fibrous)' },
    { id: 'necrotic', label: 'Necrotic (black, eschar)' },
    { id: 'epithelial', label: 'Epithelial (pink, new skin)' },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-red-600" />
        Wound Bed Assessment
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label className="mb-3 block">Tissue Types Present (Check all that apply):</Label>
          <div className="space-y-2">
            {tissueTypes.map(tissue => (
              <div key={tissue.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tissue.id}
                  checked={values.woundBedTissueType?.includes(tissue.id) || false}
                  onCheckedChange={(checked) => {
                    const current = values.woundBedTissueType || [];
                    const updated = checked
                      ? [...current, tissue.id]
                      : current.filter(t => t !== tissue.id);
                    onChange('woundBedTissueType', updated);
                  }}
                />
                <label htmlFor={tissue.id} className="text-sm font-medium cursor-pointer">
                  {tissue.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <FormField id="woundBedPercentages" label="Tissue Type Percentages">
          <Input
            value={values.woundBedPercentages || ''}
            onChange={(e) => onChange('woundBedPercentages', e.target.value)}
            placeholder="e.g., Granulation 70%, Slough 30%"
          />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField id="granulationTissue" label="Granulation (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={values.granulationTissue || ''}
              onChange={(e) => onChange('granulationTissue', e.target.value)}
            />
          </FormField>

          <FormField id="slough" label="Slough (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={values.slough || ''}
              onChange={(e) => onChange('slough', e.target.value)}
            />
          </FormField>

          <FormField id="necroticTissue" label="Necrotic (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={values.necroticTissue || ''}
              onChange={(e) => onChange('necroticTissue', e.target.value)}
            />
          </FormField>

          <FormField id="eschar" label="Eschar (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={values.eschar || ''}
              onChange={(e) => onChange('eschar', e.target.value)}
            />
          </FormField>

          <FormField id="epithelialization" label="Epithelialization (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={values.epithelialization || ''}
              onChange={(e) => onChange('epithelialization', e.target.value)}
            />
          </FormField>
        </div>

        <FormField id="woundEdges" label="Wound Edges" required>
          <Select value={values.woundEdges || ''} onValueChange={(v) => onChange('woundEdges', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select edge characteristic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attached">Attached to wound bed</SelectItem>
              <SelectItem value="not_attached">Not attached</SelectItem>
              <SelectItem value="rolled">Rolled under (epibole)</SelectItem>
              <SelectItem value="irregular">Irregular</SelectItem>
              <SelectItem value="macerated">Macerated</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </Card>
  );
}

function DrainageSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Droplets className="w-5 h-5 text-red-600" />
        Drainage Assessment
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="drainageAmount" label="Drainage Amount" required>
            <Select value={values.drainageAmount || ''} onValueChange={(v) => onChange('drainageAmount', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None/Minimal</SelectItem>
                <SelectItem value="scant">Scant (less than 25%)</SelectItem>
                <SelectItem value="small">Small (25-50%)</SelectItem>
                <SelectItem value="moderate">Moderate (50-75%)</SelectItem>
                <SelectItem value="large">Large (75-100%)</SelectItem>
                <SelectItem value="copious">Copious (saturated)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="drainageType" label="Drainage Type" required>
            <Select value={values.drainageType || ''} onValueChange={(v) => onChange('drainageType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serous">Serous (clear, watery)</SelectItem>
                <SelectItem value="serosanguineous">Serosanguineous (pink, watery)</SelectItem>
                <SelectItem value="sanguineous">Sanguineous (bloody)</SelectItem>
                <SelectItem value="purulent">Purulent (thick, pus-like)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="drainageColor" label="Color" required>
            <Select value={values.drainageColor || ''} onValueChange={(v) => onChange('drainageColor', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="pink">Pink</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="brown">Brown</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="drainageOdor" label="Odor" required>
            <Select value={values.drainageOdor || ''} onValueChange={(v) => onChange('drainageOdor', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select odor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="foul">Foul</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="drainageConsistency" label="Consistency" required>
            <Select value={values.drainageConsistency || ''} onValueChange={(v) => onChange('drainageConsistency', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select consistency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thin">Thin</SelectItem>
                <SelectItem value="thick">Thick</SelectItem>
                <SelectItem value="viscous">Viscous</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>
    </Card>
  );
}

function SurroundingSkinSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-red-600" />
        Periwound & Surrounding Skin
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField id="periWoundSkin" label="Periwound Skin" required>
            <Select value={values.periWoundSkin || ''} onValueChange={(v) => onChange('periWoundSkin', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="macerated">Macerated</SelectItem>
                <SelectItem value="dry">Dry/Scaling</SelectItem>
                <SelectItem value="fragile">Fragile</SelectItem>
                <SelectItem value="callused">Callused</SelectItem>
                <SelectItem value="discolored">Discolored</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="periWoundEdema" label="Edema" required>
            <Select value={values.periWoundEdema || ''} onValueChange={(v) => onChange('periWoundEdema', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="mild">Mild (1+)</SelectItem>
                <SelectItem value="moderate">Moderate (2+)</SelectItem>
                <SelectItem value="severe">Severe (3+/4+)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="periWoundErythema" label="Erythema" required>
            <Select value={values.periWoundErythema || ''} onValueChange={(v) => onChange('periWoundErythema', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="mild">Mild ({'<'} 2cm)</SelectItem>
                <SelectItem value="moderate">Moderate (2-4cm)</SelectItem>
                <SelectItem value="severe">Severe ({'>'} 4cm)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="periWoundInduration" label="Induration" required>
            <Select value={values.periWoundInduration || ''} onValueChange={(v) => onChange('periWoundInduration', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="periWoundTemperature" label="Periwound Temperature" required>
            <Select value={values.periWoundTemperature || ''} onValueChange={(v) => onChange('periWoundTemperature', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select temperature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cool">Cool</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="painLevel" label="Pain Level (0-10)">
            <Input
              type="number"
              min="0"
              max="10"
              value={values.painLevel || ''}
              onChange={(e) => onChange('painLevel', e.target.value)}
              placeholder="0-10 scale"
            />
          </FormField>

          <FormField id="painDescription" label="Pain Description">
            <Input
              value={values.painDescription || ''}
              onChange={(e) => onChange('painDescription', e.target.value)}
              placeholder="e.g., Sharp, dull, throbbing"
            />
          </FormField>
        </div>
      </div>
    </Card>
  );
}

function TreatmentSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Bandage className="w-5 h-5 text-red-600" />
        Treatment Provided
      </h2>
      
      <div className="space-y-4">
        <FormField id="cleansingAgent" label="Cleansing Agent" required>
          <Select value={values.cleansingAgent || ''} onValueChange={(v) => onChange('cleansingAgent', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal_saline">Normal Saline</SelectItem>
              <SelectItem value="wound_cleanser">Commercial Wound Cleanser</SelectItem>
              <SelectItem value="betadine">Betadine Solution</SelectItem>
              <SelectItem value="chlorhexidine">Chlorhexidine</SelectItem>
              <SelectItem value="sterile_water">Sterile Water</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="debridement" label="Debridement Performed" required>
            <RadioGroup
              value={values.debridement || ''}
              onValueChange={(v) => onChange('debridement', v)}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="debride-yes" />
                  <Label htmlFor="debride-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="debride-no" />
                  <Label htmlFor="debride-no">No</Label>
                </div>
              </div>
            </RadioGroup>
          </FormField>

          {values.debridement === 'yes' && (
            <FormField id="debridementMethod" label="Debridement Method" required>
              <Select value={values.debridementMethod || ''} onValueChange={(v) => onChange('debridementMethod', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharp">Sharp/Surgical</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                  <SelectItem value="autolytic">Autolytic</SelectItem>
                  <SelectItem value="enzymatic">Enzymatic</SelectItem>
                  <SelectItem value="biological">Biological</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="primaryDressing" label="Primary Dressing" required>
            <Input
              value={values.primaryDressing || ''}
              onChange={(e) => onChange('primaryDressing', e.target.value)}
              placeholder="e.g., Foam, Hydrocolloid, Alginate"
            />
          </FormField>

          <FormField id="secondaryDressing" label="Secondary Dressing">
            <Input
              value={values.secondaryDressing || ''}
              onChange={(e) => onChange('secondaryDressing', e.target.value)}
              placeholder="e.g., Gauze, ABD pad"
            />
          </FormField>

          <FormField id="secureMethod" label="Securing Method" required>
            <Select value={values.secureMethod || ''} onValueChange={(v) => onChange('secureMethod', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tape">Medical Tape</SelectItem>
                <SelectItem value="wrap">Gauze Wrap</SelectItem>
                <SelectItem value="tubular">Tubular Bandage</SelectItem>
                <SelectItem value="self_adherent">Self-Adherent Wrap</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="frequency" label="Dressing Change Frequency" required>
            <Select value={values.frequency || ''} onValueChange={(v) => onChange('frequency', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BID">Twice Daily (BID)</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="every_other">Every Other Day</SelectItem>
                <SelectItem value="3x_week">3x per Week</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="prn">PRN</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>
    </Card>
  );
}

interface PhotosSectionProps extends SectionProps {
  uploadedPhotos: string[];
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (photoUrl: string) => void;
}

function PhotosSection({ values, onChange, uploadedPhotos, onPhotoUpload, onRemovePhoto }: PhotosSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5 text-red-600" />
        Wound Photography
      </h2>
      
      <Alert className="mb-4">
        <Camera className="h-4 w-4" />
        <AlertTitle>Photo Guidelines</AlertTitle>
        <AlertDescription className="text-xs">
          Include a ruler or measuring device in photos. Take photos from consistent angles for comparison. Ensure adequate lighting.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            multiple
            onChange={onPhotoUpload}
            className="hidden"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <div className="text-sm font-medium text-gray-900 mb-1">
              Click to upload wound photos
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPG up to 10MB
            </div>
          </label>
        </div>

        {uploadedPhotos.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Uploaded Photos ({uploadedPhotos.length})
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {uploadedPhotos.map((photoUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photoUrl}
                    alt={`Wound photo ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => onRemovePhoto(photoUrl)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Photo {index + 1} - {new Date().toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ProgressSection({ values, onChange }: SectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-red-600" />
        Progress Notes & Assessment
      </h2>
      
      <div className="space-y-4">
        <FormField id="healingStatus" label="Healing Status" required>
          <Select value={values.healingStatus || ''} onValueChange={(v) => onChange('healingStatus', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="improving">Improving</SelectItem>
              <SelectItem value="stable">Stable - No change</SelectItem>
              <SelectItem value="deteriorating">Deteriorating</SelectItem>
              <SelectItem value="healed">Healed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField id="progressNotes" label="Progress Notes" required>
          <Textarea
            value={values.progressNotes || ''}
            onChange={(e) => onChange('progressNotes', e.target.value)}
            rows={6}
            placeholder="Document wound progression, response to treatment, comparison to previous assessments..."
          />
        </FormField>

        <FormField id="barriersTOHealing" label="Barriers to Healing">
          <Textarea
            value={values.barriersTOHealing || ''}
            onChange={(e) => onChange('barriersTOHealing', e.target.value)}
            rows={3}
            placeholder="e.g., Poor nutrition, diabetes, mobility limitations, inadequate pressure relief..."
          />
        </FormField>

        <FormField id="interventions" label="Interventions & Plan">
          <Textarea
            value={values.interventions || ''}
            onChange={(e) => onChange('interventions', e.target.value)}
            rows={4}
            placeholder="Document interventions provided, treatment modifications, consultations ordered..."
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="nextAssessmentDate" label="Next Assessment Date" required>
            <Input
              type="date"
              value={values.nextAssessmentDate || ''}
              onChange={(e) => onChange('nextAssessmentDate', e.target.value)}
            />
          </FormField>

          <FormField id="physicianNotified" label="Physician Notified" required>
            <RadioGroup
              value={values.physicianNotified || ''}
              onValueChange={(v) => onChange('physicianNotified', v)}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="notify-yes" />
                  <Label htmlFor="notify-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="notify-no" />
                  <Label htmlFor="notify-no">No</Label>
                </div>
              </div>
            </RadioGroup>
          </FormField>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WOUND PROGRESSION VIEW
// ═══════════════════════════════════════════════════════════════════════════

interface WoundProgressionViewProps {
  wound: WoundRecord;
  onBack: () => void;
  onNewAssessment: () => void;
}

function WoundProgressionView({ wound, onBack, onNewAssessment }: WoundProgressionViewProps) {
  const sortedAssessments = [...wound.assessments].sort((a, b) => 
    new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
  );

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
                <h1 className="text-2xl font-bold text-gray-900">
                  {wound.woundName}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <span>{wound.location}</span>
                  <span>•</span>
                  <span>{wound.type}</span>
                  <span>•</span>
                  <span>{sortedAssessments.length} Assessments</span>
                </div>
              </div>
            </div>

            <Button size="sm" onClick={onNewAssessment}>
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Progression Timeline
              </TabsTrigger>
              <TabsTrigger value="photos">
                <Camera className="w-4 h-4 mr-2" />
                Photo Comparison
              </TabsTrigger>
              <TabsTrigger value="measurements">
                <Ruler className="w-4 h-4 mr-2" />
                Measurement Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-6">
              <div className="space-y-4">
                {sortedAssessments.map((assessment, index) => (
                  <Card key={assessment.id} className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Timeline marker */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-4 h-4 rounded-full',
                          index === 0 ? 'bg-green-500' : 'bg-gray-300'
                        )} />
                        {index < sortedAssessments.length - 1 && (
                          <div className="w-0.5 h-32 bg-gray-200 mt-2" />
                        )}
                      </div>

                      {/* Assessment details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              {new Date(assessment.assessmentDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-sm text-gray-600">
                              {assessment.clinician}, {assessment.clinicianCredentials}
                            </div>
                          </div>
                          <Badge className={cn(
                            assessment.healingStatus === 'improving' && 'bg-green-100 text-green-700 border-green-300',
                            assessment.healingStatus === 'stable' && 'bg-blue-100 text-blue-700 border-blue-300',
                            assessment.healingStatus === 'deteriorating' && 'bg-red-100 text-red-700 border-red-300'
                          )}>
                            {assessment.healingStatus}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-5 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Size</div>
                            <div className="font-semibold text-sm">
                              {assessment.woundLength} x {assessment.woundWidth} x {assessment.woundDepth} cm
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Area</div>
                            <div className="font-semibold text-sm">{assessment.woundArea} cm²</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Drainage</div>
                            <div className="font-semibold text-sm">{assessment.drainageAmount}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Granulation</div>
                            <div className="font-semibold text-sm">{assessment.granulationTissue}%</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Pain</div>
                            <div className="font-semibold text-sm">{assessment.painLevel}/10</div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                          <div className="font-medium mb-1">Progress Notes:</div>
                          {assessment.progressNotes}
                        </div>

                        {assessment.photosDocumented === 'yes' && (
                          <div className="mt-3">
                            <Button variant="outline" size="sm">
                              <Camera className="w-4 h-4 mr-2" />
                              View Photos
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <div className="grid grid-cols-3 gap-4">
                {wound.photos.map(photo => (
                  <Card key={photo.id} className="overflow-hidden">
                    <img
                      src={photo.photoUrl}
                      alt="Wound"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {new Date(photo.photoDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {photo.clinician}
                      </div>
                      <div className="text-xs text-gray-700">
                        {photo.notes}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="measurements" className="mt-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Measurement Trends Over Time
                </h3>
                <div className="text-sm text-gray-600">
                  Chart visualization would be displayed here showing wound size reduction, granulation tissue increase, and other metrics over time.
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: any;
  children: React.ReactNode;
}

function FormField({ id, label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div id={id}>{children}</div>
      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

function createValidationRules(): FieldValidationRule[] {
  return [
    {
      fieldId: 'assessmentDate',
      fieldLabel: 'Assessment Date',
      sectionId: 'identification',
      sectionTitle: 'Identification',
      required: true,
    },
    {
      fieldId: 'woundName',
      fieldLabel: 'Wound Name',
      sectionId: 'identification',
      sectionTitle: 'Identification',
      required: true,
    },
    {
      fieldId: 'woundLocation',
      fieldLabel: 'Location',
      sectionId: 'identification',
      sectionTitle: 'Identification',
      required: true,
    },
    {
      fieldId: 'bodySide',
      fieldLabel: 'Body Side',
      sectionId: 'identification',
      sectionTitle: 'Identification',
      required: true,
    },
    {
      fieldId: 'woundType',
      fieldLabel: 'Wound Type',
      sectionId: 'identification',
      sectionTitle: 'Identification',
      required: true,
    },
    {
      fieldId: 'woundLength',
      fieldLabel: 'Length',
      sectionId: 'measurements',
      sectionTitle: 'Measurements',
      required: true,
    },
    {
      fieldId: 'woundWidth',
      fieldLabel: 'Width',
      sectionId: 'measurements',
      sectionTitle: 'Measurements',
      required: true,
    },
    {
      fieldId: 'woundDepth',
      fieldLabel: 'Depth',
      sectionId: 'measurements',
      sectionTitle: 'Measurements',
      required: true,
    },
    {
      fieldId: 'undermining',
      fieldLabel: 'Undermining',
      sectionId: 'measurements',
      sectionTitle: 'Measurements',
      required: true,
    },
    {
      fieldId: 'tunneling',
      fieldLabel: 'Tunneling',
      sectionId: 'measurements',
      sectionTitle: 'Measurements',
      required: true,
    },
    {
      fieldId: 'woundEdges',
      fieldLabel: 'Wound Edges',
      sectionId: 'wound_bed',
      sectionTitle: 'Wound Bed',
      required: true,
    },
    {
      fieldId: 'drainageAmount',
      fieldLabel: 'Drainage Amount',
      sectionId: 'drainage',
      sectionTitle: 'Drainage',
      required: true,
    },
    {
      fieldId: 'drainageType',
      fieldLabel: 'Drainage Type',
      sectionId: 'drainage',
      sectionTitle: 'Drainage',
      required: true,
    },
    {
      fieldId: 'drainageColor',
      fieldLabel: 'Drainage Color',
      sectionId: 'drainage',
      sectionTitle: 'Drainage',
      required: true,
    },
    {
      fieldId: 'drainageOdor',
      fieldLabel: 'Drainage Odor',
      sectionId: 'drainage',
      sectionTitle: 'Drainage',
      required: true,
    },
    {
      fieldId: 'drainageConsistency',
      fieldLabel: 'Drainage Consistency',
      sectionId: 'drainage',
      sectionTitle: 'Drainage',
      required: true,
    },
    {
      fieldId: 'periWoundSkin',
      fieldLabel: 'Periwound Skin',
      sectionId: 'surrounding_skin',
      sectionTitle: 'Surrounding Skin',
      required: true,
    },
    {
      fieldId: 'periWoundEdema',
      fieldLabel: 'Edema',
      sectionId: 'surrounding_skin',
      sectionTitle: 'Surrounding Skin',
      required: true,
    },
    {
      fieldId: 'periWoundErythema',
      fieldLabel: 'Erythema',
      sectionId: 'surrounding_skin',
      sectionTitle: 'Surrounding Skin',
      required: true,
    },
    {
      fieldId: 'periWoundInduration',
      fieldLabel: 'Induration',
      sectionId: 'surrounding_skin',
      sectionTitle: 'Surrounding Skin',
      required: true,
    },
    {
      fieldId: 'periWoundTemperature',
      fieldLabel: 'Temperature',
      sectionId: 'surrounding_skin',
      sectionTitle: 'Surrounding Skin',
      required: true,
    },
    {
      fieldId: 'cleansingAgent',
      fieldLabel: 'Cleansing Agent',
      sectionId: 'treatment',
      sectionTitle: 'Treatment',
      required: true,
    },
    {
      fieldId: 'debridement',
      fieldLabel: 'Debridement',
      sectionId: 'treatment',
      sectionTitle: 'Treatment',
      required: true,
    },
    {
      fieldId: 'primaryDressing',
      fieldLabel: 'Primary Dressing',
      sectionId: 'treatment',
      sectionTitle: 'Treatment',
      required: true,
    },
    {
      fieldId: 'secureMethod',
      fieldLabel: 'Securing Method',
      sectionId: 'treatment',
      sectionTitle: 'Treatment',
      required: true,
    },
    {
      fieldId: 'frequency',
      fieldLabel: 'Frequency',
      sectionId: 'treatment',
      sectionTitle: 'Treatment',
      required: true,
    },
    {
      fieldId: 'healingStatus',
      fieldLabel: 'Healing Status',
      sectionId: 'progress',
      sectionTitle: 'Progress Notes',
      required: true,
    },
    {
      fieldId: 'progressNotes',
      fieldLabel: 'Progress Notes',
      sectionId: 'progress',
      sectionTitle: 'Progress Notes',
      required: true,
      minLength: 30,
    },
    {
      fieldId: 'nextAssessmentDate',
      fieldLabel: 'Next Assessment Date',
      sectionId: 'progress',
      sectionTitle: 'Progress Notes',
      required: true,
    },
    {
      fieldId: 'physicianNotified',
      fieldLabel: 'Physician Notified',
      sectionId: 'progress',
      sectionTitle: 'Progress Notes',
      required: true,
    },
  ];
}
