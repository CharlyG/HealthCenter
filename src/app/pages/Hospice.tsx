/**
 * Hospice Module - Main Page
 * Hospice Care Management
 *
 * Tabs:
 * 1. HOPE Timeline - Assessment tracking (Admission, HUV1, HUV2, Discharge)
 * 2. Medical Director Queue - Documents awaiting MD signature
 * 3. IDG Center - Interdisciplinary group meeting management
 * 4. Bereavement Tracker - Follow-up tracking and tasks
 * 5. Volunteer Management - Volunteer visits and hours
 *
 * All tabs are lazy-loaded. Dashboard metrics are fetched from backend.
 */
import React, { Suspense, lazy, useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Heart, GitBranch, UserCheck, Users2, Flower2, HandHeart } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { PageLayout, PageHeader } from '../components/design-system/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LoadingState } from '../components/design-system/LoadingState';
import { MetricCard } from '../components/design-system/MetricCard';
import { fetchHospiceMetrics } from '../lib/hospiceApi';

// Lazy-load sub-modules for performance
const HOPETimeline = lazy(() =>
  import('../components/hospice/HOPETimeline').then((m) => ({ default: m.HOPETimeline }))
);
const MedicalDirectorQueue = lazy(() =>
  import('../components/hospice/MedicalDirectorQueue').then((m) => ({ default: m.MedicalDirectorQueue }))
);
const IDGCenter = lazy(() =>
  import('../components/hospice/IDGCenter').then((m) => ({ default: m.IDGCenter }))
);
const BereavementTracker = lazy(() =>
  import('../components/hospice/BereavementTracker').then((m) => ({ default: m.BereavementTracker }))
);
const VolunteerManagement = lazy(() =>
  import('../components/hospice/VolunteerManagement').then((m) => ({ default: m.VolunteerManagement }))
);

const tabs = [
  { value: 'hope', label: 'HOPE Timeline', icon: <GitBranch className="size-4" /> },
  { value: 'md-queue', label: 'MD Queue', icon: <UserCheck className="size-4" /> },
  { value: 'idg', label: 'IDG Center', icon: <Users2 className="size-4" /> },
  { value: 'bereavement', label: 'Bereavement', icon: <Flower2 className="size-4" /> },
  { value: 'volunteers', label: 'Volunteers', icon: <HandHeart className="size-4" /> },
];

interface HospiceMetrics {
  activePatients: number;
  hopeDue: number;
  mdSignatures: number;
  urgentMd: number;
  upcomingMeetings: number;
  nextMeetingDate: string | null;
  activeBereaved: number;
  overdueTasks: number;
}

const defaultMetrics: HospiceMetrics = {
  activePatients: 0, hopeDue: 0, mdSignatures: 0, urgentMd: 0,
  upcomingMeetings: 0, nextMeetingDate: null, activeBereaved: 0, overdueTasks: 0,
};

export default function Hospice() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'hope';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [metrics, setMetrics] = useState<HospiceMetrics>(defaultMetrics);

  useEffect(() => {
    if (!isModuleEnabled('hospice')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  // Load dashboard metrics from backend
  useEffect(() => {
    fetchHospiceMetrics()
      .then(setMetrics)
      .catch((err) => console.error('[Hospice] Error loading metrics:', err));
  }, []);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      setSearchParams({ tab: value }, { replace: true });
    },
    [setSearchParams]
  );

  const nextMeetingLabel = metrics.nextMeetingDate
    ? `Next: ${new Date(metrics.nextMeetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : 'None scheduled';

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        icon={<Heart className="size-8 text-rose-600" />}
        title="Hospice Care"
        subtitle="HOPE assessments, medical director queue, IDG meetings, bereavement & volunteers"
      />

      {/* Summary Metrics — driven by backend data */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <MetricCard
          title="Active Patients"
          value={metrics.activePatients}
          subtitle="Hospice census"
          icon={<Heart className="size-5" />}
          variant="default"
        />
        <MetricCard
          title="HOPE Due"
          value={metrics.hopeDue}
          subtitle="Assessments needed"
          icon={<GitBranch className="size-5" />}
          variant={metrics.hopeDue > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title="MD Signatures"
          value={metrics.mdSignatures}
          subtitle={`${metrics.urgentMd} urgent`}
          icon={<UserCheck className="size-5" />}
          variant={metrics.urgentMd > 0 ? 'danger' : 'default'}
        />
        <MetricCard
          title="IDG Meetings"
          value={metrics.upcomingMeetings}
          subtitle={nextMeetingLabel}
          icon={<Users2 className="size-5" />}
          variant="default"
        />
        <MetricCard
          title="Bereavement Active"
          value={metrics.activeBereaved}
          subtitle={`${metrics.overdueTasks} tasks overdue`}
          icon={<Flower2 className="size-5" />}
          variant={metrics.overdueTasks > 0 ? 'warning' : 'default'}
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 bg-white border border-gray-200 p-1 h-auto flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 px-4 py-2 text-sm data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 data-[state=active]:border-rose-200"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Suspense fallback={<LoadingState message="Loading hospice module..." />}>
          <TabsContent value="hope" className="mt-0">
            <HOPETimeline />
          </TabsContent>

          <TabsContent value="md-queue" className="mt-0">
            <MedicalDirectorQueue />
          </TabsContent>

          <TabsContent value="idg" className="mt-0">
            <IDGCenter />
          </TabsContent>

          <TabsContent value="bereavement" className="mt-0">
            <BereavementTracker />
          </TabsContent>

          <TabsContent value="volunteers" className="mt-0">
            <VolunteerManagement />
          </TabsContent>
        </Suspense>
      </Tabs>
    </PageLayout>
  );
}
