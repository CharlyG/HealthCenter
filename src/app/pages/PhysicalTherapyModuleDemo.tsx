/**
 * Physical Therapy Module Demo
 * 
 * Demonstrates the complete PT clinical documentation system with
 * PT Evaluation, Visit Note, Progress Note, and Discharge Summary
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClinicalDocumentationLayout } from '../components/documentation/ClinicalDocumentationLayout';
import { 
  ClinicalDocument,
  FormValues,
} from '../lib/documentationTypes';
import { 
  PT_EVALUATION_TEMPLATE,
  PT_VISIT_NOTE_TEMPLATE,
  PT_PROGRESS_NOTE_TEMPLATE,
  PT_DISCHARGE_SUMMARY_TEMPLATE 
} from '../lib/physicalTherapyTemplates';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Activity, FileText, TrendingUp, CheckCircle } from 'lucide-react';

// Mock PT Evaluation Document
const MOCK_PT_EVAL_DOCUMENT: ClinicalDocument = {
  id: 'pt-eval-2026-03-09-001',
  documentType: 'physical_therapy_evaluation',
  documentCategory: 'visit',
  
  patientId: 'pat-12345',
  patientName: 'Margaret Thompson',
  admissionId: 'adm-67890',
  admissionStartDate: '2026-02-15',
  admissionType: 'home_health',
  
  status: 'in_progress',
  signatureStatus: 'unsigned',
  
  createdBy: 'user-pt-001',
  createdByName: 'Alex Chen',
  createdByRole: 'Physical Therapist',
  createdByCredentials: 'PT, DPT',
  
  documentDate: '2026-03-09',
  createdAt: '2026-03-09T09:00:00Z',
  updatedAt: '2026-03-09T09:30:00Z',
  
  completionPercentage: 40,
  sectionProgress: {},
  
  validationErrors: [],
  validationWarnings: [],
  isValid: false,
  
  values: {
    eval_date: '2026-03-09',
    referral_diagnosis: 'Status post total knee replacement (TKR) right knee',
    date_of_onset: '2026-02-28',
    ambulation_status: 'min_assist',
    assistive_device: 'walker',
    pain_present: 'yes',
    pain_location: 'Right knee',
    pain_at_rest: 4,
    pain_with_activity: 6,
  },
  
  cosignRequired: false,
  
  visitId: 'visit-2026-03-09-001',
  visitStartTime: '2026-03-09T09:00:00Z',
  visitEndTime: '2026-03-09T10:30:00Z',
  visitDurationMinutes: 90,
};

export default function PhysicalTherapyModuleDemo() {
  const navigate = useNavigate();
  const [selectedDocType, setSelectedDocType] = useState<'evaluation' | 'visit' | 'progress' | 'discharge'>('evaluation');
  const [showingEditor, setShowingEditor] = useState(false);

  const getTemplateForType = () => {
    switch (selectedDocType) {
      case 'evaluation':
        return PT_EVALUATION_TEMPLATE;
      case 'visit':
        return PT_VISIT_NOTE_TEMPLATE;
      case 'progress':
        return PT_PROGRESS_NOTE_TEMPLATE;
      case 'discharge':
        return PT_DISCHARGE_SUMMARY_TEMPLATE;
    }
  };

  const getDocumentForType = (): ClinicalDocument => {
    // For demo, we'll modify the base document for each type
    const baseDoc = { ...MOCK_PT_EVAL_DOCUMENT };
    switch (selectedDocType) {
      case 'visit':
        return {
          ...baseDoc,
          id: 'pt-visit-2026-03-09-001',
          documentType: 'physical_therapy_visit',
          values: {
            visit_date: '2026-03-09',
            visit_time_in: '14:00',
            visit_time_out: '15:00',
            visit_number: 3,
          }
        };
      case 'progress':
        return {
          ...baseDoc,
          id: 'pt-progress-2026-03-09-001',
          documentType: 'physical_therapy_progress_note',
          values: {
            note_date: '2026-03-09',
            period_start: '2026-02-15',
            visits_completed: 8,
          }
        };
      case 'discharge':
        return {
          ...baseDoc,
          id: 'pt-discharge-2026-03-09-001',
          documentType: 'physical_therapy_discharge',
          values: {
            discharge_date: '2026-03-09',
            admission_date: '2026-02-15',
            total_visits: 12,
          }
        };
      default:
        return baseDoc;
    }
  };

  const handleSave = async (values: FormValues) => {
    console.log('Saving PT document:', values);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleSubmit = async (values: FormValues) => {
    console.log('Submitting PT document:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('PT document submitted successfully!');
  };

  const handleSign = async (values: FormValues) => {
    console.log('Signing PT document:', values);
    await new Promise(resolve => setTimeout(resolve, 800));
    alert('PT document signed successfully!');
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
      <div className="space-y-4">
        {section.fields.map(field => (
          <div key={field.id} id={`field-${field.id}`} className="space-y-2">
            <Label htmlFor={field.id} className="flex items-center gap-2">
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
              />
            )}

            {field.type === 'date' && (
              <Input
                id={field.id}
                type="date"
                value={values[field.id] as string || ''}
                onChange={(e) => onChange({ [field.id]: e.target.value })}
              />
            )}

            {field.type === 'time' && (
              <Input
                id={field.id}
                type="time"
                value={values[field.id] as string || ''}
                onChange={(e) => onChange({ [field.id]: e.target.value })}
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
              />
            )}

            {field.type === 'select' && field.options && (
              <Select
                value={values[field.id] as string || ''}
                onValueChange={(value) => onChange({ [field.id]: value })}
              >
                <SelectTrigger id={field.id}>
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
              <p className="text-xs text-gray-500">{field.helpText}</p>
            )}
          </div>
        ))}
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
                Physical Therapy Module Demo
              </h1>
              <p className="text-sm text-gray-600">
                Comprehensive PT clinical documentation system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Document Type Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Select Document Type
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DocumentTypeButton
              icon={<Activity className="w-8 h-8 text-purple-600" />}
              title="PT Evaluation"
              description="Initial assessment"
              sections={6}
              fields={45}
              time="90 min"
              selected={selectedDocType === 'evaluation'}
              onClick={() => setSelectedDocType('evaluation')}
            />

            <DocumentTypeButton
              icon={<FileText className="w-8 h-8 text-blue-600" />}
              title="PT Visit Note"
              description="Routine visit"
              sections={5}
              fields={25}
              time="30 min"
              selected={selectedDocType === 'visit'}
              onClick={() => setSelectedDocType('visit')}
            />

            <DocumentTypeButton
              icon={<TrendingUp className="w-8 h-8 text-green-600" />}
              title="PT Progress Note"
              description="Periodic progress"
              sections={4}
              fields={20}
              time="45 min"
              selected={selectedDocType === 'progress'}
              onClick={() => setSelectedDocType('progress')}
            />

            <DocumentTypeButton
              icon={<CheckCircle className="w-8 h-8 text-teal-600" />}
              title="PT Discharge"
              description="Final summary"
              sections={5}
              fields={22}
              time="60 min"
              selected={selectedDocType === 'discharge'}
              onClick={() => setSelectedDocType('discharge')}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Sections</div>
              <div className="text-2xl font-bold text-gray-900">
                {getTemplateForType().sections.length}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Total Fields</div>
              <div className="text-2xl font-bold text-gray-900">
                {getTemplateForType().sections.reduce((sum, s) => sum + s.fields.length, 0)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Estimated Time</div>
              <div className="text-2xl font-bold text-gray-900">
                {getTemplateForType().estimatedTimeMinutes} min
              </div>
            </div>
          </div>

          {/* Sections Preview */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Document Sections</h3>
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
                    {section.fields.length} fields
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
              Open Documentation Editor
            </Button>
          </div>
        </Card>

        {/* Features */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Key Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Documentation</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span>Structured sections for comprehensive assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span>Required field validation for regulatory compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span>Progress tracking across sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span>Auto-save every 30 seconds</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Clinical Features</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>ROM and MMT documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>Functional assessments (gait, balance, transfers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>Goal setting and progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>Smart phrases for common narratives</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

interface DocumentTypeButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  sections: number;
  fields: number;
  time: string;
  selected: boolean;
  onClick: () => void;
}

function DocumentTypeButton({
  icon,
  title,
  description,
  sections,
  fields,
  time,
  selected,
  onClick
}: DocumentTypeButtonProps) {
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
      <p className="text-sm text-gray-600 mb-3">
        {description}
      </p>
      <div className="space-y-1 text-xs text-gray-500">
        <div>{sections} sections • {fields} fields</div>
        <div>~{time}</div>
      </div>
    </button>
  );
}
