/**
 * Operational Workspace System
 * 
 * Task-oriented workspaces with 5 zones:
 * 1. Critical Issues - Items needing immediate attention
 * 2. Today's Work - Tasks scheduled for the day
 * 3. Resume Work - Recently accessed patients/admissions
 * 4. Quick Actions - Common actions for the role
 * 5. Operational Insights - High-level metrics
 * 
 * Features:
 * - Role-aware configuration
 * - Action-oriented (not static dashboards)
 * - One-click access to tasks
 * - Real-time updates
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  FileText,
  Briefcase,
  ChevronRight,
  Plus,
  History,
  Zap,
  Target,
  Activity,
  AlertCircle,
  XCircle,
  Users,
  DollarSign,
  ClipboardCheck,
  Phone,
  MessageSquare,
  Receipt,
  CalendarClock,
  Stethoscope,
  Heart,
  Star,
  ExternalLink,
  ArrowRight,
  BarChart3,
  TrendingUp as Trending,
  Timer,
  Bell,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export type UserRole = 
  | 'clinician' 
  | 'billing_specialist' 
  | 'scheduler' 
  | 'case_manager' 
  | 'admin' 
  | 'intake_coordinator'
  | 'qa_specialist'
  | 'hospice_coordinator';

export interface CriticalIssue {
  id: string;
  type: 'urgent' | 'error' | 'warning';
  title: string;
  description: string;
  patientName?: string;
  admissionId?: string;
  dueDate?: string;
  action: {
    label: string;
    path: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TodayTask {
  id: string;
  type: 'visit' | 'assessment' | 'call' | 'documentation' | 'billing' | 'meeting';
  title: string;
  patientName?: string;
  scheduledTime?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  action: {
    label: string;
    path: string;
  };
}

export interface RecentItem {
  id: string;
  type: 'patient' | 'admission' | 'visit' | 'document';
  title: string;
  subtitle?: string;
  lastAccessed: string;
  path: string;
  metadata?: {
    status?: string;
    alerts?: number;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  onClick?: () => void;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

export interface OperationalMetric {
  id: string;
  label: string;
  value: number | string;
  change?: {
    value: number;
    direction: 'up' | 'down';
    isPositive: boolean;
  };
  target?: number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

export interface WorkspaceConfig {
  role: UserRole;
  displayName: string;
  criticalIssues: CriticalIssue[];
  todayTasks: TodayTask[];
  recentItems: RecentItem[];
  quickActions: QuickAction[];
  metrics: OperationalMetric[];
}

// ==================== CRITICAL ISSUES ZONE ====================

interface CriticalIssuesZoneProps {
  issues: CriticalIssue[];
  onDismiss?: (id: string) => void;
}

export function CriticalIssuesZone({ issues, onDismiss }: CriticalIssuesZoneProps) {
  const navigate = useNavigate();

  if (issues.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">All Clear</h3>
              <p className="text-sm text-green-700">No critical issues require your attention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-600" />
          Critical Issues
          <Badge className="bg-red-600 text-white">{issues.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {issues.map((issue) => (
          <CriticalIssueCard key={issue.id} issue={issue} onDismiss={onDismiss} />
        ))}
      </CardContent>
    </Card>
  );
}

function CriticalIssueCard({ issue, onDismiss }: { issue: CriticalIssue; onDismiss?: (id: string) => void }) {
  const navigate = useNavigate();
  const Icon = issue.icon || AlertCircle;

  const typeStyles = {
    urgent: 'border-red-300 bg-red-50',
    error: 'border-orange-300 bg-orange-50',
    warning: 'border-amber-300 bg-amber-50',
  };

  const iconStyles = {
    urgent: 'text-red-600',
    error: 'text-orange-600',
    warning: 'text-amber-600',
  };

  return (
    <div className={`p-3 rounded-lg border-2 ${typeStyles[issue.type]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`size-5 flex-shrink-0 mt-0.5 ${iconStyles[issue.type]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">{issue.title}</h4>
              <p className="text-xs text-gray-700 mt-0.5">{issue.description}</p>
              {issue.patientName && (
                <p className="text-xs text-gray-600 mt-1">
                  <User className="size-3 inline mr-1" />
                  {issue.patientName}
                  {issue.admissionId && ` • ${issue.admissionId}`}
                </p>
              )}
              {issue.dueDate && (
                <p className="text-xs text-gray-600 mt-1">
                  <Clock className="size-3 inline mr-1" />
                  Due: {new Date(issue.dueDate).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => navigate(issue.action.path)}
              className="h-7 text-xs"
            >
              {issue.action.label}
              <ArrowRight className="size-3 ml-1" />
            </Button>
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(issue.id)}
                className="h-7 text-xs"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== TODAY'S WORK ZONE ====================

interface TodayWorkZoneProps {
  tasks: TodayTask[];
  onComplete?: (id: string) => void;
}

export function TodayWorkZone({ tasks, onComplete }: TodayWorkZoneProps) {
  const navigate = useNavigate();

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="size-5 text-blue-600" />
          Today's Work
          <Badge variant="outline">{pendingTasks.length} pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="size-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No tasks scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* In Progress */}
            {inProgressTasks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">In Progress</h4>
                <div className="space-y-2">
                  {inProgressTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onComplete={onComplete} />
                  ))}
                </div>
              </div>
            )}

            {/* Pending */}
            {pendingTasks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Pending</h4>
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onComplete={onComplete} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedTasks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Completed</h4>
                <div className="space-y-2">
                  {completedTasks.slice(0, 3).map((task) => (
                    <TaskCard key={task.id} task={task} onComplete={onComplete} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskCard({ task, onComplete }: { task: TodayTask; onComplete?: (id: string) => void }) {
  const navigate = useNavigate();

  const typeIcons = {
    visit: Stethoscope,
    assessment: ClipboardCheck,
    call: Phone,
    documentation: FileText,
    billing: Receipt,
    meeting: Users,
  };

  const Icon = typeIcons[task.type];

  const priorityColors = {
    high: 'text-red-600 bg-red-100',
    medium: 'text-amber-600 bg-amber-100',
    low: 'text-blue-600 bg-blue-100',
  };

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        task.status === 'completed'
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : task.status === 'in_progress'
          ? 'border-blue-300 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            task.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
          }`}
        >
          {task.status === 'completed' ? (
            <CheckCircle2 className="size-5 text-green-600" />
          ) : (
            <Icon className="size-5 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">{task.title}</h4>
              {task.patientName && (
                <p className="text-xs text-gray-600 mt-0.5">
                  <User className="size-3 inline mr-1" />
                  {task.patientName}
                </p>
              )}
              {task.scheduledTime && (
                <p className="text-xs text-gray-600 mt-0.5">
                  <Clock className="size-3 inline mr-1" />
                  {task.scheduledTime}
                </p>
              )}
            </div>
            {task.priority && task.status !== 'completed' && (
              <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                {task.priority}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button
              size="sm"
              variant={task.status === 'completed' ? 'outline' : 'default'}
              onClick={() => navigate(task.action.path)}
              className="h-7 text-xs"
            >
              {task.action.label}
            </Button>
            {task.status !== 'completed' && onComplete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onComplete(task.id)}
                className="h-7 text-xs"
              >
                <CheckCircle2 className="size-3 mr-1" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== RESUME WORK ZONE ====================

interface ResumeWorkZoneProps {
  items: RecentItem[];
}

export function ResumeWorkZone({ items }: ResumeWorkZoneProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="size-5 text-purple-600" />
          Resume Work
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="size-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No recent items</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <RecentItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentItemCard({ item }: { item: RecentItem }) {
  const navigate = useNavigate();

  const typeIcons = {
    patient: User,
    admission: Briefcase,
    visit: Stethoscope,
    document: FileText,
  };

  const Icon = typeIcons[item.type];

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <button
      onClick={() => navigate(item.path)}
      className="w-full p-3 rounded-lg border border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm transition-all text-left"
    >
      <div className="flex items-center gap-3">
        <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="size-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h4>
            {item.metadata?.alerts && item.metadata.alerts > 0 && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                {item.metadata.alerts}
              </Badge>
            )}
          </div>
          {item.subtitle && (
            <p className="text-xs text-gray-600 truncate">{item.subtitle}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">
            <Clock className="size-3 inline mr-1" />
            {timeAgo(item.lastAccessed)}
          </p>
        </div>
        <ChevronRight className="size-4 text-gray-400 flex-shrink-0" />
      </div>
    </button>
  );
}

// ==================== QUICK ACTIONS ZONE ====================

interface QuickActionsZoneProps {
  actions: QuickAction[];
}

export function QuickActionsZone({ actions }: QuickActionsZoneProps) {
  const navigate = useNavigate();

  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
    green: 'bg-green-100 text-green-600 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
    red: 'bg-red-100 text-red-600 hover:bg-red-200',
    indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="size-5 text-orange-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => {
                  if (action.path) {
                    navigate(action.path);
                  } else if (action.onClick) {
                    action.onClick();
                  }
                }}
                className={`p-4 rounded-lg transition-all ${colorStyles[action.color]} border-2 border-transparent hover:border-current`}
              >
                <Icon className="size-6 mb-2 mx-auto" />
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs opacity-80 mt-1">{action.description}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== OPERATIONAL INSIGHTS ZONE ====================

interface OperationalInsightsZoneProps {
  metrics: OperationalMetric[];
}

export function OperationalInsightsZone({ metrics }: OperationalInsightsZoneProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="size-5 text-indigo-600" />
          Operational Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ metric }: { metric: OperationalMetric }) {
  const Icon = metric.icon;

  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className={`size-10 rounded-lg flex items-center justify-center ${colorStyles[metric.color]}`}>
          <Icon className="size-5" />
        </div>
        {metric.change && (
          <div className={`flex items-center gap-1 text-xs ${metric.change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {metric.change.direction === 'up' ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {Math.abs(metric.change.value)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {metric.value}
        {metric.unit && <span className="text-sm text-gray-600 ml-1">{metric.unit}</span>}
      </p>
      <p className="text-xs text-gray-600 mt-1">{metric.label}</p>
      {metric.target && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Target: {metric.target}{metric.unit}</span>
            <span>{Math.round((Number(metric.value) / metric.target) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorStyles[metric.color]} transition-all`}
              style={{ width: `${Math.min((Number(metric.value) / metric.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== COMPLETE OPERATIONAL WORKSPACE ====================

interface OperationalWorkspaceProps {
  config: WorkspaceConfig;
  onDismissIssue?: (id: string) => void;
  onCompleteTask?: (id: string) => void;
}

export function OperationalWorkspace({
  config,
  onDismissIssue,
  onCompleteTask,
}: OperationalWorkspaceProps) {
  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="size-8 text-blue-600" />
            {config.displayName}
          </h1>
          <p className="text-gray-600 mt-1">Your operational workspace</p>
        </div>

        {/* Critical Issues - Full Width */}
        <CriticalIssuesZone issues={config.criticalIssues} onDismiss={onDismissIssue} />

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <TodayWorkZone tasks={config.todayTasks} onComplete={onCompleteTask} />
            <QuickActionsZone actions={config.quickActions} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <ResumeWorkZone items={config.recentItems} />
          </div>
        </div>

        {/* Operational Insights - Full Width */}
        <OperationalInsightsZone metrics={config.metrics} />
      </div>
    </div>
  );
}
