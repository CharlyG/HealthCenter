/**
 * Payer Integration Dashboard
 * Centralized hub for payer integrations: eligibility, authorizations, claims, ERA
 */
import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '../ui/utils';
import {
  Shield, FileCheck, Send, Activity, DollarSign,
  CheckCircle2, AlertCircle, Clock, TrendingUp,
  Building2, Zap, BarChart3, ArrowRight, FileCode,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchPayerDashboardStats } from '../../lib/payerApi';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

interface DashboardStats {
  eligibility: {
    verified: number;
    pending: number;
    failed: number;
    lastVerified: string;
  };
  authorizations: {
    active: number;
    pending: number;
    expiring: number;
    expired: number;
  };
  claims: {
    submitted: number;
    accepted: number;
    rejected: number;
    paid: number;
    totalBilled: number;
    totalPaid: number;
  };
  era: {
    processed: number;
    pending: number;
    totalRemitted: number;
    lastProcessed: string;
  };
  integration: {
    clearinghouse: string;
    status: 'connected' | 'disconnected' | 'error';
    lastSync: string;
    payersConnected: number;
  };
}

// ─── Quick Action Card ─────────────────────────────────────────────────────

const QuickActionCard = React.memo(function QuickActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  badge,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  badge?: { text: string; variant: 'default' | 'destructive' | 'warning' };
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', color)}>
              <Icon className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {badge && (
            <Badge
              variant={badge.variant === 'destructive' ? 'destructive' : badge.variant === 'warning' ? 'outline' : 'secondary'}
              className={badge.variant === 'warning' ? 'border-amber-300 bg-amber-50 text-amber-700' : ''}
            >
              {badge.text}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Main Dashboard ────────────────────────────────────────────────────────

export const PayerIntegrationDashboard = React.memo(function PayerIntegrationDashboard({
  onNavigate,
}: {
  onNavigate: (section: 'eligibility' | 'authorizations' | 'claims' | 'era' | 'config') => void;
}) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPayerDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('[PayerIntegrationDashboard] Error:', err);
      setError(err.message);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: 'Eligibility Verified',
        value: stats.eligibility.verified.toString(),
        subtitle: stats.eligibility.pending > 0 ? `${stats.eligibility.pending} pending` : undefined,
        trend: 'neutral' as const,
        trendValue: stats.eligibility.pending > 0 ? `${stats.eligibility.pending}` : undefined,
        icon: <Shield className="size-5" />,
      },
      {
        title: 'Active Authorizations',
        value: stats.authorizations.active.toString(),
        subtitle: stats.authorizations.expiring > 0 ? `${stats.authorizations.expiring} expiring` : undefined,
        trend: stats.authorizations.expiring > 0 ? 'down' as const : 'neutral' as const,
        trendValue: stats.authorizations.expiring > 0 ? `${stats.authorizations.expiring}` : undefined,
        icon: <FileCheck className="size-5" />,
      },
      {
        title: 'Claims Submitted',
        value: stats.claims.submitted.toString(),
        subtitle: `${Math.round((stats.claims.accepted / stats.claims.submitted) * 100)}% accepted`,
        trend: 'up' as const,
        trendValue: `${Math.round((stats.claims.accepted / stats.claims.submitted) * 100)}%`,
        icon: <Send className="size-5" />,
      },
      {
        title: 'Total Paid',
        value: formatCurrency(stats.claims.totalPaid),
        subtitle: `${formatCurrency(stats.claims.totalBilled)} billed`,
        trend: 'up' as const,
        trendValue: formatCurrency(stats.claims.totalPaid),
        icon: <DollarSign className="size-5" />,
      },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading payer integration dashboard..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error || 'Failed to load dashboard'}</p>
            <Button onClick={loadStats} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const integrationColor = 
    stats.integration.status === 'connected' ? 'bg-green-50 text-green-700 border-green-200' :
    stats.integration.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
    'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payer Integration Hub</h2>
          <p className="text-sm text-gray-600 mt-1">
            Centralized management for eligibility, authorizations, claims, and ERA processing
          </p>
        </div>
        <Button variant="outline" onClick={() => onNavigate('config')}>
          <Building2 className="size-4 mr-2" />
          Configuration
        </Button>
      </div>

      {/* Integration Status */}
      <Card className={cn('border-2', integrationColor)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-2 h-2 rounded-full animate-pulse',
                stats.integration.status === 'connected' ? 'bg-green-500' :
                stats.integration.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
              )} />
              <div>
                <p className="font-semibold">
                  {stats.integration.status === 'connected' ? 'Connected to ' : 'Clearinghouse: '}
                  {stats.integration.clearinghouse}
                </p>
                <p className="text-xs opacity-75 mt-0.5">
                  {stats.integration.payersConnected} payers connected • Last sync:{' '}
                  {new Date(stats.integration.lastSync).toLocaleString()}
                </p>
              </div>
            </div>
            {stats.integration.status !== 'connected' && (
              <Button size="sm" variant="outline" onClick={() => onNavigate('config')}>
                Configure
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} {...metric} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <QuickActionCard
            title="Verify Eligibility"
            description="Check patient insurance coverage and benefits"
            icon={Shield}
            color="bg-blue-500"
            onClick={() => onNavigate('eligibility')}
            badge={stats.eligibility.pending > 0 ? {
              text: `${stats.eligibility.pending} pending`,
              variant: 'warning'
            } : undefined}
          />
          <QuickActionCard
            title="Authorization Requests"
            description="Submit and track prior authorization requests"
            icon={FileCheck}
            color="bg-green-500"
            onClick={() => onNavigate('authorizations')}
            badge={stats.authorizations.expiring > 0 ? {
              text: `${stats.authorizations.expiring} expiring`,
              variant: 'destructive'
            } : undefined}
          />
          <QuickActionCard
            title="Submit Claims"
            description="Create and submit claims to payers"
            icon={Send}
            color="bg-purple-500"
            onClick={() => onNavigate('claims')}
            badge={stats.claims.rejected > 0 ? {
              text: `${stats.claims.rejected} rejected`,
              variant: 'destructive'
            } : undefined}
          />
          <QuickActionCard
            title="Process ERA"
            description="Import and process electronic remittance advice"
            icon={DollarSign}
            color="bg-emerald-500"
            onClick={() => onNavigate('era')}
            badge={stats.era.pending > 0 ? {
              text: `${stats.era.pending} pending`,
              variant: 'warning'
            } : undefined}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="size-5 text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Eligibility verified for 12 patients</p>
                <p className="text-xs text-gray-600">{stats.eligibility.lastVerified}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Send className="size-5 text-purple-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{stats.claims.submitted} claims submitted this week</p>
                <p className="text-xs text-gray-600">{formatCurrency(stats.claims.totalBilled)} total billed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <DollarSign className="size-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">ERA processed - {formatCurrency(stats.era.totalRemitted)}</p>
                <p className="text-xs text-gray-600">{stats.era.lastProcessed}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Tools */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                <FileCode className="size-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">X12 EDI Testing & Development</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Parse, validate, and generate X12 EDI transactions (270/271, 835, 276/277, 837)
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/payer-integration/x12-testing'}
              className="bg-white"
            >
              <FileCode className="size-4 mr-2" />
              Open X12 Testing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});