/**
 * Care Operations Command Center - Role-Based Views
 * 
 * Enhanced with role-based filtering and view switching.
 * 
 * Roles:
 * - Scheduler: Scheduling, visits, open shifts, caregiver availability
 * - QA Staff: Documentation, compliance, QA returns, signatures
 * - Billing Staff: Claims, revenue cycle, authorizations, coding
 * - Administrator: Combined operational overview (all data)
 * 
 * Features:
 * - Role-specific critical issues
 * - Role-filtered operational queues
 * - Role-relevant metrics
 * - View switching for multi-role users
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  Clock,
  FileX,
  ShieldAlert,
  UserX,
  CheckCircle2,
  PlayCircle,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  FileText,
  ChevronRight,
  RefreshCw,
  Bell,
  Zap,
  LayoutGrid,
  ClipboardCheck,
  CreditCard,
  UserCog,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { PageHeader } from '../design-system/PageLayout';

// ==================== TYPE DEFINITIONS ====================

export type UserRole = 'scheduler' | 'qa_staff' | 'billing_staff' | 'administrator';

export interface RoleConfig {
  id: UserRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

export interface CriticalIssue {
  id: string;
  type: string;
  title: string;
  count: number;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  action_url: string;
  icon: React.ComponentType<{ className?: string }>;
  relevant_roles: UserRole[];
  updated_at: string;
}

export interface TodayOperation {
  id: string;
  label: string;
  value: number;
  total?: number;
  status: 'on_track' | 'at_risk' | 'critical';
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  relevant_roles: UserRole[];
}

export interface QueueItem {
  id: string;
  queue_type: string;
  patient_name: string;
  patient_id: string;
  admission_date: string;
  assigned_staff: string;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  days_pending: number;
  action_url: string;
  relevant_roles: UserRole[];
}

export interface OperationalInsight {
  id: string;
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change_percent: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  relevant_roles: UserRole[];
}

// ==================== ROLE CONFIGURATIONS ====================

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  scheduler: {
    id: 'scheduler',
    label: 'Scheduler View',
    icon: Calendar,
    color: 'blue',
    description: 'Scheduling, visits, open shifts, caregiver availability',
  },
  qa_staff: {
    id: 'qa_staff',
    label: 'QA Staff View',
    icon: ClipboardCheck,
    color: 'purple',
    description: 'Documentation, compliance, QA returns, signatures',
  },
  billing_staff: {
    id: 'billing_staff',
    label: 'Billing Staff View',
    icon: CreditCard,
    color: 'green',
    description: 'Claims, revenue cycle, authorizations, coding',
  },
  administrator: {
    id: 'administrator',
    label: 'Administrator View',
    icon: UserCog,
    color: 'gray',
    description: 'Combined operational overview (all data)',
  },
};

// ==================== ROLE VIEW SWITCHER ====================

interface RoleViewSwitcherProps {
  currentRole: UserRole;
  availableRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
}

function RoleViewSwitcher({ currentRole, availableRoles, onRoleChange }: RoleViewSwitcherProps) {
  const currentConfig = ROLE_CONFIGS[currentRole];
  const Icon = currentConfig.icon;

  if (availableRoles.length === 1) {
    return (
      <Badge variant="outline" className="gap-2 px-3 py-1.5">
        <Icon className="size-4" />
        {currentConfig.label}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">View as:</span>
      <Select value={currentRole} onValueChange={(value: UserRole) => onRoleChange(value)}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <Icon className="size-4" />
            <span>{currentConfig.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((roleId) => {
            const config = ROLE_CONFIGS[roleId];
            const RoleIcon = config.icon;
            return (
              <SelectItem key={roleId} value={roleId}>
                <div className="flex items-center gap-2">
                  <RoleIcon className="size-4" />
                  <div>
                    <p className="font-medium">{config.label}</p>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

// ==================== CRITICAL ISSUES SECTION ====================

interface CriticalIssuesSectionProps {
  issues: CriticalIssue[];
  currentRole: UserRole;
  onNavigate: (url: string) => void;
}

function CriticalIssuesSection({ issues, currentRole, onNavigate }: CriticalIssuesSectionProps) {
  const filteredIssues = useMemo(() => {
    if (currentRole === 'administrator') return issues;
    return issues.filter(issue => issue.relevant_roles.includes(currentRole));
  }, [issues, currentRole]);

  const criticalCount = filteredIssues.filter(i => i.severity === 'critical').length;
  const highCount = filteredIssues.filter(i => i.severity === 'high').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="size-5 text-red-600" />
            Critical Issues
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {criticalCount} critical, {highCount} high priority
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="size-3" />
          Live
        </Badge>
      </div>

      {filteredIssues.length === 0 ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="size-12 text-green-600 mx-auto mb-3" />
            <p className="font-semibold text-green-900">All Clear!</p>
            <p className="text-sm text-green-800 mt-1">No critical issues for your role</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIssues.map((issue) => {
            const Icon = issue.icon;
            const severityColors = {
              critical: 'border-red-300 bg-red-50',
              high: 'border-orange-300 bg-orange-50',
              medium: 'border-amber-300 bg-amber-50',
            };
            const badgeColors = {
              critical: 'bg-red-600 text-white',
              high: 'bg-orange-600 text-white',
              medium: 'bg-amber-600 text-white',
            };

            return (
              <Card
                key={issue.id}
                className={`cursor-pointer hover:shadow-md transition-all ${severityColors[issue.severity]}`}
                onClick={() => onNavigate(issue.action_url)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="size-10 bg-white rounded-lg flex items-center justify-center">
                      <Icon className="size-5 text-red-600" />
                    </div>
                    <Badge className={badgeColors[issue.severity]}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{issue.title}</h4>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{issue.count}</p>
                  <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    View Queue
                    <ChevronRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== TODAY'S OPERATIONS SECTION ====================

interface TodayOperationsSectionProps {
  operations: TodayOperation[];
  currentRole: UserRole;
}

function TodayOperationsSection({ operations, currentRole }: TodayOperationsSectionProps) {
  const filteredOps = useMemo(() => {
    if (currentRole === 'administrator') return operations;
    return operations.filter(op => op.relevant_roles.includes(currentRole));
  }, [operations, currentRole]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="size-5 text-blue-600" />
          Today's Operations
        </h2>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredOps.map((op) => {
          const Icon = op.icon;
          const statusColors = {
            on_track: 'border-green-200 bg-green-50',
            at_risk: 'border-amber-200 bg-amber-50',
            critical: 'border-red-200 bg-red-50',
          };
          const percentage = op.total ? Math.round((op.value / op.total) * 100) : 100;

          return (
            <Card key={op.id} className={statusColors[op.status]}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Icon className="size-5 text-gray-700" />
                  {op.change !== undefined && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        op.change > 0 
                          ? 'bg-green-100 text-green-700' 
                          : op.change < 0 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {op.change > 0 ? '+' : ''}{op.change}%
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1">{op.label}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{op.value}</span>
                  {op.total && <span className="text-sm text-gray-600">/ {op.total}</span>}
                </div>
                {op.total && (
                  <div className="space-y-1">
                    <Progress value={percentage} className="h-1.5" />
                    <p className="text-xs text-gray-600">{percentage}% complete</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ==================== OPERATIONAL QUEUES SECTION ====================

interface OperationalQueuesSectionProps {
  queues: Record<string, QueueItem[]>;
  currentRole: UserRole;
  onNavigate: (url: string) => void;
}

function OperationalQueuesSection({ queues, currentRole, onNavigate }: OperationalQueuesSectionProps) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredQueues = useMemo(() => {
    if (currentRole === 'administrator') return queues;
    
    const filtered: Record<string, QueueItem[]> = {};
    Object.entries(queues).forEach(([key, items]) => {
      filtered[key] = items.filter(item => item.relevant_roles.includes(currentRole));
    });
    return filtered;
  }, [queues, currentRole]);

  const allItems = Object.values(filteredQueues).flat();
  const urgentCount = allItems.filter(item => item.priority === 'urgent').length;

  // Queue configs with role-specific visibility
  const queueConfigs: Record<string, { label: string; color: string; icon: any; roles: UserRole[] }> = {
    scheduling: { label: 'Scheduling', color: 'blue', icon: Calendar, roles: ['scheduler', 'administrator'] },
    visits: { label: 'Visits', color: 'purple', icon: PlayCircle, roles: ['scheduler', 'administrator'] },
    documentation: { label: 'Documentation', color: 'amber', icon: FileText, roles: ['qa_staff', 'administrator'] },
    qa: { label: 'QA Returns', color: 'orange', icon: ClipboardCheck, roles: ['qa_staff', 'administrator'] },
    signatures: { label: 'Signatures', color: 'red', icon: FileX, roles: ['qa_staff', 'administrator'] },
    billing: { label: 'Ready to Bill', color: 'green', icon: DollarSign, roles: ['billing_staff', 'administrator'] },
    authorization: { label: 'Authorizations', color: 'blue', icon: ShieldAlert, roles: ['billing_staff', 'administrator'] },
    coding: { label: 'Coding', color: 'purple', icon: FileText, roles: ['billing_staff', 'administrator'] },
  };

  const visibleQueues = useMemo(() => {
    if (currentRole === 'administrator') return queueConfigs;
    
    const visible: typeof queueConfigs = {};
    Object.entries(queueConfigs).forEach(([key, config]) => {
      if (config.roles.includes(currentRole)) {
        visible[key] = config;
      }
    });
    return visible;
  }, [currentRole]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="size-5 text-purple-600" />
            Operational Queues
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {allItems.length} items, {urgentCount} urgent
          </p>
        </div>
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-3">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Object.keys(visibleQueues).length + 1}, 1fr)` }}>
              <TabsTrigger value="all">
                All ({allItems.length})
              </TabsTrigger>
              {Object.entries(visibleQueues).map(([key, config]) => (
                <TabsTrigger key={key} value={key}>
                  {config.label} ({filteredQueues[key]?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="all" className="mt-0">
              <QueueItemsList items={allItems} onNavigate={onNavigate} />
            </TabsContent>

            {Object.keys(visibleQueues).map((key) => (
              <TabsContent key={key} value={key} className="mt-0">
                <QueueItemsList items={filteredQueues[key] || []} onNavigate={onNavigate} />
              </TabsContent>
            ))}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

// ==================== QUEUE ITEMS LIST ====================

interface QueueItemsListProps {
  items: QueueItem[];
  onNavigate: (url: string) => void;
}

function QueueItemsList({ items, onNavigate }: QueueItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle2 className="size-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm">No items in this queue</p>
      </div>
    );
  }

  const priorityColors = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-2 max-h-[400px] overflow-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onNavigate(item.action_url)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm text-gray-900">{item.patient_name}</p>
              <Badge className={`text-xs ${priorityColors[item.priority]}`}>
                {item.priority.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-1">{item.issue_description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>Admission: {new Date(item.admission_date).toLocaleDateString()}</span>
              <span>•</span>
              <span>Assigned: {item.assigned_staff}</span>
              <span>•</span>
              <span>{item.days_pending} days pending</span>
            </div>
          </div>
          <ChevronRight className="size-5 text-gray-400 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ==================== OPERATIONAL INSIGHTS SECTION ====================

interface OperationalInsightsSectionProps {
  insights: OperationalInsight[];
  currentRole: UserRole;
}

function OperationalInsightsSection({ insights, currentRole }: OperationalInsightsSectionProps) {
  const filteredInsights = useMemo(() => {
    if (currentRole === 'administrator') return insights;
    return insights.filter(insight => insight.relevant_roles.includes(currentRole));
  }, [insights, currentRole]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="size-5 text-green-600" />
          Operational Insights
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredInsights.map((insight) => {
          const Icon = insight.icon;
          const trendIcon = insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→';
          const trendColor = 
            insight.trend === 'up' ? 'text-green-600' : 
            insight.trend === 'down' ? 'text-red-600' : 
            'text-gray-600';

          return (
            <Card key={insight.id}>
              <CardContent className="p-4 text-center">
                <Icon className={`size-5 mx-auto mb-2 text-${insight.color}-600`} />
                <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
                <p className="text-xs text-gray-700 font-medium mt-1">{insight.label}</p>
                {insight.change_percent !== 0 && (
                  <p className={`text-xs ${trendColor} mt-1`}>
                    {trendIcon} {Math.abs(insight.change_percent)}% vs yesterday
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ==================== MAIN COMMAND CENTER ====================

interface CareOpsCommandCenterProps {
  initialRole?: UserRole;
  availableRoles?: UserRole[];
  initialData?: {
    issues?: CriticalIssue[];
    operations?: TodayOperation[];
    queues?: Record<string, QueueItem[]>;
    insights?: OperationalInsight[];
  };
}

export default function CareOpsCommandCenter({ 
  initialRole = 'administrator',
  availableRoles = ['scheduler', 'qa_staff', 'billing_staff', 'administrator'],
  initialData 
}: CareOpsCommandCenterProps) {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const [refreshing, setRefreshing] = useState(false);

  // Load saved role preference
  useEffect(() => {
    const savedRole = localStorage.getItem('command_center_role') as UserRole;
    if (savedRole && availableRoles.includes(savedRole)) {
      setCurrentRole(savedRole);
    }
  }, [availableRoles]);

  // Save role preference
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('command_center_role', role);
  };

  // Use mock data if no initial data provided
  const issues = initialData?.issues || generateMockIssues();
  const operations = initialData?.operations || generateMockOperations();
  const queues = initialData?.queues || generateMockQueues();
  const insights = initialData?.insights || generateMockInsights();

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const currentConfig = ROLE_CONFIGS[currentRole];

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-[1800px] mx-auto p-6">
        <PageHeader
          icon={<Zap className="size-8" />}
          title="Care Operations Command Center"
          subtitle={currentConfig.description}
          actions={
            <div className="flex items-center gap-3">
              <RoleViewSwitcher
                currentRole={currentRole}
                availableRoles={availableRoles}
                onRoleChange={handleRoleChange}
              />
              <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
                <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          }
        />

        <div className="space-y-6">
          {/* Critical Issues */}
          <CriticalIssuesSection 
            issues={issues} 
            currentRole={currentRole}
            onNavigate={handleNavigate} 
          />

          {/* Today's Operations */}
          <TodayOperationsSection 
            operations={operations}
            currentRole={currentRole}
          />

          {/* Operational Queues */}
          <OperationalQueuesSection 
            queues={queues}
            currentRole={currentRole}
            onNavigate={handleNavigate} 
          />

          {/* Operational Insights */}
          <OperationalInsightsSection 
            insights={insights}
            currentRole={currentRole}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== MOCK DATA GENERATORS ====================

function generateMockIssues(): CriticalIssue[] {
  return [
    {
      id: 'ISS-001',
      type: 'delayed_visits',
      title: 'Delayed Visits',
      count: 8,
      severity: 'critical',
      description: 'Visits past scheduled time without completion',
      action_url: '/operational-queues?queue=delayed_visits',
      icon: Clock,
      relevant_roles: ['scheduler', 'administrator'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ISS-002',
      type: 'open_shifts',
      title: 'Unfilled Shifts',
      count: 12,
      severity: 'high',
      description: 'Shifts without assigned caregivers',
      action_url: '/scheduling',
      icon: UserX,
      relevant_roles: ['scheduler', 'administrator'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ISS-003',
      type: 'missing_signatures',
      title: 'Missing Physician Signatures',
      count: 15,
      severity: 'high',
      description: 'Orders awaiting physician signature',
      action_url: '/operational-queues?queue=signatures',
      icon: FileX,
      relevant_roles: ['qa_staff', 'administrator'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ISS-004',
      type: 'qa_returns',
      title: 'QA Returned Documents',
      count: 9,
      severity: 'medium',
      description: 'Documents returned by QA for correction',
      action_url: '/clinical/qa-review',
      icon: AlertCircle,
      relevant_roles: ['qa_staff', 'administrator'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ISS-005',
      type: 'missing_documentation',
      title: 'Missing Documentation',
      count: 18,
      severity: 'high',
      description: 'Visits with incomplete documentation',
      action_url: '/clinical/visit-notes',
      icon: FileText,
      relevant_roles: ['qa_staff', 'administrator'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ISS-006',
      type: 'auth_exceeded',
      title: 'Authorization Exceeded',
      count: 3,
      severity: 'critical',
      description: 'Admissions exceeding authorized visits',
      action_url: '/authorization-tracker',
      icon: ShieldAlert,
      relevant_roles: ['billing_staff', 'administrator'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ISS-007',
      type: 'coding_issues',
      title: 'Coding Issues',
      count: 7,
      severity: 'medium',
      description: 'Claims with coding errors',
      action_url: '/billing',
      icon: FileX,
      relevant_roles: ['billing_staff', 'administrator'],
      updated_at: new Date().toISOString(),
    },
    {
      id: 'ISS-008',
      type: 'claims_hold',
      title: 'Claims on Hold',
      count: 5,
      severity: 'high',
      description: 'Claims awaiting information',
      action_url: '/billing',
      icon: Clock,
      relevant_roles: ['billing_staff', 'administrator'],
      updated_at: new Date().toISOString(),
    },
  ];
}

function generateMockOperations(): TodayOperation[] {
  return [
    {
      id: 'OP-001',
      label: 'Visits Scheduled Today',
      value: 124,
      total: 124,
      status: 'on_track',
      icon: Calendar,
      change: 8,
      relevant_roles: ['scheduler', 'administrator'],
    },
    {
      id: 'OP-002',
      label: 'Visits In Progress',
      value: 42,
      total: 124,
      status: 'on_track',
      icon: PlayCircle,
      change: 12,
      relevant_roles: ['scheduler', 'administrator'],
    },
    {
      id: 'OP-003',
      label: 'Visits Completed',
      value: 74,
      total: 124,
      status: 'on_track',
      icon: CheckCircle2,
      change: 5,
      relevant_roles: ['scheduler', 'administrator'],
    },
    {
      id: 'OP-004',
      label: 'Open Shifts',
      value: 12,
      status: 'at_risk',
      icon: Users,
      change: -15,
      relevant_roles: ['scheduler', 'administrator'],
    },
    {
      id: 'OP-005',
      label: 'Documents in QA',
      value: 23,
      status: 'on_track',
      icon: ClipboardCheck,
      change: 3,
      relevant_roles: ['qa_staff', 'administrator'],
    },
    {
      id: 'OP-006',
      label: 'Claims Submitted Today',
      value: 18,
      status: 'on_track',
      icon: DollarSign,
      change: 12,
      relevant_roles: ['billing_staff', 'administrator'],
    },
  ];
}

function generateMockQueues(): Record<string, QueueItem[]> {
  const baseItems: QueueItem[] = [
    {
      id: 'Q-001',
      queue_type: 'scheduling',
      patient_name: 'Mary Johnson',
      patient_id: 'PAT-001',
      admission_date: '2024-03-01',
      assigned_staff: 'Sarah Chen',
      issue_description: 'Schedule initial assessment visit',
      priority: 'urgent',
      days_pending: 2,
      action_url: '/scheduling',
      relevant_roles: ['scheduler', 'administrator'],
    },
    {
      id: 'Q-002',
      queue_type: 'visits',
      patient_name: 'Robert Smith',
      patient_id: 'PAT-002',
      admission_date: '2024-02-15',
      assigned_staff: 'Mike Johnson',
      issue_description: 'Visit delayed by 2 hours',
      priority: 'high',
      days_pending: 0,
      action_url: '/poc/visit/VST-123',
      relevant_roles: ['scheduler', 'administrator'],
    },
    {
      id: 'Q-003',
      queue_type: 'documentation',
      patient_name: 'Patricia Williams',
      patient_id: 'PAT-003',
      admission_date: '2024-02-20',
      assigned_staff: 'Emily Rodriguez',
      issue_description: 'OASIS assessment incomplete',
      priority: 'high',
      days_pending: 3,
      action_url: '/clinical/visit-notes',
      relevant_roles: ['qa_staff', 'administrator'],
    },
    {
      id: 'Q-004',
      queue_type: 'qa',
      patient_name: 'Michael Brown',
      patient_id: 'PAT-004',
      admission_date: '2024-02-10',
      assigned_staff: 'David Kim',
      issue_description: 'QA returned: Missing vital signs',
      priority: 'medium',
      days_pending: 2,
      action_url: '/clinical/qa-review',
      relevant_roles: ['qa_staff', 'administrator'],
    },
    {
      id: 'Q-005',
      queue_type: 'signatures',
      patient_name: 'Linda Davis',
      patient_id: 'PAT-005',
      admission_date: '2024-02-05',
      assigned_staff: 'Sarah Chen',
      issue_description: 'Physician signature pending on orders',
      priority: 'urgent',
      days_pending: 5,
      action_url: '/clinical/verbal-orders',
      relevant_roles: ['qa_staff', 'administrator'],
    },
    {
      id: 'Q-006',
      queue_type: 'billing',
      patient_name: 'William Miller',
      patient_id: 'PAT-006',
      admission_date: '2024-01-15',
      assigned_staff: 'Mike Johnson',
      issue_description: 'Episode ready for claim submission',
      priority: 'low',
      days_pending: 1,
      action_url: '/billing',
      relevant_roles: ['billing_staff', 'administrator'],
    },
    {
      id: 'Q-007',
      queue_type: 'authorization',
      patient_name: 'Barbara Wilson',
      patient_id: 'PAT-007',
      admission_date: '2024-02-01',
      assigned_staff: 'Emily Rodriguez',
      issue_description: 'Authorization expires in 7 days',
      priority: 'high',
      days_pending: 0,
      action_url: '/authorization-tracker',
      relevant_roles: ['billing_staff', 'administrator'],
    },
    {
      id: 'Q-008',
      queue_type: 'coding',
      patient_name: 'Richard Moore',
      patient_id: 'PAT-008',
      admission_date: '2024-01-20',
      assigned_staff: 'David Kim',
      issue_description: 'ICD-10 code needs verification',
      priority: 'medium',
      days_pending: 1,
      action_url: '/billing',
      relevant_roles: ['billing_staff', 'administrator'],
    },
  ];

  return {
    scheduling: baseItems.filter(i => i.queue_type === 'scheduling'),
    visits: baseItems.filter(i => i.queue_type === 'visits'),
    documentation: baseItems.filter(i => i.queue_type === 'documentation'),
    qa: baseItems.filter(i => i.queue_type === 'qa'),
    signatures: baseItems.filter(i => i.queue_type === 'signatures'),
    billing: baseItems.filter(i => i.queue_type === 'billing'),
    authorization: baseItems.filter(i => i.queue_type === 'authorization'),
    coding: baseItems.filter(i => i.queue_type === 'coding'),
  };
}

function generateMockInsights(): OperationalInsight[] {
  return [
    {
      id: 'INS-001',
      label: 'Visits Scheduled',
      value: 124,
      trend: 'up',
      change_percent: 8,
      icon: Calendar,
      color: 'blue',
      relevant_roles: ['scheduler', 'administrator'],
    },
    {
      id: 'INS-002',
      label: 'Caregiver Utilization',
      value: 87,
      trend: 'up',
      change_percent: 5,
      icon: Users,
      color: 'green',
      relevant_roles: ['scheduler', 'administrator'],
    },
    {
      id: 'INS-003',
      label: 'Documents in QA',
      value: 23,
      trend: 'down',
      change_percent: 12,
      icon: ClipboardCheck,
      color: 'purple',
      relevant_roles: ['qa_staff', 'administrator'],
    },
    {
      id: 'INS-004',
      label: 'Compliance Rate',
      value: 94,
      trend: 'up',
      change_percent: 2,
      icon: CheckCircle2,
      color: 'green',
      relevant_roles: ['qa_staff', 'administrator'],
    },
    {
      id: 'INS-005',
      label: 'Claims Submitted',
      value: 18,
      trend: 'up',
      change_percent: 12,
      icon: DollarSign,
      color: 'green',
      relevant_roles: ['billing_staff', 'administrator'],
    },
    {
      id: 'INS-006',
      label: 'Days in AR',
      value: 38,
      trend: 'down',
      change_percent: 8,
      icon: TrendingUp,
      color: 'green',
      relevant_roles: ['billing_staff', 'administrator'],
    },
    {
      id: 'INS-007',
      label: 'Clean Claim Rate',
      value: 92,
      trend: 'up',
      change_percent: 3,
      icon: CheckCircle2,
      color: 'green',
      relevant_roles: ['billing_staff', 'administrator'],
    },
  ];
}
