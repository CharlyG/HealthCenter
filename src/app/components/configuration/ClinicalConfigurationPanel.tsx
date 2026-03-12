/**
 * Clinical Configuration Panel
 * 
 * Configure clinical workflows including disciplines, assessment types,
 * documentation fields, care plan templates, and visit note templates.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Stethoscope,
  FileText,
  ClipboardCheck,
  Plus,
  CheckCircle,
  XCircle,
  Edit,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Discipline {
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  associatedModules: string[];
  requiredCredentials: string[];
}

interface AssessmentType {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  disciplines: string[];
}

interface ClinicalConfigurationPanelProps {
  onConfigChange: () => void;
}

export default function ClinicalConfigurationPanel({
  onConfigChange,
}: ClinicalConfigurationPanelProps) {
  const [disciplines, setDisciplines] = useState<Discipline[]>([
    {
      code: 'SN',
      name: 'Skilled Nursing',
      description: 'RN and LPN nursing care',
      enabled: true,
      associatedModules: ['Skilled Nursing Visit Notes', 'Nursing Assessment', 'Medication Management'],
      requiredCredentials: ['RN License', 'CPR Certification'],
    },
    {
      code: 'PT',
      name: 'Physical Therapy',
      description: 'Physical rehabilitation and therapy',
      enabled: true,
      associatedModules: ['PT Evaluation', 'PT Visit Notes', 'Mobility Assessment'],
      requiredCredentials: ['PT License', 'CPR Certification'],
    },
    {
      code: 'OT',
      name: 'Occupational Therapy',
      description: 'Activities of daily living and functional therapy',
      enabled: true,
      associatedModules: ['OT Evaluation', 'OT Visit Notes', 'ADL Assessment'],
      requiredCredentials: ['OT License', 'CPR Certification'],
    },
    {
      code: 'ST',
      name: 'Speech Therapy',
      description: 'Speech and language pathology',
      enabled: true,
      associatedModules: ['ST Evaluation', 'ST Visit Notes', 'Swallowing Assessment'],
      requiredCredentials: ['SLP License', 'CPR Certification'],
    },
    {
      code: 'MSW',
      name: 'Medical Social Work',
      description: 'Psychosocial assessment and counseling',
      enabled: true,
      associatedModules: ['MSW Visit Notes', 'Psychosocial Assessment'],
      requiredCredentials: ['MSW License'],
    },
    {
      code: 'HHA',
      name: 'Home Health Aide',
      description: 'Personal care and assistance',
      enabled: true,
      associatedModules: ['HHA Visit Notes', 'Personal Care Documentation'],
      requiredCredentials: ['HHA Certification', 'CPR Certification'],
    },
  ]);

  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([
    {
      id: 'oasis-e',
      name: 'OASIS-E',
      description: 'Outcome and Assessment Information Set for home health',
      enabled: true,
      disciplines: ['SN', 'PT', 'OT', 'ST'],
    },
    {
      id: 'functional-assessment',
      name: 'Functional Assessment',
      description: 'Activities of daily living and functional status',
      enabled: true,
      disciplines: ['PT', 'OT', 'HHA'],
    },
    {
      id: 'fall-risk',
      name: 'Fall Risk Assessment',
      description: 'Patient fall risk screening and prevention',
      enabled: true,
      disciplines: ['SN', 'PT', 'OT'],
    },
    {
      id: 'pain-assessment',
      name: 'Pain Assessment',
      description: 'Comprehensive pain evaluation and management',
      enabled: true,
      disciplines: ['SN', 'PT'],
    },
    {
      id: 'wound-assessment',
      name: 'Wound Assessment',
      description: 'Wound evaluation and healing progress',
      enabled: true,
      disciplines: ['SN'],
    },
    {
      id: 'nutritional',
      name: 'Nutritional Assessment',
      description: 'Diet, nutrition, and weight monitoring',
      enabled: false,
      disciplines: ['SN', 'MSW'],
    },
  ]);

  const handleDisciplineToggle = (code: string) => {
    setDisciplines(
      disciplines.map((d) => (d.code === code ? { ...d, enabled: !d.enabled } : d))
    );
    onConfigChange();
  };

  const handleAssessmentToggle = (id: string) => {
    setAssessmentTypes(
      assessmentTypes.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
    onConfigChange();
  };

  return (
    <Tabs defaultValue="disciplines" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="disciplines">Disciplines</TabsTrigger>
        <TabsTrigger value="assessments">Assessment Types</TabsTrigger>
        <TabsTrigger value="documentation">Documentation Fields</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
      </TabsList>

      {/* Disciplines Tab */}
      <TabsContent value="disciplines">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Disciplines
                </h3>
                <p className="text-sm text-gray-600">
                  Configure which clinical disciplines are available in your agency
                </p>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Discipline
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {disciplines.map((discipline) => (
                <DisciplineCard
                  key={discipline.code}
                  discipline={discipline}
                  onToggle={() => handleDisciplineToggle(discipline.code)}
                />
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Discipline Configuration Impact</p>
              <p>
                Enabled disciplines will appear in scheduling, documentation modules, and credential
                requirements. Disabling a discipline will hide it from all workflows.
              </p>
            </div>
          </Card>
        </div>
      </TabsContent>

      {/* Assessment Types Tab */}
      <TabsContent value="assessments">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-green-600" />
                  Assessment Types
                </h3>
                <p className="text-sm text-gray-600">
                  Configure which assessment types are available for clinical documentation
                </p>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Assessment
              </Button>
            </div>

            <div className="space-y-3">
              {assessmentTypes.map((assessment) => (
                <AssessmentTypeCard
                  key={assessment.id}
                  assessment={assessment}
                  onToggle={() => handleAssessmentToggle(assessment.id)}
                />
              ))}
            </div>
          </Card>
        </div>
      </TabsContent>

      {/* Documentation Fields Tab */}
      <TabsContent value="documentation">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Required Documentation Fields
          </h3>
          <div className="space-y-4">
            <DocumentationFieldRow label="Vital Signs" required={true} />
            <DocumentationFieldRow label="Allergies" required={true} />
            <DocumentationFieldRow label="Medications Reviewed" required={true} />
            <DocumentationFieldRow label="Patient Education" required={false} />
            <DocumentationFieldRow label="Care Plan Review" required={true} />
            <DocumentationFieldRow label="Fall Risk Screening" required={false} />
            <DocumentationFieldRow label="Pain Assessment" required={false} />
            <DocumentationFieldRow label="Wound Assessment" required={false} />
          </div>
        </Card>
      </TabsContent>

      {/* Templates Tab */}
      <TabsContent value="templates">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Plan Templates</h3>
            <div className="space-y-3">
              <TemplateRow name="Post-Surgical Care" status="active" />
              <TemplateRow name="Diabetes Management" status="active" />
              <TemplateRow name="CHF Monitoring" status="active" />
              <TemplateRow name="Fall Prevention" status="active" />
              <TemplateRow name="Wound Care" status="draft" />
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              New Care Plan Template
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Note Templates</h3>
            <div className="space-y-3">
              <TemplateRow name="SN Routine Visit" status="active" />
              <TemplateRow name="PT Evaluation" status="active" />
              <TemplateRow name="OT Evaluation" status="active" />
              <TemplateRow name="ST Evaluation" status="active" />
              <TemplateRow name="MSW Initial Visit" status="active" />
              <TemplateRow name="HHA Personal Care" status="draft" />
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              New Visit Note Template
            </Button>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCIPLINE CARD
// ═══════════════════════════════════════════════════════════════════════════

function DisciplineCard({
  discipline,
  onToggle,
}: {
  discipline: Discipline;
  onToggle: () => void;
}) {
  return (
    <Card
      className={cn(
        'p-4',
        discipline.enabled ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="font-mono text-xs">
              {discipline.code}
            </Badge>
            <h4 className="font-medium text-gray-900">{discipline.name}</h4>
            {discipline.enabled ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{discipline.description}</p>
        </div>
      </div>

      <div className="text-xs text-gray-600 mb-3">
        <div className="font-medium mb-1">Associated Modules:</div>
        <ul className="list-disc list-inside space-y-0.5">
          {discipline.associatedModules.map((mod) => (
            <li key={mod}>{mod}</li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <Label className="text-xs text-gray-700">Enable Discipline</Label>
        <Switch checked={discipline.enabled} onCheckedChange={onToggle} />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT TYPE CARD
// ═══════════════════════════════════════════════════════════════════════════

function AssessmentTypeCard({
  assessment,
  onToggle,
}: {
  assessment: AssessmentType;
  onToggle: () => void;
}) {
  return (
    <Card
      className={cn(
        'p-4',
        assessment.enabled ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900">{assessment.name}</h4>
            {assessment.enabled ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-gray-600">Available for:</span>
            {assessment.disciplines.map((disc) => (
              <Badge key={disc} variant="outline" className="text-xs font-mono">
                {disc}
              </Badge>
            ))}
          </div>
        </div>
        <Switch checked={assessment.enabled} onCheckedChange={onToggle} />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTATION FIELD ROW
// ═══════════════════════════════════════════════════════════════════════════

function DocumentationFieldRow({ label, required }: { label: string; required: boolean }) {
  const [isRequired, setIsRequired] = useState(required);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <Label className="text-sm text-gray-900">{label}</Label>
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            isRequired
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-gray-100 text-gray-700 border-gray-300'
          )}
        >
          {isRequired ? 'Required' : 'Optional'}
        </Badge>
        <Switch checked={isRequired} onCheckedChange={setIsRequired} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE ROW
// ═══════════════════════════════════════════════════════════════════════════

function TemplateRow({ name, status }: { name: string; status: 'active' | 'draft' }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-900">{name}</span>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            status === 'active'
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-gray-100 text-gray-700 border-gray-300'
          )}
        >
          {status}
        </Badge>
        <Button variant="ghost" size="sm">
          <Edit className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
