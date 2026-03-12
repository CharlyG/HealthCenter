/**
 * OASIS-E Assessment Workspace
 * 
 * CMS-mandated Outcome and Assessment Information Set
 * Comprehensive regulatory assessment module for home health
 * 
 * Features:
 * - Section navigation sidebar
 * - Progress indicator
 * - Real-time validation
 * - Status tracking (Draft, In Progress, Completed, Submitted)
 * - Skip logic for conditional fields
 * - CMS compliance validation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClinicalDocumentationLayout } from '../components/documentation/ClinicalDocumentationLayout';
import { 
  ClinicalDocument,
  FormValues,
} from '../lib/documentationTypes';
import { 
  OASIS_E_SOC_TEMPLATE,
  OASIS_E_ROC_TEMPLATE,
  OASIS_E_FOLLOWUP_TEMPLATE,
  OASIS_E_DISCHARGE_TEMPLATE 
} from '../lib/oasisTemplates';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, 
  FileText, 
  UserPlus, 
  RotateCcw, 
  Calendar,
  Send,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

type OasisAssessmentType = 'soc' | 'roc' | 'followup' | 'discharge';

// Mock OASIS Assessment Document
const MOCK_OASIS_DOCUMENT: ClinicalDocument = {
  id: 'oasis-soc-2026-03-09-001',
  documentType: 'oasis_e_soc',
  documentCategory: 'assessment',
  
  patientId: 'pat-99888',
  patientName: 'Dorothy Williams',
  admissionId: 'adm-55443',
  admissionStartDate: '2026-03-09',
  admissionType: 'home_health',
  
  status: 'in_progress',
  signatureStatus: 'unsigned',
  
  createdBy: 'user-rn-005',
  createdByName: 'Maria Santos',
  createdByRole: 'Registered Nurse',
  createdByCredentials: 'RN, BSN',
  
  documentDate: '2026-03-09',
  createdAt: '2026-03-09T08:00:00Z',
  updatedAt: '2026-03-09T08:45:00Z',
  
  completionPercentage: 25,
  sectionProgress: {},
  
  validationErrors: [],
  validationWarnings: [],
  isValid: false,
  
  values: {
    m0010_medicare_number: '1AB2CD3EF45',
    m0030_soc_date: '2026-03-09',
    m0040_patient_name: 'Dorothy Williams',
    m0050_patient_id: 'PAT-99888',
    m0060_dob: '1945-06-15',
    m0063_gender: '2',
    m0090_assessment_date: '2026-03-09',
    m0100_reason_for_assessment: '01',
  },
  
  cosignRequired: false,
};

export default function OasisAssessmentWorkspace() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<OasisAssessmentType>('soc');
  const [showingEditor, setShowingEditor] = useState(false);

  const getTemplateForType = () => {
    switch (selectedType) {
      case 'soc':
        return OASIS_E_SOC_TEMPLATE;
      case 'roc':
        return OASIS_E_ROC_TEMPLATE;
      case 'followup':
        return OASIS_E_FOLLOWUP_TEMPLATE;
      case 'discharge':
        return OASIS_E_DISCHARGE_TEMPLATE;
    }
  };

  const getDocumentForType = (): ClinicalDocument => {
    const baseDoc = { ...MOCK_OASIS_DOCUMENT };
    switch (selectedType) {
      case 'roc':
        return {
          ...baseDoc,
          id: 'oasis-roc-2026-03-09-001',
          documentType: 'oasis_e_roc',
          values: {
            ...baseDoc.values,
            m0100_reason_for_assessment: '03',
            m0032_roc_date: '2026-03-09',
          }
        };
      case 'followup':
        return {
          ...baseDoc,
          id: 'oasis-followup-2026-03-09-001',
          documentType: 'oasis_e_followup',
          values: {
            ...baseDoc.values,
            m0100_reason_for_assessment: '04',
          }
        };
      case 'discharge':
        return {
          ...baseDoc,
          id: 'oasis-discharge-2026-03-09-001',
          documentType: 'oasis_e_discharge',
          values: {
            ...baseDoc.values,
            m0100_reason_for_assessment: '09',
            m0104_discharge_date: '2026-03-09',
          }
        };
      default:
        return baseDoc;
    }
  };

  const handleSave = async (values: FormValues) => {
    console.log('Saving OASIS assessment:', values);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleSubmit = async (values: FormValues) => {
    console.log('Submitting OASIS assessment:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('OASIS assessment submitted successfully!');
  };

  const handleSign = async (values: FormValues) => {
    console.log('Signing OASIS assessment:', values);
    await new Promise(resolve => setTimeout(resolve, 800));
    alert('OASIS assessment signed successfully!');
  };

  const renderSectionContent = (
    sectionId: string,
    values: FormValues,
    onChange: (updates: Partial<FormValues>) => void
  ) => {
    const template = getTemplateForType();
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return null;

    return (
      <div className="space-y-6">
        {section.fields.map(field => {
          // Skip logic: hide certain fields based on other values
          if (field.id === 'm0032_roc_date' && values.m0100_reason_for_assessment !== '03') {
            return null;
          }
          if (field.id === 'm0104_discharge_date' && !['09', '08'].includes(values.m0100_reason_for_assessment as string)) {
            return null;
          }
          if (field.id === 'm2002_medication_followup' && values.m2000_drug_regimen_review !== '1') {
            return null;
          }
          if (field.id === 'm1005_inpatient_discharge_date' && values.m1000_inpatient_facility === 'na') {
            return null;
          }

          return (
            <div key={field.id} id={`field-${field.id}`} className="space-y-2">
              <Label htmlFor={field.id} className="flex items-center gap-2 font-medium">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>

              {field.type === 'text' && (
                <Input
                  id={field.id}
                  type="text"
                  value={values[field.id] as string || ''}
                  onChange={(e) => onChange({ [field.id]: e.target.value })}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  className="max-w-lg"
                />
              )}

              {field.type === 'number' && (
                <Input
                  id={field.id}
                  type="number"
                  value={values[field.id] as number || ''}
                  onChange={(e) => onChange({ [field.id]: parseFloat(e.target.value) || 0 })}
                  min={field.min}
                  max={field.max}
                  className="max-w-xs"
                />
              )}

              {field.type === 'date' && (
                <Input
                  id={field.id}
                  type="date"
                  value={values[field.id] as string || ''}
                  onChange={(e) => onChange({ [field.id]: e.target.value })}
                  className="max-w-xs"
                />
              )}

              {field.type === 'textarea' && (
                <Textarea
                  id={field.id}
                  value={values[field.id] as string || ''}
                  onChange={(e) => onChange({ [field.id]: e.target.value })}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  rows={4}
                  className="max-w-2xl"
                />
              )}

              {field.type === 'select' && field.options && (
                <Select
                  value={values[field.id] as string || ''}
                  onValueChange={(value) => onChange({ [field.id]: value })}
                >
                  <SelectTrigger id={field.id} className="max-w-2xl">
                    <SelectValue placeholder={`Select ${field.label}`} />
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

              {field.type === 'checkbox' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={values[field.id] as boolean || false}
                    onCheckedChange={(checked) => onChange({ [field.id]: checked })}
                  />
                  <Label htmlFor={field.id} className="font-normal cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              )}

              {field.helpText && (
                <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (showingEditor) {
    return (
      <ClinicalDocumentationLayout
        document={getDocumentForType()}
        template={getTemplateForType()}
        onSave={handleSave}
        onSubmit={handleSubmit}
        onSign={handleSign}
        renderSectionContent={renderSectionContent}
        autoSaveIntervalMs={30000}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                OASIS-E Assessment
              </h1>
              <p className="text-sm text-gray-600">
                CMS-mandated Outcome and Assessment Information Set
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* CMS Requirement Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>CMS Regulatory Requirement</AlertTitle>
          <AlertDescription>
            OASIS-E assessments must be completed according to CMS guidelines. All required items must be answered.
            Assessment must be signed by RN within regulatory timeframe.
          </AlertDescription>
        </Alert>

        {/* Assessment Type Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Select Assessment Type
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AssessmentTypeButton
              icon={<UserPlus className="w-8 h-8 text-blue-600" />}
              title="Start of Care"
              description="Initial admission"
              code="M0100: 01"
              timeframe="Within 5 days of SOC"
              selected={selectedType === 'soc'}
              onClick={() => setSelectedType('soc')}
            />

            <AssessmentTypeButton
              icon={<RotateCcw className="w-8 h-8 text-green-600" />}
              title="Resumption of Care"
              description="After inpatient stay"
              code="M0100: 03"
              timeframe="Within 2 days of ROC"
              selected={selectedType === 'roc'}
              onClick={() => setSelectedType('roc')}
            />

            <AssessmentTypeButton
              icon={<Calendar className="w-8 h-8 text-purple-600" />}
              title="Follow-Up"
              description="Recertification"
              code="M0100: 04"
              timeframe="Every 60 days"
              selected={selectedType === 'followup'}
              onClick={() => setSelectedType('followup')}
            />

            <AssessmentTypeButton
              icon={<LogOut className="w-8 h-8 text-orange-600" />}
              title="Discharge"
              description="End of care"
              code="M0100: 09"
              timeframe="Within 2 days of discharge"
              selected={selectedType === 'discharge'}
              onClick={() => setSelectedType('discharge')}
            />
          </div>
        </Card>

        {/* Template Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {getTemplateForType().name}
          </h2>
          
          <p className="text-gray-700 mb-6">
            {getTemplateForType().description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Sections</div>
              <div className="text-2xl font-bold text-gray-900">
                {getTemplateForType().sections.length}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Total Items</div>
              <div className="text-2xl font-bold text-gray-900">
                {getTemplateForType().sections.reduce((sum, s) => sum + s.fields.length, 0)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Est. Time</div>
              <div className="text-2xl font-bold text-gray-900">
                {getTemplateForType().estimatedTimeMinutes} min
              </div>
            </div>
          </div>

          {/* Sections Preview */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Assessment Sections</h3>
            <div className="space-y-2">
              {getTemplateForType().sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{section.title}</div>
                      <div className="text-sm text-gray-600">{section.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {section.fields.length} items
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <Button
              size="lg"
              onClick={() => setShowingEditor(true)}
              className="px-8"
            >
              <FileText className="w-4 h-4 mr-2" />
              Open OASIS Assessment
            </Button>
          </div>
        </Card>

        {/* Key Features */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            OASIS-E Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Assessment Capabilities
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span>Section-based navigation sidebar for quick access</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span>Real-time progress indicator showing completion percentage</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span>Conditional skip logic (fields show/hide based on responses)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span>Auto-save every 30 seconds</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Validation & Compliance
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                  <span>Real-time validation highlighting missing required fields</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                  <span>CMS response code validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                  <span>Timeframe compliance checking (e.g., SOC within 5 days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                  <span>Electronic signature with audit trail</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Status Workflow */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Assessment Status Workflow
          </h2>

          <div className="flex items-center gap-3 mb-6">
            <StatusBadge status="draft" label="Draft" icon={<FileText className="w-4 h-4" />} />
            <div className="text-gray-400">→</div>
            <StatusBadge status="in_progress" label="In Progress" icon={<Clock className="w-4 h-4" />} />
            <div className="text-gray-400">→</div>
            <StatusBadge status="ready_to_sign" label="Completed" icon={<CheckCircle2 className="w-4 h-4" />} />
            <div className="text-gray-400">→</div>
            <StatusBadge status="signed" label="Submitted" icon={<Send className="w-4 h-4" />} />
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Draft:</strong> Initial save, work can be resumed later</p>
            <p><strong>In Progress:</strong> Assessment being actively worked on (less than 100% complete)</p>
            <p><strong>Completed:</strong> All required fields filled, ready for signature (100% complete)</p>
            <p><strong>Submitted:</strong> Electronically signed by RN, locked and ready for transmission to CMS</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

interface AssessmentTypeButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  code: string;
  timeframe: string;
  selected: boolean;
  onClick: () => void;
}

function AssessmentTypeButton({
  icon,
  title,
  description,
  code,
  timeframe,
  selected,
  onClick
}: AssessmentTypeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-6 border-2 rounded-lg text-left transition-all
        ${selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
    >
      <div className="mb-4">{icon}</div>
      <h3 className={`font-semibold mb-1 ${selected ? 'text-blue-700' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-2">
        {description}
      </p>
      <div className="space-y-1 text-xs text-gray-500">
        <div className="font-mono">{code}</div>
        <div>{timeframe}</div>
      </div>
    </button>
  );
}

interface StatusBadgeProps {
  status: string;
  label: string;
  icon: React.ReactNode;
}

function StatusBadge({ status, label, icon }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ready_to_sign':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'signed':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getStatusColor()}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}
