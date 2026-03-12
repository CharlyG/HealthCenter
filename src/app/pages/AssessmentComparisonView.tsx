/**
 * Assessment Comparison View
 * 
 * Side-by-side comparison of two clinical assessments:
 * - Compare Start of Care vs Recertification
 * - Compare Recertification vs Discharge
 * - Compare any two OASIS-E/HOPE assessments
 * - Highlight differences between responses
 * - Section-by-section comparison
 * - Filter: Show all fields vs Changed only
 * - Visual diff indicators
 * - Progress tracking (improved/declined/unchanged)
 * - Export comparison report
 * - Navigation to individual assessments
 * - Clinical significance indicators
 */

import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  ArrowLeft,
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Download,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  User,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Activity,
  Heart,
  Brain,
  Home,
  Pill,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type AssessmentType = 'soc' | 'recert' | 'discharge' | 'follow-up';
type ChangeType = 'improved' | 'declined' | 'unchanged' | 'added' | 'removed';
type ClinicalSignificance = 'high' | 'medium' | 'low' | 'none';

interface Assessment {
  id: string;
  type: AssessmentType;
  date: string;
  clinician: {
    name: string;
    role: string;
  };
  status: 'draft' | 'completed' | 'submitted';
  patientName: string;
  patientMRN: string;
}

interface AssessmentField {
  id: string;
  section: string;
  label: string;
  cmsCode?: string;
  valueType: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
}

interface ComparisonRow {
  field: AssessmentField;
  leftValue: any;
  rightValue: any;
  changeType: ChangeType;
  clinicalSignificance: ClinicalSignificance;
  note?: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  fields: AssessmentField[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_ASSESSMENTS: Assessment[] = [
  {
    id: 'oasis-soc-001',
    type: 'soc',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    clinician: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    status: 'submitted',
    patientName: 'Margaret Johnson',
    patientMRN: 'MRN-334455',
  },
  {
    id: 'oasis-recert-001',
    type: 'recert',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    clinician: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    status: 'submitted',
    patientName: 'Margaret Johnson',
    patientMRN: 'MRN-334455',
  },
  {
    id: 'oasis-discharge-001',
    type: 'discharge',
    date: new Date().toISOString(),
    clinician: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    status: 'draft',
    patientName: 'Margaret Johnson',
    patientMRN: 'MRN-334455',
  },
];

const SECTIONS: Section[] = [
  {
    id: 'demographics',
    title: 'Patient Demographics',
    icon: User,
    fields: [
      { id: 'age', section: 'demographics', label: 'Age', valueType: 'number' },
      { id: 'gender', section: 'demographics', label: 'Gender', valueType: 'select' },
      { id: 'primaryDiagnosis', section: 'demographics', label: 'Primary Diagnosis', valueType: 'text' },
    ],
  },
  {
    id: 'living',
    title: 'Living Arrangements',
    icon: Home,
    fields: [
      { id: 'livingSituation', section: 'living', label: 'Living Situation', cmsCode: 'M1100', valueType: 'select' },
      { id: 'primaryCaregiver', section: 'living', label: 'Primary Caregiver Availability', valueType: 'text' },
    ],
  },
  {
    id: 'functional',
    title: 'Functional Status',
    icon: Activity,
    fields: [
      { id: 'ambulation', section: 'functional', label: 'Ambulation/Locomotion', cmsCode: 'M1860', valueType: 'select' },
      { id: 'transferring', section: 'functional', label: 'Transferring', cmsCode: 'M1850', valueType: 'select' },
      { id: 'bathing', section: 'functional', label: 'Bathing', cmsCode: 'M1830', valueType: 'select' },
      { id: 'dressing', section: 'functional', label: 'Dressing', cmsCode: 'M1840', valueType: 'select' },
      { id: 'toileting', section: 'functional', label: 'Toileting', cmsCode: 'M1845', valueType: 'select' },
      { id: 'fallRisk', section: 'functional', label: 'Fall Risk Assessment', valueType: 'select' },
    ],
  },
  {
    id: 'cognitive',
    title: 'Cognitive Status',
    icon: Brain,
    fields: [
      { id: 'cognitiveFunction', section: 'cognitive', label: 'Cognitive Functioning', cmsCode: 'M1700', valueType: 'select' },
      { id: 'confusion', section: 'cognitive', label: 'When Confused', cmsCode: 'M1710', valueType: 'select' },
      { id: 'anxiety', section: 'cognitive', label: 'When Anxious', cmsCode: 'M1720', valueType: 'select' },
      { id: 'memory', section: 'cognitive', label: 'Memory Deficit', valueType: 'select' },
    ],
  },
  {
    id: 'sensory',
    title: 'Sensory Status',
    icon: Eye,
    fields: [
      { id: 'vision', section: 'sensory', label: 'Vision', cmsCode: 'M1200', valueType: 'select' },
      { id: 'hearing', section: 'sensory', label: 'Hearing', cmsCode: 'M1210', valueType: 'select' },
      { id: 'speech', section: 'sensory', label: 'Speech and Language', cmsCode: 'M1220', valueType: 'select' },
    ],
  },
  {
    id: 'cardiorespiratory',
    title: 'Cardiorespiratory',
    icon: Heart,
    fields: [
      { id: 'dyspnea', section: 'cardiorespiratory', label: 'Dyspnea', cmsCode: 'M1400', valueType: 'select' },
      { id: 'urinaryIncontinence', section: 'cardiorespiratory', label: 'Urinary Incontinence', cmsCode: 'M1600', valueType: 'select' },
      { id: 'bowelIncontinence', section: 'cardiorespiratory', label: 'Bowel Incontinence', cmsCode: 'M1610', valueType: 'select' },
    ],
  },
  {
    id: 'medications',
    title: 'Medications',
    icon: Pill,
    fields: [
      { id: 'medicationManagement', section: 'medications', label: 'Management of Oral Medications', cmsCode: 'M2020', valueType: 'select' },
      { id: 'medicationCount', section: 'medications', label: 'Number of Medications', valueType: 'number' },
      { id: 'highRiskMeds', section: 'medications', label: 'High-Risk Drug Classes', cmsCode: 'M2010', valueType: 'multiselect' },
    ],
  },
  {
    id: 'healthcareUtilization',
    title: 'Healthcare Utilization',
    icon: Stethoscope,
    fields: [
      { id: 'hospitalizations', section: 'healthcareUtilization', label: 'Emergent Care Since Last Assessment', valueType: 'number' },
      { id: 'erVisits', section: 'healthcareUtilization', label: 'Emergency Room Visits', valueType: 'number' },
    ],
  },
];

// Mock comparison data
const MOCK_SOC_DATA: Record<string, any> = {
  age: 78,
  gender: 'Female',
  primaryDiagnosis: 'I50.9 - Heart Failure, unspecified',
  livingSituation: '01 - Patient lives alone',
  primaryCaregiver: 'Daughter available 3x/week',
  ambulation: '3 - Requires assistance from one person',
  transferring: '3 - Requires assistance from one person',
  bathing: '3 - Unable to bathe self, total assistance',
  dressing: '2 - Able to dress upper body, needs assistance with lower',
  toileting: '2 - Able to get to and from toilet with assistance',
  fallRisk: 'High - Multiple risk factors present',
  cognitiveFunction: '1 - Alert/oriented, able to focus',
  confusion: '0 - Never',
  anxiety: '1 - Less than daily',
  memory: 'Short-term deficit noted',
  vision: '1 - Partially impaired',
  hearing: '0 - Adequate',
  speech: '0 - Expresses complex ideas',
  dyspnea: '2 - With moderate exertion',
  urinaryIncontinence: '1 - During the night only',
  bowelIncontinence: '0 - Very rarely or never',
  medicationManagement: '2 - Able to take medication if prepared',
  medicationCount: 8,
  highRiskMeds: ['Anticoagulant', 'Hypoglycemic'],
  hospitalizations: 1,
  erVisits: 0,
};

const MOCK_RECERT_DATA: Record<string, any> = {
  age: 78,
  gender: 'Female',
  primaryDiagnosis: 'I50.9 - Heart Failure, unspecified',
  livingSituation: '01 - Patient lives alone',
  primaryCaregiver: 'Daughter available daily now',
  ambulation: '2 - Able to ambulate with supervision',
  transferring: '1 - Able to transfer with minimal assistance',
  bathing: '2 - Able to bathe with assistance for safety',
  dressing: '1 - Able to dress independently',
  toileting: '1 - Able to get to and from toilet independently',
  fallRisk: 'Moderate - Risk factors reduced',
  cognitiveFunction: '1 - Alert/oriented, able to focus',
  confusion: '0 - Never',
  anxiety: '0 - None of the time',
  memory: 'Short-term memory improved',
  vision: '1 - Partially impaired',
  hearing: '0 - Adequate',
  speech: '0 - Expresses complex ideas',
  dyspnea: '1 - With minimal exertion',
  urinaryIncontinence: '0 - No incontinence',
  bowelIncontinence: '0 - Very rarely or never',
  medicationManagement: '1 - Able to take medication independently',
  medicationCount: 7,
  highRiskMeds: ['Anticoagulant', 'Hypoglycemic'],
  hospitalizations: 0,
  erVisits: 0,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AssessmentComparisonView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get assessment IDs from URL params or use defaults
  const leftId = searchParams.get('left') || 'oasis-soc-001';
  const rightId = searchParams.get('right') || 'oasis-recert-001';
  
  const [leftAssessment, setLeftAssessment] = useState(
    MOCK_ASSESSMENTS.find(a => a.id === leftId) || MOCK_ASSESSMENTS[0]
  );
  const [rightAssessment, setRightAssessment] = useState(
    MOCK_ASSESSMENTS.find(a => a.id === rightId) || MOCK_ASSESSMENTS[1]
  );
  
  const [showChangedOnly, setShowChangedOnly] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(SECTIONS.map(s => s.id))
  );

  // Calculate comparison rows
  const comparisonRows = useMemo(() => {
    const rows: ComparisonRow[] = [];
    
    SECTIONS.forEach(section => {
      section.fields.forEach(field => {
        const leftValue = MOCK_SOC_DATA[field.id];
        const rightValue = MOCK_RECERT_DATA[field.id];
        
        const { changeType, clinicalSignificance } = analyzeChange(
          field,
          leftValue,
          rightValue
        );
        
        rows.push({
          field,
          leftValue,
          rightValue,
          changeType,
          clinicalSignificance,
        });
      });
    });
    
    return rows;
  }, [leftAssessment, rightAssessment]);

  // Filter rows
  const filteredRows = useMemo(() => {
    let filtered = comparisonRows;
    
    // Filter by section
    if (selectedSection !== 'all') {
      filtered = filtered.filter(row => row.field.section === selectedSection);
    }
    
    // Filter changed only
    if (showChangedOnly) {
      filtered = filtered.filter(row => row.changeType !== 'unchanged');
    }
    
    return filtered;
  }, [comparisonRows, selectedSection, showChangedOnly]);

  // Calculate statistics
  const stats = useMemo(() => {
    const improved = comparisonRows.filter(r => r.changeType === 'improved').length;
    const declined = comparisonRows.filter(r => r.changeType === 'declined').length;
    const unchanged = comparisonRows.filter(r => r.changeType === 'unchanged').length;
    const total = comparisonRows.length;
    
    return { improved, declined, unchanged, total };
  }, [comparisonRows]);

  const handleExport = () => {
    // Create comparison report
    const csvContent = [
      ['Section', 'Field', 'CMS Code', leftAssessment.type.toUpperCase(), rightAssessment.type.toUpperCase(), 'Change', 'Significance'],
      ...filteredRows.map(row => [
        row.field.section,
        row.field.label,
        row.field.cmsCode || '',
        String(row.leftValue || ''),
        String(row.rightValue || ''),
        row.changeType,
        row.clinicalSignificance,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-comparison-${leftAssessment.id}-${rightAssessment.id}-${Date.now()}.csv`;
    a.click();
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-blue-600" />
                  Assessment Comparison
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {leftAssessment.patientName} • {leftAssessment.patientMRN}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showChangedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowChangedOnly(!showChangedOnly)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showChangedOnly ? 'Show All' : 'Changed Only'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Assessment Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <AssessmentSelector
              assessment={leftAssessment}
              availableAssessments={MOCK_ASSESSMENTS}
              onSelect={setLeftAssessment}
              position="left"
            />
            <AssessmentSelector
              assessment={rightAssessment}
              availableAssessments={MOCK_ASSESSMENTS}
              onSelect={setRightAssessment}
              position="right"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Improved:</span>
              <Badge className="bg-green-100 text-green-800">{stats.improved}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">Declined:</span>
              <Badge className="bg-red-100 text-red-800">{stats.declined}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Unchanged:</span>
              <Badge variant="outline">{stats.unchanged}</Badge>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-gray-600">
              Showing {filteredRows.length} of {stats.total} fields
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Section Navigation */}
          <div className="col-span-3">
            <Card className="sticky top-28">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Sections</h3>
              </div>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-2">
                  <button
                    onClick={() => setSelectedSection('all')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1',
                      selectedSection === 'all'
                        ? 'bg-blue-50 text-blue-900 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    All Sections
                  </button>
                  <Separator className="my-2" />
                  {SECTIONS.map(section => {
                    const sectionRows = comparisonRows.filter(r => r.field.section === section.id);
                    const changedCount = sectionRows.filter(r => r.changeType !== 'unchanged').length;
                    const Icon = section.icon;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1',
                          selectedSection === section.id
                            ? 'bg-blue-50 text-blue-900 font-medium'
                            : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="flex-1">{section.title}</span>
                          {changedCount > 0 && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                              {changedCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Comparison Table */}
          <div className="col-span-9">
            <div className="space-y-4">
              {SECTIONS.filter(section => 
                selectedSection === 'all' || selectedSection === section.id
              ).map(section => {
                const sectionRows = filteredRows.filter(r => r.field.section === section.id);
                if (sectionRows.length === 0 && showChangedOnly) return null;
                
                const isExpanded = expandedSections.has(section.id);
                const Icon = section.icon;
                
                return (
                  <Card key={section.id}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {sectionRows.length} fields
                              {sectionRows.filter(r => r.changeType !== 'unchanged').length > 0 && (
                                <span className="text-amber-600 ml-2">
                                  • {sectionRows.filter(r => r.changeType !== 'unchanged').length} changed
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Section Content */}
                    {isExpanded && (
                      <div className="border-t">
                        {sectionRows.map((row, idx) => (
                          <ComparisonRowComponent
                            key={row.field.id}
                            row={row}
                            isLast={idx === sectionRows.length - 1}
                          />
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}

              {filteredRows.length === 0 && (
                <Card className="p-12">
                  <div className="text-center text-gray-500">
                    <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No Changes Found</p>
                    <p className="text-sm">
                      {showChangedOnly
                        ? 'All fields are identical between these assessments.'
                        : 'No fields match the current filters.'}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT SELECTOR
// ═══════════════════════════════════════════════════════════════════════════

interface AssessmentSelectorProps {
  assessment: Assessment;
  availableAssessments: Assessment[];
  onSelect: (assessment: Assessment) => void;
  position: 'left' | 'right';
}

function AssessmentSelector({ assessment, availableAssessments, onSelect, position }: AssessmentSelectorProps) {
  return (
    <Card className={cn(
      'p-4',
      position === 'left' ? 'border-l-4 border-l-blue-500' : 'border-r-4 border-r-purple-500'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <Label className="text-xs text-gray-600">
            {position === 'left' ? 'Compare From' : 'Compare To'}
          </Label>
          <Select
            value={assessment.id}
            onValueChange={(value) => {
              const selected = availableAssessments.find(a => a.id === value);
              if (selected) onSelect(selected);
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableAssessments.map(a => (
                <SelectItem key={a.id} value={a.id}>
                  {getAssessmentTypeLabel(a.type)} - {new Date(a.date).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AssessmentTypeBadge type={assessment.type} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(assessment.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <User className="w-4 h-4" />
          <span>{assessment.clinician.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-600" />
          <AssessmentStatusBadge status={assessment.status} />
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full mt-3"
        onClick={() => window.open('/clinical-assessment-viewer', '_blank')}
      >
        <Eye className="w-4 h-4 mr-2" />
        View Full Assessment
        <ExternalLink className="w-3 h-3 ml-2" />
      </Button>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON ROW
// ═══════════════════════════════════════════════════════════════════════════

interface ComparisonRowComponentProps {
  row: ComparisonRow;
  isLast: boolean;
}

function ComparisonRowComponent({ row, isLast }: ComparisonRowComponentProps) {
  const isChanged = row.changeType !== 'unchanged';

  return (
    <div className={cn('p-4', !isLast && 'border-b', isChanged && 'bg-amber-50/50')}>
      {/* Field Label */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{row.field.label}</h4>
            {row.field.cmsCode && (
              <Badge variant="outline" className="text-xs">
                {row.field.cmsCode}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChangeTypeBadge changeType={row.changeType} />
          {row.clinicalSignificance !== 'none' && (
            <ClinicalSignificanceBadge significance={row.clinicalSignificance} />
          )}
        </div>
      </div>

      {/* Value Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Value */}
        <div>
          <Label className="text-xs text-gray-600 mb-2">Start of Care</Label>
          <ValueDisplay
            value={row.leftValue}
            highlighted={isChanged && row.changeType === 'declined'}
            highlightColor="red"
          />
        </div>

        {/* Right Value */}
        <div>
          <Label className="text-xs text-gray-600 mb-2">Recertification</Label>
          <ValueDisplay
            value={row.rightValue}
            highlighted={isChanged && row.changeType === 'improved'}
            highlightColor="green"
          />
        </div>
      </div>

      {/* Change Indicator */}
      {isChanged && (
        <div className="mt-3 flex items-center justify-center">
          <ChangeIndicator changeType={row.changeType} />
        </div>
      )}

      {/* Note */}
      {row.note && (
        <div className="mt-3 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded">
          <Info className="w-4 h-4 inline mr-2" />
          {row.note}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function AssessmentTypeBadge({ type }: { type: AssessmentType }) {
  const config = {
    soc: { label: 'SOC', className: 'bg-blue-100 text-blue-800' },
    recert: { label: 'Recert', className: 'bg-purple-100 text-purple-800' },
    discharge: { label: 'Discharge', className: 'bg-green-100 text-green-800' },
    'follow-up': { label: 'Follow-up', className: 'bg-amber-100 text-amber-800' },
  };

  const { label, className } = config[type];

  return (
    <Badge className={cn('text-xs font-semibold', className)}>
      {label}
    </Badge>
  );
}

function AssessmentStatusBadge({ status }: { status: string }) {
  const config = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
    submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  };

  const { label, className } = config[status as keyof typeof config];

  return (
    <Badge variant="outline" className={cn('text-xs', className)}>
      {label}
    </Badge>
  );
}

function ChangeTypeBadge({ changeType }: { changeType: ChangeType }) {
  const config = {
    improved: {
      label: 'Improved',
      icon: TrendingUp,
      className: 'bg-green-100 text-green-700 border-green-300',
    },
    declined: {
      label: 'Declined',
      icon: TrendingDown,
      className: 'bg-red-100 text-red-700 border-red-300',
    },
    unchanged: {
      label: 'Unchanged',
      icon: Minus,
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    added: {
      label: 'Added',
      icon: CheckCircle2,
      className: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    removed: {
      label: 'Removed',
      icon: AlertTriangle,
      className: 'bg-amber-100 text-amber-700 border-amber-300',
    },
  };

  const { label, icon: Icon, className } = config[changeType];

  return (
    <Badge variant="outline" className={cn('text-xs border', className)}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

function ClinicalSignificanceBadge({ significance }: { significance: ClinicalSignificance }) {
  const config = {
    high: { label: 'High Significance', className: 'bg-red-100 text-red-700' },
    medium: { label: 'Medium Significance', className: 'bg-amber-100 text-amber-700' },
    low: { label: 'Low Significance', className: 'bg-blue-100 text-blue-700' },
    none: { label: 'No Significance', className: 'bg-gray-100 text-gray-700' },
  };

  const { label, className } = config[significance];

  return (
    <Badge variant="outline" className={cn('text-xs', className)}>
      {label}
    </Badge>
  );
}

function ValueDisplay({ 
  value, 
  highlighted, 
  highlightColor 
}: { 
  value: any; 
  highlighted?: boolean; 
  highlightColor?: 'green' | 'red';
}) {
  const displayValue = value === null || value === undefined || value === '' 
    ? '(empty)' 
    : Array.isArray(value)
    ? value.join(', ')
    : String(value);

  return (
    <div className={cn(
      'p-3 rounded-lg border-2 text-sm',
      highlighted && highlightColor === 'green' && 'bg-green-50 border-green-300 text-green-900 font-medium',
      highlighted && highlightColor === 'red' && 'bg-red-50 border-red-300 text-red-900 font-medium',
      !highlighted && 'bg-white border-gray-200 text-gray-700'
    )}>
      {displayValue === '(empty)' ? (
        <span className="italic text-gray-400">{displayValue}</span>
      ) : (
        displayValue
      )}
    </div>
  );
}

function ChangeIndicator({ changeType }: { changeType: ChangeType }) {
  if (changeType === 'improved') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700">
        <TrendingUp className="w-5 h-5" />
        <ArrowRight className="w-4 h-4" />
        <span className="font-medium">Patient condition improved</span>
      </div>
    );
  }

  if (changeType === 'declined') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-700">
        <TrendingDown className="w-5 h-5" />
        <ArrowRight className="w-4 h-4" />
        <span className="font-medium">Patient condition declined</span>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function analyzeChange(
  field: AssessmentField,
  leftValue: any,
  rightValue: any
): { changeType: ChangeType; clinicalSignificance: ClinicalSignificance } {
  // Check if values are the same
  if (JSON.stringify(leftValue) === JSON.stringify(rightValue)) {
    return { changeType: 'unchanged', clinicalSignificance: 'none' };
  }

  // Functional status fields - lower number = better
  const functionalFields = ['ambulation', 'transferring', 'bathing', 'dressing', 'toileting'];
  if (functionalFields.includes(field.id)) {
    const leftNum = parseInt(String(leftValue).charAt(0));
    const rightNum = parseInt(String(rightValue).charAt(0));
    
    if (!isNaN(leftNum) && !isNaN(rightNum)) {
      if (rightNum < leftNum) {
        return { changeType: 'improved', clinicalSignificance: 'high' };
      } else if (rightNum > leftNum) {
        return { changeType: 'declined', clinicalSignificance: 'high' };
      }
    }
  }

  // Fall risk - text comparison
  if (field.id === 'fallRisk') {
    if (String(rightValue).includes('Low') || String(rightValue).includes('Moderate')) {
      if (String(leftValue).includes('High')) {
        return { changeType: 'improved', clinicalSignificance: 'high' };
      }
    }
    if (String(rightValue).includes('High')) {
      return { changeType: 'declined', clinicalSignificance: 'high' };
    }
  }

  // Medication management - lower number = better
  if (field.id === 'medicationManagement') {
    const leftNum = parseInt(String(leftValue).charAt(0));
    const rightNum = parseInt(String(rightValue).charAt(0));
    
    if (!isNaN(leftNum) && !isNaN(rightNum)) {
      if (rightNum < leftNum) {
        return { changeType: 'improved', clinicalSignificance: 'medium' };
      } else if (rightNum > leftNum) {
        return { changeType: 'declined', clinicalSignificance: 'medium' };
      }
    }
  }

  // Healthcare utilization - lower is better
  if (field.id === 'hospitalizations' || field.id === 'erVisits') {
    if (rightValue < leftValue) {
      return { changeType: 'improved', clinicalSignificance: 'high' };
    } else if (rightValue > leftValue) {
      return { changeType: 'declined', clinicalSignificance: 'high' };
    }
  }

  // Incontinence - lower number = better
  if (field.id === 'urinaryIncontinence' || field.id === 'bowelIncontinence') {
    const leftNum = parseInt(String(leftValue).charAt(0));
    const rightNum = parseInt(String(rightValue).charAt(0));
    
    if (!isNaN(leftNum) && !isNaN(rightNum)) {
      if (rightNum < leftNum) {
        return { changeType: 'improved', clinicalSignificance: 'medium' };
      } else if (rightNum > leftNum) {
        return { changeType: 'declined', clinicalSignificance: 'medium' };
      }
    }
  }

  // Default: just mark as changed with low significance
  return { changeType: 'improved', clinicalSignificance: 'low' };
}

function getAssessmentTypeLabel(type: AssessmentType): string {
  const labels = {
    soc: 'Start of Care',
    recert: 'Recertification',
    discharge: 'Discharge',
    'follow-up': 'Follow-up',
  };
  return labels[type];
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-sm font-medium', className)}>{children}</div>;
}
