/**
 * Care Plan Management Page
 * 
 * Demo page showing complete care plan management system
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  FileText,
  Download,
  Share2,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';
import CarePlanManagement from '../components/CarePlanManagement';
import { MOCK_CARE_PLAN } from '../services/carePlan';
import type { CarePlan, Problem, Goal, Intervention } from '../services/carePlan';

export default function CarePlanManagementPage() {
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState<CarePlan>(MOCK_CARE_PLAN);

  const handleUpdate = (updated: CarePlan) => {
    setCarePlan(updated);
    console.log('Care plan updated:', updated);
  };

  const handleAddProblem = () => {
    console.log('Opening add problem dialog...');
    // Would open dialog/modal
  };

  const handleEditProblem = (problem: Problem) => {
    console.log('Editing problem:', problem);
    // Would open edit dialog
  };

  const handleAddGoal = (problemId: string) => {
    console.log('Adding goal for problem:', problemId);
    // Would open add goal dialog
  };

  const handleEditGoal = (goal: Goal) => {
    console.log('Editing goal:', goal);
    // Would open edit dialog
  };

  const handleAddIntervention = (goalId: string) => {
    console.log('Adding intervention for goal:', goalId);
    // Would open add intervention dialog
  };

  const handleEditIntervention = (intervention: Intervention) => {
    console.log('Editing intervention:', intervention);
    // Would open edit dialog
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
                <h1 className="text-xl font-bold text-gray-900">Care Plan Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • Admission #12345
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <Check className="w-4 h-4 mr-2" />
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="care-plan">
          <TabsList>
            <TabsTrigger value="care-plan">
              <FileText className="w-4 h-4 mr-2" />
              Care Plan
            </TabsTrigger>
            <TabsTrigger value="architecture">
              <Info className="w-4 h-4 mr-2" />
              Architecture
            </TabsTrigger>
          </TabsList>

          {/* Care Plan Tab */}
          <TabsContent value="care-plan" className="mt-6">
            <CarePlanManagement
              carePlan={carePlan}
              onUpdate={handleUpdate}
              onAddProblem={handleAddProblem}
              onEditProblem={handleEditProblem}
              onAddGoal={handleAddGoal}
              onEditGoal={handleEditGoal}
              onAddIntervention={handleAddIntervention}
              onEditIntervention={handleEditIntervention}
            />
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Care Plan Architecture</h3>
              
              <div className="space-y-6">
                {/* Data Model */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Core Data Model</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <ArchitectureCard
                      title="Problems"
                      items={[
                        'Health issues/diagnoses',
                        'ICD-10 code mapping',
                        'Severity classification',
                        'Primary diagnosis flag',
                        'Status tracking',
                      ]}
                    />
                    <ArchitectureCard
                      title="Goals"
                      items={[
                        'SMART goals',
                        'Measurable criteria',
                        'Target dates',
                        'Progress tracking (0-100%)',
                        'Multi-discipline assignment',
                      ]}
                    />
                    <ArchitectureCard
                      title="Interventions"
                      items={[
                        'Specific actions',
                        'Frequency/duration',
                        'Discipline responsible',
                        'Completion tracking',
                        'Teaching requirements',
                      ]}
                    />
                  </div>
                </div>

                {/* Relationships */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Hierarchical Relationships</h4>
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Problem</span>
                        <span className="text-gray-600">→ has multiple Goals</span>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <span className="font-medium">Goal</span>
                        <span className="text-gray-600">→ has multiple Interventions</span>
                      </div>
                      <div className="ml-12 text-gray-600">
                        All items linked: Problem ← Goal ← Intervention
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FeatureCard
                      title="Admission Association"
                      description="Each care plan is linked to an active admission"
                    />
                    <FeatureCard
                      title="Version Control"
                      description="Track revisions and changes over time"
                    />
                    <FeatureCard
                      title="Multi-Discipline"
                      description="6 discipline types: SN, PT, OT, ST, MSW, HHA"
                    />
                    <FeatureCard
                      title="Progress Tracking"
                      description="Real-time progress updates for goals (0-100%)"
                    />
                    <FeatureCard
                      title="Status Management"
                      description="Active, Met, Resolved, Discontinued states"
                    />
                    <FeatureCard
                      title="Timeline View"
                      description="View goals/interventions by target dates"
                    />
                  </div>
                </div>

                {/* Integration Points */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Integration Points</h4>
                  <div className="space-y-2">
                    <IntegrationCard
                      context="Patient Chart → Care Plan Tab"
                      description="Main care plan view in patient chart"
                    />
                    <IntegrationCard
                      context="Visit Documentation → Care Plan Reference"
                      description="Clinicians reference care plan during visit documentation"
                    />
                    <IntegrationCard
                      context="Assessment → Care Plan Update"
                      description="OASIS/HOPE assessments inform care plan updates"
                    />
                    <IntegrationCard
                      context="Discharge → Care Plan Review"
                      description="Care plan reviewed and finalized at discharge"
                    />
                  </div>
                </div>

                {/* Compliance */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">CMS Compliance</h4>
                  <Card className="p-4 bg-green-50 border-green-200">
                    <ul className="space-y-1 text-sm text-green-900">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Physician review and approval tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        30-day review cycle monitoring
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        ICD-10 code documentation
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Measurable goal criteria (SMART goals)
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Multi-disciplinary coordination
                      </li>
                    </ul>
                  </Card>
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
function ArchitectureCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="p-4">
      <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <h5 className="font-medium text-sm text-gray-900 mb-1">{title}</h5>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

function IntegrationCard({ context, description }: { context: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <Badge variant="outline" className="text-xs whitespace-nowrap">{context}</Badge>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
}
