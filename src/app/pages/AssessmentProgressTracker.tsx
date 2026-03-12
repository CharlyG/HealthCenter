/**
 * Assessment Progress Tracker
 * 
 * Comprehensive progress tracking system for clinical assessments:
 * - Overall completion percentage
 * - Section-by-section breakdown
 * - Status indicators (Complete, Incomplete, In Progress, Needs Review)
 * - Field-level granularity
 * - Visual progress bars and badges
 * - Clickable navigation to sections
 * - Integration with validation
 * - Multiple view modes (compact, detailed, timeline)
 */

import { useState, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  Eye,
  Target,
  BarChart3,
  List,
  Calendar,
  ChevronRight,
  Zap,
  TrendingUp,
  AlertTriangle,
  Info,
  FileText,
  User,
  Home,
  Activity,
  Brain,
  Pill,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type SectionStatus = 'complete' | 'incomplete' | 'in_progress' | 'needs_review';
type FieldStatus = 'complete' | 'incomplete' | 'has_warning' | 'has_error';

interface Field {
  id: string;
  label: string;
  required: boolean;
  type: 'text' | 'textarea' | 'number' | 'date' | 'radio' | 'checkbox' | 'select';
  options?: Array<{ value: string; label: string }>;
}

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fields: Field[];
  order: number;
}

interface SectionProgress {
  sectionId: string;
  status: SectionStatus;
  completedFields: number;
  totalFields: number;
  requiredFields: number;
  completedRequired: number;
  percentage: number;
  hasErrors: boolean;
  hasWarnings: boolean;
  lastUpdated?: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEMO SECTIONS
// ═══════════════════════════════════════════════════════════════════════════

const DEMO_SECTIONS: Section[] = [
  {
    id: 'patient-demographics',
    title: 'Patient Demographics',
    description: 'Basic patient information',
    icon: User,
    order: 1,
    fields: [
      { id: 'firstName', label: 'First Name', required: true, type: 'text' },
      { id: 'lastName', label: 'Last Name', required: true, type: 'text' },
      { id: 'dateOfBirth', label: 'Date of Birth', required: true, type: 'date' },
      { id: 'gender', label: 'Gender', required: true, type: 'radio', options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ]},
      { id: 'ssn', label: 'SSN', required: false, type: 'text' },
      { id: 'medicare', label: 'Medicare Number', required: false, type: 'text' },
    ],
  },
  {
    id: 'contact-information',
    title: 'Contact Information',
    description: 'Address and contact details',
    icon: FileText,
    order: 2,
    fields: [
      { id: 'address', label: 'Street Address', required: true, type: 'text' },
      { id: 'city', label: 'City', required: true, type: 'text' },
      { id: 'state', label: 'State', required: true, type: 'text' },
      { id: 'zipCode', label: 'ZIP Code', required: true, type: 'text' },
      { id: 'phone', label: 'Phone Number', required: true, type: 'text' },
      { id: 'email', label: 'Email', required: false, type: 'text' },
    ],
  },
  {
    id: 'living-arrangements',
    title: 'Living Arrangements',
    description: 'Home environment and support',
    icon: Home,
    order: 3,
    fields: [
      { id: 'livingSituation', label: 'Living Situation', required: true, type: 'radio', options: [
        { value: 'alone', label: 'Lives alone' },
        { value: 'with_others', label: 'Lives with others' },
      ]},
      { id: 'primaryCaregiver', label: 'Primary Caregiver', required: false, type: 'text' },
      { id: 'homeEnvironment', label: 'Home Environment', required: true, type: 'textarea' },
    ],
  },
  {
    id: 'functional-status',
    title: 'Functional Status',
    description: 'Mobility and ADL assessment',
    icon: Activity,
    order: 4,
    fields: [
      { id: 'ambulation', label: 'Ambulation Status', required: true, type: 'textarea' },
      { id: 'assistiveDevices', label: 'Assistive Devices', required: false, type: 'checkbox', options: [
        { value: 'walker', label: 'Walker' },
        { value: 'cane', label: 'Cane' },
        { value: 'wheelchair', label: 'Wheelchair' },
      ]},
      { id: 'fallRisk', label: 'Fall Risk Level', required: true, type: 'select', options: [
        { value: 'low', label: 'Low' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'high', label: 'High' },
      ]},
      { id: 'bathing', label: 'Bathing', required: true, type: 'select', options: [
        { value: 'independent', label: 'Independent' },
        { value: 'supervision', label: 'Supervision' },
        { value: 'assistance', label: 'Assistance' },
      ]},
      { id: 'dressing', label: 'Dressing', required: true, type: 'select', options: [
        { value: 'independent', label: 'Independent' },
        { value: 'supervision', label: 'Supervision' },
        { value: 'assistance', label: 'Assistance' },
      ]},
    ],
  },
  {
    id: 'cognitive-status',
    title: 'Cognitive Status',
    description: 'Mental status and communication',
    icon: Brain,
    order: 5,
    fields: [
      { id: 'orientation', label: 'Orientation to Person/Place/Time', required: true, type: 'radio', options: [
        { value: 'oriented', label: 'Fully oriented' },
        { value: 'partial', label: 'Partially oriented' },
        { value: 'disoriented', label: 'Disoriented' },
      ]},
      { id: 'memory', label: 'Memory Assessment', required: true, type: 'textarea' },
      { id: 'communication', label: 'Communication Ability', required: true, type: 'select', options: [
        { value: 'clear', label: 'Clear communication' },
        { value: 'impaired', label: 'Impaired' },
        { value: 'non-verbal', label: 'Non-verbal' },
      ]},
    ],
  },
  {
    id: 'medications',
    title: 'Medications',
    description: 'Current medications and allergies',
    icon: Pill,
    order: 6,
    fields: [
      { id: 'medicationList', label: 'Current Medications', required: true, type: 'textarea' },
      { id: 'allergies', label: 'Drug Allergies', required: true, type: 'textarea' },
      { id: 'compliance', label: 'Medication Compliance', required: true, type: 'radio', options: [
        { value: 'compliant', label: 'Compliant' },
        { value: 'non-compliant', label: 'Non-compliant' },
      ]},
    ],
  },
  {
    id: 'diagnoses',
    title: 'Diagnoses',
    description: 'Medical diagnoses and history',
    icon: Stethoscope,
    order: 7,
    fields: [
      { id: 'primaryDiagnosis', label: 'Primary Diagnosis (ICD-10)', required: true, type: 'text' },
      { id: 'secondaryDiagnoses', label: 'Secondary Diagnoses', required: false, type: 'textarea' },
      { id: 'surgicalHistory', label: 'Surgical History', required: false, type: 'textarea' },
    ],
  },
  {
    id: 'care-plan',
    title: 'Plan of Care',
    description: 'Goals and interventions',
    icon: ClipboardList,
    order: 8,
    fields: [
      { id: 'goal1', label: 'Primary Goal', required: true, type: 'textarea' },
      { id: 'goal2', label: 'Secondary Goal', required: false, type: 'textarea' },
      { id: 'disciplines', label: 'Disciplines Involved', required: true, type: 'checkbox', options: [
        { value: 'sn', label: 'Skilled Nursing' },
        { value: 'pt', label: 'Physical Therapy' },
        { value: 'ot', label: 'Occupational Therapy' },
      ]},
      { id: 'planDuration', label: 'Plan Duration', required: true, type: 'select', options: [
        { value: '30', label: '30 days' },
        { value: '60', label: '60 days' },
        { value: '90', label: '90 days' },
      ]},
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

function calculateFieldStatus(field: Field, value: any): FieldStatus {
  // Check if field has value
  const hasValue = value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
  
  if (!hasValue) {
    return 'incomplete';
  }
  
  // Mock warning/error logic
  if (field.id === 'fallRisk' && value === 'high') {
    return 'has_warning';
  }
  
  if (field.id === 'zipCode' && value && !/^\d{5}$/.test(value)) {
    return 'has_error';
  }
  
  return 'complete';
}

function calculateSectionProgress(
  section: Section,
  values: Record<string, any>
): SectionProgress {
  const fieldStatuses = section.fields.map(field => ({
    field,
    status: calculateFieldStatus(field, values[field.id]),
  }));
  
  const completedFields = fieldStatuses.filter(f => f.status === 'complete' || f.status === 'has_warning').length;
  const totalFields = section.fields.length;
  const requiredFields = section.fields.filter(f => f.required).length;
  const completedRequired = fieldStatuses.filter(f => 
    f.field.required && (f.status === 'complete' || f.status === 'has_warning')
  ).length;
  
  const hasErrors = fieldStatuses.some(f => f.status === 'has_error');
  const hasWarnings = fieldStatuses.some(f => f.status === 'has_warning');
  
  const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  
  // Determine status
  let status: SectionStatus;
  if (hasErrors) {
    status = 'needs_review';
  } else if (completedRequired === requiredFields && completedFields === totalFields) {
    status = 'complete';
  } else if (completedFields > 0) {
    status = 'in_progress';
  } else {
    status = 'incomplete';
  }
  
  return {
    sectionId: section.id,
    status,
    completedFields,
    totalFields,
    requiredFields,
    completedRequired,
    percentage,
    hasErrors,
    hasWarnings,
    lastUpdated: completedFields > 0 ? new Date() : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AssessmentProgressTracker() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('patient-demographics');
  const [values, setValues] = useState<Record<string, any>>({
    // Pre-fill some sections to show different states
    firstName: 'Margaret',
    lastName: 'Johnson',
    dateOfBirth: '1945-06-15',
    gender: 'female',
    medicare: '1AA2BB3CC44',
    address: '1234 Oak Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    phone: '(555) 123-4567',
    livingSituation: 'with_others',
    primaryCaregiver: 'Sarah Johnson',
    ambulation: 'Requires walker for all ambulation',
    fallRisk: 'high', // This will trigger a warning
  });
  const [viewMode, setViewMode] = useState<'compact' | 'detailed' | 'timeline'>('detailed');

  // Calculate progress for all sections
  const sectionProgress = useMemo(() => {
    return DEMO_SECTIONS.map(section => calculateSectionProgress(section, values));
  }, [values]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const totalRequiredFields = DEMO_SECTIONS.reduce((sum, s) => sum + s.fields.filter(f => f.required).length, 0);
    const completedRequiredFields = sectionProgress.reduce((sum, sp) => sum + sp.completedRequired, 0);
    
    const totalFields = DEMO_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);
    const completedFields = sectionProgress.reduce((sum, sp) => sum + sp.completedFields, 0);
    
    const sectionsComplete = sectionProgress.filter(sp => sp.status === 'complete').length;
    const sectionsInProgress = sectionProgress.filter(sp => sp.status === 'in_progress').length;
    const sectionsNeedReview = sectionProgress.filter(sp => sp.status === 'needs_review').length;
    
    return {
      percentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0,
      requiredPercentage: totalRequiredFields > 0 ? Math.round((completedRequiredFields / totalRequiredFields) * 100) : 0,
      completedFields,
      totalFields,
      completedRequiredFields,
      totalRequiredFields,
      sectionsComplete,
      sectionsInProgress,
      sectionsNeedReview,
      sectionsTotal: DEMO_SECTIONS.length,
    };
  }, [sectionProgress]);

  const handleValueChange = (fieldId: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleNavigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  OASIS-E Assessment - Start of Care
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN: MRN-334455
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {overallProgress.sectionsComplete}/{overallProgress.sectionsTotal} Sections Complete
              </Badge>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold text-gray-900">{overallProgress.percentage}% Complete</span>
            </div>
            <Progress value={overallProgress.percentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{overallProgress.completedFields} of {overallProgress.totalFields} fields completed</span>
              <span>{overallProgress.completedRequiredFields} of {overallProgress.totalRequiredFields} required fields</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Form */}
          <div className="col-span-8">
            <div className="space-y-6">
              {DEMO_SECTIONS.map(section => {
                const progress = sectionProgress.find(sp => sp.sectionId === section.id);
                return (
                  <SectionCard
                    key={section.id}
                    section={section}
                    progress={progress!}
                    values={values}
                    isActive={activeSection === section.id}
                    onValueChange={handleValueChange}
                  />
                );
              })}
            </div>
          </div>

          {/* Progress Tracker Sidebar */}
          <div className="col-span-4">
            <div className="sticky top-24">
              <ProgressTrackerPanel
                sections={DEMO_SECTIONS}
                sectionProgress={sectionProgress}
                overallProgress={overallProgress}
                viewMode={viewMode}
                activeSection={activeSection}
                onViewModeChange={setViewMode}
                onNavigateToSection={handleNavigateToSection}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface SectionCardProps {
  section: Section;
  progress: SectionProgress;
  values: Record<string, any>;
  isActive: boolean;
  onValueChange: (fieldId: string, value: any) => void;
}

function SectionCard({ section, progress, values, isActive, onValueChange }: SectionCardProps) {
  const Icon = section.icon;
  
  return (
    <Card
      id={`section-${section.id}`}
      className={cn(
        'transition-all scroll-mt-24',
        isActive && 'ring-2 ring-blue-500'
      )}
    >
      {/* Section Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border">
              <Icon className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            </div>
          </div>
          <SectionStatusBadge status={progress.status} />
        </div>

        {/* Section Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-600">
              {progress.completedFields} of {progress.totalFields} fields
            </span>
            <span className="font-semibold text-gray-900">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-1.5" />
        </div>
      </div>

      {/* Fields */}
      <div className="p-6 space-y-4">
        {section.fields.map(field => (
          <FieldInput
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={(value) => onValueChange(field.id, value)}
          />
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD INPUT
// ═══════════════════════════════════════════════════════════════════════════

interface FieldInputProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const hasValue = value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-900">
        {field.label}
        {field.required && <span className="text-red-600 ml-1">*</span>}
        {hasValue && (
          <CheckCircle2 className="w-4 h-4 text-green-600 inline-block ml-2" />
        )}
      </Label>

      {field.type === 'text' && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'textarea' && (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      )}

      {field.type === 'number' && (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'date' && (
        <Input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'radio' && field.options && (
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-2">
            {field.options.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {field.type === 'checkbox' && field.options && (
        <div className="space-y-2">
          {field.options.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.id}-${option.value}`}
                checked={Array.isArray(value) && value.includes(option.value)}
                onCheckedChange={(checked) => {
                  const currentValues = Array.isArray(value) ? value : [];
                  if (checked) {
                    onChange([...currentValues, option.value]);
                  } else {
                    onChange(currentValues.filter((v: string) => v !== option.value));
                  }
                }}
              />
              <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      )}

      {field.type === 'select' && field.options && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS TRACKER PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface ProgressTrackerPanelProps {
  sections: Section[];
  sectionProgress: SectionProgress[];
  overallProgress: any;
  viewMode: 'compact' | 'detailed' | 'timeline';
  activeSection: string;
  onViewModeChange: (mode: 'compact' | 'detailed' | 'timeline') => void;
  onNavigateToSection: (sectionId: string) => void;
}

function ProgressTrackerPanel({
  sections,
  sectionProgress,
  overallProgress,
  viewMode,
  activeSection,
  onViewModeChange,
  onNavigateToSection,
}: ProgressTrackerPanelProps) {
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Progress Tracker</h3>
        </div>
        <p className="text-xs text-blue-700">
          Track your assessment completion
        </p>
      </div>

      {/* View Mode Tabs */}
      <div className="p-3 border-b bg-gray-50">
        <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="compact" className="text-xs">
              <List className="w-3 h-3 mr-1" />
              Compact
            </TabsTrigger>
            <TabsTrigger value="detailed" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Detailed
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Timeline
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overall Stats */}
      <div className="p-4 bg-white border-b">
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Complete"
            value={overallProgress.sectionsComplete}
            total={overallProgress.sectionsTotal}
            color="green"
          />
          <StatCard
            label="In Progress"
            value={overallProgress.sectionsInProgress}
            total={overallProgress.sectionsTotal}
            color="blue"
          />
          <StatCard
            label="Need Review"
            value={overallProgress.sectionsNeedReview}
            total={overallProgress.sectionsTotal}
            color="amber"
          />
        </div>
      </div>

      {/* Section List */}
      <ScrollArea className="h-[calc(100vh-500px)]">
        <div className="p-4 space-y-2">
          {viewMode === 'compact' && (
            <CompactView
              sections={sections}
              sectionProgress={sectionProgress}
              activeSection={activeSection}
              onNavigate={onNavigateToSection}
            />
          )}

          {viewMode === 'detailed' && (
            <DetailedView
              sections={sections}
              sectionProgress={sectionProgress}
              activeSection={activeSection}
              onNavigate={onNavigateToSection}
            />
          )}

          {viewMode === 'timeline' && (
            <TimelineView
              sections={sections}
              sectionProgress={sectionProgress}
              activeSection={activeSection}
              onNavigate={onNavigateToSection}
            />
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface ViewProps {
  sections: Section[];
  sectionProgress: SectionProgress[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

function CompactView({ sections, sectionProgress, activeSection, onNavigate }: ViewProps) {
  return (
    <>
      {sections.map((section, index) => {
        const progress = sectionProgress.find(sp => sp.sectionId === section.id)!;
        const Icon = section.icon;
        
        return (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md',
              activeSection === section.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex-shrink-0">
              <StatusIcon status={progress.status} />
            </div>
            
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {section.title}
              </div>
              <div className="text-xs text-gray-600">
                {progress.completedFields}/{progress.totalFields} fields
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="text-sm font-bold text-gray-900">{progress.percentage}%</div>
            </div>

            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        );
      })}
    </>
  );
}

function DetailedView({ sections, sectionProgress, activeSection, onNavigate }: ViewProps) {
  return (
    <>
      {sections.map((section, index) => {
        const progress = sectionProgress.find(sp => sp.sectionId === section.id)!;
        const Icon = section.icon;
        
        return (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md',
              activeSection === section.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-white rounded-lg border flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-700" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                  <SectionStatusBadge status={progress.status} size="sm" />
                </div>
                <div className="text-xs text-gray-600">{section.description}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-semibold text-gray-900">{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-1.5" />
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{progress.completedFields}/{progress.totalFields} fields</span>
                <span>{progress.completedRequired}/{progress.requiredFields} required</span>
              </div>

              {(progress.hasErrors || progress.hasWarnings) && (
                <div className="flex items-center gap-2 mt-2">
                  {progress.hasErrors && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Has Errors
                    </Badge>
                  )}
                  {progress.hasWarnings && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Has Warnings
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </>
  );
}

function TimelineView({ sections, sectionProgress, activeSection, onNavigate }: ViewProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      {sections.map((section, index) => {
        const progress = sectionProgress.find(sp => sp.sectionId === section.id)!;
        const Icon = section.icon;
        const isLast = index === sections.length - 1;
        
        return (
          <div key={section.id} className="relative pb-8">
            {/* Timeline dot */}
            <div className="absolute left-3 top-2 z-10">
              <div className={cn(
                'w-6 h-6 rounded-full border-4 border-white flex items-center justify-center',
                progress.status === 'complete' && 'bg-green-500',
                progress.status === 'in_progress' && 'bg-blue-500',
                progress.status === 'incomplete' && 'bg-gray-300',
                progress.status === 'needs_review' && 'bg-amber-500'
              )}>
                {progress.status === 'complete' && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
            </div>

            {/* Content */}
            <button
              onClick={() => onNavigate(section.id)}
              className={cn(
                'ml-14 w-[calc(100%-3.5rem)] text-left p-3 rounded-lg border-2 transition-all hover:shadow-md',
                activeSection === section.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-gray-900">{section.title}</div>
                <SectionStatusBadge status={progress.status} size="sm" />
              </div>
              
              <Progress value={progress.percentage} className="h-1.5 mb-2" />
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{progress.completedFields}/{progress.totalFields} fields</span>
                <span className="font-semibold">{progress.percentage}%</span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SectionStatusBadge({ status, size = 'default' }: { status: SectionStatus; size?: 'sm' | 'default' }) {
  const config = {
    complete: {
      label: 'Complete',
      className: 'bg-green-100 text-green-700 border-green-300',
      icon: CheckCircle2,
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: Clock,
    },
    incomplete: {
      label: 'Incomplete',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: Circle,
    },
    needs_review: {
      label: 'Needs Review',
      className: 'bg-amber-100 text-amber-700 border-amber-300',
      icon: AlertCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={cn('border', className, size === 'sm' && 'text-xs')}>
      <Icon className={cn('mr-1', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
      {label}
    </Badge>
  );
}

function StatusIcon({ status }: { status: SectionStatus }) {
  const config = {
    complete: { icon: CheckCircle2, className: 'text-green-600 bg-green-100' },
    in_progress: { icon: Clock, className: 'text-blue-600 bg-blue-100' },
    incomplete: { icon: Circle, className: 'text-gray-400 bg-gray-100' },
    needs_review: { icon: AlertCircle, className: 'text-amber-600 bg-amber-100' },
  };

  const { icon: Icon, className } = config[status];

  return (
    <div className={cn('p-2 rounded-full', className)}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

function StatCard({ label, value, total, color }: { label: string; value: number; total: number; color: 'green' | 'blue' | 'amber' }) {
  const colorConfig = {
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  return (
    <div className={cn('p-3 rounded-lg border', colorConfig[color])}>
      <div className="text-xs font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-75">of {total}</div>
    </div>
  );
}
