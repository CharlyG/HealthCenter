/**
 * Billing Workspace — Revenue Cycle Management
 * Single-screen operational dashboard for billing staff.
 *
 * Layout:
 *   KPI strip → Queue summary cards → Tabbed content
 *   (Claims Table, Pre-Billing QA, Remittance, Payment Posting)
 *
 * Connected to server via billingApi.ts with live/mock fallback.
 */
import React, { Suspense, lazy, useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { cn } from '../components/ui/utils';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import {
  DollarSign, LayoutList, ClipboardCheck, FileText, Upload,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  XCircle, Clock, Send, FileUp, ArrowRight, RefreshCw,
  Banknote, BarChart3, Shield, Wallet, Receipt,
  CreditCard, Loader2, Wifi, WifiOff, ChevronRight,
  Brain, Scale, Handshake,
} from 'lucide-react';
import { LoadingState } from '../components/design-system/LoadingState';
import { fetchBillingMetrics, fetchBillingQueues, fetchClaims } from '../lib/billingApi';

// Lazy-load sub-modules for performance
const BillingQueues = lazy(() =>
  import('../components/billing/BillingQueues').then((m) => ({ default: m.BillingQueues }))
);
const PreBillingQA = lazy(() =>
  import('../components/billing/PreBillingQA').then((m) => ({ default: m.PreBillingQA }))
);
const ClaimsList = lazy(() =>
  import('../components/billing/ClaimsList').then((m) => ({ default: m.ClaimsList }))
);
const RemittanceProcessing = lazy(() =>
  import('../components/billing/RemittanceProcessing').then((m) => ({ default: m.RemittanceProcessing }))
);
const ARAgingReport = lazy(() =>
  import('../components/billing/ARAgingReport').then((m) => ({ default: m.ARAgingReport }))
);
const DenialManagement = lazy(() =>
  import('../components/billing/DenialManagement').then((m) => ({ default: m.DenialManagement }))
);
const EligibilityVerification = lazy(() =>
  import('../components/billing/EligibilityVerification').then((m) => ({ default: m.EligibilityVerification }))
);
const DenialPrevention = lazy(() =>
  import('../components/billing/DenialPrevention').then((m) => ({ default: m.DenialPrevention }))
);
const PaymentVariance = lazy(() =>
  import('../components/billing/PaymentVariance').then((m) => ({ default: m.PaymentVariance }))
);
const PayerContracts = lazy(() =>
  import('../components/billing/PayerContracts').then((m) => ({ default: m.PayerContracts }))
);

// ─── Types ──────────────────────────────────────────────────────────────────

type TabId = 'queues' | 'claims' | 'qa' | 'remittance' | 'aging' | 'denials' | 'eligibility' | 'prevention' | 'variance' | 'contracts';

interface QueueSummary {
  id: string;
  label: string;
  shortLabel: string;
  count: number;
  amount: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  tab: TabId;
  description: string;
}

interface RevenueKPI {
  label: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  icon: React.ReactNode;
  color: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const formatCompact = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : formatCurrency(n);

// ─── KPI Card ───────────────────────────────────────────────────────────────

const KpiCard = React.memo(function KpiCard({ kpi }: { kpi: RevenueKPI }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start gap-3 min-w-0 hover:shadow-sm transition-shadow">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', kpi.color)}>
        {kpi.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
          {kpi.label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 tabular-nums">{kpi.value}</span>
          {kpi.trend && kpi.trendValue && (
            <span className={cn(
              'flex items-center gap-0.5 text-[10px] font-semibold',
              kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500',
            )}>
              {kpi.trend === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {kpi.trendValue}
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 truncate">{kpi.subtitle}</p>
      </div>
    </div>
  );
});

// ─── Queue Card ─────────────────────────────────────────────────────────────

const QueueCard = React.memo(function QueueCard({
  queue, isActive, onClick,
}: { queue: QueueSummary; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-start rounded-xl border-2 px-4 py-3 text-left transition-all',
        'hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        isActive
          ? cn(queue.bgColor, queue.borderColor, 'shadow-sm ring-1', queue.borderColor)
          : 'bg-white border-gray-200 hover:border-gray-300',
      )}
    >
      {/* Icon + count */}
      <div className="flex items-center justify-between w-full mb-2">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          isActive ? queue.bgColor : 'bg-gray-50',
        )}>
          {queue.icon}
        </div>
        {queue.count > 0 && (
          <span className={cn(
            'flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold',
            isActive ? cn(queue.bgColor, queue.color) : 'bg-gray-100 text-gray-600',
          )}>
            {queue.count}
          </span>
        )}
      </div>
      <p className={cn(
        'text-xs font-bold truncate w-full',
        isActive ? queue.color : 'text-gray-700',
      )}>
        {queue.shortLabel}
      </p>
      <p className="text-[10px] text-gray-400 font-semibold tabular-nums mt-0.5">
        {formatCurrency(queue.amount)}
      </p>
    </button>
  );
});

// ─── Tab Config ─────────────────────────────────────────────────────────────

const TAB_CONFIG: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'queues', label: 'Billing Queues', icon: LayoutList },
  { id: 'claims', label: 'Claims', icon: FileText },
  { id: 'qa', label: 'Pre-Billing QA', icon: ClipboardCheck },
  { id: 'remittance', label: 'Remittance', icon: Upload },
  { id: 'aging', label: 'A/R Aging', icon: Clock },
  { id: 'denials', label: 'Denials', icon: XCircle },
  { id: 'eligibility', label: 'Eligibility', icon: Shield },
  { id: 'prevention', label: 'Denial Prevention', icon: Brain },
  { id: 'variance', label: 'Payment Variance', icon: Scale },
  { id: 'contracts', label: 'Contracts', icon: Handshake },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export default function Billing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'queues';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [activeQueueId, setActiveQueueId] = useState<string>('ready');
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Revenue KPIs ──────────────────────────────────────────────────────

  const [kpiData, setKpiData] = useState({
    totalAR: 186450,
    cleanClaimRate: 94.2,
    avgDaysAR: 32,
    collectionRate: 96.8,
    denialRate: 4.1,
    mtdCollected: 248900,
  });

  // ─── Queue totals ──────────────────────────────────────────────────────

  const [queueTotals, setQueueTotals] = useState({
    ready: { count: 7, amount: 25815 },
    rejected: { count: 4, amount: 11825.5 },
    remittance_pending: { count: 3, amount: 11250 },
    unpaid: { count: 5, amount: 21950 },
    blockers: { count: 6, amount: 18300 },
  });

  // ─── Load data ─────────────────────────────────────────────────────────

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [metricsResult, queuesResult] = await Promise.allSettled([
        fetchBillingMetrics(),
        fetchBillingQueues({ pageSize: 200 }),
      ]);

      let live = false;

      // Process metrics
      if (metricsResult.status === 'fulfilled' && metricsResult.value) {
        const m = metricsResult.value;
        setKpiData(prev => ({
          ...prev,
          totalAR: m.totalAR ?? prev.totalAR,
          cleanClaimRate: m.cleanClaimRate ?? prev.cleanClaimRate,
          avgDaysAR: m.avgDaysAR ?? prev.avgDaysAR,
          collectionRate: m.collectionRate ?? prev.collectionRate,
          denialRate: m.denialRate ?? prev.denialRate,
          mtdCollected: m.mtdCollected ?? prev.mtdCollected,
        }));
        live = true;
      }

      // Process queue items for totals
      if (queuesResult.status === 'fulfilled' && queuesResult.value?.items?.length > 0) {
        const items = queuesResult.value.items;
        const newTotals = {
          ready: { count: 0, amount: 0 },
          rejected: { count: 0, amount: 0 },
          remittance_pending: { count: 0, amount: 0 },
          unpaid: { count: 0, amount: 0 },
          blockers: { count: 0, amount: 0 },
        };
        items.forEach((item: any) => {
          const qt = item.queueType as keyof typeof newTotals;
          if (newTotals[qt]) {
            newTotals[qt].count++;
            newTotals[qt].amount += item.amount || 0;
          }
        });
        setQueueTotals(newTotals);
        live = true;
      }

      setIsLive(live);
      if (isRefresh) toast.success('Billing data refreshed');
    } catch (err) {
      console.error('[Billing] Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  }, [setSearchParams]);

  const handleQueueClick = useCallback((queueId: string) => {
    setActiveQueueId(queueId);
    if (activeTab !== 'queues') {
      setActiveTab('queues');
      setSearchParams({ tab: 'queues' }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  // ─── KPIs ──────────────────────────────────────────────────────────────

  const kpis: RevenueKPI[] = useMemo(() => [
    {
      label: 'Total A/R',
      value: formatCurrency(kpiData.totalAR),
      subtitle: 'Outstanding receivables',
      trend: 'down' as const,
      trendValue: '3.2%',
      icon: <DollarSign className="size-4 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      label: 'Clean Claim Rate',
      value: `${kpiData.cleanClaimRate}%`,
      subtitle: 'First-pass acceptance',
      trend: 'up' as const,
      trendValue: '1.4%',
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
      color: 'bg-emerald-50',
    },
    {
      label: 'Avg Days in A/R',
      value: `${kpiData.avgDaysAR}`,
      subtitle: 'Industry avg: 35-45',
      trend: 'down' as const,
      trendValue: '2 days',
      icon: <Clock className="size-4 text-amber-600" />,
      color: 'bg-amber-50',
    },
    {
      label: 'Collection Rate',
      value: `${kpiData.collectionRate}%`,
      subtitle: 'MTD collected',
      trend: 'up' as const,
      trendValue: '0.6%',
      icon: <Wallet className="size-4 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      label: 'Denial Rate',
      value: `${kpiData.denialRate}%`,
      subtitle: `${queueTotals.rejected.count} active denials`,
      trend: 'down' as const,
      trendValue: '0.8%',
      icon: <XCircle className="size-4 text-red-500" />,
      color: 'bg-red-50',
    },
    {
      label: 'MTD Collected',
      value: formatCurrency(kpiData.mtdCollected),
      subtitle: 'March 2026',
      trend: 'up' as const,
      trendValue: '12%',
      icon: <Banknote className="size-4 text-purple-600" />,
      color: 'bg-purple-50',
    },
  ], [kpiData, queueTotals]);

  // ─── Queue definitions ─────────────────────────────────────────────────

  const queues: QueueSummary[] = useMemo(() => [
    {
      id: 'ready', label: 'Claims Ready for Generation', shortLabel: 'Ready to Generate',
      count: queueTotals.ready.count, amount: queueTotals.ready.amount,
      icon: <FileText className="size-4 text-green-600" />,
      color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-300',
      dotColor: 'bg-green-500', tab: 'queues', description: 'Claims with all requirements met, ready for submission',
    },
    {
      id: 'rejected', label: 'Claims Rejected by Payer', shortLabel: 'Payer Rejections',
      count: queueTotals.rejected.count, amount: queueTotals.rejected.amount,
      icon: <XCircle className="size-4 text-red-600" />,
      color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300',
      dotColor: 'bg-red-500', tab: 'queues', description: 'Denied claims requiring correction and resubmission',
    },
    {
      id: 'remittance_pending', label: 'Remittance Pending Review', shortLabel: 'Pending Review',
      count: queueTotals.remittance_pending.count, amount: queueTotals.remittance_pending.amount,
      icon: <Clock className="size-4 text-amber-600" />,
      color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-300',
      dotColor: 'bg-amber-500', tab: 'queues', description: 'Submitted claims awaiting payer response',
    },
    {
      id: 'unpaid', label: 'Payments Needing Posting', shortLabel: 'Needs Posting',
      count: queueTotals.unpaid.count, amount: queueTotals.unpaid.amount,
      icon: <CreditCard className="size-4 text-orange-600" />,
      color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-300',
      dotColor: 'bg-orange-500', tab: 'queues', description: 'Received payments not yet posted to accounts',
    },
    {
      id: 'blockers', label: 'Missing Required Documentation', shortLabel: 'Missing Docs',
      count: queueTotals.blockers.count, amount: queueTotals.blockers.amount,
      icon: <AlertTriangle className="size-4 text-rose-600" />,
      color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-300',
      dotColor: 'bg-rose-500', tab: 'qa', description: 'Episodes blocked by missing OASIS, signatures, or authorizations',
    },
  ], [queueTotals]);

  const totalQueueItems = useMemo(() =>
    queues.reduce((s, q) => s + q.count, 0),
    [queues]
  );

  const totalQueueAmount = useMemo(() =>
    queues.reduce((s, q) => s + q.amount, 0),
    [queues]
  );

  // ─── Loading state ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
            <DollarSign className="size-7 text-green-600 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-gray-600">Loading billing workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-gray-50/50 overflow-y-auto">
      <div className="max-w-[1600px] mx-auto">
        {/* ═══ Header ═══════════════════════════════════════════════════════ */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="size-5 text-green-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Billing & Revenue Cycle</h1>
                <p className="text-xs text-gray-500">
                  {totalQueueItems} items across {queues.filter(q => q.count > 0).length} queues
                  {' · '}
                  {formatCurrency(totalQueueAmount)} outstanding
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] gap-1',
                  isLive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700',
                )}
              >
                {isLive ? <Wifi className="size-2.5" /> : <WifiOff className="size-2.5" />}
                {isLive ? 'Live Data' : 'Demo Data'}
              </Badge>
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => navigate('/payer-integration')}
              >
                <Shield className="size-3" />
                Payer Integration Hub
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => loadData(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn('size-3', refreshing && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* ═══ KPI Strip ═════════════════════════════════════════════════════ */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpis.map(kpi => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>
        </div>

        {/* ═══ Queue Summary Cards ═══════════════════════════════════════════ */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <LayoutList className="size-4 text-gray-400" />
              Operational Queues
            </h2>
            <p className="text-[10px] text-gray-400">
              Click a queue to filter the billing view
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {queues.map(queue => (
              <QueueCard
                key={queue.id}
                queue={queue}
                isActive={activeQueueId === queue.id && activeTab === 'queues'}
                onClick={() => {
                  setActiveQueueId(queue.id);
                  handleTabChange(queue.tab);
                }}
              />
            ))}
          </div>
        </div>

        {/* ═══ Tab Navigation ════════════════════════════════════════════════ */}
        <div className="px-6 pt-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-px">
            {TAB_CONFIG.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              // Count for tab badge
              let badgeCount = 0;
              if (tab.id === 'queues') badgeCount = totalQueueItems;
              if (tab.id === 'qa') badgeCount = queueTotals.blockers.count;
              if (tab.id === 'claims') {
                badgeCount = queueTotals.ready.count + queueTotals.rejected.count;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap shrink-0',
                    isActive
                      ? 'bg-white text-green-700 border-green-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent',
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                  {badgeCount > 0 && (
                    <span className={cn(
                      'ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500',
                    )}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ Tab Content ═══════════════════════════════════════════════════ */}
        <div className="px-6 py-6">
          <Suspense fallback={<LoadingState message="Loading module..." />}>
            {activeTab === 'queues' && <BillingQueues />}
            {activeTab === 'claims' && <ClaimsList />}
            {activeTab === 'qa' && <PreBillingQA />}
            {activeTab === 'remittance' && <RemittanceProcessing />}
            {activeTab === 'aging' && <ARAgingReport />}
            {activeTab === 'denials' && <DenialManagement />}
            {activeTab === 'eligibility' && <EligibilityVerification />}
            {activeTab === 'prevention' && <DenialPrevention />}
            {activeTab === 'variance' && <PaymentVariance />}
            {activeTab === 'contracts' && <PayerContracts />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}