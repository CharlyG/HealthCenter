/**
 * Admission Configuration Panel
 * 
 * Configure admission types, referral sources, default workflows, and required fields.
 * Settings affect the admission intake process.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Edit, Trash2, UserPlus, Building2, Workflow, FileCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdmissionType {
  id: string;
  name: string;
  code: string;
  description: string;
  enabled: boolean;
  defaultWorkflow: string;
}

interface ReferralSource {
  id: string;
  name: string;
  type: 'hospital' | 'physician' | 'facility' | 'self' | 'other';
  contactName?: string;
  contactPhone?: string;
  enabled: boolean;
}

interface WorkflowStep {
  id: string;
  name: string;
  required: boolean;
  assignedRole: string;
}

interface RequiredField {
  id: string;
  fieldName: string;
  section: string;
  required: boolean;
  visible: boolean;
}

interface AdmissionConfigurationPanelProps {
  onConfigChange: () => void;
}

export default function AdmissionConfigurationPanel({
  onConfigChange,
}: AdmissionConfigurationPanelProps) {
  const [admissionTypes, setAdmissionTypes] = useState<AdmissionType[]>([
    {
      id: 'admission',
      name: 'Standard Admission',
      code: 'ADM',
      description: 'Regular home health admission',
      enabled: true,
      defaultWorkflow: 'standard-workflow',
    },
    {
      id: 'readmission',
      name: 'Readmission',
      code: 'READM',
      description: 'Patient returning to service within 60 days',
      enabled: true,
      defaultWorkflow: 'readmission-workflow',
    },
    {
      id: 'recertification',
      name: 'Recertification',
      code: 'RECERT',
      description: 'Continuing care beyond initial certification period',
      enabled: true,
      defaultWorkflow: 'recert-workflow',
    },
    {
      id: 'hospice',
      name: 'Hospice Admission',
      code: 'HOSP',
      description: 'Hospice care admission',
      enabled: false,
      defaultWorkflow: 'hospice-workflow',
    },
  ]);

  const [referralSources, setReferralSources] = useState<ReferralSource[]>([
    {
      id: 'general-hospital',
      name: 'General Hospital',
      type: 'hospital',
      contactName: 'Referral Coordinator',
      contactPhone: '555-0100',
      enabled: true,
    },
    {
      id: 'dr-smith',
      name: 'Dr. John Smith',
      type: 'physician',
      contactPhone: '555-0101',
      enabled: true,
    },
    {
      id: 'skilled-nursing',
      name: 'Sunrise Skilled Nursing Facility',
      type: 'facility',
      contactName: 'Discharge Planner',
      contactPhone: '555-0102',
      enabled: true,
    },
    {
      id: 'self-referral',
      name: 'Self Referral',
      type: 'self',
      enabled: true,
    },
  ]);

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: 'intake', name: 'Initial Intake', required: true, assignedRole: 'Intake Coordinator' },
    { id: 'insurance', name: 'Insurance Verification', required: true, assignedRole: 'Billing Specialist' },
    { id: 'clinical-review', name: 'Clinical Review', required: true, assignedRole: 'Clinical Manager' },
    { id: 'scheduling', name: 'Schedule Start of Care', required: true, assignedRole: 'Scheduler' },
    { id: 'physician-orders', name: 'Obtain Physician Orders', required: true, assignedRole: 'Clinician' },
    { id: 'soc-visit', name: 'Complete SOC Visit', required: true, assignedRole: 'Clinician' },
  ]);

  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([
    { id: 'patient-name', fieldName: 'Patient Name', section: 'Demographics', required: true, visible: true },
    { id: 'dob', fieldName: 'Date of Birth', section: 'Demographics', required: true, visible: true },
    { id: 'ssn', fieldName: 'Social Security Number', section: 'Demographics', required: false, visible: true },
    { id: 'address', fieldName: 'Home Address', section: 'Demographics', required: true, visible: true },
    { id: 'phone', fieldName: 'Phone Number', section: 'Demographics', required: true, visible: true },
    { id: 'emergency-contact', fieldName: 'Emergency Contact', section: 'Demographics', required: true, visible: true },
    { id: 'primary-diagnosis', fieldName: 'Primary Diagnosis', section: 'Clinical', required: true, visible: true },
    { id: 'physician-name', fieldName: 'Referring Physician', section: 'Referral', required: true, visible: true },
    { id: 'insurance-primary', fieldName: 'Primary Insurance', section: 'Insurance', required: true, visible: true },
    { id: 'insurance-secondary', fieldName: 'Secondary Insurance', section: 'Insurance', required: false, visible: true },
  ]);

  const handleToggleAdmissionType = (id: string) => {
    setAdmissionTypes(
      admissionTypes.map((type) => (type.id === id ? { ...type, enabled: !type.enabled } : type))
    );
    onConfigChange();
  };

  const handleToggleReferralSource = (id: string) => {
    setReferralSources(
      referralSources.map((source) =>
        source.id === id ? { ...source, enabled: !source.enabled } : source
      )
    );
    onConfigChange();
  };

  const handleToggleFieldRequired = (id: string) => {
    setRequiredFields(
      requiredFields.map((field) =>
        field.id === id ? { ...field, required: !field.required } : field
      )
    );
    onConfigChange();
  };

  return (
    <Tabs defaultValue="admission-types" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="admission-types">
          <UserPlus className="w-4 h-4 mr-2" />
          Admission Types
        </TabsTrigger>
        <TabsTrigger value="referral-sources">
          <Building2 className="w-4 h-4 mr-2" />
          Referral Sources
        </TabsTrigger>
        <TabsTrigger value="workflows">
          <Workflow className="w-4 h-4 mr-2" />
          Workflows
        </TabsTrigger>
        <TabsTrigger value="required-fields">
          <FileCheck className="w-4 h-4 mr-2" />
          Required Fields
        </TabsTrigger>
      </TabsList>

      {/* Admission Types */}
      <TabsContent value="admission-types">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Admission Types</h3>
              <p className="text-sm text-gray-600">
                Configure which admission types are available
              </p>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Admission Type
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {admissionTypes.map((type) => (
              <Card
                key={type.id}
                className={cn(
                  'p-4',
                  type.enabled ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {type.code}
                      </Badge>
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <div className="text-xs text-gray-600">
                      Workflow: {type.defaultWorkflow}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <Label className="text-sm text-gray-700">Enabled</Label>
                  <Switch
                    checked={type.enabled}
                    onCheckedChange={() => handleToggleAdmissionType(type.id)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </TabsContent>

      {/* Referral Sources */}
      <TabsContent value="referral-sources">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Referral Sources</h3>
              <p className="text-sm text-gray-600">Manage referral source directory</p>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Referral Source
            </Button>
          </div>

          <div className="space-y-3">
            {referralSources.map((source) => (
              <Card key={source.id} className="p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{source.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {source.type}
                      </Badge>
                    </div>
                    {source.contactName && (
                      <div className="text-sm text-gray-600">
                        Contact: {source.contactName}
                      </div>
                    )}
                    {source.contactPhone && (
                      <div className="text-sm text-gray-600">Phone: {source.contactPhone}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={() => handleToggleReferralSource(source.id)}
                    />
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </TabsContent>

      {/* Workflows */}
      <TabsContent value="workflows">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Default Admission Workflow</h3>
            <p className="text-sm text-gray-600">
              Define the standard steps for processing new admissions
            </p>
          </div>

          <div className="space-y-3">
            {workflowSteps.map((step, index) => (
              <Card key={step.id} className="p-4 bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                    <div className="text-sm text-gray-600">Assigned to: {step.assignedRole}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      step.required
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    )}
                  >
                    {step.required ? 'Required' : 'Optional'}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Workflow Step
          </Button>
        </Card>
      </TabsContent>

      {/* Required Fields */}
      <TabsContent value="required-fields">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Required Admission Fields</h3>
            <p className="text-sm text-gray-600">
              Configure which fields are required during admission intake
            </p>
          </div>

          {['Demographics', 'Clinical', 'Referral', 'Insurance'].map((section) => {
            const sectionFields = requiredFields.filter((f) => f.section === section);
            return (
              <div key={section} className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{section}</h4>
                <div className="space-y-2">
                  {sectionFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <Label className="text-sm text-gray-900">{field.fieldName}</Label>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            field.required
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          )}
                        >
                          {field.required ? 'Required' : 'Optional'}
                        </Badge>
                        <Switch
                          checked={field.required}
                          onCheckedChange={() => handleToggleFieldRequired(field.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Card>
      </TabsContent>
    </Tabs>
  );
}
