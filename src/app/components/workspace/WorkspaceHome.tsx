/**
 * WorkspaceHome — Operational Command Center
 * 5-zone layout backed by server-aggregated data:
 *   Zone 1: Critical Issues (immediate attention queue cards)
 *   Zone 2: Today's Work (visits, admissions, open shifts)
 *   Zone 3: Resume Work (recently opened patients/admissions/docs)
 *   Zone 4: Quick Actions (large action buttons)
 *   Zone 5: Operational Insights (summary metric cards)
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Calendar,
  UserPlus,
  ClipboardPlus,
  CalendarPlus,
  Upload,
  Stethoscope,
  MapPin,
  Users,
  FileText,
  Activity,
  Loader2,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  GitPullRequest,
  Briefcase,
  Eye,
  FilePenLine,
  DollarSign,
  Shield,
  Heart,
  ClipboardList,
} from 'lucide-react';
import { workspaceGateway, type WorkspaceHomeData } from '../../lib/dataGateway';
import { useAuth } from '../../context/AuthContext';

// ─── Severity helpers ───────────────────────────────────────────────────────

function getSeverityStyles(severity: 'critical' | 'high' | 'medium') {
  const styles = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-600', icon: <XCircle className="size-5 text-red-600 shrink-0" /> },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-600', icon: <AlertCircle className="size-5 text-orange-600 shrink-0" /> },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-600', icon: <AlertTriangle className="size-5 text-amber-600 shrink-0" /> },
  };
  return styles[severity];
}

function getVisitStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    scheduled: { label: 'Scheduled', cls: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-600' },
    missed: { label: 'Missed', cls: 'bg-red-100 text-red-700' },
  };
  return map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
}

function formatRelative(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

// ─── Zone Section Container ─────────────────────────────────────────────────

const ZoneSection = React.memo(function ZoneSection({
  title,
  subtitle,
  icon,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('mb-8', className)}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="text-gray-500">{icon}</div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
});

// ─── Zone 1: Critical Issues ────────────────────────────────────────────────

const CriticalIssueCard = React.memo(function CriticalIssueCard({
  issue,
  onClick,
}: {
  issue: WorkspaceHomeData['criticalIssues'][number];
  onClick: () => void;
}) {
  const sev = getSeverityStyles(issue.severity);
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border-2 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        sev.bg, sev.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {sev.icon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm">{issue.title}</h4>
              <Badge className={cn('text-[10px] h-5 px-1.5 text-white rounded-full', sev.badge)}>
                {issue.count}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">{issue.description}</p>
            <Badge variant="outline" className="text-[10px] mt-2 h-5 px-1.5 rounded-full">
              {issue.category}
            </Badge>
          </div>
        </div>
        <ChevronRight className="size-4 text-gray-400 shrink-0 mt-1" />
      </div>
    </button>
  );
});

// ─── Zone 2: Today's Work Items ─────────────────────────────────────────────

const VisitWorkItem = React.memo(function VisitWorkItem({
  visit,
  onClick,
}: {
  visit: WorkspaceHomeData['todaysWork']['visits'][number];
  onClick: () => void;
}) {
  const badge = getVisitStatusBadge(visit.status);
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-gray-200 bg-white p-3 hover:shadow-sm hover:border-blue-200 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-sm font-semibold text-gray-900 truncate">{visit.patientName}</span>
        <Badge className={cn('text-[10px] h-5 px-1.5 rounded-full font-semibold', badge.cls)}>
          {badge.label}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {visit.time}
        </span>
        {visit.discipline && (
          <Badge variant="outline" className="text-[9px] h-4 px-1 rounded">{visit.discipline.toUpperCase()}</Badge>
        )}
        <span className="truncate flex-1 text-right">{visit.caregiverName}</span>
      </div>
    </button>
  );
});

// ─── Zone 3: Resume Work Item ───────────────────────────────────────────────

const ResumeItem = React.memo(function ResumeItem({
  item,
  onClick,
}: {
  item: { id: string; title: string; subtitle: string; lastAccessed: string; type: string };
  onClick: () => void;
}) {
  const icons: Record<string, React.ReactNode> = {
    patient: <Users className="size-4 text-blue-500" />,
    admission: <ClipboardPlus className="size-4 text-teal-500" />,
    documentation: <FilePenLine className="size-4 text-violet-500" />,
    billing: <DollarSign className="size-4 text-emerald-500" />,
  };
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-gray-200 bg-white p-3 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">{icons[item.type] || <FileText className="size-4 text-gray-400" />}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
          <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{formatRelative(item.lastAccessed)}</p>
        </div>
      </div>
    </button>
  );
});

// ─── Zone 5: Metric Card ────────────────────────────────────────────────────

const MetricCard = React.memo(function MetricCard({
  label,
  value,
  icon,
  color,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={cn(
        'border-2 transition-all',
        color,
        onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <div className="shrink-0 opacity-70">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────

export default function WorkspaceHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [data, setData] = useState<WorkspaceHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      const res = await workspaceGateway.getHomeData();
      setData(res);
    } catch (err: any) {
      console.error('[WorkspaceHome] Load error:', err);
      toast.error('Failed to load workspace');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const userName = profile?.user_metadata?.name || profile?.email || 'User';
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // ─── Quick Actions ────────────────────────────────────────────────
  const quickActions = useMemo(() => [
    { id: 'qa-patient', label: 'Create Patient', icon: <UserPlus className="size-6" />, route: '/patient-new' },
    { id: 'qa-admission', label: 'Create Admission', icon: <ClipboardPlus className="size-6" />, route: '/new-admission' },
    { id: 'qa-visit', label: 'Schedule Visit', icon: <CalendarPlus className="size-6" />, route: '/scheduling' },
    { id: 'qa-open-shift', label: 'Post Open Shift', icon: <MapPin className="size-6" />, route: '/scheduling?tab=open-shifts' },
    { id: 'qa-upload-doc', label: 'Upload Document', icon: <Upload className="size-6" />, route: '/patient-documents' },
    { id: 'qa-hope', label: 'Start HOPE Assessment', icon: <Heart className="size-6" />, route: '/hospice' },
    { id: 'qa-referral', label: 'New Referral', icon: <GitPullRequest className="size-6" />, route: '/referral-pipeline' },
    { id: 'qa-cosign', label: 'Co-Sign Queue', icon: <ShieldCheck className="size-6" />, route: '/cosign-queue' },
    { id: 'qa-risk', label: 'Risk Dashboard', icon: <Activity className="size-6" />, route: '/risk-dashboard' },
  ], []);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-10 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="size-full">
      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* ═══ Header ═══════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting}, {userName.split(' ')[0]}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => load(false)}
            disabled={refreshing}
          >
            <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* ═══ Zone 1: Critical Issues ═══════════════════════════════════ */}
        <ZoneSection
          title="Critical Issues"
          subtitle="Items requiring immediate attention"
          icon={<AlertTriangle className="size-5 text-red-500" />}
        >
          {data?.criticalIssues && data.criticalIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {data.criticalIssues.map((issue) => (
                <CriticalIssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => navigate(issue.route)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="size-10 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-semibold text-green-900">All Clear</p>
                <p className="text-xs text-green-700 mt-0.5">No critical issues require attention</p>
              </CardContent>
            </Card>
          )}
        </ZoneSection>

        {/* ═══ Zone 2: Today's Work ═════════════════════════════════════ */}
        <ZoneSection
          title="Today's Work"
          subtitle="Visits, admissions, and open shifts scheduled for today"
          icon={<Calendar className="size-5 text-blue-500" />}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Visits */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="size-4 text-blue-500" />
                  Today's Visits
                  {data?.todaysWork.visits && (
                    <Badge variant="secondary" className="text-xs ml-auto">{data.todaysWork.visits.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {data?.todaysWork.visits && data.todaysWork.visits.length > 0 ? (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {data.todaysWork.visits.map((v) => (
                      <VisitWorkItem
                        key={v.id}
                        visit={v}
                        onClick={() => navigate(`/poc/visit/${v.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">No visits scheduled today</p>
                )}
              </CardContent>
            </Card>

            {/* Admissions + Open Shifts sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardPlus className="size-4 text-teal-500" />
                    Today's Admissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {data?.todaysWork.admissions && data.todaysWork.admissions.length > 0 ? (
                    <div className="space-y-2">
                      {data.todaysWork.admissions.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => navigate(`/admissions/${a.id}`)}
                          className="w-full text-left rounded-lg border border-gray-200 bg-gray-50 p-3 hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                        >
                          <p className="text-sm font-semibold text-gray-900 truncate">{a.patientName}</p>
                          <p className="text-xs text-gray-500">{a.type} · {a.physician}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No admissions today</p>
                  )}
                </CardContent>
              </Card>

              <Card className={cn(
                'border-2',
                (data?.todaysWork.openShifts ?? 0) > 0
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-gray-200',
              )}>
                <CardContent className="p-4 text-center">
                  <MapPin className={cn('size-8 mx-auto mb-2', (data?.todaysWork.openShifts ?? 0) > 0 ? 'text-amber-500' : 'text-gray-400')} />
                  <p className="text-2xl font-bold text-gray-900">{data?.todaysWork.openShifts ?? 0}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Open Shifts</p>
                  {(data?.todaysWork.openShifts ?? 0) > 0 && (
                    <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => navigate('/scheduling')}>
                      View Shifts
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </ZoneSection>

        {/* ═══ Zone 3: Resume Work ══════════════════════════════════════ */}
        {data?.recentItems && (
          <ZoneSection
            title="Resume Work"
            subtitle="Recently accessed patients, admissions, and documentation"
            icon={<Eye className="size-5 text-violet-500" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Recent Patients */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Patients</h3>
                <div className="space-y-2">
                  {data.recentItems.patients.length > 0 ? (
                    data.recentItems.patients.map((p) => (
                      <ResumeItem
                        key={p.id}
                        item={p}
                        onClick={() => navigate(`/patient/${p.id}/chart`)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No recent patients</p>
                  )}
                </div>
              </div>

              {/* Recent Admissions */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Admissions</h3>
                <div className="space-y-2">
                  {data.recentItems.admissions.length > 0 ? (
                    data.recentItems.admissions.map((a) => (
                      <ResumeItem
                        key={a.id}
                        item={a}
                        onClick={() => navigate(`/admissions/${a.id}`)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No recent admissions</p>
                  )}
                </div>
              </div>

              {/* Recent Documentation */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documentation</h3>
                <div className="space-y-2">
                  {data.recentItems.documentation.length > 0 ? (
                    data.recentItems.documentation.map((d) => (
                      <ResumeItem
                        key={d.id}
                        item={d}
                        onClick={() => navigate(`/patient/${d.id}/chart`)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No recent documents</p>
                  )}
                </div>
              </div>

              {/* Recent Billing Actions */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Billing</h3>
                <div className="space-y-2">
                  {data.recentItems.billing && data.recentItems.billing.length > 0 ? (
                    data.recentItems.billing.map((b) => (
                      <ResumeItem
                        key={b.id}
                        item={b}
                        onClick={() => navigate(`/billing`)}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No recent billing actions</p>
                  )}
                </div>
              </div>
            </div>
          </ZoneSection>
        )}

        {/* ═══ Zone 4: Quick Actions ════════════════════════════════════ */}
        <ZoneSection
          title="Quick Actions"
          subtitle="Common workflows accessible with one click"
          icon={<Briefcase className="size-5 text-emerald-500" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto py-5 flex flex-col items-center gap-2.5 hover:bg-blue-50 hover:border-blue-200 transition-all"
                onClick={() => navigate(action.route)}
              >
                <div className="text-blue-600">{action.icon}</div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{action.label}</span>
              </Button>
            ))}
          </div>
        </ZoneSection>

        {/* ═══ Zone 5: Operational Insights ═════════════════════════════ */}
        {data?.insights && (
          <ZoneSection
            title="Operational Insights"
            subtitle="Today's key metrics at a glance"
            icon={<BarChart3 className="size-5 text-indigo-500" />}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard
                label="Visits Today"
                value={data.insights.visitsToday}
                icon={<Stethoscope className="size-4 text-blue-500" />}
                color="bg-blue-50 border-blue-200"
                onClick={() => navigate('/scheduling')}
              />
              <MetricCard
                label="Completed"
                value={data.insights.visitsCompleted}
                icon={<CheckCircle2 className="size-4 text-green-500" />}
                color="bg-green-50 border-green-200"
              />
              <MetricCard
                label="Open Issues"
                value={data.insights.openIssues}
                icon={<AlertTriangle className="size-4 text-red-500" />}
                color={data.insights.openIssues > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}
                onClick={() => navigate('/monitor')}
              />
              <MetricCard
                label="Active Admissions"
                value={data.insights.activeAdmissions}
                icon={<Users className="size-4 text-teal-500" />}
                color="bg-teal-50 border-teal-200"
                onClick={() => navigate('/admissions')}
              />
              <MetricCard
                label="Pending QA"
                value={data.insights.pendingQa}
                icon={<ShieldCheck className="size-4 text-purple-500" />}
                color="bg-purple-50 border-purple-200"
                onClick={() => navigate('/clinical/qa-review')}
              />
              <MetricCard
                label="Co-Signatures"
                value={data.insights.pendingCosigns}
                icon={<FilePenLine className="size-4 text-amber-500" />}
                color={data.insights.pendingCosigns > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}
                onClick={() => navigate('/cosign-queue')}
              />
              <MetricCard
                label="Pipeline Active"
                value={data.insights.pipelineActive}
                icon={<GitPullRequest className="size-4 text-indigo-500" />}
                color="bg-indigo-50 border-indigo-200"
                onClick={() => navigate('/referral-pipeline')}
              />
              <MetricCard
                label="Open Shifts"
                value={data.insights.openShifts}
                icon={<MapPin className="size-4 text-orange-500" />}
                color={data.insights.openShifts > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}
                onClick={() => navigate('/scheduling')}
              />
              <MetricCard
                label="Claims Ready"
                value={data.insights.claimsReady ?? 0}
                icon={<DollarSign className="size-4 text-emerald-500" />}
                color={data.insights.claimsReady > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}
                onClick={() => navigate('/billing')}
              />
              <MetricCard
                label="Auth Expiring"
                value={data.insights.authorizationsExpiring ?? 0}
                icon={<Shield className="size-4 text-rose-500" />}
                color={data.insights.authorizationsExpiring > 0 ? 'bg-rose-50 border-rose-200' : 'bg-gray-50 border-gray-200'}
                onClick={() => navigate('/admissions')}
              />
              <MetricCard
                label="Hospice Sigs Pending"
                value={data.insights.hospiceSignaturesPending ?? 0}
                icon={<Heart className="size-4 text-pink-500" />}
                color={data.insights.hospiceSignaturesPending > 0 ? 'bg-pink-50 border-pink-200' : 'bg-gray-50 border-gray-200'}
                onClick={() => navigate('/hospice')}
              />
            </div>
          </ZoneSection>
        )}

      </div>
    </ScrollArea>
  );
}
