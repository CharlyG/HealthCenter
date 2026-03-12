/**
 * Admission Context Bar
 * Displays below the Patient Context Header when a patient chart is open.
 * Shows current admission details and allows switching between admissions.
 *
 * Displays: Start date, Status, Primary payer, Disciplines, Case manager,
 *           Authorization status
 * Includes: Admission switcher dropdown for multi-admission patients
 */
import React, { useState, memo } from 'react';
import {
  Calendar,
  ChevronDown,
  Shield,
  Users,
  Stethoscope,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Tag,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useAdmission, type AdmissionContextData } from '../../context/AdmissionContext';
import { formatDate } from '../../lib/utils/dateUtils';

// ─── Status badge colors ──────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  admitted: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  discharged: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const AUTH_STYLES: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  authorized: {
    icon: <CheckCircle2 className="size-3.5" />,
    label: 'Authorized',
    color: 'text-green-600',
  },
  pending: {
    icon: <Clock className="size-3.5" />,
    label: 'Auth Pending',
    color: 'text-amber-600',
  },
  expired: {
    icon: <AlertCircle className="size-3.5" />,
    label: 'Auth Expired',
    color: 'text-red-600',
  },
  none: {
    icon: <Shield className="size-3.5" />,
    label: 'No Auth',
    color: 'text-gray-400',
  },
};

// ─── Admission Switcher Dropdown ──────────────────────────────────────────────
const AdmissionSwitcher = memo(({
  admissions,
  activeAdmissionId,
  onSelect,
}: {
  admissions: AdmissionContextData[];
  activeAdmissionId: string | null;
  onSelect: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  if (admissions.length <= 1) return null;

  const activeAdm = admissions.find((a) => a.id === activeAdmissionId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md
                   border border-blue-300 bg-blue-50 hover:bg-blue-100
                   text-blue-700 transition-colors"
      >
        <ArrowRightLeft className="size-3" />
        <span className="hidden sm:inline">Switch Admission</span>
        <span className="sm:hidden">Switch</span>
        <Badge className="bg-blue-600 text-white text-[9px] h-4 px-1 ml-0.5">
          {admissions.length}
        </Badge>
        <ChevronDown className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg border border-gray-200 shadow-xl min-w-[300px] py-1 max-h-60 overflow-auto">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Patient Admissions
            </div>
            {admissions.map((adm) => {
              const isActive = adm.id === activeAdmissionId;
              const statusStyle = STATUS_STYLES[adm.status] || STATUS_STYLES.pending;

              return (
                <button
                  key={adm.id}
                  onClick={() => {
                    onSelect(adm.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors border-l-2 ${
                    isActive
                      ? 'bg-blue-50 border-l-blue-600'
                      : 'border-l-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      {adm.type}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${statusStyle.text}`}>
                      <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
                      {adm.status.charAt(0).toUpperCase() + adm.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <span>SOC: {formatDate(adm.admissionDate)}</span>
                    {adm.primaryPayer && (
                      <>
                        <span>&middot;</span>
                        <span>{adm.primaryPayer}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
});
AdmissionSwitcher.displayName = 'AdmissionSwitcher';

// ─── Main AdmissionContextBar ─────────────────────────────────────────────────
const AdmissionContextBar = memo(() => {
  const {
    admissions,
    activeAdmission,
    activeAdmissionId,
    setActiveAdmissionId,
    loading,
    hasAdmissions,
  } = useAdmission();

  // Don't render if no admissions or still loading
  if (loading) {
    return (
      <div className="bg-slate-50 border-b border-gray-200 px-6 py-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          Loading admission context...
        </div>
      </div>
    );
  }

  if (!hasAdmissions) {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2">
        <div className="flex items-center gap-2 text-xs text-amber-700">
          <AlertCircle className="size-3.5" />
          <span className="font-medium">No admissions found.</span>
          <span className="text-amber-600">
            Admission-based modules are unavailable until an admission is created.
          </span>
        </div>
      </div>
    );
  }

  if (!activeAdmission) return null;

  const statusStyle = STATUS_STYLES[activeAdmission.status] || STATUS_STYLES.pending;
  const authStyle = AUTH_STYLES[activeAdmission.authorizationStatus || 'none'];

  return (
    <div className="bg-slate-50 border-b border-gray-200 px-6 py-2 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Admission details */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          {/* Admission Type + Status */}
          <div className="flex items-center gap-2">
            <Tag className="size-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-800">
              {activeAdmission.type}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}
            >
              <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
              {activeAdmission.status.charAt(0).toUpperCase() + activeAdmission.status.slice(1)}
            </span>
          </div>

          <div className="w-px h-4 bg-gray-300" />

          {/* SOC Date */}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="size-3.5 text-gray-400" />
            <span className="font-medium">SOC:</span>
            <span>{formatDate(activeAdmission.admissionDate)}</span>
          </div>

          {/* Primary Payer */}
          {activeAdmission.primaryPayer && (
            <>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Shield className="size-3.5 text-gray-400" />
                <span>{activeAdmission.primaryPayer}</span>
              </div>
            </>
          )}

          {/* Disciplines */}
          {activeAdmission.disciplines.length > 0 && (
            <>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1">
                <Stethoscope className="size-3.5 text-gray-400" />
                {activeAdmission.disciplines.map((d) => (
                  <Badge
                    key={d}
                    className="text-[9px] h-4 px-1.5 bg-violet-100 text-violet-700 border-violet-200"
                  >
                    {d.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </>
          )}

          {/* Case Manager */}
          {activeAdmission.caseManager && (
            <>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <UserCheck className="size-3.5 text-gray-400" />
                <span>{activeAdmission.caseManager}</span>
              </div>
            </>
          )}

          {/* Authorization Status */}
          {activeAdmission.authorizationStatus && activeAdmission.authorizationStatus !== 'none' && (
            <>
              <div className="w-px h-4 bg-gray-300" />
              <div className={`flex items-center gap-1 text-xs font-medium ${authStyle.color}`}>
                {authStyle.icon}
                <span>{authStyle.label}</span>
              </div>
            </>
          )}

          {/* Primary Diagnosis */}
          {activeAdmission.primaryDiagnosis && (
            <>
              <div className="w-px h-4 bg-gray-300" />
              <div className="flex items-center gap-1 text-xs text-gray-500 max-w-[200px] truncate">
                <span className="font-medium text-gray-600">Dx:</span>
                <span className="truncate">{activeAdmission.primaryDiagnosis}</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Admission Switcher + Module Label */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Module scope indicator */}
          <Badge
            variant="outline"
            className="text-[9px] border-blue-200 text-blue-600 bg-blue-50/50"
          >
            Admission Scope
          </Badge>

          <AdmissionSwitcher
            admissions={admissions}
            activeAdmissionId={activeAdmissionId}
            onSelect={setActiveAdmissionId}
          />
        </div>
      </div>
    </div>
  );
});

AdmissionContextBar.displayName = 'AdmissionContextBar';

export default AdmissionContextBar;
