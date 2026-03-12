/**
 * Operational Queues Demo Page
 * 
 * Demonstrates the work queue system for healthcare operations.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  QueueWorkspace,
  queueConfigs,
  type QueueCategory,
} from '../components/queues/OperationalQueues';
import {
  Info,
  CheckCircle2,
  Briefcase,
  Stethoscope,
  Receipt,
  Heart,
  Zap,
  Target,
  TrendingUp,
  Activity,
  ListChecks,
} from 'lucide-react';

export default function OperationalQueuesDemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<QueueCategory>('operations');

  // Count queues by category
  const queuesByCategory = {
    operations: Object.values(queueConfigs).filter((q) => q.category === 'operations'),
    clinical: Object.values(queueConfigs).filter((q) => q.category === 'clinical'),
    billing: Object.values(queueConfigs).filter((q) => q.category === 'billing'),
    hospice: Object.values(queueConfigs).filter((q) => q.category === 'hospice'),
  };

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ListChecks className="size-8 text-blue-600" />
            Operational Work Queues
          </h1>
          <p className="text-gray-600 mt-2">
            Action-oriented work queues for healthcare operations
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Work Queues</p>
                <p className="mt-1 text-blue-800">
                  Work queues represent <strong>actionable items</strong> requiring staff attention.
                  Each queue item displays key information (patient, admission, assignee, issue) and
                  clicking navigates directly to the relevant record. Queues support filtering,
                  sorting, bulk actions, and role-based visibility.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Queue Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CategoryCard
                icon={Briefcase}
                title="Operations"
                description="Admissions, visits, EVV"
                count={queuesByCategory.operations.length}
                color="blue"
                onClick={() => setSelectedCategory('operations')}
              />
              <CategoryCard
                icon={Stethoscope}
                title="Clinical"
                description="Documentation, assessments"
                count={queuesByCategory.clinical.length}
                color="green"
                onClick={() => setSelectedCategory('clinical')}
              />
              <CategoryCard
                icon={Receipt}
                title="Billing"
                description="Claims, authorizations"
                count={queuesByCategory.billing.length}
                color="orange"
                onClick={() => setSelectedCategory('billing')}
              />
              <CategoryCard
                icon={Heart}
                title="Hospice"
                description="IDG notes, LOC, bereavement"
                count={queuesByCategory.hospice.length}
                color="purple"
                onClick={() => setSelectedCategory('hospice')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Queue Types Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Queues ({Object.keys(queueConfigs).length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="operations">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="operations">Operations</TabsTrigger>
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="hospice">Hospice</TabsTrigger>
              </TabsList>

              <TabsContent value="operations" className="mt-4 space-y-2">
                {queuesByCategory.operations.map((queue) => (
                  <QueueInfoCard key={queue.id} queue={queue} />
                ))}
              </TabsContent>

              <TabsContent value="clinical" className="mt-4 space-y-2">
                {queuesByCategory.clinical.map((queue) => (
                  <QueueInfoCard key={queue.id} queue={queue} />
                ))}
              </TabsContent>

              <TabsContent value="billing" className="mt-4 space-y-2">
                {queuesByCategory.billing.map((queue) => (
                  <QueueInfoCard key={queue.id} queue={queue} />
                ))}
              </TabsContent>

              <TabsContent value="hospice" className="mt-4 space-y-2">
                {queuesByCategory.hospice.map((queue) => (
                  <QueueInfoCard key={queue.id} queue={queue} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{Object.keys(queueConfigs).length}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Total Queues</p>
              <p className="text-xs text-gray-500 mt-1">Across 4 categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Categories</p>
              <p className="text-xs text-gray-500 mt-1">Operations, Clinical, Billing, Hospice</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">5</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Key Data Points</p>
              <p className="text-xs text-gray-500 mt-1">Per queue item</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">1</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Click to Action</p>
              <p className="text-xs text-gray-500 mt-1">Direct navigation</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="size-5 text-orange-600" />
              Live Queue Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <QueueWorkspace category={selectedCategory} />
            </div>
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
                title="Action-Oriented"
                description="Every queue item represents actionable work with clear next steps"
              />
              <FeatureCard
                icon={Activity}
                title="Direct Navigation"
                description="One-click access to the relevant record or workflow"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Priority-Based"
                description="Items sorted by urgency (high/medium/low) and days pending"
              />
              <FeatureCard
                icon={CheckCircle2}
                title="Bulk Actions"
                description="Select multiple items for batch processing and assignment"
              />
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UseCaseCard
              title="Operations Manager: Start of Day Review"
              steps={[
                'Opens "Admissions Needing Completion" queue',
                'Sees 2 high-priority items, 5 days pending',
                'Clicks first item → navigates to admission record',
                'Completes missing documentation',
                'Item automatically removed from queue',
              ]}
              result="2 admissions completed in 10 minutes"
            />

            <UseCaseCard
              title="Billing Specialist: Claims Processing"
              steps={[
                'Opens "Claims Ready to Submit" queue',
                'Reviews 8 episodes ready for billing',
                'Uses bulk select for 5 Medicare claims',
                'Clicks "Submit Claims" bulk action',
                'Items move to claims tracking',
              ]}
              result="5 claims submitted in one batch"
            />

            <UseCaseCard
              title="Clinical Supervisor: Documentation Audit"
              steps={[
                'Opens "Missing Documentation" queue',
                'Filters by "High Priority"',
                'Sorts by "Days Pending"',
                'Sees 3 visit notes overdue by 3+ days',
                'Assigns each to responsible clinician',
              ]}
              result="Documentation compliance restored"
            />
          </UseCaseCard>
        </Card>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">QueueWorkspace</code>{' '}
                  from <code className="bg-green-200 px-1 py-0.5 rounded">@/components/queues</code>.
                  The system is fully typed, supports 16+ queue types, and includes filtering,
                  sorting, and bulk actions.
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

interface CategoryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  count: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick: () => void;
}

function CategoryCard({ icon: Icon, title, description, count, color, onClick }: CategoryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <button
      onClick={onClick}
      className="text-left p-4 border-2 rounded-lg bg-white hover:shadow-md transition-all"
    >
      <div className={`size-12 rounded-lg mx-auto mb-3 flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="size-6" />
      </div>
      <h3 className="font-semibold text-gray-900 text-center text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-600 text-center mb-2">{description}</p>
      <Badge variant="outline" className="w-full justify-center">
        {count} queues
      </Badge>
    </button>
  );
}

function QueueInfoCard({ queue }: { queue: any }) {
  const Icon = queue.icon;

  return (
    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white">
      <div className="size-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="size-5 text-gray-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-sm">{queue.title}</h4>
        <p className="text-xs text-gray-600 mt-0.5">{queue.description}</p>
      </div>
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
  title: string;
  steps: string[];
  result: string;
}

function UseCaseCard({ title, steps, result }: UseCaseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h4 className="font-semibold text-gray-900 mb-3">{title}</h4>
      <ol className="space-y-2 mb-3">
        {steps.map((step, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="font-semibold text-blue-600 flex-shrink-0">{index + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="bg-green-50 border border-green-200 rounded p-2">
        <p className="text-sm text-green-800">
          <CheckCircle2 className="size-4 inline mr-1" />
          <strong>Result:</strong> {result}
        </p>
      </div>
    </div>
  );
}
