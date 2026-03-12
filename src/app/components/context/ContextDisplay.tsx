/**
 * Context Display System
 * 
 * Three-level context display for healthcare platform:
 * 1. Patient Context Header - Patient information (sticky)
 * 2. Admission Context Bar - Admission details (sticky)
 * 3. Operational Context - Current module/workflow
 * 
 * Context remains visible when navigating between related modules.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  User,
  Calendar,
  Hash,
  Building2,
  AlertTriangle,
  Phone,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Users,
  UserCheck,
  Shield,
  ChevronDown,
  ExternalLink,
  Copy,
  Star,
  Activity,
  Stethoscope,
  ClipboardCheck,
  Receipt,
  CalendarClock,
  Heart,
  Eye,
  MoreVertical,
  Edit,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export interface PatientAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PatientContextData {
  // Required fields
  mrn: string;
  name: string;
  dob: string;
  
  // Optional fields
  gender?: 'M' | 'F' | 'Other';
  age?: number;
  office?: string;
  primaryPhone?: string;
  email?: string;
  address?: string;
  
  // Alerts and status
  alerts?: PatientAlert[];
  isFavorite?: boolean;
  
  // Quick stats
  activeAdmissions?: number;
  lastVisit?: string;
}

export interface AdmissionContextData {
  // Required fields
  admissionId: string;
  startDate: string;
  status: 'active' | 'pending' | 'on_hold' | 'discharged';
  
  // Optional fields
  primaryPayer?: string;
  disciplines?: string[];
  caseManager?: {
    name: string;
    phone?: string;
    email?: string;
  };
  
  // Authorization
  authorizationStatus?: 'approved' | 'pending' | 'denied' | 'expired';
  authorizedVisits?: {
    used: number;
    total: number;
  };
  authorizationEndDate?: string;
  
  // Additional info
  referralSource?: string;
  primaryDiagnosis?: string;
  episodeNumber?: number;
  daysInEpisode?: number;
}

export interface OperationalContextData {
  module: string;
  workflow?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'ghost';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

// ==================== PATIENT CONTEXT HEADER ====================

interface PatientContextHeaderProps {
  patient: PatientContextData;
  onViewFullChart?: () => void;
  onEditPatient?: () => void;
  onToggleFavorite?: () => void;
  compact?: boolean;
}

export function PatientContextHeader({
  patient,
  onViewFullChart,
  onEditPatient,
  onToggleFavorite,
  compact = false,
}: PatientContextHeaderProps) {
  const age = patient.age || (new Date().getFullYear() - new Date(patient.dob).getFullYear());
  const criticalAlerts = patient.alerts?.filter((a) => a.type === 'critical') || [];
  const warningAlerts = patient.alerts?.filter((a) => a.type === 'warning') || [];
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-4 border-blue-800 shadow-lg">
      <div className={`${compact ? 'px-4 py-3' : 'px-6 py-4'}`}>
        {/* Main Info Row */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: Patient Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div
              className={`${
                compact ? 'size-12' : 'size-16'
              } bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md relative`}
            >
              <span className="text-blue-600 font-bold text-xl">
                {patient.name.split(' ').map((n) => n[0]).join('')}
              </span>
              {patient.isFavorite && (
                <Star className="size-4 text-amber-400 fill-amber-400 absolute -top-1 -right-1" />
              )}
            </div>

            {/* Patient Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`font-bold ${compact ? 'text-xl' : 'text-2xl'}`}>
                  {patient.name}
                </h2>
                {patient.gender && (
                  <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
                    {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                  </Badge>
                )}
              </div>

              {/* Metadata Row */}
              <div
                className={`flex items-center gap-4 ${
                  compact ? 'text-xs' : 'text-sm'
                } text-blue-100 mt-2 flex-wrap`}
              >
                <div className="flex items-center gap-1.5">
                  <Hash className="size-3.5" />
                  <span className="font-mono font-medium">MRN: {patient.mrn}</span>
                </div>
                <span className="text-blue-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                  <span className="font-semibold">({age}y)</span>
                </div>
                {patient.office && (
                  <>
                    <span className="text-blue-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-3.5" />
                      <span>{patient.office}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Contact Info (if not compact) */}
              {!compact && (patient.primaryPhone || patient.email) && (
                <div className="flex items-center gap-4 text-xs text-blue-100 mt-1.5 flex-wrap">
                  {patient.primaryPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3" />
                      <span>{patient.primaryPhone}</span>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="size-3" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Alerts & Actions */}
          <div className="flex items-start gap-2 flex-shrink-0">
            {/* Alerts */}
            {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <AlertTriangle className="size-4 mr-2" />
                  {criticalAlerts.length + warningAlerts.length} Alert
                  {criticalAlerts.length + warningAlerts.length !== 1 ? 's' : ''}
                </Button>
                {showAlerts && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm">Patient Alerts</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {patient.alerts?.map((alert) => (
                        <AlertItem key={alert.id} alert={alert} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFavorite}
                  className="size-9 p-0 bg-white/10 hover:bg-white/20 border border-white/30"
                  title={patient.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star
                    className={`size-4 ${
                      patient.isFavorite ? 'fill-amber-300 text-amber-300' : 'text-white'
                    }`}
                  />
                </Button>
              )}
              {onViewFullChart && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewFullChart}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <FileText className="size-4 mr-2" />
                  Chart
                </Button>
              )}
              {onEditPatient && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEditPatient}
                  className="size-9 p-0 bg-white/10 hover:bg-white/20 border border-white/30"
                  title="Edit patient"
                >
                  <Edit className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Bar (if not compact) */}
        {!compact && (
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="size-4 text-blue-200" />
              <span className="text-blue-100">Active Admissions:</span>
              <span className="font-bold">{patient.activeAdmissions || 0}</span>
            </div>
            {patient.lastVisit && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-blue-200" />
                <span className="text-blue-100">Last Visit:</span>
                <span className="font-medium">
                  {new Date(patient.lastVisit).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Alert Item Component
function AlertItem({ alert }: { alert: PatientAlert }) {
  const Icon = alert.icon || AlertTriangle;
  return (
    <div
      className={`p-3 border-b border-gray-100 last:border-0 ${
        alert.type === 'critical'
          ? 'bg-red-50'
          : alert.type === 'warning'
          ? 'bg-amber-50'
          : 'bg-blue-50'
      }`}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={`size-4 flex-shrink-0 mt-0.5 ${
            alert.type === 'critical'
              ? 'text-red-600'
              : alert.type === 'warning'
              ? 'text-amber-600'
              : 'text-blue-600'
          }`}
        />
        <p
          className={`text-sm ${
            alert.type === 'critical'
              ? 'text-red-900'
              : alert.type === 'warning'
              ? 'text-amber-900'
              : 'text-blue-900'
          }`}
        >
          {alert.message}
        </p>
      </div>
    </div>
  );
}

// ==================== ADMISSION CONTEXT BAR ====================

interface AdmissionContextBarProps {
  admission: AdmissionContextData;
  onViewAdmission?: () => void;
  onChangeAdmission?: () => void;
  compact?: boolean;
}

export function AdmissionContextBar({
  admission,
  onViewAdmission,
  onChangeAdmission,
  compact = false,
}: AdmissionContextBarProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Active' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Pending' },
    on_hold: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', label: 'On Hold' },
    discharged: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', label: 'Discharged' },
  };

  const authConfig = {
    approved: { icon: CheckCircle2, color: 'text-green-600', label: 'Approved' },
    pending: { icon: Clock, color: 'text-yellow-600', label: 'Pending' },
    denied: { icon: XCircle, color: 'text-red-600', label: 'Denied' },
    expired: { icon: AlertCircle, color: 'text-orange-600', label: 'Expired' },
  };

  const status = statusConfig[admission.status];
  const auth = admission.authorizationStatus ? authConfig[admission.authorizationStatus] : null;

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200 shadow-sm">
      <div className={`${compact ? 'px-4 py-2' : 'px-6 py-3'}`}>
        <div className="flex items-center justify-between gap-4">
          {/* Left: Admission Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="size-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Admission: {admission.admissionId}
                  </h3>
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
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>Started: {new Date(admission.startDate).toLocaleDateString()}</span>
                  </div>
                  {admission.primaryPayer && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="size-3" />
                        <span>{admission.primaryPayer}</span>
                      </div>
                    </>
                  )}
                  {admission.episodeNumber && (
                    <>
                      <span>•</span>
                      <span>Episode {admission.episodeNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <Badge className={`${status.bg} ${status.text} border ${status.border}`}>
              ● {status.label}
            </Badge>

            {/* Disciplines (if not compact) */}
            {!compact && admission.disciplines && admission.disciplines.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="size-4 text-gray-500" />
                <div className="flex items-center gap-1">
                  {admission.disciplines.slice(0, 3).map((discipline) => (
                    <Badge key={discipline} variant="outline" className="text-xs">
                      {discipline}
                    </Badge>
                  ))}
                  {admission.disciplines.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{admission.disciplines.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Authorization & Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Authorization Status */}
            {auth && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <auth.icon className={`size-4 ${auth.color}`} />
                <div className="text-xs">
                  <p className="font-medium text-gray-900">Auth: {auth.label}</p>
                  {admission.authorizedVisits && (
                    <p className="text-gray-600">
                      {admission.authorizedVisits.used}/{admission.authorizedVisits.total} visits
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Case Manager (if not compact) */}
            {!compact && admission.caseManager && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                <UserCheck className="size-4 text-gray-500" />
                <div className="text-xs">
                  <p className="font-medium text-gray-900">{admission.caseManager.name}</p>
                  <p className="text-gray-600">Case Manager</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              {onViewAdmission && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewAdmission}
                  className="h-8 px-3"
                  title="View admission details"
                >
                  <Eye className="size-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-8 px-2"
                title="More details"
              >
                <MoreVertical className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-indigo-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {admission.referralSource && (
              <div>
                <p className="text-gray-600">Referral Source</p>
                <p className="font-medium text-gray-900 mt-0.5">{admission.referralSource}</p>
              </div>
            )}
            {admission.primaryDiagnosis && (
              <div>
                <p className="text-gray-600">Primary Diagnosis</p>
                <p className="font-medium text-gray-900 mt-0.5">{admission.primaryDiagnosis}</p>
              </div>
            )}
            {admission.daysInEpisode && (
              <div>
                <p className="text-gray-600">Days in Episode</p>
                <p className="font-medium text-gray-900 mt-0.5">{admission.daysInEpisode} days</p>
              </div>
            )}
            {admission.authorizationEndDate && (
              <div>
                <p className="text-gray-600">Auth End Date</p>
                <p className="font-medium text-gray-900 mt-0.5">
                  {new Date(admission.authorizationEndDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== OPERATIONAL CONTEXT BAR ====================

interface OperationalContextBarProps {
  context: OperationalContextData;
}

export function OperationalContextBar({ context }: OperationalContextBarProps) {
  const navigate = useNavigate();

  const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Visit Documentation': Stethoscope,
    'Billing Review': Receipt,
    'Scheduling': CalendarClock,
    'Clinical Assessment': ClipboardCheck,
    'Hospice Care': Heart,
    'Default': Activity,
  };

  const Icon = moduleIcons[context.module] || moduleIcons['Default'];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: Module & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">{context.module}</h3>
          </div>

          {context.workflow && (
            <Badge variant="outline" className="text-xs">
              {context.workflow}
            </Badge>
          )}

          {context.breadcrumbs && context.breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>›</span>
              {context.breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {crumb.path ? (
                    <button
                      onClick={() => navigate(crumb.path!)}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                  {index < context.breadcrumbs!.length - 1 && <span>›</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        {context.actions && context.actions.length > 0 && (
          <div className="flex items-center gap-2">
            {context.actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={action.onClick}
                >
                  {ActionIcon && <ActionIcon className="size-4 mr-2" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COMPLETE CONTEXT DISPLAY ====================

interface ContextDisplayProps {
  patient: PatientContextData;
  admission?: AdmissionContextData;
  operational: OperationalContextData;
  onViewFullChart?: () => void;
  onEditPatient?: () => void;
  onToggleFavorite?: () => void;
  onViewAdmission?: () => void;
  onChangeAdmission?: () => void;
  compact?: boolean;
}

export function ContextDisplay({
  patient,
  admission,
  operational,
  onViewFullChart,
  onEditPatient,
  onToggleFavorite,
  onViewAdmission,
  onChangeAdmission,
  compact = false,
}: ContextDisplayProps) {
  return (
    <div className="flex flex-col">
      {/* Level 1: Patient Context */}
      <PatientContextHeader
        patient={patient}
        onViewFullChart={onViewFullChart}
        onEditPatient={onEditPatient}
        onToggleFavorite={onToggleFavorite}
        compact={compact}
      />

      {/* Level 2: Admission Context (if provided) */}
      {admission && (
        <AdmissionContextBar
          admission={admission}
          onViewAdmission={onViewAdmission}
          onChangeAdmission={onChangeAdmission}
          compact={compact}
        />
      )}

      {/* Level 3: Operational Context */}
      <OperationalContextBar context={operational} />
    </div>
  );
}
