/**
 * Monitor Module
 * Visit monitoring, oversight, compliance tracking, and quality assurance dashboard.
 * Wired to backend: GET /monitor/summary, /monitor/alerts, /monitor/compliance, /monitor/quality-trends
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Shield,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  MapPin,
  FileText,
  Calendar,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { LoadingState } from '../components/design-system/LoadingState';
import {
  fetchMonitorSummary,
  fetchAlerts,
  updateAlert,
  fetchCompliance,
  fetchQualityTrends,
  type MonitorAlert,
  type ComplianceRecord,
  type QualitySnapshot,
  type MonitorSummary,
} from '../lib/monitorApi';

const ALERT_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  missed_visit: { label: 'Missed Visit', icon: <XCircle className="size-4" />, color: 'text-red-600' },
  late_documentation: { label: 'Late Documentation', icon: <FileText className="size-4" />, color: 'text-amber-600' },
  evv_exception: { label: 'EVV Exception', icon: <MapPin className="size-4" />, color: 'text-orange-600' },
  authorization_expiring: { label: 'Auth Expiring', icon: <Shield className="size-4" />, color: 'text-purple-600' },
  scheduling_conflict: { label: 'Schedule Conflict', icon: <Calendar className="size-4" />, color: 'text-blue-600' },
  unsigned_order: { label: 'Unsigned Order', icon: <FileText className="size-4" />, color: 'text-indigo-600' },
};

const SEVERITY_CONFIG: Record<string, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-red-100 text-red-800 border-red-200' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  low: { label: 'Low', className: 'bg-blue-100 text-blue-800 border-blue-200' },
};

const TREND_ICON: Record<string, React.ReactNode> = {
  improving: <ArrowUpRight className="size-4 text-green-600" />,
  declining: <ArrowDownRight className="size-4 text-red-600" />,
  stable: <Minus className="size-4 text-gray-500" />,
};

// ─── Alert Card ──────────────────────────────────────────────────────────────

const AlertCard = React.memo(({
  alert,
  onAcknowledge,
  onResolve,
  acting,
}: {
  alert: MonitorAlert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  acting: string | null;
}) => {
  const typeConfig = ALERT_TYPE_CONFIG[alert.type] || { label: alert.type, icon: <Bell className="size-4" />, color: 'text-gray-600' };
  const sevConfig = SEVERITY_CONFIG[alert.severity];

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
      alert.status === 'resolved' ? 'bg-gray-50 border-gray-200 opacity-70' :
      alert.severity === 'high' ? 'bg-red-50/50 border-red-200' :
      alert.severity === 'medium' ? 'bg-amber-50/50 border-amber-200' :
      'bg-white border-gray-200'
    }`}>
      <div className={`mt-0.5 ${typeConfig.color}`}>{typeConfig.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-sm text-gray-900">{alert.title}</span>
          <Badge className={`text-xs ${sevConfig.className}`}>{sevConfig.label}</Badge>
          <Badge variant="outline" className="text-xs">{typeConfig.label}</Badge>
          {alert.status === 'acknowledged' && (
            <Badge className="bg-blue-100 text-blue-700 text-xs">Acknowledged</Badge>
          )}
          {alert.status === 'resolved' && (
            <Badge className="bg-green-100 text-green-700 text-xs">Resolved</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-1.5">{alert.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          {alert.patientName && <span>Patient: {alert.patientName}</span>}
          {alert.clinician && <span>Clinician: {alert.clinician}</span>}
          {alert.visitDate && <span>Visit: {new Date(alert.visitDate).toLocaleDateString()}</span>}
          <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {alert.status === 'open' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onAcknowledge(alert.id)}
              disabled={acting === alert.id}
            >
              {acting === alert.id ? <Loader2 className="size-3 animate-spin" /> : <Eye className="size-3 mr-1" />}
              Acknowledge
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs bg-green-600 hover:bg-green-700"
              onClick={() => onResolve(alert.id)}
              disabled={acting === alert.id}
            >
              <CheckCircle2 className="size-3 mr-1" />
              Resolve
            </Button>
          </>
        )}
        {alert.status === 'acknowledged' && (
          <Button
            size="sm"
            className="h-7 text-xs bg-green-600 hover:bg-green-700"
            onClick={() => onResolve(alert.id)}
            disabled={acting === alert.id}
          >
            {acting === alert.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3 mr-1" />}
            Resolve
          </Button>
        )}
      </div>
    </div>
  );
});
AlertCard.displayName = 'AlertCard';

// ─── Compliance Gauge ────────────────────────────────────────────────────────

const ComplianceGauge = React.memo(({ record }: { record: ComplianceRecord }) => {
  const isBelow = record.current < record.target;
  const progressColor = record.current >= record.target
    ? '[&>[data-slot=progress-indicator]]:bg-green-500'
    : record.current >= record.target * 0.9
    ? '[&>[data-slot=progress-indicator]]:bg-amber-500'
    : '[&>[data-slot=progress-indicator]]:bg-red-500';

  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{record.metric}</span>
        <div className="flex items-center gap-1">
          {TREND_ICON[record.trend]}
          <span className="text-xs text-gray-500 capitalize">{record.trend}</span>
        </div>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className={`text-2xl font-bold ${isBelow ? 'text-red-600' : 'text-green-600'}`}>
          {record.current}%
        </span>
        <span className="text-sm text-gray-400 mb-0.5">/ {record.target}% target</span>
      </div>
      <Progress value={record.current} className={progressColor} />
      <p className="text-xs text-gray-500 mt-2">{record.details}</p>
    </div>
  );
});
ComplianceGauge.displayName = 'ComplianceGauge';

// ─── Main Monitor Component ──────────────────────────────────────────────────

export default function Monitor() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<MonitorSummary | null>(null);
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [trends, setTrends] = useState<QualitySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingAlertId, setActingAlertId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [alertSeverity, setAlertSeverity] = useState<string>('all');
  const [alertStatus, setAlertStatus] = useState<string>('all');
  const [alertType, setAlertType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isModuleEnabled('monitor')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, alertsData, complianceData, trendsData] = await Promise.all([
        fetchMonitorSummary(),
        fetchAlerts({ severity: alertSeverity !== 'all' ? alertSeverity : undefined, status: alertStatus !== 'all' ? alertStatus : undefined, type: alertType !== 'all' ? alertType : undefined }),
        fetchCompliance(),
        fetchQualityTrends(),
      ]);
      setSummary(summaryData);
      setAlerts(alertsData);
      setCompliance(complianceData);
      setTrends(trendsData);
    } catch (err: any) {
      console.error('[Monitor] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [alertSeverity, alertStatus, alertType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleAcknowledge = useCallback(async (id: string) => {
    setActingAlertId(id);
    try {
      await updateAlert(id, { status: 'acknowledged' } as any);
      await loadData();
    } catch (err: any) {
      console.error('[Monitor] Acknowledge error:', err);
    } finally {
      setActingAlertId(null);
    }
  }, [loadData]);

  const handleResolve = useCallback(async (id: string) => {
    setActingAlertId(id);
    try {
      await updateAlert(id, { status: 'resolved' } as any);
      await loadData();
    } catch (err: any) {
      console.error('[Monitor] Resolve error:', err);
    } finally {
      setActingAlertId(null);
    }
  }, [loadData]);

  const filteredAlerts = useMemo(() => {
    if (!searchQuery) return alerts;
    const q = searchQuery.toLowerCase();
    return alerts.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.patientName && a.patientName.toLowerCase().includes(q)) ||
      (a.clinician && a.clinician.toLowerCase().includes(q))
    );
  }, [alerts, searchQuery]);

  // Compliance bar chart data
  const complianceChartData = useMemo(() =>
    compliance.map(c => ({
      name: c.metric.replace(/\s+/g, '\n').substring(0, 20),
      shortName: c.metric.split(' ').slice(0, 2).join(' '),
      current: c.current,
      target: c.target,
      gap: Math.max(0, c.target - c.current),
    })), [compliance]);

  if (loading && !summary) {
    return (
      <div className="size-full bg-gray-50 flex items-center justify-center">
        <LoadingState message="Loading monitor dashboard..." />
      </div>
    );
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="size-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Monitor</h1>
              <p className="text-gray-600">Visit monitoring, oversight, and quality assurance</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`size-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <Button size="sm" variant="outline" className="ml-3" onClick={handleRefresh}>Retry</Button>
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className={summary.highSeverityOpen > 0 ? 'border-red-200 bg-red-50/50' : ''}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" />
                  Open Alerts
                </CardDescription>
                <CardTitle className={`text-3xl ${summary.openAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {summary.openAlerts}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500">
                  {summary.highSeverityOpen} high severity
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Eye className="size-3.5" />
                  Acknowledged
                </CardDescription>
                <CardTitle className="text-3xl text-amber-600">{summary.acknowledgedAlerts}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500">Awaiting resolution</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Resolved
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">{summary.resolvedAlerts}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500">This period</p>
              </CardContent>
            </Card>
            <Card className={summary.avgCompliance < 90 ? 'border-amber-200 bg-amber-50/50' : ''}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Shield className="size-3.5" />
                  Avg Compliance
                </CardDescription>
                <CardTitle className={`text-3xl ${summary.avgCompliance >= 90 ? 'text-green-600' : summary.avgCompliance >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                  {summary.avgCompliance}%
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500">
                  {summary.belowTarget} metric{summary.belowTarget !== 1 ? 's' : ''} below target
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="alerts" className="gap-1.5">
              <Bell className="size-3.5" />
              Alerts
              {summary && summary.openAlerts > 0 && (
                <Badge className="bg-red-100 text-red-700 text-xs ml-1 h-5 px-1.5">{summary.openAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-1.5">
              <Shield className="size-3.5" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-1.5">
              <TrendingUp className="size-3.5" />
              Quality Trends
            </TabsTrigger>
          </TabsList>

          {/* ─── Alerts Tab ────────────────────────────────────────── */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={alertSeverity} onValueChange={(v) => setAlertSeverity(v)}>
                <SelectTrigger className="w-32 h-9 text-sm">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={alertStatus} onValueChange={(v) => setAlertStatus(v)}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={alertType} onValueChange={(v) => setAlertType(v)}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="missed_visit">Missed Visit</SelectItem>
                  <SelectItem value="late_documentation">Late Docs</SelectItem>
                  <SelectItem value="evv_exception">EVV Exception</SelectItem>
                  <SelectItem value="authorization_expiring">Auth Expiring</SelectItem>
                  <SelectItem value="scheduling_conflict">Schedule Conflict</SelectItem>
                  <SelectItem value="unsigned_order">Unsigned Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredAlerts.length === 0 ? (
              <Card className="p-8">
                <div className="text-center text-gray-500">
                  <CheckCircle2 className="size-10 mx-auto mb-2 text-green-400" />
                  <p className="font-medium text-gray-900">No alerts match your criteria</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                    acting={actingAlertId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── Compliance Tab ────────────────────────────────────── */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compliance.map(record => (
                <ComplianceGauge key={record.id} record={record} />
              ))}
            </div>

            {/* Compliance Bar Chart */}
            {complianceChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="size-5 text-blue-600" />
                    Compliance vs Target
                  </CardTitle>
                  <CardDescription>Current performance relative to compliance targets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={complianceChartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="shortName" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Legend />
                      <Bar dataKey="current" name="Current" stackId="a" radius={[0, 4, 4, 0]}>
                        {complianceChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.current >= entry.target ? '#22c55e' : entry.current >= entry.target * 0.9 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                      <Bar dataKey="gap" name="Gap to Target" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─── Quality Trends Tab ────────────────────────────────── */}
          <TabsContent value="trends" className="space-y-6">
            {trends.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="size-5 text-blue-600" />
                      Quality Metrics Over Time
                    </CardTitle>
                    <CardDescription>Weekly trends across key quality indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={trends} margin={{ top: 5, right: 30, bottom: 5, left: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                        <YAxis domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(value: number) => `${value}%`} />
                        <Legend />
                        <Line type="monotone" dataKey="docTimeliness" name="Doc Timeliness" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="evvRate" name="EVV Rate" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="oasisTimeliness" name="OASIS Timeliness" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="ordersSigned" name="Orders Signed" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="visitUtil" name="Visit Utilization" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Weekly Breakdown Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weekly Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium text-gray-600">Week</th>
                            <th className="text-center py-2 px-3 font-medium text-gray-600">Doc Timeliness</th>
                            <th className="text-center py-2 px-3 font-medium text-gray-600">EVV Rate</th>
                            <th className="text-center py-2 px-3 font-medium text-gray-600">OASIS Timeliness</th>
                            <th className="text-center py-2 px-3 font-medium text-gray-600">Orders Signed</th>
                            <th className="text-center py-2 px-3 font-medium text-gray-600">Visit Utilization</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trends.map((snap) => (
                            <tr key={snap.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="py-2 px-3 font-medium">{snap.week}</td>
                              {[snap.docTimeliness, snap.evvRate, snap.oasisTimeliness, snap.ordersSigned, snap.visitUtil].map((val, i) => (
                                <td key={i} className="text-center py-2 px-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    val >= 90 ? 'bg-green-100 text-green-800' :
                                    val >= 80 ? 'bg-amber-100 text-amber-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {val}%
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
