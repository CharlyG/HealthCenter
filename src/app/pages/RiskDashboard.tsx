/**
 * Predictive Risk Dashboard
 * Identifies operational risks across the agency:
 * hospitalization risk, missing visits, caregiver reliability,
 * documentation gaps, claim rejection risk, expiring authorizations.
 *
 * Performance: lazy-loaded, memoized components, server-side computation.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { PageLayout, PageHeader, PageSection } from '../components/design-system/PageLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import {
  ShieldAlert,
  RefreshCw,
  Search,
  AlertTriangle,
  TrendingUp,
  Activity,
  BarChart3,
  List,
  Lightbulb,
  Download,
  Minus,
} from 'lucide-react';

import { riskDashboardGateway } from '../lib/dataGateway';
import type {
  RiskDashboardData,
  RiskItem,
  RiskCategory,
  RiskSeverity,
} from '../lib/riskTypes';

import { RiskScoreGauge } from '../components/risks/RiskScoreGauge';
import { RiskCategoryCard } from '../components/risks/RiskCategoryCard';
import { RiskItemRow } from '../components/risks/RiskItemRow';
import { OperationalInsightCard } from '../components/risks/OperationalInsightCard';
import { RiskTrendChart } from '../components/risks/RiskTrendChart';

// ─── Summary Stat Card ──────────────────────────────────────────────────────

function SummaryStat({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="size-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function RiskDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<RiskDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<RiskSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('risks');

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const result = await riskDashboardGateway.getDashboard();
      setData(result);
      setError(null);
    } catch (err: any) {
      console.error('[RiskDashboard] Error:', err);
      setError(err.message || 'Failed to load risk data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Export handler
  const [exporting, setExporting] = useState(false);
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const blob = await riskDashboardGateway.exportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `risk-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Risk report exported successfully');
    } catch (err: any) {
      console.error('[RiskDashboard] Export error:', err);
      toast.error('Failed to export report', { description: err.message });
    } finally {
      setExporting(false);
    }
  }, []);

  // Filtered risks
  const filteredRisks = useMemo(() => {
    if (!data) return [];
    let items = data.risks;

    if (selectedCategory !== 'all') {
      items = items.filter(r => r.category === selectedCategory);
    }
    if (selectedSeverity !== 'all') {
      items = items.filter(r => r.severity === selectedSeverity);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.entityName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }

    return items;
  }, [data, selectedCategory, selectedSeverity, searchQuery]);

  // Navigate on investigate
  const handleInvestigate = useCallback((risk: RiskItem) => {
    switch (risk.entityType) {
      case 'patient':
        navigate(`/patient/${risk.entityId}/chart`);
        break;
      case 'admission':
        navigate(`/admissions/${risk.metadata?.admissionId || risk.entityId}`);
        break;
      case 'claim':
        navigate('/billing');
        toast.info('Navigate to Billing', { description: `Reviewing claim ${risk.metadata?.claimId}` });
        break;
      case 'caregiver':
        navigate('/monitor');
        toast.info('Navigate to Monitor', { description: `Reviewing ${risk.entityName}` });
        break;
      case 'authorization':
        navigate(`/patient/${risk.metadata?.patientId}/chart`);
        break;
      default:
        toast.info('Opening details...');
    }
  }, [navigate]);

  // Handle insight action
  const handleInsightAction = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <ShieldAlert className="size-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-red-300 border-t-transparent animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-700">Analyzing Agency Risks...</p>
          <p className="text-sm text-gray-400 mt-1">Computing predictive risk scores</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !data) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertTriangle className="size-12 text-amber-500 mb-4" />
          <p className="text-lg font-semibold text-gray-700">Unable to Load Risk Data</p>
          <p className="text-sm text-gray-500 mt-1 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="size-4 mr-2" /> Retry
          </Button>
        </div>
      </PageLayout>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <PageLayout maxWidth="2xl">
        <PageHeader
          icon={<ShieldAlert className="size-8" />}
          title="Predictive Risk Dashboard"
          subtitle="Identify and mitigate operational risks across the agency"
          actions={
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh risk analysis</TooltipContent>
              </Tooltip>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exporting}
              >
                <Download className="size-4 mr-2" />
                Export Report
              </Button>
            </div>
          }
        />

        {/* ── Overall Summary ────────────────────────────────────────── */}
        <PageSection>
          <div className="grid grid-cols-12 gap-4">
            {/* Risk Score Gauge */}
            <div className="col-span-3">
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <RiskScoreGauge
                    score={data.summary.overallRiskScore}
                    previousScore={data.summary.previousScore}
                    size="md"
                  />
                  <div className="text-xs text-gray-500 mt-3 text-center">Agency-Wide Risk</div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="col-span-9">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <SummaryStat
                  label="Total Risks"
                  value={data.summary.totalRisks}
                  color="bg-gray-700"
                  icon={Activity}
                />
                <SummaryStat
                  label="Critical"
                  value={data.summary.criticalCount}
                  color="bg-red-600"
                  icon={AlertTriangle}
                />
                <SummaryStat
                  label="High"
                  value={data.summary.highCount}
                  color="bg-orange-500"
                  icon={TrendingUp}
                />
                <SummaryStat
                  label="Medium / Low"
                  value={data.summary.mediumCount + data.summary.lowCount}
                  color="bg-amber-500"
                  icon={Minus}
                />
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-end gap-2 text-[11px] text-gray-400">
                <Activity className="size-3" />
                Last analyzed: {new Date(data.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        </PageSection>

        {/* ── Risk Category Cards ────────────────────────────────────── */}
        <PageSection>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Risk Categories</h3>
            {selectedCategory !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedCategory('all')}
              >
                Clear Filter
              </Button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-3">
            {data.categories.map(cat => (
              <RiskCategoryCard
                key={cat.category}
                summary={cat}
                isSelected={selectedCategory === cat.category}
                onClick={() => {
                  setSelectedCategory(prev => prev === cat.category ? 'all' : cat.category as RiskCategory);
                  setActiveTab('risks');
                }}
              />
            ))}
          </div>
        </PageSection>

        {/* ── Tabbed Content ─────────────────────────────────────────── */}
        <PageSection>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="risks" className="gap-1.5">
                  <List className="size-3.5" />
                  Risk Items ({filteredRisks.length})
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-1.5">
                  <Lightbulb className="size-3.5" />
                  Insights ({data.insights.length})
                </TabsTrigger>
                <TabsTrigger value="trends" className="gap-1.5">
                  <BarChart3 className="size-3.5" />
                  Trends
                </TabsTrigger>
              </TabsList>

              {/* Filters — visible in risks tab */}
              {activeTab === 'risks' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                    <Input
                      placeholder="Search risks..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs w-[200px]"
                    />
                  </div>
                  <Select value={selectedSeverity} onValueChange={(v) => setSelectedSeverity(v as any)}>
                    <SelectTrigger className="h-8 w-[130px] text-xs">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* ── Risk Items Tab ──────────────────────────────────────── */}
            <TabsContent value="risks" className="mt-0">
              {filteredRisks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShieldAlert className="size-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">No risks match your filters</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or category filter</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedSeverity('all');
                        setSearchQuery('');
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filteredRisks.map(risk => (
                    <RiskItemRow
                      key={risk.id}
                      risk={risk}
                      onInvestigate={handleInvestigate}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Insights Tab ────────────────────────────────────────── */}
            <TabsContent value="insights" className="mt-0">
              <div className="grid grid-cols-2 gap-3">
                {data.insights.map(insight => (
                  <OperationalInsightCard
                    key={insight.id}
                    insight={insight}
                    onAction={handleInsightAction}
                  />
                ))}
              </div>
            </TabsContent>

            {/* ── Trends Tab ──────────────────────────────────────────── */}
            <TabsContent value="trends" className="mt-0">
              <RiskTrendChart
                trends={data.trends}
                visibleCategories={selectedCategory !== 'all' ? [selectedCategory] : undefined}
              />
            </TabsContent>
          </Tabs>
        </PageSection>
      </PageLayout>
    </TooltipProvider>
  );
}