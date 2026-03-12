/**
 * Global Navigation Sidebar
 * 
 * Persistent sidebar navigation for the healthcare platform with organized
 * module groups: Operations, Clinical, Financial, Hospice, and Administration.
 * 
 * Features:
 * - Collapsible groups
 * - Active state indicators
 * - Badge support for notifications
 * - Responsive collapse/expand
 * - Keyboard accessible
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  LayoutGrid,
  Users,
  Briefcase,
  Calendar,
  Network,
  Activity,
  Stethoscope,
  FileText,
  ClipboardList,
  Pill,
  DollarSign,
  Receipt,
  CreditCard,
  Heart,
  MessageSquare,
  Flower2,
  BarChart3,
  Settings,
  UserCog,
  Shield,
  Building2,
  Plug,
  Package,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  ChevronLeft,
  Home,
  Search,
  Bell,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: {
    value: number | string;
    variant: 'default' | 'success' | 'warning' | 'danger';
  };
  description?: string;
  comingSoon?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  defaultExpanded?: boolean;
}

// ==================== NAVIGATION CONFIGURATION ====================

export const navigationConfig: NavGroup[] = [
  {
    id: 'operations',
    label: 'Operations',
    icon: LayoutGrid,
    defaultExpanded: true,
    items: [
      {
        id: 'workspace',
        label: 'Workspace',
        icon: LayoutGrid,
        path: '/',
        description: 'Main operational dashboard',
      },
      {
        id: 'patients',
        label: 'Patients',
        icon: Users,
        path: '/patients',
        description: 'Patient registry and charts',
      },
      {
        id: 'admissions',
        label: 'Admissions',
        icon: Briefcase,
        path: '/admissions',
        badge: { value: 12, variant: 'warning' },
        description: 'Active admissions and queues',
      },
      {
        id: 'scheduling',
        label: 'Scheduling',
        icon: Calendar,
        path: '/scheduling',
        badge: { value: 8, variant: 'default' },
        description: 'Visit scheduling and calendar',
      },
    ],
  },
  {
    id: 'clinical',
    label: 'Clinical',
    icon: Stethoscope,
    defaultExpanded: false,
    items: [
      {
        id: 'careconnect',
        label: 'CareConnect',
        icon: Network,
        path: '/careconnect',
        description: 'Care team coordination',
      },
      {
        id: 'clinical',
        label: 'Clinical Documentation',
        icon: FileText,
        path: '/clinical',
        description: 'Visit notes and documentation',
      },
      {
        id: 'assessments',
        label: 'Assessments',
        icon: ClipboardList,
        path: '/assessments',
        description: 'OASIS and clinical assessments',
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: Pill,
        path: '/orders',
        description: 'Physician orders and medications',
      },
      {
        id: 'monitor',
        label: 'Point of Care Monitor',
        icon: Activity,
        path: '/monitor',
        badge: { value: 'LIVE', variant: 'success' },
        description: 'Real-time patient monitoring',
      },
    ],
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: DollarSign,
    defaultExpanded: false,
    items: [
      {
        id: 'billing',
        label: 'Billing',
        icon: Receipt,
        path: '/billing',
        badge: { value: 24, variant: 'danger' },
        description: 'Billing workspace and claims',
      },
      {
        id: 'claims',
        label: 'Claims',
        icon: FileText,
        path: '/claims',
        description: 'Claims submission and tracking',
      },
      {
        id: 'payments',
        label: 'Payments',
        icon: CreditCard,
        path: '/payments',
        description: 'Payment processing and reconciliation',
      },
    ],
  },
  {
    id: 'hospice',
    label: 'Hospice',
    icon: Heart,
    defaultExpanded: false,
    items: [
      {
        id: 'hospice-dashboard',
        label: 'Hospice Dashboard',
        icon: Heart,
        path: '/hospice',
        description: 'Hospice operations overview',
      },
      {
        id: 'idg-center',
        label: 'IDG Center',
        icon: MessageSquare,
        path: '/hospice/idg',
        badge: { value: 3, variant: 'warning' },
        description: 'Interdisciplinary Group meetings',
      },
      {
        id: 'bereavement',
        label: 'Bereavement',
        icon: Flower2,
        path: '/hospice/bereavement',
        description: 'Bereavement support services',
      },
    ],
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: BarChart3,
    defaultExpanded: false,
    items: [
      {
        id: 'reports',
        label: 'Reports',
        icon: BarChart3,
        path: '/reports',
        description: 'Analytics and reporting',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    defaultExpanded: false,
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: UserCog,
        path: '/admin/users',
        description: 'User management',
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        icon: Shield,
        path: '/admin/roles',
        description: 'Role-based access control',
      },
      {
        id: 'offices',
        label: 'Offices',
        icon: Building2,
        path: '/admin/offices',
        description: 'Office and branch management',
      },
      {
        id: 'integrations',
        label: 'Integrations',
        icon: Plug,
        path: '/admin/integrations',
        description: 'External system integrations',
      },
      {
        id: 'modules',
        label: 'Modules',
        icon: Package,
        path: '/admin/modules',
        description: 'Feature module configuration',
      },
    ],
  },
];

// ==================== GLOBAL NAVIGATION COMPONENT ====================

interface GlobalNavigationProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function GlobalNavigation({ collapsed = false, onToggleCollapse }: GlobalNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(navigationConfig.filter((g) => g.defaultExpanded).map((g) => g.id))
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } h-screen sticky top-0`}
    >
      {/* Header */}
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Heart className="size-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">CareFlow</h1>
              <p className="text-[10px] text-gray-500">Healthcare Platform</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="size-8 p-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>

      {/* Quick Actions Bar (when expanded) */}
      {!collapsed && (
        <div className="p-3 border-b border-gray-200 flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <Search className="size-4 mr-2" />
            Search
          </Button>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <Bell className="size-4" />
          </Button>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <div className="space-y-1">
          {navigationConfig.map((group) => (
            <NavGroupComponent
              key={group.id}
              group={group}
              isExpanded={expandedGroups.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
              isActive={isActive}
              onNavigate={handleNavigate}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Jane Doe</p>
              <p className="text-xs text-gray-500 truncate">Clinical Manager</p>
            </div>
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <Settings className="size-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="w-full p-0">
            <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              JD
            </div>
          </Button>
        )}
      </div>
    </aside>
  );
}

// ==================== NAV GROUP COMPONENT ====================

interface NavGroupComponentProps {
  group: NavGroup;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: (path: string) => boolean;
  onNavigate: (path: string) => void;
  collapsed: boolean;
}

function NavGroupComponent({
  group,
  isExpanded,
  onToggle,
  isActive,
  onNavigate,
  collapsed,
}: NavGroupComponentProps) {
  const GroupIcon = group.icon;
  const hasActiveItem = group.items.some((item) => isActive(item.path));

  if (collapsed) {
    return (
      <div className="px-2">
        <div
          className={`group relative flex items-center justify-center size-10 rounded-lg cursor-pointer transition-colors ${
            hasActiveItem
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title={group.label}
        >
          <GroupIcon className="size-5" />
          {/* Tooltip on hover */}
          <div className="absolute left-full ml-2 hidden group-hover:block z-50 whitespace-nowrap">
            <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
              {group.label}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Group Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors ${
          hasActiveItem
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <GroupIcon className="size-4" />
          <span>{group.label}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="size-4 text-gray-400" />
        ) : (
          <ChevronRight className="size-4 text-gray-400" />
        )}
      </button>

      {/* Group Items */}
      {isExpanded && (
        <div className="py-1">
          {group.items.map((item) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => onNavigate(item.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== NAV ITEM COMPONENT ====================

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function NavItemComponent({ item, isActive, onClick }: NavItemComponentProps) {
  const ItemIcon = item.icon;

  return (
    <button
      onClick={onClick}
      disabled={item.comingSoon}
      className={`w-full flex items-center justify-between pl-11 pr-4 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
          : item.comingSoon
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
      title={item.description}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <ItemIcon className="size-4 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.comingSoon && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            Soon
          </Badge>
        )}
      </div>

      {item.badge && (
        <Badge
          className={`ml-2 ${
            item.badge.variant === 'success'
              ? 'bg-green-100 text-green-800 border-green-300'
              : item.badge.variant === 'warning'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : item.badge.variant === 'danger'
              ? 'bg-red-100 text-red-800 border-red-300'
              : 'bg-blue-100 text-blue-800 border-blue-300'
          }`}
        >
          {item.badge.value}
        </Badge>
      )}
    </button>
  );
}

// ==================== MOBILE NAVIGATION ====================

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(navigationConfig.filter((g) => g.defaultExpanded).map((g) => g.id))
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Mobile Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Heart className="size-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">CareFlow</h1>
              <p className="text-[10px] text-gray-500">Healthcare Platform</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="size-8 p-0">
            <X className="size-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            {navigationConfig.map((group) => (
              <NavGroupComponent
                key={group.id}
                group={group}
                isExpanded={expandedGroups.has(group.id)}
                onToggle={() => toggleGroup(group.id)}
                isActive={isActive}
                onNavigate={handleNavigate}
                collapsed={false}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Jane Doe</p>
              <p className="text-xs text-gray-500 truncate">Clinical Manager</p>
            </div>
            <Button variant="ghost" size="sm" className="size-8 p-0">
              <Settings className="size-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ==================== LAYOUT WITH NAVIGATION ====================

interface AppLayoutWithNavigationProps {
  children: React.ReactNode;
}

export function AppLayoutWithNavigation({ children }: AppLayoutWithNavigationProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <GlobalNavigation
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="size-8 p-0"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Heart className="size-5 text-white" />
            </div>
            <h1 className="font-bold text-gray-900">CareFlow</h1>
          </div>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <Bell className="size-4" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
