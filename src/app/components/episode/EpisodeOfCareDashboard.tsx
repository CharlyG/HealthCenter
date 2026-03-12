/**
 * Episode of Care Dashboard
 * 
 * Central hub for managing a patient admission episode.
 * 
 * Components:
 * - Episode Status Header
 * - Authorization Tracker
 * - Documentation Completion
 * - Upcoming Visits
 * - Care Team Members
 * - Alerts & Warnings
 * - Quick Actions
 * 
 * Features:
 * - Real-time operational status
 * - Action-oriented design
 * - Visual progress indicators
 * - Integrated alerts system
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  TrendingUp,
  Activity,
  Phone,
  MapPin,
  Stethoscope,
  ClipboardCheck,
  Receipt,
  ArrowRight,
  XCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Target,
  Zap,
  Home,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export interface EpisodeOfCare {
  admissionId: string;
  patientId: string;
  patientName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'pending' | 'discharged';
  type: 'home_health' | 'hospice';
  episodeNumber: number;
  dayInEpisode: number;
  primaryPayer: string;
  primaryDiagnosis: string;
  certificationPeriod: {
    start: string;
    end: string;
    type: 'initial' | 'recertification';
  };
}

export interface AuthorizationStatus {
  status: 'approved' | 'pending' | 'expired' | 'denied';
  authNumber?: string;
  validThrough?: string;
  visitsAuthorized?: number;
  visitsUsed?: number;
  daysRemaining?: number;
  alerts: Array<{
    type: 'warning' | 'error';
    message: string;
  }>;
}

export interface DocumentationStatus {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  categories: Array<{
    name: string;
    completed: number;
    total: number;
  }>;
}

export interface UpcomingVisit {
  visitId: string;
  scheduledDate: string;
  scheduledTime?: string;
  discipline: 'RN' | 'PT' | 'OT' | 'MSW' | 'HHA' | 'SLP';
  clinicianName: string;
  visitType: string;
  status: 'scheduled' | 'confirmed' | 'unconfirmed';
  daysUntil: number;
}

export interface CareTeamMember {
  memberId: string;
  name: string;
  role: 'Case Manager' | 'RN' | 'PT' | 'OT' | 'MSW' | 'HHA' | 'SLP' | 'Physician';
  isPrimary?: boolean;
  phone?: string;
  lastContact?: string;
  visitCount?: number;
}

export interface EpisodeAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'authorization' | 'documentation' | 'clinical' | 'billing' | 'scheduling';
  title: string;
  description: string;
  dueDate?: string;
  actionLabel?: string;
  actionPath?: string;
}

export interface EpisodeData {
  episode: EpisodeOfCare;
  authorization: AuthorizationStatus;
  documentation: DocumentationStatus;
  upcomingVisits: UpcomingVisit[];
  careTeam: CareTeamMember[];
  alerts: EpisodeAlert[];
}

// ==================== EPISODE STATUS HEADER ====================

interface EpisodeStatusHeaderProps {
  episode: EpisodeOfCare;
}

export function EpisodeStatusHeader({ episode }: EpisodeStatusHeaderProps) {
  const daysRemaining = 60 - episode.dayInEpisode;
  const progress = (episode.dayInEpisode / 60) * 100;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    discharged: 'bg-gray-100 text-gray-800',
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{episode.admissionId}</h2>
              <Badge className={statusColors[episode.status]}>{episode.status}</Badge>
              <Badge variant="outline" className="bg-white">
                Episode {episode.episodeNumber}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                Day {episode.dayInEpisode} of 60
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {daysRemaining} days remaining
              </span>
              <span>•</span>
              <span>{episode.primaryPayer}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Started</p>
            <p className="font-semibold text-gray-900">
              {new Date(episode.startDate).toLocaleDateString()}
            </p>
            {episode.certificationPeriod && (
              <p className="text-xs text-gray-500 mt-1">
                Cert: {new Date(episode.certificationPeriod.end).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Episode Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600">Primary Diagnosis</p>
            <p className="font-semibold text-gray-900 text-sm mt-0.5">
              {episode.primaryDiagnosis}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600">Patient</p>
            <p className="font-semibold text-gray-900 text-sm mt-0.5">{episode.patientName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== AUTHORIZATION TRACKER WIDGET ====================

interface AuthorizationWidgetProps {
  authorization: AuthorizationStatus;
  onViewDetails: () => void;
}

export function AuthorizationWidget({ authorization, onViewDetails }: AuthorizationWidgetProps) {
  const statusConfig = {
    approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    expired: { color: 'bg-red-100 text-red-800', icon: XCircle },
    denied: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
  };

  const config = statusConfig[authorization.status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="size-5 text-blue-600" />
          Authorization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Status</span>
            <Badge className={config.color}>
              <Icon className="size-3 mr-1" />
              {authorization.status}
            </Badge>
          </div>

          {/* Auth Details */}
          {authorization.authNumber && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Auth Number</span>
              <span className="font-semibold text-gray-900">{authorization.authNumber}</span>
            </div>
          )}

          {authorization.validThrough && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Valid Through</span>
              <span className="font-semibold text-gray-900">
                {new Date(authorization.validThrough).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Visits Usage */}
          {authorization.visitsAuthorized && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">Visits</span>
                <span className="font-semibold text-gray-900">
                  {authorization.visitsUsed}/{authorization.visitsAuthorized}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${((authorization.visitsUsed || 0) / authorization.visitsAuthorized) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Alerts */}
          {authorization.alerts && authorization.alerts.length > 0 && (
            <div className="space-y-2">
              {authorization.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs ${
                    alert.type === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          <Button variant="outline" size="sm" onClick={onViewDetails} className="w-full">
            View Details
            <ArrowRight className="size-3 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== DOCUMENTATION COMPLETION WIDGET ====================

interface DocumentationWidgetProps {
  documentation: DocumentationStatus;
  onViewDetails: () => void;
}

export function DocumentationWidget({ documentation, onViewDetails }: DocumentationWidgetProps) {
  const completionRate = (documentation.completed / documentation.total) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="size-5 text-blue-600" />
          Documentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-700">{documentation.completed}</p>
              <p className="text-xs text-green-600">Completed</p>
            </div>
            <div className="text-center p-2 bg-amber-50 rounded">
              <p className="text-2xl font-bold text-amber-700">{documentation.pending}</p>
              <p className="text-xs text-amber-600">Pending</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <p className="text-2xl font-bold text-red-700">{documentation.overdue}</p>
              <p className="text-xs text-red-600">Overdue</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700">Completion Rate</span>
              <span className="font-semibold text-gray-900">{Math.round(completionRate)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            {documentation.categories.slice(0, 3).map((category, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{category.name}</span>
                <span className="font-semibold text-gray-900">
                  {category.completed}/{category.total}
                </span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button variant="outline" size="sm" onClick={onViewDetails} className="w-full">
            View All Documentation
            <ArrowRight className="size-3 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== UPCOMING VISITS WIDGET ====================

interface UpcomingVisitsWidgetProps {
  visits: UpcomingVisit[];
  onScheduleVisit: () => void;
  onViewVisit: (visitId: string) => void;
}

export function UpcomingVisitsWidget({
  visits,
  onScheduleVisit,
  onViewVisit,
}: UpcomingVisitsWidgetProps) {
  const disciplineColors = {
    RN: 'bg-blue-100 text-blue-800',
    PT: 'bg-green-100 text-green-800',
    OT: 'bg-purple-100 text-purple-800',
    MSW: 'bg-orange-100 text-orange-800',
    HHA: 'bg-pink-100 text-pink-800',
    SLP: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="size-5 text-blue-600" />
            Upcoming Visits
          </span>
          <Badge variant="outline">{visits.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visits.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="size-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No visits scheduled</p>
              <Button size="sm" onClick={onScheduleVisit}>
                <Plus className="size-4 mr-2" />
                Schedule Visit
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {visits.map((visit) => (
                  <button
                    key={visit.visitId}
                    onClick={() => onViewVisit(visit.visitId)}
                    className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${disciplineColors[visit.discipline]}`}>
                            {visit.discipline}
                          </Badge>
                          <span className="text-xs text-gray-600">
                            {visit.daysUntil === 0
                              ? 'Today'
                              : visit.daysUntil === 1
                              ? 'Tomorrow'
                              : `In ${visit.daysUntil} days`}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {visit.visitType}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {visit.clinicianName} • {new Date(visit.scheduledDate).toLocaleDateString()}
                          {visit.scheduledTime && ` at ${visit.scheduledTime}`}
                        </p>
                      </div>
                      <ChevronRight className="size-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={onScheduleVisit} className="w-full">
                <Plus className="size-4 mr-2" />
                Schedule New Visit
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== CARE TEAM WIDGET ====================

interface CareTeamWidgetProps {
  careTeam: CareTeamMember[];
  onViewMember: (memberId: string) => void;
  onManageTeam: () => void;
}

export function CareTeamWidget({ careTeam, onViewMember, onManageTeam }: CareTeamWidgetProps) {
  const roleIcons = {
    'Case Manager': Target,
    RN: Stethoscope,
    PT: Activity,
    OT: Activity,
    MSW: Users,
    HHA: Home,
    SLP: Users,
    Physician: Stethoscope,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="size-5 text-blue-600" />
            Care Team
          </span>
          <Badge variant="outline">{careTeam.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {careTeam.map((member) => {
              const Icon = roleIcons[member.role] || Users;
              return (
                <button
                  key={member.memberId}
                  onClick={() => onViewMember(member.memberId)}
                  className="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="size-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {member.name}
                        </p>
                        {member.isPrimary && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Primary</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{member.role}</p>
                      {member.phone && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          <Phone className="size-3 inline mr-1" />
                          {member.phone}
                        </p>
                      )}
                      {member.visitCount !== undefined && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {member.visitCount} visits completed
                        </p>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          <Button variant="outline" size="sm" onClick={onManageTeam} className="w-full">
            <Edit className="size-4 mr-2" />
            Manage Team
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== ALERTS WIDGET ====================

interface AlertsWidgetProps {
  alerts: EpisodeAlert[];
  onDismiss?: (id: string) => void;
  onTakeAction?: (alert: EpisodeAlert) => void;
}

export function AlertsWidget({ alerts, onDismiss, onTakeAction }: AlertsWidgetProps) {
  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">All Clear</h4>
              <p className="text-sm text-green-700">No active alerts for this episode</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts.filter((a) => a.type === 'critical');
  const warningAlerts = alerts.filter((a) => a.type === 'warning');

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-600" />
          Alerts
          <Badge className="bg-red-600 text-white">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {criticalAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={onDismiss} onTakeAction={onTakeAction} />
          ))}
          {warningAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={onDismiss} onTakeAction={onTakeAction} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({
  alert,
  onDismiss,
  onTakeAction,
}: {
  alert: EpisodeAlert;
  onDismiss?: (id: string) => void;
  onTakeAction?: (alert: EpisodeAlert) => void;
}) {
  const typeStyles = {
    critical: 'border-red-300 bg-red-50',
    warning: 'border-amber-300 bg-amber-50',
    info: 'border-blue-300 bg-blue-50',
  };

  const iconStyles = {
    critical: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  const categoryIcons = {
    authorization: Shield,
    documentation: FileText,
    clinical: Stethoscope,
    billing: Receipt,
    scheduling: Calendar,
  };

  const Icon = categoryIcons[alert.category];

  return (
    <div className={`p-3 rounded-lg border-2 ${typeStyles[alert.type]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`size-5 flex-shrink-0 mt-0.5 ${iconStyles[alert.type]}`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
          <p className="text-xs text-gray-700 mt-0.5">{alert.description}</p>
          {alert.dueDate && (
            <p className="text-xs text-gray-600 mt-1">
              <Clock className="size-3 inline mr-1" />
              Due: {new Date(alert.dueDate).toLocaleDateString()}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {alert.actionLabel && onTakeAction && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onTakeAction(alert)}
                className="h-7 text-xs"
              >
                {alert.actionLabel}
                <ArrowRight className="size-3 ml-1" />
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(alert.id)}
                className="h-7 text-xs"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== QUICK ACTIONS ====================

interface QuickActionsProps {
  admissionId: string;
  onAction: (action: string) => void;
}

export function QuickActions({ admissionId, onAction }: QuickActionsProps) {
  const actions = [
    { id: 'schedule-visit', label: 'Schedule Visit', icon: Calendar, color: 'blue' },
    { id: 'add-documentation', label: 'Add Note', icon: FileText, color: 'green' },
    { id: 'update-orders', label: 'Update Orders', icon: ClipboardCheck, color: 'purple' },
    { id: 'view-billing', label: 'View Billing', icon: Receipt, color: 'orange' },
  ];

  const colorStyles = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="size-5 text-orange-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id)}
                className={`p-4 rounded-lg transition-all ${colorStyles[action.color]} border-2 border-transparent hover:border-current`}
              >
                <Icon className="size-6 mb-2 mx-auto" />
                <p className="font-semibold text-sm">{action.label}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== EPISODE OF CARE DASHBOARD (COMPLETE) ====================

interface EpisodeOfCareDashboardProps {
  data: EpisodeData;
  onNavigate?: (path: string) => void;
}

export function EpisodeOfCareDashboard({ data, onNavigate }: EpisodeOfCareDashboardProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Episode Status Header */}
        <EpisodeStatusHeader episode={data.episode} />

        {/* Alerts - Full Width */}
        <AlertsWidget
          alerts={data.alerts}
          onTakeAction={(alert) => alert.actionPath && handleNavigate(alert.actionPath)}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AuthorizationWidget
                authorization={data.authorization}
                onViewDetails={() => handleNavigate('/authorization-tracker')}
              />
              <DocumentationWidget
                documentation={data.documentation}
                onViewDetails={() => handleNavigate('/documentation-tracker')}
              />
            </div>

            <UpcomingVisitsWidget
              visits={data.upcomingVisits}
              onScheduleVisit={() => handleNavigate('/scheduling/new')}
              onViewVisit={(visitId) => handleNavigate(`/poc/visit/${visitId}`)}
            />

            <QuickActions
              admissionId={data.episode.admissionId}
              onAction={(action) => console.log('Action:', action)}
            />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <CareTeamWidget
              careTeam={data.careTeam}
              onViewMember={(memberId) => console.log('View member:', memberId)}
              onManageTeam={() => handleNavigate('/care-team')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
