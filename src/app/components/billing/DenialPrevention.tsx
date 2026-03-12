/**
 * Denial Prevention Engine
 * Cross-references Pre-Billing QA failures against historical denial patterns.
 * Shows risk-scored episodes with predicted denial reasons and preventive actions.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  Brain, AlertTriangle, Shield, CheckCircle2, XCircle,
  ChevronDown, ChevronRight, Search, TrendingUp, Activity,
  Sparkles, ArrowRight, Loader2, BarChart3, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchDenialPrevention } from '../../lib/billingApi';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const RISK_COLORS: Record<string, { bg: string; color: string; fill: string; border: string; dot: string }> = {
  critical: { bg: 'bg-red-50', color: 'text-red-700', fill: '#ef4444', border: 'border-red-300', dot: 'bg-red-500' },
  high:     { bg: 'bg-orange-50', color: 'text-orange-700', fill: '#f97316', border: 'border-orange-300', dot: 'bg-orange-500' },
  medium:   { bg: 'bg-amber-50', color: 'text-amber-700', fill: '#f59e0b', border: 'border-amber-300', dot: 'bg-amber-500' },
  low:      { bg: 'bg-emerald-50', color: 'text-emerald-700', fill: '#10b981', border: 'border-emerald-300', dot: 'bg-emerald-500' },
};

const CATEGORY_LABELS: Record<string, string> = {
  authorization: 'Authorization', coding: 'Coding', eligibility: 'Eligibility',
  duplicate: 'Duplicate', documentation: 'Documentation', timely_filing: 'Timely Filing',
  coverage: 'Coverage',
};

interface RiskAlert {
  id: string; patientName: string; mrn: string; payer: string; episodeId: string;
  amount: number; episodeStart: string; episodeEnd: string; riskScore: number;
  riskLevel: string; failedChecks: number; totalChecks: number;
  riskFactors: { checkKey: string; checkLabel: string; checkDetail: string; denialCategory: string; historicalDenials: number; payerSpecificDenials: number; riskContribution: number; historicalReasons: string[] }[];
  preventiveActions: string[]; estimatedDenialProbability: number; potentialRevenueLoss: number;
}

// ─── Risk Gauge ────────────────────────────────────────────────────────────

const RiskGauge = React.memo(function RiskGauge({ score, size = 48 }: { score: number; size?: number }) {
  const level = score >= 70 ? 'critical' : score >= 40 ? 'high' : score >= 20 ? 'medium' : 'low';
  const rc = RISK_COLORS[level];
  return (
    <div className={cn('rounded-xl flex items-center justify-center font-bold tabular-nums', rc.bg, rc.color)}
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {score}
    </div>
  );
});

// ─── Alert Row ─────────────────────────────────────────────────────────────

const AlertRow = React.memo(function AlertRow({ alert, expanded, onToggle }: {
  alert: RiskAlert; expanded: boolean; onToggle: () => void;
}) {
  const rc = RISK_COLORS[alert.riskLevel];
  const prob = Math.round(alert.estimatedDenialProbability);

  return (
    <div className={cn('rounded-xl border-2 transition-all overflow-hidden',
      alert.riskLevel === 'critical' ? 'border-red-300 shadow-sm shadow-red-100' :
      alert.riskLevel === 'high' ? 'border-orange-200' : 'border-gray-200',
    )}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50" onClick={onToggle}>
        {expanded ? <ChevronDown className="size-4 text-gray-400 shrink-0" /> : <ChevronRight className="size-4 text-gray-400 shrink-0" />}

        <RiskGauge score={alert.riskScore} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{alert.patientName}</span>
            <span className="text-[10px] text-gray-400">{alert.mrn}</span>
            <Badge variant="outline" className={cn('text-[9px] h-4 px-1 border', rc.bg, rc.color, rc.border)}>
              <span className={cn('w-1.5 h-1.5 rounded-full mr-0.5', rc.dot)} />
              {alert.riskLevel.charAt(0).toUpperCase() + alert.riskLevel.slice(1)} Risk
            </Badge>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {alert.payer} · {alert.failedChecks} failed check{alert.failedChecks > 1 ? 's' : ''} · Episode: {new Date(alert.episodeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(alert.episodeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Probability */}
        <div className="hidden md:flex flex-col items-end shrink-0">
          <span className={cn('text-xs font-bold tabular-nums', prob >= 60 ? 'text-red-600' : prob >= 30 ? 'text-amber-600' : 'text-gray-600')}>
            {prob}% denial probability
          </span>
          <span className="text-[9px] text-gray-400">based on historical patterns</span>
        </div>

        {/* Revenue at risk */}
        <span className="text-sm font-bold text-red-600 tabular-nums shrink-0">{formatCurrency(alert.potentialRevenueLoss)}</span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {/* Risk factors */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <Target className="size-3" /> Risk Factors
              </h4>
              {alert.riskFactors.map((rf, idx) => (
                <div key={idx} className="bg-red-50/50 rounded-lg p-3 border border-red-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-red-800">{rf.checkLabel}</span>
                    <Badge variant="outline" className="text-[8px] h-4 px-1 bg-red-100 text-red-700 border-red-200">
                      +{rf.riskContribution} pts
                    </Badge>
                  </div>
                  <p className="text-[10px] text-red-600 mb-1">{rf.checkDetail}</p>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500">
                    <span>Category: <strong>{CATEGORY_LABELS[rf.denialCategory] || rf.denialCategory}</strong></span>
                    <span>·</span>
                    <span>{rf.historicalDenials} historical denial{rf.historicalDenials !== 1 ? 's' : ''}</span>
                    {rf.payerSpecificDenials > 0 && <><span>·</span><span className="text-red-600">{rf.payerSpecificDenials} from this payer</span></>}
                  </div>
                  {rf.historicalReasons.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {rf.historicalReasons.map((r, i) => (
                        <span key={i} className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Preventive actions */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <Sparkles className="size-3" /> Recommended Preventive Actions
              </h4>
              {alert.preventiveActions.map((action, idx) => (
                <div key={idx} className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100 flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-700">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-800">{action}</p>
                    <Button size="sm" variant="outline" className="mt-1.5 h-6 text-[10px] gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      <ArrowRight className="size-2.5" /> Take Action
                    </Button>
                  </div>
                </div>
              ))}

              {/* Denial probability meter */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-500">Estimated Denial Probability</span>
                  <span className={cn('text-sm font-bold', prob >= 60 ? 'text-red-600' : prob >= 30 ? 'text-amber-600' : 'text-emerald-600')}>
                    {prob}%
                  </span>
                </div>
                <Progress value={prob} className={cn('h-2',
                  prob >= 60 ? '[&>[data-slot=progress-indicator]]:bg-red-500' :
                  prob >= 30 ? '[&>[data-slot=progress-indicator]]:bg-amber-500' :
                  '[&>[data-slot=progress-indicator]]:bg-emerald-500',
                )} />
                <p className="text-[9px] text-gray-400 mt-1">
                  Based on {alert.riskFactors.reduce((s, f) => s + f.historicalDenials, 0)} historical denials with similar patterns
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────

export const DenialPrevention = React.memo(function DenialPrevention() {
  const [data, setData] = useState<{ alerts: RiskAlert[]; patterns: any; summary: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { const result = await fetchDenialPrevention(); setData(result); }
    catch (err: any) { console.error('[DenialPrevention] Error:', err); setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredAlerts = useMemo(() => {
    if (!data?.alerts) return [];
    let items = data.alerts;
    if (riskFilter !== 'all') items = items.filter(a => a.riskLevel === riskFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(a => a.patientName.toLowerCase().includes(q) || a.mrn.toLowerCase().includes(q) || a.payer.toLowerCase().includes(q));
    }
    return items;
  }, [data, riskFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  // Chart data: risk category breakdown
  const riskCategoryData = useMemo(() => {
    if (!data?.summary?.topRiskCategories) return [];
    return data.summary.topRiskCategories.map((c: any) => ({
      name: CATEGORY_LABELS[c.category] || c.category,
      denials: c.count,
      amount: c.amount,
    }));
  }, [data]);

  const riskDistribution = useMemo(() => {
    if (!data?.summary) return [];
    return [
      { name: 'Critical', value: data.summary.critical, fill: '#ef4444' },
      { name: 'High', value: data.summary.high, fill: '#f97316' },
      { name: 'Medium', value: data.summary.medium, fill: '#f59e0b' },
      { name: 'Low', value: data.summary.low, fill: '#10b981' },
    ].filter(d => d.value > 0);
  }, [data]);

  if (loading) return <LoadingState message="Analyzing denial patterns..." />;
  if (error) return (
    <div className="text-center py-8 text-red-500">
      <p className="text-sm mb-2">{error}</p>
      <Button size="sm" variant="outline" onClick={loadData}>Retry</Button>
    </div>
  );
  if (!data) return null;
  const { summary } = data;

  return (
    <div className="space-y-5">
      {/* Header callout */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Brain className="size-5 text-purple-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Denial Prevention Engine</h3>
            <p className="text-xs text-gray-500">AI-powered cross-referencing of QA failures against historical denial patterns</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <MetricCard title="Episodes at Risk" value={summary.totalAtRisk} subtitle="With QA failures" icon={<AlertTriangle className="size-4" />} variant="warning" />
          <MetricCard title="Critical Risk" value={summary.critical} subtitle="Immediate action needed" icon={<XCircle className="size-4" />} variant="danger" />
          <MetricCard title="Revenue at Risk" value={formatCurrency(summary.totalRevenueAtRisk)} subtitle="If denied" icon={<Activity className="size-4" />} variant="danger" />
          <MetricCard title="High Risk" value={summary.high} subtitle="Requires attention" icon={<AlertTriangle className="size-4" />} variant="warning" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="size-4 text-purple-600" />
              Historical Denial Patterns by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskCategoryData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="denials" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Denial Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No denial patterns found</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="size-4 text-red-600" />
              Risk Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskDistribution.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {riskDistribution.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {riskDistribution.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                        {d.name}
                      </span>
                      <span className="font-bold tabular-nums">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No at-risk episodes</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search patient, MRN, payer..." className="pl-9 h-8 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        {['all', 'critical', 'high', 'medium', 'low'].map(level => (
          <Button
            key={level}
            variant={riskFilter === level ? 'default' : 'outline'}
            size="sm"
            className={cn('h-8 text-xs',
              riskFilter === level && level !== 'all' && RISK_COLORS[level] ? cn(RISK_COLORS[level].bg, RISK_COLORS[level].color, 'border', RISK_COLORS[level].border) : '',
            )}
            onClick={() => setRiskFilter(level)}
          >
            {level === 'all' ? 'All' : `${level.charAt(0).toUpperCase() + level.slice(1)} (${
              level === 'critical' ? summary.critical :
              level === 'high' ? summary.high :
              level === 'medium' ? summary.medium : summary.low
            })`}
          </Button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <AlertRow key={alert.id} alert={alert} expanded={expandedIds.has(alert.id)} onToggle={() => toggleExpand(alert.id)} />
        ))}
        {filteredAlerts.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-gray-400">
              <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-medium">No at-risk episodes</p>
              <p className="text-xs mt-1">All pre-billing QA checks are passing</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
});
