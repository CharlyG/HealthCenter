/**
 * Context Hierarchy System
 * 
 * Provides visual indicators and navigation for the 5-level context hierarchy:
 * 
 * Level 1: Workspace (System-wide context)
 * Level 2: Patient (Person-level context)
 * Level 3: Admission (Episode-level context)
 * Level 4: Episode of Care (60-day certification period)
 * Level 5: Visit / Documentation (Individual service event)
 * 
 * This system ensures users always know where they are in the operational context.
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  ChevronRight,
  Home,
  User,
  Briefcase,
  Calendar,
  Stethoscope,
  FileText,
  ChevronDown,
  ArrowLeft,
  Info,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export interface WorkspaceContext {
  id: string;
  name: string;
  type: 'clinical' | 'scheduling' | 'billing' | 'referral' | 'admin' | 'reports' | 'hospice';
  icon?: string;
}

export interface PatientContext {
  mrn: string;
  name: string;
  dob: string;
  status: 'active' | 'inactive' | 'deceased';
  primaryDiagnosis?: string;
}

export interface AdmissionContext {
  admissionId: string;
  admissionDate: string;
  status: 'active' | 'pending' | 'discharged';
  type: 'home_health' | 'hospice';
  primaryPayer?: string;
  daysInEpisode?: number;
  totalEpisodeDays?: number;
}

export interface EpisodeContext {
  episodeNumber: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  status: 'active' | 'pending_recert' | 'expired';
}

export interface VisitContext {
  visitId: string;
  visitDate: string;
  visitType: string;
  discipline: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed';
}

export interface ContextHierarchy {
  workspace?: WorkspaceContext;
  patient?: PatientContext;
  admission?: AdmissionContext;
  episode?: EpisodeContext;
  visit?: VisitContext;
}

// ==================== CONTEXT INDICATOR COMPONENT ====================

interface ContextIndicatorProps {
  context: ContextHierarchy;
  showBreadcrumbs?: boolean;
  showBackButton?: boolean;
  onNavigateBack?: () => void;
}

export function ContextIndicator({
  context,
  showBreadcrumbs = true,
  showBackButton = false,
  onNavigateBack,
}: ContextIndicatorProps) {
  const navigate = useNavigate();

  const breadcrumbs: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    isActive: boolean;
  }> = [];

  // Build breadcrumb trail
  if (context.workspace) {
    breadcrumbs.push({
      label: context.workspace.name,
      icon: Home,
      onClick: () => navigate('/'),
      isActive: !context.patient,
    });
  }

  if (context.patient) {
    breadcrumbs.push({
      label: `${context.patient.name} (MRN: ${context.patient.mrn})`,
      icon: User,
      onClick: () => navigate(`/patient/${context.patient!.mrn}`),
      isActive: !context.admission,
    });
  }

  if (context.admission) {
    breadcrumbs.push({
      label: `Admission ${context.admission.admissionId}`,
      icon: Briefcase,
      onClick: () => navigate(`/patient/${context.patient!.mrn}/admission/${context.admission!.admissionId}`),
      isActive: !context.episode && !context.visit,
    });
  }

  if (context.episode) {
    breadcrumbs.push({
      label: `Episode ${context.episode.episodeNumber} (${context.episode.daysRemaining}d remaining)`,
      icon: Calendar,
      isActive: !context.visit,
    });
  }

  if (context.visit) {
    breadcrumbs.push({
      label: `Visit ${context.visit.visitId}`,
      icon: Stethoscope,
      isActive: true,
    });
  }

  if (!showBreadcrumbs) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        {showBackButton && onNavigateBack && (
          <>
            <Button variant="ghost" size="sm" onClick={onNavigateBack}>
              <ArrowLeft className="size-4" />
            </Button>
            <div className="h-6 w-px bg-gray-300" />
          </>
        )}

        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-2 flex-wrap">
          {breadcrumbs.map((crumb, index) => {
            const Icon = crumb.icon;
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={index} className="flex items-center gap-2">
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className={`flex items-center gap-2 text-sm hover:bg-gray-100 px-2 py-1 rounded transition-colors ${
                      crumb.isActive
                        ? 'font-semibold text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="size-4" />
                    {crumb.label}
                  </button>
                ) : (
                  <div
                    className={`flex items-center gap-2 text-sm px-2 py-1 ${
                      crumb.isActive ? 'font-semibold text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    <Icon className="size-4" />
                    {crumb.label}
                  </div>
                )}
                {!isLast && <ChevronRight className="size-4 text-gray-400" />}
              </div>
            );
          })}
        </nav>

        {/* Context Info Badge */}
        {context.admission && (
          <Badge
            variant="outline"
            className={`ml-auto text-xs ${
              context.admission.status === 'active'
                ? 'bg-green-50 text-green-700 border-green-300'
                : context.admission.status === 'pending'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                : 'bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            {context.admission.status === 'active' && '● Active'}
            {context.admission.status === 'pending' && '◐ Pending'}
            {context.admission.status === 'discharged' && '○ Discharged'}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ==================== PATIENT HEADER COMPONENT ====================

interface PatientHeaderProps {
  patient: PatientContext;
  showQuickActions?: boolean;
  compact?: boolean;
}

export function PatientHeader({ patient, showQuickActions = true, compact = false }: PatientHeaderProps) {
  const navigate = useNavigate();

  const age = new Date().getFullYear() - new Date(patient.dob).getFullYear();

  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white ${
        compact ? 'px-4 py-2' : 'px-6 py-4'
      } border-b-4 border-blue-700`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`${
              compact ? 'size-10' : 'size-14'
            } bg-white rounded-full flex items-center justify-center text-blue-600 font-bold ${
              compact ? 'text-lg' : 'text-2xl'
            }`}
          >
            {patient.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h2 className={`font-bold ${compact ? 'text-lg' : 'text-2xl'}`}>
              {patient.name}
            </h2>
            <div className={`flex items-center gap-4 ${compact ? 'text-xs' : 'text-sm'} text-blue-100 mt-1`}>
              <span className="font-mono">MRN: {patient.mrn}</span>
              <span>•</span>
              <span>DOB: {new Date(patient.dob).toLocaleDateString()} ({age}y)</span>
              <span>•</span>
              <Badge
                variant="outline"
                className={`${
                  patient.status === 'active'
                    ? 'bg-green-500 text-white border-green-300'
                    : patient.status === 'deceased'
                    ? 'bg-gray-700 text-white border-gray-500'
                    : 'bg-gray-500 text-white border-gray-400'
                } text-[10px]`}
              >
                {patient.status.toUpperCase()}
              </Badge>
            </div>
            {patient.primaryDiagnosis && !compact && (
              <p className="text-sm text-blue-100 mt-1">
                Primary Dx: {patient.primaryDiagnosis}
              </p>
            )}
          </div>
        </div>

        {showQuickActions && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <FileText className="size-4 mr-2" />
              Chart
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Calendar className="size-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Info className="size-4 mr-2" />
              Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== ADMISSION CONTEXT BAR ====================

interface AdmissionContextBarProps {
  admission: AdmissionContext;
  patient: PatientContext;
  showEpisodeProgress?: boolean;
  onChangeAdmission?: () => void;
}

export function AdmissionContextBar({
  admission,
  patient,
  showEpisodeProgress = true,
  onChangeAdmission,
}: AdmissionContextBarProps) {
  const navigate = useNavigate();

  const progressPercentage = admission.daysInEpisode && admission.totalEpisodeDays
    ? Math.round((admission.daysInEpisode / admission.totalEpisodeDays) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Admission Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="size-5 text-indigo-600" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  Admission: {admission.admissionId}
                </span>
                {onChangeAdmission && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onChangeAdmission}
                    className="h-6 px-2 text-xs"
                  >
                    <ChevronDown className="size-3" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <span>Started: {new Date(admission.admissionDate).toLocaleDateString()}</span>
                {admission.primaryPayer && (
                  <>
                    <span>•</span>
                    <span>Payer: {admission.primaryPayer}</span>
                  </>
                )}
                <span>•</span>
                <span className="capitalize">{admission.type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Badge
            className={`${
              admission.status === 'active'
                ? 'bg-green-100 text-green-800 border-green-300'
                : admission.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-gray-100 text-gray-800 border-gray-300'
            } border`}
          >
            {admission.status === 'active' && '● Active'}
            {admission.status === 'pending' && '◐ Pending'}
            {admission.status === 'discharged' && '○ Discharged'}
          </Badge>
        </div>

        {/* Right: Episode Progress */}
        {showEpisodeProgress && admission.daysInEpisode && admission.totalEpisodeDays && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-600">Episode Progress</p>
              <p className="text-sm font-bold text-indigo-700">
                Day {admission.daysInEpisode} of {admission.totalEpisodeDays}
              </p>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-indigo-700">{progressPercentage}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== EPISODE DASHBOARD WIDGET ====================

interface EpisodeDashboardProps {
  episode: EpisodeContext;
  compact?: boolean;
}

export function EpisodeDashboard({ episode, compact = false }: EpisodeDashboardProps) {
  const progressPercentage = Math.round(
    ((60 - episode.daysRemaining) / 60) * 100
  );

  return (
    <div
      className={`bg-white border-2 ${
        episode.status === 'active'
          ? 'border-green-200'
          : episode.status === 'pending_recert'
          ? 'border-amber-200'
          : 'border-red-200'
      } rounded-lg ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-indigo-600" />
          <h4 className="font-semibold text-gray-900">Episode {episode.episodeNumber}</h4>
        </div>
        <Badge
          className={`${
            episode.status === 'active'
              ? 'bg-green-100 text-green-800'
              : episode.status === 'pending_recert'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {episode.status === 'active' && 'Active'}
          {episode.status === 'pending_recert' && 'Needs Recert'}
          {episode.status === 'expired' && 'Expired'}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Start:</span>
          <span className="font-medium">{new Date(episode.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">End:</span>
          <span className="font-medium">{new Date(episode.endDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Days Remaining:</span>
          <span
            className={`font-bold ${
              episode.daysRemaining <= 7
                ? 'text-red-600'
                : episode.daysRemaining <= 14
                ? 'text-amber-600'
                : 'text-green-600'
            }`}
          >
            {episode.daysRemaining} days
          </span>
        </div>

        {!compact && (
          <>
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span className="font-semibold">{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    episode.daysRemaining <= 7
                      ? 'bg-red-500'
                      : episode.daysRemaining <= 14
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ==================== CONTEXT-AWARE LAYOUT WRAPPER ====================

interface ContextAwareLayoutProps {
  context: ContextHierarchy;
  children: ReactNode;
  showPatientHeader?: boolean;
  showAdmissionBar?: boolean;
  showBreadcrumbs?: boolean;
}

export function ContextAwareLayout({
  context,
  children,
  showPatientHeader = true,
  showAdmissionBar = true,
  showBreadcrumbs = true,
}: ContextAwareLayoutProps) {
  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Breadcrumbs / Context Indicator */}
      {showBreadcrumbs && <ContextIndicator context={context} />}

      {/* Patient Header (if in patient context) */}
      {showPatientHeader && context.patient && <PatientHeader patient={context.patient} />}

      {/* Admission Context Bar (if in admission context) */}
      {showAdmissionBar && context.admission && context.patient && (
        <AdmissionContextBar admission={context.admission} patient={context.patient} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}