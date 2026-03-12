/**
 * Unified Sidebar Navigation
 * 
 * Primary navigation sidebar optimized for speed, clarity, and low cognitive load.
 * Supports role-based views, operational grouping, and badge counts.
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Home,
  Users,
  UserPlus,
  Calendar,
  Heart,
  Activity,
  Stethoscope,
  DollarSign,
  HeartPulse,
  Settings,
  FileText,
  ClipboardCheck,
  Pill,
  Target,
  FileSignature,
  ShieldCheck,
  CreditCard,
  Wallet,
  Building2,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  badge?: number;
  children?: NavItem[];
  roles?: string[]; // If specified, only show to these roles
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  roles?: string[];
}

interface UnifiedSidebarProps {
  userRole: string; // 'admin' | 'clinician' | 'scheduler' | 'qa' | 'billing' | 'hospice' | 'admissions'
  collapsed?: boolean;
}

export default function UnifiedSidebar({ userRole, collapsed = false }: UnifiedSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation groups organized by operational domain
  const navGroups: NavGroup[] = [
    // Primary Workspace (always first)
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        { id: 'workspace', label: 'Workspace', icon: Home, path: '/', badge: 12 },
      ],
    },

    // Operations Domain
    {
      id: 'operations',
      label: 'Operations',
      defaultExpanded: true,
      items: [
        { id: 'patients', label: 'Patients', icon: Users, path: '/patient' },
        { id: 'admissions', label: 'Admissions', icon: UserPlus, path: '/admissions', badge: 5, roles: ['admin', 'admissions', 'clinician', 'qa'] },
        { id: 'scheduling', label: 'Scheduling', icon: Calendar, path: '/scheduling', badge: 3, roles: ['admin', 'scheduler', 'admissions'] },
        { id: 'careconnect', label: 'CareConnect', icon: Heart, path: '/careconnect', roles: ['admin', 'clinician'] },
        { id: 'monitor', label: 'Monitor', icon: Activity, path: '/monitor', badge: 8, roles: ['admin', 'scheduler', 'clinician'] },
      ],
    },

    // Clinical Domain
    {
      id: 'clinical',
      label: 'Clinical',
      defaultExpanded: false,
      collapsible: true,
      roles: ['admin', 'clinician', 'qa'],
      items: [
        { id: 'clinical-overview', label: 'Clinical Overview', icon: Stethoscope, path: '/clinical' },
        { id: 'documentation', label: 'Documentation', icon: FileText, path: '/clinical-documentation-workspace', badge: 7 },
        { id: 'assessments', label: 'Assessments', icon: ClipboardCheck, path: '/assessment-workspace', badge: 2 },
        { id: 'medications', label: 'Medications', icon: Pill, path: '/patient-medication-profile' },
        { id: 'care-plans', label: 'Care Plans', icon: Target, path: '/care-plan-management' },
        { id: 'orders', label: 'Orders & Certification', icon: FileSignature, path: '/orders-workspace', badge: 4 },
        { id: 'qa-center', label: 'QA Center', icon: ShieldCheck, path: '/qa-workspace', badge: 15, roles: ['admin', 'qa'] },
      ],
    },

    // Financial Domain
    {
      id: 'financial',
      label: 'Financial',
      defaultExpanded: false,
      collapsible: true,
      roles: ['admin', 'billing'],
      items: [
        { id: 'billing', label: 'Billing', icon: DollarSign, path: '/billing', badge: 6 },
        { id: 'claims', label: 'Claims', icon: CreditCard, path: '/billing', badge: 3 },
        { id: 'payments', label: 'Payments', icon: Wallet, path: '/billing' },
      ],
    },

    // Hospice Domain
    {
      id: 'hospice',
      label: 'Hospice',
      defaultExpanded: false,
      collapsible: true,
      roles: ['admin', 'hospice', 'clinician'],
      items: [
        { id: 'hospice-dashboard', label: 'Hospice Dashboard', icon: HeartPulse, path: '/hospice' },
        { id: 'hope', label: 'HOPE Assessment', icon: ClipboardCheck, path: '/hospice' },
        { id: 'idg', label: 'IDG Center', icon: Users, path: '/hospice' },
        { id: 'bereavement', label: 'Bereavement', icon: Heart, path: '/hospice' },
      ],
    },

    // Administration Domain
    {
      id: 'administration',
      label: 'Administration',
      defaultExpanded: false,
      collapsible: true,
      roles: ['admin'],
      items: [
        { id: 'users', label: 'Users & Roles', icon: Users, path: '/admin/platform-config' },
        { id: 'caregivers', label: 'Caregivers', icon: Heart, path: '/caregiver-management' },
        { id: 'offices', label: 'Offices', icon: Building2, path: '/platform-configuration-center-expanded' },
        { id: 'integrations', label: 'Integrations', icon: Activity, path: '/integration-management' },
        { id: 'platform-config', label: 'Platform Config', icon: Settings, path: '/platform-configuration-center-expanded' },
      ],
    },
  ];

  // Filter groups and items based on user role
  const filteredGroups = navGroups
    .filter((group) => !group.roles || group.roles.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filteredGroups.filter((g) => g.defaultExpanded).map((g) => g.id))
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

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div
      className={cn(
        'h-screen bg-gray-900 text-gray-100 flex flex-col transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        {collapsed ? (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
        ) : (
          <div className="text-xl font-bold text-white">Healthcare</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            collapsed={collapsed}
            expanded={expandedGroups.has(group.id)}
            onToggle={() => toggleGroup(group.id)}
            isActive={isActive}
            navigate={navigate}
          />
        ))}
      </nav>

      {/* User Role Indicator */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-1">Current Role</div>
          <Badge variant="outline" className="capitalize">
            {userRole}
          </Badge>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NAV GROUP SECTION
// ═══════════════════════════════════════════════════════════════════════════

function NavGroupSection({
  group,
  collapsed,
  expanded,
  onToggle,
  isActive,
  navigate,
}: {
  group: NavGroup;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  isActive: (path?: string) => boolean;
  navigate: (path: string) => void;
}) {
  const showGroupLabel = !collapsed && group.label !== 'Workspace';

  return (
    <div className="mb-6">
      {/* Group Label */}
      {showGroupLabel && (
        <div className="px-4 mb-2">
          {group.collapsible ? (
            <button
              onClick={onToggle}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
            >
              <span>{group.label}</span>
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.label}
            </div>
          )}
        </div>
      )}

      {/* Items */}
      {(!group.collapsible || expanded) && (
        <div className="space-y-1 px-2">
          {group.items.map((item) => (
            <NavItemButton
              key={item.id}
              item={item}
              collapsed={collapsed}
              isActive={isActive(item.path)}
              onClick={() => item.path && navigate(item.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════���═══════════════════════════════════════════════
// NAV ITEM BUTTON
// ═══════════════════════════════════════════════════════════════════════════

function NavItemButton({
  item,
  collapsed,
  isActive,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                isActive
                  ? 'bg-blue-500 text-white border-blue-400'
                  : 'bg-gray-800 text-gray-300 border-gray-700'
              )}
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </button>
  );
}