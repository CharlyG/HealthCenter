/**
 * Care Operations Command Center Demo Page
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import CareOpsCommandCenter, { UserRole, ROLE_CONFIGS } from '../components/command-center/CareOpsCommandCenter';
import {
  Info,
  CheckCircle2,
  Zap,
  Bell,
  Calendar,
  Activity,
  TrendingUp,
  Target,
  Clock,
  AlertTriangle,
  Users,
  ClipboardCheck,
  CreditCard,
  UserCog,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

export default function CareOpsCommandCenterDemoPage() {
  const [showLive, setShowLive] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('administrator');

  if (showLive) {
    return (
      <CareOpsCommandCenter 
        initialRole={selectedRole}
        availableRoles={['scheduler', 'qa_staff', 'billing_staff', 'administrator']}
      />
    );
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="size-8 text-blue-600" />
            Care Operations Command Center
          </h1>
          <p className="text-gray-600 mt-2">
            Centralized real-time dashboard for operational awareness and quick problem resolution
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Care Operations Command Center</p>
                <p className="mt-1 text-blue-800">
                  The Command Center provides a <strong>single pane of glass</strong> for operations managers to monitor critical issues, today's operational status, actionable work queues, and key metrics. Organized into <strong>4 main zones</strong> (Critical Issues, Today's Operations, Operational Queues, Operational Insights) with real-time updates, priority-based alerts, and quick action navigation to relevant modules.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEW: Role-Based Views */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <UserCog className="size-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-900">
                <p className="font-semibold">Role-Based Views (NEW)</p>
                <p className="mt-1 text-purple-800">
                  The Command Center now supports <strong>4 role-specific views</strong> (Scheduler, QA Staff, Billing Staff, Administrator). Each role sees only relevant critical issues, operational queues, and metrics. Users with multiple responsibilities can <strong>switch between views</strong> using the role selector dropdown. View preference is saved automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Role Views */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4 Role-Based Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RoleViewCard
                icon={<Calendar className="size-6 text-blue-600" />}
                title="Scheduler View"
                color="blue"
                description="Scheduling, visits, open shifts, caregiver availability"
                focusAreas={[
                  'Delayed visits alerts',
                  'Unfilled shifts warnings',
                  'Visit scheduling status',
                  'Caregiver utilization metrics',
                ]}
              />
              <RoleViewCard
                icon={<ClipboardCheck className="size-6 text-purple-600" />}
                title="QA Staff View"
                color="purple"
                description="Documentation, compliance, QA returns, signatures"
                focusAreas={[
                  'Missing physician signatures',
                  'QA returned documents',
                  'Missing documentation alerts',
                  'Compliance rate metrics',
                ]}
              />
              <RoleViewCard
                icon={<CreditCard className="size-6 text-green-600" />}
                title="Billing Staff View"
                color="green"
                description="Claims, revenue cycle, authorizations, coding"
                focusAreas={[
                  'Authorization exceeded alerts',
                  'Coding issues warnings',
                  'Claims ready for submission',
                  'Days in AR metrics',
                ]}
              />
              <RoleViewCard
                icon={<UserCog className="size-6 text-gray-600" />}
                title="Administrator View"
                color="gray"
                description="Combined operational overview (all data)"
                focusAreas={[
                  'All critical issues across roles',
                  'Complete operational queues',
                  'Comprehensive metrics',
                  'Organization-wide visibility',
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* View Switching */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">View Switching for Multi-Role Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Users with multiple responsibilities can easily switch between role views using the role selector dropdown in the Command Center header.
            </p>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View as:</span>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center gap-2">
                    <UserCog className="size-4" />
                    <span className="text-sm font-medium">Administrator View</span>
                    <ChevronDown className="size-4 text-gray-400" />
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <RefreshCw className="size-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="bg-white border border-gray-200 rounded p-3 space-y-2">
                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <Calendar className="size-4" />
                  <div>
                    <p className="text-sm font-medium">Scheduler View</p>
                    <p className="text-xs text-gray-600">Scheduling, visits, open shifts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <ClipboardCheck className="size-4" />
                  <div>
                    <p className="text-sm font-medium">QA Staff View</p>
                    <p className="text-xs text-gray-600">Documentation, compliance, QA returns</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <CreditCard className="size-4" />
                  <div>
                    <p className="text-sm font-medium">Billing Staff View</p>
                    <p className="text-xs text-gray-600">Claims, revenue cycle, authorizations</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <UserCog className="size-4" />
                  <div>
                    <p className="text-sm font-medium">Administrator View</p>
                    <p className="text-xs text-gray-600">Combined operational overview</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  <CheckCircle2 className="size-3 inline mr-1" />
                  View preference is automatically saved and restored on next visit
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Single Role User</h4>
                <p className="text-xs text-gray-700 mb-2">
                  If user only has one role (e.g., QA Staff), they see a badge instead of dropdown:
                </p>
                <Badge variant="outline" className="gap-2">
                  <ClipboardCheck className="size-4" />
                  QA Staff View
                </Badge>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Multi-Role User</h4>
                <p className="text-xs text-gray-700 mb-2">
                  If user has multiple roles, they see a dropdown selector to switch views:
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">View as:</span>
                  <div className="px-2 py-1 border rounded text-xs flex items-center gap-1">
                    <Calendar className="size-3" />
                    Scheduler View
                    <ChevronDown className="size-3" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Layout Zones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4 Layout Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ZoneCard
                number={1}
                title="Critical Issues"
                icon={<Bell className="size-5 text-red-600" />}
                description="Alert cards for urgent operational problems requiring immediate attention"
                items={[
                  'Delayed visits',
                  'EVV transmission failures',
                  'Missing physician signatures',
                  'Authorization exceeded',
                  'Admissions not ready',
                ]}
              />
              <ZoneCard
                number={2}
                title="Today's Operations"
                icon={<Calendar className="size-5 text-blue-600" />}
                description="Real-time status of current operations and daily workload"
                items={[
                  'Visits scheduled today',
                  'Visits in progress',
                  'Visits completed',
                  'Open shifts',
                ]}
              />
              <ZoneCard
                number={3}
                title="Operational Queues"
                icon={<Activity className="size-5 text-purple-600" />}
                description="Actionable work items across all operational modules"
                items={[
                  'Admissions needing completion',
                  'Delayed visits',
                  'EVV errors',
                  'Missing documentation',
                  'QA returned documents',
                  'Claims ready for submission',
                ]}
              />
              <ZoneCard
                number={4}
                title="Operational Insights"
                icon={<TrendingUp className="size-5 text-green-600" />}
                description="Lightweight summary metrics with trend indicators"
                items={[
                  'Admissions today',
                  'Visits completed today',
                  'Claims ready for billing',
                  'Authorizations expiring soon',
                  'Hospice assessments due',
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Zone 1: Critical Issues Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zone 1: Critical Issues (Alert Cards)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Each critical issue displays as a color-coded alert card showing the count of affected items, severity level, and quick action button to open the relevant queue.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <IssueCardExample
                  title="Delayed Visits"
                  count={8}
                  severity="CRITICAL"
                  description="Visits past scheduled time"
                  color="red"
                />
                <IssueCardExample
                  title="EVV Failures"
                  count={5}
                  severity="HIGH"
                  description="Electronic verification errors"
                  color="orange"
                />
                <IssueCardExample
                  title="Missing Signatures"
                  count={12}
                  severity="MEDIUM"
                  description="Orders awaiting signature"
                  color="amber"
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Issue Card Features:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Color-coded severity:</strong> Critical (red), High (orange), Medium (amber)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Large count display:</strong> Number of affected items prominently shown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Quick action button:</strong> "View Queue" navigates directly to relevant module</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Icon representation:</strong> Visual indicator for issue type</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone 2: Today's Operations Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zone 2: Today's Operations (Status Panels)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Real-time operational status showing current progress with completion percentages and trend indicators.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <OperationCardExample
                  label="Visits Scheduled"
                  value={124}
                  total={124}
                  percentage={100}
                  change="+8%"
                  status="on_track"
                />
                <OperationCardExample
                  label="Visits In Progress"
                  value={42}
                  total={124}
                  percentage={34}
                  change="+12%"
                  status="on_track"
                />
                <OperationCardExample
                  label="Visits Completed"
                  value={74}
                  total={124}
                  percentage={60}
                  change="+5%"
                  status="on_track"
                />
                <OperationCardExample
                  label="Open Shifts"
                  value={8}
                  change="-15%"
                  status="at_risk"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone 3: Operational Queues Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zone 3: Operational Queues (Work Items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Tabbed interface showing actionable work items from 6 queue categories (Admissions, Visits, EVV, Documentation, QA, Billing). Each item displays patient name, admission date, assigned staff, issue description, and priority.
              </p>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                  <Badge variant="outline" className="whitespace-nowrap">All (15)</Badge>
                  <Badge variant="outline" className="whitespace-nowrap">Admissions (3)</Badge>
                  <Badge variant="outline" className="whitespace-nowrap">Visits (4)</Badge>
                  <Badge variant="outline" className="whitespace-nowrap">EVV (2)</Badge>
                  <Badge variant="outline" className="whitespace-nowrap">Documentation (3)</Badge>
                  <Badge variant="outline" className="whitespace-nowrap">QA (2)</Badge>
                  <Badge variant="outline" className="whitespace-nowrap">Billing (1)</Badge>
                </div>

                <div className="space-y-2">
                  <QueueItemExample
                    patient="Mary Johnson"
                    issue="Missing physician orders"
                    priority="URGENT"
                    priorityColor="red"
                    admission="03/01/2024"
                    staff="Sarah Chen"
                    days={3}
                  />
                  <QueueItemExample
                    patient="Robert Smith"
                    issue="Visit delayed by 2 hours"
                    priority="HIGH"
                    priorityColor="orange"
                    admission="02/15/2024"
                    staff="Mike Johnson"
                    days={0}
                  />
                  <QueueItemExample
                    patient="Patricia Williams"
                    issue="EVV transmission failed - clock in/out mismatch"
                    priority="URGENT"
                    priorityColor="red"
                    admission="02/20/2024"
                    staff="Emily Rodriguez"
                    days={1}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone 4: Operational Insights Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zone 4: Operational Insights (Metrics)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Lightweight summary metrics with trend indicators showing percentage change versus yesterday.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <InsightCardExample
                  label="Admissions Today"
                  value={7}
                  trend="↑ 15%"
                  trendColor="text-green-600"
                  icon="👥"
                />
                <InsightCardExample
                  label="Visits Completed"
                  value={74}
                  trend="↑ 5%"
                  trendColor="text-green-600"
                  icon="✅"
                />
                <InsightCardExample
                  label="Claims Ready"
                  value={23}
                  trend="↑ 8%"
                  trendColor="text-green-600"
                  icon="💰"
                />
                <InsightCardExample
                  label="Auths Expiring"
                  value={12}
                  trend="↓ 10%"
                  trendColor="text-red-600"
                  icon="🛡️"
                />
                <InsightCardExample
                  label="Assessments Due"
                  value={5}
                  trend="→ 0%"
                  trendColor="text-gray-600"
                  icon="📋"
                />
              </div>
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
              title="Morning Operations Review"
              scenario="Operations manager starts their day"
              steps={[
                'Open Command Center dashboard',
                'Check Critical Issues section - see 8 delayed visits (red alert)',
                'Click "View Queue" on Delayed Visits card',
                'Review each delayed visit, reassign caregivers as needed',
                'Return to Command Center - delayed visits count drops to 2',
                'Check Today\'s Operations - 124 visits scheduled, 74 completed (60%)',
                'Verify operational insights - 7 admissions today (↑15% vs yesterday)',
              ]}
              benefit="Comprehensive operational snapshot in under 2 minutes"
            />

            <UseCaseCard
              title="Critical Issue Response"
              scenario="EVV transmission failures detected"
              steps={[
                'Red alert appears: "EVV Transmission Failures - 5 items"',
                'Click "View Queue" button',
                'Navigate to EVV errors queue',
                'See specific errors: clock in/out mismatch, GPS verification failed',
                'Contact caregivers to resolve EVV issues',
                'Resubmit EVV data',
                'Issue count decreases as errors resolved',
              ]}
              benefit="Immediate visibility and action on critical operational issues"
            />

            <UseCaseCard
              title="Workload Distribution"
              scenario="Checking team workload balance"
              steps={[
                'View Operational Queues section',
                'Tab through different queue types',
                'Notice Documentation queue has 3 items all assigned to same person',
                'See QA queue has 2 items from different coordinators',
                'Open items and reassign for better distribution',
                'Monitor queue counts throughout day',
              ]}
              benefit="Proactive workload management across teams"
            />
          </CardContent>
        </Card>

        {/* Try It Out */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Zap className="size-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Try the Command Center</h3>
            <p className="text-sm text-green-800 mb-4">
              Experience the complete real-time operational dashboard with all 4 zones
            </p>
            <Button onClick={() => setShowLive(true)} size="lg">
              Launch Command Center
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Layout Zones</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-red-600">5</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Critical Issue Types</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">6</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Queue Categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">∞</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Real-Time Updates</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface ZoneCardProps {
  number: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  items: string[];
}

function ZoneCard({ number, title, icon, description, items }: ZoneCardProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
          {number}
        </div>
        {icon}
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
            <span className="text-blue-600">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface IssueCardExampleProps {
  title: string;
  count: number;
  severity: string;
  description: string;
  color: 'red' | 'orange' | 'amber';
}

function IssueCardExample({ title, count, severity, description, color }: IssueCardExampleProps) {
  const colorClasses = {
    red: 'border-red-300 bg-red-50',
    orange: 'border-orange-300 bg-orange-50',
    amber: 'border-amber-300 bg-amber-50',
  };

  const badgeClasses = {
    red: 'bg-red-600 text-white',
    orange: 'bg-orange-600 text-white',
    amber: 'bg-amber-600 text-white',
  };

  return (
    <div className={`p-4 border-2 rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="size-10 bg-white rounded-lg flex items-center justify-center">
          <Clock className="size-5 text-red-600" />
        </div>
        <Badge className={badgeClasses[color]}>{severity}</Badge>
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-gray-900 mb-2">{count}</p>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <Button size="sm" variant="outline" className="w-full">View Queue →</Button>
    </div>
  );
}

interface OperationCardExampleProps {
  label: string;
  value: number;
  total?: number;
  percentage?: number;
  change: string;
  status: 'on_track' | 'at_risk';
}

function OperationCardExample({ label, value, total, percentage, change, status }: OperationCardExampleProps) {
  const statusColors = {
    on_track: 'border-green-200 bg-green-50',
    at_risk: 'border-amber-200 bg-amber-50',
  };

  return (
    <div className={`p-4 border-2 rounded-lg ${statusColors[status]}`}>
      <div className="flex items-start justify-between mb-3">
        <Calendar className="size-5 text-gray-700" />
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">{change}</Badge>
      </div>
      <p className="text-sm text-gray-700 mb-1">{label}</p>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {total && <span className="text-sm text-gray-600">/ {total}</span>}
      </div>
      {percentage !== undefined && (
        <div className="space-y-1">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: `${percentage}%` }} />
          </div>
          <p className="text-xs text-gray-600">{percentage}% complete</p>
        </div>
      )}
    </div>
  );
}

interface QueueItemExampleProps {
  patient: string;
  issue: string;
  priority: string;
  priorityColor: string;
  admission: string;
  staff: string;
  days: number;
}

function QueueItemExample({ patient, issue, priority, priorityColor, admission, staff, days }: QueueItemExampleProps) {
  const priorityColors: Record<string, string> = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm text-gray-900">{patient}</p>
          <Badge className={`text-xs ${priorityColors[priorityColor]}`}>{priority}</Badge>
        </div>
        <p className="text-sm text-gray-700 mb-1">{issue}</p>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>Admission: {admission}</span>
          <span>•</span>
          <span>Assigned: {staff}</span>
          <span>•</span>
          <span>{days} days pending</span>
        </div>
      </div>
      <span className="text-gray-400">→</span>
    </div>
  );
}

interface InsightCardExampleProps {
  label: string;
  value: number;
  trend: string;
  trendColor: string;
  icon: string;
}

function InsightCardExample({ label, value, trend, trendColor, icon }: InsightCardExampleProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-700 font-medium mt-1">{label}</p>
      <p className={`text-xs ${trendColor} mt-1`}>{trend} vs yesterday</p>
    </div>
  );
}

interface UseCaseCardProps {
  title: string;
  scenario: string;
  steps: string[];
  benefit: string;
}

function UseCaseCard({ title, scenario, steps, benefit }: UseCaseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{scenario}</p>
      <p className="text-xs font-semibold text-gray-700 mb-2">Flow:</p>
      <ol className="space-y-1.5 mb-3">
        {steps.map((step, i) => (
          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-blue-600 font-semibold">{i + 1}.</span>
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
  );
}

interface RoleViewCardProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  description: string;
  focusAreas: string[];
}

function RoleViewCard({ icon, title, color, description, focusAreas }: RoleViewCardProps) {
  return (
    <div className="p-4 border-2 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-10 bg-white rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <ul className="space-y-1">
        {focusAreas.map((area, i) => (
          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
            <span className={`text-${color}-600`}>•</span>
            <span>{area}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}