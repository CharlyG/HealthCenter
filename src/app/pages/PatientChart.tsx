/**
 * Patient Chart - Split Layout Implementation
 * Aligned with design spec: patient-chart-design-1.md
 *
 * Layout:
 *  - Sticky Patient Context Header (always visible)
 *  - Left Navigation Panel (8 sections)
 *  - Main Content Area (selected section)
 *  - Right Context Drawer (alerts, care team, authorization summary, recent activity, recent docs)
 *  - AI Clinical Assistant floating overlay
 */
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft,
  LayoutDashboard,
  FolderOpen,
  Calendar,
  ScrollText,
  FileText,
  DollarSign,
  Heart,
  Activity,
  PanelRightOpen,
  PanelRightClose,
  Loader2,
  User,
  MapPin,
  ClipboardList,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePatient } from '../hooks/usePatients';
import { useOffices } from '../hooks/useOffices';
import { useAlerts } from '../context/AlertContext';
import { PatientContextHeader, type PatientAdmission } from '../components/design-system/PatientContextHeader';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { admissionGateway, visitGateway, patientDocumentGateway } from '../lib/dataGateway';

// Admission context
import { AdmissionProvider, useAdmission } from '../context/AdmissionContext';
import AdmissionContextBar from '../components/patient/AdmissionContextBar';

// Section components
import PatientOverview from '../components/patient/sections/PatientOverview';
import PatientDemographics from '../components/patient/sections/PatientDemographics';
import PatientLocations from '../components/patient/sections/PatientLocations';
import PatientReferralHistory from '../components/patient/sections/PatientReferralHistory';
import PatientAdmissions from '../components/PatientAdmissions';
import AdmissionOverview from '../components/patient/sections/AdmissionOverview';
import PatientVisits from '../components/patient/sections/PatientVisits';
import PatientClinicalDocumentation from '../components/patient/sections/PatientClinicalDocumentation';
import PatientOrders from '../components/patient/sections/PatientOrders';
import PatientAssessments from '../components/patient/sections/PatientAssessments';
import PatientScheduling from '../components/patient/sections/PatientScheduling';
import PatientDocuments from '../components/PatientDocuments';
import PatientBilling from '../components/patient/sections/PatientBilling';
import PatientCareTeamSection from '../components/patient/sections/PatientCareTeamSection';
import PatientHospice from '../components/patient/sections/PatientHospice';
import PatientActivity from '../components/patient/sections/PatientActivity';
import PatientTimeline from '../components/patient/sections/PatientTimeline';

// Right drawer content components
import PatientAlerts from '../components/patient/drawer/PatientAlerts';
import PatientCareTeam from '../components/patient/drawer/PatientCareTeam';
import PatientAuthorizationSummary from '../components/patient/drawer/PatientAuthorizationSummary';
import PatientRecentDocuments from '../components/patient/drawer/PatientRecentDocuments';
import PatientActivityFeed from '../components/patient/drawer/PatientActivityFeed';

// AI Clinical Assistant
import AssistantPanel from '../components/clinical-assistant/AssistantPanel';
import { AssistantTrigger } from '../components/clinical-assistant/AssistantTrigger';

// ─── Section Type ───────────────────────────────────────────────────────────
type Section =
  // Patient-Level Sections
  | 'overview'
  | 'demographics'
  | 'locations'
  | 'patient-documents'
  | 'referral-history'
  // Admission-Level Sections
  | 'admission-overview'
  | 'visits'
  | 'clinical-documentation'
  | 'orders'
  | 'assessments'
  | 'scheduling'
  | 'billing'
  | 'care-team'
  | 'hospice'
  | 'timeline';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  requiresAdmission?: boolean;
  isPatientLevel?: boolean;
  isAdmissionLevel?: boolean;
}

// Patient-Level Navigation
const PATIENT_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="size-4" />, isPatientLevel: true },
  { id: 'demographics', label: 'Demographics', icon: <User className="size-4" />, isPatientLevel: true },
  { id: 'locations', label: 'Locations', icon: <MapPin className="size-4" />, isPatientLevel: true },
  { id: 'patient-documents', label: 'Patient Documents', icon: <FileText className="size-4" />, isPatientLevel: true },
  { id: 'referral-history', label: 'Referral History', icon: <FileText className="size-4" />, isPatientLevel: true },
];

// Admission-Level Navigation
const ADMISSION_NAV_ITEMS: NavItem[] = [
  { id: 'admission-overview', label: 'Admission Overview', icon: <FolderOpen className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'visits', label: 'Visits', icon: <Calendar className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'clinical-documentation', label: 'Clinical Documentation', icon: <ScrollText className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'orders', label: 'Orders', icon: <FileText className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'assessments', label: 'Assessments', icon: <ClipboardList className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'scheduling', label: 'Scheduling', icon: <Calendar className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'billing', label: 'Billing', icon: <DollarSign className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'care-team', label: 'Care Team', icon: <Users className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'hospice', label: 'Hospice', icon: <Heart className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
  { id: 'timeline', label: 'Timeline', icon: <Activity className="size-4" />, requiresAdmission: true, isAdmissionLevel: true },
];

// Combined navigation
const NAV_ITEMS: NavItem[] = [...PATIENT_NAV_ITEMS, ...ADMISSION_NAV_ITEMS];

// ─── PatientChart ───────────────────────────────────────────────────────────
export default function PatientChart() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<Section>('overview');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Admission switcher state
  const [admissions, setAdmissions] = useState<PatientAdmission[]>([]);
  const [activeAdmissionId, setActiveAdmissionId] = useState<string | undefined>(undefined);

  // Data hooks
  const { patient, loading } = usePatient(patientId);
  const { offices } = useOffices();
  const { getPatientAlertCounts } = useAlerts();

  // Nav badge counts
  const [navBadges, setNavBadges] = useState<Record<string, number>>({});

  // Compute patient-specific alert count
  const patientAlertCounts = patientId ? getPatientAlertCounts(patientId) : undefined;
  const patientAlertCount = patientAlertCounts
    ? (patientAlertCounts.critical || 0) + (patientAlertCounts.high || 0) + (patientAlertCounts.warning || 0) + (patientAlertCounts.info || 0)
    : 0;

  // Fetch nav badge counts (visits, documents, admissions)
  useEffect(() => {
    if (!patientId) return;
    const fetchBadges = async () => {
      try {
        const [visits, docs, adms] = await Promise.all([
          visitGateway.getByPatientId(patientId).catch(() => []),
          patientDocumentGateway.list(patientId).catch(() => []),
          admissionGateway.search({
            filters: { patientId },
            pagination: { page: 1, pageSize: 50 },
          }).catch(() => ({ data: [] })),
        ]);

        const now = new Date();
        const upcomingVisits = (visits as any[]).filter((v: any) => {
          const d = new Date(v.scheduledDate || v.scheduled_date);
          return d >= now && (v.status === 'scheduled' || v.status === 'confirmed');
        }).length;

        const pendingDocs = (visits as any[]).filter((v: any) =>
          v.documentation_status === 'pending' || v.documentation_status === 'in_progress'
        ).length;

        setNavBadges({
          admissions: ((adms as any).data || []).length,
          visits: upcomingVisits,
          'clinical-documentation': pendingDocs,
          documents: (docs as any[]).length,
        });
      } catch (err) {
        console.error('[PatientChart] Badge count error:', err);
      }
    };
    fetchBadges();
  }, [patientId]);

  // Build nav items with dynamic badges
  const navItemsWithBadges = useMemo<NavItem[]>(() =>
    NAV_ITEMS.map((item) => ({
      ...item,
      badge: navBadges[item.id] ?? item.badge,
    })),
    [navBadges]
  );

  // Load admissions for switcher
  const loadAdmissions = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await admissionGateway.search({
        filters: { patientId },
        pagination: { page: 1, pageSize: 20 },
      });
      const mapped: PatientAdmission[] = (res.data || []).map((a: any) => ({
        id: a.id,
        label: `${a.type || 'Home Health'} — ${a.status}`,
        status: a.status,
        type: a.type || 'Home Health',
        soc_date: a.socDate || a.soc_date,
      }));
      setAdmissions(mapped);
      const active = mapped.find((a) => a.status === 'active' || a.status === 'admitted');
      if (active) {
        setActiveAdmissionId(active.id);
      } else if (mapped.length > 0) {
        setActiveAdmissionId(mapped[0].id);
      }
    } catch (err) {
      console.error('[PatientChart] Failed to load admissions:', err);
    }
  }, [patientId]);

  useEffect(() => {
    loadAdmissions();
  }, [loadAdmissions]);

  // Quick action handler
  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'schedule-visit':
        navigate(`/scheduling?patientId=${patientId}`);
        break;
      case 'start-documentation':
        setCurrentSection('clinical-documentation');
        break;
      case 'upload-document':
        setCurrentSection('documents');
        toast.info('Navigate to the Documents tab to upload files');
        break;
      case 'send-message':
        toast.info('Internal messaging coming soon');
        break;
      case 'view-alerts':
        if (!drawerOpen) setDrawerOpen(true);
        break;
      default:
        toast.info(`Action: ${action}`);
    }
  }, [navigate, patientId, drawerOpen]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading patient chart...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <User className="size-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Patient not found</p>
          <Button onClick={() => navigate('/patient')}>Back to Patient List</Button>
        </div>
      </div>
    );
  }

  const officeForPatient = offices.find((o) => o.id === patient.office_id);
  const hasActiveAdmission =
    admissions.some((a) => a.status === 'active' || a.status === 'admitted') || admissions.length > 0;

  // Wrap the chart interior in AdmissionProvider so all child components
  // can consume the active admission via useAdmission()
  return (
    <AdmissionProvider patientId={patient.id}>
      <PatientChartInner
        patient={patient}
        officeForPatient={officeForPatient}
        patientAlertCount={patientAlertCount}
        handleQuickAction={handleQuickAction}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        navItemsWithBadges={navItemsWithBadges}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        assistantOpen={assistantOpen}
        setAssistantOpen={setAssistantOpen}
        navigate={navigate}
      />
    </AdmissionProvider>
  );
}

// ─── Admission-scoped modules (filter by active admission) ──────────────────
const ADMISSION_SCOPED_SECTIONS = new Set<Section>([
  'admission-overview',
  'visits',
  'clinical-documentation',
  'orders',
  'assessments',
  'scheduling',
  'billing',
  'care-team',
  'hospice',
  'timeline',
]);

// Patient-level modules (no admission filtering)
const PATIENT_SCOPED_SECTIONS = new Set<Section>([
  'overview',
  'demographics',
  'locations',
  'patient-documents',
  'referral-history',
]);

// ─── Inner chart component (has access to AdmissionContext) ──────────────────
function PatientChartInner({
  patient,
  officeForPatient,
  patientAlertCount,
  handleQuickAction,
  currentSection,
  setCurrentSection,
  navItemsWithBadges,
  drawerOpen,
  setDrawerOpen,
  assistantOpen,
  setAssistantOpen,
  navigate,
}: {
  patient: any;
  officeForPatient: any;
  patientAlertCount: number;
  handleQuickAction: (action: string) => void;
  currentSection: Section;
  setCurrentSection: (s: Section) => void;
  navItemsWithBadges: NavItem[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  // ─── AdmissionContext is now the single source of truth ─────────────────
  const {
    admissions: ctxAdmissions,
    activeAdmissionId: ctxAdmissionId,
    setActiveAdmissionId: ctxSetActive,
    hasAdmissions,
    hasActiveAdmission,
  } = useAdmission();

  // Map context admissions → PatientAdmission[] for header compatibility
  const headerAdmissions: PatientAdmission[] = useMemo(
    () =>
      ctxAdmissions.map((a) => ({
        id: a.id,
        label: a.label,
        status: a.status,
        type: a.type,
        soc_date: a.admissionDate,
      })),
    [ctxAdmissions],
  );

  // Determine if current section is admission-scoped
  const isAdmissionSection = ADMISSION_SCOPED_SECTIONS.has(currentSection);

  // Render current section — admission-scoped sections receive admissionId
  const renderSection = () => {
    const admId = ctxAdmissionId ?? undefined;

    switch (currentSection) {
      // Patient-level modules
      case 'overview':
        return <PatientOverview patient={patient} />;
      case 'demographics':
        return <PatientDemographics patient={patient} />;
      case 'locations':
        return <PatientLocations patientId={patient.id} />;
      case 'patient-documents':
        return <PatientDocuments patientId={patient.id} />;
      case 'referral-history':
        return <PatientReferralHistory patientId={patient.id} />;
      // Admission-scoped modules
      case 'admission-overview':
        return <AdmissionOverview patientId={patient.id} admissionId={admId} />;
      case 'visits':
        return <PatientVisits patientId={patient.id} admissionId={admId} />;
      case 'clinical-documentation':
        return <PatientClinicalDocumentation patientId={patient.id} admissionId={admId} />;
      case 'orders':
        return <PatientOrders patientId={patient.id} admissionId={admId} />;
      case 'assessments':
        return <PatientAssessments patientId={patient.id} admissionId={admId} />;
      case 'scheduling':
        return <PatientScheduling patientId={patient.id} admissionId={admId} />;
      case 'billing':
        return <PatientBilling patientId={patient.id} admissionId={admId} />;
      case 'care-team':
        return <PatientCareTeamSection patientId={patient.id} admissionId={admId} />;
      case 'hospice':
        return <PatientHospice patientId={patient.id} admissionId={admId} />;
      case 'timeline':
        return <PatientTimeline patientId={patient.id} admissionId={admId} />;
      default:
        return <PatientOverview patient={patient} />;
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* ═══ Sticky Patient Context Header ═══ */}
      <PatientContextHeader
        patient={{
          ...patient,
          office_name: officeForPatient?.name,
          admission_status: hasActiveAdmission ? 'admitted' : 'not_admitted',
          alert_count: patientAlertCount,
        }}
        admissions={headerAdmissions}
        activeAdmissionId={ctxAdmissionId ?? undefined}
        onAdmissionChange={(id) => ctxSetActive(id)}
        onQuickAction={handleQuickAction}
      />

      {/* ═══ Admission Context Bar ═══ */}
      <AdmissionContextBar />

      {/* ═══ Three-Panel Layout ═══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── Left Navigation Panel ─── */}
        <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* Back Button */}
          <div className="p-3 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patient')}
              className="w-full justify-start text-gray-600"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Patients
            </Button>
          </div>

          {/* Navigation Items */}
          <ScrollArea className="flex-1">
            <nav className="p-2 space-y-3">
              {/* Patient-Level Navigation */}
              <div>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Patient Information
                </div>
                <div className="space-y-0.5 mt-1">
                  {PATIENT_NAV_ITEMS.map((item) => {
                    const isActive = currentSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentSection(item.id)}
                        className={`
                          w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          flex items-center gap-2.5
                          ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="outline" className="ml-1 text-[10px] h-5 px-1.5">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />

              {/* Admission-Level Navigation */}
              <div>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderOpen className="size-3" />
                  Admission Context
                </div>
                <div className="space-y-0.5 mt-1">
                  {ADMISSION_NAV_ITEMS.map((item) => {
                    const isActive = currentSection === item.id;
                    const isDisabled = item.requiresAdmission && !hasActiveAdmission;
                    return (
                      <button
                        key={item.id}
                        onClick={() => !isDisabled && setCurrentSection(item.id)}
                        disabled={isDisabled}
                        className={`
                          w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          flex items-center gap-2.5
                          ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : isDisabled
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <span className={isActive ? 'text-blue-600' : isDisabled ? 'text-gray-300' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="outline" className="ml-1 text-[10px] h-5 px-1.5">
                            {item.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>
          </ScrollArea>

          {/* Drawer Toggle */}
          <div className="p-3 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="w-full justify-start gap-2 text-gray-600"
            >
              {drawerOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
              {drawerOpen ? 'Hide' : 'Show'} Context
            </Button>
          </div>
        </aside>

        {/* ─── Main Content Area ─── */}
        <main className="flex-1 overflow-auto bg-white">
          {/* Scope banner for admission-scoped sections */}
          {isAdmissionSection && ctxAdmissionId && (
            <div className="px-6 pt-3 pb-0">
              <div className="flex items-center gap-2 text-[11px] text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-3 py-1.5">
                <FolderOpen className="size-3.5" />
                <span>
                  Showing data for the <strong>selected admission</strong>. Switch admissions using the context bar above.
                </span>
              </div>
            </div>
          )}
          <div className="p-6">{renderSection()}</div>
        </main>

        {/* ─── Right Context Drawer ─── */}
        {drawerOpen && (
          <aside className="w-80 flex-shrink-0 bg-gray-50 border-l border-gray-200 overflow-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Patient Context</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDrawerOpen(false)}
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              >
                <PanelRightClose className="size-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {/* Alerts — patient-level */}
              <PatientAlerts patientId={patient.id} />

              {/* Care Team */}
              <PatientCareTeam patientId={patient.id} />

              {/* Authorization Summary */}
              <PatientAuthorizationSummary patientId={patient.id} />

              {/* Recent Activity */}
              <PatientActivityFeed patientId={patient.id} />

              {/* Recent Documents */}
              <PatientRecentDocuments patientId={patient.id} />
            </div>
          </aside>
        )}
      </div>

      {/* ═══ AI Clinical Assistant — floating overlay ═══ */}
      <AssistantTrigger
        onClick={() => setAssistantOpen(true)}
        isOpen={assistantOpen}
        hasInsights
        insightCount={0}
      />
      <AssistantPanel
        patientId={patient.id}
        patientName={`${patient.first_name} ${patient.last_name}`}
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}