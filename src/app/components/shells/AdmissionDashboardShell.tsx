/**
 * Admission / Care Episode Dashboard Shell
 * 
 * Operational control center for an active episode of care.
 * Provides comprehensive overview of admission status, clinical metrics,
 * operational tasks, and upcoming events.
 * 
 * Use Cases:
 * - Admission overview page
 * - Episode of care dashboard
 * - Case management summary
 * 
 * Performance:
 * - Memoized component
 * - Lazy-loaded timeline
 * - Real-time data refresh support
 */

import { memo, ReactNode, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  Users,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../ui/utils';
import AdmissionContextBar from '../navigation/AdmissionContextBar';

interface AdmissionInfo {
  id: string;
  startDate: string;
  status: 'active' | 'pending' | 'discharged';
  primaryPayer: string;
  disciplines: string[];
  caseManager: string;
  authorizationStatus: 'approved' | 'pending' | 'denied';
}

interface EpisodeStatus {
  daysInCare: number;
  daysRemaining?: number;
  totalAuthorizedVisits?: number;
  completedVisits: number;
  scheduledVisits: number;
  certificationPeriod: string;
  nextRecertDue?: string;
}

interface SummaryCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  icon?: ReactNode;
  onClick?: () => void;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UpcomingEvent {
  id: string;
  type: 'visit' | 'assessment' | 'recertification' | 'authorization' | 'other';
  title: string;
  date: string;
  time?: string;
  assignee?: string;
  status?: 'scheduled' | 'pending' | 'overdue';
}

interface AdmissionDashboardShellProps {
  /** Admission information */
  admission: AdmissionInfo;
  
  /** Episode status metrics */
  episodeStatus: EpisodeStatus;
  
  /** Clinical summary cards */
  clinicalSummary: SummaryCard[];
  
  /** Operational summary cards */
  operationalSummary: SummaryCard[];
  
  /** Active alerts */
  alerts?: Alert[];
  
  /** Upcoming events */
  upcomingEvents?: UpcomingEvent[];
  
  /** Timeline panel content (optional) */
  timeline?: ReactNode;
  
  /** Show timeline by default */
  timelineOpen?: boolean;
  
  /** Header actions */
  headerActions?: ReactNode;
  
  /** Refresh handler */
  onRefresh?: () => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Full width layout */
  fullWidth?: boolean;
  
  /** Available admissions for switching */
  availableAdmissions?: AdmissionInfo[];
  
  /** Admission change handler */
  onAdmissionChange?: (admissionId: string) => void;
}

const AdmissionDashboardShell = memo(function AdmissionDashboardShell({
  admission,
  episodeStatus,
  clinicalSummary,
  operationalSummary,
  alerts = [],
  upcomingEvents = [],
  timeline,
  timelineOpen: initialTimelineOpen = false,
  headerActions,
  onRefresh,
  loading = false,
  fullWidth = false,
  availableAdmissions = [],
  onAdmissionChange,
}: AdmissionDashboardShellProps) {
  const [timelineOpen, setTimelineOpen] = useState(initialTimelineOpen);
  const [alertsExpanded, setAlertsExpanded] = useState(alerts.length > 0);

  const toggleTimeline = useCallback(() => {
    setTimelineOpen(prev => !prev);
  }, []);

  const toggleAlerts = useCallback(() => {
    setAlertsExpanded(prev => !prev);
  }, []);

  // Alert type styling
  const alertStyles = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-600' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: 'text-amber-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' },
  };

  // Event type styling
  const eventTypeConfig = {
    visit: { label: 'Visit', color: 'blue' },
    assessment: { label: 'Assessment', color: 'purple' },
    recertification: { label: 'Recert', color: 'amber' },
    authorization: { label: 'Auth', color: 'green' },
    other: { label: 'Event', color: 'gray' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admission Context Bar */}
      <div className="sticky top-0 z-30">
        <AdmissionContextBar
          admission={admission}
          availableAdmissions={availableAdmissions}
          onAdmissionChange={onAdmissionChange}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        'px-6 py-6 space-y-6',
        !fullWidth && 'max-w-[1800px] mx-auto'
      )}>
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Episode Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Operational control center for this episode of care
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </Button>
            )}
            {headerActions}
          </div>
        </div>

        {/* Episode Status Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase mb-1">
                Days in Care
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {episodeStatus.daysInCare}
              </div>
              {episodeStatus.daysRemaining && (
                <div className="text-xs text-blue-700 mt-1">
                  {episodeStatus.daysRemaining} days remaining
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase mb-1">
                Visits Completed
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {episodeStatus.completedVisits}
                {episodeStatus.totalAuthorizedVisits && (
                  <span className="text-lg text-blue-700">
                    /{episodeStatus.totalAuthorizedVisits}
                  </span>
                )}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {episodeStatus.scheduledVisits} scheduled
              </div>
            </div>
            
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase mb-1">
                Certification Period
              </div>
              <div className="text-lg font-bold text-blue-900">
                {episodeStatus.certificationPeriod}
              </div>
              {episodeStatus.nextRecertDue && (
                <div className="text-xs text-blue-700 mt-1">
                  Recert due: {episodeStatus.nextRecertDue}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase mb-1">
                Overall Status
              </div>
              <Badge 
                variant={admission.status === 'active' ? 'default' : 'secondary'}
                className="text-sm px-3 py-1"
              >
                {admission.status}
              </Badge>
              <div className="text-xs text-blue-700 mt-1">
                Auth: {admission.authorizationStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg border shadow-sm">
            <button
              onClick={toggleAlerts}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Active Alerts
                </h2>
                <Badge variant="destructive">{alerts.length}</Badge>
              </div>
              {alertsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            {alertsExpanded && (
              <div className="p-4 pt-0 space-y-2">
                {alerts.map((alert) => {
                  const styles = alertStyles[alert.type];
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-3 rounded-lg border flex items-start justify-between gap-4',
                        styles.bg,
                        styles.border
                      )}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className={cn('w-4 h-4 mt-0.5', styles.icon)} />
                        <div>
                          <div className={cn('text-sm font-medium', styles.text)}>
                            {alert.message}
                          </div>
                          {alert.timestamp && (
                            <div className="text-xs text-gray-600 mt-1">
                              {alert.timestamp}
                            </div>
                          )}
                        </div>
                      </div>
                      {alert.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={alert.action.onClick}
                        >
                          {alert.action.label}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Summary Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Clinical Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Clinical Summary</h2>
            </div>
            <div className="space-y-3">
              {clinicalSummary.map((card) => (
                <SummaryCardComponent key={card.id} card={card} />
              ))}
            </div>
          </div>

          {/* Operational Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Operational Summary</h2>
            </div>
            <div className="space-y-3">
              {operationalSummary.map((card) => (
                <SummaryCardComponent key={card.id} card={card} />
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">
                Upcoming Events
              </h2>
              <Badge variant="secondary">{upcomingEvents.length}</Badge>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const config = eventTypeConfig[event.type];
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                          {event.status === 'overdue' && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium text-sm text-gray-900">
                          {event.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.date}
                          </span>
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time}
                            </span>
                          )}
                          {event.assignee && (
                            <span>{event.assignee}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Panel (Optional) */}
        {timeline && (
          <div className="bg-white rounded-lg border shadow-sm">
            <button
              onClick={toggleTimeline}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Episode Timeline
                </h2>
              </div>
              {timelineOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            {timelineOpen && (
              <div className="p-4 pt-0 border-t">
                {timeline}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// Summary Card Component
const SummaryCardComponent = memo(function SummaryCardComponent({ 
  card 
}: { 
  card: SummaryCard 
}) {
  const statusColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    neutral: 'bg-gray-50 border-gray-200',
  };

  const statusTextColors = {
    success: 'text-green-900',
    warning: 'text-amber-900',
    danger: 'text-red-900',
    info: 'text-blue-900',
    neutral: 'text-gray-900',
  };

  const bgColor = card.status ? statusColors[card.status] : statusColors.neutral;
  const textColor = card.status ? statusTextColors[card.status] : statusTextColors.neutral;

  return (
    <button
      onClick={card.onClick}
      disabled={!card.onClick}
      className={cn(
        'w-full p-4 rounded-lg border text-left transition-all',
        bgColor,
        card.onClick && 'hover:shadow-md cursor-pointer',
        !card.onClick && 'cursor-default'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
            {card.title}
          </div>
          <div className={cn('text-2xl font-bold', textColor)}>
            {card.value}
          </div>
          {card.subtitle && (
            <div className="text-xs text-gray-600 mt-1">
              {card.subtitle}
            </div>
          )}
          {card.trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              card.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            )}>
              <TrendingUp className={cn(
                'w-3 h-3',
                card.trend.direction === 'down' && 'rotate-180'
              )} />
              {card.trend.value}
            </div>
          )}
        </div>
        {card.icon && (
          <div className="flex-shrink-0">
            {card.icon}
          </div>
        )}
      </div>
    </button>
  );
});

AdmissionDashboardShell.displayName = 'AdmissionDashboardShell';

export default AdmissionDashboardShell;
