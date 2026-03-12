/**
 * Caregiver Dashboard for Clinicians
 * 
 * Daily workflow dashboard for caregivers in home health and hospice care.
 * 
 * Layout Zones:
 * 1. Today's Visits - Chronological schedule with quick actions
 * 2. Documentation Tasks - Visits requiring documentation completion
 * 3. Alerts - Critical notifications for the caregiver
 * 4. Quick Access - Shortcuts to frequently used resources
 * 
 * Features:
 * - Mobile-optimized interface
 * - Real-time visit status updates
 * - One-tap actions for common tasks
 * - Offline-capable documentation
 * - Route optimization view
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle,
  Eye,
  Edit,
  Navigation,
  Phone,
  AlertTriangle,
  Bell,
  ClipboardList,
  Home,
  Heart,
  ChevronRight,
  Info,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PageHeader } from '../design-system/PageLayout';

// ==================== TYPE DEFINITIONS ====================

export type VisitStatus = 
  | 'scheduled'       // Not started yet
  | 'in_progress'     // Currently in progress
  | 'completed'       // Visit finished
  | 'delayed'         // Past scheduled time
  | 'cancelled';      // Visit cancelled

export type DocumentationStatus =
  | 'incomplete'      // Not yet submitted
  | 'submitted'       // Submitted for review
  | 'approved'        // QA approved
  | 'returned';       // Returned for correction

export type AlertType =
  | 'delayed_visit'
  | 'missing_documentation'
  | 'patient_update'
  | 'schedule_change'
  | 'authorization_issue';

export interface Visit {
  id: string;
  patient_id: string;
  patient_name: string;
  scheduled_time: string;
  scheduled_end_time: string;
  discipline: string;
  service_type: string;
  address: string;
  city: string;
  zip_code: string;
  phone: string;
  status: VisitStatus;
  documentation_status: DocumentationStatus;
  special_instructions?: string;
  diagnosis_primary: string;
  has_alert: boolean;
  drive_time_minutes?: number;
  distance_miles?: number;
}

export interface DocumentationTask {
  id: string;
  visit_id: string;
  patient_name: string;
  visit_date: string;
  service_type: string;
  status: DocumentationStatus;
  due_date: string;
  days_overdue?: number;
  return_reason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CaregiverAlert {
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  actionable: boolean;
  action_url?: string;
}

export interface QuickAccessItem {
  id: string;
  type: 'patient' | 'visit' | 'draft';
  title: string;
  subtitle: string;
  timestamp: string;
  url: string;
}

// ==================== STATUS BADGES ====================

interface VisitStatusBadgeProps {
  status: VisitStatus;
}

function VisitStatusBadge({ status }: VisitStatusBadgeProps) {
  const configs = {
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-green-100 text-green-700', icon: PlayCircle },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle2 },
    delayed: { label: 'Delayed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', icon: XCircle },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} gap-1`}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

interface DocumentationStatusBadgeProps {
  status: DocumentationStatus;
}

function DocumentationStatusBadge({ status }: DocumentationStatusBadgeProps) {
  const configs = {
    incomplete: { label: 'Incomplete', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    returned: { label: 'Returned', color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} gap-1 text-xs`}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

// ==================== TODAY'S VISITS SECTION ====================

interface TodaysVisitsSectionProps {
  visits: Visit[];
  onStartVisit: (visit: Visit) => void;
  onViewPatient: (visit: Visit) => void;
  onViewNotes: (visit: Visit) => void;
}

function TodaysVisitsSection({ visits, onStartVisit, onViewPatient, onViewNotes }: TodaysVisitsSectionProps) {
  const sortedVisits = useMemo(() => {
    return [...visits].sort((a, b) => 
      new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
    );
  }, [visits]);

  const now = new Date();
  const upcomingVisits = sortedVisits.filter(v => new Date(v.scheduled_time) > now && v.status === 'scheduled');
  const inProgressVisits = sortedVisits.filter(v => v.status === 'in_progress');
  const completedVisits = sortedVisits.filter(v => v.status === 'completed');
  const delayedVisits = sortedVisits.filter(v => v.status === 'delayed');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="size-5 text-blue-600" />
            Today's Visits
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {visits.length} total • {completedVisits.length} completed • {upcomingVisits.length} upcoming
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="size-3" />
          Live
        </Badge>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-4">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingVisits.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressVisits.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedVisits.length})
          </TabsTrigger>
          {delayedVisits.length > 0 && (
            <TabsTrigger value="delayed" className="text-red-600">
              Delayed ({delayedVisits.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingVisits.length === 0 ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="size-12 text-green-600 mx-auto mb-3" />
                <p className="font-semibold text-green-900">No upcoming visits</p>
                <p className="text-sm text-green-800 mt-1">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            upcomingVisits.map((visit, index) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                showRoute={index === 0}
                onStartVisit={onStartVisit}
                onViewPatient={onViewPatient}
                onViewNotes={onViewNotes}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-3">
          {inProgressVisits.length === 0 ? (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-6 text-center">
                <Info className="size-12 text-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">No visits in progress</p>
                <p className="text-sm text-gray-600 mt-1">Start your next visit when ready</p>
              </CardContent>
            </Card>
          ) : (
            inProgressVisits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onStartVisit={onStartVisit}
                onViewPatient={onViewPatient}
                onViewNotes={onViewNotes}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completedVisits.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              onStartVisit={onStartVisit}
              onViewPatient={onViewPatient}
              onViewNotes={onViewNotes}
            />
          ))}
        </TabsContent>

        {delayedVisits.length > 0 && (
          <TabsContent value="delayed" className="space-y-3">
            {delayedVisits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onStartVisit={onStartVisit}
                onViewPatient={onViewPatient}
                onViewNotes={onViewNotes}
              />
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ==================== VISIT CARD ====================

interface VisitCardProps {
  visit: Visit;
  showRoute?: boolean;
  onStartVisit: (visit: Visit) => void;
  onViewPatient: (visit: Visit) => void;
  onViewNotes: (visit: Visit) => void;
}

function VisitCard({ visit, showRoute, onStartVisit, onViewPatient, onViewNotes }: VisitCardProps) {
  const startTime = new Date(visit.scheduled_time).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });
  const endTime = new Date(visit.scheduled_end_time).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  const disciplineColors: Record<string, string> = {
    RN: 'text-blue-600',
    LPN: 'text-purple-600',
    PT: 'text-green-600',
    OT: 'text-orange-600',
    ST: 'text-pink-600',
    HHA: 'text-cyan-600',
  };

  return (
    <Card className={`border-2 ${visit.has_alert ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className={`size-5 ${disciplineColors[visit.discipline] || 'text-gray-600'}`} />
              <h3 className="font-semibold text-gray-900">{visit.patient_name}</h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {startTime} - {endTime}
              </span>
              <Badge variant="outline" className={disciplineColors[visit.discipline]}>
                {visit.discipline}
              </Badge>
            </div>
          </div>
          <VisitStatusBadge status={visit.status} />
        </div>

        {/* Service Type */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">{visit.service_type}</p>
          <p className="text-xs text-gray-600">{visit.diagnosis_primary}</p>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-3 p-2 bg-gray-50 rounded">
          <MapPin className="size-4 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="text-gray-900">{visit.address}</p>
            <p className="text-gray-600">{visit.city}, {visit.zip_code}</p>
            {visit.drive_time_minutes && (
              <p className="text-xs text-gray-600 mt-1">
                🚗 {visit.drive_time_minutes} min • {visit.distance_miles} miles
              </p>
            )}
          </div>
          {showRoute && (
            <Button size="sm" variant="outline" className="gap-1 flex-shrink-0">
              <Navigation className="size-4" />
              Route
            </Button>
          )}
        </div>

        {/* Special Instructions */}
        {visit.special_instructions && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Special Instructions:</p>
            <p className="text-xs text-amber-800">{visit.special_instructions}</p>
          </div>
        )}

        {/* Documentation Status */}
        {visit.status === 'completed' && (
          <div className="mb-3">
            <DocumentationStatusBadge status={visit.documentation_status} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {visit.status === 'scheduled' && (
            <Button 
              size="sm" 
              className="flex-1 gap-2"
              onClick={() => onStartVisit(visit)}
            >
              <PlayCircle className="size-4" />
              Start Visit
            </Button>
          )}
          {visit.status === 'in_progress' && (
            <Button 
              size="sm" 
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => onViewNotes(visit)}
            >
              <Edit className="size-4" />
              Document Visit
            </Button>
          )}
          {visit.status === 'completed' && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onViewNotes(visit)}
            >
              <FileText className="size-4" />
              View Notes
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onViewPatient(visit)}
          >
            <Eye className="size-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open(`tel:${visit.phone}`)}
          >
            <Phone className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== DOCUMENTATION TASKS SECTION ====================

interface DocumentationTasksSectionProps {
  tasks: DocumentationTask[];
  onCompleteDocumentation: (task: DocumentationTask) => void;
}

function DocumentationTasksSection({ tasks, onCompleteDocumentation }: DocumentationTasksSectionProps) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Sort by priority, then by days overdue
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return (b.days_overdue || 0) - (a.days_overdue || 0);
    });
  }, [tasks]);

  const incompleteCount = tasks.filter(t => t.status === 'incomplete').length;
  const returnedCount = tasks.filter(t => t.status === 'returned').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="size-5 text-purple-600" />
            Documentation Tasks
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {incompleteCount} incomplete • {returnedCount} returned for correction
          </p>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="size-12 text-green-600 mx-auto mb-3" />
            <p className="font-semibold text-green-900">All caught up!</p>
            <p className="text-sm text-green-800 mt-1">No pending documentation</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <DocumentationTaskCard
              key={task.id}
              task={task}
              onComplete={onCompleteDocumentation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== DOCUMENTATION TASK CARD ====================

interface DocumentationTaskCardProps {
  task: DocumentationTask;
  onComplete: (task: DocumentationTask) => void;
}

function DocumentationTaskCard({ task, onComplete }: DocumentationTaskCardProps) {
  const priorityColors = {
    urgent: 'border-red-300 bg-red-50',
    high: 'border-orange-300 bg-orange-50',
    medium: 'border-amber-300 bg-amber-50',
    low: 'border-gray-300 bg-gray-50',
  };

  return (
    <Card className={`border-2 ${priorityColors[task.priority]}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{task.patient_name}</h4>
            <p className="text-sm text-gray-600">{task.service_type}</p>
            <p className="text-xs text-gray-600 mt-1">
              Visit: {new Date(task.visit_date).toLocaleDateString()}
            </p>
          </div>
          <DocumentationStatusBadge status={task.status} />
        </div>

        {task.days_overdue && task.days_overdue > 0 && (
          <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded">
            <p className="text-xs font-semibold text-red-900">
              ⚠️ {task.days_overdue} days overdue
            </p>
          </div>
        )}

        {task.return_reason && (
          <div className="mb-3 p-2 bg-amber-100 border border-amber-200 rounded">
            <p className="text-xs font-semibold text-amber-900 mb-1">Returned for correction:</p>
            <p className="text-xs text-amber-800">{task.return_reason}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => onComplete(task)}
          >
            <Edit className="size-4" />
            {task.status === 'returned' ? 'Correct & Resubmit' : 'Complete Documentation'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== ALERTS SECTION ====================

interface AlertsSectionProps {
  alerts: CaregiverAlert[];
  onDismissAlert: (alertId: string) => void;
  onViewAlert: (alert: CaregiverAlert) => void;
}

function AlertsSection({ alerts, onDismissAlert, onViewAlert }: AlertsSectionProps) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="size-5 text-red-600" />
            Alerts
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {criticalAlerts.length} critical • {warningAlerts.length} warnings
          </p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="size-12 text-green-600 mx-auto mb-3" />
            <p className="font-semibold text-green-900">No alerts</p>
            <p className="text-sm text-green-800 mt-1">Everything looks good!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={onDismissAlert}
              onView={onViewAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== ALERT CARD ====================

interface AlertCardProps {
  alert: CaregiverAlert;
  onDismiss: (alertId: string) => void;
  onView: (alert: CaregiverAlert) => void;
}

function AlertCard({ alert, onDismiss, onView }: AlertCardProps) {
  const severityConfig = {
    critical: {
      color: 'border-red-300 bg-red-50 text-red-900',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
    },
    warning: {
      color: 'border-orange-300 bg-orange-50 text-orange-900',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
    },
    info: {
      color: 'border-blue-300 bg-blue-50 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <Card className={`border-2 ${config.color}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`size-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
            <p className="text-xs mb-2">{alert.message}</p>
            <p className="text-xs opacity-70">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        {alert.actionable && (
          <div className="flex items-center gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => onView(alert)}
            >
              View Details
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => onDismiss(alert.id)}
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== QUICK ACCESS SECTION ====================

interface QuickAccessSectionProps {
  items: QuickAccessItem[];
  onNavigate: (url: string) => void;
}

function QuickAccessSection({ items, onNavigate }: QuickAccessSectionProps) {
  const recentPatients = items.filter(i => i.type === 'patient').slice(0, 3);
  const recentVisits = items.filter(i => i.type === 'visit').slice(0, 3);
  const drafts = items.filter(i => i.type === 'draft');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="size-5 text-green-600" />
          Quick Access
        </h2>
      </div>

      <Tabs defaultValue="patients" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="patients">
            Recent Patients
          </TabsTrigger>
          <TabsTrigger value="visits">
            Recent Visits
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({drafts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-2">
          {recentPatients.map((item) => (
            <QuickAccessCard key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </TabsContent>

        <TabsContent value="visits" className="space-y-2">
          {recentVisits.map((item) => (
            <QuickAccessCard key={item.id} item={item} onNavigate={onNavigate} />
          ))}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-2">
          {drafts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Info className="size-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No saved drafts</p>
              </CardContent>
            </Card>
          ) : (
            drafts.map((item) => (
              <QuickAccessCard key={item.id} item={item} onNavigate={onNavigate} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ==================== QUICK ACCESS CARD ====================

interface QuickAccessCardProps {
  item: QuickAccessItem;
  onNavigate: (url: string) => void;
}

function QuickAccessCard({ item, onNavigate }: QuickAccessCardProps) {
  const iconMap = {
    patient: User,
    visit: Calendar,
    draft: FileText,
  };

  const Icon = iconMap[item.type];

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all border-2 border-gray-200 hover:border-blue-300"
      onClick={() => onNavigate(item.url)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="size-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900">{item.title}</h4>
            <p className="text-xs text-gray-600">{item.subtitle}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
          <ChevronRight className="size-5 text-gray-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== MAIN CAREGIVER DASHBOARD ====================

interface CaregiverDashboardProps {
  caregiverId?: string;
  caregiverName?: string;
  initialData?: {
    visits?: Visit[];
    tasks?: DocumentationTask[];
    alerts?: CaregiverAlert[];
    quickAccess?: QuickAccessItem[];
  };
}

export default function CaregiverDashboard({ 
  caregiverId = 'CG-001',
  caregiverName = 'Sarah Chen, RN',
  initialData 
}: CaregiverDashboardProps) {
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const visits = initialData?.visits || generateMockVisits();
  const tasks = initialData?.tasks || generateMockTasks();
  const alerts = initialData?.alerts || generateMockAlerts();
  const quickAccess = initialData?.quickAccess || generateMockQuickAccess();

  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  const handleStartVisit = (visit: Visit) => {
    console.log('Starting visit:', visit.id);
    navigate(`/poc/visit/${visit.id}`);
  };

  const handleViewPatient = (visit: Visit) => {
    navigate(`/patient/${visit.patient_id}/chart`);
  };

  const handleViewNotes = (visit: Visit) => {
    navigate(`/clinical/visit-notes?visit=${visit.id}`);
  };

  const handleCompleteDocumentation = (task: DocumentationTask) => {
    navigate(`/clinical/visit-notes?visit=${task.visit_id}`);
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const handleViewAlert = (alert: CaregiverAlert) => {
    if (alert.action_url) {
      navigate(alert.action_url);
    }
  };

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  const completedToday = visits.filter(v => v.status === 'completed').length;
  const totalToday = visits.length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Stethoscope className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {caregiverName.split(',')[0]}!</h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Today's Progress</span>
                <span className="text-sm font-semibold text-gray-900">{completedToday} / {totalToday} visits</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{progressPercent}% complete</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Visits */}
          <div className="lg:col-span-2 space-y-6">
            <TodaysVisitsSection
              visits={visits}
              onStartVisit={handleStartVisit}
              onViewPatient={handleViewPatient}
              onViewNotes={handleViewNotes}
            />
          </div>

          {/* Right Column - Tasks, Alerts, Quick Access */}
          <div className="space-y-6">
            <DocumentationTasksSection
              tasks={tasks}
              onCompleteDocumentation={handleCompleteDocumentation}
            />

            <AlertsSection
              alerts={activeAlerts}
              onDismissAlert={handleDismissAlert}
              onViewAlert={handleViewAlert}
            />

            <QuickAccessSection
              items={quickAccess}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MOCK DATA GENERATORS ====================

function generateMockVisits(): Visit[] {
  const now = new Date();
  const visits: Visit[] = [
    {
      id: 'VST-001',
      patient_id: 'PAT-001',
      patient_name: 'Mary Johnson',
      scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0).toISOString(),
      scheduled_end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
      discipline: 'RN',
      service_type: 'Skilled Nursing Visit',
      address: '1234 Oak Street',
      city: 'Springfield',
      zip_code: '12345',
      phone: '555-0101',
      status: 'completed',
      documentation_status: 'submitted',
      diagnosis_primary: 'Congestive Heart Failure',
      has_alert: false,
      drive_time_minutes: 15,
      distance_miles: 8.2,
    },
    {
      id: 'VST-002',
      patient_id: 'PAT-002',
      patient_name: 'Robert Smith',
      scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(),
      scheduled_end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0).toISOString(),
      discipline: 'RN',
      service_type: 'Wound Care',
      address: '5678 Maple Avenue',
      city: 'Springfield',
      zip_code: '12346',
      phone: '555-0102',
      status: 'in_progress',
      documentation_status: 'incomplete',
      diagnosis_primary: 'Diabetic Foot Ulcer',
      has_alert: false,
      special_instructions: 'Patient has aggressive dog - call before entering',
      drive_time_minutes: 12,
      distance_miles: 6.5,
    },
    {
      id: 'VST-003',
      patient_id: 'PAT-003',
      patient_name: 'Patricia Williams',
      scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30).toISOString(),
      scheduled_end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30).toISOString(),
      discipline: 'RN',
      service_type: 'Medication Management',
      address: '9012 Pine Road',
      city: 'Springfield',
      zip_code: '12347',
      phone: '555-0103',
      status: 'scheduled',
      documentation_status: 'incomplete',
      diagnosis_primary: 'Hypertension',
      has_alert: false,
      drive_time_minutes: 18,
      distance_miles: 10.3,
    },
    {
      id: 'VST-004',
      patient_id: 'PAT-004',
      patient_name: 'Michael Brown',
      scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30).toISOString(),
      scheduled_end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30).toISOString(),
      discipline: 'RN',
      service_type: 'OASIS Assessment',
      address: '3456 Elm Street',
      city: 'Springfield',
      zip_code: '12348',
      phone: '555-0104',
      status: 'scheduled',
      documentation_status: 'incomplete',
      diagnosis_primary: 'Post-Stroke Care',
      has_alert: true,
      special_instructions: 'New patient - SOC visit',
      drive_time_minutes: 20,
      distance_miles: 11.8,
    },
    {
      id: 'VST-005',
      patient_id: 'PAT-005',
      patient_name: 'Linda Davis',
      scheduled_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0).toISOString(),
      scheduled_end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0).toISOString(),
      discipline: 'RN',
      service_type: 'Skilled Nursing Visit',
      address: '7890 Cedar Lane',
      city: 'Springfield',
      zip_code: '12349',
      phone: '555-0105',
      status: 'scheduled',
      documentation_status: 'incomplete',
      diagnosis_primary: 'COPD',
      has_alert: false,
      drive_time_minutes: 14,
      distance_miles: 7.6,
    },
  ];

  return visits;
}

function generateMockTasks(): DocumentationTask[] {
  return [
    {
      id: 'TASK-001',
      visit_id: 'VST-006',
      patient_name: 'John Anderson',
      visit_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      service_type: 'Skilled Nursing Visit',
      status: 'incomplete',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      days_overdue: 1,
      priority: 'urgent',
    },
    {
      id: 'TASK-002',
      visit_id: 'VST-007',
      patient_name: 'Susan Martinez',
      visit_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      service_type: 'Wound Care',
      status: 'returned',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      return_reason: 'Missing vital signs and wound measurements',
      priority: 'high',
    },
    {
      id: 'TASK-003',
      visit_id: 'VST-001',
      patient_name: 'Mary Johnson',
      visit_date: new Date().toISOString(),
      service_type: 'Skilled Nursing Visit',
      status: 'submitted',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
    },
  ];
}

function generateMockAlerts(): CaregiverAlert[] {
  return [
    {
      id: 'ALERT-001',
      type: 'patient_update',
      severity: 'critical',
      title: 'Patient Condition Change',
      message: 'Michael Brown reported increased shortness of breath. Consider assessment priority.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      actionable: true,
      action_url: '/patient/PAT-004/chart',
    },
    {
      id: 'ALERT-002',
      type: 'missing_documentation',
      severity: 'warning',
      title: 'Documentation Overdue',
      message: 'Visit note for John Anderson is 1 day overdue. Please complete ASAP.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actionable: true,
      action_url: '/clinical/visit-notes?visit=VST-006',
    },
    {
      id: 'ALERT-003',
      type: 'schedule_change',
      severity: 'info',
      title: 'Schedule Update',
      message: 'Tomorrow\'s 9:00 AM visit with James Wilson has been rescheduled to 10:30 AM.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      actionable: false,
    },
  ];
}

function generateMockQuickAccess(): QuickAccessItem[] {
  return [
    {
      id: 'QA-001',
      type: 'patient',
      title: 'Mary Johnson',
      subtitle: 'Congestive Heart Failure',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url: '/patient/PAT-001/chart',
    },
    {
      id: 'QA-002',
      type: 'patient',
      title: 'Robert Smith',
      subtitle: 'Diabetic Foot Ulcer',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      url: '/patient/PAT-002/chart',
    },
    {
      id: 'QA-003',
      type: 'patient',
      title: 'Patricia Williams',
      subtitle: 'Hypertension',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      url: '/patient/PAT-003/chart',
    },
    {
      id: 'QA-004',
      type: 'visit',
      title: 'Mary Johnson - Skilled Nursing',
      subtitle: 'Completed today at 8:00 AM',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      url: '/poc/visit/VST-001',
    },
    {
      id: 'QA-005',
      type: 'draft',
      title: 'John Anderson Visit Note',
      subtitle: 'Draft saved yesterday',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      url: '/clinical/visit-notes?visit=VST-006&draft=true',
    },
  ];
}
