// CRITICAL: Import error suppression FIRST to handle Figma HMR errors
import './error-suppression';

import { RouterProvider, createBrowserRouter, Outlet } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import Root from "./components/Root";
import { lazy, Suspense, useState, useEffect, Component as ReactComponent } from 'react';

// Eager load only critical auth components
import Login from "./pages/Login";
import ModuleDisabled from "./pages/ModuleDisabled";
import NotFound from "./pages/NotFound";

// Lazy load all module pages - they'll only load when navigated to
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PlatformConfig = lazy(() => import("./pages/PlatformConfig"));
const PatientList = lazy(() => import('./pages/PatientList'));
const PatientListNew = lazy(() => import('./pages/PatientListNew'));
const PatientDetails = lazy(() => import('./pages/PatientDetails'));
const PatientDetailsNew = lazy(() => import('./pages/PatientDetailsNew'));
const PatientChart = lazy(() => import('./pages/PatientChart'));
const AdmissionDetails = lazy(() => import("./pages/AdmissionDetails"));
const AdmissionsWorkspace = lazy(() => import("./pages/AdmissionsWorkspace"));
const AdmissionDetail = lazy(() => import("./pages/AdmissionDetail"));
const Admissions = lazy(() => import("./pages/Admissions"));
const Scheduling = lazy(() => import("./pages/Scheduling"));
const CareConnect = lazy(() => import("./pages/CareConnect"));
const Monitor = lazy(() => import("./pages/Monitor"));
const Hospice = lazy(() => import("./pages/Hospice"));
const DesignSystemShowcase = lazy(() => import("./pages/DesignSystemShowcase"));

// Point of Care / EVV pages
const PointOfCareWorkspace = lazy(() => import("./pages/PointOfCareWorkspace"));
const VisitDetail = lazy(() => import("./pages/VisitDetail"));
const ManualVisitForm = lazy(() => import("./pages/ManualVisitForm"));
const PointOfCareMonitor = lazy(() => import("./pages/PointOfCareMonitor"));
const CaregiverFieldApp = lazy(() => import("./pages/CaregiverFieldApp"));

// Clinical pages
const Clinical = lazy(() => import("./pages/Clinical"));
const VisitNotes = lazy(() => import("./pages/VisitNotes"));
const PlansOfCare = lazy(() => import("./pages/PlansOfCare"));
const VerbalOrders = lazy(() => import("./pages/VerbalOrders"));
const QAReview = lazy(() => import("./pages/QAReview"));

const Billing = lazy(() => import("./pages/Billing"));
const PayerIntegrationHub = lazy(() => import("./pages/PayerIntegrationHub"));
const X12TestingWorkspace = lazy(() => import("./components/payer-integration/X12TestingWorkspace").then(m => ({ default: m.X12TestingWorkspace })));

const ClinicalAssessmentEnginePage = lazy(() => import("./pages/ClinicalAssessmentEnginePage"));
const AssessmentWorkspacePage = lazy(() => import("./pages/AssessmentWorkspacePage"));
const AssessmentWorkspace = lazy(() => import("./pages/AssessmentWorkspace"));
const DemoAssessmentEditor = lazy(() => import("./pages/DemoAssessmentEditor"));
const OasisWorkspace = lazy(() => import("./pages/OasisWorkspace"));
const OasisEditor = lazy(() => import("./pages/OasisEditor"));
const OasisDashboard = lazy(() => import("./pages/OasisDashboard"));

const SNAssessmentDemoPage = lazy(() => import("./components/skilled-nursing/SNAssessmentDemoPage").then(m => ({ default: m.SNAssessmentDemoPage })));

const NewAdmission = lazy(() => import("./pages/NewAdmission"));
const DischargeWorkflow = lazy(() => import("./pages/DischargeWorkflow"));

const RiskDashboard = lazy(() => import("./pages/RiskDashboard"));

// Cosign Queue with error boundary fix
const CosignQueue = lazy(() => import("./pages/CosignQueue").catch(() => ({
  default: () => (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Module Load Error</h2>
        <p className="text-sm text-red-700">
          The Cosign Queue module failed to load. This may be a temporary issue.
          Please try refreshing the page or navigating to a different route first.
        </p>
      </div>
    </div>
  )
})));

const CosignAnalytics = lazy(() => import("./pages/CosignAnalytics"));

const ReferralPipeline = lazy(() => import("./pages/ReferralPipeline"));

const ReferralAnalytics = lazy(() => import("./pages/ReferralAnalytics"));

const AdmissionQueuesWorkspace = lazy(() => import("./pages/AdmissionQueuesWorkspace"));

const AdmissionTimelinePage = lazy(() => import("./pages/AdmissionTimelinePage"));

const DocumentationTrackerPage = lazy(() => import("./pages/DocumentationTrackerPage"));

const EpisodeProgressPage = lazy(() => import("./pages/EpisodeProgressPage"));

const ContextHierarchyDemoPage = lazy(() => import("./pages/ContextHierarchyDemoPage"));

const ContextDisplayDemoPage = lazy(() => import("./pages/ContextDisplayDemoPage"));

const NavigationDemoPage = lazy(() => import("./pages/NavigationDemoPage"));

const WorkspaceDemoPage = lazy(() => import("./pages/WorkspaceDemoPage"));

const PatientChartDemoPage = lazy(() => import("./pages/PatientChartDemoPage"));

const EpisodeOfCareDemoPage = lazy(() => import("./pages/EpisodeOfCareDemoPage"));

const OperationalQueuesDemoPage = lazy(() => import("./pages/OperationalQueuesDemoPage"));

const CrossModuleInteractionDemoPage = lazy(() => import("./pages/CrossModuleInteractionDemoPage"));

const ActivityFeedDemoPage = lazy(() => import("./pages/ActivityFeedDemoPage"));

const NotificationSystemDemoPage = lazy(() => import("./pages/NotificationSystemDemoPage"));

const AdmissionReadinessDemoPage = lazy(() => import("./pages/AdmissionReadinessDemoPage"));

const AdmissionPipelineDemoPage = lazy(() => import("./pages/AdmissionPipelineDemoPage"));

const AdmissionPipelineWorkspace = lazy(() => import("./pages/AdmissionPipelineWorkspace"));

const AdmissionSetupWizardDemoPage = lazy(() => import("./pages/AdmissionSetupWizardDemoPage"));

const CareOpsCommandCenterDemoPage = lazy(() => import("./pages/CareOpsCommandCenterDemoPage"));

const CareOpsCommandCenterWorkspace = lazy(() => import("./pages/CareOpsCommandCenterWorkspace"));

const OperationalHeatmapDemoPage = lazy(() => import("./pages/OperationalHeatmapDemoPage"));

const OperationalHeatmapWorkspace = lazy(() => import("./pages/OperationalHeatmapWorkspace"));

const AuthorizationTrackerPage = lazy(() => import("./pages/AuthorizationTrackerPage"));

const VisitPreparationPanelDemoPage = lazy(() => import("./pages/VisitPreparationPanelDemoPage"));

const VisitExecutionScreenDemoPage = lazy(() => import("./pages/VisitExecutionScreenDemoPage"));

const SmartDocumentationEditorDemoPage = lazy(() => import("./pages/SmartDocumentationEditorDemoPage"));

const CaregiverDashboardDemoPage = lazy(() => import("./pages/CaregiverDashboardDemoPage"));

const CaregiverDashboardWorkspace = lazy(() => import("./pages/CaregiverDashboardWorkspace"));

const OfflineModeDemoPage = lazy(() => import("./pages/OfflineModeDemoPage"));

const SmartDocumentationEditorOfflinePage = lazy(() => import("./pages/SmartDocumentationEditorOfflinePage"));

const OfflineSyncDemo = lazy(() => import("./pages/OfflineSyncDemo"));

const VisitTimelineDemoPage = lazy(() => import("./pages/VisitTimelineDemoPage"));

const PredictiveSchedulingDemo = lazy(() => import("./pages/PredictiveSchedulingDemo"));

const VisitTimelinePage = lazy(() => import("./pages/VisitTimelinePage"));

const TimelineTest = lazy(() => import("./pages/TimelineTest"));

const ClinicalDocumentationArchitectureDemo = lazy(() => import("./pages/ClinicalDocumentationArchitectureDemo"));

const PhysicalTherapyModule = lazy(() => import("./pages/PhysicalTherapyModule"));

const PhysicalTherapyModuleDemo = lazy(() => import("./pages/PhysicalTherapyModuleDemo"));

const SpeechTherapyModule = lazy(() => import("./pages/SpeechTherapyModule"));

const SpeechTherapyModuleDemo = lazy(() => import("./pages/SpeechTherapyModuleDemo"));

const DocumentStatusSystemDemo = lazy(() => import("./pages/DocumentStatusSystemDemo"));

const ClinicalDocumentationListView = lazy(() => import("./pages/ClinicalDocumentationListView"));

const ValidationPanelDemo = lazy(() => import("./pages/ValidationPanelDemo"));

const ClinicalDocumentationWorkspace = lazy(() => import("./pages/ClinicalDocumentationWorkspace"));

const SkilledNursingModule = lazy(() => import("./pages/SkilledNursingModule"));

const OccupationalTherapyModule = lazy(() => import("./pages/OccupationalTherapyModule"));

const MedicalSocialWorkModule = lazy(() => import("./pages/MedicalSocialWorkModule"));

const HomeHealthAideModule = lazy(() => import("./pages/HomeHealthAideModule"));

const WoundCareModule = lazy(() => import("./pages/WoundCareModule"));

const PhysicianOrdersModule = lazy(() => import("./pages/PhysicianOrdersModule"));

const PlanOfCareModule = lazy(() => import("./pages/PlanOfCareModule"));

const RecertificationModule = lazy(() => import("./pages/RecertificationModule"));

const DischargeSummaryModule = lazy(() => import("./pages/DischargeSummaryModule"));

const ClinicalDocumentationEnginePage = lazy(() => import("./pages/ClinicalDocumentationEnginePage"));

const ClinicalComplianceMonitor = lazy(() => import("./pages/ClinicalComplianceMonitor"));

const AssessmentEnginePage = lazy(() => import("./pages/AssessmentEnginePage"));

const ClinicalAssessmentViewer = lazy(() => import("./pages/ClinicalAssessmentViewer"));

const SkilledNursingAssessmentEditor = lazy(() => import("./pages/SkilledNursingAssessmentEditor"));

const UniversalAssessmentEditor = lazy(() => import("./pages/UniversalAssessmentEditor"));

const ConditionalLogicAssessmentDemo = lazy(() => import("./pages/ConditionalLogicAssessmentDemo"));

const DynamicValidationPanelDemo = lazy(() => import("./pages/DynamicValidationPanelDemo"));

const AssessmentProgressTracker = lazy(() => import("./pages/AssessmentProgressTracker"));

const AssessmentHistoryPage = lazy(() => import("./pages/AssessmentHistoryPage"));

const AssessmentComparisonView = lazy(() => import("./pages/AssessmentComparisonView"));

const AssessmentSubmissionWorkflow = lazy(() => import("./pages/AssessmentSubmissionWorkflow"));

const AssessmentManagementDashboard = lazy(() => import("./pages/AssessmentManagementDashboard"));

const AssessmentTemplateLibrary = lazy(() => import("./pages/AssessmentTemplateLibrary"));

const AssessmentAnalyticsDashboard = lazy(() => import("./pages/AssessmentAnalyticsDashboard"));

const PatientMedicationProfile = lazy(() => import("./pages/PatientMedicationProfile"));

const PatientMedicationProfileView = lazy(() => import("./pages/PatientMedicationProfileView"));

const MedicationReconciliationWorkflow = lazy(() => import("./pages/MedicationReconciliationWorkflow"));

const MedicationChangeTracking = lazy(() => import("./pages/MedicationChangeTracking"));

const VisitDocumentationMedicationDemo = lazy(() => import("./pages/VisitDocumentationMedicationDemo"));

const MedicationAlertsDemo = lazy(() => import("./pages/MedicationAlertsDemo"));

const MedicationSearchAddDemo = lazy(() => import("./pages/MedicationSearchAddDemo"));

const MedicationTimelineDemo = lazy(() => import("./pages/MedicationTimelineDemo"));

const MedicationHistoryDrawerDemo = lazy(() => import("./pages/MedicationHistoryDrawerDemo"));

const AdmissionMedicationReviewDashboardPage = lazy(() => import("./pages/AdmissionMedicationReviewDashboardPage"));

const CarePlanManagementPage = lazy(() => import("./pages/CarePlanManagementPage"));

const CarePlanEditorPage = lazy(() => import("./pages/CarePlanEditorPage"));

const VisitFrequencyPage = lazy(() => import("./pages/VisitFrequencyPage"));

const FrequencyComplianceTrackerPage = lazy(() => import("./pages/FrequencyComplianceTrackerPage"));

const WoundCareTrackingPage = lazy(() => import("./pages/WoundCareTrackingPage"));

const ClinicalAlertsDashboardPage = lazy(() => import("./pages/ClinicalAlertsDashboardPage"));

const EnhancedVisitPreparationPage = lazy(() => import("./pages/EnhancedVisitPreparationPage"));

const ClinicalControlCenterPage = lazy(() => import("./pages/ClinicalControlCenterPage"));

const OrdersCertificationPage = lazy(() => import("./pages/OrdersCertificationPage"));

const OrdersWorkspacePage = lazy(() => import("./pages/OrdersWorkspacePage"));

const PhysicianOrdersListPage = lazy(() => import("./pages/PhysicianOrdersListPage"));

const VerbalOrderWorkflowPage = lazy(() => import("./pages/VerbalOrderWorkflowPage"));

const PlanOfCare485Page = lazy(() => import("./pages/PlanOfCare485Page"));

const SignatureWorkflowCenterPage = lazy(() => import("./pages/SignatureWorkflowCenterPage"));

const ReturnedDocumentWorkflowPage = lazy(() => import("./pages/ReturnedDocumentWorkflowPage"));

const DocumentActivityTimelinePage = lazy(() => import("./pages/DocumentActivityTimelinePage"));

const OperationalOrdersQueuePage = lazy(() => import("./pages/OperationalOrdersQueuePage"));

const RecertificationWorkspacePage = lazy(() => import("./pages/RecertificationWorkspacePage"));

const RecertificationReadinessTrackerPage = lazy(() => import("./pages/RecertificationReadinessTrackerPage"));

const DischargeDocumentationWorkflowPage = lazy(() => import("./pages/DischargeDocumentationWorkflowPage"));

const EpisodeClosureChecklistPage = lazy(() => import("./pages/EpisodeClosureChecklistPage"));

const ContextualOrderCreationPage = lazy(() => import("./pages/ContextualOrderCreationPage"));

const CertificationOrdersSummaryCardsPage = lazy(() => import("./pages/CertificationOrdersSummaryCardsPage"));

const OrdersCertificationAlertsPage = lazy(() => import("./pages/OrdersCertificationAlertsPage"));

const CertificationOrdersSummaryPanelPage = lazy(() => import("./pages/CertificationOrdersSummaryPanelPage"));

const QACenterPage = lazy(() => import("./pages/QACenterPage"));

const QAWorkspacePage = lazy(() => import("./pages/QAWorkspacePage"));

const DocumentReviewInterfacePage = lazy(() => import("./pages/DocumentReviewInterfacePage"));

const ReturnForCorrectionWorkflowPage = lazy(() => import("./pages/ReturnForCorrectionWorkflowPage"));

const QAReviewSystemPage = lazy(() => import("./pages/QAReviewSystemPage"));

const ComplianceChecklistPage = lazy(() => import("./pages/ComplianceChecklistPage"));

const QASystemPage = lazy(() => import("./pages/QASystemPage"));

const QAAdvancedSystemPage = lazy(() => import("./pages/QAAdvancedSystemPage"));

const QAMetricsSystemPage = lazy(() => import("./pages/QAMetricsSystemPage"));

const CaregiverProfilePage = lazy(() => import("./pages/CaregiverProfilePage"));

const CredentialManagementPage = lazy(() => import("./pages/CredentialManagementPage"));

const CaregiverManagementPage = lazy(() => import("./pages/CaregiverManagementPage"));

const CaregiverComplianceIntegrationPage = lazy(() => import("./pages/CaregiverComplianceIntegrationPage"));

const IntegrationArchitecturePage = lazy(() => import("./pages/IntegrationArchitecturePage"));

const IntegrationManagementWorkspace = lazy(() => import("./pages/IntegrationManagementWorkspace"));

const PlatformConfigurationCenter = lazy(() => import("./pages/PlatformConfigurationCenter"));

const PlatformConfigurationCenterExpanded = lazy(() => import("./pages/PlatformConfigurationCenterExpanded"));

const NavigationArchitectureDemo = lazy(() => import("./pages/NavigationArchitectureDemo"));

const NavigationSystemComplete = lazy(() => import("./pages/NavigationSystemComplete"));

// Shell Architecture Demo
const ShellDemo = lazy(() => import("./pages/ShellDemo"));

// Design System Demo
const DesignSystemDemo = lazy(() => import("./pages/DesignSystemDemo"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="size-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-gray-500">Loading module...</div>
      </div>
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="size-full flex items-center justify-center p-8">
      <div className="max-w-lg w-full bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Module Load Error</h2>
        <p className="text-sm text-red-700 mb-3">
          {error?.message || 'The module failed to load. This may be a temporary issue.'}
        </p>
        <p className="text-xs text-red-600">
          Try refreshing the page or navigating to a different route first.
        </p>
      </div>
    </div>
  );
}

// Wrapper component to add Suspense boundary for lazy-loaded routes
// with error handling to prevent IframeMessageAbortError
function LazyRoute({ Component }: { Component: React.LazyExoticComponent<() => JSX.Element> }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    // Reset error state when component changes
    setHasError(false);
    setError(undefined);

    // Add global error handler for IframeMessageAbortError
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || event.message || '';
      const errorName = event.error?.name || '';
      
      // Suppress IframeMessageAbortError from HMR
      if (
        errorName === 'IframeMessageAbortError' || 
        errorMessage.includes('IframeMessageAbortError') ||
        errorMessage.includes('message port was destroyed') ||
        errorMessage.includes('Message aborted')
      ) {
        event.preventDefault();
        event.stopPropagation();
        console.warn('HMR reload detected, suppressing IframeMessageAbortError');
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonMessage = reason?.message || String(reason) || '';
      const reasonName = reason?.name || '';
      
      // Suppress IframeMessageAbortError rejections
      if (
        reasonName === 'IframeMessageAbortError' || 
        reasonMessage.includes('IframeMessageAbortError') ||
        reasonMessage.includes('message port was destroyed') ||
        reasonMessage.includes('Message aborted')
      ) {
        event.preventDefault();
        console.warn('HMR reload detected, suppressing promise rejection');
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [Component]);

  if (hasError) {
    return <ErrorFallback error={error} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundaryWrapper onError={(err) => {
        setHasError(true);
        setError(err);
      }}>
        <Component />
      </ErrorBoundaryWrapper>
    </Suspense>
  );
}

// Error Boundary component to catch errors during rendering
class ErrorBoundaryWrapper extends ReactComponent<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    const errorMessage = error?.message || '';
    const errorName = error?.name || '';
    
    // Ignore IframeMessageAbortError from HMR
    if (
      errorName === 'IframeMessageAbortError' || 
      errorMessage.includes('IframeMessageAbortError') ||
      errorMessage.includes('message port was destroyed') ||
      errorMessage.includes('Message aborted')
    ) {
      console.warn('HMR reload detected in error boundary, suppressing');
      return { hasError: false };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorMessage = error?.message || '';
    const errorName = error?.name || '';
    
    // Ignore IframeMessageAbortError
    if (
      errorName === 'IframeMessageAbortError' || 
      errorMessage.includes('IframeMessageAbortError') ||
      errorMessage.includes('message port was destroyed') ||
      errorMessage.includes('Message aborted')
    ) {
      console.warn('Caught HMR error, suppressing:', error);
      return;
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// ─── AuthLayout ──────────────────────────────────────────────────────────────
// React Router v7 data-mode creates an isolated React tree inside RouterProvider.
// Context providers placed ABOVE RouterProvider are NOT accessible to route
// components. The fix: a pathless top-level layout route that renders
// AuthProvider around <Outlet />, putting it INSIDE the router's tree.
function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

// Router defined at module level with AuthLayout as the root layout.
// All routes are children of AuthLayout, so every component in the tree
// (Login, Root, and all pages) has access to AuthContext.
const router = createBrowserRouter([
  {
    Component: AuthLayout,
    children: [
      { path: "/login", Component: Login },
      {
        path: "/",
        Component: Root,
        children: [
          { index: true, element: <LazyRoute Component={Dashboard} /> },
          { path: "patient", element: <LazyRoute Component={PatientList} /> },
          { path: "patient-new", element: <LazyRoute Component={PatientListNew} /> },
          { path: "patient/:patientId", element: <LazyRoute Component={PatientDetails} /> },
          { path: "patient-new/:patientId", element: <LazyRoute Component={PatientDetailsNew} /> },
          { path: "patient/:patientId/chart", element: <LazyRoute Component={PatientChart} /> },
          { path: "patient/:patientId/admission/:admissionId", element: <LazyRoute Component={AdmissionDetails} /> },
          { path: "admissions", element: <LazyRoute Component={AdmissionsWorkspace} /> },
          { path: "admissions/:admissionId", element: <LazyRoute Component={AdmissionDetail} /> },
          { path: "scheduling", element: <LazyRoute Component={Scheduling} /> },
          { path: "scheduling/new", element: <LazyRoute Component={ManualVisitForm} /> },
          { path: "careconnect", element: <LazyRoute Component={CareConnect} /> },
          { path: "monitor", element: <LazyRoute Component={Monitor} /> },
          { path: "hospice", element: <LazyRoute Component={Hospice} /> },
          { path: "poc", element: <LazyRoute Component={PointOfCareWorkspace} /> },
          { path: "poc/visit/:visitId", element: <LazyRoute Component={VisitDetail} /> },
          { path: "poc/manual-visit", element: <LazyRoute Component={ManualVisitForm} /> },
          { path: "poc/monitor", element: <LazyRoute Component={PointOfCareMonitor} /> },
          { path: "poc/caregiver-field-app", element: <LazyRoute Component={CaregiverFieldApp} /> },
          { path: "clinical", element: <LazyRoute Component={Clinical} /> },
          { path: "clinical/visit-notes", element: <LazyRoute Component={VisitNotes} /> },
          { path: "clinical/plans-of-care", element: <LazyRoute Component={PlansOfCare} /> },
          { path: "clinical/verbal-orders", element: <LazyRoute Component={VerbalOrders} /> },
          { path: "clinical/qa-review", element: <LazyRoute Component={QAReview} /> },
          { path: "admin/platform-config", element: <LazyRoute Component={PlatformConfig} /> },
          { path: "design-system", element: <LazyRoute Component={DesignSystemShowcase} /> },
          { path: "billing", element: <LazyRoute Component={Billing} /> },
          { path: "payer-integration", element: <LazyRoute Component={PayerIntegrationHub} /> },
          { path: "payer-integration/x12-testing", element: <LazyRoute Component={X12TestingWorkspace} /> },
          { path: "new-admission", element: <LazyRoute Component={NewAdmission} /> },
          { path: "discharge-workflow", element: <LazyRoute Component={DischargeWorkflow} /> },
          { path: "discharge/:admissionId", element: <LazyRoute Component={DischargeWorkflow} /> },
          { path: "risk-dashboard", element: <LazyRoute Component={RiskDashboard} /> },
          { path: "cosign-queue", element: <LazyRoute Component={CosignQueue} /> },
          { path: "cosign-analytics", element: <LazyRoute Component={CosignAnalytics} /> },
          { path: "referral-pipeline", element: <LazyRoute Component={ReferralPipeline} /> },
          { path: "referral-analytics", element: <LazyRoute Component={ReferralAnalytics} /> },
          { path: "admission-queues", element: <LazyRoute Component={AdmissionQueuesWorkspace} /> },
          { path: "admission-timeline", element: <LazyRoute Component={AdmissionTimelinePage} /> },
          { path: "documentation-tracker", element: <LazyRoute Component={DocumentationTrackerPage} /> },
          { path: "episode-progress", element: <LazyRoute Component={EpisodeProgressPage} /> },
          { path: "context-hierarchy-demo", element: <LazyRoute Component={ContextHierarchyDemoPage} /> },
          { path: "context-display-demo", element: <LazyRoute Component={ContextDisplayDemoPage} /> },
          { path: "navigation-demo", element: <LazyRoute Component={NavigationDemoPage} /> },
          { path: "workspace-demo", element: <LazyRoute Component={WorkspaceDemoPage} /> },
          { path: "patient-chart-demo", element: <LazyRoute Component={PatientChartDemoPage} /> },
          { path: "episode-of-care-demo", element: <LazyRoute Component={EpisodeOfCareDemoPage} /> },
          { path: "operational-queues-demo", element: <LazyRoute Component={OperationalQueuesDemoPage} /> },
          { path: "cross-module-interaction-demo", element: <LazyRoute Component={CrossModuleInteractionDemoPage} /> },
          { path: "activity-feed-demo", element: <LazyRoute Component={ActivityFeedDemoPage} /> },
          { path: "notification-system-demo", element: <LazyRoute Component={NotificationSystemDemoPage} /> },
          { path: "admission-readiness-demo", element: <LazyRoute Component={AdmissionReadinessDemoPage} /> },
          { path: "admission-pipeline-demo", element: <LazyRoute Component={AdmissionPipelineDemoPage} /> },
          { path: "admission-pipeline", element: <LazyRoute Component={AdmissionPipelineWorkspace} /> },
          { path: "admission-setup-wizard-demo", element: <LazyRoute Component={AdmissionSetupWizardDemoPage} /> },
          { path: "careops-command-center-demo", element: <LazyRoute Component={CareOpsCommandCenterDemoPage} /> },
          { path: "careops-command-center", element: <LazyRoute Component={CareOpsCommandCenterWorkspace} /> },
          { path: "operational-heatmap-demo", element: <LazyRoute Component={OperationalHeatmapDemoPage} /> },
          { path: "operational-heatmap", element: <LazyRoute Component={OperationalHeatmapWorkspace} /> },
          { path: "authorization-tracker", element: <LazyRoute Component={AuthorizationTrackerPage} /> },
          { path: "visit-preparation-panel-demo", element: <LazyRoute Component={VisitPreparationPanelDemoPage} /> },
          { path: "visit-execution-screen-demo", element: <LazyRoute Component={VisitExecutionScreenDemoPage} /> },
          { path: "smart-documentation-editor-demo", element: <LazyRoute Component={SmartDocumentationEditorDemoPage} /> },
          { path: "caregiver-dashboard-demo", element: <LazyRoute Component={CaregiverDashboardDemoPage} /> },
          { path: "caregiver-dashboard", element: <LazyRoute Component={CaregiverDashboardWorkspace} /> },
          { path: "offline-mode-demo", element: <LazyRoute Component={OfflineModeDemoPage} /> },
          { path: "smart-documentation-editor-offline", element: <LazyRoute Component={SmartDocumentationEditorOfflinePage} /> },
          { path: "offline-sync-demo", element: <LazyRoute Component={OfflineSyncDemo} /> },
          { path: "visit-timeline-demo", element: <LazyRoute Component={VisitTimelineDemoPage} /> },
          { path: "predictive-scheduling-demo", element: <LazyRoute Component={PredictiveSchedulingDemo} /> },
          { path: "visit-timeline", element: <LazyRoute Component={VisitTimelinePage} /> },
          { path: "timeline-test", element: <LazyRoute Component={TimelineTest} /> },
          { path: "clinical-documentation-architecture-demo", element: <LazyRoute Component={ClinicalDocumentationArchitectureDemo} /> },
          { path: "physical-therapy-module", element: <LazyRoute Component={PhysicalTherapyModule} /> },
          { path: "physical-therapy-module-demo", element: <LazyRoute Component={PhysicalTherapyModuleDemo} /> },
          { path: "speech-therapy-module", element: <LazyRoute Component={SpeechTherapyModule} /> },
          { path: "speech-therapy-module-demo", element: <LazyRoute Component={SpeechTherapyModuleDemo} /> },
          { path: "oasis-workspace", element: <LazyRoute Component={OasisWorkspace} /> },
          { path: "oasis-editor", element: <LazyRoute Component={OasisEditor} /> },
          { path: "oasis-dashboard", element: <LazyRoute Component={OasisDashboard} /> },
          { path: "sn-assessment-demo", element: <LazyRoute Component={SNAssessmentDemoPage} /> },
          { path: "document-status-system-demo", element: <LazyRoute Component={DocumentStatusSystemDemo} /> },
          { path: "clinical-documentation-list-view", element: <LazyRoute Component={ClinicalDocumentationListView} /> },
          { path: "validation-panel-demo", element: <LazyRoute Component={ValidationPanelDemo} /> },
          { path: "dynamic-validation-panel-demo", element: <LazyRoute Component={DynamicValidationPanelDemo} /> },
          { path: "clinical-documentation-workspace", element: <LazyRoute Component={ClinicalDocumentationWorkspace} /> },
          { path: "skilled-nursing-module", element: <LazyRoute Component={SkilledNursingModule} /> },
          { path: "occupational-therapy-module", element: <LazyRoute Component={OccupationalTherapyModule} /> },
          { path: "medical-social-work-module", element: <LazyRoute Component={MedicalSocialWorkModule} /> },
          { path: "home-health-aide-module", element: <LazyRoute Component={HomeHealthAideModule} /> },
          { path: "wound-care-module", element: <LazyRoute Component={WoundCareModule} /> },
          { path: "physician-orders-module", element: <LazyRoute Component={PhysicianOrdersModule} /> },
          { path: "plan-of-care-module", element: <LazyRoute Component={PlanOfCareModule} /> },
          { path: "recertification-module", element: <LazyRoute Component={RecertificationModule} /> },
          { path: "discharge-summary-module", element: <LazyRoute Component={DischargeSummaryModule} /> },
          { path: "clinical-documentation-engine", element: <LazyRoute Component={ClinicalDocumentationEnginePage} /> },
          { path: "clinical-compliance-monitor", element: <LazyRoute Component={ClinicalComplianceMonitor} /> },
          { path: "clinical-assessment-engine", element: <LazyRoute Component={ClinicalAssessmentEnginePage} /> },
          { path: "assessment-engine", element: <LazyRoute Component={AssessmentEnginePage} /> },
          { path: "assessment-workspace", element: <LazyRoute Component={AssessmentWorkspace} /> },
          { path: "assessment-workspace-old", element: <LazyRoute Component={AssessmentWorkspacePage} /> },
          { path: "demo-assessment-editor/:id", element: <LazyRoute Component={DemoAssessmentEditor} /> },
          { path: "demo-assessment-editor", element: <LazyRoute Component={DemoAssessmentEditor} /> },
          { path: "clinical-assessment-viewer", element: <LazyRoute Component={ClinicalAssessmentViewer} /> },
          { path: "skilled-nursing-assessment-editor", element: <LazyRoute Component={SkilledNursingAssessmentEditor} /> },
          { path: "skilled-nursing-assessment/:id", element: <LazyRoute Component={SkilledNursingAssessmentEditor} /> },
          { path: "universal-assessment-editor", element: <LazyRoute Component={UniversalAssessmentEditor} /> },
          { path: "assessment/:assessmentType/:id", element: <LazyRoute Component={UniversalAssessmentEditor} /> },
          { path: "conditional-logic-assessment-demo", element: <LazyRoute Component={ConditionalLogicAssessmentDemo} /> },
          { path: "assessment-progress-tracker", element: <LazyRoute Component={AssessmentProgressTracker} /> },
          { path: "assessment-history", element: <LazyRoute Component={AssessmentHistoryPage} /> },
          { path: "assessment-comparison", element: <LazyRoute Component={AssessmentComparisonView} /> },
          { path: "assessment-submission-workflow", element: <LazyRoute Component={AssessmentSubmissionWorkflow} /> },
          { path: "assessment-management-dashboard", element: <LazyRoute Component={AssessmentManagementDashboard} /> },
          { path: "assessment-template-library", element: <LazyRoute Component={AssessmentTemplateLibrary} /> },
          { path: "assessment-analytics-dashboard", element: <LazyRoute Component={AssessmentAnalyticsDashboard} /> },
          { path: "patient-medication-profile", element: <LazyRoute Component={PatientMedicationProfile} /> },
          { path: "patient-medication-profile-view", element: <LazyRoute Component={PatientMedicationProfileView} /> },
          { path: "medication-reconciliation-workflow", element: <LazyRoute Component={MedicationReconciliationWorkflow} /> },
          { path: "medication-change-tracking", element: <LazyRoute Component={MedicationChangeTracking} /> },
          { path: "visit-documentation-medication-demo", element: <LazyRoute Component={VisitDocumentationMedicationDemo} /> },
          { path: "medication-alerts-demo", element: <LazyRoute Component={MedicationAlertsDemo} /> },
          { path: "medication-search-add-demo", element: <LazyRoute Component={MedicationSearchAddDemo} /> },
          { path: "medication-timeline-demo", element: <LazyRoute Component={MedicationTimelineDemo} /> },
          { path: "medication-history-drawer-demo", element: <LazyRoute Component={MedicationHistoryDrawerDemo} /> },
          { path: "admission-medication-review-dashboard", element: <LazyRoute Component={AdmissionMedicationReviewDashboardPage} /> },
          { path: "care-plan-management", element: <LazyRoute Component={CarePlanManagementPage} /> },
          { path: "care-plan-editor", element: <LazyRoute Component={CarePlanEditorPage} /> },
          { path: "visit-frequency", element: <LazyRoute Component={VisitFrequencyPage} /> },
          { path: "frequency-compliance-tracker", element: <LazyRoute Component={FrequencyComplianceTrackerPage} /> },
          { path: "wound-care-tracking", element: <LazyRoute Component={WoundCareTrackingPage} /> },
          { path: "clinical-alerts-dashboard", element: <LazyRoute Component={ClinicalAlertsDashboardPage} /> },
          { path: "enhanced-visit-preparation", element: <LazyRoute Component={EnhancedVisitPreparationPage} /> },
          { path: "clinical-control-center", element: <LazyRoute Component={ClinicalControlCenterPage} /> },
          { path: "orders-certification", element: <LazyRoute Component={OrdersCertificationPage} /> },
          { path: "orders-workspace", element: <LazyRoute Component={OrdersWorkspacePage} /> },
          { path: "physician-orders-list", element: <LazyRoute Component={PhysicianOrdersListPage} /> },
          { path: "verbal-order-workflow", element: <LazyRoute Component={VerbalOrderWorkflowPage} /> },
          { path: "plan-of-care-485", element: <LazyRoute Component={PlanOfCare485Page} /> },
          { path: "signature-workflow-center", element: <LazyRoute Component={SignatureWorkflowCenterPage} /> },
          { path: "returned-document-workflow", element: <LazyRoute Component={ReturnedDocumentWorkflowPage} /> },
          { path: "document-activity-timeline", element: <LazyRoute Component={DocumentActivityTimelinePage} /> },
          { path: "operational-orders-queue", element: <LazyRoute Component={OperationalOrdersQueuePage} /> },
          { path: "recertification-workspace", element: <LazyRoute Component={RecertificationWorkspacePage} /> },
          { path: "recertification-readiness-tracker", element: <LazyRoute Component={RecertificationReadinessTrackerPage} /> },
          { path: "discharge-documentation-workflow", element: <LazyRoute Component={DischargeDocumentationWorkflowPage} /> },
          { path: "episode-closure-checklist", element: <LazyRoute Component={EpisodeClosureChecklistPage} /> },
          { path: "contextual-order-creation", element: <LazyRoute Component={ContextualOrderCreationPage} /> },
          { path: "certification-orders-summary-cards", element: <LazyRoute Component={CertificationOrdersSummaryCardsPage} /> },
          { path: "orders-certification-alerts", element: <LazyRoute Component={OrdersCertificationAlertsPage} /> },
          { path: "certification-orders-summary-panel", element: <LazyRoute Component={CertificationOrdersSummaryPanelPage} /> },
          { path: "qa-center", element: <LazyRoute Component={QACenterPage} /> },
          { path: "qa-workspace", element: <LazyRoute Component={QAWorkspacePage} /> },
          { path: "document-review-interface", element: <LazyRoute Component={DocumentReviewInterfacePage} /> },
          { path: "return-for-correction-workflow", element: <LazyRoute Component={ReturnForCorrectionWorkflowPage} /> },
          { path: "qa-review-system", element: <LazyRoute Component={QAReviewSystemPage} /> },
          { path: "compliance-checklist", element: <LazyRoute Component={ComplianceChecklistPage} /> },
          { path: "qa-system", element: <LazyRoute Component={QASystemPage} /> },
          { path: "qa-advanced-system", element: <LazyRoute Component={QAAdvancedSystemPage} /> },
          { path: "qa-metrics-system", element: <LazyRoute Component={QAMetricsSystemPage} /> },
          { path: "caregiver-profile", element: <LazyRoute Component={CaregiverProfilePage} /> },
          { path: "credential-management", element: <LazyRoute Component={CredentialManagementPage} /> },
          { path: "caregiver-management", element: <LazyRoute Component={CaregiverManagementPage} /> },
          { path: "caregiver-compliance-integration", element: <LazyRoute Component={CaregiverComplianceIntegrationPage} /> },
          { path: "integration-architecture", element: <LazyRoute Component={IntegrationArchitecturePage} /> },
          { path: "integration-management", element: <LazyRoute Component={IntegrationManagementWorkspace} /> },
          { path: "platform-configuration-center", element: <LazyRoute Component={PlatformConfigurationCenter} /> },
          { path: "platform-configuration-center-expanded", element: <LazyRoute Component={PlatformConfigurationCenterExpanded} /> },
          { path: "navigation-architecture-demo", element: <LazyRoute Component={NavigationArchitectureDemo} /> },
          { path: "navigation-system-complete", element: <LazyRoute Component={NavigationSystemComplete} /> },
          { path: "shell-demo", element: <LazyRoute Component={ShellDemo} /> },
          { path: "design-system-demo", element: <LazyRoute Component={DesignSystemDemo} /> },
          { path: "module-disabled", Component: ModuleDisabled },
          { path: "*", Component: NotFound },
        ],
      },
    ],
  },
]);

// RouterProvider renders the entire app with contexts provided via AuthLayout
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}