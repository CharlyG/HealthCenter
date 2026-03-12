/**
 * Clinical Documentation Architecture Demo
 * 
 * Demonstrates the complete clinical documentation system with:
 * - Document Header
 * - Section Navigation
 * - Progress Tracking
 * - Validation Panel
 * - All three documentation categories
 */

import { useState, useMemo } from 'react';
import { ClinicalDocumentationLayout } from '../components/documentation/ClinicalDocumentationLayout';
import { 
  ClinicalDocument, 
  DocumentTemplate,
  FormValues,
  FormSectionDef,
  DocumentCategory,
  DocumentType
} from '../lib/documentationTypes';
import { SKILLED_NURSING_DOCUMENT_TEMPLATE } from '../lib/documentationTemplates';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Button } from '../components/ui/button';
import { ArrowLeft, FileText, ClipboardList, FileSignature } from 'lucide-react';
import { useNavigate } from 'react-router';

// Mock document data
const MOCK_DOCUMENT: ClinicalDocument = {
  id: 'doc-2026-03-09-001',
  documentType: 'skilled_nursing_visit',
  documentCategory: 'visit',
  
  patientId: 'pat-12345',
  patientName: 'Margaret Thompson',
  admissionId: 'adm-67890',
  admissionStartDate: '2026-02-15',
  admissionType: 'home_health',
  
  status: 'in_progress',
  signatureStatus: 'unsigned',
  
  createdBy: 'user-nurse-001',
  createdByName: 'Sarah Martinez',
  createdByRole: 'Registered Nurse',
  createdByCredentials: 'RN, BSN',
  
  documentDate: '2026-03-09',
  createdAt: '2026-03-09T09:00:00Z',
  updatedAt: '2026-03-09T09:15:00Z',
  
  completionPercentage: 35,
  sectionProgress: {},
  
  validationErrors: [],
  validationWarnings: [],
  isValid: false,
  
  values: {
    visit_date: '2026-03-09',
    visit_time_in: '09:00',
    visit_time_out: '10:30',
    visit_type: 'routine',
    systolic_bp: 128,
    diastolic_bp: 82,
    heart_rate: 76,
    respiratory_rate: 16,
    temperature: 98.4,
    spo2: 97,
  },
  
  cosignRequired: false,
  
  visitId: 'visit-2026-03-09-001',
  visitStartTime: '2026-03-09T09:00:00Z',
  visitEndTime: '2026-03-09T10:30:00Z',
  visitDurationMinutes: 90,
};

export default function ClinicalDocumentationArchitectureDemo() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<'visit' | 'assessment' | 'episode'>('visit');
  const [showingDemo, setShowingDemo] = useState(false);

  const handleSave = async (values: FormValues) => {
    console.log('Saving document:', values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleSubmit = async (values: FormValues) => {
    console.log('Submitting document:', values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Document submitted successfully!');
  };

  const handleSign = async (values: FormValues) => {
    console.log('Signing document:', values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    alert('Document signed successfully!');
  };

  const renderSectionContent = (
    sectionId: string, 
    values: FormValues, 
    onChange: (updates: Partial<FormValues>) => void
  ) => {
    const section = SKILLED_NURSING_DOCUMENT_TEMPLATE.sections.find(s => s.id === sectionId);
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

  if (showingDemo) {
    return (
      <ClinicalDocumentationLayout
        document={MOCK_DOCUMENT}
        template={SKILLED_NURSING_DOCUMENT_TEMPLATE}
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
                Clinical Documentation Architecture
              </h1>
              <p className="text-sm text-gray-600">
                Comprehensive documentation system for home health and hospice
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Overview */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Architecture Overview
          </h2>
          <p className="text-gray-700 mb-4">
            This documentation system supports three categories of clinical documentation, 
            all associated with a patient admission. Each document includes a comprehensive 
            header, section navigation, progress tracking, and validation panel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <DocumentCategoryCard
              icon={<FileText className="w-8 h-8 text-blue-600" />}
              title="Visit Documentation"
              description="Documentation created during patient visits"
              examples={[
                'Skilled Nursing Visits',
                'Therapy Visits (PT/OT/ST)',
                'Social Work Visits',
                'Aide Supervisory Visits'
              ]}
              selected={selectedCategory === 'visit'}
              onClick={() => setSelectedCategory('visit')}
            />

            <DocumentCategoryCard
              icon={<ClipboardList className="w-8 h-8 text-green-600" />}
              title="Assessment Documentation"
              description="Structured clinical assessments"
              examples={[
                'OASIS-E (SOC, ROC, DC)',
                'HOPE (Admission, DC)',
                'Comprehensive Assessments',
                'Risk Assessments'
              ]}
              selected={selectedCategory === 'assessment'}
              onClick={() => setSelectedCategory('assessment')}
            />

            <DocumentCategoryCard
              icon={<FileSignature className="w-8 h-8 text-purple-600" />}
              title="Episode Documentation"
              description="Documents for entire episode of care"
              examples={[
                'Plan of Care',
                'Physician Orders',
                'Recertification',
                'Discharge Summaries'
              ]}
              selected={selectedCategory === 'episode'}
              onClick={() => setSelectedCategory('episode')}
            />
          </div>
        </Card>

        {/* Key Features */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureSection
              title="Document Header"
              description="Shows patient info, admission details, document type, clinician, status, and signatures"
              features={[
                'Patient name and admission context',
                'Document status badges',
                'Signature status tracking',
                'Validation summary',
                'Completion percentage',
                'Lock status indicator'
              ]}
            />

            <FeatureSection
              title="Section Navigation"
              description="Quick navigation with visual progress indicators"
              features={[
                'Section list with descriptions',
                'Progress bars per section',
                'Required field tracking',
                'Error highlighting',
                'Three responsive variants',
                'Click to jump to section'
              ]}
            />

            <FeatureSection
              title="Progress Tracker"
              description="Visual completion tracking throughout the document"
              features={[
                'Overall completion percentage',
                'Section-by-section breakdown',
                'Required vs total fields',
                'Real-time updates',
                'Color-coded status'
              ]}
            />

            <FeatureSection
              title="Validation Panel"
              description="Comprehensive error and warning display"
              features={[
                'Grouped by section',
                'Errors must be resolved',
                'Warnings can be overridden',
                'Missing required fields list',
                'Click to navigate to field',
                'Real-time validation'
              ]}
            />
          </div>
        </Card>

        {/* Demo Button */}
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Try the Interactive Demo
            </h2>
            <p className="text-gray-600 mb-6">
              Experience the complete clinical documentation system with a sample skilled nursing visit note
            </p>
            <Button
              size="lg"
              onClick={() => setShowingDemo(true)}
              className="px-8"
            >
              <FileText className="w-5 h-5 mr-2" />
              Launch Documentation Demo
            </Button>
          </div>
        </Card>

        {/* Technical Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Technical Architecture
          </h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Core Components</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">DocumentHeader.tsx</code> - Comprehensive document header</li>
                <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">DocumentSectionNavigator.tsx</code> - Section navigation sidebar</li>
                <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">ValidationPanel.tsx</code> - Validation errors and warnings</li>
                <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">ClinicalDocumentationLayout.tsx</code> - Master layout component</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Type Definitions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">documentationTypes.ts</code> - Complete type system</li>
                <li><code className="text-xs bg-gray-100 px-1 py-0.5 rounded">documentationTemplates.ts</code> - Template definitions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Auto-save every 30 seconds (configurable)</li>
                <li>Real-time validation as fields are filled</li>
                <li>Mobile-responsive with collapsible navigation</li>
                <li>Memoized components for performance</li>
                <li>Offline mode support (when integrated with OfflineModeProvider)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

interface DocumentCategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
  selected: boolean;
  onClick: () => void;
}

function DocumentCategoryCard({ 
  icon, 
  title, 
  description, 
  examples,
  selected,
  onClick 
}: DocumentCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-4 border-2 rounded-lg text-left transition-all
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="space-y-1">
        {examples.map((example, idx) => (
          <div key={idx} className="text-xs text-gray-500 flex items-center gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            {example}
          </div>
        ))}
      </div>
    </button>
  );
}

interface FeatureSectionProps {
  title: string;
  description: string;
  features: string[];
}

function FeatureSection({ title, description, features }: FeatureSectionProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <ul className="space-y-1">
        {features.map((feature, idx) => (
          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}