/**
 * Patient Chart Shell
 * 
 * Reusable layout for patient-centered workflows and screens.
 * Used whenever users are working in patient context.
 * 
 * Layout Structure:
 * - Sticky patient context header (always visible)
 * - Optional admission context bar (when admission selected)
 * - Left context navigation (patient-level tabs)
 * - Main content panel (dynamic based on selected tab)
 * - Right context drawer (activity, alerts, quick actions)
 * 
 * Features:
 * - Patient-level navigation (demographics, chart, medications, etc.)
 * - Admission-level navigation (visit notes, care plan, orders, etc.)
 * - Quick actions accessible from anywhere
 * - Real-time activity visibility
 * - Clinical alerts display
 * - Seamless transition between patient/admission contexts
 * 
 * Performance:
 * - Memoized component and subcomponents
 * - Lazy-loaded tab content
 * - Sticky headers with position:sticky (no JS scroll listeners)
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  User,
  FileText,
  Activity,
  Pill,
  Calendar,
  Users,
  ClipboardCheck,
  Target,
  FileSignature,
  HeartPulse,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../ui/utils';
import PatientContextHeader from '../navigation/PatientContextHeader';
import AdmissionContextBar from '../navigation/AdmissionContextBar';

interface PatientInfo {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  office: string;
  phone?: string;
  address?: string;
}

interface PatientAlert {
  id: string;
  type: 'allergy' | 'infection' | 'fall-risk' | 'other';
  message: string;
}

interface AdmissionInfo {
  id: string;
  startDate: string;
  status: 'active' | 'pending' | 'discharged';
  primaryPayer: string;
  disciplines: string[];
  caseManager: string;
  authorizationStatus: 'approved' | 'pending' | 'denied';
}

interface NavigationTab {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  level: 'patient' | 'admission';
  onClick: () => void;
  active?: boolean;
}

interface PatientChartShellProps {
  /** Patient information */
  patient: PatientInfo;
  
  /** Patient alerts */
  alerts?: PatientAlert[];
  
  /** Current admission (optional) */
  admission?: AdmissionInfo;
  
  /** Available admissions for switching */
  availableAdmissions?: AdmissionInfo[];
  
  /** Admission change handler */
  onAdmissionChange?: (admissionId: string) => void;
  
  /** Navigation tabs */
  navigationTabs: NavigationTab[];
  
  /** Main content area */
  children: ReactNode;
  
  /** Right drawer content (activity, alerts, etc.) */
  rightDrawer?: ReactNode;
  
  /** Show right drawer by default */
  rightDrawerOpen?: boolean;
  
  /** Quick actions available in patient context */
  quickActions?: ReactNode;
  
  /** Close patient chart handler */
  onClose?: () => void;
  
  /** Show admission bar */
  showAdmissionBar?: boolean;
  
  /** Compact mode (hide sidebar labels) */
  compact?: boolean;
  
  /** Full width content (no max-width) */
  fullWidth?: boolean;
}

const PatientChartShell = memo(function PatientChartShell({
  patient,
  alerts = [],
  admission,
  availableAdmissions = [],
  onAdmissionChange,
  navigationTabs,
  children,
  rightDrawer,
  rightDrawerOpen: initialDrawerOpen = false,
  quickActions,
  onClose,
  showAdmissionBar = true,
  compact = false,
  fullWidth = false,
}: PatientChartShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(initialDrawerOpen);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Separate tabs by level
  const patientTabs = navigationTabs.filter(tab => tab.level === 'patient');
  const admissionTabs = navigationTabs.filter(tab => tab.level === 'admission');

  // Calculate header heights for layout
  const patientHeaderHeight = 'h-20';
  const admissionBarHeight = 'h-14';
  const totalHeaderHeight = showAdmissionBar && admission 
    ? 'top-[136px]' // 80px + 56px
    : 'top-20'; // 80px only

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Patient Context Header */}
      <div className="sticky top-0 z-40">
        <PatientContextHeader
          patient={patient}
          alerts={alerts}
          onClose={onClose}
        />
      </div>

      {/* Sticky Admission Context Bar */}
      {showAdmissionBar && admission && (
        <div className="sticky top-20 z-30">
          <AdmissionContextBar
            admission={admission}
            availableAdmissions={availableAdmissions}
            onAdmissionChange={onAdmissionChange}
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="flex relative">
        {/* Left Context Navigation */}
        <aside 
          className={cn(
            'fixed left-0 bottom-0 bg-white border-r z-20 transition-all duration-200',
            totalHeaderHeight,
            sidebarCollapsed ? 'w-16' : 'w-64'
          )}
        >
          <div className="h-full flex flex-col">
            {/* Patient-Level Navigation */}
            {patientTabs.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                  <div className="mb-2 px-3 py-1">
                    <span className={cn(
                      'text-xs font-semibold text-gray-500 uppercase',
                      sidebarCollapsed && 'hidden'
                    )}>
                      Patient
                    </span>
                  </div>
                  <nav className="space-y-1">
                    {patientTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={tab.onClick}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          tab.active 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                      >
                        <span className="flex-shrink-0">
                          {tab.icon}
                        </span>
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left truncate">
                              {tab.label}
                            </span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                              <Badge 
                                variant={tab.active ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {tab.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Admission-Level Navigation */}
                {admission && admissionTabs.length > 0 && (
                  <div className="p-2 border-t">
                    <div className="mb-2 px-3 py-1">
                      <span className={cn(
                        'text-xs font-semibold text-gray-500 uppercase',
                        sidebarCollapsed && 'hidden'
                      )}>
                        Admission
                      </span>
                    </div>
                    <nav className="space-y-1">
                      {admissionTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={tab.onClick}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            tab.active 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <span className="flex-shrink-0">
                            {tab.icon}
                          </span>
                          {!sidebarCollapsed && (
                            <>
                              <span className="flex-1 text-left truncate">
                                {tab.label}
                              </span>
                              {tab.badge !== undefined && tab.badge > 0 && (
                                <Badge 
                                  variant={tab.active ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {tab.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            {quickActions && !sidebarCollapsed && (
              <div className="border-t p-4">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Quick Actions
                  </span>
                </div>
                <div className="space-y-2">
                  {quickActions}
                </div>
              </div>
            )}

            {/* Sidebar Collapse Toggle */}
            <button
              onClick={toggleSidebar}
              className="p-3 border-t hover:bg-gray-50 transition-colors flex items-center justify-center"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Panel */}
        <main 
          className={cn(
            'flex-1 transition-all duration-200',
            sidebarCollapsed ? 'ml-16' : 'ml-64',
            drawerOpen && rightDrawer ? 'mr-96' : 'mr-0'
          )}
        >
          <div className={cn(
            'min-h-screen',
            !fullWidth && 'max-w-[1400px] mx-auto px-6 py-6'
          )}>
            {children}
          </div>
        </main>

        {/* Right Context Drawer */}
        {rightDrawer && (
          <aside 
            className={cn(
              'fixed right-0 bottom-0 w-96 bg-white border-l shadow-lg z-20 transition-transform duration-200',
              totalHeaderHeight,
              drawerOpen ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            <div className="h-full flex flex-col">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Activity & Alerts</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDrawer}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto">
                {rightDrawer}
              </div>
            </div>
          </aside>
        )}

        {/* Right Drawer Toggle (when closed) */}
        {rightDrawer && !drawerOpen && (
          <button
            onClick={toggleDrawer}
            className={cn(
              'fixed right-0 w-8 h-16 bg-white border border-r-0 rounded-l-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors z-10',
              showAdmissionBar && admission ? 'top-40' : 'top-28'
            )}
            aria-label="Open activity drawer"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
});

PatientChartShell.displayName = 'PatientChartShell';

export default PatientChartShell;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
import PatientChartShell from './components/shells/PatientChartShell';
import { FileText, Pill, Calendar, Activity } from 'lucide-react';

function PatientChartPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const patient = {
    id: 'P-001',
    name: 'Sarah Johnson',
    mrn: 'MRN-123456',
    dob: '1945-03-15',
    age: 79,
    office: 'Central Office',
  };

  const admission = {
    id: 'A-001',
    startDate: '2024-01-15',
    status: 'active' as const,
    primaryPayer: 'Medicare',
    disciplines: ['Nursing', 'PT', 'OT'],
    caseManager: 'Jane Smith',
    authorizationStatus: 'approved' as const,
  };

  const navigationTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FileText className="w-4 h-4" />,
      level: 'patient' as const,
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview',
    },
    {
      id: 'medications',
      label: 'Medications',
      icon: <Pill className="w-4 h-4" />,
      level: 'patient' as const,
      badge: 12,
      onClick: () => setActiveTab('medications'),
      active: activeTab === 'medications',
    },
    {
      id: 'visits',
      label: 'Visit Notes',
      icon: <Calendar className="w-4 h-4" />,
      level: 'admission' as const,
      badge: 3,
      onClick: () => setActiveTab('visits'),
      active: activeTab === 'visits',
    },
  ];

  return (
    <PatientChartShell
      patient={patient}
      admission={admission}
      navigationTabs={navigationTabs}
      rightDrawer={<div>Activity timeline here</div>}
      quickActions={
        <>
          <Button size="sm" className="w-full">New Visit</Button>
          <Button size="sm" variant="outline" className="w-full">Add Order</Button>
        </>
      }
    >
      <div>Main chart content for {activeTab}</div>
    </PatientChartShell>
  );
}
*/
