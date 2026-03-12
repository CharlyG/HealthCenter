/**
 * Workspace Page Shell
 * 
 * Reusable layout for role-based operational home screens (workspaces).
 * Used for: Admissions, Scheduling, QA, Billing, Hospice, etc.
 * 
 * Layout Structure:
 * - Page header with title and actions
 * - Critical issues alert section
 * - Today's work priority section
 * - Operational queues grid
 * - Quick actions panel
 * - Insights/metrics section
 * 
 * Performance:
 * - Memoized component
 * - Lazy-loaded sections
 * - Virtualized queues when needed
 */

import { memo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface WorkspacePageShellProps {
  /** Workspace title */
  title: string;
  
  /** Workspace subtitle or description */
  subtitle?: string;
  
  /** Header action buttons */
  headerActions?: ReactNode;
  
  /** Critical issues alerts (shown prominently) */
  criticalIssues?: ReactNode;
  
  /** Critical issues count for badge */
  criticalIssuesCount?: number;
  
  /** Today's work section */
  todaysWork?: ReactNode;
  
  /** Today's work count */
  todaysWorkCount?: number;
  
  /** Operational queues (main content) */
  queues?: ReactNode;
  
  /** Quick actions panel */
  quickActions?: ReactNode;
  
  /** Insights/metrics section */
  insights?: ReactNode;
  
  /** Custom content sections */
  customSections?: Array<{
    id: string;
    title: string;
    content: ReactNode;
    badge?: number;
    collapsible?: boolean;
  }>;
  
  /** Show insights by default */
  showInsights?: boolean;
  
  /** Layout variant */
  layout?: 'default' | 'compact' | 'grid';
  
  /** Full width (no max-width constraint) */
  fullWidth?: boolean;
}

const WorkspacePageShell = memo(function WorkspacePageShell({
  title,
  subtitle,
  headerActions,
  criticalIssues,
  criticalIssuesCount = 0,
  todaysWork,
  todaysWorkCount = 0,
  queues,
  quickActions,
  insights,
  customSections = [],
  showInsights = true,
  layout = 'default',
  fullWidth = false,
}: WorkspacePageShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className={cn(
          'px-6 py-6',
          !fullWidth && 'max-w-[1800px] mx-auto'
        )}>
          <div className="flex items-start justify-between gap-4">
            {/* Title Section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {title}
                </h1>
                <Badge variant="secondary" className="text-xs">
                  Workspace
                </Badge>
              </div>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Header Actions */}
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        'px-6 py-6 space-y-6',
        !fullWidth && 'max-w-[1800px] mx-auto'
      )}>
        {/* Critical Issues Section */}
        {criticalIssues && criticalIssuesCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-red-900">
                    Critical Issues Requiring Attention
                  </h2>
                  <p className="text-xs text-red-700">
                    {criticalIssuesCount} {criticalIssuesCount === 1 ? 'issue' : 'issues'} need immediate action
                  </p>
                </div>
              </div>
              <div className="mt-3">
                {criticalIssues}
              </div>
            </div>
          </div>
        )}

        {/* Today's Work Section */}
        {todaysWork && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Today's Priority Work
                </h2>
                {todaysWorkCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {todaysWorkCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="p-4">
              {todaysWork}
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className={cn(
          'grid gap-6',
          layout === 'grid' && 'lg:grid-cols-2',
          layout === 'default' && 'lg:grid-cols-3'
        )}>
          {/* Operational Queues (Main Content) */}
          {queues && (
            <div className={cn(
              layout === 'default' && 'lg:col-span-2',
              layout === 'compact' && 'w-full'
            )}>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-600" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Operational Queues
                  </h2>
                </div>
                {queues}
              </div>
            </div>
          )}

          {/* Sidebar: Quick Actions & Insights */}
          {(quickActions || insights) && (
            <div className="space-y-6">
              {/* Quick Actions */}
              {quickActions && (
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Quick Actions
                    </h2>
                  </div>
                  <div className="p-4">
                    {quickActions}
                  </div>
                </div>
              )}

              {/* Insights */}
              {showInsights && insights && (
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <h2 className="text-sm font-semibold text-gray-900">
                      Insights
                    </h2>
                  </div>
                  <div className="p-4">
                    {insights}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Sections */}
        {customSections.length > 0 && (
          <div className="space-y-6">
            {customSections.map((section) => (
              <div key={section.id} className="bg-white rounded-lg border shadow-sm">
                <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-gray-900">
                      {section.title}
                    </h2>
                    {section.badge !== undefined && section.badge > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

WorkspacePageShell.displayName = 'WorkspacePageShell';

export default WorkspacePageShell;
