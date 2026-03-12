/**
 * Tabbed Detail Shell
 * 
 * Reusable layout for single-entity detail pages with related subsections.
 * Provides consistent tabbed navigation for entity-specific information.
 * 
 * Use Cases:
 * - Caregiver profile (Profile, Credentials, Availability, Documents, etc.)
 * - Patient overview (Demographics, Clinical, Documents, Timeline, etc.)
 * - Integration configuration (Settings, Auth, Mapping, Activity Log)
 * - Admission details (Overview, Clinical, Team, Documents, Timeline)
 * - Assessment detail (Responses, Validation, History, Attachments)
 * - Episode detail (Care Plan, Visits, Documentation, Billing)
 * 
 * Design Principles:
 * - Tabs for closely related subviews only
 * - Not for major navigation (use workspace shell instead)
 * - Entity context always visible in header
 * - Tab content independently scrollable
 * 
 * Performance:
 * - Lazy-loaded tab content
 * - Memoized components
 * - Virtualized lists when needed
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft,
  MoreVertical,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TabDefinition {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: {
    label: string | number;
    variant?: 'default' | 'secondary' | 'destructive' | 'warning';
  };
  content: ReactNode;
  disabled?: boolean;
  hidden?: boolean;
  // Lazy load tab content on first access
  lazy?: boolean;
}

export interface EntityStatus {
  type: 'success' | 'warning' | 'error' | 'info';
  label: string;
  icon?: ReactNode;
}

interface TabbedDetailShellProps {
  /** Entity title (e.g., patient name, caregiver name) */
  title: string;
  
  /** Entity subtitle or identifier */
  subtitle?: string;
  
  /** Entity avatar/image */
  avatar?: ReactNode;
  
  /** Entity status indicator */
  status?: EntityStatus;
  
  /** Additional entity metadata to display in header */
  metadata?: Array<{
    label: string;
    value: string | ReactNode;
    icon?: ReactNode;
  }>;
  
  /** Tab definitions */
  tabs: TabDefinition[];
  
  /** Active tab ID */
  activeTab?: string;
  
  /** Tab change handler */
  onTabChange?: (tabId: string) => void;
  
  /** Back navigation handler */
  onBack?: () => void;
  
  /** Back label */
  backLabel?: string;
  
  /** Header action buttons */
  headerActions?: ReactNode;
  
  /** Entity menu actions */
  menuActions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
  }>;
  
  /** Breadcrumbs */
  breadcrumbs?: Array<{
    label: string;
    onClick?: () => void;
  }>;
  
  /** Alert/notification banner */
  alertBanner?: ReactNode;
  
  /** Sticky header */
  stickyHeader?: boolean;
  
  /** Full width content */
  fullWidth?: boolean;
  
  /** Compact header */
  compactHeader?: boolean;
  
  /** Custom header content */
  headerContent?: ReactNode;
  
  /** Tab style variant */
  tabVariant?: 'default' | 'pills' | 'underline';
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TabbedDetailShell = memo(function TabbedDetailShell({
  title,
  subtitle,
  avatar,
  status,
  metadata = [],
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  onBack,
  backLabel = 'Back',
  headerActions,
  menuActions,
  breadcrumbs,
  alertBanner,
  stickyHeader = true,
  fullWidth = false,
  compactHeader = false,
  headerContent,
  tabVariant = 'default',
}: TabbedDetailShellProps) {
  // Internal tab state if not controlled
  const [internalActiveTab, setInternalActiveTab] = useState(() => {
    const firstVisibleTab = tabs.find(t => !t.hidden);
    return firstVisibleTab?.id || tabs[0]?.id || '';
  });
  
  // Track which tabs have been visited (for lazy loading)
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([internalActiveTab]));
  
  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  
  const activeTab = controlledActiveTab ?? internalActiveTab;
  
  const handleTabChange = useCallback((tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
    setVisitedTabs(prev => new Set(prev).add(tabId));
  }, [onTabChange]);
  
  const visibleTabs = tabs.filter(t => !t.hidden);
  const activeTabData = tabs.find(t => t.id === activeTab);
  
  const statusIcon = {
    success: <CheckCircle className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
    info: <Clock className="w-4 h-4" />,
  };
  
  const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className={cn(
        'bg-white border-b',
        stickyHeader && 'sticky top-0 z-30'
      )}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="px-6 py-3 border-b bg-gray-50">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                  {crumb.onClick ? (
                    <button
                      onClick={crumb.onClick}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}

        <div className={cn(
          'px-6',
          compactHeader ? 'py-3' : 'py-4'
        )}>
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </button>
          )}

          {/* Entity Header */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: Entity Info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Avatar */}
              {avatar && (
                <div className="flex-shrink-0">
                  {avatar}
                </div>
              )}
              
              {/* Title and Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h1 className={cn(
                      'font-bold text-gray-900',
                      compactHeader ? 'text-xl' : 'text-2xl'
                    )}>
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  {status && (
                    <div className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                      statusColors[status.type]
                    )}>
                      {status.icon || statusIcon[status.type]}
                      {status.label}
                    </div>
                  )}
                </div>
                
                {/* Custom Header Content */}
                {headerContent}
                
                {/* Metadata */}
                {metadata.length > 0 && (
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {metadata.map((meta, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-sm">
                        {meta.icon && (
                          <span className="text-gray-400">{meta.icon}</span>
                        )}
                        <span className="text-gray-600">{meta.label}:</span>
                        <span className="text-gray-900 font-medium">{meta.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {headerActions}
              
              {/* Menu */}
              {menuActions && menuActions.length > 0 && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  
                  {menuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                      />
                      
                      {/* Menu */}
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          {menuActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                action.onClick();
                                setMenuOpen(false);
                              }}
                              disabled={action.disabled}
                              className={cn(
                                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
                                action.variant === 'destructive'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-gray-700 hover:bg-gray-100',
                                action.disabled && 'opacity-50 cursor-not-allowed'
                              )}
                            >
                              {action.icon}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alert Banner */}
        {alertBanner && (
          <div className="px-6 pb-4">
            {alertBanner}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="px-6">
          <div className={cn(
            'flex gap-1',
            tabVariant === 'default' && 'border-b',
            tabVariant === 'pills' && 'gap-2',
            tabVariant === 'underline' && 'border-b'
          )}>
            {visibleTabs.map(tab => {
              const isActive = tab.id === activeTab;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && handleTabChange(tab.id)}
                  disabled={tab.disabled}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                    
                    // Default variant
                    tabVariant === 'default' && cn(
                      'border-b-2 -mb-px',
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    ),
                    
                    // Pills variant
                    tabVariant === 'pills' && cn(
                      'rounded-lg',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    ),
                    
                    // Underline variant
                    tabVariant === 'underline' && cn(
                      'border-b-2 -mb-px',
                      isActive
                        ? 'border-blue-600 text-blue-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    ),
                    
                    tab.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Badge
                      variant={tab.badge.variant || 'secondary'}
                      className="text-xs ml-1"
                    >
                      {tab.badge.label}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto">
        <div className={cn(
          'py-6',
          fullWidth ? 'px-6' : 'px-6 max-w-[1600px] mx-auto'
        )}>
          {activeTabData && (
            <div>
              {/* Render content if not lazy, or if lazy and visited */}
              {(!activeTabData.lazy || visitedTabs.has(activeTabData.id)) && (
                activeTabData.content
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
});

TabbedDetailShell.displayName = 'TabbedDetailShell';

export default TabbedDetailShell;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// Example: Caregiver Profile
<TabbedDetailShell
  title="Sarah Johnson, RN"
  subtitle="Employee ID: CG-12847"
  avatar={
    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
      <User className="w-8 h-8 text-blue-600" />
    </div>
  }
  status={{
    type: 'success',
    label: 'Active',
  }}
  metadata={[
    { label: 'Discipline', value: 'Registered Nurse', icon: <Stethoscope className="w-4 h-4" /> },
    { label: 'License', value: 'RN-CA-98765', icon: <Award className="w-4 h-4" /> },
    { label: 'Start Date', value: 'Jan 15, 2023', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Compliance', value: <span className="text-green-600">95%</span> },
  ]}
  breadcrumbs={[
    { label: 'Caregiver Management', onClick: () => navigate('/caregivers') },
    { label: 'Sarah Johnson' },
  ]}
  onBack={() => navigate('/caregivers')}
  headerActions={
    <>
      <Button variant="outline" size="sm">
        <MessageSquare className="w-4 h-4 mr-2" />
        Message
      </Button>
      <Button size="sm">
        <Edit className="w-4 h-4 mr-2" />
        Edit Profile
      </Button>
    </>
  }
  menuActions={[
    { label: 'View Schedule', icon: <Calendar className="w-4 h-4" />, onClick: () => {} },
    { label: 'View Activity Log', icon: <Clock className="w-4 h-4" />, onClick: () => {} },
    { label: 'Deactivate', icon: <XCircle className="w-4 h-4" />, onClick: () => {}, variant: 'destructive' },
  ]}
  tabs={[
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      content: <CaregiverProfileTab />,
    },
    {
      id: 'credentials',
      label: 'Credentials',
      icon: <Award className="w-4 h-4" />,
      badge: { label: '2', variant: 'warning' },
      content: <CaregiverCredentialsTab />,
      lazy: true,
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: <Calendar className="w-4 h-4" />,
      content: <CaregiverAvailabilityTab />,
      lazy: true,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="w-4 h-4" />,
      badge: { label: '12' },
      content: <CaregiverDocumentsTab />,
      lazy: true,
    },
    {
      id: 'timeline',
      label: 'Activity',
      icon: <Activity className="w-4 h-4" />,
      content: <CaregiverTimelineTab />,
      lazy: true,
    },
  ]}
/>

// Example: Patient Overview
<TabbedDetailShell
  title="Robert Anderson"
  subtitle="MRN: PT-45892 • DOB: 08/12/1947 (79 years)"
  status={{
    type: 'success',
    label: 'Active Episode',
  }}
  metadata={[
    { label: 'Admission Date', value: 'Feb 1, 2026' },
    { label: 'Primary Diagnosis', value: 'CHF, Diabetes Type 2' },
    { label: 'Primary Nurse', value: 'Sarah Johnson, RN' },
  ]}
  alertBanner={
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-amber-900">Recertification due in 5 days</p>
        <p className="text-amber-700 mt-0.5">OASIS-E assessment required by March 15, 2026</p>
      </div>
    </div>
  }
  tabs={[
    { id: 'overview', label: 'Overview', content: <PatientOverviewTab /> },
    { id: 'clinical', label: 'Clinical', content: <PatientClinicalTab />, lazy: true },
    { id: 'visits', label: 'Visits', badge: { label: '24' }, content: <PatientVisitsTab />, lazy: true },
    { id: 'documents', label: 'Documents', content: <PatientDocumentsTab />, lazy: true },
    { id: 'timeline', label: 'Timeline', content: <PatientTimelineTab />, lazy: true },
  ]}
  tabVariant="underline"
/>
*/
