/**
 * Scheduling Workspace
 * Comprehensive scheduling module with 6 views:
 *  1. Visit Board (Primary) — table-style operational board
 *  2. Calendar View — traditional calendar
 *  3. Open Shift Queue — unassigned visits
 *  4. Caregiver Availability — staff availability + conflicts
 *  5. Travel Optimization — route analysis + suggestions
 *  6. Conflict Alerts — overlapping, missing CG, auth, EVV
 *
 * Integrates Smart Scheduling Assist side panel.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus,
  Sparkles, Loader2, LayoutList, Users, AlertTriangle, Route,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { PageHeader, PageSection } from '../components/design-system/PageLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// Sub-views
import VisitBoard from '../components/scheduling/VisitBoard';
import ScheduleCalendarView from '../components/scheduling/ScheduleCalendarView';
import OpenShiftQueue from '../components/scheduling/OpenShiftQueue';
import CaregiverAvailabilityPanel from '../components/scheduling/CaregiverAvailabilityPanel';
import TravelOptimizationPanel from '../components/scheduling/TravelOptimizationPanel';
import ConflictAlerts from '../components/scheduling/ConflictAlerts';
import SmartSchedulingPanel from '../components/scheduling/SmartSchedulingPanel';

import { visitGateway } from '../lib/dataGateway';

type CalendarView = 'day' | 'week' | 'month';

interface VisitStats {
  totalToday: number;
  totalThisWeek: number;
  openShifts: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  missed: number;
  evvErrors: number;
}

const EMPTY_STATS: VisitStats = {
  totalToday: 0, totalThisWeek: 0, openShifts: 0,
  scheduled: 0, inProgress: 0, completed: 0, missed: 0, evvErrors: 0,
};

export default function SchedulingWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('board');
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [smartAssistOpen, setSmartAssistOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Live stats
  const [stats, setStats] = useState<VisitStats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const s = await visitGateway.getStats();
      setStats(prev => ({ ...prev, ...s }));
    } catch (err) {
      console.error('[SchedulingWorkspace] Stats error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats, refreshKey]);

  // Auto-refresh stats every 30s
  useEffect(() => {
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleScheduleUpdated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleNavigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const handleToday = () => setSelectedDate(new Date());

  const formatDateRange = () => {
    if (calendarView === 'day') {
      return selectedDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
    } else if (calendarView === 'week') {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const commonFilters = {
    office: 'all',
    discipline: 'all',
    clinician: 'all',
    status: 'all',
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-full mx-auto p-6">
          <PageHeader
            icon={<CalendarIcon className="size-8" />}
            title="Scheduling"
            subtitle="Manage patient visits, caregiver assignments, and routes"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant={smartAssistOpen ? 'default' : 'outline'}
                  onClick={() => setSmartAssistOpen(!smartAssistOpen)}
                  className="gap-2"
                >
                  <Sparkles className="size-4" />
                  Smart Assist
                  {smartAssistOpen && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-white/20 text-white border-0">
                      ON
                    </Badge>
                  )}
                </Button>
                <Button onClick={() => navigate('/scheduling/new')}>
                  <Plus className="size-4 mr-2" />
                  Schedule Visit
                </Button>
              </div>
            }
          />

          {/* Live Statistics */}
          <PageSection>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
              <StatCard label="Today" value={stats.totalToday} color="blue" loading={statsLoading} />
              <StatCard label="This Week" value={stats.totalThisWeek} color="green" loading={statsLoading} />
              <StatCard label="Scheduled" value={stats.scheduled} color="blue" loading={statsLoading} />
              <StatCard label="In Progress" value={stats.inProgress} color="purple" loading={statsLoading} />
              <StatCard label="Completed" value={stats.completed} color="green" loading={statsLoading} />
              <StatCard label="Missed" value={stats.missed} color="red" loading={statsLoading} alert={stats.missed > 0} />
              <StatCard label="Open Shifts" value={stats.openShifts} color="orange" loading={statsLoading} alert={stats.openShifts > 0} />
              <StatCard label="EVV Errors" value={stats.evvErrors} color="red" loading={statsLoading} alert={stats.evvErrors > 0} />
            </div>
          </PageSection>

          {/* Tabs */}
          <PageSection>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="board" className="gap-1.5">
                    <LayoutList className="size-3.5" />
                    Visit Board
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-1.5">
                    <CalendarIcon className="size-3.5" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="open-shifts" className="gap-1.5">
                    <Users className="size-3.5" />
                    Open Shifts
                    {stats.openShifts > 0 && (
                      <Badge className="ml-1 h-4 px-1 text-[9px] bg-orange-600">{stats.openShifts}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="availability" className="gap-1.5">
                    <Users className="size-3.5" />
                    Availability
                  </TabsTrigger>
                  <TabsTrigger value="travel" className="gap-1.5">
                    <Route className="size-3.5" />
                    Travel
                  </TabsTrigger>
                  <TabsTrigger value="conflicts" className="gap-1.5">
                    <AlertTriangle className="size-3.5" />
                    Conflicts
                    {stats.evvErrors > 0 && (
                      <Badge className="ml-1 h-4 px-1 text-[9px] bg-red-600">{stats.evvErrors}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Date Navigation (shown for board/calendar) */}
                {(activeTab === 'board' || activeTab === 'calendar') && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleNavigateDate('prev')}>
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleNavigateDate('next')}>
                      <ChevronRight className="size-4" />
                    </Button>
                    <div className="ml-2 text-sm font-semibold text-gray-900">
                      {formatDateRange()}
                    </div>
                    {activeTab === 'calendar' && (
                      <div className="flex items-center border rounded-lg ml-3">
                        {(['day', 'week', 'month'] as CalendarView[]).map(v => (
                          <Button
                            key={v}
                            variant={calendarView === v ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setCalendarView(v)}
                            className={v === 'day' ? 'rounded-r-none' : v === 'month' ? 'rounded-l-none' : 'rounded-none'}
                          >
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tab Content */}
              <TabsContent value="board" className="mt-0">
                <VisitBoard selectedDate={selectedDate} refreshKey={refreshKey} />
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <ScheduleCalendarView
                  view={calendarView}
                  selectedDate={selectedDate}
                  filters={commonFilters}
                  refreshKey={refreshKey}
                />
              </TabsContent>

              <TabsContent value="open-shifts" className="mt-0">
                <OpenShiftQueue />
              </TabsContent>

              <TabsContent value="availability" className="mt-0">
                <CaregiverAvailabilityPanel selectedDate={selectedDate} />
              </TabsContent>

              <TabsContent value="travel" className="mt-0">
                <TravelOptimizationPanel selectedDate={selectedDate} />
              </TabsContent>

              <TabsContent value="conflicts" className="mt-0">
                <ConflictAlerts />
              </TabsContent>
            </Tabs>
          </PageSection>
        </div>
      </div>

      {/* Smart Scheduling Side Panel */}
      {smartAssistOpen && (
        <div className="w-[360px] shrink-0 border-l border-gray-200">
          <SmartSchedulingPanel
            selectedDate={selectedDate}
            onClose={() => setSmartAssistOpen(false)}
            onScheduleUpdated={handleScheduleUpdated}
          />
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  loading: boolean;
  alert?: boolean;
}

function StatCard({ label, value, color, loading, alert }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
  };

  return (
    <Card className={alert ? 'ring-1 ring-red-200' : ''}>
      <CardContent className="pt-3 pb-2 px-3 text-center">
        {loading ? (
          <Loader2 className={`size-5 animate-spin mx-auto ${colorMap[color] || 'text-gray-500'}`} />
        ) : (
          <p className={`text-2xl font-bold ${colorMap[color] || 'text-gray-700'}`}>{value}</p>
        )}
        <p className="text-[10px] font-medium text-gray-500 mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}