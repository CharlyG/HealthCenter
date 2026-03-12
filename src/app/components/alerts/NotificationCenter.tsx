/**
 * NotificationCenter Component
 * Slide-out panel triggered from the top bar notification bell.
 * Shows all alerts grouped by severity with filtering controls.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAlerts } from '../../context/AlertContext';
import { AlertCard } from './AlertCard';
import { AlertBadge } from './AlertBadge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Bell,
  Filter,
  RefreshCw,
  CheckCheck,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';
import type { ClinicalAlert, AlertSeverity } from '../../lib/alertTypes';

// ─── Severity Filter Buttons ────────────────────────────────────────────────

const SEVERITY_FILTERS: Array<{
  value: AlertSeverity | 'all';
  label: string;
  icon: React.ElementType;
}> = [
  { value: 'all', label: 'All', icon: Bell },
  { value: 'critical', label: 'Critical', icon: AlertOctagon },
  { value: 'high', label: 'High', icon: AlertTriangle },
  { value: 'warning', label: 'Warning', icon: AlertCircle },
  { value: 'info', label: 'Info', icon: Info },
];

export const NotificationCenter = React.memo(function NotificationCenter() {
  const navigate = useNavigate();
  const {
    alerts,
    counts,
    loading,
    activeAlerts,
    acknowledge,
    resolve,
    dismiss,
    refresh,
  } = useAlerts();

  const [open, setOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // ─── Filtered alerts ──────────────────────────────────────────────────
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    if (severityFilter !== 'all') {
      filtered = filtered.filter(a => a.severity === severityFilter);
    }
    return filtered;
  }, [alerts, severityFilter]);

  const openAlerts = useMemo(
    () => filteredAlerts.filter(a => a.status === 'open' || a.status === 'acknowledged'),
    [filteredAlerts]
  );

  const resolvedAlerts = useMemo(
    () => filteredAlerts.filter(a => a.status === 'resolved' || a.status === 'dismissed'),
    [filteredAlerts]
  );

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleQuickAction = useCallback((alert: ClinicalAlert) => {
    if (alert.quickAction?.route) {
      setOpen(false);
      navigate(alert.quickAction.route);
    }
  }, [navigate]);

  const handleClick = useCallback((alert: ClinicalAlert) => {
    // Navigate to patient chart if patient-specific
    if (alert.patientId) {
      setOpen(false);
      navigate(`/patient/${alert.patientId}/chart`);
    }
  }, [navigate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-1.5">
          <Bell className="size-4" />
          {counts.total > 0 && (
            <AlertBadge counts={counts} compact />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[480px] sm:w-[520px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              Notifications
              {counts.total > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {counts.total} active
                </Badge>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Severity summary */}
          <div className="flex items-center gap-3 mt-3">
            <AlertBadge counts={counts} />
            <span className="text-xs text-gray-500">
              {counts.open} open, {counts.acknowledged} acknowledged
            </span>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {SEVERITY_FILTERS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={severityFilter === value ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setSeverityFilter(value)}
              >
                <Icon className="size-3" />
                {label}
              </Button>
            ))}
          </div>
        </SheetHeader>

        {/* Tabs: Active / Resolved */}
        <Tabs defaultValue="active" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-3 grid grid-cols-2 h-9">
            <TabsTrigger value="active" className="text-xs">
              Active ({openAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">
              Resolved ({resolvedAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="px-4 py-3 space-y-3">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading alerts...</p>
                  </div>
                ) : openAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCheck className="size-12 mx-auto mb-3 text-green-500" />
                    <p className="text-sm font-medium text-gray-700">All clear!</p>
                    <p className="text-xs text-gray-500 mt-1">No active alerts to display</p>
                  </div>
                ) : (
                  openAlerts.map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onAcknowledge={acknowledge}
                      onResolve={resolve}
                      onDismiss={dismiss}
                      onQuickAction={handleQuickAction}
                      onClick={handleClick}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="resolved" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="px-4 py-3 space-y-3">
                {resolvedAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500">No resolved alerts</p>
                  </div>
                ) : (
                  resolvedAlerts.map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onClick={handleClick}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
});

export default NotificationCenter;
