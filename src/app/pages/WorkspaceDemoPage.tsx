/**
 * Workspace Demo Page
 * 
 * Demonstrates the operational workspace system with role-aware configurations.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { OperationalWorkspace } from '../components/workspace/OperationalWorkspace';
import {
  workspaceConfigs,
  getWorkspaceConfig,
} from '../components/workspace/workspaceConfigs';
import {
  Info,
  Layers,
  User,
  Briefcase,
  Calendar,
  Users,
  Receipt,
  Target,
  CheckCircle2,
  Zap,
  Activity,
  AlertTriangle,
  Clock,
  History,
  BarChart3,
  Stethoscope,
  DollarSign,
  CalendarClock,
  UserCog,
  Heart,
} from 'lucide-react';

export default function WorkspaceDemoPage() {
  const [selectedRole, setSelectedRole] = useState<keyof typeof workspaceConfigs>('clinician');
  const [dismissedIssues, setDismissedIssues] = useState<Set<string>>(new Set());
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const roles = [
    {
      id: 'clinician' as const,
      name: 'Clinician',
      icon: Stethoscope,
      color: 'bg-blue-100 text-blue-700',
      description: 'RN, PT, OT providing direct patient care',
    },
    {
      id: 'billing_specialist' as const,
      name: 'Billing Specialist',
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
      description: 'Revenue cycle and claims management',
    },
    {
      id: 'scheduler' as const,
      name: 'Scheduler',
      icon: CalendarClock,
      color: 'bg-purple-100 text-purple-700',
      description: 'Visit scheduling and optimization',
    },
    {
      id: 'case_manager' as const,
      name: 'Case Manager',
      icon: UserCog,
      color: 'bg-orange-100 text-orange-700',
      description: 'Care coordination and case oversight',
    },
    {
      id: 'intake_coordinator' as const,
      name: 'Intake Coordinator',
      icon: Briefcase,
      color: 'bg-indigo-100 text-indigo-700',
      description: 'Referrals and new admissions',
    },
  ];

  const currentConfig = getWorkspaceConfig(selectedRole);

  // Filter out dismissed issues and completed tasks
  const filteredConfig = {
    ...currentConfig,
    criticalIssues: currentConfig.criticalIssues.filter((i) => !dismissedIssues.has(i.id)),
    todayTasks: currentConfig.todayTasks.map((t) =>
      completedTasks.has(t.id) ? { ...t, status: 'completed' as const } : t
    ),
  };

  const handleDismissIssue = (id: string) => {
    setDismissedIssues(new Set([...dismissedIssues, id]));
  };

  const handleCompleteTask = (id: string) => {
    setCompletedTasks(new Set([...completedTasks, id]));
  };

  const handleReset = () => {
    setDismissedIssues(new Set());
    setCompletedTasks(new Set());
  };

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="size-8 text-blue-600" />
            Operational Workspace System
          </h1>
          <p className="text-gray-600 mt-2">
            Role-aware workspaces focused on operational tasks and actions
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Operational Workspaces</p>
                <p className="mt-1 text-blue-800">
                  Workspaces are task-oriented interfaces that adapt based on the user's role. Each
                  workspace contains 5 zones: <strong>Critical Issues</strong> (urgent items),{' '}
                  <strong>Today's Work</strong> (scheduled tasks), <strong>Resume Work</strong>{' '}
                  (recent items), <strong>Quick Actions</strong> (common actions), and{' '}
                  <strong>Operational Insights</strong> (key metrics).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="size-5 text-blue-600" />
                Select Role
              </span>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset Demo
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedRole === role.id
                        ? 'border-blue-600 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div
                      className={`size-12 rounded-lg mx-auto mb-2 flex items-center justify-center ${role.color}`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{role.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                    {selectedRole === role.id && (
                      <Badge className="mt-2 bg-blue-600 text-white">Selected</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Workspace Zones Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workspace Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <ZoneCard
                icon={AlertTriangle}
                title="Critical Issues"
                description="Items needing immediate attention"
                color="red"
                count={filteredConfig.criticalIssues.length}
              />
              <ZoneCard
                icon={Calendar}
                title="Today's Work"
                description="Tasks scheduled for today"
                color="blue"
                count={filteredConfig.todayTasks.filter((t) => t.status !== 'completed').length}
              />
              <ZoneCard
                icon={History}
                title="Resume Work"
                description="Recently accessed items"
                color="purple"
                count={filteredConfig.recentItems.length}
              />
              <ZoneCard
                icon={Zap}
                title="Quick Actions"
                description="Common actions"
                color="orange"
                count={filteredConfig.quickActions.length}
              />
              <ZoneCard
                icon={BarChart3}
                title="Operational Insights"
                description="High-level metrics"
                color="indigo"
                count={filteredConfig.metrics.length}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Live Workspace vs Configuration */}
        <Tabs defaultValue="workspace">
          <TabsList>
            <TabsTrigger value="workspace">Live Workspace</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="mt-6">
            {/* Live Workspace Preview */}
            <div className="border-4 border-gray-300 rounded-lg overflow-hidden">
              <OperationalWorkspace
                config={filteredConfig}
                onDismissIssue={handleDismissIssue}
                onCompleteTask={handleCompleteTask}
              />
            </div>
          </TabsContent>

          <TabsContent value="config" className="mt-6 space-y-4">
            <ConfigurationOverview config={currentConfig} />
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <FeaturesOverview />
          </TabsContent>
        </Tabs>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">OperationalWorkspace</code>{' '}
                  and role configurations from{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded">@/components/workspace</code>.
                  The system is fully typed and responsive.
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

interface ZoneCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'red' | 'blue' | 'purple' | 'orange' | 'indigo';
  count: number;
}

function ZoneCard({ icon: Icon, title, description, color, count }: ZoneCardProps) {
  const colorStyles = {
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="text-center p-4 border border-gray-200 rounded-lg bg-white">
      <div className={`size-12 rounded-lg mx-auto mb-2 flex items-center justify-center ${colorStyles[color]}`}>
        <Icon className="size-6" />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
      <Badge className="mt-2" variant="outline">
        {count} items
      </Badge>
    </div>
  );
}

function ConfigurationOverview({ config }: { config: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Critical Issues</h4>
            <div className="space-y-2">
              {config.criticalIssues.map((issue: any) => (
                <div key={issue.id} className="text-sm border-l-4 border-red-500 pl-3 py-1">
                  <p className="font-medium text-gray-900">{issue.title}</p>
                  <p className="text-xs text-gray-600">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Today's Tasks</h4>
            <div className="space-y-2">
              {config.todayTasks.map((task: any) => (
                <div key={task.id} className="text-sm border-l-4 border-blue-500 pl-3 py-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-600">
                    {task.type} • {task.scheduledTime || 'Unscheduled'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {config.quickActions.map((action: any) => (
                <div key={action.id} className="text-sm border border-gray-200 rounded p-2">
                  <p className="font-medium text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Metrics</h4>
            <div className="grid grid-cols-2 gap-2">
              {config.metrics.map((metric: any) => (
                <div key={metric.id} className="text-sm border border-gray-200 rounded p-2">
                  <p className="font-medium text-gray-900">{metric.label}</p>
                  <p className="text-xs text-gray-600">
                    Value: {metric.value}
                    {metric.unit || ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeaturesOverview() {
  const features = [
    {
      title: 'Role-Aware Configuration',
      description: 'Each role gets customized workspace with relevant tasks and actions',
      icon: Users,
    },
    {
      title: 'Action-Oriented Design',
      description: 'Every item has a clear action button - no passive dashboards',
      icon: Zap,
    },
    {
      title: 'Real-Time Updates',
      description: 'Critical issues and tasks update dynamically as work is completed',
      icon: Activity,
    },
    {
      title: 'Priority Management',
      description: 'Tasks prioritized by urgency with visual indicators',
      icon: AlertTriangle,
    },
    {
      title: 'Resume Work',
      description: 'Quick access to recently viewed patients and admissions',
      icon: History,
    },
    {
      title: 'Operational Metrics',
      description: 'High-level metrics with trends and targets for performance tracking',
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.title}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="size-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
