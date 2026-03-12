/**
 * Workspace Zone Components
 * Implements the 5-zone workspace design pattern
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

// ============= ZONE 1: Critical Issues =============

interface CriticalIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  category: string;
  count?: number;
  daysOverdue?: number;
  onClick?: () => void;
}

function getSeverityColor(severity: 'critical' | 'high' | 'medium') {
  const colors = {
    critical: 'bg-red-50 border-red-200 hover:bg-red-100',
    high: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    medium: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  };
  return colors[severity];
}

function getSeverityIcon(severity: 'critical' | 'high' | 'medium') {
  const icons = {
    critical: <XCircle className="size-5 text-red-600" />,
    high: <AlertCircle className="size-5 text-orange-600" />,
    medium: <AlertTriangle className="size-5 text-yellow-600" />,
  };
  return icons[severity];
}

export function CriticalIssuesZone({ issues }: { issues: CriticalIssue[] }) {
  if (issues.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="size-12 mx-auto mb-3 text-green-600" />
          <p className="text-lg font-semibold text-green-900">No Critical Issues</p>
          <p className="text-sm text-green-700 mt-1">All systems operating normally</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue) => (
        <Card
          key={issue.id}
          className={`border-2 cursor-pointer transition-all ${getSeverityColor(issue.severity)}`}
          onClick={issue.onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                    {issue.count !== undefined && (
                      <Badge variant="destructive" className="text-xs">
                        {issue.count}
                      </Badge>
                    )}
                    {issue.daysOverdue !== undefined && (
                      <Badge variant="destructive" className="text-xs">
                        {issue.daysOverdue}d overdue
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{issue.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {issue.category}
                  </Badge>
                </div>
              </div>
              <ChevronRight className="size-5 text-gray-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============= ZONE 2: Today's Work =============

interface TodaysWorkItem {
  id: string;
  title: string;
  subtitle: string;
  time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  icon: React.ReactNode;
  labels?: Array<{ text: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' }>;
  onClick?: () => void;
}

function getStatusBadge(status: TodaysWorkItem['status']) {
  const badges = {
    scheduled: { text: 'Scheduled', variant: 'default' as const },
    in_progress: { text: 'In Progress', variant: 'warning' as const },
    completed: { text: 'Completed', variant: 'success' as const },
    cancelled: { text: 'Cancelled', variant: 'secondary' as const },
  };
  return badges[status];
}

export function TodaysWorkZone({ items }: { items: TodaysWorkItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="size-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-semibold text-gray-700">No Work Scheduled Today</p>
          <p className="text-sm text-gray-500 mt-1">Your schedule is clear</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const statusBadge = getStatusBadge(item.status);
        return (
          <Card
            key={item.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={item.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                      {item.time && (
                        <span className="text-sm text-gray-600 flex-shrink-0">{item.time}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{item.subtitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={statusBadge.variant} className="text-xs">
                        {statusBadge.text}
                      </Badge>
                      {item.labels?.map((label, idx) => (
                        <Badge key={idx} variant={label.variant} className="text-xs">
                          {label.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="size-5 text-gray-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============= ZONE 3: Resume Work =============

interface RecentItem {
  id: string;
  title: string;
  subtitle: string;
  lastAccessed: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export function ResumeWorkZone({ items }: { items: RecentItem[] }) {
  if (items.length === 0) {
    return null; // Don't show empty state for Resume Work
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.slice(0, 4).map((item) => (
        <Card
          key={item.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={item.onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h4>
                <p className="text-xs text-gray-600 truncate mt-0.5">{item.subtitle}</p>
                <p className="text-xs text-gray-500 mt-1">{item.lastAccessed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============= ZONE 4: Quick Actions =============

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  onClick: () => void;
}

export function QuickActionsZone({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || 'outline'}
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={action.onClick}
        >
          {action.icon}
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}

// ============= ZONE 5: Operational Insights =============

interface OperationalMetric {
  id: string;
  label: string;
  value: number | string;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  onClick?: () => void;
}

function getMetricColor(variant: OperationalMetric['variant'] = 'default') {
  const colors = {
    default: 'bg-blue-50 text-blue-900 border-blue-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    danger: 'bg-red-50 text-red-900 border-red-200',
  };
  return colors[variant];
}

export function OperationalInsightsZone({ metrics }: { metrics: OperationalMetric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric) => (
        <Card
          key={metric.id}
          className={`border-2 ${getMetricColor(metric.variant)} ${
            metric.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
          }`}
          onClick={metric.onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium uppercase tracking-wide opacity-75">
                {metric.label}
              </p>
              {metric.icon && <div className="flex-shrink-0">{metric.icon}</div>}
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            {metric.subtitle && <p className="text-xs opacity-75 mt-1">{metric.subtitle}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============= Workspace Zone Container =============

interface WorkspaceZoneProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function WorkspaceZone({ title, description, children, className = '' }: WorkspaceZoneProps) {
  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}
