import { NavLink, useNavigate } from 'react-router';
import { useConfig } from '../context/ConfigContext';
import {
  Users,
  ClipboardCheck,
  Calendar,
  HeartPulse,
  Activity,
  Heart,
  Settings,
  ChevronRight,
  DollarSign,
  FileText,
  ShieldAlert,
  UserCheck,
  BarChart3,
  GitPullRequest,
  MonitorCheck,
  Smartphone,
  ClipboardList,
} from 'lucide-react';
import { cn } from './ui/utils';
import { ScrollArea } from './ui/scroll-area';

const iconMap: Record<string, any> = {
  users: Users,
  'clipboard-check': ClipboardCheck,
  calendar: Calendar,
  'heart-pulse': HeartPulse,
  activity: Activity,
  heart: Heart,
  'dollar-sign': DollarSign,
  'file-text': FileText,
  settings: Settings,
};

interface NavItem {
  id: string;
  name: string;
  path: string;
  icon: any;
  enabled: boolean;
}

export default function Sidebar() {
  const { modules, isModuleEnabled, loading } = useConfig();
  const navigate = useNavigate();

  // Build navigation items from enabled modules
  const navItems: NavItem[] = modules
    .sort((a, b) => a.order - b.order)
    .map(module => ({
      id: module.id,
      name: module.name,
      path: module.id === 'admin' ? '/admin/platform-config' : `/${module.id}`,
      icon: iconMap[module.icon] || Settings,
      enabled: isModuleEnabled(module.id),
    }))
    .filter(item => item.enabled);

  const handleNavClick = (item: NavItem) => {
    if (!item.enabled) {
      navigate('/module-disabled');
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full min-h-0 overflow-hidden">
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Navigation
          </div>
          
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : navItems.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No modules available</div>
          ) : (
            navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={(e) => {
                    if (!item.enabled) {
                      e.preventDefault();
                      handleNavClick(item);
                    }
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100',
                      !item.enabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                >
                  <Icon className="size-5" />
                  <span className="flex-1">{item.name}</span>
                  <ChevronRight className="size-4 opacity-0 group-hover:opacity-100" />
                </NavLink>
              );
            })
          )}
        </nav>

        {/* Intelligence Section */}
        <nav className="p-3 pt-0 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Intelligence
          </div>
          <NavLink
            to="/risk-dashboard"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-red-50 text-red-700'
                  : 'text-gray-700 hover:bg-gray-100',
              )
            }
          >
            <ShieldAlert className="size-5" />
            <span className="flex-1">Risk Dashboard</span>
          </NavLink>
        </nav>

        {/* Intake Section */}
        <nav className="p-3 pt-0 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Intake
          </div>
          <NavLink
            to="/referral-pipeline"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100',
              )
            }
          >
            <GitPullRequest className="size-5" />
            <span className="flex-1">Referral Pipeline</span>
          </NavLink>
        </nav>

        {/* Supervisor Tools */}
        <nav className="p-3 pt-0 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Supervisor
          </div>
          <NavLink
            to="/cosign-queue"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100',
              )
            }
          >
            <UserCheck className="size-5" />
            <span className="flex-1">Co-Sign Queue</span>
          </NavLink>
          <NavLink
            to="/cosign-analytics"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100',
              )
            }
          >
            <BarChart3 className="size-5" />
            <span className="flex-1">Co-Sign Analytics</span>
          </NavLink>
          <NavLink
            to="/poc/monitor"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-100',
              )
            }
          >
            <MonitorCheck className="size-5" />
            <span className="flex-1">POC Monitor</span>
          </NavLink>
          <NavLink
            to="/poc/caregiver-field-app"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-100',
              )
            }
          >
            <Smartphone className="size-5" />
            <span className="flex-1">Caregiver Field App</span>
          </NavLink>
          <NavLink
            to="/admission-queues"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-700 hover:bg-gray-100',
              )
            }
          >
            <ClipboardList className="size-5" />
            <span className="flex-1">Admission Queues</span>
          </NavLink>
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          HIPAA Compliant Platform
        </div>
      </div>
    </div>
  );
}