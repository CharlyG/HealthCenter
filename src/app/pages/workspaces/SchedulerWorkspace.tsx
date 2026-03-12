/**
 * Role-Specific Workspace: Scheduler / Care Coordinator
 * 5-ZONE DESIGN:
 * 1. Critical Issues - Open shifts, delayed visits, EVV errors
 * 2. Today's Work - Today's visits, scheduling tasks
 * 3. Resume Work - Recent schedules, recent patients
 * 4. Quick Actions - Schedule visit, post shift, assign clinician
 * 5. Operational Insights - Visit metrics, staffing levels
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  WorkspaceZone,
  CriticalIssuesZone,
  TodaysWorkZone,
  ResumeWorkZone,
  QuickActionsZone,
  OperationalInsightsZone,
} from '../../components/workspace/WorkspaceZones';
import {
  Calendar,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  CalendarPlus,
  MapPin,
  FileText,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { supabase, publicAnonKey, API_BASE } from '../../lib/supabaseClient';
import { WorkspaceAlertQueue } from '../../components/alerts/WorkspaceAlertQueue';

interface ScheduleStats {
  totalToday: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  missed: number;
  openShifts: number;
  evvErrors: number;
}

export default function SchedulerWorkspace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ScheduleStats>({
    totalToday: 0, scheduled: 0, inProgress: 0, completed: 0,
    missed: 0, openShifts: 0, evvErrors: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || publicAnonKey;
        const res = await fetch(`${API_BASE}/visits/stats`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          setStats(json.stats || {});
        }
      } catch (err) {
        console.error('[SchedulerWorkspace] Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-12 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // ============= ZONE 1: Critical Issues =============
  const criticalIssues = [
    {
      id: '1',
      title: 'Open Shifts - Unfilled',
      description: `${stats.openShifts} shift${stats.openShifts !== 1 ? 's' : ''} still need clinician assignment`,
      severity: (stats.openShifts > 0 ? 'critical' : 'medium') as const,
      category: 'Staffing',
      count: stats.openShifts,
      onClick: () => navigate('/scheduling?view=open-shifts'),
    },
    {
      id: '2',
      title: 'Delayed / Missed Visits',
      description: `${stats.missed} visit${stats.missed !== 1 ? 's' : ''} missed or running late`,
      severity: (stats.missed > 0 ? 'high' : 'medium') as const,
      category: 'Visit Status',
      count: stats.missed,
      onClick: () => navigate('/poc/monitor?filter=delayed'),
    },
    {
      id: '3',
      title: 'EVV Errors',
      description: `${stats.evvErrors} visit${stats.evvErrors !== 1 ? 's' : ''} have EVV clock-in/clock-out issues`,
      severity: (stats.evvErrors > 0 ? 'high' : 'medium') as const,
      category: 'EVV',
      count: stats.evvErrors,
      onClick: () => navigate('/poc/monitor?filter=evv-errors'),
    },
  ];

  // ============= ZONE 2: Today's Work =============
  const todaysWork = [
    {
      id: '1',
      title: `${stats.totalToday} Visit${stats.totalToday !== 1 ? 's' : ''} Scheduled for Today`,
      subtitle: `${stats.completed} completed · ${stats.inProgress} in progress · ${stats.scheduled} pending`,
      time: 'Ongoing',
      status: 'in_progress' as const,
      icon: <Calendar className="size-5 text-blue-600" />,
      labels: [
        { text: `${stats.inProgress} In Progress`, variant: 'warning' as const },
        { text: `${stats.completed} Completed`, variant: 'success' as const },
      ],
      onClick: () => navigate('/scheduling?date=today'),
    },
    {
      id: '2',
      title: `Assign ${stats.openShifts} Open Shift${stats.openShifts !== 1 ? 's' : ''}`,
      subtitle: 'Open shifts need clinician assignment',
      status: 'scheduled' as const,
      icon: <Users className="size-5 text-orange-600" />,
      labels: stats.openShifts > 0 ? [{ text: 'Urgent', variant: 'destructive' as const }] : [],
      onClick: () => navigate('/scheduling?view=open-shifts'),
    },
    {
      id: '3',
      title: 'Weekly Schedule Review - Next Week',
      subtitle: 'Review and approve 240 visits for March 13-19',
      status: 'scheduled' as const,
      icon: <FileText className="size-5 text-purple-600" />,
      labels: [{ text: 'Due Today', variant: 'warning' as const }],
      onClick: () => navigate('/scheduling?view=weekly'),
    },
  ];

  // ============= ZONE 3: Resume Work =============
  const recentItems = [
    {
      id: '1',
      title: 'Johnson, Mary - Visit Schedule',
      subtitle: 'RN visits 3x/week',
      lastAccessed: '30 minutes ago',
      icon: <Calendar className="size-5 text-blue-600" />,
      onClick: () => navigate('/patient/patient-001/chart'),
    },
    {
      id: '2',
      title: 'Williams, Robert - PT Schedule',
      subtitle: 'PT 2x/week, OT 1x/week',
      lastAccessed: '1 hour ago',
      icon: <MapPin className="size-5 text-green-600" />,
      onClick: () => navigate('/patient/patient-002/chart'),
    },
    {
      id: '3',
      title: 'Open Shifts - Week of 3/13',
      subtitle: '15 unfilled positions',
      lastAccessed: '2 hours ago',
      icon: <Users className="size-5 text-orange-600" />,
      onClick: () => navigate('/scheduling?week=2024-03-13'),
    },
    {
      id: '4',
      title: 'Route Optimization - Downtown',
      subtitle: 'Optimized 12 visits',
      lastAccessed: 'Yesterday',
      icon: <MapPin className="size-5 text-purple-600" />,
      onClick: () => navigate('/scheduling?action=route'),
    },
  ];

  // ============= ZONE 4: Quick Actions =============
  const quickActions = [
    {
      id: '1',
      label: 'Schedule Visit',
      icon: <CalendarPlus className="size-5" />,
      onClick: () => navigate('/scheduling?action=create'),
    },
    {
      id: '2',
      label: 'Post Open Shift',
      icon: <Users className="size-5" />,
      onClick: () => navigate('/scheduling?action=post-shift'),
    },
    {
      id: '3',
      label: 'Assign Clinician',
      icon: <UserPlus className="size-5" />,
      onClick: () => navigate('/scheduling?action=assign'),
    },
    {
      id: '4',
      label: 'View Route Map',
      icon: <MapPin className="size-5" />,
      onClick: () => navigate('/scheduling?view=map'),
    },
    {
      id: '5',
      label: 'Open EVV Monitor',
      icon: <Wifi className="size-5" />,
      onClick: () => navigate('/poc/monitor'),
    },
    {
      id: '6',
      label: 'Weekly Calendar',
      icon: <Calendar className="size-5" />,
      onClick: () => navigate('/scheduling?view=week'),
    },
  ];

  // ============= ZONE 5: Operational Insights =============
  const metrics = [
    {
      id: '1',
      label: 'Visits Today',
      value: stats.totalToday,
      subtitle: `${stats.completed} completed`,
      variant: 'default' as const,
      icon: <Calendar className="size-4" />,
      onClick: () => navigate('/scheduling?date=today'),
    },
    {
      id: '2',
      label: 'Open Shifts',
      value: stats.openShifts,
      variant: 'danger' as const,
      icon: <AlertCircle className="size-4" />,
      onClick: () => navigate('/scheduling?view=open-shifts'),
    },
    {
      id: '3',
      label: 'EVV Errors',
      value: stats.evvErrors,
      variant: 'warning' as const,
      icon: <WifiOff className="size-4" />,
      onClick: () => navigate('/poc/monitor?filter=evv'),
    },
    {
      id: '4',
      label: 'Clinicians Active',
      value: 28,
      subtitle: 'Of 35 total',
      variant: 'success' as const,
      icon: <Users className="size-4" />,
    },
  ];

  return (
    <div className="size-full bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="size-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scheduling & Coordination</h1>
              <p className="text-gray-600">
                {stats.totalToday} visits today · {stats.openShifts} open shifts · {stats.evvErrors} EVV issues
              </p>
            </div>
          </div>
        </div>

        {/* ZONE 1: Critical Issues */}
        <WorkspaceZone
          title="🚨 Critical Issues"
          description="Urgent scheduling and staffing problems"
        >
          <WorkspaceAlertQueue
            categories={['visit', 'evv']}
            title="Scheduling & EVV Alerts"
            maxVisible={3}
            className="mb-4"
          />
          <CriticalIssuesZone issues={criticalIssues} />
        </WorkspaceZone>

        {/* ZONE 2: Today's Work */}
        <WorkspaceZone
          title="📅 Today's Work"
          description="Today's visits and scheduling tasks"
        >
          <TodaysWorkZone items={todaysWork} />
        </WorkspaceZone>

        {/* ZONE 3: Resume Work */}
        <WorkspaceZone
          title="🔄 Resume Work"
          description="Recently accessed schedules and routes"
        >
          <ResumeWorkZone items={recentItems} />
        </WorkspaceZone>

        {/* ZONE 4: Quick Actions */}
        <WorkspaceZone title="⚡ Quick Actions" description="Common scheduling tasks">
          <QuickActionsZone actions={quickActions} />
        </WorkspaceZone>

        {/* ZONE 5: Operational Insights */}
        <WorkspaceZone title="📊 Operational Insights" description="Scheduling metrics">
          <OperationalInsightsZone metrics={metrics} />
        </WorkspaceZone>
      </div>
    </div>
  );
}