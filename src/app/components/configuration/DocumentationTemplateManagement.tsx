/**
 * Documentation Template Management
 * 
 * Manage templates for visit notes, care plans, assessments, and orders.
 * Define default fields, required fields, and optional sections.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  FileText,
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  defaultValue?: string;
  options?: string[];
  section: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  type: 'visit-note' | 'care-plan' | 'assessment' | 'order';
  discipline?: string;
  status: 'active' | 'draft' | 'archived';
  fields: TemplateField[];
  sections: string[];
}

interface DocumentationTemplateManagementProps {
  onConfigChange: () => void;
}

export default function DocumentationTemplateManagement({
  onConfigChange,
}: DocumentationTemplateManagementProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([
    {
      id: 'sn-routine-visit',
      name: 'SN Routine Visit',
      type: 'visit-note',
      discipline: 'SN',
      status: 'active',
      sections: ['Vital Signs', 'Assessment', 'Interventions', 'Patient Education', 'Plan'],
      fields: [
        { id: 'bp', name: 'Blood Pressure', type: 'text', required: true, section: 'Vital Signs' },
        { id: 'hr', name: 'Heart Rate', type: 'number', required: true, section: 'Vital Signs' },
        { id: 'temp', name: 'Temperature', type: 'number', required: true, section: 'Vital Signs' },
        { id: 'assessment', name: 'Clinical Assessment', type: 'textarea', required: true, section: 'Assessment' },
        { id: 'interventions', name: 'Nursing Interventions', type: 'textarea', required: true, section: 'Interventions' },
        { id: 'education', name: 'Patient Education', type: 'textarea', required: false, section: 'Patient Education' },
      ],
    },
    {
      id: 'pt-evaluation',
      name: 'PT Evaluation',
      type: 'visit-note',
      discipline: 'PT',
      status: 'active',
      sections: ['Patient History', 'Functional Assessment', 'Goals', 'Treatment Plan'],
      fields: [
        { id: 'history', name: 'Medical History', type: 'textarea', required: true, section: 'Patient History' },
        { id: 'mobility', name: 'Mobility Status', type: 'select', required: true, options: ['Independent', 'Minimal Assist', 'Moderate Assist', 'Maximum Assist', 'Dependent'], section: 'Functional Assessment' },
        { id: 'balance', name: 'Balance Assessment', type: 'select', required: true, options: ['Good', 'Fair', 'Poor', 'Unable'], section: 'Functional Assessment' },
        { id: 'goals', name: 'Treatment Goals', type: 'textarea', required: true, section: 'Goals' },
      ],
    },
    {
      id: 'diabetes-care-plan',
      name: 'Diabetes Care Plan',
      type: 'care-plan',
      status: 'active',
      sections: ['Diagnosis', 'Goals', 'Interventions', 'Frequency'],
      fields: [
        { id: 'diagnosis', name: 'Primary Diagnosis', type: 'text', required: true, defaultValue: 'Diabetes Mellitus', section: 'Diagnosis' },
        { id: 'goal1', name: 'Goal: Blood Sugar Control', type: 'textarea', required: true, section: 'Goals' },
        { id: 'intervention1', name: 'Intervention: Medication Management', type: 'textarea', required: true, section: 'Interventions' },
        { id: 'frequency', name: 'Visit Frequency', type: 'select', required: true, options: ['Daily', '3x/week', '2x/week', 'Weekly'], section: 'Frequency' },
      ],
    },
    {
      id: 'oasis-start-care',
      name: 'OASIS-E Start of Care',
      type: 'assessment',
      status: 'active',
      sections: ['Demographics', 'Clinical Record', 'ADL/IADLs', 'Medications', 'Integumentary'],
      fields: [
        { id: 'm1000', name: 'M1000 - DC Disposition', type: 'select', required: true, options: ['1', '2', '3', '4', '5'], section: 'Demographics' },
        { id: 'm1021', name: 'M1021 - Primary Diagnosis', type: 'text', required: true, section: 'Clinical Record' },
        { id: 'm1800', name: 'M1800 - Grooming', type: 'select', required: true, options: ['0', '1', '2', '3'], section: 'ADL/IADLs' },
      ],
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleDuplicate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      const newTemplate = {
        ...template,
        id: `${template.id}-copy-${Date.now()}`,
        name: `${template.name} (Copy)`,
        status: 'draft' as const,
      };
      setTemplates([...templates, newTemplate]);
      onConfigChange();
    }
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter((t) => t.id !== templateId));
      onConfigChange();
    }
  };

  const templatesByType = {
    'visit-note': templates.filter((t) => t.type === 'visit-note'),
    'care-plan': templates.filter((t) => t.type === 'care-plan'),
    assessment: templates.filter((t) => t.type === 'assessment'),
    order: templates.filter((t) => t.type === 'order'),
  };

  return (
    <Tabs defaultValue="visit-note" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="visit-note">
          Visit Notes ({templatesByType['visit-note'].length})
        </TabsTrigger>
        <TabsTrigger value="care-plan">
          Care Plans ({templatesByType['care-plan'].length})
        </TabsTrigger>
        <TabsTrigger value="assessment">
          Assessments ({templatesByType['assessment'].length})
        </TabsTrigger>
        <TabsTrigger value="order">Orders ({templatesByType['order'].length})</TabsTrigger>
      </TabsList>

      {/* Visit Notes */}
      <TabsContent value="visit-note">
        <TemplateTypeSection
          templates={templatesByType['visit-note']}
          type="visit-note"
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onEdit={(template) => {
            setSelectedTemplate(template);
            setEditMode(true);
          }}
          onNew={() => {
            setSelectedTemplate({
              id: `new-${Date.now()}`,
              name: 'New Visit Note Template',
              type: 'visit-note',
              status: 'draft',
              sections: ['General'],
              fields: [],
            });
            setEditMode(true);
          }}
        />
      </TabsContent>

      {/* Care Plans */}
      <TabsContent value="care-plan">
        <TemplateTypeSection
          templates={templatesByType['care-plan']}
          type="care-plan"
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onEdit={(template) => {
            setSelectedTemplate(template);
            setEditMode(true);
          }}
          onNew={() => {
            setSelectedTemplate({
              id: `new-${Date.now()}`,
              name: 'New Care Plan Template',
              type: 'care-plan',
              status: 'draft',
              sections: ['General'],
              fields: [],
            });
            setEditMode(true);
          }}
        />
      </TabsContent>

      {/* Assessments */}
      <TabsContent value="assessment">
        <TemplateTypeSection
          templates={templatesByType['assessment']}
          type="assessment"
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onEdit={(template) => {
            setSelectedTemplate(template);
            setEditMode(true);
          }}
          onNew={() => {
            setSelectedTemplate({
              id: `new-${Date.now()}`,
              name: 'New Assessment Template',
              type: 'assessment',
              status: 'draft',
              sections: ['General'],
              fields: [],
            });
            setEditMode(true);
          }}
        />
      </TabsContent>

      {/* Orders */}
      <TabsContent value="order">
        <TemplateTypeSection
          templates={templatesByType['order']}
          type="order"
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onEdit={(template) => {
            setSelectedTemplate(template);
            setEditMode(true);
          }}
          onNew={() => {
            setSelectedTemplate({
              id: `new-${Date.now()}`,
              name: 'New Order Template',
              type: 'order',
              status: 'draft',
              sections: ['General'],
              fields: [],
            });
            setEditMode(true);
          }}
        />
      </TabsContent>

      {/* Template Editor Dialog */}
      {editMode && selectedTemplate && (
        <TemplateEditor
          template={selectedTemplate}
          onSave={(updated) => {
            setTemplates(
              templates.some((t) => t.id === updated.id)
                ? templates.map((t) => (t.id === updated.id ? updated : t))
                : [...templates, updated]
            );
            setEditMode(false);
            setSelectedTemplate(null);
            onConfigChange();
          }}
          onCancel={() => {
            setEditMode(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </Tabs>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE TYPE SECTION
// ═══════════════════════════════════════════════════════════════════════════

function TemplateTypeSection({
  templates,
  type,
  onDuplicate,
  onDelete,
  onEdit,
  onNew,
}: {
  templates: DocumentTemplate[];
  type: string;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (template: DocumentTemplate) => void;
  onNew: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {type === 'visit-note'
              ? 'Visit Note Templates'
              : type === 'care-plan'
              ? 'Care Plan Templates'
              : type === 'assessment'
              ? 'Assessment Templates'
              : 'Order Templates'}
          </h3>
          <Button size="sm" onClick={onNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>

        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-4 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    {template.discipline && (
                      <Badge variant="outline" className="text-xs">
                        {template.discipline}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        template.status === 'active'
                          ? 'bg-green-100 text-green-700 border-green-300'
                          : template.status === 'draft'
                          ? 'bg-gray-100 text-gray-700 border-gray-300'
                          : 'bg-red-100 text-red-700 border-red-300'
                      )}
                    >
                      {template.status}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {template.sections.length} sections • {template.fields.length} fields •{' '}
                    {template.fields.filter((f) => f.required).length} required
                  </div>

                  {/* Expandable Field List */}
                  {expandedId === template.id && (
                    <div className="mt-3 space-y-2">
                      {template.sections.map((section) => {
                        const sectionFields = template.fields.filter(
                          (f) => f.section === section
                        );
                        if (sectionFields.length === 0) return null;

                        return (
                          <div key={section} className="bg-white p-3 rounded border">
                            <div className="font-medium text-sm text-gray-900 mb-2">
                              {section}
                            </div>
                            <div className="space-y-1">
                              {sectionFields.map((field) => (
                                <div
                                  key={field.id}
                                  className="flex items-center gap-2 text-xs text-gray-700"
                                >
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'text-xs',
                                      field.required
                                        ? 'bg-red-100 text-red-700 border-red-300'
                                        : 'bg-gray-100 text-gray-600 border-gray-300'
                                    )}
                                  >
                                    {field.required ? 'Required' : 'Optional'}
                                  </Badge>
                                  <span>{field.name}</span>
                                  <span className="text-gray-500">({field.type})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedId(expandedId === template.id ? null : template.id)
                    }
                  >
                    {expandedId === template.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDuplicate(template.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(template.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No templates created yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE EDITOR (Simplified)
// ═══════════════════════════════════════════════════════════════════════════

function TemplateEditor({
  template,
  onSave,
  onCancel,
}: {
  template: DocumentTemplate;
  onSave: (template: DocumentTemplate) => void;
  onCancel: () => void;
}) {
  const [editedTemplate, setEditedTemplate] = useState(template);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Template</h2>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={editedTemplate.name}
              onChange={(e) =>
                setEditedTemplate({ ...editedTemplate, name: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Status</Label>
            <div className="flex gap-2">
              {(['active', 'draft', 'archived'] as const).map((status) => (
                <Button
                  key={status}
                  variant={editedTemplate.status === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditedTemplate({ ...editedTemplate, status })}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              Template has {editedTemplate.fields.length} fields across{' '}
              {editedTemplate.sections.length} sections
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedTemplate)}>Save Template</Button>
        </div>
      </Card>
    </div>
  );
}
