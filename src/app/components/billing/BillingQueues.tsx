/**
 * Billing Queues Component
 * Revenue cycle workflow queues:
 * - Claims ready to generate
 * - Claims rejected
 * - Remittance pending
 * - Unpaid claims
 * - Pre-billing blockers
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Filter,
  Search,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MetricCard } from '../design-system/MetricCard';
import { CompactTable, type CompactColumn } from '../design-system/CompactTable';
import { EmptyState } from '../design-system/EmptyState';
import { LoadingState } from '../design-system/LoadingState';
import { fetchBillingQueues, generateClaim, generateAllClaims } from '../../lib/billingApi';

type QueueType = 'ready' | 'rejected' | 'remittance_pending' | 'unpaid' | 'blockers';

interface QueueItem {
  id: string;
  patientName: string;
  mrn: string;
  payer: string;
  amount: number;
  claimNumber?: string;
  serviceDate: string;
  episodeId?: string;
  reason?: string;
  daysOutstanding?: number;
  blockerType?: string;
  queueType: string;
}

const queueConfig: Record<QueueType, { label: string; icon: React.ReactNode; color: string; badgeColor: string }> = {
  ready: { label: 'Claims Ready', icon: <FileText className="size-5" />, color: 'text-green-600', badgeColor: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected Claims', icon: <XCircle className="size-5" />, color: 'text-red-600', badgeColor: 'bg-red-100 text-red-700' },
  remittance_pending: { label: 'Remittance Pending', icon: <Clock className="size-5" />, color: 'text-yellow-600', badgeColor: 'bg-yellow-100 text-yellow-700' },
  unpaid: { label: 'Unpaid Claims', icon: <DollarSign className="size-5" />, color: 'text-orange-600', badgeColor: 'bg-orange-100 text-orange-700' },
  blockers: { label: 'Pre-Billing Blockers', icon: <AlertTriangle className="size-5" />, color: 'text-red-600', badgeColor: 'bg-red-100 text-red-700' },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const BillingQueues = React.memo(() => {
  const navigate = useNavigate();
  const [activeQueue, setActiveQueue] = useState<QueueType>('ready');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<QueueItem[]>([]);
  const [allItems, setAllItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all items for totals
      const allResult = await fetchBillingQueues({ pageSize: 100 });
      setAllItems(allResult.items);
      // Load filtered
      const result = await fetchBillingQueues({ queueType: activeQueue, search: searchQuery || undefined });
      setItems(result.items);
    } catch (err: any) {
      console.error('[BillingQueues] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeQueue, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(loadData, 300);
    return () => clearTimeout(debounce);
  }, [loadData]);

  const handleGenerateAll = useCallback(async () => {
    setGenerating(true);
    try {
      await generateAllClaims();
      await loadData();
    } catch (err: any) {
      console.error('[BillingQueues] Generate error:', err);
    } finally {
      setGenerating(false);
    }
  }, [loadData]);

  const queueTotals = useMemo(() => {
    const totals: Record<QueueType, { count: number; amount: number }> = {
      ready: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      remittance_pending: { count: 0, amount: 0 },
      unpaid: { count: 0, amount: 0 },
      blockers: { count: 0, amount: 0 },
    };
    allItems.forEach((item) => {
      const qt = item.queueType as QueueType;
      if (totals[qt]) {
        totals[qt].count++;
        totals[qt].amount += item.amount || 0;
      }
    });
    return totals;
  }, [allItems]);

  const getColumns = useCallback((): CompactColumn<QueueItem>[] => {
    const baseColumns: CompactColumn<QueueItem>[] = [
      {
        key: 'patient', header: 'Patient',
        render: (item) => (
          <div>
            <div className="font-medium text-gray-900">{item.patientName}</div>
            <div className="text-gray-500">{item.mrn}</div>
          </div>
        ),
      },
      { key: 'payer', header: 'Payer', render: (item) => <span className="text-gray-700">{item.payer}</span> },
      {
        key: 'serviceDate', header: 'Service Date',
        render: (item) => <span className="text-gray-600">{new Date(item.serviceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>,
      },
      { key: 'amount', header: 'Amount', align: 'right' as const, render: (item) => <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span> },
    ];

    if (activeQueue === 'rejected') {
      baseColumns.splice(2, 0, { key: 'claim', header: 'Claim #', render: (item) => <span className="font-mono text-xs text-gray-600">{item.claimNumber}</span> });
      baseColumns.push({ key: 'reason', header: 'Rejection Reason', render: (item) => <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">{item.reason}</Badge> });
    }
    if (activeQueue === 'remittance_pending' || activeQueue === 'unpaid') {
      baseColumns.splice(2, 0, { key: 'claim', header: 'Claim #', render: (item) => <span className="font-mono text-xs text-gray-600">{item.claimNumber}</span> });
      baseColumns.push({
        key: 'days', header: 'Days Outstanding', align: 'center' as const,
        render: (item) => {
          const days = item.daysOutstanding || 0;
          const color = days > 90 ? 'text-red-600 font-bold' : days > 60 ? 'text-orange-600 font-semibold' : 'text-yellow-600';
          return <span className={color}>{days}</span>;
        },
      });
    }
    if (activeQueue === 'blockers') {
      baseColumns.push({ key: 'blocker', header: 'Blocker', render: (item) => <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs"><AlertTriangle className="size-3 mr-1" />{item.blockerType}</Badge> });
    }
    baseColumns.push({ key: 'actions', header: '', align: 'right' as const, width: '40px', render: () => <ChevronRight className="size-4 text-gray-400" /> });
    return baseColumns;
  }, [activeQueue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(Object.keys(queueConfig) as QueueType[]).map((key) => {
          const config = queueConfig[key];
          const totals = queueTotals[key];
          return (
            <MetricCard
              key={key}
              title={config.label}
              value={totals.count}
              subtitle={formatCurrency(totals.amount)}
              icon={config.icon}
              variant={key === 'rejected' || key === 'blockers' ? 'danger' : key === 'unpaid' ? 'warning' : 'default'}
              onClick={() => setActiveQueue(key)}
              className={activeQueue === key ? 'ring-2 ring-blue-500' : ''}
            />
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={queueConfig[activeQueue].color}>{queueConfig[activeQueue].icon}</div>
              <div>
                <CardTitle className="text-lg">{queueConfig[activeQueue].label}</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  {queueTotals[activeQueue].count} items · {formatCurrency(queueTotals[activeQueue].amount)} total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search queue..." className="pl-9 w-64 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button size="sm" variant="outline" className="h-9" onClick={loadData}><RefreshCw className="size-3" /></Button>
              {activeQueue === 'ready' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleGenerateAll} disabled={generating}>
                  {generating ? <RefreshCw className="size-4 mr-1 animate-spin" /> : <FileText className="size-4 mr-1" />}
                  Generate All Claims
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading billing queue..." />
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="text-sm mb-2">{error}</p>
              <Button size="sm" variant="outline" onClick={loadData}>Retry</Button>
            </div>
          ) : (
            <CompactTable
              data={items}
              columns={getColumns()}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => navigate(`/billing/claim/${item.id}`)}
              emptyMessage={searchQuery ? 'No matching items found' : 'No items in this queue'}
              striped
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
});

BillingQueues.displayName = 'BillingQueues';