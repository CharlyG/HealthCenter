/**
 * Speech Therapy Module Demo
 * 
 * Demonstrates the complete ST clinical documentation system with
 * ST Evaluation, Visit Note, Progress Note, and Discharge Summary
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClinicalDocumentationLayout } from '../components/documentation/ClinicalDocumentationLayout';
import { 
  ClinicalDocument,
  FormValues,
} from '../lib/documentationTypes';
import { 
  ST_EVALUATION_TEMPLATE,
  ST_VISIT_NOTE_TEMPLATE,
  ST_PROGRESS_NOTE_TEMPLATE,
  ST_DISCHARGE_SUMMARY_TEMPLATE 
} from '../lib/speechTherapyTemplates';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Mic, Brain, Utensils, MessageSquare, FileText, TrendingUp, CheckCircle } from 'lucide-react';

// Mock ST Evaluation Document
const MOCK_ST_EVAL_DOCUMENT: ClinicalDocument = {
  id: 'st-eval-2026-03-09-001',
  documentType: 'speech_therapy_evaluation',
  documentCategory: 'visit',
  
  patientId: 'pat-67890',
  patientName: 'William Rodriguez',
  admissionId: 'adm-11223',
  admissionStartDate: '2026-02-20',
  admissionType: 'home_health',
  
  status: 'in_progress',
  signatureStatus: 'unsigned',
  
  createdBy: 'user-st-001',
  createdByName: 'Jennifer Lee',
  createdByRole: 'Speech-Language Pathologist',
  createdByCredentials: 'MS, CCC-SLP',
  
  documentDate: '2026-03-09',
  createdAt: '2026-03-09T09:00:00Z',
  updatedAt: '2026-03-09T09:30:00Z',
  
  completionPercentage: 35,
  sectionProgress: {},
  
  validationErrors: [],
  validationWarnings: [],
  isValid: false,
  
  values: {
    eval_date: '2026-03-09',
    referral_diagnosis: 'Dysphagia post-CVA, expressive aphasia',
    date_of_onset: '2026-02-18',
    dysphagia_present: 'yes',
    aspiration_risk: 'moderate',
    current_diet: 'minced_moist',
    liquid_consistency: 'nectar',
    fois_level: '5',
    aphasia_type: 'brocas',
  },
  
  cosignRequired: false,
  
  visitId: 'visit-2026-03-09-001',
  visitStartTime: '2026-03-09T09:00:00Z',
  visitEndTime: '2026-03-09T10:30:00Z',
  visitDurationMinutes: 90,
};

export default function SpeechTherapyModuleDemo() {
  const navigate = useNavigate();
  const [selectedDocType, setSelectedDocType] = useState<'evaluation' | 'visit' | 'progress' | 'discharge'>('evaluation');
  const [showingEditor, setShowingEditor] = useState(false);

  const getTemplateForType = () => {
    switch (selectedDocType) {
      case 'evaluation':
        return ST_EVALUATION_TEMPLATE;
      case 'visit':
        return ST_VISIT_NOTE_TEMPLATE;
      case 'progress':
        return ST_PROGRESS_NOTE_TEMPLATE;
      case 'discharge':
        return ST_DISCHARGE_SUMMARY_TEMPLATE;
    }
  };

  const getDocumentForType = (): ClinicalDocument => {
    const baseDoc = { ...MOCK_ST_EVAL_DOCUMENT };
    switch (selectedDocType) {
      case 'visit':
        return {
          ...baseDoc,
          id: 'st-visit-2026-03-09-001',
          documentType: 'speech_therapy_visit',
          values: {
            visit_date: '2026-03-09',
            visit_time_in: '14:00',
            visit_time_out: '15:00',
            visit_number: 4,
          }
        };
      case 'progress':
        return {
          ...baseDoc,
          id: 'st-progress-2026-03-09-001',
          documentType: 'speech_therapy_progress_note',
          values: {
            note_date: '2026-03-09',
            period_start: '2026-02-20',
            visits_completed: 10,
          }
        };
      case 'discharge':
        return {
          ...baseDoc,
          id: 'st-discharge-2026-03-09-001',
          documentType: 'speech_therapy_discharge',
          values: {
            discharge_date: '2026-03-09',
            admission_date: '2026-02-20',
            total_visits: 14,
          }
        };
      default:
        return baseDoc;
    }
  };

  const handleSave = async (values: FormValues) => {
    console.log('Saving ST document:', values);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleSubmit = async (values: FormValues) => {
    console.log('Submitting ST document:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('ST document submitted successfully!');
  };

  const handleSign = async (values: FormValues) => {
    console.log('Signing ST document:', values);
    await new Promise(resolve => setTimeout(resolve, 800));
    alert('ST document signed successfully!');
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
                Speech Therapy Module Demo
              </h1>
              <p className="text-sm text-gray-600">
                Comprehensive ST clinical documentation system
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
              icon={<Brain className="w-8 h-8 text-purple-600" />}
              title="ST Evaluation"
              description="Initial assessment"
              sections={6}
              fields={55}
              time="90 min"
              selected={selectedDocType === 'evaluation'}
              onClick={() => setSelectedDocType('evaluation')}
            />

            <DocumentTypeButton
              icon={<FileText className="w-8 h-8 text-blue-600" />}
              title="ST Visit Note"
              description="Routine visit"
              sections={5}
              fields={20}
              time="30 min"
              selected={selectedDocType === 'visit'}
              onClick={() => setSelectedDocType('visit')}
            />

            <DocumentTypeButton
              icon={<TrendingUp className="w-8 h-8 text-green-600" />}
              title="ST Progress Note"
              description="Periodic progress"
              sections={4}
              fields={18}
              time="45 min"
              selected={selectedDocType === 'progress'}
              onClick={() => setSelectedDocType('progress')}
            />

            <DocumentTypeButton
              icon={<CheckCircle className="w-8 h-8 text-teal-600" />}
              title="ST Discharge"
              description="Final summary"
              sections={5}
              fields={20}
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
                    <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
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
              <h4 className="font-semibold text-gray-900 mb-3">Assessment Areas</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-600 shrink-0" />
                  <span><strong>Speech:</strong> Articulation, voice quality, fluency, intelligibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-orange-600 shrink-0" />
                  <span><strong>Swallowing:</strong> Dysphagia evaluation, FOIS, aspiration risk</span>
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span><strong>Cognition:</strong> Memory, attention, problem-solving, executive function</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><strong>Language:</strong> Comprehension, expression, aphasia, AAC needs</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Clinical Features</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0" />
                  <span>FOIS (Functional Oral Intake Scale) tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0" />
                  <span>Aspiration risk assessment and diet recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0" />
                  <span>Aphasia type classification and language testing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0" />
                  <span>AAC device recommendations and training</span>
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
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
    >
      <div className="mb-4">{icon}</div>
      <h3 className={`font-semibold mb-1 ${selected ? 'text-purple-700' : 'text-gray-900'}`}>
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
