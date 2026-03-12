/**
 * Smart Admission Readiness Demo Page
 * 
 * Demonstrates the admission readiness system for operational clarity.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AdmissionReadinessPanel,
  ReadinessBadge,
  calculateReadiness,
  generateMockChecklist,
  type ChecklistItem,
} from '../components/admission/AdmissionReadiness';
import {
  Info,
  CheckCircle2,
  Zap,
  Target,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
  XCircle,
  Progress,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdmissionReadinessDemoPage() {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<'draft' | 'partial' | 'blocked' | 'complete'>('partial');

  const scenarios = {
    draft: generateMockChecklist('draft'),
    partial: generateMockChecklist('partial'),
    blocked: generateMockChecklist('blocked'),
    complete: generateMockChecklist('complete'),
  };

  const readiness = calculateReadiness(scenarios[selectedScenario]);

  const handleNavigate = (item: ChecklistItem) => {
    if (item.navigationPath) {
      toast.success(`Navigating to: ${item.label}`, {
        description: item.navigationPath,
      });
      // In real app: navigate(item.navigationPath)
    }
  };

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="size-8 text-blue-600" />
            Smart Admission Readiness
          </h1>
          <p className="text-gray-600 mt-2">
            Operational readiness indicator for home health and hospice admissions
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Admission Readiness</p>
                <p className="mt-1 text-blue-800">
                  The Smart Admission Readiness system provides a <strong>clear visual indicator</strong>{' '}
                  of whether an admission is operationally ready for care. It displays a{' '}
                  <strong>readiness badge</strong> (Draft, Pending Setup, Ready for Care, Blocked),
                  a detailed <strong>checklist</strong> with completion states, and a{' '}
                  <strong>summary panel</strong> showing progress. Users can click checklist items
                  to navigate directly to the relevant section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Readiness States */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Readiness States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StateCard
                state="draft"
                description="Initial setup in progress"
                criteria="0-25% complete"
              />
              <StateCard
                state="pending_setup"
                description="Additional information required"
                criteria="26-99% complete"
              />
              <StateCard
                state="ready_for_care"
                description="All requirements met"
                criteria="100% complete, no blockers"
              />
              <StateCard
                state="blocked"
                description="Critical items require attention"
                criteria="Any blocked items present"
              />
            </div>
          </CardContent>
        </Card>

        {/* Checklist Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Checklist Categories (13 Items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CategoryCard
                title="Patient Information"
                items={['Demographics', 'Emergency Contact', 'Address Verification']}
                count={3}
                color="blue"
              />
              <CategoryCard
                title="Clinical Information"
                items={['Diagnosis', 'Physician Orders', 'Disciplines', 'Medications']}
                count={4}
                color="green"
              />
              <CategoryCard
                title="Payer & Authorization"
                items={['Primary Payer', 'Authorization', 'Insurance Verification']}
                count={3}
                color="purple"
              />
              <CategoryCard
                title="Operational Setup"
                items={['Start of Care Date', 'Care Team', 'Territory']}
                count={3}
                color="orange"
              />
            </div>
          </CardContent>
        </Card>

        {/* Item States */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Checklist Item States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <ItemStateCard
                state="complete"
                description="Item has been completed"
                color="green"
              />
              <ItemStateCard
                state="incomplete"
                description="Item needs to be completed"
                color="gray"
              />
              <ItemStateCard
                state="blocked"
                description="Critical blocker preventing progress"
                color="red"
              />
              <ItemStateCard
                state="optional"
                description="Optional item, not required"
                color="blue"
              />
            </div>
          </CardContent>
        </Card>

        {/* Scenario Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interactive Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant={selectedScenario === 'draft' ? 'default' : 'outline'}
                onClick={() => setSelectedScenario('draft')}
                className="gap-2"
              >
                <FileText className="size-4" />
                Draft (0%)
              </Button>
              <Button
                variant={selectedScenario === 'partial' ? 'default' : 'outline'}
                onClick={() => setSelectedScenario('partial')}
                className="gap-2"
              >
                <Clock className="size-4" />
                Partial (54%)
              </Button>
              <Button
                variant={selectedScenario === 'blocked' ? 'default' : 'outline'}
                onClick={() => setSelectedScenario('blocked')}
                className="gap-2"
              >
                <AlertTriangle className="size-4" />
                Blocked
              </Button>
              <Button
                variant={selectedScenario === 'complete' ? 'default' : 'outline'}
                onClick={() => setSelectedScenario('complete')}
                className="gap-2"
              >
                <CheckCircle2 className="size-4" />
                Complete (100%)
              </Button>
            </div>

            {/* Compact Example */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Simple Compact View</h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Admission Readiness</h4>
                  <ReadinessBadge state={readiness.state} size="sm" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <span className="text-sm text-gray-700">Patient demographics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <span className="text-sm text-gray-700">Primary payer</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <span className="text-sm text-gray-700">Physician assigned</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <span className="text-sm text-gray-700">Diagnosis codes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="size-5 text-amber-600" />
                    <span className="text-sm text-gray-900 font-medium">Authorization missing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="size-5 text-amber-600" />
                    <span className="text-sm text-gray-900 font-medium">Discipline frequencies not defined</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="size-5 text-red-600" />
                    <span className="text-sm text-gray-900 font-medium">Missing start of care date</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">3 items remaining</span>
                    <span className="font-semibold text-gray-900">57%</span>
                  </div>
                  <Progress value={57} className="h-2" />
                </div>
              </div>
            </div>

            {/* Full Demo */}
            <AdmissionReadinessPanel
              readiness={readiness}
              admissionId="ADM-2024-001"
              onNavigate={handleNavigate}
            />
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UseCaseCard
              number={1}
              title="Admission Coordinator: New Referral Setup"
              scenario="New patient referral received from hospital"
              flow={[
                'Create new admission (automatically in Draft state)',
                'View readiness panel showing 0% progress',
                'See checklist with all items incomplete',
                'Click "Patient Demographics" → navigate to form',
                'Complete demographics section',
                'Return to readiness panel (now 8% progress)',
                'Continue through checklist systematically',
              ]}
              benefit="Clear guidance on what needs to be completed"
            />

            <UseCaseCard
              number={2}
              title="Clinical Manager: Pre-Start Review"
              scenario="Day before start of care, reviewing admission readiness"
              flow={[
                'Open admission details',
                'See readiness badge: "Pending Setup" (amber)',
                'View summary: 11/13 items complete (85%)',
                'Identify 2 incomplete items: Care Team, Territory',
                'Click "Care Team Assigned" → assign primary RN',
                'Click "Territory Assignment" → assign territory',
                'Readiness changes to "Ready for Care" (green)',
              ]}
              benefit="Quick identification of what is blocking start of care"
            />

            <UseCaseCard
              number={3}
              title="Authorization Specialist: Blocker Resolution"
              scenario="Authorization denied by payer"
              flow={[
                'System detects authorization denial',
                'Admission marked as "Blocked" (red, pulsing)',
                'Readiness panel shows blocker reason',
                'Authorization specialist clicks "Authorization Entered"',
                'Submits appeal with additional documentation',
                'Authorization approved',
                'Blocker cleared, admission returns to "Ready for Care"',
              ]}
              benefit="Immediate visibility of critical blockers across all admissions"
            />

            <UseCaseCard
              number={4}
              title="Dashboard View: Operational Oversight"
              scenario="Clinical director reviewing multiple admissions"
              flow={[
                'Dashboard shows all active admissions',
                'Each admission displays readiness badge',
                '15 Ready for Care (green)',
                '8 Pending Setup (amber)',
                '2 Blocked (red, pulsing)',
                'Drill into blocked admissions',
                'Assign staff to resolve blockers',
              ]}
              benefit="At-a-glance operational status across all admissions"
            />
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={Target}
                title="Visual Readiness Indicator"
                description="Clear badge showing Draft, Pending Setup, Ready for Care, or Blocked state"
              />
              <FeatureCard
                icon={CheckCircle2}
                title="Interactive Checklist"
                description="13-item checklist across 4 categories with click-to-navigate functionality"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Real-Time Progress"
                description="Automatic calculation of readiness percentage as items are completed"
              />
              <FeatureCard
                icon={AlertTriangle}
                title="Blocker Highlighting"
                description="Critical blockers prominently displayed with specific reasons"
              />
              <FeatureCard
                icon={Zap}
                title="Smart State Calculation"
                description="Automatic state transitions based on checklist completion"
              />
              <FeatureCard
                icon={FileText}
                title="Category Organization"
                description="Checklist items organized into logical categories for easy scanning"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Readiness States</p>
              <p className="text-xs text-gray-500 mt-1">Draft to Ready</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">13</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Checklist Items</p>
              <p className="text-xs text-gray-500 mt-1">Across 4 categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Item States</p>
              <p className="text-xs text-gray-500 mt-1">Complete to Blocked</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">1</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Click to Navigate</p>
              <p className="text-xs text-gray-500 mt-1">Direct access</p>
            </CardContent>
          </Card>
        </div>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">AdmissionReadinessPanel</code>,{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded">ReadinessBadge</code>, and{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded">calculateReadiness</code>{' '}
                  from <code className="bg-green-200 px-1 py-0.5 rounded">@/components/admission</code>.
                  The system automatically calculates readiness state based on checklist completion
                  and provides click-to-navigate functionality. Fully typed with TypeScript.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface StateCardProps {
  state: 'draft' | 'pending_setup' | 'ready_for_care' | 'blocked';
  description: string;
  criteria: string;
}

function StateCard({ state, description, criteria }: StateCardProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex justify-center mb-3">
        <ReadinessBadge state={state} size="md" />
      </div>
      <p className="text-sm text-gray-700 text-center mb-2">{description}</p>
      <p className="text-xs text-gray-600 text-center">{criteria}</p>
    </div>
  );
}

interface CategoryCardProps {
  title: string;
  items: string[];
  count: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function CategoryCard({ title, items, count, color }: CategoryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">{title}</h3>
      <ul className="space-y-1.5 mb-3">
        {items.map((item, index) => (
          <li key={index} className="text-xs text-gray-600">
            • {item}
          </li>
        ))}
      </ul>
      <Badge className={`${colorClasses[color]} text-xs`}>{count} items</Badge>
    </div>
  );
}

interface ItemStateCardProps {
  state: string;
  description: string;
  color: 'green' | 'gray' | 'red' | 'blue';
}

function ItemStateCard({ state, description, color }: ItemStateCardProps) {
  const colorClasses = {
    green: 'border-green-300 bg-green-50',
    gray: 'border-gray-300 bg-gray-50',
    red: 'border-red-300 bg-red-50',
    blue: 'border-blue-300 bg-blue-50',
  };

  return (
    <div className={`p-4 border-l-4 rounded-lg ${colorClasses[color]}`}>
      <h4 className="font-semibold text-gray-900 text-sm mb-2 capitalize">{state}</h4>
      <p className="text-xs text-gray-700">{description}</p>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="size-5 text-blue-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

interface UseCaseCardProps {
  number: number;
  title: string;
  scenario: string;
  flow: string[];
  benefit: string;
}

function UseCaseCard({ number, title, scenario, flow, benefit }: UseCaseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-3 mb-3">
        <div className="size-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {number}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{scenario}</p>
        </div>
      </div>
      <div className="ml-11">
        <p className="text-xs font-semibold text-gray-700 mb-2">Flow:</p>
        <ol className="space-y-1 mb-3">
          {flow.map((step, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-600 font-semibold">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <p className="text-sm text-green-800">
            <CheckCircle2 className="size-4 inline mr-1" />
            <strong>Benefit:</strong> {benefit}
          </p>
        </div>
      </div>
    </div>
  );
}