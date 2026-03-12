/**
 * Navigation Demo Page
 * 
 * Demonstrates the global navigation system with all module groups,
 * collapsible states, and responsive behavior.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AppLayoutWithNavigation,
  navigationConfig,
  type NavGroup,
  type NavItem,
} from '../components/navigation/GlobalNavigation';
import {
  Layers,
  Info,
  Layout,
  Smartphone,
  Monitor,
  CheckCircle2,
  Star,
  Zap,
} from 'lucide-react';

export default function NavigationDemoPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Calculate statistics
  const totalGroups = navigationConfig.length;
  const totalModules = navigationConfig.reduce((sum, group) => sum + group.items.length, 0);
  const modulesWithBadges = navigationConfig.reduce(
    (sum, group) => sum + group.items.filter((item) => item.badge).length,
    0
  );

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="size-8 text-blue-600" />
            Global Navigation System
          </h1>
          <p className="text-gray-600 mt-2">
            Persistent sidebar navigation with organized module groups for healthcare operations
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About This Navigation System</p>
                <p className="mt-1 text-blue-800">
                  The global navigation provides persistent access to all platform modules organized
                  into logical groups: Operations, Clinical, Financial, Hospice, Reporting, and
                  Administration. The sidebar supports collapsing for more screen space and includes
                  badge notifications for items requiring attention.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6 text-center">
              <Layers className="size-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-900">{totalGroups}</p>
              <p className="text-sm text-gray-700 font-medium">Navigation Groups</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardContent className="p-6 text-center">
              <Zap className="size-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-900">{totalModules}</p>
              <p className="text-sm text-gray-700 font-medium">Total Modules</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardContent className="p-6 text-center">
              <Star className="size-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-900">{modulesWithBadges}</p>
              <p className="text-sm text-gray-700 font-medium">With Notifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Navigation Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tree">
              <TabsList>
                <TabsTrigger value="tree">Tree View</TabsTrigger>
                <TabsTrigger value="details">Module Details</TabsTrigger>
                <TabsTrigger value="badges">Notifications</TabsTrigger>
              </TabsList>

              <TabsContent value="tree" className="space-y-4 pt-4">
                {navigationConfig.map((group) => (
                  <NavigationGroupCard key={group.id} group={group} />
                ))}
              </TabsContent>

              <TabsContent value="details" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {navigationConfig.map((group) =>
                    group.items.map((item) => (
                      <ModuleDetailCard key={item.id} item={item} groupName={group.label} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="badges" className="pt-4">
                <div className="space-y-3">
                  {navigationConfig.map((group) =>
                    group.items
                      .filter((item) => item.badge)
                      .map((item) => (
                        <NotificationCard key={item.id} item={item} groupName={group.label} />
                      ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Desktop Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="size-5 text-blue-600" />
                Desktop Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <FeatureItem
                icon={CheckCircle2}
                label="Collapsible Sidebar"
                description="Toggle between full and icon-only view"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Persistent State"
                description="Remembers expanded groups across sessions"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Active Indicators"
                description="Visual highlighting of current module"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Badge Notifications"
                description="Real-time alerts for pending actions"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Tooltips"
                description="Hover descriptions when collapsed"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Keyboard Accessible"
                description="Full keyboard navigation support"
              />
            </CardContent>
          </Card>

          {/* Mobile Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="size-5 text-purple-600" />
                Mobile Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <FeatureItem
                icon={CheckCircle2}
                label="Slide-out Menu"
                description="Overlay navigation on mobile devices"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Touch Optimized"
                description="Large touch targets for easy navigation"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Overlay Dismiss"
                description="Tap outside or use close button"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Full Functionality"
                description="All features available on mobile"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Compact Header"
                description="Mobile-optimized top bar"
              />
              <FeatureItem
                icon={CheckCircle2}
                label="Responsive Layout"
                description="Adapts to screen size automatically"
              />
            </CardContent>
          </Card>
        </div>

        {/* Group Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Navigation Group Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <GroupDescription
                name="Operations"
                color="blue"
                description="Core operational workflows for day-to-day healthcare delivery including patient management, admissions, and scheduling."
              />
              <GroupDescription
                name="Clinical"
                color="green"
                description="Clinical documentation, assessments, orders, care coordination, and real-time patient monitoring tools."
              />
              <GroupDescription
                name="Financial"
                color="indigo"
                description="Revenue cycle management including billing, claims submission, payment processing, and financial reconciliation."
              />
              <GroupDescription
                name="Hospice"
                color="red"
                description="Specialized hospice operations including IDG meetings, bereavement support, and hospice-specific workflows."
              />
              <GroupDescription
                name="Reporting"
                color="purple"
                description="Analytics, dashboards, and reporting tools for operational insights and compliance reporting."
              />
              <GroupDescription
                name="Administration"
                color="gray"
                description="System administration including user management, roles, office configuration, and integrations."
              />
            </div>
          </CardContent>
        </Card>

        {/* Implementation Note */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Implementation Ready</p>
                <p className="mt-1 text-green-800">
                  This navigation system is fully implemented and ready to use. Import{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded text-xs">
                    AppLayoutWithNavigation
                  </code>{' '}
                  to wrap your pages, or use{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded text-xs">GlobalNavigation</code>{' '}
                  directly for custom layouts.
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

interface NavigationGroupCardProps {
  group: NavGroup;
}

function NavigationGroupCard({ group }: NavigationGroupCardProps) {
  const GroupIcon = group.icon;

  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <GroupIcon className="size-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{group.label}</h4>
          <p className="text-xs text-gray-500">{group.items.length} modules</p>
        </div>
      </div>
      <div className="pl-4 border-l-2 border-gray-200 space-y-2">
        {group.items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <ItemIcon className="size-4 text-gray-600" />
                <span className="text-gray-700">{item.label}</span>
              </div>
              {item.badge && (
                <Badge
                  className={`text-xs ${
                    item.badge.variant === 'success'
                      ? 'bg-green-100 text-green-800'
                      : item.badge.variant === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : item.badge.variant === 'danger'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.badge.value}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ModuleDetailCardProps {
  item: NavItem;
  groupName: string;
}

function ModuleDetailCard({ item, groupName }: ModuleDetailCardProps) {
  const ItemIcon = item.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ItemIcon className="size-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{item.label}</h4>
              {item.badge && (
                <Badge
                  className={`text-xs ${
                    item.badge.variant === 'success'
                      ? 'bg-green-100 text-green-800'
                      : item.badge.variant === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : item.badge.variant === 'danger'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.badge.value}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{groupName}</p>
            {item.description && (
              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2 font-mono">{item.path}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NotificationCardProps {
  item: NavItem;
  groupName: string;
}

function NotificationCard({ item, groupName }: NotificationCardProps) {
  const ItemIcon = item.icon;

  return (
    <div
      className={`p-4 rounded-lg border-2 flex items-center justify-between ${
        item.badge?.variant === 'danger'
          ? 'bg-red-50 border-red-200'
          : item.badge?.variant === 'warning'
          ? 'bg-amber-50 border-amber-200'
          : item.badge?.variant === 'success'
          ? 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="size-10 bg-white rounded-lg flex items-center justify-center">
          <ItemIcon className="size-6 text-gray-700" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{item.label}</h4>
          <p className="text-xs text-gray-600">
            {groupName} • {item.description}
          </p>
        </div>
      </div>
      {item.badge && (
        <Badge
          className={`text-sm font-bold ${
            item.badge.variant === 'success'
              ? 'bg-green-600 text-white'
              : item.badge.variant === 'warning'
              ? 'bg-amber-600 text-white'
              : item.badge.variant === 'danger'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {item.badge.value}
        </Badge>
      )}
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

function FeatureItem({ icon: Icon, label, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}

interface GroupDescriptionProps {
  name: string;
  color: 'blue' | 'green' | 'indigo' | 'red' | 'purple' | 'gray';
  description: string;
}

function GroupDescription({ name, color, description }: GroupDescriptionProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <div className="flex items-start gap-3">
      <Badge className={`${colorClasses[color]} font-semibold`}>{name}</Badge>
      <p className="text-sm text-gray-700 flex-1">{description}</p>
    </div>
  );
}
