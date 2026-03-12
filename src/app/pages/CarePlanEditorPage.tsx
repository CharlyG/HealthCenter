/**
 * Care Plan Editor Page
 * 
 * Demo page showing interactive care plan editor
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  FileText,
  History,
  Users,
  Calendar,
  Share2,
  Download,
  Send,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';
import CarePlanEditor from '../components/CarePlanEditor';
import { MOCK_CARE_PLAN, carePlanService } from '../services/carePlan';
import type { CarePlan } from '../services/carePlan';
import { Card } from '../components/ui/card';

export default function CarePlanEditorPage() {
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState<CarePlan>(MOCK_CARE_PLAN);
  const stats = carePlanService.getStatistics(carePlan);

  const handleCarePlanChange = (updated: CarePlan) => {
    setCarePlan(updated);
    console.log('Care plan updated:', updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Care Plan Editor</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • Admission #12345
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                View History
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  Created: {new Date(carePlan.createdDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {stats.disciplinesInvolved.length} disciplines involved
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Version {carePlan.version}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white">
                {carePlan.status.toUpperCase()}
              </Badge>
              {carePlan.approvedBy && (
                <Badge variant="outline" className="text-green-700 border-green-300">
                  <Check className="w-3 h-3 mr-1" />
                  Approved by {carePlan.approvedBy}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">
              <FileText className="w-4 h-4 mr-2" />
              Care Plan Editor
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="mt-6">
            <CarePlanEditor
              carePlan={carePlan}
              onChange={handleCarePlanChange}
              autoSave={true}
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Care Plan Editor Features</h3>

              <div className="space-y-6">
                {/* Expandable Cards */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Expandable Problem Cards</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Click problem header to expand/collapse goals and interventions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Color-coded severity: Red (High), Amber (Medium), Green (Low)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Primary diagnosis highlighted with blue background</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>ICD-10 code display for regulatory compliance</span>
                    </li>
                  </ul>
                </div>

                {/* Nested Goals */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nested Goals Management</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Goals nested under their related problems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Progress bar with quick update buttons (0%, 25%, 50%, 75%, 100%)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Target date tracking with overdue alerts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Multi-discipline assignment with badges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Click to expand/collapse interventions under each goal</span>
                    </li>
                  </ul>
                </div>

                {/* Nested Interventions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nested Interventions Management</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Interventions nested under their related goals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Frequency and duration display</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Completion tracking with progress bar (X/Y completed)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Primary discipline indicator</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <QuickActionCard
                      icon={<AlertCircle className="w-5 h-5 text-red-600" />}
                      title="Add Problem"
                      description="Click 'Add Problem' button to add new clinical problem with ICD-10 code"
                    />
                    <QuickActionCard
                      icon={<FileText className="w-5 h-5 text-blue-600" />}
                      title="Add Goal"
                      description="Click 'Add Goal' within expanded problem to create SMART goals"
                    />
                    <QuickActionCard
                      icon={<FileText className="w-5 h-5 text-purple-600" />}
                      title="Add Intervention"
                      description="Click 'Add' within expanded goal to add specific interventions"
                    />
                    <QuickActionCard
                      icon={<Check className="w-5 h-5 text-green-600" />}
                      title="Mark Complete"
                      description="Click checkmark icon to instantly mark goals/interventions as complete"
                    />
                    <QuickActionCard
                      icon={<FileText className="w-5 h-5 text-orange-600" />}
                      title="Update Status"
                      description="Edit button opens dialog to change status, progress, or details"
                    />
                    <QuickActionCard
                      icon={<AlertCircle className="w-5 h-5 text-gray-600" />}
                      title="Delete Items"
                      description="Trash icon removes items with cascade delete for related items"
                    />
                  </div>
                </div>

                {/* Auto-Save */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Auto-Save & Validation</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Automatic saving with visual indicator (Saving... / All changes saved)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Required field validation in dialogs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>At least one discipline must be selected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Confirmation dialogs for delete operations</span>
                    </li>
                  </ul>
                </div>

                {/* Longitudinal Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Longitudinal Care Planning</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Track progress throughout entire admission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Update goals and interventions as patient condition changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Mark problems as resolved when appropriate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Revise goals based on assessment findings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Discontinue interventions when no longer needed</span>
                    </li>
                  </ul>
                </div>

                {/* Dialog Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Form Dialogs</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <DialogFeatureCard
                      title="Problem Dialog"
                      fields={[
                        'Problem name',
                        'Description',
                        'ICD-10 code',
                        'ICD-10 description',
                        'Severity (High/Med/Low)',
                        'Status',
                        'Primary diagnosis checkbox',
                      ]}
                    />
                    <DialogFeatureCard
                      title="Goal Dialog"
                      fields={[
                        'Goal name',
                        'Description',
                        'Measurable criteria',
                        'Target value',
                        'Start/target dates',
                        'Status',
                        'Progress %',
                        'Primary discipline',
                        'Responsible disciplines',
                        'Progress notes',
                      ]}
                    />
                    <DialogFeatureCard
                      title="Intervention Dialog"
                      fields={[
                        'Intervention name',
                        'Description',
                        'Instructions',
                        'Frequency',
                        'Duration',
                        'Start/end dates',
                        'Status',
                        'Primary discipline',
                        'Responsible disciplines',
                        'Completion tracking',
                        'Teaching requirements',
                        'Precautions',
                      ]}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components
function QuickActionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex items-start gap-3 mb-2">
        {icon}
        <h5 className="font-medium text-sm text-gray-900">{title}</h5>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

function DialogFeatureCard({ title, fields }: { title: string; fields: string[] }) {
  return (
    <Card className="p-4">
      <h5 className="font-semibold text-sm text-gray-900 mb-2">{title}</h5>
      <ul className="space-y-0.5">
        {fields.map((field, idx) => (
          <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>{field}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
